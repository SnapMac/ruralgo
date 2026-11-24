// ==========================================
// 🔐 FICHIER 17 : RESTAURATION DE SESSION (VERSION FINALE)
// ==========================================

console.log("⏳ [17-session] Script chargé, en attente du signal...");

function forceRestoreSession() {
  console.log("🚀 [17-session] Tentative de restauration de session...");

  try {
    const savedUser = localStorage.getItem('currentUser');
    console.log("🔍 [17-session] Données brutes du localStorage :", savedUser);

    if (!savedUser) {
      console.warn("⚠️ [17-session] Aucune donnée. Mode déconnecté.");
      currentUser = null;
      window.currentUser = null;
      updateAuthUI(null);
      showDefaultView();
      return;
    }

    const parsed = JSON.parse(savedUser);

    // Affectation de la variable globale (var/let) ET de window,
    // pour que TOUTES les fonctions lisent la même valeur.
    currentUser = parsed;
    window.currentUser = parsed;

    console.log("✅ [17-session] Utilisateur restauré globalement :", {
      nom: currentUser.name,
      role: currentUser.role,
      id: currentUser.id
    });

    // Fermer la modale de login si elle s'est ouverte pendant l'init.
    if (typeof closeModal === 'function') {
      closeModal('login-modal');
    }

    updateAuthUI(currentUser);
    redirectToRoleDashboard(currentUser);

  } catch (error) {
    console.error("❌ [17-session] ERREUR CRITIQUE :", error);
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.currentUser = null;
    updateAuthUI(null);
    showDefaultView();
  }
}

function updateAuthUI(user) {
  const authSection = document.getElementById('auth-section');
  const userSection = document.getElementById('user-section');
  const headerWallet = document.getElementById('header-wallet');
  const navClient = document.getElementById('nav-client');
  const navDriver = document.getElementById('nav-driver');
  const navStore = document.getElementById('nav-store');
  const navAdmin = document.getElementById('nav-admin');

  if (!user) {
    if (authSection) authSection.style.display = 'flex';
    if (userSection) userSection.style.display = 'none';
    if (headerWallet) headerWallet.style.display = 'none';
    [navClient, navDriver, navStore, navAdmin].forEach(n => { if (n) n.style.display = 'none'; });
    return;
  }

  if (authSection) authSection.style.display = 'none';
  if (userSection) userSection.style.display = 'flex';

  const userNameEl = document.getElementById('user-name');
  const userRoleEl = document.getElementById('user-role');
  const userAvatarEl = document.getElementById('user-avatar');

  if (userNameEl) userNameEl.textContent = user.name || 'Utilisateur';
  if (userRoleEl) {
    const labels = { client: '👤 Client', driver: '🚗 Livreur', store: '🏪 Commerce', admin: '⚙️ Administrateur' };
    userRoleEl.textContent = labels[user.role] || user.role;
  }
  if (userAvatarEl) {
    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    userAvatarEl.textContent = initials;
  }

  if (headerWallet) {
    if (user.role === 'client') {
      headerWallet.style.display = 'block';
      const w = document.getElementById('wallet-balance');
      if (w) w.textContent = (parseFloat(user.wallet_balance || 0)).toFixed(2);
    } else {
      headerWallet.style.display = 'none';
    }
  }

  [navClient, navDriver, navStore, navAdmin].forEach(n => { if (n) n.style.display = 'none'; });
  if (user.role === 'client' && navClient) navClient.style.display = 'block';
  if (user.role === 'driver' && navDriver) navDriver.style.display = 'block';
  if (user.role === 'store' && navStore) navStore.style.display = 'block';
  if (user.role === 'admin' && navAdmin) navAdmin.style.display = 'block';
}

function redirectToRoleDashboard(user) {
  if (!user || !user.role) { showDefaultView(); return; }

  document.querySelectorAll('.view').forEach(v => { v.style.display = 'none'; });

  if (user.role === 'store') {
    const storeView = document.getElementById('view-store');
    if (storeView) storeView.style.display = 'block';

    ['store-dashboard-section', 'store-categories-section', 'store-products-section', 'store-orders-section']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === 'store-dashboard-section') ? 'block' : 'none';
      });

    // Délai pour laisser 07-store.js se charger, puis garde non bloquant.
    setTimeout(() => {
      if (typeof window.showStoreDashboard === 'function') {
        console.log("📊 [17-session] Appel de showStoreDashboard()...");
        window.showStoreDashboard();
      }
    }, 250);
  } else if (user.role === 'client') {
    const v = document.getElementById('view-client');
    if (v) v.style.display = 'block';
    if (typeof window.showClientStores === 'function') window.showClientStores();
  } else if (user.role === 'driver') {
    const v = document.getElementById('view-driver');
    if (v) v.style.display = 'block';
    if (typeof window.showDriverDashboard === 'function') window.showDriverDashboard();
  } else if (user.role === 'admin') {
    const v = document.getElementById('view-admin');
    if (v) v.style.display = 'block';
  } else {
    showDefaultView();
  }
}

function showDefaultView() {
  document.querySelectorAll('.view').forEach(v => { v.style.display = 'none'; });
  const landing = document.getElementById('view-landing');
  if (landing) landing.style.display = 'block';
}

// Déclencheurs multiples, idempotents.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log("⚡ [17-session] DOM prêt, exécution immédiate.");
  forceRestoreSession();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("⚡ [17-session] DOMContentLoaded, exécution.");
    forceRestoreSession();
  });
}

document.addEventListener('app:ready', () => {
  console.log("⚡ [17-session] app:ready, exécution.");
  forceRestoreSession();
});