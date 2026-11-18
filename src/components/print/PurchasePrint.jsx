import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './purchase.css';
import logo from '../../assets/download.png';
import { amountToWords } from '../../utils/amountToWords';

// Tune these two numbers to match your row height
const ROWS_ON_FULL_PAGE = 38; // pages with only the items table
const ROWS_ON_LAST_PAGE = 25; // last page also has total + summary, so fewer rows

/* ---------- Static data ---------- */

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

const consignee = buyer; // same details for now

const bankRows = [
	['Bank Name', 'Emirates NBD Bank P.J.S.C'],
	['A/c Name', 'Silverline Ventura General Trading LLC'],
	['A/c No.', '1025849564302'],
	['Branch', 'Muraqqabath, Dubai, United Arab Emirates'],
	['IBAN', 'AE050260001025849564302'],
	['SWIFT', 'EBILAEAD'],
];

/* ---------- Helpers ---------- */

const toNumber = (value) => {
	const n = Number(String(value ?? '').replace(/,/g, '').trim());
	return Number.isFinite(n) ? n : 0;
};

const formatMoney = (value) =>
	toNumber(value).toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

// Turn the raw item into what the table needs
const normalizeItem = (item) => {
	const qty = toNumber(item.qty);
	const rate = toNumber(item.rate);
	const hasTotal = String(item.total ?? '').trim() !== '';

	return {
		name: item.itemName ?? '',
		description: item.desc ?? '',
		colour: item.colour ?? '',
		qty,
		rate,
		total: hasTotal ? toNumber(item.total) : qty * rate,
	};
};

// Split items into pages. Last page holds fewer rows (it has the summary).
// Returns [{ items, start }, ...] where start = number of items before this page.
const splitIntoPages = (items) => {
	const pages = [];
	let start = 0;

	while (items.length - start > ROWS_ON_LAST_PAGE) {
		const count = Math.min(ROWS_ON_FULL_PAGE, items.length - start - 1);
		pages.push({ items: items.slice(start, start + count), start });
		start += count;
	}

	pages.push({ items: items.slice(start), start }); // last page
	return pages;
};

/* ---------- Small pieces ---------- */

function Party({ title, party, className }) {
	return (
		<div className={`po-party ${className}`}>
			<div className="po-party-title">{title}</div>
			<div className="qp-party-body">
				<div className="qp-bold">{party.name}</div>
				{party.address.map((line) => (
					<div key={line}>{line}</div>
				))}
				<div>
					<strong>GST IN</strong> : {party.gstin}
				</div>
			</div>
		</div>
	);
}

function Header() {
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

function OrderInfo({data}) {
	return (
		<section className="po-parties">
			<div className="po-cell po-meta">
				<span className=''><strong>Order No : </strong> {data.formData.voucherNo}</span>
				<span className=''><strong>Customer Id</strong> : </span>
			</div>
			<div className="po-cell po-ref">
				<span><strong>Order Date</strong> : 14/11/2026</span>
				<span><strong>Expiration Date</strong> : 30/11/2026</span>
			</div>

			<Party title="Buyer (Bill To)" party={buyer} className="po-buyer" />
			<Party title="Consignee (Ship To)" party={consignee} className="po-consignee" />
		</section>
	);
}

const COLUMN_WIDTHS = ['5%', '10%', '36.25%', '15%', '6%', '14%', '16%'];

function Columns() {
	return (
		<colgroup>
			{COLUMN_WIDTHS.map((w, i) => (
				<col key={i} style={{ width: w }} />
			))}
		</colgroup>
	);
}

// Pages with fewer rows than this get blank rows, so a tiny order doesn't get giant rows
const MIN_ROWS = 12;

// The table is stretched by CSS to use the full page height,
// so the rows simply grow to fill whatever space is left.
function ItemsTable({ items, start, isLastPage, totalAmount }) {
	const blankRows = Math.max(0, MIN_ROWS - items.length);

	return (
		<section className="po-items">
			<table>
				<Columns />

				<thead>
					<tr>
						<th>S.No</th>
						<th>Item Name</th>
						<th>Description</th>
						<th>Colour</th>
						<th>Qty</th>
						<th>Rate ($)</th>
						<th>Total Amount ($)</th>
					</tr>
				</thead>

				<tbody>
					{items.map((item, i) => (
						<tr key={i} className="print-row">
							<td>{start + i + 1}</td>
							<td>{item.oem || 'Hero'}</td>
							<td className="desc">{item.description}</td>
							<td>{item.colour }</td>
							<td>{item.qty}</td>
							<td className="amount">{formatMoney(item.rate)}</td>
							<td className="amount">{formatMoney(item.total)}</td>
						</tr>
					))}

					{Array.from({ length: blankRows }, (_, i) => (
						<tr key={`blank-${i}`} className="print-row" aria-hidden="true">
							{Array.from({ length: 7 }, (_, c) => (
								<td key={c}>&nbsp;</td>
							))}
						</tr>
					))}
				</tbody>

				{isLastPage && (
					<tfoot>
						<tr>
							<td colSpan={6} className="total-label">Total</td>
							<td className="amount">{formatMoney(totalAmount)}</td>
						</tr>
					</tfoot>
				)}
			</table>
		</section>
	);
}

function Summary({ totalAmount }) {
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
				<p>I certify the above to be true and correct to the best of my knowledge.</p>
				<div className="po-sign-company">For Silverline Ventura</div>
				<div className="po-sign-authority">Authorised Signatory</div>
			</footer>
		</section>
	);
}

/* ---------- Main preview ---------- */

function PreviewContent({ data, onClose }) {
	// Lock page scroll, add print class, close on Escape
	useEffect(() => {
		const oldOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		document.body.classList.add('purchase-print-open');

		const onKeyDown = (e) => e.key === 'Escape' && onClose?.();
		document.addEventListener('keydown', onKeyDown);

		return () => {
			document.body.style.overflow = oldOverflow;
			document.body.classList.remove('purchase-print-open');
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [onClose]);

	const items = (data?.purchaseItem ?? []).map(normalizeItem);
	const pages = splitIntoPages(items);
	const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

	return (
		<div className="purchase-print-root" role="dialog" aria-modal="true">
			<div className="purchase-toolbar">
				<span>Purchase Order Preview</span>

				<div className="purchase-toolbar-actions">
					<button type="button" className="purchase-print-button" onClick={() => window.print()}>
						Print / Save PDF
					</button>
					<button type="button" className="purchase-close-button" onClick={onClose}>
						Close
					</button>
				</div>
			</div>

			<div className="purchase-preview-pages">
				{pages.map((page, pageIndex) => {
					const isLastPage = pageIndex === pages.length - 1;

					return (
						<article key={pageIndex} className="purchase-sheet">
							<div className="invoice-type">
								<span>Purchase Order</span>
								<span className="copy">(Original)</span>
							</div>

							<div className="po-main">
								<Header />
								<OrderInfo data= {data}/>
								<ItemsTable
									items={page.items}
									start={page.start}
									isLastPage={isLastPage}
									totalAmount={totalAmount}
								/>
								{isLastPage && <Summary totalAmount={totalAmount} />}
							</div>

							<footer className="print-footer">
								<span>This is a computer-generated purchase order</span>
								<span className="print-footer-right">
									Page {pageIndex + 1} of {pages.length}
								</span>
							</footer>
						</article>
					);
				})}
			</div>
		</div>
	);
}

export default function PurchasePrint({ data, isOpen, onClose }) {
	if (!isOpen) return null;

	return createPortal(
		<PreviewContent data={data} onClose={onClose} />,
		document.body,
	);
}
