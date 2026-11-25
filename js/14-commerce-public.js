// ==========================================
// 🏪 FICHIER 14 : PAGE COMMERCE PUBLIQUE
// ==========================================
// Rôle : ouvrir un commerce public à partir
// de son slug dans l'URL.
// ==========================================

(function () {
  function showCommerceNotFound(slug) {
    if (typeof showToast === "function") {
      showToast("❌ Commerce introuvable");
    }

    const publicRoot = document.getElementById("commerce-public-root");

    if (publicRoot) {
      publicRoot.innerHTML = `
        <div style="max-width:700px; margin:3rem auto; background:white; padding:2rem; border-radius:12px; text-align:center;">
          <div style="font-size:3rem; margin-bottom:1rem;">🏪</div>
          <h2 style="color:#0a1929; margin-bottom:0.5rem;">Commerce introuvable</h2>
          <p style="color:#6b7280;">
            Aucun commerce ne correspond au slug :
            <strong>${slug || "inconnu"}</strong>
          </p>
        </div>
      `;
    }
  }

  async function openCommerceBySlug(slug) {
    if (!slug) return;

    if (typeof supabaseClient === "undefined") {
      console.warn("⚠️ [14-commerce-public] supabaseClient non disponible.");
      return;
    }

    try {
      const { data: store, error } = await supabaseClient
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("❌ [14-commerce-public] Erreur Supabase :", error);
        showCommerceNotFound(slug);
        return;
      }

      if (!store) {
        showCommerceNotFound(slug);
        return;
      }

      console.log("✅ [14-commerce-public] Commerce trouvé :", store.name);

      // Use the existing client-side store detail view if available.
      if (typeof switchView === "function") {
        switchView("view-client");
      }

      if (typeof openStoreDetail === "function") {
        openStoreDetail(store.id);
        return;
      }

      // Fallback if the existing store detail function is not available.
      const publicRoot = document.getElementById("commerce-public-root");

      if (publicRoot) {
        publicRoot.innerHTML = `
          <div style="max-width:900px; margin:2rem auto; background:white; padding:2rem; border-radius:12px;">
            <h1 style="color:#0a1929;">${store.icon || "🏪"} ${store.name}</h1>
            <p style="color:#6b7280;">${store.type || "Commerce"}</p>
            <p style="color:#6b7280;">📍 ${store.address || "Adresse non précisée"}</p>
            <p style="color:#6b7280;">📞 ${store.phone || "Téléphone non précisé"}</p>
          </div>
        `;
      }
    } catch (error) {
      console.error("❌ [14-commerce-public] Erreur globale :", error);
      showCommerceNotFound(slug);
    }
  }

  function initCommercePublicRoute() {
    if (!window.RuralGoCommerceRouter) return;

    const slug = window.RuralGoCommerceRouter.getCommerceSlug();

    if (!slug) return;

    openCommerceBySlug(slug);
  }

  if (window.APP_READY) {
    initCommercePublicRoute();
  } else {
    document.addEventListener("app:ready", initCommercePublicRoute);
  }
})();