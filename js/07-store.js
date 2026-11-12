// ==========================================
// 🏪 FICHIER 07 : DASHBOARD COMMERCE
// ==========================================
// Rôle : Gestion du commerce (produits, catégories, inventaire)
// ==========================================

console.log("🔄 [07-store.js] Chargement du dashboard commerce...");

// ==========================================
// 🏪 AFFICHAGE DU DASHBOARD COMMERCE
// ==========================================
async function showStoreDashboard() {
  // 1. Cacher les autres sections
  const storesSection = document.getElementById('stores-section');
  if (storesSection) storesSection.style.display = 'none';
  const cartSection = document.getElementById('cart-section');
  if (cartSection) cartSection.style.display = 'none';
  
    // 🧹 NETTOYAGE : Cacher les anciens compteurs statiques qui restent à 0
  const oldCounters = ['store-total-products', 'store-total-categories', 'store-total-orders'];
  oldCounters.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none'; // Cache le chiffre
      // Cache aussi la "carte blanche" qui contient le compteur (le parent)
      if (el.parentElement) {
        el.parentElement.style.display = 'none'; 
      }
    }
  });
  console.log("🔍 [DASHBOARD] showStoreDashboard démarré");

  if (!currentUser || currentUser.role !== 'store') {
    console.log("⚠️ [DASHBOARD] Pas un commerce");
    return;
  }

  const container = document.getElementById('store-info-content');
  if (!container) {
    console.error("❌ [DASHBOARD] Conteneur 'store-info-content' introuvable");
    return;
  }

  try {
    // 2. Récupérer les données du commerce
    const { data: store, error: storeError } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('owner_id', currentUser.id)
      .maybeSingle();

    if (storeError || !store) {
      container.innerHTML = `<div style="padding:2rem; text-align:center; background:#fee2e2; border-radius:8px;"><h3>⏳ Commerce introuvable</h3></div>`;
      return;
    }

    console.log("✅ [DASHBOARD] Commerce trouvé:", store.name, "| ID:", store.id);

    // 3. COMPTER LES ÉLÉMENTS EN BASE DE DONNÉES (Méthode infaillible)
    // On force la conversion en String pour éviter les erreurs de type (123 vs "123")
    const storeIdStr = String(store.id);
    
    const { data: dbProducts } = await supabaseClient.from('products').select('id').eq('store_id', storeIdStr);
    const nbProducts = dbProducts ? dbProducts.length : 0;

    const { data: dbCategories } = await supabaseClient.from('categories').select('id').eq('store_id', storeIdStr);
    const nbCategories = dbCategories ? dbCategories.length : 0;

    const { data: dbOrders } = await supabaseClient.from('orders').select('id').eq('store_id', storeIdStr);
    const nbOrders = dbOrders ? dbOrders.length : 0;

    console.log(`📊 [DASHBOARD] Compteurs bruts depuis la DB -> Produits: ${nbProducts}, Catégories: ${nbCategories}, Commandes: ${nbOrders}`);

    // 4. Calculer la limite du forfait
    const forfait = (store.forfait || 'essai').toString().toLowerCase().trim();
    let limiteMax = 10;
    if (forfait === 'base') limiteMax = 20;
    else if (forfait === 'croissance') limiteMax = 45;
    else if (forfait.includes('partenaire')) limiteMax = 95;

    // 5. CONSTRUIRE LE HTML AVEC LES VRAIS CHIFFRES INJECTÉS DIRECTEMENT
    container.innerHTML = `
      <div style="background:white; padding:1.5rem; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- EN-TÊTE -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:2px solid #f5a623;">
          <div>
            <div style="font-size:0.8rem; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">Mon Commerce</div>
            <h2 style="color:#0a1929; margin:0.3rem 0 0 0; font-size:1.5rem;">🏪 ${store.name}</h2>
          </div>
          <button onclick="openStoreDetail('${store.id}')" style="padding:8px 16px; background:#6b7280; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.85rem;">
            👁️ Voir (Vue Client)
          </button>
        </div>
        
        <!-- 🔥 COMPTEURS EN HAUT (Injectés directement dans le HTML, impossible qu'ils soient à 0 si la DB a des données) -->
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem; margin-bottom:1.5rem;">
          <div style="background:#f0fdf4; padding:1rem; border-radius:8px; text-align:center; border:1px solid #bbf7d0;">
            <div style="font-size:1.8rem; font-weight:bold; color:#16a34a;">${nbProducts} / ${limiteMax}</div>
            <div style="font-size:0.85rem; color:#15803d; font-weight:600;">Produits</div>
          </div>
          <div style="background:#eff6ff; padding:1rem; border-radius:8px; text-align:center; border:1px solid #bfdbfe;">
            <div style="font-size:1.8rem; font-weight:bold; color:#2563eb;">${nbCategories}</div>
            <div style="font-size:0.85rem; color:#1d4ed8; font-weight:600;">Catégories</div>
          </div>
          <div style="background:#fff7ed; padding:1rem; border-radius:8px; text-align:center; border:1px solid #fed7aa;">
            <div style="font-size:1.8rem; font-weight:bold; color:#ea580c;">${nbOrders}</div>
            <div style="font-size:0.85rem; color:#c2410c; font-weight:600;">Commandes</div>
          </div>
        </div>

        <!-- SECTION 1 : INFOS DU COMMERCE -->
        <div style="background:#f5f1e8; padding:1.25rem; border-radius:8px; margin-bottom:1.5rem; border-left: 4px solid #f5a623;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <h3 style="margin:0; color:#0a1929; font-size:1.1rem;">📋 Informations du commerce</h3>
            <button onclick="openEditStoreInfoModal()" style="background:#0a1929; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
              <span>✏️</span> Modifier
            </button>
          </div>
          <p style="margin:0.4rem 0;"><strong>📍 Adresse :</strong> ${store.address || 'Non spécifiée'}</p>
          <p style="margin:0.4rem 0;"><strong>📞 Téléphone :</strong> ${store.phone || 'Non spécifié'}</p>
          <p style="margin:0.4rem 0;"><strong>📧 Email :</strong> ${store.email || 'Non spécifié'}</p>
          <p style="margin:0.4rem 0;"><strong>📊 Statut :</strong> <span style="color:#10b981; font-weight:bold;">✅ Actif</span> <span style="background:#f5a623; color:#0a1929; padding:2px 8px; border-radius:12px; font-size:0.8rem; font-weight:bold; margin-left:8px;">${forfait.toUpperCase()}</span></p>
        </div>

        <!-- SECTION 2 : INFOS DU RESPONSABLE -->
        <div style="background:#e6f7ff; padding:1.25rem; border-radius:8px; margin-bottom:1.5rem; border-left: 4px solid #2563eb;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <h3 style="margin:0; color:#0a1929; font-size:1.1rem;">👤 Responsable</h3>
            <button onclick="openEditOwnerInfoModal()" style="background:#2563eb; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
              <span>✏️</span> Modifier
            </button>
          </div>
          <p style="margin:0.4rem 0;"><strong>Nom :</strong> ${currentUser.name || 'Non spécifié'}</p>
          <p style="margin:0.4rem 0;"><strong>Email :</strong> ${currentUser.email || 'Non spécifié'}</p>
          <p style="margin:0.4rem 0;"><strong>Téléphone :</strong> ${currentUser.phone || 'Non spécifié'}</p>
        </div>

        <hr style="margin:1.5rem 0; border:0; border-top:1px solid #eee;">
        
        <!-- SECTION 3 : INVENTAIRE -->
        <h3 style="color:#0a1929; margin-bottom:1rem;">📦 Mon Inventaire</h3>
        <button onclick="openAddProductModal('${store.id}')" style="padding:10px 20px; background:#10b981; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold; margin-bottom:1rem;">
          ➕ Ajouter un produit
        </button>
        <div id="store-products-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:1rem;">
          <!-- Les produits seront chargés ici -->
        </div>
      </div>
    `;

    // 6. Charger la liste des produits en dessous
    if (typeof loadStoreProducts === 'function') {
      loadStoreProducts(store.id);
    }

  } catch (err) {
    console.error("❌ [DASHBOARD] Erreur critique:", err);
    container.innerHTML = `<div style="padding:2rem; color:red; text-align:center;">❌ Erreur : ${err.message}</div>`;
  }
}

