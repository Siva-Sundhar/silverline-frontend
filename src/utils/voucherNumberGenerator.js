const getFinancialYear = () => {
	const now = new Date();
	const year = now.getFullYear();
	const startYear = now.getMonth() >= 3 ? year : year - 1;

	return `${String(startYear % 100).padStart(2, '0')}-${String((startYear + 1) % 100).padStart(2, '0')}`;
};

const VOUCHER_KEY = 'voucherNumber';

export const voucherNumber =  (prefix = 'PO') => {
	
	const financialYear = getFinancialYear();

	

	const data = JSON.parse(localStorage.getItem(VOUCHER_KEY) || '{}');

    let vchKey = data[prefix];
     // Reset the sequence when the financial year changes.
    if (!vchKey || vchKey.financialYear !== financialYear) {
        vchKey = {
            prefix,
            financialYear,
            lastNumber: 0,
        };
    }


    const nextNumber = vchKey.lastNumber + 1;
    vchKey.lastNumber = nextNumber;
    data[prefix] = vchKey;
    localStorage.setItem(VOUCHER_KEY, JSON.stringify(data));

    return `${prefix}/${String(nextNumber).padStart(3, '0')}/${financialYear}`;
};

export const getVoucherKey =  (prefix) => {

    // console.log(prefix);
    
	try {
		const data =  JSON.parse(localStorage.getItem(VOUCHER_KEY || '{}'));

        return data[prefix] || {
            prefix,
            financialYear: getFinancialYear(),
            lastnumber:0
        }
	} catch (error) {
		console.error('Failed to fetch Voucher Number:', error);
		return {
            prefix,
            financialYear: getFinancialYear(),
            lastnumber:0
        };
	}
};

