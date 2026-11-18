import { num, r2 } from '../common/numberUtils';
import { calculateItemRow } from '../common/itemCalculations';
import { calculateExpenses } from '../common/expenseCalculations';
import { calculateTaxSlabs } from '../common/taxCalculations';
import { emptyTaxTotals } from '../common/taxCalculations';


export const calculateVoucherTotals = ({
    items = [],
    expenses = [],
    taxMode,
    taxType,
    autoRound = false,
}) => {
    const mode = String(taxMode || 'NONE').toUpperCase();
    const type = String(taxType || 'INTRA').toUpperCase();

    const itemTotals = items.reduce(
        (result, row) => {
            const calculated = calculateItemRow(row, mode);

            result.quantity += num(row.qty);
            result.gross += calculated.gross;
            result.discount += calculated.discountAmount;
            result.itemTaxable += calculated.taxable;

            return result;
        },
        { quantity: 0, gross: 0, discount: 0, itemTaxable: 0 },
    );

    const slabs = calculateTaxSlabs({
        items,
        taxMode: mode,
        taxType: type,
    });

    const expenseItems = calculateExpenses(expenses, mode);

    const expenseAmount = r2(
        expenseItems.reduce(
            (total, expense) => total + expense.totalAmount,
            0,
        ),
    );

    const taxableAmount = r2(itemTotals.itemTaxable);

    const taxTotals = slabs.reduce((result, slab) => {
        result.tax += slab.tax;
        result.cgst += slab.cgst;
        result.sgst += slab.sgst;
        result.vat += slab.vat;
        result.igst += slab.igst;

        return result;
    }, emptyTaxTotals());

    const taxAmount = r2(taxTotals.tax);

    const beforeRound = r2(
        taxableAmount + taxAmount + expenseAmount,
    );

    const roundOff = autoRound
        ? r2(Math.round(beforeRound) - beforeRound)
        : 0;

    const netTotal = r2(beforeRound + roundOff);

    // Tax ledger breakup
    const taxBreakup = [];

    slabs.forEach((slab) => {
        const rate = num(slab.rate);

        if (!slab.tax) return;

        if (mode === 'GST' && type === 'INTRA') {
            const cgstAmount = r2(slab.cgst || 0);
            const sgstAmount = r2(slab.sgst || 0);

            if (cgstAmount) {
                taxBreakup.push({
                    ledgerName: `Input CGST ${rate / 2}%`,
                    rate: rate / 2,
                    amount: cgstAmount,
                });
            }

            if (sgstAmount) {
                taxBreakup.push({
                    ledgerName: `Input SGST ${rate / 2}%`,
                    rate: rate / 2,
                    amount: sgstAmount,
                });
            }
        } else if (mode === 'GST' && type === 'INTER') {
            const igstAmount = r2(slab.igst || 0);

            if (igstAmount) {
                taxBreakup.push({
                    ledgerName: `Input IGST ${rate}%`,
                    rate,
                    amount: igstAmount,
                });
            }
        } else if (mode === 'VAT') {
            const vatAmount = r2(slab.vat || 0);

            if (vatAmount) {
                taxBreakup.push({
                    ledgerName: `Input VAT ${rate}%`,
                    rate,
                    amount: vatAmount,
                });
            }
        }
    });

    return {
        mode,
        type,
        quantity: r2(itemTotals.quantity),
        gross: r2(itemTotals.gross),
        discount: r2(itemTotals.discount),
        itemTaxable: r2(itemTotals.itemTaxable),

        // Preserve old property names
        taxable: taxableAmount,
        expenseAmount,
        tax: taxAmount,

        cgst: r2(taxTotals.cgst),
        sgst: r2(taxTotals.sgst),
        vat: r2(taxTotals.vat),
        igst: r2(taxTotals.igst),

        roundOff,
        roundAmt: roundOff,
        net: netTotal,
        netTotal,

        slabs,
        taxBreakup,
        expenseItems,
    };
};
// Backward compatibility

