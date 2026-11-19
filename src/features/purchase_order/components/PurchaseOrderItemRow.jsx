import GenericSelect from '../../../utils/components/GenericSelect';
import { currencyFormatter, formatNumber, unformatNumber } from '../../../utils/convertCurrencyAndNumber';

const PurchaseOrderItemRow = ({
	currentItem,
	rowIndex,
	productOptions,
	rowProductOptions,
	handleGridKeyDown,
	handleEndOfList,
	setActiveBatchRow,
	setFocusedCell,
	focusedCell,
	registerGridRef,
	updateRow,
}) => {
	const isFocused = (rowIndex, field) => {
		return focusedCell === `${rowIndex}-${field}`;
	};

	const cellHandlers = (rowIndex, field, columnIndex) => ({
		ref: registerGridRef(rowIndex, columnIndex),

		onKeyDown: (event) => handleGridKeyDown(event, rowIndex, columnIndex),

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

	const selectedProductOption =
		productOptions?.find(
			(option) => String(option.value) === String(currentItem.code),
		) || null;

	const handleProductChange = (selectedOption) => {
		if (!selectedOption) return;

		if (selectedOption.isEndOfList) {
			handleEndOfList(rowIndex);
			return;
		}

		const product = selectedOption.product;

		if (!product) return;

		updateRow(rowIndex, 'code', product.itemCode);
		updateRow(rowIndex, 'desc', product.productDescription);
		updateRow(rowIndex, 'uom', product.uom);

		setActiveBatchRow(rowIndex);
	};

	const handleProductSelect = (selectedOption) => {
		if (selectedOption?.isEndOfList) return;

		// focusAndSelectGridCell(rowIndex, 1);
	};

	const renderProductOption = (option) => {
		if (option.isEndOfList) {
			return <div className="px-2 font-bold text-red-700">♦ End of List</div>;
		}

		const product = option.product;

		return (
			<div className="grid grid-cols-[100px_minmax(0,1fr)_50px_85px] items-center gap-2 px-2">
				<span className="font-semibold">{product.itemCode}</span>

				<span className="truncate">{product.productDescription}</span>

				<span className="text-center font-medium">{product.uom}</span>
				{/* <span className="text-right font-medium">{currencyFormatter(product.rate)}</span> */}
				{/* <span className="text-right font-medium">{`${product.taxRate} %`}</span> */}
			</div>
		);
	};

	return (
		<tr className="hover:bg-blue-50">
			<td className="border border-slate-300 bg-slate-100 text-center font-bold text-slate-500">
				{rowIndex + 1}
			</td>

			{/* Product Code - col 0 */}
			<td className="border border-slate-300 bg-slate-50">
				<GenericSelect
					ref={registerGridRef(rowIndex, 0)}
					options={rowProductOptions}
					placeholder="Select Product..."
					title="Products"
					value={selectedProductOption}
					onKeyDown={(e) => {
						handleGridKeyDown(e, rowIndex, 0);
					}}
					onChange={handleProductChange}
					onSelect={handleProductSelect}
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
						<div className="grid grid-cols-[100px_minmax(0,1fr)_55px_85px] gap-2 ">
							<span>Code</span>
							<span>Product Name</span>
							<span className="text-center">UOM</span>
							{/* <span className="text-right pr-1.5">Rate</span> */}
							{/* <span className="text-right">Tax (%)</span> */}
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
							: formatNumber(currentItem.qty)
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
					// inputMode="decimal"
					value={
						isFocused(rowIndex, 'rate') ? currentItem.rate : currencyFormatter(currentItem.rate)
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

			{/* Doller - col 4 */}
			{/* <td className="border border-slate-300 bg-slate-50">
					<div className="flex pr-1">
						<input
							{...cellHandlers(rowIndex, 'doller', 3)}
							type="text"
							inputMode="decimal"
							value={
								isFocused(rowIndex, 'doller')
									? currentItem.doller
									: formatNumber(currentItem.doller, localeISO)
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
				</td>  */}
			{/* <td className="border border-slate-300 bg-slate-50">
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
				</td> */}

			{/* GST - col 4 (last editable) */}
			{/* <td className="border border-slate-300 bg-slate-50">
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
				</td> */}

			{/* Amount */}
			<td className="border border-slate-300 bg-slate-50 px-1.5 text-right font-bold tabular-nums"></td>
		</tr>
	);
};
export default PurchaseOrderItemRow;
