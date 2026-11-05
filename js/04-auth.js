// ==========================================
// 🔐 FICHIER 04 : AUTHENTIFICATION
// ==========================================
// Rôle : Login, Register, Logout, Interface utilisateur
// ==========================================

console.log("🔄 [04-auth.js] Chargement des fonctions d'authentification...");

// ==========================================
// 🔐 MODALE DE CHOIX DE TYPE DE COMPTE
// ==========================================
function openChooseTypeModal() {
  selectedAccountType = null;
  document.querySelectorAll('.account-type').forEach(t => t.classList.remove('selected'));
  const continueBtn = document.getElementById('continue-type-btn');
  if (continueBtn) continueBtn.disabled = true;
  openModal('choose-type-modal');
}

function selectAccountType(type, element) {
  selectedAccountType = type;
  document.querySelectorAll('.account-type').forEach(el => el.classList.remove('selected'));
  if (element) element.classList.add('selected');
  const continueBtn = document.getElementById('continue-type-btn');
  if (continueBtn) continueBtn.disabled = false;
  console.log('Type de compte sélectionné :', type);
}

function continueToRegister() {
  closeModal('choose-type-modal');
  if (selectedAccountType === 'client') {
    openModal('register-client-modal');
    setTimeout(() => initAutocomplete('rc-address', 'rc-address-suggestions'), 100);
  } else if (selectedAccountType === 'driver') {
    openModal('register-driver-modal');
  } else if (selectedAccountType === 'store') {
    openModal('register-store-modal');
    setTimeout(() => initAutocomplete('rs-address', 'rs-address-suggestions'), 100);
  }
}

function openLoginModal() {
  openModal('login-modal');
}

// ==========================================
// 📝 INSCRIPTION CLIENT
// ==========================================
async function registerClient(e) {
  e.preventDefault();
  
  const email = document.getElementById('rc-email').value.trim();
  const password = correctPassword(document.getElementById('rc-pass').value);
  const name = document.getElementById('rc-name').value.trim();
  const phone = document.getElementById('rc-phone').value.trim();
  const addressInput = document.getElementById('rc-address');
  
  // 1. Créer le compte d'authentification
  const { data: authData, error: authError } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { name, role: 'client' } }
  });
  
  if (authError) {
    console.error("❌ Erreur d'inscription auth:", authError);
    showToast('❌ Erreur: ' + authError.message);
    return;
  }
  
 // ✅ NOUVELLE VERSION : GPS forcés en nombres
const finalLat = addressInput._lat 
  ? parseFloat(addressInput._lat) 
  : (userPosition?.lat ? parseFloat(userPosition.lat) : null);
const finalLng = addressInput._lng 
  ? parseFloat(addressInput._lng) 
  : (userPosition?.lng ? parseFloat(userPosition.lng) : null);

console.log("📍 [INSCRIPTION] GPS finaux :", finalLat, finalLng);

const { error: dbError } = await supabaseClient.from('profiles').insert({
  id: authData.user.id,
  role: 'client',
  email: email,
  name: name,
  phone: phone,
  address: addressInput.value,
  lat: finalLat,
  lng: finalLng,
  status: 'approved'
});
  
  if (dbError) {
    console.error("❌ Erreur d'insertion profil:", dbError);
    showToast('❌ Erreur: ' + dbError.message);
    return;
  }
  
  // 3. Mettre à jour l'état local
  currentUser = {
    id: authData.user.id,
    role: 'client',
    name: name,
    email: email,
    phone: phone,
    address: addressInput.value,
    lat: addressInput._lat || userPosition?.lat,
    lng: addressInput._lng || userPosition?.lng,
    status: 'approved',
    createdAt: new Date().toISOString()
  };
  
  // 4. Finalisation
  closeModal('register-client-modal');
  showUserInterface();
  showToast('✅ Bienvenue ' + name.split(' ')[0] + ' !');
}

function correctPassword(pass) {
  return typeof pass === 'string' ? pass : String(pass);
}

