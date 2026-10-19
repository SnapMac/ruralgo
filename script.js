;
// ==========================================
// CONNEXION À SUPABASE
// ==========================================
const SUPABASE_URL = 'https://shopfllntsigjmayqrre.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNob3BmbGxudHNpZ2ptYXlxcnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTE2OTMsImV4cCI6MjEwNjc4NzY5M30.O7ybJqVhqsGoyrnOYiJRo-zlg89Wa0wQLxP3xsD11wU';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const MANIWAKI_CENTER = [46.3767, -75.9653];
const DELIVERY_RADIUS_KM = 40;

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
  {id:1,storeId:1,categoryId:2,name:'Lait 2% 2L',desc:'Lait frais du Québec',price:4.99,icon:'🥛',available:true},
  {id:2,storeId:1,categoryId:4,name:'Pain tranché blanc',desc:'Pain frais du jour',price:3.49,icon:'🍞',available:true},
  {id:3,storeId:1,categoryId:2,name:'Douzaine d\'œufs',desc:'Œufs frais gros',price:5.29,icon:'🥚',available:true},
  {id:4,storeId:1,categoryId:2,name:'Fromage cheddar',desc:'Bloc 400g',price:7.99,icon:'🧀',available:true},
  {id:5,storeId:1,categoryId:1,name:'Pommes Gala 3lb',desc:'Pommes du Québec',price:6.49,icon:'🍎',available:true},
  {id:6,storeId:1,categoryId:1,name:'Carottes 2lb',desc:'Carottes fraîches',price:3.29,icon:'🥕',available:true},
  {id:7,storeId:1,categoryId:6,name:'Jus d\'orange 1.5L',desc:'100% pur jus',price:5.99,icon:'🍊',available:true},
  {id:8,storeId:1,categoryId:5,name:'Riz basmati 2kg',desc:'Riz importé',price:8.49,icon:'🍚',available:true},
  {id:30,storeId:1,categoryId:3,name:'Poitrine de poulet 1kg',desc:'Fraîche du jour',price:11.99,icon:'🍗',available:true},
  {id:31,storeId:1,categoryId:1,name:'Bananes (régime)',desc:'Par livre',price:0.79,icon:'🍌',available:true},
  {id:32,storeId:1,categoryId:1,name:'Tomates 2lb',desc:'Tomates de serre',price:4.49,icon:'🍅',available:true},
  {id:33,storeId:1,categoryId:7,name:'Pizza surgelée',desc:'Pepperoni',price:7.99,icon:'🍕',available:true},
  {id:34,storeId:1,categoryId:8,name:'Savon à vaisselle',desc:'Dawn 739ml',price:4.49,icon:'🧼',available:true},
  {id:35,storeId:1,categoryId:5,name:'Pâtes spaghetti 500g',desc:'Pâtes alimentaires',price:2.29,icon:'🍝',available:true},
  {id:36,storeId:1,categoryId:6,name:'Café régulier 300g',desc:'Café moulu',price:9.99,icon:'☕',available:true},
  {id:9,storeId:2,categoryId:10,name:'Acétaminophène 500mg',desc:'24 comprimés',price:8.99,icon:'💊',available:true},
  {id:10,storeId:2,categoryId:11,name:'Désinfectant mains',desc:'500ml',price:4.99,icon:'🧴',available:true},
  {id:11,storeId:2,categoryId:11,name:'Savon corporel',desc:'400ml Dove',price:6.49,icon:'🧼',available:true},
  {id:40,storeId:2,categoryId:10,name:'Ibuprofène 200mg',desc:'50 comprimés',price:12.99,icon:'💊',available:true},
  {id:41,storeId:2,categoryId:10,name:'Sirop pour la toux',desc:'100ml',price:11.49,icon:'🍯',available:true},
  {id:42,storeId:2,categoryId:11,name:'Shampooing',desc:'400ml Pantene',price:9.99,icon:'🧴',available:true},
  {id:43,storeId:2,categoryId:11,name:'Dentifrice',desc:'100ml Colgate',price:4.99,icon:'🪥',available:true},
  {id:44,storeId:2,categoryId:12,name:'Couches Pampers',desc:'Taille 3, 30 unités',price:16.99,icon:'👶',available:true},
  {id:45,storeId:2,categoryId:12,name:'Lait pour bébé',desc:'En poudre 680g',price:24.99,icon:'🍼',available:true},
  {id:46,storeId:2,categoryId:13,name:'Vitamine C 1000mg',desc:'90 comprimés',price:14.99,icon:'💉',available:true},
  {id:47,storeId:2,categoryId:13,name:'Multivitamines',desc:'Flacon 100 unités',price:19.99,icon:'💊',available:true},
  {id:48,storeId:2,categoryId:11,name:'Brosse à dents',desc:'Oral-B souple',price:5.49,icon:'🪥',available:true},
  {id:49,storeId:2,categoryId:10,name:'Pansements adhésifs',desc:'Boîte 40 unités',price:6.99,icon:'🩹',available:true},
  {id:12,storeId:3,categoryId:6,name:'Coca-Cola 2L',desc:'Boisson gazeuse',price:2.99,icon:'🥤',available:true},
  {id:13,storeId:3,categoryId:15,name:'Chips Lay\'s nature',desc:'235g',price:4.29,icon:'🍟',available:true},
  {id:50,storeId:3,categoryId:6,name:'Eau embouteillée 12 pack',desc:'500ml x 12',price:4.99,icon:'💧',available:true},
  {id:51,storeId:3,categoryId:15,name:'Barre chocolatée',desc:'Kit Kat',price:1.79,icon:'🍫',available:true},
  {id:52,storeId:3,categoryId:15,name:'Arachides salées',desc:'250g',price:3.99,icon:'🥜',available:true},
  {id:53,storeId:3,categoryId:16,name:'Crème glacée 2L',desc:'Vanille',price:6.99,icon:'🍦',available:true},
  {id:54,storeId:3,categoryId:16,name:'Esquimaux (boîte 8)',desc:'Barres glacées',price:7.49,icon:'🍡',available:true},
  {id:55,storeId:3,categoryId:6,name:'Café Tim Hortons',desc:'Moyen chaud',price:2.29,icon:'☕',available:true},
  {id:56,storeId:3,categoryId:6,name:'Red Bull 250ml',desc:'Boisson énergisante',price:3.49,icon:'🥫',available:true},
  {id:57,storeId:3,categoryId:15,name:'Bonbons',desc:'Sac 150g',price:2.99,icon:'🍬',available:true},
  {id:58,storeId:3,categoryId:6,name:'Jus Minute Maid',desc:'355ml',price:2.49,icon:'🧃',available:true},
  {id:59,storeId:3,categoryId:17,name:'Cigarettes (paquet)',desc:'Marque au choix',price:14.50,icon:'🚬',available:true},
  {id:60,storeId:3,categoryId:15,name:'Biscuits Oreo',desc:'154g',price:3.49,icon:'🍪',available:true},
  {id:17,storeId:4,categoryId:20,name:'Pizza pepperoni',desc:'Grand format 16 pouces',price:18.99,icon:'🍕',available:true},
  {id:18,storeId:4,categoryId:20,name:'Pâtes carbonara',desc:'Portion généreuse',price:14.99,icon:'🍝',available:true},
  {id:19,storeId:4,categoryId:21,name:'Salade César',desc:'Avec poulet grillé',price:12.99,icon:'🥗',available:true},
  {id:61,storeId:4,categoryId:20,name:'Lasagne italienne',desc:'Portion familiale',price:16.99,icon:'🍲',available:true},
  {id:62,storeId:4,categoryId:20,name:'Poulet parmesan',desc:'Servi avec pâtes',price:17.99,icon:'🍗',available:true},
  {id:63,storeId:4,categoryId:20,name:'Filet de saumon',desc:'Servi avec légumes',price:22.99,icon:'🐟',available:true},
  {id:64,storeId:4,categoryId:21,name:'Soupe du jour',desc:'Bol 12oz',price:5.99,icon:'🍜',available:true},
  {id:65,storeId:4,categoryId:21,name:'Ailes de poulet (12)',desc:'Sauce BBQ ou Buffalo',price:15.99,icon:'🍗',available:true},
  {id:66,storeId:4,categoryId:22,name:'Tiramisu',desc:'Part individuelle',price:7.99,icon:'🍰',available:true},
  {id:67,storeId:4,categoryId:22,name:'Crème brûlée',desc:'Part individuelle',price:6.99,icon:'🍮',available:true},
  {id:68,storeId:4,categoryId:6,name:'Vin rouge (bouteille)',desc:'Chianti italien',price:18.99,icon:'🍷',available:true},
  {id:69,storeId:4,categoryId:6,name:'Bière locale',desc:'600ml',price:7.99,icon:'🍺',available:true},
  {id:14,storeId:5,categoryId:23,name:'Hamburger classique',desc:'Bœuf, laitue, tomate',price:8.99,icon:'🍔',available:true},
  {id:15,storeId:5,categoryId:23,name:'Hot-dog',desc:'Classique avec moutarde',price:4.99,icon:'🌭',available:true},
  {id:16,storeId:5,categoryId:23,name:'Poutine',desc:'Frites, sauce, fromage',price:10.99,icon:'🍟',available:true},
  {id:70,storeId:5,categoryId:23,name:'Cheeseburger',desc:'Double viande, fromage',price:11.99,icon:'🍔',available:true},
  {id:71,storeId:5,categoryId:23,name:'Club sandwich',desc:'Poulet, bacon, laitue',price:12.99,icon:'🥪',available:true},
  {id:72,storeId:5,categoryId:23,name:'Nuggets de poulet (10)',desc:'Avec sauce',price:9.99,icon:'🍗',available:true},
  {id:73,storeId:5,categoryId:23,name:'Frites régulières',desc:'Portion moyenne',price:4.49,icon:'🍟',available:true},
  {id:74,storeId:5,categoryId:23,name:'Frites chargées',desc:'Bacon, fromage, sauce',price:8.99,icon:'🍟',available:true},
  {id:75,storeId:5,categoryId:22,name:'Crêpes (3)',desc:'Avec sirop d\'érable',price:6.99,icon:'🥞',available:true},
  {id:76,storeId:5,categoryId:22,name:'Pointe de tarte',desc:'Pommes ou bleuets',price:3.99,icon:'🥧',available:true},
  {id:77,storeId:5,categoryId:6,name:'Liqueur molle',desc:'2L',price:2.99,icon:'🥤',available:true},
  {id:78,storeId:5,categoryId:6,name:'Café régulier',desc:'Grand',price:2.49,icon:'☕',available:true},
  {id:20,storeId:6,categoryId:25,name:'Marteau 16oz',desc:'Manche en bois',price:15.99,icon:'🔨',available:true},
  {id:21,storeId:6,categoryId:25,name:'Tournevis set 6 pcs',desc:'Plat et cruciforme',price:19.99,icon:'🪛',available:true},
  {id:80,storeId:6,categoryId:25,name:'Scie à main',desc:'14 pouces',price:24.99,icon:'🪚',available:true},
  {id:81,storeId:6,categoryId:25,name:'Pince multiprise',desc:'10 pouces',price:12.99,icon:'🔧',available:true},
  {id:82,storeId:6,categoryId:25,name:'Mètre à ruban 25 pi',desc:'Stanley',price:14.99,icon:'📏',available:true},
  {id:83,storeId:6,categoryId:26,name:'Bois 2x4x8\'',desc:'Poteau de construction',price:6.99,icon:'🪵',available:true},
  {id:84,storeId:6,categoryId:26,name:'Plywood 4x8',desc:'1/2 pouce',price:45.99,icon:'🪵',available:true},
  {id:85,storeId:6,categoryId:27,name:'Tuyau PVC 10 pi',desc:'1.5 pouce',price:8.99,icon:'🚿',available:true},
  {id:86,storeId:6,categoryId:27,name:'Robinet de cuisine',desc:'Chrome',price:79.99,icon:'🚰',available:true},
  {id:87,storeId:6,categoryId:28,name:'Ampoule LED 60W',desc:'Pack de 4',price:12.99,icon:'💡',available:true},
  {id:88,storeId:6,categoryId:28,name:'Prolongateur électrique',desc:'25 pieds',price:19.99,icon:'🔌',available:true},
  {id:89,storeId:6,categoryId:29,name:'Terreau 25kg',desc:'Pour jardin',price:8.99,icon:'🌱',available:true},
  {id:90,storeId:6,categoryId:29,name:'Boyau d\'arrosage 50 pi',desc:'Avec embout',price:29.99,icon:'💦',available:true},
  {id:91,storeId:6,categoryId:30,name:'Peinture intérieure 4L',desc:'Blanc, latex',price:39.99,icon:'🎨',available:true},
  {id:92,storeId:6,categoryId:30,name:'Pinceau 2 pouces',desc:'Soies synthétiques',price:7.99,icon:'🖌️',available:true},
  {id:93,storeId:6,categoryId:25,name:'Perceuse sans fil',desc:'18V avec batterie',price:89.99,icon:'🔩',available:true}
];

