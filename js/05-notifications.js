// ==========================================
// 🔔 FICHIER 05 : SYSTÈME DE NOTIFICATIONS (COMPLET)
// ==========================================
// Rôle : Cloche, panneau, badge, création, gestion (lu/non lu, suppression)
// Thème : Assorti au header (#0a1929 / #f5a623)
// ==========================================

console.log("🔄 [05-notifications.js] Chargement du système de notifications...");

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const NOTIF_CONFIG = {
  pollInterval: 30000,
  cacheTTL: 30000,
  listLimit: 10,
  allLimit: 30,
  dedupeWindow: 30000
};

// ==========================================
// 🎨 THÈME (ASSORTI AU HEADER)
// ==========================================
const NOTIF_THEME = {
  headerBg: '#0a1929',
  accent: '#f5a623',
  accentHover: '#d48a1b',
  border: '#e5e7eb',
  itemHover: '#f9fafb',
  unreadBg: '#fffbeb',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  danger: '#ef4444'
};

// ==========================================
// 💾 CACHE & GARDE-FOUS
// ==========================================
let notifCache = { html: '', lastUpdate: 0, unreadCount: 0, isOpen: false };
const recentNotifGuard = new Map();
let notifPollingInProgress = false;
let notifVersion = 0;

// ==========================================
// 📋 MODÈLES STANDARDS
// ==========================================
const NOTIF_TEMPLATES = {
  order_created:    { type: 'order',    title: 'Nouvelle commande',   message: 'Vous avez reçu une nouvelle commande.' },
  order_confirmed:  { type: 'order',    title: 'Commande confirmée',  message: 'Votre commande a été confirmée par le commerce.' },
  order_shipping:   { type: 'delivery', title: 'Livraison en cours',  message: 'Votre commande est en route.' },
  order_delivered:  { type: 'delivery', title: 'Commande livrée',     message: 'Votre commande a été livrée. Merci !' },
  order_cancelled:  { type: 'warning',  title: 'Commande annulée',    message: 'Une commande a été annulée.' },
  payment_received: { type: 'success',  title: 'Paiement reçu',       message: 'Un paiement a été crédité sur votre solde.' }
};

// ==========================================
// 🖼️ ICÔNES PAR TYPE (PARTAGÉES)
// ==========================================
function getNotifIcon(type) {
  const icons = {
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    order: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    delivery: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
  };
  return icons[type] || icons.info;
}

// ==========================================
// 🔐 ENVOI SÉCURISÉ (EDGE FUNCTION + FALLBACK)
// ==========================================
async function sendNotificationSecure(payload) {
  try {
    const { data, error } = await supabaseClient.functions.invoke('send-notification', { body: payload });
    if (!error) return true;
    console.warn("⚠️ Edge Function indisponible, bascule sur insert direct :", error.message);
  } catch (edgeErr) {
    console.warn("⚠️ Erreur Edge Function, bascule sur insert direct :", edgeErr);
  }

  try {
    const { error } = await supabaseClient.from('notifications').insert({
      user_id: payload.user_id,
      title: payload.title,
      message: payload.message || '',
      type: payload.type || 'info',
      is_read: false
    });
    if (error) { console.warn("⚠️ Notification ignorée (RLS) :", error.message); return false; }
    return true;
  } catch (dbErr) {
    console.warn("⚠️ Erreur insert direct :", dbErr);
    return false;
  }
}

async function pushNotification(payload) {
  const key = `${payload.user_id}|${payload.type}|${payload.title}`;
  const now = Date.now();
  const last = recentNotifGuard.get(key) || 0;

  if (now - last < NOTIF_CONFIG.dedupeWindow) {
    console.log("⏭️ Notification dupliquée ignorée :", payload.title);
    return false;
  }
  recentNotifGuard.set(key, now);

  const ok = await sendNotificationSecure(payload);
  if (ok) {
    notifVersion++;
    notifCache.html = '';
    notifCache.lastUpdate = 0;
  }
  return ok;
}

// ==========================================
// 🔔 API PUBLIQUE (STANDARDISÉE)
// ==========================================
async function notifyEvent(eventKey, userId, customMessage = null) {
  const tpl = NOTIF_TEMPLATES[eventKey];
  if (!tpl || !userId) return;
  await pushNotification({
    user_id: String(userId),
    title: tpl.title,
    message: customMessage || tpl.message,
    type: tpl.type
  });
}

async function createNotificationForUser(userId, title, message, type = 'order') {
  if (!userId) return;
  await pushNotification({ user_id: String(userId), title, message, type });
}

