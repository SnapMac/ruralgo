// ==========================================
// 🏪 FICHIER 16 : COMMANDES DANS LE DASHBOARD COMMERCE
// VERSION SÉCURISÉE
// ==========================================

(function () {
  if (window.__RURALGO_DASHBOARD_ORDERS_LOADED__) {
    console.warn("⚠️ [16-commerce-dashboard-orders] Déjà chargé. Ignoré.");
    return;
  }

  window.__RURALGO_DASHBOARD_ORDERS_LOADED__ = true;

  let enhancementPending = false;

  function removeCommerceModalButtons() {
    document.querySelectorAll("button").forEach((button) => {
      const onclick = button.getAttribute("onclick") || "";
      const text = button.textContent || "";

      if (
        onclick.includes("openStoreOrdersModal") ||
        text.includes("Voir mes commandes reçues")
      ) {
        button.remove();
      }
    });
  }

  function removeDeliveredButtons(root = document) {
    if (!root) return;

    root.querySelectorAll("button").forEach((button) => {
      const onclick = button.getAttribute("onclick") || "";

      if (onclick.includes("'delivered'") || onclick.includes('"delivered"')) {
        button.remove();
      }
    });
  }

  function getOrderStatusMeta(status) {
    if (status === "confirmed" || status === "in_progress") {
      return {
        label: "🧑‍🍳 En cours",
        color: "#3b82f6"
      };
    }

    if (status === "delivered" || status === "completed") {
      return {
        label: "✅ Terminée",
        color: "#10b981"
      };
    }

    if (status === "cancelled") {
      return {
        label: "❌ Annulée",
        color: "#ef4444"
      };
    }

    return {
      label: "⏳ À préparer",
      color: "#f59e0b"
    };
  }

  function fallbackDashboardOrderCard(order) {
    const status = getOrderStatusMeta(order.status);
    const total = parseFloat(order.total || 0).toFixed(2);

    const invoiceButton =
      typeof openOrderInvoiceModal === "function"
        ? `
          <button
            class="btn-sm btn-gray"
            onclick="openOrderInvoiceModal(window._storeOrders.find(o => String(o.id) === String('${order.id}')))"
          >
            🖨️ Facture
          </button>
        `
        : "";

    return `
      <div style="background:white; padding:1.25rem; border-radius:10px; border:1px solid #e5e7eb; border-left:5px solid ${status.color}; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
          <div>
            <strong style="font-size:1.1rem; color:#0a1929;">
              Commande #${order.order_number || order.id}
            </strong>
            <span style="display:block; font-size:0.8rem; color:#6b7280; margin-top:2px;">
              ${new Date(order.created_at).toLocaleString("fr-CA")}
            </span>
          </div>

          <span style="background:${status.color}; color:white; padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:bold;">
            ${status.label}
          </span>
        </div>

        <div style="font-size:0.9rem; color:#4b5563; margin-bottom:0.75rem; padding:0.75rem; background:#f9fafb; border-radius:6px;">
          <strong style="color:#0a1929;">👤 Client :</strong> ${order.client_name || "Client"}<br>
          <strong style="color:#0a1929;">📍 Adresse :</strong> ${order.client_address || "Non spécifiée"}<br>
          <strong style="color:#0a1929;">📞 Téléphone :</strong> ${order.client_phone || "Non spécifié"}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e5e7eb; padding-top:0.75rem; margin-top:0.75rem; flex-wrap:wrap; gap:0.5rem;">
          <span style="font-size:1.1rem; font-weight:bold; color:#0a1929;">
            💰 Total : ${total} $
          </span>

          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            ${invoiceButton}
          </div>
        </div>
      </div>
    `;
  }

  async function loadDashboardOrders(storeId, limit = 5) {
    const container = document.getElementById("store-dashboard-orders-container");

    if (!container) return;

    if (typeof supabaseClient === "undefined") {
      container.innerHTML = `
        <p style="color:#ef4444; margin:0;">
          ❌ Supabase non disponible.
        </p>
      `;
      return;
    }

    container.innerHTML = `
      <p style="color:#6b7280; margin:0;">
        ⏳ Chargement des commandes...
      </p>
    `;

    try {
      let query = supabaseClient
        .from("orders")
        .select("*")
        .eq("store_id", String(storeId))
        .order("created_at", { ascending: false });

      if (limit > 0) {
        query = query.limit(limit);
      }

      const { data: dashboardOrders, error } = await query;

      if (error) throw error;

      if (!dashboardOrders || dashboardOrders.length === 0) {
        container.innerHTML = `
          <p style="margin:0; color:#6b7280;">
            📭 Aucune commande pour le moment.
          </p>
        `;
        return;
      }

      window._storeOrders = dashboardOrders;

      const renderer =
        typeof window.generateStoreOrderCard === "function"
          ? window.generateStoreOrderCard
          : fallbackDashboardOrderCard;

      container.innerHTML = dashboardOrders
        .map((order) => renderer(order))
        .join("");

      removeDeliveredButtons(container);
    } catch (error) {
      console.error("❌ [16-commerce-dashboard-orders] Erreur :", error);

      container.innerHTML = `
        <p style="color:#ef4444; margin:0;">
          ❌ Erreur lors du chargement des commandes : ${error.message}
        </p>
      `;
    }
  }

  function enhanceStoreDashboard() {
    if (!currentUser || currentUser.role !== "store") return;

    if (typeof stores === "undefined" || !Array.isArray(stores)) return;

    const myStore = stores.find(
      (s) => String(s.owner_id) === String(currentUser.id)
    );

    if (!myStore) return;

    removeCommerceModalButtons();

    const container = document.getElementById("store-info-content");

    if (!container) return;

    if (!document.getElementById("store-dashboard-orders-section")) {
      const voirToutButton =
        typeof window.showStoreOrders === "function"
          ? `
            <button
              onclick="showStoreOrders()"
              style="background:#0a1929; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem;"
            >
              Voir tout
            </button>
          `
          : "";

      container.insertAdjacentHTML(
        "beforeend",
        `
          <div
            id="store-dashboard-orders-section"
            style="background:#f0f9ff; padding:1.25rem; border-radius:8px; margin-top:1.5rem; border-left:4px solid #3b82f6;"
          >
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; gap:1rem; flex-wrap:wrap;">
              <h3 style="margin:0; color:#0a1929; font-size:1.1rem;">
                📦 Mes commandes
              </h3>

              ${voirToutButton}
            </div>

            <div
              id="store-dashboard-orders-container"
              style="display:grid; gap:1rem;"
            ></div>
          </div>
        `
      );
    }

    loadDashboardOrders(myStore.id, 5);
  }

  function scheduleDashboardEnhancement() {
    if (enhancementPending) return;

    enhancementPending = true;

    setTimeout(() => {
      enhancementPending = false;

      try {
        enhanceStoreDashboard();
      } catch (error) {
        console.error("❌ [16-commerce-dashboard-orders] Erreur enhancement :", error);
      }
    }, 80);
  }

  function wrapFunctionOnce(name, afterCallback) {
    const original = window[name];

    if (typeof original !== "function") return;

    if (original.__ruralgoWrapped) return;

    const wrapped = async function (...args) {
      const result = await original.apply(this, args);

      try {
        if (typeof afterCallback === "function") {
          afterCallback.apply(this, [result, ...args]);
        }
      } catch (error) {
        console.error(`❌ [16-commerce-dashboard-orders] Erreur après ${name} :`, error);
      }

      return result;
    };

    wrapped.__ruralgoWrapped = true;
    window[name] = wrapped;
  }

  wrapFunctionOnce("showStoreDashboard", scheduleDashboardEnhancement);
  wrapFunctionOnce("renderStoreDashboard", scheduleDashboardEnhancement);

  // Block delivered status.
  const originalUpdateStoreOrderStatus = window.updateStoreOrderStatus;

  window.updateStoreOrderStatus = async function (orderId, newStatus) {
    if (newStatus === "delivered" || newStatus === "completed") {
      if (typeof showToast === "function") {
        showToast("❌ Le commerce ne peut pas marquer la commande comme livrée.");
      }
      return;
    }

    if (typeof originalUpdateStoreOrderStatus === "function") {
      return originalUpdateStoreOrderStatus.apply(this, arguments);
    }
  };
})();