let nextStoreId = 7, nextCatId = 31, nextProdId = 100;
let cart = [];
let clients = [], drivers = [], orders = [], notifications = [];
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
  return stores.find(s => s.id === product.storeId);
}

// ============ CHARGEMENT DEPUIS SUPABASE ============
async function load() {
  try {
    const { data: storesData } = await supabaseClient.from('stores').select('*');
    if (storesData && storesData.length > 0) stores = storesData;

    const { data: catsData } = await supabaseClient.from('categories').select('*');
    if (catsData && catsData.length > 0) categories = catsData;
    
const { data: prodsData } = await supabaseClient.from('products').select('*');
if (prodsData && prodsData.length > 0) {
  products = prodsData.map(p => ({
    ...p,
    storeId: p.store_id,
    categoryId: p.category_id
  }));
}

    const { data: clientsData } = await supabaseClient.from('profiles').select('*').eq('role', 'client');
    if (clientsData) {
      clients = clientsData.map(c => ({
        id: c.id, name: c.name, email: c.email || '', phone: c.phone,
        address: c.address, role: c.role, status: c.status, createdAt: c.created_at
      }));
    }

    const { data: driversData } = await supabaseClient.from('profiles').select('*').eq('role', 'driver');
    if (driversData) {
      drivers = driversData.map(d => ({
        id: d.id, name: d.name, email: d.email || '', phone: d.phone,
        vehicle: d.vehicle, role: d.role, status: d.status, createdAt: d.created_at
      }));
    }

    const { data: ordersData } = await supabaseClient.from('orders').select('*');
    if (ordersData) {
      orders = ordersData.map(o => ({
        id: o.id, orderNumber: o.order_number, clientId: o.client_id,
        clientName: o.client_name, clientPhone: o.client_phone,
        clientAddress: o.client_address, clientLat: o.client_lat, clientLng: o.client_lng,
        items: o.items || [], subtotal: o.subtotal || 0,
        deliveryBaseFee: o.delivery_base_fee || 7, deliveryDistanceKm: o.delivery_distance_km || 0,
        deliveryPerKmFee: o.delivery_per_km_fee || 0, deliveryFee: o.delivery_fee || 0,
        tax: o.tax || 0, total: o.total || 0, status: o.status,
        driverId: o.driver_id, driverName: o.driver_name,
        storeId: o.store_id, storeName: o.store_name,
        createdAt: o.created_at, statusHistory: o.status_history || []
      }));
    }

    const { data: settingsData } = await supabaseClient.from('settings').select('*').maybeSingle();
    if (settingsData) {
      platformSettings = {
        deliveryBaseFee: settingsData.delivery_base_fee || 7.00,
        deliveryPerKm: settingsData.delivery_per_km || 1.00,
        taxRate: settingsData.tax_rate || 0.14975,
        driverCommission: settingsData.driver_commission || 0.20,
        radius: settingsData.radius || 40
      };
    }

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
loadNotifications();
// ============ NOTIFICATIONS ============










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
  if (item.lat && item.lon) {
    input._lat = parseFloat(item.lat);
    input._lng = parseFloat(item.lon);
    userPosition = { lat: input._lat, lng: input._lng };
  }
  suggestions.classList.remove('show');
  showToast('✅ Adresse sélectionnée !');
  if (currentUser && currentUser.role === 'client') updateCart();
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

async function registerClient(e) {
  e.preventDefault();
  const email = document.getElementById('rc-email').value;
  const password = correctPassword(document.getElementById('rc-pass').value);
  const name = document.getElementById('rc-name').value;
  const phone = document.getElementById('rc-phone').value;
  const addressInput = document.getElementById('rc-address');

  const { data: authData, error: authError } = await supabaseClient.auth.signUp({
    email, password,
    options: { data: { name, role: 'client' } }
  });

  if (authError) {
    showToast('❌ Erreur: ' + authError.message);
    return;
  }

  await supabaseClient.from('profiles').insert({
    id: authData.user.id,
    role: 'client',
    name,
    phone,
    address: addressInput.value,
    lat: addressInput._lat || userPosition?.lat,
    lng: addressInput._lng || userPosition?.lng,
    status: 'approved'
  });

  currentUser = {
    id: authData.user.id, role: 'client', name, email, phone,
    address: addressInput.value,
    lat: addressInput._lat, lng: addressInput._lng,
    status: 'approved', createdAt: new Date().toISOString()
  };

  closeModal('register-client-modal');
  showUserInterface();
  showToast('✅ Bienvenue ' + name.split(' ')[0] + ' !');
}

function correctPassword(pass) {
  return typeof pass === 'string' ? pass : String(pass);
}

// ============ INSCRIPTION COMMERCE ============
// ============ INSCRIPTION COMMERCE (VERSION CORRIGÉE) ============
// ============ INSCRIPTION COMMERCE (VERSION AVEC TOAST AMÉLIORÉ) ============
async function registerStore(event) {
  event.preventDefault();
  
  // 1. Récupérer toutes les valeurs du formulaire
  const name = document.getElementById('rs-name').value.trim();
  const type = document.getElementById('rs-type').value;
  const owner = document.getElementById('rs-owner').value.trim();
  const email = document.getElementById('rs-email').value.trim();
  const pass = document.getElementById('rs-pass').value;
  const passConfirm = document.getElementById('rs-pass-confirm').value;
  const phone = document.getElementById('rs-phone').value.trim();
  const province = document.getElementById('rs-province').value;
  const address = document.getElementById('rs-address').value.trim();
  const forfait = document.getElementById('rs-forfait').value;
  
  // 2. Vérification du double mot de passe
  if (pass !== passConfirm) {
    showToast('❌ Les mots de passe ne correspondent pas');
    return;
  }
  
  if (pass.length < 6) {
    showToast('❌ Le mot de passe doit contenir au moins 6 caractères');
    return;
  }
  
  // 3. Vérification que tous les champs sont remplis
  if (!name || !type || !owner || !email || !phone || !address || !forfait) {
    showToast('❌ Veuillez remplir tous les champs obligatoires');
    return;
  }
  
  // 4. Créer le compte dans Supabase Auth
  try {
    showToast('📨 Envoi de votre demande en cours...');
    
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email: email,
      password: pass,
      options: {
        data: {
          role: 'store',
          name: owner
        }
      }
    });
    
    if (authError) throw authError;
    
    // 5. Créer le profil dans la table profiles
    const { error: profileError } = await supabaseClient.from('profiles').insert({
      id: authData.user.id,
      email: email,
      role: 'store',
      name: owner,
      phone: phone,
      status: 'pending'
    });
    
    if (profileError) throw profileError;
    
    // 6. Créer l'entrée dans la table stores
    const { error: storeError } = await supabaseClient.from('stores').insert({
      owner_id: authData.user.id,
      name: name,
      type: type,
      address: address,
      phone: phone,
      email: email,
      province: province,
      forfait: forfait,
      status: 'pending'
    });
    
    if (storeError) throw storeError;
    
    // 7. ✅ FERMER LE MODAL ET AFFICHER LE TOAST DE SUCCÈS
    closeModal('register-store-modal');
    
    // Toast bien visible avec message clair
    showToast('✅ Demande envoyée avec succès ! Votre commerce sera examiné par un administrateur. Vous recevrez une confirmation par courriel.');
    
    // 8. Réinitialiser le formulaire
    event.target.reset();
    
    // 9. Optionnel : Rediriger vers la page d'accueil après 3 secondes
    setTimeout(() => {
      showToast('🏠 Retour à la page d\'accueil...');
      goHome();
    }, 3000);
    
  } catch (error) {
    console.error('Erreur registerStore:', error);
    
    if (error.message && error.message.includes('already registered')) {
      showToast('❌ Cet email est déjà utilisé');
    } else {
      showToast('❌ Erreur : ' + (error.message || 'Erreur inconnue'));
    }
  }
}

