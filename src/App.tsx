<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yard Vibes Cookshop</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- React & ReactDOM -->
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <!-- Babel for JSX -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useRef } = React;

        // Default Initial Menu
        const INITIAL_MENU = [
            { id: 1, name: "Curry Goat & Rice", price: 1400, category: "Mains", desc: "Tender goat slow-cooked in Jamaican curry spices with butter bean.", image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80", inStock: true, isSpecial: true },
            { id: 2, name: "Brown Stew Chicken", price: 1000, category: "Mains", desc: "Caramelized savory chicken stewed with carrots, bell peppers, and thyme.", image: "https://images.unsplash.com/photo-1604908176997-125f2596f37c?auto=format&fit=crop&w=600&q=80", inStock: true, isSpecial: false },
            { id: 3, name: "Fried Chicken & Chips", price: 900, category: "Mains", desc: "Crispy seasoned golden fried chicken served with hot seasoned french fries.", image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80", inStock: true, isSpecial: true },
            { id: 4, name: "Festival (2 pcs)", price: 150, category: "Sides", desc: "Sweet, golden-brown fried cornmeal dumplings.", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80", inStock: true, isSpecial: false },
            { id: 5, name: "Fried Plantains", price: 200, category: "Sides", desc: "Sweet ripe yellow plantains fried to perfection.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80", inStock: true, isSpecial: false },
            { id: 6, name: "Tru-Juice Pineapple", price: 250, category: "Drinks", desc: "Refreshing Jamaican chilled fruit drink.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80", inStock: true, isSpecial: false }
        ];

        // Default Event Menu Items
        const INITIAL_EVENT_MENU = [
            { id: 101, name: "Steamed Fish & Bammy (Weekend Special)", price: 2200, category: "Event Specials", desc: "Fresh snapper steamed with okra, crackers, and scotch bonnet pepper.", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80", inStock: true, isSpecial: true },
            { id: 102, name: "Mannish Water (Soup)", price: 800, category: "Event Specials", desc: "Traditional goat soup with green bananas, yam, and dumplings.", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80", inStock: true, isSpecial: true }
        ];

        function App() {
            // State Management
            const [view, setView] = useState('customer'); // 'customer' or 'admin'
            const [shopConfig, setShopConfig] = useState(() => {
                const saved = localStorage.getItem('cookshop_config');
                return saved ? JSON.parse(saved) : {
                    name: "Yard Vibes Cookshop",
                    phone: "18765550192",
                    status: "Open",
                    hours: "Mon - Sat: 10:00 AM - 9:00 PM",
                    location: "Montego Bay, St. James",
                    crossPromoName: "Sister's Island Treats",
                    crossPromoUrl: "https://sisters-treats.vercel.app",
                    isEventMode: false,
                    eventTitle: "🔥 Weekend Fish Fry & Sound System Link-Up!",
                    eventBanner: "Live music, fresh snapper, and ice cold drinks rolling all weekend!"
                };
            });

            const [menu, setMenu] = useState(() => {
                const saved = localStorage.getItem('cookshop_menu');
                return saved ? JSON.parse(saved) : INITIAL_MENU;
            });

            const [eventMenu, setEventMenu] = useState(() => {
                const saved = localStorage.getItem('cookshop_event_menu');
                return saved ? JSON.parse(saved) : INITIAL_EVENT_MENU;
            });

            const [cart, setCart] = useState(() => {
                const saved = localStorage.getItem('cookshop_cart');
                return saved ? JSON.parse(saved) : [];
            });

            const [orders, setOrders] = useState(() => {
                const saved = localStorage.getItem('cookshop_orders');
                return saved ? JSON.parse(saved) : [];
            });

            const [suggestions, setSuggestions] = useState(() => {
                const saved = localStorage.getItem('cookshop_suggestions');
                return saved ? JSON.parse(saved) : [
                    { id: 1, text: "Oxtail on Fridays", count: 14 },
                    { id: 2, text: "Curry Duck", count: 9 },
                    { id: 3, text: "Stuffed Conch", count: 6 }
                ];
            });

            const [selectedCategory, setSelectedCategory] = useState('All');
            const [isCartOpen, setIsCartOpen] = useState(false);
            const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
            const [selectedItemForCustomizer, setSelectedItemForCustomizer] = useState(null);
            
            // Customizer state
            const [pepperLevel, setPepperLevel] = useState('Normal Pepper');
            const [gravyOption, setGravyOption] = useState('Normal Gravy');
            const [customerName, setCustomerName] = useState('');
            const [customerPhone, setCustomerPhone] = useState('');
            const [paymentMethod, setPaymentMethod] = useState('Cash on Pickup');
            const [bankRefCode, setBankRefCode] = useState('');

            // Suggestion Modal state
            const [suggestText, setSuggestText] = useState('');
            const [selectedSuggestionCheckbox, setSelectedSuggestionCheckbox] = useState('');

            // Admin Login state
            const [adminPin, setAdminPin] = useState('');
            const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

            // Audio Alert Ref
            const audioRef = useRef(null);

            // Save to LocalStorage
            useEffect(() => { localStorage.setItem('cookshop_config', JSON.stringify(shopConfig)); }, [shopConfig]);
            useEffect(() => { localStorage.setItem('cookshop_menu', JSON.stringify(menu)); }, [menu]);
            useEffect(() => { localStorage.setItem('cookshop_event_menu', JSON.stringify(eventMenu)); }, [eventMenu]);
            useEffect(() => { localStorage.setItem('cookshop_cart', JSON.stringify(cart)); }, [cart]);
            useEffect(() => { localStorage.setItem('cookshop_orders', JSON.stringify(orders)); }, [orders]);
            useEffect(() => { localStorage.setItem('cookshop_suggestions', JSON.stringify(suggestions)); }, [suggestions]);

            // Play Chime on New Order
            const playChime = () => {
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2); // A5
                    gain.gain.setValueAtTime(0.3, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.5);
                } catch(e) { console.log("Audio not allowed yet"); }
            };

            // Add to Cart with Customizer Options
            const handleAddToCart = (item) => {
                setSelectedItemForCustomizer(item);
                setPepperLevel('Normal Pepper');
                setGravyOption('Normal Gravy');
            };

            const confirmAddToCart = () => {
                if (!selectedItemForCustomizer) return;
                const cartItem = {
                    ...selectedItemForCustomizer,
                    cartId: Date.now() + Math.random(),
                    options: `🌶️ ${pepperLevel} | 🍛 ${gravyOption}`
                };
                setCart([...cart, cartItem]);
                setSelectedItemForCustomizer(null);
            };

            const removeFromCart = (cartId) => {
                setCart(cart.filter(item => item.cartId !== cartId));
            };

            const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

            // Checkout Handlers
            const handleWhatsAppCheckout = () => {
                if (!customerName.trim() || !customerPhone.trim()) {
                    alert("Please enter your Name and Phone Number before checking out.");
                    return;
                }
                const orderSummary = cart.map(i => `• ${i.name} (${i.options}) - $${i.price} JMD`).join('%0A');
                const total = `Total: $${cartTotal} JMD`;
                const paymentInfo = `Payment: ${paymentMethod} ${paymentRefText()}`;
                const custInfo = `Customer: ${customerName} (${customerPhone})%0A`;
                const text = `*NEW COOKSHOP ORDER*%0A${custInfo}%0A${orderSummary}%0A%0A${total}%0A${paymentInfo}`;
                
                const newOrder = {
                    id: Date.now(),
                    customerName,
                    customerPhone,
                    items: [...cart],
                    total: cartTotal,
                    payment: paymentMethod,
                    time: new Date().toLocaleTimeString(),
                    status: 'Pending'
                };
                setOrders([newOrder, ...orders]);
                playChime();

                window.open(`https://wa.me/${shopConfig.phone}?text=${text}`, '_blank');
                setCart([]);
                setIsCartOpen(false);
            };

            const handleSocialCheckout = (platform) => {
                if (!customerName.trim() || !customerPhone.trim()) {
                    alert("Please enter your Name and Phone Number before checking out.");
                    return;
                }
                const orderSummary = cart.map(i => `• ${i.name} (${i.options}) - $${i.price} JMD`).join('\n');
                const text = `NEW ORDER:\nCustomer: ${customerName} (${customerPhone})\n\n${orderSummary}\n\nTotal: $${cartTotal} JMD\nPayment: ${paymentMethod}`;
                
                navigator.clipboard.writeText(text);
                alert(`Order copied to clipboard! Paste it directly into our ${platform} DM.`);

                const newOrder = {
                    id: Date.now(),
                    customerName,
                    customerPhone,
                    items: [...cart],
                    total: cartTotal,
                    payment: paymentMethod,
                    time: new Date().toLocaleTimeString(),
                    status: 'Pending'
                };
                setOrders([newOrder, ...orders]);
                playChime();

                setCart([]);
                setIsCartOpen(false);
            };

            const paymentRefText = () => {
                if (paymentMethod === 'Bank Transfer / Lynk' && bankRefCode) {
                    return `(Ref: ${bankRefCode})`;
                }
                return '';
            };

            // Submit Suggestion
            const submitSuggestion = (e) => {
                e.preventDefault();
                const textToSubmit = suggestText.trim() || selectedSuggestionCheckbox;
                if (!textToSubmit) return;

                const existing = suggestions.find(s => s.text.toLowerCase() === textToSubmit.toLowerCase());
                if (existing) {
                    setSuggestions(suggestions.map(s => s.text === existing.text ? {...s, count: s.count + 1} : s));
                } else {
                    setSuggestions([...suggestions, { id: Date.now(), text: textToSubmit, count: 1 }]);
                }
                setSuggestText('');
                setSelectedSuggestionCheckbox('');
                setIsSuggestionOpen(false);
                alert("Thank you! Your suggestion has been sent to the kitchen wishlist.");
            };

            // Admin Login Handler
            const handleAdminLogin = (e) => {
                e.preventDefault();
                if (adminPin === '1234' || adminPin === '9999') {
                    setIsAdminLoggedIn(true);
                } else {
                    alert("Incorrect PIN. Try 1234");
                }
            };

            return (
                <div className="max-w-md mx-auto bg-slate-900 min-h-screen pb-24 shadow-2xl relative border-x border-slate-800">
                    
                    {/* Top Bar / Navigation */}
                    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                        <div>
                            <h1 className="font-extrabold text-lg text-emerald-400 flex items-center gap-1.5">
                                🍲 {shopConfig.name}
                            </h1>
                            <p className="text-xs text-slate-400">{shopConfig.location} • <span className="text-emerald-400 font-semibold">{shopConfig.status}</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setView(view === 'customer' ? 'admin' : 'customer')}
                                className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg border border-slate-700 font-medium transition">
                                {view === 'customer' ? '🔒 Admin' : '🏠 Menu'}
                            </button>
                        </div>
                    </header>

                    {/* Sister Shop Cross-Promotion Banner */}
                    {shopConfig.crossPromoName && view === 'customer' && (
                        <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs">
                            <span className="text-amber-300 font-medium">✨ Check out family spot: <strong className="text-white">{shopConfig.crossPromoName}</strong></span>
                            <a href={shopConfig.crossPromoUrl} target="_blank" rel="noreferrer" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded shadow transition">
                                Visit ↗
                            </a>
                        </div>
                    )}

                    {/* CUSTOMER VIEW */}
                    {view === 'customer' && (
                        <main className="p-4">
                            
                            {/* Event Mode Banner */}
                            {shopConfig.isEventMode && (
                                <div className="mb-6 bg-gradient-to-r from-red-600 to-amber-600 p-4 rounded-2xl shadow-lg border border-red-400/30 text-white">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Special Event</span>
                                    </div>
                                    <h2 className="font-bold text-lg mb-1">{shopConfig.eventTitle}</h2>
                                    <p className="text-xs text-amber-100">{shopConfig.eventBanner}</p>
                                </div>
                            )}

                            {/* Hours & Info */}
                            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 mb-5 text-xs text-slate-300 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-slate-200">🕒 Operating Hours</p>
                                    <p className="text-slate-400">{shopConfig.hours}</p>
                                </div>
                                <button 
                                    onClick={() => setIsSuggestionOpen(true)}
                                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-lg font-medium text-center transition">
                                    💡 Suggest Dish
                                </button>
                            </div>

                            {/* Category Filter Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
                                {['All', 'Mains', 'Sides', 'Drinks', ...(shopConfig.isEventMode ? ['Event Specials'] : [])].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                                            selectedCategory === cat 
                                                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                        }`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Menu Grid */}
                            <div className="space-y-4">
                                {[...menu, ...(shopConfig.isEventMode ? eventMenu : [])]
                                    .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
                                    .map(item => (
                                    <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow hover:border-slate-700 transition flex gap-3 p-3">
                                        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl bg-slate-800 flex-shrink-0" />
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between gap-1">
                                                    <h3 className="font-bold text-sm text-slate-100">{item.name}</h3>
                                                    {item.isSpecial && <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-bold">★ Special</span>}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.desc}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="font-extrabold text-emerald-400 text-sm">${item.price} JMD</span>
                                                {item.inStock ? (
                                                    <button 
                                                        onClick={() => handleAddToCart(item)}
                                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition shadow">
                                                        + Add to Box
                                                    </button>
                                                ) : (
                                                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">Sold Out</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Sticky Floating Cart Bar */}
                            {cart.length > 0 && (
                                <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-emerald-600 text-slate-950 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between z-40 animate-bounce-short">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-emerald-800 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">
                                            {cart.length}
                                        </span>
                                        <span className="font-bold text-sm">Box Total: ${cartTotal} JMD</span>
                                    </div>
                                    <button 
                                        onClick={() => setIsCartOpen(true)}
                                        className="bg-slate-950 text-emerald-400 font-bold px-4 py-2 rounded-xl text-xs shadow hover:bg-slate-900 transition">
                                        Review & Checkout ➔
                                    </button>
                                </div>
                            )}
                        </main>
                    )}

                    {/* ADMIN VIEW */}
                    {view === 'admin' && (
                        <main className="p-4">
                            {!isAdminLoggedIn ? (
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center max-w-xs mx-auto mt-12">
                                    <h2 className="text-lg font-bold text-slate-100 mb-2">🔒 Owner Portal</h2>
                                    <p className="text-xs text-slate-400 mb-4">Enter your 4-digit PIN to manage orders and settings.</p>
                                    <form onSubmit={handleAdminLogin} className="space-y-3">
                                        <input 
                                            type="password" 
                                            placeholder="Enter PIN (1234)" 
                                            value={adminPin}
                                            onChange={(e) => setAdminPin(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-lg tracking-widest text-white focus:outline-none focus:border-emerald-500"
                                            maxLength="4"
                                            required
                                        />
                                        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition">
                                            Unlock Dashboard
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                                        <div>
                                            <h2 className="font-bold text-sm text-emerald-400">Kitchen Operations Hub</h2>
                                            <p className="text-xs text-slate-400">Live order queue & customization controls.</p>
                                        </div>
                                        <button onClick={() => setIsAdminLoggedIn(false)} className="text-xs bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300">Lock</button>
                                    </div>

                                    {/* Event Mode Toggle Card */}
                                    <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-sm text-amber-400">🎉 Event Mode & Event Menu</h3>
                                            <input 
                                                type="checkbox" 
                                                checked={shopConfig.isEventMode}
                                                onChange={(e) => setShopConfig({...shopConfig, isEventMode: e.target.checked})}
                                                className="w-5 h-5 accent-emerald-500 cursor-pointer"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mb-3">Turn on for weekend fish fries or special yard cookout events.</p>
                                        {shopConfig.isEventMode && (
                                            <div className="space-y-2">
                                                <input 
                                                    type="text" 
                                                    value={shopConfig.eventTitle}
                                                    onChange={(e) => setShopConfig({...shopConfig, eventTitle: e.target.value})}
                                                    placeholder="Event Title"
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                                                />
                                                <input 
                                                    type="text" 
                                                    value={shopConfig.eventBanner}
                                                    onChange={(e) => setShopConfig({...shopConfig, eventBanner: e.target.value})}
                                                    placeholder="Event Description Banner"
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Live Orders Queue */}
                                    <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl">
                                        <h3 className="font-bold text-sm text-slate-200 mb-3 flex items-center justify-between">
                                            <span>🔔 Incoming Orders Queue</span>
                                            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">{orders.length} Orders</span>
                                        </h3>
                                        {orders.length === 0 ? (
                                            <p className="text-xs text-slate-500 text-center py-4">No active orders yet.</p>
                                        ) : (
                                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                                {orders.map(ord => (
                                                    <div key={ord.id} className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs space-y-1">
                                                        <div className="flex justify-between font-bold text-slate-200">
                                                            <span>{ord.customerName} ({ord.customerPhone})</span>
                                                            <span className="text-emerald-400">{ord.time}</span>
                                                        </div>
                                                        <p className="text-slate-400">Payment: <strong className="text-slate-300">{ord.payment}</strong></p>
                                                        <div className="border-t border-slate-800 pt-1 mt-1">
                                                            {ord.items.map((i, idx) => (
                                                                <div key={idx} className="flex justify-between text-slate-300">
                                                                    <span>{i.name} <span className="text-[10px] text-slate-500">({i.options})</span></span>
                                                                    <span>${i.price}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2 font-bold text-emerald-400 border-t border-slate-800">
                                                            <span>Total: ${ord.total} JMD</span>
                                                            <button 
                                                                onClick={() => setOrders(orders.filter(o => o.id !== ord.id))}
                                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded text-[10px]">
                                                                Complete / Clear
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Customer Suggestion Box Tally */}
                                    <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl">
                                        <h3 className="font-bold text-sm text-slate-200 mb-3">💡 Customer Wishlist & Suggestions</h3>
                                        <div className="space-y-2">
                                            {suggestions.map(s => (
                                                <div key={s.id} className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl flex items-center justify-between text-xs">
                                                    <span className="text-slate-300 font-medium">{s.text}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">{s.count} votes</span>
                                                        <button 
                                                            onClick={() => setSuggestions(suggestions.filter(item => item.id !== s.id))}
                                                            className="text-red-400 hover:text-red-300 font-bold px-1">×</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Branding & Cross-Promo Settings */}
                                    <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl space-y-3">
                                        <h3 className="font-bold text-sm text-slate-200">⚙️ Shop Branding & Sister Link</h3>
                                        <div>
                                            <label className="text-[11px] text-slate-400 block mb-1">Shop Name</label>
                                            <input 
                                                type="text" 
                                                value={shopConfig.name}
                                                onChange={(e) => setShopConfig({...shopConfig, name: e.target.value})}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-slate-400 block mb-1">WhatsApp Order Number</label>
                                            <input 
                                                type="text" 
                                                value={shopConfig.phone}
                                                onChange={(e) => setShopConfig({...shopConfig, phone: e.target.value})}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-slate-400 block mb-1">Sister's Spot Name (Cross-Promotion)</label>
                                            <input 
                                                type="text" 
                                                value={shopConfig.crossPromoName}
                                                onChange={(e) => setShopConfig({...shopConfig, crossPromoName: e.target.value})}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-slate-400 block mb-1">Sister's Spot Link (URL)</label>
                                            <input 
                                                type="text" 
                                                value={shopConfig.crossPromoUrl}
                                                onChange={(e) => setShopConfig({...shopConfig, crossPromoUrl: e.target.value})}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </main>
                    )}

                    {/* PLATE CUSTOMIZER MODAL */}
                    {selectedItemForCustomizer && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-base text-slate-100">Customize Your Plate</h3>
                                    <button onClick={() => setSelectedItemForCustomizer(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-400 font-bold">{selectedItemForCustomizer.name} — ${selectedItemForCustomizer.price} JMD</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{selectedItemForCustomizer.desc}</p>
                                </div>

                                {/* Pepper Level */}
                                <div>
                                    <label className="text-xs font-bold text-slate-300 block mb-1.5">🌶️ Pepper / Spice Level</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['No Pepper', 'Normal Pepper', 'Extra Spicy'].map(lvl => (
                                            <button
                                                key={lvl}
                                                type="button"
                                                onClick={() => setPepperLevel(lvl)}
                                                className={`py-2 px-1 rounded-xl text-xs font-semibold border transition ${
                                                    pepperLevel === lvl 
                                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                                                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                                }`}>
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Gravy Option */}
                                <div>
                                    <label className="text-xs font-bold text-slate-300 block mb-1.5">🍛 Gravy Style</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['No Gravy', 'Normal Gravy', 'Extra Gravy'].map(grav => (
                                            <button
                                                key={grav}
                                                type="button"
                                                onClick={() => setGravyOption(grav)}
                                                className={`py-2 px-1 rounded-xl text-xs font-semibold border transition ${
                                                    gravyOption === grav 
                                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                                                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                                }`}>
                                                {grav}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={confirmAddToCart}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 mt-2">
                                    Add to Order Box
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SUGGESTION MODAL */}
                    {isSuggestionOpen && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-base text-slate-100">💡 Suggest a Dish</h3>
                                    <button onClick={() => setIsSuggestionOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                                </div>
                                <p className="text-xs text-slate-400">What do you want to see on the menu next? Tap a popular option or type your own!</p>

                                <form onSubmit={submitSuggestion} className="space-y-3">
                                    <div className="space-y-1.5">
                                        {['Oxtail on Fridays', 'Curry Duck', 'Stuffed Conch', 'Mannish Water'].map(opt => (
                                            <label key={opt} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition ${selectedSuggestionCheckbox === opt ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="suggestionOpt"
                                                    checked={selectedSuggestionCheckbox === opt}
                                                    onChange={() => { setSelectedSuggestionCheckbox(opt); setSuggestText(''); }}
                                                    className="accent-emerald-500"
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>

                                    <div>
                                        <input 
                                            type="text" 
                                            placeholder="Or type your own craving here..."
                                            value={suggestText}
                                            onChange={(e) => { setSuggestText(e.target.value); setSelectedSuggestionCheckbox(''); }}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition shadow">
                                        Submit Suggestion
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* CART & CHECKOUT MODAL */}
                    {isCartOpen && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                            <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                    <h3 className="font-bold text-base text-slate-100">🛒 Your Order Box</h3>
                                    <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
                                </div>

                                {/* Items List */}
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {cart.map((item) => (
                                        <div key={item.cartId} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                                            <div>
                                                <p className="font-bold text-slate-200">{item.name}</p>
                                                <p className="text-[10px] text-emerald-400">{item.options}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-300">${item.price} JMD</span>
                                                <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Customer Info */}
                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                    <label className="text-xs font-bold text-slate-300 block">Your Contact Details</label>
                                    <input 
                                        type="text" 
                                        placeholder="Your Full Name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                        required
                                    />
                                    <input 
                                        type="tel" 
                                        placeholder="Phone Number (e.g., 876-555-0192)"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                        required
                                    />
                                </div>

                                {/* Payment Methods */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300 block">Select Payment Method</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Cash on Pickup', 'Bank Transfer / Lynk'].map(pm => (
                                            <button
                                                key={pm}
                                                type="button"
                                                onClick={() => setPaymentMethod(pm)}
                                                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition text-center ${
                                                    paymentMethod === pm 
                                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                                                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                                                }`}>
                                                {pm}
                                            </button>
                                        ))}
                                    </div>
                                    {paymentMethod === 'Bank Transfer / Lynk' && (
                                        <input 
                                            type="text" 
                                            placeholder="Enter Transaction Ref Code"
                                            value={bankRefCode}
                                            onChange={(e) => setBankRefCode(e.target.value)}
                                            className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                                        />
                                    )}
                                </div>

                                {/* Total & Checkout Buttons */}
                                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-400">Total Amount</p>
                                        <p className="text-base font-extrabold text-emerald-400">${cartTotal} JMD</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleSocialCheckout('Instagram/Facebook')}
                                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2.5 rounded-xl text-xs border border-slate-700 transition">
                                            📋 Copy Social Order
                                        </button>
                                        <button 
                                            onClick={handleWhatsAppCheckout}
                                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow transition">
                                            💬 WhatsApp Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            );
        }

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>
