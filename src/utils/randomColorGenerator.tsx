export function getRandomColor(type: 'light' | 'dark', index?: number, opacity: number = 1): string {
    const lightColors = [
        '#DFF8FB', '#FAE8B4', '#F4D4FF', '#FBC7C6', '#B8D9FF', '#ADC8D4', '#97F3FE'
    ];
    const darkColors = [
        '#7F49F2', '#E9C030', '#EA794A', '#63CB82', '#3BC6DF', '#4A4CF3'
    ];

    const colors = type === 'light' ? lightColors : darkColors;

    if (index !== undefined) {
        const adjustedIndex = index % colors?.length;
        return hexToRgba(colors[adjustedIndex], opacity);
    } else {
        const randomIndex = Math.floor(Math.random() * colors?.length);
        return hexToRgba(colors[randomIndex], opacity);
    }
}

function hexToRgba(hex: string, opacity: number): string {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${opacity})`;
}
