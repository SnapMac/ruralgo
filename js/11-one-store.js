// ==========================================
// 🛒 RÈGLE : UN SEUL COMMERCE PAR COMMANDE
// ==========================================
(function () {
  let commerceVerrouille = null; // l'id du commerce actuellement dans le panier

  // 🔓 Exposés pour les autres fichiers (pour l'effet visuel "grisé")
  window.getCommerceVerrouille = () => commerceVerrouille;
  window.resetCommerceVerrouille = () => { commerceVerrouille = null; };

  // --- Trouve le produit (peu importe où il est rangé) ---
  function trouverProduit(id) {
    if (typeof products !== 'undefined' && Array.isArray(products)) {
      const p = products.find(x => String(x.id) === String(id));
      if (p) return p;
    }
    if (Array.isArray(window.currentStoreProducts)) {
      const p = window.currentStoreProducts.find(x => String(x.id) === String(id));
      if (p) return p;
    }
    return null;
  }

  // --- Nom du commerce (pour un beau message) ---
  function nomCommerce(id) {
    if (typeof stores !== 'undefined' && Array.isArray(stores)) {
      const s = stores.find(x => String(x.id) === String(id));
      if (s) return s.name;
    }
    return 'un autre commerce';
  }

  // --- Le panier est-il vide ? (on lit le compteur du menu 🛒) ---
  function panierVide() {
    const el = document.getElementById('cart-count');
    if (el) {
      const n = parseInt(el.textContent, 10);
      if (!isNaN(n)) return n === 0;
    }
    if (typeof cart !== 'undefined' && Array.isArray(cart)) return cart.length === 0;
    return false;
  }

  // --- On entoure addToCart sans le modifier ---
  const addToCartOriginal = window.addToCart;
  if (typeof addToCartOriginal !== 'function') {
    console.warn('⚠️ [11-one-store] addToCart introuvable, règle non appliquée.');
    return;
  }

  window.addToCart = function (product_id) {
    // Si le panier a été vidé, on libère le verrou
    if (panierVide()) {
      window.resetCommerceVerrouille();
    }

    const p = trouverProduit(product_id);
    const storeId = p && p.store_id != null ? String(p.store_id) : null;

    // 🚫 Mauvais commerce → on bloque
    if (commerceVerrouille && storeId && storeId !== commerceVerrouille) {
      if (typeof showToast === 'function') {
        showToast('❌ Un seul commerce par commande');
      }
      alert(
        '🛒 Votre panier contient déjà des articles de :\n\n🏪 ' +
        nomCommerce(commerceVerrouille) +
        '\n\nVous ne pouvez commander que dans UN SEUL commerce à la fois.\n\n' +
        '👉 Videz votre panier si vous voulez commander chez ' + nomCommerce(storeId) + '.'
      );
      return; // ⛔ on n'ajoute PAS
    }

    // ✅ Premier article (ou même commerce) → on autorise
    if (storeId) commerceVerrouille = storeId;
    return addToCartOriginal.apply(this, arguments);
  };

  // --- Après une commande réussie, on libère le verrou ---
  const placeOrderOriginal = window.placeOrder;
  if (typeof placeOrderOriginal === 'function') {
    window.placeOrder = async function () {
      const resultat = await placeOrderOriginal.apply(this, arguments);
      window.resetCommerceVerrouille(); // 🔓 Utilisation de la fonction exposée
      return resultat;
    };
  }

  console.log('✅ [11-one-store] Règle "1 commerce par commande" activée.');
})();