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
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'none';
  
  console.log("🔍 showStoreDashboard démarré");
  
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
    const { data: store, error } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('owner_id', currentUser.id)
      .maybeSingle();
    
    if (error || !store) {
      container.innerHTML = `
        <div style="padding:2rem; text-align:center; background:#fee2e2; border-radius:8px;">
          <h3>⏳ Chargement en cours ou commerce introuvable</h3>
          <p>Veuillez rafraîchir la page (F5) ou contacter l'administrateur.</p>
        </div>`;
      return;
    }
    
    container.innerHTML = `
      <div style="background:white; padding:1.5rem; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h2 style="color:#0a1929; margin:0;">🏪 ${store.name}</h2>
          <button onclick="openStoreDetail('${store.id}')" style="padding:8px 16px; background:#6b7280; color:white; border:none; border-radius:6px; cursor:pointer;">
            👁️ Voir mon commerce (Vue Client)
          </button>
        </div>
        <p><strong>📍 Adresse :</strong> ${store.address || 'Non spécifiée'}</p>
        <p><strong>📞 Téléphone :</strong> ${store.phone || 'Non spécifié'}</p>
        <p><strong>📧 Email :</strong> ${store.email || 'Non spécifié'}</p>
        <p><strong>📊 Statut :</strong> <span style="color:#10b981; font-weight:bold;">✅ Actif</span></p>
        <hr style="margin:1.5rem 0; border:0; border-top:1px solid #eee;">
        <h3 style="color:#0a1929;">📦 Mon Inventaire</h3>
        <button onclick="openAddProductModal('${store.id}')" style="padding:10px 20px; background:#10b981; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">➕ Ajouter un produit</button>
        <div id="store-products-list" style="margin-top:1rem; display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:1rem;"></div>
      </div>
    `;
    
    loadStoreProducts(store.id);
  } catch (err) {
    console.error("❌ Erreur:", err);
    container.innerHTML = `<div style="padding:2rem; color:red;">❌ Erreur : ${err.message}</div>`;
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
async function saveProduct(event) {
  event.preventDefault();
  
  const store_id = document.getElementById('prod-store').value;
  const category_id = document.getElementById('prod-category').value;
  const name = document.getElementById('prod-name').value.trim();
  const description = document.getElementById('prod-desc').value.trim();
  const price = parseFloat(document.getElementById('prod-price').value);
  const icon = document.getElementById('prod-icon').value || '📦';
  const available = document.getElementById('prod-available').value === 'true';
  
  if (!name || !price || !store_id || !category_id) {
    showToast('❌ Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  showToast('⏳ Ajout du produit en cours...');
  
  try {
    const { data, error } = await supabaseClient.from('products').insert({
      store_id: store_id,
      category_id: category_id,
      name: name,
      description: description,
      price: price,
      icon: icon,
      available: available
    }).select().single();
    
    if (error) throw error;
    
    await showNotification('✅ Produit ajouté', `Le produit "${name}" est maintenant en ligne.`, 'success', currentUser.id);
    
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
function renderStoreDashboard() {
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  if (!myStore) {
    document.getElementById('store-info-content').innerHTML = '<div class="empty-state"><p>⚠️ Aucun commerce associé à votre compte. Veuillez contacter l\'administration.</p></div>';
    return;
  }
  
  const myProducts = products.filter(p => String(p.store_id) === String(myStore.id));
  const myCategories = categories.filter(c => String(c.store_id) === String(myStore.id) || !c.store_id);
  const storeOrders = orders.filter(o => String(o.store_id) === String(myStore.id));
  
  document.getElementById('store-total-products').textContent = myProducts.length;
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