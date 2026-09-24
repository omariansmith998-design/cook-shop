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
  likes: number;
}

interface CartItem {
  dish: Dish;
  quantity: number;
  spiceLevel: string;
  gravyType: string;
}

interface ChatMessage {
  id: string;
  sender: "master" | "admin";
  text: string;
  timestamp: string;
}

interface Order {
  id: string;
  shopId: string;
  customerName: string;
  customerAddress: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tip: number;
  total: number;
  orderType: "Delivery" | "Pickup";
  paymentMethod: string;
  createdAt: string;
  status: "Pending" | "Preparing" | "Completed" | "Cancelled";
}

interface ShopProfile {
  id: string;
  name: string;
  tagline: string;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  address: string;
  mapLink: string;
  pin: string;
  headerBanner: string;
  deliveryFee: number;
  isOpenManual: boolean;
  isDeliveryActive: boolean;
  deliveryZoneNote: string;
  weeklySchedule: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>;
  themeColor: string;
  fontStyle: string;
  adminPin: string;
}

// --- DEFAULT INITIALIZERS ---
const DEFAULT_SCHEDULE: ShopProfile["weeklySchedule"] = {
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
    id: "mamas-yard",
    name: "Mama's Yard Cookshop",
    tagline: "Authentic Jamaican Home-Style Flavours",
    whatsapp: "18765551234",
    instagram: "@mamas_yard_ja",
    tiktok: "@mamas_yard_cookshop",
    facebook: "MamasYardCookshop",
    address: "Hip Strip, Montego Bay, St. James",
    mapLink: "https://maps.google.com",
    pin: "1234",
    headerBanner: "",
    deliveryFee: 300,
    isOpenManual: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery within Montego Bay main town & Hip Strip.",
    weeklySchedule: DEFAULT_SCHEDULE,
    themeColor: "#fe0000",
    fontStyle: "Monospace",
    adminPin: "1234",
  },
  {
    id: "aunties-ital",
    name: "Auntie's Ital Corner",
    tagline: "Pure Natural Ital Roots & Juices",
    whatsapp: "18765555678",
    instagram: "@aunties_ital",
    tiktok: "@aunties_ital_corner",
    facebook: "AuntiesItalCorner",
    address: "Downtown, Montego Bay",
    mapLink: "https://maps.google.com",
    pin: "5678",
    headerBanner: "",
    deliveryFee: 250,
    isOpenManual: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Local Montego Bay delivery.",
    weeklySchedule: DEFAULT_SCHEDULE,
    themeColor: "#2e7d32",
    fontStyle: "Sans-Serif",
    adminPin: "5678",
  },
];

const INITIAL_MENU: Dish[] = [
  {
    id: "1",
    name: "Brown Stew Chicken",
    price: 1200,
    description: "Slow-braised chicken in rich savory spices with carrots and butter beans.",
    category: "Mains",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300",
    inStock: true,
    likes: 12,
  },
  {
    id: "2",
    name: "Ackee & Saltfish",
    price: 1400,
    description: "Classic national dish sautéed with onions, tomatoes, and scotch bonnet peppers.",
    category: "Mains",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=300",
    inStock: true,
    likes: 24,
  },
  {
    id: "3",
    name: "Fresh Soursop Juice",
    price: 500,
    description: "Creamy soursop blended with nutmeg and condensed milk.",
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=300",
    inStock: true,
    likes: 18,
  },
  {
    id: "4",
    name: "Fried Dumplings (4 Pack)",
    price: 400,
    description: "Golden, crispy traditional fried Johnny cakes.",
    category: "Sides",
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=300",
    inStock: true,
    likes: 15,
  },
];

