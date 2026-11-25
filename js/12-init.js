// ==========================================
// 🧠 FICHIER 12 : INITIALISATION GLOBALE
// ==========================================
// Rôle : initialiser le compteur visiteurs
// et la carte Leaflet après chargement des pages.
// ==========================================

(function () {
  function initVisitorCounter() {
    const compteur = document.getElementById("compteur");

    if (!compteur) return;

    if (typeof supabaseClient === "undefined") {
      console.warn("⚠️ [12-init] supabaseClient non disponible.");
      return;
    }

    supabaseClient
      .from("visiteurs")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("❌ [12-init] Erreur compteur visiteurs :", error);
          return;
        }

        let total = 1;

        if (data) {
          total = (data.total || 0) + 1;

          supabaseClient
            .from("visiteurs")
            .update({ total })
            .eq("id", data.id)
            .then(() => {
              compteur.textContent = "👥 Visiteurs : " + total;
            })
            .catch((updateError) => {
              console.error("❌ [12-init] Erreur mise à jour compteur :", updateError);
            });
        } else {
          supabaseClient
            .from("visiteurs")
            .insert({ total })
            .then(() => {
              compteur.textContent = "👥 Visiteurs : " + total;
            })
            .catch((insertError) => {
              console.error("❌ [12-init] Erreur insertion compteur :", insertError);
            });
        }
      })
      .catch((error) => {
        console.error("❌ [12-init] Erreur globale compteur :", error);
      });
  }

  function initLandingMap() {
    const mapContainer = document.getElementById("map-ruralgo");

    if (!mapContainer) return;
    if (typeof L === "undefined") return;
    if (mapContainer.dataset.ruralgoInit === "1") return;

    mapContainer.dataset.ruralgoInit = "1";

    const maniwaki = [46.3767, -75.9653];

    const map = L.map("map-ruralgo").setView(maniwaki, 9);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18
    }).addTo(map);

    const marker = L.marker(maniwaki).addTo(map);

    marker
      .bindPopup("<strong>📍 Maniwaki</strong><br>Centre de livraison RuralGo")
      .openPopup();

    L.circle(maniwaki, {
      color: "#f5a623",
      fillColor: "#f5a623",
      fillOpacity: 0.15,
      radius: 40000,
      weight: 3
    }).addTo(map);

    window.ruralgoLandingMap = map;
  }

  function initApp() {
    initVisitorCounter();
    initLandingMap();
  }

  if (window.APP_READY) {
    initApp();
  } else {
    document.addEventListener("app:ready", initApp);
  }
})();