import React, { useState, useEffect, useRef } from "react";

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

interface ChatMessage {
  id: string;
  sender: "developer" | "admin";
  text: string;
  timestamp: string;
}

interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
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

// --- DEFAULT INITIALIZERS ---
const DEFAULT_SCHEDULE: WeeklySchedule = {
  Mon: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Tue: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Wed: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Thu: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Fri: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
  Sat: { isOpen: true, openTime: "10:00", closeTime: "22:00" },
  Sun: { isOpen: false, openTime: "10:00", closeTime: "18:00" },
};

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

  // NEW: 2-Way Chat State (Replaces DevNotes)
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem("cookshop_shop_chats");
    return saved ? JSON.parse(saved) : {};
  });

  const [likedDishes, setLikedDishes] = useState<string[]>(() => {
    const saved = localStorage.getItem("cookshop_user_liked_dishes");
    return saved ? JSON.parse(saved) : [];
  });

  const [masterPin, setMasterPin] = useState<string>(() => {
    return localStorage.getItem("cookshop_master_pin") || "9999";
  });

  // Category Filtering & Cart
  const [activeCategory, setActiveCategory] = useState<string>("All");
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

  // Admin & Master Panel Navigation
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [loggedInAdminShopId, setLoggedInAdminShopId] = useState<string | null>(null);
  const [isMasterSession, setIsMasterSession] = useState(false);
  const [adminTab, setAdminTab] = useState<"operations" | "orders" | "menu" | "settings" | "chat">("operations");
  const [masterTab, setMasterTab] = useState<"shops" | "orders" | "chat" | "security">("shops");

  // New Shop State (Master)
  const [newShopName, setNewShopName] = useState("");
  const [newShopPin, setNewShopPin] = useState("");
  const [newShopWhatsapp, setNewShopWhatsapp] = useState("");
  const [newMasterPinInput, setNewMasterPinInput] = useState("");

  // Chat Input
  const [chatInputText, setChatInputText] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Menu Management
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishNameInput, setDishNameInput] = useState("");
  const [dishPriceInput, setDishPriceInput] = useState("");
  const [dishDescInput, setDishDescInput] = useState("");
  const [dishCatInput, setDishCatInput] = useState<Dish["category"]>("Mains");
  const [dishImageInput, setDishImageInput] = useState("");
  const [dishSuggestedInput, setDishSuggestedInput] = useState(false);

  // Viewport Fix (React Dynamic Injector)
  useEffect(() => {
    let meta = document.querySelector("meta[name='viewport']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "viewport");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("cookshop_all_shops", JSON.stringify(shops));
      localStorage.setItem("cookshop_all_menus", JSON.stringify(menus));
      localStorage.setItem("cookshop_shop_chats", JSON.stringify(chats));
      localStorage.setItem("cookshop_user_liked_dishes", JSON.stringify(likedDishes));
      localStorage.setItem("cookshop_master_pin", masterPin);
      const prunedOrders: Record<string, Order[]> = {};
      Object.keys(orders).forEach(id => {
        prunedOrders[id] = (orders[id] || []).slice(0, 50); // Keep last 50
      });
      localStorage.setItem("cookshop_all_orders", JSON.stringify(prunedOrders));
    } catch (err) {
      console.warn("Storage warning:", err);
    }
  }, [shops, menus, orders, chats, likedDishes, masterPin]);

  // Scroll Chat to Bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chats, adminTab, masterTab]);

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

    const cartSubtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
    const deliveryCost = orderType === "delivery" && activeShop.isDeliveryActive ? activeShop.deliveryFee : 0;
    const cartTotal = cartSubtotal + deliveryCost + tipAmount;

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
    const input = adminPinInput.trim();
    if (!input) return;

    if (input === masterPin) {
      setIsMasterSession(true);
      setLoggedInAdminShopId(null);
      setAdminPinInput("");
      setMasterTab("shops");
      return;
    }

    const matchedShop = shops.find(s => s.pin === input || (s.id === activeShop.id && (input === "1234" || input === "5678")));
    if (matchedShop) {
      setIsMasterSession(false);
      setLoggedInAdminShopId(matchedShop.id);
      setAdminPinInput("");
      setAdminTab("operations");
      return;
    }

    alert("Invalid PIN. Try 1234 (Mama's Yard), 5678 (Auntie's Ital), or your Master PIN.");
    setAdminPinInput("");
  };

  const handleAddNewShop = () => {
    if (!newShopName || !newShopPin) {
      alert("Please provide Shop Name and PIN");
      return;
    }
    const newId = "shop_" + Date.now();
    const newShop: ShopProfile = {
      id: newId,
      name: newShopName,
      tagline: "Authentic Jamaican Eats",
      whatsapp: newShopWhatsapp || "18765550000",
      tiktok: "",
      instagram: "",
      facebook: "",
      address: "Jamaica",
      mapLink: "",
      pin: newShopPin,
      themeColor: "#059669",
      deliveryFee: 300,
      isOpenManual: true,
      isDeliveryActive: true,
      deliveryZoneNote: "",
      schedule: DEFAULT_SCHEDULE,
      headerPhoto: "",
      fontFamily: "Poppins, sans-serif",
      acceptCash: true,
      acceptBank: true,
      acceptLynk: true,
      bankDetails: "",
      lynkDetails: "",
    };
    setShops(prev => [...prev, newShop]);
    setMenus(prev => ({ ...prev, [newId]: [] }));
    setNewShopName("");
    setNewShopPin("");
    setNewShopWhatsapp("");
    alert(`New Shop "${newShopName}" created successfully! PIN: ${newShopPin}`);
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

  const sendChatMessage = (role: "developer" | "admin", targetShopId: string) => {
    if (!chatInputText.trim()) return;
    const now = new Date();
    const newMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      sender: role,
      text: chatInputText.trim(),
      timestamp: `${now.toLocaleDateString()} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };
    
    setChats(prev => ({
      ...prev,
      [targetShopId]: [...(prev[targetShopId] || []), newMsg]
    }));
    setChatInputText("");
  };

  const currentShopMenu = menus[activeShop.id] || [];
  const filteredMenu = activeCategory === "All" ? currentShopMenu : currentShopMenu.filter(d => d.category === activeCategory);
  
  const cartSubtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const deliveryCost = orderType === "delivery" && activeShop.isDeliveryActive ? activeShop.deliveryFee : 0;
  const cartTotal = cartSubtotal + deliveryCost + tipAmount;

  return (
    <div style={{ minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", backgroundColor: "#121215", color: "#ffffff", fontFamily: activeShop.fontFamily || "Poppins, sans-serif", paddingBottom: "120px", boxSizing: "border-box" }}>
      <style>{`
        * { box-sizing: border-box !important; }
        body, html { margin: 0; padding: 0; width: 100%; overflow-x: hidden; background-color: #121215; }
        .force-active-btn { background-color: #059669 !important; color: #ffffff !important; opacity: 1 !important; border: 1px solid #34d399 !important; }
        .force-inactive-btn { background-color: #27272a !important; color: #d4d4d8 !important; border: 1px solid #3f3f46 !important; }
        .force-primary-action { background-color: #059669 !important; color: #ffffff !important; font-weight: 900 !important; border: none !important; }
        .tab-btn { padding: 8px 12px; font-size: 11px; font-weight: 800; border-radius: 6px; border: 1px solid #3f3f46; cursor: pointer; background-color: #18181b; color: #a1a1aa; white-space: nowrap; }
        .tab-btn.active { background-color: #059669; color: #ffffff; border-color: #34d399; }
      `}</style>

      {/* --- PUBLIC SHOP HEADER --- */}
      <header style={{ backgroundColor: "#18181b", color: "#ffffff", borderBottom: `4px solid ${activeShop.themeColor}`, boxShadow: "0 4px 10px rgba(0,0,0,0.5)", position: "sticky", top: 0, zIndex: 40, width: "100%" }}>
        {activeShop.headerPhoto && (
          <div style={{ width: "100%", height: "130px", overflow: "hidden", borderBottom: "1px solid #27272a" }}>
            <img src={activeShop.headerPhoto} alt="Header Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
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
          <button onClick={() => setAdminModalOpen(true)} className="force-primary-action" style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 900, cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
            🔐 Admin
          </button>
        </div>
      </header>

      {/* --- MAIN MENU PAGE --- */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "16px", width: "100%" }}>
        {!currentComputedOpenState && (
          <div style={{ backgroundColor: "#7f1d1d", border: "1px solid #991b1b", color: "#fca5a5", padding: "12px", borderRadius: "10px", marginBottom: "16px", textAlign: "center", fontWeight: "bold", fontSize: "13px" }}>
            🔴 Cookshop closed right now. Check back during business hours.
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px", width: "100%" }}>
          {["All", "Mains", "Drinks", "Snacks", "Sides", "Soups"].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={activeCategory === cat ? "force-active-btn" : "force-inactive-btn"} style={{ padding: "8px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {cat === "All" ? "🍽️ All Items" : cat}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "19px", fontWeight: 900, color: "#ffffff", margin: 0 }}>Today's Menu</h2>
          <button onClick={() => setCustomDishModal(true)} style={{ backgroundColor: "#27272a", color: "#34d399", padding: "6px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, border: "1px solid #059669", cursor: "pointer" }}>
            ➕ Custom Dish
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", width: "100%" }}>
          {filteredMenu.map(dish => {
            const isLiked = likedDishes.includes(dish.id);
            return (
              <div key={dish.id} style={{ backgroundColor: "#18181b", borderRadius: "14px", border: dish.isSuggested ? "2px solid #f59e0b" : "1px solid #27272a", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ padding: "16px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  {dish.image ? (
                    <img src={dish.image} alt={dish.name} onClick={() => setZoomedImageUrl(dish.image)} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px", border: "1px solid #3f3f46", backgroundColor: "#27272a", flexShrink: 0, cursor: "pointer" }} />
                  ) : (
                    <div style={{ width: "80px", height: "80px", backgroundColor: "#27272a", borderRadius: "10px", border: "1px solid #3f3f46", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>🍲</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 900, color: "#ffffff", margin: 0 }}>{dish.name}</h3>
                      <span style={{ fontSize: "14px", fontWeight: 900, color: "#34d399", whiteSpace: "nowrap" }}>${dish.price} JMD</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#a1a1aa", margin: "4px 0 0 0", lineHeight: "1.4" }}>{dish.description}</p>
                  </div>
                </div>
                <div style={{ backgroundColor: "#121215", padding: "10px 16px", borderTop: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: dish.inStock ? "#34d399" : "#f87171" }}>{dish.inStock ? "🟢 In Stock" : "🔴 Sold Out"}</span>
                    <button onClick={() => toggleLikeDish(dish.id)} style={{ backgroundColor: isLiked ? "#881337" : "#27272a", color: isLiked ? "#fda4af" : "#f43f5e", border: "1px solid #3f3f46", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>{isLiked ? "❤️" : "🤍"} {dish.likes || 0}</button>
                  </div>
                  {currentComputedOpenState && dish.inStock && (
                    <button onClick={() => setSelectedDish(dish)} className="force-primary-action" style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>+ Add to Plate</button>
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
              <span>🛒 Your Order Plate</span><span style={{ fontSize: "12px", color: "#a1a1aa" }}>{cart.length} items</span>
            </h3>

            <div style={{ borderTop: "1px solid #27272a", borderBottom: "1px solid #27272a", marginBottom: "16px" }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ padding: "12px 0", display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: idx < cart.length - 1 ? "1px solid #27272a" : "none" }}>
                  <div>
                    <span style={{ fontWeight: 800, color: "#ffffff" }}>{item.quantity}x {item.dish.name}</span>
                    <div style={{ fontSize: "11px", color: "#a1a1aa", marginTop: "2px" }}>Spice: {item.spiceLevel} | Gravy: {item.gravyLevel} {item.extraSauce ? "| +Extra Sauce" : ""}</div>
                    {item.notes && <div style={{ fontSize: "11px", fontStyle: "italic", color: "#a1a1aa" }}>Note: "{item.notes}"</div>}
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ fontWeight: 900, color: "#ffffff" }}>${item.dish.price * item.quantity} JMD</span>
                    <button onClick={() => removeFromCart(idx)} style={{ color: "#f87171", background: "none", border: "none", fontWeight: 900, fontSize: "16px", cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: "#121215", padding: "16px", borderRadius: "12px", border: "1px solid #27272a", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <button type="button" onClick={() => setOrderType("delivery")} className={orderType === "delivery" ? "force-active-btn" : "force-inactive-btn"} style={{ flex: 1, padding: "10px", fontSize: "12px", fontWeight: 800, borderRadius: "8px", cursor: "pointer" }}>🚚 Delivery (${activeShop.deliveryFee})</button>
                <button type="button" onClick={() => setOrderType("pickup")} className={orderType === "pickup" ? "force-active-btn" : "force-inactive-btn"} style={{ flex: 1, padding: "10px", fontSize: "12px", fontWeight: 800, borderRadius: "8px", cursor: "pointer" }}>🏪 Store Pickup</button>
              </div>

              {orderType === "delivery" && activeShop.deliveryZoneNote && (
                <p style={{ fontSize: "11px", color: "#fcd34d", backgroundColor: "#451a03", padding: "8px 10px", borderRadius: "6px", border: "1px solid #78350f", margin: "0 0 12px 0" }}>⚠️ {activeShop.deliveryZoneNote}</p>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>Timing</label>
                  <select value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} style={{ width: "100%", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px", fontSize: "11px" }}>
                    <option value="ASAP (30-45 mins)">ASAP (30-45 mins)</option>
                    <option value="In 1 Hour">In 1 Hour</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>Payment</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} style={{ width: "100%", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "6px", padding: "8px", fontSize: "11px" }}>
                    {activeShop.acceptCash && <option value="Cash">💵 Cash</option>}
                    {activeShop.acceptBank && <option value="Bank Transfer">🏦 Bank</option>}
                    {activeShop.acceptLynk && <option value="Lynk">📲 Lynk</option>}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>Cookshop / Driver Tip</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[0, 100, 200, 500].map(amt => (
                    <button key={amt} type="button" onClick={() => setTipAmount(amt)} className={tipAmount === amt ? "force-active-btn" : "force-inactive-btn"} style={{ flex: 1, padding: "6px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", cursor: "pointer" }}>{amt === 0 ? "No Tip" : `+$${amt}`}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="text" placeholder="Your Name / Nickname *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: "100%", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px", fontSize: "13px" }} />
                {orderType === "delivery" && (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input type="text" placeholder="Delivery Address / Landmark *" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} style={{ flex: 1, backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px", fontSize: "13px" }} />
                    <button type="button" onClick={handlePinLocation} style={{ backgroundColor: "#27272a", color: "#60a5fa", border: "1px solid #3f3f46", borderRadius: "8px", padding: "0 10px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>📍 GPS</button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #27272a", paddingTop: "12px", marginBottom: "16px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#a1a1aa", marginBottom: "4px" }}><span>Subtotal</span><span>${cartSubtotal} JMD</span></div>
              {orderType === "delivery" && activeShop.isDeliveryActive && <div style={{ display: "flex", justifyContent: "space-between", color: "#a1a1aa", marginBottom: "4px" }}><span>Delivery Fee</span><span>${deliveryCost} JMD</span></div>}
              {tipAmount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#a1a1aa", marginBottom: "4px" }}><span>Tip</span><span>${tipAmount} JMD</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between", color: "#ffffff", fontWeight: 900, fontSize: "16px", paddingTop: "8px", borderTop: "1px dashed #27272a" }}><span>Total</span><span>${cartTotal} JMD</span></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button onClick={() => dispatchOrder("whatsapp")} className="force-primary-action" style={{ padding: "12px", borderRadius: "10px", fontSize: "12px", cursor: "pointer" }}>📲 Dispatch WhatsApp</button>
              <button onClick={() => dispatchOrder("social")} style={{ backgroundColor: "#27272a", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "10px", fontSize: "12px", cursor: "pointer", border: "1px solid #3f3f46" }}>📋 Copy for IG / DM</button>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}
      {selectedDish && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#18181b", color: "#ffffff", borderRadius: "16px", maxWidth: "420px", width: "100%", padding: "20px", border: "1px solid #27272a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 900, margin: 0 }}>{selectedDish.name}</h3>
                <p style={{ color: "#34d399", fontWeight: 900, fontSize: "14px", margin: "2px 0 0 0" }}>${selectedDish.price} JMD</p>
              </div>
              <button onClick={() => setSelectedDish(null)} style={{ color: "#a1a1aa", background: "none", border: "none", fontWeight: 900, fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ fontSize: "12px", color: "#a1a1aa", margin: "0 0 16px 0" }}>{selectedDish.description}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>🌶️ Spice Level</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {["No Pepper", "Medium", "Scotch Bonnet"].map(lvl => <button key={lvl} type="button" onClick={() => setSpiceLevel(lvl)} className={spiceLevel === lvl ? "force-active-btn" : "force-inactive-btn"} style={{ padding: "8px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", cursor: "pointer" }}>{lvl}</button>)}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#d4d4d8", marginBottom: "4px" }}>🍲 Gravy</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {["No Gravy", "Normal", "Extra Drowned"].map(lvl => <button key={lvl} type="button" onClick={() => setGravyLevel(lvl)} className={gravyLevel === lvl ? "force-active-btn" : "force-inactive-btn"} style={{ padding: "8px 4px", fontSize: "11px", fontWeight: 800, borderRadius: "6px", cursor: "pointer" }}>{lvl}</button>)}
                </div>
              </div>
              <input type="text" placeholder="Special instructions (e.g. extra fork)" value={itemNotes} onChange={(e) => setItemNotes(e.target.value)} style={{ width: "100%", backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "8px 10px", fontSize: "12px" }} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setSelectedDish(null)} style={{ flex: 1, backgroundColor: "#27272a", color: "#ffffff", padding: "12px", borderRadius: "8px", fontSize: "12px", border: "1px solid #3f3f46", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => addToCart(selectedDish)} className="force-primary-action" style={{ flex: 1, padding: "12px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>Add (${selectedDish.price} JMD)</button>
            </div>
          </div>
        </div>
      )}

      {customDishModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#18181b", color: "#ffffff", borderRadius: "16px", maxWidth: "400px", width: "100%", padding: "20px", border: "1px solid #27272a" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 900, margin: "0 0 12px 0" }}>➕ Request Custom Dish</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <input type="text" placeholder="Dish Name (e.g. Stew Peas)" value={customDishName} onChange={(e) => setCustomDishName(e.target.value)} style={{ backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px", fontSize: "12px" }} />
              <input type="number" placeholder="Estimated Price ($ JMD)" value={customDishPrice} onChange={(e) => setCustomDishPrice(e.target.value)} style={{ backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px", fontSize: "12px" }} />
              <input type="text" placeholder="Notes (e.g. Pig tail included)" value={customDishNotes} onChange={(e) => setCustomDishNotes(e.target.value)} style={{ backgroundColor: "#121215", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px", fontSize: "12px" }} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setCustomDishModal(false)} style={{ flex: 1, backgroundColor: "#27272a", color: "#ffffff", padding: "10px", borderRadius: "8px", fontSize: "12px", border: "1px solid #3f3f46", cursor: "pointer" }}>Cancel</button>
              <button onClick={addCustomDishToCart} className="force-primary-action" style={{ flex: 1, padding: "10px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>Add Custom Dish</button>
            </div>
          </div>
        </div>
      )}

      {activeReceipt && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#18181b", color: "#ffffff", borderRadius: "16px", maxWidth: "420px", width: "100%", padding: "20px", border: "1px solid #27272a" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "32px" }}>✅</span>
              <h3 style={{ fontSize: "17px", fontWeight: 900, margin: "4px 0 2px 0" }}>Order Dispatched!</h3>
              <p style={{ fontSize: "11px", color: "#a1a1aa", margin: 0 }}>ID: {activeReceipt.id} | {activeReceipt.date}</p>
            </div>
            <button onClick={() => setActiveReceipt(null)} style={{ width: "100%", backgroundColor: "#27272a", color: "#ffffff", fontWeight: 800, padding: "12px", borderRadius: "8px", fontSize: "12px", border: "1px solid #3f3f46", cursor: "pointer" }}>Close Receipt</button>
          </div>
        </div>
      )}

      {/* --- FULL ADMIN & MASTER CONTROL CENTER --- */}
      {adminModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#121215", color: "#ffffff", borderRadius: "16px", maxWidth: "680px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", border: "1px solid #27272a", boxShadow: "0 20px 50px rgba(0,0,0,0.8)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #27272a", backgroundColor: "#18181b" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 900, margin: 0 }}>
                {isMasterSession ? "👑 Master Control Center" : loggedInAdminShopId ? `🛠️ ${shops.find(s => s.id === loggedInAdminShopId)?.name} Admin` : "🔐 Enter Admin PIN"}
              </h3>
              <button onClick={() => { setAdminModalOpen(false); setLoggedInAdminShopId(null); setIsMasterSession(false); }} style={{ color: "#a1a1aa", background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
              
              {!isMasterSession && !loggedInAdminShopId && (
                <div style={{ padding: "30px 0", textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "#a1a1aa", marginBottom: "12px" }}>Enter PIN for {activeShop.name} or Master PIN</p>
                  <input type="password" maxLength={4} placeholder="••••" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} style={{ width: "140px", textAlign: "center", fontSize: "24px", backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "10px", padding: "10px", margin: "0 auto 16px auto", display: "block", outline: "none" }} />
                  <button onClick={handleAdminLogin} className="force-primary-action" style={{ padding: "10px 24px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>Unlock Panel</button>
                </div>
              )}

              {/* MASTER SESSION */}
              {isMasterSession && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
                  <div style={{ display: "flex", gap: "6px", overflowX: "auto", borderBottom: "1px solid #27272a", paddingBottom: "10px" }}>
                    <button onClick={() => setMasterTab("shops")} className={`tab-btn ${masterTab === "shops" ? "active" : ""}`}>🏪 Shops Manager</button>
                    <button onClick={() => setMasterTab("orders")} className={`tab-btn ${masterTab === "orders" ? "active" : ""}`}>📦 All Orders</button>
                    <button onClick={() => setMasterTab("chat")} className={`tab-btn ${masterTab === "chat" ? "active" : ""}`}>💬 Dev Chat</button>
                    <button onClick={() => setMasterTab("security")} className={`tab-btn ${masterTab === "security" ? "active" : ""}`}>🔑 Master PIN</button>
                  </div>

                  {masterTab === "shops" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ backgroundColor: "#18181b", padding: "12px", borderRadius: "8px", border: "1px solid #f59e0b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: 800, color: "#f59e0b" }}>Active Public View Shop</span>
                        <select value={activeShopId} onChange={(e) => { setActiveShopId(e.target.value); window.history.pushState({}, "", `?shop=${e.target.value}`); }} style={{ backgroundColor: "#27272a", color: "#ffffff", padding: "6px 10px", borderRadius: "6px", border: "1px solid #3f3f46", fontSize: "12px" }}>
                          {shops.map(s => <option key={s.id} value={s.id} style={{ color: "#000" }}>{s.name} (PIN: {s.pin})</option>)}
                        </select>
                      </div>
                      <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #27272a" }}>
                        <h4 style={{ fontSize: "13px", fontWeight: 800, margin: "0 0 10px 0", color: "#34d399" }}>➕ Register New Cookshop</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                          <input type="text" placeholder="Cookshop Name" value={newShopName} onChange={(e) => setNewShopName(e.target.value)} style={{ backgroundColor: "#121215", color: "#fff", border: "1px solid #3f3f46", padding: "8px", borderRadius: "6px", fontSize: "12px" }} />
                          <input type="text" placeholder="Access PIN (4 digits)" value={newShopPin} onChange={(e) => setNewShopPin(e.target.value)} style={{ backgroundColor: "#121215", color: "#fff", border: "1px solid #3f3f46", padding: "8px", borderRadius: "6px", fontSize: "12px" }} />
                        </div>
                        <input type="text" placeholder="WhatsApp Number" value={newShopWhatsapp} onChange={(e) => setNewShopWhatsapp(e.target.value)} style={{ width: "100%", backgroundColor: "#121215", color: "#fff", border: "1px solid #3f3f46", padding: "8px", borderRadius: "6px", fontSize: "12px", marginBottom: "8px" }} />
                        <button onClick={handleAddNewShop} className="force-primary-action" style={{ padding: "8px 16px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>Create Shop</button>
                      </div>
                      <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #27272a" }}>
                        <h4 style={{ fontSize: "13px", fontWeight: 800, margin: "0 0 10px 0" }}>🏪 Existing Cookshops ({shops.length})</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {shops.map(s => (
                            <div key={s.id} style={{ backgroundColor: "#121215", padding: "10px", borderRadius: "8px", border: "1px solid #27272a", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                              <div><strong style={{ color: "#fff" }}>{s.name}</strong><div style={{ fontSize: "11px", color: "#a1a1aa" }}>PIN: <span style={{ color: "#f59e0b", fontWeight: 800 }}>{s.pin}</span> | WhatsApp: {s.whatsapp}</div></div>
                              <button onClick={() => { setIsMasterSession(false); setLoggedInAdminShopId(s.id); }} style={{ backgroundColor: "#27272a", color: "#34d399", border: "1px solid #059669", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: 800 }}>Manage</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {masterTab === "orders" && (
                    <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #27272a" }}>
                      <h4 style={{ fontSize: "13px", fontWeight: 800, margin: "0 0 10px 0" }}>📦 Master Order Stream</h4>
                      {Object.keys(orders).length === 0 ? <p style={{ fontSize: "12px", color: "#a1a1aa" }}>No orders received yet.</p> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {Object.entries(orders).map(([sId, shopOrders]) => {
                            const targetShop = shops.find(s => s.id === sId);
                            return shopOrders.map(ord => (
                              <div key={ord.id} style={{ backgroundColor: "#121215", padding: "10px", borderRadius: "8px", border: "1px solid #27272a", fontSize: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><strong style={{ color: "#34d399" }}>{ord.id} ({targetShop?.name})</strong><span style={{ color: "#f59e0b", fontWeight: 800 }}>${ord.total} JMD</span></div>
                                <div style={{ fontSize: "11px", color: "#a1a1aa" }}>Customer: {ord.customerName} | Status: {ord.status}</div>
                              </div>
                            ));
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MASTER DEV CHAT */}
                  {masterTab === "chat" && (
                    <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #27272a", display: "flex", flexDirection: "column", height: "400px" }}>
                      <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ fontSize: "13px", fontWeight: 800, margin: 0 }}>💬 Dev Chat: <span style={{ color: "#34d399" }}>{activeShop.name}</span></h4>
                      </div>
                      
                      {/* Chat Messages Area */}
                      <div ref={chatScrollRef} style={{ flex: 1, backgroundColor: "#121215", borderRadius: "8px", border: "1px solid #27272a", padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
                        {(!chats[activeShopId] || chats[activeShopId].length === 0) ? (
                          <p style={{ fontSize: "11px", color: "#a1a1aa", textAlign: "center", margin: "auto" }}>No messages yet for this shop.</p>
                        ) : (
                          chats[activeShopId].map(msg => {
                            const isMe = msg.sender === "developer";
                            return (
                              <div key={msg.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "80%", display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "9px", color: "#a1a1aa", marginBottom: "2px", textAlign: isMe ? "right" : "left" }}>{isMe ? "You (Dev)" : "Shop Admin"} • {msg.timestamp}</span>
                                <div style={{ backgroundColor: isMe ? "#059669" : "#27272a", color: "#fff", padding: "8px 12px", borderRadius: "12px", borderBottomRightRadius: isMe ? "0px" : "12px", borderBottomLeftRadius: isMe ? "12px" : "0px", fontSize: "12px", border: isMe ? "none" : "1px solid #3f3f46" }}>
                                  {msg.text}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Chat Input */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input type="text" placeholder="Message shop admin..." value={chatInputText} onChange={(e) => setChatInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChatMessage("developer", activeShopId)} style={{ flex: 1, backgroundColor: "#121215", color: "#fff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px", fontSize: "12px", outline: "none" }} />
                        <button onClick={() => sendChatMessage("developer", activeShopId)} className="force-primary-action" style={{ padding: "0 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Send</button>
                      </div>
                    </div>
                  )}

                  {masterTab === "security" && (
                    <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #27272a" }}>
                      <h4 style={{ fontSize: "13px", fontWeight: 800, margin: "0 0 10px 0" }}>🔑 Update Master PIN</h4>
                      <input type="text" placeholder="New Master PIN (4 digits)" value={newMasterPinInput} onChange={(e) => setNewMasterPinInput(e.target.value)} style={{ backgroundColor: "#121215", color: "#fff", border: "1px solid #3f3f46", padding: "8px", borderRadius: "6px", fontSize: "12px", width: "100%", marginBottom: "8px" }} />
                      <button onClick={() => { if (!newMasterPinInput.trim()) return; setMasterPin(newMasterPinInput.trim()); setNewMasterPinInput(""); alert("Master PIN updated successfully!"); }} className="force-primary-action" style={{ padding: "8px 16px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>Save Master PIN</button>
                    </div>
                  )}

                  <button onClick={() => { setIsMasterSession(false); setLoggedInAdminShopId(null); }} style={{ backgroundColor: "#3f3f46", color: "#ffffff", padding: "8px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, border: "none", cursor: "pointer", alignSelf: "flex-end" }}>Logout Master</button>
                </div>
              )}

              {/* SHOP OWNER ADMIN SESSION */}
              {loggedInAdminShopId && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
                  {(() => {
                    const shop = shops.find(s => s.id === loggedInAdminShopId);
                    if (!shop) return null;

                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px", height: "100%" }}>
                        <div style={{ display: "flex", gap: "6px", overflowX: "auto", borderBottom: "1px solid #27272a", paddingBottom: "8px" }}>
                          <button onClick={() => setAdminTab("operations")} className={`tab-btn ${adminTab === "operations" ? "active" : ""}`}>⚡ Control</button>
                          <button onClick={() => setAdminTab("orders")} className={`tab-btn ${adminTab === "orders" ? "active" : ""}`}>📦 Orders</button>
                          <button onClick={() => setAdminTab("menu")} className={`tab-btn ${adminTab === "menu" ? "active" : ""}`}>🍽️ Menu</button>
                          <button onClick={() => setAdminTab("settings")} className={`tab-btn ${adminTab === "settings" ? "active" : ""}`}>⚙️ Settings</button>
                          <button onClick={() => setAdminTab("chat")} className={`tab-btn ${adminTab === "chat" ? "active" : ""}`}>💬 Dev Chat</button>
                        </div>

                        {adminTab === "operations" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #059669" }}>
                              <h4 style={{ fontSize: "13px", fontWeight: 900, color: "#34d399", margin: "0 0 10px 0" }}>⚡ OPERATIONAL TOGGLES</h4>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                <button onClick={() => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, isOpenManual: !s.isOpenManual } : s))} className="force-primary-action" style={{ padding: "10px", borderRadius: "6px", fontSize: "11px", backgroundColor: shop.isOpenManual ? "#059669" : "#e11d48", cursor: "pointer" }}>{shop.isOpenManual ? "🟢 STORE OPEN" : "🔴 STORE CLOSED"}</button>
                                <button onClick={() => setShops(prev => prev.map(s => s.id === shop.id ? { ...s, isDeliveryActive: !s.isDeliveryActive } : s))} className="force-primary-action" style={{ padding: "10px", borderRadius: "6px", fontSize: "11px", backgroundColor: shop.isDeliveryActive ? "#2563eb" : "#52525b", cursor: "pointer" }}>{shop.isDeliveryActive ? "🚚 DELIVERY ACTIVE" : "🛑 DELIVERY OFF"}</button>
                              </div>
                            </div>
                            <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #27272a" }}>
                              <h4 style={{ fontSize: "13px", fontWeight: 800, margin: "0 0 10px 0", color: "#f59e0b" }}>⏰ Weekly Schedule</h4>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as Array<keyof WeeklySchedule>).map(day => {
                                  const dayData = (shop.schedule && shop.schedule[day]) || DEFAULT_SCHEDULE[day];
                                  return (
                                    <div key={day} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#121215", padding: "6px 10px", borderRadius: "6px", fontSize: "11px" }}>
                                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}><span style={{ fontWeight: 800, width: "32px" }}>{day}</span><input type="checkbox" checked={dayData.isOpen} onChange={(e) => { const updated = { ...shop.schedule, [day]: { ...dayData, isOpen: e.target.checked } }; setShops(prev => prev.map(s => s.id === shop.id ? { ...s, schedule: updated } : s)); }} /><span>{dayData.isOpen ? "Open" : "Closed"}</span></div>
                                      {dayData.isOpen && (
                                        <div style={{ display: "flex", gap: "4px" }}>
                                          <input type="time" value={dayData.openTime} onChange={(e) => { const updated = { ...shop.schedule, [day]: { ...dayData, openTime: e.target.value } }; setShops(prev => prev.map(s => s.id === shop.id ? { ...s, schedule: updated } : s)); }} style={{ backgroundColor: "#18181b", color: "#fff", border: "1px solid #3f3f46", padding: "2px 4px", borderRadius: "4px", fontSize: "10px" }} /><span>to</span>
                                          <input type="time" value={dayData.closeTime} onChange={(e) => { const updated = { ...shop.schedule, [day]: { ...dayData, closeTime: e.target.value } }; setShops(prev => prev.map(s => s.id === shop.id ? { ...s, schedule: updated } : s)); }} style={{ backgroundColor: "#18181b", color: "#fff", border: "1px solid #3f3f46", padding: "2px 4px", borderRadius: "4px", fontSize: "10px" }} />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {adminTab === "orders" && (
                          <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #27272a" }}>
                            <h4 style={{ fontSize: "13px", fontWeight: 800, margin: "0 0 10px 0" }}>📦 Shop Orders</h4>
                            {(orders[shop.id] || []).length === 0 ? ( <p style={{ fontSize: "12px", color: "#a1a1aa" }}>No active orders.</p> ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {(orders[shop.id] || []).map(ord => (
                                  <div key={ord.id} style={{ backgroundColor: "#121215", padding: "10px", borderRadius: "8px", border: "1px solid #27272a", fontSize: "12px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><strong style={{ color: "#34d399" }}>{ord.id} - {ord.customerName}</strong><span style={{ fontWeight: 800, color: "#f59e0b" }}>${ord.total} JMD</span></div>
                                    <div style={{ fontSize: "11px", color: "#a1a1aa", marginBottom: "6px" }}>Type: {ord.type} ({ord.deliveryTime}) | Pay: {ord.paymentMethod}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {adminTab === "menu" && (
                          <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #27272a" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}><h4 style={{ fontSize: "13px", fontWeight: 800, margin: 0 }}>🍽️ Menu Editor</h4><button onClick={() => { setEditingDish({ id: "", name: "", price: 0, description: "", category: "Mains", image: "", inStock: true }); setDishNameInput(""); setDishPriceInput(""); setDishDescInput(""); setDishCatInput("Mains"); setDishImageInput(""); setDishSuggestedInput(false); }} style={{ backgroundColor: "#059669", color: "#fff", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", border: "none", cursor: "pointer" }}>+ Add Dish</button></div>
                            {editingDish !== null && (
                              <div style={{ backgroundColor: "#121215", padding: "10px", borderRadius: "6px", border: "1px solid #3f3f46", marginBottom: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                  <input type="text" placeholder="Dish Name" value={dishNameInput} onChange={(e) => setDishNameInput(e.target.value)} style={{ backgroundColor: "#18181b", color: "#fff", border: "1px solid #3f3f46", padding: "6px", borderRadius: "4px", fontSize: "11px" }} />
                                  <input type="number" placeholder="Price ($)" value={dishPriceInput} onChange={(e) => setDishPriceInput(e.target.value)} style={{ backgroundColor: "#18181b", color: "#fff", border: "1px solid #3f3f46", padding: "6px", borderRadius: "4px", fontSize: "11px" }} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                  <select value={dishCatInput} onChange={(e) => setDishCatInput(e.target.value as Dish["category"])} style={{ backgroundColor: "#18181b", color: "#fff", border: "1px solid #3f3f46", padding: "6px", borderRadius: "4px", fontSize: "11px" }}>
                                    <option value="Mains">Mains</option><option value="Drinks">Drinks</option><option value="Snacks">Snacks</option><option value="Sides">Sides</option><option value="Soups">Soups</option>
                                  </select>
                                  <input type="file" accept="image/*" onChange={(e) => handleImageCompression(e, (b) => setDishImageInput(b))} style={{ fontSize: "10px", color: "#a1a1aa" }} />
                                </div>
                                <input type="text" placeholder="Description" value={dishDescInput} onChange={(e) => setDishDescInput(e.target.value)} style={{ backgroundColor: "#18181b", color: "#fff", border: "1px solid #3f3f46", padding: "6px", borderRadius: "4px", fontSize: "11px" }} />
                                <div style={{ display: "flex", gap: "6px" }}><button onClick={saveEditedDish} style={{ backgroundColor: "#059669", color: "#fff", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", border: "none", cursor: "pointer" }}>Save</button><button onClick={() => setEditingDish(null)} style={{ backgroundColor: "#3f3f46", color: "#fff", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", border: "none", cursor: "pointer" }}>Cancel</button></div>
                              </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
                              {(menus[loggedInAdminShopId] || []).map(d => (
                                <div key={d.id} style={{ backgroundColor: "#121215", padding: "6px 8px", borderRadius: "4px", border: "1px solid #27272a", display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                                  <span>{d.name} (${d.price})</span>
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button onClick={() => setMenus(prev => ({ ...prev, [loggedInAdminShopId]: (prev[loggedInAdminShopId] || []).map(item => item.id === d.id ? { ...item, inStock: !item.inStock } : item) }))} style={{ color: d.inStock ? "#34d399" : "#f87171", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>{d.inStock ? "In Stock" : "Out"}</button>
                                    <button onClick={() => { setEditingDish(d); setDishNameInput(d.name); setDishPriceInput(d.price.toString()); setDishDescInput(d.description); setDishCatInput(d.category); setDishImageInput(d.image); }} style={{ color: "#60a5fa", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>Edit</button>
                                    <button onClick={() => deleteDish(d.id)} style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>Delete</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {adminTab === "settings" && (
                          <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                            <h4 style={{ fontSize: "13px", fontWeight: 800, margin: "0 0 6px 0" }}>⚙️ Shop Profile</h4>
                            <input type="text" placeholder="Shop Name" value={shop.name} onChange={(e) => { const v = e.target.value; setShops(prev => prev.map(s => s.id === shop.id ? { ...s, name: v } : s)); }} style={{ backgroundColor: "#121215", color: "#fff", border: "1px solid #3f3f46", padding: "6px", borderRadius: "4px" }} />
                            <input type="text" placeholder="WhatsApp Number" value={shop.whatsapp} onChange={(e) => { const v = e.target.value; setShops(prev => prev.map(s => s.id === shop.id ? { ...s, whatsapp: v } : s)); }} style={{ backgroundColor: "#121215", color: "#fff", border: "1px solid #3f3f46", padding: "6px", borderRadius: "4px" }} />
                            <input type="text" placeholder="Access PIN" value={shop.pin} onChange={(e) => { const v = e.target.value; setShops(prev => prev.map(s => s.id === shop.id ? { ...s, pin: v } : s)); }} style={{ backgroundColor: "#121215", color: "#fff", border: "1px solid #3f3f46", padding: "6px", borderRadius: "4px" }} />
                            <input type="number" placeholder="Delivery Fee ($ JMD)" value={shop.deliveryFee} onChange={(e) => { const v = parseFloat(e.target.value) || 0; setShops(prev => prev.map(s => s.id === shop.id ? { ...s, deliveryFee: v } : s)); }} style={{ backgroundColor: "#121215", color: "#fff", border: "1px solid #3f3f46", padding: "6px", borderRadius: "4px" }} />
                          </div>
                        )}

                        {/* SHOP ADMIN DEV CHAT */}
                        {adminTab === "chat" && (
                          <div style={{ backgroundColor: "#18181b", padding: "14px", borderRadius: "10px", border: "1px solid #27272a", display: "flex", flexDirection: "column", height: "400px" }}>
                            <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <h4 style={{ fontSize: "13px", fontWeight: 800, margin: 0 }}>💬 Chat with Developer</h4>
                            </div>
                            
                            {/* Chat Messages Area */}
                            <div ref={chatScrollRef} style={{ flex: 1, backgroundColor: "#121215", borderRadius: "8px", border: "1px solid #27272a", padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
                              {(!chats[shop.id] || chats[shop.id].length === 0) ? (
                                <p style={{ fontSize: "11px", color: "#a1a1aa", textAlign: "center", margin: "auto" }}>Send a message to the master developer.</p>
                              ) : (
                                chats[shop.id].map(msg => {
                                  const isMe = msg.sender === "admin";
                                  return (
                                    <div key={msg.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "80%", display: "flex", flexDirection: "column" }}>
                                      <span style={{ fontSize: "9px", color: "#a1a1aa", marginBottom: "2px", textAlign: isMe ? "right" : "left" }}>{isMe ? "You" : "Master Developer"} • {msg.timestamp}</span>
                                      <div style={{ backgroundColor: isMe ? "#2563eb" : "#27272a", color: "#fff", padding: "8px 12px", borderRadius: "12px", borderBottomRightRadius: isMe ? "0px" : "12px", borderBottomLeftRadius: isMe ? "12px" : "0px", fontSize: "12px", border: isMe ? "none" : "1px solid #3f3f46" }}>
                                        {msg.text}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Chat Input */}
                            <div style={{ display: "flex", gap: "8px" }}>
                              <input type="text" placeholder="Type message..." value={chatInputText} onChange={(e) => setChatInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChatMessage("admin", shop.id)} style={{ flex: 1, backgroundColor: "#121215", color: "#fff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px", fontSize: "12px", outline: "none" }} />
                              <button onClick={() => sendChatMessage("admin", shop.id)} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "0 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, border: "none", cursor: "pointer" }}>Send</button>
                            </div>
                          </div>
                        )}

                        <button onClick={() => { setLoggedInAdminShopId(null); setAdminModalOpen(false); }} style={{ backgroundColor: "#3f3f46", color: "#ffffff", padding: "8px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, border: "none", cursor: "pointer", alignSelf: "flex-end" }}>Logout Admin</button>
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
