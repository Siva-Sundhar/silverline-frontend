
	export const createEmptyPurchaseRow = () => ({
		id: crypto.randomUUID(),
		code: '',
		desc: '',
		qty: '',
		uom: '',
		rate: '',
		disc: '',
		tax: '',
		batchItems: [createEmptyBatchRow()],
	});

	export const createEmptyBatchRow = () => ({
		id: crypto.randomUUID(),
		color: '',
		doorType: '',
		seatType: '',
		quantity: '',
		uom: '',
		rate: '',
	});

	export const createEmptyExpenseRow = () => ({
		id: crypto.randomUUID(),
		particular: '',
		amount: '',
		tax: 0,
	});

	

