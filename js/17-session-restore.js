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
  const notifContainer = document.getElementById('notif-bell-container');
  
  const navClient = document.getElementById('nav-client');
  const navDriver = document.getElementById('nav-driver');
  const navStore = document.getElementById('nav-store');
  const navAdmin = document.getElementById('nav-admin');

  const userNameEl = document.getElementById('user-name');
  const userRoleEl = document.getElementById('user-role');
  const userAvatarEl = document.getElementById('user-avatar');

  // ==========================================
  // 1. GESTION DE L'ÉTAT DÉCONNECTÉ
  // ==========================================
  if (!user) {
    if (authSection) authSection.style.display = 'flex';
    if (userSection) userSection.style.display = 'none';
    if (headerWallet) headerWallet.style.display = 'none';
    if (notifContainer) notifContainer.style.display = 'none';
    [navClient, navDriver, navStore, navAdmin].forEach(nav => { if (nav) nav.style.display = 'none'; });
    
    // Masquer les blocs du dropdown
    const w = document.getElementById('dropdown-wallet');
    const p = document.getElementById('dropdown-pending-orders');
    if (w) w.style.setProperty('display', 'none', 'important');
    if (p) p.style.setProperty('display', 'none', 'important');
    return;
  }

  // ==========================================
  // 2. GESTION DE L'ÉTAT CONNECTÉ (HEADER)
  // ==========================================
  if (authSection) authSection.style.display = 'none';
  if (userSection) userSection.style.display = 'block';
  if (notifContainer) notifContainer.style.display = 'block';
  if (headerWallet) headerWallet.style.display = 'none'; // Ancien wallet du header toujours caché

  // Mise à jour des infos utilisateur
  if (userNameEl) userNameEl.textContent = user.name || 'Utilisateur';
  if (userRoleEl) {
    const roleStyles = {
      'client': { bg: '#dbeafe', text: '#1e40af', label: '👤 Client' },
      'store':  { bg: '#fef3c7', text: '#92400e', label: '🏪 Commerce' },
      'driver': { bg: '#d1fae5', text: '#065f46', label: '🚗 Livreur' },
      'admin':  { bg: '#ede9fe', text: '#5b21b6', label: '⚙️ Admin' }
    };
    const style = roleStyles[user.role] || { bg: '#f3f4f6', text: '#6b7280', label: user.role };
    userRoleEl.textContent = style.label;
    userRoleEl.style.backgroundColor = style.bg;
    userRoleEl.style.color = style.text;
  }
  if (userAvatarEl) {
    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    userAvatarEl.textContent = initials;
  }

  // Menus de navigation
  [navClient, navDriver, navStore, navAdmin].forEach(nav => { if (nav) nav.style.display = 'none'; });
  if (user.role === 'client' && navClient) navClient.style.display = 'block';
  if (user.role === 'driver' && navDriver) navDriver.style.display = 'block';
  if (user.role === 'store' && navStore) navStore.style.display = 'block';
  if (user.role === 'admin' && navAdmin) navAdmin.style.display = 'block';

  // ==========================================
  // 3. GESTION STRICTE DU MENU DÉROULANT
  // ==========================================
  const walletBlock = document.getElementById('dropdown-wallet');
  const pendingBlock = document.getElementById('dropdown-pending-orders');

  // ÉTAPE A : FORCER LE MASQUAGE DES DEUX BLOCS (avec !important)
  if (walletBlock) walletBlock.style.setProperty('display', 'none', 'important');
  if (pendingBlock) pendingBlock.style.setProperty('display', 'none', 'important');

  // ÉTAPE B : AFFICHER UNIQUEMENT CELUI QUI CORRESPOND AU RÔLE
  if (user.role === 'client') {
    if (walletBlock) {
      walletBlock.style.setProperty('display', 'block', 'important');
      const balanceEl = document.getElementById('dropdown-wallet-balance');
      if (balanceEl) balanceEl.textContent = (parseFloat(user.wallet_balance || 0)).toFixed(2);
    }
  } 
  else if (user.role === 'store') {
    if (pendingBlock) {
      pendingBlock.style.setProperty('display', 'block', 'important');
      // Lancer la récupération du nombre de commandes
      if (typeof fetchPendingOrdersCount === 'function') {
        fetchPendingOrdersCount();
      }
    }
  }

  // Charger les notifications
  if (typeof loadUserNotifications === 'function') loadUserNotifications();
}



// ==========================================
// 🎛️ LOGIQUE DU MENU UTILISATEUR (VERSION DEBUG)
// ==========================================

window.toggleUserMenu = function(event) {
  if (event) event.stopPropagation();
  
  const menu = document.getElementById('user-dropdown-menu');
  const trigger = document.getElementById('user-menu-trigger');
  
  if (!menu || !trigger) {
    console.error('❌ Menu ou trigger introuvable');
    return;
  }

  const isHidden = menu.style.display === 'none' || menu.style.display === '';

  if (isHidden) {
    // Move to body to escape all parent constraints
    document.body.appendChild(menu);
    
    // Calculate position
    const rect = trigger.getBoundingClientRect();
    
    // Apply positioning
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.style.zIndex = '999999';
    menu.style.display = 'block';
    
    // Debug log
    console.log('✅ Menu ouvert:', {
      top: menu.style.top,
      right: menu.style.right,
      width: menu.offsetWidth,
      height: menu.offsetHeight,
      children: menu.children.length
    });
  } else {
    menu.style.display = 'none';
  }
};

