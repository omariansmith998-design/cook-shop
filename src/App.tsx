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
  isOpen: boolean;
  isDeliveryActive: boolean;
  deliveryZoneNote: string;
  operatingHours: string;
  headerPhoto: string;
  fontFamily: string;
  acceptCash: boolean;
  acceptBank: boolean;
  acceptLynk: boolean;
  bankDetails: string;
  lynkDetails: string;
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
    tiktok: "@mamas_yard_cookshop",
    instagram: "@mamas_yard_ja",
    facebook: "MamasYardCookshop",
    address: "Hip Strip, Montego Bay, St. James",
    mapLink: "https://maps.google.com/?q=Hip+Strip+Montego+Bay",
    pin: "1234",
    themeColor: "#059669",
    deliveryFee: 300,
    isOpen: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery within Montego Bay main town & Hip Strip.",
    operatingHours: "10:00 AM - 9:00 PM",
    headerPhoto: "",
    fontFamily: "system-ui",
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
    isOpen: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery available across Falmouth coastal strip.",
    operatingHours: "11:00 AM - 8:00 PM",
    headerPhoto: "",
    fontFamily: "system-ui",
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
        { id: "d2", name: "Curry Goat & Rice", price: 1600, description: "Tender seasoned goat meat simmered with authentic Jamaican curry and potatoes.", category: "Mains", image: "", inStock: true, isSuggested: true, likes: 24 },
        { id: "d3", name: "Ackee & Saltfish", price: 1400, description: "Classic national dish sautéed with onions, tomatoes, and scotch bonnet peppers.", category: "Breakfast", image: "", inStock: true, likes: 8 },
        { id: "d4", name: "Fried Dumplings (4 Pack)", price: 400, description: "Golden, crispy traditional fried johnny cakes.", category: "Sides", image: "", inStock: true, likes: 15 }
      ],
      shop2: [
        { id: "e1", name: "Ital Pumpkin Soup", price: 800, description: "Rich coconut milk base loaded with ground provisions, dumplings, and fresh herbs.", category: "Soups", image: "", inStock: true, isSuggested: true, likes: 19 },
        { id: "e2", name: "Coconut Ital Stew", price: 1100, description: "Beans, plantains, and fresh greens stewed slowly in pure coconut cream.", category: "Mains", image: "", inStock: true, likes: 11 }
      ]
    };
  });

  const [orders, setOrders] = useState<Record<string, Order[]>>(() => {
    const saved = localStorage.getItem("cookshop_all_orders");
    return saved ? JSON.parse(saved) : {};
  });

  // Cart & Customer States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [spiceLevel, setSpiceLevel] = useState("Medium");
  const [gravyLevel, setGravyLevel] = useState("Normal");
  const [extraSauce, setExtraSauce] = useState(false);
  const [itemNotes, setItemNotes] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [deliveryTime, setDeliveryTime] = useState("ASAP (30-45 mins)");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Bank Transfer" | "Lynk">("Cash");
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [activeReceipt, setActiveReceipt] = useState<Order | null>(null);

  // Custom Dish State
  const [customDishModal, setCustomDishModal] = useState(false);
  const [customDishName, setCustomDishName] = useState("");
  const [customDishPrice, setCustomDishPrice] = useState("");
  const [customDishNotes, setCustomDishNotes] = useState("");

  // Admin & Master Panel States
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [loggedInAdminShopId, setLoggedInAdminShopId] = useState<string | null>(null);
  const [isMasterSession, setIsMasterSession] = useState(false);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState("");

  // Master Developer PIN
  const [masterPin] = useState("9999");
  const [masterSearchQuery, setMasterSearchQuery] = useState("");

  // Create Shop Fields
  const [newShopName, setNewShopName] = useState("");
  const [newShopTagline, setNewShopTagline] = useState("");
  const [newShopWhatsapp, setNewShopWhatsapp] = useState("");

  // Menu Management
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishNameInput, setDishNameInput] = useState("");
  const [dishPriceInput, setDishPriceInput] = useState("");
  const [dishDescInput, setDishDescInput] = useState("");
  const [dishCatInput, setDishCatInput] = useState("Mains");
  const [dishImageInput, setDishImageInput] = useState("");
  const [dishSuggestedInput, setDishSuggestedInput] = useState(false);

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
    setMenus(prev => ({
      ...prev,
      [activeShop.id]: (prev[activeShop.id] || []).map(d => 
        d.id === dishId ? { ...d, likes: (d.likes || 0) + 1 } : d
      )
    }));
  };

  const addToCart = (dish: Dish) => {
    setCart(prev => [...prev, { dish, quantity: 1, spiceLevel, gravyLevel, extraSauce, notes: itemNotes }]);
    setSelectedDish(null);
    setItemNotes("");
    setExtraSauce(false);
  };

  const addCustomDishToCart = () => {
    if (!customDishName || !customDishPrice) {
      alert("Please provide custom dish name and price");
      return;
    }
    const customDish: Dish = {
      id: "custom_" + Date.now(),
      name: `[Custom Request] ${customDishName}`,
      price: parseFloat(customDishPrice) || 0,
      description: customDishNotes,
      category: "Custom",
      image: "",
      inStock: true
    };
    setCart(prev => [...prev, { dish: customDish, quantity: 1, spiceLevel: "Standard", gravyLevel: "Standard", extraSauce: false, notes: customDishNotes, isCustom: true }]);
    setCustomDishModal(false);
    setCustomDishName("");
    setCustomDishPrice("");
    setCustomDishNotes("");
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

    const orderLines = newOrder.items.map(i => `• ${i.quantity}x ${i.dish.name} ($${i.dish.price * i.quantity}) [Spice: ${i.spiceLevel}, Gravy: ${i.gravyLevel}${i.extraSauce ? ", +Extra Sauce" : ""}]${i.notes ? ` (Note: ${i.notes})` : ""}`).join("\n");
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
    alert("Invalid PIN. Enter Master PIN (9999) or valid shop PIN.");
  };

  const updateOrderStatus = (shopId: string, orderId: string, newStatus: Order["status"]) => {
    setOrders(prev => ({
      ...prev,
      [shopId]: (prev[shopId] || []).map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    }));
  };

  const createInstantShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName || !newShopWhatsapp) {
      alert("Shop Name and WhatsApp required!");
      return;
    }
    const shopId = "shop_" + Date.now();
    const created: ShopProfile = {
      id: shopId,
      name: newShopName,
      tagline: newShopTagline || "Fresh Home Cooked Meals",
      whatsapp: newShopWhatsapp,
      tiktok: "",
      instagram: "",
      facebook: "",
      address: "Jamaica",
      mapLink: "",
      pin: "1234",
      themeColor: "#059669",
      deliveryFee: 300,
      isOpen: true,
      isDeliveryActive: true,
      deliveryZoneNote: "Local delivery zone applies.",
      operatingHours: "10:00 AM - 8:00 PM",
      headerPhoto: "",
      fontFamily: "system-ui",
      acceptCash: true,
      acceptBank: true,
      acceptLynk: true,
      bankDetails: "Bank details upon request",
      lynkDetails: "Lynk details upon request",
    };
    setShops(prev => [...prev, created]);
    setMenus(prev => ({ ...prev, [created.id]: [] }));
    setActiveShopId(created.id);
    setNewShopName("");
    setNewShopTagline("");
    setNewShopWhatsapp("");
    alert(`Cookshop "${created.name}" launched! Selected in "Visit Shops" dropdown.`);
  };

  const saveEditedDish = () => {
    if (!loggedInAdminShopId) return;
    if (!dishNameInput || !dishPriceInput) {
      alert("Dish Name and Price required!");
      return;
    }
    const updatedDish: Dish = {
      id: editingDish?.id ? editingDish.id : "dish_" + Date.now(),
      name: dishNameInput,
      price: parseFloat(dishPriceInput) || 0,
      description: dishDescInput,
      category: dishCatInput,
      image: dishImageInput || (editingDish ? editingDish.image : ""),
      inStock: editingDish ? editingDish.inStock : true,
      isSuggested: dishSuggestedInput,
      likes: editingDish?.likes || 0
    };
    setMenus(prev => {
      const currentList = prev[loggedInAdminShopId] || [];
      const exists = currentList.some(d => d.id === updatedDish.id);
      return { 
        ...prev, 
        [loggedInAdminShopId]: exists 
          ? currentList.map(d => d.id === updatedDish.id ? updatedDish : d) 
          : [updatedDish, ...currentList] 
      };
    });
    setEditingDish(null);
    setDishNameInput("");
    setDishPriceInput("");
    setDishDescInput("");
    setDishImageInput("");
    setDishSuggestedInput(false);
  };

  const deleteDish = (dishId: string) => {
    if (!loggedInAdminShopId) return;
    if (window.confirm("Delete this dish permanently?")) {
      setMenus(prev => ({ ...prev, [loggedInAdminShopId]: (prev[loggedInAdminShopId] || []).filter(d => d.id !== dishId) }));
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#121215", color: "#ffffff", fontFamily: activeShop.fontFamily || "system-ui, -apple-system, sans-serif", paddingBottom: "120px" }}>
      {/* --- PUBLIC SHOP HEADER (NO PUBLIC SWITCHER DROPDOWN) --- */}
      <header style={{ backgroundColor: "#18181b", color: "#ffffff", borderBottom: `4px solid ${activeShop.themeColor}`, boxShadow: "0 4px 10px rgba(0,0,0,0.5)", position: "sticky", top: 0, zIndex: 40 }}>
        {activeShop.headerPhoto && (
          <div style={{ width: "100%", height: "120px", overflow: "hidden", borderBottom: "1px solid #27272a" }}>
            <img src={activeShop.headerPhoto} alt="Header Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: activeShop.isOpen ? "#10b981" : "#f43f5e", display: "inline-block", flexShrink: 0 }}></span>
              <h1 style={{ fontSize: "20px", fontWeight: 900, margin: 0, color: "#ffffff", letterSpacing: "-0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {activeShop.name}
              </h1>
            </div>
            <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "3px 0 0 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {activeShop.tagline} | Hours: {activeShop.operatingHours}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {activeShop.mapLink && (
              <a href={activeShop.mapLink} target="_blank" rel="noreferrer" style={{ backgroundColor: "#27272a", color: "#60a5fa", padding: "8px 10px", borderRadius: "8px", fontSize: "12px", textDecoration: "none", fontWeight: 800, border: "1px solid #3f3f46" }}>
                📍 Pin
              </a>
            )}
            <button
              onClick={() => setAdminModalOpen(true)}
              style={{ backgroundColor: activeShop.themeColor, color: "#ffffff", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 900, border: "none", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
            >
              🔐 Admin
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN MENU PAGE --- */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "16px" }}>
        {!activeShop.isOpen && (
          <div style={{ backgroundColor: "#7f1d1d", border: "1px solid #991b1b", color: "#fca5a5", padding: "12px", borderRadius: "10px", marginBottom: "16px", textAlign: "center", fontWeight: "bold", fontSize: "13px" }}>
            🔴 Cookshop closed for new orders right now. Operating Hours: {activeShop.operatingHours}
          </div>
        )}

        {/* Menu Top Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "19px", fontWeight: 900, color: "#ffffff", margin: 0 }}>Today's Menu</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setCustomDishModal(true)}
              style={{ backgroundColor: "#27272a", color: "#34d399", padding: "6px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, border: "1px solid #059669", cursor: "pointer" }}
            >
              ➕ Custom Dish
            </button>
            <span style={{ fontSize: "11px", backgroundColor: "#27272a", color: "#d4d4d8", padding: "6px 12px", borderRadius: "999px", fontWeight: 700, border: "1px solid #3f3f46" }}>
              {currentShopMenu.filter(d => d.inStock).length} Available
            </span>
          </div>
        </div>

        {/* Dishes Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          {currentShopMenu.map(dish => (
            <div key={dish.id} style={{ backgroundColor: "#18181b", borderRadius: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.4)", border: dish.isSuggested ? "2px solid #f59e0b" : "1px solid #27272a", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ padding: "16px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                {dish.image ? (
                  <img 
                    src={dish.image} 
                    alt={dish.name} 
                    onClick={() => setZoomedImageUrl(dish.image)}
                    style={{ width: "84px", height: "84px", objectFit: "cover", borderRadius: "10px", border: "1px solid #3f3f46", backgroundColor: "#27272a", flexShrink: 0, cursor: "pointer" }} 
                    title="Tap to zoom photo"
                  />
                ) : (
                  <div style={{ width: "84px", height: "84px", backgroundColor: "#27272a", borderRadius: "10px", border: "1px solid #3f3f46", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", flexShrink: 0 }}>
                    🍲
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 900, color: "#ffffff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {dish.name}
                    </h3>
                    <span style={{ fontSize: "14px", fontWeight: 900, color: "#34d399", whiteSpace: "nowrap" }}>${dish.price} JMD</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#a1a1aa", margin: "4px 0 8px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>
                    {dish.description}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "10px", backgroundColor: "#27272a", color: "#d4d4d8", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, border: "1px solid #3f3f46" }}>
                      {dish.category}
                    </span>
                    {dish.isSuggested && (
                      <span style={{ fontSize: "10px", backgroundColor: "#78350f", color: "#fcd34d", padding: "2px 8px", borderRadius: "4px", fontWeight: 800, border: "1px solid #f59e0b" }}>
                        ⭐ Chef's Special
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: "#121215", padding: "10px 16px", borderTop: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: dish.inStock ? "#34d399" : "#f87171" }}>
                    {dish.inStock ? "🟢 In Stock" : "🔴 Sold Out"}
                  </span>
                  <button
                    onClick={() => toggleLikeDish(dish.id)}
                    style={{ backgroundColor: "#27272a", color: "#f43f5e", border: "1px solid #3f3f46", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                  >
                    ❤️ {dish.likes || 0}
                  </button>
                </div>
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

        {/* --- CUSTOMER ORDER PLATE & CHECKOUT --- */}
        {cart.length > 0 && (
          <div style={{ backgroundColor: "#18181b", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", border: "1px solid #27272a", padding: "20px", marginTop: "32px", marginBottom: "40px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff", margin: "0 0 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>🛒 Your Order Plate</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#a1a1aa" }}>{cart.length} items</span>
            </h3>

            <div style={{ borderTop: "1px solid #27272a", borderBottom: "1px solid #27272a", marginBottom: "16px" }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", borderBottom: idx < cart.length - 1 ? "1px solid #27272a" : "none" }}>
                  <div>
                    <span style={{ fontWeight: 800, color: "#ffffff" }}>{item.quantity}x {item.dish.name}</span>
                    <div style={{ fontSize: "11px", color: "#a1a1aa", marginTop: "2px" }}>
                      Spice: {item.spiceLevel} | Gravy: {item.gravyLevel} {item.extraSauce ? "| +Extra Sauce" : ""}
                    </div>
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
              {/* Delivery vs Pickup Toggle */}
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

              {/* Delivery Zone Notice */}
              {orderType === "delivery" && activeShop.deliveryZoneNote && (
                <p style={{ fontSize: "11px", color: "#fcd34d", backgroundColor: "#451a03", padding: "10px", borderRadius: "8px", border: "1px solid #78350f", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                  ⚠️ <strong>Delivery Zone Notice:</strong> {activeShop.deliveryZoneNote}
                </p>
              )}

              {/* Delivery Timing Options */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>⏱️ Delivery / Pickup Timing</label>
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

              {/* Payment Method Selector */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>💳 Select Payment Method</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {activeShop.acceptCash && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Cash")}
                      style={{ flex: 1, padding: "8px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", border: paymentMethod === "Cash" ? "none" : "1px solid #3f3f46", backgroundColor: paymentMethod === "Cash" ? activeShop.themeColor : "#18181b", color: "#ffffff", cursor: "pointer" }}
                    >
                      💵 Cash
                    </button>
                  )}
                  {activeShop.acceptBank && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Bank Transfer")}
                      style={{ flex: 1, padding: "8px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", border: paymentMethod === "Bank Transfer" ? "none" : "1px solid #3f3f46", backgroundColor: paymentMethod === "Bank Transfer" ? activeShop.themeColor : "#18181b", color: "#ffffff", cursor: "pointer" }}
                    >
                      🏦 Bank
                    </button>
                  )}
                  {activeShop.acceptLynk && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Lynk")}
                      style={{ flex: 1, padding: "8px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", border: paymentMethod === "Lynk" ? "none" : "1px solid #3f3f46", backgroundColor: paymentMethod === "Lynk" ? activeShop.themeColor : "#18181b", color: "#ffffff", cursor: "pointer" }}
                    >
                      📲 Lynk
                    </button>
                  )}
                </div>

                {/* Display Payment Account Instructions */}
                {paymentMethod === "Bank Transfer" && activeShop.bankDetails && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#60a5fa", backgroundColor: "#1e3a8a", padding: "8px 10px", borderRadius: "6px", border: "1px solid #3b82f6" }}>
                    🏦 <strong>Transfer Details:</strong> {activeShop.bankDetails}
                  </div>
                )}
                {paymentMethod === "Lynk" && activeShop.lynkDetails && (
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#34d399", backgroundColor: "#064e3b", padding: "8px 10px", borderRadius: "6px", border: "1px solid #059669" }}>
                    📲 <strong>Lynk Handle:</strong> {activeShop.lynkDetails}
                  </div>
                )}
              </div>

              {/* Driver Tip */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>💵 Driver / Cookshop Tip</label>
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

              {/* Customer Info */}
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
                      placeholder="e.g. Hip Strip / Paste Google Maps link"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      style={{ width: "100%", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Totals Breakdown */}
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
                📋 Copy for IG / TikTok DM
              </button>
            </div>
          </div>
        )}

        {/* --- FOOTER SOCIAL MEDIA & CONTACTS --- */}
        <footer style={{ borderTop: "1px solid #27272a", paddingTop: "24px", marginTop: "40px", textAlign: "center", color: "#a1a1aa", fontSize: "12px" }}>
          <p style={{ fontWeight: 800, color: "#ffffff", margin: "0 0 8px 0" }}>Connect with {activeShop.name}:</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            {activeShop.whatsapp && (
              <a href={`https://wa.me/${activeShop.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" style={{ color: "#34d399", textDecoration: "none", fontWeight: 700 }}>
                💬 WhatsApp
              </a>
            )}
            {activeShop.tiktok && (
              <span style={{ color: "#f43f5e", fontWeight: 700 }}>🎵 TikTok: {activeShop.tiktok}</span>
            )}
            {activeShop.instagram && (
              <span style={{ color: "#fb7185", fontWeight: 700 }}>📸 IG: {activeShop.instagram}</span>
            )}
            {activeShop.facebook && (
              <span style={{ color: "#60a5fa", fontWeight: 700 }}>📘 FB: {activeShop.facebook}</span>
            )}
          </div>
          <p style={{ fontSize: "11px", margin: 0 }}>📍 Address: {activeShop.address}</p>
        </footer>
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

      {/* --- DISH CUSTOMIZER MODAL --- */}
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

              {/* Extra Sauce Side Toggle */}
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

      {/* --- CUSTOM / OFF-MENU DISH MODAL --- */}
      {customDishModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#18181b", color: "#ffffff", borderRadius: "16px", maxWidth: "400px", width: "100%", padding: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", border: "1px solid #27272a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff", margin: 0 }}>➕ Request Off-Menu Dish</h3>
              <button onClick={() => setCustomDishModal(false)} style={{ color: "#a1a1aa", background: "none", border: "none", fontWeight: 900, fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "0 0 14px 0" }}>Request a custom item directly from the kitchen cook or chef.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>Dish Name / Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Seafood Soup / Fry Fish with Bammy"
                  value={customDishName}
                  onChange={(e) => setCustomDishName(e.target.value)}
                  style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>Agreed / Estimated Price ($ JMD) *</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={customDishPrice}
                  onChange={(e) => setCustomDishPrice(e.target.value)}
                  style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>Preparation / Special Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Extra pepper sauce on side"
                  value={customDishNotes}
                  onChange={(e) => setCustomDishNotes(e.target.value)}
                  style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "8px 10px", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button onClick={() => setCustomDishModal(false)} style={{ flex: 1, backgroundColor: "#27272a", color: "#ffffff", fontWeight: 800, padding: "10px", borderRadius: "8px", fontSize: "12px", border: "1px solid #3f3f46", cursor: "pointer" }}>Cancel</button>
              <button onClick={addCustomDishToCart} style={{ flex: 1, backgroundColor: "#059669", color: "#ffffff", fontWeight: 800, padding: "10px", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer" }}>Add Custom Item</button>
            </div>
          </div>
        </div>
      )}

      {/* --- RECEIPT & POST-ORDER ACTIONS MODAL --- */}
      {activeReceipt && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#18181b", color: "#ffffff", borderRadius: "16px", maxWidth: "420px", width: "100%", padding: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", border: "1px solid #27272a" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "32px" }}>✅</span>
              <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff", margin: "4px 0 2px 0" }}>Order Dispatched!</h3>
              <p style={{ fontSize: "11px", color: "#a1a1aa", margin: 0 }}>Order ID: {activeReceipt.id} | {activeReceipt.date} at {activeReceipt.timestamp}</p>
            </div>

            <div style={{ backgroundColor: "#121215", padding: "12px", borderRadius: "10px", border: "1px solid #27272a", fontSize: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontWeight: 800 }}>Customer Name:</span><span>{activeReceipt.customerName}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontWeight: 800 }}>Type:</span><span style={{ textTransform: "capitalize" }}>{activeReceipt.type} ({activeReceipt.deliveryTime})</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontWeight: 800 }}>Payment:</span><span>{activeReceipt.paymentMethod}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 800 }}>Total:</span><span style={{ fontWeight: 900, color: "#34d399" }}>${activeReceipt.total} JMD</span></div>
            </div>

            {/* Post-Order Wait Time Flexibility Actions */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "8px" }}>⏱️ Need to modify order due to wait time?</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  onClick={() => {
                    updateOrderStatus(activeShop.id, activeReceipt.id, "Cancelled");
                    window.open(`https://wa.me/${activeShop.whatsapp.replace(/[^0-9]/g, "")}?text=Hi,%20I%20need%20to%20SWITCH%20my%20order%20%23${activeReceipt.id}%20to%20Store%20Pickup%20instead%20of%20delivery.`, "_blank");
                    setActiveReceipt(null);
                  }}
                  style={{ backgroundColor: "#451a03", color: "#fcd34d", fontSize: "11px", fontWeight: 800, padding: "10px 4px", borderRadius: "8px", border: "1px solid #78350f", cursor: "pointer", textAlign: "center" }}
                >
                  🏪 Switch to Pickup
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(activeShop.id, activeReceipt.id, "Cancelled");
                    window.open(`https://wa.me/${activeShop.whatsapp.replace(/[^0-9]/g, "")}?text=Hi,%20I%20need%20to%20CANCEL%20my%20order%20%23${activeReceipt.id}%20due%20to%20the%20wait%20time.`, "_blank");
                    setActiveReceipt(null);
                  }}
                  style={{ backgroundColor: "#7f1d1d", color: "#fca5a5", fontSize: "11px", fontWeight: 800, padding: "10px 4px", borderRadius: "8px", border: "1px solid #991b1b", cursor: "pointer", textAlign: "center" }}
                >
                  ❌ Cancel Order
                </button>
              </div>
            </div>

            <button onClick={() => setActiveReceipt(null)} style={{ width: "100%", backgroundColor: "#27272a", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "8px", fontSize: "12px", border: "1px solid #3f3f46", cursor: "pointer" }}>Close Receipt</button>
          </div>
        </div>
      )}

      {/* --- MASTER & SHOP ADMIN MODAL --- */}
      {adminModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
          <div style={{ backgroundColor: "#121215", color: "#ffffff", borderRadius: "16px", maxWidth: "650px", width: "100%", padding: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", border: "1px solid #27272a", margin: "32px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #27272a", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff", margin: 0 }}>
                {isMasterSession ? "👑 Master Developer Panel" : loggedInAdminShopId ? `🛠️ Admin Panel: ${shops.find(s => s.id === loggedInAdminShopId)?.name}` : "🔐 Enter Admin PIN"}
              </h3>
              <button onClick={() => { setAdminModalOpen(false); setLoggedInAdminShopId(null); setIsMasterSession(false); }} style={{ color: "#a1a1aa", background: "none", border: "none", fontWeight: 900, fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>

            {/* PIN Login Screen */}
            {!isMasterSession && !loggedInAdminShopId && (
              <div style={{ padding: "20px 0", textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "#a1a1aa", marginBottom: "16px" }}>Enter 4-digit Shop PIN or Master PIN (9999).</p>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  style={{ width: "130px", textAlign: "center", letterSpacing: "8px", fontSize: "22px", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "10px", padding: "12px", margin: "0 auto 16px auto", outline: "none", fontFamily: "monospace", display: "block" }}
                />
                <button onClick={handleAdminLogin} style={{ backgroundColor: "#059669", color: "#ffffff", fontWeight: 800, padding: "12px 24px", borderRadius: "8px", fontSize: "13px", border: "none", cursor: "pointer" }}>Unlock Admin Panel</button>
              </div>
            )}

            {/* --- MASTER DEVELOPER PANEL (FULL POWERS & VISIT SHOPS DROPDOWN) --- */}
            {isMasterSession && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Visit Shops Selector Dropdown */}
                <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #f59e0b", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h4 style={{ fontWeight: 800, color: "#f59e0b", fontSize: "13px", margin: 0 }}>🏪 Visit Shops (Exclusive Master Switcher)</h4>
                    <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "2px 0 0 0" }}>Select which cookshop to actively manage or view.</p>
                  </div>
                  <select
                    value={activeShopId}
                    onChange={(e) => {
                      setActiveShopId(e.target.value);
                      window.history.pushState({}, "", `?shop=${e.target.value}`);
                    }}
                    style={{ backgroundColor: "#27272a", color: "#ffffff", fontSize: "12px", fontWeight: 700, padding: "8px 12px", borderRadius: "8px", border: "1px solid #3f3f46", outline: "none" }}
                  >
                    {shops.map(s => (
                      <option key={s.id} value={s.id} style={{ color: "#18181b" }}>
                        🏪 {s.name} (PIN: {s.pin})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Instant Shop Launcher */}
                <form onSubmit={createInstantShop} style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <h4 style={{ fontWeight: 800, color: "#34d399", fontSize: "13px", margin: 0 }}>🚀 1-Step Instant Shop Launcher</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <input type="text" placeholder="Shop Name *" value={newShopName} onChange={(e) => setNewShopName(e.target.value)} style={{ backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px", fontSize: "12px" }} />
                    <input type="text" placeholder="WhatsApp Number *" value={newShopWhatsapp} onChange={(e) => setNewShopWhatsapp(e.target.value)} style={{ backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px", fontSize: "12px" }} />
                  </div>
                  <input type="text" placeholder="Shop Tagline (e.g. Best O tails in Town)" value={newShopTagline} onChange={(e) => setNewShopTagline(e.target.value)} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px", fontSize: "12px", boxSizing: "border-box" }} />
                  <button type="submit" style={{ backgroundColor: "#059669", color: "#ffffff", fontWeight: 800, padding: "10px", borderRadius: "6px", fontSize: "12px", border: "none", cursor: "pointer" }}>
                    🚀 Launch New Shop Instantly
                  </button>
                </form>

                {/* Developer Info & Credentials Editor */}
                <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: 0 }}>Active Shop Operational Settings</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", color: "#a1a1aa" }}>Active Shop PIN</label>
                      <input type="text" maxLength={4} value={activeShop.pin} onChange={(e) => setShops(prev => prev.map(s => s.id === activeShop.id ? { ...s, pin: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "12px", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", color: "#a1a1aa" }}>Shop Name</label>
                      <input type="text" value={activeShop.name} onChange={(e) => setShops(prev => prev.map(s => s.id === activeShop.id ? { ...s, name: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "12px", boxSizing: "border-box" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10px", color: "#a1a1aa" }}>Supabase Database URL</label>
                    <input type="text" placeholder="https://xxxxxx.supabase.co" value={activeShop.supabaseUrl || ""} onChange={(e) => setShops(prev => prev.map(s => s.id === activeShop.id ? { ...s, supabaseUrl: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "12px", boxSizing: "border-box", fontFamily: "monospace" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", color: "#a1a1aa" }}>Supabase Anon Key</label>
                    <input type="password" placeholder="eyJhGciOi..." value={activeShop.supabaseKey || ""} onChange={(e) => setShops(prev => prev.map(s => s.id === activeShop.id ? { ...s, supabaseKey: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "12px", boxSizing: "border-box", fontFamily: "monospace" }} />
                  </div>

                  {/* Safe Reset Button with Double Confirmation */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("⚠️ WARNING: Are you sure you want to reset state?") && window.confirm("🚨 FINAL CONFIRMATION: Resetting will restore default shops and clear saved local updates. Proceed?")) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    style={{ backgroundColor: "#991b1b", color: "#ffffff", fontWeight: 800, padding: "10px", borderRadius: "6px", fontSize: "11px", border: "none", cursor: "pointer", marginTop: "4px" }}
                  >
                    ⚠️ Reset State to Master Configuration (Double Confirm Protected)
                  </button>
                </div>

                {/* Global Receipt Search Bar across all stores */}
                <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a" }}>
                  <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: "0 0 8px 0" }}>🔎 Global Order Queue & Master Receipt Search</h4>
                  <input
                    type="text"
                    placeholder="Search receipts by ID, customer name, dish, address..."
                    value={masterSearchQuery}
                    onChange={(e) => setMasterSearchQuery(e.target.value)}
                    style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px", fontSize: "12px", outline: "none", boxSizing: "border-box", marginBottom: "8px" }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto" }}>
                    {currentShopOrders
                      .filter(o => o.id.toLowerCase().includes(masterSearchQuery.toLowerCase()) || o.customerName.toLowerCase().includes(masterSearchQuery.toLowerCase()) || o.address.toLowerCase().includes(masterSearchQuery.toLowerCase()))
                      .map(o => (
                        <div key={o.id} style={{ backgroundColor: "#121215", padding: "8px 10px", borderRadius: "6px", border: "1px solid #27272a", fontSize: "11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>#{o.id} - {o.customerName} (${o.total})</span>
                          <span style={{ color: "#34d399", fontWeight: 800 }}>{o.status}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <button onClick={() => { setIsMasterSession(false); setLoggedInAdminShopId(null); }} style={{ backgroundColor: "#3f3f46", color: "#ffffff", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer" }}>Logout Master</button>
                </div>
              </div>
            )}

            {/* --- SHOP OWNER ADMIN PANEL --- */}
            {loggedInAdminShopId && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {(() => {
                  const shop = shops.find(s => s.id === loggedInAdminShopId);
                  if (!shop) return null;
                  const shopUrl = `${window.location.origin}${window.location.pathname}?shop=${shop.id}`;
                  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shopUrl)}`;

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {/* Operational Status Toggles */}
                      <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "12px", border: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: 0 }}>Operational Status</h4>
                          <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "2px 0 0 0" }}>Control whether your shop accepts orders.</p>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, isOpen: !s.isOpen } : s))} style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer", backgroundColor: shop.isOpen ? "#059669" : "#e11d48", color: "#ffffff" }}>{shop.isOpen ? "🟢 Open" : "🔴 Closed"}</button>
                          <button onClick={() => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, isDeliveryActive: !s.isDeliveryActive } : s))} style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer", backgroundColor: shop.isDeliveryActive ? "#2563eb" : "#71717a", color: "#ffffff" }}>{shop.isDeliveryActive ? "🚚 Delivery On" : "🛑 Delivery Off"}</button>
                        </div>
                      </div>

                      {/* Designated Socials & Contact Slots */}
                      <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "12px", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <h4 style={{ fontWeight: 800, color: "#34d399", fontSize: "13px", margin: 0 }}>📞 Contact Info & Designated Socials</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "10px", color: "#a1a1aa" }}>WhatsApp Number</label>
                            <input type="text" value={shop.whatsapp} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, whatsapp: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px", boxSizing: "border-box" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "10px", color: "#a1a1aa" }}>🎵 TikTok Handle</label>
                            <input type="text" placeholder="@handle" value={shop.tiktok} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, tiktok: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px", boxSizing: "border-box" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "10px", color: "#a1a1aa" }}>📸 Instagram Handle</label>
                            <input type="text" placeholder="@handle" value={shop.instagram} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, instagram: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px", boxSizing: "border-box" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "10px", color: "#a1a1aa" }}>📘 Facebook Page</label>
                            <input type="text" placeholder="Page Name" value={shop.facebook} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, facebook: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px", boxSizing: "border-box" }} />
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "10px", color: "#a1a1aa" }}>Operating Hours</label>
                            <input type="text" value={shop.operatingHours} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, operatingHours: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px", boxSizing: "border-box" }} />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "10px", color: "#a1a1aa" }}>📍 Google Maps Pin Link</label>
                            <input type="text" placeholder="https://maps.google.com/?q=..." value={shop.mapLink} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, mapLink: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px", boxSizing: "border-box" }} />
                          </div>
                        </div>
                      </div>

                      {/* Payment Method Options Toggles */}
                      <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "12px", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: 0 }}>💳 Payment Method Options & Details</h4>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <label style={{ fontSize: "11px", color: "#d4d4d8", display: "flex", alignItems: "center", gap: "4px" }}>
                            <input type="checkbox" checked={shop.acceptCash} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, acceptCash: e.target.checked } : s))} /> Cash
                          </label>
                          <label style={{ fontSize: "11px", color: "#d4d4d8", display: "flex", alignItems: "center", gap: "4px" }}>
                            <input type="checkbox" checked={shop.acceptBank} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, acceptBank: e.target.checked } : s))} /> Bank Transfer
                          </label>
                          <label style={{ fontSize: "11px", color: "#d4d4d8", display: "flex", alignItems: "center", gap: "4px" }}>
                            <input type="checkbox" checked={shop.acceptLynk} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, acceptLynk: e.target.checked } : s))} /> Lynk
                          </label>
                        </div>
                        {shop.acceptBank && (
                          <input type="text" placeholder="Bank Account Details" value={shop.bankDetails} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, bankDetails: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px", boxSizing: "border-box" }} />
                        )}
                        {shop.acceptLynk && (
                          <input type="text" placeholder="Lynk Handle / Details" value={shop.lynkDetails} onChange={(e) => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, lynkDetails: e.target.value } : s))} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px", boxSizing: "border-box" }} />
                        )}
                      </div>

                      {/* Counter QR & Link Copying */}
                      <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "12px", border: "1px solid #27272a", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                        <img src={qrCodeUrl} alt="QR Code" style={{ width: "80px", height: "80px", backgroundColor: "#ffffff", padding: "4px", borderRadius: "8px", border: "1px solid #3f3f46", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: "160px" }}>
                          <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: 0 }}>Counter QR & Store URL</h4>
                          <p style={{ fontSize: "10px", color: "#a1a1aa", margin: "2px 0 6px 0" }}>Share your store URL or print your counter QR.</p>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <a href={qrCodeUrl} target="_blank" rel="noreferrer" style={{ fontSize: "10px", fontWeight: 800, color: "#60a5fa", textDecoration: "none", padding: "6px 8px", backgroundColor: "#1e3a8a", borderRadius: "6px", border: "1px solid #3b82f6" }}>📥 Download QR</a>
                            <button onClick={() => { navigator.clipboard.writeText(shopUrl); alert("Store URL copied!"); }} style={{ fontSize: "10px", fontWeight: 800, color: "#34d399", backgroundColor: "#064e3b", padding: "6px 8px", borderRadius: "6px", border: "1px solid #059669", cursor: "pointer" }}>📋 Copy Store URL</button>
                          </div>
                        </div>
                      </div>

                      {/* Menu Management & Suggested Toggles */}
                      <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "12px", border: "1px solid #27272a" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: 0 }}>🍽️ Menu Management</h4>
                          <button onClick={() => { setEditingDish({ id: "", name: "", price: 0, description: "", category: "Mains", image: "", inStock: true }); setDishNameInput(""); setDishPriceInput(""); setDishDescInput(""); setDishImageInput(""); setDishSuggestedInput(false); }} style={{ backgroundColor: "#059669", color: "#ffffff", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, border: "none", cursor: "pointer" }}>+ Add Dish</button>
                        </div>

                        {editingDish !== null && (
                          <div style={{ backgroundColor: "#121215", padding: "12px", borderRadius: "8px", border: "1px solid #3f3f46", marginBottom: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <h5 style={{ fontWeight: 800, fontSize: "11px", color: "#ffffff", margin: 0 }}>{editingDish.id ? "Edit Dish" : "Create New Dish"}</h5>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                              <input type="text" placeholder="Dish Name" value={dishNameInput} onChange={(e) => setDishNameInput(e.target.value)} style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px" }} />
                              <input type="number" placeholder="Price ($ JMD)" value={dishPriceInput} onChange={(e) => setDishPriceInput(e.target.value)} style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px" }} />
                            </div>
                            <input type="text" placeholder="Description" value={dishDescInput} onChange={(e) => setDishDescInput(e.target.value)} style={{ width: "100%", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px", boxSizing: "border-box" }} />
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <label style={{ fontSize: "11px", color: "#d4d4d8", display: "flex", alignItems: "center", gap: "4px" }}>
                                <input type="checkbox" checked={dishSuggestedInput} onChange={(e) => setDishSuggestedInput(e.target.checked)} /> ⭐ Mark as Chef's Special / Suggested
                              </label>
                              <input type="file" accept="image/*" onChange={(e) => handleImageCompression(e, (base64) => setDishImageInput(base64))} style={{ fontSize: "10px", color: "#a1a1aa" }} />
                            </div>
                            <div style={{ display: "flex", gap: "6px", paddingTop: "4px" }}>
                              <button onClick={saveEditedDish} style={{ backgroundColor: "#059669", color: "#ffffff", fontWeight: 800, padding: "6px 12px", borderRadius: "6px", fontSize: "11px", border: "none", cursor: "pointer" }}>Save Dish</button>
                              <button onClick={() => setEditingDish(null)} style={{ backgroundColor: "#3f3f46", color: "#ffffff", fontWeight: 800, padding: "6px 12px", borderRadius: "6px", fontSize: "11px", border: "none", cursor: "pointer" }}>Cancel</button>
                            </div>
                          </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
                          {(menus[loggedInAdminShopId] || []).map(dish => (
                            <div key={dish.id} style={{ backgroundColor: "#121215", padding: "8px 10px", borderRadius: "6px", border: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
                              <span><strong style={{ color: "#ffffff" }}>{dish.name}</strong> (${dish.price}) {dish.isSuggested ? "⭐" : ""}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <button onClick={() => setMenus(prev => ({ ...prev, [loggedInAdminShopId]: (prev[loggedInAdminShopId] || []).map(d => d.id === dish.id ? { ...d, inStock: !d.inStock } : d) }))} style={{ padding: "3px 6px", borderRadius: "4px", fontWeight: 800, fontSize: "9px", border: "none", cursor: "pointer", backgroundColor: dish.inStock ? "#064e3b" : "#7f1d1d", color: dish.inStock ? "#34d399" : "#fca5a5" }}>{dish.inStock ? "In Stock" : "Sold Out"}</button>
                                <button onClick={() => { setEditingDish(dish); setDishNameInput(dish.name); setDishPriceInput(dish.price.toString()); setDishDescInput(dish.description); setDishImageInput(dish.image); setDishSuggestedInput(!!dish.isSuggested); }} style={{ color: "#60a5fa", fontWeight: 800, background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                                <button onClick={() => deleteDish(dish.id)} style={{ color: "#f87171", fontWeight: 800, background: "none", border: "none", cursor: "pointer" }}>Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Owner Receipt Lookup Bar & Live Order Queue */}
                      <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "12px", border: "1px solid #27272a" }}>
                        <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: "0 0 8px 0" }}>📋 Live Order Queue & Receipt Lookup</h4>
                        <input
                          type="text"
                          placeholder="Search receipts by Order ID, customer, dish..."
                          value={ownerSearchQuery}
                          onChange={(e) => setOwnerSearchQuery(e.target.value)}
                          style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px", fontSize: "11px", outline: "none", boxSizing: "border-box", marginBottom: "8px" }}
                        />

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
                          {currentShopOrders
                            .filter(o => o.id.toLowerCase().includes(ownerSearchQuery.toLowerCase()) || o.customerName.toLowerCase().includes(ownerSearchQuery.toLowerCase()))
                            .map(order => (
                              <div key={order.id} style={{ backgroundColor: "#121215", padding: "10px", borderRadius: "6px", border: "1px solid #27272a", fontSize: "11px", display: "flex", flexDirection: "column", gap: "4px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span style={{ fontWeight: 900, color: "#ffffff" }}>#{order.id} - {order.customerName}</span>
                                  <span style={{ color: "#a1a1aa" }}>{order.timestamp}</span>
                                </div>
                                <div style={{ color: "#d4d4d8" }}>
                                  {order.items.map((it, idx) => (
                                    <div key={idx}>• {it.quantity}x {it.dish.name} [{it.spiceLevel}, {it.gravyLevel}]</div>
                                  ))}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", borderTop: "1px solid #27272a" }}>
                                  <span style={{ fontWeight: 800, color: "#34d399" }}>${order.total} JMD ({order.type})</span>
                                  <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(activeShop.id, order.id, e.target.value as Order["status"])}
                                    style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "4px", padding: "2px 6px", fontSize: "10px", fontWeight: 800, outline: "none" }}
                                  >
                                    <option value="Received">Received</option>
                                    <option value="Preparing">Preparing 🍳</option>
                                    <option value="Out for Delivery">Out for Delivery 🚚</option>
                                    <option value="Completed">Completed ✅</option>
                                    <option value="Cancelled">Cancelled ✕</option>
                                  </select>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <button onClick={() => { setLoggedInAdminShopId(null); setAdminModalOpen(false); }} style={{ backgroundColor: "#3f3f46", color: "#ffffff", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer" }}>Logout Admin</button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
