import GenericSelect from "../../../utils/components/GenericSelect";

const PurchaseOrderItemRow = () => {
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
					onKeyDown={(e) => {
						handleGridKeyDown(e, rowIndex, 0);
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
											code: product.itemCode,
											desc: product.productDescription,
											uom: product.uom,
										}
									: row,
							),
						);

						// Open batch form after selecting product
						// if (product.batchOption) {
						// 	setActiveBatchRow(rowIndex);
						// }
						setActiveBatchRow(rowIndex);
					}}
					onSelect={(selectedOption) => {
						if (selectedOption?.isEndOfList) {
							return;
						}

						// setTimeout(() => {
						// 	gridRefs.current[`${rowIndex}-1`]?.focus();
						// }, 0);
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
							: currencyFormatter(currentItem.rate, localeISO, currency, symbol)
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
			<td className="border border-slate-300 bg-slate-50 px-1.5 text-right font-bold tabular-nums">
				{currencyFormatter(
					calculateItemRow(currentItem, taxMode).taxable,
					localeISO,
					currency,
					symbol,
				)}
			</td>
		</tr>
	);
};
export default PurchaseOrderItemRow;