async function showNotification(title, message, type = 'info', targetUserId = null) {
  if (!currentUser || !currentUser.id) return;
  if (targetUserId === 'admin' || targetUserId === 'client' || targetUserId === 'store') return;
  const userId = targetUserId || currentUser.id;
  await pushNotification({ user_id: userId, title, message, type });
}

// ==========================================
// 🔔 OUVRIR/FERMER LE PANNEAU
// ==========================================
async function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;

  const isVisible = panel.style.display === 'block' || panel.style.display === 'flex';

  if (!isVisible) {
    notifCache.isOpen = true;
    panel.style.display = 'block';

    const now = Date.now();
    if (!notifCache.html || (now - notifCache.lastUpdate) > NOTIF_CONFIG.cacheTTL) {
      await refreshNotificationsAuto(true);
    } else {
      const list = document.getElementById('notif-list');
      if (list) list.innerHTML = notifCache.html;
    }
  } else {
    notifCache.isOpen = false;
    panel.style.display = 'none';
  }
}

// ==========================================
// 🕐 ANALYSE ROBUSTE DES DATES
// ==========================================
function parseDateSafe(input) {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input === 'number') return new Date(input);

  const str = String(input).trim();
  if (!str) return null;

  let d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(str)) {
    d = new Date(str.replace(' ', 'T') + 'Z');
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

// ==========================================
// 🕐 FORMATAGE STANDARDISÉ (RELATIF PUIS ABSOLU)
// ==========================================
function formatHeureManiwaki(dateInput) {
  const date = parseDateSafe(dateInput);
  if (!date) return 'Date inconnue';

  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMs >= 0 && diffMin < 1)  return "À l'instant";
  if (diffMs >= 0 && diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffMs >= 0 && diffH < 24)   return `il y a ${diffH} h`;

  const options = {
    timeZone: 'America/Montreal',
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  };
  return date.toLocaleString('fr-CA', options).replace(',', ' à');
}

// ==========================================
// 🧹 NETTOYAGE : SUPPRIME LES ÉMOJIS DU TEXTE
// ==========================================
function stripEmoji(text) {
  if (!text) return '';
  return String(text)
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ==========================================
// 🔔 MISE À JOUR DU COMPTEUR DANS L'EN-TÊTE DU PANNEAU
// ==========================================
function updatePanelCount(count) {
  const el = document.getElementById('notif-panel-count');
  if (!el) return;
  if (count > 0) {
    el.textContent = count > 99 ? '99+' : count;
    el.style.display = 'inline-block';
  } else {
    el.style.display = 'none';
  }
}

// ==========================================
// 🔔 RENDU D'UNE NOTIFICATION (LISTE PRINCIPALE)
// ==========================================
function renderNotifItem(n) {
  const icon = getNotifIcon(n.type);
  const heure = formatHeureManiwaki(n.created_at);
  const title = stripEmoji(n.title) || 'Notification';
  const cleanMessage = stripEmoji(n.message);
  const isUnread = !n.is_read;

  const messageHtml = (cleanMessage && cleanMessage.toLowerCase() !== title.toLowerCase())
    ? `<div style="font-size: 0.78rem; color: ${NOTIF_THEME.textSecondary}; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${cleanMessage}</div>`
    : '';

  return `
    <div class="notif-item"
         style="padding: 12px 16px; border-bottom: 1px solid ${NOTIF_THEME.border}; display: flex; align-items: flex-start; gap: 12px; cursor: pointer; transition: background 0.2s; background: #ffffff;"
         onclick="markNotifRead('${n.id}')"
         onmouseover="this.style.background='${NOTIF_THEME.itemHover}'"
         onmouseout="this.style.background='#ffffff'">
      <div style="flex: 0 0 20px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; margin-top: 1px;">${icon}</div>
      <div style="flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
        <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px;">
          <div style="flex: 1 1 auto; min-width: 0; font-weight: ${isUnread ? 600 : 500}; color: ${NOTIF_THEME.textPrimary}; font-size: 0.85rem; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</div>
          <div style="flex: 0 0 auto; font-size: 0.7rem; color: ${NOTIF_THEME.textMuted}; white-space: nowrap;">${heure}</div>
        </div>
        ${messageHtml}
      </div>
      ${isUnread ? `<div style="flex: 0 0 8px; width: 8px; height: 8px; border-radius: 50%; background: ${NOTIF_THEME.accent}; margin-top: 6px;"></div>` : ''}
    </div>
  `;
}

// ==========================================
// 🔔 RAFRAÎCHISSEMENT (NON-LUS SEULEMENT + GARDE)
// ==========================================
async function refreshNotificationsAuto(forceRender = false) {
  if (!window.currentUser || !window.currentUser.id) return;

  const version = notifVersion;

  try {
    // 1. Badge : compteur exact des non-lues
    const { count, error: countError } = await supabaseClient
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', window.currentUser.id)
      .eq('is_read', false);

    if (countError) return;
    if (version !== notifVersion) return;

    const newUnreadCount = count || 0;
    notifCache.unreadCount = newUnreadCount;

    // Badge cloche
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (newUnreadCount > 0) {
        badge.textContent = newUnreadCount > 99 ? '99+' : newUnreadCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    // Compteur dans l'en-tête du panneau
    updatePanelCount(newUnreadCount);

    // 2. Liste : uniquement les non-lues
    if (forceRender) {
      const { data: notifs, error } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', window.currentUser.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(NOTIF_CONFIG.listLimit);

      if (error || !notifs) return;
      if (version !== notifVersion) return;

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
        html = notifs.map(renderNotifItem).join('');
      }

      notifCache.html = html;
      notifCache.lastUpdate = Date.now();

      const list = document.getElementById('notif-list');
      if (list) list.innerHTML = html;
    }
  } catch (err) {
    console.error("❌ Erreur refresh notifications:", err);
  }
}

// ==========================================
// 🔔 MARQUER COMME LUE (1)
// ==========================================
async function markNotifRead(notifId) {
  try {
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId);
    if (error) throw error;

    notifVersion++;
    notifCache.html = '';
    notifCache.lastUpdate = 0;
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
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false);
    if (error) throw error;

    notifVersion++;
    notifCache.html = '';
    notifCache.lastUpdate = 0;
    await refreshNotificationsAuto(true);
    console.log("✅ Toutes les notifications marquées comme lues");
  } catch (err) {
    console.error('Erreur markAllRead:', err);
  }
}

