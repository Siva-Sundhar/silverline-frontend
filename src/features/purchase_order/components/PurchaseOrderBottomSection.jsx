const PurchaseBottomSection = ({
    openView,
    setOpenView,
    expenses,
    expenseTotals,
    totals,
    formData,
    setFormData,
    taxMode,
    taxType,
    isIntra,
    localeISO,
    currency,
    symbol,
    money,
    currencyFormatter,
    renderExpenseRow,
    bottomRef,
}) => {
    return (
        <section
            ref={bottomRef}
            className={`mt-auto grid shrink-0 border-slate-400 bg-[#f8f8f8] text-[12px]
                ${isIntra ? 'md:h-44.5' : 'md:h-40.5'}
                md:grid-cols-[70%_30%] md:overflow-visible`}
        >
            {/* LEFT: Expenses / Tax */}
            <div className="min-w-0 md:border md:border-slate-400">

                <PurchaseBottomTabs
                    openView={openView}
                    setOpenView={setOpenView}
                    taxMode={taxMode}
                />

                {openView === 'tax' && (
                    <PurchaseTaxBreakup
                        totals={totals}
                        taxMode={taxMode}
                        taxType={taxType}
                        isIntra={isIntra}
                        localeISO={localeISO}
                        currency={currency}
                        symbol={symbol}
                        currencyFormatter={currencyFormatter}
                    />
                )}

                {openView === 'expenses' && (
                    <PurchaseExpenseTable
                        expenses={expenses}
                        expenseTotals={expenseTotals}
                        renderExpenseRow={renderExpenseRow}
                        localeISO={localeISO}
                        currency={currency}
                        symbol={symbol}
                        currencyFormatter={currencyFormatter}
                        isIntra={isIntra}
                    />
                )}
            </div>

            {/* RIGHT: Summary */}
            <PurchaseSummary
                totals={totals}
                formData={formData}
                setFormData={setFormData}
                taxMode={taxMode}
                taxType={taxType}
                money={money}
                localeISO={localeISO}
                currency={currency}
                symbol={symbol}
                currencyFormatter={currencyFormatter}
            />
        </section>
    );
};

export default PurchaseBottomSection;