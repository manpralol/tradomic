export const STOCKS = [
  { sym: 'RELIANCE',  name: 'Reliance Industries',   price: 3017.45,  chg: +2.14, vol: '4.2M', cap: '20.4L Cr', exch: 'NSE' },
  { sym: 'TCS',       name: 'Tata Consultancy',       price: 3735.20,  chg: +0.87, vol: '1.8M', cap: '13.6L Cr', exch: 'NSE' },
  { sym: 'HDFCBANK',  name: 'HDFC Bank',              price: 1570.30,  chg: -0.32, vol: '6.1M', cap: '11.9L Cr', exch: 'NSE' },
  { sym: 'INFY',      name: 'Infosys Ltd',            price: 1512.75,  chg: +1.55, vol: '3.4M', cap: '6.3L Cr',  exch: 'NSE' },
  { sym: 'WIPRO',     name: 'Wipro Ltd',              price: 502.40,   chg: +0.91, vol: '5.6M', cap: '2.8L Cr',  exch: 'BSE' },
  { sym: 'ICICIBANK', name: 'ICICI Bank',             price: 1248.60,  chg: -0.18, vol: '7.2M', cap: '8.8L Cr',  exch: 'NSE' },
  { sym: 'ADANIENT',  name: 'Adani Enterprises',      price: 2891.00,  chg: +3.21, vol: '2.1M', cap: '3.3L Cr',  exch: 'BSE' },
  { sym: 'BAJFINANCE',name: 'Bajaj Finance',          price: 7102.55,  chg: -1.04, vol: '0.9M', cap: '4.3L Cr',  exch: 'NSE' },
  { sym: 'TATAMOTORS',name: 'Tata Motors',            price: 1056.80,  chg: +2.67, vol: '8.3M', cap: '3.9L Cr',  exch: 'NSE' },
  { sym: 'SUNPHARMA', name: 'Sun Pharmaceutical',     price: 1784.30,  chg: +0.44, vol: '1.5M', cap: '4.3L Cr',  exch: 'BSE' },
  { sym: 'MARUTI',    name: 'Maruti Suzuki',          price: 12430.00, chg: +1.12, vol: '0.6M', cap: '3.7L Cr',  exch: 'NSE' },
  { sym: 'LTIM',      name: 'LTIMindtree',            price: 5620.45,  chg: -0.76, vol: '0.7M', cap: '1.7L Cr',  exch: 'NSE' },
];

export const WATCHLIST = ['RELIANCE','TCS','HDFCBANK','INFY','WIPRO','ICICIBANK','TATAMOTORS','SUNPHARMA'];

export const TICKER_STOCKS = [
  ...STOCKS,
  { sym: 'NIFTY 50',  name: 'Index', price: 24532.15, chg: +0.62, exch: 'NSE' },
  { sym: 'SENSEX',    name: 'Index', price: 81245.00,  chg: +0.54, exch: 'BSE' },
  { sym: 'BANKNIFTY', name: 'Index', price: 52340.80,  chg: -0.21, exch: 'NSE' },
];

export const HOLDINGS = [
  { sym: 'RIL',  fullSym: 'RELIANCE', name: 'Reliance Industries', qty: 12,  avgCost: '₹2,780', curPrice: '₹3,017', pnl: '+₹2,844', pnlClass: 'up',   fractional: false },
  { sym: 'TCS',  fullSym: 'TCS',      name: 'Tata Consultancy',    qty: 8,   avgCost: '₹3,400', curPrice: '₹3,735', pnl: '+₹2,680', pnlClass: 'up',   fractional: false },
  { sym: 'HDFC', fullSym: 'HDFCBANK', name: 'HDFC Bank',           qty: 20,  avgCost: '₹1,580', curPrice: '₹1,570', pnl: '-₹200',   pnlClass: 'down', fractional: false },
  { sym: 'INFY', fullSym: 'INFY',     name: 'Infosys',             qty: 15,  avgCost: '₹1,420', curPrice: '₹1,512', pnl: '+₹1,380', pnlClass: 'up',   fractional: false },
  { sym: 'WIP',  fullSym: 'WIPRO',    name: 'Wipro Ltd',           qty: 0.5, avgCost: '₹480',   curPrice: '₹502',   pnl: 'FRACTIONAL', pnlClass: 'up', fractional: true },
];

// Holdings shown in hero portfolio card (first 3)
export const HERO_HOLDINGS = [
  { icon: 'RIL',  name: 'Reliance Industries', qty: '12 shares · NSE', val: '₹36,204', chg: '+2.14%', chgClass: 'up'   },
  { icon: 'TCS',  name: 'Tata Consultancy',    qty: '8 shares · NSE',  val: '₹29,880', chg: '+0.87%', chgClass: 'up'   },
  { icon: 'HDFC', name: 'HDFC Bank',           qty: '20 shares · BSE', val: '₹31,400', chg: '-0.32%', chgClass: 'down' },
];

export const BANKS = [
  { logo: 'SBI',  name: 'SBI Savings',   acc: 'XXXX-XXXX-4291', bal: '₹84,23,000'   },
  { logo: 'HDFC', name: 'HDFC Current',  acc: 'XXXX-XXXX-8812', bal: '₹1,50,00,000' },
];

export const DIVIDENDS = [
  { logo: 'TCS', name: 'TCS Dividend',      detail: 'Settled on-chain · T+0', amount: '₹1,400', amtClass: 'text-green' },
  { logo: 'RIL', name: 'Reliance Dividend', detail: 'Settled on-chain · T+0', amount: '₹2,160', amtClass: 'text-green' },
];