// Close menu when clicking outside
document.addEventListener('click', function(event) {
  const menu = document.getElementById('user-dropdown-menu');
  const trigger = document.getElementById('user-menu-trigger');
  
  if (menu && trigger && !menu.contains(event.target) && !trigger.contains(event.target)) {
    menu.style.display = 'none';
  }
});

// Close on resize
window.addEventListener('resize', function() {
  const menu = document.getElementById('user-dropdown-menu');
  if (menu) menu.style.display = 'none';
});


// Fonction helper pour charger les notifications sans erreur si le fichier 05 n'est pas prêt
function loadUserNotifications() {
  if (typeof loadNotifications === 'function') {
    loadNotifications();
  } else if (typeof initNotifications === 'function') {
    initNotifications();
  } else if (typeof showNotificationPanel === 'function') {
    showNotificationPanel();
  }
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


// ==========================================
// 🏠 REDIRECTION VERS L'ACCUEIL DU RÔLE
// ==========================================
window.goToMyProfileHome = function() {
  if (!currentUser || !currentUser.role) return;

  console.log("🏠 [Menu] Redirection vers l'accueil du rôle :", currentUser.role);

  // Cacher toutes les vues d'abord
  document.querySelectorAll('.view').forEach(v => { v.style.display = 'none'; });

  if (currentUser.role === 'client') {
    const v = document.getElementById('view-client');
    if (v) v.style.display = 'block';
    if (typeof window.showClientStores === 'function') window.showClientStores();
    highlightActiveNav('nav-client', 0); // Met en surbrillance le premier onglet (Commerces)
  } 
  else if (currentUser.role === 'store') {
    const v = document.getElementById('view-store');
    if (v) v.style.display = 'block';
    if (typeof window.goToMyStore === 'function') window.goToMyStore();
    highlightActiveNav('nav-store', 0); // Met en surbrillance "Mon Commerce"
  } 
  else if (currentUser.role === 'driver') {
    const v = document.getElementById('view-driver');
    if (v) v.style.display = 'block';
    if (typeof window.showDriverDashboard === 'function') window.showDriverDashboard();
    highlightActiveNav('nav-driver', 0);
  } 
  else if (currentUser.role === 'admin') {
    const v = document.getElementById('view-admin');
    if (v) v.style.display = 'block';
    if (typeof window.adminTab === 'function') {
      const firstTab = document.querySelector('.admin-side li');
      window.adminTab('dashboard', firstTab);
    }
    highlightActiveNav('nav-admin', 0);
  }
};

// ==========================================
// 🎨 GESTION DU MENU ACTIF DANS LE HEADER
// ==========================================
window.highlightActiveNav = function(navId, linkIndex) {
  // 1. Remove the active class from ALL navigation links
  document.querySelectorAll('nav ul li a').forEach(link => {
    link.classList.remove('nav-active');
  });

  // 2. Add the active class to the specific link
  const nav = document.getElementById(navId);
  if (nav) {
    const links = nav.querySelectorAll('a');
    if (links[linkIndex]) {
      links[linkIndex].classList.add('nav-active');
    }
  }
};

// 🔥 Intercepter les clics sur les menus pour mettre à jour l'état actif automatiquement
document.addEventListener('click', function(event) {
  const target = event.target;
  if (target.tagName === 'A' && target.closest('nav')) {
    const nav = target.closest('nav');
    const navId = nav.id;
    
    // Trouver l'index du lien cliqué dans son menu
    const links = Array.from(nav.querySelectorAll('a'));
    const index = links.indexOf(target);
    
    if (index !== -1) {
      highlightActiveNav(navId, index);
    }
  }
});


// ==========================================
// 📦 RÉCUPÉRER LE NOMBRE DE COMMANDES EN ATTENTE
// ==========================================
async function fetchPendingOrdersCount() {
  if (!currentUser || currentUser.role !== 'store') return;
  
  try {
    // 1. Trouver l'ID du commerce associé à l'utilisateur
    const { data: storeData } = await supabaseClient
      .from('stores')
      .select('id')
      .eq('owner_id', currentUser.id)
      .maybeSingle();
      
    if (!storeData) return;

    // 2. Compter les commandes avec le statut 'pending' ou 'confirmed'
    const { count, error } = await supabaseClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeData.id)
      .in('status', ['pending', 'confirmed']);
      
    if (!error && count !== null) {
      const countEl = document.getElementById('dropdown-pending-count');
      if (countEl) {
        countEl.textContent = count;
      }
    }
  } catch (err) {
    console.error('❌ Erreur chargement commandes en attente:', err);
  }
}