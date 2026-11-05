// ==========================================
// 🚗 FICHIER 08 : DASHBOARD LIVREUR
// ==========================================
// Rôle : Gestion des livraisons, commandes, gains
// ==========================================

console.log("🔄 [08-driver.js] Chargement du dashboard livreur...");

// ==========================================
// 🚗 AFFICHAGE DU DASHBOARD LIVREUR
// ==========================================
async function showDriverDashboard() {
  console.log("🚗 [LIVREUR] Affichage du dashboard...");
  
  if (!currentUser || (currentUser.role !== 'driver' && currentUser.role !== 'livreur')) {
    console.warn("⚠️ Pas un livreur");
    return;
  }
  
  switchView('view-driver');
  document.getElementById('driver-dashboard-section').style.display = 'block';
  document.getElementById('driver-order-detail-section').style.display = 'none';
  document.getElementById('driver-history-section').style.display = 'none';
  
  // Charger les derniers paramètres depuis Supabase
  if (typeof loadPlatformSettings === 'function') {
    await loadPlatformSettings();
  }
  
  await renderDriverDashboard();
}

// ==========================================
// 📊 RENDU DU DASHBOARD LIVREUR
// ==========================================
async function renderDriverDashboard() {
  console.log("📊 [LIVREUR] Rendu du dashboard...");
  
  const today = new Date().toDateString();
  
  // Récupérer toutes les commandes du livreur
  const { data: myOrdersData, error } = await supabaseClient
    .from('orders')
    .select('*')
    .eq('driver_id', currentUser.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("❌ Erreur chargement commandes:", error);
    return;
  }
  
  const myOrders = myOrdersData || [];
  const todayOrders = myOrders.filter(o => new Date(o.created_at).toDateString() === today);
  const todayEarnings = todayOrders
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + (o.delivery_fee * platformSettings.driverCommission), 0);
  
  // Mettre à jour les stats
  document.getElementById('d-deliveries').textContent = todayOrders.length;
  document.getElementById('d-earnings').textContent = todayEarnings.toFixed(2) + ' $';
  document.getElementById('d-total').textContent = myOrders.filter(o => o.status === 'delivered').length;
  
  // Commandes disponibles (à accepter)
  const available = myOrders.filter(o => 
    o.status === 'pending' || 
    o.status === 'confirmed' || 
    o.status === 'searching_driver'
  );
  
  const availDiv = document.getElementById('driver-available-orders');
  if (available.length === 0) {
    availDiv.innerHTML = '<div class="empty-state"><p>🎉 Aucune commande disponible</p></div>';
  } else {
    availDiv.innerHTML = available.map(o => {
      const earning = (o.delivery_fee * platformSettings.driverCommission).toFixed(2);
      const dist = (o.delivery_distance_km || 0).toFixed(1);
      return `<div class="driver-order">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">
          <div><h4>Commande #${o.order_number}</h4><p style="color:#666">${o.store_name || 'Commerce'}</p></div>
          <span style="background:#f5f1e8;padding:0.3rem 0.8rem;border-radius:20px;color:#0a1929;font-weight:bold">+ ${earning} $</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin:1rem 0;font-size:0.9rem">
          <div>📦 ${o.items?.length || 0} article(s)</div>
          <div>💰 Total : ${o.total.toFixed(2)} $</div>
          <div>📍 ${dist} km</div>
          <div>🚗 Livraison : ${o.delivery_fee.toFixed(2)} $</div>
        </div>
        <div class="driver-actions">
          <button class="btn-sm btn-green" onclick="acceptDriverOrder('${o.id}')">✅ Accepter</button>
          <button class="btn-sm btn-blue" onclick="showDriverOrderDetail('${o.id}')">👁️ Détails</button>
        </div>
      </div>`;
    }).join('');
  }
  
  // Commandes actives (en cours)
  const active = myOrders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const activeDiv = document.getElementById('driver-active-orders');
  
  if (active.length === 0) {
    activeDiv.innerHTML = '<div class="empty-state"><p>Aucune livraison en cours</p></div>';
  } else {
    activeDiv.innerHTML = active.map(o => {
      const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
      return `<div class="driver-order" style="border-color:#f5a623">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">
          <div><h4>Commande #${o.order_number}</h4><p style="color:#666">${o.client_name} • ${o.store_name}</p></div>
          <span class="status-badge ${st.class}">${st.label}</span>
        </div>
        <div class="driver-actions">
          <button class="btn-sm btn-blue" onclick="showDriverOrderDetail('${o.id}')">👁️ Détails</button>
          ${getNextActionButtons(o)}
        </div>
      </div>`;
    }).join('');
  }
}

