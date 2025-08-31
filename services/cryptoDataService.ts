
import { Candle } from '../types';

export function generateMockCandleData(days: number): Candle[] {
    const data: Candle[] = [];
    let price = 40000; // Starting price for BTC
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        const open = price;
        const change = (Math.random() - 0.48) * price * 0.05; // Volatility
        const close = open + change;
        
        const high = Math.max(open, close) + Math.random() * price * 0.02;
        const low = Math.min(open, close) - Math.random() * price * 0.02;

        const volume = Math.random() * 1000 + 500; // Mock volume
        
        data.push({
            date: date.toISOString().split('T')[0],
            open,
            high,
            low,
            close,
            volume,
        });

        price = close; // Next day's open is this day's close
    }
    return data;
}
