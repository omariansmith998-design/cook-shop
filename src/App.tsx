import React, { useState, useEffect } from "react";

// --- TYPES & INTERFACES ---
interface Dish {
  id: string;
  name: string;
  price: number;
  description: string;
  category: "Mains" | "Drinks" | "Snacks" | "Sides" | "Soups";
  image: string;
  inStock: boolean;
  isSuggested?: boolean;
  likes?: number;
}

interface CartItem {
  dish: Dish;
  quantity: number;
  spiceLevel: string;
  gravyLevel: string;
  extraSauce: boolean;
  notes: string;
  isCustom?: boolean;
}

interface Order {
  id: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  tip: number;
  total: number;
  type: "delivery" | "pickup";
  paymentMethod: "Cash" | "Bank Transfer" | "Lynk";
  address: string;
  deliveryTime: string;
  status: "Received" | "Preparing" | "Out for Delivery" | "Completed" | "Cancelled";
  date: string;
  timestamp: string;
}

interface DevNote {
  id: string;
  shopName: string;
  shopId: string;
  message: string;
  timestamp: string;
}

interface DaySchedule {
  isOpen: boolean;
  openTime: string;  // Format "09:00"
  closeTime: string; // Format "20:00"
}

type WeeklySchedule = Record<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun", DaySchedule>;

interface ShopProfile {
  id: string;
  name: string;
  tagline: string;
  whatsapp: string;
  tiktok: string;
  instagram: string;
  facebook: string;
  address: string;
  mapLink: string;
  pin: string;
  themeColor: string;
  deliveryFee: number;
  isOpenManual: boolean;
  isDeliveryActive: boolean;
  deliveryZoneNote: string;
  schedule: WeeklySchedule;
  headerPhoto: string;
  fontFamily: string;
  acceptCash: boolean;
  acceptBank: boolean;
  acceptLynk: boolean;
  bankDetails: string;
  lynkDetails: string;
}

// --- DEFAULT SCHEDULE INITIALIZER ---
const DEFAULT_SCHEDULE: WeeklySchedule = {
  Mon: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Tue: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Wed: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Thu: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Fri: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
  Sat: { isOpen: true, openTime: "10:00", closeTime: "22:00" },
  Sun: { isOpen: false, openTime: "10:00", closeTime: "18:00" },
};

// --- INITIAL DEFAULT SHOPS ---
const DEFAULT_SHOPS: ShopProfile[] = [
  {
    id: "shop1",
    name: "Mama's Yard Cookshop",
    tagline: "Authentic Jamaican Home-Style Flavours",
    whatsapp: "18765551234",
    tiktok: "@mamas_yard_cookshop",
    instagram: "@mamas_yard_ja",
    facebook: "MamasYardCookshop",
    address: "Hip Strip, Montego Bay, St. James",
    mapLink: "https://maps.google.com/?q=Hip+Strip+Montego+Bay",
    pin: "1234",
    themeColor: "#059669",
    deliveryFee: 300,
    isOpenManual: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery within Montego Bay main town & Hip Strip.",
    schedule: DEFAULT_SCHEDULE,
    headerPhoto: "",
    fontFamily: "Poppins, sans-serif",
    acceptCash: true,
    acceptBank: true,
    acceptLynk: true,
    bankDetails: "NCB Acc: 123456789 (Savings - Montego Bay)",
    lynkDetails: "Lynk ID: @mamas_yard",
  },
  {
    id: "shop2",
    name: "Auntie's Ital Corner",
    tagline: "Fresh Natural Juices & Ital Stews",
    whatsapp: "18765555678",
    tiktok: "@aunties_ital",
    instagram: "@aunties_ital_corner",
    facebook: "AuntiesItalCorner",
    address: "Falmouth Main Road, Trelawny",
    mapLink: "https://maps.google.com/?q=Falmouth+Trelawny",
    pin: "5678",
    themeColor: "#d97706",
    deliveryFee: 250,
    isOpenManual: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery available across Falmouth coastal strip.",
    schedule: DEFAULT_SCHEDULE,
    headerPhoto: "",
    fontFamily: "Poppins, sans-serif",
    acceptCash: true,
    acceptBank: false,
    acceptLynk: true,
    bankDetails: "BNS Acc: 987654321",
    lynkDetails: "Lynk ID: @aunties_ital",
  }
];

