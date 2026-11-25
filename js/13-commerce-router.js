// ==========================================
// 🧭 FICHIER 13 : ROUTER COMMERCE
// ==========================================
// Rôle : détecter le slug d'un commerce
// dans l'URL et exposer des utilitaires slug.
// ==========================================

(function () {
  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getCommerceSlugFromQuery() {
    const params = new URLSearchParams(window.location.search);

    return params.get("slug") || params.get("commerce") || null;
  }

  function getCommerceSlugFromPath() {
    const segments = window.location.pathname.split("/").filter(Boolean);

    const commerceIndex = segments.lastIndexOf("commerce");

    if (commerceIndex === -1) return null;

    const slug = segments[commerceIndex + 1];

    if (!slug) return null;

    // These are reserved routes, not public commerce slugs.
    if (slug === "dashboard" || slug === "public") {
      return null;
    }

    return decodeURIComponent(slug);
  }

  function getCommerceSlug() {
    return getCommerceSlugFromPath() || getCommerceSlugFromQuery();
  }

  window.slugifyCommerceName = slugify;

  window.RuralGoCommerceRouter = {
    slugify,
    getCommerceSlug,
    getCommerceSlugFromPath,
    getCommerceSlugFromQuery
  };
})();