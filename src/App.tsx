import React, { useState, useEffect, useRef } from "react";

// ---------- TYPES ----------
interface Dish { id: string; name: string; price: number; description: string; category: "Mains" | "Drinks" | "Snacks" | "Sides" | "Soups"; image: string; inStock: boolean; likes: number; isSpecial?: boolean; }
interface CartItem { dish: Dish; quantity: number; spiceLevel: string; gravyType: string; addKetchup: boolean; addPepper: boolean; isItemCompleted?: boolean; }
interface ChatMessage { id: string; sender: "master" | "admin"; text: string; timestamp: string; }
interface Suggestion { id: string; shopId: string; text: string; votes: number; }
interface Order { id: string; shopId: string; customerName: string; customerAddress: string; items: CartItem[]; subtotal: number; deliveryFee: number; tip: number; total: number; orderType: "Delivery" | "Pickup"; deliveryZone: string; paymentMethod: string; createdAt: string; estimatedTime?: string; status: "Pending" | "Preparing" | "Ready" | "Completed" | "Cancelled"; }
interface DeliveryZoneOption { name: string; price: number; }
interface ShopProfile { id: string; name: string; tagline: string; whatsapp: string; instagram: string; tiktok: string; facebook: string; address: string; mapLink: string; pin: string; headerBanner: string; deliveryZones: DeliveryZoneOption[]; isOpenManual: boolean; isDeliveryActive: boolean; deliveryZoneNote: string; weeklySchedule: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>; themeColor: string; fontStyle: string; adminPin: string; }

