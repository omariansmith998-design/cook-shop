import React, { useState, useEffect } from 'react';

// --- TYPES ---
export interface Dish {
  id: number;
  name: string;
  price: number;
  category: string;
  soldOut: boolean;
  desc: string;
}

export interface ShopTheme {
  primaryBg: string;
  primaryBorder: string;
  accentText: string;
  accentBg: string;
  badgeBg: string;
}

export interface CustomizerOptions {
  spiceLevels: string[];
  gravyOptions: string[];
}

export interface ShopData {
  id: string;
  name: string;
  tagline: string;
  whatsapp: string;
  address: string;
  pin: string;
  crossPromoName: string;
  crossPromoId: string;
  isOpen: boolean;
  autoCloseEnabled: boolean;
  closeHour: number;
  deliveryEnabled: boolean;
  onlinePaymentEnabled: boolean; // TOGGLE FOR ONLINE PAYMENTS
  paymentDetailsNote: string; // INSTRUCTIONS FOR LYNK/BANK
  eventMode: boolean;
  eventTitle: string;
  eventBanner: string;
  deliveryFee: number;
  supabaseUrl: string;
  supabaseKey: string;
  theme: ShopTheme;
  customizerOptions: CustomizerOptions;
  paymentMethods: string[];
  menu: Dish[];
}

export interface CartItem extends Dish {
  cartId: number;
  spice: string;
  gravy: string;
  note: string;
}

export interface Order {
  id: number;
  shopId: string;
  items: CartItem[];
  fulfillment: 'pickup' | 'delivery';
  deliveryAddress?: string;
  paymentMethod: string;
  bankRef?: string;
  total: number;
  time: string;
  status: string;
}

export interface Suggestion {
  id: number;
  text: string;
  votes: number;
}

// --- INITIAL DATA STATE ---
const INITIAL_SHOPS: Record<string, ShopData> = {
  shop1: {
    id: 'shop1',
    name: "Mama's Yard Cookshop",
    tagline: "Authentic Jamaican Flame & Pot",
    whatsapp: "8765550192",
    address: "Main Street, Montego Bay",
    pin: "1234",
    crossPromoName: "Auntie's Ital Corner",
    crossPromoId: "shop2",
    isOpen: true,
    autoCloseEnabled: true,
    closeHour: 21,
    deliveryEnabled: true,
    onlinePaymentEnabled: false, // OFF BY DEFAULT UNTIL ADMIN TOGGLES ON
    paymentDetailsNote: "Lynk ID: @MamasYard | NCB Acc: 123456789",
    eventMode: false,
    eventTitle: "Weekend Fish Fry & Soup Special!",
    eventBanner: "Live Red Peas Soup & Fried Snapper available today!",
    deliveryFee: 300,
    supabaseUrl: "",
    supabaseKey: "",
    theme: {
      primaryBg: "bg-emerald-950",
      primaryBorder: "border-emerald-800/60",
      accentText: "text-emerald-400",
      accentBg: "bg-emerald-600 hover:bg-emerald-500",
      badgeBg: "bg-emerald-900/40 text-emerald-200 border-emerald-700/40"
    },
    customizerOptions: {
      spiceLevels: ["No Pepper", "Mild", "Medium Pepper", "Extra Hot / Scotch Bonnet"],
      gravyOptions: ["No Gravy", "Light Gravy", "Normal Gravy", "Extra Gravy / Drowned"]
    },
    paymentMethods: ["Cash on Delivery/Pickup", "Lynk Transfer", "Bank Transfer"],
    menu: [
      { id: 1, name: "Brown Stew Chicken", price: 900, category: "Mains", soldOut: false, desc: "Tender chicken simmered in rich gravy with carrots & butter beans." },
      { id: 2, name: "Curry Goat", price: 1200, category: "Mains", soldOut: false, desc: "Slow-cooked tender goat meat packed with authentic curry spices." },
      { id: 3, name: "Fried Dumpling & Ackee & Saltfish", price: 1000, category: "Breakfast / Staples", soldOut: false, desc: "National dish served with hot golden fried dumplings." },
      { id: 4, name: "Rice & Peas", price: 350, category: "Sides", soldOut: false, desc: "Gungo peas and coconut milk seasoned to perfection." },
      { id: 5, name: "Soup of the Day (Red Peas)", price: 500, category: "Soups", soldOut: false, desc: "Loaded with beef, spinners, yam, and red peas." },
      { id: 6, name: "Ice-Cold Carrot Juice", price: 250, category: "Drinks", soldOut: false, desc: "Blended fresh with condensed milk, spices, and vanilla." }
    ]
  },
  shop2: {
    id: 'shop2',
    name: "Auntie's Ital Corner",
    tagline: "Pure Natural Livity & Plant-Based Meals",
    whatsapp: "8765550999",
    address: "Market Square, Montego Bay",
    pin: "5678",
    crossPromoName: "Mama's Yard Cookshop",
    crossPromoId: "shop1",
    isOpen: true,
    autoCloseEnabled: true,
    closeHour: 20,
    deliveryEnabled: true,
    onlinePaymentEnabled: false,
    paymentDetailsNote: "Lynk ID: @AuntiesItal | Scotiabank Acc: 987654321",
    eventMode: false,
    eventTitle: "Ital Stew Special",
    eventBanner: "Fresh coconut run-down with breadfruit and callaloo.",
    deliveryFee: 250,
    supabaseUrl: "",
    supabaseKey: "",
    theme: {
      primaryBg: "bg-amber-950",
      primaryBorder: "border-amber-800/60",
      accentText: "text-amber-400",
      accentBg: "bg-amber-600 hover:bg-amber-500",
      badgeBg: "bg-amber-900/40 text-amber-200 border-amber-700/40"
    },
    customizerOptions: {
      spiceLevels: ["No Pepper", "Mild", "Medium Pepper", "Extra Hot / Scotch Bonnet"],
      gravyOptions: ["No Gravy", "Light Gravy", "Normal Gravy", "Extra Gravy / Drowned"]
    },
    paymentMethods: ["Cash on Delivery/Pickup", "Lynk Transfer", "Bank Transfer"],
    menu: [
      { id: 201, name: "Ital Coconut Stew", price: 800, category: "Mains", soldOut: false, desc: "Fresh vegetables simmered in pure coconut cream." },
      { id: 202, name: "Roasted Breadfruit & Callaloo", price: 700, category: "Mains", soldOut: false, desc: "Flame-roasted breadfruit loaded with steamed seasoned callaloo." },
      { id: 203, name: "Natural Soursop Juice", price: 300, category: "Drinks", soldOut: false, desc: "Freshly squeezed natural soursop with touch of cane and lime." }
    ]
  }
};