// ==========================================
// 📦 CHARGER LES PRODUITS DU COMMERCE
// ==========================================
async function loadStoreProducts(store_id) {
  const container = document.getElementById('store-products-list');
  if (!container) return;
  
  const { data: products, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('store_id', store_id)
    .order('created_at', { ascending: false });
  
  if (error) {
    container.innerHTML = `<p style="color:red;">Erreur chargement produits: ${error.message}</p>`;
    return;
  }
  
  if (!products || products.length === 0) {
    container.innerHTML = '<p style="color:#666; grid-column:1/-1; text-align:center; padding:1rem;">Aucun produit dans votre inventaire pour le moment.</p>';
    return;
  }
  
  container.innerHTML = products.map(p => `
    <div style="background:#f9f9f9; padding:1rem; border-radius:8px; border:1px solid #eee;">
      <div style="display:flex; justify-content:space-between; align-items:start;">
        <h5 style="margin:0 0 0.5rem 0; color:#0a1929;">${p.name}</h5>
        <span style="color:${p.available ? '#10b981' : '#ef4444'}; font-size:0.8rem; font-weight:bold;">
          ${p.available ? '✅ Dispo' : '❌ Indispo'}
        </span>
      </div>
      <p style="margin:0; color:#10b981; font-weight:bold; font-size:1.2rem;">${p.price} $</p>
      <p style="margin:0.5rem 0 0 0; font-size:0.85rem; color:#666;">${p.description || 'Aucune description'}</p>
      <div style="margin-top:0.5rem; display:flex; gap:0.5rem;">
        <button onclick="toggleProductAvailability(${p.id}, ${!p.available}, '${store_id}')" style="padding:4px 8px; background:#f59e0b; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.8rem;">
          ${p.available ? 'Désactiver' : 'Activer'}
        </button>
        <button onclick="deleteProduct(${p.id}, '${store_id}')" style="padding:4px 8px; background:#ef4444; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.8rem;">🗑️</button>
      </div>
    </div>
  `).join('');
}

// ==========================================
// ➕ AJOUTER UN PRODUIT
// ==========================================
async function openAddProductModal(store_id) {
  document.getElementById('prod-modal-title').textContent = '➕ Nouveau Produit';
  document.getElementById('prod-id').value = '';
  document.getElementById('prod-name').value = '';
  document.getElementById('prod-desc').value = '';
  document.getElementById('prod-price').value = '';
  document.getElementById('prod-available').value = 'true';
  selectedProdIcon = '📦';
  
  const myStore = stores.find(s => String(s.id) === String(store_id));
  document.getElementById('prod-store').innerHTML = `<option value="${myStore.id}" selected>${myStore.icon} ${myStore.name}</option>`;
  
  const myCats = categories.filter(c => String(c.store_id) === String(myStore.id) || !c.store_id);
  document.getElementById('prod-category').innerHTML = myCats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  
  buildIconPicker('prod-icon-picker', 'prod-icon');
  openModal('product-modal');
}

// ==========================================
// ==========================================
// 💾 SAUVEGARDER UN PRODUIT (AVEC LIMITE DE FORFAIT)
// ==========================================
// ==========================================
// 💾 SAUVEGARDER UN PRODUIT (AVEC LIMITE DE FORFAIT & MISE À JOUR COMPTEUR)
// ==========================================
async function saveProduct(event) {
  event.preventDefault();
  
  const store_id = document.getElementById('prod-store').value;
  const category_id = document.getElementById('prod-category').value;
  const name = document.getElementById('prod-name').value.trim();
  const description = document.getElementById('prod-desc').value.trim();
  const price = parseFloat(document.getElementById('prod-price').value);
  const icon = document.getElementById('prod-icon').value || '📦';
  const available = document.getElementById('prod-available').value === 'true';
  const prod_id = document.getElementById('prod-id').value;
  
  if (!name || !price || !store_id || !category_id) {
    showToast('❌ Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  const myStore = stores.find(s => String(s.id) === String(store_id));
  if (!myStore) {
    showToast('❌ Commerce introuvable');
    return;
  }

  // --- MODIFICATION D'UN PRODUIT EXISTANT ---
  if (prod_id) {
    try {
      await supabaseClient.from('products').update({
        store_id: parseInt(store_id),
        category_id: parseInt(category_id),
        name: name,
        description: description,
        price: price,
        icon: icon,
        available: available
      }).eq('id', parseInt(prod_id));
      
      showToast('✅ Produit modifié !');
      closeModal('product-modal');
      if (typeof loadStoreProducts === 'function') loadStoreProducts(store_id);
      if (typeof renderStoreProducts === 'function') renderStoreProducts();
      return;
    } catch (err) {
      console.error('Erreur modification produit:', err);
      showToast('❌ Erreur : ' + err.message);
      return;
    }
  }

  // --- AJOUT D'UN NOUVEAU PRODUIT ---
  const forfait = (myStore.forfait || 'essai').toString().toLowerCase().trim();
  let limiteMax = 10;
  if (forfait === 'base') limiteMax = 20;
  else if (forfait === 'croissance') limiteMax = 45;
  else if (forfait.includes('partenaire')) limiteMax = 95;

  showToast('⏳ Vérification de votre inventaire...');
  
  const { data: existingProducts, error: countError } = await supabaseClient
    .from('products')
    .select('id')
    .eq('store_id', store_id);

  if (countError) {
    console.error("❌ Erreur comptage:", countError);
    showToast('❌ Erreur de vérification');
    return;
  }

  const nbProduitsActuels = existingProducts ? existingProducts.length : 0;

  if (nbProduitsActuels >= limiteMax) {
    showToast(`❌ Limite de ${limiteMax} produits atteinte !`);
    alert(`🚫 LIMITE ATTEINTE\n\nForfait : ${forfait.toUpperCase()}\nLimite : ${limiteMax}\nActuels : ${nbProduitsActuels}`);
    closeModal('product-modal');
    return;
  }

  showToast(`⏳ Ajout du produit...`);
  
  try {
    const { data: newProduct, error } = await supabaseClient.from('products').insert({
      store_id: parseInt(store_id),
      category_id: parseInt(category_id),
      name: name,
      description: description,
      price: price,
      icon: icon,
      available: available
    }).select().single();
    
    if (error) throw error;
    
    // 🔥 MISE À JOUR DIRECTE ET FORCÉE DES COMPTEURS EN HAUT DE LA PAGE
    const elProd = document.getElementById('store-total-products');
    const elCat = document.getElementById('store-total-categories');
    const elOrder = document.getElementById('store-total-orders');
    
    const nouveauTotal = nbProduitsActuels + 1;
    console.log(`✅ SUCCÈS ! Nouveau total produits calculé : ${nouveauTotal} / ${limiteMax}`);
    
    if (elProd) {
      elProd.textContent = `${nouveauTotal} / ${limiteMax}`;
      // Petit flash vert/orange pour te prouver visuellement que le code a touché l'élément
      elProd.style.color = "#f5a623";
      elProd.style.fontWeight = "bold";
      setTimeout(() => {
        elProd.style.color = "";
        elProd.style.fontWeight = "";
      }, 1500);
    } else {
      console.error("❌ CRITIQUE : L'élément HTML 'store-total-products' est INTRROUVABLE !");
    }

    // Ajouter au tableau en mémoire pour cohérence
    if (typeof products !== 'undefined' && Array.isArray(products)) {
      products.push(newProduct);
    }
    
    await showNotification('✅ Produit ajouté', `Le produit "${name}" est en ligne. (${nouveauTotal}/${limiteMax})`, 'success', currentUser.id);
    
    closeModal('product-modal');
    if (typeof loadStoreProducts === 'function') loadStoreProducts(store_id);
    if (typeof renderStoreProducts === 'function') renderStoreProducts();
    
  } catch (err) {
    console.error('Erreur ajout produit:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 🔄 TOGGLER DISPONIBILITÉ PRODUIT
// ==========================================
async function toggleProductAvailability(productId, newStatus, store_id) {
  try {
    await supabaseClient.from('products').update({ available: newStatus }).eq('id', productId);
    loadStoreProducts(store_id);
  } catch (err) {
    alert("❌ Erreur : " + err.message);
  }
}

// ==========================================
// 🗑️ SUPPRIMER UN PRODUIT
// ==========================================
async function deleteProduct(productId, store_id) {
  if (!confirm("Supprimer ce produit définitivement ?")) return;
  try {
    await supabaseClient.from('products').delete().eq('id', productId);
    loadStoreProducts(store_id);
  } catch (err) {
    alert("❌ Erreur : " + err.message);
  }
}

// ==========================================
// 📊 RENDU DASHBOARD COMMERCE
// ==========================================
// ==========================================
// 📊 RENDU DASHBOARD COMMERCE (AVEC DONNÉES FRAÎCHES)
// ==========================================
// ==========================================
// 📊 RENDU DU TABLEAU DE BORD COMMERCE (AVEC COMPTEURS FRAIS)
// ==========================================
async function renderStoreDashboard() {
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  if (!myStore) {
    const container = document.getElementById('store-info-content');
    if (container) {
      container.innerHTML = '<div class="empty-state"><p>⚠️ Aucun commerce associé à votre compte. Veuillez contacter l\'administration.</p></div>';
    }
    return;
  }
  
  try {
    // 🔥 1. RECHARGER LES DONNÉES DEPUIS LA BASE (pour des compteurs 100% à jour)
    // On ne sélectionne que 'id' pour que la requête soit ultra-rapide
    const { data: freshProducts } = await supabaseClient
      .from('products')
      .select('id')
      .eq('store_id', myStore.id);
    
    const { data: freshCategories } = await supabaseClient
      .from('categories')
      .select('id')
      .eq('store_id', myStore.id);
    
    const { data: freshOrders } = await supabaseClient
      .from('orders')
      .select('id')
      .eq('store_id', myStore.id);
    
    // 2. Calculer les totaux (0 si aucune donnée)
    const nbProducts = freshProducts ? freshProducts.length : 0;
    const nbCategories = freshCategories ? freshCategories.length : 0;
    const nbOrders = freshOrders ? freshOrders.length : 0;
    
    // 🔥 3. CALCULER LA LIMITE DU FORFAIT
    const forfait = (myStore.forfait || 'essai').toString().toLowerCase().trim();
    let limiteMax = 10;
    if (forfait === 'base') limiteMax = 20;
    else if (forfait === 'croissance') limiteMax = 45;
    else if (forfait.includes('partenaire')) limiteMax = 95;
    
    // 4. Mettre à jour les compteurs en haut de la page (avec vérification de sécurité)
    const elProducts = document.getElementById('store-total-products');
    if (elProducts) elProducts.textContent = `${nbProducts} / ${limiteMax}`; // Affiche "7 / 10"
    
    const elCategories = document.getElementById('store-total-categories');
    if (elCategories) elCategories.textContent = nbCategories;
    
    const elOrders = document.getElementById('store-total-orders');
    if (elOrders) elOrders.textContent = nbOrders;
    
    // 5. Afficher les infos du commerce
    const container = document.getElementById('store-info-content');
    if (container) {
      container.innerHTML = `
        <div class="profile-section">
          <div class="profile-header">
            <div class="profile-avatar" style="font-size:3rem">
              ${myStore.logo ? `<img src="${myStore.logo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover">` : (myStore.icon || '🏪')}
            </div>
            <div class="profile-info">
              <h2>${myStore.name}</h2>
              <p>${myStore.type || 'Commerce'} • ${myStore.address || 'Adresse non spécifiée'}</p>
              <p>📞 ${myStore.phone || 'Non spécifié'}</p>
              <span class="badge badge-green" style="margin-top:0.5rem;display:inline-block">✅ Actif</span>
              <span class="badge" style="margin-top:0.5rem;display:inline-block; background:#f5a623; color:#0a1929; margin-left:8px; font-weight:bold;">
                ${forfait.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      `;
    }
    
    // 6. Mettre à jour le tableau global en mémoire pour cohérence
    if (typeof products !== 'undefined' && Array.isArray(products)) {
      // On garde les produits des autres commerces, mais on met à jour ceux de ce commerce
      // (Optionnel, mais garde la mémoire synchronisée)
    }

  } catch (err) {
    console.error("❌ Erreur renderStoreDashboard:", err);
  }
}

// ==========================================
// 📂 CATÉGORIES DU COMMERCE
// ==========================================
function showStoreCategories() {
  switchView('view-store');
  document.getElementById('store-dashboard-section').style.display = 'none';
  document.getElementById('store-categories-section').style.display = 'block';
  document.getElementById('store-products-section').style.display = 'none';
  renderStoreCategories();
}

function renderStoreCategories() {
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  if (!myStore) return;
  
  const myCats = categories.filter(c => String(c.store_id) === String(myStore.id) || !c.store_id);
  const c = document.getElementById('store-categories-container');
  
  if (!myCats.length) {
    c.innerHTML = '<div class="empty-state"><p>Aucune catégorie. Ajoutez-en une !</p></div>';
    return;
  }
  
  c.innerHTML = `<div class="cat-grid">${myCats.map(cat => {
    const count = products.filter(p => String(p.store_id) === String(myStore.id) && String(p.category_id) === String(cat.id)).length;
    const isGlobal = !cat.store_id;
    return `<div class="cat-card">
      <div class="cat-card-icon">${cat.icon}</div>
      <div class="cat-card-name">${cat.name}</div>
      <p style="color:#666;font-size:0.85rem;margin-bottom:0.5rem">${count} produit(s)</p>
      ${!isGlobal ? `<div class="cat-card-actions"><button class="action-btn btn-red" onclick="confirmDelete('category',${cat.id})">🗑️</button></div>` : '<span style="font-size:0.8rem;color:#999">Catégorie globale</span>'}
    </div>`;
  }).join('')}</div>`;
}

function openStoreCategoryModal() {
  document.getElementById('cat-modal-title').textContent = '➕ Ma Catégorie';
  document.getElementById('cat-id').value = '';
  document.getElementById('cat-name').value = '';
  selectedCatIcon = '';
  buildIconPicker('cat-icon-picker', 'cat-icon');
  openModal('category-modal');
}

// ==========================================
// 🛍️ PRODUITS DU COMMERCE
// ==========================================
function showStoreProducts() {
  switchView('view-store');
  document.getElementById('store-dashboard-section').style.display = 'none';
  document.getElementById('store-categories-section').style.display = 'none';
  document.getElementById('store-products-section').style.display = 'block';
  renderStoreProducts();
}

async function renderStoreProducts() {
  console.log("🚀 [DEBUG] renderStoreProducts démarré");
  
  if (typeof currentUser === 'undefined' || !currentUser || !currentUser.id) {
    console.warn("⚠️ currentUser non défini ou non connecté.");
    return;
  }
  
  if (typeof stores === 'undefined' || !Array.isArray(stores)) {
    console.warn("⚠️ Le tableau 'stores' n'est pas encore chargé.");
    return;
  }
  
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  if (!myStore) {
    console.warn("⚠️ Aucun magasin trouvé pour owner_id =", currentUser.id);
    return;
  }
  
  const container = document.getElementById('store-products-container');
  if (!container) {
    console.error("❌ Le conteneur HTML 'store-products-container' est introuvable !");
    return;
  }
  
  container.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">⏳ Chargement de votre inventaire...</p>';
  
  try {
    const { data: dbProducts, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('store_id', myStore.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("❌ Erreur Supabase :", error);
      container.innerHTML = `<p style="color:red; text-align:center;">Erreur DB: ${error.message}</p>`;
      return;
    }
    
    if (typeof products !== 'undefined' && Array.isArray(products)) {
      products = products.filter(p => String(p.store_id) !== String(myStore.id));
      if (dbProducts) products = [...products, ...dbProducts];
    }
    
    if (!dbProducts || dbProducts.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Aucun produit dans votre inventaire.</p></div>';
      return;
    }
    
    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr><th>Icon</th><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Dispo</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${dbProducts.map(p => {
            const cat = categories.find(x => String(x.id) === String(p.category_id));
            const price = parseFloat(p.price).toFixed(2);
            return `
              <tr>
                <td style="font-size:1.5rem;text-align:center">${p.icon || '📦'}</td>
                <td><strong>${p.name}</strong></td>
                <td>${cat ? cat.icon + ' ' + cat.name : '-'}</td>
                <td><strong>${price} $</strong></td>
                <td><span class="badge ${p.available ? 'badge-green' : 'badge-red'}">${p.available ? '✅' : '❌'}</span></td>
                <td>
                  <div class="action-btns">
                    <button class="action-btn btn-blue" onclick="editStoreProduct(${p.id})">✏️</button>
                    <button class="action-btn btn-red" onclick="confirmDelete('product',${p.id})">🗑️</button>
                  </div>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error('❌ Erreur critique:', err);
    container.innerHTML = `<p style="color:red; text-align:center;">Erreur: ${err.message}</p>`;
  }
}

function openStoreProductModal() {
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  if (!myStore) return;
  
  document.getElementById('prod-modal-title').textContent = '➕ Mon Produit';
  document.getElementById('prod-id').value = '';
  document.getElementById('prod-name').value = '';
  document.getElementById('prod-desc').value = '';
  document.getElementById('prod-price').value = '';
  document.getElementById('prod-available').value = 'true';
  selectedProdIcon = '';
  
  document.getElementById('prod-store').innerHTML = `<option value="${myStore.id}" selected>${myStore.icon} ${myStore.name}</option>`;
  
  const myCats = categories.filter(c => String(c.store_id) === String(myStore.id) || !c.store_id);
  document.getElementById('prod-category').innerHTML = myCats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  
  buildIconPicker('prod-icon-picker', 'prod-icon');
  openModal('product-modal');
}

function editStoreProduct(id) {
  const p = products.find(x => String(x.id) === String(id));
  if (!p) return;
  
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  document.getElementById('prod-modal-title').textContent = '✏️ Modifier';
  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-name').value = p.name;
  document.getElementById('prod-desc').value = p.desc || '';
  document.getElementById('prod-price').value = p.price;
  document.getElementById('prod-available').value = p.available ? 'true' : 'false';
  selectedProdIcon = p.icon;
  
  document.getElementById('prod-store').innerHTML = `<option value="${myStore.id}" selected>${myStore.icon} ${myStore.name}</option>`;
  
  const myCats = categories.filter(c => String(c.store_id) === String(myStore.id) || !c.store_id);
  document.getElementById('prod-category').innerHTML = myCats.map(c => `<option value="${c.id}" ${String(c.id) === String(p.category_id) ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('');
  
  buildIconPicker('prod-icon-picker', 'prod-icon');
  
  setTimeout(() => {
    document.querySelectorAll('#prod-icon-picker .icon-option').forEach(o => {
      if (o.dataset.icon === p.icon) o.classList.add('selected');
    });
  }, 50);
  
  openModal('product-modal');
}

// ==========================================
// 🏪 NAVIGATION COMMERCE
// ==========================================
function goToMyStore() {
  const catSection = document.getElementById('store-categories-section');
  if (catSection) catSection.style.display = 'none';
  const prodSection = document.getElementById('store-products-section');
  if (prodSection) prodSection.style.display = 'none';
  
  const dashSection = document.getElementById('store-dashboard-section');
  if (dashSection) dashSection.style.display = 'block';
  
  switchView('view-store');
  
  if (typeof showStoreDashboard === 'function') {
    showStoreDashboard();
  }
}

// ==========================================
// 🏷️ GESTION DU NOM DU COMMERCE
// ==========================================
function initStoreNameDisplay() {
  if (!currentUser || !currentUser.id) {
    console.log("ℹ️ initStoreNameDisplay: Pas d'utilisateur connecté");
    return;
  }
  
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  const display = document.getElementById('current-store-name-display');
  
  if (display && myStore) {
    display.textContent = myStore.name;
  } else if (display) {
    display.textContent = 'Mon commerce';
  }
}

function toggleStoreNameEdit(showEdit) {
  const displayMode = document.getElementById('store-name-display');
  const editMode = document.getElementById('store-name-edit-form');
  
  if (showEdit) {
    if (displayMode) displayMode.style.display = 'none';
    if (editMode) editMode.style.display = 'block';
    
    const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
    const input = document.getElementById('store-name-input-pro');
    if (input && myStore) {
      input.value = myStore.name || '';
    }
  } else {
    if (displayMode) displayMode.style.display = 'block';
    if (editMode) editMode.style.display = 'none';
  }
}

async function saveStoreNamePro() {
  const newName = document.getElementById('store-name-input-pro').value.trim();
  if (!newName) {
    showToast('❌ Le nom du commerce ne peut pas être vide.');
    return;
  }
  
  showToast('⏳ Mise à jour en cours...');
  
  try {
    const { error } = await supabaseClient
      .from('stores')
      .update({ name: newName })
      .eq('owner_id', currentUser.id);
    
    if (error) throw error;
    
    const displayEl = document.getElementById('current-store-name-display');
    if (displayEl) displayEl.textContent = newName;
    
    showToast('✅ Nom mis à jour !');
    toggleStoreNameEdit(false);
  } catch (err) {
    console.error('Erreur:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// ✅ FIN DU CHARGEMENT
// ==========================================
console.log("✅ [07-store.js] Dashboard commerce chargé !");

// ==========================================
// ✏️ MODIFIER LES INFOS DU COMMERCE
// ==========================================
function openEditStoreInfoModal() {
  let modal = document.getElementById('edit-store-info-modal');
  if (modal) modal.remove();
  
  modal = document.createElement('div');
  modal.id = 'edit-store-info-modal';
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:500px">
      <h2 style="color:#0a1929; margin-bottom:1.5rem;">🏪 Modifier mon commerce</h2>
      <form onsubmit="saveStoreInfo(event)">
        <div class="form-group">
          <label>🏪 Nom du commerce *</label>
          <input type="text" id="esi-name" required value="${currentUser.storeName || ''}">
        </div>
        <div class="form-group">
          <label>📍 Adresse du commerce *</label>
          <div class="autocomplete-wrapper">
<input type="text" id="esi-address" class="autocomplete-input" oninput="searchAddress(this.value, 'esi-address-suggestions', 'esi-address')" required value="${currentUser.storeAddress || ''}" autocomplete="off">
<div id="esi-address-suggestions" class="autocomplete-suggestions"></div>
          <div id="esi-address-suggestions" class="autocomplete-suggestions"></div>
          </div>
          <button type="button" class="autocomplete-gps-btn" onclick="geolocateAddress('esi-address')">📍 Utiliser GPS</button>
        </div>
        <div class="form-group">
          <label>📞 Téléphone</label>
          <input type="tel" id="esi-phone" value="${currentUser.storePhone || ''}">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-sm btn-gray" onclick="document.getElementById('edit-store-info-modal').remove()">Annuler</button>
          <button type="submit" class="btn-sm btn-green">💾 Enregistrer</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  //setTimeout(() => initAutocomplete('esi-address', 'esi-address-suggestions'), 100);
}

// ==========================================
// 💾 SAUVEGARDE DES INFOS DU COMMERCE (AVEC GÉOCODAGE AUTO)
// ==========================================
async function saveStoreInfo(e) {
  e.preventDefault();
  const newName = document.getElementById('esi-name').value.trim();
  const newAddress = document.getElementById('esi-address').value.trim();
  const newPhone = document.getElementById('esi-phone').value.trim();
  const addressInput = document.getElementById('esi-address');
  
  let newLat = addressInput?._lat || null;
  let newLng = addressInput?._lng || null;
  
  // 🔥 SI PAS DE GPS, ON DEMANDE À MAPBOX
  if ((!newLat || !newLng) && newAddress && newAddress.length > 5) {
    showToast('🔍 Localisation précise du commerce...');
    const coords = await geocodeAddressMapbox(newAddress);
    if (coords) {
      newLat = coords.lat;
      newLng = coords.lng;
      if (addressInput) { addressInput._lat = newLat; addressInput._lng = newLng; }
      showToast('✅ Commerce localisé avec précision !');
    }
  }
  
  const updateData = { name: newName, address: newAddress, phone: newPhone };
  if (newLat && newLng && !isNaN(newLat) && !isNaN(newLng)) {
    updateData.lat = parseFloat(newLat);
    updateData.lng = parseFloat(newLng);
  }
  
  try {
    const { error } = await supabaseClient.from('stores').update(updateData).eq('owner_id', currentUser.id);
    if (error) throw error;
    
    if (currentUser) {
      currentUser.storeName = newName; 
      currentUser.storeAddress = newAddress;
      if (updateData.lat) currentUser.storeLat = parseFloat(updateData.lat);
      if (updateData.lng) currentUser.storeLng = parseFloat(updateData.lng);
    }
    
    const storeIndex = stores.findIndex(s => String(s.owner_id) === String(currentUser.id));
    if (storeIndex !== -1) stores[storeIndex] = { ...stores[storeIndex], ...updateData };
    
    const modal = document.getElementById('edit-store-info-modal');
    if (modal) modal.remove();
    
    showToast('✅ Commerce mis à jour !');
    if (typeof showStoreDashboard === 'function') showStoreDashboard();
  } catch (err) {
    console.error("❌ Erreur sauvegarde commerce:", err);
    showToast('❌ Erreur : ' + err.message);
  }
}
// ==========================================
// 👤 MODIFIER LES INFOS DU RESPONSABLE
// ==========================================
function openEditOwnerInfoModal() {
  let modal = document.getElementById('edit-owner-info-modal');
  if (modal) modal.remove();
  
  modal = document.createElement('div');
  modal.id = 'edit-owner-info-modal';
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:500px">
      <h2 style="color:#0a1929; margin-bottom:1.5rem;">👤 Modifier mes infos (Responsable)</h2>
      <form onsubmit="saveOwnerInfo(event)">
        <div class="form-group">
          <label>👤 Nom complet *</label>
          <input type="text" id="eoi-name" required value="${currentUser.name || ''}">
        </div>
        <div class="form-group">
          <label>📞 Téléphone</label>
          <input type="tel" id="eoi-phone" value="${currentUser.phone || ''}">
        </div>
        <div class="info-box" style="background:#e6f7ff; border-left:4px solid #2563eb; padding:0.8rem; border-radius:6px; font-size:0.85rem; color:#0050b3;">
          💡 <strong>Note :</strong> L'email de connexion ne peut pas être modifié ici.
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-sm btn-gray" onclick="document.getElementById('edit-owner-info-modal').remove()">Annuler</button>
          <button type="submit" class="btn-sm btn-green">💾 Enregistrer</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
}

async function saveOwnerInfo(e) {
  e.preventDefault();
  
  const newName = document.getElementById('eoi-name').value.trim();
  const newPhone = document.getElementById('eoi-phone').value.trim();
  
  try {
    const { error } = await supabaseClient
      .from('profiles')
      .update({
        name: newName,
        phone: newPhone
      })
      .eq('id', currentUser.id);
    
    if (error) throw error;
    
    // Mettre à jour en mémoire
    currentUser.name = newName;
    currentUser.phone = newPhone;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    document.getElementById('edit-owner-info-modal').remove();
    showToast('✅ Infos mises à jour !');
    showStoreDashboard();
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}