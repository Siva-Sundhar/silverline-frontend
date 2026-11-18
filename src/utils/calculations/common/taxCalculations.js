import { r2 } from './numberUtils';
import { calculateItemRow } from './itemCalculations';

export const emptyTaxTotals = () => ({
	taxable: 0,
	tax: 0,
	cgst: 0,
	sgst: 0,
	vat: 0,
	igst: 0,
});

export const calculateTaxSlabs = ({ items = [], taxMode, taxType }) => {
	const mode = String(taxMode || 'NONE').toUpperCase();
	const type = String(taxType || 'INTRA').toUpperCase();

	const slabMap = new Map();

	const addToSlab = (rate, taxable) => {
		if (taxable <= 0) return;

		slabMap.set(rate, (slabMap.get(rate) || 0) + taxable);
	};

	items.forEach((row) => {
		const calculated = calculateItemRow(row, mode);
		addToSlab(calculated.taxRate, calculated.taxable);
	});

	return [...slabMap.entries()]
		.sort(([a], [b]) => a - b)
		.map(([rate, taxableValue]) => {
			const taxable = r2(taxableValue);
			const tax = mode === 'NONE' ? 0 : r2((taxable * rate) / 100);

			if (mode === 'VAT') {
				return {
					rate,
					taxable,
					tax,
					vat: tax,
					cgst: 0,
					sgst: 0,
					igst: 0,
					total: r2(taxable + tax),
				};
			}

			if (mode === 'GST' && type === 'INTRA') {
				const cgst = r2(tax / 2);
				const sgst = r2(tax - cgst);

				return {
					rate,
					taxable,
					tax,
					vat: 0,
					cgst,
					sgst,
					igst: 0,
					total: r2(taxable + tax),
				};
			}

			return {
				rate,
				taxable,
				tax,
				vat: 0,
				cgst: 0,
				sgst: 0,
				igst: tax,
				total: r2(taxable + tax),
			};
		});
};
