// ==========================================
// 📦 FICHIER 02 : DONNÉES PAR DÉFAUT
// ==========================================
// Rôle : Données initiales (commerces, catégories, produits)
// Ces données seront remplacées par Supabase au chargement
// ==========================================

console.log("🔄 [02-data.js] Chargement des données par défaut...");

// ==========================================
// 🏪 COMMERCES PAR DÉFAUT
// ==========================================
stores = [
  {id:1, icon:'🛒', name:'Épicerie Générale du Haut-Pays', type:'Épicerie', address:'100 rue Principale, Maniwaki, QC', phone:'(819) 449-1234', status:'active', lat:46.3770, lng:-75.9650},
  {id:2, icon:'💊', name:'Pharmacie Maniwaki', type:'Pharmacie', address:'45 boulevard des Cascades, Maniwaki, QC', phone:'(819) 449-5678', status:'active', lat:46.3785, lng:-75.9580},
  {id:3, icon:'🏪', name:'Dépanneur Central', type:'Dépanneur', address:'78 avenue de la Gare, Maniwaki, QC', phone:'(819) 449-9012', status:'active', lat:46.3755, lng:-75.9630},
  {id:4, icon:'🍽️', name:'Restaurant Le Maniwaki', type:'Restaurant', address:'55 rue Principale, Maniwaki, QC', phone:'(819) 449-3456', status:'active', lat:46.3850, lng:-75.9450},
  {id:5, icon:'🍔', name:'Casse-Croûte du Village', type:'Restaurant', address:'15 rue Saint-Joseph, Maniwaki, QC', phone:'(819) 449-7890', status:'active', lat:46.3745, lng:-75.9700},
  {id:6, icon:'🏬', name:'Quincaillerie & Matériaux Gagné', type:'Autres', address:'88 rue Principale, Maniwaki, QC', phone:'(819) 449-2345', status:'active', lat:46.3760, lng:-75.9660}
];

// ==========================================
// 📂 CATÉGORIES PAR DÉFAUT
// ==========================================
categories = [
  {id:1, name:'Fruits et légumes', icon:'🥬'},
  {id:2, name:'Produits laitiers', icon:'🥛'},
  {id:3, name:'Viandes et poissons', icon:'🥩'},
  {id:4, name:'Pain et boulangerie', icon:'🍞'},
  {id:5, name:'Épicerie sèche', icon:'🥫'},
  {id:6, name:'Boissons', icon:'🥤'},
  {id:7, name:'Surgelés', icon:'🧊'},
  {id:8, name:'Entretien ménager', icon:'🧹'},
  {id:10, name:'Médicaments', icon:'💊'},
  {id:11, name:'Soins personnels', icon:'🧴'},
  {id:12, name:'Bébés', icon:'👶'},
  {id:13, name:'Vitamines', icon:'💉'},
  {id:15, name:'Collations', icon:'🍿'},
  {id:16, name:'Glaces', icon:'🍦'},
  {id:17, name:'Tabac', icon:'🚬'},
  {id:20, name:'Plats principaux', icon:'🍲'},
  {id:21, name:'Entrées', icon:'🥗'},
  {id:22, name:'Desserts', icon:'🍰'},
  {id:23, name:'Restauration rapide', icon:'🍟'},
  {id:25, name:'Outils', icon:'🔧'},
  {id:26, name:'Matériaux', icon:'🪵'},
  {id:27, name:'Plomberie', icon:'🚿'},
  {id:28, name:'Électricité', icon:'💡'},
  {id:29, name:'Jardinage', icon:'🌱'},
  {id:30, name:'Peinture', icon:'🎨'}
];

