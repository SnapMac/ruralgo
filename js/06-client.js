// ==========================================
// 👤 FICHIER 06 : FONCTIONS CLIENT
// ==========================================
// Rôle : Commerces, Panier, Commandes, Profil
// ==========================================

console.log("🔄 [06-client.js] Chargement des fonctions client...");

// ==========================================
// 🏪 AFFICHAGE DES COMMERCES (CLIENT)
// ==========================================
async function showClientStores() {
  // 🛡️ Bouclier : si on vient de payer, on ne touche à rien
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('session_id') || urlParams.get('payment_success') === 'true') {
    console.log("🛡️ [BLOQUÉ] showClientStores annulé pour protéger la page de remerciement");
    return;
  }
  
  console.log("🏪 [CLIENT] Affichage de la page commerces...");
  
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  document.getElementById('view-client').style.display = 'block';
  
  document.getElementById('stores-section').style.display = 'block';
  document.getElementById('store-detail-section').style.display = 'none';
  document.getElementById('client-orders-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('client-profile-section').style.display = 'none';
  document.getElementById('client-order-detail-section').style.display = 'none';
  
  saveViewToHistory('view-client');
  await afficherCommerces('stores-grid', 'openStoreDetail');
}

// ==========================================
// 🏪 AFFICHER LES COMMERCES (FONCTION MAÎTRE)
// ==========================================
async function afficherCommerces(idConteneur, actionAuClic) {
  console.log("🏪 Chargement des commerces dans :", idConteneur);
  const container = document.getElementById(idConteneur);
  if (!container) {
    console.error("❌ Conteneur '" + idConteneur + "' introuvable !");
    return;
  }
  
  container.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">⏳ Chargement des commerces...</p>';
  
  try {
    const { data: commerces, error } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    console.log("📊 Nombre de commerces trouvés:", commerces?.length || 0);
    
    if (!commerces || commerces.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding:2rem; color:#666; background:white; border-radius:12px;">🏪 Aucun commerce disponible.</p>';
      return;
    }
    
    container.innerHTML = commerces.map(c => `
      <div onclick="${actionAuClic}('${c.id}')"
        style="background:white; border-radius:12px; padding:1.5rem; border:1px solid #e5e7eb; cursor:pointer; text-align:center; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"
        onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.1)'; this.style.borderColor='#f5a623'"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'; this.style.borderColor='#e5e7eb'">
        <div style="font-size:3rem; margin-bottom:1rem;">${c.icon || '🏪'}</div>
        <h3 style="margin:0 0 0.5rem 0; color:#0a1929; font-size:1.1rem; font-weight:700;">${c.name || 'Sans nom'}</h3>
        <p style="margin:0 0 0.5rem 0; color:#f5a623; font-size:0.85rem; font-weight:600;">${c.type || 'Commerce'}</p>
        <p style="margin:0 0 1rem 0; color:#6b7280; font-size:0.85rem;">📍 ${c.address || 'Adresse non précisée'}</p>
        <div style="padding:0.6rem; background:#0a1929; color:white; border-radius:6px; font-weight:bold; font-size:0.9rem;">
          Voir les produits →
        </div>
      </div>
    `).join('');
    
    console.log(`✅ ${commerces.length} commerces affichés avec succès !`);
  } catch (err) {
    console.error("❌ Erreur afficherCommerces:", err);
    container.innerHTML = '<p style="text-align:center; padding:2rem; color:#ef4444; background:white; border-radius:12px;">❌ Erreur : ' + err.message + '</p>';
  }
}

