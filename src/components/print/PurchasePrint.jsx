import './purchase.css';
import logo from '../../assets/download.png';
import { amountToWords } from '../../utils/amountToWords';

// const ITEMS_PER_PAGE = 20;

const buyer = {
	name: 'ABC Battery Supply',
	address: [
		"D.No: 4/337, NGGO'S Colony,",
		'3rd Cross, Near IOC Petrol Bunk,',
		'Bagalur Road,',
		'Hosur-635109.',
	],
	gstin: '33AGAPG9692A1ZO',
};

const consignee = {
	name: 'ABC Battery Supply',
	address: [
		"D.No: 4/337, NGGO'S Colony,",
		'3rd Cross, Near IOC Petrol Bunk,',
		'Bagalur Road,',
		'Hosur-635109.',
	],
	gstin: '33AGAPG9692A1ZO',
};

const bank = {
	bankName: 'Emirates NBD Bank P.J.S.C',
	acName: 'Silverline Ventura General Trading LLC',
	acNo: '1025849564302',
	branch: 'Muraqqabath, Dubai, United Arab Emirates',
	iban: 'AE050260001025849564302',
	swift: 'EBILAEAD',
};


// const chunkItems = (items, size) => {
// 	if (!items.length) return [[]];

// 	const pages = [];
// 	for (let i = 0; i < items.length; i += size) {
// 		pages.push(items.slice(i, i + size));
// 	}
// 	return pages;
// };


import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';


const ITEMS_PER_PAGE = 20;

// Keep your existing buyer, consignee, and bank constants here.

const moneyFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function toNumber(value) {
    const number = Number(String(value ?? '').replace(/,/g, '').trim());
    return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
    return moneyFormatter.format(toNumber(value));
}

function chunkItems(items, size) {
    if (!items.length) return [[]];

    const pages = [];

    for (let index = 0; index < items.length; index += size) {
        pages.push(items.slice(index, index + size));
    }

    return pages;
}

function normalizeItem(item) {
    const qty = toNumber(item.qty);
    const rate = toNumber(item.rate);

    const hasTotal =
        item.total !== undefined &&
        item.total !== null &&
        String(item.total).trim() !== '';

    return {
        itemName: item.itemName ?? '',
        description: item.description ?? '',
        colour: item.colour ?? '',
        qty,
        rate,
        total: hasTotal ? toNumber(item.total) : qty * rate,
    };
}

function PartyBlock({ party }) {
    return (
        <div className="qp-party-body">
            <div className="qp-bold">{party.name}</div>

            {(party.address ?? []).map((line, index) => (
                <div key={`${index}-${line}`}>{line}</div>
            ))}

            <div>
                <strong>GST IN</strong> : {party.gstin}
            </div>
        </div>
    );
}

function CompanyHeader() {
    return (
        <header className="po-header">
            <div className="po-logo">
                <img src={logo} alt="Silverline Ventura" />
            </div>

            <div className="po-company">
                <h1>Silverline Ventura</h1>
                <p>501, Burlington Tower</p>
                <p>Business Bay, Dubai, UAE</p>

                <p className="po-company-contact">
                    <span>Email : info@silverlineventura.com</span>
                    <span>Ph.No : +971 4-3219788</span>
                </p>
            </div>
        </header>
    );
}

function OrderParties() {
    return (
        <section className="po-parties">
            <div className="po-cell po-meta">
                <span>
                    <strong>Order No</strong> : 1001
                </span>

                <span>
                    <strong>Customer Id</strong> : 17/10/2026
                </span>
            </div>

            <div className="po-cell po-ref">
                <span>
                    <strong>Order Date</strong> : 17/10/2026
                </span>

                <span>
                    <strong>Expiration Date</strong> : 17/10/2026
                </span>
            </div>

            <div className="po-party po-buyer">
                <div className="po-party-title">Buyer (Bill To)</div>
                <PartyBlock party={buyer} />
            </div>

            <div className="po-party po-consignee">
                <div className="po-party-title">Consignee (Ship To)</div>
                <PartyBlock party={consignee} />
            </div>
        </section>
    );
}

