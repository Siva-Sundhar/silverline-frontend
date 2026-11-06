export const amountToWords = (amount) => {
    if (amount === null || amount === undefined || amount === '') {
        return '';
    }

    const number = Number(amount);

    if (!Number.isFinite(number) || number < 0) {
        return '';
    }

    const ones = [
        '', 'One', 'Two', 'Three', 'Four', 'Five',
        'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
        'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen',
        'Nineteen'
    ];

    const tens = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
        'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    const convert = (num) => {
        if (num < 20) return ones[num];

        if (num < 100) {
            return tens[Math.floor(num / 10)] +
                (num % 10 ? ' ' + ones[num % 10] : '');
        }

        if (num < 1000) {
            return ones[Math.floor(num / 100)] + ' Hundred' +
                (num % 100 ? ' ' + convert(num % 100) : '');
        }

        return '';
    };

    const convertIndian = (num) => {
        if (num === 0) return 'Zero';

        const units = [
            { value: 10000000, name: 'Crore' },
            { value: 100000, name: 'Lakh' },
            { value: 1000, name: 'Thousand' },
            { value: 100, name: 'Hundred' }
        ];

        let result = [];

        for (const unit of units) {
            if (num >= unit.value) {
                const count = Math.floor(num / unit.value);
                result.push(convert(count) + ' ' + unit.name);
                num %= unit.value;
            }
        }

        if (num > 0) {
            result.push(convert(num));
        }

        return result.join(' ');
    };

    const [rupees, paise] = number.toFixed(2).split('.').map(Number);

    let result = `Rupees ${convertIndian(rupees)}`;

    if (paise > 0) {
        result += ` and ${convertIndian(paise)} Paise`;
    }

    return result + ' Only';
};