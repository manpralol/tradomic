import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [theme, setTheme] = useState(() =>
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'bloomberg' : 'zerodha'
    );
    const [currentPage, setCurrentPage] = useState('home');
    const [tradeModalOpen, setTradeModalOpen] = useState(false);
    const [tradeModalType, setTradeModalType] = useState('BUY');
    const [sebiModalOpen, setSebiModalOpen] = useState(false);
    const [sebiOfficerName, setSebiOfficerName] = useState('');
    const [tradeHistory, setTradeHistory] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);

    // Auth States
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userType, setUserType] = useState(null); // 'trader' | 'sebi'

    const [user, setUser] = useState({
        name: 'Arjun Mehta',
        avatar: 'AM',
        balance: 23456789,
        upiId: 'arjunmehta@okicici',
        pan: 'ABCDE1234F',
        wallet: '0xAM...4f2c',
        holdings: {
            'RELIANCE': { qty: 300, avgPrice: 2840 },
            'INFY': { qty: 250, avgPrice: 1480 },
            'MAZDA': { qty: 30, avgPrice: 456 },
            'TCS': { qty: 10, avgPrice: 3650 },
            'HDFCBANK': { qty: 15, avgPrice: 1580 },
        }
    });

    function canAfford(qty, price) {
        return user.balance >= qty * price;
    }

    function canSell(symbol, qty) {
        const holding = user.holdings[symbol];
        return holding && holding.qty >= qty;
    }

    function executeBuy({ symbol, qty, price, txId, txHash, settlementTime }) {
        setUser(prev => {
            const existing = prev.holdings[symbol];
            const newQty = (existing ? existing.qty : 0) + qty;
            const newAvg = existing
                ? ((existing.qty * existing.avgPrice) + (qty * price)) / newQty
                : price;
            return {
                ...prev,
                balance: prev.balance - (qty * price),
                holdings: {
                    ...prev.holdings,
                    [symbol]: { qty: newQty, avgPrice: newAvg }
                }
            };
        });
        addTrade({ txId, txHash, symbol, qty, type: 'BUY', price, total: qty * price, settlementTime, timestamp: Date.now() });
    }

    function executeSell({ symbol, qty, price, txId, txHash, settlementTime }) {
        setUser(prev => {
            const existing = prev.holdings[symbol];
            const newQty = existing.qty - qty;
            const newHoldings = { ...prev.holdings };
            if (newQty <= 0) {
                delete newHoldings[symbol];
            } else {
                newHoldings[symbol] = { ...existing, qty: newQty };
            }
            return {
                ...prev,
                balance: prev.balance + (qty * price),
                holdings: newHoldings
            };
        });
        addTrade({ txId, txHash, symbol, qty, type: 'SELL', price, total: qty * price, settlementTime, timestamp: Date.now() });
    }

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    function loginAsTrader() {
        setIsLoggedIn(true);
        setUserType('trader');
    }

    function logout() {
        setIsLoggedIn(false);
        setUserType(null);
        navigate('home');
    }

    function navigate(page) {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    }

    function addTrade(trade) {
        setTradeHistory(prev => {
            if (prev.some(t => t.txId === trade.txId)) return prev;
            return [trade, ...prev];
        });
    }

    function toggleTheme() {
        setTheme(t => t === 'bloomberg' ? 'zerodha' : 'bloomberg');
    }

    function openTradeModal(type) {
        setTradeModalType(type);
        setTradeModalOpen(true);
    }

    function closeTradeModal() {
        setTradeModalOpen(false);
    }

    function openSebiModal() {
        setSebiModalOpen(true);
    }

    function closeSebiModal() {
        setSebiModalOpen(false);
    }

    return (
        <AppContext.Provider value={{
            theme, currentPage, user,
            isLoggedIn, userType, loginAsTrader, logout, setIsLoggedIn, setUserType,
            tradeModalOpen, tradeModalType,
            sebiModalOpen, sebiOfficerName,
            setSebiOfficerName,
            tradeHistory, selectedStock,
            setSelectedStock, addTrade,
            navigate, toggleTheme,
            openTradeModal, closeTradeModal,
            openSebiModal, closeSebiModal,
            canAfford, canSell, executeBuy, executeSell,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
