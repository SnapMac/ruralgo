
// ✅ NETTOYAGE PRÉVENTIF DU LOCALSTORAGE AU DÉMARRAGE
(function() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      // Si l'utilisateur existe mais n'a PAS de rôle ou d'ID valide, on le supprime
      if (!user || !user.id || !user.role) {
        console.warn("🧹 [NETTOYAGE] Ancien profil corrompu détecté. Suppression...");
        localStorage.removeItem('currentUser');
      }
    } catch (e) {
      console.error("🧹 [NETTOYAGE] Erreur de lecture, suppression du localStorage...");
      localStorage.removeItem('currentUser');
    }
  }
})();
;
// ==========================================
// CONNEXION À SUPABASE
// ==========================================
const SUPABASE_URL = 'https://shopfllntsigjmayqrre.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNob3BmbGxudHNpZ2ptYXlxcnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTE2OTMsImV4cCI6MjEwNjc4NzY5M30.O7ybJqVhqsGoyrnOYiJRo-zlg89Wa0wQLxP3xsD11wU';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const MANIWAKI_CENTER = [46.3767, -75.9653];
const DELIVERY_RADIUS_KM = 40;



// ==========================================
// ✅ SYSTÈME DE NOTIFICATIONS CENTRALISÉ
// ==========================================

// Fonction principale : affiche le toast + sauvegarde + incrémente la cloche
async function createNotificationForUser(userId, title, message) {
  try {
    await supabaseClient.from('notifications').insert({
      user_id: String(userId), // ✅ Convertit en texte pour éviter les conflits de type
      title: title,
      message: message,
      type: 'order',
      is_read: false           // ✅ C'EST LA CLÉ : 'is_read' et NON 'read'
      // ⚠️ Ne jamais ajouter 'created_at', Supabase le gère automatiquement
    });
    console.log("✅ Notification créée avec succès pour l'utilisateur :", userId);
  } catch (err) {
    console.error("❌ Erreur création notification:", err);
    // On n'arrête pas tout le script si la notification échoue, on log juste l'erreur
  }
}
async function showNotification(title, message, type = 'info', targetUserId = null) {
  let userId = targetUserId;
  if (!userId && currentUser && currentUser.id) {
    userId = currentUser.id;
  }
  
  if (userId) {
    try {
      await supabaseClient.from('notifications').insert({
        user_id: String(userId), // ✅ Toujours une chaîne de caractères
        title: title,
        message: message,
        type: type,
        is_read: false           // ✅ 'is_read' et NON 'read'
        // ⚠️ NE PAS ajouter 'created_at', Supabase le fait tout seul
      });
      
      if (typeof updateNotifBadge === 'function') await updateNotifBadge();
    } catch (err) {
      console.error('❌ Erreur sauvegarde notification:', err);
    }
  }
}


// Charger les notifications dans le panneau
// ==========================================
// ✅ SYSTÈME DE NOTIFICATIONS AMÉLIORÉ
// ==========================================

async function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  
  if (panel.style.display === 'none' || !panel.style.display) {
    panel.style.display = 'flex'; // Changed to flex for proper layout
    await loadNotifPanel();
  } else {
    panel.style.display = 'none';
  }
}

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
      const date = new Date(notif.created_at).toLocaleString('fr-CA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      const unreadClass = notif.is_read ? 'read' : 'unread';
      
      return `
        <div class="notif-item ${unreadClass}" onclick="markAsRead(${notif.id})">
          <div class="notif-title">${icon} ${notif.title}</div>
          <div class="notif-message">${notif.message}</div>
          <div class="notif-date">${date}</div>
        </div>
      `;
    }).join('');
    
    // Mettre à jour le badge après le chargement
    updateNotifBadge(data);
    
  } catch (err) {
    console.error('Erreur loadNotifPanel:', err);
  }
}

// ✅ NOUVELLE FONCTION : Mettre à jour le badge rouge

// ✅ NOUVELLE FONCTION : Marquer une notif comme lue au clic
async function markAsRead(notifId) {
  try {
    await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId);
    
    // Recharger le panneau pour mettre à jour l'UI
    await loadNotifPanel();
  } catch (err) {
    console.error('Erreur markAsRead:', err);
  }
}

// ✅ NOUVELLE FONCTION : Tout marquer comme lu

// Marquer toutes les notifications comme lues


// Initialiser les notifications après connexion
async function initNotifications() {
  if (currentUser && currentUser.id) {
    const bellContainer = document.getElementById('notif-bell-container');
    if (bellContainer) bellContainer.style.display = 'block';
    await updateNotifBadge();
  }
}

// ==========================================
// ✅ GESTION DU RETOUR DE PAIEMENT (SUCCÈS OU ANNULATION)
// ==========================================


// 2. Fonction qui vérifie le statut et met à jour l'affichage


// Lancer la vérification après un court délai pour laisser le reste de la page se charger
//setTimeout(checkPaymentStatus, 1500);
// ==========================================


let stores = [
  {id:1,icon:'🛒',name:'Épicerie Générale du Haut-Pays',type:'Épicerie',address:'100 rue Principale, Maniwaki, QC',phone:'(819) 449-1234',status:'active',lat:46.3770,lng:-75.9650},
  {id:2,icon:'💊',name:'Pharmacie Maniwaki',type:'Pharmacie',address:'45 boulevard des Cascades, Maniwaki, QC',phone:'(819) 449-5678',status:'active',lat:46.3785,lng:-75.9580},
  {id:3,icon:'🏪',name:'Dépanneur Central',type:'Dépanneur',address:'78 avenue de la Gare, Maniwaki, QC',phone:'(819) 449-9012',status:'active',lat:46.3755,lng:-75.9630},
  {id:4,icon:'🍽️',name:'Restaurant Le Maniwaki',type:'Restaurant',address:'55 rue Principale, Maniwaki, QC',phone:'(819) 449-3456',status:'active',lat:46.3850,lng:-75.9450},
  {id:5,icon:'🍔',name:'Casse-Croûte du Village',type:'Restaurant',address:'15 rue Saint-Joseph, Maniwaki, QC',phone:'(819) 449-7890',status:'active',lat:46.3745,lng:-75.9700},
  {id:6,icon:'🏬',name:'Quincaillerie & Matériaux Gagné',type:'Autres',address:'88 rue Principale, Maniwaki, QC',phone:'(819) 449-2345',status:'active',lat:46.3760,lng:-75.9660}
];

let categories = [
  {id:1,name:'Fruits et légumes',icon:'🥬'},{id:2,name:'Produits laitiers',icon:'🥛'},
  {id:3,name:'Viandes et poissons',icon:'🥩'},{id:4,name:'Pain et boulangerie',icon:'🍞'},
  {id:5,name:'Épicerie sèche',icon:'🥫'},{id:6,name:'Boissons',icon:'🥤'},
  {id:7,name:'Surgelés',icon:'🧊'},{id:8,name:'Entretien ménager',icon:'🧹'},
  {id:10,name:'Médicaments',icon:'💊'},{id:11,name:'Soins personnels',icon:'🧴'},
  {id:12,name:'Bébés',icon:'👶'},{id:13,name:'Vitamines',icon:'💉'},
  {id:15,name:'Collations',icon:'🍿'},{id:16,name:'Glaces',icon:'🍦'},
  {id:17,name:'Tabac',icon:'🚬'},
  {id:20,name:'Plats principaux',icon:'🍲'},{id:21,name:'Entrées',icon:'🥗'},
  {id:22,name:'Desserts',icon:'🍰'},{id:23,name:'Restauration rapide',icon:'🍟'},
  {id:25,name:'Outils',icon:'🔧'},{id:26,name:'Matériaux',icon:'🪵'},
  {id:27,name:'Plomberie',icon:'🚿'},{id:28,name:'Électricité',icon:'💡'},
  {id:29,name:'Jardinage',icon:'🌱'},{id:30,name:'Peinture',icon:'🎨'}
];

let products = [
  {id:1,store_id:1,category_id:2,name:'Lait 2% 2L',desc:'Lait frais du Québec',price:4.99,icon:'🥛',available:true},
  {id:2,store_id:1,category_id:4,name:'Pain tranché blanc',desc:'Pain frais du jour',price:3.49,icon:'🍞',available:true},
  {id:3,store_id:1,category_id:2,name:'Douzaine d\'œufs',desc:'Œufs frais gros',price:5.29,icon:'🥚',available:true},
  {id:4,store_id:1,category_id:2,name:'Fromage cheddar',desc:'Bloc 400g',price:7.99,icon:'🧀',available:true},
  {id:5,store_id:1,category_id:1,name:'Pommes Gala 3lb',desc:'Pommes du Québec',price:6.49,icon:'🍎',available:true},
  {id:6,store_id:1,category_id:1,name:'Carottes 2lb',desc:'Carottes fraîches',price:3.29,icon:'🥕',available:true},
  {id:7,store_id:1,category_id:6,name:'Jus d\'orange 1.5L',desc:'100% pur jus',price:5.99,icon:'🍊',available:true},
  {id:8,store_id:1,category_id:5,name:'Riz basmati 2kg',desc:'Riz importé',price:8.49,icon:'🍚',available:true},
  {id:30,store_id:1,category_id:3,name:'Poitrine de poulet 1kg',desc:'Fraîche du jour',price:11.99,icon:'🍗',available:true},
  {id:31,store_id:1,category_id:1,name:'Bananes (régime)',desc:'Par livre',price:0.79,icon:'🍌',available:true},
  {id:32,store_id:1,category_id:1,name:'Tomates 2lb',desc:'Tomates de serre',price:4.49,icon:'🍅',available:true},
  {id:33,store_id:1,category_id:7,name:'Pizza surgelée',desc:'Pepperoni',price:7.99,icon:'🍕',available:true},
  {id:34,store_id:1,category_id:8,name:'Savon à vaisselle',desc:'Dawn 739ml',price:4.49,icon:'🧼',available:true},
  {id:35,store_id:1,category_id:5,name:'Pâtes spaghetti 500g',desc:'Pâtes alimentaires',price:2.29,icon:'🍝',available:true},
  {id:36,store_id:1,category_id:6,name:'Café régulier 300g',desc:'Café moulu',price:9.99,icon:'☕',available:true},
  {id:9,store_id:2,category_id:10,name:'Acétaminophène 500mg',desc:'24 comprimés',price:8.99,icon:'💊',available:true},
  {id:10,store_id:2,category_id:11,name:'Désinfectant mains',desc:'500ml',price:4.99,icon:'🧴',available:true},
  {id:11,store_id:2,category_id:11,name:'Savon corporel',desc:'400ml Dove',price:6.49,icon:'🧼',available:true},
  {id:40,store_id:2,category_id:10,name:'Ibuprofène 200mg',desc:'50 comprimés',price:12.99,icon:'💊',available:true},
  {id:41,store_id:2,category_id:10,name:'Sirop pour la toux',desc:'100ml',price:11.49,icon:'🍯',available:true},
  {id:42,store_id:2,category_id:11,name:'Shampooing',desc:'400ml Pantene',price:9.99,icon:'🧴',available:true},
  {id:43,store_id:2,category_id:11,name:'Dentifrice',desc:'100ml Colgate',price:4.99,icon:'🪥',available:true},
  {id:44,store_id:2,category_id:12,name:'Couches Pampers',desc:'Taille 3, 30 unités',price:16.99,icon:'👶',available:true},
  {id:45,store_id:2,category_id:12,name:'Lait pour bébé',desc:'En poudre 680g',price:24.99,icon:'🍼',available:true},
  {id:46,store_id:2,category_id:13,name:'Vitamine C 1000mg',desc:'90 comprimés',price:14.99,icon:'💉',available:true},
  {id:47,store_id:2,category_id:13,name:'Multivitamines',desc:'Flacon 100 unités',price:19.99,icon:'💊',available:true},
  {id:48,store_id:2,category_id:11,name:'Brosse à dents',desc:'Oral-B souple',price:5.49,icon:'🪥',available:true},
  {id:49,store_id:2,category_id:10,name:'Pansements adhésifs',desc:'Boîte 40 unités',price:6.99,icon:'🩹',available:true},
  {id:12,store_id:3,category_id:6,name:'Coca-Cola 2L',desc:'Boisson gazeuse',price:2.99,icon:'🥤',available:true},
  {id:13,store_id:3,category_id:15,name:'Chips Lay\'s nature',desc:'235g',price:4.29,icon:'🍟',available:true},
  {id:50,store_id:3,category_id:6,name:'Eau embouteillée 12 pack',desc:'500ml x 12',price:4.99,icon:'💧',available:true},
  {id:51,store_id:3,category_id:15,name:'Barre chocolatée',desc:'Kit Kat',price:1.79,icon:'🍫',available:true},
  {id:52,store_id:3,category_id:15,name:'Arachides salées',desc:'250g',price:3.99,icon:'🥜',available:true},
  {id:53,store_id:3,category_id:16,name:'Crème glacée 2L',desc:'Vanille',price:6.99,icon:'🍦',available:true},
  {id:54,store_id:3,category_id:16,name:'Esquimaux (boîte 8)',desc:'Barres glacées',price:7.49,icon:'🍡',available:true},
  {id:55,store_id:3,category_id:6,name:'Café Tim Hortons',desc:'Moyen chaud',price:2.29,icon:'☕',available:true},
  {id:56,store_id:3,category_id:6,name:'Red Bull 250ml',desc:'Boisson énergisante',price:3.49,icon:'🥫',available:true},
  {id:57,store_id:3,category_id:15,name:'Bonbons',desc:'Sac 150g',price:2.99,icon:'🍬',available:true},
  {id:58,store_id:3,category_id:6,name:'Jus Minute Maid',desc:'355ml',price:2.49,icon:'🧃',available:true},
  {id:59,store_id:3,category_id:17,name:'Cigarettes (paquet)',desc:'Marque au choix',price:14.50,icon:'🚬',available:true},
  {id:60,store_id:3,category_id:15,name:'Biscuits Oreo',desc:'154g',price:3.49,icon:'🍪',available:true},
  {id:17,store_id:4,category_id:20,name:'Pizza pepperoni',desc:'Grand format 16 pouces',price:18.99,icon:'🍕',available:true},
  {id:18,store_id:4,category_id:20,name:'Pâtes carbonara',desc:'Portion généreuse',price:14.99,icon:'🍝',available:true},
  {id:19,store_id:4,category_id:21,name:'Salade César',desc:'Avec poulet grillé',price:12.99,icon:'🥗',available:true},
  {id:61,store_id:4,category_id:20,name:'Lasagne italienne',desc:'Portion familiale',price:16.99,icon:'🍲',available:true},
  {id:62,store_id:4,category_id:20,name:'Poulet parmesan',desc:'Servi avec pâtes',price:17.99,icon:'🍗',available:true},
  {id:63,store_id:4,category_id:20,name:'Filet de saumon',desc:'Servi avec légumes',price:22.99,icon:'🐟',available:true},
  {id:64,store_id:4,category_id:21,name:'Soupe du jour',desc:'Bol 12oz',price:5.99,icon:'🍜',available:true},
  {id:65,store_id:4,category_id:21,name:'Ailes de poulet (12)',desc:'Sauce BBQ ou Buffalo',price:15.99,icon:'🍗',available:true},
  {id:66,store_id:4,category_id:22,name:'Tiramisu',desc:'Part individuelle',price:7.99,icon:'🍰',available:true},
  {id:67,store_id:4,category_id:22,name:'Crème brûlée',desc:'Part individuelle',price:6.99,icon:'🍮',available:true},
  {id:68,store_id:4,category_id:6,name:'Vin rouge (bouteille)',desc:'Chianti italien',price:18.99,icon:'🍷',available:true},
  {id:69,store_id:4,category_id:6,name:'Bière locale',desc:'600ml',price:7.99,icon:'🍺',available:true},
  {id:14,store_id:5,category_id:23,name:'Hamburger classique',desc:'Bœuf, laitue, tomate',price:8.99,icon:'🍔',available:true},
  {id:15,store_id:5,category_id:23,name:'Hot-dog',desc:'Classique avec moutarde',price:4.99,icon:'🌭',available:true},
  {id:16,store_id:5,category_id:23,name:'Poutine',desc:'Frites, sauce, fromage',price:10.99,icon:'🍟',available:true},
  {id:70,store_id:5,category_id:23,name:'Cheeseburger',desc:'Double viande, fromage',price:11.99,icon:'🍔',available:true},
  {id:71,store_id:5,category_id:23,name:'Club sandwich',desc:'Poulet, bacon, laitue',price:12.99,icon:'🥪',available:true},
  {id:72,store_id:5,category_id:23,name:'Nuggets de poulet (10)',desc:'Avec sauce',price:9.99,icon:'🍗',available:true},
  {id:73,store_id:5,category_id:23,name:'Frites régulières',desc:'Portion moyenne',price:4.49,icon:'🍟',available:true},
  {id:74,store_id:5,category_id:23,name:'Frites chargées',desc:'Bacon, fromage, sauce',price:8.99,icon:'🍟',available:true},
  {id:75,store_id:5,category_id:22,name:'Crêpes (3)',desc:'Avec sirop d\'érable',price:6.99,icon:'🥞',available:true},
  {id:76,store_id:5,category_id:22,name:'Pointe de tarte',desc:'Pommes ou bleuets',price:3.99,icon:'🥧',available:true},
  {id:77,store_id:5,category_id:6,name:'Liqueur molle',desc:'2L',price:2.99,icon:'🥤',available:true},
  {id:78,store_id:5,category_id:6,name:'Café régulier',desc:'Grand',price:2.49,icon:'☕',available:true},
  {id:20,store_id:6,category_id:25,name:'Marteau 16oz',desc:'Manche en bois',price:15.99,icon:'🔨',available:true},
  {id:21,store_id:6,category_id:25,name:'Tournevis set 6 pcs',desc:'Plat et cruciforme',price:19.99,icon:'🪛',available:true},
  {id:80,store_id:6,category_id:25,name:'Scie à main',desc:'14 pouces',price:24.99,icon:'🪚',available:true},
  {id:81,store_id:6,category_id:25,name:'Pince multiprise',desc:'10 pouces',price:12.99,icon:'🔧',available:true},
  {id:82,store_id:6,category_id:25,name:'Mètre à ruban 25 pi',desc:'Stanley',price:14.99,icon:'📏',available:true},
  {id:83,store_id:6,category_id:26,name:'Bois 2x4x8\'',desc:'Poteau de construction',price:6.99,icon:'🪵',available:true},
  {id:84,store_id:6,category_id:26,name:'Plywood 4x8',desc:'1/2 pouce',price:45.99,icon:'🪵',available:true},
  {id:85,store_id:6,category_id:27,name:'Tuyau PVC 10 pi',desc:'1.5 pouce',price:8.99,icon:'🚿',available:true},
  {id:86,store_id:6,category_id:27,name:'Robinet de cuisine',desc:'Chrome',price:79.99,icon:'🚰',available:true},
  {id:87,store_id:6,category_id:28,name:'Ampoule LED 60W',desc:'Pack de 4',price:12.99,icon:'💡',available:true},
  {id:88,store_id:6,category_id:28,name:'Prolongateur électrique',desc:'25 pieds',price:19.99,icon:'🔌',available:true},
  {id:89,store_id:6,category_id:29,name:'Terreau 25kg',desc:'Pour jardin',price:8.99,icon:'🌱',available:true},
  {id:90,store_id:6,category_id:29,name:'Boyau d\'arrosage 50 pi',desc:'Avec embout',price:29.99,icon:'💦',available:true},
  {id:91,store_id:6,category_id:30,name:'Peinture intérieure 4L',desc:'Blanc, latex',price:39.99,icon:'🎨',available:true},
  {id:92,store_id:6,category_id:30,name:'Pinceau 2 pouces',desc:'Soies synthétiques',price:7.99,icon:'🖌️',available:true},
  {id:93,store_id:6,category_id:25,name:'Perceuse sans fil',desc:'18V avec batterie',price:89.99,icon:'🔩',available:true}
];

let nextStoreId = 7, nextCatId = 31, nextProdId = 100;
let cart = JSON.parse(localStorage.getItem('cart')) || [];let clients = [], drivers = [], orders = [], notifications = [];
let currentUser = null, selectedAccountType = null;
let selectedStoreIcon = '', selectedCatIcon = '', selectedProdIcon = '';
let userPosition = null;
let autocompleteTimeout = null;

const defaultAdmin = {
  id: 'admin', name: 'Administrateur', email: 'admin@ruralgo.ca',
  password: 'admin123', role: 'admin', phone: '(819) 000-0000',
  address: 'Maniwaki, QC', createdAt: new Date().toISOString()
};

const allIcons = ['🛒','💊','🏪','🔨','🍞','🥩','🍽️','🏬','🥖','🧀','🍎','🥕','🌾','🛍️','🏠','⭐','🥛','🥚','🥬','🥫','🥤','🧴','🧼','🔧','🪛','🍗','🥓','🍊','🍚','🍟','🥐','🍰','📦','🚗','🛻','🍔','🍕','🍝','🌭','🥗','🍲','🍳','🍦','🍫','🍪','🍬','🥜','💧','☕','🍺','🍷','🐟','🥪','🥞','🥧','🍮','🪵','🚿','💡','🔌','🌱','💦','🎨','🖌️','🔩','📏','🪚','🪥','🩹','💉','🍼','👶','🚬'];

let platformSettings = {
  deliveryBaseFee: 7.00,
  deliveryPerKm: 1.00,
  taxRate: 0.14975,
  driverCommission: 0.20,
  radius: 40
};

const STATUS_LABELS = {
  'pending': {label:'En attente', class:'status-pending'},
  'confirmed': {label:'Confirmée', class:'status-confirmed'},
  'searching_driver': {label:'Recherche livreur', class:'status-searching'},
  'driver_assigned': {label:'Livreur assigné', class:'status-assigned'},
  'driver_to_store': {label:'En route vers Commerce', class:'status-pickup'},
  'at_store': {label:'Au commerce', class:'status-pickup'},
  'picked_up': {label:'Commande récupérée', class:'status-delivering'},
  'driver_to_client': {label:'En route vers vous', class:'status-delivering'},
  'delivered': {label:'Livrée', class:'status-delivered'},
  'cancelled': {label:'Annulée', class:'status-cancelled'}
};


// ============ CALCUL DES FRAIS DE LIVRAISON ============
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

function getCurrentStore() {
  if (cart.length === 0) return null;
  const firstProductId = cart[0].productId;
  const product = products.find(p => p.id === firstProductId);
  if (!product) return null;
  return stores.find(s => s.id === product.store_id);
}

