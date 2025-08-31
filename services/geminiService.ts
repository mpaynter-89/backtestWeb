import { GoogleGenAI, Type } from "@google/genai";
import { Strategy } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function parseStrategyWithGemini(code: string): Promise<Strategy> {
    const prompt = `
    You are an expert financial trading strategy parser. Your task is to convert a simplified Python trading script into a structured JSON object. 
    The script defines entry and exit conditions using 'if' statements and 'buy()' or 'sell()' calls.
    
    The supported indicators are:
    - SMA(period): Simple Moving Average
    - RSI(period): Relative Strength Index
    - MACD(fast, slow, signal): Moving Average Convergence Divergence. Access its components with '.line', '.signal', or '.histogram'.
    - BollingerBands(period, stdDev): Bollinger Bands. Access its components with '.upper', '.lower', or '.middle'.
    - 'price': The closing price of the asset.

    The supported operators are '>', '<', '>=', '<='.
    Conditions can be combined with 'and'.

    You must parse the conditions inside the 'if' statements that lead to 'buy()' and 'sell()' calls and translate them into the provided JSON schema.
    - 'buy()' corresponds to 'entryConditions'.
    - 'sell()' corresponds to 'exitConditions'.
    
    Examples:
    - \`SMA(50) > SMA(200)\`: A standard golden cross.
    - \`RSI(14) < 30\`: RSI is in the oversold territory.
    - \`price > BollingerBands(20, 2).upper\`: Price breaks above the upper Bollinger Band.
    - \`MACD(12, 26, 9).line > MACD(12, 26, 9).signal\`: The MACD line crosses above the signal line.

    Here is the Python-like code to parse:
    ---
    ${code}
    ---
    
    Please provide ONLY the JSON object that strictly adheres to the schema. Do not include any other text or markdown formatting.
    `;

    const conditionSchema = {
        type: Type.OBJECT,
        properties: {
            indicator: { type: Type.STRING, enum: ['SMA', 'RSI', 'MACD', 'BollingerBands', 'price'] },
            period: { type: Type.INTEGER, nullable: true },
            stdDev: { type: Type.NUMBER, nullable: true },
            fastPeriod: { type: Type.INTEGER, nullable: true },
            slowPeriod: { type: Type.INTEGER, nullable: true },
            signalPeriod: { type: Type.INTEGER, nullable: true },
            line: { type: Type.STRING, enum: ['line', 'signal', 'histogram', 'upper', 'lower', 'middle'], nullable: true },
            
            operator: { type: Type.STRING, enum: ['>', '<', '>=', '<='] },
            
            target: { type: Type.STRING, enum: ['SMA', 'RSI', 'MACD', 'BollingerBands', 'price', 'value'] },
            targetPeriod: { type: Type.INTEGER, nullable: true },
            targetStdDev: { type: Type.NUMBER, nullable: true },
            targetFastPeriod: { type: Type.INTEGER, nullable: true },
            targetSlowPeriod: { type: Type.INTEGER, nullable: true },
            targetSignalPeriod: { type: Type.INTEGER, nullable: true },
            targetLine: { type: Type.STRING, enum: ['line', 'signal', 'histogram', 'upper', 'lower', 'middle'], nullable: true },
            
            value: { type: Type.NUMBER, nullable: true },
        },
        required: ['indicator', 'operator', 'target']
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        entryConditions: {
                            type: Type.ARRAY,
                            items: conditionSchema
                        },
                        exitConditions: {
                            type: Type.ARRAY,
                            items: conditionSchema
                        }
                    },
                    required: ['entryConditions', 'exitConditions']
                },
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as Strategy;

    } catch (error) {
        console.error("Error parsing strategy with Gemini:", error);
        throw new Error("Failed to parse the strategy using AI. The AI model might be unavailable or the response was invalid.");
    }
}