// ==========================================
// 🏪 DÉTAIL D'UN COMMERCE
// ==========================================
async function openStoreDetail(store_id) {
  const store = stores.find(s => String(s.id) === String(store_id));
  if (!store) {
    showToast('❌ Commerce introuvable');
    return;
  }
  
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('store-detail-section').style.display = 'block';
  
  const { data: storeProducts, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('available', true)
    .order('created_at', { ascending: false });
  
  if (error) console.error("❌ Erreur chargement produits:", error);
  const validProducts = storeProducts || [];
  
  const storeCats = [...new Set(validProducts.map(p => p.category_id))]
    .map(cid => categories.find(c => String(c.id) === String(cid)))
    .filter(Boolean);
  
  let html = `<button class="back-btn" onclick="showClientStores()">← Retour aux commerces</button>`;
  html += `<div class="store-detail-header" style="display:flex; align-items:center; gap:1.5rem; margin-bottom:1.5rem; padding:1rem; background:white; border-radius:12px;">
    <div class="store-detail-icon" style="font-size:4rem;">${store.icon || '🏪'}</div>
    <div class="store-detail-info">
      <h2 style="margin:0; color:#0a1929;">${store.name}</h2>
      <p style="margin:0.3rem 0; color:#666;">${store.type || 'Commerce'} • ${store.address || ''}</p>
      <p style="margin:0.3rem 0; color:#10b981; font-weight:bold;">${validProducts.length} produit(s) disponible(s)</p>
    </div>
  </div>`;
  
  if (storeCats.length > 0) {
    html += `<div class="categories-bar" style="display:flex; gap:0.5rem; overflow-x:auto; padding-bottom:0.5rem; margin-bottom:1rem;">
      <button class="cat-btn active" onclick="filterClientProducts('${store.id}','all',this, window.currentStoreProducts)" style="padding:8px 16px; background:#0a1929; color:white; border:none; border-radius:20px; cursor:pointer;">🏷️ Tout (${validProducts.length})</button>`;
    storeCats.forEach(c => {
      const catCount = validProducts.filter(p => String(p.category_id) === String(c.id)).length;
      html += `<button class="cat-btn" onclick="filterClientProducts('${store.id}','${c.id}',this, window.currentStoreProducts)" style="padding:8px 16px; background:#f3f4f6; color:#374151; border:none; border-radius:20px; cursor:pointer;">${c.icon || '📂'} ${c.name} (${catCount})</button>`;
    });
    html += `</div>`;
  }
  
  html += `<div class="products-grid" id="products-grid-detail" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:1rem;"></div>`;
  
  html += `<div style="margin-top:2rem; text-align:center; padding-bottom: 2rem;">
    <button onclick="showMyCartProperly()" style="background:linear-gradient(135deg, #f5a623 0%, #d48a1b 100%); color:#0a1929; border:none; padding:1rem 2rem; border-radius:10px; font-size:1.1rem; font-weight:700; cursor:pointer;">
      🛒 Voir mon panier et Commander
    </button>
  </div>`;
  
  document.getElementById('store-detail-content').innerHTML = html;
  window.currentStoreProducts = validProducts;
  renderClientProductsGrid(store.id, 'all', validProducts);
  if (typeof updateInlineCartCount === 'function') updateInlineCartCount();
}

function renderClientProductsGrid(store_id, categoryId, allProducts) {
  const grid = document.getElementById('products-grid-detail');
  if (!grid) return;
  
  const filteredProducts = categoryId === 'all' ? allProducts : allProducts.filter(p => String(p.category_id) === String(categoryId));
  
  if (filteredProducts.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#666; padding:2rem; background:white; border-radius:8px;">Aucun produit.</p>';
    return;
  }
  
  grid.innerHTML = filteredProducts.map(p => `
    <div style="background:white; padding:1rem; border-radius:12px; text-align:center; border:1px solid #eee;">
      <div style="font-size:3rem; margin-bottom:0.5rem;">${p.icon || '📦'}</div>
      <h4 style="margin:0 0 0.5rem 0; font-size:1rem; color:#0a1929;">${p.name}</h4>
      <p style="margin:0; color:#10b981; font-weight:bold; font-size:1.2rem;">${parseFloat(p.price).toFixed(2)} $</p>
      <button onclick="addToCart(${p.id})" style="background:#0a1929; color:white; border:none; padding:10px; border-radius:8px; cursor:pointer; font-size:0.9rem; font-weight:bold; margin-top:1rem; width:100%;">
        🛒 Ajouter
      </button>
    </div>
  `).join('');
}

function filterClientProducts(store_id, categoryId, btnElement, allProducts) {
  document.querySelectorAll('.categories-bar .cat-btn').forEach(btn => {
    btn.style.background = '#f3f4f6';
    btn.style.color = '#374151';
  });
  btnElement.style.background = '#0a1929';
  btnElement.style.color = 'white';
  renderClientProductsGrid(store_id, categoryId, allProducts);
}

// ==========================================
// 🛒 PANIER
// ==========================================
function addToCart(prodId) {
  const p = products.find(x => String(x.id) === String(prodId));
  if (!p) return;
  const ex = cart.find(c => String(c.productId) === String(prodId));
  if (ex) ex.qty++;
  else cart.push({ productId: prodId, name: p.name, icon: p.icon, price: p.price, qty: 1 });
  updateCart();
  showToast('✅ ' + p.name + ' ajouté !');
  updateInlineCartCount();
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateInlineCartCount() {
  const countEl = document.getElementById('inline-cart-count');
  if (countEl && cart) {
    const totalQty = cart.reduce((s, c) => s + c.qty, 0);
    countEl.textContent = totalQty;
  }
}

function updateCart() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try { currentUser = JSON.parse(savedUser); } catch (e) {}
  }
  
  const hasValidGPS = currentUser && currentUser.lat && currentUser.lng &&
    !isNaN(parseFloat(currentUser.lat)) && !isNaN(parseFloat(currentUser.lng));
  
  document.getElementById('cart-count').textContent = cart.reduce((s, c) => s + c.qty, 0);
  const el = document.getElementById('cart-items');
  const feeDetails = document.getElementById('delivery-fee-details');
  const settings = platformSettings || {};
  const baseFee = settings.deliveryBaseFee || 7.00;
  const perKm = settings.deliveryPerKm || 1.00;
  const taxRate = settings.taxRate || 0.14975;
  
  if (!cart.length) {
    el.innerHTML = '<p style="text-align:center;color:#666;padding:2rem">Votre panier est vide</p>';
    feeDetails.innerHTML = '';
    document.getElementById('subtotal').textContent = '0.00 $';
    document.getElementById('fee-base').textContent = baseFee.toFixed(2) + ' $';
    document.getElementById('fee-distance-label').textContent = '↳ Distance (0 km × ' + perKm.toFixed(2) + '$)';
    document.getElementById('fee-distance').textContent = '0.00 $';
    document.getElementById('delivery-fee').textContent = baseFee.toFixed(2) + ' $';
    document.getElementById('taxes').textContent = '0.00 $';
    document.getElementById('total').textContent = baseFee.toFixed(2) + ' $';
    return;
  }
  
 // ✅ NOUVELLE VERSION : Avec bouton "Vider le panier"
el.innerHTML = `
  <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;">
    <button onclick="clearCart()" style="background:#ef4444; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-size:0.85rem; font-weight:bold; display:flex; align-items:center; gap:6px;">
      🗑️ Vider le panier
    </button>
  </div>
` + cart.map((c, i) => `
  <div class="cart-item">
    <div style="font-size:2rem">${c.icon}</div>
    <div class="cart-item-info">
      <h4>${c.name}</h4>
      <p style="color:#666">${c.price.toFixed(2)} $</p>
    </div>
    <div class="qty-controls">
      <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
      <span><strong>${c.qty}</strong></span>
      <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
    </div>
    <strong style="min-width:70px;text-align:right">${(c.price * c.qty).toFixed(2)} $</strong>
  </div>
`).join('');

  const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const store = getCurrentStore();
  let deliveryInfo;
  
  if (store && hasValidGPS && store.lat && store.lng) {
    deliveryInfo = calculateDeliveryFee(store.lat, store.lng, parseFloat(currentUser.lat), parseFloat(currentUser.lng));
  } else {
    deliveryInfo = { baseFee: baseFee, distanceKm: 0, perKmFee: 0, totalFee: baseFee };
  }
  
  if (store && hasValidGPS) {
    feeDetails.innerHTML = `
      <div class="delivery-fee-breakdown">
        <h4>🚗 Détail des frais de livraison</h4>
        <div class="delivery-fee-line"><span>🏪 Commerce :</span><strong>${store.name}</strong></div>
        <div class="delivery-fee-line"><span>📍 Distance :</span><strong>${deliveryInfo.distanceKm.toFixed(1)} km</strong></div>
        <div class="delivery-fee-line"><span>💰 Frais de base :</span><span>${deliveryInfo.baseFee.toFixed(2)} $</span></div>
        <div class="delivery-fee-line"><span>📏 ${deliveryInfo.distanceKm.toFixed(1)} km × ${perKm.toFixed(2)} $/km :</span><span>${deliveryInfo.perKmFee.toFixed(2)} $</span></div>
        <div class="delivery-fee-total"><span>TOTAL LIVRAISON :</span><span>${deliveryInfo.totalFee.toFixed(2)} $</span></div>
      </div>`;
  } else {
    feeDetails.innerHTML = `<div class="delivery-fee-breakdown" style="background:#fee2e2;border-color:#dc2626">
      <h4 style="color:#991b1b">⚠️ Adresse de livraison incomplète</h4>
      <p style="font-size:0.85rem;color:#991b1b">Frais de base appliqués : <strong>${baseFee.toFixed(2)} $</strong></p>
    </div>`;
  }
  
  const tax = sub * taxRate;
  const tot = sub + deliveryInfo.totalFee + tax;
  document.getElementById('subtotal').textContent = sub.toFixed(2) + ' $';
  document.getElementById('fee-base').textContent = deliveryInfo.baseFee.toFixed(2) + ' $';
  document.getElementById('fee-distance-label').textContent = `↳ Distance (${deliveryInfo.distanceKm.toFixed(1)} km × ${perKm.toFixed(2)}$)`;
  document.getElementById('fee-distance').textContent = deliveryInfo.perKmFee.toFixed(2) + ' $';
  document.getElementById('delivery-fee').textContent = deliveryInfo.totalFee.toFixed(2) + ' $';
  document.getElementById('taxes').textContent = tax.toFixed(2) + ' $';
  document.getElementById('total').textContent = tot.toFixed(2) + ' $';
}

