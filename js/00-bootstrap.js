// ==========================================
// 🚀 FICHIER 00 : BOOTSTRAP SÉCURISÉ
// ==========================================
// Rôle :
// - charger les fragments HTML par domaine,
// - charger les fichiers JS dans le bon ordre,
// - afficher les erreurs de démarrage à l'écran,
// - éviter que le loader reste bloqué sans message.
// - détecter automatiquement l'environnement (local vs production)
// ==========================================

(function () {
  const bootErrors = [];

  // ------------------------------------------
  // 1. Déterminer la racine du site
  // ------------------------------------------
  // Important si le site est servi depuis un sous-dossier
  // ou depuis une URL comme /commerce/slug/.
  let rootHref = new URL("./", window.location.href).href;

  try {
    const bootstrapScript =
      document.currentScript ||
      document.querySelector('script[src*="00-bootstrap.js"]');

    if (bootstrapScript && bootstrapScript.src) {
      // Le bootstrap est dans /js/00-bootstrap.js
      // Donc la racine est le dossier parent de /js/
      rootHref = new URL("../", bootstrapScript.src).href;
    }
  } catch (error) {
    console.warn("[RuralGo] Impossible de déterminer la racine :", error);
  }

  function asset(path) {
    return new URL(path, rootHref).href;
  }

  // ------------------------------------------
  // 2. Fragments HTML et scripts JS
  // ------------------------------------------

  const PAGE_FRAGMENTS = [
    "pages/shared/header.html",
    "pages/public/landing.html",
    "pages/client/client.html",
    "pages/driver/driver.html",
    "pages/commerce/dashboard.html",
    "pages/commerce/public.html",
    "pages/admin/admin.html",
    "pages/shared/footer.html",
    "pages/shared/modals.html"
  ];

  // 🔥 DÉTECTION AUTOMATIQUE DE L'ENVIRONNEMENT
  // Si on est en local (Live Server), on charge local-config.js
  // Sinon, on charge 01-config.js (généré par Netlify en production)
  const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]';

  const configFile = isLocalhost ? "js/local-config.js" : "js/01-config.js";

  console.log(`🌍 [RuralGo] Environnement détecté : ${isLocalhost ? 'LOCAL (Live Server)' : 'PRODUCTION (Netlify)'}`);
  console.log(`📄 [RuralGo] Fichier de configuration chargé : ${configFile}`);

  const APP_SCRIPTS = [
    configFile, // 🔥 Remplace dynamiquement 01-config.js par local-config.js en local
    "js/02-data.js",
    "js/03-utils.js",
    "js/04-auth.js",
    "js/05-notifications.js",
    "js/06-client.js",
    "js/07-store.js",
    "js/08-driver.js",
    "js/09-admin.js",
    "js/10-payment.js",
    "js/11-one-store.js",
    "js/12-init.js",
    "js/13-commerce-router.js",
    "js/14-commerce-public.js",
    "js/15-client-order-cards.js",
    "js/16-commerce-dashboard-orders.js",
    "js/17-session-restore.js"
  ];

  // ------------------------------------------
  // 3. Helpers visuels
  // ------------------------------------------

  function getLoader() {
    return document.getElementById("page-loader");
  }

  function setLoaderStatus(message, isError = false) {
    const loader = getLoader();

    if (!loader) return;

    let status = document.getElementById("page-loader-status");

    if (!status) {
      status = document.createElement("div");
      status.id = "page-loader-status";
      status.style.cssText = `
        margin-top: 1rem;
        font-size: 0.85rem;
        max-width: 650px;
        text-align: center;
        word-break: break-word;
        padding: 0 1rem;
      `;
      loader.appendChild(status);
    }

    status.style.color = isError ? "#ef4444" : "#6b7280";
    status.textContent = message;
  }

  function showFatal(lines) {
    const errorLines = Array.isArray(lines) ? lines : [String(lines)];

    console.error("[RuralGo] Erreur fatale :", errorLines);

    const loader = getLoader();

    if (!loader) {
      alert(errorLines.join("\n"));
      return;
    }

    loader.style.setProperty("display", "flex", "important");
    loader.style.setProperty("flex-direction", "column", "important");
    loader.style.setProperty("justify-content", "center", "important");
    loader.style.setProperty("align-items", "center", "important");

    loader.innerHTML = `
      <div style="max-width:750px; padding:2rem; text-align:center;">
        <div style="font-size:2.5rem; margin-bottom:1rem;">❌</div>

        <h2 style="color:#ef4444; margin-bottom:1rem;">
          RuralGo n'a pas pu démarrer
        </h2>

        <div style="background:white; border:1px solid #fecaca; border-radius:10px; padding:1.25rem; color:#111827; text-align:left;">
          ${errorLines
            .map(
              (line) => `
                <div style="margin-bottom:0.5rem; font-size:0.9rem; word-break:break-word;">
                  • ${line}
                </div>
              `
            )
            .join("")}
        </div>

        <p style="margin-top:1rem; font-size:0.85rem; color:#6b7280;">
          Racine détectée : <code>${rootHref}</code>
        </p>

        <button
          onclick="window.location.reload()"
          style="
            margin-top:1.25rem;
            background:#0a1929;
            color:white;
            border:none;
            padding:10px 18px;
            border-radius:8px;
            cursor:pointer;
            font-weight:bold;
          "
        >
          🔄 Recharger
        </button>
      </div>
    `;
  }

  // ------------------------------------------
  // 4. Capture globale des erreurs
  // ------------------------------------------

  window.addEventListener("error", (event) => {
    const message = event.message || "Erreur JavaScript inconnue";

    bootErrors.push(message);

    console.error("[RuralGo] Erreur JS :", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });

    setLoaderStatus(`❌ ${message}`, true);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const message =
      event.reason && event.reason.message
        ? event.reason.message
        : String(event.reason || "Promise rejetée");

    bootErrors.push(message);

    console.error("[RuralGo] Promise rejetée :", event.reason);

    setLoaderStatus(`❌ ${message}`, true);
  });

  // ------------------------------------------
  // 5. Bloquer le mode file://
  // ------------------------------------------

  if (window.location.protocol === "file:") {
    showFatal([
      "RuralGo ne peut pas charger les pages HTML avec le protocole file://.",
      "Les navigateurs bloquent fetch() lorsque le site est ouvert directement depuis le disque.",
      "",
      "Solution : démarrer un serveur local.",
      "Exemple : npx serve",
      "Ou utiliser Live Server dans VS Code."
    ]);

    return;
  }

  // ------------------------------------------
  // 6. Timeout helper
  // ------------------------------------------

  function withTimeout(ms, promise, label) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Délai dépassé (${ms}ms) pour ${label}`));
      }, ms);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  // ------------------------------------------
  // 7. Chargement des fragments HTML
  // ------------------------------------------

  async function fetchFragment(src) {
    const response = await fetch(src, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.text();
  }

  // ------------------------------------------
  // 8. Chargement des scripts JS
  // ------------------------------------------

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = src;
      script.async = false;

      script.onload = () => resolve();

      script.onerror = () => {
        reject(new Error("Fichier introuvable ou erreur réseau"));
      };

      document.head.appendChild(script);
    });
  }

  // ------------------------------------------
  // 9. Bootstrap principal
  // ------------------------------------------

  async function bootstrap() {
    const appContent = document.getElementById("app-content");

    if (!appContent) {
      showFatal([
        "Le conteneur #app-content est introuvable dans index.html.",
        "Vérifiez que index.html contient bien :",
        '<div id="app-content"></div>'
      ]);

      return;
    }

    const failedFragments = [];
    let loadedFragments = 0;

    // Charger les fragments HTML.
    for (const fragmentPath of PAGE_FRAGMENTS) {
      const src = asset(fragmentPath);

      setLoaderStatus(`Chargement de ${fragmentPath}...`);

      try {
        const html = await withTimeout(
          15000,
          fetchFragment(src),
          fragmentPath
        );

        appContent.insertAdjacentHTML("beforeend", html);
        loadedFragments += 1;
      } catch (error) {
        failedFragments.push(`${fragmentPath} — ${error.message}`);

        console.warn(
          `[RuralGo] Fragment non chargé : ${fragmentPath}`,
          error
        );

        setLoaderStatus(`⚠️ Fragment manquant : ${fragmentPath}`, true);
      }
    }

    // Si aucun fragment n'a chargé, le problème est global.
    if (loadedFragments === 0) {
      showFatal([
        "Aucun fragment HTML n'a pu être chargé.",
        ...failedFragments,
        "",
        "Vérifiez :",
        "1. que le dossier pages/ existe,",
        "2. que les fichiers HTML sont bien dedans,",
        "3. que le site est ouvert via HTTP, pas file://."
      ]);

      return;
    }

    // Charger les fichiers JavaScript.
    for (const scriptPath of APP_SCRIPTS) {
      const src = asset(scriptPath);

      setLoaderStatus(`Chargement de ${scriptPath}...`);

      try {
        await withTimeout(20000, loadScript(src), scriptPath);
      } catch (error) {
        showFatal([
          `Le fichier JavaScript n'a pas pu être chargé : ${scriptPath}`,
          error.message,
          "",
          "Vérifiez que ce fichier existe bien dans /js."
        ]);

        return;
      }
    }

    // Application prête.
    window.APP_READY = true;

    // Important :
    // On ne déclenche PAS un faux DOMContentLoaded ici.
    // Cela peut provoquer des doubles initialisations
    // ou des rechargements en boucle.
    try {
      document.dispatchEvent(
        new CustomEvent("app:ready", {
          detail: {
            bootErrors,
            failedFragments
          }
        })
      );
    } catch (error) {
      console.error("[RuralGo] Erreur pendant app:ready :", error);
    }

    // Toujours cacher le loader, même si un listener app:ready échoue.
    const loader = getLoader();

    if (loader) {
      loader.style.setProperty("display", "none", "important");
    }

    if (failedFragments.length > 0) {
      console.warn("[RuralGo] Fragments manquants :", failedFragments);
    }

    if (bootErrors.length > 0) {
      console.warn("[RuralGo] Erreurs détectées pendant le démarrage :", bootErrors);
    }
  }

  // ------------------------------------------
  // 10. Démarrage
  // ------------------------------------------

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      bootstrap().catch((error) => {
        console.error("[RuralGo] Erreur bootstrap :", error);

        showFatal([
          error.message || String(error),
          "",
          "Ouvrez la console développeur pour plus de détails."
        ]);
      });
    });
  } else {
    bootstrap().catch((error) => {
      console.error("[RuralGo] Erreur bootstrap :", error);

      showFatal([
        error.message || String(error),
        "",
        "Ouvrez la console développeur pour plus de détails."
      ]);
    });
  }
})();