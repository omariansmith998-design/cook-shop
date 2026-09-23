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
  notes: string;
}

interface Order {
  id: string;
  customerName: string;
  items: CartItem[];
  total: number;
  type: "delivery" | "pickup";
  address: string;
  status: "Received" | "Preparing" | "Out for Delivery" | "Completed" | "Cancelled";
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
  deliveryFee: number;
  isOpen: boolean;
  isDeliveryActive: boolean;
  deliveryZoneNote: string;
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
    deliveryFee: 300,
    isOpen: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery within Montego Bay main town & Hip Strip.",
  },
  {
    id: "shop2",
    name: "Auntie's Ital Corner",
    tagline: "Fresh Natural Juices & Ital Stews",
    whatsapp: "18765555678",
    address: "Falmouth Main Road, Trelawny",
    pin: "5678",
    themeColor: "#d97706",
    deliveryFee: 250,
    isOpen: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery available across Falmouth coastal strip.",
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
  const [spiceLevel, setSpiceLevel] = useState("Medium");
  const [gravyLevel, setGravyLevel] = useState("Normal");
  const [itemNotes, setItemNotes] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
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

  // Master Developer Panel Search Query for Orders
  const [masterSearchQuery, setMasterSearchQuery] = useState("");

  // New Shop Creator Form State
  const [newShopName, setNewShopName] = useState("");
  const [newShopTagline, setNewShopTagline] = useState("");
  const [newShopWhatsapp, setNewShopWhatsapp] = useState("");
  const [newShopAddress, setNewShopAddress] = useState("");
  const [newShopPin, setNewShopPin] = useState("1234");

  // Dish Editor Modal
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishNameInput, setDishNameInput] = useState("");
  const [dishPriceInput, setDishPriceInput] = useState("");
  const [dishDescInput, setDishDescInput] = useState("");
  const [dishCatInput, setDishCatInput] = useState("Mains");
  const [dishImageInput, setDishImageInput] = useState("");

  // Driver Status & Return Timer
  const [driverStatus, setDriverStatus] = useState<"ready" | "out">("ready");
  const [driverEta, setDriverEta] = useState<string>("");

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
    setCart(prev => [...prev, { dish, quantity: 1, spiceLevel, gravyLevel, notes: itemNotes }]);
    setSelectedDish(null);
    setItemNotes("");
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const currentShopMenu = menus[activeShop.id] || [];
  const currentShopOrders = orders[activeShop.id] || [];
  const cartSubtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const deliveryCost = orderType === "delivery" && activeShop.isDeliveryActive ? activeShop.deliveryFee : 0;
  const cartTotal = cartSubtotal + deliveryCost;

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

    const newOrder: Order = {
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      customerName,
      items: [...cart],
      total: cartTotal,
      type: orderType,
      address: orderType === "delivery" ? customerAddress : "Store Pickup",
      status: "Received",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setOrders(prev => ({ ...prev, [activeShop.id]: [newOrder, ...(prev[activeShop.id] || [])] }));
    setActiveReceipt(newOrder);
    setCart([]);

    const orderLines = newOrder.items.map(i => `• ${i.quantity}x ${i.dish.name} ($${i.dish.price * i.quantity}) [Spice: ${i.spiceLevel}, Gravy: ${i.gravyLevel}]`).join("\n");
    const appReturnUrl = `${window.location.origin}${window.location.pathname}?shop=${activeShop.id}`;
    
    const fullText = `*NEW ORDER: #${newOrder.id}*
*Shop:* ${activeShop.name}
*Customer:* ${customerName}
*Type:* ${orderType.toUpperCase()}
*Location/Info:* ${newOrder.address}
------------------------------
${orderLines}
------------------------------
*Subtotal:* $${cartSubtotal} JMD
${orderType === "delivery" ? `*Delivery Fee:* $${deliveryCost} JMD\n` : ""}*TOTAL:* $${cartTotal} JMD
------------------------------
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

  const createNewShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName || !newShopWhatsapp) {
      alert("Name and WhatsApp required!");
      return;
    }
    const shopId = "shop_" + Date.now();
    const newShop: ShopProfile = {
      id: shopId,
      name: newShopName,
      tagline: newShopTagline || "Fresh Jamaican Cuisine",
      whatsapp: newShopWhatsapp,
      address: newShopAddress || "Jamaica",
      pin: newShopPin || "1234",
      themeColor: "#059669",
      deliveryFee: 300,
      isOpen: true,
      isDeliveryActive: true,
      deliveryZoneNote: "Standard delivery radius applies."
    };
    setShopAndSwitch(newShop);
  };

  const setShopAndSwitch = (newShop: ShopProfile) => {
    setShops(prev => [...prev, newShop]);
    setMenus(prev => ({ ...prev, [newShop.id]: [] }));
    setActiveShopId(newShop.id);
    setNewShopName("");
    setNewShopTagline("");
    setNewShopWhatsapp("");
    setNewShopAddress("");
    alert(`Shop "${newShop.name}" created successfully!`);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f4f5", color: "#18181b", fontFamily: "system-ui, -apple-system, sans-serif", paddingBottom: "120px" }}>
      {/* --- HEADER BAR --- */}
      <header style={{ backgroundColor: "#18181b", color: "#ffffff", borderBottom: `4px solid ${activeShop.themeColor}`, boxShadow: "0 4px 6px rgba(0,0,0,0.1)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: activeShop.isOpen ? "#10b981" : "#f43f5e", display: "inline-block" }}></span>
              <h1 style={{ fontSize: "18px", fontWeight: 900, margin: 0, color: "#ffffff", letterSpacing: "-0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activeShop.name}</h1>
            </div>
            <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "2px 0 0 18px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activeShop.tagline}</p>
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
              style={{ backgroundColor: activeShop.themeColor, color: "#ffffff", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
            >
              🔐 Admin
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN BODY --- */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "16px" }}>
        {!activeShop.isOpen && (
          <div style={{ backgroundColor: "#ffe4e6", border: "1px solid #fda4af", color: "#881337", padding: "12px", borderRadius: "10px", marginBottom: "16px", textAlign: "center", fontWeight: "bold", fontSize: "13px" }}>
            🔴 This cookshop is currently closed for new orders. Check back later!
          </div>
        )}

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#18181b", margin: 0 }}>Today's Menu</h2>
            <span style={{ fontSize: "12px", backgroundColor: "#e4e4e7", color: "#27272a", padding: "4px 12px", borderRadius: "999px", fontWeight: 700 }}>
              {currentShopMenu.filter(d => d.inStock).length} Available Items
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {currentShopMenu.map(dish => (
              <div key={dish.id} style={{ backgroundColor: "#ffffff", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)", border: "1px solid #e4e4e7", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ padding: "16px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  {dish.image ? (
                    <img 
                      src={dish.image} 
                      alt={dish.name} 
                      style={{ width: "84px", height: "84px", objectFit: "cover", borderRadius: "10px", border: "1px solid #f4f4f5", backgroundColor: "#f4f4f5", flexShrink: 0 }} 
                    />
                  ) : (
                    <div style={{ width: "84px", height: "84px", backgroundColor: "#f4f4f5", borderRadius: "10px", border: "1px solid #e4e4e7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", flexShrink: 0 }}>
                      🍲
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 900, color: "#18181b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dish.name}</h3>
                      <span style={{ fontSize: "14px", fontWeight: 900, color: activeShop.themeColor, whiteSpace: "nowrap" }}>${dish.price} JMD</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#52525b", margin: "4px 0 8px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>{dish.description}</p>
                    <span style={{ fontSize: "10px", backgroundColor: "#f4f4f5", color: "#3f3f46", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                      {dish.category}
                    </span>
                  </div>
                </div>

                <div style={{ backgroundColor: "#fafafa", padding: "12px 16px", borderTop: "1px solid #f4f4f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: dish.inStock ? "#059669" : "#e11d48" }}>
                    {dish.inStock ? "🟢 In Stock" : "🔴 Sold Out"}
                  </span>
                  {activeShop.isOpen && dish.inStock && (
                    <button
                      onClick={() => setSelectedDish(dish)}
                      style={{ backgroundColor: activeShop.themeColor, color: "#ffffff", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
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
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", border: "1px solid #e4e4e7", padding: "20px", marginTop: "32px", marginBottom: "40px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#18181b", margin: "0 0 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>🛒 Your Order Plate</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#71717a" }}>{cart.length} items</span>
            </h3>

            <div style={{ borderTop: "1px solid #f4f4f5", borderBottom: "1px solid #f4f4f5", marginBottom: "16px" }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", borderBottom: idx < cart.length - 1 ? "1px solid #f4f4f5" : "none" }}>
                  <div>
                    <span style={{ fontWeight: 800, color: "#18181b" }}>{item.quantity}x {item.dish.name}</span>
                    <div style={{ fontSize: "11px", color: "#52525b", marginTop: "2px" }}>Spice: {item.spiceLevel} | Gravy: {item.gravyLevel}</div>
                    {item.notes && <div style={{ fontSize: "11px", fontStyle: "italic", color: "#71717a" }}>Note: "{item.notes}"</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontWeight: 900, color: "#18181b" }}>${item.dish.price * item.quantity} JMD</span>
                    <button onClick={() => removeFromCart(idx)} style={{ color: "#e11d48", background: "none", border: "none", fontWeight: 900, fontSize: "16px", cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: "#fafafa", padding: "16px", borderRadius: "12px", border: "1px solid #e4e4e7", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={() => setOrderType("delivery")}
                  style={{ flex: 1, padding: "10px", fontSize: "12px", fontWeight: 800, borderRadius: "8px", border: orderType === "delivery" ? "none" : "1px solid #d4d4d8", backgroundColor: orderType === "delivery" ? activeShop.themeColor : "#ffffff", color: orderType === "delivery" ? "#ffffff" : "#27272a", cursor: "pointer" }}
                >
                  🚚 Delivery (${activeShop.deliveryFee} JMD)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("pickup")}
                  style={{ flex: 1, padding: "10px", fontSize: "12px", fontWeight: 800, borderRadius: "8px", border: orderType === "pickup" ? "none" : "1px solid #d4d4d8", backgroundColor: orderType === "pickup" ? activeShop.themeColor : "#ffffff", color: orderType === "pickup" ? "#ffffff" : "#27272a", cursor: "pointer" }}
                >
                  🏪 Store Pickup
                </button>
              </div>

              {orderType === "delivery" && activeShop.deliveryZoneNote && (
                <p style={{ fontSize: "11px", color: "#92400e", backgroundColor: "#fef3c7", padding: "10px", borderRadius: "8px", border: "1px solid #fde68a", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                  ⚠️ <strong>Delivery Notice:</strong> {activeShop.deliveryZoneNote}
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#27272a", marginBottom: "4px" }}>Your Name / Nickname *</label>
                  <input
                    type="text"
                    placeholder="e.g. Omarian"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ width: "100%", backgroundColor: "#ffffff", color: "#18181b", border: "1px solid #d4d4d8", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                {orderType === "delivery" && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 800, color: "#27272a" }}>Delivery Address / Landmark *</label>
                      <button
                        type="button"
                        onClick={handlePinLocation}
                        style={{ fontSize: "11px", fontWeight: 800, color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        📍 Pin My GPS Location
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Near Hip Strip / Paste Google Maps link"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      style={{ width: "100%", backgroundColor: "#ffffff", color: "#18181b", border: "1px solid #d4d4d8", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e4e4e7", paddingTop: "12px", marginBottom: "16px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#52525b", marginBottom: "4px" }}>
                <span>Subtotal</span>
                <span>${cartSubtotal} JMD</span>
              </div>
              {orderType === "delivery" && activeShop.isDeliveryActive && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#52525b", marginBottom: "4px" }}>
                  <span>Delivery Fee</span>
                  <span>${deliveryCost} JMD</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", color: "#18181b", fontWeight: 900, fontSize: "16px", paddingTop: "8px", borderTop: "1px dashed #e4e4e7" }}>
                <span>Total Due</span>
                <span>${cartTotal} JMD</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button
                onClick={() => dispatchOrder("whatsapp")}
                style={{ width: "100%", backgroundColor: "#059669", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "10px", fontSize: "13px", border: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
              >
                📲 Dispatch via WhatsApp
              </button>
              <button
                onClick={() => dispatchOrder("social")}
                style={{ width: "100%", backgroundColor: "#18181b", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "10px", fontSize: "13px", border: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
              >
                📋 Copy for IG / FB DM
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- DISH CUSTOMIZER MODAL --- */}
      {selectedDish && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", maxWidth: "400px", width: "100%", padding: "20px", boxShadow: "0 20px 25px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#18181b", margin: 0 }}>{selectedDish.name}</h3>
                <p style={{ color: activeShop.themeColor, fontWeight: 900, fontSize: "15px", margin: "2px 0 0 0" }}>${selectedDish.price} JMD</p>
              </div>
              <button onClick={() => setSelectedDish(null)} style={{ color: "#71717a", background: "none", border: "none", fontWeight: 900, fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            <p style={{ fontSize: "12px", color: "#52525b", margin: "0 0 16px 0", lineHeight: "1.4" }}>{selectedDish.description}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#27272a", marginBottom: "6px" }}>🌶️ Pepper / Spice Level</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {["No Pepper", "Medium", "Extra Scotch Bonnet"].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSpiceLevel(lvl)}
                      style={{ padding: "8px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", border: spiceLevel === lvl ? "none" : "1px solid #d4d4d8", backgroundColor: spiceLevel === lvl ? activeShop.themeColor : "#f4f4f5", color: spiceLevel === lvl ? "#ffffff" : "#27272a", cursor: "pointer" }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#27272a", marginBottom: "6px" }}>🍲 Gravy Preference</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {["No Gravy", "Normal", "Extra Drowned"].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setGravyLevel(lvl)}
                      style={{ padding: "8px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", border: gravyLevel === lvl ? "none" : "1px solid #d4d4d8", backgroundColor: gravyLevel === lvl ? activeShop.themeColor : "#f4f4f5", color: gravyLevel === lvl ? "#ffffff" : "#27272a", cursor: "pointer" }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#27272a", marginBottom: "4px" }}>Special Cooking Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Separate gravy, extra fork please"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  style={{ width: "100%", backgroundColor: "#f4f4f5", border: "1px solid #d4d4d8", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setSelectedDish(null)}
                style={{ flex: 1, backgroundColor: "#e4e4e7", color: "#27272a", fontWeight: 800, padding: "12px", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => addToCart(selectedDish)}
                style={{ flex: 1, backgroundColor: activeShop.themeColor, color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" }}
              >
                Add (${selectedDish.price} JMD)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- RECEIPT & TRACKING MODAL --- */}
      {activeReceipt && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", maxWidth: "400px", width: "100%", padding: "20px", boxShadow: "0 20px 25px rgba(0,0,0,0.2)" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "32px" }}>✅</span>
              <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#18181b", margin: "4px 0 2px 0" }}>Order Dispatched!</h3>
              <p style={{ fontSize: "11px", color: "#71717a", margin: 0 }}>Order ID: {activeReceipt.id}</p>
            </div>

            <div style={{ backgroundColor: "#f4f4f5", padding: "12px", borderRadius: "10px", border: "1px solid #e4e4e7", fontSize: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontWeight: 800 }}>Customer:</span><span>{activeReceipt.customerName}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontWeight: 800 }}>Fulfillment:</span><span style={{ textTransform: "capitalize" }}>{activeReceipt.type}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 800 }}>Total:</span><span style={{ fontWeight: 900, color: "#059669" }}>${activeReceipt.total} JMD</span></div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", fontWeight: 800, color: "#27272a", marginBottom: "8px" }}>Need to make a change? Choose an option below:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                <button
                  onClick={() => {
                    alert("Acknowledged. Waiting for delivery time.");
                    setActiveReceipt(null);
                  }}
                  style={{ backgroundColor: "#f4f4f5", color: "#18181b", fontSize: "10px", fontWeight: 800, padding: "10px 4px", borderRadius: "6px", border: "1px solid #d4d4d8", cursor: "pointer", textAlign: "center" }}
                >
                  ⏱️ Wait
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(activeShop.id, activeReceipt.id, "Cancelled");
                    window.open(`https://wa.me/${activeShop.whatsapp.replace(/[^0-9]/g, "")}?text=Hi,%20I%20would%20like%20to%20switch%20my%20order%20%23${activeReceipt.id}%20to%20Store%20Pickup.`, "_blank");
                    setActiveReceipt(null);
                  }}
                  style={{ backgroundColor: "#fef3c7", color: "#92400e", fontSize: "10px", fontWeight: 800, padding: "10px 4px", borderRadius: "6px", border: "1px solid #fde68a", cursor: "pointer", textAlign: "center" }}
                >
                  🏪 Pickup
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(activeShop.id, activeReceipt.id, "Cancelled");
                    window.open(`https://wa.me/${activeShop.whatsapp.replace(/[^0-9]/g, "")}?text=Hi,%20I%20need%20to%20CANCEL%20my%20order%20%23${activeReceipt.id}.`, "_blank");
                    setActiveReceipt(null);
                  }}
                  style={{ backgroundColor: "#ffe4e6", color: "#881337", fontSize: "10px", fontWeight: 800, padding: "10px 4px", borderRadius: "6px", border: "1px solid #fda4af", cursor: "pointer", textAlign: "center" }}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveReceipt(null)}
              style={{ width: "100%", backgroundColor: "#18181b", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" }}
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* --- RESTORED MASTER DEVELOPER PANEL & ADMIN MODAL --- */}
      {adminModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
          <div style={{ backgroundColor: "#121215", color: "#ffffff", borderRadius: "16px", maxWidth: "620px", width: "100%", padding: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", border: "1px solid #27272a", margin: "32px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #27272a", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff", margin: 0 }}>
                {isMasterSession ? "👑 Master Developer Panel" : loggedInAdminShopId ? `🛠️ Admin Panel: ${shops.find(s => s.id === loggedInAdminShopId)?.name}` : "🔐 Enter Admin PIN"}
              </h3>
              <button onClick={() => { setAdminModalOpen(false); setLoggedInAdminShopId(null); setIsMasterSession(false); }} style={{ color: "#a1a1aa", background: "none", border: "none", fontWeight: 900, fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            {!isMasterSession && !loggedInAdminShopId && (
              <div style={{ padding: "20px 0", textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "#a1a1aa", marginBottom: "16px" }}>Enter your 4-digit shop PIN or Master PIN ($9999$).</p>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  style={{ width: "130px", textAlign: "center", letterSpacing: "8px", fontSize: "22px", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "10px", padding: "12px", margin: "0 auto 16px auto", outline: "none", fontFamily: "monospace", display: "block" }}
                />
                <button
                  onClick={handleAdminLogin}
                  style={{ backgroundColor: "#059669", color: "#ffffff", fontWeight: 800, padding: "12px 24px", borderRadius: "8px", fontSize: "13px", border: "none", cursor: "pointer" }}
                >
                  Unlock Admin Access
                </button>
              </div>
            )}

            {/* --- RESTORED EXACT MASTER DEVELOPER PORTAL LAYOUT --- */}
            {isMasterSession && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#18181b", padding: "12px 16px", borderRadius: "10px", border: "1px solid #27272a" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#a1a1aa" }}>
                    <span>🔗</span>
                    <span style={{ fontFamily: "monospace" }}>{window.location.origin}?shop={activeShop.id}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}?shop=${activeShop.id}`);
                      alert("Shop URL copied!");
                    }}
                    style={{ backgroundColor: "#27272a", color: "#ffffff", fontWeight: 800, padding: "6px 12px", borderRadius: "6px", fontSize: "11px", border: "none", cursor: "pointer" }}
                  >
                    Copy Link
                  </button>
                </div>

                {/* Developer & Shop Info Editor Box */}
                <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h4 style={{ fontWeight: 800, color: "#f59e0b", fontSize: "13px", margin: 0 }}>DEVELOPER & SHOP INFO EDITOR</h4>
                  
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#a1a1aa", marginBottom: "4px" }}>Update Active Shop PIN (Operational PIN)</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={activeShop.pin}
                      onChange={(e) => {
                        const val = e.target.value;
                        setShops(prev => prev.map(s => s.id === activeShop.id ? { ...s, pin: val } : s));
                      }}
                      style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
                    />
                    <span style={{ fontSize: "10px", color: "#71717a", marginTop: "2px", display: "block" }}>This controls the 4-digit PIN the shop admins/cousins use to log in.</span>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#a1a1aa", marginBottom: "4px" }}>Edit Active Shop Name</label>
                    <input
                      type="text"
                      value={activeShop.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setShops(prev => prev.map(s => s.id === activeShop.id ? { ...s, name: val } : s));
                      }}
                      style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#a1a1aa", marginBottom: "4px" }}>Edit Active Shop Location / Address</label>
                    <input
                      type="text"
                      value={activeShop.address}
                      onChange={(e) => {
                        const val = e.target.value;
                        setShops(prev => prev.map(s => s.id === activeShop.id ? { ...s, address: val } : s));
                      }}
                      style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#a1a1aa", marginBottom: "4px" }}>Supabase Database URL</label>
                    <input
                      type="text"
                      placeholder="https://xxxxxx.supabase.co"
                      value={activeShop.supabaseUrl || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setShops(prev => prev.map(s => s.id === activeShop.id ? { ...s, supabaseUrl: val } : s));
                      }}
                      style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#a1a1aa", marginBottom: "4px" }}>Supabase Anon Key</label>
                    <input
                      type="password"
                      placeholder="eyJhGciOi..."
                      value={activeShop.supabaseKey || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setShops(prev => prev.map(s => s.id === activeShop.id ? { ...s, supabaseKey: val } : s));
                      }}
                      style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm("Reset all shop state to default configuration?")) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    style={{ backgroundColor: "#991b1b", color: "#ffffff", fontWeight: 800, padding: "10px", borderRadius: "6px", fontSize: "12px", border: "none", cursor: "pointer", marginTop: "4px" }}
                  >
                    ⚠️ Reset State to Master Configuration
                  </button>
                </div>

                {/* Master Search Queue & Receipt History Bar */}
                <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a" }}>
                  <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: "0 0 8px 0" }}>Shop Operational Controls & Order Queue</h4>
                  <input
                    type="text"
                    placeholder="Search receipts by ID, dish, address..."
                    value={masterSearchQuery}
                    onChange={(e) => setMasterSearchQuery(e.target.value)}
                    style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px 10px", fontSize: "12px", outline: "none", boxSizing: "border-box", marginBottom: "10px" }}
                  />

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto" }}>
                    {currentShopOrders
                      .filter(o => o.id.toLowerCase().includes(masterSearchQuery.toLowerCase()) || o.customerName.toLowerCase().includes(masterSearchQuery.toLowerCase()))
                      .map(o => (
                        <div key={o.id} style={{ backgroundColor: "#121215", padding: "8px 10px", borderRadius: "6px", border: "1px solid #27272a", fontSize: "11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>#{o.id} - {o.customerName} (${o.total})</span>
                          <span style={{ color: "#10b981", fontWeight: 800 }}>{o.status}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div style={{ textAlign: "right", paddingTop: "4px" }}>
                  <button onClick={() => { setIsMasterSession(false); setLoggedInAdminShopId(null); }} style={{ backgroundColor: "#3f3f46", color: "#ffffff", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer" }}>
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* SHOP OWNER ADMIN PANEL */}
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
                          <button
                            onClick={() => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, isOpen: !s.isOpen } : s))}
                            style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer", backgroundColor: shop.isOpen ? "#059669" : "#e11d48", color: "#ffffff" }}
                          >
                            {shop.isOpen ? "🟢 Shop Open" : "🔴 Shop Closed"}
                          </button>
                          <button
                            onClick={() => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, isDeliveryActive: !s.isDeliveryActive } : s))}
                            style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer", backgroundColor: shop.isDeliveryActive ? "#2563eb" : "#71717a", color: "#ffffff" }}
                          >
                            {shop.isDeliveryActive ? "🚚 Delivery Active" : "🛑 Delivery Off"}
                          </button>
                        </div>
                      </div>

                      {/* QR Code & Copy Direct URL Section */}
                      <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        <img src={qrCodeUrl} alt="QR Code" style={{ width: "90px", height: "90px", backgroundColor: "#ffffff", padding: "4px", borderRadius: "8px", border: "1px solid #3f3f46", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: "180px" }}>
                          <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: 0 }}>Counter QR & Direct URL</h4>
                          <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "2px 0 8px 0" }}>Print your QR code or copy your direct shop link to share on WhatsApp & IG.</p>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <a href={qrCodeUrl} target="_blank" rel="noreferrer" style={{ fontSize: "11px", fontWeight: 800, color: "#60a5fa", textDecoration: "none", padding: "6px 10px", backgroundColor: "#1e3a8a", borderRadius: "6px", border: "1px solid #3b82f6" }}>
                              📥 Download QR
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(shopUrl);
                                alert("Direct shop URL copied to clipboard!");
                              }}
                              style={{ fontSize: "11px", fontWeight: 800, color: "#34d399", backgroundColor: "#064e3b", padding: "6px 10px", borderRadius: "6px", border: "1px solid #059669", cursor: "pointer" }}
                            >
                              📋 Copy Store URL
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: 0 }}>🍽️ Menu Management</h4>
                    <button
                      onClick={() => {
                        setEditingDish({ id: "", name: "", price: 0, description: "", category: "Mains", image: "", inStock: true });
                        setDishNameInput("");
                        setDishPriceInput("");
                        setDishDescInput("");
                        setDishImageInput("");
                      }}
                      style={{ backgroundColor: "#059669", color: "#ffffff", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer" }}
                    >
                      + Add New Dish
                    </button>
                  </div>

                  {editingDish !== null && (
                    <div style={{ backgroundColor: "#121215", padding: "14px", borderRadius: "10px", border: "1px solid #3f3f46", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <h5 style={{ fontWeight: 800, fontSize: "12px", color: "#ffffff", margin: 0 }}>{editingDish.id ? "Edit Dish" : "Create New Dish"}</h5>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <input
                          type="text"
                          placeholder="Dish Name"
                          value={dishNameInput}
                          onChange={(e) => setDishNameInput(e.target.value)}
                          style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px 10px", fontSize: "12px", outline: "none" }}
                        />
                        <input
                          type="number"
                          placeholder="Price ($ JMD)"
                          value={dishPriceInput}
                          onChange={(e) => setDishPriceInput(e.target.value)}
                          style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px 10px", fontSize: "12px", outline: "none" }}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Description"
                        value={dishDescInput}
                        onChange={(e) => setDishDescInput(e.target.value)}
                        style={{ width: "100%", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px 10px", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa" }}>Photo:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageCompression(e, (base64) => setDishImageInput(base64))}
                          style={{ fontSize: "11px", color: "#a1a1aa" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: "8px", paddingTop: "4px" }}>
                        <button onClick={saveEditedDish} style={{ backgroundColor: "#059669", color: "#ffffff", fontWeight: 800, padding: "8px 14px", borderRadius: "6px", fontSize: "12px", border: "none", cursor: "pointer" }}>Save Dish</button>
                        <button onClick={() => setEditingDish(null)} style={{ backgroundColor: "#3f3f46", color: "#ffffff", fontWeight: 800, padding: "8px 14px", borderRadius: "6px", fontSize: "12px", border: "none", cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
                    {(menus[loggedInAdminShopId] || []).map(dish => (
                      <div key={dish.id} style={{ backgroundColor: "#121215", padding: "10px 14px", borderRadius: "8px", border: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                        <div>
                          <span style={{ fontWeight: 800, color: "#ffffff" }}>{dish.name}</span> - <span style={{ fontWeight: 800, color: "#34d399" }}>${dish.price} JMD</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <button
                            onClick={() => {
                              setMenus(prev => ({
                                ...prev,
                                [loggedInAdminShopId]: (prev[loggedInAdminShopId] || []).map(d => d.id === dish.id ? { ...d, inStock: !d.inStock } : d)
                              }));
                            }}
                            style={{ padding: "4px 8px", borderRadius: "6px", fontWeight: 800, fontSize: "10px", border: "none", cursor: "pointer", backgroundColor: dish.inStock ? "#064e3b" : "#7f1d1d", color: dish.inStock ? "#34d399" : "#fca5a5" }}
                          >
                            {dish.inStock ? "In Stock" : "Sold Out"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingDish(dish);
                              setDishNameInput(dish.name);
                              setDishPriceInput(dish.price.toString());
                              setDishDescInput(dish.description);
                              setDishImageInput(dish.image);
                            }}
                            style={{ color: "#60a5fa", fontWeight: 800, background: "none", border: "none", cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button onClick={() => deleteDish(dish.id)} style={{ color: "#f87171", fontWeight: 800, background: "none", border: "none", cursor: "pointer" }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a" }}>
                  <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: "0 0 10px 0" }}>📋 Live Order Queue ({currentShopOrders.length})</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "220px", overflowY: "auto" }}>
                    {currentShopOrders.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "#a1a1aa", fontStyle: "italic", textAlign: "center", margin: "16px 0" }}>No active orders in queue.</p>
                    ) : (
                      currentShopOrders.map(order => (
                        <div key={order.id} style={{ backgroundColor: "#121215", padding: "12px", borderRadius: "8px", border: "1px solid #27272a", fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: 900, color: "#ffffff" }}>#{order.id} - {order.customerName}</span>
                            <span style={{ color: "#a1a1aa", fontSize: "11px" }}>{order.timestamp}</span>
                          </div>
                          <div style={{ color: "#d4d4d8" }}>
                            {order.items.map((it, idx) => (
                              <div key={idx}>• {it.quantity}x {it.dish.name} ({it.spiceLevel})</div>
                            ))}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid #27272a" }}>
                            <span style={{ fontWeight: 800, color: "#34d399" }}>${order.total} JMD ({order.type})</span>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(activeShop.id, order.id, e.target.value as Order["status"])}
                              style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: 800, outline: "none", cursor: "pointer" }}
                            >
                              <option value="Received">Received</option>
                              <option value="Preparing">Preparing 🍳</option>
                              <option value="Out for Delivery">Out for Delivery 🚚</option>
                              <option value="Completed">Completed ✅</option>
                              <option value="Cancelled">Cancelled ✕</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div style={{ textAlign: "right", paddingTop: "4px" }}>
                  <button onClick={() => { setLoggedInAdminShopId(null); setAdminModalOpen(false); }} style={{ backgroundColor: "#3f3f46", color: "#ffffff", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer" }}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