// ==========================================
// 🗑️ VIDER LE PANIER EN UN CLIC
// ==========================================
function clearCart() {
  if (cart.length === 0) {
    showToast('🛒 Le panier est déjà vide');
    return;
  }
  
  if (!confirm('🗑️ Vider complètement le panier ?')) return;
  
  cart = [];
  localStorage.removeItem('cart');
  updateCart();
  if (typeof updateInlineCartCount === 'function') updateInlineCartCount();
  showToast('✅ Panier vidé !');
}

function changeQty(i, d) {
  cart[i].qty += d;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  updateCart();
}

function scrollToCart() {
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('store-detail-section').style.display = 'none';
  document.getElementById('client-orders-section').style.display = 'none';
  document.getElementById('client-order-detail-section').style.display = 'none';
  document.getElementById('client-profile-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'block';
  setTimeout(() => { 
    document.getElementById('cart-section').scrollIntoView({ behavior: 'smooth' }); 
  }, 100);
}

function showMyCartProperly() {
  console.log("🛒 [PANIER] Activation du mode panier...");
  document.querySelectorAll('.modal-bg').forEach(modal => modal.remove());
  
  const sectionsToHide = ['home-section', 'stores-section', 'store-detail-section', 'store-dashboard-section', 'store-products-section', 'store-categories-section', 'checkout-section', 'client-section'];
  sectionsToHide.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  
  const cartSection = document.getElementById('cart-section');
  if (cartSection) {
    cartSection.style.display = 'block';
    if (typeof updateCart === 'function') updateCart();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 📦 COMMANDES CLIENT
// ==========================================
function showClientOrders() {
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('store-detail-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'block';
  document.getElementById('client-order-detail-section').style.display = 'none';
  document.getElementById('client-profile-section').style.display = 'none';
  document.getElementById('client-orders-section').style.display = 'block';
  renderClientOrders();
}

async function renderClientOrders() {
  const list = document.getElementById('client-orders-list');
  try {
    const { data: ordersData, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('client_id', currentUser.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    orders = ordersData.map(o => ({
      id: o.id, orderNumber: o.order_number, clientId: o.client_id,
      clientName: o.client_name, clientPhone: o.client_phone,
      clientAddress: o.client_address, clientLat: o.client_lat, clientLng: o.client_lng,
      items: o.items || [], subtotal: o.subtotal || 0,
      deliveryBaseFee: o.delivery_base_fee || 7, deliveryDistanceKm: o.delivery_distance_km || 0,
      deliveryPerKmFee: o.delivery_per_km_fee || 0, deliveryFee: o.delivery_fee || 0,
      tax: o.tax || 0, total: o.total || 0, status: o.status,
      driverId: o.driver_id, driverName: o.driver_name,
      store_id: o.store_id, storeName: o.store_name,
      createdAt: o.created_at, statusHistory: o.status_history || []
    }));
    
    if (orders.length === 0) {
      list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><p>Aucune commande</p><button class="btn" style="margin-top:1rem" onclick="showClientStores()">🛍️ Commencer mes achats</button></div>';
      return;
    }
    
    list.innerHTML = orders.map(o => {
      const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
      return `<div class="order-card" onclick="showClientOrderDetail(${o.id})">
        <div class="order-card-header">
          <div><h4>Commande #${o.orderNumber}</h4><p style="color:#666;font-size:0.85rem">${new Date(o.createdAt).toLocaleString('fr-CA')}</p></div>
          <span class="status-badge ${st.class}">${st.label}</span>
        </div>
        <div class="order-card-details">
          <div>🏪 ${o.storeName || 'Commerce'}</div>
          <div>📦 ${o.items.length} article(s)</div>
          <div>💰 <strong>${o.total.toFixed(2)} $</strong></div>
          <div>🚗 Livraison : ${o.deliveryFee.toFixed(2)} $</div>
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    console.error('Erreur:', e);
    list.innerHTML = '<div class="empty-state"><p>Erreur</p></div>';
  }
}

function showClientOrderDetail(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('store-detail-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('client-orders-section').style.display = 'none';
  document.getElementById('client-profile-section').style.display = 'none';
  document.getElementById('client-order-detail-section').style.display = 'block';
  
  const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
  let html = `<button class="back-btn" onclick="showClientOrders()">← Retour</button>`;
  html += `<div class="store-detail-header">
    <div class="store-detail-icon">📦</div>
    <div class="store-detail-info">
      <h2>Commande #${order.orderNumber}</h2>
      <p>${new Date(order.createdAt).toLocaleString('fr-CA')}</p>
      <p><span class="status-badge ${st.class}">${st.label}</span></p>
    </div>
  </div>`;
  
  html += `<div class="profile-section">
    <h3 style="color:#0a1929;margin-bottom:1rem">💰 Facturation</h3>
    <div class="delivery-fee-breakdown">
      <div class="delivery-fee-line"><span>Sous-total</span><span>${order.subtotal.toFixed(2)} $</span></div>
      <div class="delivery-fee-line"><span>Livraison</span><span>${order.deliveryFee.toFixed(2)} $</span></div>
      <div class="delivery-fee-line"><span>Taxes</span><span>${order.tax.toFixed(2)} $</span></div>
      <div class="delivery-fee-total"><span>Total</span><span>${order.total.toFixed(2)} $</span></div>
    </div>
  </div>`;
  
  html += `<div class="profile-section">
    <h3 style="color:#0a1929;margin-bottom:1rem">🛒 Articles</h3>`;
  order.items.forEach(item => {
    html += `<div style="display:flex;align-items:center;gap:1rem;padding:0.8rem;border-bottom:1px solid #eee">
      <div style="font-size:2rem">${item.icon}</div>
      <div style="flex:1"><strong>${item.name}</strong><br><span style="color:#666;font-size:0.85rem">Qté: ${item.qty} × ${item.price.toFixed(2)}$</span></div>
      <strong style="color:#0a1929">${(item.qty * item.price).toFixed(2)} $</strong>
    </div>`;
  });
  html += `</div>`;
  
  if (order.status === 'pending' || order.status === 'confirmed') {
    html += `<button class="btn" style="background:#dc2626;width:100%;margin-top:1rem" onclick="cancelOrder(${order.id})">❌ Annuler la commande</button>`;
  }
  
  document.getElementById('client-order-detail-content').innerHTML = html;
}

// ==========================================
// 💳 PASSER UNE COMMANDE (BUG CORRIGÉ !)
// ==========================================
async function placeOrder() {
  console.log("💳 [COMMANDE] Début du processus...");
  
  if (!currentUser || !currentUser.id) {
    showToast('🔑 Veuillez vous connecter');
    openLoginModal();
    return;
  }
  if (!cart || cart.length === 0) {
    showToast('🛒 Votre panier est vide');
    return;
  }
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = parseFloat(document.getElementById('delivery-fee')?.textContent) || 7.00;
  const taxes = parseFloat(document.getElementById('taxes')?.textContent) || 0;
  const total = subtotal + deliveryFee + taxes;
  
  // Récupérer l'ID du commerce
  let storeId = null;
  if (cart[0] && cart[0].productId) {
    const firstProduct = products.find(p => String(p.id) === String(cart[0].productId));
    if (firstProduct) storeId = firstProduct.store_id;
  }
  const store = stores.find(s => String(s.id) === String(storeId));
  const storeName = store ? store.name : 'Commerce';
  
  // Calculer les frais détaillés
  const deliveryBaseFee = platformSettings.deliveryBaseFee || 7.00;
  const deliveryPerKm = platformSettings.deliveryPerKm || 1.00;
  let deliveryDistanceKm = 0;
  if (store && store.lat && store.lng && currentUser.lat && currentUser.lng) {
    deliveryDistanceKm = calculateDistance(store.lat, store.lng, parseFloat(currentUser.lat), parseFloat(currentUser.lng)) || 0;
  }
  const deliveryPerKmFee = deliveryDistanceKm * deliveryPerKm;
  
  console.log(`💰 Total: ${total.toFixed(2)}$ | Commerce ID: ${storeId}`);
  
  try {
    // Vérification du wallet
    let currentBalance = 0;
    let walletExists = false;
    try {
      const { data: profile, error } = await supabaseClient
        .from('profiles').select('wallet_balance')
        .eq('id', currentUser.id).single();
      if (!error && profile && profile.wallet_balance !== undefined) {
        walletExists = true;
        currentBalance = parseFloat(profile.wallet_balance) || 0;
        if (currentBalance < total) {
          showToast(`❌ Solde insuffisant ! (${currentBalance.toFixed(2)}$ < ${total.toFixed(2)}$)`);
          if (typeof openDepositModal === 'function') openDepositModal();
          return;
        }
      }
    } catch (walletCheckErr) {
      console.warn("⚠️ Vérification wallet ignorée:", walletCheckErr.message);
    }
    
    if (!confirm(`Confirmer la commande de ${total.toFixed(2)}$ ?`)) return;
    
    // 🔥 CORRECTION DU BUG : Création de orderData AVANT l'insert
        // On force la récupération de l'adresse du client
    const finalAddress = currentUser.address || "Adresse non spécifiée";
    const finalLat = currentUser.lat ? parseFloat(currentUser.lat) : null;
    const finalLng = currentUser.lng ? parseFloat(currentUser.lng) : null;
    const orderData = {
      order_number: 'RG-' + Date.now().toString().slice(-8),
      client_id: currentUser.id,
      client_name: currentUser.name,
      client_phone: currentUser.phone || '',
      client_address: finalAddress,
      client_lat: finalLat,
      client_lng: finalLng,
      store_id: storeId,
      store_name: storeName,
      items: cart,
      subtotal: subtotal,
      delivery_base_fee: deliveryBaseFee,
      delivery_distance_km: deliveryDistanceKm,
      delivery_per_km_fee: deliveryPerKmFee,
      delivery_fee: deliveryFee,
      tax: taxes,
      total: total,
      status: 'pending',
      status_history: [{ status: 'pending', time: new Date().toISOString(), note: 'Commande créée' }]
    };
    
    const { data: newOrder, error: orderError } = await supabaseClient
      .from('orders').insert([orderData]).select().single();
    
    if (orderError) {
      console.error("❌ Erreur création commande:", orderError);
      showToast('❌ Erreur : ' + orderError.message);
      return;
    }
    
    console.log("✅ Commande créée avec succès :", newOrder.id);
    
    // Déduire le wallet
    if (walletExists) {
      const newBalance = currentBalance - total;
      const { error: updateError } = await supabaseClient
        .from('profiles').update({ wallet_balance: newBalance })
        .eq('id', currentUser.id);
      if (!updateError) {
        currentUser.wallet_balance = newBalance;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        const walletEl = document.getElementById('wallet-balance');
        if (walletEl) walletEl.textContent = newBalance.toFixed(2);
      }
    }
    
    cart = [];
    localStorage.removeItem('cart');
    if (typeof updateCart === 'function') updateCart();
    
    showToast(`✅ Commande #${String(newOrder.id).substring(0, 8)} confirmée !`);
    
    if (typeof showNotification === 'function' && storeId) {
      showNotification('Nouvelle commande', `Nouvelle commande de ${total.toFixed(2)}$`, 'info', storeId);
    }
    
    setTimeout(() => {
      if (typeof showClientOrders === 'function') showClientOrders();
    }, 1500);
  } catch (err) {
    console.error("❌ Erreur globale placeOrder:", err);
    showToast('❌ Une erreur est survenue : ' + err.message);
  }
}

async function cancelOrder(orderId) {
  if (!confirm('Voulez-vous vraiment annuler cette commande ?')) return;
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  try {
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', time: new Date().toISOString(), note: 'Annulée par le client' });
    await supabaseClient.from('orders').update({
      status: 'cancelled', status_history: order.statusHistory
    }).eq('id', orderId);
    showToast('❌ Commande annulée');
    showClientOrders();
  } catch (err) {
    showToast('❌ Erreur');
  }
}

// ==========================================
// 👤 PROFIL CLIENT
// ==========================================
function showProfiles() {
  if (!currentUser) return;
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('store-detail-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('client-orders-section').style.display = 'none';
  document.getElementById('client-order-detail-section').style.display = 'none';
  document.getElementById('client-profile-section').style.display = 'block';
  renderProfiles();
}

function renderProfiles() {
  const content = document.getElementById('client-profile-content');
  const myOrders = orders.filter(o => o.clientId === currentUser.id);
  const totalSpent = myOrders.reduce((s, o) => s + o.total, 0);
  
  let html = `<div class="profile-section">
    <div class="profile-header">
      <div class="profile-avatar">${currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
      <div class="profile-info">
        <h2>${currentUser.name}</h2>
        <p>${currentUser.role === 'client' ? '👤 Client' : currentUser.role}</p>
      </div>
    </div>
    <div class="profile-grid">
      <div class="profile-field"><label>📧 Email</label><div class="value">${currentUser.email}</div></div>
      <div class="profile-field"><label>📞 Téléphone</label><div class="value">${currentUser.phone}</div></div>
      <div class="profile-field" style="grid-column:1/-1"><label>📍 Adresse</label><div class="value">${currentUser.address}</div></div>
    </div>
    <button class="btn" style="margin-top:1rem" onclick="openEditProfileModal()">✏️ Modifier mon profil</button>
  </div>`;
  
  if (currentUser.role === 'client') {
    html += `<div class="stats">
      <div class="stat"><div class="stat-val">${myOrders.length}</div><div class="stat-lbl">Commandes</div></div>
      <div class="stat"><div class="stat-val">${totalSpent.toFixed(2)} $</div><div class="stat-lbl">Total dépensé</div></div>
    </div>`;
  }
  content.innerHTML = html;
}

function openEditProfileModal() {
  if (!currentUser || !currentUser.id) {
    showToast('🔑 Veuillez vous connecter');
    return;
  }
  
  let modal = document.getElementById('edit-profile-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-profile-modal';
    modal.className = 'modal-bg';
    modal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;';
    modal.innerHTML = `
      <div class="modal" style="background:white; padding:2rem; border-radius:12px; width:90%; max-width:500px; position:relative;">
        <button onclick="closeModal('edit-profile-modal')" style="position:absolute; top:1rem; right:1rem; background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
        <h2 style="margin-bottom:1.5rem; color:#0a1929;">✏️ Modifier mon profil</h2>
        <form onsubmit="saveProfile(event)">
          <div class="form-group">
            <label>Nom complet</label>
            <input type="text" id="ep-name" required style="width:100%; padding:0.6rem; border:1px solid #ddd; border-radius:6px;">
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input type="tel" id="ep-phone" required style="width:100%; padding:0.6rem; border:1px solid #ddd; border-radius:6px;">
          </div>
          <div class="form-group">
            <label>Adresse</label>
            <input type="text" id="ep-address" style="width:100%; padding:0.6rem; border:1px solid #ddd; border-radius:6px;">
          </div>
          <div class="modal-actions" style="display:flex; gap:0.5rem; justify-content:flex-end; margin-top:1.5rem;">
            <button type="button" class="btn-sm btn-gray" onclick="closeModal('edit-profile-modal')">Annuler</button>
            <button type="submit" class="btn-sm btn-green">💾 Enregistrer</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  document.getElementById('ep-name').value = currentUser.name || '';
  document.getElementById('ep-phone').value = currentUser.phone || '';
  document.getElementById('ep-address').value = currentUser.address || '';
  modal.style.display = 'flex';
}

// ==========================================
// 💾 SAUVEGARDE DU PROFIL CLIENT (avec géocodage automatique)
// ==========================================
// ==========================================
// 💾 SAUVEGARDE DU PROFIL CLIENT (avec géocodage automatique)
// ==========================================
// ==========================================
// 💾 SAUVEGARDE DU PROFIL CLIENT (VERSION INFAILLIBLE)
// ==========================================
async function saveProfile(e) {
  if (e) e.preventDefault();
  if (!currentUser || !currentUser.id) { showToast('❌ Vous devez être connecté.'); return; }
  
  const nameField = document.getElementById('ep-name');
  const phoneField = document.getElementById('ep-phone');
  const addrField = document.getElementById('ep-address');
  
  const newName = nameField?.value.trim() || currentUser.name;
  const newPhone = phoneField?.value.trim() || currentUser.phone;
  const newAddress = addrField?.value.trim() || currentUser.address;
  
  let newLat = addrField?._lat || null;
  let newLng = addrField?._lng || null;
  
  // 🔥 SI PAS DE GPS, ON DEMANDE À MAPBOX DE LES TROUVER
  if ((!newLat || !newLng) && newAddress && newAddress.length > 5) {
    showToast('🔍 Localisation précise de votre adresse...');
    const coords = await geocodeAddressMapbox(newAddress);
    if (coords) {
      newLat = coords.lat;
      newLng = coords.lng;
      if (addrField) { addrField._lat = newLat; addrField._lng = newLng; }
      showToast('✅ Adresse localisée avec précision !');
    } else {
      showToast('⚠️ Adresse introuvable sur la carte. Tarif de base (7$) appliqué.');
    }
  }
  
  const updateData = { name: newName, phone: newPhone, address: newAddress };
  if (newLat && newLng && !isNaN(newLat) && !isNaN(newLng)) {
    updateData.lat = parseFloat(newLat);
    updateData.lng = parseFloat(newLng);
  }
  
  try {
    const { error } = await supabaseClient.from('profiles').update(updateData).eq('id', currentUser.id);
    if (error) throw error;
    
    currentUser.name = newName; 
    currentUser.phone = newPhone; 
    currentUser.address = newAddress;
    if (updateData.lat) currentUser.lat = parseFloat(updateData.lat);
    if (updateData.lng) currentUser.lng = parseFloat(updateData.lng);
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeModal('edit-profile-modal');
    showToast('✅ Profil sauvegardé !');
    
    if (typeof updateCart === 'function') updateCart();
    if (typeof updateDeliveryAddress === 'function') updateDeliveryAddress();
  } catch (err) {
    console.error("❌ Erreur sauvegarde:", err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 🔍 RECHERCHE GLOBALE
// ==========================================
let searchTimeout;
function handleSearch(query) {
  clearTimeout(searchTimeout);
  const suggestionsDiv = document.getElementById('search-suggestions');
  if (!suggestionsDiv) return;
  if (!query || query.length < 2) {
    suggestionsDiv.style.display = 'none';
    return;
  }
  searchTimeout = setTimeout(() => {
    performSearch(query.toLowerCase());
  }, 300);
}

async function performSearch(query) {
  const suggestionsDiv = document.getElementById('search-suggestions');
  if (!suggestionsDiv) return;
  let results = [];
  
  if (typeof products !== 'undefined' && Array.isArray(products)) {
    const matchingProducts = products.filter(p =>
      p.available && (p.name.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query)))
    ).slice(0, 5);
    matchingProducts.forEach(p => {
      const store = stores.find(s => String(s.id) === String(p.store_id));
      results.push({
        type: 'product', id: p.id, store_id: p.store_id,
        icon: '🛍️', title: p.name,
        subtitle: `${store ? store.name : 'Commerce'} • ${p.price} $`
      });
    });
  }
  
  if (typeof stores !== 'undefined' && Array.isArray(stores)) {
    const matchingStores = stores.filter(s =>
      s.name.toLowerCase().includes(query) || (s.type && s.type.toLowerCase().includes(query))
    ).slice(0, 3);
    matchingStores.forEach(s => {
      results.push({
        type: 'store', id: s.id, icon: s.icon || '🏪',
        title: s.name, subtitle: s.type || 'Commerce'
      });
    });
  }
  
  if (results.length === 0) {
    suggestionsDiv.innerHTML = '<div style="text-align:center; color:#999; padding:1rem;">Aucun résultat</div>';
  } else {
    suggestionsDiv.innerHTML = results.map(r => `
      <div style="padding:0.8rem; cursor:pointer; border-bottom:1px solid #eee; display:flex; align-items:center; gap:1rem;"
           onclick="handleSearchClick('${r.type}', '${r.id}', '${r.store_id || ''}')">
        <div style="font-size:1.5rem;">${r.icon}</div>
        <div style="flex:1;">
          <div style="font-weight:bold; color:#0a1929;">${r.title}</div>
          <div style="font-size:0.85rem; color:#666;">${r.subtitle}</div>
        </div>
      </div>
    `).join('');
  }
  suggestionsDiv.style.display = 'block';
}

function handleSearchClick(type, id, store_id) {
  const suggestionsDiv = document.getElementById('search-suggestions');
  if (suggestionsDiv) suggestionsDiv.style.display = 'none';
  const searchInput = document.getElementById('global-search');
  if (searchInput) searchInput.value = '';
  
  if (type === 'product') {
    if (typeof openStoreDetail === 'function') openStoreDetail(store_id);
  } else if (type === 'store') {
    if (typeof openStoreDetail === 'function') openStoreDetail(id);
  }
}

// ==========================================
// ✅ FIN DU CHARGEMENT
// ==========================================
// ==========================================
// 🏪 AFFICHAGE DES COMMERCES SUR LA LANDING PAGE
// ==========================================
// ==========================================
// 🏪 AFFICHAGE DES COMMERCES SUR LA LANDING PAGE
// ==========================================
// ✅ NOUVEAU : Filtre par forfait (Croissance + Partenaire Plus)
// ✅ NOUVEAU : Même design que la page "Commerces"
// ==========================================
function renderLandingStores() {
  const g = document.getElementById('landing-stores-grid');
  if (!g) return;
  
  // 🔥 FILTRE : Seulement les commerces Croissance (3) et Partenaire Plus (4)
  const activeStores = stores.filter(s => 
    s.status === 'active' && 
    (s.forfait === 3 || s.forfait === 4 || s.forfait === '3' || s.forfait === '4')
  );
  
  if (activeStores.length === 0) {
    g.innerHTML = '<p style="text-align:center; color:#666; grid-column:1/-1; padding:2rem; background:white; border-radius:12px;">🏪 Aucun commerce partenaire disponible pour le moment.</p>';
    return;
  }
  
  // 🔥 MÊME DESIGN que la page "Commerces" (cartes avec hover)
  g.innerHTML = activeStores.map(s => {
    const count = products.filter(p => String(p.store_id) === String(s.id) && p.available).length;
    
    // Badge selon le forfait
    const badge = s.forfait === 4 || s.forfait === '4' 
      ? '<span style="position:absolute; top:10px; right:10px; background:#f5a623; color:#0a1929; font-size:0.7rem; padding:4px 10px; border-radius:20px; font-weight:bold; box-shadow:0 2px 8px rgba(245,166,35,0.3);">👑 PREMIUM</span>'
      : '<span style="position:absolute; top:10px; right:10px; background:#0a1929; color:white; font-size:0.7rem; padding:4px 10px; border-radius:20px; font-weight:bold; box-shadow:0 2px 8px rgba(10,25,41,0.3);">🚀 CROISSANCE</span>';
    
    return `
      <div onclick="openStoreFromLanding('${s.id}')" 
        style="background:white; border-radius:12px; padding:1.5rem; border:1px solid #e5e7eb; cursor:pointer; text-align:center; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.05); position:relative; overflow:hidden;"
        onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.1)'; this.style.borderColor='#f5a623'"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'; this.style.borderColor='#e5e7eb'">
        ${badge}
        <div style="font-size:3rem; margin-bottom:1rem;">${s.icon || '🏪'}</div>
        <h3 style="margin:0 0 0.5rem 0; color:#0a1929; font-size:1.1rem; font-weight:700;">${s.name}</h3>
        <p style="margin:0 0 0.5rem 0; color:#f5a623; font-size:0.85rem; font-weight:600;">${s.type || 'Commerce'}</p>
        <p style="margin:0 0 1rem 0; color:#6b7280; font-size:0.85rem;">📍 ${s.address || 'Adresse non précisée'}</p>
        <p style="color:#0a1929; font-size:0.85rem; margin-top:0.5rem; font-weight:bold;">📦 ${count} produit(s)</p>
        <div style="padding:0.6rem; background:#0a1929; color:white; border-radius:6px; font-weight:bold; font-size:0.9rem; margin-top:1rem;">
          Voir les produits →
        </div>
      </div>
    `;
  }).join('');
  
  console.log(`✅ [LANDING] ${activeStores.length} commerces partenaires affichés (Croissance + Premium)`);
}

function openStoreFromLanding(store_id) {
  if (!currentUser) {
    showToast('🔑 Connectez-vous pour voir les commerces');
    setTimeout(() => openChooseTypeModal(), 1000);
    return;
  }
  openStoreDetail(store_id);
}

function openStoreFromLanding(store_id) {
  if (!currentUser) {
    showToast('🔑 Connectez-vous pour voir les commerces');
    setTimeout(() => openChooseTypeModal(), 1000);
    return;
  }
  openStoreDetail(store_id);
}
console.log("✅ [06-client.js] Fonctions client chargées !");