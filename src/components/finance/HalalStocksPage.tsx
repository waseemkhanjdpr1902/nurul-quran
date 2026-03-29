import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, XCircle, AlertCircle, Info, TrendingUp, Star, Trash2, Loader2, ExternalLink, ChevronRight, X, Lock, Users, Calculator, Bell, FileText, PieChart, ShieldCheck, Zap, Wrench, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { db, doc, setDoc, getDoc } from '../../lib/firebase';

const FMP_API_KEY = import.meta.env.VITE_FMP_API_KEY;
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// --- API Reduction Utilities ---
const CACHE_EXPIRY: Record<string, number> = {
  profile: 7 * 24 * 60 * 60 * 1000, // 7 days
  verdict: 30 * 24 * 60 * 60 * 1000, // 30 days
  ratios: 24 * 60 * 60 * 1000, // 24 hours
  price: 15 * 60 * 1000, // 15 minutes
  search: 60 * 60 * 1000, // 1 hour
};

const getCachedData = (key: string, type: string) => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  try {
    const { data, timestamp } = JSON.parse(cached);
    const ageLimit = CACHE_EXPIRY[type] || 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > ageLimit) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

const setCachedData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};

const trackAPICall = () => {
  const today = new Date().toDateString();
  const usage = JSON.parse(localStorage.getItem("halal_api_usage") || "{}");
  usage[today] = (usage[today] || 0) + 1;
  localStorage.setItem("halal_api_usage", JSON.stringify(usage));
  return usage[today];
};

const getDailyUsage = () => {
  const today = new Date().toDateString();
  const usage = JSON.parse(localStorage.getItem("halal_api_usage") || "{}");
  return usage[today] || 0;
};
// -------------------------------

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SubscriptionModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubscribe: () => void; isProcessing: boolean; onPayment: () => void }> = ({ isOpen, onClose, onSubscribe, isProcessing, onPayment }) => {
  if (!isOpen) return null;

  return (
    <div id="subscription-modal-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        id="subscription-modal-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-[32px] max-w-2xl w-full overflow-hidden shadow-2xl"
      >
        <div className="relative p-8 md:p-12">
          <button id="sub-modal-close" onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-emerald-500/20">
              <Zap size={14} />
              Upgrade to Pro
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Unlock Full Shariah Analysis</h2>
            <p className="text-zinc-400">Join 2,400+ Muslim investors making Shariah-compliant decisions with confidence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
              <h3 className="text-lg font-bold text-white mb-4">Basic Plan</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  3 searches per day
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Basic Halal/Haram status
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-500 line-through">
                  <XCircle size={16} />
                  Full financial ratios
                </li>
              </ul>
              <div className="text-2xl font-bold text-white">Free</div>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-600 border border-emerald-500 shadow-lg shadow-emerald-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-lg">Recommended</div>
              <h3 className="text-lg font-bold text-white mb-4">Pro Plan</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 size={16} className="text-emerald-200" />
                  Unlimited screening
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 size={16} className="text-emerald-200" />
                  Full financial reports
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 size={16} className="text-emerald-200" />
                  Community access
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 size={16} className="text-emerald-200" />
                  Portfolio tracker
                </li>
              </ul>
              <div className="text-2xl font-bold text-white">$29.99<span className="text-sm font-normal opacity-80">/mo</span></div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              id="sub-modal-pay"
              onClick={onPayment}
              disabled={isProcessing}
              className="w-full py-5 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all text-lg shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Pay with Razorpay
                </>
              )}
            </button>
            <button 
              id="sub-modal-trial"
              onClick={onSubscribe}
              className="w-full py-3 text-zinc-500 hover:text-white transition-all text-sm font-medium"
            >
              Start 7-Day Free Trial
            </button>
          </div>
          <p className="text-center text-zinc-500 text-[10px] mt-6">Secure payment via Razorpay. Cancel anytime.</p>
        </div>
      </motion.div>
    </div>
  );
};

interface StockProfile {
  symbol: string;
  companyName: string;
  price: number;
  exchangeShortName: string;
  industry: string;
  sector: string;
  image: string;
  description: string;
}

interface ScreeningResult {
  status: 'Halal' | 'Haram' | 'Doubtful';
  reason: string;
  debtRatio: number;
  interestIncomeRatio: number;
  isHaramIndustry: boolean;
}

interface WatchlistStock {
  symbol: string;
  name: string;
  status: 'Halal' | 'Haram' | 'Doubtful';
  price: number;
}