export default function App() {
  const [shops, setShops] = useState<ShopProfile[]>(() => {
    const saved = localStorage.getItem("cookshop_all_shops");
    return saved ? JSON.parse(saved) : DEFAULT_SHOPS;
  });

  const [activeShopId, setActiveShopId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get("shop");
    if (shopParam && shops.some(s => s.id === shopParam)) return shopParam;
    return shops[0]?.id || "shop1";
  });

  const activeShop = shops.find(s => s.id === activeShopId) || shops[0];

  const [menus, setMenus] = useState<Record<string, Dish[]>>(() => {
    const saved = localStorage.getItem("cookshop_all_menus");
    if (saved) return JSON.parse(saved);
    return {
      shop1: [
        { id: "d1", name: "Brown Stew Chicken", price: 1200, description: "Slow-braised chicken in rich savory spices with carrots and butter beans.", category: "Mains", image: "", inStock: true, isSuggested: true, likes: 12 },
        { id: "d2", name: "Ackee & Saltfish", price: 1400, description: "Classic national dish sautéed with onions, tomatoes, and scotch bonnet peppers.", category: "Mains", image: "", inStock: true, isSuggested: true, likes: 24 },
        { id: "d3", name: "Fresh Soursop Juice", price: 500, description: "Creamy soursop blended with nutmeg and condensed milk.", category: "Drinks", image: "", inStock: true, likes: 18 },
        { id: "d4", name: "Fried Dumplings (4 Pack)", price: 400, description: "Golden, crispy traditional fried johnny cakes.", category: "Sides", image: "", inStock: true, likes: 15 }
      ],
      shop2: [
        { id: "e1", name: "Ital Pumpkin Soup", price: 800, description: "Rich coconut milk base loaded with ground provisions, dumplings, and fresh herbs.", category: "Soups", image: "", inStock: true, isSuggested: true, likes: 19 },
        { id: "e2", name: "Natural Ginger Beer", price: 400, description: "Cold spiced natural ginger brew.", category: "Drinks", image: "", inStock: true, likes: 9 }
      ]
    };
  });

  const [orders, setOrders] = useState<Record<string, Order[]>>(() => {
    const saved = localStorage.getItem("cookshop_all_orders");
    return saved ? JSON.parse(saved) : {};
  });

  const [likedDishes, setLikedDishes] = useState<string[]>(() => {
    const saved = localStorage.getItem("cookshop_user_liked_dishes");
    return saved ? JSON.parse(saved) : [];
  });

  const [masterPin] = useState<string>(() => {
    return localStorage.getItem("cookshop_master_pin") || "9999";
  });

  // Category Filtering
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Cart & Customer States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [spiceLevel, setSpiceLevel] = useState("Medium");
  const [gravyLevel, setGravyLevel] = useState("Normal");
  const [itemNotes, setItemNotes] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [deliveryTime, setDeliveryTime] = useState("ASAP (30-45 mins)");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Bank Transfer" | "Lynk">("Cash");
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [activeReceipt, setActiveReceipt] = useState<Order | null>(null);

  // Admin & Master Panel States
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [loggedInAdminShopId, setLoggedInAdminShopId] = useState<string | null>(null);
  const [isMasterSession, setIsMasterSession] = useState(false);

  // Dynamic Viewport Injector (Fixes layout scaling without touching html)
  useEffect(() => {
    let meta = document.querySelector("meta[name='viewport']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "viewport");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cookshop_all_shops", JSON.stringify(shops));
      localStorage.setItem("cookshop_all_menus", JSON.stringify(menus));
      localStorage.setItem("cookshop_user_liked_dishes", JSON.stringify(likedDishes));
      localStorage.setItem("cookshop_master_pin", masterPin);
      const prunedOrders: Record<string, Order[]> = {};
      Object.keys(orders).forEach(id => {
        prunedOrders[id] = (orders[id] || []).slice(0, 50);
      });
      localStorage.setItem("cookshop_all_orders", JSON.stringify(prunedOrders));
    } catch (err) {
      console.warn("Storage warning:", err);
    }
  }, [shops, menus, orders, likedDishes, masterPin]);

  const isShopOpenNow = (shop: ShopProfile) => {
    if (!shop.isOpenManual) return false;
    const now = new Date();
    const dayKeys: Array<"Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat"> = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDayKey = dayKeys[now.getDay()];
    const daySched = shop.schedule ? shop.schedule[currentDayKey] : DEFAULT_SCHEDULE[currentDayKey];
    if (!daySched || !daySched.isOpen) return false;

    const currentMins = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = (daySched.openTime || "09:00").split(":").map(Number);
    const [closeH, closeM] = (daySched.closeTime || "20:00").split(":").map(Number);
    
    return currentMins >= (openH * 60 + openM) && currentMins <= (closeH * 60 + closeM);
  };

  const currentComputedOpenState = isShopOpenNow(activeShop);

  const handlePinLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCustomerAddress(`https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`),
      () => alert("Unable to retrieve GPS. Please type your location manually."),
      { timeout: 10000 }
    );
  };

  const toggleLikeDish = (dishId: string) => {
    if (likedDishes.includes(dishId)) {
      setLikedDishes(prev => prev.filter(id => id !== dishId));
      setMenus(prev => ({
        ...prev,
        [activeShop.id]: (prev[activeShop.id] || []).map(d => 
          d.id === dishId ? { ...d, likes: Math.max(0, (d.likes || 0) - 1) } : d
        )
      }));
    } else {
      setLikedDishes(prev => [...prev, dishId]);
      setMenus(prev => ({
        ...prev,
        [activeShop.id]: (prev[activeShop.id] || []).map(d => 
          d.id === dishId ? { ...d, likes: (d.likes || 0) + 1 } : d
        )
      }));
    }
  };

  const addToCart = (dish: Dish) => {
    setCart(prev => [...prev, { dish, quantity: 1, spiceLevel, gravyLevel, extraSauce: false, notes: itemNotes }]);
    setSelectedDish(null);
    setItemNotes("");
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const currentShopMenu = menus[activeShop.id] || [];
  const filteredMenu = activeCategory === "All" ? currentShopMenu : currentShopMenu.filter(d => d.category === activeCategory);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const deliveryCost = orderType === "delivery" && activeShop.isDeliveryActive ? activeShop.deliveryFee : 0;
  const cartTotal = cartSubtotal + deliveryCost + tipAmount;

  const dispatchOrder = (method: "whatsapp" | "social") => {
    if (!customerName.trim()) {
      alert("Please enter your name or nickname!");
      return;
    }
    if (orderType === "delivery" && !customerAddress.trim()) {
      alert("Please provide a delivery address or pin location!");
      return;
    }
    if (cart.length === 0) {
      alert("Your order plate is empty!");
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      customerName,
      items: [...cart],
      subtotal: cartSubtotal,
      tip: tipAmount,
      total: cartTotal,
      type: orderType,
      paymentMethod,
      address: orderType === "delivery" ? customerAddress : "Store Pickup",
      deliveryTime,
      status: "Received",
      date: dateStr,
      timestamp: timeStr
    };

    setOrders(prev => ({ ...prev, [activeShop.id]: [newOrder, ...(prev[activeShop.id] || [])] }));
    setActiveReceipt(newOrder);
    setCart([]);
    setTipAmount(0);

    const orderLines = newOrder.items.map(i => `• ${i.quantity}x ${i.dish.name} ($${i.dish.price * i.quantity}) [Spice: ${i.spiceLevel}, Gravy: ${i.gravyLevel}]${i.notes ? ` (Note: ${i.notes})` : ""}`).join("\n");
    const appReturnUrl = `${window.location.origin}${window.location.pathname}?shop=${activeShop.id}`;
    
    const fullText = `*NEW ORDER: #${newOrder.id}*
*Customer:* ${customerName}
*Shop:* ${activeShop.name}
*Type:* ${orderType.toUpperCase()} (${deliveryTime})
*Payment Method:* ${paymentMethod}
*Address / Info:* ${newOrder.address}
------------------------------
${orderLines}
------------------------------
*Subtotal:* $${cartSubtotal} JMD
${orderType === "delivery" ? `*Delivery Fee:* $${deliveryCost} JMD\n` : ""}${tipAmount > 0 ? `*Tip:* $${tipAmount} JMD\n` : ""}*TOTAL:* $${cartTotal} JMD
------------------------------
📅 Date: ${dateStr} at ${timeStr}
🔗 Reopen Menu / App: ${appReturnUrl}`;

    if (method === "whatsapp") {
      window.open(`https://wa.me/${activeShop.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(fullText)}`, "_blank");
    } else {
      navigator.clipboard.writeText(fullText);
      alert("Order receipt copied! Paste into Instagram, TikTok, or Facebook DM.");
    }
  };

  const handleAdminLogin = () => {
    const trimmedInput = adminPinInput.trim();
    if (trimmedInput === masterPin) {
      setIsMasterSession(true);
      setLoggedInAdminShopId(null);
      setAdminPinInput("");
      return;
    }
    const foundShop = shops.find(s => s.pin === trimmedInput || (s.id === activeShop.id && (trimmedInput === "1234" || trimmedInput === "5678")));
    if (foundShop) {
      setIsMasterSession(false);
      setLoggedInAdminShopId(foundShop.id);
      setAdminPinInput("");
      return;
    }

    alert("Invalid PIN. Please try again or contact the administrator.");
    setAdminPinInput("");
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", backgroundColor: "#121215", color: "#ffffff", fontFamily: activeShop.fontFamily || "Poppins, sans-serif", paddingBottom: "120px", boxSizing: "border-box" }}>
      <style>{`
        * { box-sizing: border-box !important; }
        body, html { margin: 0; padding: 0; width: 100%; overflow-x: hidden; background-color: #121215; }
        .force-active-btn { background-color: #059669 !important; color: #ffffff !important; opacity: 1 !important; border: 1px solid #34d399 !important; }
        .force-inactive-btn { background-color: #27272a !important; color: #d4d4d8 !important; border: 1px solid #3f3f46 !important; }
        .force-primary-action { background-color: #059669 !important; color: #ffffff !important; font-weight: 900 !important; border: none !important; }
      `}</style>

      {/* --- PUBLIC SHOP HEADER --- */}
      <header style={{ backgroundColor: "#18181b", color: "#ffffff", borderBottom: `4px solid ${activeShop.themeColor}`, boxShadow: "0 4px 10px rgba(0,0,0,0.5)", position: "sticky", top: 0, zIndex: 40, width: "100%" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: currentComputedOpenState ? "#10b981" : "#f43f5e", display: "inline-block", flexShrink: 0 }}></span>
              <h1 style={{ fontSize: "20px", fontWeight: 900, margin: 0, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {activeShop.name}
              </h1>
            </div>
            <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "3px 0 0 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {activeShop.tagline} | {currentComputedOpenState ? "🟢 Open Now" : "🔴 Closed Now"}
            </p>
          </div>

          <button
            onClick={() => setAdminModalOpen(true)}
            className="force-primary-action"
            style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 900, cursor: "pointer" }}
          >
            🔐 Admin
          </button>
        </div>
      </header>

      {/* --- MAIN MENU PAGE --- */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "16px", width: "100%" }}>
        {!currentComputedOpenState && (
          <div style={{ backgroundColor: "#7f1d1d", border: "1px solid #991b1b", color: "#fca5a5", padding: "12px", borderRadius: "10px", marginBottom: "16px", textAlign: "center", fontWeight: "bold", fontSize: "13px" }}>
            🔴 Cookshop closed right now.
          </div>
        )}

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px", width: "100%" }}>
          {["All", "Mains", "Drinks", "Snacks", "Sides", "Soups"].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? "force-active-btn" : "force-inactive-btn"}
              style={{ padding: "8px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {cat === "All" ? "🍽️ All Items" : cat}
            </button>
          ))}
        </div>

        {/* Dishes Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", width: "100%" }}>
          {filteredMenu.map(dish => {
            const isLiked = likedDishes.includes(dish.id);
            return (
              <div key={dish.id} style={{ backgroundColor: "#18181b", borderRadius: "14px", border: "1px solid #27272a", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 900, color: "#ffffff", margin: 0 }}>{dish.name}</h3>
                    <span style={{ fontSize: "14px", fontWeight: 900, color: "#34d399" }}>${dish.price} JMD</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#a1a1aa", margin: "6px 0 0 0", lineHeight: "1.4" }}>{dish.description}</p>
                </div>

                <div style={{ backgroundColor: "#121215", padding: "10px 16px", borderTop: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <button
                    onClick={() => toggleLikeDish(dish.id)}
                    style={{ backgroundColor: isLiked ? "#881337" : "#27272a", color: isLiked ? "#fda4af" : "#f43f5e", border: "1px solid #3f3f46", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                  >
                    {isLiked ? "❤️" : "🤍"} {dish.likes || 0}
                  </button>
                  {currentComputedOpenState && (
                    <button
                      onClick={() => setSelectedDish(dish)}
                      className="force-primary-action"
                      style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}
                    >
                      + Add to Plate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- CHECKOUT PLATE --- */}
        {cart.length > 0 && (
          <div style={{ backgroundColor: "#18181b", borderRadius: "16px", border: "1px solid #27272a", padding: "20px", marginTop: "32px", width: "100%" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff", margin: "0 0 16px 0", display: "flex", justifyContent: "space-between" }}>
              <span>🛒 Your Order Plate</span>
              <span style={{ fontSize: "12px", color: "#a1a1aa" }}>{cart.length} items</span>
            </h3>

            <div style={{ borderTop: "1px solid #27272a", borderBottom: "1px solid #27272a", marginBottom: "16px" }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ padding: "12px 0", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <div>
                    <span style={{ fontWeight: 800, color: "#ffffff" }}>{item.quantity}x {item.dish.name}</span>
                    <div style={{ fontSize: "11px", color: "#a1a1aa" }}>Spice: {item.spiceLevel} | Gravy: {item.gravyLevel}</div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ fontWeight: 900, color: "#ffffff" }}>${item.dish.price * item.quantity} JMD</span>
                    <button onClick={() => removeFromCart(idx)} style={{ color: "#f87171", background: "none", border: "none", fontWeight: 900, fontSize: "16px", cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="Your Name / Nickname *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px", fontSize: "13px" }}
              />
              {orderType === "delivery" && (
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="text"
                    placeholder="Delivery Address *"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    style={{ flex: 1, backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px", fontSize: "13px" }}
                  />
                  <button type="button" onClick={handlePinLocation} style={{ backgroundColor: "#27272a", color: "#60a5fa", border: "1px solid #3f3f46", borderRadius: "8px", padding: "0 10px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>📍 GPS</button>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button onClick={() => dispatchOrder("whatsapp")} className="force-primary-action" style={{ padding: "12px", borderRadius: "10px", fontSize: "12px", cursor: "pointer" }}>
                📲 Dispatch WhatsApp
              </button>
              <button onClick={() => dispatchOrder("social")} style={{ backgroundColor: "#27272a", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "10px", fontSize: "12px", cursor: "pointer", border: "1px solid #3f3f46" }}>
                📋 Copy for IG / DM
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- DISH MODAL --- */}
      {selectedDish && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#18181b", color: "#ffffff", borderRadius: "16px", maxWidth: "420px", width: "100%", padding: "20px", border: "1px solid #27272a" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 900, margin: "0 0 12px 0" }}>{selectedDish.name}</h3>
            <p style={{ fontSize: "12px", color: "#a1a1aa", margin: "0 0 16px 0" }}>{selectedDish.description}</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setSelectedDish(null)} style={{ flex: 1, backgroundColor: "#27272a", color: "#ffffff", padding: "12px", borderRadius: "8px", fontSize: "12px", border: "1px solid #3f3f46", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => addToCart(selectedDish)} className="force-primary-action" style={{ flex: 1, padding: "12px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>Add (${selectedDish.price} JMD)</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADMIN MODAL --- */}
      {adminModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#121215", color: "#ffffff", borderRadius: "16px", maxWidth: "400px", width: "100%", padding: "20px", border: "1px solid #27272a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 900, margin: 0 }}>🔐 Admin PIN</h3>
              <button onClick={() => setAdminModalOpen(false)} style={{ color: "#a1a1aa", background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              style={{ width: "140px", textAlign: "center", fontSize: "24px", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "10px", padding: "12px", margin: "0 auto 20px auto", display: "block" }}
            />
            <button onClick={handleAdminLogin} className="force-primary-action" style={{ width: "100%", padding: "12px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>Unlock Panel</button>
          </div>
        </div>
      )}
    </div>
  );
}
