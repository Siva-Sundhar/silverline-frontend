import { num } from './numberUtils';

export const calculateQuantityAndUnits = (items = []) => {
    const rows = items.filter((item) => num(item.qty) > 0);

    if (rows.length === 0) {
        return { totalQty: 0, units: '' };
    }

    const uoms = new Set(
        rows.map((item) =>
            String(item.uom || '').trim().toUpperCase()
        )
    );

    const first = String(rows[0].uom || '').trim();

    const total = Number(
        rows.reduce((sum, item) => sum + num(item.qty), 0).toFixed(3)
    );

    return {
        totalQty: total,
        units: uoms.size === 1 && first ? first : 'mixed',
    };
};