// ==========================================
// 🔔 TOUT MARQUER COMME NON LU
// ==========================================
async function markAllUnread() {
  if (!currentUser || !currentUser.id) return;
  try {
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: false })
      .eq('user_id', currentUser.id)
      .eq('is_read', true);
    if (error) throw error;

    notifVersion++;
    notifCache.html = '';
    notifCache.lastUpdate = 0;
    await refreshNotificationsAuto(true);

    const modal = document.getElementById('notif-all-modal');
    if (modal && modal.style.display === 'flex') await loadNotifAll();
    console.log("✅ Toutes les notifications marquées comme non lues");
  } catch (err) {
    console.error('Erreur markAllUnread:', err);
  }
}

// ==========================================
// 🔔 BASCULER LU / NON LU (1) — DEPUIS LA MODALE
// ==========================================
async function toggleNotifRead(notifId, currentlyUnread) {
  try {
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: !currentlyUnread })
      .eq('id', notifId);
    if (error) throw error;

    notifVersion++;
    notifCache.html = '';
    notifCache.lastUpdate = 0;
    await Promise.all([refreshNotificationsAuto(true), loadNotifAll()]);
  } catch (err) {
    console.error('Erreur toggleNotifRead:', err);
  }
}

// ==========================================
// 🗑️ SUPPRIMER UNE NOTIFICATION (1)
// ==========================================
async function deleteNotif(notifId) {
  try {
    const { error } = await supabaseClient
      .from('notifications')
      .delete()
      .eq('id', notifId);
    if (error) throw error;

    notifVersion++;
    notifCache.html = '';
    notifCache.lastUpdate = 0;
    await Promise.all([refreshNotificationsAuto(true), loadNotifAll()]);
  } catch (err) {
    console.error('Erreur deleteNotif:', err);
  }
}

// ==========================================
// 🗑️ TOUT SUPPRIMER
// ==========================================
async function deleteAllNotifs() {
  if (!currentUser || !currentUser.id) return;
  if (!confirm('Supprimer toutes les notifications ?')) return;

  try {
    const { error } = await supabaseClient
      .from('notifications')
      .delete()
      .eq('user_id', currentUser.id);
    if (error) throw error;

    notifVersion++;
    notifCache.html = '';
    notifCache.lastUpdate = 0;
    await refreshNotificationsAuto(true);

    const modal = document.getElementById('notif-all-modal');
    if (modal && modal.style.display === 'flex') await loadNotifAll();
    console.log("✅ Toutes les notifications supprimées");
  } catch (err) {
    console.error('Erreur deleteAllNotifs:', err);
  }
}

