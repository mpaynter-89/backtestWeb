import { Candle, Strategy, Condition, BacktestResult, Trade } from '../types';

// --- Technical Indicator Calculations ---

const calculateSMA = (data: number[], period: number): (number | null)[] => {
    const sma: (number | null)[] = Array(period - 1).fill(null);
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        sma.push(sum / period);
    }
    return sma;
};

const calculateEMA = (data: number[], period: number): (number | null)[] => {
    const k = 2 / (period + 1);
    const ema: (number | null)[] = [];
    let prevEma: number | null = null;

    for(let i=0; i<data.length; i++){
        if(i < period -1){
            ema.push(null);
        } else if (i === period -1){
            const sum = data.slice(0, period).reduce((a,b) => a+b, 0);
            prevEma = sum/period;
            ema.push(prevEma);
        } else {
            prevEma = data[i] * k + prevEma! * (1 - k);
            ema.push(prevEma);
        }
    }
    return ema;
};


const calculateRSI = (data: number[], period: number): (number | null)[] => {
    const rsi: (number | null)[] = Array(period).fill(null);
    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
        const change = data[i] - data[i - 1];
        if (change > 0) {
            gains += change;
        } else {
            losses -= change;
        }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    if (avgLoss === 0) {
        rsi.push(100);
    } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
    }

    for (let i = period + 1; i < data.length; i++) {
        const change = data[i] - data[i - 1];
        let gain = 0;
        let loss = 0;
        if (change > 0) gain = change; else loss = -change;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        if (avgLoss === 0) {
            rsi.push(100);
        } else {
            const rs = avgGain / avgLoss;
            rsi.push(100 - (100 / (1 + rs)));
        }
    }
    return rsi;
};

const calculateMACD = (data: number[], fastPeriod: number, slowPeriod: number, signalPeriod: number): {
    macdLine: (number | null)[],
    signalLine: (number | null)[],
    histogram: (number | null)[]
} => {
    const emaFast = calculateEMA(data, fastPeriod);
    const emaSlow = calculateEMA(data, slowPeriod);
    const macdLine = emaSlow.map((slow, i) => {
        const fast = emaFast[i];
        if (slow === null || fast === null) return null;
        return fast - slow;
    });

    const signalLineInput = macdLine.filter(v => v !== null) as number[];
    if (signalLineInput.length === 0) {
        return { 
            macdLine, 
            signalLine: Array(macdLine.length).fill(null), 
            histogram: Array(macdLine.length).fill(null) 
        };
    }
    
    const signalLineEma = calculateEMA(signalLineInput, signalPeriod);
    const signalLine = Array(macdLine.length - signalLineEma.filter(v => v !== null).length).fill(null).concat(signalLineEma.filter(v => v !== null));

    const histogram = macdLine.map((macd, i) => {
        const signal = signalLine[i];
        if (macd === null || signal === null) return null;
        return macd - signal;
    });

    return { macdLine, signalLine, histogram };
};

const calculateBollingerBands = (data: number[], period: number, stdDev: number): {
    upper: (number | null)[],
    middle: (number | null)[],
    lower: (number | null)[]
} => {
    const middle = calculateSMA(data, period);
    const stdDevs: (number|null)[] = Array(period - 1).fill(null);

    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / period;
        const sqDiffs = slice.map(value => Math.pow(value - mean, 2));
        const avgSqDiff = sqDiffs.reduce((a, b) => a + b, 0) / period;
        stdDevs.push(Math.sqrt(avgSqDiff));
    }

    const upper = middle.map((m, i) => m === null ? null : m + (stdDevs[i]! * stdDev));
    const lower = middle.map((m, i) => m === null ? null : m - (stdDevs[i]! * stdDev));

    return { upper, middle, lower };
};


// --- Backtesting Engine ---

