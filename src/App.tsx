import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, Settings, Lock, LogOut, Plus, X, AlertCircle, Heart, Menu, Download, Share2 } from "lucide-react";

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
  isSpecial?: boolean;
}

interface CartItem {
  dish: Dish;
  quantity: number;
  spiceLevel: string;
  gravyType: string;
  addKetchup: boolean;
  addPepper: boolean;
  isItemCompleted?: boolean;
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
  deliveryZone: string;
  paymentMethod: string;
  createdAt: string;
  estimatedTime?: string;
  status: "Pending" | "Preparing" | "Ready" | "Completed" | "Cancelled";
}

interface DeliveryZoneOption {
  name: string;
  price: number;
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
  deliveryZones: DeliveryZoneOption[];
  isOpenManual: boolean;
  isDeliveryActive: boolean;
  deliveryZoneNote: string;
  weeklySchedule: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>;
  themeColor: string;
  fontStyle: string;
  adminPin: string;
}

// --- DEFAULTS ---
const DEFAULT_SCHEDULE: ShopProfile["weeklySchedule"] = {
  Mon: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Tue: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Wed: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Thu: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  Fri: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
  Sat: { isOpen: true, openTime: "10:00", closeTime: "22:00" },
  Sun: { isOpen: false, openTime: "10:00", closeTime: "18:00" },
};

const DEFAULT_DELIVERY_ZONES: DeliveryZoneOption[] = [
  { name: "Local Town / Nearby", price: 250 },
  { name: "Mid-Distance Suburbs", price: 400 },
  { name: "Outskirts / Far Radius", price: 600 },
];

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
    headerBanner: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000",
    deliveryZones: DEFAULT_DELIVERY_ZONES,
    isOpenManual: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery within Montego Bay main town & Hip Strip.",
    weeklySchedule: DEFAULT_SCHEDULE,
    themeColor: "#d4522d",
    fontStyle: "system-ui",
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
    headerBanner: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000",
    deliveryZones: DEFAULT_DELIVERY_ZONES,
    isOpenManual: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Local Montego Bay delivery.",
    weeklySchedule: DEFAULT_SCHEDULE,
    themeColor: "#2d6a4f",
    fontStyle: "system-ui",
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
    isSpecial: true,
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
    isSpecial: false,
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
    isSpecial: false,
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
    isSpecial: false,
  },
];

