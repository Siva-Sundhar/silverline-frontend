import api from "./server_api";

const STORAGE_KEY = "purchaseOrders";

// Get all purchase orders
export const getAllPurchaseOrders = async () => {
    try {
        const response = await api.get("/api/purchase-order/all-orders");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch purchase orders:", error);
        return [];
    }
};

export const getList = async (path) => {
    try {
        const response = await api.get(path);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch purchase orders:", error);
        return [];
    }
};


// Voucher Number preview

export const getVoucherNoPreview = async (prefix)=>{
    try {
        const response = await api.get(`/api/v1/sequence/preview/${prefix}`);

        return response.data;
    }
    catch(error) {
        console.error("Failed to Fetch Voucehr Number", error)
    }
}


// const 

// Get a purchase order by ID
// export const getPurchaseOrderById = async (id) => {
//     const purchaseOrders = await getAllPurchaseOrders();

//     const purchaseOrder = purchaseOrders.find(
//         (order) => String(order.id) === String(id)
//     );
// };

// Create a purchase order
export const createPurchaseOrder = async (purchaseOrderData) => {
    
    const response = await api.post("/api/v1/purchase-order/save-order", purchaseOrderData);
    
    return response.data;
};

// Update a purchase order
export const updatePurchaseOrder = async (id, updatedData) => {
    const purchaseOrders = await getAllPurchaseOrders();

    const index = purchaseOrders.findIndex(
        (order) => String(order.id) === String(id)
    );

    if (index === -1) {
        throw new Error("Sale order not found");
    }

    purchaseOrders[index] = {
        ...purchaseOrders[index],
        ...updatedData,
        id: purchaseOrders[index].id,
        createdAt: purchaseOrders[index].createdAt,
        updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(purchaseOrders)
    );

    return purchaseOrders[index];
};

// Delete a purchase order
export const deletePurchaseOrder = async (id) => {
    const purchaseOrders = await getAllPurchaseOrders();

    const filteredOrders = purchaseOrders.filter(
        (order) => String(order.id) !== String(id)
    );

    if (filteredOrders.length === purchaseOrders.length) {
        throw new Error("Sale order not found");
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(filteredOrders)
    );

    return { success: true, message: "Sale order deleted successfully" };
};


