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
async function refreshNotificationsAuto(forceRender = false) {
  if (!currentUser || !currentUser.id) return;
  
  try {
    // 1. Compter TOUTES les notifications non lues (pour le badge)
    const { data: unreadData, error: unreadError } = await supabaseClient
      .from('notifications')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('is_read', false);
    
    if (unreadError) return;
    
    const newUnreadCount = unreadData ? unreadData.length : 0;
    
    // 2. Mettre à jour le badge uniquement si le nombre a changé
    if (newUnreadCount !== notifCache.unreadCount || forceRender) {
      notifCache.unreadCount = newUnreadCount;
      const badge = document.getElementById('notif-badge');
      if (badge) {
        if (newUnreadCount > 0) {
          badge.textContent = newUnreadCount > 99 ? '99+' : newUnreadCount;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }
    }

    // 3. Charger les 20 dernières pour l'affichage
    const { data: notifs, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error || !notifs) return;

    // 4. Générer le HTML (seulement si le panneau est ouvert ou si on force le rendu)
    if (notifCache.isOpen || forceRender) {
      let html = '';
      if (notifs.length === 0) {
        html = '<div style="padding:2rem;text-align:center;color:#9ca3af;font-size:0.85rem;">🔔 Aucune notification</div>';
      } else {
        html = notifs.map(n => {
          const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', order: '📦', delivery: '🚚' };
          const icon = icons[n.type] || '🔔';
          const heureCorrecte = formatHeureManiwaki(n.created_at); // Heure statique, pas de clignotement
          const bgColor = n.is_read ? 'transparent' : 'rgba(245, 166, 35, 0.05)';
          const fontWeight = n.is_read ? '400' : '600';
          
          return `
            <div style="padding: 12px 16px; border-bottom: 1px solid rgba(229, 231, 235, 0.3); display: flex; gap: 12px; align-items: flex-start; background: ${bgColor}; cursor: pointer; transition: background 0.2s;"
                 onclick="markNotifRead(${n.id})"
                 onmouseover="this.style.background='rgba(243, 244, 246, 0.5)'"
                 onmouseout="this.style.background='${bgColor}'">
              <div style="font-size: 1.2rem; flex-shrink: 0;">${icon}</div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: ${fontWeight}; color: #1f2937; font-size: 0.85rem; line-height: 1.4; word-break: break-word;">
                  ${n.title || 'Notification'}
                </div>
                <div style="font-size: 0.8rem; color: #6b7280; margin-top: 4px; line-height: 1.4;">
                  ${n.message || ''}
                </div>
                <div style="font-size: 0.7rem; color: #9ca3af; margin-top: 6px;">
                  🕐 ${heureCorrecte}
                </div>
              </div>
              ${!n.is_read ? '<div style="width: 8px; height: 8px; border-radius: 50%; background: #f5a623; flex-shrink: 0; margin-top: 6px;"></div>' : ''}
            </div>
          `;
        }).join('');
      }
      
      notifCache.html = html;
      notifCache.lastUpdate = Date.now();
      document.getElementById('notif-list').innerHTML = html;
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
document.addEventListener('click', function(e) {
  const panel = document.getElementById('notif-panel');
  const bell = document.querySelector('.notif-bell');
  if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.style.display = 'none';
    notifCache.isOpen = false;
  }
});

console.log("✅ [05-notifications.js] Système de notifications optimisé chargé !");