// ==========================================
// ⚙️ FICHIER 09 : DASHBOARD ADMIN
// ==========================================
// Rôle : Gestion complète de la plateforme
// ==========================================

console.log("🔄 [09-admin.js] Chargement du dashboard admin...");

// ==========================================
// 📊 RENDU GLOBAL ADMIN
// ==========================================
function renderAllAdmin() {
  renderAdminDashboard();
  renderAdminOrders();
  renderAdminStores();
  renderAdminCategories();
  renderAdminProducts();
  renderAdminDrivers();
  renderAdminClients();
  renderAdminSettings();
}

// ==========================================
// 📑 GESTION DES ONGLETS ADMIN
// ==========================================
function adminTab(tabName, btnElement) {
  document.querySelectorAll('.admin-side li').forEach(li => li.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  
  const allSections = document.querySelectorAll('.admin-main > div');
  allSections.forEach(section => { section.style.display = 'none'; });
  
  const targetSection = document.getElementById('admin-' + tabName);
  if (targetSection) {
    targetSection.style.display = 'block';
    if (tabName === 'pending-stores' && typeof renderPendingStores === 'function') renderPendingStores();
    else if (tabName === 'stores' && typeof renderAdminStores === 'function') renderAdminStores();
    else if (tabName === 'drivers' && typeof renderAdminDrivers === 'function') renderAdminDrivers();
    else if (tabName === 'clients' && typeof renderAdminClients === 'function') renderAdminClients();
    else if (tabName === 'orders' && typeof renderAdminOrders === 'function') renderAdminOrders();
    else if (tabName === 'settings' && typeof loadPlatformSettings === 'function') loadPlatformSettings();
    else if (tabName === 'categories' && typeof renderAdminCategories === 'function') renderAdminCategories();
    else if (tabName === 'products' && typeof renderAdminProducts === 'function') renderAdminProducts();
  } else {
    console.warn("⚠️ Section non trouvée : admin-" + tabName);
  }
}

// ==========================================
// 📊 DASHBOARD PRINCIPAL
// ==========================================
function renderAdminDashboard() {
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingCount = orders.filter(o => ['pending', 'confirmed', 'searching_driver'].includes(o.status)).length;
  
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('stat-profiles', clients.length);
  el('stat-drivers', drivers.length);
  el('stat-stores', stores.length);
  el('stat-orders', orders.length);
  el('stat-revenue', totalRevenue.toFixed(2) + ' $');
  el('stat-pending', pendingCount);
  
  const recent = document.getElementById('admin-recent-orders');
  if (!recent) return;
  
  const lastOrders = orders.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  if (lastOrders.length === 0) {
    recent.innerHTML = '<p style="text-align:center;color:#666;padding:1rem">Aucune commande récente</p>';
    return;
  }
  
  recent.innerHTML = lastOrders.map(o => {
    const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
    return `<div class="order-card" style="margin-bottom:0.5rem">
      <div class="order-card-header">
        <div><h4>#${o.orderNumber}</h4><p style="color:#666;font-size:0.85rem">${new Date(o.createdAt).toLocaleString('fr-CA')}</p></div>
        <span class="status-badge ${st.class}">${st.label}</span>
      </div>
      <div class="order-card-details">
        <div>👤 ${o.clientName}</div>
        <div>🏪 ${o.storeName || '-'}</div>
        <div>💰 ${o.total.toFixed(2)} $</div>
      </div>
    </div>`;
  }).join('');
}

// ==========================================
// 📦 COMMANDES ADMIN
// ==========================================
let currentOrderFilter = 'all';

function filterAdminOrders(filter) {
  currentOrderFilter = filter;
  renderAdminOrders();
}

function renderAdminOrders() {
  const list = document.getElementById('admin-orders-list');
  if (!list) return;
  
  let filtered = orders.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  if (currentOrderFilter === 'pending') filtered = filtered.filter(o => ['pending','confirmed','searching_driver'].includes(o.status));
  else if (currentOrderFilter === 'in-progress') filtered = filtered.filter(o => ['driver_assigned','driver_to_store','at_store','picked_up','driver_to_client'].includes(o.status));
  else if (currentOrderFilter === 'delivered') filtered = filtered.filter(o => o.status === 'delivered');
  else if (currentOrderFilter === 'cancelled') filtered = filtered.filter(o => o.status === 'cancelled');
  
  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>Aucune commande</p></div>';
    return;
  }
  
  list.innerHTML = `<table class="admin-table"><thead><tr><th>#</th><th>Client</th><th>Commerce</th><th>Livraison</th><th>Statut</th><th>Total</th><th>Actions</th></tr></thead><tbody>${filtered.map(o => {
    const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
    return `<tr>
      <td><strong>${o.orderNumber}</strong><br><span style="font-size:0.75rem;color:#999">${new Date(o.createdAt).toLocaleString('fr-CA')}</span></td>
      <td>${o.clientName}<br><span style="font-size:0.8rem;color:#666">${o.clientPhone || ''}</span></td>
      <td>${o.storeName || '-'}</td>
      <td><strong>${o.deliveryFee.toFixed(2)} $</strong><br><span style="font-size:0.75rem;color:#666">${(o.deliveryDistanceKm || 0).toFixed(1)} km</span></td>
      <td><span class="status-badge ${st.class}">${st.label}</span></td>
      <td><strong>${o.total.toFixed(2)} $</strong></td>
      <td><div class="action-btns">
        ${!o.driverId && !['cancelled','delivered'].includes(o.status) ? `<button class="action-btn btn-blue" onclick="assignDriverModal('${o.id}')">🚗</button>` : ''}
        ${!['cancelled','delivered'].includes(o.status) ? `<button class="action-btn btn-red" onclick="adminCancelOrder('${o.id}')">❌</button>` : ''}
      </div></td>
    </tr>`;
  }).join('')}</tbody></table>`;
}

async function assignDriverModal(orderId) {
  const approvedDrivers = drivers.filter(d => d.status === 'approved');
  if (approvedDrivers.length === 0) { showToast('❌ Aucun livreur approuvé'); return; }
  
  const choice = prompt('Assigner au livreur :\n' + approvedDrivers.map((d, i) => `${i + 1}. ${d.name}`).join('\n') + '\nEntrez le numéro :');
  const idx = parseInt(choice) - 1;
  if (isNaN(idx) || !approvedDrivers[idx]) return;
  
  const order = orders.find(o => String(o.id) === String(orderId));
  const driver = approvedDrivers[idx];
  
  try {
    const history = order.statusHistory || [];
    history.push({ status: 'driver_assigned', time: new Date().toISOString(), note: `Assigné par admin à ${driver.name}` });
    
    await supabaseClient.from('orders').update({
      driver_id: driver.id,
      driver_name: driver.name,
      status: 'driver_assigned',
      status_history: history
    }).eq('id', orderId);
    
    if (order.clientId) {
      await showNotification('Livreur assigné', `${driver.name} s'occupe de votre commande ${order.orderNumber}`, 'delivery', order.clientId);
    }
    
    const fee = order.deliveryFee || 0;
    await showNotification('Nouvelle mission', `Commande ${order.orderNumber} assignée (${fee.toFixed(2)}$ à gagner)`, 'delivery', driver.id);
    
    showToast('✅ Livreur assigné !');
    renderAdminOrders();
  } catch (err) {
    console.error('Erreur assignDriver:', err);
    showToast('❌ Erreur');
  }
}

