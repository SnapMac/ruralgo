// ==========================================
// 🔐 FICHIER 17 : RESTAURATION DE SESSION (VERSION CORRIGÉE & COMPLÈTE)
// ==========================================

console.log("⏳ [17-session] Script chargé, en attente du signal...");

// 1. Redirection vers le tableau de bord (DOIT être défini en premier)
function redirectToRoleDashboard(user) {
  if (!user || !user.role) { 
    showDefaultView(); 
    return; 
  }

  document.querySelectorAll('.view').forEach(v => { v.style.display = 'none'; });

  if (user.role === 'store') {
    const storeView = document.getElementById('view-store');
    if (storeView) storeView.style.display = 'block';
    ['store-dashboard-section', 'store-inventory-section', 'store-orders-section'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = (id === 'store-dashboard-section') ? 'block' : 'none';
    });
    setTimeout(() => {
      if (typeof window.showStoreDashboard === 'function') window.showStoreDashboard();
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
    if (typeof window.adminTab === 'function') {
      const firstTab = document.querySelector('.admin-side li');
      window.adminTab('dashboard', firstTab);
    }
  } else {
    showDefaultView();
  }
}

function showDefaultView() {
  document.querySelectorAll('.view').forEach(v => { v.style.display = 'none'; });
  const landing = document.getElementById('view-landing');
  if (landing) landing.style.display = 'block';
}

// 2. Force Restore Session
function forceRestoreSession() {
  console.log("🚀 [17-session] Tentative de restauration de session...");
  try {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      window.currentUser = null;
      updateAuthUI(null); 
      showDefaultView(); 
      return;
    }
    const parsed = JSON.parse(savedUser);
    
    // 🔥 Mise à jour de window.currentUser ET de la variable globale currentUser si elle existe
    window.currentUser = parsed;
    if (typeof currentUser !== 'undefined') {
      currentUser = parsed;
    }
    
    console.log("✅ [17-session] Utilisateur restauré :", window.currentUser.name, window.currentUser.role);
    
    if (typeof closeModal === 'function') closeModal('login-modal');
    updateAuthUI(window.currentUser);
    redirectToRoleDashboard(window.currentUser);
  } catch (error) {
    console.error("❌ [17-session] ERREUR CRITIQUE :", error);
    localStorage.removeItem('currentUser');
    window.currentUser = null;
    if (typeof currentUser !== 'undefined') currentUser = null;
    updateAuthUI(null); 
    showDefaultView();
  }
}

// 3. Update Auth UI
function updateAuthUI(user) {
  const authSection = document.getElementById('auth-section');
  const userSection = document.getElementById('user-section');
  const notifContainer = document.getElementById('notif-bell-container');
  const navClient = document.getElementById('nav-client');
  const navDriver = document.getElementById('nav-driver');
  const navStore = document.getElementById('nav-store');
  const navAdmin = document.getElementById('nav-admin');
  const userNameEl = document.getElementById('user-name');
  const userRoleEl = document.getElementById('user-role');
  const userAvatarEl = document.getElementById('user-avatar');

  if (!user) {
    if (authSection) authSection.style.display = 'flex';
    if (userSection) userSection.style.display = 'none';
    if (notifContainer) notifContainer.style.display = 'none';
    [navClient, navDriver, navStore, navAdmin].forEach(nav => { if (nav) nav.style.display = 'none'; });
    return;
  }

  if (authSection) authSection.style.display = 'none';
  if (userSection) userSection.style.display = 'block';
  if (notifContainer) notifContainer.style.display = 'block';

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

  [navClient, navDriver, navStore, navAdmin].forEach(nav => { if (nav) nav.style.display = 'none'; });
  if (user.role === 'client' && navClient) navClient.style.display = 'block';
  if (user.role === 'driver' && navDriver) navDriver.style.display = 'block';
  if (user.role === 'store' && navStore) navStore.style.display = 'block';
  if (user.role === 'admin' && navAdmin) navAdmin.style.display = 'block';

  const walletBlock = document.getElementById('dropdown-wallet');
  const pendingBlock = document.getElementById('dropdown-pending-orders');
  if (walletBlock) walletBlock.style.setProperty('display', 'none', 'important');
  if (pendingBlock) pendingBlock.style.setProperty('display', 'none', 'important');

  if (user.role === 'client' && walletBlock) {
    walletBlock.style.setProperty('display', 'block', 'important');
    const balanceEl = document.getElementById('dropdown-wallet-balance');
    if (balanceEl) balanceEl.textContent = (parseFloat(user.wallet_balance || 0)).toFixed(2);
  } else if (user.role === 'store' && pendingBlock) {
    pendingBlock.style.setProperty('display', 'block', 'important');
    if (typeof fetchPendingOrdersCount === 'function') fetchPendingOrdersCount();
  }

  if (typeof loadUserNotifications === 'function') loadUserNotifications();
  ensureSingleLogoutButton();
}

