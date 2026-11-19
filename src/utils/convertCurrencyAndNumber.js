// import { useStore } from "zustand";

	const localeISO = 'en-US'; //useAppStore((s) => s.locale);
	const currencyCode = 'USD'; //useAppStore((s) => s.currency);
	const symbol = '$'; //useAppStore((s) => s.currencySymbol);

export const currencyFormatter = (value) => {
	const numberValue = typeof value === 'string' ? Number(value) : value;

	if (!Number.isFinite(numberValue)) {
		return '0';
	}

	const formatted = new Intl.NumberFormat(localeISO || undefined, {
		style: 'currency',
		currency: currencyCode,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(numberValue);

	return currencyCode !== null
		? formatted.replace(/^(\D+)(\d)/, '$1 $2')
		: `${symbol} ${formatted}`;
};

export const formatNumber = (value) => {
	const numberValue =
		value === null || value === undefined || value === '' ? 0 : Number(value);

	if (!Number.isFinite(numberValue)) {
		return '0.00';
	}

	return numberValue.toLocaleString(localeISO || undefined, {
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
