// ==========================================
// 💳 FICHIER 10 : PAIEMENTS + INITIALISATION
// ==========================================
// Rôle : Wallet, Stripe, page remerciement, démarrage
// ==========================================

console.log("🔄 [10-payment.js] Chargement des paiements et initialisation...");

// ==========================================
// 💰 WALLET - AFFICHAGE DU SOLDE
// ==========================================
function updateWalletDisplay() {
  if (!currentUser || !currentUser.id) return;
  
  supabaseClient.from('profiles').select('wallet_balance')
    .eq('id', currentUser.id).maybeSingle()
    .then(({ data, error }) => {
      if (error || !data) return;
      const balance = parseFloat(data.wallet_balance) || 0;
      currentUser.wallet_balance = balance;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      const walletEl = document.getElementById('wallet-balance');
      if (walletEl) walletEl.textContent = balance.toFixed(2);
    });
}

function showWalletBalance() {
  if (!currentUser) {
    showToast('🔑 Veuillez vous connecter');
    return;
  }
  const balance = currentUser.wallet_balance || 0;
  showToast(`💰 Votre solde : ${balance.toFixed(2)} $`);
}

// ==========================================
// 💳 MODAL DE RECHARGE
// ==========================================
function openDepositModal() {
  if (!currentUser) {
    showToast('❌ Vous devez être connecté');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:500px">
      <h2 style="color:#0a1929;margin-bottom:1.5rem">💳 Recharger mon compte</h2>
      <div style="background:linear-gradient(135deg, #f5f1e8 0%, #fff9f0 100%);padding:1.5rem;border-radius:12px;margin-bottom:1.5rem;text-align:center;border:2px solid #f5a623">
        <div style="font-size:0.9rem;color:#666;margin-bottom:0.5rem">Solde actuel</div>
        <div style="font-size:2rem;font-weight:bold;color:#f5a623">${(currentUser.wallet_balance || 0).toFixed(2)} $</div>
      </div>
      <div style="margin-bottom:1.5rem">
        <label style="display:block;font-weight:bold;margin-bottom:0.5rem;color:#0a1929">Montant à recharger</label>
        <input type="number" id="deposit-amount" min="5" step="0.01" placeholder="Ex: 20.00" style="width:100%;padding:0.8rem;border:2px solid #e0e0e0;border-radius:8px;font-size:1rem">
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;margin-bottom:1.5rem">
        <button class="btn-sm btn-gray" onclick="document.getElementById('deposit-amount').value=10">10 $</button>
        <button class="btn-sm btn-gray" onclick="document.getElementById('deposit-amount').value=25">25 $</button>
        <button class="btn-sm btn-gray" onclick="document.getElementById('deposit-amount').value=50">50 $</button>
        <button class="btn-sm btn-gray" onclick="document.getElementById('deposit-amount').value=100">100 $</button>
      </div>
      <div style="background:#f5f1e8;padding:1rem;border-radius:8px;margin-bottom:1.5rem;font-size:0.85rem;color:#666">
        💡 <strong>Note :</strong> Paiement sécurisé via Stripe.
      </div>
      <div class="modal-actions">
        <button class="btn-sm btn-gray" onclick="this.closest('.modal-bg').remove()">Annuler</button>
        <button class="btn-sm btn-green" onclick="confirmDeposit()">✅ Recharger</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// ==========================================
// 💳 CONFIRMER LA RECHARGE (STRIPE)
// ==========================================
async function confirmDeposit() {
  const amountInput = document.getElementById('deposit-amount');
  const amount = parseFloat(amountInput.value);
  if (!amount || amount < 5) {
    showToast('❌ Le montant minimum est de 5$');
    return;
  }
  
  showToast('⏳ Vérification de votre session...');
  
  try {
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      showToast('❌ Vous devez être connecté pour recharger');
      return;
    }
    
    const userId = user.id;
    const userEmail = user.email || 'client@ruralgo.com';
    
    showToast('⏳ Redirection vers le paiement sécurisé...');
    
    const { data, error } = await supabaseClient.functions.invoke('create-checkout-session', {
      body: {
        amount: amount,
        userId: userId,
        userEmail: userEmail
      }
    });
    
    if (error) {
      console.error('Erreur Edge Function:', error);
      throw new Error(error.message || 'Erreur lors de la création du paiement');
    }
    
    if (!data || !data.url) {
      throw new Error('Aucune URL de paiement reçue');
    }
    
    window.location.href = data.url;
  } catch (err) {
    console.error('Erreur confirmDeposit:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 💳 VÉRIFICATION DU PAIEMENT RÉUSSI
// ==========================================
async function checkPaymentSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const hasSessionId = urlParams.has('session_id');
  const isSuccessParam = urlParams.get('payment_success') === 'true';
  const isSessionStorageSuccess = sessionStorage.getItem('paymentSuccess') === 'true';
  
  if (hasSessionId || isSuccessParam || isSessionStorageSuccess) {
    console.log("✅ [PAIEMENT] Succès Stripe détecté !");
    
    if (isSessionStorageSuccess) sessionStorage.removeItem('paymentSuccess');
    window.history.replaceState({}, document.title, window.location.pathname);
    
    showRuralGoThankYouPage();
    
    setTimeout(async () => {
      console.log("🔄 [WALLET] Récupération du nouveau solde après délai webhook...");
      if (typeof updateWalletDisplay === 'function') {
        await updateWalletDisplay();
      }
      
      const thankYouBalance = document.getElementById('thank-you-balance');
      if (thankYouBalance && currentUser && currentUser.wallet_balance !== undefined) {
        thankYouBalance.textContent = parseFloat(currentUser.wallet_balance).toFixed(2) + ' $';
      }
    }, 2500);
  }
}

// ==========================================
// 🎉 PAGE DE REMERCIEMENT
// ==========================================
function showRuralGoThankYouPage() {
  isThankYouPageActive = true;
  console.log("🛡️ [BOUCLIER] Page de remerciement activée");
  
  const sectionsToHide = document.querySelectorAll('section, [id*="section"], #stores-grid, #stores-container, #cart-section, #client-orders-section, main > div');
  sectionsToHide.forEach(el => {
    if (el.id !== 'ruralgo-thankyou-section') {
      el.style.display = 'none';
    }
  });
  
  let thankYouSection = document.getElementById('ruralgo-thankyou-section');
  if (!thankYouSection) {
    thankYouSection = document.createElement('div');
    thankYouSection.id = 'ruralgo-thankyou-section';
    const main = document.querySelector('main') || document.body;
    main.appendChild(thankYouSection);
  }
  
  const currentBalance = currentUser ? (parseFloat(currentUser.wallet_balance) || 0).toFixed(2) : '0.00';
  
  thankYouSection.style.cssText = `
    display: block !important; padding: 3rem 1.5rem; text-align: center;
    max-width: 600px; margin: 3rem auto; background: white; border-radius: 20px;
    box-shadow: 0 15px 40px rgba(0,0,0,0.08); border-top: 5px solid #f5a623;
  `;
  
  thankYouSection.innerHTML = `
    <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
    <h1 style="color: #0a1929; margin-bottom: 0.5rem; font-size: 1.8rem; font-weight: 800;">Merci pour votre transaction !</h1>
    <p style="font-size: 1.1rem; color: #6b7280; margin-bottom: 2rem; line-height: 1.6;">
      Votre portefeuille <strong>RuralGo Québec</strong> a été crédité avec succès.
    </p>
    <div style="background: #f0fdf4; border: 2px solid #10b981; padding: 1.5rem; border-radius: 16px; margin-bottom: 2.5rem;">
      <p style="font-size: 0.9rem; color: #065f46; margin-bottom: 0.5rem; font-weight: 600;">Votre nouveau solde</p>
      <p style="font-size: 3rem; font-weight: 800; color: #10b981; margin: 0;" id="thank-you-balance">${currentBalance} $</p>
    </div>
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <button onclick="goToStoresAfterThankYou()" style="background: #f5a623; color: #0a1929; border: none; padding: 1rem 2rem; border-radius: 12px; font-size: 1.05rem; font-weight: 700; cursor: pointer;">
        🛍️ Continuer mes achats
      </button>
      <button onclick="goHomeAfterThankYou()" style="background: #f3f4f6; color: #374151; border: none; padding: 1rem 2rem; border-radius: 12px; font-size: 1.05rem; font-weight: 600; cursor: pointer;">
        🏠 Retour à l'accueil
      </button>
    </div>
    <p style="margin-top: 2rem; font-size: 0.8rem; color: #9ca3af;">🌲 Fièrement propulsé par <strong>RuralGo Québec</strong></p>
  `;
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStoresAfterThankYou() {
  isThankYouPageActive = false;
  console.log("🛡️ [BOUCLIER] Désactivé, retour aux commerces");
  
  const thankYouSection = document.getElementById('ruralgo-thankyou-section');
  if (thankYouSection) thankYouSection.remove();
  
  if (typeof showClientStores === 'function') {
    showClientStores();
  } else {
    window.location.href = '/';
  }
}

function goHomeAfterThankYou() {
  isThankYouPageActive = false;
  window.location.href = '/';
}

// ==========================================
// 🔄 CHARGEMENT DEPUIS SUPABASE
// ==========================================
async function load() {
  try {
    const [storesRes, catsRes, prodsRes, clientsRes, driversRes, ordersRes, settingsRes] = await Promise.all([
      supabaseClient.from('stores').select('*'),
      supabaseClient.from('categories').select('*'),
      supabaseClient.from('products').select('*'),
      supabaseClient.from('profiles').select('*'),
      supabaseClient.from('profiles').select('*').in('role', ['livreur', 'driver']),
      supabaseClient.from('orders').select('*'),
      supabaseClient.from('platform_settings').select('*').maybeSingle()
    ]);
    
    if (storesRes.data) stores = storesRes.data;
    if (catsRes.data) categories = catsRes.data;
    if (prodsRes.data) products = prodsRes.data;
    
    if (clientsRes.data) {
      clients = clientsRes.data.filter(c => c.role === 'client').map(c => ({
        id: c.id, name: c.name, email: c.email || '', phone: c.phone,
        address: c.address, role: c.role, status: c.status, createdAt: c.created_at
      }));
    }
    
    if (driversRes.data) {
      drivers = driversRes.data.map(d => ({
        id: d.id, name: d.name, email: d.email || '', phone: d.phone,
        vehicle: d.vehicle, role: d.role, status: d.status, createdAt: d.created_at
      }));
    }
    
    if (ordersRes.data) {
      orders = ordersRes.data.map(o => ({
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
    }
    
    if (settingsRes.data) {
      platformSettings = {
        deliveryBaseFee: settingsRes.data.delivery_base_fee || 7.00,
        deliveryPerKm: settingsRes.data.delivery_per_km || 1.00,
        taxRate: settingsRes.data.tax_rate || 0.14975,
        driverCommission: settingsRes.data.driver_commission || 0.20,
        radius: settingsRes.data.radius || 40
      };
    }
    
    // Vérification de la session utilisateur
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (profile) {
        currentUser = {
          id: profile.id, role: profile.role, name: profile.name,
          email: session.user.email, phone: profile.phone,
          address: profile.address, lat: profile.lat, lng: profile.lng,
          vehicle: profile.vehicle, status: profile.status,
          createdAt: profile.created_at
        };
        showUserInterface();
      }
    }
  } catch (e) {
    console.error("Erreur de chargement Supabase:", e);
  }
}

// ==========================================
// 🎨 ANIMATIONS AU SCROLL
// ==========================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.feature-card, .step-card, .testimonial-card, .store, .stat-item').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
}

// ==========================================
// 🔄 AUTOCOMPLETE ADRESSE
// ==========================================
function initAutocomplete(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionsId);
  if (!input || !suggestions) return;
  
  input.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    if (autocompleteTimeout) clearTimeout(autocompleteTimeout);
    if (query.length < 3) {
      suggestions.classList.remove('show');
      return;
    }
    suggestions.innerHTML = '<div class="autocomplete-loading">Recherche...</div>';
    suggestions.classList.add('show');
    autocompleteTimeout = setTimeout(() => searchAddress(query, suggestionsId, inputId), 500);
  });
  
  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.classList.remove('show');
    }
  });
}

