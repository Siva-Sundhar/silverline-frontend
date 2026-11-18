import { num } from '../common/numberUtils';
import { calculateVoucherTotals } from '../voucher/voucherTotals';

import { calculateQuantityAndUnits } from '../common/quantityCalculations';
import { calculateItemRow } from '../common/itemCalculations';

export const buildPurchaseOrderPayload = (formData, purchaseItem, expenses) => {
	const validRows = purchaseItem.filter(
		(row) => row.code || row.desc || num(row.qty) > 0,
	);

	const validExpenses = expenses.filter(
		(expense) => expense.particular?.trim() || num(expense.amount) > 0,
	);

	const totals = calculateVoucherTotals({
		purchaseItems: validRows,
		expenses: validExpenses,
		taxMode: formData.taxMode,
		taxType: formData.taxType,
		autoRound: formData.autoRound,
	});

	console.log('Totals : ' , totals);
	

	const expensesItems = totals.expenses || [];

	const inventoryItems = validRows.map((row) => {
		const calculated = calculateItemRow(row, formData.taxMode);
		return {
			itemCode: row.code,
			itemName: row.desc,
			qty: num(row.qty),
			uom: row.uom,
			rate: num(row.rate),
			discountAmount: calculated.discountAmount,
			gst: calculated.taxRate,
			grossAmount: calculated.gross,
			taxableAmount: calculated.taxable,
			taxAmount: calculated.taxAmount,
			itemAmount: calculated.amount,
            
			// Batch details only; no batch calculation here.
			batchRequests: (row.batchItems || []).map((batch) => ({
				batchNo: batch.batchNo,
				color: batch.color,
				doorType: batch.doorType,
				seatType: batch.seatType,
				qty: num(batch.qty),
				uom: batch.uom,
				amount: num(batch.amount),
			})),
		};
	});

	const ledgerEntries = [];

	// 1) Expenses as ledger rows
	expensesItems.forEach((expense, idx) => {
		const ledgerName = String(
			expense.particular || `Expense ${idx + 1}`,
		).trim();

		if (ledgerName) {
			ledgerEntries.push({
				ledgerName,
				percentage: num(expense.taxRate) || 0,
				ledgerAmount: num(expense.taxableAmount) || 0,
				ledgerType: 'EXPENSE',
			});
		}
	});

	// 2) Tax ledgers from taxBreakup
	if (Array.isArray(totals.taxBreakup)) {
		totals.taxBreakup.forEach((t) => {
			if (!t.ledgerName || !t.amount) return;

			ledgerEntries.push({
				ledgerName: t.ledgerName,
				percentage: num(t.rate) || 0,
				ledgerAmount: num(t.amount) || 0,
				ledgerType: 'TAX',
			});
		});
	}

	// 3) Round off
	if (totals.roundAmt && num(totals.roundAmt) !== 0) {
		ledgerEntries.push({
			ledgerName: 'Round Off',
			percentage: 0,
			ledgerAmount: num(totals.roundAmt),
			ledgerType: 'ROUND_OFF',
		});
	}

	const { totalQty, units } = calculateQuantityAndUnits(validRows);

	return {
		voucherNo: formData.voucherNo,
		voucherDate: formData.voucherDate,
		distributorName: formData.distributorName,
		supplierName: formData.supplierName,
		orderNo: formData.poNo,
		orderDate: formData.poDate,
		voucherNarration: formData.remarks,
		createdBy: formData.createdBy,
		approvedBy: formData.approvedBy,
		voucherStatus: formData.voucherStatus,
		tallyStatus: formData.tallyStatus,
		voucherAmount: num(totals.net),
		totalQty: totalQty,
		units,
		inventoryItems,
		ledgerEntries,
	};
};
