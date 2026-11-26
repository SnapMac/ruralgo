// ==========================================
// 🔔 FICHIER 05 : SYSTÈME DE NOTIFICATIONS (OPTIMISÉ)
// ==========================================
// Rôle : Cloche, panneau, badge, création de notifications
// Optimisations : Cache HTML, formatage d'heure statique, rendu conditionnel
// ==========================================

console.log("🔄 [05-notifications.js] Chargement du système de notifications...");

// ==========================================
// 💾 CACHE DES NOTIFICATIONS (ÉVITE LES CLIGNOTEMENTS)
// ==========================================
let notifCache = {
  html: '',
  lastUpdate: 0,
  unreadCount: 0,
  isOpen: false
};

// ==========================================
// 🔔 CRÉATION D'UNE NOTIFICATION POUR UN UTILISATEUR
// ==========================================
async function createNotificationForUser(userId, title, message) {
  try {
    await supabaseClient.from('notifications').insert({
      user_id: String(userId),
      title: title,
      message: message,
      type: 'order',
      is_read: false
    });
    console.log("✅ Notification créée pour :", userId);
    notifCache.lastUpdate = 0; // Invalider le cache pour forcer une mise à jour
  } catch (err) {
    console.error("❌ Erreur création notification:", err);
  }
}

// ==========================================
// 🔔 AFFICHER UNE NOTIFICATION (GÉNÉRIQUE)
// ==========================================
async function showNotification(title, message, type = 'info', targetUserId = null) {
  if (!currentUser || !currentUser.id) return;
  if (targetUserId === 'admin' || targetUserId === 'client' || targetUserId === 'store') return;

  let userId = targetUserId || currentUser.id;

  try {
    const { error } = await supabaseClient.from('notifications').insert({
      user_id: userId,
      title: title,
      message: message,
      type: type,
      is_read: false
    });
    if (error) console.log("⚠️ Notification ignorée (sans gravité)");
    else notifCache.lastUpdate = 0; // Invalider le cache
  } catch (err) {
    // Ignoré silencieusement pour ne pas bloquer le site
  }
}

// ==========================================
// 🔔 OUVRIR/FERMER LE PANNEAU DE NOTIFICATIONS
// ==========================================
async function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;

  const isVisible = panel.style.display === 'block' || panel.style.display === 'flex';

  if (!isVisible) {
    notifCache.isOpen = true;
    panel.style.display = 'block';

    // Utiliser le cache si moins de 10 secondes, sinon recharger depuis la BDD
    const now = Date.now();
    if (!notifCache.html || (now - notifCache.lastUpdate) > 10000) {
      await refreshNotificationsAuto(true); // true = forcer le rendu DOM
    } else {
      document.getElementById('notif-list').innerHTML = notifCache.html;
    }
  } else {
    notifCache.isOpen = false;
    panel.style.display = 'none';
  }
}