const MASTER_PIN = "9999";

// Audio Chime trigger for new order receipts
const playChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.log("Audio prevented");
  }
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [shops, setShops] = useState<Record<string, ShopData>>(INITIAL_SHOPS);
  const [currentShopId, setCurrentShopId] = useState<string>('shop1');
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'wishlist'>('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { id: 1, text: "Oxtail with Broad Beans", votes: 14 },
    { id: 2, text: "Curry Mutton Weekend Special", votes: 9 }
  ]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Customizer Modal State
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [spice, setSpice] = useState("Normal Pepper");
  const [gravy, setGravy] = useState("Normal Gravy");
  const [note, setNote] = useState("");

  // Checkout State
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery/Pickup');
  const [bankRef, setBankRef] = useState('');

  // Admin Auth State
  const [adminRole, setAdminRole] = useState<'master' | 'cousin' | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');

  // --- LOADING SCREEN DISMISSAL & TAILWIND INJECTION ---
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const shop = shops[currentShopId] || shops['shop1'];
  const t = shop.theme;

  const addToCart = () => {
    if (!selectedDish) return;
    const item: CartItem = {
      ...selectedDish,
      cartId: Date.now(),
      spice,
      gravy,
      note
    };
    setCart([...cart, item]);
    setSelectedDish(null);
    setSpice("Normal Pepper");
    setGravy("Normal Gravy");
    setNote("");
  };

  const removeFromCart = (cartId: number) => {
    setCart(cart.filter(c => c.cartId !== cartId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const deliveryFee = fulfillment === 'delivery' && shop.deliveryEnabled ? shop.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  const formatOrderMessage = () => {
    const orderItemsText = cart.map(i => `• ${i.name} ($${i.price}) [Spice: ${i.spice}, Gravy: ${i.gravy}${i.note ? `, Note: ${i.note}` : ''}]`).join('\n');
    return `*NEW ORDER - ${shop.name}*\n\n` +
      `*Items:*\n${orderItemsText}\n\n` +
      `*Fulfillment:* ${fulfillment.toUpperCase()}\n` +
      (fulfillment === 'delivery' ? `*Address:* ${deliveryAddress}\n` : '') +
      `*Payment:* ${paymentMethod}${bankRef ? ` (Ref: ${bankRef})` : ''}\n` +
      `*Total:* $${grandTotal} JMD`;
  };

  const handlePlaceWhatsAppOrder = () => {
    if (cart.length === 0) return;
    const newOrder: Order = {
      id: Math.floor(1000 + Math.random() * 9000),
      shopId: currentShopId,
      items: cart,
      fulfillment,
      deliveryAddress: fulfillment === 'delivery' ? deliveryAddress : undefined,
      paymentMethod,
      bankRef: paymentMethod !== 'Cash on Delivery/Pickup' ? bankRef : undefined,
      total: grandTotal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Received'
    };

    setOrders([newOrder, ...orders]);
    playChime();

    const msg = formatOrderMessage();
    const waUrl = `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    setCart([]);
    setBankRef('');
    setDeliveryAddress('');
    setActiveTab('menu');
  };

  const handleCopyForSocialDM = () => {
    if (cart.length === 0) return;
    const msg = formatOrderMessage();
    navigator.clipboard.writeText(msg);
    setCopiedNotice(true);
    playChime();
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (enteredPin === MASTER_PIN) {
      setAdminRole('master');
    } else if (enteredPin === shop.pin) {
      setAdminRole('cousin');
    } else {
      setAuthError('Incorrect PIN code.');
    }
  };

  // --- INITIAL LOADING SCREEN ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-lg font-black tracking-wider uppercase">Loading Cookshop...</h2>
        <p className="text-xs text-slate-500">Preparing fresh menu & settings</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.primaryBg} text-slate-100 font-sans pb-24`}>
      
      {/* HEADER */}
      <header className={`p-4 border-b ${t.primaryBorder} bg-black/40 backdrop-blur sticky top-0 z-30 flex justify-between items-center shadow-lg`}>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">{shop.name}</h1>
          <p className="text-xs text-slate-400 font-medium">{shop.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentShopId(shop.crossPromoId)}
            className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border ${t.badgeBg} hover:opacity-80 transition`}>
            🔄 {shop.crossPromoName}
          </button>
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow">
            ⚙️ Admin
          </button>
        </div>
      </header>

      {/* EVENT BANNER */}
      {shop.eventMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-black flex justify-between items-center shadow-md">
          <span>🔥 {shop.eventTitle}: {shop.eventBanner}</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800/80 bg-black/30 text-xs font-bold sticky top-[65px] z-20 backdrop-blur">
        <button 
          onClick={() => setActiveTab('menu')}
          className={`flex-1 py-3 text-center transition ${activeTab === 'menu' ? `${t.accentText} border-b-2 border-current bg-white/5` : 'text-slate-400 hover:text-slate-200'}`}>
          🍱 Daily Menu
        </button>
        <button 
          onClick={() => setActiveTab('cart')}
          className={`flex-1 py-3 text-center transition ${activeTab === 'cart' ? `${t.accentText} border-b-2 border-current bg-white/5` : 'text-slate-400 hover:text-slate-200'}`}>
          🛒 My Plate ({cart.length})
        </button>
        <button 
          onClick={() => setActiveTab('wishlist')}
          className={`flex-1 py-3 text-center transition ${activeTab === 'wishlist' ? `${t.accentText} border-b-2 border-current bg-white/5` : 'text-slate-400 hover:text-slate-200'}`}>
          💡 Wishlist Box
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="p-4 max-w-lg mx-auto">

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            {!shop.isOpen && (
              <div className="bg-red-950/80 border border-red-800/80 text-red-200 p-3.5 rounded-xl text-xs font-bold text-center shadow">
                ⛔ {shop.name} is currently CLOSED for ordering.
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Today's Specials</h2>
              <span className="text-[11px] text-slate-500 font-medium">{shop.address}</span>
            </div>
            
            <div className="space-y-3">
              {shop.menu.map(item => (
                <div key={item.id} className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl flex justify-between items-center shadow-md hover:border-slate-700 transition">
                  <div className="space-y-1.5 max-w-[68%]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-white">{item.name}</h3>
                      {item.soldOut && <span className="bg-red-950 text-red-400 border border-red-800/60 text-[10px] px-2 py-0.5 rounded font-bold">Sold Out</span>}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    <p className={`text-xs font-black ${t.accentText}`}>${item.price} JMD</p>
                  </div>
                  <button 
                    disabled={item.soldOut || !shop.isOpen}
                    onClick={() => {
                      setSelectedDish(item);
                      setSpice(shop.customizerOptions.spiceLevels[1] || "Mild");
                      setGravy(shop.customizerOptions.gravyOptions[2] || "Normal Gravy");
                    }}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-black shadow transition ${item.soldOut || !shop.isOpen ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : `${t.accentBg} text-white shadow-emerald-950/50`}`}>
                    + Customize
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CART TAB */}
        {activeTab === 'cart' && (
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Your Customized Plate</h2>

            {copiedNotice && (
              <div className="bg-emerald-900 border border-emerald-600 text-emerald-200 p-3 rounded-xl text-xs font-bold text-center animate-bounce">
                📋 Order copied to clipboard! Ready to paste in Instagram or Facebook DM.
              </div>
            )}

            {cart.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800/60 p-8 text-center rounded-2xl space-y-3">
                <p className="text-slate-400 text-xs font-medium">Your plate is currently empty.</p>
                <button onClick={() => setActiveTab('menu')} className={`text-xs font-bold ${t.accentText} underline underline-offset-4`}>
                  Browse Today's Menu →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.cartId} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex justify-between items-start text-xs shadow">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-white text-sm">{item.name}</h4>
                      <p className="text-slate-300 font-medium">🌶️ {item.spice} | 🍲 {item.gravy}</p>
                      {item.note && <p className="text-slate-400 italic bg-slate-950/60 p-1.5 rounded border border-slate-800/80 mt-1">"{item.note}"</p>}
                      <p className={`font-black ${t.accentText} pt-1`}>${item.price} JMD</p>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 hover:text-red-300 font-bold p-1 text-sm">✕</button>
                  </div>
                ))}

                {/* FULFILLMENT SELECTOR */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs shadow">
                  <label className="font-black text-slate-300 uppercase tracking-wider text-[11px]">Fulfillment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setFulfillment('pickup')}
                      className={`p-2.5 rounded-xl font-bold transition border ${fulfillment === 'pickup' ? `${t.accentBg} text-white border-transparent shadow` : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                      🏪 Pickup (Free)
                    </button>
                    <button 
                      disabled={!shop.deliveryEnabled}
                      onClick={() => setFulfillment('delivery')}
                      className={`p-2.5 rounded-xl font-bold transition border ${!shop.deliveryEnabled ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed' : fulfillment === 'delivery' ? `${t.accentBg} text-white border-transparent shadow` : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                      🚚 Delivery (${shop.deliveryFee})
                    </button>
                  </div>
                  {!shop.deliveryEnabled && <p className="text-[10px] text-red-400 font-bold">Delivery is currently toggled off by shop admin.</p>}

                  {fulfillment === 'delivery' && (
                    <input 
                      type="text" 
                      placeholder="Enter Delivery Address / Landmark..." 
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-slate-700"
                    />
                  )}
                </div>

                {/* PAYMENT SELECTOR */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs shadow">
                  <label className="font-black text-slate-300 uppercase tracking-wider text-[11px]">Payment Method</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-slate-700">
                    <option value="Cash on Delivery/Pickup">Cash on Delivery / Pickup</option>
                    {shop.onlinePaymentEnabled && (
                      <>
                        <option value="Lynk Transfer">Lynk Transfer</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </>
                    )}
                  </select>

                  {!shop.onlinePaymentEnabled && (
                    <p className="text-[10px] text-slate-400 italic">Online transfers (Lynk/Bank) are currently turned off. Pay with cash upon receipt.</p>
                  )}

                  {shop.onlinePaymentEnabled && paymentMethod !== 'Cash on Delivery/Pickup' && (
                    <div className="space-y-2">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px] text-amber-400 font-mono">
                        {shop.paymentDetailsNote || "Send payment to shop account and enter reference below."}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Enter Lynk / Bank Transfer Reference..." 
                        value={bankRef}
                        onChange={(e) => setBankRef(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-slate-700 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* TOTAL & DUAL CHECKOUT DISPATCH */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal</span>
                    <span>${subtotal} JMD</span>
                  </div>
                  {fulfillment === 'delivery' && (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Delivery Fee</span>
                      <span>${shop.deliveryFee} JMD</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm text-white border-t border-slate-800/80 pt-2.5">
                    <span>Total</span>
                    <span className={t.accentText}>${grandTotal} JMD</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <button 
                      disabled={!shop.isOpen || (fulfillment === 'delivery' && !deliveryAddress)}
                      onClick={handlePlaceWhatsAppOrder}
                      className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition shadow ${!shop.isOpen ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : `${t.accentBg} text-white`}`}>
                      📲 Dispatch Order via WhatsApp
                    </button>

                    <button 
                      disabled={!shop.isOpen || (fulfillment === 'delivery' && !deliveryAddress)}
                      onClick={handleCopyForSocialDM}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-bold text-xs transition">
                      📋 Copy Order text for IG / FB DM
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs shadow">
              <h3 className="font-extrabold text-white text-sm">💡 Suggest a Daily Special</h3>
              <p className="text-slate-400">Have a favorite meal you want added to the menu? Submit a suggestion below:</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g., Oxtail with Broad Beans..." 
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-slate-700"
                />
                <button 
                  onClick={() => {
                    if (!newSuggestion.trim()) return;
                    setSuggestions([...suggestions, { id: Date.now(), text: newSuggestion, votes: 1 }]);
                    setNewSuggestion('');
                  }}
                  className={`${t.accentBg} text-white font-black px-4 py-2.5 rounded-xl text-xs shadow`}>
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {suggestions.map(s => (
                <div key={s.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex justify-between items-center text-xs shadow">
                  <span className="font-bold text-slate-200">{s.text}</span>
                  <button 
                    onClick={() => {
                      setSuggestions(suggestions.map(item => item.id === s.id ? { ...item, votes: item.votes + 1 } : item));
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-black px-3 py-1.5 rounded-lg border border-slate-700 shadow">
                    👍 {s.votes}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* PLATE CUSTOMIZER MODAL */}
      {selectedDish && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-base">{selectedDish.name}</h3>
                <p className="text-[11px] text-slate-400">${selectedDish.price} JMD</p>
              </div>
              <button onClick={() => setSelectedDish(null)} className="text-slate-400 hover:text-white font-black text-sm p-1">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Spice Level</label>
                <select value={spice} onChange={(e) => setSpice(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none">
                  {shop.customizerOptions.spiceLevels.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Gravy Option</label>
                <select value={gravy} onChange={(e) => setGravy(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none">
                  {shop.customizerOptions.gravyOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Special Instructions</label>
                <input type="text" placeholder="e.g., No salad, extra plantain..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
              </div>
            </div>

            <button onClick={addToCart} className={`w-full ${t.accentBg} text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg`}>
              Add to Plate (${selectedDish.price} JMD)
            </button>
          </div>
        </div>
      )}

      {/* ADMIN DASHBOARD MODAL */}
      {isAdminOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 my-auto shadow-2xl">
            
            {!adminRole ? (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="font-extrabold text-base text-white">Admin Authentication</h3>
                  <button type="button" onClick={() => setIsAdminOpen(false)} className="text-slate-400 font-bold">✕</button>
                </div>
                <p className="text-xs text-slate-400">
                  Enter Cousin PIN for shift controls or Master PIN (9999) to edit shop names and global config.
                </p>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="Enter 4-Digit PIN"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-xl text-white tracking-widest focus:outline-none focus:border-slate-700"
                  autoFocus
                />
                {authError && <p className="text-xs text-red-400 text-center font-bold">{authError}</p>}
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl transition text-xs uppercase tracking-wider shadow">
                  Unlock Dashboard
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-black text-sm text-white">
                      {adminRole === 'master' ? '👑 Master Developer Dashboard' : `🔒 ${shop.name} Admin`}
                    </h3>
                  </div>
                  <button onClick={() => { setAdminRole(null); setEnteredPin(''); setIsAdminOpen(false); }} className="text-slate-400 hover:text-white font-bold text-xs bg-slate-800 px-2.5 py-1 rounded-lg">
                    Logout
                  </button>
                </div>

                {/* MASTER DEVELOPER PANEL */}
                {adminRole === 'master' && (
                  <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-3 shadow-inner">
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">Master Config & Shop Renaming</h4>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-300 font-bold">Edit Active Shop Name</label>
                      <input 
                        type="text" 
                        value={shop.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setShops({ ...shops, [currentShopId]: { ...shop, name: val } });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-300 font-bold">Supabase Project URL</label>
                      <input 
                        type="text" 
                        placeholder="https://xxxxxx.supabase.co"
                        value={shop.supabaseUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setShops({ ...shops, [currentShopId]: { ...shop, supabaseUrl: val } });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-300 font-bold">Supabase Anon Key</label>
                      <input 
                        type="password" 
                        placeholder="eyJhGciOi..."
                        value={shop.supabaseKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          setShops({ ...shops, [currentShopId]: { ...shop, supabaseKey: val } });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* ORDERS QUEUE */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incoming Orders ({orders.length})</h4>
                  <div className="max-h-36 overflow-y-auto space-y-2">
                    {orders.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2">No active orders yet.</p>
                    ) : (
                      orders.map(o => (
                        <div key={o.id} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between font-bold text-emerald-400">
                            <span>#{o.id} ({o.fulfillment})</span>
                            <span>${o.total} JMD</span>
                          </div>
                          <p className="text-slate-300">{o.items.map(i => `${i.name} [${i.spice}, ${i.gravy}]`).join(', ')}</p>
                          <button onClick={() => setOrders(orders.filter(item => item.id !== o.id))} className="text-[10px] text-red-400 font-bold underline">Clear Order</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* SHIFT & ONLINE PAYMENT TOGGLES */}
                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-300">Shop Open Status</span>
                    <button onClick={() => setShops({ ...shops, [currentShopId]: { ...shop, isOpen: !shop.isOpen } })} className={`px-3 py-1 rounded-lg text-xs font-black ${shop.isOpen ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                      {shop.isOpen ? 'OPEN' : 'CLOSED'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-300">Delivery Toggle</span>
                    <button onClick={() => setShops({ ...shops, [currentShopId]: { ...shop, deliveryEnabled: !shop.deliveryEnabled } })} className={`px-3 py-1 rounded-lg text-xs font-black ${shop.deliveryEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {shop.deliveryEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-300">Online Transfers (Lynk/Bank)</span>
                    <button onClick={() => setShops({ ...shops, [currentShopId]: { ...shop, onlinePaymentEnabled: !shop.onlinePaymentEnabled } })} className={`px-3 py-1 rounded-lg text-xs font-black ${shop.onlinePaymentEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {shop.onlinePaymentEnabled ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>

                  {shop.onlinePaymentEnabled && (
                    <div className="space-y-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <label className="text-[10px] text-slate-400 font-bold">Payment Details Note for Customers</label>
                      <input 
                        type="text" 
                        value={shop.paymentDetailsNote} 
                        onChange={(e) => setShops({ ...shops, [currentShopId]: { ...shop, paymentDetailsNote: e.target.value } })}
                        placeholder="e.g. Lynk handle or account #"
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                {/* MENU MANAGEMENT */}
                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menu Inventory</h4>
                  <div className="max-h-28 overflow-y-auto space-y-1.5">
                    {shop.menu.map(m => (
                      <div key={m.id} className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs">
                        <span className="text-slate-200 font-medium">{m.name}</span>
                        <button 
                          onClick={() => {
                            const updated = shop.menu.map(item => item.id === m.id ? { ...item, soldOut: !item.soldOut } : item);
                            setShops({ ...shops, [currentShopId]: { ...shop, menu: updated } });
                          }}
                          className={`px-2 py-1 rounded font-bold text-[10px] ${m.soldOut ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                          {m.soldOut ? 'Sold Out' : 'In Stock'}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
                    <input type="text" placeholder="New Dish Name" value={newDishName} onChange={(e) => setNewDishName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none" />
                    <input type="number" placeholder="Price ($)" value={newDishPrice} onChange={(e) => setNewDishPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none" />
                    <button 
                      onClick={() => {
                        if (!newDishName || !newDishPrice) return;
                        const newItem: Dish = { id: Date.now(), name: newDishName, price: Number(newDishPrice), category: 'Mains', soldOut: false, desc: 'Freshly prepared daily.' };
                        setShops({ ...shops, [currentShopId]: { ...shop, menu: [...shop.menu, newItem] } });
                        setNewDishName(''); setNewDishPrice('');
                      }}
                      className={`w-full ${t.accentBg} text-white font-black py-2 rounded-lg text-xs uppercase tracking-wider shadow`}>
                      + Add Dish
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
