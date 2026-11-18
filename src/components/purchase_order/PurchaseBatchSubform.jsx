import { X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';

import TableCellSelect from '../../features/purchase_order/components/TableCellSelect.jsx';
import { toast } from 'sonner';

const ColorLabel = ({ color, label }) => (
	<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
		<span
			style={{
				width: 10,
				height: 10,
				borderRadius: '50%',
				backgroundColor: color,
				border: '1px solid #d1d5db',
				flexShrink: 0,
			}}
		/>
		<span
			style={{
				color: color,
			}}
		>
			{label}
		</span>
	</div>
);

const createEmptyBatchRow = (uom = '') => ({
	id: crypto.randomUUID(),
	color: '',
	doorType: '',
	seatType: '',
	quantity: '',
	uom,
	rate: '',
});

const EDITABLE_COLS = [0, 1, 2, 3];

const PurchaseOrderBatchSubform = ({
	item,
	product,
	batchItems = [],
	onChange,
	onSave,
	onClose,
}) => {
	const gridRefs = useRef({});
	const pendingFocus = useRef(null);

	const colorOptions = useMemo(
		() => createOptions(product?.colorCode),
		[product?.colorCode],
	);
	const doorTypeOptions = createOptions(product?.doorType, 'door');

	const seatTypeOptions = createOptions(product?.seatType);

	const colorOptionsWithEnd = useMemo(
		() => [
			{
				label: '♦ End of List',
				value: '__END_OF_LIST__',
				isEndOfList: true,
			},
			...colorOptions,
		],
		[colorOptions],
	);

	const rowColorOptions =
		batchItems.length > 1 ? colorOptionsWithEnd : colorOptions;

	// Focus helper
	const focusAndSelect = (rowIndex, columnIndex) => {
		const control = gridRefs.current[`${rowIndex}-${columnIndex}`];

		control?.focus?.();
		control?.select?.();
	};

	// Initial focus
	useEffect(() => {
		requestAnimationFrame(() => {
			focusAndSelect(0, 0);
		});
	}, []);

	// Focus newly added row after React renders it
	useEffect(() => {
		if (!pendingFocus.current) return;

		const key = pendingFocus.current;

		requestAnimationFrame(() => {
			const control = gridRefs.current[key];

			control?.focus?.();
			control?.select?.();

			pendingFocus.current = null;
		});
	}, [batchItems.length]);

	// Update batch field
	const handleBatchChange = (rowIndex, field, value) => {
		const updated = batchItems.map((batch, index) =>
			index === rowIndex ? { ...batch, [field]: value } : batch,
		);

		onChange(updated);
	};

	// Add batch row
	const addBatchRow = () => {
		const nextRow = batchItems.length;

		pendingFocus.current = `${nextRow}-${EDITABLE_COLS[0]}`;

		onChange([...batchItems, createEmptyBatchRow(product?.uom || item?.uom)]);
	};

	// Keyboard navigation
	const handleGridKeyDown = (e, rowIndex, columnIndex) => {
		if (e.key !== 'Enter') return;

		e.preventDefault();

		const position = EDITABLE_COLS.indexOf(columnIndex);

		if (position === -1) return;

		const isLastColumn = position === EDITABLE_COLS.length - 1;

		// Validate Quantity before moving to another batch row.
		if (isLastColumn) {
			const currentBatch = batchItems[rowIndex];

			if (currentBatch.quantity === '' || Number(currentBatch.quantity) <= 0) {
				focusAndSelect(rowIndex, 3);
				toast.error('Quantity should not empty , Atleast 1 Nos are required');
				return;
			}
		}

		const nextRow = isLastColumn ? rowIndex + 1 : rowIndex;

		const nextColumn = isLastColumn
			? EDITABLE_COLS[0]
			: EDITABLE_COLS[position + 1];

		if (nextRow >= batchItems.length) {
			addBatchRow();
			return;
		}

		focusAndSelect(nextRow, nextColumn);
	};

	const handleEndOfList = (rowIndex) => {
		const updatedBatchItems = batchItems.filter(
			(_, index) => index !== rowIndex,
		);

		// If the selected row is the last row, save and close.
		if (rowIndex === batchItems.length - 1) {
			saveBatchRows(updatedBatchItems);
			return;
		}

		// Otherwise delete only this row and focus the next row.
		pendingFocus.current = {
			rowIndex,
			columnIndex: 0,
		};

		onChange(updatedBatchItems);
	};

	const saveBatchRows = (rows) => {
		const rate = Number(item?.rate || 0);

		const updatedBatchItems = rows.map((batch) => {
			const quantity = Number(batch.quantity || 0);

			return {
				...batch,
				quantity,
				uom: product?.uom || item?.uom || '',
				amount: Number((quantity * rate).toFixed(2)),
			};
		});

		const totalQty = updatedBatchItems.reduce(
			(total, batch) => total + batch.quantity,
			0,
		);

		const totalAmount = updatedBatchItems.reduce(
			(total, batch) => total + batch.amount,
			0,
		);

		onSave({
			batchItems: updatedBatchItems,
			totalQty,
			totalAmount: Number(totalAmount.toFixed(2)),
		});
	};

	

	// const handleSave = () => {
	// 	const rate = Number(item?.rate || 0);

	// 	const updatedBatchItems = batchItems.map((batch) => {
	// 		const quantity = Number(batch.quantity || 0);

	// 		return {
	// 			...batch,
	// 			quantity,
	// 			uom: product?.uom || item?.uom || '',
	// 			amount: Number((quantity * rate).toFixed(2)),
	// 		};
	// 	});

	// 	const totalQty = updatedBatchItems.reduce(
	// 		(total, batch) => total + batch.quantity,
	// 		0,
	// 	);

	// 	const totalAmount = updatedBatchItems.reduce(
	// 		(total, batch) => total + batch.amount,
	// 		0,
	// 	);

	// 	onSave({
	// 		batchItems: updatedBatchItems,
	// 		totalQty,
	// 		totalAmount: Number(totalAmount.toFixed(2)),
	// 	});
	// };

	// Total qty Calculation
	const totalQty = batchItems.reduce(
		(total, batch) => total + Number(batch.quantity || 0),
		0,
	);
	const totalAmt = batchItems.reduce(
		(total, batch) => total + Number(batch.rate || 0),
		0,
	);

	return (
		<div className="fixed inset-0 z-999 flex h-dvh bg-black/40 p-5 backdrop-blur-sm">
			<div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded border border-black/70 bg-white p-2">
				<div className="flex items-center justify-between gap-3 border border-slate-400 px-2 py-1 border-b-0">
					{/* Header */}
					<div className="min-w-0 ">
						<div className="flex items-center gap-2">
							<h3 className="text-sm font-semibold text-gray-800">
								Item Allocation
							</h3>

							<span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700">
								{item?.code}
							</span>
						</div>

						<p className="mt-0.5 truncate text-xs italic text-gray-500">
							{item?.desc}
						</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
					>
						<X size={17} />
					</button>
				</div>

				{/* <hr className="border-slate-400 " /> */}

				{/* Batch Table */}
				<main className="custom-scrollbar relative box-border flex min-h-0 flex-1 flex-col overflow-auto border border-slate-400">
					<table className="w-full min-w-56.25 border-collapse  border-slate-400 text-[12px]">
						<thead>
							<tr className="bg-slate-100  text-[12px] text-slate-600">
								<th className="first:border-l-0 border-x border-slate-400 px-2 w-4">
									S.No
								</th>
								<th className="border-x border-slate-400 px-2 w-40">Color</th>
								<th className="border-x border-slate-400 px-2 w-40">
									Door Type
								</th>
								<th className="border-x border-slate-400 px-2 w-40">
									Seat Type
								</th>
								<th className="border-x border-slate-400 px-2 w-20 text-right">
									Quantity
								</th>
								<th className="border-x border-slate-400 px-2 w-20 text-center">
									UOM
								</th>
								<th className="last:border-r-0 border-x border-slate-400 px-2 w-20 text-right">
									Amount
								</th>
							</tr>
						</thead>

						<tbody>
							{batchItems.map((batch, rowIndex) => (
								<tr key={rowIndex}>
									<td className="first:border-l-0 border border-slate-400 text-center h-4.50 ">
										{rowIndex + 1}
									</td>

									{/* color */}
									<td className="border border-slate-400">
										<TableCellSelect
											inputRef={(el) =>
												(gridRefs.current[`${rowIndex}-0`] = el)
											}
											title="Select Color"
											formatOptionLabel={(option) => (
												<ColorLabel color={option.value} label={option.label} />
											)}
											options={rowColorOptions}
											value={batch.color}
											onChange={(option) => {
												if (option?.isEndOfList) {
													handleEndOfList(rowIndex);
													return;
												}

												handleBatchChange(
													rowIndex,
													'color',
													option?.value || '',
												);
											}}
											onEnter={() =>
												handleGridKeyDown(
													{
														key: 'Enter',
														preventDefault() {},
													},
													rowIndex,
													0,
												)
											}
										/>
									</td>

									{/* Door Type */}
									<td className="border border-slate-400">
										<TableCellSelect
											inputRef={(el) =>
												(gridRefs.current[`${rowIndex}-1`] = el)
											}
											title="Select Door Type"
											formatOptionLabel={(option) => option.label}
											options={doorTypeOptions}
											value={batch.doorType}
											onChange={(option) =>
												handleBatchChange(
													rowIndex,
													'doorType',
													option?.value || '',
												)
											}
											onEnter={() =>
												handleGridKeyDown(
													{ key: 'Enter', preventDefault() {} },
													rowIndex,
													1,
												)
											}
										/>
									</td>

									{/* Seat Type */}
									<td className="border border-slate-400">
										<TableCellSelect
											inputRef={(el) =>
												(gridRefs.current[`${rowIndex}-2`] = el)
											}
											title="Select Seat Type"
											formatOptionLabel={(option) => option.label}
											options={seatTypeOptions}
											value={batch.seatType}
											onChange={(option) =>
												handleBatchChange(
													rowIndex,
													'seatType',
													option?.value || '',
												)
											}
											onEnter={() =>
												handleGridKeyDown(
													{ key: 'Enter', preventDefault() {} },
													rowIndex,
													2,
												)
											}
										/>
									</td>
									{/* Quantity */}
									<td className="border border-slate-400">
										<input
											ref={(el) => (gridRefs.current[`${rowIndex}-3`] = el)}
											type="text"
											value={batch.quantity}
											onChange={(e) =>
												handleBatchChange(rowIndex, 'quantity', e.target.value)
											}
											onKeyDown={(e) => handleGridKeyDown(e, rowIndex, 3)}
											className="h-4.50 w-full px-1 text-right outline-none focus:bg-blue-50"
										/>
									</td>

									{/* UOM */}
									<td className="border border-slate-400 text-center h-4.50">
										{batch?.uom || product?.uom || item?.uom}
									</td>

									{/* Total */}
									<td className="last:border-r-0 border border-slate-400 px-1 text-right h-4.50 text-">
										{(
											Number(item.quantity || 0) * Number(item?.rate || 0)
										).toFixed(2)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</main>
				<table className="w-full border-collapse border border-t-0 border-slate-400 text-[12px] table-fixed">
					<colgroup>
						<col className="w-4" />
						<col className="w-40" />
						<col className="w-40" />
						<col className="w-40" />
						<col className="w-20" />
						<col className="w-20" />
						<col className="w-20" />
					</colgroup>

					<tfoot>
						<tr>
							<td className="h-6 " />
							<td className=" " />
							<td className=" " />
							<td className="border-0 border-slate-400 px-2 text-right font-bold">
								Total Quantity
							</td>
							<td className="border-x border-slate-400 px-1 text-right font-bold">
								{totalQty}
							</td>
							<td className="border-x border-slate-400 text-right font-bold px-2">Total Amount </td>
							<td className="border-x border-slate-400 last:border-r-0 font-bold text-right px-2" >{totalAmt}</td>
						</tr>
					</tfoot>
				</table>

				{/* <footer className="last:border-t-0 border border-slate-400 p-1">
					<div className="flex justify-end gap-2">
						<button
							type="button"
							onClick={handleSave}
							className="rounded bg-blue-500 px-4 text-white hover:bg-blue-600"
						>
							Save
						</button>
					</div>
				</footer> */}
			</div>
		</div>
	);
};

const createOptions = (value, type = 'default') => {
	if (value == null || !String(value).trim()) {
		return [{ value: 'NA', label: 'Not Applicable' }];
	}

	const values = String(value)
		.split(/[,/\\.-]+/)
		.map((item) => item.trim())
		.filter(Boolean);

	if (values.length === 0) {
		return [{ value: 'NA', label: 'Not Applicable' }];
	}

	return values.map((item) => {
		let label = item;

		if (type === 'door') {
			if (item.toUpperCase() === 'YES') label = 'Yes';
			if (item.toUpperCase() === 'NO') label = 'No';
		}

		return {
			value: item,
			label,
		};
	});
};

export default PurchaseOrderBatchSubform;