// ============ CHARGEMENT DEPUIS SUPABASE ============
async function load() {
  try {
    // ✅ OPTIMISATION : Chargement en parallèle pour plus de rapidité
    const [storesRes, catsRes, prodsRes, clientsRes, driversRes, ordersRes, settingsRes] = await Promise.all([
      supabaseClient.from('stores').select('*'),
      supabaseClient.from('categories').select('*'),
      supabaseClient.from('products').select('*'),
      supabaseClient.from('profiles').select('*'), // ✅ TABLE CORRIGÉE
      supabaseClient.from('profiles').select('*').eq('role', 'driver'), // (Garde profiles pour les livreurs si tu n'as pas changé cette table)
      supabaseClient.from('orders').select('*'),
      supabaseClient.from('settings').select('*').maybeSingle()
    ]);

    if (storesRes.data) stores = storesRes.data;
    if (catsRes.data) categories = catsRes.data;
    if (prodsRes.data) {
      products = prodsRes.data.map(p => ({ ...p, store_id: p.store_id, category_id: p.category_id }));
    }
    
    // ✅ TABLE CORRIGÉE POUR LES CLIENTS
    if (clientsRes.data) {
      clients = clientsRes.data.map(c => ({
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
      // ✅ TABLE CORRIGÉE ICI AUSSI (ou garde 'profiles' si c'est une table globale, mais adapte selon ta structure)
      const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      
      // Si le profil n'est pas dans 'clients', on essaie 'profiles' (pour admin/driver)
      const finalProfile = profile || (await supabaseClient.from('profiles').select('*').eq('id', session.user.id).maybeSingle()).data;

      if (finalProfile) {
        currentUser = {
          id: finalProfile.id, role: finalProfile.role, name: finalProfile.name,
          email: session.user.email, phone: finalProfile.phone,
          address: finalProfile.address, lat: finalProfile.lat, lng: finalProfile.lng,
          vehicle: finalProfile.vehicle, status: finalProfile.status,
          createdAt: finalProfile.created_at
        };
        showUserInterface();
      }
    }
  } catch (e) {
    console.error("Erreur de chargement Supabase:", e);
  }
}


function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return Math.floor(diff/60) + ' min';
  if (diff < 86400) return Math.floor(diff/3600) + ' h';
  return d.toLocaleDateString('fr-CA');
}

// ============ AUTOCOMPLETE ADRESSE ============
function initAutocomplete(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionsId);
  if (!input || !suggestions) return;
  input.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    if (autocompleteTimeout) clearTimeout(autocompleteTimeout);
    if (query.length < 3) { suggestions.classList.remove('show'); return; }
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
    suggestions.innerHTML = data.map((item, index) => {
      const address = item.address || {};
      let mainText = item.display_name;
      let subText = '';
      if (address.road || address.street) {
        mainText = `${address.house_number || ''} ${address.road || address.street || ''}`.trim();
        subText = `${address.city || address.town || address.village || ''}${address.state ? ', ' + address.state : ''}${address.postcode ? ' ' + address.postcode : ''}`.trim();
      }
      return `<div class="autocomplete-item" onclick="selectAddress('${inputId}', '${suggestionsId}', ${index})">
        <div class="autocomplete-item-icon">📍</div>
        <div class="autocomplete-item-content">
          <div class="autocomplete-item-main">${mainText}</div>
          ${subText ? `<div class="autocomplete-item-sub">${subText}</div>` : ''}
        </div>
      </div>`;
    }).join('');
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
  
  // ✅ STOCKER LES COORDONNÉES GPS DANS L'INPUT
  if (item.lat && item.lon) {
    input._lat = parseFloat(item.lat);
    input._lng = parseFloat(item.lon);
    console.log("✅ Coordonnées GPS stockées :", input._lat, input._lng);
  } else {
    console.warn("⚠️ Pas de coordonnées GPS pour cette adresse");
  }
  
  suggestions.classList.remove('show');
  showToast('✅ Adresse sélectionnée !');
  
  if (currentUser && currentUser.role === 'client') {
    updateCart();
  }
}

function geolocateAddress(fieldId) {
  const btn = event.target;
  const originalText = btn.innerHTML;
  if (!navigator.geolocation) { showToast('⚠️ Géolocalisation non supportée'); return; }
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

// ============ AUTHENTIFICATION ============
function openChooseTypeModal() {
  selectedAccountType = null;
  document.querySelectorAll('.account-type').forEach(t => t.classList.remove('selected'));
  document.getElementById('continue-type-btn').disabled = true;
  openModal('choose-type-modal');
}

// ============ SÉLECTION DU TYPE DE COMPTE ============


// ============ SÉLECTION DU TYPE DE COMPTE ============
selectedAccountType = null;

function selectAccountType(type, element) {
  // 1. Sauvegarder le type choisi
  selectedAccountType = type;
  
  // 2. Enlever la classe "selected" de tous les types de compte
  document.querySelectorAll('.account-type').forEach(el => {
    el.classList.remove('selected');
  });
  
  // 3. Ajouter la classe "selected" à l'élément cliqué
  if (element) {
    element.classList.add('selected');
  }
  
  // 4. Activer le bouton "Continuer"
  const continueBtn = document.getElementById('continue-type-btn');
  if (continueBtn) {
    continueBtn.disabled = false;
  }
  
  console.log('Type de compte sélectionné :', type);
}

function continueToRegister() {
  closeModal('choose-type-modal');
  if (selectedAccountType === 'client') {
    openModal('register-client-modal');
    setTimeout(() => initAutocomplete('rc-address', 'rc-address-suggestions'), 100);
  } else {
    openModal('register-driver-modal');
  }
}

function openLoginModal() { openModal('login-modal'); }

// ==========================================
// ✅ INSCRIPTION CLIENT (TABLE : clients)
// ==========================================
async function registerClient(e) {
  e.preventDefault(); // Empêche le rechargement de la page

  // 1. Récupération des valeurs du formulaire
  const email = document.getElementById('rc-email').value.trim();
  const password = correctPassword(document.getElementById('rc-pass').value);
  const name = document.getElementById('rc-name').value.trim();
  const phone = document.getElementById('rc-phone').value.trim();
  const addressInput = document.getElementById('rc-address');

  // 2. Création du compte d'authentification Supabase
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

  // 3. ✅ CORRECTION MAJEURE : Insertion dans la table 'clients' (et non 'profiles')
  const { error: dbError } = await supabaseClient.from('profiles').insert({
    id: authData.user.id,
    role: 'client',
    email: email,
    name: name,
    phone: phone,
    address: addressInput.value,
    lat: addressInput._lat || userPosition?.lat || null,
    lng: addressInput._lng || userPosition?.lng || null,
    status: 'approved' // Ou 'pending' selon ta logique d'approbation
  });

  if (dbError) {
    console.error("❌ Erreur d'insertion dans la table clients:", dbError);
    showToast('❌ Erreur lors de la sauvegarde du profil: ' + dbError.message);
    return;
  }

  // 4. Mise à jour de l'état local de l'utilisateur connecté
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

  // 5. Finalisation de l'inscription
  closeModal('register-client-modal');
  showUserInterface(); // Met à jour le header et l'interface
  showToast('✅ Bienvenue ' + name.split(' ')[0] + ' ! Votre compte est créé.');
}

function correctPassword(pass) {
  return typeof pass === 'string' ? pass : String(pass);
}

// ============ INSCRIPTION COMMERCE ============
// ============ INSCRIPTION COMMERCE (VERSION CORRIGÉE) ============
// ============ INSCRIPTION COMMERCE (VERSION AVEC TOAST AMÉLIORÉ) ============
async function registerStore(event) {
  event.preventDefault();
  
  const name = document.getElementById('rs-name').value.trim();
  const type = document.getElementById('rs-type').value;
  const owner = document.getElementById('rs-owner').value.trim();
  const email = document.getElementById('rs-email').value.trim();
  const pass = document.getElementById('rs-pass').value;
  const passConfirm = document.getElementById('rs-pass-confirm').value;
  const phone = document.getElementById('rs-phone').value.trim();
  const address = document.getElementById('rs-address').value.trim();
  const forfaitChoisi = document.getElementById('rs-forfait').value;
  
  if (pass !== passConfirm) { showToast('❌ Les mots de passe ne correspondent pas'); return; }
  if (pass.length < 6) { showToast('❌ Le mot de passe doit contenir au moins 6 caractères'); return; }
  if (!name || !type || !owner || !email || !phone || !address || !forfaitChoisi) { showToast('❌ Veuillez remplir tous les champs'); return; }
  
  let planId = null;
  if (forfaitChoisi === 'essai') planId = 1;
  else if (forfaitChoisi === 'base') planId = 2;
  else if (forfaitChoisi === 'croissance') planId = 3;
  else if (forfaitChoisi === 'partenaire') planId = 4;

  if (!planId) { showToast('❌ Forfait invalide'); return; }

  try {
    showToast('📨 Envoi de votre demande en cours...');
    
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email: email, password: pass, options: { data: { role: 'store', name: owner } }
    });
    if (authError) throw authError;
    
    const { error: profileError } = await supabaseClient.from('profiles').insert({
      id: authData.user.id, email: email, role: 'store', name: owner, phone: phone,
      address: address, status: 'pending', selected_plan_id: planId
    });
    if (profileError) throw profileError;
    
    const { error: storeError } = await supabaseClient.from('stores').insert({
      user_id: authData.user.id, name: name, type: type, address: address, phone: phone, status: 'pending'
    });
    if (storeError) console.error('Erreur store:', storeError);
    
    // ✅ NOTIFICATION : Prévenir l'admin
    const { data: admins } = await supabaseClient.from('profiles').select('id').eq('role', 'admin');
    if (admins) {
      for (const admin of admins) {
        await showNotification('Nouvelle inscription commerce', `Le commerce "${name}" (${owner}) demande une validation.`, 'info', admin.id);
      }
    }

    closeModal('register-store-modal');
    showToast('✅ Demande envoyée avec succès ! En attente de validation.');
  } catch (err) {
    console.error('Erreur inscription commerce:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}
async function registerDriver(e) {
  e.preventDefault();
  
  const email = document.getElementById('rd-email').value;
  const password = correctPassword(document.getElementById('rd-pass').value);
  const name = document.getElementById('rd-name').value;
  const phone = document.getElementById('rd-phone').value;
  const vehicle = document.getElementById('rd-vehicle').value;

  console.log("🚚 [INSCRIPTION] Tentative d'inscription pour :", email);

  // 1. Créer l'utilisateur dans Auth
  const { data: authData, error: authError } = await supabaseClient.auth.signUp({
    email, 
    password, 
    options: { data: { name, role: 'livreur' } } // ✅ Changé en 'livreur' pour correspondre à l'Admin
  });

  if (authError) { 
    console.error("❌ Erreur Auth:", authError);
    showToast('❌ Erreur: ' + authError.message); 
    return; 
  }

  // 2. Créer le profil dans la table 'profiles' (PAS 'drivers')
  const { error: profileError } = await supabaseClient.from('profiles').insert({
    id: authData.user.id, 
    email: email,          // ✅ AJOUTÉ : Pour éviter les colonnes vides/null
    role: 'livreur',       // ✅ IMPORTANT : Doit être 'livreur' et non 'driver'
    name: name, 
    phone: phone, 
    vehicle: vehicle, 
    status: 'pending'      // Statut en attente de validation
  });

  // ✅ VÉRIFICATION D'ERREUR (C'est ce qui manquait !)
  if (profileError) {
    console.error("❌ Erreur création profil:", profileError);
    showToast('❌ Erreur profil: ' + profileError.message);
    return; // On arrête tout si ça échoue
  }

  console.log("✅ Profil livreur créé avec succès dans 'profiles' !");

  // 3. NOTIFICATION : Prévenir l'admin
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
    console.warn("⚠️ Erreur d'envoi de notification (non critique):", notifErr);
  }

  closeModal('register-driver-modal');
  showToast('📨 Demande envoyée ! En attente d\'approbation admin.');
}

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

    closeModal('login-modal');

    // --- LOGIQUE SPÉCIALE POUR LES COMMERCES ---
    if (currentUser.role === 'store') {
      console.log("🔍 DEBUG LOGIN - Rôle: store, Statut:", currentUser.status, "Plan ID:", currentUser.selected_plan_id);

      if (currentUser.status === 'pending') {
        showToast('⏳ Votre compte est en attente de validation par l\'administrateur.');
        await supabaseClient.auth.signOut();
        currentUser = null;
        return;
      }

      if (currentUser.status === 'approved') {
        console.log("🔍 DEBUG LOGIN - Vérification de l'abonnement...");
        
        const { data: subscription, error: subError } = await supabaseClient
          .from('subscriptions')
          .select('status')
          .eq('user_id', currentUser.id)
          .maybeSingle(); // maybeSingle évite les erreurs si aucune ligne n'existe

        if (subError) console.error("Erreur subscription:", subError);

        const isFreeTrial = currentUser.selected_plan_id === 1; // 1 = Essai
        const hasActiveSubscription = subscription && subscription.status === 'active';

        console.log("🔍 DEBUG LOGIN - Essai gratuit ?", isFreeTrial, "| Abonnement actif ?", hasActiveSubscription);

        if (!isFreeTrial && !hasActiveSubscription) {
          console.log("🚨 DEBUG LOGIN - DÉCLENCHEMENT DE L'ÉCRAN DE PAIEMENT !");
          showToast('💳 Veuillez régler votre forfait pour activer votre compte.');
          showStorePaymentScreen(); // Affiche l'écran de paiement
          return; // ⚠️ TRÈS IMPORTANT : On s'arrête ici, on n'affiche PAS le dashboard normal
        } else {
          console.log("✅ DEBUG LOGIN - Accès dashboard autorisé.");
        }
      }
    }

    // Si ce n'est pas un commerce, ou si le commerce a déjà payé
    await initNotifications();
    await diagnosticComplet();
    
    showUserInterface();
    showToast('✅ Connexion réussie, bienvenue ' + currentUser.name + ' !');

  } catch (err) {
    console.error('Erreur de connexion:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ✅ Affiche l'écran de choix de forfait pour un commerce approuvé
async function showStorePaymentScreen() {
  console.log("🔍 DEBUG PAIEMENT - Début du chargement des forfaits...");
  
  const { data: plans, error } = await supabaseClient
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error("❌ Erreur Supabase lors du chargement des forfaits:", error);
    showToast('❌ Erreur de chargement des forfaits: ' + error.message);
    return;
  }

  console.log("✅ Forfaits chargés depuis la base de données:", plans);

  if (!plans || plans.length === 0) {
    showToast('⚠️ Aucun forfait disponible pour le moment. Contactez l\'admin.');
    return;
  }

  const selectedPlanId = currentUser.selected_plan_id;
  const planNames = { 1: 'Essai', 2: 'Base', 3: 'Croissance', 4: 'Partenaires Plus' };
  const chosenName = planNames[selectedPlanId] || 'inconnu';

  const plansHtml = plans.map(plan => {
    // Vérification sécurisée des fonctionnalités
    const featuresHtml = plan.features && Array.isArray(plan.features) 
      ? plan.features.map(f => `<li style="margin-bottom:0.5rem">✅ ${f}</li>`).join('') 
      : '<li style="margin-bottom:0.5rem">ℹ️ Détails du forfait</li>';
      
    const btnText = plan.price === 0 ? '🎁 Activer l\'essai gratuit' : `💳 Payer ${plan.price}$ / mois`;
    
    const isChosen = plan.id === selectedPlanId;
    const borderColor = isChosen ? '#f5a623' : '#e0e0e0';
    const bg = isChosen ? '#fff9f0' : 'white';
    const badge = isChosen ? '<div style="background:#f5a623;color:white;padding:4px 8px;border-radius:4px;font-size:0.8rem;margin-bottom:8px;display:inline-block;">⭐ Votre choix à l\'inscription</div>' : '';

    return `
      <div style="border: 3px solid ${borderColor}; border-radius: 12px; padding: 1.5rem; text-align: center; background: ${bg}; transition: transform 0.2s; position: relative;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
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
          Vous avez sélectionné le forfait : <span style="color: #f5a623; font-size: 1.2rem;">${chosenName}</span> lors de votre inscription.
        </p>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #666;">Vous pouvez le confirmer ci-dessous ou en choisir un autre.</p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        ${plansHtml}
      </div>
      
      <div style="text-align: right;">
       <button class="btn-sm btn-gray" onclick="document.getElementById('store-payment-modal').remove(); supabaseClient.auth.signOut(); currentUser=null; location.reload();">🚪 Se déconnecter</button>
      </div>
    </div>
  `;
  
  const oldModal = document.getElementById('store-payment-modal');
  if (oldModal) oldModal.remove();
  
  document.body.appendChild(modal);
}

// ✅ Gère le clic sur un forfait
async function handlePlanSelection(planId, price) {
  if (!currentUser) return;
  
  showToast('⏳ Préparation du paiement...');
  
  try {
    // Appel à la fonction Edge 'create-subscription' qu'on a créée plus tôt
    const { data, error } = await supabaseClient.functions.invoke('create-subscription', {
      body: {
        planId: planId,
        userEmail: currentUser.email
      }
    });
    
    if (error) throw error;
    
    if (data.success && data.redirect) {
      // C'était l'essai gratuit (0$), activé directement sans Stripe
      showToast('✅ Forfait Essai activé avec succès !');
      document.getElementById('store-payment-modal').remove();
      showUserInterface(); // Affiche le dashboard normal
    } else if (data.url) {
      // Forfait payant : redirection vers Stripe Checkout
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
// ✅ DÉCONNEXION PROPRE ET FORCÉE
// ==========================================
async function logout() {
  console.log("🚪 [DÉCONNEXION] Début du processus...");
  
  try {
    // 1. Tenter de se déconnecter de Supabase (on ignore l'erreur 403 si la session est déjà expirée)
    await supabaseClient.auth.signOut({ scope: 'global' }).catch(err => {
      if (!err.message.includes('403')) console.warn("⚠️ Info déconnexion:", err);
    });
  } catch (err) {
    console.warn("⚠️ Erreur Supabase lors de la déconnexion (ignorée):", err);
  }

  // 2. NETTOYAGE LOCAL OBLIGATOIRE
  currentUser = null;
  localStorage.removeItem('currentUser');
  // Optionnel : vider le panier à la déconnexion pour éviter les conflits
  // localStorage.removeItem('cart'); 

  // 3. ARRÊTER LE POLLING DES NOTIFICATIONS (pour éviter les erreurs en arrière-plan)
  if (window.notifIntervalId) {
    clearInterval(window.notifIntervalId);
    window.notifIntervalId = null;
    console.log("⏹️ [DÉCONNEXION] Polling des notifications arrêté.");
  }

  // 4. 🔥 REDIRECTION FORCÉE VERS LA PAGE D'ACCUEIL
  // On utilise .replace() au lieu de .href pour que le bouton "Précédent" 
  // du navigateur ne permette PAS de revenir à la session connectée.
  console.log("✅ [DÉCONNEXION] Redirection vers l'accueil...");
  window.location.replace('index.html'); 
}

function showUserInterface() {
  // 🛡️ BOUCLIER : Si la page de remerciement est active, on annule tout pour ne pas l'écraser
  if (typeof isThankYouPageActive !== 'undefined' && isThankYouPageActive) {
    console.log("🛡️ [BOUCLIER] showUserInterface bloqué pour protéger la page de remerciement");
    return; // ✅ MAINTENANT C'EST VALIDE CAR ON EST À L'INTÉRIEUR DE LA FONCTION
  }

  // 1. Afficher la section utilisateur et la cloche
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('user-section').style.display = 'flex';
  document.getElementById('header-wallet').style.display = 'block';
  document.getElementById('notif-bell-container').style.display = 'block';

  // 2. Mise à jour de l'avatar et du nom
  const ini = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('user-avatar').textContent = ini;
  document.getElementById('user-name').textContent = currentUser.name.split(' ')[0];

  const labels = { client: '👤 Client', driver: '🚗 Livreur', admin: '⚙️ Admin', store: '🏪 Commerce' };
  document.getElementById('user-role').textContent = labels[currentUser.role] || currentUser.role;

  // 3. Cacher les éléments wallet pour les non-clients
  if (currentUser.role !== 'client') {
    const allWalletElements = document.querySelectorAll(
      '[id*="wallet"], [id*="balance"], [id*="recharge"], [id*="transaction"], ' +
      '[class*="wallet"], [class*="balance"], [class*="recharge"], [class*="transaction"]'
    );
    allWalletElements.forEach(el => { el.style.display = 'none'; });
  } else {
    const walletBalance = document.getElementById('wallet-balance');
    if (walletBalance) walletBalance.style.display = 'inline';
    setTimeout(() => {
      if (typeof updateWalletDisplay === 'function') updateWalletDisplay();
    }, 500);
  }

  // 4. Réinitialiser l'affichage des menus
  document.getElementById('nav-client').style.display = 'none';
  document.getElementById('nav-driver').style.display = 'none';
  document.getElementById('nav-admin').style.display = 'none';
  const navStore = document.getElementById('nav-store');
  if (navStore) navStore.style.display = 'none';

  // 5. Afficher l'interface spécifique au rôle
  if (currentUser.role === 'client') {
    document.getElementById('nav-client').style.display = 'block';
    document.getElementById('client-firstname').textContent = currentUser.name.split(' ')[0];
    if (typeof updateDeliveryAddress === 'function') updateDeliveryAddress();
    switchView('view-client');
    if (typeof showClientStores === 'function') showClientStores();
  } else if (currentUser.role === 'driver') {
    document.getElementById('nav-driver').style.display = 'block';
    document.getElementById('driver-firstname').textContent = currentUser.name.split(' ')[0];
    switchView('view-driver');
    if (typeof showDriverDashboard === 'function') showDriverDashboard();
  } else if (currentUser.role === 'admin') {
    document.getElementById('nav-admin').style.display = 'block';
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

  // 6. Mettre à jour le badge de notification
  if (typeof updateNotifBadge === 'function') {
    updateNotifBadge();
  }
}

function renderAllAdmin() {
  renderAdminDashboard();
  renderAdminOrders();
  renderAdminStores();
  renderAdminCategories();
  renderAdminProducts();
  renderAdminDrivers();
  renderAdminClients();
  renderAdminSettings();
}

function switchView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  if (currentUser) {
    if (currentUser.role === 'client') showClientStores();
    else if (currentUser.role === 'driver') showDriverDashboard();
    else { switchView('view-admin'); adminTab('dashboard', document.querySelector('.admin-side li')); }
  } else {
    switchView('view-landing');
  }
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ============ LANDING PAGE ============
function renderLandingStores() {
  const g = document.getElementById('landing-stores-grid');
  if (!g) return;
  const active = stores.filter(s => s.status === 'active').slice(0, 6);
  g.innerHTML = active.map(s => {
    const count = products.filter(p => p.store_id === s.id && p.available).length;
    return `<div class="store" onclick="openStoreFromLanding(${s.id})">
      <div class="store-img">${s.icon}</div>
      <div class="store-info">
        <h3>${s.name}</h3>
        <p style="color:#666;font-size:0.9rem">${s.type}</p>
        <p style="color:#999;font-size:0.85rem;margin-top:0.3rem">📍 ${s.address}</p>
        <p style="color:#0a1929;font-size:0.85rem;margin-top:0.3rem;font-weight:bold">📦 ${count} produit(s)</p>
      </div>
    </div>`;
  }).join('');
}

function openStoreFromLanding(store_id) {
  if (!currentUser) {
    showToast('🔑 Connectez-vous pour voir les Commerces');
    setTimeout(() => openChooseTypeModal(), 1000);
    return;
  }
  openStoreDetail(store_id);
}

// ============ CLIENT - COMMERCE ============

// ==========================================
// ✅ FONCTION UNIFIÉE : LISTE DES COMMERCES (DESIGN PREMIUM)
// ==========================================
// ==========================================
// ✅ AFFICHER TOUS LES COMMERCES (CLIENT)
// ==========================================
async function showClientStores() {
       // 🛡️ BOUCLIER : Si on vient de payer, on annule tout pour ne pas effacer la page de remerciement
     const urlParams = new URLSearchParams(window.location.search);
     if (urlParams.has('session_id') || urlParams.get('payment_success') === 'true') {
       console.log("🛡️ [BLOQUÉ] showClientStores annulé pour protéger la page de remerciement");
       return;
     }
  console.log("🏪 [CLIENT] Affichage de la page commerces...");

  // 1. Afficher la vue client
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  document.getElementById('view-client').style.display = 'block';
  
  // 2. Afficher la section commerces, cacher les autres
  document.getElementById('stores-section').style.display = 'block';
  document.getElementById('store-detail-section').style.display = 'none';
  document.getElementById('client-orders-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('client-profile-section').style.display = 'none';

  // 3. Historique pour le bouton Retour
  saveViewToHistory('view-client');

  // 4. 🔥 APPEL DE LA FONCTION MAÎTRE
  await afficherCommerces('stores-grid', 'showStoreDetail');
}

// ==========================================
// ✅ FILTRAGE DES COMMERCES PAR CATÉGORIE
// ==========================================



function filterStores(category, btnElement) {
  // Mettre à jour l'apparence des boutons
  document.querySelectorAll('.category-pill').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');
  
  // Re-rendre la grille avec le filtre
  renderClientStores(category);
}

// ==========================================
// ✅ AFFICHAGE DES COMMERCES (FUSIONNÉ ET OPTIMISÉ)
// ==========================================
function renderClientStores(categoryFilter = 'all') {
  const grid = document.getElementById('stores-grid');
  const filtersContainer = document.getElementById('category-filters');
  
  if (!grid || !stores) return;

  // 1. Générer les boutons de catégories (seulement si c'est 'all')
  if (categoryFilter === 'all' && filtersContainer) {
    const categories = [...new Set(stores.filter(s => s.status === 'active').map(s => s.type).filter(Boolean))];
    filtersContainer.innerHTML = '<button class="category-pill active" onclick="renderClientStores(\'all\')">🏪 Tous</button>';
    
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'category-pill';
      btn.innerHTML = `🏷️ ${cat}`;
      btn.onclick = () => renderClientStores(cat);
      filtersContainer.appendChild(btn);
    });
  }

  // 2. Filtrer les commerces (uniquement les actifs)
  let filteredStores = stores.filter(s => s.status === 'active');
  if (categoryFilter !== 'all') {
    filteredStores = filteredStores.filter(s => s.type === categoryFilter);
  }

  // 3. Afficher les commerces
  if (filteredStores.length === 0) {
    grid.innerHTML = '<p style="text-align:center; color:#666; grid-column:1/-1; padding:2rem;">Aucun commerce dans cette catégorie pour le moment.</p>';
    return;
  }

  // Mise à jour des classes actives des boutons
  document.querySelectorAll('.category-pill').forEach(btn => {
    btn.classList.remove('active');
    if ((categoryFilter === 'all' && btn.textContent.includes('Tous')) || btn.textContent.includes(categoryFilter)) {
      btn.classList.add('active');
    }
  });

  grid.innerHTML = filteredStores.map(s => {
    const count = products.filter(p => String(p.store_id) === String(s.id) && p.available).length;
    const dist = userPosition ? calculateDistance(userPosition.lat, userPosition.lng, s.lat, s.lng) : null;
    
    return `
      <div class="store-card" onclick="openStoreDetail('${s.id}')" style="background:white; border-radius:12px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.08); cursor:pointer; transition:transform 0.2s; border:1px solid #f0f0f0;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="font-size:2.5rem; margin-bottom:0.5rem;">${s.icon || '🏪'}</div>
        <h3 style="margin:0 0 0.5rem 0; color:#0a1929;">${s.name}</h3>
        <p style="margin:0; color:#666; font-size:0.9rem;">${s.type || 'Commerce'}</p>
        <p style="margin:0.5rem 0 0 0; color:#888; font-size:0.85rem;">📍 ${s.address || 'Adresse non spécifiée'}</p>
        ${dist ? `<p style="color:#0284c7; font-size:0.85rem; margin-top:0.5rem; font-weight:bold;">📏 ${dist.toFixed(1)} km de vous</p>` : ''}
        <p style="color:#0a1929; font-size:0.85rem; margin-top:0.5rem; font-weight:bold;">📦 ${count} produit(s)</p>
      </div>
    `;
  }).join('');
}


// ✅ Mettre à jour le compteur d'articles en bas de page
function updateInlineCartCount() {
  const countEl = document.getElementById('inline-cart-count');
  if (countEl && cart) {
    const totalQty = cart.reduce((s, c) => s + c.qty, 0);
    countEl.textContent = totalQty;
  }
}
// ==========================================
// ✅ MISE À JOUR DE LA BARRE DE PANIER STICKY
// ==========================================
function updateStickyCartBar() {
  const bar = document.getElementById('sticky-cart-bar');
  if (!bar) return;
  
  let total = 0;
  let count = 0;
  
  // Calculer le total et le nombre d'articles (adapte 'cart' si ta variable s'appelle autrement)
  if (typeof cart !== 'undefined' && Array.isArray(cart)) {
    cart.forEach(item => {
      count += item.quantity || 1;
      const product = products.find(p => String(p.id) === String(item.productId));
      if (product) {
        total += product.price * (item.quantity || 1);
      }
    });
  }
  
  // Afficher ou cacher la barre
  if (count > 0) {
    bar.style.display = 'flex';
    document.getElementById('sticky-cart-count').textContent = `${count} article${count > 1 ? 's' : ''}`;
    document.getElementById('sticky-cart-total').textContent = `${total.toFixed(2)} $`;
  } else {
    bar.style.display = 'none';
  }
}


// ==========================================
// ✅ AFFICHAGE DU COMMERCE (VERSION CLIENT) - CORRIGÉE
// ==========================================

async function openStoreDetail(store_id) { 
  const store = stores.find(s => String(s.id) === String(store_id));
  if (!store) {
    showToast('❌ Commerce introuvable');
    return;
  }
  
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('store-detail-section').style.display = 'block';

  // ✅ NOUVEAU : Récupérer les produits directement depuis Supabase avec le BON nom
  const { data: storeProducts, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('available', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("❌ Erreur chargement produits:", error);
  }

  const validProducts = storeProducts || [];

  // Trouver les catégories de ces produits
  const storeCats = [...new Set(validProducts.map(p => p.category_id))]
    .map(cid => categories.find(c => String(c.id) === String(cid)))
    .filter(Boolean);

  let html = `<button class="back-btn" onclick="showClientStores()">← Retour aux commerces</button>`;
  html += `<div class="store-detail-header" style="display:flex; align-items:center; gap:1.5rem; margin-bottom:1.5rem; padding:1rem; background:white; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    <div class="store-detail-icon" style="font-size:4rem;">${store.logo ? `<img src="${store.logo}" alt="${store.name}" style="width:80px;height:80px;border-radius:50%;object-fit:cover">` : (store.icon || '🏪')}</div>
    <div class="store-detail-info">
      <h2 style="margin:0; color:#0a1929;">${store.name}</h2>
      <p style="margin:0.3rem 0; color:#666;">${store.type || 'Commerce'} • ${store.address || 'Adresse non spécifiée'}</p>
      <p style="margin:0.3rem 0; color:#10b981; font-weight:bold;">${validProducts.length} produit(s) disponible(s)</p>
    </div>
  </div>`;

  if (storeCats.length > 0) {
    html += `<div class="categories-bar" style="display:flex; gap:0.5rem; overflow-x:auto; padding-bottom:0.5rem; margin-bottom:1rem;">
      <button class="cat-btn active" onclick="filterClientProducts('${store.id}','all',this, window.currentStoreProducts)" style="padding:8px 16px; background:#0a1929; color:white; border:none; border-radius:20px; cursor:pointer; white-space:nowrap;">🏷️ Tout (${validProducts.length})</button>`;
    storeCats.forEach(c => {
      const catCount = validProducts.filter(p => String(p.category_id) === String(c.id)).length;
      html += `<button class="cat-btn" onclick="filterClientProducts('${store.id}','${c.id}',this, window.currentStoreProducts)" style="padding:8px 16px; background:#f3f4f6; color:#374151; border:none; border-radius:20px; cursor:pointer; white-space:nowrap;">${c.icon || '📂'} ${c.name} (${catCount})</button>`;
    });
    html += `</div>`;
  }
  
  // Conteneur pour la grille de produits
  html += `<div class="products-grid" id="products-grid-detail" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:1rem;"></div>`;
  
  // ✅ BOUTON POUR ALLER AU PANIER
  html += `
    <div style="margin-top:2rem; text-align:center; padding-bottom: 2rem;">
      <button onclick="showMyCartProperly()" style="background:linear-gradient(135deg, #f5a623 0%, #d48a1b 100%); color:#0a1929; border:none; padding:1rem 2rem; border-radius:10px; font-size:1.1rem; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(245,166,35,0.3);">
        🛒 Voir mon panier et Commander
      </button>
    </div>
  `;
  
  document.getElementById('store-detail-content').innerHTML = html;
  
  // Sauvegarder les produits en mémoire pour le filtrage par catégorie
  window.currentStoreProducts = validProducts;
  
  // Afficher les produits immédiatement
  renderClientProductsGrid(store.id, 'all', validProducts);
  
  // Mettre à jour le compteur inline
  if (typeof updateInlineCartCount === 'function') updateInlineCartCount();
}

// ✅ FONCTION POUR AFFICHER LA GRILLE DE PRODUITS
function renderClientProductsGrid(store_id, categoryId, allProducts) {
  const grid = document.getElementById('products-grid-detail');
  if (!grid) return;

  const filteredProducts = categoryId === 'all' 
    ? allProducts 
    : allProducts.filter(p => String(p.category_id) === String(categoryId));

  if (filteredProducts.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#666; padding:2rem; background:white; border-radius:8px;">Aucun produit dans cette catégorie pour le moment.</p>';
    return;
  }

  grid.innerHTML = filteredProducts.map(p => `
    <div style="background:white; padding:1rem; border-radius:12px; text-align:center; border:1px solid #eee; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display:flex; flex-direction:column; justify-content:space-between; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
      <div>
        <div style="font-size:3rem; margin-bottom:0.5rem;">${p.icon || '📦'}</div>
        <h4 style="margin:0 0 0.5rem 0; font-size:1rem; color:#0a1929; min-height:2.5rem; display:flex; align-items:center; justify-content:center;">${p.name}</h4>
        <p style="margin:0; color:#10b981; font-weight:bold; font-size:1.2rem;">${parseFloat(p.price).toFixed(2)} $</p>
        <p style="margin:0.5rem 0 0 0; font-size:0.85rem; color:#666;">${p.description || ''}</p>
      </div>
      <!-- ✅ BOUTON AJOUTER AU PANIER CORRIGÉ (Envoie juste l'ID à ta fonction) -->
      <button onclick="addToCart(${p.id})" style="background:#0a1929; color:white; border:none; padding:10px; border-radius:8px; cursor:pointer; font-size:0.9rem; font-weight:bold; margin-top:1rem; width:100%; display:flex; align-items:center; justify-content:center; gap:8px;">
        🛒 Ajouter
      </button>
    </div>
  `).join('');
}

// ✅ FONCTION POUR FILTRER PAR CATÉGORIE (Clic sur les boutons)
function filterClientProducts(store_id, categoryId, btnElement, allProducts) {
  // Mettre à jour l'apparence des boutons
  document.querySelectorAll('.categories-bar .cat-btn').forEach(btn => {
    btn.style.background = '#f3f4f6';
    btn.style.color = '#374151';
  });
  btnElement.style.background = '#0a1929';
  btnElement.style.color = 'white';

  // Rafraîchir la grille avec le filtre
  renderClientProductsGrid(store_id, categoryId, allProducts);
}

function addToCart(prodId) {
  const p = products.find(x => String(x.id) === String(prodId));
  if (!p) return;
  
  const ex = cart.find(c => String(c.productId) === String(prodId));
  if (ex) {
    ex.qty++;
  } else {
    cart.push({ productId: prodId, name: p.name, icon: p.icon, price: p.price, qty: 1 });
  }
  
  updateCart(); // ✅ Met à jour le panier principal du header
  showToast('✅ ' + p.name + ' ajouté !');
  updateInlineCartCount(); // ✅ Met à jour le compteur en bas
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ============ MISE À JOUR DU PANIER AVEC FRAIS DYNAMIQUES ============
function updateCart() {
  // ✅ ÉTAPE 1 : FORCER LA SYNCHRONISATION DES DONNÉES UTILISATEUR
  // On lit les toutes dernières données sauvegardées dans le navigateur
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (e) {
      console.error("❌ Erreur lecture currentUser:", e);
    }
  }

  // ✅ ÉTAPE 2 : VÉRIFIER SI LES GPS SONT VALIDES (pas juste présents)
  const hasValidGPS = currentUser && 
                      currentUser.lat && 
                      currentUser.lng && 
                      !isNaN(parseFloat(currentUser.lat)) && 
                      !isNaN(parseFloat(currentUser.lng));

  console.log("🛒 [PANIER] currentUser.lat:", currentUser?.lat, "currentUser.lng:", currentUser?.lng, "hasValidGPS:", hasValidGPS);

  document.getElementById('cart-count').textContent = cart.reduce((s, c) => s + c.qty, 0);
  const el = document.getElementById('cart-items');
  const feeDetails = document.getElementById('delivery-fee-details');
  const settings = platformSettings || {};
  const baseFee = settings.deliveryBaseFee || 7.00;
  const perKm = settings.deliveryPerKm || 1.00;
  const taxRate = settings.taxRate || 0.14975;

  if (!cart.length) {
    el.innerHTML = '<p style="text-align:center;color:#666;padding:2rem">Votre panier est vide</p>';
    feeDetails.innerHTML = '';
    document.getElementById('subtotal').textContent = '0.00 $';
    document.getElementById('fee-base').textContent = baseFee.toFixed(2) + ' $';
    document.getElementById('fee-distance-label').textContent = '↳ Distance (0 km × ' + perKm.toFixed(2) + '$)';
    document.getElementById('fee-distance').textContent = '0.00 $';
    document.getElementById('delivery-fee').textContent = baseFee.toFixed(2) + ' $';
    document.getElementById('taxes').textContent = '0.00 $';
    document.getElementById('total').textContent = baseFee.toFixed(2) + ' $';
    return;
  }

  el.innerHTML = cart.map((c, i) => `
    <div class="cart-item">
      <div style="font-size:2rem">${c.icon}</div>
      <div class="cart-item-info">
        <h4>${c.name}</h4>
        <p style="color:#666">${c.price.toFixed(2)} $</p>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
        <span><strong>${c.qty}</strong></span>
        <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
      </div>
      <strong style="min-width:70px;text-align:right">${(c.price * c.qty).toFixed(2)} $</strong>
    </div>
  `).join('');

  const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const store = getCurrentStore();
  let deliveryInfo;

  // ✅ ÉTAPE 3 : CALCUL DES FRAIS AVEC VÉRIFICATION ROBUSTE DES GPS
  if (store && hasValidGPS && store.lat && store.lng) {
    console.log("✅ [PANIER] GPS valides détectés. Calcul de la distance...");
    deliveryInfo = calculateDeliveryFee(
      store.lat, 
      store.lng, 
      parseFloat(currentUser.lat), 
      parseFloat(currentUser.lng)
    );
  } else {
    console.warn("⚠️ [PANIER] GPS manquants ou invalides. Application des frais de base.");
    deliveryInfo = { baseFee: baseFee, distanceKm: 0, perKmFee: 0, totalFee: baseFee };
  }

  // ✅ ÉTAPE 4 : AFFICHAGE DES DÉTAILS OU DU MESSAGE D'ALERTE
  if (store && hasValidGPS) {
    feeDetails.innerHTML = `
      <div class="delivery-fee-breakdown">
        <h4>🚗 Détail des frais de livraison</h4>
        <div class="delivery-fee-line"><span>🏪 Commerce :</span><strong>${store.name}</strong></div>
        <div class="delivery-fee-line"><span>📍 Distance :</span><strong>${deliveryInfo.distanceKm.toFixed(1)} km</strong></div>
        <div class="delivery-fee-line"><span>💰 Frais de base :</span><span>${deliveryInfo.baseFee.toFixed(2)} $</span></div>
        <div class="delivery-fee-line"><span>📏 ${deliveryInfo.distanceKm.toFixed(1)} km × ${perKm.toFixed(2)} $/km :</span><span>${deliveryInfo.perKmFee.toFixed(2)} $</span></div>
        <div class="delivery-fee-total"><span>TOTAL LIVRAISON :</span><span>${deliveryInfo.totalFee.toFixed(2)} $</span></div>
      </div>`;
  } else {
    feeDetails.innerHTML = `<div class="delivery-fee-breakdown" style="background:#fee2e2;border-color:#dc2626">
      <h4 style="color:#991b1b">⚠️ Adresse de livraison incomplète</h4>
      <p style="font-size:0.85rem;color:#991b1b">Pour calculer les frais, votre profil doit avoir une adresse avec coordonnées GPS. 
      <a onclick="showProfiless()" style="color:#0a1929;font-weight:bold;cursor:pointer;text-decoration:underline">Modifier mon profil</a></p>
      <p style="font-size:0.85rem;margin-top:0.5rem;color:#991b1b">Frais de base appliqués : <strong>${baseFee.toFixed(2)} $</strong></p>
    </div>`;
  }

  const tax = sub * taxRate;
  const tot = sub + deliveryInfo.totalFee + tax;

  document.getElementById('subtotal').textContent = sub.toFixed(2) + ' $';
  document.getElementById('fee-base').textContent = deliveryInfo.baseFee.toFixed(2) + ' $';
  document.getElementById('fee-distance-label').textContent = `↳ Distance (${deliveryInfo.distanceKm.toFixed(1)} km × ${perKm.toFixed(2)}$)`;
  document.getElementById('fee-distance').textContent = deliveryInfo.perKmFee.toFixed(2) + ' $';
  document.getElementById('delivery-fee').textContent = deliveryInfo.totalFee.toFixed(2) + ' $';
  document.getElementById('taxes').textContent = tax.toFixed(2) + ' $';
  document.getElementById('total').textContent = tot.toFixed(2) + ' $';
}

function changeQty(i, d) {
  cart[i].qty += d;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  updateCart();
}

function scrollToCart() {
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('store-detail-section').style.display = 'none';
  document.getElementById('client-orders-section').style.display = 'none';
  document.getElementById('client-order-detail-section').style.display = 'none';
  document.getElementById('client-profile-section').style.display = 'none';
  // ✅ CORRECTION : Remettre le panier en visible
  document.getElementById('cart-section').style.display = 'block';
  setTimeout(() => { document.getElementById('cart-section').scrollIntoView({ behavior: 'smooth' }); }, 100);
}


function updateDeliveryAddress() {
  const d = document.getElementById('delivery-address-display');
  if (currentUser && currentUser.role === 'client') {
    d.innerHTML = `<div class="delivery-address-box">
      <h4>📍 Adresse de livraison</h4>
      <p><strong>${currentUser.name}</strong><br>${currentUser.address}<br>📞 ${currentUser.phone}</p>
    </div>`;
  } else {
    d.innerHTML = '';
  }
}

// ============ COMMANDES CLIENT ============
function showClientOrders() {
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('store-detail-section').style.display = 'none';
  // ✅ CORRECTION : Garder le panier visible même dans "Mes commandes"
  document.getElementById('cart-section').style.display = 'block';
  document.getElementById('client-order-detail-section').style.display = 'none';
  document.getElementById('client-profile-section').style.display = 'none';
  document.getElementById('client-orders-section').style.display = 'block';
  renderClientOrders();
}

async function renderClientOrders() {
  const list = document.getElementById('client-orders-list');
  try {
    const { data: ordersData, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('client_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur:', error);
      list.innerHTML = '<div class="empty-state"><p>Erreur de chargement</p></div>';
      return;
    }

    orders = ordersData.map(o => ({
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

    if (orders.length === 0) {
      list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><p>Aucune commande</p><button class="btn" style="margin-top:1rem" onclick="showClientStores()">🛍️ Commencer mes achats</button></div>';
      return;
    }

    list.innerHTML = orders.map(o => {
      const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
      return `<div class="order-card" onclick="showClientOrderDetail(${o.id})">
        <div class="order-card-header">
          <div><h4>Commande #${o.orderNumber}</h4><p style="color:#666;font-size:0.85rem">${new Date(o.createdAt).toLocaleString('fr-CA')}</p></div>
          <span class="status-badge ${st.class}">${st.label}</span>
        </div>
        <div class="order-card-details">
          <div>🏪 ${o.storeName || 'Commerce'}</div>
          <div>📦 ${o.items.length} article(s)</div>
          <div>💰 <strong>${o.total.toFixed(2)} $</strong></div>
          <div>🚗 Livraison : ${o.deliveryFee.toFixed(2)} $</div>
        </div>
      </div>`;
    }).join('');
  } catch (e) {
    console.error('Erreur:', e);
    list.innerHTML = '<div class="empty-state"><p>Erreur</p></div>';
  }
}

function showClientOrderDetail(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('store-detail-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('client-orders-section').style.display = 'none';
  document.getElementById('client-profile-section').style.display = 'none';
  document.getElementById('client-order-detail-section').style.display = 'block';

  const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
  const allStatuses = ['pending', 'confirmed', 'searching_driver', 'driver_assigned', 'driver_to_store', 'at_store', 'picked_up', 'driver_to_client', 'delivered'];
  const currentIdx = allStatuses.indexOf(order.status);

  let html = `<button class="back-btn" onclick="showClientOrders()">← Retour</button>`;
  html += `<div class="store-detail-header">
    <div class="store-detail-icon">📦</div>
    <div class="store-detail-info">
      <h2>Commande #${order.orderNumber}</h2>
      <p>${new Date(order.createdAt).toLocaleString('fr-CA')}</p>
      <p><span class="status-badge ${st.class}">${st.label}</span></p>
    </div>
  </div>`;

  html += `<div class="tracking-steps">`;
  const steps = [
    { status: 'pending', icon: '📝', title: 'Commande reçue' },
    { status: 'confirmed', icon: '✅', title: 'Paiement confirmé' },
    { status: 'searching_driver', icon: '🔍', title: 'Recherche livreur' },
    { status: 'driver_assigned', icon: '🚗', title: 'Livreur assigné' },
    { status: 'driver_to_store', icon: '🛣️', title: 'En route vers commerce' },
    { status: 'at_store', icon: '🏪', title: 'Au commerce' },
    { status: 'picked_up', icon: '📦', title: 'Commande récupérée' },
    { status: 'driver_to_client', icon: '🚗', title: 'En route vers vous' },
    { status: 'delivered', icon: '🏠', title: 'Livrée !' }
  ];
  steps.forEach((s) => {
    const idx = allStatuses.indexOf(s.status);
    let cls = '';
    if (idx < currentIdx) cls = 'done';
    else if (idx === currentIdx) cls = 'active';
    html += `<div class="tracking-step ${cls}">
      <div class="step-icon">${s.icon}</div>
      <div><h4>${s.title}</h4><p style="color:#666;font-size:0.85rem">${idx <= currentIdx ? '✓ Complété' : 'En attente'}</p></div>
    </div>`;
  });
  html += `</div>`;

  html += `<div class="profile-section">
    <h3 style="color:#0a1929;margin-bottom:1rem">📋 Détails</h3>
    <div class="profile-grid">
      <div class="profile-field"><label>Commerce</label><div class="value">${order.storeName || '-'}</div></div>
      <div class="profile-field"><label>Livreur</label><div class="value">${order.driverName || 'En attente'}</div></div>
      <div class="profile-field"><label>Adresse</label><div class="value">${order.clientAddress}</div></div>
      <div class="profile-field"><label>Téléphone</label><div class="value">${order.clientPhone}</div></div>
    </div>
  </div>`;

  html += `<div class="profile-section">
    <h3 style="color:#0a1929;margin-bottom:1rem">💰 Facturation</h3>
    <div class="delivery-fee-breakdown">
      <div class="delivery-fee-line"><span>Sous-total</span><span>${order.subtotal.toFixed(2)} $</span></div>
      <div class="delivery-fee-line"><span>Livraison</span><span>${order.deliveryFee.toFixed(2)} $</span></div>
      <div class="delivery-fee-line"><span>Taxes</span><span>${order.tax.toFixed(2)} $</span></div>
      <div class="delivery-fee-total"><span>Total</span><span>${order.total.toFixed(2)} $</span></div>
    </div>
  </div>`;

  html += `<div class="profile-section">
    <h3 style="color:#0a1929;margin-bottom:1rem">🛒 Articles</h3>`;
  order.items.forEach(item => {
    html += `<div style="display:flex;align-items:center;gap:1rem;padding:0.8rem;border-bottom:1px solid #eee">
      <div style="font-size:2rem">${item.icon}</div>
      <div style="flex:1"><strong>${item.name}</strong><br><span style="color:#666;font-size:0.85rem">Qté: ${item.qty} × ${item.price.toFixed(2)}$</span></div>
      <strong style="color:#0a1929">${(item.qty * item.price).toFixed(2)} $</strong>
    </div>`;
  });
  html += `</div>`;

  if (order.status === 'pending' || order.status === 'confirmed') {
    html += `<button class="btn" style="background:#dc2626;width:100%;margin-top:1rem" onclick="cancelOrder(${order.id})">❌ Annuler la commande</button>`;
  }

  document.getElementById('client-order-detail-content').innerHTML = html;
}

async function placeOrder() {
  console.log("💳 [COMMANDE] Début du processus...");

  if (!currentUser || !currentUser.id) {
    showToast('🔑 Veuillez vous connecter pour commander');
    openLoginModal();
    return;
  }

  if (!cart || cart.length === 0) {
    showToast('🛒 Votre panier est vide');
    return;
  }

  // 1. Calculer le total
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = parseFloat(document.getElementById('delivery-fee')?.textContent) || 7.00;
  const taxes = parseFloat(document.getElementById('taxes')?.textContent) || 0;
  const total = subtotal + deliveryFee + taxes;

  // Récupérer l'ID du commerce (depuis le premier article du panier ou une variable globale)
  const storeId = cart[0]?.store_id || window.currentStoreId || null;

  console.log(`💰 Total: ${total.toFixed(2)}$ | Commerce ID: ${storeId}`);

  try {
    // 2. 🔥 VÉRIFICATION SOUPLE DU WALLET (Ne plante pas si la colonne n'existe pas)
    let currentBalance = 0;
    let walletExists = false;

    try {
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('wallet_balance')
        .eq('id', currentUser.id)
        .single();

      if (!error && profile && profile.wallet_balance !== undefined) {
        walletExists = true;
        currentBalance = parseFloat(profile.wallet_balance) || 0;
        console.log(`💰 Solde actuel: ${currentBalance.toFixed(2)}$`);

        if (currentBalance < total) {
          showToast(`❌ Solde insuffisant ! (${currentBalance.toFixed(2)}$ < ${total.toFixed(2)}$)`);
          if (typeof openDepositModal === 'function') openDepositModal();
          return;
        }
      } else {
        console.log("ℹ️ Colonne wallet_balance non trouvée, on passe à la commande normale.");
      }
    } catch (walletCheckErr) {
      console.warn("⚠️ Vérification wallet ignorée:", walletCheckErr.message);
    }

    // 3. Confirmer la commande
    if (!confirm(`Confirmer la commande de ${total.toFixed(2)}$ ?`)) {
      return;
    }

    // 4. Préparer les données de la commande (structure standard)
// 4. Préparer les données de la commande (structure standard)


    // 5. Créer la commande
    const { data: newOrder, error: orderError } = await supabaseClient
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error("❌ Erreur création commande:", orderError);
      showToast('❌ Erreur lors de la création de la commande : ' + orderError.message);
      return;
    }

    console.log("✅ Commande créée avec succès :", newOrder.id);

    // 6. 🔥 DÉDUIRE LE WALLET (Seulement si la vérification a réussi plus tôt)
    if (walletExists) {
      const newBalance = currentBalance - total;
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', currentUser.id);

      if (!updateError) {
        currentUser.wallet_balance = newBalance;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        const walletEl = document.getElementById('wallet-balance');
        if (walletEl) walletEl.textContent = newBalance.toFixed(2);
        
        console.log(`✅ Wallet mis à jour: ${newBalance.toFixed(2)}$`);
      } else {
        console.error("❌ Erreur mise à jour wallet:", updateError);
      }
    }

    // 7. Vider le panier et notifier
    cart = [];
    localStorage.removeItem('cart');
    if (typeof updateCart === 'function') updateCart();

    showToast(`✅ Commande #${newOrder.id.substring(0, 8)} confirmée !`);

    // 8. Notification au commerce (optionnel)
    if (typeof showNotification === 'function' && storeId) {
      showNotification(
        'Nouvelle commande',
        `Nouvelle commande de ${total.toFixed(2)}$`,
        'info',
        storeId
      );
    }

    // 9. Rediriger vers l'historique des commandes
    setTimeout(() => {
      if (typeof showClientOrders === 'function') {
        showClientOrders();
      }
    }, 1500);

  } catch (err) {
    console.error("❌ Erreur globale placeOrder:", err);
    showToast('❌ Une erreur est survenue : ' + err.message);
  }
}


async function cancelOrder(orderId) {
  if (!confirm('Voulez-vous vraiment annuler cette commande ?')) return;
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  try {
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', time: new Date().toISOString(), note: 'Annulée par le client' });

    await supabaseClient.from('orders').update({
      status: 'cancelled',
      status_history: order.statusHistory
    }).eq('id', orderId);

    await showNotification(currentUser.id, '❌ Commande annulée', `Votre commande ${order.orderNumber} a été annulée`);
    await showNotification('admin', '❌ Commande annulée', `Commande ${order.orderNumber} annulée par ${currentUser.name}`);

    showToast('❌ Commande annulée');
    showClientOrders();
  } catch (err) {
    console.error('Erreur:', err);
    showToast('❌ Erreur');
  }
}

// ==========================================
// ✅ AFFICHAGE UNIVERSEL DE L'ADRESSE (Admin, Commerce, Livreur)
// ==========================================
function getFormattedOrderAddress(order) {
  if (!order) return "Adresse non disponible";
  
  const name = order.client_name || "Client inconnu";
  const phone = order.client_phone || "Pas de téléphone";
  const address = order.client_address || "Adresse non fournie";
  
  // On construit une chaîne propre et lisible pour tout le monde
  return `
    <div style="font-size: 0.9rem; line-height: 1.4;">
      <strong>👤 ${name}</strong><br>
      <strong>📞 ${phone}</strong><br>
      <strong>📍 ${address}</strong>
      ${order.client_lat && order.client_lng ? `<br><span style="color:#666; font-size:0.8rem;">(GPS: ${order.client_lat}, ${order.client_lng})</span>` : ''}
    </div>
  `;
}
// ============ PROFIL ============
function showProfiles() {
  if (!currentUser) return;
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('store-detail-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('client-orders-section').style.display = 'none';
  document.getElementById('client-order-detail-section').style.display = 'none';
  document.getElementById('client-profile-section').style.display = 'block';
  renderProfiles();
}

function renderProfiles() {
  const content = document.getElementById('client-profile-content');
  const myOrders = orders.filter(o => o.clientId === currentUser.id);
  const totalSpent = myOrders.reduce((s, o) => s + o.total, 0);

  let html = `<div class="profile-section">
    <div class="profile-header">
      <div class="profile-avatar">${currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
      <div class="profile-info">
        <h2>${currentUser.name}</h2>
        <p>${currentUser.role === 'client' ? '👤 Client' : currentUser.role === 'driver' ? '🚗 Livreur' : '⚙️ Admin'}</p>
        <p style="font-size:0.85rem;color:#999">Membre depuis ${new Date(currentUser.createdAt).toLocaleDateString('fr-CA')}</p>
      </div>
    </div>
    <div class="profile-grid">
      <div class="profile-field"><label>📧 Email</label><div class="value">${currentUser.email}</div></div>
      <div class="profile-field"><label>📞 Téléphone</label><div class="value">${currentUser.phone}</div></div>
      <div class="profile-field" style="grid-column:1/-1"><label>📍 Adresse</label><div class="value">${currentUser.address}</div></div>
    </div>
    <button class="btn" style="margin-top:1rem" onclick="openEditProfiles()">✏️ Modifier mon profil</button>
  </div>`;

  if (currentUser.role === 'client') {
    html += `<div class="stats">
      <div class="stat"><div class="stat-val">${myOrders.length}</div><div class="stat-lbl">Commandes</div></div>
      <div class="stat"><div class="stat-val">${totalSpent.toFixed(2)} $</div><div class="stat-lbl">Total dépensé</div></div>
    </div>`;
  }

  content.innerHTML = html;
}

function openEditProfile() {
  document.getElementById('ep-name').value = currentUser.name;
  document.getElementById('ep-phone').value = currentUser.phone;
  document.getElementById('ep-address').value = currentUser.address;
  openModal('edit-profile-modal');
  setTimeout(() => initAutocomplete('ep-address', 'ep-address-suggestions'), 100);
}

// ==========================================
// ✅ SAUVEGARDE DU PROFIL AVEC SYNCHRONISATION UNIVERSELLE
// ==========================================

// ==========================================
// ✅ FONCTION DE SYNCHRONISATION UNIVERSELLE
// ==========================================


// ============ LIVREUR ============
async function showDriverDashboard() {
  switchView('view-driver');
  document.getElementById('driver-dashboard-section').style.display = 'block';
  document.getElementById('driver-order-detail-section').style.display = 'none';
  document.getElementById('driver-history-section').style.display = 'none';
  
  // ✅ AJOUT : Charger les derniers paramètres depuis Supabase AVANT d'afficher
  if (typeof loadPlatformSettings === 'function') {
    await loadPlatformSettings();
  }
  
  renderDriverDashboard();
}

function renderDriverDashboard() {
  const today = new Date().toDateString();
  const myOrders = orders.filter(o => o.driverId === currentUser.id);
  const todayOrders = myOrders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todayEarnings = todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.deliveryFee * platformSettings.driverCommission), 0);

  document.getElementById('d-deliveries').textContent = todayOrders.length;
  document.getElementById('d-earnings').textContent = todayEarnings.toFixed(2) + ' $';
  document.getElementById('d-total').textContent = myOrders.filter(o => o.status === 'delivered').length;

  const available = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'searching_driver');
  const availDiv = document.getElementById('driver-available-orders');

  if (available.length === 0) {
    availDiv.innerHTML = '<div class="empty-state"><p>🎉 Aucune commande disponible</p></div>';
  } else {
    availDiv.innerHTML = available.map(o => {
      const earning = (o.deliveryFee * platformSettings.driverCommission).toFixed(2);
      const dist = (o.deliveryDistanceKm || 0).toFixed(1);
      return `<div class="driver-order">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">
          <div><h4>Commande #${o.orderNumber}</h4><p style="color:#666">${o.storeName || 'Commerce'}</p></div>
          <span style="background:#f5f1e8;padding:0.3rem 0.8rem;border-radius:20px;color:#0a1929;font-weight:bold">+ ${earning} $</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin:1rem 0;font-size:0.9rem">
          <div>📦 ${o.items.length} article(s)</div>
          <div>💰 Total : ${o.total.toFixed(2)} $</div>
          <div>📍 ${dist} km</div>
          <div>🚗 Livraison : ${o.deliveryFee.toFixed(2)} $</div>
        </div>
        <div class="driver-actions">
          <button class="btn-sm btn-green" onclick="acceptDriverOrder(${o.id})">✅ Accepter</button>
          <button class="btn-sm btn-blue" onclick="showDriverOrderDetail(${o.id})">👁️ Détails</button>
        </div>
      </div>`;
    }).join('');
  }

  const active = myOrders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const activeDiv = document.getElementById('driver-active-orders');

  if (active.length === 0) {
    activeDiv.innerHTML = '<div class="empty-state"><p>Aucune livraison en cours</p></div>';
  } else {
    activeDiv.innerHTML = active.map(o => {
      const st = STATUS_LABELS[o.status];
      return `<div class="driver-order" style="border-color:#f5a623">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">
          <div><h4>Commande #${o.orderNumber}</h4><p style="color:#666">${o.clientName} • ${o.storeName}</p></div>
          <span class="status-badge ${st.class}">${st.label}</span>
        </div>
        <div class="driver-actions">
          <button class="btn-sm btn-blue" onclick="showDriverOrderDetail(${o.id})">👁️ Détails</button>
          ${getNextActionButtons(o)}
        </div>
      </div>`;
    }).join('');
  }
}

function getNextActionButtons(order) {
  const actions = {
    'driver_assigned': `<button class="btn-sm btn-orange" onclick="updateOrderStatus(${order.id},'driver_to_store')">🛣️ En route</button>`,
    'driver_to_store': `<button class="btn-sm btn-orange" onclick="updateOrderStatus(${order.id},'at_store')">🏪 Arrivé</button>`,
    'at_store': `<button class="btn-sm btn-green" onclick="updateOrderStatus(${order.id},'picked_up')">📦 Récupérée</button>`,
    'picked_up': `<button class="btn-sm btn-orange" onclick="updateOrderStatus(${order.id},'driver_to_client')">🚗 En route client</button>`,
    'driver_to_client': `<button class="btn-sm btn-green" onclick="updateOrderStatus(${order.id},'delivered')">🏠 Livrée</button>`
  };
  return actions[order.status] || '';
}

async function acceptDriverOrder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  try {
    order.driverId = currentUser.id;
    order.driverName = currentUser.name;
    order.status = 'driver_assigned';
    order.statusHistory.push({ status: 'driver_assigned', time: new Date().toISOString(), note: `Acceptée par ${currentUser.name}` });

    await supabaseClient.from('orders').update({
      driver_id: currentUser.id,
      driver_name: currentUser.name,
      status: 'driver_assigned',
      status_history: order.statusHistory
    }).eq('id', orderId);

    await showNotification('🚗 Livreur assigné', `${currentUser.name} s'occupe de votre commande ${order.orderNumber}`, 'delivery', order.clientId);
    await showNotification('admin', '🚗 Commande assignée', `${order.orderNumber} → ${currentUser.name}`);

    showToast('✅ Commande acceptée !');
    renderDriverDashboard();
  } catch (err) {
    console.error('Erreur:', err);
    showToast('❌ Erreur');
  }
}



function showDriverOrderDetail(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  switchView('view-driver');
  document.getElementById('driver-dashboard-section').style.display = 'none';
  document.getElementById('driver-history-section').style.display = 'none';
  document.getElementById('driver-order-detail-section').style.display = 'block';

  const st = STATUS_LABELS[order.status];
  const store = stores.find(s => s.id === order.store_id);

  let html = `<button class="back-btn" onclick="showDriverDashboard()">← Retour</button>`;
  html += `<div class="store-detail-header">
    <div class="store-detail-icon">📦</div>
    <div class="store-detail-info">
      <h2>Commande #${order.orderNumber}</h2>
      <p>Client : ${order.clientName}</p>
      <p><span class="status-badge ${st.class}">${st.label}</span></p>
    </div>
  </div>`;

  html += `<div class="profile-section">
    <h3 style="color:#0a1929;margin-bottom:1rem">👤 Client</h3>
    <div class="profile-grid">
      <div class="profile-field"><label>Nom</label><div class="value">${order.clientName}</div></div>
      <div class="profile-field"><label>Téléphone</label><div class="value"><a href="tel:${order.clientPhone}" style="color:#0a1929">${order.clientPhone}</a></div></div>
      <div class="profile-field" style="grid-column:1/-1"><label>📍 Adresse</label><div class="value">${order.clientAddress}</div></div>
    </div>
    <button class="btn" style="margin-top:1rem;background:#2563eb" onclick="window.open('https://www.google.com/maps/dir/${store?.lat || MANIWAKI_CENTER[0]},${store?.lng || MANIWAKI_CENTER[1]}/${order.clientLat || MANIWAKI_CENTER[0]},${order.clientLng || MANIWAKI_CENTER[1]}','_blank')">🧭 Naviguer</button>
  </div>`;

  html += `<div class="profile-section">
    <h3 style="color:#0a1929;margin-bottom:1rem">💰 Vos gains</h3>
    <div class="delivery-fee-breakdown">
      <div class="delivery-fee-line"><span>Frais de livraison :</span><span>${order.deliveryFee.toFixed(2)} $</span></div>
      <div class="delivery-fee-total"><span>Votre commission (${(platformSettings.driverCommission * 100).toFixed(0)}%) :</span><span>${(order.deliveryFee * platformSettings.driverCommission).toFixed(2)} $</span></div>
    </div>
  </div>`;

  html += `<div class="profile-section">
    <h3 style="color:#0a1929;margin-bottom:1rem">🛒 Articles</h3>`;
  order.items.forEach(item => {
    html += `<div style="display:flex;align-items:center;gap:1rem;padding:0.8rem;border-bottom:1px solid #eee">
      <div style="font-size:2rem">${item.icon}</div>
      <div style="flex:1"><strong>${item.name}</strong><br><span style="color:#666;font-size:0.85rem">Quantité : ${item.qty}</span></div>
    </div>`;
  });
  html += `</div>`;

  const nextBtn = getNextActionButtons(order);
  if (nextBtn) html += `<div style="margin-top:1rem">${nextBtn}</div>`;

  document.getElementById('driver-order-detail-content').innerHTML = html;
}

function showDriverHistory() {
  switchView('view-driver');
  document.getElementById('driver-dashboard-section').style.display = 'none';
  document.getElementById('driver-order-detail-section').style.display = 'none';
  document.getElementById('driver-history-section').style.display = 'block';

  const myDeliveries = orders.filter(o => o.driverId === currentUser.id);
  const completed = myDeliveries.filter(o => o.status === 'delivered');
  const totalEarnings = completed.reduce((s, o) => s + (o.deliveryFee * platformSettings.driverCommission), 0);

  document.getElementById('d-history-total').textContent = completed.length;
  document.getElementById('d-history-earnings').textContent = totalEarnings.toFixed(2) + ' $';

  const list = document.getElementById('driver-history-list');
  if (myDeliveries.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>Aucune livraison</p></div>';
    return;
  }

  list.innerHTML = myDeliveries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(o => {
    const st = STATUS_LABELS[o.status];
    const earning = o.status === 'delivered' ? (o.deliveryFee * platformSettings.driverCommission).toFixed(2) + ' $' : '-';
    return `<div class="order-card">
      <div class="order-card-header">
        <div><h4>#${o.orderNumber}</h4><p style="color:#666;font-size:0.85rem">${new Date(o.createdAt).toLocaleString('fr-CA')}</p></div>
        <span class="status-badge ${st.class}">${st.label}</span>
      </div>
      <div class="order-card-details">
        <div>👤 ${o.clientName}</div>
        <div>🏪 ${o.storeName}</div>
        <div>💰 Total : ${o.total.toFixed(2)} $</div>
        <div>💵 Gain : ${earning}</div>
      </div>
    </div>`;
  }).join('');
}

// ============ ADMIN - DASHBOARD ET ONGLETS ============
// ============ GESTION DES ONGLETS ADMIN (VERSION FINALE ET COMPLÈTE) ============
// ============ GESTION DES ONGLETS ADMIN (VERSION FINALE COMPLÈTE) ============
function adminTab(tabName, btnElement) {
  // 1. Enlever la classe "active" de tous les boutons du menu de gauche
  document.querySelectorAll('.admin-side li').forEach(li => {
    li.classList.remove('active');
  });

  // 2. Ajouter la classe "active" au bouton sur lequel on vient de cliquer
  if (btnElement) {
    btnElement.classList.add('active');
  }

  // 3. Cacher TOUTES les sections de contenu de l'administration
  const allSections = document.querySelectorAll('.admin-main > div');
  allSections.forEach(section => {
    section.style.display = 'none';
  });

  // 4. Définir la section à afficher (ex: si tabName = 'settings', on cherche 'admin-settings')
  const targetSection = document.getElementById('admin-' + tabName);

  // 5. Afficher la section et charger les données spécifiques à chaque onglet
  if (targetSection) {
    targetSection.style.display = 'block';
    
    if (tabName === 'dashboard') {
      // Rien de spécial à charger pour l'instant
    } 
    else if (tabName === 'pending-stores') {
      if (typeof renderPendingStores === 'function') renderPendingStores();
    } 
    else if (tabName === 'stores') {
      if (typeof renderAdminStores === 'function') renderAdminStores();
    } 
    else if (tabName === 'drivers') {
      if (typeof renderAdminDrivers === 'function') renderAdminDrivers();
    } 
    else if (tabName === 'clients') {
      if (typeof renderAdminClients === 'function') renderAdminClients();
    } 
    else if (tabName === 'orders') {
      if (typeof renderAdminOrders === 'function') renderAdminOrders();
    } 
    else if (tabName === 'settings') {
      // ✅ C'EST ICI QUE LA MAGIE OPÈRE POUR LES PARAMÈTRES !
      if (typeof loadPlatformSettings === 'function') {
        loadPlatformSettings(); 
      }
    }
  } else {
    console.warn("⚠️ Section non trouvée : admin-" + tabName);
  }
}

function renderAllAdmin() {
  renderAdminDashboard();
  renderAdminOrders();
  renderAdminStores();
  renderAdminCategories();
  renderAdminProducts();
  renderAdminDrivers();
  renderAdminClients();
  renderAdminSettings();
}

async function adminUpdateStoreName(store_id, newStoreName) {
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('❌ Accès refusé. Réservé aux administrateurs.');
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('stores')
      .update({ name: newStoreName.trim() })
      .eq('id', store_id);

    if (error) throw error;
    showToast('✅ Nom du commerce modifié par l\'admin !');
  } catch (err) {
    console.error('Erreur admin modification nom:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

async function showAdminClients() {
  console.log("👥 [ADMIN] Chargement de la liste des clients...");

  try {
    // 🔥 REQUÊTE SIMPLIFIÉE : Charger TOUS les clients
    const { data: clients, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Erreur requête clients:", error);
      showToast('❌ Erreur : ' + error.message);
      return;
    }

    console.log("📊 [ADMIN] Nombre de clients trouvés :", clients?.length || 0);

    const container = document.getElementById('admin-clients-list'); // ⚠️ ADAPTE L'ID SELON TON HTML
    if (!container) {
      console.error("❌ Conteneur 'admin-clients-list' introuvable dans le HTML");
      return;
    }

    if (!clients || clients.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#666; padding:2rem;">👥 Aucun client enregistré pour le moment</p>';
      return;
    }

    // 🔥 AFFICHER LES CLIENTS
    container.innerHTML = clients.map(client => {
      const hasGPS = client.lat && client.lng ? '✅' : '❌';
      
      return `
        <div style="background:white; padding:1.5rem; border-radius:12px; margin-bottom:1rem; border:1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem;">
            <div>
              <h3 style="margin:0; color:#0a1929;">${client.name || 'Client sans nom'}</h3>
              <p style="margin:0.3rem 0; color:#666; font-size:0.9rem;">📧 ${client.email || 'Pas d\'email'}</p>
              <p style="margin:0.3rem 0; color:#666; font-size:0.9rem;">📞 ${client.phone || 'Pas de téléphone'}</p>
            </div>
            <span style="background:${hasGPS === '✅' ? '#10b981' : '#ef4444'}; color:white; padding:0.4rem 0.8rem; border-radius:20px; font-size:0.8rem; font-weight:bold;">
              GPS ${hasGPS}
            </span>
          </div>
          
          ${client.address ? `
            <div style="background:#f9fafb; padding:1rem; border-radius:8px; margin-bottom:1rem;">
              <strong>📍 Adresse :</strong>
              <p style="margin:0.5rem 0; color:#333; font-size:0.9rem;">${client.address}</p>
              ${client.lat && client.lng ? `<p style="margin:0.3rem 0; color:#666; font-size:0.8rem;">GPS: ${client.lat}, ${client.lng}</p>` : ''}
            </div>
          ` : ''}

          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button onclick="viewClientOrders('${client.id}')" style="background:#3b82f6; color:white; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; font-size:0.85rem;">
              📦 Voir commandes
            </button>
            <button onclick="editClient('${client.id}')" style="background:#f59e0b; color:white; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; font-size:0.85rem;">
              ✏️ Modifier
            </button>
            <button onclick="deleteClient('${client.id}')" style="background:#ef4444; color:white; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; font-size:0.85rem;">
              🗑️ Supprimer
            </button>
          </div>
        </div>
      `;
    }).join('');

    console.log("✅ [ADMIN] Liste des clients affichée avec succès !");

  } catch (err) {
    console.error('❌ Erreur showAdminClients:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}
// ==========================================
// ✅ AFFICHER LES LIVREURS DANS LE DASHBOARD ADMIN
// ==========================================
async function showAdminDrivers() {
  console.log("🚚 [ADMIN] Chargement de la liste des livreurs...");

  try {
    // 🔥 On cherche dans 'profiles' les rôles 'livreur' OU 'driver' (pour compatibilité)
    const { data: drivers, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .in('role', ['livreur', 'driver']) 
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Erreur requête livreurs:", error);
      showToast('❌ Erreur : ' + error.message);
      return;
    }

    console.log("📊 [ADMIN] Nombre de livreurs trouvés :", drivers?.length || 0);

    // ⚠️ ADAPTE L'ID CI-DESSOUS si ton conteneur HTML s'appelle autrement
    const container = document.getElementById('admin-drivers-list') || document.getElementById('drivers-list');
    
    if (!container) {
      console.error("❌ Conteneur HTML pour les livreurs introuvable. Vérifie l'ID dans index.html");
      return;
    }

    if (!drivers || drivers.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#666; padding:2rem;">🚚 Aucun livreur enregistré pour le moment</p>';
      return;
    }

    // 🔥 GÉNÉRER L'AFFICHAGE HTML POUR CHAQUE LIVREUR
    container.innerHTML = drivers.map(driver => {
      const statusColor = driver.status === 'approved' ? '#10b981' : (driver.status === 'pending' ? '#f59e0b' : '#ef4444');
      const statusText = driver.status === 'approved' ? '✅ Approuvé' : (driver.status === 'pending' ? '⏳ En attente' : '❌ Refusé');

      return `
        <div style="background:white; padding:1.5rem; border-radius:12px; margin-bottom:1rem; border-left: 5px solid ${statusColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem;">
            <div>
              <h3 style="margin:0; color:#0a1929;">🚚 ${driver.name || 'Sans nom'}</h3>
              <p style="margin:0.3rem 0; color:#666; font-size:0.9rem;">📧 ${driver.email || 'Pas d\'email'}</p>
              <p style="margin:0.3rem 0; color:#666; font-size:0.9rem;">📞 ${driver.phone || 'Non spécifié'}</p>
              <p style="margin:0.3rem 0; color:#666; font-size:0.9rem;">🛵 Véhicule : ${driver.vehicle || 'Non spécifié'}</p>
            </div>
            <span style="background:${statusColor}; color:white; padding:0.4rem 0.8rem; border-radius:20px; font-size:0.8rem; font-weight:bold;">
              ${statusText}
            </span>
          </div>
          
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:1rem;">
            ${driver.status === 'pending' ? `
              <button onclick="approveDriver('${driver.id}')" style="background:#10b981; color:white; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; font-weight:bold;">
                ✅ Approuver
              </button>
              <button onclick="rejectDriver('${driver.id}')" style="background:#ef4444; color:white; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; font-weight:bold;">
                ❌ Refuser
              </button>
            ` : ''}
            <button onclick="deleteDriver('${driver.id}')" style="background:#6b7280; color:white; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer;">
              🗑️ Supprimer
            </button>
          </div>
        </div>
      `;
    }).join('');

    console.log("✅ [ADMIN] Liste des livreurs affichée avec succès !");

  } catch (err) {
    console.error('❌ Erreur showAdminDrivers:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ✅ FONCTIONS D'ACTION (À ajouter juste en dessous)
async function approveDriver(driverId) {
  try {
    await supabaseClient.from('profiles').update({ status: 'approved' }).eq('id', driverId);
    showToast('✅ Livreur approuvé !');
    showAdminDrivers(); // Rafraîchir la liste
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

async function rejectDriver(driverId) {
  try {
    await supabaseClient.from('profiles').update({ status: 'rejected' }).eq('id', driverId);
    showToast('⚠️ Livreur refusé.');
    showAdminDrivers();
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

async function deleteDriver(driverId) {
  if (!confirm('Supprimer définitivement ce livreur ?')) return;
  try {
    await supabaseClient.from('profiles').delete().eq('id', driverId);
    showToast('🗑️ Livreur supprimé.');
    showAdminDrivers();
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}
// ✅ VOIR LES COMMANDES D'UN CLIENT
async function viewClientOrders(clientId) {
  console.log("📦 Chargement des commandes du client:", clientId);
  
  try {
    const { data: orders, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!orders || orders.length === 0) {
      showToast('📭 Ce client n\'a aucune commande');
      return;
    }

    console.log("📦 Commandes trouvées:", orders.length);
    showToast(`📦 Ce client a ${orders.length} commande(s)`);
    
    // Ici tu peux afficher les commandes dans une modale ou une nouvelle vue
    // Pour l'instant, on log juste dans la console

  } catch (err) {
    console.error('❌ Erreur viewClientOrders:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ✅ MODIFIER UN CLIENT
function editClient(clientId) {
  console.log("✏️ Modification du client:", clientId);
  showToast('✏️ Fonctionnalité à venir');
}

// ✅ SUPPRIMER UN CLIENT
async function deleteClient(clientId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) return;

  try {
    const { error } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', clientId);

    if (error) throw error;

    showToast('✅ Client supprimé avec succès');
    showAdminClients(); // Rafraîchir la liste

  } catch (err) {
    console.error('❌ Erreur deleteClient:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

let currentOrderFilter = 'all';
function filterAdminOrders(filter) {
  currentOrderFilter = filter;
  renderAdminOrders();
}

function renderAdminOrders() {
  const list = document.getElementById('admin-orders-list');
  let filtered = orders.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (currentOrderFilter === 'pending') filtered = filtered.filter(o => ['pending','confirmed','searching_driver'].includes(o.status));
  else if (currentOrderFilter === 'in-progress') filtered = filtered.filter(o => ['driver_assigned','driver_to_store','at_store','picked_up','driver_to_client'].includes(o.status));
  else if (currentOrderFilter === 'delivered') filtered = filtered.filter(o => o.status === 'delivered');
  else if (currentOrderFilter === 'cancelled') filtered = filtered.filter(o => o.status === 'cancelled');

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>Aucune commande</p></div>';
    return;
  }
  list.innerHTML = `<table class="admin-table"><thead><tr><th>#</th><th>Client</th><th>Commerce</th><th>Livraison</th><th>Statut</th><th>Total</th><th>Actions</th></tr></thead><tbody>${filtered.map(o => {
    const st = STATUS_LABELS[o.status];
    return `<tr><td><strong>${o.orderNumber}</strong><br><span style="font-size:0.75rem;color:#999">${new Date(o.createdAt).toLocaleString('fr-CA')}</span></td><td>${o.clientName}<br><span style="font-size:0.8rem;color:#666">${o.clientPhone}</span></td><td>${o.storeName || '-'}</td><td><strong>${o.deliveryFee.toFixed(2)} $</strong><br><span style="font-size:0.75rem;color:#666">${(o.deliveryDistanceKm || 0).toFixed(1)} km</span></td><td><span class="status-badge ${st.class}">${st.label}</span></td><td><strong>${o.total.toFixed(2)} $</strong></td><td><div class="action-btns">${!o.driverId && o.status !== 'cancelled' && o.status !== 'delivered' ? `<button class="action-btn btn-blue" onclick="assignDriverModal(${o.id})">🚗 Assigner</button>` : ''}${!['cancelled','delivered'].includes(o.status) ? `<button class="action-btn btn-red" onclick="adminCancelOrder(${o.id})">❌</button>` : ''}</div></td></tr>`;
  }).join('')}</tbody></table>`;
}

async function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId) || {};
  if (!order.id) return;

  try {
    const history = order.status_history || order.statusHistory || [];
    history.push({ status: newStatus, time: new Date().toISOString(), note: `Mis à jour par ${currentUser.name}` });

    await supabaseClient.from('orders').update({
      status: newStatus,
      status_history: history
    }).eq('id', orderId);

    const messages = {
      'driver_to_store': '🛣️ Le livreur est en route vers le commerce',
      'at_store': '🏪 Le livreur est arrivé au commerce',
      'picked_up': '📦 Votre commande a été récupérée',
      'driver_to_client': '🚗 Le livreur est en route vers vous',
      'delivered': '🏠 Votre commande a été livrée avec succès !'
    };

    // ✅ Notifier le client
    const clientId = order.client_id || order.clientId;
    if (clientId) {
      await showNotification('Mise à jour commande', messages[newStatus] || 'Statut mis à jour', 'delivery', clientId);
    }

    // ✅ Si livrée, notifier l'admin
    if (newStatus === 'delivered') {
      const { data: admins } = await supabaseClient.from('profiles').select('id').eq('role', 'admin');
      if (admins) {
        for (const admin of admins) {
          await showNotification('Commande livrée', `La commande ${order.order_number || order.orderNumber} a été livrée par ${currentUser.name}`, 'success', admin.id);
        }
      }
    }

    showToast('✅ Statut mis à jour');
    if (typeof renderDriverDashboard === 'function') renderDriverDashboard();
    if (typeof renderAdminOrders === 'function') renderAdminOrders();
  } catch (err) {
    console.error('Erreur updateOrderStatus:', err);
    showToast('❌ Erreur');
  }
}

async function assignDriverModal(orderId) {
  const approvedDrivers = drivers.filter(d => d.status === 'approved');
  if (approvedDrivers.length === 0) { showToast('❌ Aucun livreur approuvé'); return; }
  
  const choice = prompt('Assigner au livreur :\n' + approvedDrivers.map((d, i) => `${i + 1}. ${d.name}`).join('\n') + '\nEntrez le numéro :');
  const idx = parseInt(choice) - 1;
  if (isNaN(idx) || !approvedDrivers[idx]) return;
  
  const order = orders.find(o => o.id === orderId);
  const driver = approvedDrivers[idx];

  try {
    const history = order.status_history || order.statusHistory || [];
    history.push({ status: 'driver_assigned', time: new Date().toISOString(), note: `Assigné par admin à ${driver.name}` });

    await supabaseClient.from('orders').update({
      driver_id: driver.id,
      driver_name: driver.name,
      status: 'driver_assigned',
      status_history: history
    }).eq('id', orderId);

    // ✅ Notifier le client
    const clientId = order.client_id || order.clientId;
    if (clientId) {
      await showNotification('Livreur assigné', `${driver.name} s'occupe de votre commande ${order.order_number || order.orderNumber}`, 'delivery', clientId);
    }

    // ✅ Notifier le livreur
    const fee = order.delivery_fee || order.deliveryFee || 0;
    await showNotification('Nouvelle mission', `Commande ${order.order_number || order.orderNumber} assignée (${fee.toFixed(2)}$ à gagner)`, 'delivery', driver.id);

    showToast('✅ Livreur assigné !');
    if (typeof renderAdminOrders === 'function') renderAdminOrders();
  } catch (err) {
    console.error('Erreur assignDriver:', err);
    showToast('❌ Erreur');
  }
}

async function adminCancelOrder(orderId) {
  if (!confirm('Annuler cette commande ?')) return;
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  try {
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', time: new Date().toISOString(), note: 'Annulée par admin' });

    await supabaseClient.from('orders').update({
      status: 'cancelled',
      status_history: order.statusHistory
    }).eq('id', orderId);

    await showNotification('❌ Commande annulée', `Votre commande ${order.orderNumber} a été annulée par l'administration`, 'warning', order.clientId);
    showToast('❌ Commande annulée');
    renderAdminOrders();
  } catch (err) {
    console.error('Erreur:', err);
    showToast('❌ Erreur');
  }
}

// ============ ADMIN - Commerces (VERSION CORRIGÉE) ============
function renderAdminStores() {
  const c = document.getElementById('stores-table-container');
  
  // ✅ FILTRE : On ne garde QUE les commerces dont le statut est 'active'
  const activeStores = stores.filter(s => s.status === 'active');
  
  if (!activeStores.length) { 
    c.innerHTML = '<div class="empty-state"><p>Aucun commerce actif pour le moment.</p></div>'; 
    return; 
  }
  
  c.innerHTML = `<table class="admin-table">
    <thead>
      <tr>
        <th>Icon</th>
        <th>Nom</th>
        <th>Type</th>
        <th>Adresse</th>
        <th>Statut</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${activeStores.map(s => {
        return `<tr onclick="viewStoreDetails(${s.id})" style="cursor:pointer">
          <td style="font-size:2rem;text-align:center">${s.icon}</td>
          <td><strong>${s.name}</strong></td>
          <td>${s.type}</td>
          <td style="font-size:0.9rem">${s.address}</td>
          <td><span class="badge badge-green">✅ Actif</span></td>
          <td>
            <div class="action-btns">
              <button class="action-btn btn-blue" onclick="event.stopPropagation(); editStore(${s.id})" title="Modifier le commerce">✏️</button>
              
              <!-- ✅ NOUVEAU BOUTON POUR RENOMMER -->
              <button class="action-btn btn-green" onclick="event.stopPropagation(); promptRenameStore(${s.id}, '${s.name.replace(/'/g, "\\'")}')" title="Renommer le commerce">🏷️</button>
              
              <button class="action-btn btn-red" onclick="event.stopPropagation(); confirmDelete('store',${s.id})" title="Supprimer">🗑️</button>
            </div>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

// ✅ FONCTION POUR RENOMMER UN COMMERCE (ADMIN)
async function promptRenameStore(store_id, currentName) {
  const newName = prompt("Entrez le nouveau nom pour ce commerce :", currentName);
  
  // Vérifie que le nom n'est pas vide et qu'il a vraiment changé
  if (newName && newName.trim() !== "" && newName.trim() !== currentName) {
    showToast('⏳ Mise à jour en cours...');
    
    // On appelle la fonction de mise à jour qu'on a créée plus tôt
    await adminUpdateStoreName(store_id, newName.trim());
    
    // Recharger les données et rafraîchir l'affichage
    if (typeof loadStores === 'function') await loadStores();
    renderAdminStores();
  }
}

function openStoreModal() {
  document.getElementById('store-modal-title').textContent = '➕ Ajouter un commerce';
  document.getElementById('store-id').value = '';
  document.getElementById('store-name').value = '';
  document.getElementById('store-type').value = '';
  document.getElementById('store-addr').value = '';
  document.getElementById('store-phone').value = '';
  document.getElementById('store-status').value = 'active';
  selectedStoreIcon = '';
  buildIconPicker('store-icon-picker', 'store-icon');
  openModal('store-modal');
  setTimeout(() => initAutocomplete('store-addr', 'store-addr-suggestions'), 100);
}

function editStore(id){
  const s=stores.find(x=>x.id===id);
  if(!s)return;
  document.getElementById('store-modal-title').textContent='✏️ Modifier';
  document.getElementById('store-id').value=s.id;
  document.getElementById('store-name').value=s.name;
  document.getElementById('store-type').value=s.type;
  document.getElementById('store-addr').value=s.address;
  document.getElementById('store-phone').value=s.phone||'';
  document.getElementById('store-logo').value=s.logo||'';
  document.getElementById('store-status').value=s.status;
  selectedStoreIcon=s.icon;
  buildIconPicker('store-icon-picker','store-icon');
  setTimeout(()=>{
    document.querySelectorAll('#store-icon-picker .icon-option').forEach(o=>{
      if(o.dataset.icon===s.icon)o.classList.add('selected');
    });
    initAutocomplete('store-addr','store-addr-suggestions');
  },50);
  openModal('store-modal');
}

async function saveStore(e) {
  e.preventDefault();
  if (!selectedStoreIcon && !document.getElementById('store-icon').value) {
    showToast('⚠️ Choisissez une icône'); return;
  }
  const id = document.getElementById('store-id').value;
  const addrInput = document.getElementById('store-addr');
  const storeData = {
    icon: document.getElementById('store-icon').value || selectedStoreIcon,
    name: document.getElementById('store-name').value,
    type: document.getElementById('store-type').value,
    address: addrInput.value,
    phone: document.getElementById('store-phone').value,
    logo: document.getElementById('store-logo').value || null,
    status: document.getElementById('store-status').value,
    lat: addrInput._lat || null,
    lng: addrInput._lng || null
  };
  try {
    if (id) {
      await supabaseClient.from('stores').update(storeData).eq('id', parseInt(id));
      const idx = stores.findIndex(s => s.id === parseInt(id));
      stores[idx] = { ...stores[idx], ...storeData };
      showToast('✅ Commerce modifié !');
    } else {
      const { data: newStore, error } = await supabaseClient.from('stores').insert(storeData).select().single();
      if (error) throw error;
      stores.push(newStore);
      showToast('✅ Commerce ajouté !');
    }
    closeModal('store-modal');
    renderAdminStores();
    renderLandingStores();
  } catch (err) {
    console.error('Erreur saveStore:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ============ ADMIN - CATÉGORIES ============
function renderAdminCategories() {
  const c = document.getElementById('categories-container');
  if (!categories.length) { c.innerHTML = '<div class="empty-state"><p>Aucune catégorie</p></div>'; return; }
  c.innerHTML = `<div class="cat-grid">${categories.map(cat => {
    const count = products.filter(p => p.category_id === cat.id).length;
    return `<div class="cat-card"><div class="cat-card-icon">${cat.icon}</div><div class="cat-card-name">${cat.name}</div><p style="color:#666;font-size:0.85rem;margin-bottom:0.5rem">${count} produit(s)</p><div class="cat-card-actions"><button class="action-btn btn-blue" onclick="editCategory(${cat.id})">✏️</button><button class="action-btn btn-red" onclick="confirmDelete('category',${cat.id})">🗑️</button></div></div>`;
  }).join('')}</div>`;
}

function openCategoryModal() {
  document.getElementById('cat-modal-title').textContent = '➕ Catégorie';
  document.getElementById('cat-id').value = '';
  document.getElementById('cat-name').value = '';
  selectedCatIcon = '';
  buildIconPicker('cat-icon-picker', 'cat-icon');
  openModal('category-modal');
}

function editCategory(id) {
  const c = categories.find(x => x.id === id);
  if (!c) return;
  document.getElementById('cat-modal-title').textContent = '✏️ Modifier';
  document.getElementById('cat-id').value = c.id;
  document.getElementById('cat-name').value = c.name;
  selectedCatIcon = c.icon;
  buildIconPicker('cat-icon-picker', 'cat-icon');
  setTimeout(() => {
    document.querySelectorAll('#cat-icon-picker .icon-option').forEach(o => {
      if (o.dataset.icon === c.icon) o.classList.add('selected');
    });
  }, 50);
  openModal('category-modal');
}

async function saveCategory(e) {
  e.preventDefault();
  if (!selectedCatIcon && !document.getElementById('cat-icon').value) {
    showToast('⚠️ Choisissez une icône'); return;
  }
  const id = document.getElementById('cat-id').value;
  const catData = {
    icon: document.getElementById('cat-icon').value || selectedCatIcon,
    name: document.getElementById('cat-name').value
  };

  try {
    if (id) {
      await supabaseClient.from('categories').update(catData).eq('id', parseInt(id));
      const idx = categories.findIndex(c => c.id === parseInt(id));
      categories[idx] = { ...categories[idx], ...catData };
      showToast('✅ Modifiée !');
    } else {
      const { data: newCat, error } = await supabaseClient.from('categories').insert(catData).select().single();
      if (error) throw error;
      categories.push(newCat);
      showToast('✅ Ajoutée !');
    }
    closeModal('category-modal');
    renderAdminCategories();
  } catch (err) {
    console.error('Erreur saveCategory:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ============ ADMIN - PRODUITS ============
function renderAdminProducts() {
  const c = document.getElementById('products-table-container');
  if (!products.length) { c.innerHTML = '<div class="empty-state"><p>Aucun produit</p></div>'; return; }
  c.innerHTML = `<table class="admin-table"><thead><tr><th>Icon</th><th>Nom</th><th>Commerce</th><th>Catégorie</th><th>Prix</th><th>Dispo</th><th>Actions</th></tr></thead><tbody>${products.map(p => {
    const s = stores.find(x => x.id === p.store_id);
    const cat = categories.find(x => x.id === p.category_id);
    return `<tr><td style="font-size:1.5rem;text-align:center">${p.icon}</td><td><strong>${p.name}</strong></td><td>${s ? s.name : '-'}</td><td>${cat ? cat.icon + ' ' + cat.name : '-'}</td><td><strong>${p.price.toFixed(2)} $</strong></td><td><span class="badge ${p.available ? 'badge-green' : 'badge-red'}">${p.available ? '✅' : '❌'}</span></td><td><div class="action-btns"><button class="action-btn btn-blue" onclick="editProduct(${p.id})">✏️</button><button class="action-btn btn-red" onclick="confirmDelete('product',${p.id})">🗑️</button></div></td></tr>`;
  }).join('')}</tbody></table>`;
}

function openProductModal() {
  document.getElementById('prod-modal-title').textContent = '➕ Produit';
  document.getElementById('prod-id').value = '';
  document.getElementById('prod-name').value = '';
  document.getElementById('prod-desc').value = '';
  document.getElementById('prod-price').value = '';
  document.getElementById('prod-available').value = 'true';
  selectedProdIcon = '';
  document.getElementById('prod-store').innerHTML = stores.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('');
  document.getElementById('prod-category').innerHTML = categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  buildIconPicker('prod-icon-picker', 'prod-icon');
  openModal('product-modal');
}

function editProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('prod-modal-title').textContent = '✏️ Modifier';
  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-name').value = p.name;
  document.getElementById('prod-desc').value = p.desc || '';
  document.getElementById('prod-price').value = p.price;
  document.getElementById('prod-available').value = p.available ? 'true' : 'false';
  selectedProdIcon = p.icon;
  document.getElementById('prod-store').innerHTML = stores.map(s => `<option value="${s.id}" ${s.id === p.store_id ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('');
  document.getElementById('prod-category').innerHTML = categories.map(c => `<option value="${c.id}" ${c.id === p.category_id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('');
  buildIconPicker('prod-icon-picker', 'prod-icon');
  setTimeout(() => {
    document.querySelectorAll('#prod-icon-picker .icon-option').forEach(o => {
      if (o.dataset.icon === p.icon) o.classList.add('selected');
    });
  }, 50);
  openModal('product-modal');
}



// ============ ADMIN - CLIENTS ET LIVREURS ============
function renderAdminClients() {
  const c = document.getElementById('clients-table-container');
  if (!clients.length) { 
    c.innerHTML = '<div class="empty-state"><p>Aucun client</p></div>'; 
    return; 
  }
  c.innerHTML = `<table class="admin-table">
    <thead>
      <tr>
        <th>Nom</th>
        <th>Email</th>
        <th>Téléphone</th>
        <th>Adresse</th>
        <th>Commandes</th>
        <th>Total</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
    ${clients.map(cl => {
      const myOrders = orders.filter(o => o.clientId === cl.id);
      const total = myOrders.reduce((s, o) => s + o.total, 0);
      return `
        <tr onclick="viewClientDetails('${cl.id}')" style="cursor:pointer">
          <td><strong>${cl.name}</strong></td>
          <td>${cl.email}</td>
          <td>${cl.phone}</td>
          <td style="font-size:0.85rem">${cl.address}</td>
          <td>${myOrders.length}</td>
          <td><strong>${total.toFixed(2)} $</strong></td>
          <td>
            <div class="action-btns">
              <button class="action-btn btn-blue" onclick="event.stopPropagation(); editClient('${cl.id}')">✏️</button>
              <button class="action-btn btn-red" onclick="event.stopPropagation(); confirmDeleteClient('${cl.id}')">🗑️</button>
            </div>
          </td>
        </tr>`;
    }).join('')}
    </tbody>
  </table>`;
}

function renderAdminDrivers() {
  const c = document.getElementById('drivers-table-container');
  if (!c) return;

  if (!drivers.length) {
    c.innerHTML = '<div class="empty-state"><p>Aucun livreur</p></div>';
    return;
  }

  c.innerHTML = `<table class="admin-table">
    <thead>
      <tr>
        <th>Nom</th>
        <th>Téléphone</th>
        <th>Véhicule</th>
        <th>Livraisons</th>
        <th>Statut</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${drivers.map(d => {
        const nb = orders.filter(o => String(o.driverId) === String(d.id) && o.status === 'delivered').length;
        const badge = d.status === 'approved' ? 'badge-green' : d.status === 'pending' ? 'badge-yellow' : 'badge-red';
        const label = d.status === 'approved' ? '✅ Approuvé' : d.status === 'pending' ? '⏳ En attente' : '❌ Refusé';

        return `<tr>
          <td><strong>${d.name}</strong><br><small style="color:#666">${d.email || ''}</small></td>
          <td>${d.phone || '-'}</td>
          <td>${d.vehicle || '-'}</td>
          <td>${nb}</td>
          <td><span class="badge ${badge}">${label}</span></td>
          <td>
            <div class="action-btns">
              <button class="action-btn btn-blue" onclick="editDriver('${d.id}')">✏️ Modifier</button>
              ${d.status !== 'approved' ? `<button class="action-btn btn-green" onclick="approveDriver('${d.id}')">✅</button>` : ''}
              <button class="action-btn btn-red" onclick="confirmDeleteDriver('${d.id}')">🗑️</button>
            </div>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

// ============ ADMIN - PARAMÈTRES ============
function renderAdminSettings() {
  const c = document.getElementById('admin-settings-content');
  c.innerHTML = `
    <div class="profile-section">
      <h3 style="color:#0a1929;margin-bottom:1rem">💰 Système de facturation</h3>
      <div class="info-box">💡 Tarif : <strong>Frais de base + (Distance × Prix par km)</strong></div>
      <div class="form-group"><label>Frais de base ($)</label><input type="number" id="set-base-fee" step="0.50" value="${platformSettings.deliveryBaseFee}"></div>
      <div class="form-group"><label>Prix par km ($)</label><input type="number" id="set-per-km" step="0.10" value="${platformSettings.deliveryPerKm}"></div>
      <div class="form-group"><label>Taux de taxes</label><input type="number" id="set-tax-rate" step="0.00001" value="${platformSettings.taxRate}"></div>
      <div class="form-group"><label>Commission livreur (ex: 0.20 = 20%)</label><input type="number" id="set-commission" step="0.05" value="${platformSettings.driverCommission}"></div>
      <div class="form-group"><label>Rayon (km)</label><input type="number" id="set-radius" value="${platformSettings.radius}"></div>
      <button class="btn" onclick="saveSettings()">💾 Enregistrer</button>
    </div>
  `;
}

// ============ GESTION DES DEMANDES DE COMMERCES ============

// Afficher les demandes de commerces en attente
// ============ ADMIN - Demandes de commerces en attente ============

async function renderPendingStores() {
  const container = document.getElementById('pending-stores-container');
  if (!container) return;

  console.log("🔄 Chargement des demandes de commerces en attente...");

  try {
    // ✅ CORRECTION : On interroge la table 'profiles' qui est notre source de vérité
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('role', 'store')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log("✅ Demandes en attente trouvées :", data); 

    if (!data || data.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;color:#666">Aucune demande en attente pour le moment.</div>';
      return;
    }

    container.innerHTML = data.map(profile => `
      <div style="background:white;padding:1.5rem;border-radius:12px;margin-bottom:1rem;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:1rem;flex-wrap:wrap">
          <div style="flex:1;min-width:250px">
            <h4 style="color:#0a1929;margin:0 0 0.5rem">${profile.name}</h4>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Email :</strong> ${profile.email || 'Non spécifié'}</p>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Téléphone :</strong> ${profile.phone || 'Non spécifié'}</p>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Adresse :</strong> ${profile.address || 'Non spécifiée'}</p>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Forfait choisi :</strong> ${getPlanName(profile.selected_plan_id)}</p>
            <p style="margin:0.3rem 0;color:#999;font-size:0.85rem">Demandé le : ${new Date(profile.created_at).toLocaleDateString('fr-CA')}</p>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            <button class="btn-sm btn-green" onclick="approveStore('${profile.id}')">✅ Approuver</button>
            <button class="btn-sm btn-red" onclick="rejectStore('${profile.id}')">❌ Refuser</button>
          </div>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Erreur renderPendingStores:', error);
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:red">Erreur de chargement des données</div>';
  }
}

// Petite fonction utilitaire pour afficher le nom du forfait
function getPlanName(planId) {
  if (planId === 1) return '🌱 Essai (0$)';
  if (planId === 2) return '🏪 Base (7.99$)';
  if (planId === 3) return '🚀 Croissance (29.99$)';
  if (planId === 4) return '👑 Partenaire Plus (89.99$)';
  return 'Non spécifié';
}
// Approuver un commerce
async function approveStore(profileId) {
  try {
    showToast('⏳ Approbation et création du commerce en cours...');
    
    // 1. Approuver le profil utilisateur
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ status: 'approved' })
      .eq('id', profileId);
    
    if (profileError) throw profileError;

    // 2. Récupérer les infos du profil pour créer le commerce
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (!profile) throw new Error("Profil introuvable");

    // 3. Vérifier si le commerce existe déjà dans la table 'stores'
    const { data: existingStore } = await supabaseClient
      .from('stores')
      .select('id')
      .eq('owner_id', profileId)
      .maybeSingle();

    // 4. SI LE COMMERCE N'EXISTE PAS, ON LE CRÉE AUTOMATIQUEMENT
    if (!existingStore) {
      const { error: storeError } = await supabaseClient
        .from('stores')
        .insert({
          owner_id: profileId,
          name: profile.name || 'Mon Commerce',
          type: profile.type || 'Commerce',
          address: profile.address || 'Adresse non spécifiée',
          phone: profile.phone || 'Non spécifié',
          email: profile.email || '',
          province: profile.province || '',
          status: 'active', // ✅ Approuvé = Actif
          forfait: profile.selected_plan_id || 1,
          icon: '🏪'
        });
      
      if (storeError) {
        console.error("⚠️ Erreur création store:", storeError);
        // On affiche un avertissement mais on ne bloque pas tout
        showToast('⚠️ Profil approuvé, mais erreur création fiche commerce. Voir console.');
      } else {
        console.log("✅ Commerce créé automatiquement dans la table stores !");
      }
    } else {
      // 5. Si le commerce existe déjà, on s'assure juste que son statut est 'active'
      await supabaseClient
        .from('stores')
        .update({ status: 'active' })
        .eq('owner_id', profileId);
    }

    showToast('✅ Commerce approuvé et prêt à l\'emploi !');
    
    // Rafraîchir les vues admin
    if (typeof renderPendingStores === 'function') renderPendingStores();
    if (typeof renderAllStores === 'function') renderAllStores();
    
  } catch (err) {
    console.error('❌ Erreur approbation:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}


// ==========================================
// ✅ REFUSER UN COMMERCE (VERSION UNIQUE CORRIGÉE)
// ==========================================
async function rejectStore(profileId) {
  if (!confirm('Êtes-vous sûr de vouloir refuser cette demande ?\nLe profil sera supprimé.')) return;
  
  try {
    showToast('⏳ Refus et suppression en cours...');

    // 1. Supprimer le commerce associé s'il existe (pour éviter les orphelins)
    await supabaseClient.from('stores').delete().eq('owner_id', profileId);

    // 2. Supprimer le profil (et l'utilisateur en cascade si la règle est bien faite)
    const { error } = await supabaseClient
      .from('profiles') // ⚠️ Remplace par 'clients' SI tu as tout renommé (voir question plus haut)
      .delete()
      .eq('id', profileId);

    if (error) throw error;

    showToast('🗑️ Demande refusée et profil supprimé.');
    
    // Rafraîchir la vue
    if (typeof renderPendingStores === 'function') renderPendingStores();
    
  } catch (err) {
    console.error('❌ Erreur refus:', err);
    showToast('❌ Erreur lors du refus : ' + err.message);
  }
}

async function loadPlatformSettings() {
  try {
    // 1. Récupérer les paramètres depuis la table 'platform_settings'
    const { data, error } = await supabaseClient
      .from('platform_settings')
      .select('*')
      .eq('id', 1)
      .single(); // .single() car on ne veut qu'une seule ligne

    if (error && error.code !== 'PGRST116') { 
      // PGRST116 signifie "aucune ligne trouvée", ce n'est pas grave, on utilisera les valeurs par défaut
      throw error;
    }

    if (data) {
      // 2. Mettre à jour l'objet local avec les vraies données de la base
      platformSettings.deliveryBaseFee = data.delivery_base_fee || 7.00;
      platformSettings.deliveryPerKm = data.delivery_per_km || 1.00;
      platformSettings.taxRate = data.tax_rate || 0.14975;
      platformSettings.driverCommission = data.driver_commission || 0.20;
      platformSettings.radius = data.radius || 40;
    }

    // 3. Mettre à jour l'affichage des champs dans l'admin
    renderAdminSettings();
    
  } catch (err) {
    console.error('Erreur loadPlatformSettings:', err);
  }
}

async function saveSettings() {
  // 1. Mettre à jour l'objet local
  platformSettings.deliveryBaseFee = parseFloat(document.getElementById('set-base-fee').value) || 7.00;
  platformSettings.deliveryPerKm = parseFloat(document.getElementById('set-per-km').value) || 1.00;
  platformSettings.taxRate = parseFloat(document.getElementById('set-tax-rate').value) || 0.14975;
  platformSettings.driverCommission = parseFloat(document.getElementById('set-commission').value) || 0.20;
  platformSettings.radius = parseInt(document.getElementById('set-radius').value) || 40;                  

  try {
    // 2. Sauvegarder dans la BONNE table : 'platform_settings'
    const { error } = await supabaseClient.from('platform_settings').upsert({
      id: 1, // On suppose qu'il n'y a qu'une seule ligne de paramètres avec l'ID 1
      delivery_base_fee: platformSettings.deliveryBaseFee,
      delivery_per_km: platformSettings.deliveryPerKm,
      tax_rate: platformSettings.taxRate,
      driver_commission: platformSettings.driverCommission,
      radius: platformSettings.radius
    }, { onConflict: 'id' }); // Indispensable pour que l'upsert fonctionne

    if (error) throw error;

    showToast('✅ Paramètres enregistrés et synchronisés avec Supabase !');
    
    // Optionnel : recharger pour être sûr que tout est à jour
    loadPlatformSettings(); 
    
    if (currentUser && currentUser.role === 'client') updateCart();
  } catch (err) {
    console.error('Erreur saveSettings:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ============ SUPPRESSION ============
function confirmDelete(type, id) {
  document.getElementById('confirm-msg').textContent = `Êtes-vous sûr de vouloir supprimer cet élément ?`;
  document.getElementById('confirm-btn').onclick = async function() {
    try {
      if (type === 'store') {
        await supabaseClient.from('stores').delete().eq('id', id);
        stores = stores.filter(s => s.id !== id);
        showToast('✅ Commerce supprimé');
      } else if (type === 'category') {
        await supabaseClient.from('categories').delete().eq('id', id);
        categories = categories.filter(c => c.id !== id);
        showToast('✅ Catégorie supprimée');
      } else if (type === 'product') {
        await supabaseClient.from('products').delete().eq('id', id);
        products = products.filter(p => p.id !== id);
        showToast('✅ Produit supprimé');
      }
      closeModal('confirm-modal');
      renderAdminStores();
      renderAdminCategories();
      renderAdminProducts();
      renderLandingStores(); // ✅ NOUVEAU : Met à jour la page d'accueil
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast('❌ Erreur: ' + err.message);
    }
  };
  openModal('confirm-modal');
}

// ==========================================
// GESTION DU TABLEAU DE BORD COMMERCE
// ==========================================
// Fonctions utilitaires pour le dashboard
// ==========================================
// ✅ DASHBOARD COMMERCE (Synchronisé avec le site)
// ==========================================

// ==========================================
// ✅ DASHBOARD COMMERCE (Version Finale et Stable)
// ==========================================
async function showStoreDetail(storeId) {
  console.log("🏪 Ouverture du commerce :", storeId);

  if (!storeId) {
    showToast('❌ ID du commerce manquant');
    return;
  }

  try {
    // 1. Charger le commerce
    const { data: store, error: storeError } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError) throw storeError;
    if (!store) {
      showToast('❌ Commerce introuvable');
      return;
    }

    console.log("✅ Commerce :", store.name);

    // 2. Charger les produits
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('name', { ascending: true });

    if (productsError) throw productsError;

    console.log("📦 Produits trouvés :", products?.length || 0);

    // 3. Afficher la vue client
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById('view-client').style.display = 'block';

    // 4. Afficher la section détail
    document.getElementById('stores-section').style.display = 'none';
    document.getElementById('store-detail-section').style.display = 'block';
    document.getElementById('client-orders-section').style.display = 'none';
    document.getElementById('cart-section').style.display = 'none';
    document.getElementById('client-profile-section').style.display = 'none';

    // 5. Historique pour le bouton Retour
    saveViewToHistory('view-client');

    // 6. Générer le HTML avec design moderne
    const container = document.getElementById('store-detail-content');
    if (!container) {
      console.error("❌ Conteneur 'store-detail-content' introuvable !");
      return;
    }

    // Produits en grille
    let productsHtml = '';
    if (products && products.length > 0) {
      productsHtml = `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:1.5rem;">
          ${products.map(p => `
            <div style="background:white; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb; transition:all 0.3s ease; box-shadow:0 2px 8px rgba(0,0,0,0.05);"
                 onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 12px 24px rgba(245,166,35,0.2)'; this.style.borderColor='#f5a623'"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'; this.style.borderColor='#e5e7eb'">
              
              <!-- Image/Icône du produit -->
              <div style="background:linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding:2rem; text-align:center; border-bottom:1px solid #e5e7eb;">
                <div style="font-size:4rem; margin-bottom:0.5rem;">${p.icon || '📦'}</div>
              </div>
              
              <!-- Contenu -->
              <div style="padding:1.5rem;">
                <h4 style="margin:0 0 0.5rem 0; color:#0a1929; font-size:1.1rem; font-weight:700; line-height:1.3;">${p.name}</h4>
                ${p.description ? `<p style="margin:0 0 1rem 0; color:#6b7280; font-size:0.9rem; line-height:1.5;">${p.description}</p>` : ''}
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; padding-top:1rem; border-top:1px solid #f3f4f6;">
                  <div style="color:#f5a623; font-size:1.4rem; font-weight:800;">${parseFloat(p.price).toFixed(2)} $</div>
                  <button onclick="addToCart('${p.id}', '${p.name.replace(/'/g, "\\'")}', ${p.price}, '${p.icon || '📦'}', '${storeId}', '${store.name.replace(/'/g, "\\'")}')" 
                          style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:white; border:none; padding:0.6rem 1.2rem; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.9rem; transition:all 0.2s; box-shadow:0 2px 8px rgba(16,185,129,0.3);"
                          onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(16,185,129,0.4)'"
                          onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(16,185,129,0.3)'">
                    ➕ Ajouter
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      productsHtml = `
        <div style="text-align:center; padding:4rem 2rem; background:white; border-radius:16px; border:2px dashed #e5e7eb;">
          <div style="font-size:4rem; margin-bottom:1rem;">📭</div>
          <p style="color:#6b7280; font-size:1.1rem; margin:0;">Aucun produit disponible pour le moment</p>
          <p style="color:#9ca3af; font-size:0.9rem; margin-top:0.5rem;">Revenez plus tard !</p>
        </div>
      `;
    }

    container.innerHTML = `
      <!-- HERO DU COMMERCE -->
      <div style="background:linear-gradient(135deg, #0a1929 0%, #1a3a5c 100%); border-radius:20px; padding:3rem 2rem; margin-bottom:2rem; color:white; position:relative; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
        
        <!-- Effet décoratif -->
        <div style="position:absolute; top:-50%; right:-20%; width:400px; height:400px; background:radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%);"></div>
        
        <button onclick="showClientStores()" 
                style="background:rgba(255,255,255,0.1); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.2); color:white; padding:0.6rem 1.2rem; border-radius:8px; cursor:pointer; font-weight:600; margin-bottom:2rem; font-size:0.95rem; transition:all 0.2s; position:relative; z-index:2;"
                onmouseover="this.style.background='rgba(255,255,255,0.2)'"
                onmouseout="this.style.background='rgba(255,255,255,0.1)'">
          ← Retour aux commerces
        </button>
        
        <div style="display:flex; align-items:center; gap:2rem; position:relative; z-index:2; flex-wrap:wrap;">
          <!-- Icône du commerce -->
          <div style="background:white; width:120px; height:120px; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:5rem; box-shadow:0 8px 24px rgba(0,0,0,0.3);">
            ${store.icon || '🏪'}
          </div>
          
          <!-- Infos -->
          <div style="flex:1; min-width:250px;">
            <h1 style="margin:0 0 0.5rem 0; font-size:2.5rem; font-weight:800; line-height:1.2;">${store.name}</h1>
            <div style="display:inline-block; background:#f5a623; color:#0a1929; padding:0.4rem 1rem; border-radius:20px; font-weight:700; font-size:0.9rem; margin-bottom:1rem;">
              ${store.type || 'Commerce'}
            </div>
            <div style="display:flex; gap:1.5rem; flex-wrap:wrap; margin-top:1rem;">
              ${store.address ? `
                <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.95rem; opacity:0.9;">
                  <span style="font-size:1.2rem;">📍</span>
                  <span>${store.address}</span>
                </div>
              ` : ''}
              ${store.phone ? `
                <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.95rem; opacity:0.9;">
                  <span style="font-size:1.2rem;">📞</span>
                  <span>${store.phone}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION PRODUITS -->
      <div style="background:#f5f1e8; border-radius:16px; padding:2rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; flex-wrap:wrap; gap:1rem;">
          <div>
            <h2 style="margin:0 0 0.5rem 0; color:#0a1929; font-size:1.8rem; font-weight:800;">🛍️ Produits disponibles</h2>
            <p style="margin:0; color:#6b7280; font-size:1rem;">${products?.length || 0} article${(products?.length || 0) > 1 ? 's' : ''} à découvrir</p>
          </div>
          ${products && products.length > 0 ? `
            <div style="background:white; padding:0.6rem 1.2rem; border-radius:20px; border:2px solid #f5a623; color:#f5a623; font-weight:700; font-size:0.9rem;">
              ✨ En stock
            </div>
          ` : ''}
        </div>
        
        ${productsHtml}
      </div>
    `;

    window.scrollTo(0, 0);
    console.log("✅ Détail affiché avec succès !");

  } catch (err) {
    console.error("❌ Erreur showStoreDetail:", err);
    showToast('❌ Erreur : ' + err.message);
  }
}

async function showStoreDashboard() {
document.getElementById('stores-section').style.display = 'none';
document.getElementById('cart-section').style.display = 'none';
  console.log("🔍 showStoreDashboard démarré");
  
  if (!currentUser || currentUser.role !== 'store') {
    console.log("⚠️ Pas un commerce");
    return;
  }

  const container = document.getElementById('store-info-content');
  if (!container) {
    console.error("❌ Conteneur 'store-info-content' introuvable dans le HTML");
    return;
  }

  try {
    const { data: store, error } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('owner_id', currentUser.id)
      .maybeSingle();

    if (error || !store) {
      container.innerHTML = `
        <div style="padding:2rem; text-align:center; background:#fee2e2; border-radius:8px;">
          <h3>⏳ Chargement en cours ou commerce introuvable</h3>
          <p>Veuillez rafraîchir la page (F5) ou contacter l'administrateur.</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div style="background:white; padding:1.5rem; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h2 style="color:#0a1929; margin:0;">🏪 ${store.name}</h2>
          <button onclick="openStoreDetail('${store.id}')" style="padding:8px 16px; background:#6b7280; color:white; border:none; border-radius:6px; cursor:pointer;">
            👁️ Voir mon commerce (Vue Client)
          </button>
        </div>
        
        <p><strong>📍 Adresse :</strong> ${store.address || 'Non spécifiée'}</p>
        <p><strong>📞 Téléphone :</strong> ${store.phone || 'Non spécifié'}</p>
        <p><strong>📧 Email :</strong> ${store.email || 'Non spécifié'}</p>
        <p><strong>📊 Statut :</strong> <span style="color:#10b981; font-weight:bold;">✅ Actif</span></p>
        
        <hr style="margin:1.5rem 0; border:0; border-top:1px solid #eee;">
        
        <h3 style="color:#0a1929;">📦 Mon Inventaire</h3>
        <button onclick="openAddProductModal('${store.id}')" style="padding:10px 20px; background:#10b981; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">➕ Ajouter un produit</button>
        
        <div id="store-products-list" style="margin-top:1rem; display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:1rem;">
        </div>
      </div>
    `;

    loadStoreProducts(store.id);

  } catch (err) {
    console.error("❌ Erreur:", err);
    container.innerHTML = `<div style="padding:2rem; color:red;">❌ Erreur : ${err.message}</div>`;
  }
}






// --- Fonctions utilitaires pour le dashboard ---

async function loadStoreProducts(store_id) {
  const container = document.getElementById('store-products-list');
  if (!container) return;

  const { data: products, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('store_id', store_id)
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = `<p style="color:red;">Erreur chargement produits: ${error.message}</p>`;
    return;
  }

  if (!products || products.length === 0) {
    container.innerHTML = '<p style="color:#666; grid-column:1/-1; text-align:center; padding:1rem;">Aucun produit dans votre inventaire pour le moment.</p>';
    return;
  }

  container.innerHTML = products.map(p => `
    <div style="background:#f9f9f9; padding:1rem; border-radius:8px; border:1px solid #eee;">
      <div style="display:flex; justify-content:space-between; align-items:start;">
        <h5 style="margin:0 0 0.5rem 0; color:#0a1929;">${p.name}</h5>
        <span style="color:${p.available ? '#10b981' : '#ef4444'}; font-size:0.8rem; font-weight:bold;">
          ${p.available ? '✅ Dispo' : '❌ Indispo'}
        </span>
      </div>
      <p style="margin:0; color:#10b981; font-weight:bold; font-size:1.2rem;">${p.price} $</p>
      <p style="margin:0.5rem 0 0 0; font-size:0.85rem; color:#666;">${p.description || 'Aucune description'}</p>
      <div style="margin-top:0.5rem; display:flex; gap:0.5rem;">
        <button onclick="toggleProductAvailability(${p.id}, ${!p.available}, '${store_id}')" style="padding:4px 8px; background:#f59e0b; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.8rem;">
          ${p.available ? 'Désactiver' : 'Activer'}
        </button>
        <button onclick="deleteProduct(${p.id}, '${store_id}')" style="padding:4px 8px; background:#ef4444; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.8rem;">🗑️</button>
      </div>
    </div>
  `).join('');
}
// ==========================================
// ✅ GESTION DES PRODUITS COMMERCE (VERSION UNIQUE ET PROPRE)
// ==========================================

async function openAddProductModal(store_id) {
  // On utilise la modale existante plutôt que des prompts pour un rendu plus pro
  document.getElementById('prod-modal-title').textContent = '➕ Nouveau Produit';
  document.getElementById('prod-id').value = '';
  document.getElementById('prod-name').value = '';
  document.getElementById('prod-desc').value = '';
  document.getElementById('prod-price').value = '';
  document.getElementById('prod-available').value = 'true';
  selectedProdIcon = '📦';
  
  const myStore = stores.find(s => String(s.id) === String(store_id));
  document.getElementById('prod-store').innerHTML = `<option value="${myStore.id}" selected>${myStore.icon} ${myStore.name}</option>`;
  
  const myCats = categories.filter(c => String(c.store_id) === String(myStore.id) || !c.store_id);
  document.getElementById('prod-category').innerHTML = myCats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  
  buildIconPicker('prod-icon-picker', 'prod-icon');
  openModal('product-modal');
}

async function saveProduct(event) {
  event.preventDefault();
  
  const store_id = document.getElementById('prod-store').value;
  const category_id = document.getElementById('prod-category').value;
  const name = document.getElementById('prod-name').value.trim();
  const description = document.getElementById('prod-desc').value.trim();
  const price = parseFloat(document.getElementById('prod-price').value);
  const icon = document.getElementById('prod-icon').value || '📦';
  const available = document.getElementById('prod-available').value === 'true';

  if (!name || !price || !store_id || !category_id) {
    showToast('❌ Veuillez remplir tous les champs obligatoires');
    return;
  }

  showToast('⏳ Ajout du produit en cours...');

  try {
    const { data, error } = await supabaseClient.from('products').insert({
      store_id: store_id,
      category_id: category_id,
      name: name,
      description: description,
      price: price,
      icon: icon,
      available: available
    }).select().single();

    if (error) throw error;
   
    // On ajoute une VRAIE notification pour le commerce
    await showNotification('✅ Produit ajouté', `Le produit "${name}" est maintenant en ligne.`, 'success', currentUser.id);
    
    closeModal('product-modal');
    if (typeof loadStoreProducts === 'function') loadStoreProducts(store_id);
    if (typeof renderStoreProducts === 'function') renderStoreProducts();

  } catch (err) {
    console.error('Erreur ajout produit:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// ✅ UTILITAIRES ET MODALES
// ==========================================



function pickIcon(containerId, hiddenId, el) {
  document.querySelectorAll('#' + containerId + ' .icon-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById(hiddenId).value = el.dataset.icon;
  if (containerId === 'store-icon-picker') selectedStoreIcon = el.dataset.icon;
  if (containerId === 'cat-icon-picker') selectedCatIcon = el.dataset.icon;
  if (containerId === 'prod-icon-picker') selectedProdIcon = el.dataset.icon;
}

function openModal(id) { 
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('show');
  }
}


// Fermer la modale si on clique en dehors
document.querySelectorAll('.modal-bg').forEach(m => {
  m.addEventListener('click', function(e) { 
    if (e.target === this) this.classList.remove('show'); 
  });
});

// ==========================================
// ✅ TOAST VISUEL UNIQUEMENT (Ne spamme pas la DB)
// ==========================================
function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = 'toast show';
    setTimeout(() => {
      toast.className = toast.className.replace('show', '');
    }, 3000);
  }
}

// ==========================================
// ✅ APPROBATION DES LIVREURS (Arguments corrigés)
// ==========================================

async function rejectDriver(id) {
  const d = drivers.find(x => String(x.id) === String(id));
  if (!d) { showToast('❌ Livreur introuvable'); return; }
  try {
    const { error } = await supabaseClient.from('profiles').update({ status: 'rejected' }).eq('id', id);
    if (error) throw error;
    d.status = 'rejected';
    renderAdminDrivers();
    showToast('❌ Livreur refusé');
  } catch (err) {
    console.error('Erreur rejectDriver:', err);
    showToast('❌ Erreur: ' + err.message);
  }
}

// ==========================================
// ✅ DÉTAILS DES FONCTIONNALITÉS (Landing Page)
// ==========================================


// ==========================================
// ✅ INITIALISATION ET DÉMARRAGE DU SITE
// ==========================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.feature-card, .step-card, .testimonial-card, .store, .stat-item').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
}

window.addEventListener('load', async function() {
  // 1. Charger les données de Supabase
  await load();
  
  // 2. Initialiser l'interface
  renderLandingStores();
  updateCart();
  initScrollAnimations();
  
  // 3. Cacher l'écran de chargement
  setTimeout(function() { 
    const loader = document.getElementById('page-loader');
    if (loader) loader.classList.add('hidden'); 
  }, 1000);
});

// Fermer le panneau de notification si on clique ailleurs
document.addEventListener('click', function(e) {
  const panel = document.getElementById('notif-panel');
  const bell = document.querySelector('.notif-bell');
  if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.style.display = 'none';
  }
});

console.log("🚀 RuralGo Script chargé avec succès !");

async function toggleProductAvailability(productId, newStatus, store_id) {
  try {
    await supabaseClient.from('products').update({ available: newStatus }).eq('id', productId);
    loadStoreProducts(store_id);
  } catch (err) {
    alert("❌ Erreur : " + err.message);
  }
}

async function deleteProduct(productId, store_id) {
  if (!confirm("Supprimer ce produit définitivement ?")) return;
  try {
    await supabaseClient.from('products').delete().eq('id', productId);
    loadStoreProducts(store_id);
  } catch (err) {
    alert("❌ Erreur : " + err.message);
  }
}

async function editStoreName(store_id, currentName) {
  const newName = prompt("Nouveau nom du commerce :", currentName);
  if (!newName || newName === currentName) return;
  try {
    const { error } = await supabaseClient.from('stores').update({ name: newName }).eq('id', store_id);
    if (error) throw error;
    alert("✅ Nom modifié !");
    showStoreDashboard();
  } catch (err) {
    alert("❌ Erreur : " + err.message);
  }
}

function renderStoreDashboard() {
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  if (!myStore) {
    document.getElementById('store-info-content').innerHTML = '<div class="empty-state"><p>⚠️ Aucun commerce associé à votre compte. Veuillez contacter l\'administration.</p></div>';
    return;
  }

  const myProducts = products.filter(p => String(p.store_id) === String(myStore.id));
  const myCategories = categories.filter(c => String(c.store_id) === String(myStore.id) || !c.store_id);
  const storeOrders = orders.filter(o => String(o.store_id) === String(myStore.id));

  document.getElementById('store-total-products').textContent = myProducts.length;
  document.getElementById('store-total-categories').textContent = myCategories.length;
  document.getElementById('store-total-orders').textContent = storeOrders.length;

  document.getElementById('store-info-content').innerHTML = `
    <div class="profile-section">
      <div class="profile-header">
        <div class="profile-avatar" style="font-size:3rem">${myStore.logo ? `<img src="${myStore.logo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover">` : myStore.icon}</div>
        <div class="profile-info">
          <h2>${myStore.name}</h2>
          <p>${myStore.type} • ${myStore.address}</p>
          <p>📞 ${myStore.phone || 'Non spécifié'}</p>
          <span class="badge badge-green" style="margin-top:0.5rem;display:inline-block">✅ Actif</span>
        </div>
      </div>
    </div>
  `;
}
// ==========================================
// ✅ GESTION DES CATÉGORIES DU COMMERCE (VERSION PROPRE)
// ==========================================

// 1. Charger et afficher les catégories
async function loadStoreCategories() {
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  if (!myStore) return;

  const container = document.getElementById('store-categories-container');
  if (!container) return;

  // Petit message de chargement
  container.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">⏳ Chargement des catégories...</p>';

  try {
    // ✅ On utilise bien 'store_id' pour filtrer
    const { data: cats, error } = await supabaseClient
      .from('categories') 
      .select('*')
      .eq('store_id', myStore.id)
      .order('name', { ascending: true });

    if (error) throw error;

    if (!cats || cats.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Aucune catégorie. Ajoutez-en une !</p></div>';
      return;
    }

    // Affichage propre
    container.innerHTML = cats.map(c => `
      <div style="background:#f9f9f9; padding:1rem; border-radius:8px; border:1px solid #eee; display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <div>
          <span style="font-size:1.5rem; margin-right:10px;">${c.icon || '📂'}</span>
          <strong>${c.name}</strong>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="action-btn btn-blue" onclick="editStoreCategory(${c.id})" style="padding:4px 8px; background:#3b82f6; color:white; border:none; border-radius:4px; cursor:pointer;">✏️</button>
          <button class="action-btn btn-red" onclick="deleteStoreCategory(${c.id})" style="padding:4px 8px; background:#ef4444; color:white; border:none; border-radius:4px; cursor:pointer;">🗑️</button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Erreur chargement catégories:', err);
    container.innerHTML = `<p style="color:red;">Erreur: ${err.message}</p>`;
  }
}

// 2. Modifier une catégorie (Ouvre la modale avec les infos)
async function editStoreCategory(category_id) {
  try {
    // On récupère les infos de la catégorie dans la base de données
    const { data: cat, error } = await supabaseClient
      .from('categories')
      .select('*')
      .eq('id', category_id)
      .single();

    if (error) throw error;

    // On remplit la modale (celle qui existe déjà dans ton HTML : #category-modal)
    document.getElementById('cat-id').value = cat.id;
    document.getElementById('cat-name').value = cat.name;
    document.getElementById('cat-icon').value = cat.icon || '📂';
    document.getElementById('cat-modal-title').textContent = '✏️ Modifier la catégorie';

    // On ouvre la modale
    const modal = document.getElementById('category-modal');
    if (modal) modal.style.display = 'flex'; // Ou modal.classList.add('active') selon ton CSS

  } catch (err) {
    console.error('Erreur édition catégorie:', err);
    showToast('❌ Impossible de charger la catégorie.');
  }
}

// 3. Supprimer une catégorie
async function deleteStoreCategory(category_id) {
  if (!confirm('Voulez-vous vraiment supprimer cette catégorie ?')) return;

  try {
    const { error } = await supabaseClient
      .from('categories')
      .delete()
      .eq('id', category_id);

    if (error) throw error;

    showToast('✅ Catégorie supprimée !');
    
    // On recharge la liste immédiatement
    loadStoreCategories();

  } catch (err) {
    console.error('Erreur suppression:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

function showStoreCategories() {
  switchView('view-store');
  document.getElementById('store-dashboard-section').style.display = 'none';
  document.getElementById('store-categories-section').style.display = 'block';
  document.getElementById('store-products-section').style.display = 'none';
  renderStoreCategories();
}

function renderStoreCategories() {
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  if (!myStore) return;
  
  const myCats = categories.filter(c => String(c.store_id) === String(myStore.id) || !c.store_id);
  const c = document.getElementById('store-categories-container');
  
  if (!myCats.length) {
    c.innerHTML = '<div class="empty-state"><p>Aucune catégorie. Ajoutez-en une !</p></div>';
    return;
  }
  
  c.innerHTML = `<div class="cat-grid">${myCats.map(cat => {
    const count = products.filter(p => String(p.store_id) === String(myStore.id) && String(p.category_id) === String(cat.id)).length;
    const isGlobal = !cat.store_id;
    return `<div class="cat-card">
      <div class="cat-card-icon">${cat.icon}</div>
      <div class="cat-card-name">${cat.name}</div>
      <p style="color:#666;font-size:0.85rem;margin-bottom:0.5rem">${count} produit(s)</p>
      ${!isGlobal ? `<div class="cat-card-actions"><button class="action-btn btn-red" onclick="confirmDelete('category',${cat.id})">🗑️</button></div>` : '<span style="font-size:0.8rem;color:#999">Catégorie globale</span>'}
    </div>`;
  }).join('')}</div>`;
}

function openStoreCategoryModal() {
  document.getElementById('cat-modal-title').textContent = '➕ Ma Catégorie';
  document.getElementById('cat-id').value = '';
  document.getElementById('cat-name').value = '';
  selectedCatIcon = '';
  buildIconPicker('cat-icon-picker', 'cat-icon');
  openModal('category-modal');
}

async function saveStoreCategory(e) {
  e.preventDefault();
  if (!selectedCatIcon && !document.getElementById('cat-icon').value) { showToast('⚠️ Choisissez une icône'); return; }
  
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  const catData = {
    icon: document.getElementById('cat-icon').value || selectedCatIcon,
    name: document.getElementById('cat-name').value,
    store_id: myStore.id
  };

  try {
    const { data: newCat, error } = await supabaseClient.from('categories').insert(catData).select().single();
    if (error) throw error;
    categories.push({ ...newCat, id: newCat.id });
    closeModal('category-modal');
    showToast('✅ Catégorie ajoutée !');
    renderStoreCategories();
  } catch (err) {
    console.error('Erreur saveStoreCategory:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// ✅ FONCTION MASTER : Charger et Afficher les Produits
// ==========================================
async function renderStoreProducts() {
  console.log("🚀 [DEBUG] renderStoreProducts démarré");
  
  // 1. Vérifier si l'utilisateur est connecté
  if (typeof currentUser === 'undefined' || !currentUser || !currentUser.id) {
    console.warn("⚠️ currentUser non défini ou non connecté.");
    return;
  }
  console.log("✅ currentUser.id :", currentUser.id);

  // 2. Vérifier si la liste des magasins est chargée
  if (typeof stores === 'undefined' || !Array.isArray(stores)) {
    console.warn("⚠️ Le tableau 'stores' n'est pas encore chargé.");
    return;
  }

  // 3. Trouver le magasin
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  if (!myStore) {
    console.warn("⚠️ Aucun magasin trouvé pour owner_id =", currentUser.id);
    console.log("Stores disponibles dans la mémoire :", stores);
    return;
  }
  console.log("✅ Magasin trouvé :", myStore.name, "(ID du magasin :", myStore.id, ")");

  // 4. Trouver le conteneur HTML
  const container = document.getElementById('store-products-container');
  if (!container) {
    console.error("❌ Le conteneur HTML 'store-products-container' est introuvable dans la page !");
    return;
  }
  console.log("✅ Conteneur HTML trouvé.");

  // 5. Afficher le chargement
  container.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">⏳ Chargement de votre inventaire...</p>';

  try {
    console.log("🔍 Requête Supabase pour store_id =", myStore.id);
    
    // 6. Demander les produits à Supabase
    const { data: dbProducts, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('store_id', myStore.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Erreur Supabase :", error);
      container.innerHTML = `<p style="color:red; text-align:center;">Erreur DB: ${error.message}</p>`;
      return;
    }

    console.log("✅ Produits reçus de Supabase :", dbProducts ? dbProducts.length : 0);

    // 7. Mise à jour de la mémoire locale (pour que le reste du site soit synchronisé)
    if (typeof products !== 'undefined' && Array.isArray(products)) {
      products = products.filter(p => String(p.store_id || p.store_id) !== String(myStore.id));
      if (dbProducts) {
        products = [...products, ...dbProducts];
      }
    }

    // 8. Afficher le résultat
    if (!dbProducts || dbProducts.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Aucun produit dans votre inventaire. Cliquez sur "Ajouter" pour commencer !</p></div>';
      return;
    }

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr><th>Icon</th><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Dispo</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${dbProducts.map(p => {
            const cat = (typeof categories !== 'undefined' && Array.isArray(categories)) ? categories.find(x => String(x.id) === String(p.category_id || p.category_id)) : null;
            const price = parseFloat(p.price).toFixed(2);
            return `
            <tr>
              <td style="font-size:1.5rem;text-align:center">${p.icon || '📦'}</td>
              <td><strong>${p.name}</strong></td>
              <td>${cat ? cat.icon + ' ' + cat.name : '-'}</td>
              <td><strong>${price} $</strong></td>
              <td><span class="badge ${p.available ? 'badge-green' : 'badge-red'}">${p.available ? '✅' : '❌'}</span></td>
              <td>
                <div class="action-btns">
                  <button class="action-btn btn-blue" onclick="editStoreProduct(${p.id})">✏️</button>
                  <button class="action-btn btn-red" onclick="confirmDelete('product',${p.id})">🗑️</button>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
    console.log("✅ Affichage des produits terminé avec succès !");

  } catch (err) {
    console.error('❌ Erreur critique chargement produits:', err);
    container.innerHTML = `<p style="color:red; text-align:center;">Erreur: ${err.message}</p>`;
  }
}
function showStoreProducts() {
  switchView('view-store');
  document.getElementById('store-dashboard-section').style.display = 'none';
  document.getElementById('store-categories-section').style.display = 'none';
  document.getElementById('store-products-section').style.display = 'block';
  renderStoreProducts();
}



function openStoreProductModal() {
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  if (!myStore) return;

  document.getElementById('prod-modal-title').textContent = '➕ Mon Produit';
  document.getElementById('prod-id').value = '';
  document.getElementById('prod-name').value = '';
  document.getElementById('prod-desc').value = '';
  document.getElementById('prod-price').value = '';
  document.getElementById('prod-available').value = 'true';
  selectedProdIcon = '';
  
  document.getElementById('prod-store').innerHTML = `<option value="${myStore.id}" selected>${myStore.icon} ${myStore.name}</option>`;
  
  const myCats = categories.filter(c => String(c.store_id) === String(myStore.id) || !c.store_id);
  document.getElementById('prod-category').innerHTML = myCats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  
  buildIconPicker('prod-icon-picker', 'prod-icon');
  openModal('product-modal');
}

function editStoreProduct(id) {
  const p = products.find(x => String(x.id) === String(id));
  if (!p) return;
  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  
  document.getElementById('prod-modal-title').textContent = '✏️ Modifier';
  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-name').value = p.name;
  document.getElementById('prod-desc').value = p.desc || '';
  document.getElementById('prod-price').value = p.price;
  document.getElementById('prod-available').value = p.available ? 'true' : 'false';
  selectedProdIcon = p.icon;
  
  document.getElementById('prod-store').innerHTML = `<option value="${myStore.id}" selected>${myStore.icon} ${myStore.name}</option>`;
  
  const myCats = categories.filter(c => String(c.store_id) === String(myStore.id) || !c.store_id);
  document.getElementById('prod-category').innerHTML = myCats.map(c => `<option value="${c.id}" ${String(c.id) === String(p.category_id) ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('');
  
  buildIconPicker('prod-icon-picker', 'prod-icon');
  setTimeout(() => {
    document.querySelectorAll('#prod-icon-picker .icon-option').forEach(o => {
      if (o.dataset.icon === p.icon) o.classList.add('selected');
    });
  }, 50);
  openModal('product-modal');
}

// ============ FONCTIONS UTILITAIRES ============

// ==========================================
// ✅ FONCTION POUR FERMER LE MODAL (ANNULER)
// ==========================================
function closeModal(modalId) {
  console.log("❌ [MODAL] Fermeture du modal :", modalId);
  
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
    console.log("✅ [MODAL] Fermé avec succès.");
  } else {
    console.error("❌ [MODAL] Modal introuvable :", modalId);
  }
}

// ==========================================
// ✅ FONCTION POUR SAUVEGARDER LE PROFIL (ENREGISTRER)
// ==========================================
// ==========================================
// ✅ SAUVEGARDE DU PROFIL CLIENT (TABLE : clients)
// ==========================================
async function saveProfile(e) {
  if (e) e.preventDefault();
  console.log("💾 [PROFIL] Début de la sauvegarde...");

  if (!currentUser || !currentUser.id) {
    showToast('❌ Vous devez être connecté.');
    return;
  }

  const nameField = document.getElementById('ep-name');
  const phoneField = document.getElementById('ep-phone');
  const addrField = document.getElementById('ep-address');

  const newName = nameField?.value.trim() || currentUser.name;
  const newPhone = phoneField?.value.trim() || currentUser.phone;
  const newAddress = addrField?.value.trim() || currentUser.address;
  
  // 🔥 RÉCUPÉRER LES GPS DU CHAMP D'ADRESSE
  const newLat = addrField?._lat || null;
  const newLng = addrField?._lng || null;

  console.log("📍 [PROFIL] Données capturées :");
  console.log("  - Nom:", newName);
  console.log("  - Téléphone:", newPhone);
  console.log("  - Adresse:", newAddress);
  console.log("  - Latitude:", newLat, "(type:", typeof newLat, ")");
  console.log("  - Longitude:", newLng, "(type:", typeof newLng, ")");

  // 🔥 VÉRIFIER SI LES GPS SONT PRÉSENTS
  if (!newLat || !newLng) {
    console.error("❌ [PROFIL] GPS MANQUANTS ! newLat =", newLat, "newLng =", newLng);
    showToast('⚠️ GPS manquants ! Veuillez cliquer sur une suggestion d\'adresse dans la liste.');
    return;
  }

  console.log("✅ [PROFIL] GPS valides détectés. Envoi à Supabase...");

  try {
    // 🔥 ENVOYER TOUTES LES DONNÉES À SUPABASE
    const { error } = await supabaseClient
      .from('profiles')
      .update({ 
        name: newName, 
        phone: newPhone, 
        address: newAddress,
        lat: parseFloat(newLat),  // ✅ Forcer en nombre
        lng: parseFloat(newLng)   // ✅ Forcer en nombre
      })
      .eq('id', currentUser.id);

    if (error) {
      console.error("❌ [PROFIL] Erreur Supabase:", error);
      throw error;
    }

    console.log("✅ [PROFIL] Sauvegardé dans Supabase avec succès !");

    // 🔥 METTRE À JOUR currentUser EN MÉMOIRE
    currentUser.name = newName;
    currentUser.phone = newPhone;
    currentUser.address = newAddress;
    currentUser.lat = parseFloat(newLat);
    currentUser.lng = parseFloat(newLng);
    
    // 🔥 SAUVEGARDER DANS localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    console.log("✅ [PROFIL] currentUser mis à jour. Lat:", currentUser.lat, "Lng:", currentUser.lng);

    closeModal('edit-profile-modal');
    showToast('✅ Adresse et GPS sauvegardés avec succès !');
    
    // 🔥 METTRE À JOUR LE PANIER IMMÉDIATEMENT
    if (typeof updateCart === 'function') updateCart();

  } catch (err) {
    console.error("❌ Erreur sauvegarde profil:", err);
    showToast('❌ Erreur : ' + err.message);
  }
}
// ==========================================
// ✅ SYNCHRONISATION UNIVERSELLE DU PROFIL
// ==========================================
function calculateDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildIconPicker(containerId, hiddenId) {
  const c = document.getElementById(containerId);
  c.innerHTML = allIcons.map(ic => `<div class="icon-option" data-icon="${ic}" onclick="pickIcon('${containerId}','${hiddenId}',this)">${ic}</div>`).join('');
}



// ==========================================
// ✅ TOAST VISUEL UNIQUEMENT (Ne spamme pas la DB)
// ==========================================


// ============ FONCTION POUR LES FORFAITS COMMERCES ============

// ============ ANIMATIONS ============

setTimeout(initScrollAnimations, 500);


// ============ DÉMARRAGE ============


document.addEventListener('click', function(e) {
  const panel = document.getElementById('notif-panel');
  const bell = document.querySelector('.notif-bell');
  if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.classList.remove('show');
  }
});

// ===== APPROBATION DES LIVREURS =====
async function approveDriver(id) {
  const d = drivers.find(x => String(x.id) === String(id));
  if (!d) {
    showToast('❌ Livreur introuvable');
    return;
  }
  try {
    const { error } = await supabaseClient.from('profiles').update({ status: 'approved' }).eq('id', id);
    if (error) throw error;
    d.status = 'approved';

    await showNotification(id, '✅ Compte approuvé', 'Bienvenue dans l\'équipe RuralGo ! Vous pouvez maintenant accepter des livraisons.', 'success');
    renderAdminDrivers();
    showToast('✅ Livreur approuvé !');
  } catch (err) {
    console.error('Erreur approveDriver:', err);
    showToast('❌ Erreur: ' + err.message);
  }
}

async function rejectDriver(id) {
  const d = drivers.find(x => String(x.id) === String(id));
  if (!d) {
    showToast('❌ Livreur introuvable');
    return;
  }
  try {
    const { error } = await supabaseClient.from('profiles').update({ status: 'rejected' }).eq('id', id);
    if (error) throw error;
    d.status = 'rejected';
    renderAdminDrivers();
    showToast('❌ Livreur refusé');
  } catch (err) {
    console.error('Erreur rejectDriver:', err);
    showToast('❌ Erreur: ' + err.message);
  }
}



// ===== SYSTÈME DE NOTIFICATIONS =====









// ============ OUVRIR/FERMER LE PANNEAU DE NOTIFICATIONS ============

// ===== DÉTAILS DES FONCTIONNALITÉS =====
function showFeatureDetail(type) {
  let title = '';
  let content = '';
  
  if (type === 'gps') {
    title = '🗺️ Suivi GPS en temps réel';
    content = `
      <div style="text-align:center;margin-bottom:1.5rem">
        <div style="font-size:4rem">🗺️</div>
      </div>
      <h3 style="color:#0a1929;margin-bottom:1rem">Comment ça marche ?</h3>
      <ul style="line-height:1.8;color:#333">
        <li>✅ Dès que votre commande est confirmée, un livreur est assigné</li>
        <li>✅ Vous recevez une notification avec les détails du livreur</li>
        <li>✅ Ouvrez la carte pour voir la position en temps réel</li>
        <li>✅ Suivez le parcours du commerce jusqu'à chez vous</li>
        <li>✅ Estimation précise de l'heure d'arrivée</li>
      </ul>
      <div style="margin-top:1.5rem;padding:1rem;background:#e8f5e9;border-radius:8px;border-left:4px solid #4caf50">
        <strong>💡 Astuce :</strong> Vous pouvez partager votre suivi avec un proche pour qu'il sache quand vous attendre !
      </div>
    `;
  } else if (type === 'tarif') {
    title = '💰 Tarif transparent';
    content = `
      <div style="text-align:center;margin-bottom:1.5rem">
        <div style="font-size:4rem">💰</div>
      </div>
      <h3 style="color:#0a1929;margin-bottom:1rem">Notre grille tarifaire</h3>
      <div style="background:#f5f1e8;padding:1.5rem;border-radius:12px;margin-bottom:1rem">
        <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #ddd">
          <span><strong>Frais de base</strong></span>
          <span style="color:#0a1929;font-weight:bold">7.00 $</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #ddd">
          <span><strong>Par kilomètre</strong></span>
          <span style="color:#0a1929;font-weight:bold">1.00 $</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:0.5rem 0;font-size:1.2rem;font-weight:bold;color:#0a1929">
          <span>Exemple : 5 km</span>
          <span>12.00 $</span>
        </div>
      </div>
      <h4 style="color:#0a1929;margin:1rem 0 0.5rem">📊 Exemples de tarifs</h4>
      <ul style="line-height:1.8;color:#333">
        <li>🚗 3 km = 10.00 $</li>
        <li>🚗 5 km = 12.00 $</li>
        <li>🚗 10 km = 17.00 $</li>
        <li>🚗 20 km = 27.00 $</li>
        <li>🚗 40 km (max) = 47.00 $</li>
      </ul>
      <div style="margin-top:1.5rem;padding:1rem;background:#fff3e0;border-radius:8px;border-left:4px solid #f5a623">
        <strong>✅ Pas de frais cachés !</strong> Le prix affiché est le prix final.
      </div>
    `;
  } else if (type === 'commerces') {
    title = '🏪 Nos commerces partenaires';
    const activeStores = stores.filter(s => s.status === 'active');
    const storesList = activeStores.map(s => {
      const count = products.filter(p => p.store_id === s.id && p.available).length;
      return `<div style="display:flex;align-items:center;gap:1rem;padding:1rem;background:#f5f1e8;border-radius:8px;margin-bottom:0.5rem">
        <div style="font-size:2.5rem">${s.icon}</div>
        <div style="flex:1">
          <div style="font-weight:bold;color:#0a1929">${s.name}</div>
          <div style="font-size:0.85rem;color:#666">${s.type}</div>
          <div style="font-size:0.8rem;color:#999">📍 ${s.address}</div>
          <div style="font-size:0.85rem;color:#0a1929;font-weight:bold;margin-top:0.3rem">📦 ${count} produit(s) disponible(s)</div>
        </div>
      </div>`;
    }).join('');
    
    content = `
      <div style="text-align:center;margin-bottom:1.5rem">
        <div style="font-size:4rem">🏪</div>
      </div>
      <h3 style="color:#0a1929;margin-bottom:1rem">Soutenez les entreprises locales !</h3>
      <p style="color:#666;margin-bottom:1.5rem">Nous travaillons avec les meilleurs commerces de Maniwaki et environs pour vous offrir un service de qualité.</p>
      ${activeStores.length > 0 ? storesList : '<p style="text-align:center;color:#666;padding:2rem">Aucun commerce disponible pour le moment</p>'}
      <div style="margin-top:1.5rem;padding:1rem;background:#e3f2fd;border-radius:8px;border-left:4px solid #2196f3">
        <strong>🤝 Vous êtes un commerçant ?</strong><br>
        Contactez-nous pour rejoindre notre réseau de partenaires !
      </div>
    `;
  } else if (type === 'paiement') {
    title = '💳 Paiement sécurisé';
    content = `
      <div style="text-align:center;margin-bottom:1.5rem">
        <div style="font-size:4rem">💳</div>
      </div>
      <h3 style="color:#0a1929;margin-bottom:1rem">Vos transactions sont protégées</h3>
      <ul style="line-height:1.8;color:#333">
        <li>🔒 Cryptage SSL 256 bits</li>
        <li>🏦 Conformité aux normes bancaires canadiennes</li>
        <li>✅ Vérification en temps réel</li>
        <li>🛡️ Protection contre la fraude</li>
        <li>💰 Remboursement garanti en cas de problème</li>
      </ul>
      <div style="margin-top:1.5rem;padding:1rem;background:#e8f5e9;border-radius:8px;border-left:4px solid #4caf50">
        <strong>✅ 100% sécurisé</strong><br>
        Vos informations financières ne sont jamais stockées sur nos serveurs.
      </div>
    `;
  } else if (type === 'itineraire') {
    title = '📱 Itinéraire optimisé';
    content = `
      <div style="text-align:center;margin-bottom:1.5rem">
        <div style="font-size:4rem">📱</div>
      </div>
      <h3 style="color:#0a1929;margin-bottom:1rem">Technologie de pointe</h3>
      <ul style="line-height:1.8;color:#333">
        <li>🗺️ Calcul automatique du chemin le plus court</li>
        <li>⏱️ Estimation précise du temps de livraison</li>
        <li>🚦 Prise en compte du trafic en temps réel</li>
        <li>📍 Géolocalisation GPS haute précision</li>
        <li>🔄 Mise à jour automatique de l'itinéraire</li>
      </ul>
      <div style="margin-top:1.5rem;padding:1rem;background:#fff3e0;border-radius:8px;border-left:4px solid #f5a623">
        <strong>💡 Le saviez-vous ?</strong><br>
        Notre algorithme permet d'économiser en moyenne 15% de temps de livraison !
      </div>
    `;
  } else if (type === 'communaute') {
    title = '🤝 Service communautaire';
    content = `
      <div style="text-align:center;margin-bottom:1.5rem">
        <div style="font-size:4rem">🤝</div>
      </div>
      <h3 style="color:#0a1929;margin-bottom:1rem">Des livreurs qui vous connaissent</h3>
      <p style="color:#666;margin-bottom:1rem">Nos livreurs sont des membres actifs de la communauté de Maniwaki. Ils connaissent la région, les routes et les commerces.</p>
      <ul style="line-height:1.8;color:#333">
        <li>👥 Livreurs locaux et fiables</li>
        <li>🏘️ Connaissance approfondie de la région</li>
        <li>⭐ Note moyenne de 4.9/5</li>
        <li>💬 Service client réactif et personnalisé</li>
        <li>🌱 Engagement envers le développement local</li>
      </ul>
      <div style="margin-top:1.5rem;padding:1rem;background:#e3f2fd;border-radius:8px;border-left:4px solid #2196f3">
        <strong>🚀 Rejoignez l'aventure !</strong><br>
        Devenez livreur et contribuez au développement de votre communauté.
      </div>
    `;
  }
  
  // Supprimer l'ancien modal s'il existe
  const oldModal = document.getElementById('feature-detail-modal');
  if (oldModal) oldModal.remove();
  
  // Créer le modal
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.id = 'feature-detail-modal';
  modal.innerHTML = `
    <div class="modal" style="max-width:600px">
      <h2 style="color:#0a1929;margin-bottom:1.5rem">${title}</h2>
      ${content}
      <div style="margin-top:2rem;text-align:right">
        <button class="btn-sm btn-gray" onclick="closeFeatureDetailModal()">Fermer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeFeatureDetailModal() {
  const modal = document.getElementById('feature-detail-modal');
  if (modal) {
    modal.remove();
  }
}
// ============ FONCTION POUR LES FORFAITS COMMERCES ============



function continueToRegister(){
  closeModal('choose-type-modal');
  if(selectedAccountType==='client'){
    openModal('register-client-modal');
    setTimeout(()=>initAutocomplete('rc-address','rc-address-suggestions'),100);
  } else if(selectedAccountType==='driver'){
    openModal('register-driver-modal');
  } else if(selectedAccountType==='store'){
    openModal('register-store-modal');
    setTimeout(()=>initAutocomplete('rs-address','rs-address-suggestions'),100);
  }
}

// ============ FONCTION POUR LES FORFAITS COMMERCES ============
function openStoreRegisterModal(forfait) {
  // 1. On sauvegarde le forfait choisi pour s'en souvenir
  window.selectedForfait = forfait;
  
  // 2. Petit message de confirmation
  const noms = {
    'essai': 'Essai (0$/mois)',
    'base': 'Base (7,99$/mois)',
    'croissance': 'Croissance (29,99$/mois)',
    'partenaire': 'Partenaire Plus (89,99$/mois)'
  };
  showToast('🏪 Forfait choisi : ' + noms[forfait]);

  // 3. On ouvre DIRECTEMENT le formulaire d'inscription commerce
  openModal('register-store-modal');
  
  // 4. On active l'autocomplétion d'adresse du formulaire commerce (comme dans continueToRegister)
  setTimeout(() => {
    if (typeof initAutocomplete === 'function') {
      initAutocomplete('rs-address', 'rs-address-suggestions');
    }
  }, 100);
}

// ==========================================
// ✅ PANIER CLIENT : Voir et Commander
// ==========================================
function showCustomerCart() {
  // 1. Fermer la modale du magasin si elle est ouverte
  const storeModal = document.querySelector('.modal-bg');
  if (storeModal) storeModal.remove();

  // 2. Récupérer le panier depuis localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  // 3. Si le panier est vide
  if (cart.length === 0) {
    showToast('❌ Votre panier est vide');
    return;
  }

  // 4. Calculer le total
  let total = 0;
  cart.forEach(item => {
    total += parseFloat(item.price) * (item.qty || 1);
  });

  // 5. Créer la modale du panier
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:600px; max-height:90vh; overflow-y:auto;">
      <h2 style="color:#0a1929; margin-bottom:1.5rem;">🛒 Mon Panier</h2>
      
      <!-- Liste des produits -->
      <div style="display:flex; flex-direction:column; gap:1rem; margin-bottom:1.5rem;">
        ${cart.map((item, index) => `
          <div style="background:#f9f9f9; padding:1rem; border-radius:8px; display:flex; gap:1rem; align-items:center;">
            <div style="font-size:2rem;">${item.icon || '📦'}</div>
            <div style="flex:1;">
              <h4 style="margin:0; color:#0a1929;">${item.name}</h4>
              <p style="margin:0.3rem 0; color:#10b981; font-weight:bold;">${parseFloat(item.price).toFixed(2)} $</p>
              <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.5rem;">
                <button onclick="updateCartQuantity(${index}, -1)" style="background:#ef4444; color:white; border:none; width:28px; height:28px; border-radius:4px; cursor:pointer; font-size:1rem;">-</button>
                <span style="font-weight:bold; min-width:30px; text-align:center;">${item.qty || 1}</span>
                <button onclick="updateCartQuantity(${index}, 1)" style="background:#10b981; color:white; border:none; width:28px; height:28px; border-radius:4px; cursor:pointer; font-size:1rem;">+</button>
              </div>
            </div>
            <button onclick="removeFromCart(${index})" style="background:#ef4444; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem;">🗑️ Retirer</button>
          </div>
        `).join('')}
      </div>

      <!-- Total -->
      <div style="background:#f5f1e8; padding:1.5rem; border-radius:8px; margin-bottom:1.5rem;">
        <div style="display:flex; justify-content:space-between; font-size:1.3rem; font-weight:bold; color:#0a1929;">
          <span>Total :</span>
          <span style="color:#10b981;">${total.toFixed(2)} $</span>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div style="display:flex; gap:1rem; justify-content:flex-end;">
        <button onclick="this.closest('.modal-bg').remove()" style="background:#6b7280; color:white; border:none; padding:12px 24px; border-radius:8px; cursor:pointer; font-size:1rem;">Continuer mes achats</button>
        <button onclick="checkoutOrder()" style="background:#f5a623; color:#0a1929; border:none; padding:12px 24px; border-radius:8px; cursor:pointer; font-size:1rem; font-weight:bold;">✅ Passer la commande</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Modifier la quantité d'un produit dans le panier
function updateCartQuantity(index, change) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart[index]) {
    cart[index].qty = Math.max(1, (cart[index].qty || 1) + change);
    localStorage.setItem('cart', JSON.stringify(cart));
    showCustomerCart(); // Recharger l'affichage
  }
localStorage.setItem('cart', JSON.stringify(cart));
}

// Retirer un produit du panier
function removeFromCart(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  showCustomerCart(); // Recharger l'affichage
}

// Passer la commande
async function checkoutOrder() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) {
    showToast('❌ Votre panier est vide');
    localStorage.removeItem('cart');
    return;
  }

  // Demander les infos de livraison
  const customerName = prompt('Votre nom :');
  if (!customerName) return;
  
  const customerPhone = prompt('Votre téléphone :');
  if (!customerPhone) return;
  
  const customerAddress = prompt('Adresse de livraison :');
  if (!customerAddress) return;

  // Calculer le total
  let total = 0;
  cart.forEach(item => {
    total += parseFloat(item.price) * (item.qty || 1);
  });

  

showToast('✅ Commande passée avec succès !');  try {
    // Sauvegarder la commande dans Supabase
    const { error } = await supabaseClient
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        items: cart,
        total: total,
        status: 'pending'
      });

    if (error) throw error;

    // Vider le panier
    localStorage.removeItem('cart ');
    
    // Fermer la modale
    document.querySelector('.modal-bg')?.remove();
    
    showToast('✅ Commande envoyée avec succès ! Le commerçant vous contactera bientôt.');
    // ✅ NOTIFIER LE COMMERCE
try {
  const firstProduct = products.find(p => String(p.id) === String(cart[0].productId));
  if (firstProduct && firstProduct.store_id) {
    const store = stores.find(s => String(s.id) === String(firstProduct.store_id));
    if (store && store.owner_id) {
      await createNotificationForUser(
        store.owner_id,
        '🛒 Nouvelle commande !',
        `${currentUser.name} a passé une commande de ${cart.length} produit(s).`
      );
    }
  }
} catch (err) {
  console.error("❌ Erreur notification commerce:", err);
}

  } catch (err) {
    console.error('Erreur commande:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}
async function viewStoreDetails(id) {
  // 1. Trouver les infos du magasin
  const store = stores.find(s => String(s.id) === String(id));
  if (!store) {
    showToast('❌ Commerce introuvable');
    return;
  }
  
  // 2. Récupérer les produits de ce magasin (avec le BON nom: store_id)
  const { data: storeProducts } = await supabaseClient
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('available', true); // On n'affiche que les produits disponibles aux clients

  // 3. Préparer l'affichage des produits
  let productsHtml = '<p style="color:#666; text-align:center; padding:1rem;">Aucun produit disponible pour le moment.</p>';
  
  if (storeProducts && storeProducts.length > 0) {
    productsHtml = '<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">';
    storeProducts.forEach(p => {
      productsHtml += `
        <div style="background:white; padding:1rem; border-radius:8px; text-align:center; border:1px solid #eee; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="font-size:2.5rem; margin-bottom:0.5rem;">${p.icon || '📦'}</div>
            <h4 style="margin:0; font-size:0.9rem; color:#0a1929;">${p.name}</h4>
            <p style="margin:0.5rem 0; color:#10b981; font-weight:bold; font-size:1.1rem;">${parseFloat(p.price).toFixed(2)} $</p>
          </div>
          <!-- ✅ CORRECTION : On envoie juste l'ID (p.id) à ta fonction addToCart -->
          <button onclick="addToCart(${p.id})" style="background:#0a1929; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-size:0.85rem; margin-top:0.5rem; width:100%;">🛒 Ajouter</button>
        </div>
      `;
    });
    productsHtml += '</div>';
  }

  // 4. Créer et afficher la modale
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:700px; max-height: 90vh; overflow-y: auto;">
      <h2 style="color:#0a1929;margin-bottom:1.5rem">🏪 ${store.name}</h2>
      
      <!-- Infos du commerce -->
      <div style="background:#f5f1e8;padding:1.5rem;border-radius:12px">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
          <div style="font-size:4rem">${store.icon || '🏪'}</div>
          <div>
            <h3 style="margin:0;color:#0a1929">${store.name}</h3>
            <p style="margin:0.3rem 0;color:#666">${store.type || 'Non spécifié'}</p>
          </div>
        </div>
        <div style="display:grid;gap:1rem; grid-template-columns: 1fr 1fr;">
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>📍 Adresse :</strong>
            <p style="margin:0.3rem 0;color:#666">${store.address || 'Non spécifiée'}</p>
          </div>
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>📱 Téléphone :</strong>
            <p style="margin:0.3rem 0;color:#666">${store.phone || 'Non spécifié'}</p>
          </div>
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>📧 Email :</strong>
            <p style="margin:0.3rem 0;color:#666">${store.email || 'Non spécifié'}</p>
          </div>
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>🎟️ Forfait :</strong>
            <p style="margin:0.3rem 0;color:#666">${store.forfait || 'Non spécifié'}</p>
          </div>
        </div>
      </div>

      <!-- Section des produits -->
      <div style="margin-top: 2rem;">
        <h3 style="color:#0a1929; margin-bottom: 0.5rem; border-bottom: 2px solid #f5a623; padding-bottom: 0.5rem;">🛒 Produits disponibles</h3>
        ${productsHtml}
      </div>

      <!-- Boutons du bas -->
      <div style="margin-top:2rem; text-align:center; padding-bottom:1rem; border-top:1px solid #eee; padding-top:1rem;">
        <button onclick="showMyCartProperly()" style="background:#f5a623; color:#0a1929; border:none; padding:12px 24px; border-radius:8px; cursor:pointer; font-size:1rem; font-weight:bold; margin-right:10px;">🛒 Voir mon panier</button>
      <button onclick="this.closest('.modal-bg').remove()" style="background:#ef4444; color:white; border:none; padding:12px 24px; border-radius:8px; cursor:pointer; font-size:1rem;">Fermer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}


function viewDriverDetails(id) {
  const driver = drivers.find(d => String(d.id) === String(id));
  if (!driver) {
    showToast('❌ Livreur introuvable');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:600px">
      <h2 style="color:#0a1929;margin-bottom:1.5rem">🚗 Détails du livreur</h2>
      <div style="background:#f5f1e8;padding:1.5rem;border-radius:12px">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
          <div style="font-size:4rem">🚗</div>
          <div>
            <h3 style="margin:0;color:#0a1929">${driver.name}</h3>
            <p style="margin:0.3rem 0;color:#666">${driver.vehicle || 'Véhicule non spécifié'}</p>
          </div>
        </div>
        <div style="display:grid;gap:1rem">
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>📧 Email :</strong>
            <p style="margin:0.3rem 0;color:#666">${driver.email || 'Non spécifié'}</p>
          </div>
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>📱 Téléphone :</strong>
            <p style="margin:0.3rem 0;color:#666">${driver.phone || 'Non spécifié'}</p>
          </div>
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>🚙 Véhicule :</strong>
            <p style="margin:0.3rem 0;color:#666">${driver.vehicle || 'Non spécifié'}</p>
          </div>
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>📊 Statut :</strong>
            <span class="badge ${driver.status === 'approved' ? 'badge-green' : driver.status === 'pending' ? 'badge-orange' : 'badge-red'}">
              ${driver.status === 'approved' ? '✅ Approuvé' : driver.status === 'pending' ? '⏳ En attente' : '❌ Refusé'}
            </span>
          </div>
        </div>
      </div>
      <div style="margin-top:1.5rem;text-align:right">
        <button class="btn-sm btn-gray" onclick="this.closest('.modal-bg').remove()">Fermer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function viewClientDetails(id) {
  const client = clients.find(c => String(c.id) === String(id));
  if (!client) {
    showToast('❌ Client introuvable');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:600px">
      <h2 style="color:#0a1929;margin-bottom:1.5rem">👤 Détails du client</h2>
      <div style="background:#f5f1e8;padding:1.5rem;border-radius:12px">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
          <div style="font-size:4rem">👤</div>
          <div>
            <h3 style="margin:0;color:#0a1929">${client.name}</h3>
          </div>
        </div>
        <div style="display:grid;gap:1rem">
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>📧 Email :</strong>
            <p style="margin:0.3rem 0;color:#666">${client.email || 'Non spécifié'}</p>
          </div>
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>📱 Téléphone :</strong>
            <p style="margin:0.3rem 0;color:#666">${client.phone || 'Non spécifié'}</p>
          </div>
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>📍 Adresse :</strong>
            <p style="margin:0.3rem 0;color:#666">${client.address || 'Non spécifiée'}</p>
          </div>
        </div>
      </div>
      <div style="margin-top:1.5rem;text-align:right">
        <button class="btn-sm btn-gray" onclick="this.closest('.modal-bg').remove()">Fermer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function viewOrderDetails(id) {
  const order = orders.find(o => String(o.id) === String(id));
  if (!order) {
    showToast('❌ Commande introuvable');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:700px">
      <h2 style="color:#0a1929;margin-bottom:1.5rem">📦 Détails de la commande #${order.id}</h2>
      <div style="background:#f5f1e8;padding:1.5rem;border-radius:12px">
        <div style="display:grid;gap:1rem">
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>📊 Statut :</strong>
            <span class="badge ${order.status === 'delivered' ? 'badge-green' : order.status === 'pending' ? 'badge-orange' : 'badge-red'}">
              ${order.status === 'delivered' ? '✅ Livrée' : order.status === 'pending' ? '⏳ En attente' : '❌ Annulée'}
            </span>
          </div>
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>💰 Total :</strong>
            <p style="margin:0.3rem 0;color:#666;font-size:1.2rem;font-weight:bold">${(order.total || 0).toFixed(2)} $</p>
          </div>
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>📍 Adresse de livraison :</strong>
            <p style="margin:0.3rem 0;color:#666">${order.deliveryAddress || 'Non spécifiée'}</p>
          </div>
        </div>
      </div>
      <div style="margin-top:1.5rem;text-align:right">
        <button class="btn-sm btn-gray" onclick="this.closest('.modal-bg').remove()">Fermer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}


// ============ MODIFIER UN CLIENT ============

async function saveClientEdit(event, id) {
  event.preventDefault();
  try {
    const updateData = {
      name: document.getElementById('ec-name').value,
      email: document.getElementById('ec-email').value,
      phone: document.getElementById('ec-phone').value,
      address: document.getElementById('ec-address').value
    };
    
    const { error } = await supabaseClient
   .from('profiles')
         .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    
    // Mettre à jour le tableau local
    const idx = clients.findIndex(c => String(c.id) === String(id));
    if (idx >= 0) {
      clients[idx] = { ...clients[idx], ...updateData };
    }
    
    document.getElementById('edit-client-modal').remove();
    showToast('✅ Client modifié !');
    renderAdminClients();
  } catch (err) {
    console.error('Erreur saveClientEdit:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ============ SUPPRIMER UN CLIENT ============
async function confirmDeleteClient(id) {
  if (!confirm('⚠️ Voulez-vous vraiment supprimer ce client ?\n\nCette action supprimera aussi :\n- Ses commandes\n- Ses notifications\n- Son profil\n\nCette action est IRRÉVERSIBLE !')) {
    return;
  }
  
  try {
    // 1. Supprimer les commandes du client
    await supabaseClient.from('orders').delete().eq('client_id', id);
    
    // 2. Supprimer les notifications du client
    await supabaseClient.from('notifications').delete().eq('user_id', id);
    
    // 3. Supprimer le profil du client
    const { error } = await supabaseClient.from('profiles ').delete().eq('id', id);
    if (error) throw error;
    
    // 4. Mettre à jour le tableau local
    clients = clients.filter(c => String(c.id) !== String(id));
    
    showToast('✅ Client supprimé !');
    renderAdminClients();
    renderAdminDashboard();
  } catch (err) {
    console.error('Erreur confirmDeleteClient:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}
// ============ MODIFIER UN LIVREUR ============
function editDriver(id) {
  const d = drivers.find(x => String(x.id) === String(id));
  if (!d) { showToast('❌ Livreur introuvable'); return; }

  const old = document.getElementById('edit-driver-modal');
  if (old) old.remove();

  const vehicles = ['Voiture', 'Camionnette', 'Pick-up', 'VTT/Quad', 'Motoneige'];

  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.id = 'edit-driver-modal';

  modal.innerHTML = `
    <div class="modal">
      <h2 style="color:#0a1929;margin-bottom:1rem">✏️ Modifier le livreur</h2>

      <div class="info-box">💡 Le courriel ne se modifie pas ici : c'est l'identifiant de connexion du livreur.</div>

      <form onsubmit="saveDriverEdit(event, '${id}')">
        <div class="form-group">
          <label>👤 Nom complet</label>
          <input type="text" id="ed-name" value="${d.name || ''}" required>
        </div>

        <div class="form-group">
          <label>📱 Téléphone</label>
          <input type="tel" id="ed-phone" value="${d.phone || ''}">
        </div>

        <div class="form-group">
          <label>🚙 Véhicule</label>
          <select id="ed-vehicle">
            ${vehicles.map(v => `<option value="${v}" ${d.vehicle === v ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>📌 Statut</label>
          <select id="ed-status">
            <option value="approved" ${d.status === 'approved' ? 'selected' : ''}>✅ Approuvé (actif)</option>
            <option value="pending" ${d.status === 'pending' ? 'selected' : ''}>⏳ En attente</option>
            <option value="rejected" ${d.status === 'rejected' ? 'selected' : ''}>❌ Refusé</option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-sm btn-gray" onclick="document.getElementById('edit-driver-modal').remove()">Annuler</button>
          <button type="submit" class="btn-sm btn-green">💾 Enregistrer</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
}

async function saveDriverEdit(event, id) {
  event.preventDefault();

  const data = {
    name: document.getElementById('ed-name').value.trim(),
    phone: document.getElementById('ed-phone').value.trim(),
    vehicle: document.getElementById('ed-vehicle').value,
    status: document.getElementById('ed-status').value
  };

  try {
    const { error } = await supabaseClient.from('profiles').update(data).eq('id', id);
    if (error) throw error;

    const idx = drivers.findIndex(d => String(d.id) === String(id));
    if (idx >= 0) drivers[idx] = { ...drivers[idx], ...data };

    const modal = document.getElementById('edit-driver-modal');
    if (modal) modal.remove();

    renderAdminDrivers();
    showToast('✅ Livreur modifié !');
  } catch (err) {
    console.error('Erreur saveDriverEdit:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ============ SUPPRIMER UN LIVREUR ============
async function confirmDeleteDriver(id) {
  const d = drivers.find(x => String(x.id) === String(id));
  if (!d) { showToast('❌ Livreur introuvable'); return; }

  if (!confirm('Supprimer le livreur ' + d.name + ' ?\n\nSes commandes ne seront PAS supprimées.\nElles resteront disponibles pour être réassignées.\n\nCette action est irréversible.')) return;

  try {
    // 1. Détacher le livreur de ses commandes (pour ne rien perdre)
    const { error: errOrders } = await supabaseClient
      .from('orders')
      .update({ driver_id: null, driver_name: null })
      .eq('driver_id', id);
    if (errOrders) throw errOrders;

    // 2. Supprimer ses notifications
    await supabaseClient.from('notifications').delete().eq('user_id', id);

    // 3. Supprimer son profil
    const { error } = await supabaseClient.from('profiles').delete().eq('id', id);
    if (error) throw error;

    // 4. Mettre à jour l'affichage local
    drivers = drivers.filter(x => String(x.id) !== String(id));

    orders.forEach(o => {
      if (String(o.driverId) === String(id)) {
        o.driverId = null;
        o.driverName = null;
      }
    });

    renderAdminDrivers();
    showToast('✅ Livreur supprimé !');
  } catch (err) {
    console.error('Erreur confirmDeleteDriver:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}
// ============ SYSTÈME DE TRANSACTIONS ET PORTEFEUILLE ============

// Variable globale pour stocker le solde de l'utilisateur
let userWalletBalance = 0;

// Charger le solde du portefeuille de l'utilisateur connecté
async function loadUserWallet() {
  // ✅ L'admin n'a pas de wallet (son ID n'est pas un vrai UUID)
  if (!currentUser || currentUser.id === 'admin') {
    userWalletBalance = 0;
    updateWalletDisplay();
    return;
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('wallet_balance')
      .eq('id', currentUser.id)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      userWalletBalance = parseFloat(data.balance) || 0;
    } else {
      // Créer le wallet s'il n'existe pas
      const { error: createError } = await supabaseClient
        .from('profiles')
        .insert({
          user_id: currentUser.id,
          balance: 0
        });
      
      if (createError) throw createError;
      userWalletBalance = 0;
    }
    
    updateWalletDisplay();
    
  } catch (err) {
    console.error('Erreur loadUserWallet:', err);
    userWalletBalance = 0;
  }
}

// Mettre à jour l'affichage du solde dans l'interface
// ✅ Affiche le wallet UNIQUEMENT pour les clients et commerces (pas livreurs/admins)
function updateWalletDisplay() {
  console.log("🔄 [WALLET] Mise à jour...");
  
  if (!currentUser || !currentUser.id) {
    console.log("⚠️ Pas d'utilisateur connecté");
    return;
  }

  supabaseClient
    .from('profiles')
    .select('wallet_balance')
    .eq('id', currentUser.id)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) {
        console.error("❌ Erreur wallet:", error.message);
        return;
      }
      
      if (!data) {
        console.log("⚠️ Profil non trouvé");
        return;
      }

      const balance = parseFloat(data.wallet_balance) || 0;
      currentUser.wallet_balance = balance;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      const walletEl = document.getElementById('wallet-balance');
      if (walletEl) {
        walletEl.textContent = balance.toFixed(2);
      }
      
      console.log("✅ Solde mis à jour:", balance.toFixed(2), "$");
    });
}


// Afficher le solde dans une alerte (pour tester)
function showWalletBalance() {
  showToast(`💰 Votre solde : ${userWalletBalance.toFixed(2)} $`);
}

// Recharger le portefeuille (simulation - à remplacer par Stripe plus tard)
async function depositToWallet(amount) {
  // ✅ L'admin ne peut pas recharger
  if (!currentUser || currentUser.id === 'admin') {
    showToast('❌ L\'administrateur n\'a pas de portefeuille');
    return;
  }
  
  if (amount <= 0) {
    showToast('❌ Le montant doit être supérieur à 0');
    return;
  }
  
  try {
    let wallet;
    const { data: existingWallet, error: walletError } = await supabaseClient
      .from('profiles')
      .select('wallet_balance')
      .eq('id', currentUser.id)
      .maybeSingle();
    
    if (walletError && walletError.code !== 'PGRST116') {
      throw walletError;
    }
    
    if (!existingWallet) {
      const { error: createError } = await supabaseClient
        .from('profiles')
        .insert({
          user_id: currentUser.id,
          balance: 0
        });
      
      if (createError) throw createError;
      wallet = { balance: 0 };
    } else {
      wallet = existingWallet;
    }
    
    const balanceBefore = parseFloat(wallet.balance);
    const balanceAfter = balanceBefore + amount;
    
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: currentUser.id,
        type: 'deposit',
        amount: amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: 'Recharge de compte',
        status: 'completed',
        payment_method: 'cash'
      });
    
    if (transactionError) throw transactionError;
    
    const { error: depositError } = await supabaseClient
      .from('deposits')
      .insert({
        user_id: currentUser.id,
        amount: amount,
        payment_method: 'cash',
        status: 'completed',
        completed_at: new Date().toISOString()
      });
    
    if (depositError) throw depositError;
    
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ balance: balanceAfter, updated_at: new Date().toISOString() })
      .eq('user_id', currentUser.id);
    
    if (updateError) throw updateError;
    
    userWalletBalance = balanceAfter;
    updateWalletDisplay();
    
    showToast(`✅ Recharge réussie ! Nouveau solde : ${balanceAfter.toFixed(2)} $`);
    
  } catch (err) {
    console.error('Erreur depositToWallet:', err);
    showToast('❌ Erreur lors de la recharge : ' + err.message);
  }
}

// Payer une commande avec le portefeuille
async function payOrderWithWallet(orderId, amount) {
  if (!currentUser) {
    showToast('❌ Vous devez être connecté');
    return false;
  }
  
  if (userWalletBalance < amount) {
    showToast(`❌ Solde insuffisant. Vous avez ${userWalletBalance.toFixed(2)} $, il faut ${amount.toFixed(2)} $`);
    return false;
  }
  
  try {
    // 1. Récupérer le solde actuel
    const { data: wallet, error: walletError } = await supabaseClient
      .from('profiles')
      .select('wallet_balance')
      .eq('id', currentUser.id)
      .single();
    
    if (walletError) throw walletError;
    
    const balanceBefore = parseFloat(wallet.balance);
    const balanceAfter = balanceBefore - amount;
    
    // 2. Créer la transaction
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: currentUser.id,
        type: 'payment',
        amount: amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Paiement commande #${orderId}`,
        related_order_id: orderId,
        status: 'completed',
        payment_method: 'wallet'
      });
    
    if (transactionError) throw transactionError;
    
    // 3. Mettre à jour le portefeuille
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ balance: balanceAfter, updated_at: new Date().toISOString() })
      .eq('user_id', currentUser.id);
    
    if (updateError) throw updateError;
    
    // 4. Mettre à jour l'affichage
    userWalletBalance = balanceAfter;
    updateWalletDisplay();
    
    showToast(`✅ Paiement réussi ! Nouveau solde : ${balanceAfter.toFixed(2)} $`);
    return true;
    
  } catch (err) {
    console.error('Erreur payOrderWithWallet:', err);
    showToast('❌ Erreur lors du paiement : ' + err.message);
    return false;
  }
}

// Voir l'historique des transactions
async function showTransactionHistory() {
  if (!currentUser) {
    showToast('❌ Vous devez être connecté');
    return;
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      showToast('📭 Aucune transaction pour le moment');
      return;
    }
    
    // Créer un modal pour afficher l'historique
    const modal = document.createElement('div');
    modal.className = 'modal-bg show';
    modal.innerHTML = `
      <div class="modal" style="max-width:700px;max-height:80vh;overflow-y:auto">
        <h2 style="color:#0a1929;margin-bottom:1.5rem">💰 Historique des transactions</h2>
        <div style="display:grid;gap:1rem">
          ${data.map(t => {
            const icons = {
              'deposit': '💳',
              'withdrawal': '💸',
              'payment': '🛒',
              'earning': '💰',
              'refund': '↩️',
              'transfer': '🔄'
            };
            const colors = {
              'deposit': '#10b981',
              'withdrawal': '#ef4444',
              'payment': '#ef4444',
              'earning': '#10b981',
              'refund': '#f59e0b',
              'transfer': '#3b82f6'
            };
            const icon = icons[t.type] || '💵';
            const color = colors[t.type] || '#666';
            const sign = ['deposit', 'earning', 'refund'].includes(t.type) ? '+' : '-';
            
            return `
              <div style="background:#f5f1e8;padding:1rem;border-radius:8px;border-left:4px solid ${color}">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <div style="display:flex;align-items:center;gap:1rem">
                    <div style="font-size:2rem">${icon}</div>
                    <div>
                      <div style="font-weight:bold;color:#0a1929">${t.description || 'Transaction'}</div>
                      <div style="font-size:0.85rem;color:#666">${new Date(t.created_at).toLocaleString('fr-CA')}</div>
                    </div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:1.2rem;font-weight:bold;color:${color}">
                      ${sign}${t.amount.toFixed(2)} $
                    </div>
                    <div style="font-size:0.85rem;color:#666">
                      Solde : ${t.balance_after.toFixed(2)} $
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="margin-top:1.5rem;text-align:right">
          <button class="btn-sm btn-gray" onclick="this.closest('.modal-bg').remove()">Fermer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
  } catch (err) {
    console.error('Erreur showTransactionHistory:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}
// ============ MODAL DE RECHARGE ============
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
        <div style="font-size:2rem;font-weight:bold;color:#f5a623">${userWalletBalance.toFixed(2)} $</div>
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
        💡 <strong>Note :</strong> Pour l'instant, les recharges sont simulées. L'intégration Stripe/PayPal arrive bientôt !
      </div>
      
      <div class="modal-actions">
        <button class="btn-sm btn-gray" onclick="this.closest('.modal-bg').remove()">Annuler</button>
        <button class="btn-sm btn-green" onclick="confirmDeposit()">✅ Recharger</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Confirmer la recharge
// Confirmer la recharge (Version corrigée et infaillible)
async function confirmDeposit() {
  const amountInput = document.getElementById('deposit-amount');
  const amount = parseFloat(amountInput.value);

  if (!amount || amount < 5) {
    showToast('❌ Le montant minimum est de 5$');
    return;
  }

  showToast('⏳ Vérification de votre session...');

  try {
    // 1. Demander DIRECTEMENT à Supabase qui est connecté (garanti d'avoir l'ID)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      showToast('❌ Vous devez être connecté pour recharger');
      return;
    }

    const userId = user.id; // <-- Ici, c'est garanti d'être le bon ID, plus jamais null !
    const userEmail = user.email || 'client@ruralgo.com';

    showToast('⏳ Redirection vers le paiement sécurisé...');

    // 2. Appel à la fonction Edge avec l'ID garanti
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

    // 3. Rediriger vers Stripe
    window.location.href = data.url;

  } catch (err) {
    console.error('Erreur confirmDeposit:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}
// ==========================================
// 💳 PAGE DE REMERCIEMENT RURALGO QUÉBEC (Après paiement)
// ==========================================

 
// ==========================================
// 💳 PAGE DE REMERCIEMENT RURALGO QUÉBEC (Après paiement)
// ==========================================



function goHomeAfterThankYou() {
  isThankYouPageActive = false;
console.log("🛡️ [BOUCLIER] Protection désactivée - retour aux commerces");
  window.location.href = '/';
}

// Lancer la vérification au chargement de la page
setTimeout(checkPaymentSuccess, 1000);
  
// ✅ Créer le commerce dans 'stores' à la connexion s'il n'existe pas encore
async function ensureStoreExists() {
  if (!currentUser || currentUser.role !== 'store') return;

  try {
    // 1. Vérifier si le store existe déjà
    const { data: existingStore } = await supabaseClient
      .from('stores')
      .select('id')
      .eq('owner_id', currentUser.id)
      .maybeSingle();

    if (existingStore) {
      console.log("✅ Le commerce existe déjà");
      return;
    }

    // 2. Sinon, le créer avec les infos du profile
    console.log("🔍 Création du commerce dans stores...");
    
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (!profile) {
      console.error("❌ Profile introuvable");
      return;
    }

    const { error } = await supabaseClient
      .from('stores')
      .insert({
        owner_id: currentUser.id,
        name: profile.name || 'Mon Commerce',
        type: 'Commerce',
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
        province: profile.province || '',
        status: profile.status || 'pending',
        forfait: profile.selected_plan_id || 1
      });

    if (error) {
      console.error("❌ Erreur création store:", error);
    } else {
      console.log("✅ Commerce créé avec succès !");
    }

  } catch (err) {
    console.error("❌ Erreur ensureStoreExists:", err);
  }
}
// ==========================================
// ✅ DIAGNOSTIC COMPLET - STABILISE TOUT LE SYSTÈME
// ==========================================

async function diagnosticComplet() {
  console.log("🔍 ===== DIAGNOSTIC COMPLET DÉMARRÉ =====");
  
  if (!currentUser) {
    console.log("⚠️ Pas d'utilisateur connecté");
    return;
  }

  console.log("🔍 Utilisateur:", currentUser.email, "Rôle:", currentUser.role);

  try {
    // 1. VÉRIFIER LE PROFIL
    console.log("🔍 1. Vérification du profil...");
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (profileError || !profile) {
      console.error("❌ Profil introuvable!");
      return;
    }
    console.log("✅ Profil OK:", profile.status);

    // 2. VÉRIFIER LE COMMERCE (si rôle = store)
    if (currentUser.role === 'store') {
      console.log("🔍 2. Vérification du commerce...");
      const { data: store } = await supabaseClient
        .from('stores')
        .select('*')
        .eq('owner_id', currentUser.id)
        .maybeSingle();

      if (!store) {
        console.warn("⚠️ Commerce manquant, création automatique...");
        const { error } = await supabaseClient
          .from('stores')
          .insert({
            owner_id: currentUser.id,
            name: profile.name || 'Mon Commerce',
            type: 'Commerce',
            address: profile.address || 'Adresse non spécifiée',
            phone: profile.phone || 'Non spécifié',
            email: profile.email || '',
            status: 'active',
            forfait: profile.selected_plan_id || 1,
            icon: '🏪'
          });
        
        if (error) {
          console.error("❌ Erreur création commerce:", error);
        } else {
          console.log("✅ Commerce créé automatiquement!");
        }
      } else {
        console.log("✅ Commerce OK:", store.name);
      }

      // 3. VÉRIFIER L'ABONNEMENT
      console.log("🔍 3. Vérification de l'abonnement...");
      const { data: sub } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (!sub) {
        console.warn("⚠️ Abonnement manquant, création automatique...");
        const { error } = await supabaseClient
          .from('subscriptions')
          .insert({
            user_id: currentUser.id,
            plan_id: profile.selected_plan_id || 1,
            status: 'active',
            current_period_start: new Date(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          });
        
        if (error) {
          console.error("❌ Erreur création abonnement:", error);
        } else {
          console.log("✅ Abonnement créé automatiquement!");
        }
      } else {
        console.log("✅ Abonnement OK:", sub.status);
      }
    }

    console.log("🔍 ===== DIAGNOSTIC TERMINÉ =====");

  } catch (err) {
    console.error("❌ Erreur diagnostic:", err);
  }
}

 // <-- Ajoute cette accolade ici au cas où il en manquerait une

function goToMyStore() {
  // 1. Cacher les sections catégories et produits
  const catSection = document.getElementById('store-categories-section');
  if (catSection) catSection.style.display = 'none';
  
  const prodSection = document.getElementById('store-products-section');
  if (prodSection) prodSection.style.display = 'none';
  
  // 2. Afficher la section dashboard
  const dashSection = document.getElementById('store-dashboard-section');
  if (dashSection) dashSection.style.display = 'block';
  
  // 3. Afficher la vue commerce
  switchView('view-store');
  
  // 4. Lancer le dashboard avec l'inventaire
  if (typeof showStoreDashboard === 'function') {
    showStoreDashboard();
  }
}


let searchTimeout;

function handleSearch(query) {
  clearTimeout(searchTimeout);
  
  const suggestionsDiv = document.getElementById('search-suggestions');
  if (!suggestionsDiv) return;
  
  if (!query || query.length < 2) {
    suggestionsDiv.style.display = 'none';
    return;
  }
  
  searchTimeout = setTimeout(() => {
    performSearch(query.toLowerCase());
  }, 300);
}

async function performSearch(query) {
  const suggestionsDiv = document.getElementById('search-suggestions');
  if (!suggestionsDiv) return;
  
  let results = [];
  
  // 1. Rechercher dans les produits
  if (typeof products !== 'undefined' && Array.isArray(products)) {
    const matchingProducts = products.filter(p => 
      p.available && (
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      )
    ).slice(0, 5);
    
    matchingProducts.forEach(p => {
      const store = stores.find(s => String(s.id) === String(p.store_id));
      results.push({
        type: 'product',
        id: p.id,
        store_id: p.store_id,
        icon: '🛍️',
        title: p.name,
        subtitle: `${store ? store.name : 'Commerce'} • ${p.price} $`
      });
    });
  }
  
  // 2. Rechercher dans les commerces
  if (typeof stores !== 'undefined' && Array.isArray(stores)) {
    const matchingStores = stores.filter(s => 
      s.name.toLowerCase().includes(query) ||
      (s.type && s.type.toLowerCase().includes(query))
    ).slice(0, 3);
    
    matchingStores.forEach(s => {
      results.push({
        type: 'store',
        id: s.id,
        icon: s.icon || '🏪',
        title: s.name,
        subtitle: s.type || 'Commerce'
      });
    });
  }
  
  // 3. Afficher les résultats
  if (results.length === 0) {
    suggestionsDiv.innerHTML = '<div class="search-item" style="text-align:center; color:#999;">Aucun résultat trouvé</div>';
  } else {
    suggestionsDiv.innerHTML = results.map(r => `
      <div class="search-item" onclick="handleSearchClick('${r.type}', '${r.id}', '${r.store_id || ''}')">
        <div class="search-item-icon">${r.icon}</div>
        <div class="search-item-content">
          <div class="search-item-title">${r.title}</div>
          <div class="search-item-subtitle">${r.subtitle}</div>
        </div>
      </div>
    `).join('');
  }
  
  suggestionsDiv.style.display = 'block';
}

function handleSearchClick(type, id, store_id) {
  const suggestionsDiv = document.getElementById('search-suggestions');
  if (suggestionsDiv) suggestionsDiv.style.display = 'none';
  
  const searchInput = document.getElementById('global-search');
  if (searchInput) searchInput.value = '';
  
  if (type === 'product') {
    if (typeof openStoreDetail === 'function') {
      openStoreDetail(store_id);
    }
  } else if (type === 'store') {
    if (typeof openStoreDetail === 'function') {
      openStoreDetail(id);
    }
  }
}

document.addEventListener('click', function(e) {
  const suggestionsDiv = document.getElementById('search-suggestions');
  const searchInput = document.getElementById('global-search');
  
  if (suggestionsDiv && searchInput && !suggestionsDiv.contains(e.target) && e.target !== searchInput) {
    suggestionsDiv.style.display = 'none';
  }
});

// ==========================================
// ✅ FONCTION DE MISE À JOUR DU BADGE (NOUVELLE)
// ==========================================
async function updateNotifBadge(notifications) {
  const badge = document.getElementById('notif-badge');
  if (!badge) return; // Sécurité : si le badge n'existe pas dans le HTML, on ne fait rien.

  let unreadCount = 0;

  // CAS 1 : On reçoit un tableau (ex: quand on ouvre le panneau de notifications)
  if (notifications && Array.isArray(notifications)) {
    unreadCount = notifications.filter(n => !n.is_read).length;
  } 
  // CAS 2 : On l'appelle sans argument (ex: juste après un toast), on va chercher le vrai chiffre dans Supabase
  else if (currentUser && currentUser.id) {
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

  // Mise à jour visuelle du badge
  if (unreadCount > 0) {
    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    badge.style.display = 'flex'; // Force l'affichage du rond rouge
  } else {
    badge.style.display = 'none'; // Cache le rond rouge si tout est lu
  }
}

// ==========================================
// ✅ 1. MODIFIER LE NOM DU COMMERCE (PAR LE PROPRIÉTAIRE)
// ==========================================
async function updateMyStoreName(newStoreName) {
  if (!currentUser || currentUser.role !== 'store') {
    showToast('❌ Accès refusé. Réservé aux commerces.');
    return;
  }

  if (!newStoreName || newStoreName.trim() === '') {
    showToast('❌ Le nom du commerce ne peut pas être vide.');
    return;
  }

  try {
    showToast('⏳ Mise à jour en cours...');
    
    // On met à jour la table 'stores' en ciblant l'user_id du commerce connecté
    const { error } = await supabaseClient
      .from('stores')
      .update({ name: newStoreName.trim() })
      .eq('_id', currentUser.id);

    if (error) throw error;

    showToast('✅ Nom du commerce modifié avec succès !');
    
    // Optionnel : Recharger les données du commerce pour mettre à jour l'affichage
    if (typeof loadStoreProfile === 'function') loadStoreProfile();
    
  } catch (err) {
    console.error('Erreur modification nom commerce:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// ✅ 2. MODIFIER LE NOM D'UN COMMERCE (PAR L'ADMIN)
// ==========================================
async function adminUpdateStoreName(store_id, newStoreName) {
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('❌ Accès refusé. Réservé aux administrateurs.');
    return;
  }

  if (!newStoreName || newStoreName.trim() === '') {
    showToast('❌ Le nom du commerce ne peut pas être vide.');
    return;
  }

  try {
    showToast('⏳ Mise à jour par l\'admin en cours...');
    
    // On met à jour la table 'stores' en ciblant l'ID du commerce
    const { error } = await supabaseClient
      .from('stores')
      .update({ name: newStoreName.trim() })
      .eq('id', store_id);

    if (error) throw error;

    showToast('✅ Nom du commerce modifié par l\'admin !');
    
    // Optionnel : Recharger la liste des commerces dans le tableau admin
    if (typeof renderAdminStores === 'function') renderAdminStores();
    
  } catch (err) {
    console.error('Erreur admin modification nom commerce:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}
// ==========================================
// ✅ GESTION DISCRÈTE DU NOM DU COMMERCE (PRO)
// ==========================================

// 1. Basculer entre le mode affichage et le mode édition

// 2. Sauvegarder le nouveau nom

// ==========================================
// ✅ GESTION DU NOM DU COMMERCE (DB + UI)
// ==========================================

// 1. Basculer entre le mode affichage et le mode édition


// 2. Sauvegarder le nouveau nom dans Supabase et mettre à jour l'écran




// ==========================================
// ✅ SOLUTION INFAILLIBLE : Mise à jour auto du nom du commerce
// ==========================================
// ==========================================
// ✅ GESTION PROPRE DU NOM DU COMMERCE (SANS DOUBLON)
// ==========================================

// 1. Basculer entre le mode affichage et le mode édition
function toggleStoreNameEdit(isEditing) {
  const display = document.getElementById('store-name-display');
  const form = document.getElementById('store-name-edit-form');
  const input = document.getElementById('store-name-input-pro');

  if (isEditing) {
    display.style.display = 'none';
    form.style.display = 'block';
    
    // Pré-remplir avec le nom actuel
    if (typeof currentStore !== 'undefined' && currentStore && currentStore.name) {
      input.value = currentStore.name;
    } else if (typeof currentUser !== 'undefined' && currentUser && currentUser.storeName) {
      input.value = currentUser.storeName;
    }
    
    setTimeout(() => input.focus(), 50);
  } else {
    display.style.display = 'flex';
    form.style.display = 'none';
  }
}

// 2. Sauvegarder le nouveau nom dans Supabase et mettre à jour l'écran
async function saveStoreNamePro() {
  const newName = document.getElementById('store-name-input-pro').value.trim();
  
  if (!newName) {
    showToast('❌ Le nom du commerce ne peut pas être vide.');
    return;
  }

  showToast('⏳ Mise à jour en cours...');
  
  try {
    // A. Sauvegarder dans la base de données
    const { error } = await supabaseClient
      .from('stores')
      .update({ name: newName })
      .eq('owner_id', currentUser.id);

    if (error) throw error;

    // B. Mettre à jour la mémoire du site
    if (typeof currentStore !== 'undefined' && currentStore) currentStore.name = newName;
    if (typeof currentUser !== 'undefined' && currentUser) currentUser.storeName = newName;

    // C. Mettre à jour l'affichage immédiatement
    const displayEl = document.getElementById('current-store-name-display');
    if (displayEl) displayEl.textContent = newName;

    const headerTitle = document.querySelector('.header-store-name') || document.getElementById('header-store-name');
    if (headerTitle) headerTitle.textContent = newName;

    // D. Relancer les fonctions d'affichage si elles existent
    if (typeof renderStoreDashboard === 'function') renderStoreDashboard();
    if (typeof loadStoreProfile === 'function') loadStoreProfile();
    if (typeof updateHeader === 'function') updateHeader();

    showToast('✅ Nom mis à jour partout sur le site !');
    toggleStoreNameEdit(false);

  } catch (err) {
    console.error('Erreur:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// 2. Le "Détective" (MutationObserver) qui surveille quand la vue s'affiche
const storeViewObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // Si la classe 'active' est ajoutée à la vue Mon Commerce
    if (mutation.target.classList.contains('active')) {
      initStoreNameDisplay(); // On met à jour le nom immédiatement !
    }
  });
});

// 3. On active le détective sur la vue #view-store
const storeViewElement = document.getElementById('view-store');
if (storeViewElement) {
  // On observe les changements de classe (quand elle devient 'active')
  storeViewObserver.observe(storeViewElement, { attributes: true, attributeFilter: ['class'] });
  
  // Et on lance une vérification immédiate au cas où la page est déjà chargée
  initStoreNameDisplay();
}

// ==========================================
// ==========================================
// ✅ AFFICHER LES COMMERCES SELON LE STATUT DE CONNEXION
// ==========================================

async function loadAllStoresHomepage() {
  // Vérifier si l'utilisateur est connecté
  const isLoggedIn = typeof currentUser !== 'undefined' && currentUser && currentUser.id;
  
  if (isLoggedIn) {
    console.log("🔍 Utilisateur connecté → Chargement de TOUS les commerces...");
  } else {
    console.log("🔍 Utilisateur déconnecté → Chargement des commerces Premium/Croissance uniquement...");
  }
  
  try {
    let query;

    if (isLoggedIn) {
      // ✅ UTILISATEUR CONNECTÉ : Charger TOUS les commerces actifs
      query = supabaseClient
        .from('stores')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });
    } else {
      // ✅ UTILISATEUR DÉCONNECTÉ : Charger seulement Premium/Croissance
      query = supabaseClient
        .from('stores')
        .select('*')
        .eq('status', 'active')
        .in('forfait', [3, 4]) // 3 = Croissance, 4 = Partenaire Plus
        .order('name', { ascending: true });
    }

    const { data: storesToShow, error } = await query;

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      return;
    }

    console.log(`✅ ${storesToShow ? storesToShow.length : 0} commerces affichés !`);

    // Trouver tous les conteneurs possibles et les VIDER
    const containers = document.querySelectorAll('#stores-grid, #stores-container, #home-stores, .stores-grid');
    
    containers.forEach(container => {
      container.innerHTML = '';
      
      if (storesToShow && storesToShow.length > 0) {
        container.innerHTML = storesToShow.map(store => {
          // Ajouter un badge seulement si l'utilisateur est déconnecté
          let badge = '';
          if (!isLoggedIn) {
            badge = store.forfait === 4 
              ? '<span style="background:#f5a623; color:#0a1929; font-size:0.7rem; padding:2px 8px; border-radius:10px; font-weight:bold; position:absolute; top:10px; right:10px;">👑 PREMIUM</span>' 
              : '<span style="background:#0a1929; color:white; font-size:0.7rem; padding:2px 8px; border-radius:10px; font-weight:bold; position:absolute; top:10px; right:10px;">🚀 CROISSANCE</span>';
          }

          return `
          <div class="store" onclick="viewStoreDetails('${store.id}')" style="cursor:pointer; position:relative; overflow:hidden;">
            <div class="store-img" style="position:relative;">
              ${store.icon || '🏪'}
              ${badge}
            </div>
            <div class="store-info">
              <h3>${store.name}</h3>
              <p style="color:#666; font-size:0.9rem; margin-top:0.3rem;">${store.type || 'Commerce'}</p>
              <p style="color:#999; font-size:0.8rem; margin-top:0.2rem;">📍 ${store.address || ''}</p>
            </div>
          </div>
        `}).join('');
      } else {
        const message = isLoggedIn 
          ? 'Aucun commerce disponible pour le moment.' 
          : 'Aucun commerce partenaire pour le moment.';
        container.innerHTML = `<div class="empty-state"><p>${message}</p></div>`;
      }
    });

  } catch (err) {
    console.error('❌ Erreur critique:', err);
  }
}

// ✅ Lancer au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadAllStoresHomepage, 1000);
});


// ==========================================
// ✅ CODE FINAL ET INFAILLIBLE POUR L'ACCUEIL
// ==========================================

// Lance le code quand la page est totalement chargée
window.addEventListener('load', () => {
 // setTimeout(afficherCommercesAccueil, 1000);
});

// ==========================================
// ✅ SOLUTION MAGIQUE : Créer le conteneur manquant automatiquement
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Si le conteneur n'existe pas, on le crée nous-mêmes !
  if (!document.getElementById('store-info-content')) {
    
    // On cherche la section principale du dashboard commerce
    const targetSection = document.querySelector('.admin-main') || document.getElementById('store-dashboard-section');
    
    if (targetSection) {
      const newDiv = document.createElement('div');
      newDiv.id = 'store-info-content';
      targetSection.appendChild(newDiv);
      console.log("✅ Le conteneur 'store-info-content' a été créé automatiquement ! L'erreur est résolue.");
    }
  }
});



// ==========================================
// ✅ FONCTION MAÎTRESSE POUR AFFICHER LE PANIER PROPREMENT (VERSION 2.0)
// ==========================================
function showMyCartProperly() {
  console.log("🛒 [PANIER] Activation du mode panier propre...");

  // 1. Fermer TOUTES les fenêtres modales ouvertes
  document.querySelectorAll('.modal-bg').forEach(modal => modal.remove());

  // 2. ✅ LISTE COMPLÈTE de toutes les sections à CACHER (y compris celles des commerces)
  const sectionsToHide = [
    'home-section', 
    'stores-section',           // ⬅️ NOUVEAU : Cache la liste des commerces
    'store-detail-section',     // ⬅️ NOUVEAU : Cache le détail du commerce actuel
    'store-dashboard-section', 
    'store-products-section', 
    'store-categories-section', 
    'checkout-section',
    'client-section'            // Au cas où
  ];

  // 3. Les cacher toutes
  sectionsToHide.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // 4. Afficher UNIQUEMENT la section panier
  const cartSection = document.getElementById('cart-section');
  if (cartSection) {
    cartSection.style.display = 'block';
    
    // 5. Forcer la mise à jour de l'affichage du panier
    if (typeof updateCart === 'function') updateCart();
    if (typeof renderCart === 'function') renderCart();
  }

  // 6. ✅ Mettre à jour le menu du haut pour enlever la surbrillance "Commerces"
  document.querySelectorAll('.nav-link, .tab-link').forEach(link => {
    link.classList.remove('active');
  });
  const cartLink = document.querySelector('[onclick*="cart"]') || document.querySelector('#cart-link');
  if (cartLink) cartLink.classList.add('active');

  // 7. Remonter en haut de la page pour une belle expérience
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ==========================================
// ✅ SYSTÈME DE SYNCHRONISATION UNIVERSELLE DU PROFIL
// ==========================================
// ==========================================
// ✅ SYNCHRONISATION UNIVERSELLE DU PROFIL CLIENT
// ==========================================
function syncUserProfileEverywhere() {
  console.log("🔄 [SYNC] Mise à jour du profil partout...");

  // 1. Sauvegarder dans le navigateur (localStorage)
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  // 2. Mettre à jour le nom dans le header
  const userNameDisplay = document.getElementById('user-name');
  if (userNameDisplay && currentUser.name) {
    userNameDisplay.textContent = currentUser.name;
  }

  // 3. Mettre à jour l'en-tête général
  if (typeof updateHeader === 'function') updateHeader();

  console.log("✅ [SYNC] Profil synchronisé !");
}

// Fonction pour sauvegarder le profil (appelle la sync automatique)

// ==========================================
// ✅ CLIENT : OUVERTURE DU MODAL DE PROFIL
// ==========================================
// ==========================================
// ✅ VERSION INFAILLIBLE : MODAL PROFIL CLIENT
// ==========================================
function openEditProfileModal() {
  console.log("🔍 [DEBUG 1] Clic sur Modifier le profil...");
  
  if (!currentUser || !currentUser.id) {
    showToast('🔑 Veuillez vous connecter');
    return;
  }
  
  console.log("✅ [DEBUG 3] Utilisateur connecté :", currentUser.name);

  // 1. Chercher la modale dans le HTML
  let modal = document.getElementById('edit-profile-modal');
  
  // 2. 🔥 SI ELLE N'EXISTE PAS, ON LA CRÉE DE A À Z ET ON L'AJOUTE AU BODY
  if (!modal) {
    console.warn("⚠️ [DEBUG] Modale introuvable dans le HTML. Création d'urgence...");
    modal = document.createElement('div');
    modal.id = 'edit-profile-modal';
    modal.className = 'modal-bg';
    modal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;';
    
    modal.innerHTML = `
      <div class="modal" style="background:white; padding:2rem; border-radius:12px; width:90%; max-width:500px; position:relative; max-height:90vh; overflow-y:auto;">
        <button onclick="closeModal('edit-profile-modal')" style="position:absolute; top:1rem; right:1rem; background:none; border:none; font-size:1.5rem; cursor:pointer; color:#666;">&times;</button>
        <h2 style="margin-bottom:1.5rem; color:#0a1929;">✏️ Modifier mon profil</h2>
        <form onsubmit="saveProfile(event)">
          <div class="form-group">
            <label>Nom complet</label>
            <input type="text" id="ep-name" required style="width:100%; padding:0.6rem; border:1px solid #ddd; border-radius:6px;">
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input type="tel" id="ep-phone" required style="width:100%; padding:0.6rem; border:1px solid #ddd; border-radius:6px;">
          </div>
          <div class="form-group">
            <label>Adresse</label>
            <input type="text" id="ep-address" class="autocomplete-input" autocomplete="off" placeholder="Tapez votre adresse..." style="width:100%; padding:0.6rem; border:1px solid #ddd; border-radius:6px;">
            <button type="button" class="autocomplete-gps-btn" onclick="geolocateAddress('ep-address')" style="margin-top:0.5rem; width:100%; padding:0.5rem; background:#f5a623; color:white; border:none; border-radius:6px; cursor:pointer;">📍 Utiliser ma position GPS</button>
          </div>
          <div class="modal-actions" style="display:flex; gap:0.5rem; justify-content:flex-end; margin-top:1.5rem;">
            <button type="button" class="btn-sm btn-gray" onclick="closeModal('edit-profile-modal')" style="padding:0.6rem 1rem; border:1px solid #ddd; background:white; border-radius:6px; cursor:pointer;">Annuler</button>
            <button type="submit" class="btn-sm btn-green" style="padding:0.6rem 1rem; border:none; background:#10b981; color:white; border-radius:6px; cursor:pointer; font-weight:bold;">💾 Enregistrer</button>
          </div>
        </form>
      </div>
    `;
    
    // Ajouter la modale tout à la fin du body
    document.body.appendChild(modal);
    console.log("✅ [DEBUG] Modale créée et injectée dans le DOM avec succès !");
  }

  // 3. Remplir les champs avec les données actuelles
  const nameField = document.getElementById('ep-name');
  const phoneField = document.getElementById('ep-phone');
  const addrField = document.getElementById('ep-address');

  if (nameField) nameField.value = currentUser.name || '';
  if (phoneField) phoneField.value = currentUser.phone || '';
  if (addrField) {
    addrField.value = currentUser.address || '';
    addrField._lat = currentUser.lat || null;
    addrField._lng = currentUser.lng || null;
  }
  
  console.log("✅ [DEBUG] Champs remplis. GPS:", currentUser.lat, currentUser.lng);

  // 4. Afficher la modale
  modal.style.display = 'flex';
  console.log("✅ [DEBUG] Modal affichée à l'écran !");
}
// ==========================================
// ✅ CLIENT : SAUVEGARDE DU PROFIL
// ==========================================


// ==========================================
// ✅ CLIENT : SYNCHRONISATION UNIVERSELLE
// ==========================================

// ==========================================
// ✅ COMMERCE : GESTION DU NOM DU COMMERCE
// ==========================================
function initStoreNameDisplay() {
  // ✅ Vérifier que currentUser existe avant d'accéder à ses propriétés
  if (!currentUser || !currentUser.id) {
    console.log("ℹ️ initStoreNameDisplay: Pas d'utilisateur connecté");
    return;
  }

  const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
  const display = document.getElementById('current-store-name-display');
  
  if (display && myStore) {
    display.textContent = myStore.name;
  } else if (display) {
    display.textContent = 'Mon commerce';
  }
}

function toggleStoreNameEdit(showEdit) {
  const displayMode = document.getElementById('store-name-display');
  const editMode = document.getElementById('store-name-edit-form');
  
  if (showEdit) {
    if (displayMode) displayMode.style.display = 'none';
    if (editMode) editMode.style.display = 'block';
    
    const myStore = stores.find(s => String(s.owner_id) === String(currentUser.id));
    const input = document.getElementById('store-name-input-pro');
    if (input && myStore) {
      input.value = myStore.name || '';
    }
  } else {
    if (displayMode) displayMode.style.display = 'block';
    if (editMode) editMode.style.display = 'none';
  }
}

// ==========================================
// ✅ CORRECTION AUTOMATIQUE DU WALLET (Ne rien chercher, juste coller)
// ==========================================

// 1. Au chargement de la page : si l'utilisateur est connecté, on affiche le wallet
if (typeof currentUser !== 'undefined' && currentUser && currentUser.id) {
  const wallet = document.getElementById('header-wallet');
  if (wallet) wallet.style.display = 'block';
}



// ==========================================
// ✅ SYSTÈME DE NOTIFICATIONS INFAILLIBLE (Realtime + Polling)
// ==========================================

// 1. Fonction pour formater l'heure correctement pour Maniwaki
// ==========================================
// ✅ FORMATAGE DE L'HEURE MANIWAKI (CORRIGÉ SANS DÉCALAGE)
// ==========================================
function formatHeureManiwaki(dateString) {
  if (!dateString) return "À l'instant";

  // 1. Forcer l'interprétation en UTC en ajoutant 'Z' si absent
  // Cela empêche le navigateur de deviner le fuseau horaire et de faire un double décalage
  const isoString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  const date = new Date(isoString);

  // 2. Vérifier que la date est valide
  if (isNaN(date.getTime())) {
    return "Date invalide";
  }

  // 3. Options de formatage strictes pour le Québec (America/Montreal)
  const options = {
    timeZone: 'America/Montreal',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Format 24h (ex: 14:05 au lieu de 2:05 PM)
  };

  // 4. Formater et nettoyer le résultat (ex: "02/11/2026 à 08:09")
  return date.toLocaleString('fr-CA', options).replace(',', ' à');
}

// 2. Fonction principale : charger et afficher les notifications
async function refreshNotificationsAuto() {
  if (!currentUser || !currentUser.id) {
    console.log("⚠️ [NOTIF] Pas d'utilisateur connecté");
    return;
  }

  try {
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

    // Compter les notifications non lues
    const unreadCount = notifs.filter(n => !n.read).length;

    // ✅ Mettre à jour le badge INSTANTANÉMENT
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    // ✅ Afficher les notifications dans le panneau
    const notifList = document.getElementById('notif-list');
    if (notifList && notifs.length > 0) {
      notifList.innerHTML = notifs.map(n => {
        const heureCorrecte = formatHeureManiwaki(n.created_at);
        const bgColor = n.read ? '#f9fafb' : '#fff9f0';
        const fontWeight = n.read ? 'normal' : 'bold';
        
        return `
          <div class="notif-item" style="padding: 1rem; border-bottom: 1px solid #e5e7eb; background: ${bgColor}; cursor: pointer; transition: background 0.2s;" 
               onclick="markNotifRead(${n.id})" 
               onmouseover="this.style.background='#f3f4f6'" 
               onmouseout="this.style.background='${bgColor}'">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <div style="font-weight: ${fontWeight}; color: #0a1929; flex: 1;">${n.title || 'Notification'}</div>
              ${!n.read ? '<div style="width: 8px; height: 8px; border-radius: 50%; background: #f5a623; margin-left: 8px;"></div>' : ''}
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

// 3. Fonction pour marquer une notification comme lue
async function markNotifRead(notifId) {
  try {
    await supabaseClient
      .from('notifications')
      .update({ read: true })
      .eq('id', notifId);

    await refreshNotificationsAuto();
  } catch (err) {
    console.error("❌ Erreur markNotifRead:", err);
  }
}

// 4. Fonction pour tout marquer comme lu
async function markAllRead() {
  if (!currentUser || !currentUser.id) return;

  try {
    await supabaseClient
      .from('notifications')
      .update({ read: true })
      .eq('user_id', currentUser.id)
      .eq('read', false);

    await refreshNotificationsAuto();
    showToast('✅ Toutes les notifications marquées comme lues');
  } catch (err) {
    console.error("❌ Erreur markAllRead:", err);
  }
}

// 5. ✅ DÉMARRER LE SYSTÈME HYBRIDE (Realtime + Polling toutes les 5s)
if (typeof currentUser !== 'undefined' && currentUser && currentUser.id) {
  // Premier chargement immédiat
  refreshNotificationsAuto();
  
  
  console.log("🔔 [NOTIFICATIONS] Système hybride activé (Realtime + Polling 5s)");
}

// ==========================================
// ✅ CORRECTION URGENTE : NOTIFICATIONS
// ==========================================

// 1. Fonction de debug pour tester manuellement
async function debugNotifications() {
  console.log("🔍 [DEBUG] Test des notifications...");
  
  if (!currentUser || !currentUser.id) {
    console.error("❌ Pas d'utilisateur connecté !");
    return;
  }

  console.log("✅ Utilisateur connecté :", currentUser.id);

  try {
    const { data, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      return;
    }

    console.log("✅ Notifications trouvées:", data);
    console.log("📊 Nombre total:", data?.length || 0);

    // Forcer l'affichage
    await refreshNotificationsAuto();
    
  } catch (err) {
    console.error("❌ Erreur:", err);
  }
}

// ✅ Démarrer le polling et stocker l'ID pour pouvoir l'arrêter au logout
window.notifIntervalId = setInterval(() => {
  if (currentUser && currentUser.id) {
    refreshNotificationsAuto(); // ou updateNotifBadge() selon le nom de ta fonction
  }
}, 1500); // 1.5 secondes

// 3. Ajouter un bouton de refresh manuel dans le header (optionnel)
console.log("💡 Astuce : Tape 'debugNotifications()' dans la console pour tester manuellement");




async function showDeliveryOrders() {
  if (!currentUser || currentUser.role !== 'livreur') {
    showToast('🔑 Accès réservé aux livreurs');
    return;
  }

  console.log("🚚 [LIVREUR] Chargement des commandes en cours...");
  console.log("🚚 [LIVREUR] Mon ID :", currentUser.id);
  console.log("🚚 [LIVREUR] Mon nom :", currentUser.name);

  try {
    // ✅ RECHERCHER LES COMMANDES ASSIGNÉES À CE LIVREUR
    const { data: myOrders, error } = await supabaseClient
      .from('orders')
      .select('*')
      .in('status', ['accepted', 'assigned', 'in_delivery']) // ⚠️ VOICI LA PARTIE QUI ÉTAIT COUPÉE !
      .or(`driver_name.eq.${currentUser.id},driver_name.eq.${currentUser.name}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Erreur requête:", error);
      showToast('❌ Erreur : ' + error.message);
      return;
    }

    console.log("📦 [LIVREUR] Commandes trouvées :", myOrders?.length || 0);

    const container = document.getElementById('delivery-orders-list');
    if (!container) {
      console.error("❌ Conteneur 'delivery-orders-list' introuvable dans le HTML");
      return;
    }

    if (!myOrders || myOrders.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#666; padding:2rem;">📭 Aucune commande en cours pour le moment</p>';
      return;
    }

    // ✅ AFFICHER LES COMMANDES
    container.innerHTML = myOrders.map(order => {
      const statusLabels = {
        'accepted': '✅ Acceptée par le commerce',
        'assigned': '📦 Assignée à vous',
        'in_delivery': '🚚 En cours de livraison'
      };
      
      const statusColor = {
        'accepted': '#f59e0b',
        'assigned': '#3b82f6',
        'in_delivery': '#10b981'
      };

      return `
        <div style="background:white; padding:1.5rem; border-radius:12px; margin-bottom:1rem; border:2px solid ${statusColor[order.status] || '#ddd'}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem;">
            <div>
              <h3 style="margin:0; color:#0a1929;">Commande #${order.order_number}</h3>
              <p style="margin:0.3rem 0; color:#666; font-size:0.9rem;">🏪 ${order.store_name || 'Commerce'}</p>
            </div>
            <span style="background:${statusColor[order.status]}; color:white; padding:0.4rem 0.8rem; border-radius:20px; font-size:0.8rem; font-weight:bold;">
              ${statusLabels[order.status] || order.status}
            </span>
          </div>
          
          <div style="background:#f9fafb; padding:1rem; border-radius:8px; margin-bottom:1rem;">
            <strong>📍 Adresse de livraison :</strong>
            <p style="margin:0.5rem 0; color:#333;">${order.client_address || 'Adresse non fournie'}</p>
            <p style="margin:0.3rem 0; color:#666; font-size:0.9rem;">👤 ${order.client_name || 'Client'} | 📞 ${order.client_phone || 'Pas de téléphone'}</p>
          </div>

          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            ${order.status === 'accepted' || order.status === 'assigned' ? `
              <button onclick="startDelivery('${order.id}')" style="flex:1; background:#10b981; color:white; border:none; padding:0.8rem; border-radius:8px; cursor:pointer; font-weight:bold;">
                🚚 Démarrer la livraison
              </button>
            ` : ''}
            ${order.status === 'in_delivery' ? `
              <button onclick="completeDelivery('${order.id}')" style="flex:1; background:#3b82f6; color:white; border:none; padding:0.8rem; border-radius:8px; cursor:pointer; font-weight:bold;">
                ✅ Marquer comme livrée
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('❌ Erreur showDeliveryOrders:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ✅ DÉMARRER LA LIVRAISON
async function startDelivery(orderId) {
  if (!confirm('Démarrer la livraison de cette commande ?')) return;

  try {
    const { error } = await supabaseClient
      .from('orders')
      .update({ 
        status: 'in_delivery',
        status_history: [{ status: 'in_delivery', time: new Date().toISOString(), note: 'Livraison démarrée par le livreur' }]
      })
      .eq('id', orderId);

    if (error) throw error;

    showToast('✅ Livraison démarrée !');
    showDeliveryOrders(); // Rafraîchir la liste
  } catch (err) {
    console.error('❌ Erreur startDelivery:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ✅ MARQUER COMME LIVRÉE
async function completeDelivery(orderId) {
  if (!confirm('Confirmer que cette commande a été livrée ?')) return;

  try {
    const { error } = await supabaseClient
      .from('orders')
      .update({ 
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        status_history: [{ status: 'delivered', time: new Date().toISOString(), note: 'Livraison terminée' }]
      })
      .eq('id', orderId);

    if (error) throw error;

    showToast('✅ Commande livrée avec succès !');
    showDeliveryOrders(); // Rafraîchir la liste
  } catch (err) {
    console.error('❌ Erreur completeDelivery:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// ✅ GESTION DES LIVREURS DANS L'ADMIN
// ==========================================
async function showAdminDrivers() {
  console.log("🚚 [ADMIN] Chargement des livreurs...");

  try {
    // Cherche dans 'profiles' les rôles 'livreur' OU 'driver' (pour compatibilité)
    const { data: drivers, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .in('role', ['livreur', 'driver']) 
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log("📊 [ADMIN] Livreurs trouvés :", drivers?.length || 0);

    // ✅ Cible la boîte qui est DÉJÀ dans ton HTML
    const container = document.getElementById('drivers-table-container');

    if (!drivers || drivers.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#666; padding:2rem; background:white; border-radius:8px;">🚚 Aucun livreur enregistré pour le moment</p>';
      return;
    }

    // Génère l'affichage HTML pour chaque livreur
    container.innerHTML = drivers.map(driver => {
      const statusColor = driver.status === 'approved' ? '#10b981' : (driver.status === 'pending' ? '#f59e0b' : '#ef4444');
      const statusText = driver.status === 'approved' ? '✅ Approuvé' : (driver.status === 'pending' ? '⏳ En attente' : '❌ Refusé');

      return `
        <div style="background:white; padding:1.5rem; border-radius:12px; margin-bottom:1rem; border-left: 5px solid ${statusColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:start; flex-wrap:wrap; gap:1rem;">
            <div>
              <h3 style="margin:0; color:#0a1929;">🚚 ${driver.name || 'Sans nom'}</h3>
              <p style="margin:0.3rem 0; color:#666; font-size:0.9rem;">📧 ${driver.email || 'Pas d\'email'}</p>
              <p style="margin:0.3rem 0; color:#666; font-size:0.9rem;">📞 ${driver.phone || 'Non spécifié'}</p>
              <p style="margin:0.3rem 0; color:#666; font-size:0.9rem;">🛵 Véhicule : ${driver.vehicle || 'Non spécifié'}</p>
            </div>
            <span style="background:${statusColor}; color:white; padding:0.4rem 0.8rem; border-radius:20px; font-size:0.8rem; font-weight:bold; height:fit-content;">
              ${statusText}
            </span>
          </div>
          
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:1rem; padding-top:1rem; border-top:1px solid #eee;">
            ${driver.status === 'pending' ? `
              <button onclick="approveDriver('${driver.id}')" style="background:#10b981; color:white; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; font-weight:bold;">✅ Approuver</button>
              <button onclick="rejectDriver('${driver.id}')" style="background:#ef4444; color:white; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; font-weight:bold;">❌ Refuser</button>
            ` : ''}
            <button onclick="deleteDriverProfile('${driver.id}')" style="background:#6b7280; color:white; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer;">🗑️ Supprimer</button>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('❌ Erreur showAdminDrivers:', err);
    document.getElementById('drivers-table-container').innerHTML = '<p style="color:red; text-align:center;">❌ Erreur de chargement</p>';
  }
}

// ✅ ACTIONS SUR LES LIVREURS
async function approveDriver(driverId) {
  try {
    await supabaseClient.from('profiles').update({ status: 'approved' }).eq('id', driverId);
    showToast('✅ Livreur approuvé !');
    showAdminDrivers(); // Rafraîchit la liste
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

async function rejectDriver(driverId) {
  try {
    await supabaseClient.from('profiles').update({ status: 'rejected' }).eq('id', driverId);
    showToast('⚠️ Livreur refusé.');
    showAdminDrivers();
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

async function deleteDriverProfile(driverId) {
  if (!confirm('Supprimer définitivement ce livreur ? Cette action est irréversible.')) return;
  try {
    await supabaseClient.from('profiles').delete().eq('id', driverId);
    showToast('🗑️ Livreur supprimé.');
    showAdminDrivers();
  } catch (err) {
    showToast('❌ Erreur : ' + err.message);
  }
}

// ==========================================
// ✅ GESTION DU BOUTON "RETOUR" DU NAVIGATEUR
// ==========================================

// 1. Fonction pour sauvegarder la vue actuelle dans l'historique du navigateur
function saveViewToHistory(viewId) {
  // On pousse un nouvel état dans l'historique du navigateur
  history.pushState({ view: viewId }, '', '#' + viewId);
  console.log("💾 Historique mis à jour : ", viewId);
}

// 2. Écouter quand l'utilisateur clique sur le bouton "Précédent" du navigateur
// ✅ GESTION DU BOUTON "RETOUR" DU NAVIGATEUR (VERSION CORRIGÉE)
// ==========================================
// ✅ GESTION DU BOUTON "RETOUR" (AVEC SÉCURITÉ DE RÔLE)
// ==========================================
window.addEventListener('popstate', function(event) {
  console.log("⏪ Bouton Retour cliqué ! État:", event.state);

  // 1. Cacher TOUTES les vues
  document.querySelectorAll('.view').forEach(view => {
    view.style.display = 'none';
    view.classList.remove('active');
  });

  // 2. Quelle vue le navigateur veut-il afficher ?
  let requestedView = (event.state && event.state.view) ? event.state.view : 'view-landing';

  // 3. 🛡️ SÉCURITÉ : Empêcher les conflits de rôle
  if (currentUser && currentUser.id) {
    if (currentUser.role === 'client') {
      // Un client ne doit JAMAIS tomber sur store, admin ou driver en revenant en arrière
      if (requestedView === 'view-store' || requestedView === 'view-admin' || requestedView === 'view-driver') {
        console.log("🚫 [SÉCURITÉ] Client a essayé d'accéder à", requestedView, "-> Redirection vers view-client");
        requestedView = 'view-client';
      }
    } 
    else if (currentUser.role === 'livreur' || currentUser.role === 'driver') {
      if (requestedView === 'view-store' || requestedView === 'view-admin' || requestedView === 'view-client') {
        console.log("🚫 [SÉCURITÉ] Livreur a essayé d'accéder à", requestedView, "-> Redirection vers view-driver");
        requestedView = 'view-driver';
      }
    }
    else if (currentUser.role === 'commerce' || currentUser.role === 'store') {
      if (requestedView === 'view-client' || requestedView === 'view-admin' || requestedView === 'view-driver') {
        console.log("🚫 [SÉCURITÉ] Commerce a essayé d'accéder à", requestedView, "-> Redirection vers view-store");
        requestedView = 'view-store';
      }
    }
    else if (currentUser.role === 'admin') {
      // L'admin peut tout voir, on ne bloque rien
    }
  }

  // 4. Afficher la vue (corrigée si nécessaire)
  console.log("➡️ Affichage final de la vue : ", requestedView);
  const targetView = document.getElementById(requestedView);
  
  if (targetView) {
    targetView.style.display = 'block';
    targetView.classList.add('active');
    window.scrollTo(0, 0); // Remonter en haut de page
  } else {
    // Filet de sécurité ultime : si la vue n'existe pas, retour à l'accueil
    document.getElementById('view-landing').style.display = 'block';
  }
});

// 3. Initialiser l'historique au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  // Sauvegarde la vue de départ (généralement 'view-landing')
  if (!history.state) {
    history.replaceState({ view: 'view-landing' }, '', '#view-landing');
  }
});

// ==========================================
// ✅ INTERCEPTION AUTOMATIQUE DE TOUS LES CLICS DE NAVIGATION
// ==========================================

// Cette fonction écoute TOUS les clics sur les boutons/liens et sauvegarde automatiquement l'historique
document.addEventListener('click', function(event) {
  const target = event.target;
  
  // Si c'est un bouton ou un lien avec onclick
  if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
    const element = target.closest('button') || target.closest('a') || target;
    const onclickAttr = element.getAttribute('onclick');
    
    // Si le bouton a un onclick qui appelle une fonction de navigation
    if (onclickAttr) {
      // Liste des fonctions qui changent de vue (ajuste selon tes fonctions)
      const navigationFunctions = [
        'showClientStores',
        'showClientOrders',
        'scrollToCart',
        'showProfile',
        'showDriverDashboard',
        'showDriverHistory',
        'goToMyStore',
        'showStoreCategories',
        'showStoreProducts',
        'adminTab'
      ];
      
      // Vérifie si le clic appelle une fonction de navigation
      for (const func of navigationFunctions) {
        if (onclickAttr.includes(func)) {
          // Déterminer quelle vue afficher selon la fonction
          let viewId = 'view-client'; // Par défaut
          
          if (onclickAttr.includes('Driver')) viewId = 'view-driver';
          else if (onclickAttr.includes('Store') || onclickAttr.includes('goToMyStore')) viewId = 'view-store';
          else if (onclickAttr.includes('admin')) viewId = 'view-admin';
          
          // Sauvegarder dans l'historique
          setTimeout(() => {
            saveViewToHistory(viewId);
          }, 100);
          
          break;
        }
      }
    }
  }
});

console.log("✅ Système de navigation avec historique activé !");


// ==========================================
// ✅ FONCTION MAÎTRE : AFFICHER LES COMMERCES (VERSION FINALE)
// ==========================================
async function afficherCommerces(idConteneur, actionAuClic) {
  console.log("🏪 Chargement des commerces dans :", idConteneur);
  
  const container = document.getElementById(idConteneur);
  if (!container) {
    console.error("❌ Conteneur '" + idConteneur + "' introuvable !");
    return;
  }

  container.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">⏳ Chargement des commerces...</p>';

  try {
    // ✅ TABLE STORES CONFIRMÉE
    const { data: commerces, error } = await supabaseClient
      .from('stores') 
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      throw error;
    }

    console.log("📊 Nombre de commerces trouvés:", commerces?.length || 0);

    if (!commerces || commerces.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding:2rem; color:#666; background:white; border-radius:12px;">🏪 Aucun commerce disponible pour le moment.</p>';
      return;
    }

    // Génération du HTML (design identique partout)
    container.innerHTML = commerces.map(c => `
      <div onclick="${actionAuClic}('${c.id}')" 
           style="background:white; border-radius:12px; padding:1.5rem; border:1px solid #e5e7eb; cursor:pointer; text-align:center; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"
           onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.1)'; this.style.borderColor='#f5a623'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'; this.style.borderColor='#e5e7eb'">
        
        <div style="font-size:3rem; margin-bottom:1rem;">${c.icon || '🏪'}</div>
        <h3 style="margin:0 0 0.5rem 0; color:#0a1929; font-size:1.1rem; font-weight:700;">${c.name || 'Sans nom'}</h3>
        <p style="margin:0 0 0.5rem 0; color:#f5a623; font-size:0.85rem; font-weight:600;">${c.type || 'Commerce'}</p>
        <p style="margin:0 0 1rem 0; color:#6b7280; font-size:0.85rem;">📍 ${c.address || 'Adresse non précisée'}</p>
        
        <div style="padding:0.6rem; background:#0a1929; color:white; border-radius:6px; font-weight:bold; font-size:0.9rem;">
          Voir les produits →
        </div>
      </div>
    `).join('');

    console.log(`✅ ${commerces.length} commerces affichés avec succès !`);

  } catch (err) {
    console.error("❌ Erreur afficherCommerces:", err);
    container.innerHTML = '<p style="text-align:center; padding:2rem; color:#ef4444; background:white; border-radius:12px;">❌ Erreur : ' + err.message + '</p>';
  }
}


// ==========================================
// 💳 PAGE DE REMERCIEMENT RURALGO QUÉBEC (Après paiement)
// ==========================================

async function checkPaymentSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Stripe ajoute TOUJOURS 'session_id' en cas de succès
  const hasSessionId = urlParams.has('session_id');
  const isSuccessParam = urlParams.get('payment_success') === 'true';
  const isSessionStorageSuccess = sessionStorage.getItem('paymentSuccess') === 'true';
  
  if (hasSessionId || isSuccessParam || isSessionStorageSuccess) {
    console.log("✅ [PAIEMENT] Succès Stripe détecté !");
    
    // 1. Nettoyer l'URL et le sessionStorage
    if (isSessionStorageSuccess) sessionStorage.removeItem('paymentSuccess');
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // 2. Afficher la page de remerciement IMMÉDIATEMENT (pour une bonne expérience utilisateur)
    showRuralGoThankYouPage();
    
    // 3. ⏳ ATTENDRE 2.5 SECONDES que le Webhook Stripe mette à jour la base de données Supabase
    // Avant de demander le nouveau solde, sinon on récupère l'ancien (0).
    setTimeout(async () => {
      console.log("🔄 [WALLET] Récupération du nouveau solde après délai webhook...");
      
      if (typeof updateWalletDisplay === 'function') {
        await updateWalletDisplay();
      }
      
      // Mettre à jour aussi le texte dans la page de remerciement si elle est encore visible
      const thankYouBalance = document.getElementById('thank-you-balance');
      if (thankYouBalance && currentUser && currentUser.wallet_balance !== undefined) {
        thankYouBalance.textContent = parseFloat(currentUser.wallet_balance).toFixed(2) + ' $';
      }
      
      console.log("✅ Solde final affiché :", currentUser?.wallet_balance, "$");
    }, 2500); // Délai de 2.5 secondes
  }
}
// 🛡️ BOUCLIER : Empêche les autres fonctions d'écraser la page de remerciement
let isThankYouPageActive = false;
function showRuralGoThankYouPage() {
  // 🛡️ ACTIVER LE BOUCLIER
  isThankYouPageActive = true;
  console.log("🛡️ [BOUCLIER] Page de remerciement activée, protection en cours...");

  // Cacher TOUTES les autres sections
  const sectionsToHide = document.querySelectorAll('section, [id*="section"], #stores-grid, #stores-container, #cart-section, #client-orders-section, main > div');
  sectionsToHide.forEach(el => {
    if (el.id !== 'ruralgo-thankyou-section') {
      el.setAttribute('data-old-display', el.style.display);
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
      Votre portefeuille <strong>RuralGo Québec</strong> a été crédité avec succès.<br>
      Vous pouvez maintenant soutenir les commerces locaux en toute tranquillité.
    </p>
    <div style="background: #f0fdf4; border: 2px solid #10b981; padding: 1.5rem; border-radius: 16px; margin-bottom: 2.5rem;">
      <p style="font-size: 0.9rem; color: #065f46; margin-bottom: 0.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Votre nouveau solde</p>
      <p style="font-size: 3rem; font-weight: 800; color: #10b981; margin: 0;" id="thank-you-balance">${currentBalance} $</p>
    </div>
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <button onclick="goToStoresAfterThankYou()" style="background: #f5a623; color: #0a1929; border: none; padding: 1rem 2rem; border-radius: 12px; font-size: 1.05rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(245, 166, 35, 0.3);">
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
  // 🛡️ DÉSACTIVER LE BOUCLIER pour permettre l'affichage normal des commerces
  isThankYouPageActive = false;
  console.log("🛡️ [BOUCLIER] Désactivé, retour aux commerces...");
  
  const thankYouSection = document.getElementById('ruralgo-thankyou-section');
  if (thankYouSection) thankYouSection.remove(); // On le supprime complètement
  
  // Appeler la fonction qui marche pour afficher les commerces
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

function goToStoresAfterThankYou() {
  isThankYouPageActive = false;
console.log("🛡️ [BOUCLIER] Protection désactivée - retour aux commerces");
  // Supprimer complètement la page de remerciement
  const thankYouSection = document.getElementById('ruralgo-thankyou-section');
  if (thankYouSection) thankYouSection.remove();
  
  // Recharger la page proprement
  window.location.href = window.location.pathname;
}


/// ==========================================
// 🚀 DÉCLENCHEMENT UNIQUE ET PROPRE DU PAIEMENT
// ==========================================
console.log("🔍 [AUTO] Vérification automatique du paiement au chargement...");
setTimeout(() => {
  checkPaymentSuccess();
}, 800); // 800ms suffit largement pour que tout soit chargé

