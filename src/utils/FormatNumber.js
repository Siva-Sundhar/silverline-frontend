export const currencyFormatter = (value, locale, currencyCode, symbol) => {
	const numberValue = typeof value === 'string' ? Number(value) : value;

	if (!Number.isFinite(numberValue)) {
		return '0';
	}

	const formatted = new Intl.NumberFormat(locale || undefined, {
		style: 'currency',
		currency: currencyCode,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(numberValue);

	return currencyCode !== null
		? formatted.replace(/^(\D+)(\d)/, '$1 $2')
		: `${symbol} ${formatted}`;
};

export const formatNumber = (value, locale) => {
	const numberValue =
		value === null || value === undefined || value === '' ? 0 : Number(value);

	if (!Number.isFinite(numberValue)) {
		return '0.00';
	}

	return numberValue.toLocaleString(locale || undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

export const formatPercent = (value, locale) => {
	const n = Number(value);
	if (!Number.isFinite(n)) return '0.00 %';

	

	return `${new Intl.NumberFormat(locale || undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(n)} %`;
};

export const unformatNumber = (value) => {
	return String(value || '').replace(/[^0-9.-]/g, '');
};