// --- MAIN APP ---
export default function App() {
  const [shops, setShops] = useState<ShopProfile[]>(DEFAULT_SHOPS);
  const [currentShopId, setCurrentShopId] = useState<string>("mamas-yard");
  const [menu, setMenu] = useState<Dish[]>(INITIAL_MENU);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Items");
  const [likedDishIds, setLikedDishIds] = useState<Record<string, boolean>>({});

  // Auth
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isMasterLoggedIn, setIsMasterLoggedIn] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");

  // Admin Tabs
  const [activeAdminTab, setActiveAdminTab] = useState<"control" | "orders" | "menu" | "settings" | "devChat">("control");
  const [activeMasterTab, setActiveMasterTab] = useState<"shops" | "supabase" | "devChat">("shops");

  // UI
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [selectedDishForCart, setSelectedDishForCart] = useState<Dish | null>(null);
  const [optSpice, setOptSpice] = useState("Medium");
  const [optGravy, setOptGravy] = useState("Normal");
  const [optKetchup, setOptKetchup] = useState(false);
  const [optPepper, setOptPepper] = useState(false);

  // Checkout
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0);
  const [orderType, setOrderType] = useState<"Delivery" | "Pickup">("Delivery");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [driverTip, setDriverTip] = useState(0);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Chat & Custom Dish
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    "mamas-yard": [{ id: "c1", sender: "master", text: "Welcome! System operational.", timestamp: "10:00 AM" }],
  });
  const [chatInput, setChatInput] = useState("");
  const [showCustomDishModal, setShowCustomDishModal] = useState(false);
  const [customDishName, setCustomDishName] = useState("");
  const [customDishPrice, setCustomDishPrice] = useState("");
  const [customDishNotes, setCustomDishNotes] = useState("");

  // Menu Editor
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishForm, setDishForm] = useState<{ name: string; price: string; description: string; category: Dish["category"]; image: string; isSpecial: boolean }>({
    name: "",
    price: "",
    description: "",
    category: "Mains",
    image: "",
    isSpecial: false,
  });

  // Master
  const [newShopName, setNewShopName] = useState("");
  const [newShopPin, setNewShopPin] = useState("");
  const [masterPin, setMasterPin] = useState("9999");

  const currentShop = shops.find((s) => s.id === currentShopId) || shops[0];
  const currentDeliveryFee = orderType === "Delivery" ? (currentShop.deliveryZones[selectedZoneIndex]?.price || 300) : 0;
  const subtotal = cart.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  const total = subtotal + currentDeliveryFee + driverTip;

  const handleAdminLogin = () => {
    const input = adminPinInput.trim();
    if (input === masterPin) {
      setIsMasterLoggedIn(true);
      setIsAdminLoggedIn(true);
      setAdminPinInput("");
      return;
    }

    const matchedShop = shops.find((s) => s.pin === input || s.adminPin === input);
    if (matchedShop) {
      setCurrentShopId(matchedShop.id);
      setIsAdminLoggedIn(true);
      setAdminPinInput("");
      return;
    }

    alert("Invalid PIN");
    setAdminPinInput("");
  };

  const handleToggleLike = (dishId: string) => {
    const isLiked = likedDishIds[dishId];
    setLikedDishIds((prev) => ({ ...prev, [dishId]: !isLiked }));
    setMenu((prev) => prev.map((d) => (d.id === dishId ? { ...d, likes: isLiked ? d.likes - 1 : d.likes + 1 } : d)));
  };

  const handleOpenCustomizeModal = (dish: Dish) => {
    setSelectedDishForCart(dish);
    setOptSpice("Medium");
    setOptGravy("Normal");
    setOptKetchup(false);
    setOptPepper(false);
  };

  const handleConfirmAddToCart = () => {
    if (!selectedDishForCart) return;
    setCart((prev) => [
      ...prev,
      {
        dish: selectedDishForCart,
        quantity: 1,
        spiceLevel: optSpice,
        gravyType: optGravy,
        addKetchup: optKetchup,
        addPepper: optPepper,
        isItemCompleted: false,
      },
    ]);
    setSelectedDishForCart(null);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item)));
  };

  const handleFetchGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        setCustomerAddress((prev) => (prev ? `${prev} | 📍 GPS: ${mapUrl}` : `📍 GPS: ${mapUrl}`));
        setIsFetchingLocation(false);
      },
      () => {
        alert("Unable to get GPS location.");
        setIsFetchingLocation(false);
      }
    );
  };

  const handleDispatchOrder = (platform: "whatsapp" | "instagram" | "tiktok" | "facebook") => {
    if (!customerName.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (orderType === "Delivery" && !customerAddress.trim()) {
      alert("Please enter a delivery address.");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      shopId: currentShopId,
      customerName,
      customerAddress,
      items: cart,
      subtotal,
      deliveryFee: currentDeliveryFee,
      tip: driverTip,
      total,
      orderType,
      deliveryZone: currentShop.deliveryZones[selectedZoneIndex]?.name || "Standard",
      paymentMethod,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Pending",
    };

    setOrders((prev) => [newOrder, ...prev]);

    let msg = `*New Order - ${currentShop.name}*\n\n`;
    cart.forEach((item, i) => {
      msg += `${i + 1}. *${item.dish.name}* (x${item.quantity}) - $${item.dish.price * item.quantity} JMD\n`;
    });
    msg += `\n*Total:* $${total} JMD\n*Customer:* ${customerName}`;

    const encodedMsg = encodeURIComponent(msg);
    let url = "";

    if (platform === "whatsapp") url = `https://wa.me/${currentShop.whatsapp}?text=${encodedMsg}`;
    else if (platform === "instagram") url = `https://instagram.com/${currentShop.instagram.replace("@", "")}`;
    else if (platform === "tiktok") url = `https://tiktok.com/${currentShop.tiktok.replace("@", "")}`;
    else if (platform === "facebook") url = `https://facebook.com/${currentShop.facebook}`;

    window.open(url, "_blank");
    setCart([]);
    setCustomerName("");
    setCustomerAddress("");
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order["status"], estimatedTime?: string) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus, estimatedTime: estimatedTime || o.estimatedTime } : o
    );
    setOrders(updatedOrders);
  };

  const handleToggleItemCompleted = (orderId: string, itemIndex: number) => {
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        const updatedItems = o.items.map((it, idx) =>
          idx === itemIndex ? { ...it, isItemCompleted: !it.isItemCompleted } : it
        );
        return { ...o, items: updatedItems };
      }
      return o;
    });
    setOrders(updatedOrders);
  };

  const handleAddCustomDish = () => {
    if (!customDishName || !customDishPrice) {
      alert("Provide a name and price.");
      return;
    }
    const newDish: Dish = {
      id: Date.now().toString(),
      name: customDishName,
      price: parseFloat(customDishPrice) || 0,
      description: customDishNotes || "Custom dish",
      category: "Mains",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300",
      inStock: true,
      likes: 0,
      isSpecial: false,
    };
    setCart((prev) => [
      ...prev,
      { dish: newDish, quantity: 1, spiceLevel: "Normal", gravyType: "Normal", addKetchup: false, addPepper: false, isItemCompleted: false },
    ]);
    setShowCustomDishModal(false);
    setCustomDishName("");
    setCustomDishPrice("");
    setCustomDishNotes("");
  };

  const handleSaveDish = () => {
    if (!dishForm.name || !dishForm.price) return;
    if (editingDish) {
      const updatedMenu = menu.map((d) =>
        d.id === editingDish.id
          ? { ...d, name: dishForm.name, price: parseFloat(dishForm.price) || 0, description: dishForm.description, category: dishForm.category, image: dishForm.image || d.image, isSpecial: dishForm.isSpecial }
          : d
      );
      setMenu(updatedMenu);
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
        isSpecial: dishForm.isSpecial,
      };
      setMenu((prev) => [...prev, newDish]);
    }
    setEditingDish(null);
    setDishForm({ name: "", price: "", description: "", category: "Mains", image: "", isSpecial: false });
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

  const handleHeaderBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShops((prev) =>
          prev.map((s) => (s.id === currentShopId ? { ...s, headerBanner: reader.result as string } : s))
        );
      };
      reader.readAsDataURL(file);
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

  const updateCurrentShop = (key: keyof ShopProfile, value: any) => {
    setShops((prev) =>
      prev.map((s) => (s.id === currentShopId ? { ...s, [key]: value } : s))
    );
  };

  const filteredMenu = selectedCategory === "All Items" ? menu : menu.filter((item) => item.category === selectedCategory);

  return (
    <div style={{ backgroundColor: "#f8f8f8", minHeight: "100vh", fontFamily: currentShop.fontStyle }} className="w-full">
      {/* HEADER */}
      <header style={{ backgroundColor: "#fff", borderBottom: "1px solid #ddd", position: "sticky", top: 0, zIndex: 40, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#000", margin: 0 }}>{currentShop.name}</h1>
            <p style={{ fontSize: "13px", color: "#666", margin: "4px 0 0" }}>{currentShop.tagline}</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {isAdminLoggedIn ? (
              <>
                <span style={{ fontSize: "11px", backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "6px 12px", borderRadius: "20px", fontWeight: "bold" }}>
                  {isMasterLoggedIn ? "👑 Master" : "⚙️ Admin"}
                </span>
                <button onClick={() => { setIsAdminLoggedIn(false); setIsMasterLoggedIn(false); setShowAdminModal(false); }} style={{ backgroundColor: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: "12px" }}>
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => setShowAdminModal(true)} style={{ backgroundColor: "#d4522d", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                🔒 Admin
              </button>
            )}
          </div>
        </div>

        {currentShop.headerBanner && (
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
            <img src={currentShop.headerBanner} alt="Header" onClick={() => setZoomedImage(currentShop.headerBanner)} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", cursor: "pointer" }} />
          </div>
        )}

        {!currentShop.isOpenManual && (
          <div style={{ maxWidth: "1280px", margin: "12px auto 0", padding: "0 16px" }}>
            <div style={{ backgroundColor: "#ffebee", borderLeft: "4px solid #d32f2f", padding: "12px", borderRadius: "4px", fontSize: "12px", color: "#c62828" }}>
              ⛔ Closed. Check business hours.
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 16px", display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>
        {/* MENU SECTION */}
        <div>
          {/* Category Selector */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "24px", paddingBottom: "8px" }}>
            {["All Items", "Mains", "Drinks", "Snacks", "Sides", "Soups"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: selectedCategory === cat ? currentShop.themeColor : "#fff",
                  color: selectedCategory === cat ? "#fff" : "#333",
                  border: "1px solid #ddd",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: selectedCategory === cat ? "bold" : "normal",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Today's Menu ({filteredMenu.length})</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {filteredMenu.map((item) => (
              <div key={item.id} style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "12px", display: "flex", gap: "12px", border: "1px solid #e0e0e0", cursor: "pointer", transition: "all 0.3s" }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                <img src={item.image} alt={item.name} onClick={() => setZoomedImage(item.image)} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", cursor: "pointer" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "6px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#000" }}>{item.name}</h3>
                      {item.isSpecial && <span style={{ backgroundColor: "#ffd700", color: "#000", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>⭐ Special</span>}
                    </div>
                    <span style={{ color: "#d4522d", fontWeight: "bold", fontSize: "14px" }}>${item.price}</span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#666", margin: "4px 0 8px", lineHeight: "1.4" }}>{item.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {item.inStock ? (
                      <button onClick={() => handleOpenCustomizeModal(item)} style={{ backgroundColor: "#d4522d", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>
                        + Add
                      </button>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#d32f2f", fontWeight: "bold" }}>Out of Stock</span>
                    )}
                    <button onClick={() => handleToggleLike(item.id)} style={{ backgroundColor: "transparent", border: "none", color: likedDishIds[item.id] ? "#e91e63" : "#999", cursor: "pointer", fontSize: "11px" }}>
                      ❤️ {item.likes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CART SIDEBAR */}
        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", border: "1px solid #e0e0e0", height: "fit-content", position: "sticky", top: "100px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <ShoppingCart style={{ width: "18px", height: "18px", color: "#d4522d" }} />
            <h2 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>Cart ({cart.length})</h2>
          </div>

          {cart.length === 0 ? (
            <p style={{ fontSize: "11px", color: "#999", textAlign: "center", margin: "16px 0" }}>Empty cart</p>
          ) : (
            <>
              <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
                {cart.map((item, idx) => (
                  <div key={idx} style={{ fontSize: "11px", marginBottom: "8px", padding: "8px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <div style={{ fontWeight: "bold", color: "#000" }}>{item.quantity}x {item.dish.name}</div>
                        <div style={{ color: "#666", marginTop: "2px" }}>{item.spiceLevel} • {item.gravyType}</div>
                      </div>
                      <button onClick={() => removeFromCart(idx)} style={{ backgroundColor: "transparent", border: "none", color: "#d32f2f", cursor: "pointer", padding: 0 }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: "11px", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                {orderType === "Delivery" && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>Delivery</span>
                    <span>${currentDeliveryFee}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "12px", marginTop: "6px" }}>
                  <span>Total</span>
                  <span style={{ color: "#d4522d" }}>${total}</span>
                </div>
              </div>

              <input type="text" placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: "100%", padding: "6px", marginBottom: "6px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "11px", boxSizing: "border-box" }} />
              {orderType === "Delivery" && <input type="text" placeholder="Address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} style={{ width: "100%", padding: "6px", marginBottom: "6px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "11px", boxSizing: "border-box" }} />}

              <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                <button onClick={() => setOrderType("Delivery")} style={{ flex: 1, padding: "6px", backgroundColor: orderType === "Delivery" ? "#d4522d" : "#eee", color: orderType === "Delivery" ? "#fff" : "#333", border: "none", borderRadius: "4px", fontSize: "10px", cursor: "pointer", fontWeight: "bold" }}>
                  🚗 Delivery
                </button>
                <button onClick={() => setOrderType("Pickup")} style={{ flex: 1, padding: "6px", backgroundColor: orderType === "Pickup" ? "#d4522d" : "#eee", color: orderType === "Pickup" ? "#fff" : "#333", border: "none", borderRadius: "4px", fontSize: "10px", cursor: "pointer", fontWeight: "bold" }}>
                  🏪 Pickup
                </button>
              </div>

              <button onClick={() => handleDispatchOrder("whatsapp")} style={{ width: "100%", backgroundColor: "#25D366", color: "#fff", border: "none", padding: "10px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                📱 WhatsApp
              </button>
            </>
          )}
        </div>
      </main>

      {/* ADMIN MODAL */}
      {showAdminModal && !isAdminLoggedIn && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "8px", width: "90%", maxWidth: "400px", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: "bold" }}>🔐 Admin PIN</h3>
            <input type="password" placeholder="Enter PIN" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", textAlign: "center", boxSizing: "border-box" }} maxLength={4} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleAdminLogin} style={{ flex: 1, padding: "10px", backgroundColor: "#d4522d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                Unlock
              </button>
              <button onClick={() => setShowAdminModal(false)} style={{ flex: 1, padding: "10px", backgroundColor: "#eee", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PANEL */}
      {showAdminModal && isAdminLoggedIn && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "16px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "8px", width: "100%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: "#f8f8f8" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>{isMasterLoggedIn ? "👑 Master Control" : "⚙️ Admin Panel"}</h2>
              <button onClick={() => { setIsAdminLoggedIn(false); setIsMasterLoggedIn(false); setShowAdminModal(false); }} style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", fontSize: "18px" }}>
                ✕
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              {/* Tab Navigation */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid #eee", paddingBottom: "12px", overflowX: "auto" }}>
                {isMasterLoggedIn ? (
                  <>
                    <button onClick={() => setActiveMasterTab("shops")} style={{ backgroundColor: activeMasterTab === "shops" ? "#d4522d" : "#eee", color: activeMasterTab === "shops" ? "#fff" : "#333", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", whiteSpace: "nowrap" }}>
                      🏪 Shops
                    </button>
                    <button onClick={() => setActiveMasterTab("supabase")} style={{ backgroundColor: activeMasterTab === "supabase" ? "#d4522d" : "#eee", color: activeMasterTab === "supabase" ? "#fff" : "#333", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", whiteSpace: "nowrap" }}>
                      ⚡ Supabase
                    </button>
                    <button onClick={() => setActiveMasterTab("devChat")} style={{ backgroundColor: activeMasterTab === "devChat" ? "#d4522d" : "#eee", color: activeMasterTab === "devChat" ? "#fff" : "#333", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", whiteSpace: "nowrap" }}>
                      💬 Chat
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setActiveAdminTab("control")} style={{ backgroundColor: activeAdminTab === "control" ? "#d4522d" : "#eee", color: activeAdminTab === "control" ? "#fff" : "#333", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>
                      Control
                    </button>
                    <button onClick={() => setActiveAdminTab("orders")} style={{ backgroundColor: activeAdminTab === "orders" ? "#d4522d" : "#eee", color: activeAdminTab === "orders" ? "#fff" : "#333", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>
                      Orders ({orders.filter((o) => o.shopId === currentShopId).length})
                    </button>
                    <button onClick={() => setActiveAdminTab("menu")} style={{ backgroundColor: activeAdminTab === "menu" ? "#d4522d" : "#eee", color: activeAdminTab === "menu" ? "#fff" : "#333", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>
                      Menu
                    </button>
                    <button onClick={() => setActiveAdminTab("settings")} style={{ backgroundColor: activeAdminTab === "settings" ? "#d4522d" : "#eee", color: activeAdminTab === "settings" ? "#fff" : "#333", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>
                      Settings
                    </button>
                    <button onClick={() => setActiveAdminTab("devChat")} style={{ backgroundColor: activeAdminTab === "devChat" ? "#d4522d" : "#eee", color: activeAdminTab === "devChat" ? "#fff" : "#333", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>
                      Chat
                    </button>
                  </>
                )}
              </div>

              {/* CONTROL TAB */}
              {activeAdminTab === "control" && !isMasterLoggedIn && (
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px" }}>⏰ Operations</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => updateCurrentShop("isOpenManual", !currentShop.isOpenManual)} style={{ flex: 1, padding: "10px", backgroundColor: currentShop.isOpenManual ? "#2e7d32" : "#d32f2f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}>
                      {currentShop.isOpenManual ? "🟢 OPEN" : "🔴 CLOSED"}
                    </button>
                    <button onClick={() => updateCurrentShop("isDeliveryActive", !currentShop.isDeliveryActive)} style={{ flex: 1, padding: "10px", backgroundColor: currentShop.isDeliveryActive ? "#2e7d32" : "#d32f2f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}>
                      {currentShop.isDeliveryActive ? "🟢 DELIVERY ON" : "🔴 DELIVERY OFF"}
                    </button>
                  </div>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeAdminTab === "orders" && !isMasterLoggedIn && (
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px" }}>📋 Orders</h3>
                  {orders.filter((o) => o.shopId === currentShopId).length === 0 ? (
                    <p style={{ fontSize: "12px", color: "#999" }}>No orders yet.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "12px" }}>
                      {orders
                        .filter((o) => o.shopId === currentShopId)
                        .map((ord) => (
                          <div key={ord.id} style={{ backgroundColor: "#f5f5f5", padding: "12px", borderRadius: "6px", border: "1px solid #ddd" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px" }}>
                              <span style={{ fontWeight: "bold" }}>Order #{ord.id.slice(-4)}</span>
                              <span style={{ color: "#d4522d", fontWeight: "bold" }}>${ord.total}</span>
                            </div>
                            <div style={{ fontSize: "10px", color: "#666", marginBottom: "6px" }}>
                              👤 {ord.customerName} | {ord.orderType}
                            </div>
                            <select value={ord.status} onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as Order["status"])} style={{ width: "100%", padding: "6px", marginBottom: "6px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "10px" }}>
                              <option value="Pending">Pending</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Ready">Ready</option>
                              <option value="Completed">Completed</option>
                            </select>
                            <div style={{ fontSize: "10px", color: "#666" }}>
                              {ord.items.map((it, i) => (
                                <div key={i} style={{ cursor: "pointer", padding: "2px 0", textDecoration: it.isItemCompleted ? "line-through" : "none", opacity: it.isItemCompleted ? 0.6 : 1 }} onClick={() => handleToggleItemCompleted(ord.id, i)}>
                                  {it.isItemCompleted ? "✅" : "🍳"} {it.quantity}x {it.dish.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* MENU TAB */}
              {activeAdminTab === "menu" && !isMasterLoggedIn && (
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px" }}>{editingDish ? "Edit Dish" : "Add Dish"}</h3>
                  <div style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
                    <input type="text" placeholder="Name" value={dishForm.name} onChange={(e) => setDishForm((p) => ({ ...p, name: e.target.value }))} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "11px", boxSizing: "border-box" }} />
                    <input type="number" placeholder="Price" value={dishForm.price} onChange={(e) => setDishForm((p) => ({ ...p, price: e.target.value }))} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "11px", boxSizing: "border-box" }} />
                    <textarea placeholder="Description" value={dishForm.description} onChange={(e) => setDishForm((p) => ({ ...p, description: e.target.value }))} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "11px", minHeight: "60px", boxSizing: "border-box" }} />
                    <select value={dishForm.category} onChange={(e) => setDishForm((p) => ({ ...p, category: e.target.value as Dish["category"] }))} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "11px" }}>
                      <option value="Mains">Mains</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Sides">Sides</option>
                      <option value="Soups">Soups</option>
                    </select>
                    <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <input type="checkbox" checked={dishForm.isSpecial} onChange={(e) => setDishForm((p) => ({ ...p, isSpecial: e.target.checked }))} /> Special
                    </label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: "10px" }} />
                    <button onClick={handleSaveDish} style={{ padding: "8px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}>
                      {editingDish ? "Update" : "Add"}
                    </button>
                  </div>

                  <h3 style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>Dishes ({menu.length})</h3>
                  <div style={{ display: "grid", gap: "6px" }}>
                    {menu.map((item) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f5f5f5", padding: "8px", borderRadius: "4px" }}>
                        <div style={{ fontSize: "10px" }}>
                          <div style={{ fontWeight: "bold" }}>{item.name} - ${item.price}</div>
                          <div style={{ color: "#666" }}>{item.category}</div>
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button onClick={() => { setEditingDish(item); setDishForm({ name: item.name, price: item.price.toString(), description: item.description, category: item.category, image: item.image, isSpecial: item.isSpecial || false }); }} style={{ backgroundColor: "#0288d1", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "3px", fontSize: "9px", cursor: "pointer" }}>
                            Edit
                          </button>
                          <button onClick={() => setMenu((prev) => prev.filter((d) => d.id !== item.id))} style={{ backgroundColor: "#d32f2f", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "3px", fontSize: "9px", cursor: "pointer" }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeAdminTab === "settings" && !isMasterLoggedIn && (
                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "10px", color: "#666", display: "block", marginBottom: "4px" }}>Shop Name</label>
                    <input type="text" value={currentShop.name} onChange={(e) => updateCurrentShop("name", e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "11px", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "#666", display: "block", marginBottom: "4px" }}>Theme Color</label>
                    <input type="color" value={currentShop.themeColor} onChange={(e) => updateCurrentShop("themeColor", e.target.value)} style={{ width: "100%", height: "30px", border: "none", borderRadius: "4px", cursor: "pointer" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "#666", display: "block", marginBottom: "4px" }}>WhatsApp</label>
                    <input type="text" value={currentShop.whatsapp} onChange={(e) => updateCurrentShop("whatsapp", e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "11px", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "#666", display: "block", marginBottom: "4px" }}>Header Banner</label>
                    <input type="file" accept="image/*" onChange={handleHeaderBannerUpload} style={{ fontSize: "10px" }} />
                  </div>
                </div>
              )}

              {/* DEV CHAT */}
              {activeAdminTab === "devChat" && (
                <div>
                  <h3 style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>💬 Developer Chat</h3>
                  <div style={{ backgroundColor: "#f5f5f5", height: "150px", overflowY: "auto", padding: "8px", borderRadius: "4px", marginBottom: "8px", fontSize: "10px" }}>
                    {(chatMessages[currentShopId] || []).map((msg) => (
                      <div key={msg.id} style={{ marginBottom: "6px", textAlign: msg.sender === "admin" ? "right" : "left" }}>
                        <div style={{ backgroundColor: msg.sender === "admin" ? "#d4522d" : "#ccc", color: msg.sender === "admin" ? "#fff" : "#000", padding: "6px 8px", borderRadius: "4px", display: "inline-block", maxWidth: "80%", wordWrap: "break-word" }}>
                          {msg.text}
                        </div>
                        <div style={{ fontSize: "9px", color: "#999", marginTop: "2px" }}>{msg.timestamp}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input type="text" placeholder="Message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} style={{ flex: 1, padding: "6px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "10px" }} />
                    <button onClick={() => handleSendMessage(isMasterLoggedIn ? "master" : "admin")} style={{ backgroundColor: "#d4522d", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "10px" }}>
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* SHOPS TAB (MASTER) */}
              {activeMasterTab === "shops" && isMasterLoggedIn && (
                <div>
                  <h3 style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>Register New Shop</h3>
                  <div style={{ display: "grid", gap: "6px", marginBottom: "12px" }}>
                    <input type="text" placeholder="Shop Name" value={newShopName} onChange={(e) => setNewShopName(e.target.value)} style={{ padding: "6px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "10px", boxSizing: "border-box" }} />
                    <input type="text" placeholder="PIN (4 digits)" value={newShopPin} onChange={(e) => setNewShopPin(e.target.value)} style={{ padding: "6px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "10px", boxSizing: "border-box" }} maxLength={4} />
                    <button onClick={() => { if (newShopName && newShopPin) { const newShop: ShopProfile = { ...DEFAULT_SHOPS[0], id: newShopName.toLowerCase().replace(/[^a-z0-9]/g, "-"), name: newShopName, pin: newShopPin, adminPin: newShopPin }; setShops((prev) => [...prev, newShop]); setNewShopName(""); setNewShopPin(""); } }} style={{ padding: "6px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "10px", fontWeight: "bold" }}>
                      Create Shop
                    </button>
                  </div>

                  <h3 style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>Select Shop</h3>
                  <select value={currentShopId} onChange={(e) => setCurrentShopId(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "10px" }}>
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (PIN: {s.pin})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMIZE DISH MODAL */}
      {selectedDishForCart && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", width: "90%", maxWidth: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>Customize: {selectedDishForCart.name}</h3>
              <button onClick={() => setSelectedDishForCart(null)} style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "10px", color: "#666", display: "block", marginBottom: "4px" }}>Gravy Level</label>
                <select value={optGravy} onChange={(e) => setOptGravy(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "10px" }}>
                  <option>Normal Gravy</option>
                  <option>Extra Gravy</option>
                  <option>No Gravy / Dry</option>
                  <option>Gravy on Side</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "10px", color: "#666", display: "block", marginBottom: "4px" }}>Spice Level</label>
                <select value={optSpice} onChange={(e) => setOptSpice(e.target.value)} style={{ width: "100%", padding: "6px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "10px" }}>
                  <option>Mild</option>
                  <option>Medium</option>
                  <option>Hot & Spicy</option>
                </select>
              </div>
              <label style={{ fontSize: "10px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input type="checkbox" checked={optKetchup} onChange={(e) => setOptKetchup(e.target.checked)} /> Add Ketchup
              </label>
              <label style={{ fontSize: "10px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input type="checkbox" checked={optPepper} onChange={(e) => setOptPepper(e.target.checked)} /> Add Scotch Bonnet Pepper
              </label>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleConfirmAddToCart} style={{ flex: 1, padding: "8px", backgroundColor: "#d4522d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}>
                Add to Cart
              </button>
              <button onClick={() => setSelectedDishForCart(null)} style={{ flex: 1, padding: "8px", backgroundColor: "#eee", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DISH MODAL */}
      {showCustomDishModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", width: "90%", maxWidth: "400px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "bold" }}>🍲 Custom Dish Order</h3>
            <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
              <input type="text" placeholder="Dish Name" value={customDishName} onChange={(e) => setCustomDishName(e.target.value)} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "11px", boxSizing: "border-box" }} />
              <input type="number" placeholder="Price (JMD)" value={customDishPrice} onChange={(e) => setCustomDishPrice(e.target.value)} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "11px", boxSizing: "border-box" }} />
              <textarea placeholder="Special instructions..." value={customDishNotes} onChange={(e) => setCustomDishNotes(e.target.value)} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "11px", minHeight: "60px", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleAddCustomDish} style={{ flex: 1, padding: "8px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}>
                Add to Cart
              </button>
              <button onClick={() => setShowCustomDishModal(false)} style={{ flex: 1, padding: "8px", backgroundColor: "#eee", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE */}
      {zoomedImage && (
        <div onClick={() => setZoomedImage(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, cursor: "pointer" }}>
          <img src={zoomedImage} alt="Full" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} />
        </div>
      )}
    </div>
  );
                              }
