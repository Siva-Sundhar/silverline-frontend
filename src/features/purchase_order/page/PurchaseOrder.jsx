
import PurchaseOrderHeader from '../components/PurchaseOrderHeader';
import PurchaseOrderItemTable from '../components/PurchaseOrderItemTable';
import usePurchaseOrderHook from '../hooks/usePurchaseOrderHook';




const PurchaseOrder = ({ orderId }) => {


	const {
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
		handleEndOfList,

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
		handleSave,
	} = usePurchaseOrderHook(orderId);

	
	
	
	
	

	return (
		<div className="h-dvh w-full overflow-hidden bg-slate-200 p-1 box-border">
			<div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded border border-black bg-white shadow-md">
				<PurchaseOrderHeader
					formData={formData}
					commitDateChange={commitDateChange}
					registerHeaderRef={registerHeaderRef}
					isAlterMode={isAlterMode}
					setField={setField}
					focusHeaderRef={focusHeaderRef}
					focusFirstGridCell = {focusFirstGridCell}
					
					
				/>
				<main className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-auto relative">
					<PurchaseOrderItemTable
						items={purchaseItems}
						setPurchaseItems={setPurchaseItems}
						totals={totals}
						open={open}
						setOpen={setOpen}
						registerGridRef={registerGridRef}
						focusGridRef={focusGridRef}
						setFocusedCell={setFocusedCell}
						focusedCell={focusedCell}
						focusExpenseRef={focusExpenseRef}
						activeBatchRow={activeBatchRow}
						setActiveBatchRow={setActiveBatchRow}
						rowProductOptions={rowProductOptions}
						productOptions={productOptions}
						updateRow={updateRow}
						remarksRef={remarksRef}
						handleEndOfList={handleEndOfList}
						handleGridKeyDown={handleGridKeyDown}
					/>
					{
						openView && (
							<BOtt
						)
					}
				</main>
			</div>
		</div>
	);
};
export default PurchaseOrder;
