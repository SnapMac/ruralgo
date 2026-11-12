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
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'none';
  console.log("🔍 showStoreDashboard démarré");

  // 2. Vérifier que c'est bien un commerce
  if (!currentUser || currentUser.role !== 'store') {
    console.log("⚠️ Pas un commerce");
    return;
  }

  const container = document.getElementById('store-info-content');
  if (!container) {
    console.error("❌ Conteneur 'store-info-content' introuvable dans le HTML");
    return;
  }

  try {
    // 3. Récupérer les données du commerce depuis Supabase
    const { data: store, error } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('owner_id', currentUser.id)
      .maybeSingle();

    if (error || !store) {
      container.innerHTML = `
        <div style="padding:2rem; text-align:center; background:#fee2e2; border-radius:8px;">
          <h3>⏳ Chargement en cours ou commerce introuvable</h3>
          <p>Veuillez rafraîchir laa page (F5) ou contacter l'administrateur.</p>
        </div>`;
      return;
    }

    // 4. Construire l'interface avec 2 sections bien distinctes
    container.innerHTML = `
      <div style="background:white; padding:1.5rem; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- EN-TÊTE : Nom du commerce en grand -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:2px solid #f5a623;">
          <div>
            <div style="font-size:0.8rem; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">Mon Commerce</div>
            <h2 style="color:#0a1929; margin:0.3rem 0 0 0; font-size:1.5rem;">🏪 ${store.name}</h2>
          </div>
          <button onclick="openStoreDetail('${store.id}')" style="padding:8px 16px; background:#6b7280; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.85rem;">
            👁️ Voir (Vue Client)
          </button>
        </div>
        
        <!-- SECTION 1 : INFOS DU COMMERCE (Utilisé pour les calculs de livraison) -->
        <div style="background:#f5f1e8; padding:1.25rem; border-radius:8px; margin-bottom:1.5rem; border-left: 4px solid #f5a623;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <h3 style="margin:0; color:#0a1929; font-size:1.1rem;">📋 Informations du commerce</h3>
            <button onclick="openEditStoreInfoModal()" style="background:#0a1929; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
              <span>✏️</span> Modifier
            </button>
          </div>
          <p style="margin:0.4rem 0;"><strong>📍 Adresse (pour livraisons) :</strong> ${store.address || 'Non spécifiée'}</p>
          <p style="margin:0.4rem 0;"><strong>📞 Téléphone du commerce :</strong> ${store.phone || 'Non spécifié'}</p>
          <p style="margin:0.4rem 0;"><strong>📧 Email du commerce :</strong> ${store.email || 'Non spécifié'}</p>
          <p style="margin:0.4rem 0;"><strong>📊 Statut :</strong> <span style="color:#10b981; font-weight:bold;">✅ Actif</span></p>
        </div>

        <!-- SECTION 2 : INFOS DU RESPONSABLE -->
        <div style="background:#e6f7ff; padding:1.25rem; border-radius:8px; margin-bottom:1.5rem; border-left: 4px solid #2563eb;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <h3 style="margin:0; color:#0a1929; font-size:1.1rem;">👤 Responsable du commerce</h3>
            <button onclick="openEditOwnerInfoModal()" style="background:#2563eb; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
              <span>✏️</span> Modifier
            </button>
          </div>
          <p style="margin:0.4rem 0;"><strong>Nom complet :</strong> ${currentUser.name || 'Non spécifié'}</p>
          <p style="margin:0.4rem 0;"><strong>Email de connexion :</strong> ${currentUser.email || 'Non spécifié'}</p>
          <p style="margin:0.4rem 0;"><strong>Téléphone personnel :</strong> ${currentUser.phone || 'Non spécifié'}</p>
        </div>

        <hr style="margin:1.5rem 0; border:0; border-top:1px solid #eee;">
        
        <!-- SECTION 3 : INVENTAIRE -->
        <h3 style="color:#0a1929; margin-bottom:1rem;">📦 Mon Inventaire</h3>
        <button onclick="openAddProductModal('${store.id}')" style="padding:10px 20px; background:#10b981; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold; margin-bottom:1rem;">
          ➕ Ajouter un produit
        </button>
        <div id="store-products-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:1rem;">
          <!-- Les produits seront chargés ici par loadStoreProducts() -->
        </div>
      </div>
    `;

    // 5. Charger les produits du commerce
    if (typeof loadStoreProducts === 'function') {
      loadStoreProducts(store.id);
    }

  } catch (err) {
    console.error("❌ Erreur showStoreDashboard:", err);
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
// 💾 SAUVEGARDER UN PRODUIT
// ==========================================
// ==========================================
// 💾 SAUVEGARDER UN PRODUIT (AVEC LIMITE DE FORFAIT)
// ==========================================
// ==========================================
// 💾 SAUVEGARDER UN PRODUIT (AVEC LIMITE DE FORFAIT)
// ==========================================
// ==========================================
// 💾 SAUVEGARDER UN PRODUIT (AVEC LIMITE DE FORFAIT INFAILLIBLE)
// ==========================================
async function saveProduct(event) {
  // 1. Empêcher le rechargement de la page
  if (event) event.preventDefault();
  else console.warn("⚠️ Attention: 'event' n'a pas été passé à la fonction !");

  const store_id = document.getElementById('prod-store').value;
  console.log("🔍 DEBUG 1: store_id du formulaire =", store_id);

  const myStore = stores.find(s => String(s.id) === String(store_id));
  console.log("🔍 DEBUG 2: Commerce trouvé =", myStore ? myStore.name : "NON TROUVÉ");

  if (!myStore) {
    alert("❌ ERREUR CRITIQUE : Le commerce n'a pas été trouvé (ID: " + store_id + ")");
    return;
  }

  const forfait = (myStore.forfait || 'essai').toString().toLowerCase().trim();
  let limiteMax = 10;
  if (forfait === 'base') limiteMax = 20;
  else if (forfait === 'croissance') limiteMax = 45;
  else if (forfait.includes('partenaire')) limiteMax = 95;

  console.log("🔍 DEBUG 3: Forfait =", forfait, "| Limite Max =", limiteMax);

  showToast('⏳ Vérification de votre inventaire...');
  
  const { data: existingProducts, error } = await supabaseClient
    .from('products')
    .select('id')
    .eq('store_id', store_id);

  if (error) {
    console.error("❌ Erreur Supabase:", error);
    alert("❌ Erreur de base de données : " + error.message);
    return;
  }

  const nbProduitsActuels = existingProducts ? existingProducts.length : 0;
  console.log("🔍 DEBUG 4: Nombre de produits actuels =", nbProduitsActuels);

  // 🚫 VÉRIFICATION STRICTE
  if (nbProduitsActuels >= limiteMax) {
    alert(
      `🚫 BLOQUÉ PAR LE SYSTÈME !\n\n` +
      `📦 Produits actuels : ${nbProduitsActuels}\n` +
      `📋 Limite de votre forfait (${forfait}) : ${limiteMax}\n\n` +
      `Impossible d'ajouter ce produit.`
    );
    closeModal('product-modal');
    return; // ⛔ STOP NET. On sort de la fonction ici.
  }

  // ✅ SI ON ARRIVE ICI, C'EST QUE C'EST AUTORISÉ
  console.log("✅ DEBUG 5: Autorisation accordée, insertion en cours...");
  
  try {
    const { data, error: insertError } = await supabaseClient.from('products').insert({
      store_id: store_id,
      category_id: category_id,
      name: document.getElementById('prod-name').value.trim(),
      description: document.getElementById('prod-desc').value.trim(),
      price: parseFloat(document.getElementById('prod-price').value),
      icon: document.getElementById('prod-icon').value || '📦',
      available: document.getElementById('prod-available').value === 'true'
    }).select().single();
    
    if (insertError) throw insertError;
    
    showToast('✅ Produit ajouté avec succès !');
    closeModal('product-modal');
    
    if (typeof loadStoreProducts === 'function') loadStoreProducts(store_id);
    if (typeof renderStoreProducts === 'function') renderStoreProducts();
    
  } catch (err) {
    console.error('Erreur ajout produit:', err);
    alert('❌ Erreur lors de l\'ajout : ' + err.message);
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
function renderStoreDashboard() {
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  if (!myStore) {
    document.getElementById('store-info-content').innerHTML = '<div class="empty-state"><p>⚠️ Aucun commerce associé à votre compte. Veuillez contacter l\'administration.</p></div>';
    return;
  }
  
  const myProducts = products.filter(p => String(p.store_id) === String(myStore.id));
  const myCategories = categories.filter(c => String(c.store_id) === String(myStore.id) || !c.store_id);
  const storeOrders = orders.filter(o => String(o.store_id) === String(myStore.id));
  
  const forfaitDash = (myStore.forfait || 'essai').toString().toLowerCase().trim();
  let limiteDash = 10;
  if (forfaitDash === 'base') limiteDash = 20;
  else if (forfaitDash === 'croissance') limiteDash = 45;
  else if (forfaitDash === 'partenaire' || forfaitDash === 'partenaire_plus' || forfaitDash === 'partenaire plus') limiteDash = 95;
  
  document.getElementById('store-total-products').textContent = `${myProducts.length} / ${limiteDash}`;
  document.getElementById('store-total-categories').textContent = myCategories.length;
  document.getElementById('store-total-orders').textContent = storeOrders.length;
  
  document.getElementById('store-info-content').innerHTML = `
    <div class="profile-section">
      <div class="profile-header">
        <div class="profile-avatar" style="font-size:3rem">${myStore.logo ? `<img src="${myStore.logo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover">` : myStore.icon}</div>
        <div class="profile-info">
          <h2>${myStore.name}</h2>
          <p>${myStore.type} • ${myStore.address}</p>
          <p>📞 ${myStore.phone || 'Non spécifié'}</p>
          <span class="badge badge-green" style="margin-top:0.5rem;display:inline-block">✅ Actif</span>
        </div>
      </div>
    </div>
  `;
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