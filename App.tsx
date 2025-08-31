
import React, { useState, useCallback } from 'react';
import StrategyEditor from './components/StrategyEditor';
import ResultsDashboard from './components/ResultsDashboard';
import PriceChart from './components/PriceChart';
import { BacktestResult, Candle, Strategy } from './types';
import { parseStrategyWithGemini } from './services/geminiService';
import { runBacktest } from './services/backtestingService';
import { generateMockCandleData } from './services/cryptoDataService';
import { INITIAL_STRATEGY_CODE } from './constants';
import { LogoIcon } from './components/icons/LogoIcon';

const App: React.FC = () => {
    const [strategyCode, setStrategyCode] = useState<string>(INITIAL_STRATEGY_CODE);
    const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [mockData] = useState<Candle[]>(() => generateMockCandleData(365));

    const handleRunBacktest = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setBacktestResult(null);

        try {
            const parsedStrategy: Strategy = await parseStrategyWithGemini(strategyCode);
            if (!parsedStrategy || !parsedStrategy.entryConditions || !parsedStrategy.exitConditions) {
                throw new Error("AI failed to generate a valid strategy structure. Please check your syntax or try again.");
            }
            
            const result = runBacktest(mockData, parsedStrategy, 10000);
            setBacktestResult(result);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [strategyCode, mockData]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
            <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <LogoIcon className="h-8 w-8 text-cyan-400" />
                            <h1 className="text-xl font-bold tracking-tight text-white">
                                Crypto Strategy Backtester <span className="text-cyan-400">AI</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                    <div className="lg:col-span-3">
                         <StrategyEditor
                            code={strategyCode}
                            setCode={setStrategyCode}
                            onRunBacktest={handleRunBacktest}
                            isLoading={isLoading}
                        />
                    </div>
                    <div className="lg:col-span-9 flex flex-col gap-6">
                       {error && (
                            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
                                <h3 className="font-bold">Error</h3>
                                <p>{error}</p>
                            </div>
                        )}
                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 shadow-xl flex-grow h-[500px]">
                           <PriceChart data={mockData} trades={backtestResult?.trades || []} />
                        </div>
                         <ResultsDashboard results={backtestResult} isLoading={isLoading} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
