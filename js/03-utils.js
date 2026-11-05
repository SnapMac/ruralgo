// ==========================================
// 🛠️ FICHIER 03 : FONCTIONS UTILITAIRES
// ==========================================
// Rôle : Fonctions réutilisables partout
// ==========================================

console.log("🔄 [03-utils.js] Chargement des utilitaires...");

// ==========================================
// 🔔 TOAST (MESSAGE POPUP)
// ==========================================
// ✅ NOUVELLE VERSION : Toast + Notification automatique
function showToast(message, type = 'info', createNotification = true) {
  // 1. Afficher le toast visuel
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = 'toast show';
    setTimeout(() => {
      toast.className = toast.className.replace('show', '');
    }, 3000);
  }
  
  // 2. Créer automatiquement une notification dans la cloche
  if (createNotification && currentUser && currentUser.id) {
    // Filtrer les messages qui ne doivent pas créer de notifications
    const skipMessages = [
      '⏳', // Messages de chargement
      '🔄', // Messages de synchronisation
      '✅ [', // Messages système internes
      '🔍 [DEBUG', // Messages de debug
    ];
    
    const shouldSkip = skipMessages.some(skip => message.startsWith(skip));
    
    if (!shouldSkip) {
      // Déterminer le type de notification selon le message
      let notifType = 'info';
      if (message.includes('✅') || message.includes('succès')) notifType = 'success';
      else if (message.includes('❌') || message.includes('erreur')) notifType = 'error';
      else if (message.includes('⚠️')) notifType = 'warning';
      else if (message.includes('📦') || message.includes('commande')) notifType = 'order';
      else if (message.includes('🚗') || message.includes('livraison')) notifType = 'delivery';
      
      // Créer la notification (sans attendre, pour ne pas bloquer l'UI)
      if (typeof showNotification === 'function') {
        showNotification(
          'Notification', // Titre générique
          message, // Le message du toast
          notifType,
          currentUser.id
        ).catch(err => {
          console.warn('⚠️ Erreur création notification:', err.message);
        });
      }
    }
  }
}

// ==========================================
// 🪟 GESTION DES MODALES
// ==========================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('show');
  }
}

function closeModal(modalId) {
  console.log("❌ [MODAL] Fermeture :", modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
  }
}

// Fermer la modale si on clique en dehors
document.querySelectorAll('.modal-bg').forEach(m => {
  m.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('show');
  });
});

// ==========================================
// 🔄 CHANGEMENT DE VUE
// ==========================================
function switchView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 📏 CALCUL DE DISTANCE (Formule Haversine)
// ==========================================
function calculateDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ==========================================
// 💰 CALCUL DES FRAIS DE LIVRAISON
// ==========================================
function calculateDeliveryFee(storeLat, storeLng, clientLat, clientLng) {
  if (!storeLat || !storeLng || !clientLat || !clientLng) {
    return {
      baseFee: platformSettings.deliveryBaseFee,
      distanceKm: 5,
      perKmFee: platformSettings.deliveryPerKm * 5,
      totalFee: platformSettings.deliveryBaseFee + (platformSettings.deliveryPerKm * 5)
    };
  }
  const distanceKm = calculateDistance(storeLat, storeLng, clientLat, clientLng);
  const baseFee = platformSettings.deliveryBaseFee;
  const perKmFee = platformSettings.deliveryPerKm * distanceKm;
  const totalFee = baseFee + perKmFee;
  return { baseFee, distanceKm, perKmFee, totalFee };
}

// ==========================================
// 🏪 RÉCUPÉRER LE COMMERCE ACTUEL (PANIER)
// ==========================================
function getCurrentStore() {
  if (cart.length === 0) return null;
  const firstProductId = cart[0].productId;
  const product = products.find(p => p.id === firstProductId);
  if (!product) return null;
  return stores.find(s => s.id === product.store_id);
}

// ==========================================
// 🎨 SÉLECTEUR D'ICÔNES
// ==========================================
function buildIconPicker(containerId, hiddenId) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = allIcons.map(ic => 
    `<div class="icon-option" data-icon="${ic}" onclick="pickIcon('${containerId}','${hiddenId}',this)">${ic}</div>`
  ).join('');
}

function pickIcon(containerId, hiddenId, el) {
  document.querySelectorAll('#' + containerId + ' .icon-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById(hiddenId).value = el.dataset.icon;
  if (containerId === 'store-icon-picker') selectedStoreIcon = el.dataset.icon;
  if (containerId === 'cat-icon-picker') selectedCatIcon = el.dataset.icon;
  if (containerId === 'prod-icon-picker') selectedProdIcon = el.dataset.icon;
}

// ==========================================
// 🕐 FORMATAGE DE L'HEURE (MANIWAKI)
// ==========================================
function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return Math.floor(diff/60) + ' min';
  if (diff < 86400) return Math.floor(diff/3600) + ' h';
  return d.toLocaleDateString('fr-CA');
}

