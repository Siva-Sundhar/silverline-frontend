

export const num = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const r2 = (value) =>
    Math.round((num(value) + Number.EPSILON) * 100) / 100;