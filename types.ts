export interface Candle {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export type Indicator = 'SMA' | 'RSI' | 'MACD' | 'BollingerBands';
export type Operator = '>' | '<' | '>=' | '<=';
export type ConditionTarget = 'SMA' | 'RSI' | 'MACD' | 'BollingerBands' | 'value' | 'price';

export interface Condition {
    indicator: Indicator | 'price';
    period?: number;
    stdDev?: number;
    fastPeriod?: number;
    slowPeriod?: number;
    signalPeriod?: number;
    line?: 'line' | 'signal' | 'histogram' | 'upper' | 'lower' | 'middle';
    
    operator: Operator;
    target: ConditionTarget;
    
    targetPeriod?: number;
    targetStdDev?: number;
    targetFastPeriod?: number;
    targetSlowPeriod?: number;
    targetSignalPeriod?: number;
    targetLine?: 'line' | 'signal' | 'histogram' | 'upper' | 'lower' | 'middle';
    value?: number;
}


export interface Strategy {
    entryConditions: Condition[];
    exitConditions: Condition[];
}

export interface Trade {
    entryDate: string;
    entryPrice: number;
    exitDate: string;
    exitPrice: number;
    profit: number;
    profitPercentage: number;
}

export interface BacktestResult {
    trades: Trade[];
    netProfit: number;
    totalTrades: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
    finalBalance: number;
    initialBalance: number;
}