export default function App() {
  const [shops, setShops] = useState<ShopProfile[]>(DEFAULT_SHOPS);
  const [currentShopId, setCurrentShopId] = useState<string>("mamas-yard");
  const [menu, setMenu] = useState<Dish[]>(INITIAL_MENU);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Items");

  // Supabase Configuration State
  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => localStorage.getItem("SUPABASE_URL") || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>(() => localStorage.getItem("SUPABASE_ANON_KEY") || "");

  // Admin & Master Access States
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isMasterLoggedIn, setIsMasterLoggedIn] = useState<boolean>(false);
  const [masterPin, setMasterPin] = useState<string>("9999");
  const [activeAdminTab, setActiveAdminTab] = useState<"control" | "orders" | "menu" | "settings" | "devChat">("control");
  const [activeMasterTab, setActiveMasterTab] = useState<"shops" | "supabase" | "devChat" | "masterPin">("shops");

  // Chat State
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    "mamas-yard": [{ id: "c1", sender: "master", text: "Welcome! Let us know if you need system updates.", timestamp: "10:00 AM" }],
  });
  const [chatInput, setChatInput] = useState<string>("");

  // Custom Dish State
  const [showCustomDishModal, setShowCustomDishModal] = useState<boolean>(false);
  const [customDishName, setCustomDishName] = useState<string>("");
  const [customDishPrice, setCustomDishPrice] = useState<string>("");
  const [customDishNotes, setCustomDishNotes] = useState<string>("");

  // Menu Editor Modal State
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishForm, setDishForm] = useState<{ name: string; price: string; description: string; category: Dish["category"]; image: string }>({
    name: "",
    price: "",
    description: "",
    category: "Mains",
    image: "",
  });

  // Master Control New Shop Registration Form
  const [newShopName, setNewShopName] = useState<string>("");
  const [newShopPin, setNewShopPin] = useState<string>("");
  const [newShopWhatsapp, setNewShopWhatsapp] = useState<string>("");

  // Customer Checkout Details & Geolocation State
  const [orderType, setOrderType] = useState<"Delivery" | "Pickup">("Delivery");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [driverTip, setDriverTip] = useState<number>(0);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);

  // Full-screen Image Lightbox State
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const currentShop = shops.find((s) => s.id === currentShopId) || shops[0];

  // Helper for REST Supabase calls using Master Config
  const supabaseFetch = async (table: string, method: string = "GET", body?: any) => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    try {
      const headers: Record<string, string> = {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      };
      if (method === "POST" || method === "PUT") {
        headers["Prefer"] = "return=representation";
      }

      const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn("Supabase fetch fallback execution:", err);
      return null;
    }
  };

  // Sync Cloud Data via Supabase REST API
  useEffect(() => {
    const fetchCloudData = async () => {
      const cloudShops = await supabaseFetch("shops");
      if (cloudShops && cloudShops.length > 0) setShops(cloudShops);

      const cloudMenu = await supabaseFetch("menu");
      if (cloudMenu && cloudMenu.length > 0) setMenu(cloudMenu);

      const cloudOrders = await supabaseFetch("orders");
      if (cloudOrders) setOrders(cloudOrders);
    };
    fetchCloudData();
  }, [supabaseUrl, supabaseAnonKey]);

  // Sync Active Shop from URL Parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get("shop");
    if (shopParam) {
      const match = shops.find((s) => s.id === shopParam);
      if (match) setCurrentShopId(match.id);
    }
  }, [shops]);

  // Save Supabase Configuration to LocalStorage
  const handleSaveSupabaseConfig = () => {
    localStorage.setItem("SUPABASE_URL", supabaseUrl);
    localStorage.setItem("SUPABASE_ANON_KEY", supabaseAnonKey);
    alert("Supabase URL and Anon Key saved successfully!");
  };

  // Fetch Exact GPS Coordinates and Attach Live Map Link
  const handleFetchGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        setCustomerAddress((prev) => (prev ? `${prev} | 📍 GPS Pin: ${mapUrl}` : `📍 GPS Pin: ${mapUrl}`));
        setIsFetchingLocation(false);
      },
      () => {
        alert("Unable to retrieve precise GPS location. Please enter manually.");
        setIsFetchingLocation(false);
      }
    );
  };

  // Authentication Pin Login (FIXED: Keeps modal active on success)
  const handleAdminLogin = () => {
    const input = adminPinInput.trim();
    if (input === masterPin) {
      setIsMasterLoggedIn(true);
      setIsAdminLoggedIn(true);
      setShowAdminModal(true);
      setAdminPinInput("");
      return;
    }

    const matchedShop = shops.find((s) => s.pin === input || s.adminPin === input);
    if (matchedShop) {
      setCurrentShopId(matchedShop.id);
      setIsAdminLoggedIn(true);
      setShowAdminModal(true);
      setAdminPinInput("");
      return;
    }

    alert("Invalid PIN. Please try again.");
    setAdminPinInput("");
  };

  // Cart Management Functions
  const addToCart = (dish: Dish, spiceLevel = "Medium", gravyType = "Normal") => {
    setCart((prev) => {
      const existing = prev.find((i) => i.dish.id === dish.id && i.spiceLevel === spiceLevel && i.gravyType === gravyType);
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { dish, quantity: 1, spiceLevel, gravyType }];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  const total = subtotal + (orderType === "Delivery" ? currentShop.deliveryFee : 0) + driverTip;

  // Custom Dish Submission
  const handleAddCustomDish = () => {
    if (!customDishName || !customDishPrice) {
      alert("Please provide a name and price for the custom dish.");
      return;
    }
    const newDish: Dish = {
      id: Date.now().toString(),
      name: customDishName,
      price: parseFloat(customDishPrice) || 0,
      description: customDishNotes || "Custom order request",
      category: "Mains",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300",
      inStock: true,
      likes: 0,
    };
    addToCart(newDish);
    setShowCustomDishModal(false);
    setCustomDishName("");
    setCustomDishPrice("");
    setCustomDishNotes("");
  };

  // Dispatch Order, Store to Supabase, and Redirect to Messaging Platform
  const buildOrderSummaryText = () => {
    let msg = `*New Order - ${currentShop.name}*\n\n`;
    cart.forEach((item, i) => {
      msg += `${i + 1}. *${item.dish.name}* (x${item.quantity}) - $${item.dish.price * item.quantity} JMD\n`;
      msg += `   Spice: ${item.spiceLevel} | Gravy: ${item.gravyType}\n`;
    });
    msg += `\n*Order Type:* ${orderType}\n`;
    if (orderType === "Delivery") {
      msg += `*Delivery Fee:* $${currentShop.deliveryFee} JMD\n`;
      msg += `*Address/Landmark:* ${customerAddress}\n`;
    }
    if (driverTip > 0) {
      msg += `*Tip:* $${driverTip} JMD\n`;
    }
    msg += `*Total Amount:* $${total} JMD\n`;
    msg += `*Customer Name:* ${customerName}\n`;
    msg += `*Payment Method:* ${paymentMethod}\n\n`;
    msg += `🔗 Reopen Menu / App: ${window.location.href}`;
    return encodeURIComponent(msg);
  };

  const handleDispatchOrder = async (platform: "whatsapp" | "instagram" | "tiktok" | "facebook") => {
    if (!customerName.trim()) {
      alert("Please enter your name/nickname before submitting.");
      return;
    }
    if (orderType === "Delivery" && !customerAddress.trim()) {
      alert("Please enter a delivery address or landmark.");
      return;
    }
    if (cart.length === 0) {
      alert("Your order plate is empty.");
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      shopId: currentShopId,
      customerName,
      customerAddress,
      items: cart,
      subtotal,
      deliveryFee: orderType === "Delivery" ? currentShop.deliveryFee : 0,
      tip: driverTip,
      total,
      orderType,
      paymentMethod,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Pending",
    };

    setOrders((prev) => [newOrder, ...prev]);
    await supabaseFetch("orders", "POST", newOrder);

    const encodedMsg = buildOrderSummaryText();
    let url = "";

    if (platform === "whatsapp") {
      url = `https://wa.me/${currentShop.whatsapp}?text=${encodedMsg}`;
    } else if (platform === "instagram") {
      url = `https://instagram.com/${currentShop.instagram.replace("@", "")}`;
    } else if (platform === "tiktok") {
      url = `https://tiktok.com/${currentShop.tiktok.replace("@", "")}`;
    } else if (platform === "facebook") {
      url = `https://facebook.com/${currentShop.facebook}`;
    }

    window.open(url, "_blank");
  };

  const updateCurrentShop = async (key: keyof ShopProfile, value: any) => {
    const updated = shops.map((s) => (s.id === currentShopId ? { ...s, [key]: value } : s));
    setShops(updated);
    const shopToUpdate = updated.find((s) => s.id === currentShopId);
    if (shopToUpdate) {
      await supabaseFetch("shops", "POST", shopToUpdate);
    }
  };

  const handleSendMessage = (sender: "master" | "admin") => {
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => ({
      ...prev,
      [currentShopId]: [...(prev[currentShopId] || []), newMsg],
    }));
    setChatInput("");
  };

  const handleSaveDish = async () => {
    if (!dishForm.name || !dishForm.price) return;
    if (editingDish) {
      const updatedMenu = menu.map((d) =>
        d.id === editingDish.id
          ? { ...d, name: dishForm.name, price: parseFloat(dishForm.price) || 0, description: dishForm.description, category: dishForm.category, image: dishForm.image || d.image }
          : d
      );
      setMenu(updatedMenu);
      const updatedItem = updatedMenu.find((d) => d.id === editingDish.id);
      if (updatedItem) await supabaseFetch("menu", "POST", updatedItem);
    } else {
      const newDish: Dish = {
        id: Date.now().toString(),
        name: dishForm.name,
        price: parseFloat(dishForm.price) || 0,
        description: dishForm.description,
        category: dishForm.category,
        image: dishForm.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300",
        inStock: true,
        likes: 0,
      };
      setMenu((prev) => [...prev, newDish]);
      await supabaseFetch("menu", "POST", newDish);
    }
    setEditingDish(null);
    setDishForm({ name: "", price: "", description: "", category: "Mains", image: "" });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDishForm((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredMenu =
    selectedCategory === "All Items"
      ? menu
      : menu.filter((item) => item.category === selectedCategory);

  return (
    <div style={{ backgroundColor: "#121212", color: "#fff", minHeight: "100vh", fontFamily: currentShop.fontStyle }}>
      {/* HEADER BANNER */}
      <header style={{ position: "relative", backgroundColor: "#1e1e1e", borderBottom: "1px solid #333", padding: "12px 16px" }}>
        {currentShop.headerBanner && (
          <img
            src={currentShop.headerBanner}
            alt="Header Banner"
            onClick={() => setZoomedImage(currentShop.headerBanner)}
            style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "6px", marginBottom: "8px", cursor: "pointer" }}
          />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", color: "#fff" }}>{currentShop.name}</h1>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#aaa" }}>{currentShop.tagline}</p>
          </div>
          <button
            onClick={() => setShowAdminModal(true)}
            style={{
              backgroundColor: currentShop.themeColor,
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🔒 Admin
          </button>
        </div>

        {!currentShop.isOpenManual && (
          <div style={{ marginTop: "10px", backgroundColor: "#3a0d0d", color: "#ff6b6b", border: "1px solid #ff4d4d", padding: "8px", borderRadius: "4px", textAlign: "center", fontSize: "12px" }}>
            ⛔ Cookshop closed right now. Check back during business hours.
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
        {/* CATEGORY SELECTOR & CUSTOM DISH */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            {["All Items", "Mains", "Drinks", "Snacks", "Sides", "Soups"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: selectedCategory === cat ? currentShop.themeColor : "#2a2a2a",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCustomDishModal(true)}
            style={{
              backgroundColor: "#2e7d32",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "16px",
              fontSize: "12px",
              cursor: "pointer",
              marginLeft: "8px",
            }}
          >
            + Custom Dish
          </button>
        </div>

        {/* MENU LIST */}
        <h2 style={{ fontSize: "16px", borderBottom: "1px solid #333", paddingBottom: "8px" }}>Today's Menu</h2>
        <div style={{ display: "grid", gap: "12px" }}>
          {filteredMenu.map((item) => (
            <div key={item.id} style={{ backgroundColor: "#1e1e1e", borderRadius: "8px", padding: "12px", display: "flex", gap: "12px" }}>
              <img
                src={item.image}
                alt={item.name}
                onClick={() => setZoomedImage(item.image)}
                style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", cursor: "pointer" }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3 style={{ margin: 0, fontSize: "14px" }}>{item.name}</h3>
                  <span style={{ color: "#4caf50", fontWeight: "bold", fontSize: "14px" }}>${item.price} JMD</span>
                </div>
                <p style={{ fontSize: "11px", color: "#aaa", margin: "4px 0 8px" }}>{item.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {item.inStock ? (
                    <button
                      onClick={() => addToCart(item)}
                      style={{
                        backgroundColor: currentShop.themeColor,
                        color: "#fff",
                        border: "none",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      + Add to Plate
                    </button>
                  ) : (
                    <span style={{ fontSize: "11px", color: "#ff4d4d" }}>Out of Stock</span>
                  )}
                  <button
                    onClick={() => setMenu((prev) => prev.map((d) => (d.id === item.id ? { ...d, likes: d.likes + 1 } : d)))}
                    style={{ backgroundColor: "transparent", border: "none", color: "#aaa", cursor: "pointer", fontSize: "11px" }}
                  >
                    ❤️ {item.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER PLATE / CART WITH GPS PIN BUTTON */}
        <div style={{ marginTop: "24px", backgroundColor: "#1e1e1e", borderRadius: "8px", padding: "16px" }}>
          <h2 style={{ fontSize: "16px", margin: "0 0 12px" }}>🛒 Your Order Plate ({cart.length} items)</h2>
          {cart.length === 0 ? (
            <p style={{ fontSize: "12px", color: "#888" }}>Your plate is empty.</p>
          ) : (
            <div>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                      {item.quantity}x {item.dish.name}
                    </div>
                    <div style={{ fontSize: "10px", color: "#aaa" }}>
                      Spice: {item.spiceLevel} | Gravy: {item.gravyType}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px" }}>${item.dish.price * item.quantity} JMD</span>
                    <button onClick={() => removeFromCart(idx)} style={{ backgroundColor: "transparent", color: "#ff4d4d", border: "none", cursor: "pointer", fontSize: "14px" }}>
                      ❌
                    </button>
                  </div>
                </div>
              ))}

              {/* SERVICE TOGGLES */}
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button
                  onClick={() => setOrderType("Delivery")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: orderType === "Delivery" ? currentShop.themeColor : "#2a2a2a",
                    color: "#fff",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  🚚 Delivery (${currentShop.deliveryFee})
                </button>
                <button
                  onClick={() => setOrderType("Pickup")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: orderType === "Pickup" ? currentShop.themeColor : "#2a2a2a",
                    color: "#fff",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  🏪 Store Pickup
                </button>
              </div>

              {/* CUSTOMER INPUTS WITH GPS BUTTON */}
              <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Your Name / Nickname *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff", fontSize: "12px" }}
                />
                {orderType === "Delivery" && (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      placeholder="Delivery Address / Landmark *"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff", fontSize: "12px" }}
                    />
                    <button
                      onClick={handleFetchGPS}
                      disabled={isFetchingLocation}
                      style={{
                        backgroundColor: "#0288d1",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      {isFetchingLocation ? "..." : "📍 GPS"}
                    </button>
                  </div>
                )}
              </div>

              {/* TOTAL & DISPATCH BUTTONS */}
              <div style={{ marginTop: "16px", borderTop: "1px solid #333", paddingTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "bold" }}>
                  <span>Total</span>
                  <span>${total} JMD</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                  <button onClick={() => handleDispatchOrder("whatsapp")} style={{ backgroundColor: "#25D366", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                    📱 WhatsApp
                  </button>
                  <button onClick={() => handleDispatchOrder("instagram")} style={{ backgroundColor: "#E1306C", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                    📸 Instagram DM
                  </button>
                  <button onClick={() => handleDispatchOrder("tiktok")} style={{ backgroundColor: "#00f2fe", color: "#000", border: "none", padding: "10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                    🎵 TikTok DM
                  </button>
                  <button onClick={() => handleDispatchOrder("facebook")} style={{ backgroundColor: "#1877F2", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                    📘 Facebook DM
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER SOCIAL PORTALS */}
        <footer style={{ marginTop: "32px", padding: "16px 0", borderTop: "1px solid #222", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "#888", marginBottom: "8px" }}>Visit our social channels:</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", fontSize: "12px" }}>
            <a href={`https://instagram.com/${currentShop.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" style={{ color: "#E1306C", textDecoration: "none" }}>
              Instagram ({currentShop.instagram})
            </a>
            <a href={`https://tiktok.com/${currentShop.tiktok.replace("@", "")}`} target="_blank" rel="noreferrer" style={{ color: "#00f2fe", textDecoration: "none" }}>
              TikTok ({currentShop.tiktok})
            </a>
            <a href={`https://facebook.com/${currentShop.facebook}`} target="_blank" rel="noreferrer" style={{ color: "#1877F2", textDecoration: "none" }}>
              Facebook
            </a>
          </div>
          {currentShop.address && (
            <p style={{ fontSize: "10px", color: "#666", marginTop: "12px" }}>
              📍 {currentShop.address} {currentShop.mapLink && <a href={currentShop.mapLink} target="_blank" rel="noreferrer" style={{ color: "#4caf50" }}>(Map Link)</a>}
            </p>
          )}
        </footer>
      </main>

      {/* LOGIN MODAL */}
      {showAdminModal && !isAdminLoggedIn && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px", width: "90%", maxWidth: "400px" }}>
            <h3 style={{ margin: "0 0 12px" }}>🔐 Enter Admin PIN</h3>
            <input
              type="password"
              placeholder="****"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff", fontSize: "16px", textAlign: "center", marginBottom: "12px" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleAdminLogin} style={{ flex: 1, padding: "8px", backgroundColor: currentShop.themeColor, color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Unlock Panel
              </button>
              <button onClick={() => setShowAdminModal(false)} style={{ padding: "8px", backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER CONTROL CENTER */}
      {showAdminModal && isMasterLoggedIn && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div style={{ backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px", width: "95%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#e53935" }}>👑 Master Control Center</h3>
              <button onClick={() => { setIsMasterLoggedIn(false); setIsAdminLoggedIn(false); setShowAdminModal(false); }} style={{ backgroundColor: "#333", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}>
                Logout Master
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid #333", paddingBottom: "8px", overflowX: "auto" }}>
              <button onClick={() => setActiveMasterTab("shops")} style={{ backgroundColor: activeMasterTab === "shops" ? "#e53935" : "#2a2a2a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                Shops Manager
              </button>
              <button onClick={() => setActiveMasterTab("supabase")} style={{ backgroundColor: activeMasterTab === "supabase" ? "#e53935" : "#2a2a2a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                ⚡ Supabase Config
              </button>
              <button onClick={() => setActiveMasterTab("devChat")} style={{ backgroundColor: activeMasterTab === "devChat" ? "#e53935" : "#2a2a2a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                Dev Chat
              </button>
              <button onClick={() => setActiveMasterTab("masterPin")} style={{ backgroundColor: activeMasterTab === "masterPin" ? "#e53935" : "#2a2a2a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                Master PIN
              </button>
            </div>

            {/* SHOPS MANAGER TAB (FIXED: CLEAN DROPDOWN MENU) */}
            {activeMasterTab === "shops" && (
              <div>
                <h4 style={{ margin: "0 0 8px" }}>Register New Cookshop</h4>
                <div style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
                  <input type="text" placeholder="Cookshop Name" value={newShopName} onChange={(e) => setNewShopName(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />
                  <input type="text" placeholder="Access PIN (4 digits)" value={newShopPin} onChange={(e) => setNewShopPin(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />
                  <input type="text" placeholder="WhatsApp Number" value={newShopWhatsapp} onChange={(e) => setNewShopWhatsapp(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />
                  <button
                    onClick={async () => {
                      if (!newShopName || !newShopPin) return;
                      const id = newShopName.toLowerCase().replace(/[^a-z0-9]/g, "-");
                      const newProfile: ShopProfile = {
                        ...DEFAULT_SHOPS[0],
                        id,
                        name: newShopName,
                        pin: newShopPin,
                        adminPin: newShopPin,
                        whatsapp: newShopWhatsapp || "18765550000",
                      };
                      setShops((prev) => [...prev, newProfile]);
                      await supabaseFetch("shops", "POST", newProfile);
                      setNewShopName("");
                      setNewShopPin("");
                      setNewShopWhatsapp("");
                    }}
                    style={{ padding: "8px", backgroundColor: "#e53935", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                  >
                    Create Shop
                  </button>
                </div>

                <h4 style={{ margin: "16px 0 8px" }}>Select Active Cookshop ({shops.length})</h4>
                <select
                  value={currentShopId}
                  onChange={(e) => {
                    setCurrentShopId(e.target.value);
                    setIsMasterLoggedIn(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #333",
                    backgroundColor: "#121212",
                    color: "#fff",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (PIN: {s.pin} | WA: {s.whatsapp})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SUPABASE CONFIG TAB */}
            {activeMasterTab === "supabase" && (
              <div style={{ display: "grid", gap: "12px" }}>
                <h4 style={{ margin: "0 0 4px" }}>⚡ Connect Database (Supabase)</h4>
                <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>
                  Enter your project API URL and public Anon key below. These will persist in browser storage and connect your app directly to your cloud tables.
                </p>

                <label style={{ fontSize: "11px", color: "#aaa" }}>Supabase Project URL:</label>
                <input
                  type="text"
                  placeholder="https://xyz.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff", fontSize: "12px" }}
                />

                <label style={{ fontSize: "11px", color: "#aaa" }}>Supabase Anon API Key:</label>
                <textarea
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff", fontSize: "12px", height: "80px" }}
                />

                <button
                  onClick={handleSaveSupabaseConfig}
                  style={{ padding: "10px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                >
                  Save Supabase Settings
                </button>
              </div>
            )}

            {/* DEV CHAT TAB */}
            {activeMasterTab === "devChat" && (
              <div>
                <div style={{ height: "200px", overflowY: "auto", border: "1px solid #333", borderRadius: "4px", padding: "8px", marginBottom: "8px", backgroundColor: "#121212" }}>
                  {(chatMessages[currentShopId] || []).map((msg) => (
                    <div key={msg.id} style={{ textAlign: msg.sender === "master" ? "right" : "left", marginBottom: "6px" }}>
                      <span style={{ fontSize: "10px", color: "#aaa" }}>{msg.timestamp}</span>
                      <div style={{ display: "inline-block", backgroundColor: msg.sender === "master" ? "#e53935" : "#333", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", marginLeft: "6px" }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="text" placeholder="Message shop admin..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />
                  <button onClick={() => handleSendMessage("master")} style={{ backgroundColor: "#e53935", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* MASTER PIN TAB */}
            {activeMasterTab === "masterPin" && (
              <div style={{ display: "grid", gap: "8px" }}>
                <h4 style={{ margin: "0 0 8px" }}>Update Master PIN</h4>
                <input type="text" placeholder="New Master PIN (4 digits)" value={masterPin} onChange={(e) => setMasterPin(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />
                <button onClick={() => alert("Master PIN updated successfully.")} style={{ padding: "8px", backgroundColor: "#e53935", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                  Save Master PIN
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHOP ADMIN PANEL */}
      {showAdminModal && isAdminLoggedIn && !isMasterLoggedIn && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div style={{ backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px", width: "95%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>⚙️ {currentShop.name} Admin Panel</h3>
              <button onClick={() => { setIsAdminLoggedIn(false); setShowAdminModal(false); }} style={{ backgroundColor: "#333", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}>
                Logout Admin
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid #333", paddingBottom: "8px" }}>
              <button onClick={() => setActiveAdminTab("control")} style={{ backgroundColor: activeAdminTab === "control" ? currentShop.themeColor : "#2a2a2a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                🎛️ Control
              </button>
              <button onClick={() => setActiveAdminTab("orders")} style={{ backgroundColor: activeAdminTab === "orders" ? currentShop.themeColor : "#2a2a2a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                📋 Orders ({orders.filter((o) => o.shopId === currentShopId).length})
              </button>
              <button onClick={() => setActiveAdminTab("menu")} style={{ backgroundColor: activeAdminTab === "menu" ? currentShop.themeColor : "#2a2a2a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                📜 Menu
              </button>
              <button onClick={() => setActiveAdminTab("settings")} style={{ backgroundColor: activeAdminTab === "settings" ? currentShop.themeColor : "#2a2a2a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                ⚙️ Settings
              </button>
              <button onClick={() => setActiveAdminTab("devChat")} style={{ backgroundColor: activeAdminTab === "devChat" ? currentShop.themeColor : "#2a2a2a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                💬 Dev Chat
              </button>
            </div>

            {/* OPERATIONAL CONTROL TAB */}
            {activeAdminTab === "control" && (
              <div>
                <h4 style={{ margin: "0 0 8px" }}>⏰ Operational Toggles</h4>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <button onClick={() => updateCurrentShop("isOpenManual", !currentShop.isOpenManual)} style={{ flex: 1, padding: "8px", backgroundColor: currentShop.isOpenManual ? "#2e7d32" : "#c62828", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    {currentShop.isOpenManual ? "STORE OPEN" : "STORE CLOSED"}
                  </button>
                  <button onClick={() => updateCurrentShop("isDeliveryActive", !currentShop.isDeliveryActive)} style={{ flex: 1, padding: "8px", backgroundColor: currentShop.isDeliveryActive ? "#2e7d32" : "#c62828", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    {currentShop.isDeliveryActive ? "DELIVERY ACTIVE" : "DELIVERY OFF"}
                  </button>
                </div>

                <h4 style={{ margin: "16px 0 8px" }}>📅 Weekly Schedule</h4>
                {Object.keys(currentShop.weeklySchedule).map((day) => (
                  <div key={day} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "12px" }}>
                    <span style={{ width: "35px", fontWeight: "bold" }}>{day}:</span>
                    <input
                      type="checkbox"
                      checked={currentShop.weeklySchedule[day].isOpen}
                      onChange={(e) => {
                        const updated = { ...currentShop.weeklySchedule, [day]: { ...currentShop.weeklySchedule[day], isOpen: e.target.checked } };
                        updateCurrentShop("weeklySchedule", updated);
                      }}
                    />
                    <input
                      type="time"
                      value={currentShop.weeklySchedule[day].openTime}
                      onChange={(e) => {
                        const updated = { ...currentShop.weeklySchedule, [day]: { ...currentShop.weeklySchedule[day], openTime: e.target.value } };
                        updateCurrentShop("weeklySchedule", updated);
                      }}
                      style={{ backgroundColor: "#121212", color: "#fff", border: "1px solid #333", borderRadius: "4px" }}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={currentShop.weeklySchedule[day].closeTime}
                      onChange={(e) => {
                        const updated = { ...currentShop.weeklySchedule, [day]: { ...currentShop.weeklySchedule[day], closeTime: e.target.value } };
                        updateCurrentShop("weeklySchedule", updated);
                      }}
                      style={{ backgroundColor: "#121212", color: "#fff", border: "1px solid #333", borderRadius: "4px" }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ORDERS & RECEIPTS TAB */}
            {activeAdminTab === "orders" && (
              <div>
                <h4 style={{ margin: "0 0 12px" }}>🧾 Incoming Orders & Digital Receipts</h4>
                {orders.filter((o) => o.shopId === currentShopId).length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#888" }}>No active orders found for this shop.</p>
                ) : (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {orders
                      .filter((o) => o.shopId === currentShopId)
                      .map((ord) => (
                        <div key={ord.id} style={{ backgroundColor: "#121212", border: "1px solid #333", padding: "12px", borderRadius: "6px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontWeight: "bold", fontSize: "13px" }}>Order #{ord.id.slice(-4)}</span>
                            <span style={{ color: "#4caf50", fontSize: "12px", fontWeight: "bold" }}>${ord.total} JMD</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "6px" }}>
                            👤 {ord.customerName} | 🚚 {ord.orderType} | ⏰ {ord.createdAt}
                          </div>
                          {ord.customerAddress && (
                            <div style={{ fontSize: "11px", color: "#64b5f6", marginBottom: "8px" }}>
                              📍 {ord.customerAddress}
                            </div>
                          )}
                          <div style={{ borderTop: "1px dashed #333", paddingTop: "6px", fontSize: "11px" }}>
                            {ord.items.map((it, i) => (
                              <div key={i}>
                                {it.quantity}x {it.dish.name} (${it.dish.price * it.quantity})
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* MENU EDITOR TAB */}
            {activeAdminTab === "menu" && (
              <div>
                <h4 style={{ margin: "0 0 8px" }}>{editingDish ? "Edit Dish" : "Add New Dish"}</h4>
                <div style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
                  <input type="text" placeholder="Dish Name" value={dishForm.name} onChange={(e) => setDishForm((p) => ({ ...p, name: e.target.value }))} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />
                  <input type="number" placeholder="Price (JMD)" value={dishForm.price} onChange={(e) => setDishForm((p) => ({ ...p, price: e.target.value }))} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />
                  <textarea placeholder="Description" value={dishForm.description} onChange={(e) => setDishForm((p) => ({ ...p, description: e.target.value }))} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />
                  <select value={dishForm.category} onChange={(e) => setDishForm((p) => ({ ...p, category: e.target.value as Dish["category"] }))} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }}>
                    <option value="Mains">Mains</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Sides">Sides</option>
                    <option value="Soups">Soups</option>
                  </select>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: "12px" }} />
                  <button onClick={handleSaveDish} style={{ padding: "8px", backgroundColor: currentShop.themeColor, color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                    {editingDish ? "Update Dish" : "Add Dish"}
                  </button>
                </div>

                <h4 style={{ margin: "16px 0 8px" }}>Current Items</h4>
                <div style={{ display: "grid", gap: "8px" }}>
                  {menu.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#121212", padding: "8px 12px", borderRadius: "4px" }}>
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "13px" }}>{item.name} (${item.price} JMD)</div>
                        <div style={{ fontSize: "10px", color: "#aaa" }}>{item.category}</div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={async () => {
                            const updatedMenu = menu.map((d) => (d.id === item.id ? { ...d, inStock: !d.inStock } : d));
                            setMenu(updatedMenu);
                            const updatedItem = updatedMenu.find((d) => d.id === item.id);
                            if (updatedItem) await supabaseFetch("menu", "POST", updatedItem);
                          }}
                          style={{ backgroundColor: item.inStock ? "#2e7d32" : "#c62828", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                        >
                          {item.inStock ? "In Stock" : "Sold Out"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingDish(item);
                            setDishForm({ name: item.name, price: item.price.toString(), description: item.description, category: item.category, image: item.image });
                          }}
                          style={{ backgroundColor: "#0288d1", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setMenu((prev) => prev.filter((d) => d.id !== item.id))}
                          style={{ backgroundColor: "#333", color: "#ff4d4d", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeAdminTab === "settings" && (
              <div style={{ display: "grid", gap: "8px" }}>
                <h4 style={{ margin: "0 0 4px" }}>🎨 Branding, Socials & Location Settings</h4>
                <label style={{ fontSize: "11px", color: "#aaa" }}>Cookshop Name:</label>
                <input type="text" value={currentShop.name} onChange={(e) => updateCurrentShop("name", e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />

                <label style={{ fontSize: "11px", color: "#aaa" }}>WhatsApp Number:</label>
                <input type="text" value={currentShop.whatsapp} onChange={(e) => updateCurrentShop("whatsapp", e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />

                <label style={{ fontSize: "11px", color: "#aaa" }}>Instagram Handle:</label>
                <input type="text" value={currentShop.instagram} onChange={(e) => updateCurrentShop("instagram", e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />

                <label style={{ fontSize: "11px", color: "#aaa" }}>TikTok Handle:</label>
                <input type="text" value={currentShop.tiktok} onChange={(e) => updateCurrentShop("tiktok", e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />

                <label style={{ fontSize: "11px", color: "#aaa" }}>Facebook Name:</label>
                <input type="text" value={currentShop.facebook} onChange={(e) => updateCurrentShop("facebook", e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />

                <label style={{ fontSize: "11px", color: "#aaa" }}>Physical Address / Location:</label>
                <input type="text" value={currentShop.address} onChange={(e) => updateCurrentShop("address", e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />

                <label style={{ fontSize: "11px", color: "#aaa" }}>Google Maps Link:</label>
                <input type="text" value={currentShop.mapLink} onChange={(e) => updateCurrentShop("mapLink", e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />

                <label style={{ fontSize: "11px", color: "#aaa" }}>Theme Color:</label>
                <input type="color" value={currentShop.themeColor} onChange={(e) => updateCurrentShop("themeColor", e.target.value)} style={{ width: "100%", height: "40px", border: "none", cursor: "pointer" }} />

                <label style={{ fontSize: "11px", color: "#aaa" }}>Admin Access PIN:</label>
                <input type="text" value={currentShop.adminPin} onChange={(e) => updateCurrentShop("adminPin", e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />
              </div>
            )}

            {/* DEV CHAT TAB */}
            {activeAdminTab === "devChat" && (
              <div>
                <div style={{ height: "200px", overflowY: "auto", border: "1px solid #333", borderRadius: "4px", padding: "8px", marginBottom: "8px", backgroundColor: "#121212" }}>
                  {(chatMessages[currentShopId] || []).map((msg) => (
                    <div key={msg.id} style={{ textAlign: msg.sender === "admin" ? "right" : "left", marginBottom: "6px" }}>
                      <span style={{ fontSize: "10px", color: "#aaa" }}>{msg.timestamp}</span>
                      <div style={{ display: "inline-block", backgroundColor: msg.sender === "admin" ? currentShop.themeColor : "#333", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", marginLeft: "6px" }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="text" placeholder="Message developer..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff" }} />
                  <button onClick={() => handleSendMessage("admin")} style={{ backgroundColor: currentShop.themeColor, color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CUSTOM DISH OVERLAY */}
      {showCustomDishModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px", width: "90%", maxWidth: "400px" }}>
            <h3 style={{ margin: "0 0 12px" }}>🍲 Order Custom Dish</h3>
            <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
              <input type="text" placeholder="Dish Name (e.g. Steamed Fish)" value={customDishName} onChange={(e) => setCustomDishName(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff", fontSize: "12px" }} />
              <input type="number" placeholder="Agreed Price ($ JMD)" value={customDishPrice} onChange={(e) => setCustomDishPrice(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff", fontSize: "12px" }} />
              <textarea placeholder="Special instructions or notes..." value={customDishNotes} onChange={(e) => setCustomDishNotes(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", backgroundColor: "#121212", color: "#fff", fontSize: "12px" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleAddCustomDish} style={{ flex: 1, padding: "8px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Add to Plate
              </button>
              <button onClick={() => setShowCustomDishModal(false)} style={{ padding: "8px", backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      {zoomedImage && (
        <div onClick={() => setZoomedImage(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <img src={zoomedImage} alt="Full View" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: "8px" }} />
        </div>
      )}
    </div>
  );
}
