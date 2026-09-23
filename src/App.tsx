import React, { useState, useEffect } from "react";

// --- TYPES & INTERFACES ---
interface Dish {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  inStock: boolean;
}

interface CartItem {
  dish: Dish;
  quantity: number;
  spiceLevel: string;
  gravyLevel: string;
  extraSauce: boolean;
  notes: string;
}

interface Order {
  id: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  tip: number;
  total: number;
  type: "delivery" | "pickup";
  address: string;
  deliveryTime: string;
  status: "Received" | "Preparing" | "Out for Delivery" | "Completed" | "Cancelled";
  date: string;
  timestamp: string;
}

interface ShopProfile {
  id: string;
  name: string;
  tagline: string;
  whatsapp: string;
  address: string;
  pin: string;
  themeColor: string;
  instagram: string;
  facebook: string;
  deliveryFee: number;
  isOpen: boolean;
  isDeliveryActive: boolean;
  deliveryZoneNote: string;
  operatingHours: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

// --- INITIAL DEFAULT SHOPS ---
const DEFAULT_SHOPS: ShopProfile[] = [
  {
    id: "shop1",
    name: "Mama's Yard Cookshop",
    tagline: "Authentic Jamaican Home-Style Flavours",
    whatsapp: "18765551234",
    address: "Hip Strip, Montego Bay, St. James",
    pin: "1234",
    themeColor: "#059669",
    instagram: "@mamas_yard_ja",
    facebook: "MamasYardCookshop",
    deliveryFee: 300,
    isOpen: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery within Montego Bay main town & Hip Strip.",
    operatingHours: "10:00 AM - 9:00 PM"
  },
  {
    id: "shop2",
    name: "Auntie's Ital Corner",
    tagline: "Fresh Natural Juices & Ital Stews",
    whatsapp: "18765555678",
    address: "Falmouth Main Road, Trelawny",
    pin: "5678",
    themeColor: "#d97706",
    instagram: "@aunties_ital",
    facebook: "AuntiesItalCorner",
    deliveryFee: 250,
    isOpen: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery available across Falmouth coastal strip.",
    operatingHours: "11:00 AM - 8:00 PM"
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
        { id: "d1", name: "Brown Stew Chicken", price: 1200, description: "Slow-braised chicken in rich savory spices with carrots and butter beans.", category: "Mains", image: "", inStock: true },
        { id: "d2", name: "Curry Goat & Rice", price: 1600, description: "Tender seasoned goat meat simmered with authentic Jamaican curry and potatoes.", category: "Mains", image: "", inStock: true },
        { id: "d3", name: "Ackee & Saltfish", price: 1400, description: "Classic national dish sautéed with onions, tomatoes, and scotch bonnet peppers.", category: "Breakfast", image: "", inStock: true },
        { id: "d4", name: "Fried Dumplings (4 Pack)", price: 400, description: "Golden, crispy traditional fried johnny cakes.", category: "Sides", image: "", inStock: true }
      ],
      shop2: [
        { id: "e1", name: "Ital Pumpkin Soup", price: 800, description: "Rich coconut milk base loaded with ground provisions, dumplings, and fresh herbs.", category: "Soups", image: "", inStock: true },
        { id: "e2", name: "Coconut Ital Stew", price: 1100, description: "Beans, plantains, and fresh greens stewed slowly in pure coconut cream.", category: "Mains", image: "", inStock: true }
      ]
    };
  });

  const [orders, setOrders] = useState<Record<string, Order[]>>(() => {
    const saved = localStorage.getItem("cookshop_all_orders");
    return saved ? JSON.parse(saved) : {};
  });

  // Cart & UI Modals
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [spiceLevel, setSpiceLevel] = useState("Medium");
  const [gravyLevel, setGravyLevel] = useState("Normal");
  const [extraSauce, setExtraSauce] = useState(false);
  const [itemNotes, setItemNotes] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [deliveryTime, setDeliveryTime] = useState("ASAP (30-45 mins)");
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [activeReceipt, setActiveReceipt] = useState<Order | null>(null);

  // Admin states
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [loggedInAdminShopId, setLoggedInAdminShopId] = useState<string | null>(null);
  const [isMasterSession, setIsMasterSession] = useState(false);

  // Master PIN & Recovery
  const [masterPin, setMasterPin] = useState(() => localStorage.getItem("cookshop_master_pin") || "9999");
  const [masterRecoveryPass, setMasterRecoveryPass] = useState(() => localStorage.getItem("cookshop_master_recovery") || "jamaica2026");
  const [newMasterPinInput, setNewMasterPinInput] = useState("");
  const [newMasterRecoveryInput, setNewMasterRecoveryInput] = useState("");
  const [currentMasterPassCheck, setCurrentMasterPassCheck] = useState("");

  const [masterSearchQuery, setMasterSearchQuery] = useState("");
  const [newShopName, setNewShopName] = useState("");
  const [newShopTagline, setNewShopTagline] = useState("");
  const [newShopWhatsapp, setNewShopWhatsapp] = useState("");
  const [newShopAddress, setNewShopAddress] = useState("");
  const [newShopPin, setNewShopPin] = useState("1234");

  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishNameInput, setDishNameInput] = useState("");
  const [dishPriceInput, setDishPriceInput] = useState("");
  const [dishDescInput, setDishDescInput] = useState("");
  const [dishCatInput, setDishCatInput] = useState("Mains");
  const [dishImageInput, setDishImageInput] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("cookshop_all_shops", JSON.stringify(shops));
      localStorage.setItem("cookshop_all_menus", JSON.stringify(menus));
      const prunedOrders: Record<string, Order[]> = {};
      Object.keys(orders).forEach(id => {
        prunedOrders[id] = (orders[id] || []).slice(0, 50);
      });
      localStorage.setItem("cookshop_all_orders", JSON.stringify(prunedOrders));
    } catch (err) {
      console.warn("Storage warning:", err);
    }
  }, [shops, menus, orders]);

  const handleImageCompression = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 500;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          callback(canvas.toDataURL("image/jpeg", 0.6));
        }
      };
      if (event.target?.result) img.src = event.target.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePinLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCustomerAddress(`https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`),
      () => alert("Unable to retrieve location. Please type manually."),
      { timeout: 10000 }
    );
  };

  const addToCart = (dish: Dish) => {
    setCart(prev => [...prev, { dish, quantity: 1, spiceLevel, gravyLevel, extraSauce, notes: itemNotes }]);
    setSelectedDish(null);
    setItemNotes("");
    setExtraSauce(false);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const currentShopMenu = menus[activeShop.id] || [];
  const currentShopOrders = orders[activeShop.id] || [];
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
      alert("Your plate is empty!");
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

    const orderLines = newOrder.items.map(i => `• ${i.quantity}x ${i.dish.name} ($${i.dish.price * i.quantity}) [Spice: ${i.spiceLevel}, Gravy: ${i.gravyLevel}${i.extraSauce ? ", +Extra Sauce" : ""}]`).join("\n");
    const appReturnUrl = `${window.location.origin}${window.location.pathname}?shop=${activeShop.id}`;
    
    const fullText = `*NEW ORDER: #${newOrder.id}*
*Shop:* ${activeShop.name}
*Customer:* ${customerName}
*Type:* ${orderType.toUpperCase()} (${deliveryTime})
*Location/Info:* ${newOrder.address}
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
      alert("Order receipt copied to clipboard! Paste into your IG or FB DM.");
    }
  };

  const handleAdminLogin = () => {
    if (adminPinInput === masterPin) {
      setIsMasterSession(true);
      setLoggedInAdminShopId(null);
      setAdminPinInput("");
      return;
    }
    const foundShop = shops.find(s => s.pin === adminPinInput);
    if (foundShop) {
      setIsMasterSession(false);
      setLoggedInAdminShopId(foundShop.id);
      setAdminPinInput("");
      return;
    }
    alert("Invalid PIN.");
  };

  const updateOrderStatus = (shopId: string, orderId: string, newStatus: Order["status"]) => {
    setOrders(prev => ({
      ...prev,
      [shopId]: (prev[shopId] || []).map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    }));
  };

  const saveEditedDish = () => {
    if (!loggedInAdminShopId) return;
    if (!dishNameInput || !dishPriceInput) {
      alert("Name and price required!");
      return;
    }
    const updatedDish: Dish = {
      id: editingDish ? editingDish.id : "dish_" + Date.now(),
      name: dishNameInput,
      price: parseFloat(dishPriceInput) || 0,
      description: dishDescInput,
      category: dishCatInput,
      image: dishImageInput || (editingDish ? editingDish.image : ""),
      inStock: editingDish ? editingDish.inStock : true
    };
    setMenus(prev => {
      const currentList = prev[loggedInAdminShopId] || [];
      const exists = currentList.some(d => d.id === updatedDish.id);
      return { ...prev, [loggedInAdminShopId]: exists ? currentList.map(d => d.id === updatedDish.id ? updatedDish : d) : [updatedDish, ...currentList] };
    });
    setEditingDish(null);
    setDishNameInput("");
    setDishPriceInput("");
    setDishDescInput("");
    setDishImageInput("");
  };

  const deleteDish = (dishId: string) => {
    if (!loggedInAdminShopId) return;
    if (window.confirm("Delete this dish?")) {
      setMenus(prev => ({ ...prev, [loggedInAdminShopId]: (prev[loggedInAdminShopId] || []).filter(d => d.id !== dishId) }));
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#121215", color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", paddingBottom: "120px" }}>
      {/* --- HEADER BAR --- */}
      <header style={{ backgroundColor: "#18181b", color: "#ffffff", borderBottom: `4px solid ${activeShop.themeColor}`, boxShadow: "0 4px 6px rgba(0,0,0,0.3)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: activeShop.isOpen ? "#10b981" : "#f43f5e", display: "inline-block" }}></span>
              <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, color: "#ffffff", letterSpacing: "-0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activeShop.name}</h1>
            </div>
            <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "2px 0 0 18px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activeShop.tagline} | Hours: {activeShop.operatingHours}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <select
              value={activeShopId}
              onChange={(e) => {
                setActiveShopId(e.target.value);
                window.history.pushState({}, "", `?shop=${e.target.value}`);
              }}
              style={{ backgroundColor: "#27272a", color: "#ffffff", fontSize: "12px", fontWeight: 600, padding: "8px 10px", borderRadius: "8px", border: "1px solid #3f3f46", outline: "none", cursor: "pointer" }}
            >
              {shops.map(s => (
                <option key={s.id} value={s.id} style={{ color: "#18181b" }}>
                  🏪 {s.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setAdminModalOpen(true)}
              style={{ backgroundColor: activeShop.themeColor, color: "#ffffff", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
            >
              🔐 Admin
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN BODY --- */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "16px" }}>
        {!activeShop.isOpen && (
          <div style={{ backgroundColor: "#7f1d1d", border: "1px solid #991b1b", color: "#fca5a5", padding: "12px", borderRadius: "10px", marginBottom: "16px", textAlign: "center", fontWeight: "bold", fontSize: "13px" }}>
            🔴 This cookshop is currently closed for new orders. Operating Hours: {activeShop.operatingHours}
          </div>
        )}

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#ffffff", margin: 0 }}>Today's Menu</h2>
            <span style={{ fontSize: "12px", backgroundColor: "#27272a", color: "#d4d4d8", padding: "4px 12px", borderRadius: "999px", fontWeight: 700, border: "1px solid #3f3f46" }}>
              {currentShopMenu.filter(d => d.inStock).length} Available Items
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {currentShopMenu.map(dish => (
              <div key={dish.id} style={{ backgroundColor: "#18181b", borderRadius: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", border: "1px solid #27272a", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ padding: "16px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  {dish.image ? (
                    <img 
                      src={dish.image} 
                      alt={dish.name} 
                      onClick={() => setZoomedImageUrl(dish.image)}
                      style={{ width: "84px", height: "84px", objectFit: "cover", borderRadius: "10px", border: "1px solid #3f3f46", backgroundColor: "#27272a", flexShrink: 0, cursor: "pointer" }} 
                      title="Tap to view photo"
                    />
                  ) : (
                    <div style={{ width: "84px", height: "84px", backgroundColor: "#27272a", borderRadius: "10px", border: "1px solid #3f3f46", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", flexShrink: 0 }}>
                      🍲
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 900, color: "#ffffff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dish.name}</h3>
                      <span style={{ fontSize: "14px", fontWeight: 900, color: "#34d399", whiteSpace: "nowrap" }}>${dish.price} JMD</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#a1a1aa", margin: "4px 0 8px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>{dish.description}</p>
                    <span style={{ fontSize: "10px", backgroundColor: "#27272a", color: "#d4d4d8", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, textTransform: "uppercase", border: "1px solid #3f3f46" }}>
                      {dish.category}
                    </span>
                  </div>
                </div>

                <div style={{ backgroundColor: "#121215", padding: "12px 16px", borderTop: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: dish.inStock ? "#34d399" : "#f87171" }}>
                    {dish.inStock ? "🟢 In Stock" : "🔴 Sold Out"}
                  </span>
                  {activeShop.isOpen && dish.inStock && (
                    <button
                      onClick={() => setSelectedDish(dish)}
                      style={{ backgroundColor: activeShop.themeColor, color: "#ffffff", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
                    >
                      + Add to Plate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- CART SECTION --- */}
        {cart.length > 0 && (
          <div style={{ backgroundColor: "#18181b", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.4)", border: "1px solid #27272a", padding: "20px", marginTop: "32px", marginBottom: "40px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff", margin: "0 0 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>🛒 Your Order Plate</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#a1a1aa" }}>{cart.length} items</span>
            </h3>

            <div style={{ borderTop: "1px solid #27272a", borderBottom: "1px solid #27272a", marginBottom: "16px" }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", borderBottom: idx < cart.length - 1 ? "1px solid #27272a" : "none" }}>
                  <div>
                    <span style={{ fontWeight: 800, color: "#ffffff" }}>{item.quantity}x {item.dish.name}</span>
                    <div style={{ fontSize: "11px", color: "#a1a1aa", marginTop: "2px" }}>Spice: {item.spiceLevel} | Gravy: {item.gravyLevel} {item.extraSauce ? "| +Extra Sauce" : ""}</div>
                    {item.notes && <div style={{ fontSize: "11px", fontStyle: "italic", color: "#a1a1aa" }}>Note: "{item.notes}"</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontWeight: 900, color: "#ffffff" }}>${item.dish.price * item.quantity} JMD</span>
                    <button onClick={() => removeFromCart(idx)} style={{ color: "#f87171", background: "none", border: "none", fontWeight: 900, fontSize: "16px", cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: "#121215", padding: "16px", borderRadius: "12px", border: "1px solid #27272a", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={() => setOrderType("delivery")}
                  style={{ flex: 1, padding: "10px", fontSize: "12px", fontWeight: 800, borderRadius: "8px", border: orderType === "delivery" ? "none" : "1px solid #3f3f46", backgroundColor: orderType === "delivery" ? activeShop.themeColor : "#18181b", color: "#ffffff", cursor: "pointer" }}
                >
                  🚚 Delivery (${activeShop.deliveryFee} JMD)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("pickup")}
                  style={{ flex: 1, padding: "10px", fontSize: "12px", fontWeight: 800, borderRadius: "8px", border: orderType === "pickup" ? "none" : "1px solid #3f3f46", backgroundColor: orderType === "pickup" ? activeShop.themeColor : "#18181b", color: "#ffffff", cursor: "pointer" }}
                >
                  🏪 Store Pickup
                </button>
              </div>

              {/* Delivery Time Options */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>⏱️ Timing</label>
                <select
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  style={{ width: "100%", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", outline: "none" }}
                >
                  <option value="ASAP (30-45 mins)">ASAP (30-45 mins)</option>
                  <option value="In 1 Hour">In 1 Hour</option>
                  <option value="Later Today (Evening)">Later Today (Evening)</option>
                </select>
              </div>

              {/* Optional Tip Box */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>💵 Add Tip for Driver / Cookshop</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[0, 100, 200, 500].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTipAmount(amt)}
                      style={{ flex: 1, padding: "6px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", border: tipAmount === amt ? "none" : "1px solid #3f3f46", backgroundColor: tipAmount === amt ? activeShop.themeColor : "#18181b", color: "#ffffff", cursor: "pointer" }}
                    >
                      {amt === 0 ? "No Tip" : `+$${amt}`}
                    </button>
                  ))}
                </div>
              </div>

              {orderType === "delivery" && activeShop.deliveryZoneNote && (
                <p style={{ fontSize: "11px", color: "#fcd34d", backgroundColor: "#451a03", padding: "10px", borderRadius: "8px", border: "1px solid #78350f", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                  ⚠️ <strong>Delivery Notice:</strong> {activeShop.deliveryZoneNote}
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>Your Name / Nickname *</label>
                  <input
                    type="text"
                    placeholder="e.g. Omarian"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ width: "100%", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                {orderType === "delivery" && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 800, color: "#d4d4d8" }}>Delivery Address / Landmark *</label>
                      <button
                        type="button"
                        onClick={handlePinLocation}
                        style={{ fontSize: "11px", fontWeight: 800, color: "#60a5fa", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        📍 Pin My GPS Location
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Near Hip Strip / Paste Google Maps link"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      style={{ width: "100%", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #27272a", paddingTop: "12px", marginBottom: "16px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#a1a1aa", marginBottom: "4px" }}>
                <span>Subtotal</span>
                <span>${cartSubtotal} JMD</span>
              </div>
              {orderType === "delivery" && activeShop.isDeliveryActive && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#a1a1aa", marginBottom: "4px" }}>
                  <span>Delivery Fee</span>
                  <span>${deliveryCost} JMD</span>
                </div>
              )}
              {tipAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#a1a1aa", marginBottom: "4px" }}>
                  <span>Tip</span>
                  <span>${tipAmount} JMD</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", color: "#ffffff", fontWeight: 900, fontSize: "16px", paddingTop: "8px", borderTop: "1px dashed #27272a" }}>
                <span>Total Due</span>
                <span>${cartTotal} JMD</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button
                onClick={() => dispatchOrder("whatsapp")}
                style={{ width: "100%", backgroundColor: "#059669", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "10px", fontSize: "13px", border: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
              >
                📲 Dispatch via WhatsApp
              </button>
              <button
                onClick={() => dispatchOrder("social")}
                style={{ width: "100%", backgroundColor: "#27272a", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "10px", fontSize: "13px", border: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.3)", border: "1px solid #3f3f46" }}
              >
                📋 Copy for IG / FB DM
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- IMAGE ZOOM MODAL --- */}
      {zoomedImageUrl && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={() => setZoomedImageUrl(null)}>
          <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoomedImageUrl(null)} style={{ position: "absolute", top: "-40px", right: "0", background: "none", border: "none", color: "#ffffff", fontSize: "24px", fontWeight: 900, cursor: "pointer" }}>✕ Close</button>
            <img src={zoomedImageUrl} alt="Full View" style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "12px", border: "2px solid #3f3f46", backgroundColor: "#000000" }} />
          </div>
        </div>
      )}

      {/* --- DISH CUSTOMIZER MODAL (WITH FIXED CONTRAST BUTTONS & EXTRA SAUCE) --- */}
      {selectedDish && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#18181b", color: "#ffffff", borderRadius: "16px", maxWidth: "400px", width: "100%", padding: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", border: "1px solid #27272a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff", margin: 0 }}>{selectedDish.name}</h3>
                <p style={{ color: "#34d399", fontWeight: 900, fontSize: "15px", margin: "2px 0 0 0" }}>${selectedDish.price} JMD</p>
              </div>
              <button onClick={() => setSelectedDish(null)} style={{ color: "#a1a1aa", background: "none", border: "none", fontWeight: 900, fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <p style={{ fontSize: "12px", color: "#a1a1aa", margin: "0 0 16px 0", lineHeight: "1.4" }}>{selectedDish.description}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#d4d4d8", marginBottom: "6px" }}>🌶️ Pepper / Spice Level</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {["No Pepper", "Medium", "Extra Scotch Bonnet"].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSpiceLevel(lvl)}
                      style={{ padding: "8px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", border: spiceLevel === lvl ? "none" : "1px solid #3f3f46", backgroundColor: spiceLevel === lvl ? activeShop.themeColor : "#27272a", color: "#ffffff", cursor: "pointer" }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#d4d4d8", marginBottom: "6px" }}>🍲 Gravy Preference</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {["No Gravy", "Normal", "Extra Drowned"].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setGravyLevel(lvl)}
                      style={{ padding: "8px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", border: gravyLevel === lvl ? "none" : "1px solid #3f3f46", backgroundColor: gravyLevel === lvl ? activeShop.themeColor : "#27272a", color: "#ffffff", cursor: "pointer" }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Sauce Add-on Toggle */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 800, color: "#d4d4d8", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={extraSauce}
                    onChange={(e) => setExtraSauce(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: activeShop.themeColor }}
                  />
                  <span>🫙 Add Extra Sauce on the Side</span>
                </label>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>Special Cooking Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Separate gravy, extra fork please"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setSelectedDish(null)} style={{ flex: 1, backgroundColor: "#27272a", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "8px", fontSize: "12px", border: "1px solid #3f3f46", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => addToCart(selectedDish)} style={{ flex: 1, backgroundColor: activeShop.themeColor, color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>Add (${selectedDish.price} JMD)</button>
            </div>
          </div>
        </div>
      )}

      {/* --- RECEIPT MODAL --- */}
      {activeReceipt && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#18181b", color: "#ffffff", borderRadius: "16px", maxWidth: "400px", width: "100%", padding: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", border: "1px solid #27272a" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "32px" }}>✅</span>
              <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff", margin: "4px 0 2px 0" }}>Order Dispatched!</h3>
              <p style={{ fontSize: "11px", color: "#a1a1aa", margin: 0 }}>Order ID: {activeReceipt.id} | {activeReceipt.date} at {activeReceipt.timestamp}</p>
            </div>

            <div style={{ backgroundColor: "#121215", padding: "12px", borderRadius: "10px", border: "1px solid #27272a", fontSize: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontWeight: 800 }}>Customer:</span><span>{activeReceipt.customerName}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontWeight: 800 }}>Fulfillment:</span><span style={{ textTransform: "capitalize" }}>{activeReceipt.type} ({activeReceipt.deliveryTime})</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 800 }}>Total:</span><span style={{ fontWeight: 900, color: "#34d399" }}>${activeReceipt.total} JMD</span></div>
            </div>

            <button onClick={() => setActiveReceipt(null)} style={{ width: "100%", backgroundColor: "#27272a", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "8px", fontSize: "12px", border: "1px solid #3f3f46", cursor: "pointer" }}>Close Window</button>
          </div>
        </div>
      )}

      {/* --- MASTER & SHOP ADMIN MODAL --- */}
      {adminModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
          <div style={{ backgroundColor: "#121215", color: "#ffffff", borderRadius: "16px", maxWidth: "620px", width: "100%", padding: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", border: "1px solid #27272a", margin: "32px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #27272a", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff", margin: 0 }}>
                {isMasterSession ? "👑 Master Developer Panel" : loggedInAdminShopId ? `🛠️ Admin Panel: ${shops.find(s => s.id === loggedInAdminShopId)?.name}` : "🔐 Enter Admin PIN"}
              </h3>
              <button onClick={() => { setAdminModalOpen(false); setLoggedInAdminShopId(null); setIsMasterSession(false); }} style={{ color: "#a1a1aa", background: "none", border: "none", fontWeight: 900, fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            {!isMasterSession && !loggedInAdminShopId && (
              <div style={{ padding: "20px 0", textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "#a1a1aa", marginBottom: "16px" }}>Enter your 4-digit shop PIN or Master PIN (9999).</p>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  style={{ width: "130px", textAlign: "center", letterSpacing: "8px", fontSize: "22px", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "10px", padding: "12px", margin: "0 auto 16px auto", outline: "none", fontFamily: "monospace", display: "block" }}
                />
                <button onClick={handleAdminLogin} style={{ backgroundColor: "#059669", color: "#ffffff", fontWeight: 800, padding: "12px 24px", borderRadius: "8px", fontSize: "13px", border: "none", cursor: "pointer" }}>Unlock Admin Access</button>
              </div>
            )}

            {isMasterSession && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#18181b", padding: "12px 16px", borderRadius: "10px", border: "1px solid #27272a" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#a1a1aa" }}>
                    <span>🔗</span>
                    <span style={{ fontFamily: "monospace" }}>{window.location.origin}?shop={activeShop.id}</span>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?shop=${activeShop.id}`); alert("Shop URL copied!"); }} style={{ backgroundColor: "#27272a", color: "#ffffff", fontWeight: 800, padding: "6px 12px", borderRadius: "6px", fontSize: "11px", border: "1px solid #3f3f46", cursor: "pointer" }}>Copy Link</button>
                </div>

                <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h4 style={{ fontWeight: 800, color: "#f59e0b", fontSize: "13px", margin: 0 }}>DEVELOPER & SHOP INFO EDITOR</h4>
                  
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#a1a1aa", marginBottom: "4px" }}>Active Shop PIN</label>
                    <input type="text" maxLength={4} value={activeShop.pin} onChange={(e) => setShops(prev => prev.map(s => s.id === activeShop.id ? { ...s, pin: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", fontFamily: "monospace", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#a1a1aa", marginBottom: "4px" }}>Shop Name</label>
                    <input type="text" value={activeShop.name} onChange={(e) => setShops(prev => prev.map(s => s.id === activeShop.id ? { ...s, name: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#a1a1aa", marginBottom: "4px" }}>Location / Address</label>
                    <input type="text" value={activeShop.address} onChange={(e) => setShops(prev => prev.map(s => s.id === activeShop.id ? { ...s, address: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", boxSizing: "border-box" }} />
                  </div>
                </div>

                <div style={{ textAlign: "right", paddingTop: "4px" }}>
                  <button onClick={() => { setIsMasterSession(false); setLoggedInAdminShopId(null); }} style={{ backgroundColor: "#3f3f46", color: "#ffffff", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer" }}>Logout</button>
                </div>
              </div>
            )}

            {/* SHOP OWNER ADMIN PANEL (INCLUDING CONTACT INFO & OPERATING HOURS) */}
            {loggedInAdminShopId && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {(() => {
                  const shop = shops.find(s => s.id === loggedInAdminShopId);
                  if (!shop) return null;
                  const shopUrl = `${window.location.origin}${window.location.pathname}?shop=${shop.id}`;
                  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shopUrl)}`;

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: 0 }}>Operational Status</h4>
                          <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "2px 0 0 0" }}>Toggle whether your shop is accepting orders.</p>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, isOpen: !s.isOpen } : s))} style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer", backgroundColor: shop.isOpen ? "#059669" : "#e11d48", color: "#ffffff" }}>{shop.isOpen ? "🟢 Shop Open" : "🔴 Shop Closed"}</button>
                          <button onClick={() => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, isDeliveryActive: !s.isDeliveryActive } : s))} style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer", backgroundColor: shop.isDeliveryActive ? "#2563eb" : "#71717a", color: "#ffffff" }}>{shop.isDeliveryActive ? "🚚 Delivery Active" : "🛑 Delivery Off"}</button>
                        </div>
                      </div>

                      {/* Contact Info & Operating Hours Editor */}
                      <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h4 style={{ fontWeight: 800, color: "#34d399", fontSize: "13px", margin: 0 }}>📞 Contact & Operating Hours Editor</h4>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#a1a1aa", marginBottom: "2px" }}>WhatsApp Number</label>
                          <input type="text" value={shop.whatsapp} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, whatsapp: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px", fontSize: "12px", boxSizing: "border-box" }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#a1a1aa", marginBottom: "2px" }}>Instagram Handle</label>
                            <input type="text" value={shop.instagram} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, instagram: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px", fontSize: "12px", boxSizing: "border-box" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#a1a1aa", marginBottom: "2px" }}>Operating Hours</label>
                            <input type="text" value={shop.operatingHours} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, operatingHours: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px", fontSize: "12px", boxSizing: "border-box" }} />
                          </div>
                        </div>
                      </div>

                      <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        <img src={qrCodeUrl} alt="QR Code" style={{ width: "90px", height: "90px", backgroundColor: "#ffffff", padding: "4px", borderRadius: "8px", border: "1px solid #3f3f46", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: "180px" }}>
                          <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: 0 }}>Counter QR & Direct URL</h4>
                          <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "2px 0 8px 0" }}>Print your QR code or copy your direct shop link.</p>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button onClick={() => { navigator.clipboard.writeText(shopUrl); alert("Direct shop URL copied!"); }} style={{ fontSize: "11px", fontWeight: 800, color: "#34d399", backgroundColor: "#064e3b", padding: "6px 10px", borderRadius: "6px", border: "1px solid #059669", cursor: "pointer" }}>📋 Copy Store URL</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ textAlign: "right", paddingTop: "4px" }}>
                  <button onClick={() => { setLoggedInAdminShopId(null); setAdminModalOpen(false); }} style={{ backgroundColor: "#3f3f46", color: "#ffffff", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer" }}>Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