// ==========================================
// 🛍️ PRODUITS PAR DÉFAUT
// ==========================================
products = [
  {id:1, store_id:1, category_id:2, name:'Lait 2% 2L', desc:'Lait frais du Québec', price:4.99, icon:'🥛', available:true},
  {id:2, store_id:1, category_id:4, name:'Pain tranché blanc', desc:'Pain frais du jour', price:3.49, icon:'🍞', available:true},
  {id:3, store_id:1, category_id:2, name:'Douzaine d\'œufs', desc:'Œufs frais gros', price:5.29, icon:'🥚', available:true},
  {id:4, store_id:1, category_id:2, name:'Fromage cheddar', desc:'Bloc 400g', price:7.99, icon:'🧀', available:true},
  {id:5, store_id:1, category_id:1, name:'Pommes Gala 3lb', desc:'Pommes du Québec', price:6.49, icon:'🍎', available:true},
  {id:6, store_id:1, category_id:1, name:'Carottes 2lb', desc:'Carottes fraîches', price:3.29, icon:'🥕', available:true},
  {id:7, store_id:1, category_id:6, name:'Jus d\'orange 1.5L', desc:'100% pur jus', price:5.99, icon:'🍊', available:true},
  {id:8, store_id:1, category_id:5, name:'Riz basmati 2kg', desc:'Riz importé', price:8.49, icon:'🍚', available:true},
  {id:30, store_id:1, category_id:3, name:'Poitrine de poulet 1kg', desc:'Fraîche du jour', price:11.99, icon:'🍗', available:true},
  {id:31, store_id:1, category_id:1, name:'Bananes (régime)', desc:'Par livre', price:0.79, icon:'🍌', available:true},
  {id:32, store_id:1, category_id:1, name:'Tomates 2lb', desc:'Tomates de serre', price:4.49, icon:'🍅', available:true},
  {id:33, store_id:1, category_id:7, name:'Pizza surgelée', desc:'Pepperoni', price:7.99, icon:'🍕', available:true},
  {id:34, store_id:1, category_id:8, name:'Savon à vaisselle', desc:'Dawn 739ml', price:4.49, icon:'🧼', available:true},
  {id:35, store_id:1, category_id:5, name:'Pâtes spaghetti 500g', desc:'Pâtes alimentaires', price:2.29, icon:'🍝', available:true},
  {id:36, store_id:1, category_id:6, name:'Café régulier 300g', desc:'Café moulu', price:9.99, icon:'☕', available:true},
  {id:9, store_id:2, category_id:10, name:'Acétaminophène 500mg', desc:'24 comprimés', price:8.99, icon:'💊', available:true},
  {id:10, store_id:2, category_id:11, name:'Désinfectant mains', desc:'500ml', price:4.99, icon:'🧴', available:true},
  {id:11, store_id:2, category_id:11, name:'Savon corporel', desc:'400ml Dove', price:6.49, icon:'🧼', available:true},
  {id:12, store_id:3, category_id:6, name:'Coca-Cola 2L', desc:'Boisson gazeuse', price:2.99, icon:'🥤', available:true},
  {id:13, store_id:3, category_id:15, name:'Chips Lay\'s nature', desc:'235g', price:4.29, icon:'🍟', available:true},
  {id:14, store_id:5, category_id:23, name:'Hamburger classique', desc:'Bœuf, laitue, tomate', price:8.99, icon:'🍔', available:true},
  {id:15, store_id:5, category_id:23, name:'Hot-dog', desc:'Classique avec moutarde', price:4.99, icon:'🌭', available:true},
  {id:16, store_id:5, category_id:23, name:'Poutine', desc:'Frites, sauce, fromage', price:10.99, icon:'🍟', available:true},
  {id:17, store_id:4, category_id:20, name:'Pizza pepperoni', desc:'Grand format 16 pouces', price:18.99, icon:'🍕', available:true},
  {id:18, store_id:4, category_id:20, name:'Pâtes carbonara', desc:'Portion généreuse', price:14.99, icon:'🍝', available:true},
  {id:19, store_id:4, category_id:21, name:'Salade César', desc:'Avec poulet grillé', price:12.99, icon:'🥗', available:true},
  {id:20, store_id:6, category_id:25, name:'Marteau 16oz', desc:'Manche en bois', price:15.99, icon:'🔨', available:true},
  {id:21, store_id:6, category_id:25, name:'Tournevis set 6 pcs', desc:'Plat et cruciforme', price:19.99, icon:'🪛', available:true}
];

// ==========================================
// 🔢 COMPTEURS POUR NOUVEAUX IDs
// ==========================================
// ✅ CORRIGÉ (sans let) :
nextStoreId = 7;
nextCatId = 31;
nextProdId = 100;
// ==========================================
// ✅ FIN DU CHARGEMENT
// ==========================================
console.log("✅ [02-data.js] Données par défaut chargées :");
console.log("   - " + stores.length + " commerces");
console.log("   - " + categories.length + " catégories");
console.log("   - " + products.length + " produits");