async function searchAddress(query, suggestionsId, inputId) {
  const suggestions = document.getElementById(suggestionsId);
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ca&limit=5&addressdetails=1&accept-language=fr`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data || data.length === 0) {
      suggestions.innerHTML = '<div class="autocomplete-empty">Aucune adresse trouvée</div>';
      return;
    }
    
    suggestions.innerHTML = data.map((item, index) => `
      <div class="autocomplete-item" onclick="selectAddress('${inputId}', '${suggestionsId}', ${index})">
        <div class="autocomplete-item-icon">📍</div>
        <div class="autocomplete-item-content">
          <div class="autocomplete-item-main">${item.display_name}</div>
        </div>
      </div>
    `).join('');
    suggestions._data = data;
  } catch (error) {
    suggestions.innerHTML = '<div class="autocomplete-empty">Erreur de recherche</div>';
  }
}

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
  }
  
  suggestions.classList.remove('show');
  showToast('✅ Adresse sélectionnée !');
  
  if (currentUser && currentUser.role === 'client') updateCart();
}

function geolocateAddress(fieldId) {
  const btn = event.target;
  const originalText = btn.innerHTML;
  
  if (!navigator.geolocation) {
    showToast('⚠️ Géolocalisation non supportée');
    return;
  }
  
  btn.classList.add('loading');
  btn.innerHTML = '📍 Localisation...';
  
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude, lng = pos.coords.longitude;
    userPosition = { lat, lng };
    
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr&zoom=18`);
      const data = await resp.json();
      
      if (data && data.display_name) {
        document.getElementById(fieldId).value = data.display_name;
        document.getElementById(fieldId)._lat = lat;
        document.getElementById(fieldId)._lng = lng;
        showToast('✅ Adresse trouvée !');
      } else {
        document.getElementById(fieldId).value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    } catch (e) {
      document.getElementById(fieldId).value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    
    btn.classList.remove('loading');
    btn.innerHTML = originalText;
    
    if (currentUser && currentUser.role === 'client') updateCart();
  }, () => {
    btn.classList.remove('loading');
    btn.innerHTML = originalText;
    showToast('❌ Permission refusée');
  }, { enableHighAccuracy: true, timeout: 10000 });
}

