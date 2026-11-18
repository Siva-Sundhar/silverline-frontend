
const Line = ({ label, value, bold = false }) => {
	return (
		<div
			className={[
				'flex justify-between first:border-t',
				'last:border-0 border-b border-slate-400',
				bold ? 'font-bold text-slate-900' : 'text-slate-700',
				'leading-4.5',
			].join(' ')}
		>
			<span>{label}</span>

			<span className="tabular-nums">{value}</span>
		</div>
	);
};

const PurchaseSummary = ({
    totals,
    formData,
    setFormData,
    taxMode,
    taxType,
    money,
    localeISO,
    currency,
    symbol,
    currencyFormatter,
}) => {
    const handleAutoRoundChange = (event) => {
        setFormData((current) => ({
            ...current,
            autoRound: event.target.checked,
        }));
    };

    return (
        <div className="min-w-0 border border-slate-300 px-1 font-semibold">

            <Line
                label="Gross Amount"
                value={currencyFormatter(
                    totals.gross,
                    localeISO,
                    currency,
                    symbol
                )}
            />

            <Line
                label="Taxable Value"
                value={money(totals.taxable)}
            />

            <Line
                label="Add on & Others"
                value={money(totals.expenseAmount)}
            />

            {/* Move your existing VAT / GST conditional lines here */}

            <div className="flex justify-between text-slate-700">
                <label className="flex items-center gap-1">
                    <input
                        type="checkbox"
                        checked={formData.autoRound}
                        onChange={handleAutoRoundChange}
                    />
                    Round off
                </label>

                <span>
                    {totals.roundOff > 0 ? '+' : ''}
                    {totals.roundOff}
                </span>
            </div>

            <div className="mt-0.5 border-t border-slate-400 pt-0.5 text-[13px]">
                <Line
                    label="Net Total"
                    value={currencyFormatter(
                        totals.netTotal,
                        localeISO,
                        currency,
                        symbol
                    )}
                    bold
                />
            </div>
        </div>
    );
};

export default PurchaseSummary;