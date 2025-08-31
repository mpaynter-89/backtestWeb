
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot } from 'recharts';
import { Candle, Trade } from '../types';

interface PriceChartProps {
    data: Candle[];
    trades: Trade[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800/80 border border-gray-600 p-3 rounded-md shadow-lg">
                <p className="label text-gray-300">{`Date : ${label}`}</p>
                <p className="intro text-cyan-400">{`Price : $${payload[0].value.toFixed(2)}`}</p>
            </div>
        );
    }

    return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ data, trades }) => {
    
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="date" stroke="#A0AEC0" tick={{ fontSize: 12 }} />
                <YAxis stroke="#A0AEC0" tickFormatter={(value) => `$${Number(value).toLocaleString()}`} tick={{ fontSize: 12 }} domain={['dataMin - 1000', 'dataMax + 1000']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="close" stroke="#38bdf8" dot={false} name="BTC/USD Price" />
                
                {trades.map((trade, index) => (
                    <ReferenceDot 
                        key={`buy-${index}`} 
                        x={trade.entryDate} 
                        y={trade.entryPrice} 
                        r={5} 
                        fill="#22c55e" 
                        stroke="#16a34a" 
                    />
                ))}
                 {trades.map((trade, index) => (
                    <ReferenceDot 
                        key={`sell-${index}`} 
                        x={trade.exitDate} 
                        y={trade.exitPrice} 
                        r={5} 
                        fill="#ef4444" 
                        stroke="#dc2626" 
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PriceChart;
