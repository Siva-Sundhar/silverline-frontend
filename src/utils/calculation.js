export const GST_RATES = [0, 5, 12, 18, 28];

export const num = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const r2 = (value) =>
  Math.round((num(value) + Number.EPSILON) * 100) / 100;

export const calculatePurchaseRow = (row, mode = "GST") => {
  const quantity = num(row.qty);
  const rate = num(row.rate);
  const discountPercent = Math.min(Math.max(num(row.disc), 0), 100);
  const taxRate = Math.max(num(row.tax), 0);

  const gross = r2(quantity * rate);
  const discountAmount = r2((gross * discountPercent) / 100);
  const taxable = r2(gross - discountAmount);

  const taxAmount = mode === "NONE" ? 0 : r2((taxable * taxRate) / 100);

  return {
    gross,
    discountAmount,
    taxable,
    taxRate,
    taxAmount,
    amount: r2(taxable + taxAmount),
  };
};

const emptyTaxTotals = () => ({
  taxable: 0,
  tax: 0,
  cgst: 0,
  sgst: 0,
  vat: 0,
  igst: 0,
});

export const calculateTaxSlabs = ({ purchaseItems, taxMode, taxType }) => {
  const mode = String(taxMode || "NONE").toUpperCase();
  const type = String(taxType || "INTRA").toUpperCase();
  const slabMap = new Map();

  const addToSlab = (rate, taxable) => {
    if (taxable <= 0) return;

    const previous = slabMap.get(rate) || 0;
    slabMap.set(rate, previous + taxable);
  };

  purchaseItems.forEach((row) => {
    const calculated = calculatePurchaseRow(row, mode);
    addToSlab(calculated.taxRate, calculated.taxable);
  });

  const slabs = [...slabMap.entries()]
    .sort(([rateA], [rateB]) => rateA - rateB)
    .map(([rate, taxableValue]) => {
      const taxable = r2(taxableValue);
      const tax = mode === "NONE" ? 0 : r2((taxable * rate) / 100);

      if (mode === "VAT") {
        return {
          rate,
          taxable,
          tax,
          vat: tax,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: r2(taxable + tax),
        };
      }

      if (mode === "GST" && type === "INTRA") {
        const cgst = r2(tax / 2);
        const sgst = r2(tax - cgst);

        return {
          rate,
          taxable,
          tax,
          vat: 0,
          cgst,
          sgst,
          igst: 0,
          total: r2(taxable + tax),
        };
      }

      return {
        rate,
        taxable,
        tax,
        vat: 0,
        cgst: 0,
        sgst: 0,
        igst: tax,
        total: r2(taxable + tax),
      };
    });

  return slabs;
};

export const calculateExpenses = (expenses, taxMode = "GST") => {
  const mode = String(taxMode || "NONE").toUpperCase();

  return expenses
    .filter((expense) => {
      return String(expense.particular || "").trim() || num(expense.amount) > 0;
    })
    .map((expense, index) => {
      const taxable = r2(Math.max(num(expense.amount), 0));
      const taxRate = Math.max(num(expense.tax), 0);

      const taxAmount = mode === "NONE" ? 0 : r2((taxable * taxRate) / 100);
      const totalAmount = r2(taxable + taxAmount);

      return {
        lineNo: index + 1,
        particular: String(expense.particular || "").trim(),
        taxableAmount: taxable,
        taxRate,
        taxAmount,
        totalAmount,
      };
    });
};