// ==========================================
// 🔄 GESTION DU BOUTON RETOUR NAVIGATEUR
// ==========================================
window.addEventListener('popstate', function(event) {
  console.log("⏪ Bouton Retour cliqué !");
  
  document.querySelectorAll('.view').forEach(view => {
    view.style.display = 'none';
    view.classList.remove('active');
  });
  
  let requestedView = (event.state && event.state.view) ? event.state.view : 'view-landing';
  
  // Sécurité : empêcher les conflits de rôle
  if (currentUser && currentUser.id) {
    if (currentUser.role === 'client') {
      if (['view-store', 'view-admin', 'view-driver'].includes(requestedView)) {
        requestedView = 'view-client';
      }
    } else if (currentUser.role === 'livreur' || currentUser.role === 'driver') {
      if (['view-store', 'view-admin', 'view-client'].includes(requestedView)) {
        requestedView = 'view-driver';
      }
    } else if (currentUser.role === 'store') {
      if (['view-client', 'view-admin', 'view-driver'].includes(requestedView)) {
        requestedView = 'view-store';
      }
    }
  }
  
  const targetView = document.getElementById(requestedView);
  if (targetView) {
    targetView.style.display = 'block';
    targetView.classList.add('active');
    window.scrollTo(0, 0);
  } else {
    document.getElementById('view-landing').style.display = 'block';
  }
});

