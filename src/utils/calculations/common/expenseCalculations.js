import { num, r2 } from './numberUtils';

export const calculateExpenses = (expenses = [], taxMode = 'GST') => {
    const mode = String(taxMode || 'NONE').toUpperCase();

    return expenses
        .filter((expense) =>
            String(expense.particular || '').trim() ||
            num(expense.amount) > 0
        )
        .map((expense, index) => {
            const taxable = r2(Math.max(num(expense.amount), 0));
            const taxRate = Math.max(num(expense.tax), 0);

            const taxAmount =
                mode === 'NONE'
                    ? 0
                    : r2((taxable * taxRate) / 100);

            return {

                particular: String(expense.particular || '').trim(),
                taxableAmount: taxable,
                taxRate,
                taxAmount,
                totalAmount: r2(taxable + taxAmount),
            };
        });
};