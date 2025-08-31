
import React from 'react';
import { BacktestResult } from '../types';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { ArrowTrendingUpIcon } from './icons/ArrowTrendingUpIcon';
import { ArrowTrendingDownIcon } from './icons/ArrowTrendingDownIcon';

interface ResultsDashboardProps {
    results: BacktestResult | null;
    isLoading: boolean;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
}

const MetricCard: React.FC<{ title: string; value: string; positive?: boolean }> = ({ title, value, positive }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${positive === true ? 'text-green-400' : positive === false ? 'text-red-400' : 'text-white'}`}>{value}</p>
    </div>
);

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 shadow-xl flex items-center justify-center min-h-[200px]">
                <LoadingSpinner className="h-8 w-8 text-cyan-400" />
                <span className="ml-3 text-lg">Calculating results...</span>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 shadow-xl flex items-center justify-center min-h-[200px]">
                <p className="text-gray-400">Run a backtest to see the results here.</p>
            </div>
        );
    }
    
    const isProfit = results.netProfit >= 0;

    return (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-xl">
             <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Backtest Results</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
                <MetricCard title="Net Profit" value={formatCurrency(results.netProfit)} positive={isProfit} />
                <MetricCard title="Final Balance" value={formatCurrency(results.finalBalance)} positive={isProfit} />
                <MetricCard title="Total Trades" value={results.totalTrades.toString()} />
                <MetricCard title="Win Rate" value={formatPercentage(results.winRate)} />
                <MetricCard title="Max Drawdown" value={formatPercentage(results.maxDrawdown)} positive={false} />
                <MetricCard title="Sharpe Ratio" value={results.sharpeRatio.toFixed(2)} />
            </div>

            <div className="p-4">
                <h3 className="text-md font-semibold text-white mb-2">Trade Log</h3>
                <div className="overflow-x-auto max-h-60">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-3">Entry Date</th>
                                <th scope="col" className="px-4 py-3">Exit Date</th>
                                <th scope="col" className="px-4 py-3">Entry Price</th>
                                <th scope="col" className="px-4 py-3">Exit Price</th>
                                <th scope="col" className="px-4 py-3">Profit</th>
                                <th scope="col" className="px-4 py-3">Profit %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.trades.map((trade, index) => (
                                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-4 py-2">{trade.entryDate}</td>
                                    <td className="px-4 py-2">{trade.exitDate}</td>
                                    <td className="px-4 py-2">{formatCurrency(trade.entryPrice)}</td>
                                    <td className="px-4 py-2">{formatCurrency(trade.exitPrice)}</td>
                                    <td className={`px-4 py-2 font-semibold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatCurrency(trade.profit)}
                                    </td>
                                    <td className={`px-4 py-2 font-semibold ${trade.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                                        {trade.profitPercentage >= 0 ? <ArrowTrendingUpIcon className="h-4 w-4 mr-1"/> : <ArrowTrendingDownIcon className="h-4 w-4 mr-1"/>}
                                        {formatPercentage(trade.profitPercentage)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ResultsDashboard;
