
const STORAGE_KEY = "saleOrders";

// Get all sales orders
export const getAllSaleOrders = async () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (error) {
        console.error("Failed to fetch sale orders:", error);
        return [];
    }
};

// Get a sales order by ID
export const getSaleOrderById = async (id) => {
    const saleOrders = await getAllSaleOrders();

    return saleOrders.find(
        (order) => String(order.id) === String(id)
    ) || null;
};

// Create a sales order
export const createSaleOrder = async (saleOrderData) => {
    const saleOrders = await getAllSaleOrders();

    const newSaleOrder = {
        ...saleOrderData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    saleOrders.push(newSaleOrder);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(saleOrders)
    );

    return newSaleOrder;
};

// Update a sales order
export const updateSaleOrder = async (id, updatedData) => {
    const saleOrders = await getAllSaleOrders();

    const index = saleOrders.findIndex(
        (order) => String(order.id) === String(id)
    );

    if (index === -1) {
        throw new Error("Sale order not found");
    }

    saleOrders[index] = {
        ...saleOrders[index],
        ...updatedData,
        id: saleOrders[index].id,
        createdAt: saleOrders[index].createdAt,
        updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(saleOrders)
    );

    return saleOrders[index];
};

// Delete a sales order
export const deleteSaleOrder = async (id) => {
    const saleOrders = await getAllSaleOrders();

    const filteredOrders = saleOrders.filter(
        (order) => String(order.id) !== String(id)
    );

    if (filteredOrders.length === saleOrders.length) {
        throw new Error("Sale order not found");
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(filteredOrders)
    );

    return { success: true, message: "Sale order deleted successfully" };
};


