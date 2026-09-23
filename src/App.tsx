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

// --- INITIAL DATA ---
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

// Web Audio Chime Function
const playChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.log("Audio play prevented");
  }
};

export default function App() {
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

  // Admin Modal Auth State
  const [adminRole, setAdminRole] = useState<'master' | 'cousin' | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');

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

  const handlePlaceOrder = () => {
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

    // Prepare WhatsApp Message
    const orderItemsText = cart.map(i => `• ${i.name} ($${i.price}) [Spice: ${i.spice}, Gravy: ${i.gravy}${i.note ? `, Note: ${i.note}` : ''}]`).join('\n');
    const msg = `*NEW ORDER #${newOrder.id} - ${shop.name}*\n\n` +
      `*Items:*\n${orderItemsText}\n\n` +
      `*Fulfillment:* ${fulfillment.toUpperCase()}\n` +
      (fulfillment === 'delivery' ? `*Address:* ${deliveryAddress}\n` : '') +
      `*Payment:* ${paymentMethod}${bankRef ? ` (Ref: ${bankRef})` : ''}\n` +
      `*Total:* $${grandTotal} JMD`;

    const waUrl = `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    setCart([]);
    setBankRef('');
    setDeliveryAddress('');
    setActiveTab('menu');
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

  return (
    <div className={`min-h-screen ${t.primaryBg} text-slate-100 font-sans pb-24`}>
      
      {/* HEADER */}
      <header className={`p-4 border-b ${t.primaryBorder} bg-black/30 backdrop-blur sticky top-0 z-30 flex justify-between items-center`}>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">{shop.name}</h1>
          <p className="text-xs text-slate-400">{shop.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentShopId(shop.crossPromoId)}
            className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border ${t.badgeBg} hover:opacity-80 transition`}>
            🔄 Switch to {shop.crossPromoName}
          </button>
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold p-2 rounded-lg text-xs">
            ⚙️ Admin
          </button>
        </div>
      </header>

      {/* EVENT BANNER */}
      {shop.eventMode && (
        <div className="bg-amber-600 text-slate-950 px-4 py-2 text-xs font-black flex justify-between items-center">
          <span>🔥 {shop.eventTitle}: {shop.eventBanner}</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 bg-black/20 text-xs font-bold">
        <button 
          onClick={() => setActiveTab('menu')}
          className={`flex-1 py-3 text-center transition ${activeTab === 'menu' ? `${t.accentText} border-b-2 border-current` : 'text-slate-400'}`}>
          🍱 Daily Menu
        </button>
        <button 
          onClick={() => setActiveTab('cart')}
          className={`flex-1 py-3 text-center transition ${activeTab === 'cart' ? `${t.accentText} border-b-2 border-current` : 'text-slate-400'}`}>
          🛒 My Plate ({cart.length})
        </button>
        <button 
          onClick={() => setActiveTab('wishlist')}
          className={`flex-1 py-3 text-center transition ${activeTab === 'wishlist' ? `${t.accentText} border-b-2 border-current` : 'text-slate-400'}`}>
          💡 Wishlist Box
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="p-4 max-w-lg mx-auto">

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div className="space-y-3">
            {!shop.isOpen && (
              <div className="bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-xl text-xs font-bold text-center">
                ⛔ {shop.name} is currently CLOSED for orders.
              </div>
            )}
            
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Specials</h2>
            
            <div className="space-y-2">
              {shop.menu.map(item => (
                <div key={item.id} className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-xl flex justify-between items-center">
                  <div className="space-y-1 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-white">{item.name}</h3>
                      {item.soldOut && <span className="bg-red-900/60 text-red-300 text-[10px] px-2 py-0.5 rounded font-bold">Sold Out</span>}
                    </div>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                    <p className={`text-xs font-extrabold ${t.accentText}`}>${item.price} JMD</p>
                  </div>
                  <button 
                    disabled={item.soldOut || !shop.isOpen}
                    onClick={() => {
                      setSelectedDish(item);
                      setSpice(shop.customizerOptions.spiceLevels[1] || "Mild");
                      setGravy(shop.customizerOptions.gravyOptions[2] || "Normal Gravy");
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-extrabold transition ${item.soldOut || !shop.isOpen ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : `${t.accentBg} text-white`}`}>
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Customized Plate</h2>

            {cart.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800/60 p-8 text-center rounded-2xl space-y-2">
                <p className="text-slate-400 text-xs font-medium">Your plate is currently empty.</p>
                <button onClick={() => setActiveTab('menu')} className={`text-xs font-bold ${t.accentText}`}>View Menu & Add Items →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.cartId} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-start text-xs">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-white text-sm">{item.name}</h4>
                      <p className="text-slate-400">🌶️ {item.spice} | 🍲 {item.gravy}</p>
                      {item.note && <p className="text-slate-400 italic">"{item.note}"</p>}
                      <p className={`font-bold ${t.accentText}`}>${item.price} JMD</p>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 hover:text-red-300 font-bold p-1">✕</button>
                  </div>
                ))}

                {/* FULFILLMENT TOGGLE */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Fulfillment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setFulfillment('pickup')}
                      className={`p-2 rounded-lg font-bold transition ${fulfillment === 'pickup' ? `${t.accentBg} text-white` : 'bg-slate-950 text-slate-400'}`}>
                      🏪 Pickup (Free)
                    </button>
                    <button 
                      disabled={!shop.deliveryEnabled}
                      onClick={() => setFulfillment('delivery')}
                      className={`p-2 rounded-lg font-bold transition ${!shop.deliveryEnabled ? 'bg-slate-950 text-slate-600 cursor-not-allowed' : fulfillment === 'delivery' ? `${t.accentBg} text-white` : 'bg-slate-950 text-slate-400'}`}>
                      🚚 Delivery (${shop.deliveryFee})
                    </button>
                  </div>
                  {!shop.deliveryEnabled && <p className="text-[10px] text-red-400">Delivery is currently disabled by shop admin.</p>}

                  {fulfillment === 'delivery' && (
                    <input 
                      type="text" 
                      placeholder="Enter Delivery Address / Landmark..." 
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none"
                    />
                  )}
                </div>

                {/* PAYMENT METHOD */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Payment Method</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none">
                    {shop.paymentMethods.map(pm => (
                      <option key={pm} value={pm}>{pm}</option>
                    ))}
                  </select>

                  {paymentMethod !== 'Cash on Delivery/Pickup' && (
                    <input 
                      type="text" 
                      placeholder="Enter Lynk / Bank Reference Code..." 
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none font-mono"
                    />
                  )}
                </div>

                {/* TOTAL & SUBMIT */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
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
                  <div className="flex justify-between font-black text-sm text-white border-t border-slate-800 pt-2">
                    <span>Total</span>
                    <span className={t.accentText}>${grandTotal} JMD</span>
                  </div>

                  <button 
                    disabled={!shop.isOpen || (fulfillment === 'delivery' && !deliveryAddress)}
                    onClick={handlePlaceOrder}
                    className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition ${!shop.isOpen ? 'bg-slate-800 text-slate-500' : `${t.accentBg} text-white`}`}>
                    📲 Dispatch Order via WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
              <h3 className="font-extrabold text-white text-sm">💡 Request a Menu Dish</h3>
              <p className="text-slate-400">Want us to cook something special tomorrow? Drop a suggestion or vote!</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g., Oxtail with Butter Beans..." 
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none"
                />
                <button 
                  onClick={() => {
                    if (!newSuggestion.trim()) return;
                    setSuggestions([...suggestions, { id: Date.now(), text: newSuggestion, votes: 1 }]);
                    setNewSuggestion('');
                  }}
                  className={`${t.accentBg} text-white font-bold px-3 py-2 rounded-lg text-xs`}>
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {suggestions.map(s => (
                <div key={s.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">{s.text}</span>
                  <button 
                    onClick={() => {
                      setSuggestions(suggestions.map(item => item.id === s.id ? { ...item, votes: item.votes + 1 } : item));
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                    👍 {s.votes}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* CUSTOMIZER MODAL */}
      {selectedDish && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-black text-white text-base">{selectedDish.name}</h3>
              <button onClick={() => setSelectedDish(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Spice Level</label>
                <select value={spice} onChange={(e) => setSpice(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white">
                  {shop.customizerOptions.spiceLevels.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Gravy Option</label>
                <select value={gravy} onChange={(e) => setGravy(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white">
                  {shop.customizerOptions.gravyOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Special Instructions / Note</label>
                <input type="text" placeholder="e.g. Extra cabbage, no rice..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
              </div>
            </div>

            <button onClick={addToCart} className={`w-full ${t.accentBg} text-white font-bold py-2.5 rounded-xl text-xs`}>
              Add to Plate (${selectedDish.price} JMD)
            </button>
          </div>
        </div>
      )}

      {/* ADMIN DASHBOARD MODAL */}
      {isAdminOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 my-auto">
            
            {!adminRole ? (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-base text-white">Enter Admin or Master PIN</h3>
                  <button type="button" onClick={() => setIsAdminOpen(false)} className="text-slate-400 font-bold">✕</button>
                </div>
                <p className="text-xs text-slate-400">
                  Cousin PIN accesses active shop shift controls. Master PIN (9999) accesses developer controls & shop name editing.
                </p>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="Enter 4-digit PIN"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-center text-lg text-white focus:outline-none"
                  autoFocus
                />
                {authError && <p className="text-xs text-red-400 text-center font-bold">{authError}</p>}
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition">
                  Unlock Dashboard
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-white">
                      {adminRole === 'master' ? '👑 Master Developer Dashboard' : `🔒 ${shop.name} Admin`}
                    </h3>
                  </div>
                  <button onClick={() => { setAdminRole(null); setEnteredPin(''); setIsAdminOpen(false); }} className="text-slate-400 font-bold text-xs bg-slate-800 px-2.5 py-1 rounded-lg">
                    Logout
                  </button>
                </div>

                {/* MASTER DEVELOPER ONLY */}
                {adminRole === 'master' && (
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-3 shadow-inner">
                    <h4 className="text-xs font-extrabold text-amber-400 uppercase">Shop Name & Cloud Config</h4>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-300 font-medium">Edit Active Shop Name</label>
                      <input 
                        type="text" 
                        value={shop.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setShops({ ...shops, [currentShopId]: { ...shop, name: val } });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-300 font-medium">Supabase Project URL</label>
                      <input 
                        type="text" 
                        placeholder="https://xxxxxx.supabase.co"
                        value={shop.supabaseUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setShops({ ...shops, [currentShopId]: { ...shop, supabaseUrl: val } });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-300 font-medium">Supabase Anon Key</label>
                      <input 
                        type="password" 
                        placeholder="eyJhGciOi..."
                        value={shop.supabaseKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          setShops({ ...shops, [currentShopId]: { ...shop, supabaseKey: val } });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* INCOMING ORDERS QUEUE */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase">Incoming Orders ({orders.length})</h4>
                  <div className="max-h-36 overflow-y-auto space-y-2">
                    {orders.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2">No active orders yet.</p>
                    ) : (
                      orders.map(o => (
                        <div key={o.id} className="bg-slate-950 border border-slate-800 p-2.5 rounded text-xs space-y-1">
                          <div className="flex justify-between font-bold text-emerald-400">
                            <span>#{o.id} ({o.fulfillment})</span>
                            <span>${o.total} JMD</span>
                          </div>
                          <p className="text-slate-300">{o.items.map(i => `${i.name} [${i.spice}, ${i.gravy}]`).join(', ')}</p>
                          <button onClick={() => setOrders(orders.filter(item => item.id !== o.id))} className="text-[10px] text-red-400 font-bold">Clear Order</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* SHIFT CONTROLS */}
                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-xs font-medium text-slate-300">Shop Open Status</span>
                    <button onClick={() => setShops({ ...shops, [currentShopId]: { ...shop, isOpen: !shop.isOpen } })} className={`px-3 py-1 rounded text-xs font-bold ${shop.isOpen ? 'bg-emerald-600' : 'bg-red-600'}`}>
                      {shop.isOpen ? 'OPEN' : 'CLOSED'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-xs font-medium text-slate-300">Delivery Toggle</span>
                    <button onClick={() => setShops({ ...shops, [currentShopId]: { ...shop, deliveryEnabled: !shop.deliveryEnabled } })} className={`px-3 py-1 rounded text-xs font-bold ${shop.deliveryEnabled ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                      {shop.deliveryEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>

                {/* MENU EDITING */}
                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase">Menu Items</h4>
                  <div className="max-h-28 overflow-y-auto space-y-1">
                    {shop.menu.map(m => (
                      <div key={m.id} className="flex justify-between items-center bg-slate-950 p-1.5 rounded border border-slate-800 text-xs">
                        <span className="text-slate-200">{m.name}</span>
                        <button 
                          onClick={() => {
                            const updated = shop.menu.map(item => item.id === m.id ? { ...item, soldOut: !item.soldOut } : item);
                            setShops({ ...shops, [currentShopId]: { ...shop, menu: updated } });
                          }}
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${m.soldOut ? 'bg-red-900 text-red-300' : 'bg-emerald-900 text-emerald-300'}`}>
                          {m.soldOut ? 'Sold Out' : 'In Stock'}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                    <input type="text" placeholder="New Dish Name" value={newDishName} onChange={(e) => setNewDishName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-xs text-white" />
                    <input type="number" placeholder="Price ($)" value={newDishPrice} onChange={(e) => setNewDishPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-xs text-white" />
                    <button 
                      onClick={() => {
                        if (!newDishName || !newDishPrice) return;
                        const newItem: Dish = { id: Date.now(), name: newDishName, price: Number(newDishPrice), category: 'Mains', soldOut: false, desc: 'Freshly prepared daily.' };
                        setShops({ ...shops, [currentShopId]: { ...shop, menu: [...shop.menu, newItem] } });
                        setNewDishName(''); setNewDishPrice('');
                      }}
                      className={`w-full ${t.accentBg} text-white font-bold py-1 rounded text-xs`}>
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