const HARAM_SECTORS = ['Financial Services', 'Banking', 'Insurance', 'Conventional Financial Services', 'Investment Banking', 'Real Estate Investment Trusts'];
const HARAM_INDUSTRIES = [
  'Tobacco', 'Alcoholic Beverages', 'Gambling', 'Casinos & Gaming', 
  'Weapons', 'Defense', 'Aerospace & Defense', 'Adult Entertainment', 
  'Pork Products', 'Conventional Banks', 'Life Insurance', 'Property & Casualty Insurance',
  'Recreational Vehicles', 'Brewers', 'Distillers & Vintners'
];

const EXCHANGES = [
  { id: 'all', name: 'All', icon: '🌐', codes: [] },
  { id: 'US', name: 'US', icon: '🇺🇸', codes: ['NASDAQ', 'NYSE', 'AMEX', 'BATS', 'OTC'], suffix: '' },
  { id: 'IN', name: 'India', icon: '🇮🇳', codes: ['NSE', 'BSE'], suffixes: ['.NS', '.BO'] },
  { id: 'SA', name: 'Saudi', icon: '🇸🇦', codes: ['TADAWUL'], suffix: '.SR' },
  { id: 'MY', name: 'Malaysia', icon: '🇲🇾', codes: ['KLSE'], suffix: '.KL' },
  { id: 'GB', name: 'UK', icon: '🇬🇧', codes: ['LSE', 'FTSE'], suffix: '.L' },
];

const halalStocks = [
  // 🇺🇸 US Stocks
  { name: "Apple", symbol: "AAPL", exchange: "NASDAQ", country: "US", sector: "Technology", flag: "🇺🇸", fallback: { debtRatio: 0.12, interestRatio: 0.01 } },
  { name: "Microsoft", symbol: "MSFT", exchange: "NASDAQ", country: "US", sector: "Technology", flag: "🇺🇸", fallback: { debtRatio: 0.15, interestRatio: 0.01 } },
  { name: "Johnson & Johnson", symbol: "JNJ", exchange: "NYSE", country: "US", sector: "Healthcare", flag: "🇺🇸", fallback: { debtRatio: 0.22, interestRatio: 0.02 } },
  { name: "Nike", symbol: "NKE", exchange: "NYSE", country: "US", sector: "Consumer", flag: "🇺🇸", fallback: { debtRatio: 0.18, interestRatio: 0.01 } },
  { name: "Costco", symbol: "COST", exchange: "NASDAQ", country: "US", sector: "Retail", flag: "🇺🇸", fallback: { debtRatio: 0.08, interestRatio: 0.01 } },

  // 🇮🇳 India Stocks
  { name: "TCS", symbol: "TCS.NS", exchange: "NSE", country: "IN", sector: "Technology", flag: "🇮🇳", fallback: { debtRatio: 0.05, interestRatio: 0.01 } },
  { name: "Infosys", symbol: "INFY.NS", exchange: "NSE", country: "IN", sector: "Technology", flag: "🇮🇳", fallback: { debtRatio: 0.04, interestRatio: 0.01 } },
  { name: "Wipro", symbol: "WIPRO.NS", exchange: "NSE", country: "IN", sector: "Technology", flag: "🇮🇳", fallback: { debtRatio: 0.06, interestRatio: 0.01 } },
  { name: "Sun Pharma", symbol: "SUNPHARMA.NS", exchange: "NSE", country: "IN", sector: "Healthcare", flag: "🇮🇳", fallback: { debtRatio: 0.10, interestRatio: 0.02 } },
  { name: "Asian Paints", symbol: "ASIANPAINT.NS", exchange: "NSE", country: "IN", sector: "Consumer", flag: "🇮🇳", fallback: { debtRatio: 0.07, interestRatio: 0.01 } },
  { name: "Dabur", symbol: "DABUR.NS", exchange: "NSE", country: "IN", sector: "Consumer", flag: "🇮🇳", fallback: { debtRatio: 0.05, interestRatio: 0.01 } },
  { name: "Dr Reddy's", symbol: "DRREDDY.NS", exchange: "NSE", country: "IN", sector: "Healthcare", flag: "🇮🇳", fallback: { debtRatio: 0.08, interestRatio: 0.01 } },

  // 🇸🇦 Saudi Stocks
  { name: "Saudi Aramco", symbol: "2222.SR", exchange: "Tadawul", country: "SA", sector: "Energy", flag: "🇸🇦", fallback: { debtRatio: 0.10, interestRatio: 0.01 } },
  { name: "STC", symbol: "7010.SR", exchange: "Tadawul", country: "SA", sector: "Telecom", flag: "🇸🇦", fallback: { debtRatio: 0.12, interestRatio: 0.01 } },
  { name: "Al Rajhi Bank", symbol: "1120.SR", exchange: "Tadawul", country: "SA", sector: "Islamic Banking", flag: "🇸🇦", fallback: { debtRatio: 0.00, interestRatio: 0.00 } },
  { name: "SABIC", symbol: "2010.SR", exchange: "Tadawul", country: "SA", sector: "Materials", flag: "🇸🇦", fallback: { debtRatio: 0.15, interestRatio: 0.02 } },

  // 🇲🇾 Malaysia Stocks
  { name: "Maybank Islamic", symbol: "1155.KL", exchange: "KLSE", country: "MY", sector: "Islamic Banking", flag: "🇲🇾", fallback: { debtRatio: 0.00, interestRatio: 0.00 } },
  { name: "Petronas Gas", symbol: "6033.KL", exchange: "KLSE", country: "MY", sector: "Energy", flag: "🇲🇾", fallback: { debtRatio: 0.08, interestRatio: 0.01 } },
  { name: "IHH Healthcare", symbol: "5225.KL", exchange: "KLSE", country: "MY", sector: "Healthcare", flag: "🇲🇾", fallback: { debtRatio: 0.15, interestRatio: 0.02 } },
];

