// ---------- dates (invalid dates are ignored, never crash) ----------
const parseDate = (v) => {
	const d = new Date(v);
	return Number.isNaN(d.getTime()) ? null : d;
};

const isToday = (v) => {
	const d = parseDate(v);
	return !!d && d.toDateString() === new Date().toDateString();
};

const isThisMonth = (v) => {
	const d = parseDate(v);
	const now = new Date();
	return (
		!!d &&
		d.getFullYear() === now.getFullYear() &&
		d.getMonth() === now.getMonth()
	);
};

const time = (v) => parseDate(v)?.getTime() ?? 0;

// ---------- one common shape for PO / SO / PI ----------
export const normalize = (list, docType) =>
	(Array.isArray(list) ? list : []).map((x) => ({
		id: x.id,
		docType,
		number: x.vchNo,
		date: x.vchDate,
		party: x.supplierName || x.customerName || 'N/A',
		status: String(x.voucherStatus || '').trim().toLowerCase(),
		amount: Number(x.voucherAmount) || 0,
	}));

// ---------- calculations ----------
const totalOf = (docs) => docs.reduce((sum, d) => sum + d.amount, 0);

const summarize = (docs) => {
	const month = docs.filter((d) => isThisMonth(d.date));
	return {
		today: docs.filter((d) => isToday(d.date)).length,
		month: month.length, // orders this month
		value: totalOf(month), // value this month
		open: docs.filter((d) => d.status === 'pending').length,
	};
};

export const buildStats = ({ PO, SO, PI }) => {
	const all = [...PO, ...SO, ...PI];

	const partyMap = {};
	all.forEach((d) => {
		const type = d.docType === 'PO' ? 'Supplier' : 'Customer';
		const key = `${type}|${d.party}`;
		partyMap[key] ??= { name: d.party, type, count: 0, value: 0 };
		partyMap[key].count += 1;
		partyMap[key].value += d.amount;
	});

	return {
		PO: summarize(PO),
		SO: summarize(SO),
		PI: {
			...summarize(PI),
			pendingConversion: PI.filter(
				(d) => d.status !== 'converted' && d.status !== 'cancelled',
			).length,
		},
		convertedThisMonth: PI.filter(
			(d) => d.status === 'converted' && isThisMonth(d.date),
		).length,
		topParties: Object.values(partyMap)
			.sort((a, b) => b.value - a.value)
			.slice(0, 5),
		recent: [...all]
			.sort((a, b) => time(b.date) - time(a.date) || Number(b.id) - Number(a.id))
			.slice(0, 30),
	};
};

// ---------- money ----------
export const formatMoney = (amount, symbol = '') =>
	`${symbol}${Number(amount || 0).toLocaleString(
		symbol === '₹' ? 'en-IN' : 'en-US',
		{ minimumFractionDigits: 2, maximumFractionDigits: 2 },
	)}`;