// ==========================================
// 🎯 BOUTONS D'ACTION SELON LE STATUT
// ==========================================
function getNextActionButtons(order) {
  const actions = {
    'driver_assigned': `<button class="btn-sm btn-orange" onclick="updateOrderStatus('${order.id}','driver_to_store')">🛣️ En route</button>`,
    'driver_to_store': `<button class="btn-sm btn-orange" onclick="updateOrderStatus('${order.id}','at_store')">🏪 Arrivé</button>`,
    'at_store': `<button class="btn-sm btn-green" onclick="updateOrderStatus('${order.id}','picked_up')">📦 Récupérée</button>`,
    'picked_up': `<button class="btn-sm btn-orange" onclick="updateOrderStatus('${order.id}','driver_to_client')">🚗 En route client</button>`,
    'driver_to_client': `<button class="btn-sm btn-green" onclick="updateOrderStatus('${order.id}','delivered')">🏠 Livrée</button>`
  };
  return actions[order.status] || '';
}

// ==========================================
// ✅ ACCEPTER UNE COMMANDE
// ==========================================
async function acceptDriverOrder(orderId) {
  console.log("✅ [LIVREUR] Acceptation commande:", orderId);
  
  try {
    const { data: order, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) throw error;
    
    const history = order.status_history || [];
    history.push({ 
      status: 'driver_assigned', 
      time: new Date().toISOString(), 
      note: `Acceptée par ${currentUser.name}` 
    });
    
    await supabaseClient
      .from('orders')
      .update({
        driver_id: currentUser.id,
        driver_name: currentUser.name,
        status: 'driver_assigned',
        status_history: history
      })
      .eq('id', orderId);
    
    // Notifier le client
    if (order.client_id) {
      await showNotification(
        '🚗 Livreur assigné', 
        `${currentUser.name} s'occupe de votre commande ${order.order_number}`, 
        'delivery', 
        order.client_id
      );
    }
    
    // Notifier l'admin
    await showNotification(
      '🚗 Commande assignée', 
      `${order.order_number} → ${currentUser.name}`, 
      'info', 
      'admin'
    );
    
    showToast('✅ Commande acceptée !');
    await renderDriverDashboard();
  } catch (err) {
    console.error('❌ Erreur acceptation:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 🔄 METTRE À JOUR LE STATUT D'UNE COMMANDE
// ==========================================
async function updateOrderStatus(orderId, newStatus) {
  console.log("🔄 [LIVREUR] Mise à jour statut:", newStatus);
  
  try {
    const { data: order, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) throw error;
    
    const history = order.status_history || [];
    history.push({ 
      status: newStatus, 
      time: new Date().toISOString(), 
      note: `Mis à jour par ${currentUser.name}` 
    });
    
    const updateData = {
      status: newStatus,
      status_history: history
    };
    
    // Si livrée, ajouter la date de livraison
    if (newStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }
    
    await supabaseClient
      .from('orders')
      .update(updateData)
      .eq('id', orderId);
    
    // Messages de notification selon le statut
    const messages = {
      'driver_to_store': '🛣️ Le livreur est en route vers le commerce',
      'at_store': '🏪 Le livreur est arrivé au commerce',
      'picked_up': '📦 Votre commande a été récupérée',
      'driver_to_client': '🚗 Le livreur est en route vers vous',
      'delivered': '🏠 Votre commande a été livrée avec succès !'
    };
    
    // Notifier le client
    if (order.client_id) {
      await showNotification(
        'Mise à jour commande', 
        messages[newStatus] || 'Statut mis à jour', 
        'delivery', 
        order.client_id
      );
    }
    
    // Si livrée, notifier l'admin
    if (newStatus === 'delivered') {
      await showNotification(
        'Commande livrée', 
        `La commande ${order.order_number} a été livrée par ${currentUser.name}`, 
        'success', 
        'admin'
      );
    }
    
    showToast('✅ Statut mis à jour');
    await renderDriverDashboard();
  } catch (err) {
    console.error('❌ Erreur updateOrderStatus:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 👁️ DÉTAIL D'UNE COMMANDE LIVREUR
// ==========================================
async function showDriverOrderDetail(orderId) {
  console.log("👁️ [LIVREUR] Détail commande:", orderId);
  
  try {
    const { data: order, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) throw error;
    
    switchView('view-driver');
    document.getElementById('driver-dashboard-section').style.display = 'none';
    document.getElementById('driver-history-section').style.display = 'none';
    document.getElementById('driver-order-detail-section').style.display = 'block';
    
    const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
    
    // Récupérer le commerce
    const { data: store } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('id', order.store_id)
      .single();
    
    let html = `<button class="back-btn" onclick="showDriverDashboard()">← Retour</button>`;
    html += `<div class="store-detail-header">
      <div class="store-detail-icon">📦</div>
      <div class="store-detail-info">
        <h2>Commande #${order.order_number}</h2>
        <p>Client : ${order.client_name}</p>
        <p><span class="status-badge ${st.class}">${st.label}</span></p>
      </div>
    </div>`;
    
    // Infos client
    html += `<div class="profile-section">
      <h3 style="color:#0a1929;margin-bottom:1rem">👤 Client</h3>
      <div class="profile-grid">
        <div class="profile-field"><label>Nom</label><div class="value">${order.client_name}</div></div>
        <div class="profile-field"><label>Téléphone</label><div class="value"><a href="tel:${order.client_phone}" style="color:#0a1929">${order.client_phone}</a></div></div>
        <div class="profile-field" style="grid-column:1/-1"><label>📍 Adresse</label><div class="value">${order.client_address}</div></div>
      </div>
      <button class="btn" style="margin-top:1rem;background:#2563eb" onclick="window.open('https://www.google.com/maps/dir/${store?.lat || MANIWAKI_CENTER[0]},${store?.lng || MANIWAKI_CENTER[1]}/${order.client_lat || MANIWAKI_CENTER[0]},${order.client_lng || MANIWAKI_CENTER[1]}','_blank')">🧭 Naviguer</button>
    </div>`;
    
    // Gains
    const commission = (order.delivery_fee * platformSettings.driverCommission).toFixed(2);
    html += `<div class="profile-section">
      <h3 style="color:#0a1929;margin-bottom:1rem">💰 Vos gains</h3>
      <div class="delivery-fee-breakdown">
        <div class="delivery-fee-line"><span>Frais de livraison :</span><span>${order.delivery_fee.toFixed(2)} $</span></div>
        <div class="delivery-fee-total"><span>Votre commission (${(platformSettings.driverCommission * 100).toFixed(0)}%) :</span><span>${commission} $</span></div>
      </div>
    </div>`;
    
    // Articles
    html += `<div class="profile-section">
      <h3 style="color:#0a1929;margin-bottom:1rem">🛒 Articles</h3>`;
    
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        html += `<div style="display:flex;align-items:center;gap:1rem;padding:0.8rem;border-bottom:1px solid #eee">
          <div style="font-size:2rem">${item.icon}</div>
          <div style="flex:1"><strong>${item.name}</strong><br><span style="color:#666;font-size:0.85rem">Quantité : ${item.qty}</span></div>
        </div>`;
      });
    }
    html += `</div>`;
    
    // Bouton d'action suivant
    const nextBtn = getNextActionButtons(order);
    if (nextBtn) html += `<div style="margin-top:1rem">${nextBtn}</div>`;
    
    document.getElementById('driver-order-detail-content').innerHTML = html;
  } catch (err) {
    console.error('❌ Erreur:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 📜 HISTORIQUE DES LIVRAISONS
// ==========================================
async function showDriverHistory() {
  console.log("📜 [LIVREUR] Affichage historique...");
  
  switchView('view-driver');
  document.getElementById('driver-dashboard-section').style.display = 'none';
  document.getElementById('driver-order-detail-section').style.display = 'none';
  document.getElementById('driver-history-section').style.display = 'block';
  
  try {
    const { data: myOrders, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('driver_id', currentUser.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const completed = (myOrders || []).filter(o => o.status === 'delivered');
    const totalEarnings = completed.reduce((s, o) => 
      s + (o.delivery_fee * platformSettings.driverCommission), 0
    );
    
    document.getElementById('d-history-total').textContent = completed.length;
    document.getElementById('d-history-earnings').textContent = totalEarnings.toFixed(2) + ' $';
    
    const list = document.getElementById('driver-history-list');
    
    if (myOrders.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>Aucune livraison</p></div>';
      return;
    }
    
    list.innerHTML = myOrders.map(o => {
      const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
      const earning = o.status === 'delivered' 
        ? (o.delivery_fee * platformSettings.driverCommission).toFixed(2) + ' $' 
        : '-';
      
      return `<div class="order-card">
        <div class="order-card-header">
          <div><h4>#${o.order_number}</h4><p style="color:#666;font-size:0.85rem">${new Date(o.created_at).toLocaleString('fr-CA')}</p></div>
          <span class="status-badge ${st.class}">${st.label}</span>
        </div>
        <div class="order-card-details">
          <div>👤 ${o.client_name}</div>
          <div>🏪 ${o.store_name}</div>
          <div>💰 Total : ${o.total.toFixed(2)} $</div>
          <div>💵 Gain : ${earning}</div>
        </div>
      </div>`;
    }).join('');
  } catch (err) {
    console.error('❌ Erreur:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// ✅ FIN DU CHARGEMENT
// ==========================================
console.log("✅ [08-driver.js] Dashboard livreur chargé !");