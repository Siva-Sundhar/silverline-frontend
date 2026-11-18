import { useRef, useState } from 'react';
import { formatGenericDate, toISODate } from '../../../utils/FormatGenericDate';
import PurchaseOrderHeader from '../components/PurchaseOrderHeader';
import PurchaseOrderItemTable from '../components/PurchaseOrderItemTable';
import usePurchaseOrderForm from '../hooks/usePurchaseOrderfORM';

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
		updateRow,

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
		focusedExpenseCell,
		activeBatchRow,
		setActiveBatchRow,

		// actions
		validatePurchaseForm,
		handleSave,
	} = usePurchaseOrderForm(orderId);
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
						totals={totals}
						open={open}
						setOpen={setOpen}
						focusGridRef={focusGridRef}
						activeBatchRow={activeBatchRow}
						setActiveBatchRow={setActiveBatchRow}
						
						
					/>
				</main>
			</div>
		</div>
	);
};
export default PurchaseOrder;
