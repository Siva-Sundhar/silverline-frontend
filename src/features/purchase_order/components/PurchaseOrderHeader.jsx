import { Calendar, Eye } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatGenericDate } from '../../../utils/FormatGenericDate';
import { companyAddress } from '../../../utils/companyAddress';
import { supplierAddress } from '../../../utils/supplier';

const headerInput =
	'h-5 border border-amber-300 bg-[#fee8af] px-1 text-slate-900 outline-none focus:border-blue-500 focus:bg-white';

const PurchaseOrderHeader = ({
	formData,
	isAlterMode,
	registerHeaderRef,
	focusHeaderRef,
	setField,
	handleInvoicePreview,
	commitDateChange,
	focusFirstGridCell
}) => {
	const [dateInputText, setDateInputText] = useState(
		formatGenericDate(formData.voucherDate || new Date(), 'DD-MMM-YY'),
	);
	const [customerInfo, setCustomerInfo] = useState(false);
	const [supplierInfo, setSupplierInfo] = useState(false);

	const hiddenDateRef = useRef(null);
	const distInfoRef = useRef(null);
	const suppInfoRef = useRef(null);

	useEffect(() => {
		if (!customerInfo) return;

		requestAnimationFrame(() => {
			distInfoRef.current?.focus();
		});
	}, [customerInfo]);

	useEffect(() => {
		if (supplierInfo) {
			requestAnimationFrame(() => {
				suppInfoRef.current?.focus();
			});
		}
	}, [supplierInfo]);

	return (
		<>
			<header className="shrink-0 border-b border-slate-300 px-2 py-1 text-[13px]">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
					<div className="flex items-center gap-1">
						<label
							htmlFor="voucherNo"
							className="rounded-xs bg-blue-800 text-center text-[12px] font-bold uppercase text-white w-32"
						>
							{isAlterMode ? 'Purchase Order' : 'Purchase Order'}
						</label>
						<span className="ml-1 font-semibold text-slate-700 w-6">No</span>
						:
						<input
							// ref={(el) => (headerRefs.current[0] = el)}
							id="voucherNo"
							type="text"
							autoComplete="off"
							value={formData.voucherNo}
							readOnly
							className={`${headerInput} w-28 sm:w-36`}
						/>
					</div>

					<div className="flex items-center gap-2">
						<label
							htmlFor="orderNo"
							className="font-semibold text-slate-700 whitespace-nowrap w-16"
						>
							Order No
						</label>
						:
						<input
							ref={registerHeaderRef(1)}
							id="orderNo"
							value={formData.orderNo}
							onChange={setField('orderNo')}
							onKeyDown={(e) => {
								if (e.key !== 'Enter') return;
								focusHeaderRef(2);
							}}
							onMouseDown={(e) => {
								const input = e.currentTarget;

								if (document.activeElement !== input) {
									setTimeout(() => input.select(), 0);
								}
							}}
							className={`${headerInput} w-36 `}
						/>
					</div>

					{/* <div className="flex items-center gap-2">
                  <label
                    htmlFor="referenceDate"
                    className="font-semibold text-slate-700 whitespace-nowrap w-20"
                  >
                    Invoice Date
                  </label>
                  :
                  <input
                    ref={(el) => (headerRefs.current[2] = el)}
                    id="referenceDate"
                    value={refDateInputText}
                    onChange={(e) => setRefDateInputText(e.target.value)}
                    onBlur={() =>
                      commitDateChange(refDateInputText, 'referenceDate')
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
   
                        const ref = gridRefs.current['0-0'];
   
                        ref?.focus();
   
                        requestAnimationFrame(() => {
                          ref?.input?.select();
                        });
                      }
                    }}
                    onMouseDown={(e) => {
                      const input = e.currentTarget;
   
                      if (document.activeElement !== input) {
                        setTimeout(() => input.select(), 0);
                      }
                    }}
                    className={`${headerInput} w-20 text-right`}
                  />
                </div> */}

					<button
						type="button"
						// disabled=}
						onClick={handleInvoicePreview}
						className="flex h-5 items-center gap-1 rounded border border-blue-400 bg-blue-50 px-2 font-semibold text-blue-800 outline-none hover:border-blue-600 hover:bg-blue-100 focus-visible:ring-0 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Eye size={12} />
						Preview
					</button>

					{/* <PurchasePrint
					data={{ formData, purchaseItem, expenses }}
					isOpen={showPreview}
					onClose={() => setShowPreview(false)}
				/> */}

					<div className="flex items-center gap-1 sm:ml-auto">
						<label
							htmlFor="voucherDate"
							className="font-semibold text-slate-700"
						>
							Date
						</label>
						:
						<input
							ref={registerHeaderRef(0)}
							id="voucherDate"
							type="text"
							value={dateInputText}
							onChange={(e) => setDateInputText(e.target.value)}
							onBlur={() => commitDateChange(dateInputText, 'voucherDate')}
							onKeyDown={(event) => {
								if (event.key !== 'Enter') return;

								event.preventDefault();
								commitDateChange(dateInputText, 'voucherDate');
								focusHeaderRef(1);
							}}
							onMouseDown={(e) => {
								const input = e.currentTarget;

								if (document.activeElement !== input) {
									setTimeout(() => input.select(), 0);
								}
							}}
							className={`${headerInput} w-22 text-right`}
						/>
						<button
							type="button"
							tabIndex={-1}
							onClick={() => hiddenDateRef.current?.showPicker?.()}
							className="text-slate-700 outline-none hover:text-black"
							aria-label="Open date picker"
						>
							<Calendar size={18} />
						</button>
						<input
							ref={hiddenDateRef}
							type="date"
							value={formData.voucherDate}
							onChange={(event) => {
								const isoDate = event.target.value;

								setDateInputText(
									isoDate ? formatGenericDate(isoDate, 'DD-MMM-YY') : '',
								);

								commitDateChange(isoDate, 'voucherDate');
							}}
							className="pointer-events-none absolute sr-only"
						/>
					</div>
				</div>

				<div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
					<div className="flex items-center gap-1 ">
						<label
							htmlFor="distributorName"
							className="font-semibold text-slate-700 whitespace-nowrap w-40"
						>
							Distributer Name
						</label>
						:
						<input
							ref={registerHeaderRef(2)}
							id="distributorName"
							type="text"
							autoComplete="off"
							value={formData.distributorName}
							onChange={setField('distributorName')}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();

									const ref = distInfoRef.current;

									ref?.focus();

									requestAnimationFrame(() => {
										ref?.input?.select();
									});
									setCustomerInfo(true);
								}
							}}
							onMouseDown={(e) => {
								const input = e.currentTarget;

								if (document.activeElement !== input) {
									setTimeout(() => input.select(), 0);
								}
							}}
							// readOnly
							className={`${headerInput} w-96.5 `}
						/>
						{/* <GenericSelect
                    ref={(el) => (headerRefs.current[2] = el)}
                    options={customerOptions}
                    placeholder="Select Supplier..."
                    title="Suppliers "
                    value={
                      customerOptions.find(
                        (option) =>
                          String(option.value) === String(formData.customerName),
                      ) || null
                    }
                    onKeyDown={(e) =>
                      focusHeaderRef(e, gridRefs.current['0-0'])
                    }
                    onChange={(selectedOption) => {
                      if (!selectedOption) {
                        return;
                      }
   
                      console.log(selectedOption);
   
                      setFormData((prev) => ({
                        ...prev,
                        customerName: selectedOption.label,
                      }));
                    }}
                    onSelect={(selectedOption) => {
                      if (selectedOption?.isEndOfList) {
                        return;
                      }
   
                      setTimeout(() => {
                        gridRefs.current['0-0'];
                        // expenseRefs.current[`${0}-particular`]?.select();
                      }, 0);
                    }}
                    labelKey="label"
                    valueKey="value"
                    inputFocusStyle={{
                      border: '1px solid #3B63EB',
                    }}
                    inputStyle={{
                      padding: '0 4px',
                      height: '20px',
                      width: '386px',
                      border: '1px solid #FCD34D',
                      backgroundColor: '#fee8af',
                    }}
                    menuStyle={{
                      width: '250px',
                      maxWidth: 'calc(100vw - 8px)',
                      right: '4px',
                      bottom: '4px',
                      top: '4px',
                    }}
                    optionStyle={{
                      padding: ' 0.5px 4px',
                    }}
   
                    // renderOption={renderProductOption}
                  /> */}
					</div>
					{/* <div className="flex  flex-1 items-center ">
                  <label
                    htmlFor="Tax Mode"
                    className="font-semibold text-slate-700 whitespace-nowrap "
                  >
                    
                  </label>
                  
                  <input
                    disabled
                    id="taxmode"
                    type="text"
                    autoComplete="off"
                    value={formData.taxMode.toUpperCase()}
                    className={`${headerInput} w-20 bg-slate-100 border-slate-100 cursor-not-allowed`}
                    onMouseDown={(e) => {
                      const input = e.currentTarget;
   
                      if (document.activeElement !== input) {
                        setTimeout(() => input.select(), 0);
                      }
                    }}
                  />
                </div> */}

					{/* {formData.voucherDate && (
                  <span className="ml-1 text-xs font-bold text-blue-800">
                    {getDayName(formData.voucherDate)}
                  </span>
                )} */}

					<div className="flex items-center gap-1 ml-auto">
						<label
							htmlFor="suplierName"
							className="font-semibold text-slate-700 whitespace-nowrap w-30"
						>
							Supplier Name
						</label>
						:
						<input
							ref={registerHeaderRef(3)}
							id="suplierName"
							type="text"
							autoComplete="off"
							value={formData.suplierName}
							onChange={setField('suplierName')}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();

									const ref = suppInfoRef.current;

									ref?.focus();

									requestAnimationFrame(() => {
										ref?.input?.select();
									});
									setSupplierInfo(true);
								}
							}}
							onMouseDown={(e) => {
								const input = e.currentTarget;

								if (document.activeElement !== input) {
									setTimeout(() => input.select(), 0);
								}
							}}
							// readOnly
							className={`${headerInput} w-96.5 `}
						/>
					</div>
				</div>
			</header>
			{customerInfo && (
				<div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 px-4">
					<div className="h-100 w-full max-w-118 border-2 border-blue-400 bg-white px-5 py-2 text-[13px] text-black shadow-lg">
						{/* Heading */}
						<div className="mb-3 text-center">
							<h1 className="inline-block border-b border-double border-gray-500 px-2 pb-0.5 font-semibold">
								Party Details
							</h1>
						</div>

						<form>
							{/* Supplier Details */}
							<div className="space-y-0.5">
								{/* Supplier */}
								<div className="grid grid-cols-[140px_10px_1fr] items-start">
									<label>Supplier (Bill from)</label>
									<span>:</span>
									<input
										type="text"
										defaultValue={companyAddress.name}
										className="h-4.75 w-full border border-[#FCD34D] bg-amber-50 px-1 font-semibold outline-none focus:border-blue-400"
									/>
								</div>

								{/* Mailing Name */}
								<div className="grid grid-cols-[140px_10px_1fr] items-start">
									<label>Mailing Name</label>
									<span>:</span>
									<input
										type="text"
										defaultValue={companyAddress.name}
										className="h-4.75 w-full border border-[#FCD34D] bg-amber-50 px-1 font-semibold outline-none focus:border-blue-400"
									/>
								</div>

								{/* Address */}
								<div className="grid grid-cols-[140px_10px_1fr] items-start">
									<label>Address</label>
									<span>:</span>
									<textarea
										rows={2}
										defaultValue={companyAddress.address}
										className="w-full resize-none border border-[#FCD34D] bg-amber-50 px-1 leading-4.75 outline-none focus:border-blue-400"
									/>
								</div>
							</div>

							{/* Bottom Details */}
							<div className="mt-30.5 space-y-0.5">
								<div className="grid grid-cols-[140px_10px_1fr]">
									<label>State</label>
									<span>:</span>
									<input
										type="text"
										defaultValue={companyAddress.state}
										className="h-4.75 border border-[#FCD34D] bg-amber-50 font-semibold outline-none focus:border-blue-400"
									/>
								</div>

								<div className="grid grid-cols-[140px_10px_1fr]">
									<label>Country</label>
									<span>:</span>
									<input
										type="text"
										defaultValue={companyAddress.country}
										className="h-4.75 border border-[#FCD34D] bg-amber-50 px-1 font-semibold outline-none focus:border-blue-400"
									/>
								</div>

								<div className="grid grid-cols-[140px_10px_1fr]">
									<label>GST Registration type</label>
									<span>:</span>
									<input
										type="text"
										defaultValue={companyAddress.gstType}
										className="h-4.75 border border-[#FCD34D] bg-amber-50 px-1 font-semibold outline-none focus:border-blue-400"
									/>
								</div>

								<div className="grid grid-cols-[140px_10px_1fr]">
									<label>GSTIN/UIN</label>
									<span>:</span>
									<input
										type="text"
										defaultValue={companyAddress.gstNumber || ''}
										className="h-4.75 border border-[#FCD34D] bg-amber-50 px-1 font-semibold outline-none focus:border-blue-400"
									/>
								</div>

								{/* Separator */}
								{/* <div className="border-t border-gray-300 pt-1">
											<div className="grid grid-cols-[140px_10px_1fr]">
												<label>Place of Supply</label>
												<span>:</span>
												<input
													type="text"
													defaultValue="Tamil Nadu"
													className="h-4.75 border border-transparent px-1 font-semibold outline-none focus:border-blue-400"
												/>
											</div>
										</div> */}
								<div className="text-right mt-1.5">
									<button
										ref={distInfoRef}
										className="px-3 py-0.5 bg-[#2167d5] rounded text-white outline-none focus:border focus:border-amber-300"
										onClick={(e) => {
											setCustomerInfo((y) => !y);
											focusHeaderRef(e, 3);
										}}
										onKeyDown={() => {
											focusHeaderRef(3);
											setCustomerInfo((y) => !y);
										}}
									>
										Done
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}
			{supplierInfo && (
				<div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 px-4">
					<div className="h-100 w-full max-w-118 border border-blue-40 bg-white px-5 py-2 text-[13px] text-black shadow-lg">
						{/* Heading */}
						<div className="mb-3 text-center">
							<h1 className="inline-block border-b border-double border-gray-500 px-2 pb-0.5 font-semibold">
								Supplier Details
							</h1>
						</div>

						<form>
							{/* Supplier Details */}
							<div className="space-y-0.5">
								{/* Supplier */}
								<div className="grid grid-cols-[140px_10px_1fr] items-start">
									<label>Supplier (Bill from)</label>
									<span>:</span>
									<input
										type="text"
										defaultValue={supplierAddress.name}
										className="h-4.75 w-full border border-[#FCD34D] bg-amber-50 px-1 font-semibold outline-none focus:border-blue-400"
									/>
								</div>

								{/* Mailing Name */}
								<div className="grid grid-cols-[140px_10px_1fr] items-start">
									<label>Mailing Name</label>
									<span>:</span>
									<input
										type="text"
										defaultValue={supplierAddress.name}
										className="h-4.75 w-full border border-[#FCD34D] bg-amber-50 px-1 font-semibold outline-none focus:border-blue-400"
									/>
								</div>

								{/* Address */}
								<div className="grid grid-cols-[140px_10px_1fr] items-start">
									<label>Address</label>
									<span>:</span>
									<textarea
										rows={2}
										defaultValue={supplierAddress.address}
										className="w-full resize-none border border-[#FCD34D] bg-amber-50 px-1 leading-4.75 outline-none focus:border-blue-400"
									/>
								</div>
							</div>

							{/* Bottom Details */}
							<div className="mt-30.5 space-y-0.5">
								<div className="grid grid-cols-[140px_10px_1fr]">
									<label>State</label>
									<span>:</span>
									<input
										type="text"
										defaultValue={supplierAddress.state}
										className="h-4.75 border border-[#FCD34D] bg-amber-50 px-1 font-semibold outline-none focus:border-blue-400"
									/>
								</div>

								<div className="grid grid-cols-[140px_10px_1fr]">
									<label>Country</label>
									<span>:</span>
									<input
										type="text"
										defaultValue={supplierAddress.country}
										className="h-4.75 border border-[#FCD34D] bg-amber-50 px-1 font-semibold outline-none focus:border-blue-400"
									/>
								</div>

								<div className="grid grid-cols-[140px_10px_1fr]">
									<label>GST Registration type</label>
									<span>:</span>
									<input
										type="text"
										defaultValue={supplierAddress.gstType}
										className="h-4.75 border border-[#FCD34D] bg-amber-50 px-1 font-semibold outline-none focus:border-blue-400"
									/>
								</div>

								<div className="grid grid-cols-[140px_10px_1fr]">
									<label>GSTIN/UIN</label>
									<span>:</span>
									<input
										type="text"
										defaultValue={supplierAddress.gstNumber || ''}
										className="h-4.75 border border-[#FCD34D] bg-amber-50 px-1 font-semibold outline-none focus:border-blue-400"
									/>
								</div>

								{/* Separator */}
								<div className="border-t border-gray-300 pt-1">
									<div className="grid grid-cols-[140px_10px_1fr]">
										<label>Place of Supply</label>
										<span>:</span>
										<input
											type="text"
											defaultValue="Maharashtra"
											className="h-4.75 border border-[#FCD34D] bg-amber-50 px-1 font-semibold outline-none focus:border-blue-400"
										/>
									</div>
								</div>
								<div className="text-right mt-1.5">
									<button
										ref={suppInfoRef}
										className="px-3 py-0.5 bg-[#2167d5] rounded text-white outline-none focus:border focus:border-amber-300"
										onClick={() => {
											setSupplierInfo((y) => !y);
											focusFirstGridCell();
										}}
										onKeyDown={(e) => {
											if (e.key === 'Enter') return;


												e.preventDefault();
												setSupplierInfo((y) => !y);
												focusFirstGridCell();
											
										}}
									>
										Done
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
};

export default PurchaseOrderHeader;