// ---------- DEFAULTS ----------
const DEFAULT_SCHEDULE: ShopProfile["weeklySchedule"] = {
  Mon: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Tue: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Wed: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Thu: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Fri: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
  Sat: { isOpen: true, openTime: "10:00", closeTime: "22:00" },
  Sun: { isOpen: false, openTime: "10:00", closeTime: "18:00" },
};
const DEFAULT_ZONES: DeliveryZoneOption[] = [
  { name: "Local Town / Nearby", price: 250 },
  { name: "Mid-Distance Suburbs", price: 400 },
  { name: "Outskirts / Far Radius", price: 600 },
];
const DEFAULT_SHOPS: ShopProfile[] = [
  { id: "mamas-yard", name: "Mama's Yard Cookshop", tagline: "Authentic Jamaican Home-Style Flavours", whatsapp: "18765551234", instagram: "@mamas_yard_ja", tiktok: "@mamas_yard_cookshop", facebook: "MamasYardCookshop", address: "Hip Strip, Montego Bay, St. James", mapLink: "https://maps.google.com", pin: "1234", headerBanner: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000", deliveryZones: DEFAULT_ZONES, isOpenManual: true, isDeliveryActive: true, deliveryZoneNote: "Delivery within Montego Bay main town & Hip Strip.", weeklySchedule: DEFAULT_SCHEDULE, themeColor: "#10b981", fontStyle: "Sans-Serif", adminPin: "1234" },
  { id: "aunties-ital", name: "Auntie's Ital Corner", tagline: "Pure Natural Ital Roots & Juices", whatsapp: "18765555678", instagram: "@aunties_ital", tiktok: "@aunties_ital_corner", facebook: "AuntiesItalCorner", address: "Downtown, Montego Bay", mapLink: "https://maps.google.com", pin: "5678", headerBanner: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000", deliveryZones: DEFAULT_ZONES, isOpenManual: true, isDeliveryActive: true, deliveryZoneNote: "Local Montego Bay delivery.", weeklySchedule: DEFAULT_SCHEDULE, themeColor: "#f59e0b", fontStyle: "Sans-Serif", adminPin: "5678" },
];
const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=300`;
const INITIAL_MENU: Dish[] = [
  { id: "1", name: "Brown Stew Chicken", price: 1200, description: "Slow-braised chicken in rich savory spices with carrots and butter beans.", category: "Mains", image: IMG("photo-1544025162-d76694265947"), inStock: true, likes: 12, isSpecial: true },
  { id: "2", name: "Ackee & Saltfish", price: 1400, description: "Classic national dish sautéed with onions, tomatoes, and scotch bonnet peppers.", category: "Mains", image: IMG("photo-1588166524941-3bf61a9c41db"), inStock: true, likes: 24 },
  { id: "3", name: "Fresh Soursop Juice", price: 500, description: "Creamy soursop blended with nutmeg and condensed milk.", category: "Drinks", image: IMG("photo-1551024709-8f23befc6f87"), inStock: true, likes: 18 },
  { id: "4", name: "Fried Dumplings (4 Pack)", price: 400, description: "Golden, crispy traditional fried Johnny cakes.", category: "Sides", image: IMG("photo-1509722747041-616f39b57569"), inStock: true, likes: 15 },
];
const FALLBACK_IMG = IMG("photo-1546069901-ba9599a7e63c");
const CATEGORIES = ["All Items", "Mains", "Drinks", "Snacks", "Sides", "Soups"];
const FONTS: Record<string, string> = { "Sans-Serif": "ui-sans-serif, system-ui, sans-serif", Monospace: "ui-monospace, monospace", Serif: "Georgia, serif", Cursive: "'Comic Sans MS', cursive" };

// ---------- SHARED STYLES ----------
const THEMES = [
  { name: "Island Emerald", color: "#10b981", font: "Sans-Serif", blurb: "Fresh and clean" },
  { name: "Mango Sunset", color: "#f59e0b", font: "Sans-Serif", blurb: "Warm and earthy" },
  { name: "Jerk Fire", color: "#ef4444", font: "Sans-Serif", blurb: "Bold and spicy" },
  { name: "Ocean Breeze", color: "#0ea5e9", font: "Sans-Serif", blurb: "Cool and calm" },
  { name: "Yard Classic", color: "#eab308", font: "Serif", blurb: "Old-school gold" },
  { name: "Berry Punch", color: "#d946ef", font: "Cursive", blurb: "Fun and playful" },
];
const socialUrl = (kind: "instagram" | "tiktok" | "facebook", v: string) => {
  const t = v.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const h = t.replace("@", "");
  return kind === "instagram" ? `https://instagram.com/${h}` : kind === "tiktok" ? `https://tiktok.com/@${h}` : `https://facebook.com/${h}`;
};
// shrink big photos so they never break the site or Supabase
const shrinkImage = (file: File, maxSize = 900, quality = 0.8) =>
  new Promise<string>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, maxSize / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
const card = "bg-neutral-900 rounded-2xl p-4 border border-white/10";
const cardTitle = "m-0 text-sm font-bold";
const inp = "w-full p-2.5 rounded-xl border border-white/10 bg-neutral-900/80 text-white text-xs outline-none focus:border-white/30";
const lbl = "text-[11px] text-neutral-400 font-medium";
const btn = "border-none rounded-xl text-xs font-bold cursor-pointer transition active:scale-95 hover:opacity-90 text-white";
const heading = "m-0 mb-2 text-xs font-bold text-neutral-300 uppercase tracking-wider";

const Modal = ({ z = 1000, wide, children }: { z?: number; wide?: boolean; children: React.ReactNode }) => (
  <div style={{ zIndex: z }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className={`bg-neutral-800 p-5 rounded-3xl w-full ${wide ? "max-w-xl max-h-[90vh] overflow-y-auto" : "max-w-sm"} border border-white/10 shadow-2xl`}>{children}</div>
  </div>
);
const Tab = ({ active, color, onClick, children }: { active: boolean; color: string; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} style={{ backgroundColor: active ? color : "#262626" }} className={`${btn} py-1.5 px-3 whitespace-nowrap`}>{children}</button>
);

export default function App() {
  // ----- core data -----
  const [shops, setShops] = useState<ShopProfile[]>(DEFAULT_SHOPS);
  const [currentShopId, setCurrentShopId] = useState("mamas-yard");
  const [menu, setMenu] = useState<Dish[]>(INITIAL_MENU);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [sugInput, setSugInput] = useState("");
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [likedDishIds, setLikedDishIds] = useState<Record<string, boolean>>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // ----- dish customizing -----
  const [selectedDishForCart, setSelectedDishForCart] = useState<Dish | null>(null);
  const [optSpice, setOptSpice] = useState("Medium");
  const [optGravy, setOptGravy] = useState("Normal");
  const [optKetchup, setOptKetchup] = useState(false);
  const [optPepper, setOptPepper] = useState(false);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0);

  // ----- supabase -----
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem("SUPABASE_URL") || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem("SUPABASE_ANON_KEY") || "");

  // ----- admin / master -----
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isMasterLoggedIn, setIsMasterLoggedIn] = useState(false);
  const [masterPin, setMasterPin] = useState(() => localStorage.getItem("MASTER_PIN") || "9999");
  const [newMasterPin, setNewMasterPin] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState<"today" | "orders" | "menu" | "look" | "delivery" | "contact" | "devChat">("today");
  const [activeMasterTab, setActiveMasterTab] = useState<"shops" | "supabase" | "devChat" | "masterPin">("shops");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    "mamas-yard": [{ id: "c1", sender: "master", text: "Welcome! System operational.", timestamp: "10:00 AM" }],
  });
  const [chatInput, setChatInput] = useState("");
  const [newShopName, setNewShopName] = useState("");
  const [newShopPin, setNewShopPin] = useState("");
  const [newShopWhatsapp, setNewShopWhatsapp] = useState("");

  // ----- custom dish + menu editor -----
  const [showCustomDishModal, setShowCustomDishModal] = useState(false);
  const [customDishName, setCustomDishName] = useState("");
  const [customDishPrice, setCustomDishPrice] = useState("");
  const [customDishNotes, setCustomDishNotes] = useState("");
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const emptyForm = { name: "", price: "", description: "", category: "Mains" as Dish["category"], image: "", isSpecial: false };
  const [dishForm, setDishForm] = useState(emptyForm);

  // ----- checkout -----
  const [orderType, setOrderType] = useState<"Delivery" | "Pickup">("Delivery");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [driverTip, setDriverTip] = useState(0);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [pendingId, setPendingId] = useState(() => Date.now().toString());

  const audioRef = useRef<AudioContext | null>(null);
  const lastPending = useRef(0);

  // ----- derived -----
  const currentShop = shops.find((s) => s.id === currentShopId) || shops[0];
  const sisterShop = shops.find((s) => s.id !== currentShopId);
  const color = currentShop.themeColor;
  const shopOrders = orders.filter((o) => o.shopId === currentShopId);
  const currentDeliveryFee = orderType === "Delivery" ? currentShop.deliveryZones[selectedZoneIndex]?.price ?? 300 : 0;
  const subtotal = cart.reduce((a, i) => a + i.dish.price * i.quantity, 0);
  const total = subtotal + currentDeliveryFee + driverTip;
  const payRef = `YV-${pendingId.slice(-4)}`;
  const needsRef = paymentMethod !== "Cash";
  const filteredMenu = selectedCategory === "All Items" ? menu : menu.filter((d) => d.category === selectedCategory);
  const shopSuggestions = suggestions.filter((s) => s.shopId === currentShopId).sort((a, b) => b.votes - a.votes);

  // ----- supabase REST helper (upserts + deletes) -----
  const supabaseFetch = async (table: string, method = "GET", body?: any, query = "") => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    try {
      const headers: Record<string, string> = { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}`, "Content-Type": "application/json" };
      if (method === "POST" || method === "PUT") headers["Prefer"] = "resolution=merge-duplicates,return=representation";
      const res = await fetch(`${supabaseUrl}/rest/v1/${table}${query}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
      if (!res.ok) return null;
      const text = await res.text();
      return text ? JSON.parse(text) : [];
    } catch (err) {
      console.warn("Supabase fallback:", err);
      return null;
    }
  };

  const playChime = () => {
    try {
      const ctx = audioRef.current;
      if (!ctx) return;
      ctx.resume();
      [880, 1175, 1568].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.2;
        o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        o.start(t); o.stop(t + 0.4);
      });
    } catch { /* audio unsupported */ }
  };

  // ----- effects -----
  useEffect(() => {
    (async () => {
      const s = await supabaseFetch("shops"); if (s && s.length) setShops(s);
      const m = await supabaseFetch("menu"); if (m && m.length) setMenu(m);
      const o = await supabaseFetch("orders"); if (o) setOrders(o);
      const g = await supabaseFetch("suggestions"); if (g) setSuggestions(g);
    })();
  }, [supabaseUrl, supabaseAnonKey]);

  useEffect(() => {
    const shop = new URLSearchParams(window.location.search).get("shop");
    const match = shop && shops.find((s) => s.id === shop);
    if (match) setCurrentShopId(match.id);
  }, [shops]);

  useEffect(() => { if (!currentShop.isDeliveryActive) setOrderType("Pickup"); }, [currentShop.isDeliveryActive]);

  // new-order chime: poll while an admin is logged in
  useEffect(() => {
    if (!isAdminLoggedIn || !supabaseUrl) return;
    const poll = async () => {
      const cloud: Order[] | null = await supabaseFetch("orders");
      if (!cloud) return;
      setOrders(cloud);
      const pending = cloud.filter((o) => o.status === "Pending").length;
      if (pending > lastPending.current) playChime();
      lastPending.current = pending;
    };
    poll();
    const t = setInterval(poll, 20000);
    return () => clearInterval(t);
  }, [isAdminLoggedIn, supabaseUrl, supabaseAnonKey]);

  // ----- handlers -----
  const handleToggleLike = (id: string) => {
    const was = likedDishIds[id];
    setLikedDishIds((p) => ({ ...p, [id]: !was }));
    setMenu((p) => p.map((d) => (d.id === id ? { ...d, likes: d.likes + (was ? -1 : 1) } : d)));
  };

  const handleSaveSupabaseConfig = () => {
    localStorage.setItem("SUPABASE_URL", supabaseUrl);
    localStorage.setItem("SUPABASE_ANON_KEY", supabaseAnonKey);
    alert("Supabase credentials saved successfully!");
  };

  const handleFetchGPS = () => {
    if (!navigator.geolocation) return alert("Geolocation is not supported by your browser.");
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        setCustomerAddress((p) => (p ? `${p} | 📍 GPS Pin: ${url}` : `📍 GPS Pin: ${url}`));
        setIsFetchingLocation(false);
      },
      () => { alert("Unable to retrieve GPS location. Please enter manually."); setIsFetchingLocation(false); }
    );
  };

  const handleAdminLogin = () => {
    const input = adminPinInput.trim();
    try {
      const C = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioRef.current && C) audioRef.current = new C();
      audioRef.current?.resume();
    } catch { /* ignore */ }
    if (input === masterPin) {
      setIsMasterLoggedIn(true); setIsAdminLoggedIn(true); setAdminPinInput(""); return;
    }
    const match = shops.find((s) => s.pin === input || s.adminPin === input);
    if (match) {
      setCurrentShopId(match.id); setIsMasterLoggedIn(false); setIsAdminLoggedIn(true); setAdminPinInput(""); return;
    }
    alert("Invalid PIN. Please try again.");
    setAdminPinInput("");
  };

  const logout = () => { setIsMasterLoggedIn(false); setIsAdminLoggedIn(false); setShowAdminModal(false); };

  const handleSaveMasterPin = () => {
    if (newMasterPin.trim().length < 4) return alert("PIN must be at least 4 characters.");
    localStorage.setItem("MASTER_PIN", newMasterPin.trim());
    setMasterPin(newMasterPin.trim());
    setNewMasterPin("");
    alert("Master PIN updated.");
  };

  const openCustomize = (dish: Dish) => {
    setSelectedDishForCart(dish); setOptSpice("Medium"); setOptGravy("Normal"); setOptKetchup(false); setOptPepper(false);
  };

  const confirmAddToCart = () => {
    if (!selectedDishForCart) return;
    setCart((p) => [...p, { dish: selectedDishForCart, quantity: 1, spiceLevel: optSpice, gravyType: optGravy, addKetchup: optKetchup, addPepper: optPepper, isItemCompleted: false }]);
    setSelectedDishForCart(null);
  };

  const changeQty = (idx: number, delta: number) =>
    setCart((p) => p.flatMap((it, i) => (i !== idx ? [it] : it.quantity + delta <= 0 ? [] : [{ ...it, quantity: it.quantity + delta }])));

  const handleAddCustomDish = () => {
    if (!customDishName || !customDishPrice) return alert("Please provide a name and price for the custom dish.");
    const dish: Dish = { id: Date.now().toString(), name: customDishName, price: parseFloat(customDishPrice) || 0, description: customDishNotes || "Custom dish order", category: "Mains", image: FALLBACK_IMG, inStock: true, likes: 0 };
    setCart((p) => [...p, { dish, quantity: 1, spiceLevel: "Normal", gravyType: "Normal", addKetchup: false, addPepper: false, isItemCompleted: false }]);
    setShowCustomDishModal(false); setCustomDishName(""); setCustomDishPrice(""); setCustomDishNotes("");
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order["status"], estimatedTime?: string) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status, estimatedTime: estimatedTime || o.estimatedTime } : o));
    setOrders(updated);
    const o = updated.find((x) => x.id === orderId);
    if (!o) return;
    let msg = `*Order Update - ${currentShop.name}*\nHi ${o.customerName}, your Order #${o.id.slice(-4)} status has changed:\n\n📌 *Status:* ${status.toUpperCase()}\n`;
    if (estimatedTime) msg += `⏱️ *Estimated Time:* Ready in approx ${estimatedTime}\n`;
    if (status === "Ready") msg += o.orderType === "Delivery" ? "🚚 Your order is cooked and on its way!" : "🏪 Your order is fresh & ready for pickup at our counter!";
    if (status === "Completed") msg += "🎉 Order completed! Thank you for dining with us!";
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    supabaseFetch("orders", "POST", o);
  };

  const handleToggleItemCompleted = (orderId: string, idx: number) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, items: o.items.map((it, i) => (i === idx ? { ...it, isItemCompleted: !it.isItemCompleted } : it)) } : o));
    setOrders(updated);
    const o = updated.find((x) => x.id === orderId);
    if (o) supabaseFetch("orders", "POST", o);
  };

  const buildOrderSummaryText = () => {
    let msg = `*New Order - ${currentShop.name}*\n\n`;
    cart.forEach((it, i) => {
      msg += `${i + 1}. *${it.dish.name}* (x${it.quantity}) - $${it.dish.price * it.quantity} JMD\n   Spice: ${it.spiceLevel} | Gravy: ${it.gravyType}`;
      if (it.addKetchup) msg += " | +Ketchup";
      if (it.addPepper) msg += " | +Pepper";
      msg += "\n";
    });
    msg += `\n*Order Type:* ${orderType}\n`;
    if (orderType === "Delivery") {
      msg += `*Delivery Zone:* ${currentShop.deliveryZones[selectedZoneIndex]?.name || "Standard"}\n*Delivery Fee:* $${currentDeliveryFee} JMD\n*Address / Landmark:* ${customerAddress}\n`;
    }
    if (driverTip > 0) msg += `*Tip:* $${driverTip} JMD\n`;
    msg += `*Total Amount:* $${total} JMD\n*Customer Name:* ${customerName}\n*Payment Method:* ${paymentMethod}\n`;
    if (needsRef) msg += `*Payment Reference:* ${payRef}\n`;
    return msg + `\n🔗 Reopen App: ${window.location.href}`;
  };

  const handleCopyOrderText = () => {
    navigator.clipboard.writeText(buildOrderSummaryText());
    alert("Order summary copied! Paste it in the DM.");
  };

  const handleDispatchOrder = (platform: "whatsapp" | "instagram" | "tiktok" | "facebook") => {
    if (!currentShop.isOpenManual) return alert("This cookshop is closed right now.");
    if (!customerName.trim()) return alert("Please enter your name/nickname before placing order.");
    if (orderType === "Delivery" && !customerAddress.trim()) return alert("Please enter a delivery address or landmark.");
    if (cart.length === 0) return alert("Your order plate is empty.");

    const order: Order = {
      id: pendingId, shopId: currentShopId, customerName, customerAddress, items: cart, subtotal,
      deliveryFee: currentDeliveryFee, tip: driverTip, total, orderType,
      deliveryZone: currentShop.deliveryZones[selectedZoneIndex]?.name || "Standard", paymentMethod,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), status: "Pending",
    };
    const text = buildOrderSummaryText();
    let url = "";
    if (platform === "whatsapp") url = `https://wa.me/${currentShop.whatsapp}?text=${encodeURIComponent(text)}`;
    else {
      navigator.clipboard.writeText(text);
      alert("Order summary copied! Paste it in the DM.");
      url = socialUrl(platform, currentShop[platform]);
    }
    window.open(url, "_blank"); // open first so mobile popup blockers allow it
    setOrders((p) => [order, ...p]);
    supabaseFetch("orders", "POST", order);
    setCart([]); setPendingId(Date.now().toString());
  };

  const updateCurrentShop = (key: keyof ShopProfile, value: any) => {
    const updated = shops.map((s) => (s.id === currentShopId ? { ...s, [key]: value } : s));
    setShops(updated);
    const shop = updated.find((s) => s.id === currentShopId);
    if (shop) supabaseFetch("shops", "POST", shop);
  };

  const updateShop = (patch: Partial<ShopProfile>) => {
    const updated = shops.map((x) => (x.id === currentShopId ? { ...x, ...patch } : x));
    setShops(updated);
    const shop = updated.find((x) => x.id === currentShopId);
    if (shop) supabaseFetch("shops", "POST", shop);
  };

  const shopField = (label: string, key: keyof ShopProfile, placeholder = "") => (
    <div key={key} className="grid gap-1">
      <label className={lbl}>{label}</label>
      <input className={inp} placeholder={placeholder} value={currentShop[key] as string} onChange={(e) => updateCurrentShop(key, e.target.value)} />
    </div>
  );

  const setDay = (day: string, patch: Partial<ShopProfile["weeklySchedule"][string]>) =>
    updateCurrentShop("weeklySchedule", { ...currentShop.weeklySchedule, [day]: { ...currentShop.weeklySchedule[day], ...patch } });

  const handleSendMessage = (sender: "master" | "admin") => {
    if (!chatInput.trim()) return;
    const msg: ChatMessage = { id: Date.now().toString(), sender, text: chatInput.trim(), timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setChatMessages((p) => ({ ...p, [currentShopId]: [...(p[currentShopId] || []), msg] }));
    setChatInput("");
  };

  const handleSaveDish = () => {
    if (!dishForm.name || !dishForm.price) return;
    let saved: Dish;
    if (editingDish) {
      saved = { ...editingDish, name: dishForm.name, price: parseFloat(dishForm.price) || 0, description: dishForm.description, category: dishForm.category, image: dishForm.image || editingDish.image, isSpecial: dishForm.isSpecial };
      setMenu((p) => p.map((d) => (d.id === saved.id ? saved : d)));
    } else {
      saved = { id: Date.now().toString(), name: dishForm.name, price: parseFloat(dishForm.price) || 0, description: dishForm.description, category: dishForm.category, image: dishForm.image || FALLBACK_IMG, inStock: true, likes: 0, isSpecial: dishForm.isSpecial };
      setMenu((p) => [...p, saved]);
    }
    supabaseFetch("menu", "POST", saved);
    setEditingDish(null); setDishForm(emptyForm);
  };

  const handleToggleStock = (item: Dish) => {
    const updated = { ...item, inStock: !item.inStock };
    setMenu((p) => p.map((d) => (d.id === item.id ? updated : d)));
    supabaseFetch("menu", "POST", updated);
  };

  const handleDeleteDish = (id: string) => {
    if (!confirm("Delete this dish?")) return;
    setMenu((p) => p.filter((d) => d.id !== id));
    supabaseFetch("menu", "DELETE", undefined, `?id=eq.${id}`);
  };

  const readImage = (e: React.ChangeEvent<HTMLInputElement>, done: (data: string) => void, maxSize = 900) => {
    const file = e.target.files?.[0];
    if (!file) return;
    shrinkImage(file, maxSize).then(done).catch(() => alert("Couldn't read that picture. Try a different one."));
  };

  const handleAddSuggestion = () => {
    if (!sugInput.trim()) return;
    const s: Suggestion = { id: Date.now().toString(), shopId: currentShopId, text: sugInput.trim(), votes: 1 };
    setSuggestions((p) => [...p, s]);
    setVotedIds((p) => ({ ...p, [s.id]: true }));
    supabaseFetch("suggestions", "POST", s);
    setSugInput("");
  };

  const handleVote = (id: string) => {
    if (votedIds[id]) return;
    const target = suggestions.find((s) => s.id === id);
    if (!target) return;
    const updated = { ...target, votes: target.votes + 1 };
    setSuggestions((p) => p.map((s) => (s.id === id ? updated : s)));
    setVotedIds((p) => ({ ...p, [id]: true }));
    supabaseFetch("suggestions", "POST", updated);
  };

  const handleCreateShop = () => {
    if (!newShopName || !newShopPin) return;
    const id = newShopName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const profile: ShopProfile = { ...DEFAULT_SHOPS[0], id: shops.some((x) => x.id === id) ? `${id}-${Date.now().toString().slice(-3)}` : id, name: newShopName, tagline: "", pin: newShopPin, adminPin: newShopPin, whatsapp: newShopWhatsapp.replace(/\D/g, ""), instagram: "", tiktok: "", facebook: "", address: "", mapLink: "", headerBanner: "", deliveryZoneNote: "" };
    setShops((p) => [...p, profile]);
    supabaseFetch("shops", "POST", profile);
    setNewShopName(""); setNewShopPin(""); setNewShopWhatsapp("");
  };

  const chatBox = (me: "master" | "admin") => (
    <div>
      <div className="h-48 overflow-y-auto border border-white/10 rounded-xl p-2.5 mb-2 bg-neutral-900 space-y-2">
        {(chatMessages[currentShopId] || []).map((m) => (
          <div key={m.id} className={m.sender === me ? "text-right" : "text-left"}>
            <span className="text-[10px] text-neutral-500 block mb-0.5">{m.timestamp}</span>
            <div style={{ backgroundColor: m.sender === me ? (me === "master" ? "#dc2626" : color) : "#262626" }} className="inline-block p-2 rounded-xl text-xs text-white">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className={inp} placeholder={me === "master" ? "Message shop admin..." : "Message developer..."} value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
        <button onClick={() => handleSendMessage(me)} style={{ backgroundColor: me === "master" ? "#dc2626" : color }} className={`${btn} px-4`}>Send</button>
      </div>
    </div>
  );

  // =====================================================
  return (
    <div className="bg-neutral-950 text-white min-h-screen pb-24" style={{ fontFamily: FONTS[currentShop.fontStyle] || FONTS["Sans-Serif"] }}>
      {/* cross-promo */}
      {sisterShop && (
        <button onClick={() => { setCurrentShopId(sisterShop.id); setCart([]); setSelectedZoneIndex(0); }} className="w-full bg-neutral-900 text-neutral-300 text-xs py-2 px-4 border-0 border-b border-white/10 cursor-pointer hover:bg-neutral-800 transition">
          Craving something else? Try <strong className="text-white">{sisterShop.name}</strong> <span style={{ color }} className="font-bold">Switch shop ›</span>
        </button>
      )}

      {/* header */}
      <header className="max-w-xl mx-auto">
        <div className="relative h-52 overflow-hidden rounded-b-3xl">
          {currentShop.headerBanner && <img src={currentShop.headerBanner} alt="" onClick={() => setZoomedImage(currentShop.headerBanner)} className="absolute inset-0 w-full h-full object-cover cursor-pointer" />}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="m-0 text-2xl font-extrabold leading-tight">{currentShop.name}</h1>
              <p className="m-0 mt-1 text-xs text-neutral-300">{currentShop.tagline}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setShowShareModal(true)} className={`${btn} bg-white/15 backdrop-blur px-3 py-2`}>📲 Share</button>
              <button onClick={() => setShowAdminModal(true)} style={{ backgroundColor: color }} className={`${btn} px-3 py-2`}>🔒 Admin</button>
            </div>
          </div>
        </div>
        {!currentShop.isOpenManual && <div className="mx-4 mt-3 bg-red-950/80 text-red-300 border border-red-600/40 p-2.5 rounded-xl text-center text-xs font-semibold">⛔ We're closed right now. Check back during business hours.</div>}
      </header>

      <main className="p-4 max-w-xl mx-auto">
        {/* categories */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-2 overflow-x-auto flex-1 pb-1">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setSelectedCategory(c)} style={{ backgroundColor: selectedCategory === c ? color : "#262626" }} className={`${btn} px-3.5 py-1.5 rounded-full whitespace-nowrap`}>{c}</button>
            ))}
          </div>
          <button onClick={() => setShowCustomDishModal(true)} className={`${btn} bg-neutral-700 px-3 py-1.5 rounded-full whitespace-nowrap`}>+ Custom</button>
        </div>

        {/* menu */}
        <h2 className="text-base font-bold m-0 mb-3 text-neutral-100">Today's menu</h2>
        <div className="grid gap-3">
          {filteredMenu.map((item) => (
            <div key={item.id} style={item.isSpecial ? { borderColor: color } : undefined} className="bg-neutral-900 rounded-2xl p-3 flex gap-3 border border-white/10">
              <img src={item.image} alt={item.name} onClick={() => setZoomedImage(item.image)} className="w-24 h-24 object-cover rounded-xl cursor-pointer shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="m-0 text-sm font-bold leading-snug">{item.name}</h3>
                  <span style={{ color }} className="font-extrabold text-sm shrink-0">${item.price}</span>
                </div>
                {item.isSpecial && <span className="self-start mt-1 bg-amber-400 text-black text-[10px] px-1.5 py-0.5 rounded font-black">⭐ Special</span>}
                <p className="text-[11px] text-neutral-400 my-1 line-clamp-2 leading-relaxed">{item.description}</p>
                <div className="flex justify-between items-center mt-auto">
                  {item.inStock ? (
                    <button onClick={() => openCustomize(item)} style={{ backgroundColor: color }} className={`${btn} px-3 py-1.5`}>+ Add to plate</button>
                  ) : <span className="text-xs text-red-400 font-semibold">Sold out</span>}
                  <button onClick={() => handleToggleLike(item.id)} className={`bg-transparent border-none text-xs cursor-pointer ${likedDishIds[item.id] ? "text-pink-500 font-bold" : "text-neutral-400"}`}>❤️ {item.likes}</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* plate */}
        <div id="plate" className="mt-6 bg-neutral-900 rounded-2xl p-4 border border-white/10">
          <h2 className="text-base font-bold m-0 mb-3">🛒 Your plate <span className="text-xs font-normal text-neutral-400">({cart.length} items)</span></h2>
          {cart.length === 0 ? <p className="text-xs text-neutral-400 m-0">Nothing here yet. Add a dish from the menu.</p> : (
            <div>
              <div className="space-y-3 mb-3">
                {cart.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{it.dish.name}</div>
                      <div className="text-[10px] text-neutral-400">Spice: {it.spiceLevel} | Gravy: {it.gravyType}{it.addKetchup && " | +Ketchup"}{it.addPepper && " | +Pepper"}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => changeQty(idx, -1)} className={`${btn} bg-neutral-700 w-6 h-6`}>−</button>
                      <span className="text-xs font-bold w-4 text-center">{it.quantity}</span>
                      <button onClick={() => changeQty(idx, 1)} className={`${btn} bg-neutral-700 w-6 h-6`}>+</button>
                      <span style={{ color }} className="text-xs font-bold w-16 text-right">${it.dish.price * it.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {(["Delivery", "Pickup"] as const).map((t) => {
                  const off = t === "Delivery" && !currentShop.isDeliveryActive;
                  return (
                    <button key={t} disabled={off} onClick={() => setOrderType(t)} style={{ backgroundColor: orderType === t ? color : "#262626" }} className={`${btn} flex-1 py-2 ${off ? "opacity-40" : ""}`}>
                      {t === "Delivery" ? (off ? "🚚 Delivery off" : "🚚 Delivery") : "🏪 Pickup"}
                    </button>
                  );
                })}
              </div>

              {orderType === "Delivery" && (
                <div className="mt-3">
                  <label className={lbl}>Delivery zone</label>
                  <select className={`${inp} mt-1`} value={selectedZoneIndex} onChange={(e) => setSelectedZoneIndex(parseInt(e.target.value, 10))}>
                    {currentShop.deliveryZones.map((z, i) => <option key={i} value={i}>{z.name} (+${z.price})</option>)}
                  </select>
                  {currentShop.deliveryZoneNote && <p className="text-[10px] text-neutral-500 mt-1 mb-0">{currentShop.deliveryZoneNote}</p>}
                </div>
              )}

              <div className="mt-3">
                <label className={lbl}>Payment method</label>
                <select className={`${inp} mt-1`} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="Cash">Cash on delivery / pickup</option>
                  <option value="Lynk">Lynk</option>
                  <option value="Bank Transfer">Bank transfer</option>
                </select>
                {needsRef && <div className="mt-2 p-2.5 rounded-xl bg-neutral-800 border border-white/10 text-[11px] text-neutral-300">Put <strong style={{ color }}>{payRef}</strong> as your payment reference so we can match your payment.</div>}
              </div>

              {orderType === "Delivery" && (
                <div className="mt-3">
                  <label className={lbl}>Driver tip ($ JMD)</label>
                  <input type="number" placeholder="0" value={driverTip || ""} onChange={(e) => setDriverTip(parseFloat(e.target.value) || 0)} className={`${inp} mt-1`} />
                </div>
              )}

              <div className="mt-3 space-y-2">
                <input className={inp} placeholder="Your name / nickname *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                {orderType === "Delivery" && (
                  <div className="flex gap-2">
                    <input className={inp} placeholder="Delivery address / landmark *" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
                    <button onClick={handleFetchGPS} disabled={isFetchingLocation} className={`${btn} bg-sky-600 px-3 shrink-0`}>{isFetchingLocation ? "..." : "📍 GPS"}</button>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-white/10 pt-3">
                <div className="flex justify-between text-[11px] text-neutral-400"><span>Subtotal</span><span>${subtotal}</span></div>
                {orderType === "Delivery" && <div className="flex justify-between text-[11px] text-neutral-400"><span>Delivery</span><span>${currentDeliveryFee}</span></div>}
                {driverTip > 0 && <div className="flex justify-between text-[11px] text-neutral-400"><span>Tip</span><span>${driverTip}</span></div>}
                <div className="flex justify-between text-base font-extrabold mt-1"><span>Total</span><span style={{ color }}>${total} JMD</span></div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button onClick={() => handleDispatchOrder("whatsapp")} className={`${btn} bg-emerald-600 py-2.5`}>📱 WhatsApp</button>
                  <button onClick={() => handleDispatchOrder("instagram")} className={`${btn} bg-pink-600 py-2.5`}>📸 Instagram DM</button>
                  <button onClick={() => handleDispatchOrder("tiktok")} className={`${btn} bg-cyan-600 py-2.5`}>🎵 TikTok DM</button>
                  <button onClick={() => handleDispatchOrder("facebook")} className={`${btn} bg-blue-600 py-2.5`}>📘 Facebook DM</button>
                </div>
                <button onClick={handleCopyOrderText} className={`${btn} bg-neutral-700 w-full py-2 mt-2`}>📋 Copy order text</button>
              </div>
            </div>
          )}
        </div>

        {/* suggestion box */}
        <div className="mt-6 bg-neutral-900 rounded-2xl p-4 border border-white/10">
          <h2 className="text-base font-bold m-0 mb-1">💡 Suggestion box</h2>
          <p className="text-[11px] text-neutral-400 m-0 mb-3">Tell us what dish you want next. Vote for the ones you like.</p>
          <div className="flex gap-2 mb-3">
            <input className={inp} placeholder="e.g. Oxtail on Fridays" value={sugInput} onChange={(e) => setSugInput(e.target.value)} />
            <button onClick={handleAddSuggestion} style={{ backgroundColor: color }} className={`${btn} px-4 shrink-0`}>Send</button>
          </div>
          {shopSuggestions.length === 0 ? <p className="text-xs text-neutral-500 m-0">No suggestions yet. Be the first.</p> : (
            <div className="space-y-2">
              {shopSuggestions.map((s) => (
                <div key={s.id} className="flex justify-between items-center gap-2 bg-neutral-800 rounded-xl p-2.5">
                  <span className="text-xs">{s.text}</span>
                  <button onClick={() => handleVote(s.id)} disabled={votedIds[s.id]} style={votedIds[s.id] ? { backgroundColor: color } : undefined} className={`${btn} ${votedIds[s.id] ? "" : "bg-neutral-700"} px-2.5 py-1 shrink-0`}>👍 {s.votes}</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        <footer className="mt-8 py-5 border-t border-white/10 text-center">
          <div className="flex flex-wrap justify-center gap-2">
            {([["📸 Instagram", "instagram", currentShop.instagram], ["🎵 TikTok", "tiktok", currentShop.tiktok], ["📘 Facebook", "facebook", currentShop.facebook]] as const)
              .filter(([, , v]) => v.trim())
              .map(([n, k, v]) => <a key={k} href={socialUrl(k, v)} target="_blank" rel="noreferrer" className="bg-neutral-800 text-white no-underline text-xs font-semibold px-4 py-2 rounded-full border border-white/10">{n}</a>)}
          </div>
          {currentShop.address && <p className="text-[11px] text-neutral-500 mt-3 mb-0">📍 {currentShop.address} {currentShop.mapLink && <a href={currentShop.mapLink} target="_blank" rel="noreferrer" style={{ color }}>Map</a>}</p>}
        </footer>
      </main>

      {/* sticky plate bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-[900] p-3 pointer-events-none">
          <button onClick={() => document.getElementById("plate")?.scrollIntoView({ behavior: "smooth" })} style={{ backgroundColor: color }} className={`${btn} pointer-events-auto max-w-xl mx-auto w-full flex justify-between items-center px-5 py-3.5 shadow-2xl text-sm`}>
            <span>🛒 View plate ({cart.reduce((a, i) => a + i.quantity, 0)})</span><span>${subtotal} JMD</span>
          </button>
        </div>
      )}

      {/* share */}
      {showShareModal && (
        <Modal z={1500}>
          <div className="text-center">
            <h3 className="m-0 mb-1 text-base font-bold">📲 Share {currentShop.name}</h3>
            <p className="text-[11px] text-neutral-400 m-0 mb-4">Scan the QR code or copy the link to open the menu.</p>
            <div className="bg-white p-3 rounded-2xl inline-block mb-4"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.href)}`} alt="Menu QR code" className="w-44 h-44 block" /></div>
            <div className="grid gap-2">
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Menu link copied!"); }} style={{ backgroundColor: color }} className={`${btn} py-2.5`}>📋 Copy menu link</button>
              <button onClick={() => setShowShareModal(false)} className={`${btn} bg-neutral-700 py-2`}>Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* customize */}
      {selectedDishForCart && (
        <Modal z={1200}>
          <h3 className="m-0 mb-3 text-base font-bold">Customize: {selectedDishForCart.name}</h3>
          <div className="grid gap-3 mb-4">
            <div><label className={lbl}>Gravy</label>
              <select className={`${inp} mt-1`} value={optGravy} onChange={(e) => setOptGravy(e.target.value)}>
                {["Normal", "Extra Gravy", "No Gravy / Dry", "Gravy on Side"].map((o) => <option key={o}>{o}</option>)}
              </select></div>
            <div><label className={lbl}>Spice level</label>
              <select className={`${inp} mt-1`} value={optSpice} onChange={(e) => setOptSpice(e.target.value)}>
                {["Mild", "Medium", "Hot & Spicy"].map((o) => <option key={o}>{o}</option>)}
              </select></div>
            <label className="text-xs flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={optKetchup} onChange={(e) => setOptKetchup(e.target.checked)} />Add ketchup</label>
            <label className="text-xs flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={optPepper} onChange={(e) => setOptPepper(e.target.checked)} />Add scotch bonnet pepper</label>
          </div>
          <div className="flex gap-2">
            <button onClick={confirmAddToCart} style={{ backgroundColor: color }} className={`${btn} flex-1 py-2.5`}>Add to plate</button>
            <button onClick={() => setSelectedDishForCart(null)} className={`${btn} bg-neutral-700 px-4`}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* custom dish */}
      {showCustomDishModal && (
        <Modal>
          <h3 className="m-0 mb-3 text-base font-bold">🍲 Order a custom dish</h3>
          <div className="grid gap-2 mb-3">
            <input className={inp} placeholder="Dish name (e.g. Steamed fish)" value={customDishName} onChange={(e) => setCustomDishName(e.target.value)} />
            <input className={inp} type="number" placeholder="Agreed price ($ JMD)" value={customDishPrice} onChange={(e) => setCustomDishPrice(e.target.value)} />
            <textarea className={inp} placeholder="Special instructions or notes..." value={customDishNotes} onChange={(e) => setCustomDishNotes(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddCustomDish} style={{ backgroundColor: color }} className={`${btn} flex-1 py-2.5`}>Add to plate</button>
            <button onClick={() => setShowCustomDishModal(false)} className={`${btn} bg-neutral-700 px-4`}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* login */}
      {showAdminModal && !isAdminLoggedIn && (
        <Modal>
          <h3 className="m-0 mb-3 text-base font-bold">🔐 Enter admin PIN</h3>
          <input type="password" inputMode="numeric" placeholder="****" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()} className={`${inp} p-3 text-lg text-center tracking-widest mb-3`} />
          <div className="flex gap-2">
            <button onClick={handleAdminLogin} style={{ backgroundColor: color }} className={`${btn} flex-1 py-2.5`}>Unlock panel</button>
            <button onClick={() => setShowAdminModal(false)} className={`${btn} bg-neutral-700 px-4`}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* master control */}
      {showAdminModal && isAdminLoggedIn && isMasterLoggedIn && (
        <Modal z={1100} wide>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
            <h3 className="m-0 text-base font-bold text-red-500">👑 Master control</h3>
            <button onClick={logout} className={`${btn} bg-neutral-700 px-3 py-1`}>Log out</button>
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {([["shops", "Shops"], ["supabase", "⚡ Supabase"], ["devChat", "Dev chat"], ["masterPin", "Master PIN"]] as const).map(([k, n]) => (
              <Tab key={k} active={activeMasterTab === k} color="#dc2626" onClick={() => setActiveMasterTab(k)}>{n}</Tab>
            ))}
          </div>

          {activeMasterTab === "shops" && (
            <div>
              <h4 className={heading}>Add a new shop in seconds</h4>
              <div className="grid gap-2 mb-4">
                <input className={inp} placeholder="Cookshop name" value={newShopName} onChange={(e) => setNewShopName(e.target.value)} />
                <input className={inp} placeholder="Owner password / PIN" value={newShopPin} onChange={(e) => setNewShopPin(e.target.value)} />
                <input className={inp} placeholder="WhatsApp number (e.g. 18765551234)" value={newShopWhatsapp} onChange={(e) => setNewShopWhatsapp(e.target.value)} />
                <button onClick={handleCreateShop} className={`${btn} bg-red-600 py-2.5`}>Create shop</button>
              </div>
              <h4 className={heading}>Open a shop's admin panel ({shops.length})</h4>
              <select className={inp} value={currentShopId} onChange={(e) => { setCurrentShopId(e.target.value); setIsMasterLoggedIn(false); }}>
                {shops.map((s) => <option key={s.id} value={s.id}>{s.name} (PIN: {s.pin})</option>)}
              </select>
            </div>
          )}

          {activeMasterTab === "supabase" && (
            <div className="grid gap-2">
              <h4 className={heading}>⚡ Connect database</h4>
              <p className="text-[11px] text-neutral-400 m-0">Enter your project URL and public anon key. They're saved in this browser only.</p>
              <label className={lbl}>Project URL</label>
              <input className={inp} placeholder="https://xyz.supabase.co" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} />
              <label className={lbl}>Anon key</label>
              <textarea className={`${inp} h-20`} placeholder="eyJhbGciOi..." value={supabaseAnonKey} onChange={(e) => setSupabaseAnonKey(e.target.value)} />
              <button onClick={handleSaveSupabaseConfig} className={`${btn} bg-emerald-600 py-2.5`}>Save Supabase settings</button>
            </div>
          )}

          {activeMasterTab === "devChat" && chatBox("master")}

          {activeMasterTab === "masterPin" && (
            <div className="grid gap-2">
              <h4 className={heading}>Change master PIN</h4>
              <input className={inp} type="password" placeholder="New master PIN" value={newMasterPin} onChange={(e) => setNewMasterPin(e.target.value)} />
              <button onClick={handleSaveMasterPin} className={`${btn} bg-red-600 py-2.5`}>Save master PIN</button>
            </div>
          )}
        </Modal>
      )}

      {/* shop admin */}
      {showAdminModal && isAdminLoggedIn && !isMasterLoggedIn && (
        <Modal z={1100} wide>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
            <h3 className="m-0 text-base font-bold">⚙️ {currentShop.name}</h3>
            <button onClick={logout} className={`${btn} bg-neutral-700 px-3 py-1`}>Log out</button>
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {([["today", "🏠 Today"], ["orders", `📋 Orders (${shopOrders.length})`], ["menu", "📜 Menu"], ["look", "🎨 Look"], ["delivery", "🚚 Delivery"], ["contact", "📞 Contact"], ["devChat", "💬 Dev chat"]] as const).map(([k, n]) => (
              <Tab key={k} active={activeAdminTab === k} color={color} onClick={() => setActiveAdminTab(k)}>{n}</Tab>
            ))}
          </div>

          {activeAdminTab === "today" && (
            <div className="grid gap-3">
              <div className={`${card} grid gap-2`}>
                <h4 className={cardTitle}>Shop status</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => updateCurrentShop("isOpenManual", !currentShop.isOpenManual)} className={`${btn} py-4 rounded-2xl ${currentShop.isOpenManual ? "bg-emerald-600" : "bg-red-600"}`}>{currentShop.isOpenManual ? "🟢 Open" : "🔴 Closed"}</button>
                  <button onClick={() => updateCurrentShop("isDeliveryActive", !currentShop.isDeliveryActive)} className={`${btn} py-4 rounded-2xl ${currentShop.isDeliveryActive ? "bg-emerald-600" : "bg-neutral-700"}`}>{currentShop.isDeliveryActive ? "🚚 Delivery on" : "🚚 Delivery off"}</button>
                </div>
                <p className="text-[11px] text-neutral-400 m-0">Tap to switch. Customers see it right away.</p>
              </div>
              <div className={`${card} flex justify-between items-center`}>
                <div><h4 className={cardTitle}>New orders</h4><p className="text-[11px] text-neutral-400 m-0">Waiting for you</p></div>
                <button onClick={() => setActiveAdminTab("orders")} style={{ backgroundColor: color }} className={`${btn} px-4 py-2`}>{shopOrders.filter((o) => o.status === "Pending").length} pending ›</button>
              </div>
            </div>
          )}

          {activeAdminTab === "delivery" && (
            <div className="grid gap-3">
              <div className={`${card} grid gap-2`}>
                <h4 className={cardTitle}>Delivery zones & prices</h4>
                {currentShop.deliveryZones.map((z, i) => (
                  <div key={i} className="flex gap-2">
                    <input className={inp} value={z.name} onChange={(e) => updateCurrentShop("deliveryZones", currentShop.deliveryZones.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                    <input className={`${inp} w-24`} type="number" value={z.price} onChange={(e) => updateCurrentShop("deliveryZones", currentShop.deliveryZones.map((x, j) => (j === i ? { ...x, price: parseFloat(e.target.value) || 0 } : x)))} />
                    {currentShop.deliveryZones.length > 1 && <button onClick={() => updateCurrentShop("deliveryZones", currentShop.deliveryZones.filter((_, j) => j !== i))} className={`${btn} bg-neutral-800 text-red-400 px-3`}>✕</button>}
                  </div>
                ))}
                <button onClick={() => updateCurrentShop("deliveryZones", [...currentShop.deliveryZones, { name: "New zone", price: 300 }])} className={`${btn} bg-neutral-700 py-2`}>+ Add zone</button>
                {shopField("Coverage note shown to customers", "deliveryZoneNote")}
              </div>
              <div className={`${card} grid gap-2`}>
                <h4 className={cardTitle}>Opening hours</h4>
                {Object.keys(currentShop.weeklySchedule).map((day) => {
                  const d = currentShop.weeklySchedule[day];
                  return (
                    <div key={day} className="flex items-center gap-2 text-xs text-neutral-300">
                      <span className="w-8 font-bold">{day}</span>
                      <input type="checkbox" checked={d.isOpen} onChange={(e) => setDay(day, { isOpen: e.target.checked })} />
                      <input type="time" value={d.openTime} onChange={(e) => setDay(day, { openTime: e.target.value })} className="bg-neutral-800 text-white border border-white/10 rounded-lg p-1 text-xs" />
                      <span>to</span>
                      <input type="time" value={d.closeTime} onChange={(e) => setDay(day, { closeTime: e.target.value })} className="bg-neutral-800 text-white border border-white/10 rounded-lg p-1 text-xs" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeAdminTab === "orders" && (
            <div>
              <h4 className={heading}>Incoming orders</h4>
              {shopOrders.length === 0 ? <p className="text-xs text-neutral-400">No orders yet for this shop.</p> : (
                <div className="grid gap-3">
                  {shopOrders.map((o) => (
                    <div key={o.id} className="bg-neutral-900 border border-white/10 p-3 rounded-2xl space-y-2">
                      <div className="flex justify-between"><span className="font-bold text-xs">Order #{o.id.slice(-4)}</span><span style={{ color }} className="text-xs font-extrabold">${o.total} JMD</span></div>
                      <div className="text-[11px] text-neutral-400">👤 {o.customerName} | 🚚 {o.orderType} ({o.deliveryZone}) | 💳 {o.paymentMethod}{o.paymentMethod !== "Cash" && ` (ref YV-${o.id.slice(-4)})`} | ⏰ {o.createdAt}</div>
                      {o.customerAddress && <div className="text-[11px] text-sky-400 break-words">📍 {o.customerAddress}</div>}
                      <div className="bg-neutral-800 p-2.5 rounded-xl space-y-2">
                        <div className="flex justify-between text-[11px]"><span>Status: <strong>{o.status}</strong></span>{o.estimatedTime && <span className="text-amber-300">⏱️ {o.estimatedTime}</span>}</div>
                        <div className="flex gap-1.5 flex-wrap">
                          <button onClick={() => handleUpdateOrderStatus(o.id, "Preparing", "15-20 mins")} className={`${btn} bg-amber-600 px-2.5 py-1`}>⏳ 15 min</button>
                          <button onClick={() => handleUpdateOrderStatus(o.id, "Preparing", "30-40 mins")} className={`${btn} bg-amber-600 px-2.5 py-1`}>⏳ 30 min</button>
                          <button onClick={() => handleUpdateOrderStatus(o.id, "Ready")} className={`${btn} bg-emerald-600 px-2.5 py-1`}>✅ Ready & alert</button>
                          <button onClick={() => handleUpdateOrderStatus(o.id, "Completed")} className={`${btn} bg-sky-600 px-2.5 py-1`}>🎉 Complete</button>
                        </div>
                      </div>
                      <div className="border-t border-white/10 pt-2 text-[11px]">
                        <div className="text-[10px] text-neutral-400 mb-1">Tap an item to mark it done:</div>
                        {o.items.map((it, i) => (
                          <div key={i} onClick={() => handleToggleItemCompleted(o.id, i)} className={`flex justify-between items-center py-1 cursor-pointer ${it.isItemCompleted ? "line-through text-emerald-400" : "text-neutral-200"}`}>
                            <span>{it.isItemCompleted ? "✅" : "🍳"} {it.quantity}x {it.dish.name} <span className="text-neutral-400">[{it.spiceLevel}, {it.gravyType}{it.addKetchup ? ", +Ketchup" : ""}{it.addPepper ? ", +Pepper" : ""}]</span></span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">{it.isItemCompleted ? "Done" : "Cooking"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeAdminTab === "menu" && (
            <div>
              <h4 className={heading}>{editingDish ? "Edit dish" : "Add new dish"}</h4>
              <div className="grid gap-2 mb-4">
                <input className={inp} placeholder="Dish name" value={dishForm.name} onChange={(e) => setDishForm((p) => ({ ...p, name: e.target.value }))} />
                <input className={inp} type="number" placeholder="Price (JMD)" value={dishForm.price} onChange={(e) => setDishForm((p) => ({ ...p, price: e.target.value }))} />
                <textarea className={inp} placeholder="Description" value={dishForm.description} onChange={(e) => setDishForm((p) => ({ ...p, description: e.target.value }))} />
                <select className={inp} value={dishForm.category} onChange={(e) => setDishForm((p) => ({ ...p, category: e.target.value as Dish["category"] }))}>
                  {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
                </select>
                <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={dishForm.isSpecial} onChange={(e) => setDishForm((p) => ({ ...p, isSpecial: e.target.checked }))} />Mark as ⭐ special</label>
                <input type="file" accept="image/*" onChange={(e) => readImage(e, (img) => setDishForm((p) => ({ ...p, image: img })))} className="text-xs text-neutral-400" />
                <div className="flex gap-2">
                  <button onClick={handleSaveDish} style={{ backgroundColor: color }} className={`${btn} flex-1 py-2.5`}>{editingDish ? "Update dish" : "Add dish"}</button>
                  {editingDish && <button onClick={() => { setEditingDish(null); setDishForm(emptyForm); }} className={`${btn} bg-neutral-700 px-4`}>Cancel</button>}
                </div>
              </div>
              <h4 className={heading}>Current items</h4>
              <div className="grid gap-2">
                {menu.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-2 bg-neutral-900 p-2.5 rounded-xl border border-white/10">
                    <div className="min-w-0"><div className="font-bold text-xs truncate">{item.name} (${item.price}) {item.isSpecial && "⭐"}</div><div className="text-[10px] text-neutral-400">{item.category}</div></div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => handleToggleStock(item)} className={`${btn} px-2 py-1 ${item.inStock ? "bg-emerald-600" : "bg-red-600"}`}>{item.inStock ? "In stock" : "Sold out"}</button>
                      <button onClick={() => { setEditingDish(item); setDishForm({ name: item.name, price: item.price.toString(), description: item.description, category: item.category, image: item.image, isSpecial: !!item.isSpecial }); }} className={`${btn} bg-sky-600 px-2 py-1`}>Edit</button>
                      <button onClick={() => handleDeleteDish(item.id)} className={`${btn} bg-neutral-800 text-red-400 px-2 py-1`}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeAdminTab === "look" && (
            <div className="grid gap-3">
              <div className={`${card} grid gap-2`}>
                <h4 className={cardTitle}>Header picture</h4>
                {currentShop.headerBanner && <img src={currentShop.headerBanner} alt="Banner preview" className="w-full h-24 object-cover rounded-xl" />}
                <label className={`${btn} bg-neutral-700 py-2.5 text-center block`}>📷 Choose picture<input type="file" accept="image/*" className="hidden" onChange={(e) => readImage(e, (img) => updateCurrentShop("headerBanner", img), 1400)} /></label>
                <p className="text-[11px] text-neutral-400 m-0">Customers can tap it to zoom. Big photos are shrunk automatically.</p>
              </div>
              <div className={card}>
                <h4 className={`${cardTitle} mb-2`}>Theme</h4>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((t) => {
                    const on = t.color === color && t.font === currentShop.fontStyle;
                    return (
                      <button key={t.name} onClick={() => updateShop({ themeColor: t.color, fontStyle: t.font })} style={{ borderColor: on ? t.color : "rgba(255,255,255,0.1)", fontFamily: FONTS[t.font] }} className="text-left bg-neutral-800 rounded-2xl p-3 border-2 cursor-pointer text-white">
                        <div className="flex items-center gap-2"><span style={{ backgroundColor: t.color }} className="w-5 h-5 rounded-full shrink-0" /><span className="text-sm font-bold">{t.name}</span></div>
                        <div className="text-[11px] text-neutral-400 mt-1">{t.blurb}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className={card}>
                <h4 className={`${cardTitle} mb-2`}>Font</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(FONTS).map((f) => (
                    <button key={f} onClick={() => updateCurrentShop("fontStyle", f)} style={{ fontFamily: FONTS[f], backgroundColor: currentShop.fontStyle === f ? color : "#262626" }} className={`${btn} px-3.5 py-2`}>{f}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeAdminTab === "contact" && (
            <div className="grid gap-3">
              <div className={`${card} grid gap-2`}>
                <h4 className={cardTitle}>Shop info</h4>
                {shopField("Cookshop name", "name")}
                {shopField("Tagline", "tagline")}
                {shopField("Address", "address")}
                {shopField("Google Maps link", "mapLink")}
              </div>
              <div className={`${card} grid gap-2`}>
                <h4 className={cardTitle}>Orders & social links</h4>
                {shopField("📱 WhatsApp number (orders go here)", "whatsapp", "18765551234")}
                {shopField("📸 Instagram", "instagram", "Link or @handle")}
                {shopField("🎵 TikTok", "tiktok", "Link or @handle")}
                {shopField("📘 Facebook", "facebook", "Link or page name")}
                <p className="text-[11px] text-neutral-400 m-0">Filled-in links show as buttons at the bottom of your menu.</p>
              </div>
              <div className={`${card} grid gap-2`}>
                <h4 className={cardTitle}>Security</h4>
                {shopField("Owner PIN", "adminPin")}
              </div>
            </div>
          )}

          {activeAdminTab === "devChat" && chatBox("admin")}
        </Modal>
      )}

      {/* lightbox */}
      {zoomedImage && (
        <div onClick={() => setZoomedImage(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[2000] p-4 cursor-pointer">
          <img src={zoomedImage} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
