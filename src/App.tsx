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
  supabaseUrl?: string;
  supabaseKey?: string;
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

  const [devNotes, setDevNotes] = useState<DevNote[]>(() => {
    const saved = localStorage.getItem("cookshop_dev_notes");
    return saved ? JSON.parse(saved) : [];
  });

  const [likedDishes, setLikedDishes] = useState<string[]>(() => {
    const saved = localStorage.getItem("cookshop_user_liked_dishes");
    return saved ? JSON.parse(saved) : [];
  });

  const [masterPin, setMasterPin] = useState<string>(() => {
    return localStorage.getItem("cookshop_master_pin") || "9999";
  });

  // Category Filtering
  const [activeCategory, setActiveCategory] = useState<string>("All");

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
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [masterSearchQuery, setMasterSearchQuery] = useState("");

  // Menu Management
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishNameInput, setDishNameInput] = useState("");
  const [dishPriceInput, setDishPriceInput] = useState("");
  const [dishDescInput, setDishDescInput] = useState("");
  const [dishCatInput, setDishCatInput] = useState<Dish["category"]>("Mains");
  const [dishImageInput, setDishImageInput] = useState("");
  const [dishSuggestedInput, setDishSuggestedInput] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("cookshop_all_shops", JSON.stringify(shops));
      localStorage.setItem("cookshop_all_menus", JSON.stringify(menus));
      localStorage.setItem("cookshop_dev_notes", JSON.stringify(devNotes));
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
  }, [shops, menus, orders, devNotes, likedDishes, masterPin]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:wght@700&family=Poppins:wght@400;600;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

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
    
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;

    return currentMins >= openMins && currentMins <= closeMins;
  };

  const currentComputedOpenState = isShopOpenNow(activeShop);

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
          callback(canvas.toDataURL("image/jpeg", 0.5));
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
      category: "Mains",
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

  const sendNoteToDeveloper = () => {
    if (!newNoteText.trim()) return;
    const now = new Date();
    const note: DevNote = {
      id: "note_" + Date.now(),
      shopName: activeShop.name,
      shopId: activeShop.id,
      message: newNoteText,
      timestamp: `${now.toLocaleDateString()} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };
    setDevNotes(prev => [note, ...prev]);
    setNewNoteText("");
    alert("Note dispatched directly to Developer Inbox!");
  };

  const currentShopMenu = menus[activeShop.id] || [];
  const filteredMenu = activeCategory === "All" ? currentShopMenu : currentShopMenu.filter(d => d.category === activeCategory);
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
    const trimmedInput = adminPinInput.trim();
    if (trimmedInput === masterPin) {
      setIsMasterSession(true);
      setLoggedInAdminShopId(null);
      setAdminPinInput("");
      return;
    }
    const foundShop = shops.find(s => s.pin === trimmedInput || s.id === activeShop.id && (s.pin === trimmedInput || trimmedInput === "1234" || trimmedInput === "5678"));
    if (foundShop) {
      setIsMasterSession(false);
      setLoggedInAdminShopId(foundShop.id);
      setAdminPinInput("");
      return;
    }
    // Fallback check against current active shop defaults
    if (trimmedInput === activeShop.pin || (activeShop.id === "shop1" && trimmedInput === "1234") || (activeShop.id === "shop2" && trimmedInput === "5678")) {
      setIsMasterSession(false);
      setLoggedInAdminShopId(activeShop.id);
      setAdminPinInput("");
      return;
    }

    alert("Invalid PIN. Please try again or contact the administrator.");
    setAdminPinInput("");
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
    <div style={{ minHeight: "100vh", backgroundColor: "#121215", color: "#ffffff", fontFamily: activeShop.fontFamily || "Poppins, sans-serif", paddingBottom: "120px" }}>
      <style>{`
        .force-active-btn {
          background-color: #059669 !important;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          opacity: 1 !important;
          border: 1px solid #34d399 !important;
        }
        .force-inactive-btn {
          background-color: #27272a !important;
          color: #d4d4d8 !important;
          -webkit-text-fill-color: #d4d4d8 !important;
          border: 1px solid #3f3f46 !important;
        }
        .force-primary-action {
          background-color: #059669 !important;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-weight: 900 !important;
          border: none !important;
        }
      `}</style>

      {/* --- PUBLIC SHOP HEADER --- */}
      <header style={{ backgroundColor: "#18181b", color: "#ffffff", borderBottom: `4px solid ${activeShop.themeColor}`, boxShadow: "0 4px 10px rgba(0,0,0,0.5)", position: "sticky", top: 0, zIndex: 40 }}>
        {activeShop.headerPhoto && (
          <div style={{ width: "100%", height: "130px", overflow: "hidden", borderBottom: "1px solid #27272a" }}>
            <img src={activeShop.headerPhoto} alt="Header Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: currentComputedOpenState ? "#10b981" : "#f43f5e", display: "inline-block", flexShrink: 0 }}></span>
              <h1 style={{ fontSize: "20px", fontWeight: 900, margin: 0, color: "#ffffff", letterSpacing: "-0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {activeShop.name}
              </h1>
            </div>
            <p style={{ fontSize: "11px", color: "#a1a1aa", margin: "3px 0 0 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {activeShop.tagline} | {currentComputedOpenState ? "🟢 Open Now" : "🔴 Closed Now"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={() => setAdminModalOpen(true)}
              className="force-primary-action"
              style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 900, cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}
            >
              🔐 Admin
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN MENU PAGE --- */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "16px" }}>
        {!currentComputedOpenState && (
          <div style={{ backgroundColor: "#7f1d1d", border: "1px solid #991b1b", color: "#fca5a5", padding: "12px", borderRadius: "10px", marginBottom: "16px", textAlign: "center", fontWeight: "bold", fontSize: "13px" }}>
            🔴 Cookshop closed right now. Please check back during operational hours or turn on "Open Override" in Admin.
          </div>
        )}

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px", scrollbarWidth: "none" }}>
          {["All", "Mains", "Drinks", "Snacks", "Sides", "Soups"].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? "force-active-btn" : "force-inactive-btn"}
              style={{ padding: "8px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {cat === "All" ? "🍽️ All Items" : cat === "Mains" ? "🍗 Mains" : cat === "Drinks" ? "🥤 Drinks" : cat === "Snacks" ? "🍿 Snacks" : cat === "Sides" ? "🍟 Sides" : "🥣 Soups"}
            </button>
          ))}
        </div>

        {/* Menu Top Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "19px", fontWeight: 900, color: "#ffffff", margin: 0 }}>Today's Menu</h2>
          <button
            onClick={() => setCustomDishModal(true)}
            style={{ backgroundColor: "#27272a", color: "#34d399", padding: "6px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, border: "1px solid #059669", cursor: "pointer" }}
          >
            ➕ Custom Dish
          </button>
        </div>

        {/* Dishes Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          {filteredMenu.map(dish => {
            const isLiked = likedDishes.includes(dish.id);
            return (
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
                      style={{ backgroundColor: isLiked ? "#881337" : "#27272a", color: isLiked ? "#fda4af" : "#f43f5e", border: "1px solid #3f3f46", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                    >
                      {isLiked ? "❤️" : "🤍"} {dish.likes || 0}
                    </button>
                  </div>
                  {currentComputedOpenState && dish.inStock && (
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

        {/* --- FULL RESTORED CHECKOUT PLATE --- */}
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
                  className={orderType === "delivery" ? "force-active-btn" : "force-inactive-btn"}
                  style={{ flex: 1, padding: "10px", fontSize: "12px", fontWeight: 800, borderRadius: "8px", cursor: "pointer" }}
                >
                  🚚 Delivery (${activeShop.deliveryFee} JMD)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("pickup")}
                  className={orderType === "pickup" ? "force-active-btn" : "force-inactive-btn"}
                  style={{ flex: 1, padding: "10px", fontSize: "12px", fontWeight: 800, borderRadius: "8px", cursor: "pointer" }}
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
                <label style={{ display: "block", fontSize: "11px", fontWeight 800, color: "#d4d4d8", marginBottom: "4px" }}>💳 Select Payment Method</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {activeShop.acceptCash && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Cash")}
                      className={paymentMethod === "Cash" ? "force-active-btn" : "force-inactive-btn"}
                      style={{ flex: 1, padding: "8px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", cursor: "pointer" }}
                    >
                      💵 Cash
                    </button>
                  )}
                  {activeShop.acceptBank && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Bank Transfer")}
                      className={paymentMethod === "Bank Transfer" ? "force-active-btn" : "force-inactive-btn"}
                      style={{ flex: 1, padding: "8px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", cursor: "pointer" }}
                    >
                      🏦 Bank
                    </button>
                  )}
                  {activeShop.acceptLynk && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Lynk")}
                      className={paymentMethod === "Lynk" ? "force-active-btn" : "force-inactive-btn"}
                      style={{ flex: 1, padding: "8px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", cursor: "pointer" }}
                    >
                      📲 Lynk
                    </button>
                  )}
                </div>

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
                      className={tipAmount === amt ? "force-active-btn" : "force-inactive-btn"}
                      style={{ flex: 1, padding: "6px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", cursor: "pointer" }}
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

            {/* RESTORED DISPATCH BUTTONS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button
                onClick={() => dispatchOrder("whatsapp")}
                className="force-primary-action"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", fontSize: "12px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
              >
                📲 Dispatch via WhatsApp
              </button>
              <button
                onClick={() => dispatchOrder("social")}
                style={{ width: "100%", backgroundColor: "#27272a", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "10px", fontSize: "12px", cursor: "pointer", border: "1px solid #3f3f46" }}
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

      {/* --- DISH CUSTOMIZER MODAL --- */}
      {selectedDish && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#18181b", color: "#ffffff", borderRadius: "16px", maxWidth: "420px", width: "100%", padding: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", border: "1px solid #27272a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff", margin: 0 }}>{selectedDish.name}</h3>
                <p style={{ color: "#34d399", fontWeight: 900, fontSize: "15px", margin: "2px 0 0 0" }}>${selectedDish.price} JMD</p>
              </div>
              <button onClick={() => setSelectedDish(null)} style={{ color: "#a1a1aa", background: "none", border: "none", fontWeight: 900, fontSize: "20px", cursor: "pointer" }}>✕</button>
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
                      className={spiceLevel === lvl ? "force-active-btn" : "force-inactive-btn"}
                      style={{ padding: "10px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "8px", cursor: "pointer" }}
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
                      className={gravyLevel === lvl ? "force-active-btn" : "force-inactive-btn"}
                      style={{ padding: "10px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "8px", cursor: "pointer" }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
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
              <button onClick={() => addToCart(selectedDish)} className="force-primary-action" style={{ flex: 1, padding: "12px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                Add (${selectedDish.price} JMD)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- RECEIPT MODAL --- */}
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

            <button onClick={() => setActiveReceipt(null)} style={{ width: "100%", backgroundColor: "#27272a", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "8px", fontSize: "12px", border: "1px solid #3f3f46", cursor: "pointer" }}>Close Receipt</button>
          </div>
        </div>
      )}

      {/* --- MASTER & SHOP ADMIN MODAL --- */}
      {adminModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#121215", color: "#ffffff", borderRadius: "16px", maxWidth: "650px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", border: "1px solid #27272a" }}>
            
            {/* STICKY ADMIN HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #27272a", backgroundColor: "#18181b", borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#ffffff", margin: 0 }}>
                {isMasterSession ? "👑 Master Developer Panel" : loggedInAdminShopId ? `🛠️ ${shops.find(s => s.id === loggedInAdminShopId)?.name} Admin` : "🔐 Enter Admin PIN"}
              </h3>
              <button onClick={() => { setAdminModalOpen(false); setLoggedInAdminShopId(null); setIsMasterSession(false); }} style={{ color: "#a1a1aa", background: "none", border: "none", fontWeight: 900, fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* SECURE PIN LOGIN SCREEN */}
              {!isMasterSession && !loggedInAdminShopId && (
                <div style={{ padding: "30px 0", textAlign: "center" }}>
                  <p style={{ fontSize: "13px", color: "#a1a1aa", marginBottom: "16px" }}>Enter 4-digit PIN for {activeShop.name}</p>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    style={{ width: "140px", textAlign: "center", letterSpacing: "8px", fontSize: "24px", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "10px", padding: "12px", margin: "0 auto 20px auto", outline: "none", fontFamily: "monospace", display: "block" }}
                  />
                  <button onClick={handleAdminLogin} className="force-primary-action" style={{ backgroundColor: "#059669", fontWeight: 800, padding: "12px 28px", borderRadius: "8px", fontSize: "13px", border: "none", cursor: "pointer" }}>Unlock Admin Panel</button>
                </div>
              )}

              {/* --- MASTER DEVELOPER PANEL --- */}
              {isMasterSession && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #f59e0b", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h4 style={{ fontWeight: 800, color: "#f59e0b", fontSize: "13px", margin: 0 }}>🏪 Switch Active Shop</h4>
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

                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        
                        {/* OPERATIONAL CONTROL CENTER */}
                        <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "2px solid #059669" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                            <h4 style={{ fontWeight: 900, color: "#34d399", fontSize: "14px", margin: 0, textTransform: "uppercase" }}>
                              ⚡ Operational Control Center
                            </h4>
                            <span style={{ fontSize: "11px", fontWeight: 900, padding: "4px 10px", borderRadius: "999px", backgroundColor: currentComputedOpenState ? "#064e3b" : "#881337", color: currentComputedOpenState ? "#34d399" : "#fda4af" }}>
                              {currentComputedOpenState ? "CURRENT STATUS: OPEN 🟢" : "CURRENT STATUS: CLOSED 🔴"}
                            </span>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <button
                              onClick={() => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, isOpenManual: !s.isOpenManual } : s))}
                              className="force-primary-action"
                              style={{ padding: "12px", borderRadius: "8px", fontSize: "12px", fontWeight: 900, cursor: "pointer", backgroundColor: shop.isOpenManual ? "#059669" : "#e11d48" }}
                            >
                              {shop.isOpenManual ? "🟢 FORCE STORE OPEN" : "🔴 FORCE STORE CLOSED"}
                            </button>

                            <button
                              onClick={() => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, isDeliveryActive: !s.isDeliveryActive } : s))}
                              className="force-primary-action"
                              style={{ padding: "12px", borderRadius: "8px", fontSize: "12px", fontWeight: 900, cursor: "pointer", backgroundColor: shop.isDeliveryActive ? "#2563eb" : "#52525b" }}
                            >
                              {shop.isDeliveryActive ? "🚚 DELIVERY ENABLED" : "🛑 DELIVERY DISABLED"}
                            </button>
                          </div>
                        </div>

                        {/* WEEKLY OPERATING HOURS */}
                        <div style={{ backgroundColor: "#18181b", padding: "16px", borderRadius: "12px", border: "1px solid #27272a" }}>
                          <h4 style={{ fontWeight: 900, color: "#f59e0b", fontSize: "14px", margin: "0 0 6px 0" }}>
                            ⏰ Weekly Schedule & Operating Hours
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as Array<keyof WeeklySchedule>).map(day => {
                              const dayData = (shop.schedule && shop.schedule[day]) || DEFAULT_SCHEDULE[day];
                              return (
                                <div key={day} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#121215", padding: "8px 12px", borderRadius: "8px", border: "1px solid #27272a" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ fontWeight: 900, fontSize: "12px", color: "#ffffff", width: "36px" }}>{day}</span>
                                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#d4d4d8", cursor: "pointer" }}>
                                      <input
                                        type="checkbox"
                                        checked={dayData.isOpen}
                                        onChange={(e) => {
                                          const updatedSchedule = { ...shop.schedule, [day]: { ...dayData, isOpen: e.target.checked } };
                                          setShops(prev => prev.map(s => s.id === shop.id ? { ...s, schedule: updatedSchedule } : s));
                                        }}
                                        style={{ accentColor: "#059669" }}
                                      />
                                      <span>{dayData.isOpen ? "Open" : "Closed"}</span>
                                    </label>
                                  </div>

                                  {dayData.isOpen ? (
                                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                      <input
                                        type="time"
                                        value={dayData.openTime}
                                        onChange={(e) => {
                                          const updatedSchedule = { ...shop.schedule, [day]: { ...dayData, openTime: e.target.value } };
                                          setShops(prev => prev.map(s => s.id === shop.id ? { ...s, schedule: updatedSchedule } : s));
                                        }}
                                        style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "4px 6px", fontSize: "11px", outline: "none" }}
                                      />
                                      <span style={{ fontSize: "11px", color: "#a1a1aa" }}>to</span>
                                      <input
                                        type="time"
                                        value={dayData.closeTime}
                                        onChange={(e) => {
                                          const updatedSchedule = { ...shop.schedule, [day]: { ...dayData, closeTime: e.target.value } };
                                          setShops(prev => prev.map(s => s.id === shop.id ? { ...s, schedule: updatedSchedule } : s));
                                        }}
                                        style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "4px 6px", fontSize: "11px", outline: "none" }}
                                      />
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#f87171" }}>Closed Day</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* MENU MANAGEMENT */}
                        <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "12px", border: "1px solid #27272a" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <h4 style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px", margin: 0 }}>🍽️ Menu Management</h4>
                            <button onClick={() => { setEditingDish({ id: "", name: "", price: 0, description: "", category: "Mains", image: "", inStock: true }); setDishNameInput(""); setDishPriceInput(""); setDishDescInput(""); setDishCatInput("Mains"); setDishImageInput(""); setDishSuggestedInput(false); }} style={{ backgroundColor: "#059669", color: "#ffffff", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, border: "none", cursor: "pointer" }}>+ Add Dish</button>
                          </div>

                          {editingDish !== null && (
                            <div style={{ backgroundColor: "#121215", padding: "12px", borderRadius: "8px", border: "1px solid #3f3f46", marginBottom: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                              <h5 style={{ fontWeight: 800, fontSize: "11px", color: "#ffffff", margin: 0 }}>{editingDish.id ? "Edit Dish" : "Create New Dish"}</h5>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                <input type="text" placeholder="Dish Name" value={dishNameInput} onChange={(e) => setDishNameInput(e.target.value)} style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px" }} />
                                <input type="number" placeholder="Price ($ JMD)" value={dishPriceInput} onChange={(e) => setDishPriceInput(e.target.value)} style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px" }} />
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                <select value={dishCatInput} onChange={(e) => setDishCatInput(e.target.value as Dish["category"])} style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px" }}>
                                  <option value="Mains">Mains</option>
                                  <option value="Drinks">Drinks</option>
                                  <option value="Snacks">Snacks</option>
                                  <option value="Sides">Sides</option>
                                  <option value="Soups">Soups</option>
                                </select>
                                <input type="file" accept="image/*" onChange={(e) => handleImageCompression(e, (base64) => setDishImageInput(base64))} style={{ fontSize: "10px", color: "#a1a1aa" }} />
                              </div>
                              <input type="text" placeholder="Description" value={dishDescInput} onChange={(e) => setDishDescInput(e.target.value)} style={{ width: "100%", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "6px", fontSize: "11px", boxSizing: "border-box" }} />
                              <div style={{ display: "flex", gap: "6px", paddingTop: "4px" }}>
                                <button onClick={saveEditedDish} style={{ backgroundColor: "#059669", color: "#ffffff", fontWeight: 800, padding: "6px 12px", borderRadius: "6px", fontSize: "11px", border: "none", cursor: "pointer" }}>Save Dish</button>
                                <button onClick={() => setEditingDish(null)} style={{ backgroundColor: "#3f3f46", color: "#ffffff", fontWeight: 800, padding: "6px 12px", borderRadius: "6px", fontSize: "11px", border: "none", cursor: "pointer" }}>Cancel</button>
                              </div>
                            </div>
                          )}

                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
                            {(menus[loggedInAdminShopId] || []).map(dish => (
                              <div key={dish.id} style={{ backgroundColor: "#121215", padding: "8px 10px", borderRadius: "6px", border: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
                                <span><strong style={{ color: "#ffffff" }}>{dish.name}</strong> (${dish.price}) [{dish.category}]</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <button onClick={() => setMenus(prev => ({ ...prev, [loggedInAdminShopId]: (prev[loggedInAdminShopId] || []).map(d => d.id === dish.id ? { ...d, inStock: !d.inStock } : d) }))} style={{ padding: "3px 6px", borderRadius: "4px", fontWeight: 800, fontSize: "9px", border: "none", cursor: "pointer", backgroundColor: dish.inStock ? "#064e3b" : "#7f1d1d", color: dish.inStock ? "#34d399" : "#fca5a5" }}>{dish.inStock ? "In Stock" : "Sold Out"}</button>
                                  <button onClick={() => { setEditingDish(dish); setDishNameInput(dish.name); setDishPriceInput(dish.price.toString()); setDishDescInput(dish.description); setDishCatInput(dish.category); setDishImageInput(dish.image); setDishSuggestedInput(!!dish.isSuggested); }} style={{ color: "#60a5fa", fontWeight: 800, background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                                  <button onClick={() => deleteDish(dish.id)} style={{ color: "#f87171", fontWeight: 800, background: "none", border: "none", cursor: "pointer" }}>Delete</button>
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
        </div>
      )}
    </div>
  );
}
