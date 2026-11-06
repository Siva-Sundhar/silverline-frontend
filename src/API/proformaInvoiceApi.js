import api from "./server_api"


/* create */
export const createPurchase = async (voucherData) => {
    const response = await api.post('api/create', voucherData);

    return response.data;
}
/* update */

/* view particular */

/* view all */

/* delete */

