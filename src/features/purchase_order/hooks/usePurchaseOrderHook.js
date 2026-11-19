import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
	toISODate,
	formatGenericDate,
} from '../../../utils/FormatGenericDate.js';

import { calculateVoucherTotals } from '../../../utils/calculations/voucher/voucherTotals.js';
import { calculateExpenses } from '../../../utils/calculations/index.js';
import { buildPurchaseOrderPayload } from '../../../utils/calculations/payload/purchaseOrderPayload.js';
import {
	createEmptyExpenseRow,
	createEmptyPurchaseRow,
} from '../utils/purchaseOrderHelpers.js';
import useProducts from '../../../hooks/useProducts.js';

const FORMATTED_COLS = {
	1: 'qty',
	2: 'rate',
	3: 'disc',
	4: 'tax',
};
const EDITABLE_COLS = [0, 1, 2];
const EXPENSE_FIELDS = ['particular', 'amount', 'tax'];
const FORMATTED_EXPENSE_FIELDS = new Set(['amount', 'tax']);
const MAX_EXP_ROWS = 5;

const usePurchaseOrderHook = (orderId) => {
	const { id: routeId } = useParams();
	const navigate = useNavigate();

	const alterId = orderId || routeId || null;
	const isAlterMode = Boolean(alterId);

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	const [formData, setFormData] = useState({
		voucherNo: '1001',
		suplierName: 'Siva',
		distributorName: 'Silver',
		voucherDate: '',
		orderNo: '',
		referenceDate: '',
		narration: '',
		createdBy: '',
		approvedBy: '',
		voucherStatus: 'Pending',
		tallyStatus: 'Pending',
		taxMode: 'vat',
		taxType: 'intra',
		autoRound: true,
		teleport: false,
	});

	const { items = [] } = useProducts();

	// ? /----------- States Initialization -----------/ ? //
	const [purchaseItems, setPurchaseItems] = useState([
		createEmptyPurchaseRow(),
	]);
	const [expenses, setExpenses] = useState([createEmptyExpenseRow()]);
	const [focusedCell, setFocusedCell] = useState(null);
	const [focusedExpenseCell, setFocusedExpenseCell] = useState(null);
	const [open, setOpen] = useState(false);
	const [openView, setOpenView] = useState('expenses');
	const [activeBatchRow, setActiveBatchRow] = useState(null);

	// ? /========= Ref Initialiations ==========/ ? //
	const headerRefs = useRef([]);
	const gridRefs = useRef({});
	const expenseRefs = useRef({});
	const remarksRef = useRef(null);

	// ? /================== Product Option ==================/ ? //
	const productOptions = useMemo(() => {
		return items.map((product) => ({
			label: product.itemCode,
			value: product.itemCode,
			product,
		}));
	}, [items]);

	const productOptionsWithEnd = useMemo(
		() => [
			{
				label: '♦ End of List',
				value: '__END_OF_LIST__',
				isEndOfList: true,
			},
			...productOptions,
		],
		[productOptions],
	);

	const rowProductOptions = useMemo(() => {
		return purchaseItems.length > 1 ? productOptionsWithEnd : productOptions;
	}, [purchaseItems.length, productOptionsWithEnd, productOptions]);

	// ? /================== Expense Option ==================/ ? //
	// const ledgerOptions = useMemo(() => {
	// 	return ledgers.map((ledger) => ({
	// 		label: ledger.ledgerName,
	// 		value: ledger.ledgerName,
	// 	}));
	// }, []);

	// ? /================== Customer Option ==================/ ? //
	// const customerOptions = useMemo(() => {
	// 	return customers.map((ledger) => ({
	// 		label: ledger.customerName,
	// 		value: ledger.customerName,
	// 	}));
	// }, []);

	// ? /=========== Ref registration ==========/ ? //

	const registerHeaderRef = useCallback(
		(index) => (element) => {
			headerRefs.current[index] = element;
		},
		[],
	);

	const registerGridRef = useCallback(
		(rowIndex, columnIndex) => (element) => {
			gridRefs.current[`${rowIndex}-${columnIndex}`] = element;
		},
		[],
	);

	const registerExpenseRef = useCallback(
		(rowIndex, field) => (element) => {
			expenseRefs.current[`${rowIndex}-${field}`] = element;
		},
		[],
	);

	// ? /============ Focus & Select ============/ ? //

	const focusRef = useCallback((element) => {
		if (!element) return;

		element.focus?.();

		requestAnimationFrame(() => {
			element?.select?.();
		});
	}, []);

	const focusHeaderRef = useCallback(
		(index) => {
			focusRef(headerRefs.current[index]);
		},
		[focusRef],
	);

	const focusGridRef = useCallback(
		(rowIndex, columnIndex) => {
			focusRef(gridRefs.current[`${rowIndex}-${columnIndex}`]);
		},
		[focusRef],
	);

	const focusExpenseRef = useCallback(
		(rowIndex, field) => {
			focusRef(expenseRefs.current[`${rowIndex}-${field}`]);
		},
		[focusRef],
	);

	const focusAndSelectGridCell = useCallback(
		(rowIndex, columnIndex) => {
			const field = FORMATTED_COLS[columnIndex];

			if (field) {
				setFocusedCell(`${rowIndex}-${field}`);
			}

			focusGridRef(rowIndex, columnIndex);
		},
		[focusGridRef],
	);

	const focusFirstGridCell = useCallback(() => {
		focusAndSelectGridCell(0, 0);
	}, [focusAndSelectGridCell]);

	const focusAndSelectExpenseCell = useCallback(
		(rowIndex, field) => {
			if (FORMATTED_EXPENSE_FIELDS.has(field)) {
				setFocusedExpenseCell(`${rowIndex}-${field}`);

				requestAnimationFrame(() => {
					focusExpenseRef(rowIndex, field);
				});

				return;
			}

			focusExpenseRef(rowIndex, field);
		},
		[focusExpenseRef],
	);

	// ? /=========== Form handlers ===========/ ? //

	const setField = useCallback(
		(name) => (event) => {
			const value = event.target.value;

			setFormData((previous) => ({
				...previous,
				[name]: value,
			}));
		},
		[],
	);

	const commitDateChange = useCallback((rawText, field) => {
		const formattedDate = formatGenericDate(rawText, 'DD-MMM-YY');

		if (!formattedDate) return;

		const isoDate = toISODate(rawText);

		setFormData((previous) => ({
			...previous,
			[field]: isoDate,
		}));
	}, []);

	const updateRow = useCallback((rowIndex, field, value) => {
		setPurchaseItems((rows) =>
			rows.map((row, index) =>
				index === rowIndex
					? {
							...row,
							[field]: value,
						}
					: row,
			),
		);
	}, []);

	const updateExpense = useCallback((id, field, value) => {
		setExpenses((currentExpenses) =>
			currentExpenses.map((expense) =>
				expense.id === id
					? {
							...expense,
							[field]: field === 'amount' ? Number(value) || 0 : value,
						}
					: expense,
			),
		);
	}, []);

	// ? /=========== Keyboard navigation ===========/ //

	const handleHeaderKeyDown = useCallback(
		(event, nextIndex) => {
			if (event.key !== 'Enter') return;

			event.preventDefault();
			focusHeaderRef(nextIndex);
		},
		[focusHeaderRef],
	);

	const handleEndOfList = useCallback(
		(rowIndex) => {
			setPurchaseItems((rows) => {
				if (rows.length === 1) {
					return [createEmptyPurchaseRow()];
				}

				return rows.filter((_, index) => index !== rowIndex);
			});

			setTimeout(() => {
				if (rowIndex < purchaseItems.length - 1) {
					focusAndSelectGridCell(rowIndex, 0);
					return;
				}

				if (rowIndex > 0) {
					setOpen(true);

					setTimeout(() => {
						focusExpenseRef(0, 'particular');
					}, 0);

					return;
				}

				remarksRef.current?.focus();
			}, 0);
		},
		[purchaseItems.length, focusAndSelectGridCell, focusExpenseRef, setOpen],
	);

	const handleGridKeyDown = useCallback(
		(event, rowIndex, columnIndex) => {
			if (event.key !== 'Enter') return;

			event.preventDefault();

			const position = EDITABLE_COLS.indexOf(columnIndex);
			const isLastEditable = position === EDITABLE_COLS.length - 1;

			const nextRow = isLastEditable ? rowIndex + 1 : rowIndex;
			const nextColumn = isLastEditable
				? EDITABLE_COLS[0]
				: EDITABLE_COLS[position + 1];

			if (nextRow >= purchaseItems.length) {
				setPurchaseItems((rows) => [...rows, createEmptyPurchaseRow()]);

				setTimeout(() => {
					focusAndSelectGridCell(nextRow, nextColumn);
				}, 0);

				return;
			}

			focusAndSelectGridCell(nextRow, nextColumn);
		},
		[purchaseItems.length, focusAndSelectGridCell],
	);

	const handleExpenseKeyDown = useCallback(
		(event, rowIndex, field) => {
			if (event.key !== 'Enter') return;

			event.preventDefault();

			const position = EXPENSE_FIELDS.indexOf(field);
			const isLastField = position === EXPENSE_FIELDS.length - 1;

			const nextRow = isLastField ? rowIndex + 1 : rowIndex;
			const nextField = isLastField
				? EXPENSE_FIELDS[0]
				: EXPENSE_FIELDS[position + 1];

			if (nextRow >= expenses.length) {
				if (expenses.length >= MAX_EXP_ROWS) {
					remarksRef.current?.focus();
					return;
				}

				setExpenses((rows) => [...rows, createEmptyExpenseRow()]);

				setTimeout(() => {
					focusAndSelectExpenseCell(nextRow, nextField);
				}, 0);

				return;
			}

			focusAndSelectExpenseCell(nextRow, nextField);
		},
		[expenses.length, focusAndSelectExpenseCell],
	);

	/* ---------------- Calculations ---------------- */

	const totals = useMemo(() => {
		return calculateVoucherTotals({
			items: purchaseItems,
			expenses,
			taxMode: formData.taxMode,
			taxType: formData.taxType,
			autoRound: formData.autoRound,
		});
	}, [
		purchaseItems,
		expenses,
		formData.taxMode,
		formData.taxType,
		formData.autoRound,
	]);

	const expenseItems = useMemo(() => {
		return calculateExpenses(expenses, formData.taxMode);
	}, [expenses, formData.taxMode]);

	const expenseTotals = useMemo(() => {
		return expenseItems.reduce(
			(result, currentItem) => {
				result.taxable += currentItem.taxableAmount;
				result.tax += currentItem.taxAmount;
				result.total += currentItem.totalAmount;

				return result;
			},
			{
				taxable: 0,
				tax: 0,
				total: 0,
			},
		);
	}, [expenseItems]);

	/* ---------------- Save / validation ---------------- */

	const validatePurchaseForm = useCallback(() => {
		if (!formData.distributorName?.trim()) {
			toast.error('Distributor name is required.');
			focusHeaderRef(4);
			return false;
		}

		for (let index = 0; index < purchaseItems.length; index += 1) {
			const row = purchaseItems[index];

			if (!row.code?.trim()) {
				toast.error(`Product code is required in row ${index + 1}.`);
				focusGridRef(index, 0);
				return false;
			}
		}

		return true;
	}, [formData.distributorName, purchaseItems, focusHeaderRef, focusGridRef]);

	const handleSave = useCallback(
		async (approve = false) => {
			if (!validatePurchaseForm()) return;

			try {
				setSaving(true);

				const voucherData = buildPurchaseOrderPayload(
					formData,
					purchaseItems,
					expenses,
				);

				// await createPurchaseOrder(voucherData);

				toast.success(
					isAlterMode
						? 'Purchase updated successfully.'
						: 'Purchase created successfully.',
				);
			} catch (error) {
				console.error(error);
				toast.error('Unable to save purchase.');
			} finally {
				setSaving(false);
			}
		},
		[formData, purchaseItems, expenses, isAlterMode, validatePurchaseForm],
	);

	return {
		// mode / status
		loading,
		saving,
		isAlterMode,

		// form state
		formData,
		setField,
		commitDateChange,

		// table state
		purchaseItems,
		setPurchaseItems,
		updateRow,
		productOptions,
		rowProductOptions,
		handleEndOfList,

		// expenses state
		expenses,
		updateExpense,

		// totals
		totals,
		expenseTotals,

		// refs
		registerHeaderRef,
		registerGridRef,
		registerExpenseRef,
		focusHeaderRef,
		focusGridRef,
		focusExpenseRef,
		remarksRef,
		focusFirstGridCell,

		// keyboard navigation
		handleHeaderKeyDown,
		handleGridKeyDown,
		handleExpenseKeyDown,

		// UI state
		open,
		setOpen,
		openView,
		setOpenView,
		focusedCell,
		setFocusedCell,
		focusedExpenseCell,
		activeBatchRow,
		setActiveBatchRow,

		// actions
		validatePurchaseForm,
		handleSave,
	};
};

export default usePurchaseOrderHook;