function formatHeureManiwaki(dateString) {
  if (!dateString) return "À l'instant";
  const isoString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Date invalide";
  const options = {
    timeZone: 'America/Montreal',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  };
  return date.toLocaleString('fr-CA', options).replace(',', ' à');
}

// ==========================================
// 💰 FORMATAGE MONÉTAIRE
// ==========================================
function formatMoney(amount) {
  if (amount === null || amount === undefined) return '0.00 $';
  return parseFloat(amount).toFixed(2) + ' $';
}

// ==========================================
// 📍 HISTORIQUE DE NAVIGATION
// ==========================================
function saveViewToHistory(viewId) {
  history.pushState({ view: viewId }, '', '#' + viewId);
  console.log("💾 Historique mis à jour : ", viewId);
}

// ==========================================
// 🏠 NAVIGATION
// ==========================================
function goHome() {
  if (currentUser) {
    if (currentUser.role === 'client') {
      if (typeof showClientStores === 'function') showClientStores();
    } else if (currentUser.role === 'driver' || currentUser.role === 'livreur') {
      if (typeof showDriverDashboard === 'function') showDriverDashboard();
    } else {
      switchView('view-admin');
      if (typeof adminTab === 'function') adminTab('dashboard', document.querySelector('.admin-side li'));
    }
  } else {
    switchView('view-landing');
  }
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
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

// ==========================================
// 📍 AFFICHAGE ADRESSE DE LIVRAISON
// ==========================================
function updateDeliveryAddress() {
  const d = document.getElementById('delivery-address-display');
  if (!d) return;
  if (currentUser && currentUser.role === 'client') {
    d.innerHTML = `<div class="delivery-address-box">
      <h4>📍 Adresse de livraison</h4>
      <p><strong>${currentUser.name}</strong><br>${currentUser.address}<br>📞 ${currentUser.phone}</p>
    </div>`;
  } else {
    d.innerHTML = '';
  }
}

function getFormattedOrderAddress(order) {
  if (!order) return "Adresse non disponible";
  const name = order.client_name || "Client inconnu";
  const phone = order.client_phone || "Pas de téléphone";
  const address = order.client_address || "Adresse non fournie";
  return `
    <div style="font-size: 0.9rem; line-height: 1.4;">
      <strong>👤 ${name}</strong><br>
      <strong>📞 ${phone}</strong><br>
      <strong>📍 ${address}</strong>
      ${order.client_lat && order.client_lng ? `<br><span style="color:#666; font-size:0.8rem;">(GPS: ${order.client_lat}, ${order.client_lng})</span>` : ''}
    </div>
  `;
}

// ==========================================
// 🔐 MOT DE PASSE
// ==========================================
function correctPassword(pass) {
  return typeof pass === 'string' ? pass : String(pass);
}

// ==========================================
// 🎟️ NOM DU FORFAIT
// ==========================================
function getPlanName(planId) {
  if (planId === 1) return '🌱 Essai (0$)';
  if (planId === 2) return '🏪 Base (7.99$)';
  if (planId === 3) return '🚀 Croissance (29.99$)';
  if (planId === 4) return '👑 Partenaire Plus (89.99$)';
  return 'Non spécifié';
}
// ==========================================
// 🔍 RECHERCHE D'ADRESSE AMÉLIORÉE (API Photon - Plus rapide pour le Québec)
// ==========================================
async function searchAddress(query, suggestionsId, inputId) {
  const suggestions = document.getElementById(suggestionsId);
  if (!suggestions) return;
  
  try {
    // ✅ API Photon : Plus rapide et précise pour le Canada/Québec
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=fr&lat=46.3767&lon=-75.9653`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data || !data.features || data.features.length === 0) {
      // Fallback sur Nominatim si Photon échoue
      return await searchAddressFallback(query, suggestionsId, inputId);
    }
    
    suggestions.innerHTML = data.features.map((item, index) => {
      const coords = item.geometry.coordinates; // [lon, lat]
      const props = item.properties;
      
      // Construire une adresse lisible
      let mainText = props.name || '';
      let subText = '';
      
      if (props.street) {
        mainText = `${props.housenumber || ''} ${props.street}`.trim();
      }
      
      const city = props.city || props.town || props.village || props.district || '';
      const postcode = props.postcode || '';
      const state = props.state || 'QC';
      subText = `${city}${postcode ? ', ' + postcode : ''}, ${state}`.trim();
      
      if (!mainText && props.label) {
        mainText = props.label;
      }
      
      return `
        <div class="autocomplete-item" onclick="selectAddressPhoton('${inputId}', '${suggestionsId}', ${index})" 
             style="padding:0.8rem; cursor:pointer; border-bottom:1px solid #eee; display:flex; align-items:center; gap:0.8rem; transition:background 0.2s;"
             onmouseover="this.style.background='#f5f1e8'"
             onmouseout="this.style.background='white'">
          <div style="font-size:1.3rem;">📍</div>
          <div style="flex:1;">
            <div style="font-weight:600; color:#0a1929; font-size:0.95rem;">${mainText}</div>
            ${subText ? `<div style="font-size:0.8rem; color:#6b7280; margin-top:0.2rem;">${subText}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    // Stocker les données pour le clic
    suggestions._data = data.features.map(f => ({
      display_name: f.properties.label || f.properties.name,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0]
    }));
    
  } catch (error) {
    console.error("❌ Erreur recherche adresse:", error);
    suggestions.innerHTML = '<div style="padding:1rem; color:#ef4444; text-align:center;">❌ Erreur de recherche</div>';
  }
}

// Fallback sur Nominatim si Photon échoue
async function searchAddressFallback(query, suggestionsId, inputId) {
  const suggestions = document.getElementById(suggestionsId);
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ca&limit=5&addressdetails=1&accept-language=fr&viewbox=-77,45,-75,47&bounded=1`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data || data.length === 0) {
      suggestions.innerHTML = '<div style="padding:1rem; color:#666; text-align:center;">Aucune adresse trouvée</div>';
      return;
    }
    
    suggestions.innerHTML = data.map((item, index) => `
      <div class="autocomplete-item" onclick="selectAddress('${inputId}', '${suggestionsId}', ${index})"
           style="padding:0.8rem; cursor:pointer; border-bottom:1px solid #eee; display:flex; align-items:center; gap:0.8rem; transition:background 0.2s;"
           onmouseover="this.style.background='#f5f1e8'"
           onmouseout="this.style.background='white'">
        <div style="font-size:1.3rem;">📍</div>
        <div style="flex:1;">
          <div style="font-weight:600; color:#0a1929; font-size:0.95rem;">${item.display_name.split(',')[0]}</div>
          <div style="font-size:0.8rem; color:#6b7280; margin-top:0.2rem;">${item.display_name.split(',').slice(1).join(',').trim()}</div>
        </div>
      </div>
    `).join('');
    
    suggestions._data = data;
  } catch (error) {
    console.error("❌ Erreur fallback:", error);
  }
}

// ==========================================
// 📍 SÉLECTION D'ADRESSE PHOTON (Nouvelle version)
// ==========================================
function selectAddressPhoton(inputId, suggestionsId, index) {
  const suggestions = document.getElementById(suggestionsId);
  const input = document.getElementById(inputId);
  const data = suggestions._data;
  
  if (!data || !data[index]) return;
  
  const item = data[index];
  input.value = item.display_name;
  
  // ✅ STOCKER LES GPS EN NOMBRES (pas en texte !)
  if (item.lat && item.lon) {
    input._lat = parseFloat(item.lat);
    input._lng = parseFloat(item.lon);
    console.log("✅ GPS Photon stockés :", input._lat, input._lng);
  }
  
  suggestions.classList.remove('show');
  suggestions.style.display = 'none';
  showToast('✅ Adresse sélectionnée !');
  
  // Mettre à jour le panier si client connecté
  if (currentUser && currentUser.role === 'client' && typeof updateCart === 'function') {
    updateCart();
  }
}
// ==========================================
// 📍 SÉLECTION D'ADRESSE PHOTON (Nouvelle version)
// ==========================================
function selectAddressPhoton(inputId, suggestionsId, index) {
  const suggestions = document.getElementById(suggestionsId);
  const input = document.getElementById(inputId);
  const data = suggestions._data;
  
  if (!data || !data[index]) return;
  
  const item = data[index];
  input.value = item.display_name;
  
  // ✅ STOCKER LES GPS EN NOMBRES (pas en texte !)
  if (item.lat && item.lon) {
    input._lat = parseFloat(item.lat);
    input._lng = parseFloat(item.lon);
    console.log("✅ GPS Photon stockés :", input._lat, input._lng);
  }
  
  suggestions.classList.remove('show');
  suggestions.style.display = 'none';
  showToast('✅ Adresse sélectionnée !');
  
  // Mettre à jour le panier si client connecté
  if (currentUser && currentUser.role === 'client' && typeof updateCart === 'function') {
    updateCart();
  }
}
// ==========================================
// 📍 SÉLECTION D'ADRESSE NOMINATIM (Ancienne version, garde pour fallback)
// ==========================================
function selectAddress(inputId, suggestionsId, index) {
  const suggestions = document.getElementById(suggestionsId);
  const input = document.getElementById(inputId);
  const data = suggestions._data;
  
  if (!data || !data[index]) return;
  
  const item = data[index];
  input.value = item.display_name;
  
  if (item.lat && item.lon) {
    input._lat = parseFloat(item.lat);
    input._lng = parseFloat(item.lon);
    console.log("✅ GPS Nominatim stockés :", input._lat, input._lng);
  }
  
  suggestions.classList.remove('show');
  suggestions.style.display = 'none';
  showToast('✅ Adresse sélectionnée !');
  
  if (currentUser && currentUser.role === 'client' && typeof updateCart === 'function') {
    updateCart();
  }
}

// ==========================================
// ✅ FIN DU CHARGEMENT
// ==========================================

console.log("✅ [03-utils.js] Utilitaires chargés avec succès !");