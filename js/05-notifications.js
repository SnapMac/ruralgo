// ==========================================
// 🔔 FICHIER 05 : SYSTÈME DE NOTIFICATIONS
// ==========================================
// Rôle : Cloche, panneau, badge, création de notifications
// ==========================================

console.log("🔄 [05-notifications.js] Chargement du système de notifications...");

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
  } catch (err) {
    console.error("❌ Erreur création notification:", err);
  }
}

// ==========================================
// 🔔 AFFICHER UNE NOTIFICATION (GÉNÉRIQUE)
// ==========================================
async function showNotification(title, message, type = 'info', targetUserId = null) {
  // 1. Si personne n'est connecté, on ne fait rien
  if (!currentUser || !currentUser.id) return;

  // 2. Si on essaie d'envoyer à "admin", "client" ou "store" (au lieu d'un vrai ID), on annule
  if (targetUserId === 'admin' || targetUserId === 'client' || targetUserId === 'store') {
    return; 
  }

  let userId = targetUserId || currentUser.id;

  try {
    const { error } = await supabaseClient.from('notifications').insert({
      user_id: userId,
      title: title,
      message: message,
      type: type,
      is_read: false
    });
    
    // Si ça plante, on l'ignore silencieusement pour ne pas bloquer le site
    if (error) {
      console.log("⚠️ Notification ignorée (sans gravité)");
    }
  } catch (err) {
    // On bloque l'erreur pour qu'elle n'apparaisse plus en rouge
  }
}

// ==========================================
// 🔔 OUVRIR/FERMER LE PANNEAU DE NOTIFICATIONS
// ==========================================
async function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  
  if (panel.style.display === 'none' || !panel.style.display) {
    panel.style.display = 'flex';
    await loadNotifPanel();
  } else {
    panel.style.display = 'none';
  }
}

// ==========================================
// 🔔 CHARGER LES NOTIFICATIONS DANS LE PANNEAU
// ==========================================
async function loadNotifPanel() {
  if (!currentUser || !currentUser.id) return;
  
  try {
    const { data, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    const list = document.getElementById('notif-list');
    if (!list) return;
    
    if (!data || data.length === 0) {
      list.innerHTML = '<div style="padding:2rem;text-align:center;color:#9ca3af;">🔔 Aucune notification</div>';
      return;
    }
    
    list.innerHTML = data.map(notif => {
      const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', order: '📦', delivery: '🚚' };
      const icon = icons[notif.type] || 'ℹ️';
      const date = new Date(notif.created_at).toLocaleString('fr-CA', { 
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
      });
      const unreadClass = notif.is_read ? 'read' : 'unread';
      
      return `
        <div class="notif-item ${unreadClass}" onclick="markAsRead(${notif.id})">
          <div class="notif-title">${icon} ${notif.title}</div>
          <div class="notif-message">${notif.message}</div>
          <div class="notif-date">${date}</div>
        </div>
      `;
    }).join('');
    // ✅ NOUVEAU : Ne plus écraser le badge avec seulement 20 notifs
// Le badge est déjà mis à jour correctement par refreshNotificationsAuto()
// updateNotifBadge(data);  ← On commente cette ligne
  } catch (err) {
    console.error('Erreur loadNotifPanel:', err);
  }
}

// ==========================================
// 🔔 MARQUER UNE NOTIFICATION COMME LUE
// ==========================================
async function markAsRead(notifId) {
  try {
    await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId);
    
    await loadNotifPanel();
  } catch (err) {
    console.error('Erreur markAsRead:', err);
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
    
    await loadNotifPanel();
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
    await updateNotifBadge();
  }
}