// 4. Filet de sécurité Déconnexion
// ==========================================
// 🛡️ GARANTIR UN SEUL BOUTON DÉCONNEXION
// ==========================================
function ensureSingleLogoutButton() {
  const menu = document.getElementById('user-dropdown-menu');
  if (!menu) return;

  // 1. Repérer TOUS les boutons dont le libellé contient "Déconnexion"
  const logoutButtons = Array.from(menu.querySelectorAll('button')).filter(btn => {
    const text = (btn.textContent || '').toLowerCase();
    return text.includes('déconnexion') || text.includes('deconnexion');
  });

  // 2. Cas A : aucun bouton → on en injecte un (filet de sécurité)
  if (logoutButtons.length === 0) {
    const separator = document.createElement('div');
    separator.style.cssText = "border-top: 1px solid #e5e7eb; padding: 4px 0; margin-top: 4px;";

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.setAttribute('data-logout-injected', 'true');
    logoutBtn.onclick = function (e) {
      if (typeof window.logout === 'function') window.logout();
      if (typeof window.toggleUserMenu === 'function') window.toggleUserMenu(e);
    };
    logoutBtn.style.cssText = "display: flex !important; width: 100%; text-align: left; padding: 10px 16px; background: transparent !important; border: none !important; cursor: pointer; font-size: 0.85rem; color: #ef4444 !important; font-weight: 600; font-family: inherit; line-height: 1.4; box-sizing: border-box; align-items: center; gap: 10px;";
    logoutBtn.onmouseover = function () { this.style.background = '#fef2f2'; };
    logoutBtn.onmouseout = function () { this.style.background = 'transparent'; };
    logoutBtn.innerHTML = '<span style="font-size: 1rem;">🚪</span> Déconnexion';

    separator.appendChild(logoutBtn);
    menu.appendChild(separator);
    return;
  }

  // 3. Cas B : plusieurs boutons → on garde le premier, on supprime les autres
  for (let i = 1; i < logoutButtons.length; i++) {
    const btn = logoutButtons[i];
    const parent = btn.parentElement;
    btn.remove();
    // Nettoyer le conteneur s'il est resté vide (évite un séparateur orphelin)
    if (parent && parent.querySelectorAll('button').length === 0) {
      parent.remove();
    }
  }

  // 4. Cas C : un seul bouton → rien à faire
}

// 5. Compteur de commandes
async function fetchPendingOrdersCount() {
  if (!window.currentUser || window.currentUser.role !== 'store') return;
  try {
    const { data: storeData } = await supabaseClient.from('stores').select('id').eq('owner_id', window.currentUser.id).maybeSingle();
    if (!storeData) return;
    const { count, error } = await supabaseClient.from('orders').select('*', { count: 'exact', head: true }).eq('store_id', storeData.id).in('status', ['pending', 'confirmed', 'in_progress']);
    if (!error && count !== null) {
      const countEl = document.getElementById('dropdown-pending-count');
      if (countEl) countEl.textContent = count;
    }
  } catch (err) { console.error('❌ Erreur chargement commandes:', err); }
}

// 6. Menu Utilisateur (DOM Escape)
window.toggleUserMenu = function(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('user-dropdown-menu');
  const trigger = document.getElementById('user-menu-trigger');
  if (!menu || !trigger) return;

  const isHidden = menu.style.display === 'none' || menu.style.display === '';
  if (isHidden) {
    document.body.appendChild(menu);
    const rect = trigger.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.style.zIndex = '999999';
    menu.style.display = 'block';
    menu.focus();
  } else {
    menu.style.display = 'none';
  }
};

document.addEventListener('click', function(event) {
  const menu = document.getElementById('user-dropdown-menu');
  const trigger = document.getElementById('user-menu-trigger');
  if (menu && trigger && !menu.contains(event.target) && !trigger.contains(event.target)) {
    menu.style.display = 'none';
  }
});

window.addEventListener('scroll', () => { const m = document.getElementById('user-dropdown-menu'); if (m) m.style.display = 'none'; }, { passive: true });
window.addEventListener('resize', () => { const m = document.getElementById('user-dropdown-menu'); if (m) m.style.display = 'none'; });

// 7. Navigation Active
window.goToMyProfileHome = function() {
  if (!window.currentUser || !window.currentUser.role) return;
  document.querySelectorAll('.view').forEach(v => { v.style.display = 'none'; });

  if (window.currentUser.role === 'client') {
    document.getElementById('view-client').style.display = 'block';
    if (typeof window.showClientStores === 'function') window.showClientStores();
    highlightActiveNav('nav-client', 0);
  } else if (window.currentUser.role === 'store') {
    document.getElementById('view-store').style.display = 'block';
    if (typeof window.goToMyStore === 'function') window.goToMyStore();
    highlightActiveNav('nav-store', 0);
  } else if (window.currentUser.role === 'driver') {
    document.getElementById('view-driver').style.display = 'block';
    if (typeof window.showDriverDashboard === 'function') window.showDriverDashboard();
    highlightActiveNav('nav-driver', 0);
  } else if (window.currentUser.role === 'admin') {
    document.getElementById('view-admin').style.display = 'block';
    if (typeof window.adminTab === 'function') window.adminTab('dashboard', document.querySelector('.admin-side li'));
    highlightActiveNav('nav-admin', 0);
  }
};

window.highlightActiveNav = function(navId, linkIndex) {
  document.querySelectorAll('nav ul li a').forEach(link => link.classList.remove('nav-active'));
  const nav = document.getElementById(navId);
  if (nav) {
    const links = nav.querySelectorAll('a');
    if (links[linkIndex]) links[linkIndex].classList.add('nav-active');
  }
};

document.addEventListener('click', function(event) {
  const target = event.target;
  if (target.tagName === 'A' && target.closest('nav')) {
    const nav = target.closest('nav');
    const links = Array.from(nav.querySelectorAll('a'));
    const index = links.indexOf(target);
    if (index !== -1) highlightActiveNav(nav.id, index);
  }
});

function loadUserNotifications() {
  if (typeof loadNotifications === 'function') loadNotifications();
  else if (typeof initNotifications === 'function') initNotifications();
}

// Déclencheurs
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  forceRestoreSession();
} else {
  document.addEventListener('DOMContentLoaded', forceRestoreSession);
}
document.addEventListener('app:ready', forceRestoreSession);