// ==========================================
// 📜 MODALE « VOIR TOUT L'HISTORIQUE »
// ==========================================
function openNotifAllModal() {
  const modal = document.getElementById('notif-all-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  loadNotifAll();
}

function closeNotifAllModal() {
  const modal = document.getElementById('notif-all-modal');
  if (modal) modal.style.display = 'none';
}

async function loadNotifAll() {
  if (!currentUser || !currentUser.id) return;
  const list = document.getElementById('notif-all-list');
  if (!list) return;

  list.innerHTML = '<div style="padding: 2rem; text-align: center; color: #9ca3af;">Chargement…</div>';

  try {
    const { data, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(NOTIF_CONFIG.allLimit);

    if (error) throw error;

    if (!data || data.length === 0) {
      list.innerHTML = `
        <div style="padding: 2.5rem 1rem; text-align: center; color: #9ca3af;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;">🔔</div>
          <div style="font-size: 0.9rem; font-weight: 500; color: #374151;">Aucune notification</div>
        </div>`;
      return;
    }

    list.innerHTML = data.map(renderNotifAllItem).join('');
  } catch (err) {
    console.error('Erreur loadNotifAll:', err);
    list.innerHTML = '<div style="padding: 2rem; text-align: center; color: #ef4444;">Erreur de chargement.</div>';
  }
}

function renderNotifAllItem(n) {
  const icon = getNotifIcon(n.type);
  const heure = formatHeureManiwaki(n.created_at);
  const title = stripEmoji(n.title) || 'Notification';
  const cleanMessage = stripEmoji(n.message);
  const unread = !n.is_read;

  const messageHtml = (cleanMessage && cleanMessage.toLowerCase() !== title.toLowerCase())
    ? `<div style="font-size: 0.78rem; color: ${NOTIF_THEME.textSecondary}; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${cleanMessage}</div>`
    : '';

  return `
    <div style="padding: 12px 16px; border-bottom: 1px solid ${NOTIF_THEME.border}; display: flex; align-items: flex-start; gap: 12px; background: ${unread ? NOTIF_THEME.unreadBg : '#ffffff'};">
      <div style="flex: 0 0 20px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; margin-top: 1px;">${icon}</div>
      <div style="flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
        <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px;">
          <div style="flex: 1 1 auto; min-width: 0; font-weight: ${unread ? 600 : 500}; color: ${NOTIF_THEME.textPrimary}; font-size: 0.85rem; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</div>
          <div style="flex: 0 0 auto; font-size: 0.7rem; color: ${NOTIF_THEME.textMuted}; white-space: nowrap;">${heure}</div>
        </div>
        ${messageHtml}
        <div style="font-size: 0.68rem; font-weight: 600; color: ${unread ? NOTIF_THEME.accent : NOTIF_THEME.textMuted}; text-transform: uppercase; letter-spacing: 0.4px;">
          ${unread ? 'Non lue' : 'Lue'}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; flex-shrink: 0;">
        <button class="ntf-icon-btn" title="${unread ? 'Marquer comme lue' : 'Marquer comme non lue'}" onclick="event.stopPropagation(); toggleNotifRead('${n.id}', ${unread})">${unread ? '✓' : '↺'}</button>
        <button class="ntf-icon-btn danger" title="Supprimer" onclick="event.stopPropagation(); deleteNotif('${n.id}')">🗑</button>
      </div>
    </div>
  `;
}

// ==========================================
// 🔔 INITIALISATION
// ==========================================
async function initNotifications() {
  if (currentUser && currentUser.id) {
    const bellContainer = document.getElementById('notif-bell-container');
    if (bellContainer) bellContainer.style.display = 'block';
    await refreshNotificationsAuto(true);
  }
}

// ==========================================
// 🔔 POLLING (TRAFIC RÉDUIT)
// ==========================================
async function pollNotifications() {
  if (!currentUser || !currentUser.id) return;
  if (document.visibilityState !== 'visible') return;
  if (notifPollingInProgress) return;

  notifPollingInProgress = true;
  try {
    await refreshNotificationsAuto(false);
  } finally {
    notifPollingInProgress = false;
  }
}

if (typeof currentUser !== 'undefined' && currentUser && currentUser.id) {
  refreshNotificationsAuto(true);
  console.log(`🔔 [NOTIFICATIONS] Système activé (polling ${NOTIF_CONFIG.pollInterval / 1000}s)`);
}

window.notifIntervalId = setInterval(pollNotifications, NOTIF_CONFIG.pollInterval);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentUser && currentUser.id) {
    const now = Date.now();
    if (now - notifCache.lastUpdate > NOTIF_CONFIG.pollInterval) {
      pollNotifications();
    }
  }
});

// Fermer le panneau si clic ailleurs
document.addEventListener('click', function (e) {
  const panel = document.getElementById('notif-panel');
  const bell = document.querySelector('.notif-bell');
  if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.style.display = 'none';
    notifCache.isOpen = false;
  }
});

console.log("✅ [05-notifications.js] Système de notifications complet chargé !");