export function runBacktest(data: Candle[], strategy: Strategy, initialBalance: number): BacktestResult {
    const closes = data.map(d => d.close);
    const indicators: Record<string, any> = {};

    const conditions = [...strategy.entryConditions, ...strategy.exitConditions];

    const processConditionForIndicatorRequest = (cond: Partial<Condition>, isTarget: boolean) => {
        const type = isTarget ? cond.target : cond.indicator;
        const p = isTarget ? { period: cond.targetPeriod, stdDev: cond.targetStdDev, fastPeriod: cond.targetFastPeriod, slowPeriod: cond.targetSlowPeriod, signalPeriod: cond.targetSignalPeriod } : cond;
        
        if (type === 'SMA' && p.period) indicators[`SMA_${p.period}`] = null;
        if (type === 'RSI' && p.period) indicators[`RSI_${p.period}`] = null;
        if (type === 'MACD' && p.fastPeriod && p.slowPeriod && p.signalPeriod) indicators[`MACD_${p.fastPeriod}_${p.slowPeriod}_${p.signalPeriod}`] = null;
        if (type === 'BollingerBands' && p.period && p.stdDev) indicators[`BB_${p.period}_${p.stdDev}`] = null;
    };

    conditions.forEach(cond => {
        processConditionForIndicatorRequest(cond, false);
        processConditionForIndicatorRequest(cond, true);
    });

    Object.keys(indicators).forEach(key => {
        const [name, ...params] = key.split('_');
        if (name === 'SMA') indicators[key] = calculateSMA(closes, Number(params[0]));
        if (name === 'RSI') indicators[key] = calculateRSI(closes, Number(params[0]));
        if (name === 'MACD') indicators[key] = calculateMACD(closes, Number(params[0]), Number(params[1]), Number(params[2]));
        if (name === 'BB') indicators[key] = calculateBollingerBands(closes, Number(params[0]), Number(params[1]));
    });

    let balance = initialBalance;
    let inPosition = false;
    let entryPrice = 0;
    const trades: Trade[] = [];
    const equityCurve = [initialBalance];
    
    for (let i = 1; i < data.length; i++) {
        const checkConditions = (conditions: Condition[]): boolean => {
            return conditions.every(cond => {
                const getValue = (
                    type: Condition['indicator'] | Condition['target'],
                    params: any,
                    index: number
                ): number | null => {
                    if (type === 'price') return data[index].close;
                    if (type === 'value') return params.value;
    
                    let key: string;
                    let value: any;
                    switch (type) {
                        case 'SMA':
                            key = `SMA_${params.period}`;
                            value = indicators[key]?.[index];
                            return typeof value === 'number' ? value : null;
                        case 'RSI':
                            key = `RSI_${params.period}`;
                            value = indicators[key]?.[index];
                            return typeof value === 'number' ? value : null;
                        case 'MACD':
                            key = `MACD_${params.fastPeriod}_${params.slowPeriod}_${params.signalPeriod}`;
                            const macdData = indicators[key];
                            if (!macdData) return null;
                            if (params.line === 'line') return macdData.macdLine[index];
                            if (params.line === 'signal') return macdData.signalLine[index];
                            if (params.line === 'histogram') return macdData.histogram[index];
                            return null;
                        case 'BollingerBands':
                            key = `BB_${params.period}_${params.stdDev}`;
                            const bbData = indicators[key];
                            if (!bbData) return null;
                            if (params.line === 'upper') return bbData.upper[index];
                            if (params.line === 'middle') return bbData.middle[index];
                            if (params.line === 'lower') return bbData.lower[index];
                            return null;
                        default:
                            return null;
                    }
                };
                
                const indicatorValue = getValue(cond.indicator, cond, i);
                const targetValue = getValue(
                    cond.target,
                    {
                        period: cond.targetPeriod,
                        stdDev: cond.targetStdDev,
                        fastPeriod: cond.targetFastPeriod,
                        slowPeriod: cond.targetSlowPeriod,
                        signalPeriod: cond.targetSignalPeriod,
                        line: cond.targetLine,
                        value: cond.value
                    },
                    i
                );
                
                if (indicatorValue === null || indicatorValue === undefined || targetValue === null || targetValue === undefined) return false;
    
                switch (cond.operator) {
                    case '>': return indicatorValue > targetValue;
                    case '<': return indicatorValue < targetValue;
                    case '>=': return indicatorValue >= targetValue;
                    case '<=': return indicatorValue <= targetValue;
                    default: return false;
                }
            });
        };
        
        const currentDate = data[i].date;
        const currentPrice = data[i].close;

        if (!inPosition) {
            if (checkConditions(strategy.entryConditions)) {
                inPosition = true;
                entryPrice = currentPrice;
                trades.push({ 
                    entryDate: currentDate, 
                    entryPrice: entryPrice,
                    exitDate: '', exitPrice: 0, profit: 0, profitPercentage: 0
                });
            }
        } else {
            if (checkConditions(strategy.exitConditions)) {
                inPosition = false;
                const profit = currentPrice - entryPrice;
                const profitPercentage = profit / entryPrice;
                balance += profit * (balance / entryPrice); // Simple position sizing
                
                const lastTrade = trades[trades.length - 1];
                lastTrade.exitDate = currentDate;
                lastTrade.exitPrice = currentPrice;
                lastTrade.profit = profit;
                lastTrade.profitPercentage = profitPercentage;
            }
        }
        equityCurve.push(inPosition ? balance + ((currentPrice - entryPrice) * (balance / entryPrice)) : balance);
    }

    // --- Performance Metrics Calculation ---
    
    const totalTrades = trades.filter(t => t.exitPrice > 0).length;
    const winningTrades = trades.filter(t => t.profit > 0).length;
    const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
    
    let peak = -Infinity;
    let maxDrawdown = 0;
    equityCurve.forEach(equity => {
        if (equity > peak) peak = equity;
        const drawdown = peak > 0 ? (peak - equity) / peak : 0;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    const netProfit = balance - initialBalance;
    const returns = trades.map(t => t.profitPercentage).filter(p => p !== 0 && isFinite(p));
    if (returns.length === 0) {
         return {
            trades: trades.filter(t => t.exitPrice > 0),
            netProfit,
            totalTrades,
            winRate,
            maxDrawdown,
            sharpeRatio: 0,
            finalBalance: balance,
            initialBalance,
        };
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(returns.map(r => Math.pow(r - avgReturn, 2)).reduce((a, b) => a + b, 0) / returns.length);
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized Sharpe (assuming daily data)

    return {
        trades: trades.filter(t => t.exitPrice > 0),
        netProfit,
        totalTrades,
        winRate,
        maxDrawdown,
        sharpeRatio: isNaN(sharpeRatio) ? 0 : sharpeRatio,
        finalBalance: balance,
        initialBalance,
    };
}