function ItemsTable({ items, pageIndex, isLastPage, totalAmount }) {
    const emptyRows = Math.max(0, ITEMS_PER_PAGE - items.length);

    return (
        <section className="po-items">
            <table>
                <colgroup>
                    <col style={{ width: '5%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '34%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '16%' }} />
                </colgroup>

                <thead>
                    <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">Item Name</th>
                        <th scope="col">Description</th>
                        <th scope="col">Colour</th>
                        <th scope="col">Qty</th>
                        <th scope="col">Rate ($)</th>
                        <th scope="col">Total Amount ($)</th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((item, index) => {
                        const serialNo =
                            pageIndex * ITEMS_PER_PAGE + index + 1;

                        return (
                            <tr key={serialNo} className="print-row">
                                <td>{serialNo}</td>
                                <td>{item.itemName}</td>
                                <td className="desc">{item.description}</td>
                                <td>{item.colour}</td>
                                <td>{item.qty}</td>
                                <td className="amount">
                                    {formatMoney(item.rate)}
                                </td>
                                <td className="amount">
                                    {formatMoney(item.total)}
                                </td>
                            </tr>
                        );
                    })}

                    {Array.from({ length: emptyRows }, (_, index) => (
                        <tr
                            key={`empty-${index}`}
                            className="empty-fill-row"
                            aria-hidden="true"
                        >
                            {Array.from({ length: 7 }, (_, columnIndex) => (
                                <td key={columnIndex}>&nbsp;</td>
                            ))}
                        </tr>
                    ))}
                </tbody>

                {isLastPage && (
                    <tfoot>
                        <tr>
                            <td colSpan={6} className="total-label">
                                Total
                            </td>

                            <td className="amount">
                                {formatMoney(totalAmount)}
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </section>
    );
}

function OrderSummary({ totalAmount }) {
    const bankRows = [
        ['Bank Name', bank.bankName],
        ['A/c Name', bank.acName],
        ['A/c No.', bank.acNo],
        ['Branch', bank.branch],
        ['IBAN', bank.iban],
        ['SWIFT', bank.swift],
    ];

    return (
        <section className="po-summary">
            <div className="po-line po-bold">
                Order Value (In Words) : {amountToWords(totalAmount)}
            </div>

            <div className="po-line">
                <strong>Remarks :</strong>
            </div>

            <div className="po-bank-title">Bank Details</div>

            <div className="po-bank">
                <dl>
                    {bankRows.map(([label, value]) => (
                        <div className="po-bank-row" key={label}>
                            <dt>{label}</dt>
                            <dd>: {value}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            <footer className="po-sign">
                <p>
                    I certify the above to be true and correct to the best
                    of my knowledge.
                </p>

                <div className="po-sign-company">
                    For Silverline Ventura
                </div>

                <div className="po-sign-authority">
                    Authorised Signatory
                </div>
            </footer>
        </section>
    );
}

function PurchasePreviewContent({ data, onClose }) {
    const closeButtonRef = useRef(null);

    useEffect(() => {
        const previouslyFocused = document.activeElement;
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';
        document.body.classList.add('purchase-print-open');

        closeButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.classList.remove('purchase-print-open');
            previouslyFocused?.focus?.();
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const sourceItems = Array.isArray(data?.purchaseItem)
        ? data.purchaseItem
        : [];

    const items = sourceItems.map(normalizeItem);
    const itemPages = chunkItems(items, ITEMS_PER_PAGE);

    // Item subtotal only. Add your actual expenses/tax/discount rules here.
    const totalAmount = items.reduce(
        (sum, item) => sum + item.total,
        0,
    );

    return (
        <div
            className="purchase-print-root"
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-preview-title"
        >
            <div className="purchase-toolbar">
                <span id="purchase-preview-title">
                    Purchase Order Preview
                </span>

                <div className="purchase-toolbar-actions">
                    <button
                        type="button"
                        className="purchase-print-button"
                        onClick={() => window.print()}
                    >
                        Print / Save PDF
                    </button>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="purchase-close-button"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>

            <div className="purchase-preview-pages">
                {itemPages.map((pageItems, pageIndex) => {
                    const isLastPage =
                        pageIndex === itemPages.length - 1;

                    return (
                        <article
                            key={pageIndex}
                            className="purchase-sheet"
                            aria-label={`Purchase order page ${pageIndex + 1}`}
                        >
                            <div className="invoice-type">
                                <span>Purchase Order</span>
                                <span className="copy">(Original)</span>
                            </div>

                            <div className="po-main">
                                <CompanyHeader />
                                <OrderParties />

                                <ItemsTable
                                    items={pageItems}
                                    pageIndex={pageIndex}
                                    isLastPage={isLastPage}
                                    totalAmount={totalAmount}
                                />

                                {isLastPage && (
                                    <OrderSummary
                                        totalAmount={totalAmount}
                                    />
                                )}
                            </div>

                            <footer className="print-footer">
                                <span>
                                    This is a computer-generated purchase order
                                </span>

                                <span className="print-footer-right">
                                    Page {pageIndex + 1} of {itemPages.length}
                                </span>
                            </footer>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}

const  PurchasePrint = ({ data, isOpen, onClose }) => {
    if (!isOpen || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <PurchasePreviewContent data={data} onClose={onClose} />,
        document.body,
    );
}



export default PurchasePrint;
