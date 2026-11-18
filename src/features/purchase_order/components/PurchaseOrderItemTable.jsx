import PurchaseOrderItemRow from './PurchaseOrderItemRow.jsx';

const PurchaseOrderItemTable = ({
	purchaseItems,
	taxMode,
	focusedCell,
	rowProductOptions,
	registerGridRef,
	focusAndSelectGridCell,
	handleGridKeyDown,
	updateRow,
	handleEndOfList,
	setActiveBatchRow,
	renderProductOption,
	totals,
}) => {
	return (
		<table className="w-full min-w-225 border-collapse text-[12px] border-t border-slate-400">
			<thead className="sticky top-0 z-10 border-t ">
				<tr className="bg-slate-300 border-t">
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
						Rate ($)
					</th>

					{/* <th className="w-20 border border-slate-400 px-1.5 text-right">
										Disc %
									</th> */}
					{/* <th className="w-25 border border-slate-400 px-1.5 text-right">
										Doller Value
									</th> */}

					{/* <th className="w-20 border border-slate-400 px-1.5 text-right">
										{taxMode.toLocaleLowerCase() === 'vat' ? 'VAT %' : 'GST %'}
									</th> */}

					<th className="w-28 border border-slate-400 px-1.5 text-right">
						Amount ($)
					</th>
				</tr>
			</thead>

			<tbody onFocus={() => open && setOpen(false)}>
				
				<PurchaseOrderItemRow />
			</tbody>

			<tfoot>
				<tr>
					<td colSpan={7}> &nbsp;</td>
				</tr>
				<tr className="">
					<td colSpan={6}></td>

					<td className="text-right pr-1.5 border-y border-slate-300 font-semibold">
						{'money(totals.itemTaxable)'}
					</td>
				</tr>
			</tfoot>
		</table>
	);
};
export default PurchaseOrderItemTable;