export const calculatePurchaseTotals = ({
  purchaseItems,
  expenses,
  taxMode,
  taxType,
  autoRound,
}) => {
  const mode = String(taxMode || "NONE").toUpperCase();
  const type = String(taxType || "INTRA").toUpperCase();

  const itemTotals = purchaseItems.reduce(
    (result, row) => {
      const calculated = calculatePurchaseRow(row, mode);

      result.quantity += num(row.qty);
      result.gross += calculated.gross;
      result.discount += calculated.discountAmount;
      result.itemTaxable += calculated.taxable;

      return result;
    },
    { quantity: 0, gross: 0, discount: 0, itemTaxable: 0 },
  );

  const taxSlabs = calculateTaxSlabs({
    purchaseItems,
    taxMode: mode,
    taxType: type,
  });

  const expenseItems = calculateExpenses(expenses, mode);

  const expenseAmount = r2(
    expenseItems.reduce((total, expense) => total + expense.totalAmount, 0),
  );

  const taxableAmount = r2(itemTotals.itemTaxable);

  const taxTotals = taxSlabs.reduce((result, slab) => {
    result.tax += slab.tax;
    result.cgst += slab.cgst;
    result.sgst += slab.sgst;
    result.vat += slab.vat;
    result.igst += slab.igst;
    return result;
  }, emptyTaxTotals());

  const taxAmount = r2(taxTotals.tax);
  const beforeRound = r2(taxableAmount + taxAmount + expenseAmount);
  const roundOff = autoRound ? r2(Math.round(beforeRound) - beforeRound) : 0;
  const netTotal = r2(beforeRound + roundOff);

  // ---- Build taxBreakup for ledger entries ----
  const taxBreakup = [];

  taxSlabs.forEach((slab) => {
    const rate = num(slab.rate);
    if ((!rate && rate !== 0) || !slab.tax) return;

    if (mode === "GST") {
      if (type === "INTRA") {
        const cgstAmt = r2(slab.cgst || 0);
        const sgstAmt = r2(slab.sgst || 0);

        if (cgstAmt) {
          taxBreakup.push({
            ledgerName: `Input CGST ${rate / 2}%`,
            rate: rate / 2,
            amount: cgstAmt,
          });
        }
        if (sgstAmt) {
          taxBreakup.push({
            ledgerName: `Input SGST ${rate / 2}%`,
            rate: rate / 2,
            amount: sgstAmt,
          });
        }
      } else {
        // INTER -> IGST
        const igstAmt = r2(slab.igst || 0);
        if (igstAmt) {
          taxBreakup.push({
            ledgerName: `Input IGST ${rate}%`,
            rate,
            amount: igstAmt,
          });
        }
      }
    } else if (mode === "VAT") {
      const vatAmt = r2(slab.vat || 0);
      if (vatAmt) {
        taxBreakup.push({
          ledgerName: `Input VAT ${rate}%`,
          rate,
          amount: vatAmt,
        });
      }
    }
  });

  return {
    mode,
    type,
    quantity: r2(itemTotals.quantity),
    gross: r2(itemTotals.gross),
    discount: r2(itemTotals.discount),
    itemTaxable: r2(itemTotals.itemTaxable),
    taxable: taxableAmount,
    expenseAmount,
    tax: taxAmount,
    cgst: r2(taxTotals.cgst),
    sgst: r2(taxTotals.sgst),
    vat: r2(taxTotals.vat),
    igst: r2(taxTotals.igst),
    roundOff,
    roundAmt: roundOff,
    net: r2(beforeRound + roundOff),
    netTotal,
    slabs: taxSlabs,
    taxBreakup,
    expenseItems,
  };
};

/* Quantity and Units Checking  */
const getQtyAndUnits = (items) => {
  const rows = items.filter((item) => num(item.qty) > 0);

  if (rows.length === 0) {
    return { totalQty: 0, units: "" };
  }

  // Compare UOMs ignoring case and spaces, so "Nos", "NOS" and "nos " count as the same
  const uoms = new Set(
    rows.map((item) => String(item.uom || "").trim().toUpperCase()),
  );

  const first = String(rows[0].uom || "").trim();

  if (uoms.size === 1 && first) {
    const total = rows.reduce((sum, item) => sum + num(item.qty), 0);
    return {
      totalQty: Number(total.toFixed(3)), // avoids 0.1 + 0.2 style float noise
      units: first,
    };
  }

  return {
  totalQty: Number(rows.reduce((s, i) => s + num(i.qty), 0).toFixed(3)),
  units: "mixed",
};
};