// ==========================================
// 🏪 INSCRIPTION COMMERCE
// ==========================================
// ==========================================
// 🏪 INSCRIPTION COMMERCE (AVEC GPS)
// ==========================================
async function registerStore(event) {
  event.preventDefault();
  
  // 1. Récupérer tous les champs du formulaire
  const name = document.getElementById('rs-name').value.trim();
  const type = document.getElementById('rs-type').value;
  const owner = document.getElementById('rs-owner').value.trim();
  const email = document.getElementById('rs-email').value.trim();
  const pass = document.getElementById('rs-pass').value;
  const passConfirm = document.getElementById('rs-pass-confirm').value;
  const phone = document.getElementById('rs-phone').value.trim();
  const addressInput = document.getElementById('rs-address');
  const address = addressInput.value.trim();
  const forfaitChoisi = document.getElementById('rs-forfait').value;
  
  // 2. Validation des champs
  if (pass !== passConfirm) { showToast('❌ Les mots de passe ne correspondent pas'); return; }
  if (pass.length < 6) { showToast('❌ Le mot de passe doit contenir au moins 6 caractères'); return; }
  if (!name || !type || !owner || !email || !phone || !address || !forfaitChoisi) { 
    showToast('❌ Veuillez remplir tous les champs'); 
    return; 
  }
  
  // 3. Déterminer l'ID du forfait choisi
  let planId = null;
  if (forfaitChoisi === 'essai') planId = 1;
  else if (forfaitChoisi === 'base') planId = 2;
  else if (forfaitChoisi === 'croissance') planId = 3;
  else if (forfaitChoisi === 'partenaire') planId = 4;
  
  if (!planId) { showToast('❌ Forfait invalide'); return; }
  
  // 🔥 4. RÉCUPÉRER LES GPS DU COMMERCE (LE VRAI FIX !)
  let storeLat = addressInput._lat || null;
  let storeLng = addressInput._lng || null;
  
  console.log("📍 [INSCRIPTION COMMERCE] GPS avant géocodage - Lat:", storeLat, "Lng:", storeLng);
  
  // 🔥 GÉOCODAGE AUTOMATIQUE SI GPS MANQUANTS
  if ((!storeLat || !storeLng) && address && address.length > 5) {
    showToast('🔍 Localisation de votre commerce...');
    try {
      const searchQuery = `${address}, Québec, Canada`;
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1&lang=fr`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates; // [longitude, latitude]
        storeLat = parseFloat(coords[1]);
        storeLng = parseFloat(coords[0]);
        console.log("✅ [INSCRIPTION COMMERCE] GPS trouvés automatiquement :", storeLat, storeLng);
        showToast('✅ Commerce localisé !');
      } else {
        console.warn("⚠️ [INSCRIPTION COMMERCE] Adresse introuvable via géocodage.");
      }
    } catch (err) {
      console.warn("⚠️ [INSCRIPTION COMMERCE] Erreur géocodage:", err);
    }
  }
  
  try {
    showToast('📨 Envoi de votre demande en cours...');
    
    // 5. Créer le compte d'authentification
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email: email, 
      password: pass, 
      options: { data: { role: 'store', name: owner } }
    });
    
    if (authError) throw authError;
    
    // 6. Créer le profil dans la table 'profiles'
    const { error: profileError } = await supabaseClient.from('profiles').insert({
      id: authData.user.id, 
      email: email, 
      role: 'store', 
      name: owner, 
      phone: phone,
      address: address, 
      status: 'pending', 
      selected_plan_id: planId
    });
    
    if (profileError) throw profileError;
    
    // 🔥 7. CRÉER LE COMMERCE AVEC LES GPS (LE VRAI FIX !)
    const storeData = {
      user_id: authData.user.id, 
      name: name, 
      type: type, 
      address: address, 
      phone: phone, 
      status: 'pending'
    };
    
    // Ajouter les GPS seulement s'ils sont valides
    if (storeLat && storeLng && !isNaN(storeLat) && !isNaN(storeLng)) {
      storeData.lat = parseFloat(storeLat);
      storeData.lng = parseFloat(storeLng);
      console.log("✅ [INSCRIPTION COMMERCE] GPS envoyés à Supabase :", storeData.lat, storeData.lng);
    } else {
      console.warn("⚠️ [INSCRIPTION COMMERCE] Inscription sans GPS. Le commerce pourra les ajouter plus tard.");
    }
    
    const { error: storeError } = await supabaseClient.from('stores').insert(storeData);
    
    if (storeError) console.error('Erreur store:', storeError);
    
    // 8. Notifier les admins
    const { data: admins } = await supabaseClient.from('profiles').select('id').eq('role', 'admin');
    if (admins) {
      for (const admin of admins) {
        await showNotification('Nouvelle inscription commerce', `Le commerce "${name}" demande une validation.`, 'info', admin.id);
      }
    }
    
    closeModal('register-store-modal');
    showToast('✅ Demande envoyée avec succès !');
  } catch (err) {
    console.error('Erreur inscription commerce:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 🚗 INSCRIPTION LIVREUR
// ==========================================
async function registerDriver(e) {
  e.preventDefault();
  
  const email = document.getElementById('rd-email').value;
  const password = correctPassword(document.getElementById('rd-pass').value);
  const name = document.getElementById('rd-name').value;
  const phone = document.getElementById('rd-phone').value;
  const vehicle = document.getElementById('rd-vehicle').value;
  
  const { data: authData, error: authError } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { name, role: 'livreur' } }
  });
  
  if (authError) {
    console.error("❌ Erreur Auth:", authError);
    showToast('❌ Erreur: ' + authError.message);
    return;
  }
  
  const { error: profileError } = await supabaseClient.from('profiles').insert({
    id: authData.user.id,
    email: email,
    role: 'livreur',
    name: name,
    phone: phone,
    vehicle: vehicle,
    status: 'pending'
  });
  
  if (profileError) {
    console.error("❌ Erreur création profil:", profileError);
    showToast('❌ Erreur profil: ' + profileError.message);
    return;
  }
  
  // Notifier les admins
  try {
    const { data: admins } = await supabaseClient.from('profiles').select('id').eq('role', 'admin');
    if (admins && admins.length > 0) {
      for (const admin of admins) {
        if (typeof showNotification === 'function') {
          await showNotification('Nouvelle inscription livreur', `Le livreur "${name}" demande une validation.`, 'info', admin.id);
        }
      }
    }
  } catch (notifErr) {
    console.warn("⚠️ Erreur d'envoi de notification:", notifErr);
  }
  
  closeModal('register-driver-modal');
  showToast('📨 Demande envoyée ! En attente d\'approbation.');
}

// ==========================================
// 🔑 CONNEXION
// ==========================================
async function loginUser(event) {
  await ensureStoreExists();
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-pass').value;
  
  try {
    showToast('⏳ Connexion en cours...');
    
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email, password
    });
    
    if (authError) throw authError;
    
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, status, selected_plan_id, name')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) throw profileError;
    
    currentUser = {
  id: authData.user.id,
  email: authData.user.email,
  role: profile.role,
  name: profile.name,
  status: profile.status,
  selected_plan_id: profile.selected_plan_id
};

// ✅ NOUVEAU : Si c'est un commerce, récupérer le VRAI nom du commerce
if (currentUser.role === 'store') {
  try {
    const { data: store } = await supabaseClient
      .from('stores')
      .select('name')
      .eq('owner_id', currentUser.id)
      .maybeSingle();
    
    if (store && store.name) {
      currentUser.storeName = store.name;  // ✅ Nom du commerce
    }
  } catch (err) {
    console.warn('⚠️ Impossible de récupérer le nom du commerce:', err);
  }
}

closeModal('login-modal');
    
    
    // Logique spéciale pour les commerces
    if (currentUser.role === 'store') {
      if (currentUser.status === 'pending') {
        showToast('⏳ Votre compte est en attente de validation.');
        await supabaseClient.auth.signOut();
        currentUser = null;
        return;
      }
      
      if (currentUser.status === 'approved') {
        const { data: subscription } = await supabaseClient
          .from('subscriptions')
          .select('status')
          .eq('user_id', currentUser.id)
          .maybeSingle();
        
        const isFreeTrial = currentUser.selected_plan_id === 1;
        const hasActiveSubscription = subscription && subscription.status === 'active';
        
        if (!isFreeTrial && !hasActiveSubscription) {
          showToast('💳 Veuillez régler votre forfait.');
          showStorePaymentScreen();
          return;
        }
      }
    }
    
    await initNotifications();
    await diagnosticComplet();
    showUserInterface();
    showToast('✅ Connexion réussie, bienvenue ' + currentUser.name + ' !');
  } catch (err) {
    console.error('Erreur de connexion:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// 🚪 DÉCONNEXION
// ==========================================
async function logout() {
  console.log("🚪 [DÉCONNEXION] Début du processus...");
  
  try {
    await supabaseClient.auth.signOut({ scope: 'global' }).catch(err => {
      if (!err.message.includes('403')) console.warn("⚠️ Info déconnexion:", err);
    });
  } catch (err) {
    console.warn("⚠️ Erreur Supabase lors de la déconnexion:", err);
  }
  
  currentUser = null;
  localStorage.removeItem('currentUser');
  
  if (window.notifIntervalId) {
    clearInterval(window.notifIntervalId);
    window.notifIntervalId = null;
  }
  
  window.location.replace('index.html');
}

// ==========================================
// 👤 INTERFACE UTILISATEUR
// ==========================================
function showUserInterface() {
  // 🛡️ BOUCLIER : Si la page de remerciement est active, on annule tout pour ne pas l'écraser
  if (typeof isThankYouPageActive !== 'undefined' && isThankYouPageActive) {
    console.log("🛡️ [BOUCLIER] showUserInterface bloqué pour protéger la page de remerciement");
    return;
  }

  // 🛡️ SÉCURITÉ : Vérifier que currentUser existe
  if (!currentUser || !currentUser.id) {
    console.warn("⚠️ showUserInterface appelé sans utilisateur connecté.");
    return;
  }

  // 👁️ AFFICHER LA SECTION UTILISATEUR
  const authSection = document.getElementById('auth-section');
  const userSection = document.getElementById('user-section');
  const headerWallet = document.getElementById('header-wallet');
  const notifBell = document.getElementById('notif-bell-container');

  if (authSection) authSection.style.display = 'none';
  if (userSection) userSection.style.display = 'flex';
  if (headerWallet) headerWallet.style.display = 'block';
  if (notifBell) notifBell.style.display = 'block';

  // 👤 MISE À JOUR DE L'AVATAR ET DU NOM
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userRole = document.getElementById('user-role');

  if (userAvatar) {
    const ini = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    userAvatar.textContent = ini;
  }

  if (userName) {
    // 🔥 LOGIQUE CRITIQUE POUR LE NOM :
    let displayName = currentUser.name; // Par défaut : nom du responsable
    
    if (currentUser.role === 'store') {
      // On cherche le commerce qui appartient à cet utilisateur dans le tableau 'stores'
      const myStore = Array.isArray(stores) ? stores.find(s => String(s.owner_id) === String(currentUser.id)) : null;
      
      // Priorité : 1. myStore.name, 2. currentUser.storeName, 3. currentUser.name
      if (myStore && myStore.name) {
        displayName = myStore.name; // ✅ On garde le nom COMPLET du commerce (pas de split)
      } else if (currentUser.storeName) {
        displayName = currentUser.storeName;
      }
    }
    
    // Pour les clients/livreurs/admin, on garde juste le prénom
    if (currentUser.role !== 'store') {
      displayName = displayName.split(' ')[0];
    }
    
    userName.textContent = displayName;
    console.log(`✅ Nom affiché dans le header : "${displayName}" (Rôle: ${currentUser.role})`);
  }

  if (userRole) {
    const labels = { 
      client: '👤 Client', 
      driver: '🚗 Livreur', 
      livreur: '🚗 Livreur', 
      admin: '⚙️ Admin', 
      store: '🏪 Commerce' 
    };
    userRole.textContent = labels[currentUser.role] || currentUser.role;
  }

 // ✅ NOUVELLE VERSION (cache pour commerces ET admin) :
const editProfileBtn = document.querySelector('#user-section button[onclick="openEditProfileModal()"]');
if (editProfileBtn) {
  // Cacher le bouton pour les commerces ET l'admin
  if (currentUser.role === 'store' || currentUser.role === 'admin') {
    editProfileBtn.style.display = 'none';
  } else {
    editProfileBtn.style.display = 'flex';
  }
}

  // 💰 GESTION DU WALLET (Visible seulement pour les clients)
  if (currentUser.role !== 'client') {
    const allWalletElements = document.querySelectorAll(
      '[id*="wallet"], [id*="balance"], [id*="recharge"], [id*="transaction"]'
    );
    allWalletElements.forEach(el => { el.style.display = 'none'; });
  } else {
    const walletBalance = document.getElementById('wallet-balance');
    if (walletBalance) walletBalance.style.display = 'inline';
    setTimeout(() => {
      if (typeof updateWalletDisplay === 'function') updateWalletDisplay();
    }, 500);
  }

  // 🧭 RÉINITIALISER LES MENUS DE NAVIGATION
  const navClient = document.getElementById('nav-client');
  const navDriver = document.getElementById('nav-driver');
  const navAdmin = document.getElementById('nav-admin');
  const navStore = document.getElementById('nav-store');

  if (navClient) navClient.style.display = 'none';
  if (navDriver) navDriver.style.display = 'none';
  if (navAdmin) navAdmin.style.display = 'none';
  if (navStore) navStore.style.display = 'none';

  // 🚀 AFFICHER L'INTERFACE SPÉCIFIQUE AU RÔLE
  if (currentUser.role === 'client') {
    if (navClient) navClient.style.display = 'block';
    const clientFirstname = document.getElementById('client-firstname');
    if (clientFirstname) clientFirstname.textContent = currentUser.name.split(' ')[0];
    
    if (typeof updateDeliveryAddress === 'function') updateDeliveryAddress();
    switchView('view-client');
    if (typeof showClientStores === 'function') showClientStores();
    
  } else if (currentUser.role === 'driver' || currentUser.role === 'livreur') {
    if (navDriver) navDriver.style.display = 'block';
    const driverFirstname = document.getElementById('driver-firstname');
    if (driverFirstname) driverFirstname.textContent = currentUser.name.split(' ')[0];
    
    switchView('view-driver');
    if (typeof showDriverDashboard === 'function') showDriverDashboard();
    
  } else if (currentUser.role === 'admin') {
    if (navAdmin) navAdmin.style.display = 'block';
    switchView('view-admin');
    if (typeof renderAllAdmin === 'function') renderAllAdmin();
    
  } else if (currentUser.role === 'store') {
    if (navStore) navStore.style.display = 'block';
    
    if (currentUser.status === 'pending') {
      switchView('view-landing');
      showToast('⏳ Votre commerce est en attente d\'approbation.');
    } else if (currentUser.status === 'rejected') {
      switchView('view-landing');
      showToast('❌ Votre demande a été refusée.');
    } else {
      switchView('view-store');
      if (typeof showStoreDashboard === 'function') showStoreDashboard();
    }
  }

  // 🔔 METTRE À JOUR LE BADGE DE NOTIFICATIONS
  if (typeof updateNotifBadge === 'function') {
    updateNotifBadge();
  }
}

// ==========================================
// 🔧 FONCTIONS UTILITAIRES AUTH
// ==========================================
async function ensureStoreExists() {
  if (!currentUser || currentUser.role !== 'store') return;
  
  try {
    const { data: existingStore } = await supabaseClient
      .from('stores')
      .select('id')
      .eq('owner_id', currentUser.id)
      .maybeSingle();
    
    if (existingStore) return;
    
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    
    if (!profile) return;
    
    await supabaseClient.from('stores').insert({
      owner_id: currentUser.id,
      name: profile.name || 'Mon Commerce',
      type: 'Commerce',
      address: profile.address || '',
      phone: profile.phone || '',
      email: profile.email || '',
      status: profile.status || 'pending',
      forfait: profile.selected_plan_id || 1
    });
  } catch (err) {
    console.error("❌ Erreur ensureStoreExists:", err);
  }
}

async function diagnosticComplet() {
  console.log("🔍 ===== DIAGNOSTIC COMPLET =====");
  if (!currentUser) return;
  
  try {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    
    if (profile) console.log("✅ Profil OK:", profile.status);
    
    if (currentUser.role === 'store') {
      const { data: store } = await supabaseClient
        .from('stores')
        .select('*')
        .eq('owner_id', currentUser.id)
        .maybeSingle();
      
      if (!store) {
        await supabaseClient.from('stores').insert({
          owner_id: currentUser.id,
          name: profile.name || 'Mon Commerce',
          type: 'Commerce',
          address: profile.address || '',
          phone: profile.phone || '',
          status: 'active',
          forfait: profile.selected_plan_id || 1,
          icon: '🏪'
        });
      }
    }
    
    console.log("🔍 ===== DIAGNOSTIC TERMINÉ =====");
  } catch (err) {
    console.error("❌ Erreur diagnostic:", err);
  }
}

// ==========================================
// 💳 ÉCRAN DE PAIEMENT FORFAIT
// ==========================================
async function showStorePaymentScreen() {
  console.log("🔍 DEBUG PAIEMENT - Chargement des forfaits...");
  
  const { data: plans, error } = await supabaseClient
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });
  
  if (error) {
    console.error("❌ Erreur chargement forfaits:", error);
    showToast('❌ Erreur: ' + error.message);
    return;
  }
  
  if (!plans || plans.length === 0) {
    showToast('⚠️ Aucun forfait disponible.');
    return;
  }
  
  const selectedPlanId = currentUser.selected_plan_id;
  const planNames = { 1: 'Essai', 2: 'Base', 3: 'Croissance', 4: 'Partenaires Plus' };
  const chosenName = planNames[selectedPlanId] || 'inconnu';
  
  const plansHtml = plans.map(plan => {
    const featuresHtml = plan.features && Array.isArray(plan.features)
      ? plan.features.map(f => `<li style="margin-bottom:0.5rem">✅ ${f}</li>`).join('')
      : '<li style="margin-bottom:0.5rem">ℹ️ Détails du forfait</li>';
    
    const btnText = plan.price === 0 ? '🎁 Activer l\'essai gratuit' : `💳 Payer ${plan.price}$ / mois`;
    const isChosen = plan.id === selectedPlanId;
    const borderColor = isChosen ? '#f5a623' : '#e0e0e0';
    const bg = isChosen ? '#fff9f0' : 'white';
    const badge = isChosen ? '<div style="background:#f5a623;color:white;padding:4px 8px;border-radius:4px;font-size:0.8rem;margin-bottom:8px;display:inline-block;">⭐ Votre choix</div>' : '';
    
    return `
      <div style="border: 3px solid ${borderColor}; border-radius: 12px; padding: 1.5rem; text-align: center; background: ${bg};">
        ${badge}
        <h3 style="color: #0a1929; margin-bottom: 0.5rem;">${plan.name}</h3>
        <div style="font-size: 2rem; font-weight: bold; color: #f5a623; margin-bottom: 1rem;">
          ${plan.price === 0 ? 'GRATUIT' : plan.price + ' $<span style="font-size:1rem;color:#666">/mois</span>'}
        </div>
        <ul style="text-align: left; color: #666; margin-bottom: 1.5rem; padding-left: 1.5rem; font-size: 0.9rem; list-style: none;">
          ${featuresHtml}
        </ul>
        <button class="btn-sm btn-green" style="width: 100%; font-weight: bold; cursor: pointer;" onclick="handlePlanSelection(${plan.id}, ${plan.price})">
          ${btnText}
        </button>
      </div>
    `;
  }).join('');
  
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.id = 'store-payment-modal';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div class="modal" style="max-width: 900px;">
      <h2 style="color: #0a1929; margin-bottom: 0.5rem;">🎉 Votre compte a été approuvé !</h2>
      <p style="color: #666; margin-bottom: 1rem;">L'administrateur a validé votre demande.</p>
      <div style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; text-align: center;">
        <p style="margin: 0; color: #0050b3; font-weight: bold;">
          Forfait sélectionné : <span style="color: #f5a623; font-size: 1.2rem;">${chosenName}</span>
        </p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        ${plansHtml}
      </div>
      <div style="text-align: right;">
        <button class="btn-sm btn-gray" onclick="document.getElementById('store-payment-modal').remove(); supabaseClient.auth.signOut(); currentUser=null; location.reload();">🚪 Se déconnecter</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

async function handlePlanSelection(planId, price) {
  if (!currentUser) return;
  
  showToast('⏳ Préparation du paiement...');
  
  try {
    const { data, error } = await supabaseClient.functions.invoke('create-subscription', {
      body: {
        planId: planId,
        userEmail: currentUser.email
      }
    });
    
    if (error) throw error;
    
    if (data.success && data.redirect) {
      showToast('✅ Forfait Essai activé !');
      document.getElementById('store-payment-modal').remove();
      showUserInterface();
    } else if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('Réponse inattendue du serveur');
    }
  } catch (err) {
    console.error('Erreur paiement forfait:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// ✅ FIN DU CHARGEMENT
// ==========================================
console.log("✅ [04-auth.js] Fonctions d'authentification chargées !");