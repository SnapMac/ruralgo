// ==========================================
// 📦 FICHIER 15 : COMMANDES CLIENT UNIFIÉES
// ==========================================
// Rôle : remplacer le rendu des commandes client
// par des cartes visuelles alignées avec le commerce.
// ==========================================

(function () {
  function getClientOrderStatusMeta(status) {
    if (status === "confirmed" || status === "in_progress") {
      return {
        key: "active",
        label: "🚚 En cours",
        color: "#3b82f6"
      };
    }

    if (status === "delivered" || status === "completed") {
      return {
        key: "completed",
        label: "✅ Livrée",
        color: "#10b981"
      };
    }

    if (status === "cancelled") {
      return {
        key: "cancelled",
        label: "❌ Annulée",
        color: "#ef4444"
      };
    }

    return {
      key: "pending",
      label: "⏳ En attente",
      color: "#f59e0b"
    };
  }

  function renderClientOrderCard(order) {
    const status = getClientOrderStatusMeta(order.status);

    let remarquesHTML = "";

    if (Array.isArray(order.items)) {
      order.items.forEach((item) => {
        if (item.remarque && item.remarque.trim() !== "") {
          remarquesHTML += `
            <div style="background:#fef3c7; padding:0.6rem 0.8rem; border-radius:6px; margin-top:0.5rem; border-left:4px solid #f59e0b; font-size:0.9rem;">
              <strong>💬 ${item.name || "Produit"} :</strong>
              <span style="color:#92400e;">${item.remarque}</span>
            </div>
          `;
        }
      });
    }

    let actionsHTML = `
      <button class="btn-sm btn-gray" onclick="showClientOrderDetail(${order.id})">
        🔎 Détails
      </button>
    `;

    if (order.status === "pending" || order.status === "confirmed") {
      actionsHTML += `
        <button class="btn-sm btn-red" onclick="cancelOrder(${order.id})">
          ❌ Annuler
        </button>
      `;
    }

    const itemsHTML = (order.items || [])
      .map((item) => {
        const qty = parseInt(item.qty || 1);
        const price = parseFloat(item.price || 0);
        const lineTotal = qty * price;

        return `
          <li>
            ${qty} × ${item.name}
            <span style="color:#10b981; font-weight:bold;">
              (${lineTotal.toFixed(2)} $)
            </span>
          </li>
        `;
      })
      .join("");

    return `
      <div
        class="order-card"
        data-status="${status.key}"
        style="
          background:white;
          padding:1.25rem;
          border-radius:10px;
          border:1px solid #e5e7eb;
          border-left:5px solid ${status.color};
          box-shadow:0 2px 4px rgba(0,0,0,0.05);
        "
      >
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
          <div>
            <strong style="font-size:1.1rem; color:#0a1929;">
              Commande #${order.orderNumber || order.id}
            </strong>
            <span style="display:block; font-size:0.8rem; color:#6b7280; margin-top:2px;">
              ${new Date(order.createdAt).toLocaleString("fr-CA")}
            </span>
          </div>

          <span style="background:${status.color}; color:white; padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:bold;">
            ${status.label}
          </span>
        </div>

        <div style="font-size:0.9rem; color:#4b5563; margin-bottom:0.75rem; padding:0.75rem; background:#f9fafb; border-radius:6px;">
          <strong style="color:#0a1929;">🏪 Commerce :</strong> ${order.storeName || "Commerce"}<br>
          <strong style="color:#0a1929;">📍 Livraison :</strong> ${order.clientAddress || "Adresse non spécifiée"}<br>
          <strong style="color:#0a1929;">🚗 Frais de livraison :</strong> ${(order.deliveryFee || 0).toFixed(2)} $
        </div>

        <div style="margin-bottom:0.75rem;">
          <strong style="font-size:0.9rem; color:#0a1929;">
            🛒 Articles (${(order.items || []).length}) :
          </strong>

          <ul style="margin:0.5rem 0 0 1.2rem; padding:0; font-size:0.85rem; color:#4b5563;">
            ${itemsHTML}
          </ul>
        </div>

        ${remarquesHTML}

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e5e7eb; padding-top:0.75rem; margin-top:0.75rem; flex-wrap:wrap; gap:0.5rem;">
          <span style="font-size:1.1rem; font-weight:bold; color:#0a1929;">
            💰 Total : ${(order.total || 0).toFixed(2)} $
          </span>

          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            ${actionsHTML}
          </div>
        </div>
      </div>
    `;
  }

  async function renderClientOrdersUnified() {
    const list = document.getElementById("client-orders-list");

    if (!list) return;

    if (!currentUser || !currentUser.id) {
      list.innerHTML = `
        <div class="empty-state">
          <p>🔑 Veuillez vous connecter pour voir vos commandes.</p>
        </div>
      `;
      return;
    }

    try {
      const { data: ordersData, error } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("client_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      orders = ordersData.map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        clientId: o.client_id,
        clientName: o.client_name,
        clientPhone: o.client_phone,
        clientAddress: o.client_address,
        clientLat: o.client_lat,
        clientLng: o.client_lng,
        items: o.items || [],
        subtotal: o.subtotal || 0,
        deliveryBaseFee: o.delivery_base_fee || 7,
        deliveryDistanceKm: o.delivery_distance_km || 0,
        deliveryPerKmFee: o.delivery_per_km_fee || 0,
        deliveryFee: o.delivery_fee || 0,
        tax: o.tax || 0,
        total: o.total || 0,
        status: o.status,
        driverId: o.driver_id,
        driverName: o.driver_name,
        store_id: o.store_id,
        storeName: o.store_name,
        createdAt: o.created_at,
        statusHistory: o.status_history || []
      }));

      if (orders.length === 0) {
        list.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <p>Aucune commande</p>
            <button class="btn" style="margin-top:1rem" onclick="showClientStores()">
              🛍️ Commencer mes achats
            </button>
          </div>
        `;
        return;
      }

      list.innerHTML = orders.map(renderClientOrderCard).join("");
    } catch (error) {
      console.error("❌ [15-client-order-cards] Erreur :", error);

      list.innerHTML = `
        <div class="empty-state">
          <p>Erreur lors du chargement des commandes.</p>
        </div>
      `;
    }
  }

  // Override the original client order renderer.
  window.renderClientOrders = renderClientOrdersUnified;
})();