// ==========================================
// 🚀 DÉMARRAGE FINAL DU SITE
// ==========================================
window.addEventListener('load', async function() {
  console.log("🚀 [DÉMARRAGE] Chargement complet du site...");
  
  // 1. Charger les données
  await load();
  
  // 2. Initialiser l'interface
  renderLandingStores();
  updateCart();
  initScrollAnimations();
  
  // 3. Cacher le loader
  setTimeout(function() {
    const loader = document.getElementById('page-loader');
    if (loader) loader.classList.add('hidden');
  }, 1000);
  
  // 4. Vérifier si on vient d'un paiement
  setTimeout(() => {
    checkPaymentSuccess();
  }, 800);
  
  console.log("✅ [DÉMARRAGE] Site complètement chargé !");
});

// ==========================================
// 🔔 POLLING DES NOTIFICATIONS
// ==========================================
window.notifIntervalId = setInterval(() => {
  if (currentUser && currentUser.id) {
    if (typeof refreshNotificationsAuto === 'function') {
      refreshNotificationsAuto();
    }
  }
}, 1500);

// ==========================================
// 🖱️ FERMER PANNEAU NOTIF EN CLIQUANT AILLEURS
// ==========================================
document.addEventListener('click', function(e) {
  const panel = document.getElementById('notif-panel');
  const bell = document.querySelector('.notif-bell');
  if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.style.display = 'none';
  }
});

// ==========================================
// ✅ FIN DU CHARGEMENT
// ==========================================
console.log("✅ [10-payment.js] Paiements et initialisation chargés !");
console.log("🎉 TOUS LES 10 FICHIERS JS SONT MAINTENANT CHARGÉS !");
console.log("🚀 RuralGo Québec est prêt !");