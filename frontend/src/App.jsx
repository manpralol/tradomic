import React from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import TickerTape from './components/TickerTape';
import HeroSection from './components/HeroSection';
import StocksPage from './components/StocksPage';
import PortfolioPage from './components/PortfolioPage';
import WhyUsPage from './components/WhyUsPage';
import TradeModal from './components/TradeModal';
import SebiModal from './components/SebiModal';
import StockDetailPage from './components/StockDetailPage';
import SebiDashboard from './components/SebiDashboard';
import LoginScreen from './components/LoginScreen';

export default function App() {
    const { currentPage, isLoggedIn, userType, navigate } = useApp();

    React.useEffect(() => {
        if (isLoggedIn && userType === 'sebi' && currentPage !== 'sebi') {
            navigate('sebi');
        }
    }, [isLoggedIn, userType, currentPage, navigate]);

    if (!isLoggedIn) {
        return (
            <>
                <LoginScreen />
                <SebiModal />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <TickerTape />
            <div className="page-content">
                <section id="sec-home" className={currentPage === 'home' ? 'active' : ''}>
                    <HeroSection />
                </section>
                <section id="sec-stocks" className={currentPage === 'stocks' ? 'active' : ''}>
                    <StocksPage />
                </section>
                <section id="sec-portfolio" className={currentPage === 'portfolio' ? 'active' : ''}>
                    <PortfolioPage />
                </section>
                <section id="sec-whyus" className={currentPage === 'whyus' ? 'active' : ''}>
                    <WhyUsPage />
                </section>
                <section id="sec-stockdetail" className={currentPage === 'stockdetail' ? 'active' : ''}>
                    {currentPage === 'stockdetail' && <StockDetailPage />}
                </section>
                <section id="sec-sebi" className={currentPage === 'sebi' ? 'active' : ''}>
                    {currentPage === 'sebi' && <SebiDashboard />}
                </section>
            </div>
            <TradeModal />
            <SebiModal />
        </>
    );
}
