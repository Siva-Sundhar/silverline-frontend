import './PrintPage.css';

const fmt = (n) =>
	Number(n || 0).toLocaleString('en-IN', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

const data = {
	company: {
		name: 'Silverline Ventura',
		address: ['501, Burlington Tower', 'Business Bay, Dubai, UAE'],
		// gst: '',
		// msme: '',
		email: 'info@silverlineventura.com',
		logo: '',
		seal: '',
		signature: '/signature.png',
	},
	quote: { title: 'Purchase Order', no: 'PO/0001/26-27', date: '29-10-2026' },
	buyer: {
		name: 'ABC BAttery Supply',
		address: [
			"D.No: 4/337, NGGO'S Colony,",
			'3rd Cross, Near IOC Petrol Bunk,',
			'Bagalur Road,',
			'Hosur-635109.',
		],
		gstin: '33AGAPG9692A1ZO',
	},
	consignee: {
		name: 'ABC Battery Supply',
		address: [
			"D.No: 4/337, NGGO'S Colony,",
			'3rd Cross, Near IOC Petrol Bunk,',
			'Bagalur Road,',
			'Hosur-635109.',
		],
		gstin: '33AGAPG9692A1ZO',
	},
	items: [
		{
			desc: 'Ape Auto DX HG 435CC Passenger',
			hsn: '998313',
			gst: 18,
			qty: 1,
			uom: "No's",
			rate: 7200,
			amount: 7200,
			taxLines: [
				{ label: 'Output CGST 9% A/c', amount: 648 },
				{ label: 'Output SGST 9% A/c', amount: 648 },
			],
		},
		{
			desc: 'Ape Auto DX HG 435CC Passenger',
			hsn: '998313',
			gst: 18,
			qty: 1,
			uom: "No's",
			rate: 7200,
			amount: 7200,
			taxLines: [
				{ label: 'Output CGST 9% A/c', amount: 648 },
				{ label: 'Output SGST 9% A/c', amount: 648 },
			],
		},
		{
			desc: 'Ape Auto DX HG 435CC Passenger',
			hsn: '998313',
			gst: 18,
			qty: 1,
			uom: "No's",
			rate: 7200,
			amount: 7200,
			taxLines: [
				{ label: 'Output CGST 9% A/c', amount: 648 },
				{ label: 'Output SGST 9% A/c', amount: 648 },
			],
		},
	],
	amountInWords: 'INR Eight Thousand Four Hundred Ninety Six Only',
	remarks: '',
	bank: {
		bankName: 'Emirates NBD Bank P.J.S.C',
		acName: 'Silverline Ventura General Trading LLC',
		acNo: '1025849564302',
		branch: 'Muraqqabath, Dubai, United Arab Enirates',
		iban: 'AE050260001025849564302',
		swift: 'EBILAEAD',
	},
};

export default function PrintPage() {
	const {
		company,
		quote,
		buyer,
		consignee,
		items,
		bank,
		amountInWords,
		remarks,
	} = data;

	const total = items.reduce(
		(sum, it) =>
			sum + it.amount + it.taxLines.reduce((s, t) => s + t.amount, 0),
		0,
	);

	return (
		<>
			<div className="no-print qp-toolbar">
				<button onClick={() => window.print()}>Print</button>
			</div>

			<div className="qp-sheet">
				{/* <div className="qp-copy">(Original for Buyer)</div> */}

				<div className="qp-box">
					{/* HEADER */}
					<header className="qp-header">
						<div className="qp-logo">
							{company.logo && <img src={company.logo} alt="logo" />}
						</div>
						<div className="qp-company">
							<h1>{company.name}</h1>
							{company.address.map((l) => (
								<p key={l}>{l}</p>
							))}
						</div>
					</header>
					<div className="qp-statutory">EMAIL : {company.email}</div>

					<div className="qp-title">PURCHASE ORDER</div>

					{/* QUOTE META + PARTIES */}
					<section className="qp-parties">
						<div className="qp-cell qp-meta">
							<span>
								<b>Order No</b> : {quote.no}
							</span>
							<span>
								<b>Date</b> : {quote.date}
							</span>
						</div>
						<div className="qp-cell qp-ref">
							<div className="qp-ref-no">Ref.NO: {quote.no}</div>
						</div>

						<div className="qp-cell qp-party qp-buyer">
							<div className="qp-center qp-bold qp-big">Buyer (Bill To)</div>
							<PartyBlock p={buyer} gstLabel="GSTIN" />
						</div>
						<div className="qp-cell qp-party qp-buyer">
							<div className="qp-center qp-bold qp-big">
								Consignee (Ship To)
							</div>
							<PartyBlock p={consignee} gstLabel="GST IN" />
						</div>
					</section>

					{/* ITEMS */}
					<section className="qp-items">
						<table>
							<colgroup>
								<col style={{ width: '5%' }} />
								<col style={{ width: '45%' }} />
								<col style={{ width: '11%' }} />
								<col style={{ width: '7%' }} />
								<col style={{ width: '6%' }} />

								<col style={{ width: '14%' }} />
								<col style={{ width: '14%' }} />
							</colgroup>
							<thead>
								<tr>
									<th>S.No</th>
									<th>Description Of Goods</th>
									<th>HSN/SAC</th>
									<th>Colour</th>
									<th>Qty</th>
									<th>Rate</th>
									{/* <th>Rate</th> */}
									<th>Total Amount</th>
								</tr>
							</thead>
							<tbody>
								{items.map((it, i) => (
									<tr key={i} className="qp-item-row">
										<td className="c">{i + 1}</td>
										<td>
											<div className="qp-bold">{it.desc}</div>
										</td>
										<td className="c">{it.hsn}</td>
										<td className="c">{it.gst} %</td>
										<td className="c">{it.qty}</td>
										{/* <td className="c">{it.uom}</td> */}
										<td className="r">{fmt(it.rate)}</td>
										<td className="r">
											<div>{fmt(it.amount)}</div>
										</td>
									</tr>
								))}
								{/* filler row: stretches to fill the page */}
								{/* <tr className="qp-fill">
                  <td /><td /><td /><td /><td /><td /><td />
                </tr> */}
							</tbody>
							<tfoot>
								<tr>
									<td />
									<td className="r qp-bold">Total</td>
									<td />
									<td />
									<td />
									<td />
									<td className="r qp-bold">{fmt(total)}</td>
								</tr>
							</tfoot>
						</table>
					</section>

					{/* WORDS + REMARKS */}
					<div className="qp-line qp-bold">Quote Value (In Words)</div>
					<div className="qp-line qp-bold">{amountInWords}</div>
					<div className="qp-line">
						<b>Remarks :</b> {remarks}
					</div>

					{/* BANK */}
					<div className="qp-bank-title">Bank Details</div>
					<section className="qp-bank">
						<dl>
							<dt>Bank Name</dt>
							<dd>
								: {bank.bankName} <b>&nbsp;G Pay Number :</b> {bank.gpay}
							</dd>
							<dt>A/c Name</dt>
							<dd>: {bank.acName}</dd>
							<dt>A/c No.</dt>
							<dd>: {bank.acNo}</dd>
							<dt>Branch</dt>
							<dd>: {bank.branch}</dd>
							<dt>IFSC</dt>
							<dd>: {bank.ifsc}</dd>
							<dt>SWIFT</dt>
							<dd>: {bank.swift}</dd>
						</dl>
						{/* <div className="qp-qr">
              <b>Scan QR code to pay</b>
              {bank.qr && <img src={bank.qr} alt="QR" />}
              <b>{bank.upi}</b> 
            </div>*/}
					</section>

					{/* SIGNATURE */}
					<footer className="qp-sign">
						<div className="qp-bold r">For {company.name}</div>
						<div className="qp-sign-art">
							{company.seal && <img src={company.seal} alt="seal" />}
							{company.signature && (
								<img src={company.signature} alt="signature" />
							)}
						</div>
						<div className="qp-bold r">Authorised Signatory</div>
					</footer>
					
				</div>
			</div>
		</>
	);
}

function PartyBlock({ p, gstLabel }) {
	return (
		<div className="qp-party-body">
			<div className="qp-bold">{p.name}</div>
			{p.address.map((l) => (
				<div key={l}>{l}</div>
			))}
			<div>
				<b>{gstLabel}</b> : {p.gstin}
			</div>
		</div>
	);
}