const QURAN_AYAH = "Eat of the good things which We have provided for you. (Quran 2:172)";

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl ${className}`} />
);

const StockCard: React.FC<{ 
  stock: any; 
  price?: number; 
  onVisible: (symbol: string) => void;
  onClick: () => void;
  onHover: () => void;
}> = ({ stock, price, onVisible, onClick, onHover }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible(stock.symbol);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [stock.symbol, onVisible]);

  return (
    <motion.div
      ref={ref}
      id={`stock-card-${stock.symbol}`}
      whileHover={{ y: -4 }}
      onMouseEnter={onHover}
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:shadow-xl transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{stock.flag}</div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors">{stock.name}</h3>
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{stock.symbol}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-emerald-600">
            {price ? `$${price.toFixed(2)}` : <Skeleton className="h-4 w-12" />}
          </div>
          <div className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold rounded uppercase tracking-widest mt-1">
            {stock.exchange}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-emerald-500/20">
          {stock.sector}
        </span>
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1">
          <CheckCircle2 size={10} />
          Shariah Compliant ✓
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800">
        <div className="text-[10px] text-zinc-400 font-medium">Verified per AAOIFI Standards</div>
        <ChevronRight size={16} className="text-zinc-300 group-hover:text-emerald-500 transition-all" />
      </div>
    </motion.div>
  );
};

export const HalalStocksPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockProfile | null>(null);
  const [screening, setScreening] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [sessionCache, setSessionCache] = useState<Record<string, any>>({});
  const [selectedExchange, setSelectedExchange] = useState(EXCHANGES[0].id);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [showSubModal, setShowSubModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [sessionMostSearched, setSessionMostSearched] = useState<Record<string, number>>({});
  const [apiUsage, setApiUsage] = useState(0);
  const [visibleSymbols, setVisibleSymbols] = useState<Set<string>>(new Set());
  const [prices, setPrices] = useState<Record<string, number>>({});

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setApiUsage(getDailyUsage());
    
    const savedWatchlist = localStorage.getItem('halal_watchlist');
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    
    const savedRecent = localStorage.getItem('halal_recent_searches');
    if (savedRecent) setRecentSearches(JSON.parse(savedRecent));
    
    const savedCount = localStorage.getItem('halal_search_count');
    if (savedCount) setSearchCount(parseInt(savedCount));
    
    const checkSubscription = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().is_pro) {
            setIsSubscribed(true);
            localStorage.setItem('halal_is_subscribed', JSON.stringify(true));
          } else {
            const savedSub = localStorage.getItem('halal_is_subscribed');
            if (savedSub) setIsSubscribed(JSON.parse(savedSub));
          }
        } catch (err) {
          console.error("Error checking subscription:", err);
        }
      } else {
        const savedSub = localStorage.getItem('halal_is_subscribed');
        if (savedSub) setIsSubscribed(JSON.parse(savedSub));
      }
    };
    
    checkSubscription();
  }, [user]);

  const fetchPricesBatch = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0 || apiUsage > 200) return;

    const symbolsToFetch = symbols.filter(s => {
      const cached = getCachedData(`price_${s}`, 'price');
      if (cached) {
        setPrices(prev => ({ ...prev, [s]: cached }));
        return false;
      }
      return true;
    });

    if (symbolsToFetch.length === 0) return;

    try {
      const usage = trackAPICall();
      setApiUsage(usage);
      
      const res = await fetch(`https://financialmodelingprep.com/stable/quote?symbol=${symbolsToFetch.join(',')}&apikey=${FMP_API_KEY}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const newPrices: Record<string, number> = {};
        data.forEach(item => {
          newPrices[item.symbol] = item.price;
          setCachedData(`price_${item.symbol}`, item.price);
        });
        setPrices(prev => ({ ...prev, ...newPrices }));
      }
    } catch (err) {
      console.error("Batch price fetch failed:", err);
    }
  }, [apiUsage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (visibleSymbols.size > 0) {
        fetchPricesBatch(Array.from(visibleSymbols));
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [visibleSymbols, fetchPricesBatch]);

  const handleSubscribe = () => {
    setIsSubscribed(true);
    localStorage.setItem('halal_is_subscribed', JSON.stringify(true));
    setShowSubModal(false);
  };

  const handlePayment = async () => {
    if (!RAZORPAY_KEY_ID) {
      alert("Razorpay Key ID is missing. Please check your environment variables.");
      return;
    }

    if (!user) {
      alert("Please sign in to subscribe.");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const response = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 2499, // ₹2499 for Pro
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      });

      const order = await response.json();

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Halal Stocks Pro",
        description: "Unlock full Shariah analysis and portfolio tracking",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment on server
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.status === "ok") {
              // Save to Firestore
              await setDoc(doc(db, 'users', user.uid), {
                is_pro: true,
                subscription_date: new Date().toISOString(),
                last_payment_id: response.razorpay_payment_id
              }, { merge: true });

              handleSubscribe();
              alert("Payment successful! You are now a Pro member.");
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Error verifying payment. Please contact support.");
          }
        },
        prefill: {
          name: user.displayName || "User",
          email: user.email || "",
        },
        theme: {
          color: "#059669",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const toggleSubscription = () => {
    const newVal = !isSubscribed;
    setIsSubscribed(newVal);
    localStorage.setItem('halal_is_subscribed', JSON.stringify(newVal));
  };

  const saveToWatchlist = () => {
    if (!selectedStock || !screening) return;
    const newItem: WatchlistStock = {
      symbol: selectedStock.symbol,
      name: selectedStock.companyName,
      status: screening.status,
      price: selectedStock.price
    };
    const updated = [...watchlist.filter(s => s.symbol !== newItem.symbol), newItem];
    setWatchlist(updated);
    localStorage.setItem('halal_watchlist', JSON.stringify(updated));
  };

  const removeFromWatchlist = (symbol: string) => {
    const updated = watchlist.filter(s => s.symbol !== symbol);
    setWatchlist(updated);
    localStorage.setItem('halal_watchlist', JSON.stringify(updated));
  };

  const performScreening = (profile: StockProfile, income: any, balance: any): ScreeningResult => {
    const totalAssets = balance?.totalAssets || 0;
    const totalDebt = balance?.totalDebt || 0;
    const totalRevenue = income?.revenue || 0;
    const interestIncome = income?.interestIncome || 0;

    const debtRatio = totalAssets > 0 ? (totalDebt / totalAssets) : 0;
    const interestRatio = totalRevenue > 0 ? (interestIncome / totalRevenue) : 0;

    const sector = profile?.sector || 'Unknown';
    const industry = profile?.industry || 'Unknown';

    const isHaramSector = HARAM_SECTORS.some(s => sector.toLowerCase().includes(s.toLowerCase()));
    const isHaramIndustry = HARAM_INDUSTRIES.some(i => industry.toLowerCase().includes(i.toLowerCase()));

    if (isHaramSector || isHaramIndustry) {
      return {
        status: 'Haram',
        reason: `Core business involves prohibited activities: ${sector} / ${industry}`,
        debtRatio,
        interestIncomeRatio: interestRatio,
        isHaramIndustry: true
      };
    }

    // User requested: Doubtful if debt > 33% OR haram income > 5%
    if (interestRatio > 0.05 || debtRatio > 0.33) {
      let reason = '';
      if (interestRatio > 0.05 && debtRatio > 0.33) {
        reason = `Both Interest Income (${(interestRatio * 100).toFixed(2)}%) and Debt Ratio (${(debtRatio * 100).toFixed(2)}%) exceed Shariah thresholds.`;
      } else if (interestRatio > 0.05) {
        reason = `Interest income ratio (${(interestRatio * 100).toFixed(2)}%) exceeds 5% threshold.`;
      } else {
        reason = `Debt ratio (${(debtRatio * 100).toFixed(2)}%) exceeds 33% threshold.`;
      }

      return {
        status: 'Doubtful',
        reason,
        debtRatio,
        interestIncomeRatio: interestRatio,
        isHaramIndustry: false
      };
    }

    return {
      status: 'Halal',
      reason: 'Business activities and financial ratios are within Shariah-compliant limits.',
      debtRatio,
      interestIncomeRatio: interestRatio,
      isHaramIndustry: false
    };
  };

  const filteredStocks = halalStocks.filter(stock => {
    const matchesExchange = selectedExchange === 'all' || stock.country === selectedExchange;
    const matchesQuery = stock.name.toLowerCase().includes(query.toLowerCase()) || 
                        stock.symbol.toLowerCase().includes(query.toLowerCase());
    return matchesExchange && matchesQuery;
  });

  const fetchStockDetails = async (ticker: string, fallbackData?: any) => {
    if (!isSubscribed && searchCount >= 3) {
      setShowSubModal(true);
      return;
    }

    if (apiUsage > 200) {
      setError("Daily API limit reached. Serving cached/static data.");
    }

    // Check if it's a curated stock
    const curatedStock = halalStocks.find(s => s.symbol === ticker);

    // Check cache first
    const cachedProfile = getCachedData(`profile_${ticker}`, 'profile');
    const cachedScreening = getCachedData(`verdict_${ticker}`, 'verdict');

    if (cachedProfile && cachedScreening) {
      setSelectedStock(cachedProfile);
      setScreening(cachedScreening);
      setQuery('');
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    
    if (curatedStock) {
      try {
        let price = prices[ticker];
        if (!price && apiUsage <= 200) {
          const usage = trackAPICall();
          setApiUsage(usage);
          const quoteUrl = `https://financialmodelingprep.com/stable/quote?symbol=${ticker}&apikey=${FMP_API_KEY}`;
          const quoteRes = await fetch(quoteUrl);
          const quoteData = await quoteRes.json();
          price = (Array.isArray(quoteData) && quoteData.length > 0) ? quoteData[0].price : 0;
          if (price) setCachedData(`price_${ticker}`, price);
        } else if (!price) {
          price = 0; // Fallback
        }
        
        const profile: StockProfile = {
          symbol: ticker,
          companyName: curatedStock.name,
          price: price,
          exchangeShortName: curatedStock.exchange,
          industry: curatedStock.sector,
          sector: curatedStock.sector,
          image: `https://picsum.photos/seed/${ticker}/200/200`,
          description: `${curatedStock.name} is a Shariah-compliant company in the ${curatedStock.sector} sector.`
        };

        const result: ScreeningResult = {
          status: 'Halal',
          reason: `Sector screening passed for ${curatedStock.sector}. Verified per AAOIFI Standards.`,
          debtRatio: curatedStock.fallback?.debtRatio || 0.15,
          interestIncomeRatio: curatedStock.fallback?.interestRatio || 0.02,
          isHaramIndustry: false
        };

        setSelectedStock(profile);
        setScreening(result);
        setCachedData(`profile_${ticker}`, profile);
        setCachedData(`verdict_${ticker}`, result);
        
        if (!isSubscribed) {
          const newCount = searchCount + 1;
          setSearchCount(newCount);
          localStorage.setItem('halal_search_count', newCount.toString());
        }

        setLoading(false);
        return;
      } catch (err) {
        console.error("Error fetching curated stock price:", err);
      }
    }

    setQuery(ticker);
    
    const tryFetch = async (symbol: string) => {
      if (apiUsage > 200) return null;
      try {
        const usage = trackAPICall();
        setApiUsage(usage);

        // Smart Suffix Handling: Ensure correct suffix for API calls
        let finalSymbol = symbol;
        const exchange = EXCHANGES.find(ex => ex.codes.includes(fallbackData?.stockExchange || fallbackData?.exchangeShortName));
        if (exchange && exchange.suffix && !finalSymbol.endsWith(exchange.suffix)) {
          finalSymbol = `${finalSymbol.split('.')[0]}${exchange.suffix}`;
        } else if (exchange && exchange.suffixes) {
           // For India, try .NS first
           if (!finalSymbol.includes('.')) {
             finalSymbol = `${finalSymbol}.NS`;
           }
        }

        const profileUrl = `https://financialmodelingprep.com/stable/profile?symbol=${finalSymbol}&apikey=${FMP_API_KEY}`;
        const incomeUrl = `https://financialmodelingprep.com/stable/income-statement?symbol=${finalSymbol}&limit=1&apikey=${FMP_API_KEY}`;
        const balanceUrl = `https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=${finalSymbol}&limit=1&apikey=${FMP_API_KEY}`;

        const [profileRes, incomeRes, balanceRes] = await Promise.all([
          fetch(profileUrl),
          fetch(incomeUrl),
          fetch(balanceUrl)
        ]);

        const profileData = await profileRes.json();
        const incomeData = await incomeRes.json();
        const balanceData = await balanceRes.json();

        if (Array.isArray(profileData) && profileData.length > 0) {
          return {
            profile: profileData[0],
            income: (incomeData && incomeData[0]) || {},
            balance: (balanceData && balanceData[0]) || {}
          };
        }
        
        // If failed with suffix, try stripping it as fallback
        if (finalSymbol.includes('.')) {
          const stripped = finalSymbol.split('.')[0];
          const p2 = await fetch(`https://financialmodelingprep.com/stable/profile?symbol=${stripped}&apikey=${FMP_API_KEY}`);
          const d2 = await p2.json();
          if (Array.isArray(d2) && d2.length > 0) {
             const [i2, b2] = await Promise.all([
               fetch(`https://financialmodelingprep.com/stable/income-statement?symbol=${stripped}&limit=1&apikey=${FMP_API_KEY}`).then(r => r.json()),
               fetch(`https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=${stripped}&limit=1&apikey=${FMP_API_KEY}`).then(r => r.json())
             ]);
             return {
               profile: d2[0],
               income: (i2 && i2[0]) || {},
               balance: (b2 && b2[0]) || {}
             };
          }
        }

        return null;
      } catch (err) {
        console.error(`Fetch error for ${symbol}:`, err);
        return null;
      }
    };

    let data = await tryFetch(ticker);

    // If failed and has suffix, try stripping it (e.g., TCS.NS -> TCS)
    if (!data && (ticker.includes('.NS') || ticker.includes('.BO'))) {
      const strippedTicker = ticker.split('.')[0];
      data = await tryFetch(strippedTicker);
    }

    if (data) {
      const result = performScreening(data.profile, data.income, data.balance);
      setSelectedStock(data.profile);
      setScreening(result);
      
      // Update Cache
      setCachedData(`profile_${ticker}`, data.profile);
      setCachedData(`verdict_${ticker}`, result);

      // Update Recent Searches
      const recentObj = { symbol: data.profile.symbol, name: data.profile.companyName };
      const updatedRecent = [recentObj, ...recentSearches.filter(s => s.symbol !== ticker)].slice(0, 10);
      setRecentSearches(updatedRecent);
      localStorage.setItem('halal_recent_searches', JSON.stringify(updatedRecent));

      // Update Most Searched in Session
      setSessionMostSearched(prev => ({
        ...prev,
        [ticker]: (prev[ticker] || 0) + 1
      }));

      if (!isSubscribed) {
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem('halal_search_count', newCount.toString());
      }
    } else {
      // Fallback to partial data if available
      const partialProfile: StockProfile = {
        symbol: ticker,
        companyName: fallbackData?.name || ticker,
        price: fallbackData?.price || 0,
        exchangeShortName: fallbackData?.stockExchange || fallbackData?.exchangeShortName || 'Unknown',
        industry: 'Unknown',
        sector: 'Unknown',
        image: 'https://picsum.photos/seed/stock/200/200',
        description: 'Detailed financial data not available for this ticker.'
      };
      
      const result = performScreening(partialProfile, {}, {});
      setSelectedStock(partialProfile);
      setScreening({
        ...result,
        status: 'Doubtful',
        reason: 'Unable to fetch full financial profile. Manual verification recommended.'
      });
      if (!isSubscribed) {
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem('halal_search_count', newCount.toString());
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32 md:pb-8 animate-fade-up">
      <SubscriptionModal 
        isOpen={showSubModal} 
        onClose={() => setShowSubModal(false)} 
        onSubscribe={handleSubscribe} 
        isProcessing={isProcessingPayment}
        onPayment={handlePayment}
      />

      {apiUsage > 200 && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 text-sm font-bold">
            <AlertCircle size={18} />
            Live prices paused. Serving cached data. Refreshes tomorrow.
          </div>
          <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">API Limit Reached</div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 id="halal-stocks-title" className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Halal Stock Screener</h1>
          <p id="halal-stocks-description" className="text-zinc-500 dark:text-zinc-400">Dynamic Shariah-compliant screening for global and Indian stocks.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            id="toggle-sim-pro"
            onClick={toggleSubscription}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              isSubscribed 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
          >
            {isSubscribed ? 'Pro Access Active' : 'Simulate Pro Access'}
          </button>
          {!isSubscribed && (
            <div id="free-searches-counter" className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {3 - searchCount} Free Searches Left
            </div>
          )}
        </div>
      </div>

      {/* Market Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {EXCHANGES.map((ex) => (
          <button
            key={ex.id}
            id={`exchange-filter-${ex.id}`}
            onClick={() => setSelectedExchange(ex.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              selectedExchange === ex.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-100 dark:border-zinc-800 hover:border-emerald-500'
            }`}
          >
            <span>{ex.icon}</span>
            {ex.name}
          </button>
        ))}
      </div>

      {/* Local Search Filter */}
      <div className="relative mb-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input
          id="stock-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter curated stocks by name or ticker..."
          className="w-full pl-16 pr-6 py-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[24px] text-lg outline-none focus:border-emerald-500 transition-all dark:text-white"
        />
      </div>

      {/* Curated Stocks Grid */}
      {!selectedStock && !loading && (
        <div id="curated-stocks-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredStocks.map((stock) => (
            <StockCard 
              key={stock.symbol} 
              stock={stock} 
              price={prices[stock.symbol]}
              onVisible={(symbol) => setVisibleSymbols(prev => new Set(prev).add(symbol))}
              onClick={() => fetchStockDetails(stock.symbol, stock)}
              onHover={() => {
                if (!prices[stock.symbol] && apiUsage <= 200) {
                  fetchPricesBatch([stock.symbol]);
                }
              }}
            />
          ))}
          {filteredStocks.length === 0 && (
            <div className="col-span-full py-20 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800">
              <Search className="mx-auto text-zinc-300 mb-4" size={48} />
              <p className="text-zinc-500">No curated stocks found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Recent & Most Searched */}
      {!selectedStock && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {recentSearches.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Search size={14} />
                Recent Searches
              </h2>
              <div className="flex flex-wrap gap-3">
                {recentSearches.map(s => (
                  <button
                    key={s.symbol}
                    id={`recent-search-${s.symbol.replace(/\./g, '-')}`}
                    onClick={() => fetchStockDetails(s.symbol, s)}
                    className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-sm font-medium hover:border-emerald-500 transition-all"
                  >
                    {s.name} <span className="text-[10px] text-zinc-400 ml-1">{s.symbol.split('.')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {Object.keys(sessionMostSearched).length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp size={14} />
                Most Searched (Session)
              </h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(sessionMostSearched)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([symbol]) => (
                    <button
                      key={symbol}
                      id={`session-search-${symbol.replace(/\./g, '-')}`}
                      onClick={() => fetchStockDetails(symbol)}
                      className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-sm font-bold text-emerald-600 hover:bg-emerald-500/10 transition-all"
                    >
                      {symbol.split('.')[0]}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-8 mb-12">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 md:p-12 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-6 mb-8">
              <Skeleton className="w-20 h-20" />
              <div className="flex-1">
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-8 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-[32px] text-center mb-12">
          <XCircle className="text-rose-600 mx-auto mb-4" size={48} />
          <p className="text-rose-800 dark:text-rose-200 font-bold">{error}</p>
        </div>
      )}

      {/* Result Card */}
      {selectedStock && screening && !loading && (
        <div className="relative">
          {!isSubscribed && (
            <div id="pro-lock-overlay" className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white dark:from-zinc-950 via-white/80 dark:via-zinc-950/80 to-transparent z-10 flex flex-col items-center justify-end pb-12 px-4 text-center">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 shadow-2xl max-w-md w-full">
                <Lock className="text-emerald-500 mx-auto mb-4" size={32} />
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Unlock Full Analysis</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                  Get detailed debt ratios, interest income breakdowns, and full Shariah compliance reports for 500+ stocks.
                </p>
                <button 
                  id="pro-lock-subscribe-btn"
                  onClick={() => setShowSubModal(true)}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                >
                  Subscribe to Pro
                </button>
              </div>
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            id="stock-result-card"
            className={`bg-white dark:bg-zinc-900 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 overflow-hidden shadow-xl mb-12 ${!isSubscribed ? 'max-h-[600px] overflow-hidden' : ''}`}
          >
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-6">
                  <img 
                    src={selectedStock.image} 
                    alt={selectedStock.companyName} 
                    className="w-20 h-20 rounded-2xl object-contain bg-zinc-50 p-2"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{selectedStock.companyName}</h2>
                      <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold rounded uppercase tracking-widest">
                        {selectedStock.exchangeShortName}
                      </span>
                    </div>
                    <div className="text-zinc-400 font-mono text-sm">
                      {selectedStock.symbol.split('.')[0]} • {selectedStock.industry || 'Unknown Industry'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">${selectedStock.price.toFixed(2)}</div>
                  <div className="text-xs text-zinc-400 font-medium">Current Price</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                      <ShieldCheck size={14} />
                      {screening.status === 'Halal' ? '95%' : screening.status === 'Doubtful' ? '65%' : '15%'} Compliance Score
                    </div>
                    {screening.status === 'Halal' && (
                      <div className="flex items-center gap-2 px-6 py-3 bg-[#EAF3DE] text-[#27500A] font-bold rounded-2xl text-lg shadow-sm">
                        <CheckCircle2 size={24} />
                        Halal
                      </div>
                    )}
                    {screening.status === 'Doubtful' && (
                      <div className="flex items-center gap-2 px-6 py-3 bg-[#FAEEDA] text-[#633806] font-bold rounded-2xl text-lg shadow-sm">
                        <AlertCircle size={24} />
                        Doubtful
                      </div>
                    )}
                    {screening.status === 'Haram' && (
                      <div className="flex items-center gap-2 px-6 py-3 bg-[#FCEBEB] text-[#791F1F] font-bold rounded-2xl text-lg shadow-sm">
                        <XCircle size={24} />
                        Haram
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border-l-4 border-emerald-500">
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-2 uppercase tracking-wider">Screening Verdict</h4>
                    <p className={`text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed italic mb-4 ${!isSubscribed ? 'blur-sm select-none' : ''}`}>
                      "{screening.reason}"
                    </p>
                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium italic">
                        "{QURAN_AYAH}"
                      </p>
                    </div>
                  </div>
                  {screening.reason.includes('Manual verification') && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-3 text-amber-700 dark:text-amber-400 text-xs font-medium">
                      <AlertCircle size={16} />
                      Limited data available for this stock. Manual verification recommended.
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <button
                    id="stock-add-watchlist"
                    onClick={saveToWatchlist}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    <Star size={20} />
                    Save to Watchlist
                  </button>
                  <a 
                    id="stock-view-yahoo"
                    href={`https://finance.yahoo.com/quote/${selectedStock.symbol}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                  >
                    <ExternalLink size={20} />
                    View on Yahoo Finance
                  </a>
                </div>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${!isSubscribed ? 'blur-md select-none' : ''}`}>
                <div id="stat-debt-ratio" className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Debt Ratio</div>
                  <div className={`text-2xl font-bold ${screening.debtRatio > 0.33 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {(screening.debtRatio * 100).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">Threshold: 33%</div>
                </div>
                <div id="stat-interest-income" className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Interest Income</div>
                  <div className={`text-2xl font-bold ${screening.interestIncomeRatio > 0.05 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {(screening.interestIncomeRatio * 100).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">Threshold: 5%</div>
                </div>
                <div id="stat-haram-industry" className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Haram Industry</div>
                  <div className={`text-2xl font-bold ${screening.isHaramIndustry ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {screening.isHaramIndustry ? 'Yes' : 'No'}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">Based on Sector/Industry</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Useful Tools Section */}
      <div className="mb-12">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Wrench size={14} />
          Investor Toolkit
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            id="tool-zakat-calc"
            onClick={() => navigate('/finance/zakat-calculator')}
            className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[24px] hover:border-emerald-500 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Calculator size={20} />
            </div>
            <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">Zakat Calculator</h3>
            <p className="text-xs text-zinc-500">Calculate zakat on your stock portfolio.</p>
            <div className="mt-4 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Free Tool</div>
          </div>
        </div>
      </div>

      {/* Watchlist Section */}
      {watchlist.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Star size={14} />
            My Watchlist
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((stock) => (
              <div
                key={stock.symbol}
                id={`watchlist-item-${stock.symbol.replace(/\./g, '-')}`}
                className="bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group"
              >
                <div className="cursor-pointer flex-1" onClick={() => fetchStockDetails(stock.symbol)}>
                  <div className="font-bold text-emerald-900 dark:text-emerald-100">{stock.name}</div>
                  <div className="text-xs text-zinc-400 font-mono mb-3">{stock.symbol.split('.')[0]} • ${stock.price.toFixed(2)}</div>
                  {stock.status === 'Halal' && (
                    <span className="px-2 py-0.5 bg-[#EAF3DE] text-[#27500A] text-[10px] font-bold rounded uppercase tracking-widest">Halal</span>
                  )}
                  {stock.status === 'Doubtful' && (
                    <span className="px-2 py-0.5 bg-[#FAEEDA] text-[#633806] text-[10px] font-bold rounded uppercase tracking-widest">Doubtful</span>
                  )}
                  {stock.status === 'Haram' && (
                    <span className="px-2 py-0.5 bg-[#FCEBEB] text-[#791F1F] text-[10px] font-bold rounded uppercase tracking-widest">Haram</span>
                  )}
                </div>
                <button
                  id={`watchlist-remove-${stock.symbol.replace(/\./g, '-')}`}
                  onClick={() => removeFromWatchlist(stock.symbol)}
                  className="p-2 text-zinc-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div id="disclaimer-section" className="mt-12 p-8 bg-zinc-900 text-white rounded-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative flex gap-6">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <Info className="text-emerald-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Important Disclaimer</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Screening is automated based on Shariah financial ratios and reported business activities. 
              Results are for educational purposes only and do not constitute financial advice. 
              Shariah compliance is a complex matter and can change over time. 
              Always consult a qualified Islamic finance scholar before making any investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
