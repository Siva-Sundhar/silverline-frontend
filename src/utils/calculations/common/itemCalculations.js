import { num, r2 } from './numberUtils';

export const calculateItemRow = (row, mode = 'GST') => {
    const quantity = num(row.qty);
    const rate = num(row.rate);

    const discountPercent = Math.min(
        Math.max(num(row.disc), 0),
        100
    );

    const taxRate = Math.max(num(row.tax ?? row.gst), 0);

    const gross = r2(quantity * rate);
    const discountAmount = r2(
        (gross * discountPercent) / 100
    );

    const taxable = r2(gross - discountAmount);

    const taxAmount =
        mode === 'NONE'
            ? 0
            : r2((taxable * taxRate) / 100);

    return {
        gross,
        discountAmount,
        taxable,
        taxRate,
        taxAmount,
        amount: r2(taxable + taxAmount),
    };
};

// Backward compatibility for existing components;