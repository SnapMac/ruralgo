// ==========================================
// 📋 FICHIER 01: CONFIGURATION SUPABASE
// ==========================================
// Rôle : Connexion + Variables globales + Paramètres
// Ce fichier doit être chargé EN PREMIER
// ==========================================

console.log("🔄 [01-config.js] Début du chargement...");

// ==========================================
// 🧹 NETTOYAGE PRÉVENTIF DU LOCALSTORAGE
// ==========================================
(function() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      if (!user || !user.id || !user.role) {
        console.warn("🧹 [NETTOYAGE] Ancien profil corrompu détecté. Suppression...");
        localStorage.removeItem('currentUser');
      }
    } catch (e) {
      console.error("🧹 [NETTOYAGE] Erreur de lecture, suppression...");
      localStorage.removeItem('currentUser');
    }
  }
})();

// ==========================================
// 🔌 CONNEXION À SUPABASE
// ==========================================
const SUPABASE_URL = 'https://shopfllntsigjmayqrre.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNob3BmbGxudHNpZ2ptYXlxcnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTE2OTMsImV4cCI6MjEwNjc4NzY5M30.O7ybJqVhqsGoyrnOYiJRo-zlg89Wa0wQLxP3xsD11wU';

if (typeof window.supabase === 'undefined') {
  console.error("❌ [01-config.js] ERREUR : La librairie Supabase n'est pas chargée !");
} else {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log("✅ [01-config.js] Connexion Supabase créée");
}

// ==========================================
// 🌍 CONSTANTES GÉOGRAPHIQUES
// ==========================================
const MANIWAKI_CENTER = [46.3767, -75.9653];
const DELIVERY_RADIUS_KM = 40;

// ==========================================
// 📦 VARIABLES GLOBALES (TOUTES)
// ==========================================
// ⚠️ IMPORTANT : Ces variables seront remplies par 02-data.js
let stores = [];
let categories = [];
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let clients = [];
let drivers = [];
let orders = [];
let notifications = [];

let currentUser = null;
let selectedAccountType = null;
let selectedStoreIcon = '';
let selectedCatIcon = '';
let selectedProdIcon = '';
let userPosition = null;
let autocompleteTimeout = null;
let userWalletBalance = 0;

// 🛡️ BOUCLIER PAGE DE REMERCIEMENT (DOIT ÊTRE DÉCLARÉ TÔT)
let isThankYouPageActive = false;

// Compteurs pour les IDs
let nextStoreId = 7;
let nextCatId = 31;
let nextProdId = 100;

// ==========================================
// ⚙️ PARAMÈTRES DE LA PLATEFORME
// ==========================================
let platformSettings = {
  deliveryBaseFee: 7.00,
  deliveryPerKm: 1.00,
  taxRate: 0.14975,
  driverCommission: 0.20,
  radius: 40
};

// ==========================================
// 🏷️ LABELS DE STATUT
// ==========================================
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

// ==========================================
// 🎨 TOUTES LES ICÔNES DISPONIBLES
// ==========================================
const allIcons = ['🛒','💊','🏪','🔨','🍞','🥩','🍽️','🏬','🥖','🧀','🍎','🥕','🌾','🛍️','🏠','⭐','🥛','🥚','🥬','🥫','🥤','🧴','🧼','🔧','🪛','🍗','🥓','🍊','🍚','🍟','🥐','🍰','📦','🚗','🛻','🍔','🍕','🍝','🌭','🥗','🍲','🍳','🍦','🍫','🍪','🍬','🥜','💧','☕','🍺','🍷','🐟','🥪','🥞','🥧','🍮','🪵','🚿','💡','🔌','🌱','💦','🎨','🖌️','🔩','📏','🪚','🪥','🩹','💉','🍼','👶','🚬'];

// ==========================================
// 👤 ADMIN PAR DÉFAUT
// ==========================================
const defaultAdmin = {
  id: 'admin',
  name: 'Administrateur',
  email: 'admin@ruralgo.ca',
  password: 'admin123',
  role: 'admin',
  phone: '(819) 000-0000',
  address: 'Maniwaki, QC',
  createdAt: new Date().toISOString()
};

// ==========================================
// ✅ FIN DU CHARGEMENT
// ==========================================
console.log("✅ [01-config.js] Configuration COMPLÈTE chargée avec succès !");
console.log("✅ supabaseClient est prêt");
console.log("✅ Variables globales initialisées");