async function adminCancelOrder(orderId) {
  if (!confirm('Annuler cette commande ?')) return;
  const order = orders.find(o => String(o.id) === String(orderId));
  if (!order) return;
  
  try {
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', time: new Date().toISOString(), note: 'Annulée par admin' });
    
    await supabaseClient.from('orders').update({
      status: 'cancelled',
      status_history: order.statusHistory
    }).eq('id', orderId);
    
    await showNotification('❌ Commande annulée', `Votre commande ${order.orderNumber} a été annulée par l'administration`, 'warning', order.clientId);
    showToast('❌ Commande annulée');
    renderAdminOrders();
  } catch (err) {
    console.error('Erreur:', err);
    showToast('❌ Erreur');
  }
}

// ==========================================
// 🏪 COMMERCES ADMIN
// ==========================================
function renderAdminStores() {
  const c = document.getElementById('stores-table-container');
  if (!c) return;
  
  const activeStores = stores.filter(s => s.status === 'active');
  if (!activeStores.length) {
    c.innerHTML = '<div class="empty-state"><p>Aucun commerce actif.</p></div>';
    return;
  }
  
  c.innerHTML = `<table class="admin-table">
    <thead><tr><th>Icon</th><th>Nom</th><th>Type</th><th>Adresse</th><th>Statut</th><th>Actions</th></tr></thead>
    <tbody>${activeStores.map(s => `
      <tr onclick="viewStoreDetails('${s.id}')" style="cursor:pointer">
        <td style="font-size:2rem;text-align:center">${s.icon}</td>
        <td><strong>${s.name}</strong></td>
        <td>${s.type}</td>
        <td style="font-size:0.9rem">${s.address}</td>
        <td><span class="badge badge-green">✅ Actif</span></td>
        <td>
          <div class="action-btns">
            <button class="action-btn btn-blue" onclick="event.stopPropagation(); editStore('${s.id}')" title="Modifier">✏️</button>
            <button class="action-btn btn-green" onclick="event.stopPropagation(); promptRenameStore('${s.id}', '${s.name.replace(/'/g, "\\'")}')" title="Renommer">🏷️</button>
            <button class="action-btn btn-red" onclick="event.stopPropagation(); confirmDelete('store','${s.id}')" title="Supprimer">🗑️</button>
          <button class="action-btn btn-orange" onclick="openChangeForfaitModal(${s.id})" title="Modifier le forfait" style="background:#f5a623; color:#0a1929;">💳</button>
            </div>
        </td>
      </tr>`).join('')}
    </tbody></table>`;
}

function openStoreModal() {
  document.getElementById('store-modal-title').textContent = '➕ Ajouter un commerce';
  document.getElementById('store-id').value = '';
  document.getElementById('store-name').value = '';
  document.getElementById('store-type').value = '';
  document.getElementById('store-addr').value = '';
  document.getElementById('store-phone').value = '';
  document.getElementById('store-status').value = 'active';
  selectedStoreIcon = '';
  buildIconPicker('store-icon-picker', 'store-icon');
  openModal('store-modal');
  setTimeout(() => initAutocomplete('store-addr', 'store-addr-suggestions'), 100);
}

// ==========================================
// 📝 ADMIN : ÉDITER UN COMMERCE (Avec Mapbox)
// ==========================================
// ==========================================
// 📝 ADMIN : ÉDITER UN COMMERCE (Version Robuste)
// ==========================================
function editStore(storeId) {
  console.log("🔍 [ADMIN] Recherche du commerce ID :", storeId);
  
  // 1. On cherche d'abord par 'id'
  let store = stores.find(s => String(s.id) === String(storeId));
  
  // 2. Si pas trouvé, on cherche par 'owner_id' (souvent utilisé comme lien)
  if (!store) {
    store = stores.find(s => String(s.owner_id) === String(storeId));
  }

  // 3. Si toujours pas trouvé, on affiche une erreur claire
  if (!store) {
    console.error("❌ [ADMIN] Commerce introuvable. Liste des stores disponibles :", stores);
    return showToast('❌ Commerce introuvable dans la liste. Vérifiez la console (F12).');
  }

  console.log("✅ [ADMIN] Commerce trouvé :", store.name);

  // Remplir les champs du formulaire
  // Note : On utilise store.id si c'est la clé primaire, sinon store.owner_id
  const targetId = store.id || store.owner_id;
  
  document.getElementById('admin-store-id').value = targetId;
  document.getElementById('admin-store-name').value = store.name || '';
  document.getElementById('admin-store-type').value = store.type || 'general';
  document.getElementById('admin-store-phone').value = store.phone || '';
  
  const addrInput = document.getElementById('admin-store-address');
  addrInput.value = store.address || '';
  
  // Réinitialiser les GPS cachés
  addrInput._lat = store.lat || null;
  addrInput._lng = store.lng || null;

  openModal('admin-edit-store-modal');
}