export const buildPurchasePayload = (formData, purchaseItem, expenses) => {
  const mode = String(formData.taxMode || "NONE").toUpperCase();
  const type = String(formData.taxType || "INTRA").toUpperCase();

  const validRows = purchaseItem.filter((row) => {
    return row.code || row.desc || num(row.qty) > 0;
  });

  const validExpenses = expenses.filter((expense) => {
    return (
      String(expense.particular || "").trim() ||
      num(expense.tax) > 0 ||
      num(expense.totalAmount) > 0
    );
  });

  const purchaseItems = validRows.map((row, index) => {
    const calculated = calculatePurchaseRow(row, mode);

    return {
      lineNo: index + 1,
      itemCode: row.code,
      itemName: row.desc,
      qty: num(row.qty),
      uom: row.uom,
      rate: num(row.rate),
      disc: num(row.disc),
      discountAmount: calculated.discountAmount,
      gst: calculated.taxRate,
      grossAmount: calculated.gross,
      taxableAmount: calculated.taxable,
      taxAmount: calculated.taxAmount,
      itemAmount: calculated.amount,
    };
  });

  const totals = calculatePurchaseTotals({
    purchaseItems: validRows,
    expenses: validExpenses,
    taxMode: mode,
    taxType: type,
    autoRound: formData.autoRound,
  });

  // console.log("Calculated totals:", totals);

  const expensesItem = calculateExpenses(validExpenses, mode);

  const ledgerEntries = [];

  // 1) Expenses as ledger rows
  expensesItem.forEach((expense, idx) => {
    const ledgerName = String(
      expense.particular || `Expense ${idx + 1}`,
    ).trim();

    if (ledgerName) {
      ledgerEntries.push({
        ledgerName,
        percentage: num(expense.taxRate) || 0,
        ledgerAmount: num(expense.taxableAmount) || 0,
        ledgerType: "EXPENSE",
      });
    }
  });

  // 2) Tax ledgers from taxBreakup
  if (Array.isArray(totals.taxBreakup)) {
    totals.taxBreakup.forEach((t) => {
      if (!t.ledgerName || !t.amount) return;
      ledgerEntries.push({
        ledgerName: t.ledgerName, // "CGST 9", "SGST 9", "IGST 18", "VAT 7.5"
        percentage: num(t.rate) || 0,
        ledgerAmount: num(t.amount) || 0,
        ledgerType: "TAX",
      });
    });
  }

  // 3) Round off
  if (totals.roundAmt && num(totals.roundAmt) !== 0) {
    ledgerEntries.push({
      ledgerName: "Round Off",
      percentage: 0,
      ledgerAmount: num(totals.roundAmt),
      ledgerType: "ROUND_OFF",
    });
  }

  const { totalQty, units } = getQtyAndUnits(purchaseItems);

  return {
    voucherNo: String(formData.voucherNo || "").trim(),
    // voucherType: String(formData.voucherType),
    voucherDate: formData.voucherDate || null,
    distributerName: String(formData.distributerName || '').trim(),
    supplierName: String(formData.supplierName || "").trim(),
    orderNo: String(formData.referenceNo || "").trim(),
    orderDate: formData.referenceDate || null,
    voucherNarration: String(formData.narration || "").trim(),
    createdBy: String(formData.createdBy || "").trim(),
    approvedBy: String(formData.approvedBy || "").trim(),
    voucherStatus: formData.voucherStatus || 'Pending',
    tallyStatus: formData.tallyStatus || 'Pending',
    voucherAmount: num(totals.net) || 0,
    totalQty: totalQty,
    units: units,
    inventoryItems: purchaseItems,
    ledgerEntries: ledgerEntries,
  };
};