// ==========================================
// 🔔 FORMATAGE DE L'HEURE POUR MANIWAKI (STATIQUE)
// ==========================================
function formatHeureManiwaki(dateString) {
  if (!dateString) return "À l'instant";
  const isoString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Date invalide";

  const options = {
    timeZone: 'America/Montreal',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  return date.toLocaleString('fr-CA', options).replace(',', ' à');
}

// ==========================================
// 🔔 RAFRAÎCHISSEMENT DES NOTIFICATIONS (AVEC CACHE)
// ==========================================
// ==========================================
// 🔔 RAFRAÎCHISSEMENT DES NOTIFICATIONS (VERSION COMPLÈTE & CORRIGÉE)
// ==========================================
async function refreshNotificationsAuto(forceRender = false) {
  if (!window.currentUser || !window.currentUser.id) return;

  try {
    // 1. Compter les notifications non lues
    const { data: unreadData, error: unreadError } = await supabaseClient
      .from('notifications')
      .select('id')
      .eq('user_id', window.currentUser.id)
      .eq('is_read', false);

    if (unreadError) return;

    const newUnreadCount = unreadData ? unreadData.length : 0;
    const badge = document.getElementById('notif-badge');

    if (badge) {
      if (newUnreadCount > 0) {
        badge.textContent = newUnreadCount > 99 ? '99+' : newUnreadCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    // 2. Charger les notifications si nécessaire
    if (forceRender) {
      const { data: notifs, error } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', window.currentUser.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !notifs) return;

      // 3. Générer le HTML
      let html = '';

      if (notifs.length === 0) {
        html = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2.5rem 1rem; color: #9ca3af; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;">🔔</div>
            <div style="font-size: 0.9rem; font-weight: 500; color: #374151;">Aucune notification</div>
            <div style="font-size: 0.8rem; margin-top: 0.25rem;">Vous êtes à jour !</div>
          </div>
        `;
      } else {
        // Icônes SVG par type
        const icons = {
          info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
          success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
          warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
          error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
          order: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
          delivery: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
        };

        html = notifs.map(n => {
          const icon = icons[n.type] || icons.info;
          const date = new Date(n.created_at);
          const heureCorrecte = date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }) + ' ' + date.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });

          // Texte par défaut si aucun titre n'existe
          const titleText = n.title || (n.type === 'order' ? 'Nouvelle commande' : n.type === 'delivery' ? 'Mise à jour livraison' : 'Notification');
          const isUnread = !n.is_read;

          return `
            <div class="notif-item" 
                 style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: flex-start; gap: 12px; cursor: pointer; transition: background 0.2s ease; background: ${isUnread ? '#fffbeb' : '#ffffff'};"
                 onclick="markNotifRead(${n.id})"
                 onmouseover="this.style.background='#f9fafb'"
                 onmouseout="this.style.background='${isUnread ? '#fffbeb' : '#ffffff'}'">
              
              <!-- Icône -->
              <div style="flex-shrink: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; margin-top: 2px;">
                ${icon}
              </div>
              
              <!-- Contenu (Titre + Message + Date) -->
              <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
                
                <!-- TITRE -->
                <div style="font-weight: ${isUnread ? '600' : '500'}; color: #111827; font-size: 0.85rem; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${titleText}
                </div>
                
                <!-- MESSAGE (Affiché uniquement s'il existe et qu'il est différent du titre) -->
                ${n.message && n.message.toLowerCase() !== (n.title || '').toLowerCase() ? `
                  <div style="font-size: 0.75rem; color: #6b7280; line-height: 1.4; margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${n.message}
                  </div>
                ` : ''}

                <!-- DATE -->
                <div style="font-size: 0.7rem; color: #9ca3af; margin-top: 4px;">
                  ${heureCorrecte}
                </div>
              </div>

              <!-- Point orange (Non lu) -->
              ${isUnread ? '<div style="flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%; background: #f5a623; margin-top: 6px;"></div>' : ''}
            </div>
          `;
        }).join('');
      }

      const list = document.getElementById('notif-list');
      if (list) list.innerHTML = html;
    }
  } catch (err) {
    console.error("❌ Erreur refresh notifications:", err);
  }
}

// ==========================================
// 🔔 MARQUER UNE NOTIFICATION COMME LUE
// ==========================================
async function markNotifRead(notifId) {
  try {
    await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId);

    notifCache.lastUpdate = 0; // Invalider le cache
    await refreshNotificationsAuto(true);
  } catch (err) {
    console.error("❌ Erreur markNotifRead:", err);
  }
}

// ==========================================
// 🔔 TOUT MARQUER COMME LU
// ==========================================
async function markAllRead() {
  if (!currentUser || !currentUser.id) return;

  try {
    await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false);

    notifCache.lastUpdate = 0; // Invalider le cache
    await refreshNotificationsAuto(true);
    showToast('✅ Toutes les notifications marquées comme lues');
  } catch (err) {
    console.error('Erreur markAllRead:', err);
  }
}

// ==========================================
// 🔔 INITIALISER LES NOTIFICATIONS
// ==========================================
async function initNotifications() {
  if (currentUser && currentUser.id) {
    const bellContainer = document.getElementById('notif-bell-container');
    if (bellContainer) bellContainer.style.display = 'block';
    await refreshNotificationsAuto(true);
  }
}

// ==========================================
// 🔔 DÉMARRER LE POLLING DES NOTIFICATIONS
// ==========================================
// Intervalle de 5 secondes (plus efficace pour Supabase que 1.5s)
if (typeof currentUser !== 'undefined' && currentUser && currentUser.id) {
  refreshNotificationsAuto(true);
  console.log("🔔 [NOTIFICATIONS] Système activé (Polling 5s)");
}

window.notifIntervalId = setInterval(() => {
  if (currentUser && currentUser.id) {
    // On ne force pas le rendu DOM à chaque polling, seulement le badge et le cache
    refreshNotificationsAuto(false);
  }
}, 5000);

// ==========================================
// 🔔 FERMER LE PANNEAU SI ON CLIQUE AILLEURS
// ==========================================
document.addEventListener('click', function (e) {
  const panel = document.getElementById('notif-panel');
  const bell = document.querySelector('.notif-bell');
  if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.style.display = 'none';
    notifCache.isOpen = false;
  }
});

console.log("✅ [05-notifications.js] Système de notifications optimisé chargé !");