// ==========================================
// 🔔 METTRE À JOUR LE BADGE DE NOTIFICATIONS
// ==========================================
async function updateNotifBadge(notifications) {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  
  let unreadCount = 0;
  
  if (notifications && Array.isArray(notifications)) {
    unreadCount = notifications.filter(n => !n.is_read).length;
  } else if (currentUser && currentUser.id) {
    try {
      const { data, error } = await supabaseClient
        .from('notifications')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('is_read', false);
      
      if (!error && data) {
        unreadCount = data.length;
      }
    } catch (err) {
      console.error('Erreur mise à jour badge:', err);
    }
  }
  
  if (unreadCount > 0) {
    badge.textContent = unreadCount > 99 ? '9+' : unreadCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// ==========================================
// 🔔 FORMATAGE DE L'HEURE POUR MANIWAKI
// ==========================================
function formatHeureManiwaki(dateString) {
  if (!dateString) return "À l'instant";
  
  const isoString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  const date = new Date(isoString);
  
  if (isNaN(date.getTime())) {
    return "Date invalide";
  }
  
  const options = {
    timeZone: 'America/Montreal',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  return date.toLocaleString('fr-CA', options).replace(',', ' à');
}

// ==========================================
// 🔔 RAFRAÎCHISSEMENT AUTOMATIQUE DES NOTIFICATIONS
// ==========================================
// ==========================================
// 🔔 RAFRAÎCHISSEMENT AUTOMATIQUE DES NOTIFICATIONS (VERSION CORRIGÉE)
// ==========================================
async function refreshNotificationsAuto() {
  if (!currentUser || !currentUser.id) {
    return;
  }
  
  try {
    // ✅ ÉTAPE 1 : Compter TOUTES les notifications non lues (SANS LIMITE)
    // C'est ÇA qui fait que le badge monte jusqu'à 99+
    const { data: unreadData, error: unreadError } = await supabaseClient
      .from('notifications')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('is_read', false);
    
    if (unreadError) {
      console.error("❌ Erreur comptage notifications:", unreadError);
      return;
    }
    
    const unreadCount = unreadData ? unreadData.length : 0;
    
    // ✅ ÉTAPE 2 : Mettre à jour le badge avec le VRAI nombre
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
    
    // ✅ ÉTAPE 3 : Charger seulement les 20 DERNIÈRES pour l'affichage
    // (pour ne pas surcharger le panneau, mais le badge compte TOUT)
    const { data: notifs, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error("❌ Erreur chargement notifications:", error);
      return;
    }
    
    if (!notifs) return;
    
    // ✅ ÉTAPE 4 : Afficher les notifications dans le panneau
    const notifList = document.getElementById('notif-list');
    if (notifList && notifs.length > 0) {
      notifList.innerHTML = notifs.map(n => {
        const heureCorrecte = formatHeureManiwaki(n.created_at);
        const bgColor = n.is_read ? '#f9fafb' : '#fff9f0';
        const fontWeight = n.is_read ? 'normal' : 'bold';
        
        return `
          <div class="notif-item" style="padding: 1rem; border-bottom: 1px solid #e5e7eb; background: ${bgColor}; cursor: pointer; transition: background 0.2s;"
               onclick="markNotifRead(${n.id})"
               onmouseover="this.style.background='#f3f4f6'"
               onmouseout="this.style.background='${bgColor}'">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <div style="font-weight: ${fontWeight}; color: #0a1929; flex: 1;">${n.title || 'Notification'}</div>
              ${!n.is_read ? '<div style="width: 8px; height: 8px; border-radius: 50%; background: #f5a623; margin-left: 8px;"></div>' : ''}
            </div>
            <div style="font-size: 0.9rem; color: #6b7280; line-height: 1.4;">${n.message || ''}</div>
            <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem;">🕐 ${heureCorrecte}</div>
          </div>
        `;
      }).join('');
    } else if (notifList) {
      notifList.innerHTML = '<p style="padding: 2rem; text-align: center; color: #6b7280;">Aucune notification</p>';
    }
  } catch (err) {
    console.error("❌ Erreur refresh notifications:", err);
  }
}
// ==========================================
// 🔔 MARQUER UNE NOTIFICATION COMME LUE (VERSION ALTERNATIVE)
// ==========================================
async function markNotifRead(notifId) {
  try {
    await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId);
    
    await refreshNotificationsAuto();
  } catch (err) {
    console.error("❌ Erreur markNotifRead:", err);
  }
}

// ==========================================
// 🔔 DÉMARRER LE POLLING DES NOTIFICATIONS
// ==========================================
if (typeof currentUser !== 'undefined' && currentUser && currentUser.id) {
  refreshNotificationsAuto();
  console.log("🔔 [NOTIFICATIONS] Système activé");
}

// Polling toutes les 1.5 secondes
window.notifIntervalId = setInterval(() => {
  if (currentUser && currentUser.id) {
    refreshNotificationsAuto();
  }
}, 1500);

// ==========================================
// 🔔 FERMER LE PANNEAU SI ON CLIQUE AILLEURS
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
console.log("✅ [05-notifications.js] Système de notifications chargé !");