// ==========================================
// 💾 ADMIN : SAUVEGARDER UN COMMERCE (Avec GPS)
// ==========================================
async function saveAdminStore(event) {
  event.preventDefault();
  const storeId = document.getElementById('admin-store-id').value;
  const addrInput = document.getElementById('admin-store-address');

  const updateData = {
    name: document.getElementById('admin-store-name').value.trim(),
    type: document.getElementById('admin-store-type').value,
    phone: document.getElementById('admin-store-phone').value.trim(),
    address: addrInput.value.trim()
  };

  // 🔥 EXTRACTION DES GPS MAPBOX (Force le format nombre)
  if (addrInput._lat && addrInput._lng) {
    updateData.lat = parseFloat(addrInput._lat);
    updateData.lng = parseFloat(addrInput._lng);
  }

  try {
    // ⚠️ NOTE : Si ta table utilise 'owner_id' comme clé principale, remplace 'id' par 'owner_id' ci-dessous
    const { error } = await supabaseClient.from('stores').update(updateData).eq('id', storeId);
    if (error) throw error;

    closeModal('admin-edit-store-modal');
    showToast('✅ Commerce mis à jour avec succès !');
    if (typeof loadAdminData === 'function') loadAdminData();
  } catch (err) {
    console.error('❌ Erreur mise à jour commerce:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

async function saveStore(e) {
  e.preventDefault();
  if (!selectedStoreIcon && !document.getElementById('store-icon').value) {
    showToast('⚠️ Choisissez une icône'); return;
  }
  
  const id = document.getElementById('store-id').value;
  const addrInput = document.getElementById('store-addr');
  const storeData = {
    icon: document.getElementById('store-icon').value || selectedStoreIcon,
    name: document.getElementById('store-name').value,
    type: document.getElementById('store-type').value,
    address: addrInput.value,
    phone: document.getElementById('store-phone').value,
    status: document.getElementById('store-status').value,
    lat: addrInput._lat || null,
    lng: addrInput._lng || null
  };
  
  try {
    if (id) {
      await supabaseClient.from('stores').update(storeData).eq('id', parseInt(id));
      const idx = stores.findIndex(s => String(s.id) === String(id));
      stores[idx] = { ...stores[idx], ...storeData };
      showToast('✅ Commerce modifié !');
    } else {
      const { data: newStore, error } = await supabaseClient.from('stores').insert(storeData).select().single();
      if (error) throw error;
      stores.push(newStore);
      showToast('✅ Commerce ajouté !');
    }
    closeModal('store-modal');
    renderAdminStores();
    renderLandingStores();
  } catch (err) {
    console.error('Erreur saveStore:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

async function promptRenameStore(store_id, currentName) {
  const newName = prompt("Entrez le nouveau nom pour ce commerce :", currentName);
  if (newName && newName.trim() !== "" && newName.trim() !== currentName) {
    showToast('⏳ Mise à jour en cours...');
    await adminUpdateStoreName(store_id, newName.trim());
    renderAdminStores();
  }
}

async function adminUpdateStoreName(store_id, newStoreName) {
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('❌ Accès refusé.');
    return;
  }
  try {
    const { error } = await supabaseClient.from('stores').update({ name: newStoreName.trim() }).eq('id', store_id);
    if (error) throw error;
    showToast('✅ Nom du commerce modifié !');
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

async function viewStoreDetails(id) {
  const store = stores.find(s => String(s.id) === String(id));
  if (!store) { showToast('❌ Commerce introuvable'); return; }
  
  const { data: storeProducts } = await supabaseClient.from('products').select('*').eq('store_id', store.id).eq('available', true);
  
  let productsHtml = '<p style="color:#666; text-align:center; padding:1rem;">Aucun produit.</p>';
  if (storeProducts && storeProducts.length > 0) {
    productsHtml = '<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">';
    storeProducts.forEach(p => {
      productsHtml += `
        <div style="background:white; padding:1rem; border-radius:8px; text-align:center; border:1px solid #eee;">
          <div style="font-size:2.5rem; margin-bottom:0.5rem;">${p.icon || '📦'}</div>
          <h4 style="margin:0; font-size:0.9rem; color:#0a1929;">${p.name}</h4>
          <p style="margin:0.5rem 0; color:#10b981; font-weight:bold; font-size:1.1rem;">${parseFloat(p.price).toFixed(2)} $</p>
        </div>`;
    });
    productsHtml += '</div>';
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:700px; max-height: 90vh; overflow-y: auto;">
      <h2 style="color:#0a1929;margin-bottom:1.5rem">🏪 ${store.name}</h2>
      <div style="background:#f5f1e8;padding:1.5rem;border-radius:12px">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
          <div style="font-size:4rem">${store.icon || '🏪'}</div>
          <div>
            <h3 style="margin:0;color:#0a1929">${store.name}</h3>
            <p style="margin:0.3rem 0;color:#666">${store.type || 'Non spécifié'}</p>
          </div>
        </div>
        <div style="display:grid;gap:1rem; grid-template-columns: 1fr 1fr;">
          <div style="background:white;padding:1rem;border-radius:8px"><strong>📍 Adresse :</strong><p style="margin:0.3rem 0;color:#666">${store.address || 'Non spécifiée'}</p></div>
          <div style="background:white;padding:1rem;border-radius:8px"><strong>📱 Téléphone :</strong><p style="margin:0.3rem 0;color:#666">${store.phone || 'Non spécifié'}</p></div>
        </div>
      </div>
      <div style="margin-top: 2rem;">
        <h3 style="color:#0a1929; margin-bottom: 0.5rem;">🛒 Produits (${storeProducts?.length || 0})</h3>
        ${productsHtml}
      </div>
      <div style="margin-top:2rem; text-align:center;">
        <button onclick="this.closest('.modal-bg').remove()" style="background:#ef4444; color:white; border:none; padding:12px 24px; border-radius:8px; cursor:pointer; font-size:1rem;">Fermer</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

// ==========================================
// 📂 CATÉGORIES ADMIN
// ==========================================
function renderAdminCategories() {
  const c = document.getElementById('categories-container');
  if (!c) return;
  if (!categories.length) { c.innerHTML = '<div class="empty-state"><p>Aucune catégorie</p></div>'; return; }
  
  c.innerHTML = `<div class="cat-grid">${categories.map(cat => {
    const count = products.filter(p => p.category_id === cat.id).length;
    return `<div class="cat-card">
      <div class="cat-card-icon">${cat.icon}</div>
      <div class="cat-card-name">${cat.name}</div>
      <p style="color:#666;font-size:0.85rem;margin-bottom:0.5rem">${count} produit(s)</p>
      <div class="cat-card-actions">
        <button class="action-btn btn-blue" onclick="editCategory('${cat.id}')">✏️</button>
        <button class="action-btn btn-red" onclick="confirmDelete('category','${cat.id}')">🗑️</button>
      </div>
    </div>`;
  }).join('')}</div>`;
}

function openCategoryModal() {
  document.getElementById('cat-modal-title').textContent = '➕ Catégorie';
  document.getElementById('cat-id').value = '';
  document.getElementById('cat-name').value = '';
  selectedCatIcon = '';
  buildIconPicker('cat-icon-picker', 'cat-icon');
  openModal('category-modal');
}

function editCategory(id) {
  const c = categories.find(x => String(x.id) === String(id));
  if (!c) return;
  document.getElementById('cat-modal-title').textContent = '✏️ Modifier';
  document.getElementById('cat-id').value = c.id;
  document.getElementById('cat-name').value = c.name;
  selectedCatIcon = c.icon;
  buildIconPicker('cat-icon-picker', 'cat-icon');
  setTimeout(() => {
    document.querySelectorAll('#cat-icon-picker .icon-option').forEach(o => {
      if (o.dataset.icon === c.icon) o.classList.add('selected');
    });
  }, 50);
  openModal('category-modal');
}

async function saveCategory(e) {
  e.preventDefault();
  if (!selectedCatIcon && !document.getElementById('cat-icon').value) {
    showToast('⚠️ Choisissez une icône'); return;
  }
  
  const id = document.getElementById('cat-id').value;
  const catData = {
    icon: document.getElementById('cat-icon').value || selectedCatIcon,
    name: document.getElementById('cat-name').value
  };
  
  try {
    if (id) {
      await supabaseClient.from('categories').update(catData).eq('id', parseInt(id));
      const idx = categories.findIndex(c => String(c.id) === String(id));
      categories[idx] = { ...categories[idx], ...catData };
      showToast('✅ Modifiée !');
    } else {
      const { data: newCat, error } = await supabaseClient.from('categories').insert(catData).select().single();
      if (error) throw error;
      categories.push(newCat);
      showToast('✅ Ajoutée !');
    }
    closeModal('category-modal');
    renderAdminCategories();
  } catch (err) {
    console.error('Erreur saveCategory:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 🛍️ PRODUITS ADMIN
// ==========================================
function renderAdminProducts() {
  const c = document.getElementById('products-table-container');
  if (!c) return;
  if (!products.length) { c.innerHTML = '<div class="empty-state"><p>Aucun produit</p></div>'; return; }
  
  c.innerHTML = `<table class="admin-table"><thead><tr><th>Icon</th><th>Nom</th><th>Commerce</th><th>Catégorie</th><th>Prix</th><th>Dispo</th><th>Actions</th></tr></thead><tbody>${products.map(p => {
    const s = stores.find(x => String(x.id) === String(p.store_id));
    const cat = categories.find(x => String(x.id) === String(p.category_id));
    return `<tr>
      <td style="font-size:1.5rem;text-align:center">${p.icon}</td>
      <td><strong>${p.name}</strong></td>
      <td>${s ? s.name : '-'}</td>
      <td>${cat ? cat.icon + ' ' + cat.name : '-'}</td>
      <td><strong>${p.price.toFixed(2)} $</strong></td>
      <td><span class="badge ${p.available ? 'badge-green' : 'badge-red'}">${p.available ? '✅' : '❌'}</span></td>
      <td><div class="action-btns">
        <button class="action-btn btn-blue" onclick="editProduct('${p.id}')">✏️</button>
        <button class="action-btn btn-red" onclick="confirmDelete('product','${p.id}')">🗑️</button>
      </div></td>
    </tr>`;
  }).join('')}</tbody></table>`;
}

function openProductModal() {
  document.getElementById('prod-modal-title').textContent = '➕ Produit';
  document.getElementById('prod-id').value = '';
  document.getElementById('prod-name').value = '';
  document.getElementById('prod-desc').value = '';
  document.getElementById('prod-price').value = '';
  document.getElementById('prod-available').value = 'true';
  selectedProdIcon = '';
  document.getElementById('prod-store').innerHTML = stores.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('');
  document.getElementById('prod-category').innerHTML = categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  buildIconPicker('prod-icon-picker', 'prod-icon');
  openModal('product-modal');
}

function editProduct(id) {
  const p = products.find(x => String(x.id) === String(id));
  if (!p) return;
  document.getElementById('prod-modal-title').textContent = '✏️ Modifier';
  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-name').value = p.name;
  document.getElementById('prod-desc').value = p.desc || '';
  document.getElementById('prod-price').value = p.price;
  document.getElementById('prod-available').value = p.available ? 'true' : 'false';
  selectedProdIcon = p.icon;
  document.getElementById('prod-store').innerHTML = stores.map(s => `<option value="${s.id}" ${String(s.id) === String(p.store_id) ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('');
  document.getElementById('prod-category').innerHTML = categories.map(c => `<option value="${c.id}" ${String(c.id) === String(p.category_id) ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('');
  buildIconPicker('prod-icon-picker', 'prod-icon');
  setTimeout(() => {
    document.querySelectorAll('#prod-icon-picker .icon-option').forEach(o => {
      if (o.dataset.icon === p.icon) o.classList.add('selected');
    });
  }, 50);
  openModal('product-modal');
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('prod-id').value;
  
  const prodData = {
    store_id: parseInt(document.getElementById('prod-store').value),
    category_id: parseInt(document.getElementById('prod-category').value),
    name: document.getElementById('prod-name').value,
    description: document.getElementById('prod-desc').value,
    price: parseFloat(document.getElementById('prod-price').value),
    icon: document.getElementById('prod-icon').value || selectedProdIcon,
    available: document.getElementById('prod-available').value === 'true'
  };
  
  try {
    if (id) {
      // ✅ MODIFICATION : pas de limite à vérifier
      await supabaseClient.from('products').update(prodData).eq('id', parseInt(id));
      showToast('✅ Produit modifié !');
    } else {
      // 🆕 AJOUT : on vérifie la limite du forfait
      
      // 1️⃣ Trouver le commerce
      const myStore = stores.find(s => String(s.id) === String(prodData.store_id));
      if (!myStore) {
        showToast('❌ Commerce introuvable');
        return;
      }

      // 2️⃣ Déterminer la limite selon le forfait
      const forfait = (myStore.forfait || 'essai').toString().toLowerCase().trim();
      let limiteMax = 10;
      if (forfait === 'base') limiteMax = 20;
      else if (forfait === 'croissance') limiteMax = 45;
      else if (forfait.includes('partenaire')) limiteMax = 95;

      console.log(`🔍 [LIMITE] Forfait : ${forfait} | Limite : ${limiteMax}`);

      // 3️⃣ Compter les produits actuels (méthode infaillible)
      const { data: existingProducts, error: countError } = await supabaseClient
        .from('products')
        .select('id')
        .eq('store_id', prodData.store_id);

      if (countError) {
        console.error("❌ Erreur comptage:", countError);
        showToast('❌ Erreur de vérification');
        return;
      }

      const nbProduitsActuels = existingProducts ? existingProducts.length : 0;
      console.log(`📦 [LIMITE] Produits actuels : ${nbProduitsActuels} / ${limiteMax}`);

      // 4️⃣ VÉRIFICATION STRICTE
      if (nbProduitsActuels >= limiteMax) {
        showToast(`❌ Limite de ${limiteMax} produits atteinte !`);
        alert(
          `🚫 LIMITE D'INVENTAIRE ATTEINTE\n\n` +
          `📋 Forfait : ${forfait.toUpperCase()}\n` +
          `📦 Limite : ${limiteMax} produits\n` +
          `📊 Actuels : ${nbProduitsActuels}\n\n` +
          `💡 Contactez l'administration pour passer à un forfait supérieur.`
        );
        return; // ⛔ STOP NET
      }

      // 5️⃣ Tout est bon, on ajoute
      const { data: newProd, error } = await supabaseClient.from('products').insert(prodData).select().single();
      if (error) throw error;
      products.push(newProd);
      showToast(`✅ Produit ajouté ! (${nbProduitsActuels + 1}/${limiteMax})`);
    }
    closeModal('product-modal');
    renderAdminProducts();
  } catch (err) {
    console.error('Erreur saveProduct:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 👥 CLIENTS ADMIN
// ==========================================
function renderAdminClients() {
  const c = document.getElementById('clients-table-container') || document.getElementById('profiles-table-container');
  if (!c) return;
  if (!clients.length) { c.innerHTML = '<div class="empty-state"><p>Aucun client</p></div>'; return; }
  
  c.innerHTML = `<table class="admin-table">
    <thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Adresse</th><th>Commandes</th><th>Total</th><th>Actions</th></tr></thead>
    <tbody>${clients.map(cl => {
      const myOrders = orders.filter(o => String(o.clientId) === String(cl.id));
      const total = myOrders.reduce((s, o) => s + o.total, 0);
      return `<tr onclick="viewClientDetails('${cl.id}')" style="cursor:pointer">
        <td><strong>${cl.name}</strong></td>
        <td>${cl.email}</td>
        <td>${cl.phone}</td>
        <td style="font-size:0.85rem">${cl.address}</td>
        <td>${myOrders.length}</td>
        <td><strong>${total.toFixed(2)} $</strong></td>
        <td>
          <div class="action-btns">
            <button class="action-btn btn-blue" onclick="event.stopPropagation(); editClient('${cl.id}')">✏️</button>
            <button class="action-btn btn-red" onclick="event.stopPropagation(); confirmDeleteClient('${cl.id}')">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('')}</tbody></table>`;
}

function viewClientDetails(id) {
  const client = clients.find(c => String(c.id) === String(id));
  if (!client) { showToast('❌ Client introuvable'); return; }
  
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:600px">
      <h2 style="color:#0a1929;margin-bottom:1.5rem">👤 ${client.name}</h2>
      <div style="background:#f5f1e8;padding:1.5rem;border-radius:12px">
        <div style="display:grid;gap:1rem">
          <div style="background:white;padding:1rem;border-radius:8px"><strong>📧 Email :</strong><p style="margin:0.3rem 0;color:#666">${client.email || 'Non spécifié'}</p></div>
          <div style="background:white;padding:1rem;border-radius:8px"><strong>📱 Téléphone :</strong><p style="margin:0.3rem 0;color:#666">${client.phone || 'Non spécifié'}</p></div>
          <div style="background:white;padding:1rem;border-radius:8px"><strong>📍 Adresse :</strong><p style="margin:0.3rem 0;color:#666">${client.address || 'Non spécifiée'}</p></div>
        </div>
      </div>
      <div style="margin-top:1.5rem;text-align:right">
        <button class="btn-sm btn-gray" onclick="this.closest('.modal-bg').remove()">Fermer</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

// ==========================================
// 📝 ADMIN : ÉDITER UN CLIENT (Avec Mapbox)
// ==========================================
function editClient(clientId) {
  const client = clients.find(c => c.id === clientId);
  if (!client) return showToast('❌ Client introuvable');

  document.getElementById('admin-client-id').value = client.id;
  document.getElementById('admin-client-name').value = client.name || '';
  document.getElementById('admin-client-email').value = client.email || '';
  document.getElementById('admin-client-phone').value = client.phone || '';
  
  const addrInput = document.getElementById('admin-client-address');
  addrInput.value = client.address || '';
  // Réinitialiser les GPS cachés au cas où
  addrInput._lat = client.lat || null;
  addrInput._lng = client.lng || null;

  openModal('admin-edit-client-modal');
}

// ==========================================
// 💾 ADMIN : SAUVEGARDER UN CLIENT (Avec GPS)
// ==========================================
async function saveAdminClient(event) {
  event.preventDefault();
  const clientId = document.getElementById('admin-client-id').value;
  const addrInput = document.getElementById('admin-client-address');

  const updateData = {
    name: document.getElementById('admin-client-name').value.trim(),
    email: document.getElementById('admin-client-email').value.trim(),
    phone: document.getElementById('admin-client-phone').value.trim(),
    address: addrInput.value.trim()
  };

  // 🔥 EXTRACTION DES GPS MAPBOX (Force le format nombre)
  if (addrInput._lat && addrInput._lng) {
    updateData.lat = parseFloat(addrInput._lat);
    updateData.lng = parseFloat(addrInput._lng);
  }

  try {
    const { error } = await supabaseClient.from('profiles').update(updateData).eq('id', clientId);
    if (error) throw error;

    closeModal('admin-edit-client-modal');
    showToast('✅ Client mis à jour avec succès !');
    if (typeof loadAdminData === 'function') loadAdminData(); // Rafraîchir la liste
  } catch (err) {
    console.error('❌ Erreur mise à jour client:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

async function confirmDeleteClient(id) {
  if (!confirm('⚠️ Supprimer ce client ? Cette action est IRRÉVERSIBLE !')) return;
  try {
    await supabaseClient.from('orders').delete().eq('client_id', id);
    await supabaseClient.from('notifications').delete().eq('user_id', id);
    const { error } = await supabaseClient.from('profiles').delete().eq('id', id);
    if (error) throw error;
    clients = clients.filter(c => String(c.id) !== String(id));
    showToast('✅ Client supprimé !');
    renderAdminClients();
    renderAdminDashboard();
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 🚗 LIVREURS ADMIN
// ==========================================
function renderAdminDrivers() {
  const c = document.getElementById('drivers-table-container');
  if (!c) return;
  if (!drivers.length) { c.innerHTML = '<div class="empty-state"><p>Aucun livreur</p></div>'; return; }
  
  c.innerHTML = `<table class="admin-table">
    <thead><tr><th>Nom</th><th>Téléphone</th><th>Véhicule</th><th>Livraisons</th><th>Statut</th><th>Actions</th></tr></thead>
    <tbody>${drivers.map(d => {
      const nb = orders.filter(o => String(o.driverId) === String(d.id) && o.status === 'delivered').length;
      const badge = d.status === 'approved' ? 'badge-green' : d.status === 'pending' ? 'badge-yellow' : 'badge-red';
      const label = d.status === 'approved' ? '✅ Approuvé' : d.status === 'pending' ? '⏳ En attente' : '❌ Refusé';
      return `<tr>
        <td><strong>${d.name}</strong><br><small style="color:#666">${d.email || ''}</small></td>
        <td>${d.phone || '-'}</td>
        <td>${d.vehicle || '-'}</td>
        <td>${nb}</td>
        <td><span class="badge ${badge}">${label}</span></td>
        <td>
          <div class="action-btns">
            <button class="action-btn btn-blue" onclick="editDriver('${d.id}')">✏️</button>
            ${d.status !== 'approved' ? `<button class="action-btn btn-green" onclick="approveDriver('${d.id}')">✅</button>` : ''}
            <button class="action-btn btn-red" onclick="confirmDeleteDriver('${d.id}')">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('')}</tbody></table>`;
}

function viewDriverDetails(id) {
  const driver = drivers.find(d => String(d.id) === String(id));
  if (!driver) { showToast('❌ Livreur introuvable'); return; }
  
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:600px">
      <h2 style="color:#0a1929;margin-bottom:1.5rem">🚗 ${driver.name}</h2>
      <div style="background:#f5f1e8;padding:1.5rem;border-radius:12px">
        <div style="display:grid;gap:1rem">
          <div style="background:white;padding:1rem;border-radius:8px"><strong>📧 Email :</strong><p style="margin:0.3rem 0;color:#666">${driver.email || 'Non spécifié'}</p></div>
          <div style="background:white;padding:1rem;border-radius:8px"><strong>📱 Téléphone :</strong><p style="margin:0.3rem 0;color:#666">${driver.phone || 'Non spécifié'}</p></div>
          <div style="background:white;padding:1rem;border-radius:8px"><strong>🚙 Véhicule :</strong><p style="margin:0.3rem 0;color:#666">${driver.vehicle || 'Non spécifié'}</p></div>
        </div>
      </div>
      <div style="margin-top:1.5rem;text-align:right">
        <button class="btn-sm btn-gray" onclick="this.closest('.modal-bg').remove()">Fermer</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

// ==========================================
// 📝 ADMIN : ÉDITER UN LIVREUR (Avec Mapbox)
// ==========================================
function editDriver(driverId) {
  const driver = drivers.find(d => d.id === driverId);
  if (!driver) return showToast('❌ Livreur introuvable');

  document.getElementById('admin-driver-id').value = driver.id;
  document.getElementById('admin-driver-name').value = driver.name || '';
  document.getElementById('admin-driver-phone').value = driver.phone || '';
  
  const addrInput = document.getElementById('admin-driver-address');
  addrInput.value = driver.address || '';
  addrInput._lat = driver.lat || null;
  addrInput._lng = driver.lng || null;

  openModal('admin-edit-driver-modal');
}

// ==========================================
// 💾 ADMIN : SAUVEGARDER UN LIVREUR (Avec GPS)
// ==========================================
async function saveAdminDriver(event) {
  event.preventDefault();
  const driverId = document.getElementById('admin-driver-id').value;
  const addrInput = document.getElementById('admin-driver-address');

  const updateData = {
    name: document.getElementById('admin-driver-name').value.trim(),
    phone: document.getElementById('admin-driver-phone').value.trim(),
    address: addrInput.value.trim()
  };

  // 🔥 EXTRACTION DES GPS MAPBOX (Force le format nombre)
  if (addrInput._lat && addrInput._lng) {
    updateData.lat = parseFloat(addrInput._lat);
    updateData.lng = parseFloat(addrInput._lng);
  }

  try {
    const { error } = await supabaseClient.from('profiles').update(updateData).eq('id', driverId);
    if (error) throw error;

    closeModal('admin-edit-driver-modal');
    showToast('✅ Livreur mis à jour avec succès !');
    if (typeof loadAdminData === 'function') loadAdminData();
  } catch (err) {
    console.error('❌ Erreur mise à jour livreur:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

async function saveDriverEdit(event, id) {
  event.preventDefault();
  const data = {
    name: document.getElementById('ed-name').value.trim(),
    phone: document.getElementById('ed-phone').value.trim(),
    vehicle: document.getElementById('ed-vehicle').value,
    status: document.getElementById('ed-status').value
  };
  
  try {
    const { error } = await supabaseClient.from('profiles').update(data).eq('id', id);
    if (error) throw error;
    const idx = drivers.findIndex(d => String(d.id) === String(id));
    if (idx >= 0) drivers[idx] = { ...drivers[idx], ...data };
    document.getElementById('edit-driver-modal').remove();
    renderAdminDrivers();
    showToast('✅ Livreur modifié !');
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

async function approveDriver(driverId) {
  try {
    await supabaseClient.from('profiles').update({ status: 'approved' }).eq('id', driverId);
    const d = drivers.find(x => String(x.id) === String(driverId));
    if (d) d.status = 'approved';
    await showNotification(driverId, '✅ Compte approuvé', 'Bienvenue dans l\'équipe RuralGo !', 'success');
    showToast('✅ Livreur approuvé !');
    renderAdminDrivers();
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

async function rejectDriver(driverId) {
  try {
    await supabaseClient.from('profiles').update({ status: 'rejected' }).eq('id', driverId);
    const d = drivers.find(x => String(x.id) === String(driverId));
    if (d) d.status = 'rejected';
    showToast('⚠️ Livreur refusé.');
    renderAdminDrivers();
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

async function confirmDeleteDriver(id) {
  const d = drivers.find(x => String(x.id) === String(id));
  if (!d) { showToast('❌ Livreur introuvable'); return; }
  if (!confirm('Supprimer le livreur ' + d.name + ' ?')) return;
  
  try {
    await supabaseClient.from('orders').update({ driver_id: null, driver_name: null }).eq('driver_id', id);
    await supabaseClient.from('notifications').delete().eq('user_id', id);
    const { error } = await supabaseClient.from('profiles').delete().eq('id', id);
    if (error) throw error;
    drivers = drivers.filter(x => String(x.id) !== String(id));
    renderAdminDrivers();
    showToast('✅ Livreur supprimé !');
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 📨 DEMANDES DE COMMERCES EN ATTENTE
// ==========================================
async function renderPendingStores() {
  const container = document.getElementById('pending-stores-container');
  if (!container) return;
  
  try {
    const { data, error } = await supabaseClient
      .from('profiles').select('*')
      .eq('role', 'store').eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;color:#666">Aucune demande en attente.</div>';
      return;
    }
    
    container.innerHTML = data.map(profile => `
      <div style="background:white;padding:1.5rem;border-radius:12px;margin-bottom:1rem;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:1rem;flex-wrap:wrap">
          <div style="flex:1;min-width:250px">
            <h4 style="color:#0a1929;margin:0 0 0.5rem">${profile.name}</h4>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Email :</strong> ${profile.email || 'Non spécifié'}</p>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Téléphone :</strong> ${profile.phone || 'Non spécifié'}</p>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Adresse :</strong> ${profile.address || 'Non spécifiée'}</p>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Forfait :</strong> ${getPlanName(profile.selected_plan_id)}</p>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            <button class="btn-sm btn-green" onclick="approveStore('${profile.id}')">✅ Approuver</button>
            <button class="btn-sm btn-red" onclick="rejectStore('${profile.id}')">❌ Refuser</button>
          </div>
        </div>
      </div>`).join('');
  } catch (error) {
    console.error('Erreur renderPendingStores:', error);
  }
}

function getPlanName(planId) {
  if (planId === 1) return '🌱 Essai (0$)';
  if (planId === 2) return '🏪 Base (7.99$)';
  if (planId === 3) return '🚀 Croissance (29.99$)';
  if (planId === 4) return '👑 Partenaire Plus (89.99$)';
  return 'Non spécifié';
}

async function approveStore(profileId) {
  try {
    showToast('⏳ Approbation en cours...');
    const { error: profileError } = await supabaseClient.from('profiles').update({ status: 'approved' }).eq('id', profileId);
    if (profileError) throw profileError;
    
    const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', profileId).single();
    if (!profile) throw new Error("Profil introuvable");
    
    const { data: existingStore } = await supabaseClient.from('stores').select('id').eq('owner_id', profileId).maybeSingle();
    
    if (!existingStore) {
      await supabaseClient.from('stores').insert({
        owner_id: profileId,
        name: profile.name || 'Mon Commerce',
        type: profile.type || 'Commerce',
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
        status: 'active',
        forfait: profile.selected_plan_id || 1,
        icon: '🏪'
      });
    } else {
      await supabaseClient.from('stores').update({ status: 'active' }).eq('owner_id', profileId);
    }
    
    showToast('✅ Commerce approuvé !');
    renderPendingStores();
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

async function rejectStore(profileId) {
  if (!confirm('Êtes-vous sûr de vouloir refuser cette demande ?')) return;
  try {
    showToast('⏳ Refus en cours...');
    await supabaseClient.from('stores').delete().eq('owner_id', profileId);
    const { error } = await supabaseClient.from('profiles').delete().eq('id', profileId);
    if (error) throw error;
    showToast('🗑️ Demande refusée.');
    renderPendingStores();
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// ⚙️ PARAMÈTRES ADMIN
// ==========================================
function renderAdminSettings() {
  const c = document.getElementById('admin-settings-content');
  if (!c) return;
  
  c.innerHTML = `
    <div class="profile-section">
      <h3 style="color:#0a1929;margin-bottom:1rem">💰 Système de facturation</h3>
      <div class="info-box">💡 Tarif : <strong>Frais de base + (Distance × Prix par km)</strong></div>
      <div class="form-group"><label>Frais de base ($)</label><input type="number" id="set-base-fee" step="0.50" value="${platformSettings.deliveryBaseFee}"></div>
      <div class="form-group"><label>Prix par km ($)</label><input type="number" id="set-per-km" step="0.10" value="${platformSettings.deliveryPerKm}"></div>
      <div class="form-group"><label>Taux de taxes</label><input type="number" id="set-tax-rate" step="0.00001" value="${platformSettings.taxRate}"></div>
      <div class="form-group"><label>Commission livreur (ex: 0.20 = 20%)</label><input type="number" id="set-commission" step="0.05" value="${platformSettings.driverCommission}"></div>
      <div class="form-group"><label>Rayon (km)</label><input type="number" id="set-radius" value="${platformSettings.radius}"></div>
      <button class="btn" onclick="saveSettings()">💾 Enregistrer</button>
    </div>`;
}

async function loadPlatformSettings() {
  try {
    const { data, error } = await supabaseClient.from('platform_settings').select('*').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      platformSettings.deliveryBaseFee = data.delivery_base_fee || 7.00;
      platformSettings.deliveryPerKm = data.delivery_per_km || 1.00;
      platformSettings.taxRate = data.tax_rate || 0.14975;
      platformSettings.driverCommission = data.driver_commission || 0.20;
      platformSettings.radius = data.radius || 40;
    }
    renderAdminSettings();
  } catch (err) {
    console.error('Erreur loadPlatformSettings:', err);
  }
}

async function saveSettings() {
  platformSettings.deliveryBaseFee = parseFloat(document.getElementById('set-base-fee').value) || 7.00;
  platformSettings.deliveryPerKm = parseFloat(document.getElementById('set-per-km').value) || 1.00;
  platformSettings.taxRate = parseFloat(document.getElementById('set-tax-rate').value) || 0.14975;
  platformSettings.driverCommission = parseFloat(document.getElementById('set-commission').value) || 0.20;
  platformSettings.radius = parseInt(document.getElementById('set-radius').value) || 40;
  
  try {
    const { error } = await supabaseClient.from('platform_settings').upsert({
      id: 1,
      delivery_base_fee: platformSettings.deliveryBaseFee,
      delivery_per_km: platformSettings.deliveryPerKm,
      tax_rate: platformSettings.taxRate,
      driver_commission: platformSettings.driverCommission,
      radius: platformSettings.radius
    }, { onConflict: 'id' });
    
    if (error) throw error;
    showToast('✅ Paramètres enregistrés !');
    loadPlatformSettings();
    if (currentUser && currentUser.role === 'client') updateCart();
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 🗑️ SUPPRESSION GÉNÉRIQUE
// ==========================================
function confirmDelete(type, id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
  
  (async () => {
    try {
      if (type === 'store') {
        await supabaseClient.from('stores').delete().eq('id', id);
        stores = stores.filter(s => String(s.id) !== String(id));
        showToast('✅ Commerce supprimé');
      } else if (type === 'category') {
        await supabaseClient.from('categories').delete().eq('id', id);
        categories = categories.filter(c => String(c.id) !== String(id));
        showToast('✅ Catégorie supprimée');
      } else if (type === 'product') {
        await supabaseClient.from('products').delete().eq('id', id);
        products = products.filter(p => String(p.id) !== String(id));
        showToast('✅ Produit supprimé');
      }
      renderAdminStores();
      renderAdminCategories();
      renderAdminProducts();
      renderLandingStores();
    } catch (err) {
      showToast('❌ Erreur: ' + err.message);
    }
  })();
}

// ==========================================
// 🔄 MISE À JOUR STATUT COMMANDE
// ==========================================
async function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(o => String(o.id) === String(orderId)) || {};
  if (!order.id) return;
  
  try {
    const history = order.statusHistory || [];
    history.push({ status: newStatus, time: new Date().toISOString(), note: `Mis à jour par ${currentUser.name}` });
    
    await supabaseClient.from('orders').update({
      status: newStatus,
      status_history: history
    }).eq('id', orderId);
    
    const messages = {
      'driver_to_store': '🛣️ Le livreur est en route vers le commerce',
      'at_store': '🏪 Le livreur est arrivé au commerce',
      'picked_up': '📦 Votre commande a été récupérée',
      'driver_to_client': '🚗 Le livreur est en route vers vous',
      'delivered': '🏠 Votre commande a été livrée avec succès !'
    };
    
    const clientId = order.clientId;
    if (clientId) {
      await showNotification('Mise à jour commande', messages[newStatus] || 'Statut mis à jour', 'delivery', clientId);
    }
    
    if (newStatus === 'delivered') {
      const { data: admins } = await supabaseClient.from('profiles').select('id').eq('role', 'admin');
      if (admins) {
        for (const admin of admins) {
          await showNotification('Commande livrée', `La commande ${order.orderNumber} a été livrée par ${currentUser.name}`, 'success', admin.id);
        }
      }
    }
    
    showToast('✅ Statut mis à jour');
    if (typeof renderDriverDashboard === 'function') renderDriverDashboard();
    if (typeof renderAdminOrders === 'function') renderAdminOrders();
  } catch (err) {
    console.error('Erreur updateOrderStatus:', err);
    showToast('❌ Erreur');
  }
}

// ==========================================
// ✅ FIN DU CHARGEMENT
// ==========================================
console.log("✅ [09-admin.js] Dashboard admin chargé !");

// ==========================================
// 💳 MODIFIER LE FORFAIT D'UN COMMERCE (MANUELLEMENT)
// ==========================================
// ==========================================
// 💳 MODIFIER LE FORFAIT ET LE PAIEMENT D'UN COMMERCE
// ==========================================
function openChangeForfaitModal(storeId) {
  const store = stores.find(s => String(s.id) === String(storeId));
  if (!store) {
    showToast('❌ Commerce introuvable');
    return;
  }

  const forfaitActuel = (store.forfait || 'essai').toString().toLowerCase().trim();
  const estPaye = store.paid === true; // ✅ Nouveau : statut de paiement

  let modal = document.getElementById('change-forfait-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'change-forfait-modal';
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:550px">
      <h2 style="color:#0a1929; margin-bottom:1rem;">💳 Forfait & Paiement</h2>
      <p style="color:#666; margin-bottom:1.5rem;">
        Commerce : <strong>${store.icon || '🏪'} ${store.name}</strong>
      </p>
      
      <!-- SECTION FORFAIT -->
      <div style="background:#f9fafb; padding:1rem; border-radius:8px; margin-bottom:1rem;">
        <label style="font-weight:bold; display:block; margin-bottom:0.5rem;">📋 Forfait</label>
        <select id="new-forfait-select" style="width:100%; padding:10px; border:2px solid #e5e7eb; border-radius:8px; font-size:1rem;">
          <option value="essai" ${forfaitActuel === 'essai' ? 'selected' : ''}>🎁 Essai (10 produits)</option>
          <option value="base" ${forfaitActuel === 'base' ? 'selected' : ''}>📦 Base (20 produits)</option>
          <option value="croissance" ${forfaitActuel === 'croissance' ? 'selected' : ''}>🚀 Croissance (45 produits)</option>
          <option value="partenaire_plus" ${forfaitActuel === 'partenaire_plus' || forfaitActuel === 'partenaire plus' ? 'selected' : ''}>⭐ Partenaire Plus (95 produits)</option>
        </select>
      </div>

      <!-- SECTION PAIEMENT -->
      <div style="background:#f0fdf4; padding:1rem; border-radius:8px; margin-bottom:1rem; border-left:4px solid #10b981;">
        <label style="font-weight:bold; display:block; margin-bottom:0.5rem;">💰 Statut du paiement</label>
        <div style="display:flex; gap:0.5rem;">
          <button type="button" id="btn-paid-yes" onclick="togglePaidStatus(true)" 
            style="flex:1; padding:12px; border:2px solid ${estPaye ? '#10b981' : '#e5e7eb'}; background:${estPaye ? '#10b981' : 'white'}; color:${estPaye ? 'white' : '#374151'}; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.95rem;">
            ✅ Payé
          </button>
          <button type="button" id="btn-paid-no" onclick="togglePaidStatus(false)" 
            style="flex:1; padding:12px; border:2px solid ${!estPaye ? '#ef4444' : '#e5e7eb'}; background:${!estPaye ? '#ef4444' : 'white'}; color:${!estPaye ? 'white' : '#374151'}; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.95rem;">
            ❌ Non payé
          </button>
        </div>
        <p style="margin:0.5rem 0 0 0; font-size:0.8rem; color:#666;">
          💡 Quand c'est marqué "Payé", le rappel de paiement disparaît pour ce commerce.
        </p>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-sm btn-gray" onclick="document.getElementById('change-forfait-modal').remove()">Annuler</button>
        <button type="button" class="btn-sm btn-green" onclick="saveForfaitChange('${storeId}')">💾 Enregistrer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Sauvegarder l'état actuel dans une variable temporaire
  window._tempPaidStatus = estPaye;
}

// Fonction pour basculer le statut payé dans la modale
function togglePaidStatus(paid) {
  window._tempPaidStatus = paid;
  
  const btnYes = document.getElementById('btn-paid-yes');
  const btnNo = document.getElementById('btn-paid-no');
  
  if (paid) {
    btnYes.style.background = '#10b981';
    btnYes.style.color = 'white';
    btnYes.style.borderColor = '#10b981';
    btnNo.style.background = 'white';
    btnNo.style.color = '#374151';
    btnNo.style.borderColor = '#e5e7eb';
  } else {
    btnNo.style.background = '#ef4444';
    btnNo.style.color = 'white';
    btnNo.style.borderColor = '#ef4444';
    btnYes.style.background = 'white';
    btnYes.style.color = '#374151';
    btnYes.style.borderColor = '#e5e7eb';
  }
}

async function saveForfaitChange(storeId) {
  const newForfait = document.getElementById('new-forfait-select').value;
  const newPaidStatus = window._tempPaidStatus !== undefined ? window._tempPaidStatus : false;
  
  showToast('⏳ Mise à jour...');
  
  try {
    const { error } = await supabaseClient
      .from('stores')
      .update({ 
        forfait: newForfait,
        paid: newPaidStatus  // ✅ On sauvegarde le statut de paiement
      })
      .eq('id', storeId);
    
    if (error) throw error;
    
    // Mettre à jour en mémoire
    const storeIndex = stores.findIndex(s => String(s.id) === String(storeId));
    if (storeIndex !== -1) {
      stores[storeIndex].forfait = newForfait;
      stores[storeIndex].paid = newPaidStatus;
    }
    
    // ✅ IMPORTANT : Mettre à jour currentUser si c'est son propre commerce
    if (currentUser && currentUser.role === 'store') {
      const myStoreIndex = stores.findIndex(s => String(s.owner_id) === String(currentUser.id));
      if (myStoreIndex !== -1 && String(stores[myStoreIndex].id) === String(storeId)) {
        currentUser.storePaid = newPaidStatus;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    }
    
    const modal = document.getElementById('change-forfait-modal');
    if (modal) modal.remove();
    
    const statusText = newPaidStatus ? '✅ Payé' : '❌ Non payé';
    showToast(`✅ Forfait et paiement mis à jour ! (${statusText})`);
    
    if (typeof renderAdminStores === 'function') renderAdminStores();
    
  } catch (err) {
    console.error('❌ Erreur:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}