async function registerDriver(e) {
  e.preventDefault();
  const email = document.getElementById('rd-email').value;
  const password = correctPassword(document.getElementById('rd-pass').value);
  const name = document.getElementById('rd-name').value;
  const phone = document.getElementById('rd-phone').value;
  const vehicle = document.getElementById('rd-vehicle').value;

  const { data: authData, error: authError } = await supabaseClient.auth.signUp({
    email, password,
    options: { data: { name, role: 'driver' } }
  });

  if (authError) { showToast('❌ Erreur: ' + authError.message); return; }

  await supabaseClient.from('profiles').insert({
    id: authData.user.id, role: 'driver', name, phone, vehicle, status: 'pending'
  });

  closeModal('register-driver-modal');
  showToast('📨 Demande envoyée ! En attente d\'approbation admin.');
}

async function loginUser(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass = correctPassword(document.getElementById('login-pass').value);

  if (email === 'admin@ruralgo.ca' && pass === 'admin123') {
    currentUser = {
      id: 'admin', name: 'Administrateur', email, role: 'admin',
      phone: '(819) 000-0000', address: 'Maniwaki, QC',
      createdAt: new Date().toISOString()
    };
    closeModal('login-modal');
    showUserInterface();
    showToast('✅ Bienvenue Admin !');
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
  if (error) { showToast('❌ Email ou mot de passe incorrect'); return; }

  const { data: profile, error: profileError } = await supabaseClient.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
  if (profileError || !profile) { showToast('❌ Profil introuvable'); return; }
  if (profile.role === 'driver' && profile.status === 'pending') { showToast('⏳ En attente d\'approbation'); return; }
  if (profile.role === 'driver' && profile.status === 'rejected') { showToast('❌ Demande refusée'); return; }

  currentUser = {
    id: profile.id, role: profile.role, name: profile.name, email: data.user.email,
    phone: profile.phone, address: profile.address, lat: profile.lat, lng: profile.lng,
    vehicle: profile.vehicle, status: profile.status, createdAt: profile.created_at
  };

  closeModal('login-modal');
  showUserInterface();
  showToast('✅ Bienvenue ' + currentUser.name.split(' ')[0] + ' !');
}

async function logout() {
  await supabaseClient.auth.signOut();
  currentUser = null;
  document.getElementById('auth-section').style.display = 'flex';
  document.getElementById('user-section').style.display = 'none';
  document.getElementById('nav-client').style.display = 'none';
  document.getElementById('nav-driver').style.display = 'none';
  document.getElementById('nav-admin').style.display = 'none';
  document.getElementById('notif-bell-container').style.display = 'none';
  switchView('view-landing');
  showToast('👋 Déconnexion');
}

function showUserInterface() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('user-section').style.display = 'flex';
  document.getElementById('notif-bell-container').style.display = 'block';
  const ini = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('user-avatar').textContent = ini;
  document.getElementById('user-name').textContent = currentUser.name.split(' ')[0];
  const labels = { client: '👤 Client', driver: '🚗 Livreur', admin: '⚙️ Admin' };
  document.getElementById('user-role').textContent = labels[currentUser.role];
  document.getElementById('nav-client').style.display = 'none';
  document.getElementById('nav-driver').style.display = 'none';
  document.getElementById('nav-admin').style.display = 'none';

  if (currentUser.role === 'client') {
    document.getElementById('nav-client').style.display = 'block';
    document.getElementById('client-firstname').textContent = currentUser.name.split(' ')[0];
    updateDeliveryAddress();
    switchView('view-client');
    showClientStores();
  } else if (currentUser.role === 'driver') {
    document.getElementById('nav-driver').style.display = 'block';
    document.getElementById('driver-firstname').textContent = currentUser.name.split(' ')[0];
    switchView('view-driver');
    showDriverDashboard();
  } else if (currentUser.role === 'admin') {
    document.getElementById('nav-admin').style.display = 'block';
    switchView('view-admin');
    renderAllAdmin();
  }
  updateNotifBadge();
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
    const count = products.filter(p => p.storeId === s.id && p.available).length;
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

function openStoreFromLanding(storeId) {
  if (!currentUser) {
    showToast('🔑 Connectez-vous pour voir les Commerces');
    setTimeout(() => openChooseTypeModal(), 1000);
    return;
  }
  openStoreDetail(storeId);
}

// ============ CLIENT - COMMERCE ============
function showClientStores() {
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'block';
  document.getElementById('store-detail-section').style.display = 'none';
  document.getElementById('client-orders-section').style.display = 'none';
  document.getElementById('client-order-detail-section').style.display = 'none';
  document.getElementById('client-profile-section').style.display = 'none';
  renderClientStores();
  setTimeout(() => document.getElementById('stores-section').scrollIntoView({ behavior: 'smooth' }), 200);
}

function renderClientStores() {
  const g = document.getElementById('stores-grid');
  const active = stores.filter(s => s.status === 'active');
  if (!active.length) {
    g.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏪</div><p>Aucun commerce</p></div>';
    return;
  }
  g.innerHTML = active.map(s => {
    const count = products.filter(p => p.storeId === s.id && p.available).length;
    const dist = userPosition ? calculateDistance(userPosition.lat, userPosition.lng, s.lat, s.lng) : null;
    return `<div class="store" onclick="openStoreDetail(${s.id})">
      <div class="store-img">${s.icon}</div>
      <div class="store-info">
        <h3>${s.name}</h3>
        <p style="color:#666;font-size:0.9rem">${s.type}</p>
        <p style="color:#999;font-size:0.85rem;margin-top:0.3rem">📍 ${s.address}</p>
        ${dist ? `<p style="color:#0284c7;font-size:0.85rem;margin-top:0.3rem;font-weight:bold">📏 ${dist.toFixed(1)} km de vous</p>` : ''}
        <p style="color:#0a1929;font-size:0.85rem;margin-top:0.3rem;font-weight:bold">📦 ${count} produit(s)</p>
      </div>
    </div>`;
  }).join('');
}

function openStoreDetail(storeId) {
  const store = stores.find(s => s.id === storeId);
  if (!store) return;
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('store-detail-section').style.display = 'block';
  const storeProducts = products.filter(p => p.storeId === storeId && p.available);
  const storeCats = [...new Set(storeProducts.map(p => p.categoryId))].map(cid => categories.find(c => c.id === cid)).filter(Boolean);
  let html = `<button class="back-btn" onclick="showClientStores()">← Retour</button>`;
  html += `<div class="store-detail-header">
    <div class="store-detail-icon">${store.icon}</div>
    <div class="store-detail-info">
      <h2>${store.name}</h2>
      <p>${store.type} • ${store.address}</p>
      <p>${storeProducts.length} produit(s) disponible(s)</p>
    </div>
  </div>`;
  if (storeCats.length > 0) {
    html += `<div class="categories-bar">
      <button class="cat-btn active" onclick="filterProducts(${storeId},'all',this)">🏷️ Tout (${storeProducts.length})</button>`;
    storeCats.forEach(c => {
      const catCount = storeProducts.filter(p => p.categoryId === c.id).length;
      html += `<button class="cat-btn" onclick="filterProducts(${storeId},${c.id},this)">${c.icon} ${c.name} (${catCount})</button>`;
    });
    html += `</div>`;
  }
  html += `<div class="products-grid" id="products-grid-detail"></div>`;
  document.getElementById('store-detail-content').innerHTML = html;
  renderStoreProducts(storeId, 'all');
}

function filterProducts(storeId, catId, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderStoreProducts(storeId, catId);
}

function renderStoreProducts(storeId, catId) {
  let prods = products.filter(p => p.storeId === storeId && p.available);
  if (catId !== 'all') prods = prods.filter(p => p.categoryId === catId);
  const g = document.getElementById('products-grid-detail');
  if (!prods.length) {
    g.innerHTML = '<div class="no-products"><p>😕 Aucun produit dans cette catégorie</p></div>';
    return;
  }
  g.innerHTML = prods.map(p => {
    const cat = categories.find(c => c.id === p.categoryId);
    return `<div class="product-card">
      <div class="product-card-img">${p.icon}</div>
      <div class="product-card-info">
        ${cat ? `<span style="display:inline-block;background:#f5f1e8;color:#5c3a21;padding:0.15rem 0.5rem;border-radius:10px;font-size:0.75rem;margin-bottom:0.5rem">${cat.icon} ${cat.name}</span>` : ''}
        <h4>${p.name}</h4>
        <p style="color:#666;font-size:0.85rem">${p.desc || ''}</p>
        <div class="product-price">${p.price.toFixed(2)} $</div>
        <button class="add-cart-btn" onclick="addToCart(${p.id})">🛒 Ajouter</button>
      </div>
    </div>`;
  }).join('');
}

function addToCart(prodId) {
  const p = products.find(x => x.id === prodId);
  if (!p) return;
  const ex = cart.find(c => c.productId === prodId);
  if (ex) ex.qty++;
  else cart.push({ productId: prodId, name: p.name, icon: p.icon, price: p.price, qty: 1 });
  updateCart();
  showToast('✅ ' + p.name + ' ajouté !');
}

// ============ MISE À JOUR DU PANIER AVEC FRAIS DYNAMIQUES ============
function updateCart() {
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

  if (store && currentUser && currentUser.lat && currentUser.lng && store.lat && store.lng) {
    deliveryInfo = calculateDeliveryFee(store.lat, store.lng, currentUser.lat, currentUser.lng);
  } else {
    deliveryInfo = { baseFee: baseFee, distanceKm: 0, perKmFee: 0, totalFee: baseFee };
  }

  if (store && currentUser && currentUser.lat && currentUser.lng) {
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
      <a onclick="showProfile()" style="color:#0a1929;font-weight:bold;cursor:pointer;text-decoration:underline">Modifier mon profil</a></p>
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
  document.getElementById('cart-section').style.display = 'none';
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
      storeId: o.store_id, storeName: o.store_name,
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

// ============ PLACEORDER - LA FONCTION QUI MANQUAIT ! ============
async function placeOrder() {
  if (!currentUser || currentUser.role !== 'client') {
    showToast('🔑 Connectez-vous pour commander');
    return;
  }
  if (cart.length === 0) {
    showToast('🛒 Votre panier est vide');
    return;
  }

  const store = getCurrentStore();
  if (!store) {
    showToast('❌ Commerce introuvable');
    return;
  }

  const deliveryInfo = calculateDeliveryFee(
    store.lat, store.lng,
    currentUser.lat, currentUser.lng
  );

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = subtotal * platformSettings.taxRate;
  const total = subtotal + deliveryInfo.totalFee + tax;

  const orderData = {
    order_number: 'RG' + Date.now().toString().slice(-6),
    client_id: currentUser.id,
    client_name: currentUser.name,
    client_phone: currentUser.phone,
    client_address: currentUser.address,
    client_lat: currentUser.lat,
    client_lng: currentUser.lng,
    items: cart.map(c => ({
      productId: c.productId,
      name: c.name,
      icon: c.icon,
      price: c.price,
      qty: c.qty
    })),
    subtotal: subtotal,
    delivery_base_fee: deliveryInfo.baseFee,
    delivery_distance_km: deliveryInfo.distanceKm,
    delivery_per_km_fee: deliveryInfo.perKmFee,
    delivery_fee: deliveryInfo.totalFee,
    tax: tax,
    total: total,
    status: 'pending',
    store_id: store.id,
    store_name: store.name,
    status_history: [{
      status: 'pending',
      time: new Date().toISOString(),
      note: 'Commande créée'
    }]
  };

  try {
    const { data: newOrder, error } = await supabaseClient
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;

    await addNotification('admin', '📦 Nouvelle commande',
      `Commande ${newOrder.order_number} de ${currentUser.name} - ${total.toFixed(2)}$`);

    cart = [];
    updateCart();
    showToast('✅ Commande passée avec succès !');
    showClientOrders();
  } catch (err) {
    console.error('Erreur placeOrder:', err);
    showToast('❌ Erreur : ' + err.message);
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

    await addNotification(currentUser.id, '❌ Commande annulée', `Votre commande ${order.orderNumber} a été annulée`);
    await addNotification('admin', '❌ Commande annulée', `Commande ${order.orderNumber} annulée par ${currentUser.name}`);

    showToast('❌ Commande annulée');
    showClientOrders();
  } catch (err) {
    console.error('Erreur:', err);
    showToast('❌ Erreur');
  }
}

// ============ PROFIL ============
function showProfile() {
  if (!currentUser) return;
  switchView('view-client');
  document.getElementById('stores-section').style.display = 'none';
  document.getElementById('store-detail-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('client-orders-section').style.display = 'none';
  document.getElementById('client-order-detail-section').style.display = 'none';
  document.getElementById('client-profile-section').style.display = 'block';
  renderProfile();
}

function renderProfile() {
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
    <button class="btn" style="margin-top:1rem" onclick="openEditProfile()">✏️ Modifier mon profil</button>
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

async function saveProfile(e) {
  e.preventDefault();
  const addrInput = document.getElementById('ep-address');
  currentUser.name = document.getElementById('ep-name').value;
  currentUser.phone = document.getElementById('ep-phone').value;
  currentUser.address = addrInput.value;
  if (addrInput._lat) currentUser.lat = addrInput._lat;
  if (addrInput._lng) currentUser.lng = addrInput._lng;

  try {
    await supabaseClient.from('profiles').update({
      name: currentUser.name,
      phone: currentUser.phone,
      address: currentUser.address,
      lat: currentUser.lat,
      lng: currentUser.lng
    }).eq('id', currentUser.id);

    if (currentUser.role === 'client') {
      const idx = clients.findIndex(c => c.id === currentUser.id);
      if (idx >= 0) clients[idx] = currentUser;
    } else if (currentUser.role === 'driver') {
      const idx = drivers.findIndex(d => d.id === currentUser.id);
      if (idx >= 0) drivers[idx] = currentUser;
    }

    closeModal('edit-profile-modal');
    showUserInterface();
    renderProfile();
    showToast('✅ Profil mis à jour !');
  } catch (err) {
    console.error('Erreur saveProfile:', err);
    showToast('❌ Erreur');
  }
}

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

    await addNotification(order.clientId, '🚗 Livreur assigné', `${currentUser.name} s'occupe de votre commande ${order.orderNumber}`);
    await addNotification('admin', '🚗 Commande assignée', `${order.orderNumber} → ${currentUser.name}`);

    showToast('✅ Commande acceptée !');
    renderDriverDashboard();
  } catch (err) {
    console.error('Erreur:', err);
    showToast('❌ Erreur');
  }
}

async function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  try {
    order.status = newStatus;
    order.statusHistory.push({ status: newStatus, time: new Date().toISOString(), note: `Mis à jour par ${currentUser.name}` });

    await supabaseClient.from('orders').update({
      status: newStatus,
      status_history: order.statusHistory
    }).eq('id', orderId);

    const messages = {
      'driver_to_store': '🛣️ En route vers le commerce',
      'at_store': '🏪 Arrivé au commerce',
      'picked_up': '📦 Commande récupérée',
      'driver_to_client': '🚗 En route vers vous',
      'delivered': '🏠 Livraison complétée !'
    };

    await addNotification(order.clientId, messages[newStatus] || 'Mise à jour', `Commande ${order.orderNumber}`);
    if (newStatus === 'delivered') {
      await addNotification('admin', '✅ Commande livrée', `${order.orderNumber} par ${currentUser.name}`);
    }

    showToast('✅ Statut mis à jour');
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
  const store = stores.find(s => s.id === order.storeId);

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

function renderAdminDashboard() {
  document.getElementById('stat-clients').textContent = clients.length;
  document.getElementById('stat-drivers').textContent = drivers.filter(d => d.status === 'approved').length;
  document.getElementById('stat-stores').textContent = stores.filter(s => s.status === 'active').length;
  document.getElementById('stat-orders').textContent = orders.length;
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
  document.getElementById('stat-revenue').textContent = totalRevenue.toFixed(2) + ' $';
  document.getElementById('stat-pending').textContent = orders.filter(o => ['pending','confirmed','searching_driver'].includes(o.status)).length;

  const recent = orders.slice(-5).reverse();
  const recentDiv = document.getElementById('admin-recent-orders');
  if (recent.length === 0) {
    recentDiv.innerHTML = '<div class="empty-state"><p>Aucune commande</p></div>';
  } else {
    recentDiv.innerHTML = `<table class="admin-table"><thead><tr><th>#</th><th>Client</th><th>Commerce</th><th>Livraison</th><th>Statut</th><th>Total</th></tr></thead><tbody>${recent.map(o => {
      const st = STATUS_LABELS[o.status];
      return `<tr><td>${o.orderNumber}</td><td>${o.clientName}</td><td>${o.storeName || '-'}</td><td>${o.deliveryFee.toFixed(2)}$ (${(o.deliveryDistanceKm || 0).toFixed(1)}km)</td><td><span class="status-badge ${st.class}">${st.label}</span></td><td><strong>${o.total.toFixed(2)} $</strong></td></tr>`;
    }).join('')}</tbody></table>`;
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

async function assignDriverModal(orderId) {
  const approvedDrivers = drivers.filter(d => d.status === 'approved');
  if (approvedDrivers.length === 0) { showToast('❌ Aucun livreur approuvé'); return; }
  const choice = prompt('Assigner au livreur :\n' + approvedDrivers.map((d, i) => `${i + 1}. ${d.name}`).join('\n') + '\nEntrez le numéro :');
  const idx = parseInt(choice) - 1;
  if (isNaN(idx) || !approvedDrivers[idx]) return;
  const order = orders.find(o => o.id === orderId);
  const driver = approvedDrivers[idx];

  try {
    order.driverId = driver.id;
    order.driverName = driver.name;
    order.status = 'driver_assigned';
    order.statusHistory.push({ status: 'driver_assigned', time: new Date().toISOString(), note: `Assigné par admin à ${driver.name}` });

    await supabaseClient.from('orders').update({
      driver_id: driver.id,
      driver_name: driver.name,
      status: 'driver_assigned',
      status_history: order.statusHistory
    }).eq('id', orderId);

    await addNotification(order.clientId, '🚗 Livreur assigné', `${driver.name} s'occupe de votre commande ${order.orderNumber}`);
    await addNotification(driver.id, '📦 Nouvelle mission', `Commande ${order.orderNumber} vous a été assignée (${order.deliveryFee.toFixed(2)}$ à gagner)`);

    showToast('✅ Livreur assigné !');
    renderAdminOrders();
  } catch (err) {
    console.error('Erreur:', err);
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

    await addNotification(order.clientId, '❌ Commande annulée', `Votre commande ${order.orderNumber} a été annulée par l'administration`);
    showToast('❌ Commande annulée');
    renderAdminOrders();
  } catch (err) {
    console.error('Erreur:', err);
    showToast('❌ Erreur');
  }
}

// ============ ADMIN - Commerces ============
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
        const prodCount = products.filter(p => p.storeId === s.id).length;
        
        // ✅ MODIFICATION ICI : on ajoute onclick et cursor:pointer sur le <tr>
        return `<tr onclick="viewStoreDetails(${s.id})" style="cursor:pointer">
          <td style="font-size:2rem;text-align:center">${s.icon}</td>
          <td><strong>${s.name}</strong></td>
          <td>${s.type}</td>
          <td style="font-size:0.9rem">${s.address}</td>
          <td><span class="badge badge-green">✅ Actif</span></td>
          <td>
            <div class="action-btns">
              <button class="action-btn btn-blue" onclick="event.stopPropagation(); editStore(${s.id})">✏️</button>
              <button class="action-btn btn-red" onclick="event.stopPropagation(); confirmDelete('store',${s.id})">🗑️</button>
            </div>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
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

function editStore(id) {
  const s = stores.find(x => x.id === id);
  if (!s) return;
  document.getElementById('store-modal-title').textContent = '✏️ Modifier';
  document.getElementById('store-id').value = s.id;
  document.getElementById('store-name').value = s.name;
  document.getElementById('store-type').value = s.type;
  document.getElementById('store-addr').value = s.address;
  document.getElementById('store-phone').value = s.phone || '';
  document.getElementById('store-status').value = s.status;
  selectedStoreIcon = s.icon;
  buildIconPicker('store-icon-picker', 'store-icon');
  setTimeout(() => {
    document.querySelectorAll('#store-icon-picker .icon-option').forEach(o => {
      if (o.dataset.icon === s.icon) o.classList.add('selected');
    });
    initAutocomplete('store-addr', 'store-addr-suggestions');
  }, 50);
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
    const count = products.filter(p => p.categoryId === cat.id).length;
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
    const s = stores.find(x => x.id === p.storeId);
    const cat = categories.find(x => x.id === p.categoryId);
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
  document.getElementById('prod-store').innerHTML = stores.map(s => `<option value="${s.id}" ${s.id === p.storeId ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('');
  document.getElementById('prod-category').innerHTML = categories.map(c => `<option value="${c.id}" ${c.id === p.categoryId ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('');
  buildIconPicker('prod-icon-picker', 'prod-icon');
  setTimeout(() => {
    document.querySelectorAll('#prod-icon-picker .icon-option').forEach(o => {
      if (o.dataset.icon === p.icon) o.classList.add('selected');
    });
  }, 50);
  openModal('product-modal');
}
async function saveProduct(e) {
  e.preventDefault();
  if (!selectedProdIcon && !document.getElementById('prod-icon').value) {
    showToast('⚠️ Choisissez une icône'); return;
  }
  const id = document.getElementById('prod-id').value;
  const prodData = {
    store_id: parseInt(document.getElementById('prod-store').value),           
    category_id: parseInt(document.getElementById('prod-category').value),
    name: document.getElementById('prod-name').value,
    description: document.getElementById('prod-desc').value,
    price: parseFloat(document.getElementById('prod-price').value),
    icon: document.getElementById('prod-icon').value || selectedProdIcon,
    available: document.getElementById('prod-available').value === 'true'
  };

  try {
    if (id) {
      await supabaseClient.from('products').update(prodData).eq('id', parseInt(id));
      const idx = products.findIndex(p => p.id === parseInt(id));
      products[idx] = { ...products[idx], ...prodData, storeId: prodData.store_id, categoryId: prodData.category_id };
      showToast('✅ Modifié !');
    } else {
      const { data: newProd, error } = await supabaseClient.from('products').insert(prodData).select().single();
      if (error) throw error;
      products.push({ ...newProd, storeId: newProd.store_id, categoryId: newProd.category_id });
      showToast('✅ Ajouté !');
    }
    closeModal('product-modal');
    renderAdminProducts();
    renderLandingStores(); // ✅ NOUVEAU : Met à jour la page d'accueil
  } catch (err) {
    console.error('Erreur saveProduct:', err);
    showToast('❌ Erreur : ' + err.message);
  }
}


// ============ ADMIN - CLIENTS ET LIVREURS ============
function renderAdminClients() {
  const c = document.getElementById('clients-table-container');
  if (!clients.length) { c.innerHTML = '<div class="empty-state"><p>Aucun client</p></div>'; return; }
  c.innerHTML = `<table class="admin-table"><thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Adresse</th><th>Commandes</th><th>Total</th></tr></thead><tbody>${clients.map(cl => {
    const myOrders = orders.filter(o => o.clientId === cl.id);
    const total = myOrders.reduce((s, o) => s + o.total, 0);
    return `<tr><td><strong>${cl.name}</strong></td><td>${cl.email}</td><td>${cl.phone}</td><td style="font-size:0.85rem">${cl.address}</td><td>${myOrders.length}</td><td><strong>${total.toFixed(2)} $</strong></td></tr>`;
  }).join('')}</tbody></table>`;
}

function renderAdminDrivers() {
  const c = document.getElementById('drivers-table-container');
  if (!drivers.length) { c.innerHTML = '<div class="empty-state"><p>Aucun livreur</p></div>'; return; }
  c.innerHTML = `<table class="admin-table"><thead><tr><th>Nom</th><th>Email</th><th>Véhicule</th><th>Livraisons</th><th>Statut</th><th>Actions</th></tr></thead><tbody>${drivers.map(d => {
    const myDel = orders.filter(o => o.driverId === d.id && o.status === 'delivered').length;
 return `<tr><td><strong>${d.name}</strong><br><span style="font-size:0.8rem;color:#666">${d.phone}</span></td><td>${d.email}</td><td>${d.vehicle}</td><td>${myDel}</td><td><span class="badge ${d.status === 'approved' ? 'badge-green' : d.status === 'pending' ? 'badge-yellow' : 'badge-red'}">${d.status === 'approved' ? '✅ Approuvé' : d.status === 'pending' ? '⏳ En attente' : '❌ Refusé'}</span></td><td><div class="action-btns">${d.status !== 'approved' ? `<button class="action-btn btn-green" onclick="approveDriver('${d.id}')">✅</button>` : ''}${d.status !== 'rejected' ? `<button class="action-btn btn-red" onclick="rejectDriver('${d.id}')">❌</button>` : ''}</div></td></tr>`;
  }).join('')}</tbody></table>`;
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
  if (!container) {
    console.log("⚠️ Erreur : Le conteneur 'pending-stores-container' est introuvable dans le HTML.");
    return;
  }

  console.log("🔄 Chargement des demandes de commerces en attente...");

  try {
    const { data, error } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('status', 'pending') // On cherche uniquement les commerces en attente
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Erreur Supabase :", error);
      throw error;
    }

    // 🕵️‍♂️ C'est la ligne magique : elle nous dira combien de commerces elle a trouvés
    console.log("✅ Données reçues de Supabase :", data); 

    if (!data || data.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;color:#666">Aucune demande en attente pour le moment.</div>';
      return;
    }

    container.innerHTML = data.map(store => `
      <div style="background:white;padding:1.5rem;border-radius:12px;margin-bottom:1rem;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:1rem;flex-wrap:wrap">
          <div style="flex:1;min-width:250px">
            <h4 style="color:#0a1929;margin:0 0 0.5rem">${store.name}</h4>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Type :</strong> ${store.type || 'Non spécifié'}</p>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Adresse :</strong> ${store.address || 'Non spécifiée'}</p>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Téléphone :</strong> ${store.phone || 'Non spécifié'}</p>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Email :</strong> ${store.email || 'Non spécifié'}</p>
            <p style="margin:0.3rem 0;color:#666;font-size:0.9rem"><strong>Forfait :</strong> ${store.forfait || 'Non spécifié'}</p>
            <p style="margin:0.3rem 0;color:#999;font-size:0.85rem">Demandé le : ${new Date(store.created_at).toLocaleDateString('fr-CA')}</p>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            <button class="btn-sm btn-green" onclick="approveStore('${store.id}')">✅ Approuver</button>
            <button class="btn-sm btn-red" onclick="rejectStore('${store.id}')">❌ Refuser</button>
          </div>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Erreur renderPendingStores:', error);
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:red">Erreur de chargement des données</div>';
  }
}

// Approuver un commerce
async function approveStore(id) {
  try {
    // Mettre à jour le statut dans la table stores
    const { error } = await supabaseClient
      .from('stores')
      .update({ status: 'active' })
      .eq('id', id);
    
    if (error) throw error;
    
    showToast('✅ Commerce approuvé !');
    renderPendingStores(); // Rafraîchir la liste
    
  } catch (error) {
    console.error('Erreur approveStore:', error);
    showToast('❌ Erreur : ' + error.message);
  }
}

// Refuser un commerce
async function rejectStore(id) {
  if (!confirm('Êtes-vous sûr de vouloir refuser cette demande ?')) return;
  
  try {
    // Mettre à jour le statut dans la table stores
    const { error } = await supabaseClient
      .from('stores')
      .update({ status: 'rejected' })
      .eq('id', id);
    
    if (error) throw error;
    
    showToast('❌ Commerce refusé');
    renderPendingStores(); // Rafraîchir la liste
    
  } catch (error) {
    console.error('Erreur rejectStore:', error);
    showToast('❌ Erreur : ' + error.message);
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

// ============ FONCTIONS UTILITAIRES ============
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

function pickIcon(containerId, hiddenId, el) {
  document.querySelectorAll('#' + containerId + ' .icon-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById(hiddenId).value = el.dataset.icon;
  if (containerId === 'store-icon-picker') selectedStoreIcon = el.dataset.icon;
  if (containerId === 'cat-icon-picker') selectedCatIcon = el.dataset.icon;
  if (containerId === 'prod-icon-picker') selectedProdIcon = el.dataset.icon;
}

function closeModal(id) { document.getElementById(id).classList.remove('show'); }
function openModal(id) { document.getElementById(id).classList.add('show'); }

document.querySelectorAll('.modal-bg').forEach(m => {
  m.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('show'); });
});

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}


// ============ FONCTION POUR LES FORFAITS COMMERCES ============

// ============ ANIMATIONS ============
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.feature-card, .step-card, .testimonial-card, .store, .stat-item').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
}
setTimeout(initScrollAnimations, 500);


// ============ DÉMARRAGE ============
window.addEventListener('load', async function() {
  await load();
  renderLandingStores();
  updateCart();
});

document.addEventListener('click', function(e) {
  const panel = document.getElementById('notif-panel');
  const bell = document.querySelector('.notif-bell');
  if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    panel.classList.remove('show');
  }
});

window.addEventListener('load', function() {
  setTimeout(function() { document.getElementById('page-loader').classList.add('hidden'); }, 1500);
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

    await addNotification(id, '✅ Compte approuvé', 'Bienvenue dans l\'équipe RuralGo ! Vous pouvez maintenant accepter des livraisons.', 'success');
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
      const count = products.filter(p => p.storeId === s.id && p.available).length;
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
function viewStoreDetails(id) {
  const store = stores.find(s => String(s.id) === String(id));
  if (!store) {
    showToast('❌ Commerce introuvable');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-bg show';
  modal.innerHTML = `
    <div class="modal" style="max-width:600px">
      <h2 style="color:#0a1929;margin-bottom:1.5rem">🏪 Détails du commerce</h2>
      <div style="background:#f5f1e8;padding:1.5rem;border-radius:12px">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
          <div style="font-size:4rem">${store.icon || '🏪'}</div>
          <div>
            <h3 style="margin:0;color:#0a1929">${store.name}</h3>
            <p style="margin:0.3rem 0;color:#666">${store.type || 'Non spécifié'}</p>
          </div>
        </div>
        <div style="display:grid;gap:1rem">
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
          <div style="background:white;padding:1rem;border-radius:8px">
            <strong>📊 Statut :</strong>
            <span class="badge ${store.status === 'active' ? 'badge-green' : store.status === 'pending' ? 'badge-orange' : 'badge-red'}">
              ${store.status === 'active' ? '✅ Actif' : store.status === 'pending' ? '⏳ En attente' : '❌ Inactif'}
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
// ============ SYSTÈME DE NOTIFICATIONS (VERSION FINALE) ============

async function addNotification(userId, title, message) {
  try {
    await supabaseClient.from('notifications').insert({
      user_id: String(userId),
      title: title,
      message: message,
      time: new Date().toISOString(),
      read: false
    });
    loadNotifications();
  } catch (e) {
    console.error('Erreur addNotification:', e);
  }
}

async function loadNotifications() {
  if (!currentUser) return;
  try {
    const { data, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', String(currentUser.id))
      .order('time', { ascending: false })
      .limit(20);
    if (error) throw error;
    
    const unreadCount = data.filter(n => !n.read).length;
    const badge = document.getElementById('notif-badge');
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
    renderNotifications(data);
  } catch (err) {
    console.error('Erreur loadNotifications:', err);
  }
}

function renderNotifications(notifs) {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (!notifs || notifs.length === 0) {
    list.innerHTML = '<div style="padding:1.5rem;text-align:center;color:#666">Aucune notification</div>';
    return;
  }
  list.innerHTML = notifs.map(n => {
    const date = new Date(n.time).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    return `<div class="notif-item ${n.read ? '' : 'unread'}" onclick="markAsRead('${n.id}')">
      <div style="flex:1">
        <div style="font-weight:bold;font-size:0.9rem">${n.title}</div>
        <div style="font-size:0.85rem;color:#666">${n.message}</div>
        <div style="font-size:0.75rem;color:#999;margin-top:0.2rem">${date}</div>
      </div>
    </div>`;
  }).join('');
}

async function markAsRead(id) {
  try {
    await supabaseClient.from('notifications').update({ read: true }).eq('id', id);
    loadNotifications();
  } catch (err) {
    console.error('Erreur markAsRead:', err);
  }
}

async function markAllRead() {
  if (!currentUser) return;
  try {
    await supabaseClient.from('notifications').update({ read: true }).eq('user_id', String(currentUser.id));
    loadNotifications();
    showToast('✅ Toutes marquées comme lues');
  } catch (err) {
    console.error('Erreur markAllRead:', err);
  }
}

function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (panel) {
    panel.classList.toggle('show');
    if (panel.classList.contains('show')) {
      loadNotifications();
    }
  }
}

function updateNotifBadge() {
  // Cette fonction est maintenant gérée par loadNotifications
}