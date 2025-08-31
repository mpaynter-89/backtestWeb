
import React from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface StrategyEditorProps {
    code: string;
    setCode: (code: string) => void;
    onRunBacktest: () => void;
    isLoading: boolean;
}

const StrategyEditor: React.FC<StrategyEditorProps> = ({ code, setCode, onRunBacktest, isLoading }) => {
    return (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-xl h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Strategy Editor</h2>
                <p className="text-sm text-gray-400">Define your trading logic in Python.</p>
            </div>
            <div className="flex-grow p-4">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-3 font-spacemono text-sm bg-gray-900 border border-gray-700 rounded-md resize-none text-green-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    spellCheck="false"
                />
            </div>
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={onRunBacktest}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner className="h-5 w-5 mr-2" />
                            Running Backtest...
                        </>
                    ) : (
                        <>
                            <PlayIcon className="h-5 w-5 mr-2" />
                            Run Backtest
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default StrategyEditor;
