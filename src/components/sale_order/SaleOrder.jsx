import { useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { Calendar, ChevronDown, ChevronUp, Eye } from 'lucide-react';

import {
	formatGenericDate,
	getDayName,
	toISODate,
} from '../../utils/FormatGenericDate.js';

import GenericSelect from '../../utils/components/GenericSelect.jsx';
import products from '../../utils/test_master/item.js';
import ledgers from '../../utils/test_master/ledger.js';

import {
	buildPurchasePayload,
	calculateExpenses,
	calculatePurchaseRow,
	calculatePurchaseTotals,
} from '../../utils/calculation.js';

// import { useAppStore } from '../../store/useAppStore.js';
import { toast } from 'sonner';
// import { isAdminRole } from '../../utils/role.js';
import {
	currencyFormatter,
	formatNumber,
	formatPercent,
	unformatNumber,
} from '../../utils/FormatNumber.js';
import customers from '../../utils/test_master/customers.js';
import { createSaleOrder } from '../../API/saleOrderApi.js';

const headerInput =
	'h-5 border border-amber-300 bg-[#fee8af] px-1 text-slate-900 outline-none focus:border-blue-500 focus:bg-white';

const EDITABLE_COLS = [0, 1, 2, 3, 4];

const FORMATTED_COLS = {
	1: 'qty',
	2: 'rate',
	3: 'disc',
	4: 'tax',
};

const EXPENSE_FIELDS = ['particular', 'amount', 'tax'];

const FORMATTED_EXPENSE_FIELDS = new Set(['amount', 'tax']);

const createEmptyPurchaseRow = (tax = '') => ({
	id: crypto.randomUUID(),
	code: '',
	desc: '',
	qty: '',
	uom: '',
	rate: '',
	disc: '',
	tax,
});

const createExpenseRow = () => ({
	id: crypto.randomUUID(),
	particular: '',
	amount: '',
	tax: 0,
});

const normalizeDate = (value) => {
	if (!value) return '';
	return typeof value === 'string' ? value.slice(0, 10) : toISODate(value);
};

const normalizePurchaseItem = (item, index) => ({
	id: item.itemLine ?? `item-${index}`,
	code: item.itemCode ?? '',
	desc: item.itemName ?? '',
	qty: item.qty ?? '',
	uom: item.uom ?? '',
	rate: item.rate ?? '',
	disc: item.disc ?? '',
	tax: item.gst ?? item.vat ?? '',
});

const normalizeExpense = (item, index) => ({
	id: item.ledLine ?? `expense-${index}`,
	particular: item.ledgerName ?? '',
	amount: item.ledgerAmount ?? 0,
	tax: item.percentage ?? 0,
});

const normalizePurchase = (response, taxModeStore, taxTypeStore) => {
	const { voucher, files = [] } = response?.data ?? response;

	const voucherDate = normalizeDate(voucher.vchDate);
	const referenceDate = normalizeDate(voucher.poDate);
	const expenseEntries = (voucher.requestLedgerEntry ?? [])
		.filter(
			(entry) =>
				String(entry.ledType || '').toUpperCase() === 'EXPENSE' ||
				String(entry.ledType || '').toUpperCase() === 'EXPENSES',
		)
		.map(normalizeExpense);

	return {
		form: {
			voucherNo: voucher.vchNo ?? '',
			customerName: voucher.supplierName ?? '',
			voucherDate,
			referenceNo: voucher.poNo ?? '',
			referenceDate,
			narration: voucher.voucherNarration ?? '',
			createdBy: voucher.createdBy ?? '',
			approvedBy: voucher.approvedBy ?? '',
			voucherStatus: voucher.voucherStatus ?? 'Pending',
			tallyStatus: voucher.tallyStatus ?? 'Pending',
			paymentStatus: voucher.paymentStatus ?? 'Pending',
			taxMode: taxModeStore || 'vat',
			taxType: taxTypeStore || 'intra',
			autoRound: voucher.autoRound ?? true,
			totalAmount: voucher.voucherAmount ?? 0,
			totalQty: voucher.totalQty ?? 0,
			units: voucher.units ?? '',
		},

		items: (voucher.requestInventory ?? []).map(normalizePurchaseItem),

		expenses: expenseEntries,

		files: files.map((file, index) => ({
			id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
			file,
			name: file.name,
			size: file.size,
			type: file.type,
			previewUrl: URL.createObjectURL(file),
		})),
	};
};

const Line = ({ label, value, bold = false }) => {
	return (
		<div
			className={[
				'flex justify-between first:border-t',
				'last:border-0 border-b border-slate-400',
				bold ? 'font-bold text-slate-900' : 'text-slate-700','leading-4.5'
			].join(' ')}
		>
			<span>{label}</span>

			<span className="tabular-nums">{value}</span>
		</div>
	);
};

const SaleOrder = ({ orderId }) => {
	const { id: routeId } = useParams();
	const navigate = useNavigate();

	const alterId = orderId || routeId || null;
	const isAlterMode = Boolean(alterId);

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	/* comes from store  */
	const supplier = ''; //useAppStore((s) => s.ledgerName);
	const taxModeStore = ''; //useAppStore((s) => s.taxMode);
	const taxTypeStore = ''; //useAppStore((s) => s.taxType);
	const localeISO = 'en-IN'; //useAppStore((s) => s.locale);
	const currency = 'INR'; //useAppStore((s) => s.currency);
	const symbol = '$'; //useAppStore((s) => s.currencySymbol);
	// const role = useAppStore((state) => state.role);
	const [open, setOpen] = useState(false);

	const isAdmin = '';

	const [formData, setFormData] = useState({
		voucherNo: '',
		voucherType: 'Purchase Order',
		customerName: supplier || '',
		voucherDate: toISODate(new Date()),
		orderNo: '',
		referenceDate: '',
		narration: '',
		createdBy: '',
		approvedBy: '',
		voucherStatus: '',
		tallyStatus: '',
		paymentStatus: '',
		taxMode: taxModeStore || 'gst',
		taxType: taxTypeStore || '',
		autoRound: true,
		totalAmount: '',
		totalQty: '',
		units: '',
	});

	const taxMode = String(formData.taxMode || 'none').toLowerCase();
	const taxType = String(formData.taxType || 'intra').toLowerCase();
	const isIntra = taxType === 'intra';

	const [purchaseItem, setPurchaseItem] = useState([createEmptyPurchaseRow()]);

	const [expenses, setExpenses] = useState([createExpenseRow()]);

	// const [focusedIndex, setFocusedIndex] = useState(0);

	const [dateInputText, setDateInputText] = useState(
		formatGenericDate(new Date(), 'DD-MMM-YY'),
	);

	const [refDateInputText, setRefDateInputText] = useState('');

	const [attachments, setAttachments] = useState([]);

	const [attachmentPreviews, setAttachmentPreviews] = useState([]);

	const [previewFile, setPreviewFile] = useState(null);

	const [showPreview, setShowPreview] = useState(false);

	const [focusedCell, setFocusedCell] = useState(null);

	const [focusedExpenseCell, setFocusedExpenseCell] = useState(null);

	const [isLast, setIsLast] = useState(false);

	const [bottomView, setBottomView] = useState('tax');

	const headerRefs = useRef([]);
	const hiddenDateRef = useRef(null);
	const gridRefs = useRef({});
	const expenseRefs = useRef({});
	const remarksRef = useRef(null);
	const createdByRef = useRef(null);
	// const fileInputRef = useRef(null);
	const MAX_EXP_ROWS = 5;

	const productOptions = useMemo(() => {
		return products.map((product) => ({
			label: product.partNo,
			value: product.partNo,
			product,
		}));
	}, []);

	const ledgerOptions = useMemo(() => {
		return ledgers.map((ledger) => ({
			label: ledger.ledgerName,
			value: ledger.ledgerName,
		}));
	}, []);

	const customerOptions = useMemo(() => {
		return customers.map((ledger) => ({
			label: ledger.customerName,
			value: ledger.customerName,
		}));
	}, []);

	useEffect(() => {
		if (!alterId) {
			return;
		}

		let cancelled = false;

		const loadPurchase = async () => {
			try {
				setLoading(true);

				const response = await getPurchaseById(alterId);

				if (cancelled) return;

				const normalized = normalizePurchase(
					response,
					taxModeStore,
					taxTypeStore,
				);

				setFormData((previous) => ({
					...previous,
					...normalized.form,
				}));

				setPurchaseItem(
					normalized.items.length
						? normalized.items
						: [createEmptyPurchaseRow()],
				);

				setExpenses(
					normalized.expenses.length
						? normalized.expenses
						: [createExpenseRow()],
				);

				setAttachments(normalized.files.map((item) => item.file));
				setAttachmentPreviews(normalized.files);

				setDateInputText(
					normalized.form.voucherDate
						? formatGenericDate(normalized.form.voucherDate, 'DD-MMM-YY')
						: '',
				);

				setRefDateInputText(
					normalized.form.referenceDate
						? formatGenericDate(normalized.form.referenceDate, 'DD-MMM-YY')
						: '',
				);
			} catch (error) {
				console.error('Failed to load purchase:', error);
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		loadPurchase();

		return () => {
			cancelled = true;
		};
	}, [alterId, taxModeStore, taxTypeStore]);

	useEffect(() => {
		return () => {
			attachmentPreviews.forEach((attachment) => {
				URL.revokeObjectURL(attachment.previewUrl);
			});
		};
	}, [attachmentPreviews]);

	useEffect(() => {
		setTimeout(() => {
			headerRefs?.current[0]?.focus();
			headerRefs?.current[0].select();
		}, 0);
		// getVoucherNo().then((data) => {
		// 	if (data && !alterId) {
		// 		setFormData((prev) => ({ ...prev, voucherNo: data }));
		// 	}
		// });
	}, [alterId]);

	const setField = (name) => (event) => {
		setFormData((previous) => ({
			...previous,
			[name]: event.target.value,
		}));
	};

	const commitDateChange = (rawText, field) => {
		const formattedDate = formatGenericDate(rawText, 'DD-MMM-YY');

		if (!formattedDate) {
			if (field === 'voucherDate') {
				setDateInputText(
					formData.voucherDate
						? formatGenericDate(formData.voucherDate, 'DD-MMM-YY')
						: '',
				);
			}

			if (field === 'referenceDate') {
				setRefDateInputText(
					formData.referenceDate
						? formatGenericDate(formData.referenceDate, 'DD-MMM-YY')
						: '',
				);
			}

			return;
		}

		const isoDate = toISODate(rawText);

		setFormData((previous) => ({
			...previous,
			[field]: isoDate,
		}));

		if (field === 'voucherDate') {
			setDateInputText(formattedDate);
		}

		if (field === 'referenceDate') {
			setRefDateInputText(formattedDate);
		}
	};

	const handleHeaderKeyDown = (event, nextElement) => {
		console.log(event.key);
		
		if (event.key !== 'Enter') {
			return;
		}

		event.preventDefault();
		nextElement?.focus?.();
		nextElement?.select?.();
	};

	const updateRow = (rowIndex, field, value) => {
		setPurchaseItem((rows) =>
			rows.map((row, index) =>
				index === rowIndex
					? {
							...row,
							[field]: value,
						}
					: row,
			),
		);
	};

	const updateExpense = (id, field, value) => {
		setExpenses((currentExpenses) =>
			currentExpenses.map((expense) => {
				if (expense.id !== id) {
					return expense;
				}

				return {
					...expense,
					[field]: field === 'totalAmount' ? Number(value) || 0 : value,
				};
			}),
		);
	};

	const isFocused = (rowIndex, field) => {
		return focusedCell === `${rowIndex}-${field}`;
	};

	const isExpenseFocused = (rowIndex, field) => {
		return focusedExpenseCell === `${rowIndex}-${field}`;
	};

	const cellHandlers = (rowIndex, field, columnIndex) => ({
		ref: (element) => {
			gridRefs.current[`${rowIndex}-${columnIndex}`] = element;
		},

		onKeyDown: (event) => {
			handleGridKeyDown(event, rowIndex, columnIndex);
		},

		onFocus: () => {
			setFocusedCell(`${rowIndex}-${field}`);
		},

		onBlur: () => {
			setFocusedCell(null);
		},

		onChange: (event) => {
			updateRow(rowIndex, field, unformatNumber(event.target.value));
		},
	});

	const focusAndSelect = (rowIndex, columnIndex) => {
		const field = FORMATTED_COLS[columnIndex];

		const focusElement = () => {
			const element = gridRefs.current[`${rowIndex}-${columnIndex}`];

			if (!element) {
				return;
			}

			element.focus();

			if (typeof element.select === 'function') {
				element.select();
			}
		};

		if (field) {
			setFocusedCell(`${rowIndex}-${field}`);

			requestAnimationFrame(focusElement);
			return;
		}

		focusElement();
	};

	const handleGridKeyDown = (event, rowIndex, columnIndex) => {
		if (event.key !== 'Enter') {
			return;
		}

		event.preventDefault();

		const position = EDITABLE_COLS.indexOf(columnIndex);

		const isLastEditable = position === EDITABLE_COLS.length - 1;

		const nextRow = isLastEditable ? rowIndex + 1 : rowIndex;

		const nextColumn = isLastEditable
			? EDITABLE_COLS[0]
			: EDITABLE_COLS[position + 1];

		if (nextRow >= purchaseItem.length) {
			setPurchaseItem((rows) => [
				...rows,
				createEmptyPurchaseRow(rows[rows.length - 1]?.tax || ''),
			]);

			setTimeout(() => {
				focusAndSelect(nextRow, nextColumn);
			}, 0);

			return;
		}

		focusAndSelect(nextRow, nextColumn);
	};

	const handleEndOfList = (rowIndex) => {
		setPurchaseItem((rows) => {
			if (rows.length === 1) {
				return [createEmptyPurchaseRow()];
			}

			return rows.filter((_, index) => index !== rowIndex);
		});

		setTimeout(() => {
			if (rowIndex < purchaseItem.length - 1) {
				gridRefs.current[`${rowIndex}-0`]?.focus();

				return;
			}

			if (rowIndex > 0) {
				setIsLast(true);
				setBottomView('tax');
				setTimeout(() => {
					remarksRef.current?.focus();
				}, 0);

				return;
			}

			remarksRef.current?.focus();
		}, 0);
	};

	const handleEndOfListExpense = (rowIndex) => {
		setExpenses((rows) => {
			if (rows.length === 1) {
				return [createExpenseRow()];
			}

			return rows.filter((_, index) => index !== rowIndex);
		});

		setTimeout(() => {
			if (rowIndex < expenses.length - 1) {
				expenseRefs.current[`${rowIndex}-particular`]?.focus();

				return;
			}

			if (rowIndex > 0) {
				setIsLast(true);
				setBottomView('expenses');
				setTimeout(() => {
					remarksRef.current?.focus();
					remarksRef.current?.select();
				}, 0);

				return;
			}

			remarksRef.current?.focus();
		}, 0);
	};

	const focusAndSelectExpense = (rowIndex, field) => {
		const focusElement = () => {
			const element = expenseRefs.current[`${rowIndex}-${field}`];

			if (!element) {
				return;
			}

			element.focus();

			if (typeof element.select === 'function') {
				element.select();
			}
		};

		if (FORMATTED_EXPENSE_FIELDS.has(field)) {
			setFocusedExpenseCell(`${rowIndex}-${field}`);

			requestAnimationFrame(focusElement);
			return;
		}

		focusElement();
	};

	const handleExpenseKeyDown = (event, rowIndex, field) => {
		if (event.key !== 'Enter') {
			return;
		}

		event.preventDefault();

		const position = EXPENSE_FIELDS.indexOf(field);
		const isLastField = position === EXPENSE_FIELDS.length - 1;

		const nextRow = isLastField ? rowIndex + 1 : rowIndex;
		const nextField = isLastField
			? EXPENSE_FIELDS[0]
			: EXPENSE_FIELDS[position + 1];

		// A new row would be needed
		if (nextRow >= expenses.length) {
			// Limit reached → go to Remarks
			if (expenses.length >= MAX_EXP_ROWS) {
				remarksRef.current?.focus();
				return;
			}

			setExpenses((rows) => [...rows, createExpenseRow()]);

			setTimeout(() => {
				focusAndSelectExpense(nextRow, nextField);
			}, 0);

			return;
		}

		// Next cell exists → just move focus
		focusAndSelectExpense(nextRow, nextField);
	};

	const handleInvoicePreview = async () => {
		const voucherData = buildPurchasePayload(formData, purchaseItem, expenses);
		// Open the tab right away, inside the click, so the browser allows it
		const tab = window.open('', '_blank');

		if (!tab) {
			toast.error('Please allow pop-ups to view the preview.');
			return;
		}

		console.log('DATA ->', voucherData);
		tab.document.title = 'Loading invoice...';

		try {
			const data = await previewInvoice(voucherData);

			const blob = data.type
				? data
				: new Blob([data], { type: 'application/pdf' });
			const url = URL.revokeObjectURL(blob);

			tab.location.href = url;

			// Free the memory after the tab has had time to load it
			setTimeout(() => URL.revokeObjectURL(url), 60_000);
		} catch (error) {
			console.error('Invoice preview failed:', error);
			tab.close();
			toast.error('Unable to load invoice preview.');
		}
	};

	// const handleFiles = (event) => {
	// 	const selectedFiles = Array.from(event.target.files || []);

	// 	// User clicked Cancel
	// 	if (selectedFiles.length === 0) {
	// 		return;
	// 	}

	// 	const newPreviews = selectedFiles.map((file, index) => ({
	// 		id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
	// 		file,
	// 		name: file.name,
	// 		size: file.size,
	// 		type: file.type,
	// 		previewUrl: URL.createObjectURL(file),
	// 	}));

	// 	setAttachmentPreviews((previous) => [...previous, ...newPreviews]);

	// 	setAttachments((previous) => [...previous, ...selectedFiles]);

	// 	// Allows selecting the same file again later
	// 	event.target.value = '';
	// };

	// const removeAttachment = (attachmentId) => {
	// 	const selected = attachmentPreviews.find(
	// 		(attachment) => attachment.id === attachmentId,
	// 	);

	// 	if (selected?.previewUrl) {
	// 		URL.revokeObjectURL(selected.previewUrl);
	// 	}

	// 	const remaining = attachmentPreviews.filter(
	// 		(attachment) => attachment.id !== attachmentId,
	// 	);

	// 	setAttachmentPreviews(remaining);

	// 	setAttachments(remaining.map((attachment) => attachment.file));

	// 	if (previewFile?.id === attachmentId) {
	// 		setPreviewFile(null);
	// 	}
	// };

	const totals = useMemo(() => {
		return calculatePurchaseTotals({
			purchaseItems: purchaseItem,
			expenses,
			taxMode: formData.taxMode,
			taxType: formData.taxType,
			autoRound: formData.autoRound,
		});
	}, [
		purchaseItem,
		expenses,
		formData.taxMode,
		formData.taxType,
		formData.autoRound,
	]);

	const expenseItems = useMemo(() => {
		return calculateExpenses(expenses, taxMode);
	}, [expenses, taxMode]);

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

	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key !== 'Escape') return;

			event.preventDefault();
			navigate(-1);
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [navigate]);

	/* cancel button */
	const handleCancel = () => {
		if (window.history.length > 1) {
			navigate(-1);
		} else {
			navigate('/dashboard');
		}
	};

	/* Reusable Function  */
	const isValidNumber = (value) => {
		return (
			value !== '' &&
			value !== null &&
			value !== undefined &&
			Number.isFinite(Number(value)) &&
			Number(value) > 0
		);
	};

	const focusElement = (element) => {
		if (!element) return;

		requestAnimationFrame(() => {
			element.focus({ preventScroll: true });

			if (typeof element.select === 'function') {
				element.select();
			}
		});
	};

	/* Validate Form  */
	const validatePurchaseForm = () => {
		if (!formData.customerName?.trim()) {
			toast.error('Customer name is required.');
			focusElement(headerRefs.current[4]);
			return false;
		}

		for (let index = 0; index < purchaseItem.length; index += 1) {
			const row = purchaseItem[index];

			if (!row.code?.trim()) {
				toast.error(`Product code is required in row ${index + 1}.`);
				focusElement(gridRefs.current[`${index}-0`]);
				return false;
			}

			if (!isValidNumber(row.qty)) {
				toast.error(`Quantity is required in row ${index + 1}.`);
				focusElement(gridRefs.current[`${index}-1`]);
				return false;
			}

			if (!isValidNumber(row.rate)) {
				toast.error(`Amount/rate is required in row ${index + 1}.`);
				focusElement(gridRefs.current[`${index}-2`]);
				return false;
			}

			if (!isValidNumber(row.tax)) {
				toast.error(`Tax is required in row ${index + 1}.`);
				focusElement(gridRefs.current[`${index}-4`]);
				return false;
			}
		}

		return true;
	};

	/* Rest Function */
	const resetPurchaseForm = () => {
		const today = toISODate(new Date());

		setFormData({
			voucherNo: '',
			voucherType: 'Purchase Order',
			customerName: supplier || '',
			voucherDate: today,
			referenceNo: '',
			referenceDate: '',
			narration: '',
			createdBy: '',
			approvedBy: '',
			voucherStatus: 'Pending',
			taxMode: taxModeStore || 'vat',
			taxType: taxTypeStore || 'intra',
			autoRound: true,
			totalAmount: '',
			totalQty: '',
			units: '',
		});

		setDateInputText(formatGenericDate(new Date(), 'DD-MMM-YY'));
		setRefDateInputText('');

		setPurchaseItem([createEmptyPurchaseRow()]);
		setExpenses([createExpenseRow()]);

		setAttachments([]);
		setAttachmentPreviews([]);
		setPreviewFile(null);
		setShowPreview(false);

		setFocusedCell(null);
		setFocusedExpenseCell(null);

		requestAnimationFrame(() => {
			headerRefs.current[0]?.focus({ preventScroll: true });
			headerRefs.current[0]?.select?.();
		});
	};

	const handleSave = async (approve = false) => {
		if (!validatePurchaseForm()) {
			return;
		}

		// Only an admin's Approve button can produce "Approved"
		const voucherStatus = isAdmin && approve ? 'Approved' : 'Pending';

		const tallyStatus = 'Pending';
		const paymentStatus = 'Pending';

		// console.log(formData);

		try {
			setSaving(true);

			const voucherData = buildPurchasePayload(
				{ ...formData, voucherStatus, tallyStatus, paymentStatus },
				purchaseItem,
				expenses,
			);

			console.log(voucherData);

			await createSaleOrder(voucherData);

			toast.success(
				isAlterMode
					? 'Purchase updated successfully.'
					: 'Purchase created successfully.',
			);

			if (isAlterMode) {
				navigate('/dashboard');
				return;
			}

			resetPurchaseForm();

			try {
				const voucherNo = await getVoucherNo();

				if (voucherNo) {
					setFormData((previous) => ({
						...previous,
						voucherNo,
					}));
				}
			} catch (error) {
				console.error('Failed to fetch new voucher number:', error);
				toast.error('Unable to fetch a new voucher number.');
			}
		} catch (error) {
			console.error('Purchase save failed:', error);
			toast.error('Unable to save purchase.');
		} finally {
			setSaving(false);
		}
	};

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

	const ledgerOptionsWithEnd = useMemo(
		() => [
			{
				label: '♦ End of List',
				value: '__END_OF_LIST__',
				isEndOfList: true,
			},
			...ledgerOptions,
		],
		[ledgerOptions],
	);

	const rowProductOptions =
		purchaseItem.length > 1 ? productOptionsWithEnd : productOptions;

	const renderProductOption = (option) => {
		if (option.isEndOfList) {
			return <div className="px-2 font-bold text-red-700">♦ End of List</div>;
		}

		const product = option.product;

		return (
			<div className="grid grid-cols-[60px_minmax(0,1fr)_50px_85px] items-center gap-2 px-2">
				<span className="font-semibold">{product.partNo}</span>

				<span className="truncate">{product.itemName}</span>

				<span className="text-center font-medium">{product.uom}</span>
				{/* <span className="text-right font-medium">{currencyFormatter(product.rate)}</span> */}
				<span className="text-right font-medium">{`${product.taxRate} %`}</span>
			</div>
		);
	};

	const renderPurchaseRow = (currentItem, rowIndex) => {
		return (
			<tr key={currentItem.id} className="hover:bg-blue-50">
				<td className="border border-slate-300 bg-slate-100 text-center font-bold text-slate-500">
					{rowIndex + 1}
				</td>

				{/* Product Code - col 0 */}
				<td className="border border-slate-300 bg-slate-50">
					<GenericSelect
						ref={(element) => {
							gridRefs.current[`${rowIndex}-0`] = element;
						}}
						options={rowProductOptions}
						placeholder="Select Product..."
						title="Products"
						value={
							productOptions.find(
								(option) => String(option.value) === String(currentItem.code),
							) || null
						}
						onKeyDown={(event) => {
							handleGridKeyDown(event, rowIndex, 0);
						}}
						onChange={(selectedOption) => {
							if (!selectedOption) {
								return;
							}

							if (selectedOption.isEndOfList) {
								handleEndOfList(rowIndex);
								return;
							}

							const product = selectedOption.product;

							if (!product) {
								return;
							}

							setPurchaseItem((rows) =>
								rows.map((row, index) =>
									index === rowIndex
										? {
												...row,
												code: product.partNo,
												desc: product.itemName,
												uom: product.uom,
												tax: product.taxRate || product.vat || '',
											}
										: row,
								),
							);
						}}
						onSelect={(selectedOption) => {
							if (selectedOption?.isEndOfList) {
								return;
							}

							setTimeout(() => {
								gridRefs.current[`${rowIndex}-1`]?.focus();
							}, 0);
						}}
						labelKey="label"
						valueKey="value"
						inputFocusStyle={{
							backgroundColor: '#dbeafe',
						}}
						menuStyle={{
							width: '600px',
							maxWidth: 'calc(100vw - 8px)',
						}}
						menuHeader={
							<div className="grid grid-cols-[60px_minmax(0,1fr)_55px_85px] gap-2 ">
								<span>Code</span>
								<span>Product Name</span>
								<span className="text-center">UOM</span>
								{/* <span className="text-right pr-1.5">Rate</span> */}
								<span className="text-right">Tax (%)</span>
							</div>
						}
						renderOption={renderProductOption}
					/>
				</td>

				{/* Description - read-only */}
				<td className="border border-slate-300 bg-slate-50">
					<input
						readOnly
						type="text"
						value={currentItem.desc}
						className="w-full bg-transparent px-1.5 font-semibold text-slate-800 outline-none"
					/>
				</td>

				{/* Qty - col 1 */}
				<td className="border border-slate-300 bg-slate-50">
					<input
						{...cellHandlers(rowIndex, 'qty', 1)}
						type="text"
						inputMode="decimal"
						value={
							isFocused(rowIndex, 'qty')
								? currentItem.qty
								: formatNumber(currentItem.qty, localeISO)
						}
						onMouseDown={(e) => {
							const input = e.currentTarget;

							if (document.activeElement !== input) {
								setTimeout(() => input.select(), 0);
							}
						}}
						placeholder="0.00"
						className="w-full bg-transparent px-1.5 text-right font-semibold text-slate-800 outline-none focus:bg-blue-100"
					/>
				</td>
				{/* UOM - read-only */}
				<td className="border border-slate-300 bg-slate-50">
					<input
						readOnly
						type="text"
						value={currentItem.uom}
						className="w-full bg-transparent px-1.5 text-center font-semibold text-slate-800 outline-none"
					/>
				</td>

				{/* Rate - col 2 */}
				<td className="border border-slate-300 bg-slate-50">
					<input
						{...cellHandlers(rowIndex, 'rate', 2)}
						type="text"
						inputMode="decimal"
						value={
							isFocused(rowIndex, 'rate')
								? currentItem.rate
								: currencyFormatter(
										currentItem.rate,
										localeISO,
										currency,
										symbol,
									)
						}
						onMouseDown={(e) => {
							const input = e.currentTarget;

							if (document.activeElement !== input) {
								setTimeout(() => input.select(), 0);
							}
						}}
						placeholder="0.00"
						className="w-full bg-transparent px-1.5 text-right font-semibold text-slate-800 outline-none focus:bg-blue-100"
					/>
				</td>

				{/* Disc - col 3 */}
				<td className="border border-slate-300 bg-slate-50">
					<div className="flex pr-1">
						<input
							{...cellHandlers(rowIndex, 'disc', 3)}
							type="text"
							inputMode="decimal"
							value={
								isFocused(rowIndex, 'disc')
									? currentItem.disc
									: formatPercent(currentItem.disc, localeISO)
							}
							onMouseDown={(e) => {
								const input = e.currentTarget;

								if (document.activeElement !== input) {
									setTimeout(() => input.select(), 0);
								}
							}}
							placeholder="0.00"
							className="w-full bg-transparent px-1 text-right font-semibold text-slate-800 outline-none focus:bg-blue-100"
						/>
					</div>
				</td>

				{/* GST - col 4 (last editable) */}
				<td className="border border-slate-300 bg-slate-50">
					<div className="flex pr-1">
						<input
							{...cellHandlers(rowIndex, 'tax', 4)}
							type="text"
							inputMode="decimal"
							value={
								isFocused(rowIndex, 'tax')
									? currentItem.tax
									: formatPercent(currentItem.tax)
							}
							onMouseDown={(e) => {
								const input = e.currentTarget;

								if (document.activeElement !== input) {
									setTimeout(() => input.select(), 0);
								}
							}}
							placeholder="0.00"
							className="w-full bg-transparent px-0.5 text-right font-semibold text-slate-800 outline-none focus:bg-blue-100"
						/>
					</div>
				</td>

				{/* Amount */}
				<td className="border border-slate-300 bg-slate-50 px-1.5 text-right font-bold tabular-nums">
					{currencyFormatter(
						calculatePurchaseRow(currentItem, taxMode).taxable,
						localeISO,
						currency,
						symbol,
					)}
				</td>
			</tr>
		);
	};

	const renderExpenseRow = (expense, index) => {
		const amount = Number(expense.amount || 0);

		const tax = Number(expense.tax || 0);

		const totalAmount = amount + (amount * tax) / 100;

		return (
			<tr
				key={expense.id}
				className={`${isIntra ? 'h-5' : 'h-4'} bg-white hover:bg-blue-50`}
			>
				<td className="border border-slate-500 px-1 text-center font-semibold h-4">
					{index + 1}
				</td>

				<td className="border border-slate-500 p-0 w-100">
					<GenericSelect
						ref={(element) => {
							expenseRefs.current[`${index}-particular`] = element;
						}}
						options={ledgerOptionsWithEnd}
						placeholder="Select Ledger..."
						title="Ledgers"
						value={
							ledgerOptions.find(
								(option) => String(option.value) === String(expense.particular),
							) || null
						}
						onKeyDown={(event) => {
							handleExpenseKeyDown(event, index, 'particular');
						}}
						onChange={(selectedOption) => {
							if (!selectedOption) {
								return;
							}

							if (selectedOption.isEndOfList) {
								handleEndOfListExpense(index);
								return;
							}

							setExpenses((rows) =>
								rows.map((row, idx) =>
									idx === index
										? {
												...row,
												particular: selectedOption.value,
											}
										: row,
								),
							);
						}}
						onSelect={(selectedOption) => {
							if (selectedOption?.isEndOfList) {
								return;
							}

							setTimeout(() => {
								expenseRefs.current[`${index}-amount`]?.focus();
								// expenseRefs.current[`${index}-amount`]?.select();
							}, 0);
						}}
						labelKey="label"
						valueKey="value"
						inputFocusStyle={{
							backgroundColor: '#fff9da',
						}}
						inputStyle={{
							padding: '0 4px',
							height: '16px',
						}}
						menuStyle={{
							width: '250px',
							maxWidth: 'calc(100vw - 8px)',
							right: '4px',
							bottom: '4px',
							top: '4px',
						}}
						optionStyle={{
							padding: ' 0.5px 4px',
						}}

						// renderOption={renderProductOption}
					/>
				</td>

				<td className="border border-slate-500 p-0">
					<input
						ref={(element) => {
							expenseRefs.current[`${index}-amount`] = element;
						}}
						type="text"
						inputMode="decimal"
						value={
							isExpenseFocused(index, 'amount')
								? expense.amount
								: currencyFormatter(expense.amount, localeISO, currency, symbol)
						}
						onFocus={() => {
							setFocusedExpenseCell(`${index}-amount`);
						}}
						onBlur={() => {
							setFocusedExpenseCell(null);
						}}
						onChange={(event) => {
							updateExpense(
								expense.id,
								'amount',
								unformatNumber(event.target.value),
							);
						}}
						onKeyDown={(event) => {
							handleExpenseKeyDown(event, index, 'amount');
						}}
						onMouseDown={(e) => {
							const input = e.currentTarget;

							if (document.activeElement !== input) {
								setTimeout(() => input.select(), 0);
							}
						}}
						className={`${isIntra ? 'h-5' : 'h-4'} w-full bg-transparent px-1 text-right outline-none focus:bg-[#fff9da]`}
					/>
				</td>

				<td className="border border-slate-500 p-0">
					<div className="flex pr-0.5">
						<input
							ref={(element) => {
								expenseRefs.current[`${index}-tax`] = element;
							}}
							type="text"
							inputMode="decimal"
							value={
								isExpenseFocused(index, 'tax')
									? expense.tax
									: formatPercent(expense.tax)
							}
							onFocus={() => {
								setFocusedExpenseCell(`${index}-tax`);
							}}
							onBlur={() => {
								setFocusedExpenseCell(null);
							}}
							onChange={(event) => {
								updateExpense(
									expense.id,
									'tax',
									unformatNumber(event.target.value),
								);
							}}
							onKeyDown={(event) => {
								handleExpenseKeyDown(event, index, 'tax');
							}}
							onMouseDown={(e) => {
								const input = e.currentTarget;

								if (document.activeElement !== input) {
									setTimeout(() => input.select(), 0);
								}
							}}
							className={`${isIntra ? 'h-5' : 'h-4'} w-full bg-transparent px-1 text-right outline-none focus:bg-[#fff9da]`}
						/>
					</div>
				</td>

				<td className="border border-slate-500 p-0">
					<input
						readOnly
						type="text"
						value={currencyFormatter(totalAmount, localeISO, currency, symbol)}
						className={`${isIntra ? 'h-5' : 'h-4'} w-full bg-transparent px-1 text-right outline-none`}
					/>
				</td>
			</tr>
		);
	};

	return (
		<>
			{loading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
					<div className="rounded bg-white px-6 py-3 font-semibold shadow-lg">
						Loading purchase...
					</div>
				</div>
			)}

			<div className="h-dvh w-full overflow-hidden bg-slate-200 p-1 box-border">
				<div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded border border-black bg-white shadow-md">
					<header className="shrink-0 border-b border-slate-300 px-2 py-1 text-[13px]">
						<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
							<div className="flex items-center gap-1">
								<label
									htmlFor="voucherNo"
									className="rounded-xs bg-blue-800 text-center text-[12px] font-bold uppercase text-white w-32"
								>
									{isAlterMode ? 'Sale Order' : 'Sale Order'}
								</label>
								<span className="ml-1 font-semibold text-slate-700 w-6">
									No
								</span>
								:
								<input
									ref={(el) => (headerRefs.current[0] = el)}
									id="voucherNo"
									type="text"
									autoComplete="off"
									value={formData.voucherNo}
									readOnly
									className={`${headerInput} w-28 sm:w-36`}
								/>
							</div>

							<div className="flex items-center gap-2">
								<label
									htmlFor="orderNo"
									className="font-semibold text-slate-700 whitespace-nowrap w-16"
								>
									Order No
								</label>
								:
								<input
									ref={(el) => (headerRefs.current[1] = el)}
									id="orderNo"
									value={formData.orderNo}
									onChange={setField('orderNo')}
									onKeyDown={(e) =>
										handleHeaderKeyDown(e, headerRefs.current[2])
									}
									onMouseDown={(e) => {
										const input = e.currentTarget;

										if (document.activeElement !== input) {
											setTimeout(() => input.select(), 0);
										}
									}}
									className={`${headerInput} w-36 `}
								/>
							</div>

							{/* <div className="flex items-center gap-2">
								<label
									htmlFor="referenceDate"
									className="font-semibold text-slate-700 whitespace-nowrap w-20"
								>
									Invoice Date
								</label>
								:
								<input
									ref={(el) => (headerRefs.current[2] = el)}
									id="referenceDate"
									value={refDateInputText}
									onChange={(e) => setRefDateInputText(e.target.value)}
									onBlur={() =>
										commitDateChange(refDateInputText, 'referenceDate')
									}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();

											const ref = gridRefs.current['0-0'];

											ref?.focus();

											requestAnimationFrame(() => {
												ref?.input?.select();
											});
										}
									}}
									onMouseDown={(e) => {
										const input = e.currentTarget;

										if (document.activeElement !== input) {
											setTimeout(() => input.select(), 0);
										}
									}}
									className={`${headerInput} w-20 text-right`}
								/>
							</div> */}

							<button
								type="button"
								// disabled=}
								onClick={handleInvoicePreview}
								className="flex h-5 items-center gap-1 rounded border border-blue-400 bg-blue-50 px-2 font-semibold text-blue-800 outline-none hover:border-blue-600 hover:bg-blue-100 focus-visible:ring-0 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<Eye size={12} />
								Preview
							</button>

							<div className="flex items-center gap-1 sm:ml-auto">
								<label
									htmlFor="voucherDate"
									className="font-semibold text-slate-700"
								>
									Date
								</label>
								:
								<input
									ref={(el) => (headerRefs.current[0] = el)}
									id="voucherDate"
									type="text"
									value={dateInputText}
									onChange={(e) => setDateInputText(e.target.value)}
									onBlur={() => commitDateChange(dateInputText, 'voucherDate')}
									onKeyDown={(e) =>
										handleHeaderKeyDown(e, headerRefs.current[1])
									}
									onMouseDown={(e) => {
										const input = e.currentTarget;

										if (document.activeElement !== input) {
											setTimeout(() => input.select(), 0);
										}
									}}
									className={`${headerInput} w-22 text-right`}
								/>
								<button
									type="button"
									tabIndex={-1}
									onClick={() => hiddenDateRef.current?.showPicker?.()}
									className="text-slate-700 outline-none hover:text-black"
									aria-label="Open date picker"
								>
									<Calendar size={18} />
								</button>
								<input
									ref={hiddenDateRef}
									type="date"
									value={formData.voucherDate}
									onChange={(e) =>
										commitDateChange(e.target.value, 'voucherDate')
									}
									className="pointer-events-none absolute sr-only"
								/>
							</div>
						</div>

						<div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
							<div className="flex items-center gap-1 ">
								<label
									htmlFor="customerName"
									className="font-semibold text-slate-700 whitespace-nowrap w-40"
								>
									Party Name
								</label>
								:
								{/* <input
									ref={(el) => (headerRefs.current[4] = el)}
									id="customerName"
									type="text"
									autoComplete="off"
									value={formData.customerName}
									// onChange={setField('customerName')}
									// onKeyDown={(e) =>
									// 	handleHeaderKeyDown(e, gridRefs.current['0-0'])
									// }
									// onMouseDown={(e) => {
									// 	const input = e.currentTarget;

									// 	if (document.activeElement !== input) {
									// 		setTimeout(() => input.select(), 0);
									// 	}
									// }}
									readOnly
									className={`${headerInput} w-96.5 `}
								/> 
									*/}
								<GenericSelect
									ref={(el) => (headerRefs.current[2] = el)}
									options={customerOptions}
									placeholder="Select Supplier..."
									title="Suppliers "
									value={
										customerOptions.find(
											(option) =>
												String(option.value) === String(formData.customerName),
										) || null
									}
									onKeyDown={(e) =>{

										console.log()
										handleHeaderKeyDown(e, gridRefs.current['0-0']);
									}
									}
									onChange={(selectedOption) => {
										if (!selectedOption) {
											return;
										}

										console.log(selectedOption);

										setFormData((prev) => ({
											...prev,
											customerName: selectedOption.label,
										}));
									}}
									onSelect={(selectedOption) => {
										if (selectedOption?.isEndOfList) {
											return;
										}

										setTimeout(() => {
											
											gridRefs.current['0-0'];
											// expenseRefs.current[`${index}-amount`]?.select();
										}, 0);
									}}
									labelKey="label"
									valueKey="value"
									inputFocusStyle={{
										border: '1px solid #3B63EB',
									}}
									inputStyle={{
										padding: '0 4px',
										height: '20px',
										width: '386px',
										border: '1px solid #FCD34D',
										backgroundColor: '#fee8af',
									}}
									menuStyle={{
										width: '250px',
										maxWidth: 'calc(100vw - 8px)',
										right: '4px',
										bottom: '4px',
										top: '4px',
									}}
									optionStyle={{
										padding: ' 0.5px 4px',
									}}

									// renderOption={renderProductOption}
								/>
							</div>
							<div className="flex  flex-1 items-center ">
								<label
									htmlFor="Tax Mode"
									className="font-semibold text-slate-700 whitespace-nowrap "
								>
									{/* Tax Mode */}
								</label>
								{/* : */}
								<input
									disabled
									id="taxmode"
									type="text"
									autoComplete="off"
									value={formData.taxMode.toUpperCase()}
									className={`${headerInput} w-20 bg-slate-100 border-slate-100 cursor-not-allowed`}
									onMouseDown={(e) => {
										const input = e.currentTarget;

										if (document.activeElement !== input) {
											setTimeout(() => input.select(), 0);
										}
									}}
								/>
							</div>

							{formData.voucherDate && (
								<span className="ml-1 text-xs font-bold text-blue-800">
									{getDayName(formData.voucherDate)}
								</span>
							)}
						</div>
					</header>

					{/* ============ TABLE ============ */}
					<main className="min-h-0 flex-1 overflow-auto">
						<table className="w-full min-w-225 border-collapse text-[12px]">
							<thead className="sticky top-0 z-10">
								<tr className="bg-slate-300">
									<th className="w-10 border border-slate-400 px-1">S.No</th>

									<th className="w-32 border border-slate-400 px-1.5 text-left">
										Product Code
									</th>

									<th className="min-w-60 border border-slate-400 px-1.5 text-left">
										Product Desc
									</th>

									<th className="w-20 border border-slate-400 px-1.5 text-right">
										Qty
									</th>

									<th className="w-20 border border-slate-400 px-1.5">UOM</th>

									<th className="w-24 border border-slate-400 px-1.5 text-right">
										Rate
									</th>

									<th className="w-20 border border-slate-400 px-1.5 text-right">
										Disc %
									</th>

									<th className="w-20 border border-slate-400 px-1.5 text-right">
										{taxMode.toLocaleLowerCase() === 'vat' ? 'VAT %' : 'GST %'}
									</th>

									<th className="w-28 border border-slate-400 px-1.5 text-right">
										Amount
									</th>
								</tr>
							</thead>

							<tbody>{purchaseItem.map(renderPurchaseRow)}</tbody>
						</table>
					</main>

					{/* ============ COLLAPSE BUTTON ============ */}
					<button
						type="button"
						tabIndex={-1}
						onClick={() => {
							setIsLast((v) => !v);
						}}
						aria-expanded={isLast}
						className="flex h-4.5 shrink-0 items-center justify-between border-t border-slate-400 bg-slate-200 px-2 text-[12px] font-semibold text-slate-700 outline-none focus:bg-amber-200 hover:bg-slate-300"
					>
						<span className="flex items-center gap-1">Tax Breakup</span>
						{isLast ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
						<span className="tabular-nums">
							Grand Total:{' '}
							<b className="text-slate-900">
								{currencyFormatter(totals.net, localeISO, currency, symbol)}
							</b>
						</span>
					</button>

					{/* ============ GST & SUMMARY ============ */}
					{isLast && (
						<section
							className={`grid max-h-[45dvh] shrink-0 grid-cols-1 overflow-y-auto border-slate-400 bg-[#f8f8f8] text-[12px] ${isIntra ? ' md:h-44' : 'md:h-40'} md:max-h-none md:grid-cols-[7fr_3fr] md:overflow-visible `}
						>
							{/* LEFT - GST Slabs */}
							<div className="grid min-h-0 min-w-0 md:grid-rows-[minmax(0,3fr)_minmax(0,2fr)] md:border-r md:border-slate-300">
								{/* Expenses table: fixed maximum five lines */}
								<section className="border-t border-slate-400 bg-[#f8f8f8] pt-1 px-0.5">
									{/* Buttons */}
									<div className="mb-1 flex items-center gap-1">
										<button
											type="button"
											onClick={() => setBottomView('expenses')}
											className={`h-4.5 border px-3 text-xs font-bold ${
												bottomView === 'expenses'
													? 'border-[#173a85] bg-[#173a85] text-white'
													: 'border-slate-400 bg-white text-slate-700 hover:bg-slate-100'
											}`}
										>
											Add On Cost
										</button>

										<button
											type="button"
											onClick={() => setBottomView('tax')}
											className={`h-4.5 border px-3 text-xs font-bold ${
												bottomView === 'tax'
													? 'border-[#173a85] bg-[#173a85] text-white'
													: 'border-slate-400 bg-white text-slate-700 hover:bg-slate-100'
											}`}
										>
											Tax Breakup
										</button>

										<span className="ml-2 text-xs font-semibold text-slate-500">
											{bottomView === 'tax'
												? taxMode.toLowerCase() === 'gst'
													? 'GST tax calculation by tax slab'
													: taxMode.toLowerCase() === 'vat'
														? 'VAT tax calculation by tax slab'
														: 'IGST tax calculation by tax slab'
												: ''}
										</span>
									</div>

									{/* Tax breakup view */}
									{bottomView === 'tax' && (
										<div className="overflow-auto h-37">
											<table className="w-full border-collapse tabular-nums">
												<thead className="bg-slate-200 leading-2.5">
													<tr className="h-3.5">
														<th
															rowSpan={2}
															className="border border-slate-400 px-2 text-center"
														>
															{taxMode.toLowerCase() === 'vat'
																? 'VAT %'
																: 'GST %'}
														</th>

														<th
															rowSpan={2}
															className="border border-slate-400 px-2 text-center w-34"
														>
															Taxable Value
														</th>

														{taxMode.toLowerCase() === 'vat' && (
															<th
																colSpan={2}
																className="border border-slate-400 px-2 text-center w-28"
															>
																VAT
															</th>
														)}

														{taxMode.toLowerCase() === 'gst' &&
															taxType === 'intra' && (
																<>
																	<th
																		colSpan={2}
																		className="border border-slate-400 px-2 text-center text-[11px] w-20"
																	>
																		CGST
																	</th>
																	<th
																		colSpan={2}
																		className="border border-slate-400 px-2 text-center text-[11px] w-20"
																	>
																		SGST / UTGST
																	</th>
																</>
															)}

														{taxMode.toLowerCase() === 'igst' &&
															taxType === 'inter' && (
																<th className="border border-slate-400 px-2 text-right w-20">
																	IGST
																</th>
															)}

														<th
															rowSpan={2}
															className="border border-slate-400 px-2 text-center w-50"
														>
															Total Tax Amount
														</th>
													</tr>
													<tr className="h-3.5">
														<th className="border border-slate-400 px-2 text-[11px] w-26">
															Rate %
														</th>
														<th className="border border-slate-400 px-2 text-[11px] w-26">
															Amount
														</th>
														{taxMode.toLowerCase() === 'gst' &&
															taxType === 'intra' && (
																<>
																	<th className="border border-slate-400 px-2 text-[11px] w-26">
																		Rate %
																	</th>
																	<th className="border border-slate-400 px-2 text-[11px] w-26">
																		Amount
																	</th>
																</>
															)}
													</tr>
												</thead>

												<tbody>
													{totals.slabs.length === 0 ? (
														<tr className="h-4">
															<td
																colSpan={isIntra ? 5 : 4}
																className="border border-slate-300 px-2 text-center text-slate-400"
															>
																No items available for tax calculation
															</td>
														</tr>
													) : (
														totals.slabs.map((slab) => (
															<tr
																key={slab.rate}
																className="h-5 bg-white hover:bg-blue-50"
															>
																<td className="border border-slate-300 px-2 font-semibold text-center">
																	{slab.rate}%
																</td>

																<td className="border border-slate-300 px-2 text-right">
																	{currencyFormatter(
																		slab.taxable,
																		localeISO,
																		currency,
																		symbol,
																	)}
																</td>

																{taxMode.toLowerCase() === 'vat' && (
																	<>
																		<td className="border border-slate-300 px-2 text-right">
																			{slab.rate}%
																		</td>
																		<td className="border border-slate-300 px-2 text-right">
																			{currencyFormatter(
																				slab.vat,
																				localeISO,
																				currency,
																				symbol,
																			)}
																		</td>
																	</>
																)}

																{taxMode.toLowerCase() === 'gst' &&
																	taxType === 'intra' && (
																		<>
																			<td className="border border-slate-300 px-2 text-right">
																				{slab.rate / 2}%
																			</td>
																			<td className="border border-slate-300 px-2 text-right">
																				{currencyFormatter(
																					slab.cgst,
																					localeISO,
																					currency,
																					symbol,
																				)}
																			</td>
																			<td className="border border-slate-300 px-2 text-right">
																				{slab.rate / 2}%
																			</td>

																			<td className="border border-slate-300 px-2 text-right">
																				{currencyFormatter(
																					slab.sgst,
																					localeISO,
																					currency,
																					symbol,
																				)}
																			</td>
																		</>
																	)}

																{taxMode.toLowerCase() === 'igst' &&
																	taxType === 'inter' && (
																		<>
																			<td>{slab.rate}%</td>
																			<td className="border border-slate-300 px-2 text-right">
																				{currencyFormatter(
																					slab.igst,
																					localeISO,
																					currency,
																					symbol,
																				)}
																			</td>
																		</>
																	)}

																<td className="border border-slate-300 px-2 text-right font-semibold">
																	{currencyFormatter(
																		slab.tax,
																		localeISO,
																		currency,
																		symbol,
																	)}
																</td>
															</tr>
														))
													)}
												</tbody>
												<tfoot>
													<tr className="bg-slate-200 font-bold">
														<td className="border border-slate-400 px-2">
															Total
														</td>

														<td className="border border-slate-400 px-2 text-right">
															{currencyFormatter(
																totals.slabs.reduce(
																	(sum, slab) => sum + slab.taxable,
																	0,
																),
																localeISO,
																currency,
																symbol,
															)}
														</td>

														{taxMode.toLowerCase() === 'vat' && (
															<>
																<td className="border border-slate-400"></td>
																<td className="border border-slate-400 px-2 text-right">
																	{currencyFormatter(
																		totals.vat,
																		localeISO,
																		currency,
																		symbol,
																	)}
																</td>
															</>
														)}

														{taxMode.toLowerCase() === 'gst' &&
															taxType === 'intra' && (
																<>
																	<td className="border border-slate-400"></td>
																	<td className="border border-slate-400 px-2 text-right">
																		{currencyFormatter(
																			totals.cgst,
																			localeISO,
																			currency,
																			symbol,
																		)}
																	</td>
																	<td className="border border-slate-400"> </td>
																	<td className="border border-slate-400 px-2 text-right">
																		{currencyFormatter(
																			totals.sgst,
																			localeISO,
																			currency,
																			symbol,
																		)}
																	</td>
																</>
															)}

														{taxMode.toLowerCase() === 'igst' &&
															taxType === 'inter' && (
																<>
																	<td className="border border-slate-400"></td>
																	<td className="border border-slate-400 px-2 text-right">
																		{currencyFormatter(
																			totals.igst,
																			localeISO,
																			currency,
																			symbol,
																		)}
																	</td>
																</>
															)}

														<td className="border border-slate-400 px-2 text-right">
															{currencyFormatter(
																totals.tax,
																localeISO,
																currency,
																symbol,
															)}
														</td>
													</tr>
												</tfoot>
											</table>
										</div>
									)}

									{/* Expenses view */}
									{bottomView === 'expenses' && (
										<div className="overflow-auto">
											<table className="w-full border-collapse border border-slate-500">
												<thead>
													<tr
														className={`${isIntra ? 'h-5.5' : 'h-4.5'} bg-[#dce5ef] text-left text-[12px] font-bold`}
													>
														<th className="w-12 border border-slate-500 px-2 text-center">
															S.No
														</th>

														<th className="border border-slate-500 px-2">
															Particular
														</th>

														<th className="w-40 border border-slate-500 px-2 text-right">
															Rate
														</th>
														<th className="w-40 border border-slate-500 px-2 text-right leading-1">
															Tax %
														</th>

														<th className="w-48 border border-slate-500 px-2 text-right">
															Amount
														</th>
													</tr>
												</thead>

												<tbody>
													{expenses.map(renderExpenseRow)}
													{Array.from({
														length: Math.max(0, MAX_EXP_ROWS - expenses.length),
													}).map((_, index) => (
														<tr
															key={`empty-${index}`}
															className={`${isIntra ? 'h-5' : 'h-4'} bg-white`}
														>
															<td
																className={`${isIntra ? 'h-5' : 'h-4'} border border-slate-500 px-2 text-center text-slate-400`}
															>
																{index + expenses.length + 1}
															</td>
															<td
																className={`${isIntra ? 'h-5' : 'h-4'} border border-slate-500 px-2 text-center text-slate-400`}
															></td>
															<td
																className={`${isIntra ? 'h-5' : 'h-4'} border border-slate-500 px-2 text-right text-slate-400`}
															></td>
															<td
																className={`${isIntra ? 'h-5' : 'h-4'} border border-slate-500 px-2 text-right text-slate-400`}
															></td>
															<td
																className={`${isIntra ? 'h-5' : 'h-4'} border border-slate-500 px-2 text-right text-slate-400`}
															></td>
														</tr>
													))}
												</tbody>

												<tfoot>
													<tr
														className={`${isIntra ? 'h-5.5' : 'h-4'} bg-[#e5ebf1] font-bold`}
													>
														<td
															colSpan={2}
															className="border border-slate-500 px-2 text-right"
														>
															Total Expenses
														</td>
														<td className="border border-slate-500 px-2 text-right">
															{currencyFormatter(
																expenseTotals.taxable,
																localeISO,
																currency,
																symbol,
															)}
														</td>
														<td></td>

														<td className="border border-slate-500 px-2 text-right">
															{currencyFormatter(
																expenseTotals.total,
																localeISO,
																currency,
																symbol,
															)}
														</td>
													</tr>
												</tfoot>
											</table>
										</div>
									)}
								</section>
							</div>

							{/* RIGHT - Summary */}
							<div className="min-w-0 border-t border-slate-300 px-1 font-semibold md:border-t-0 ">
								<Line
									label="Gross Amount"
									value={currencyFormatter(
										totals.gross,
										localeISO,
										currency,
										symbol,
									)}
								/>

								<Line
									label="Discount"
									value={currencyFormatter(
										-totals.discount,
										localeISO,
										currency,
										symbol,
									)}
								/>

								<Line
									label="Taxable Value"
									value={currencyFormatter(
										totals.taxable,
										localeISO,
										currency,
										symbol,
									)}
								/>

								<Line
									label="Add on & Others"
									value={currencyFormatter(
										totals.expenseAmount,
										localeISO,
										currency,
										symbol,
									)}
								/>

								{taxMode.toLowerCase() === 'vat' && (
									<Line
										label="VAT"
										value={currencyFormatter(
											totals.vat,
											localeISO,
											currency,
											symbol,
										)}
									/>
								)}

								{taxMode.toLowerCase() === 'gst' && taxType === 'intra' && (
									<>
										<Line
											label="CGST"
											value={currencyFormatter(
												totals.cgst,
												localeISO,
												currency,
												symbol,
											)}
										/>
										<Line
											label="SGST / UTGST"
											value={currencyFormatter(
												totals.sgst,
												localeISO,
												currency,
												symbol,
											)}
										/>
									</>
								)}

								{taxMode.toLowerCase() === 'igst' && taxType === 'inter' && (
									<Line
										label="IGST"
										value={currencyFormatter(
											totals.igst,
											localeISO,
											currency,
											symbol,
										)}
									/>
								)}

								{taxMode !== 'none' && (
									<Line
										label="Total Tax"
										value={currencyFormatter(
											totals.tax,
											localeISO,
											currency,
											symbol,
										)}
									/>
								)}

								<div className="flex justify-between text-slate-700">
									<label className="flex items-center gap-1">
										<input
											type="checkbox"
											checked={formData.autoRound}
											onChange={(event) =>
												setFormData((current) => ({
													...current,
													autoRound: event.target.checked,
												}))
											}
										/>
										Round off
									</label>

									<span>
										{totals.roundOff > 0 ? '+' : ''}
										{totals.roundOff}
									</span>
								</div>

								<div className="mt-0.5 border-t border-slate-400 pt-0.5 text-[13px]">
									<Line
										label="Net Total"
										value={currencyFormatter(
											totals.netTotal,
											localeISO,
											currency,
											symbol,
										)}
										bold
									/>
								</div>
							</div>
						</section>
					)}

					<footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-400 bg-white px-2 py-1 text-[13px]">
						<div className="flex items-center gap-2">
							{isAdmin ? (
								<>
									<label
										htmlFor="remarks"
										className="whitespace-nowrap font-semibold text-slate-700"
									>
										Admin Approval Status :
									</label>

									<div className="relative w-28">
										<input
											type="text"
											value={formData.voucherStatus}
											readOnly
											onBlur={() => setOpen(false)}
											onMouseDown={(e) => {
												const input = e.currentTarget;

												if (document.activeElement !== input) {
													setTimeout(() => input.select(), 0);
												}
											}}
											onClick={() => setOpen(true)}
											className="w-28 cursor-pointer border border-amber-400 bg-[#fee8af] pl-1 outline-none"
										/>

										{open && (
											<div
												className="absolute bottom-0 left-full z-50 ml-0.5 w-28 border border-slate-400 bg-white"
												onMouseDown={(e) => e.preventDefault()}
											>
												<div className="bg-[#2a67b1] pl-1 font-semibold text-white">
													Select
												</div>

												{['Pending', 'Approved'].map((option) => (
													<div
														key={option}
														onMouseDown={(e) => {
															e.preventDefault();

															setFormData((prev) => ({
																...prev,
																voucherStatus: option,
															}));

															setOpen(false);
														}}
														className={`cursor-pointer px-1 text-black ${
															formData.voucherStatus === option
																? 'bg-yellow-300'
																: 'bg-white hover:bg-yellow-100'
														}`}
													>
														{option}
													</div>
												))}
											</div>
										)}
									</div>
								</>
							) : (
								<>
									<label
										htmlFor="remarks"
										className="whitespace-nowrap font-semibold text-slate-700"
									>
										Remarks:
									</label>

									<input
										ref={remarksRef}
										id="remarks"
										value={formData.narration}
										onChange={setField('narration')}
										onKeyDown={(e) => {
											if (e.key !== 'Enter') return;

											e.preventDefault();
											createdByRef?.current.focus();
										}}
										className={`${headerInput} w-96`}
										onMouseDown={(e) => {
											const input = e.currentTarget;

											if (document.activeElement !== input) {
												setTimeout(() => input.select(), 0);
											}
										}}
									/>
								</>
							)}
						</div>

						<div className="flex items-center gap-2">
							{/* <input
								ref={fileInputRef}
								type="file"
								multiple
								accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
								onChange={handleFiles}
								className="hidden"
							/>

							<button
								type="button"
								onClick={() => {
									fileInputRef.current?.click();
								}}
								className="flex h-5 items-center gap-1 rounded border border-blue-400 bg-blue-50 px-2 font-semibold text-blue-800"
							>
								<Paperclip size={12} />
								Attach File
								{attachments.length > 0 && (
									<span className="rounded-full bg-blue-800 px-1.5 text-[10px] text-white">
										{attachments.length}
									</span>
								)}
							</button>

							{attachmentPreviews.length > 0 && (
								<button
									type="button"
									onClick={() => {
										setShowPreview((current) => !current);
									}}
									className="flex h-5 items-center gap-1 rounded border border-blue-400 bg-blue-50 px-2 font-semibold text-blue-800"
								>
									{showPreview ? (
										<>
											<EyeOff size={12} />
											Hide
										</>
									) : (
										<>
											<Eye size={12} />
											View
										</>
									)}
								</button>
							)} */}

							{isAdmin ? (
								''
							) : (
								<>
									<label
										htmlFor="createdBy"
										className="whitespace-nowrap font-semibold text-slate-700"
									>
										Created by:
									</label>
									<input
										ref={createdByRef}
										id="createdBy"
										value={formData.createdBy}
										onChange={setField('createdBy')}
										className={`${headerInput} w-40`}
										onMouseDown={(e) => {
											const input = e.currentTarget;

											if (document.activeElement !== input) {
												setTimeout(() => input.select(), 0);
											}
										}}
									/>
								</>
							)}
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								className="rounded bg-[#Dc143C] px-5 font-bold text-white shadow hover:bg-[#D91444]"
								onClick={handleCancel}
							>
								Back
							</button>

							{/* Everyone: Save / Update, saves as Pending */}
							<button
								type="button"
								onClick={() => handleSave(false)}
								disabled={loading || saving}
								className="rounded bg-[#2167d5] px-5 font-bold text-white shadow hover:bg-[#1553b5] disabled:cursor-not-allowed disabled:opacity-50"
							>
								{saving ? 'Saving...' : isAlterMode ? 'Update' : 'Save'}
							</button>

							{/* Admin only: Approve */}
							{isAdmin && (
								<button
									type="button"
									onClick={() => handleSave(true)}
									disabled={loading || saving}
									className="rounded bg-green-600 px-5 font-bold text-white shadow hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{saving ? 'Saving...' : 'Save & Approve'}
								</button>
							)}
						</div>
					</footer>

					{/* {showPreview && attachmentPreviews.length > 0 && (
						<section className="shrink-0 border-t border-slate-300 bg-slate-50 px-2 py-1">
							<div className="mb-1 text-xs font-bold text-slate-700">
								Attached Documents
							</div>

							<div className="flex flex-wrap gap-2">
								{attachmentPreviews.map((attachment) => {
									const isImage = attachment.type.startsWith('image/');

									const isPdf = attachment.type === 'application/pdf';

									return (
										<div
											key={attachment.id}
											className="flex w-60 items-center gap-2 border border-slate-300 bg-white p-1 shadow-sm"
										>
											{isImage ? (
												<img
													src={attachment.previewUrl}
													alt={attachment.name}
													className="h-10 w-10 object-cover"
												/>
											) : isPdf ? (
												<div className="flex h-10 w-10 items-center justify-center bg-red-100 text-xs font-bold text-red-700">
													PDF
												</div>
											) : (
												<div className="flex h-10 w-10 items-center justify-center bg-blue-100 text-xs font-bold text-blue-700">
													DOC
												</div>
											)}

											<div className="min-w-0 flex-1">
												<p className="truncate text-xs font-semibold text-slate-700">
													{attachment.name}
												</p>

												<p className="text-[10px] text-slate-500">
													{(attachment.size / 1024).toFixed(1)} KB
												</p>
											</div>

											<button
												type="button"
												onClick={() => {
													setPreviewFile(attachment);
												}}
												className="text-xs font-bold text-blue-700 hover:underline"
											>
												View
											</button>

											<button
												type="button"
												onClick={() => {
													removeAttachment(attachment.id);
												}}
												className="text-xs font-bold text-red-700 hover:underline"
											>
												×
											</button>
										</div>
									);
								})}
							</div>
						</section>
					)} */}
				</div>
			</div>

			{/* {previewFile && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
					<div className="flex h-[95vh] w-full max-w-5xl flex-col bg-white shadow-2xl">
						<div className="flex items-center justify-between border-b border-slate-300 px-3 py-2">
							<div className="min-w-0">
								<p className="truncate text-sm font-bold text-slate-800">
									{previewFile.name}
								</p>

								<p className="text-xs text-slate-500">
									{(previewFile.size / 1024).toFixed(1)} KB
								</p>
							</div>

							<div className="flex items-center gap-3">
								<a
									href={previewFile.previewUrl}
									target="_blank"
									rel="noreferrer"
									className="text-sm font-semibold text-blue-700 hover:underline"
								>
									Open
								</a>

								<button
									type="button"
									onClick={() => {
										setPreviewFile(null);
									}}
									className="rounded border border-slate-400 px-3 text-sm font-semibold hover:bg-slate-100"
								>
									Close
								</button>
							</div>
						</div>

						<div className="min-h-0 flex-1 bg-slate-100 p-2">
							{previewFile.type.startsWith('image/') ? (
								<img
									src={previewFile.previewUrl}
									alt={previewFile.name}
									className="h-full w-full object-contain"
								/>
							) : previewFile.type === 'application/pdf' ? (
								<iframe
									title={previewFile.name}
									src={previewFile.previewUrl}
									className="h-full w-full border-0 bg-white"
								/>
							) : (
								<div className="flex h-full flex-col items-center justify-center gap-3 text-center">
									<p className="text-sm font-semibold text-slate-700">
										This file type cannot be previewed inside the application.
									</p>

									<a
										href={previewFile.previewUrl}
										target="_blank"
										rel="noreferrer"
										className="rounded bg-[#2167d5] px-4 py-2 text-sm font-bold text-white hover:bg-[#1553b5]"
									>
										Open File
									</a>
								</div>
							)}
						</div>
					</div>
				</div>
			)} */}
		</>
	);
};

export default SaleOrder;
