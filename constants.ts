export const INITIAL_STRATEGY_CODE = `# Welcome to the AI Strategy Builder!
# Define your entry and exit conditions using a simple Python-like syntax.
# Supported indicators: SMA, RSI, MACD, BollingerBands.
# Supported operators: >, <, >=, <=

def strategy():
    # --- Entry Conditions ---
    # MACD bullish crossover: The MACD line crosses above the signal line.
    # AND
    # RSI is not overbought.
    if MACD(12, 26, 9).line > MACD(12, 26, 9).signal and RSI(14) < 70:
        buy()

    # --- Exit Conditions ---
    # MACD bearish crossover.
    if MACD(12, 26, 9).line < MACD(12, 26, 9).signal:
        sell()
`;
