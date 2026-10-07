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
    themeColor: "#10b981", // Emerald Jamaican vibe
    fontStyle: "Sans-Serif",
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
    themeColor: "#f59e0b", // Warm Amber Earthy vibe
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

export default function App() {
  const [shops, setShops] = useState<ShopProfile[]>(DEFAULT_SHOPS);
  const [currentShopId, setCurrentShopId] = useState<string>("mamas-yard");
  const [menu, setMenu] = useState<Dish[]>(INITIAL_MENU);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Items");

  // Track liked dishes for toggle like/unlike
  const [likedDishIds, setLikedDishIds] = useState<Record<string, boolean>>({});

  // Share & QR Code Modal State
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Item Customization Modal State
  const [selectedDishForCart, setSelectedDishForCart] = useState<Dish | null>(null);
  const [optSpice, setOptSpice] = useState<string>("Medium");
  const [optGravy, setOptGravy] = useState<string>("Normal");
  const [optKetchup, setOptKetchup] = useState<boolean>(false);
  const [optPepper, setOptPepper] = useState<boolean>(false);

  // Delivery Zone Selection State
  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number>(0);

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
    "mamas-yard": [{ id: "c1", sender: "master", text: "Welcome! System operational.", timestamp: "10:00 AM" }],
  });
  const [chatInput, setChatInput] = useState<string>("");

  // Custom Dish Modal State
  const [showCustomDishModal, setShowCustomDishModal] = useState<boolean>(false);
  const [customDishName, setCustomDishName] = useState<string>("");
  const [customDishPrice, setCustomDishPrice] = useState<string>("");
  const [customDishNotes, setCustomDishNotes] = useState<string>("");

  // Menu Editor Modal State
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishForm, setDishForm] = useState<{ name: string; price: string; description: string; category: Dish["category"]; image: string; isSpecial: boolean }>({
    name: "",
    price: "",
    description: "",
    category: "Mains",
    image: "",
    isSpecial: false,
  });

  // Master Control New Shop Registration
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

  // Full-screen Image Lightbox
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const currentShop = shops.find((s) => s.id === currentShopId) || shops[0];
  const sisterShop = shops.find((s) => s.id !== currentShopId) || shops[1] || shops[0];
  const currentDeliveryFee = orderType === "Delivery" ? (currentShop.deliveryZones[selectedZoneIndex]?.price || 300) : 0;

  // REST Supabase helper
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

  // Sync Cloud Data via Supabase
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

  // Handle Like / Unlike Toggle
  const handleToggleLike = (dishId: string) => {
    const isLiked = likedDishIds[dishId];

    setLikedDishIds((prev) => ({
      ...prev,
      [dishId]: !isLiked,
    }));

    setMenu((prev) =>
      prev.map((d) =>
        d.id === dishId
          ? { ...d, likes: isLiked ? d.likes - 1 : d.likes + 1 }
          : d
      )
    );
  };

  const handleSaveSupabaseConfig = () => {
    localStorage.setItem("SUPABASE_URL", supabaseUrl);
    localStorage.setItem("SUPABASE_ANON_KEY", supabaseAnonKey);
    alert("Supabase credentials saved successfully!");
  };

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
        alert("Unable to retrieve GPS location. Please enter manually.");
        setIsFetchingLocation(false);
      }
    );
  };

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

  const subtotal = cart.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  const total = subtotal + currentDeliveryFee + driverTip;

  const handleAddCustomDish = () => {
    if (!customDishName || !customDishPrice) {
      alert("Please provide a name and price for the custom dish.");
      return;
    }
    const newDish: Dish = {
      id: Date.now().toString(),
      name: customDishName,
      price: parseFloat(customDishPrice) || 0,
      description: customDishNotes || "Custom dish order",
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

  // Admin order status update & customer alert generator
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"], estimatedTime?: string) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId
        ? { ...o, status: newStatus, estimatedTime: estimatedTime || o.estimatedTime }
        : o
    );
    setOrders(updatedOrders);
    const updatedOrder = updatedOrders.find((o) => o.id === orderId);
    if (updatedOrder) {
      await supabaseFetch("orders", "POST", updatedOrder);

      // Generate notification message for customer
      let statusMsg = `*Order Update - ${currentShop.name}*\n`;
      statusMsg += `Hi ${updatedOrder.customerName}, your Order #${updatedOrder.id.slice(-4)} status has changed:\n\n`;
      statusMsg += `📌 *Status:* ${newStatus.toUpperCase()}\n`;
      if (estimatedTime) {
        statusMsg += `⏱️ *Estimated Time:* Ready in approx ${estimatedTime}\n`;
      }
      if (newStatus === "Ready") {
        statusMsg += updatedOrder.orderType === "Delivery" ? `🚚 Your order is cooked and on its way!` : `🏪 Your order is fresh & ready for pickup at our counter!`;
      } else if (newStatus === "Completed") {
        statusMsg += `🎉 Order completed! Thank you for dining with us!`;
      }
      
      const encoded = encodeURIComponent(statusMsg);
      window.open(`https://wa.me/?text=${encoded}`, "_blank");
    }
  };

  // Toggle individual item complete state on an active order
  const handleToggleItemCompleted = async (orderId: string, itemIndex: number) => {
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
    const updatedOrder = updatedOrders.find((o) => o.id === orderId);
    if (updatedOrder) await supabaseFetch("orders", "POST", updatedOrder);
  };

  const buildOrderSummaryText = () => {
    let msg = `*New Order - ${currentShop.name}*\n\n`;
    cart.forEach((item, i) => {
      msg += `${i + 1}. *${item.dish.name}* (x${item.quantity}) - $${item.dish.price * item.quantity} JMD\n`;
      msg += `   Spice: ${item.spiceLevel} | Gravy: ${item.gravyType}`;
      if (item.addKetchup) msg += ` | +Ketchup`;
      if (item.addPepper) msg += ` | +Pepper`;
      msg += `\n`;
    });
    msg += `\n*Order Type:* ${orderType}\n`;
    if (orderType === "Delivery") {
      msg += `*Delivery Zone:* ${currentShop.deliveryZones[selectedZoneIndex]?.name || "Standard"}\n`;
      msg += `*Delivery Fee:* $${currentDeliveryFee} JMD\n`;
      msg += `*Address / Landmark:* ${customerAddress}\n`;
    }
    if (driverTip > 0) {
      msg += `*Tip:* $${driverTip} JMD\n`;
    }
    msg += `*Total Amount:* $${total} JMD\n`;
    msg += `*Customer Name:* ${customerName}\n`;
    msg += `*Payment Method:* ${paymentMethod}\n\n`;
    msg += `🔗 Reopen App: ${window.location.href}`;
    return msg;
  };

  const handleCopyOrderText = () => {
    const text = buildOrderSummaryText();
    navigator.clipboard.writeText(text);
    alert("Order summary copied to clipboard! You can paste it in DM.");
  };

  const handleDispatchOrder = async (platform: "whatsapp" | "instagram" | "tiktok" | "facebook") => {
    if (!customerName.trim()) {
      alert("Please enter your name/nickname before placing order.");
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
    await supabaseFetch("orders", "POST", newOrder);

    const rawMsg = buildOrderSummaryText();
    const encodedMsg = encodeURIComponent(rawMsg);
    let url = "";

    if (platform === "whatsapp") {
      url = `https://wa.me/${currentShop.whatsapp}?text=${encodedMsg}`;
    } else if (platform === "instagram") {
      handleCopyOrderText();
      url = `https://instagram.com/${currentShop.instagram.replace("@", "")}`;
    } else if (platform === "tiktok") {
      handleCopyOrderText();
      url = `https://tiktok.com/${currentShop.tiktok.replace("@", "")}`;
    } else if (platform === "facebook") {
      handleCopyOrderText();
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
          ? {
              ...d,
              name: dishForm.name,
              price: parseFloat(dishForm.price) || 0,
              description: dishForm.description,
              category: dishForm.category,
              image: dishForm.image || d.image,
              isSpecial: dishForm.isSpecial,
            }
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
        isSpecial: dishForm.isSpecial,
      };
      setMenu((prev) => [...prev, newDish]);
      await supabaseFetch("menu", "POST", newDish);
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
        updateCurrentShop("headerBanner", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredMenu =
    selectedCategory === "All Items"
      ? menu
      : menu.filter((item) => item.category === selectedCategory);

  return (
    <div className="bg-neutral-900 text-white min-h-screen font-sans">
      {/* CROSS PROMOTION BANNER */}
      {sisterShop && (
        <div 
          onClick={() => setCurrentShopId(sisterShop.id)}
          className="bg-neutral-800 text-neutral-300 text-xs py-2 px-4 text-center cursor-pointer hover:bg-neutral-700 transition flex items-center justify-center gap-2 border-b border-neutral-700"
        >
          <span>👀 Craving something else? Check out <strong>{sisterShop.name}</strong></span>
          <span className="text-emerald-400 font-bold">Switch Shop &rarr;</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <header className="relative bg-neutral-800 border-b border-neutral-700 p-4 max-w-xl mx-auto rounded-b-xl shadow-lg">
        {currentShop.headerBanner && (
          <div className="relative group overflow-hidden rounded-lg mb-3">
            <img
              src={currentShop.headerBanner}
              alt="Header Banner"
              onClick={() => setZoomedImage(currentShop.headerBanner)}
              className="w-full h-36 object-cover cursor-pointer group-hover:scale-105 transition duration-300"
            />
            <span
              onClick={() => setZoomedImage(currentShop.headerBanner)}
              className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded cursor-pointer font-medium"
            >
              🔍 Tap to View
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="m-0 text-xl font-extrabold tracking-tight text-white">{currentShop.name}</h1>
            <p className="m-0 text-xs text-neutral-400 font-medium mt-0.5">{currentShop.tagline}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-neutral-700 hover:bg-neutral-600 text-white border border-neutral-600 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm"
            >
              📲 Share / QR
            </button>
            <button
              onClick={() => setShowAdminModal(true)}
              style={{ backgroundColor: currentShop.themeColor }}
              className="text-white border-none px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-sm hover:opacity-90"
            >
              🔒 Admin
            </button>
          </div>
        </div>

        {!currentShop.isOpenManual && (
          <div className="mt-3 bg-red-950/80 text-red-400 border border-red-600/50 p-2.5 rounded-lg text-center text-xs font-semibold">
            ⛔ Cookshop closed right now. Check back during business hours.
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="p-4 max-w-xl mx-auto">
        {/* CATEGORY SELECTOR & CUSTOM DISH */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {["All Items", "Mains", "Drinks", "Snacks", "Sides", "Soups"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: selectedCategory === cat ? currentShop.themeColor : "#262626",
                }}
                className={`text-white border-none px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap cursor-pointer transition font-medium ${
                  selectedCategory === cat ? "shadow-md" : "hover:bg-neutral-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCustomDishModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white border-none px-3 py-1.5 rounded-full text-xs cursor-pointer ml-2 font-bold whitespace-nowrap transition shadow-sm"
          >
            + Custom Dish
          </button>
        </div>

        {/* MENU LIST */}
        <h2 className="text-base font-bold border-b border-neutral-800 pb-2 mb-3 text-neutral-200">
          Today's Menu
        </h2>
        <div className="grid gap-3">
          {filteredMenu.map((item) => (
            <div
              key={item.id}
              className={`bg-neutral-800/90 rounded-xl p-3 flex gap-3 items-center border ${
                item.isSpecial ? "border-amber-400/80 shadow-amber-900/20 shadow-md" : "border-neutral-700/50"
              }`}
            >
              <img
                src={item.image}
                alt={item.name}
                onClick={() => setZoomedImage(item.image)}
                className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <h3 className="m-0 text-sm font-bold text-white truncate">{item.name}</h3>
                    {item.isSpecial && (
                      <span className="bg-amber-400 text-black text-[9px] px-1.5 py-0.5 rounded font-black tracking-wide uppercase shrink-0">
                        ⭐ Special
                      </span>
                    )}
                  </div>
                  <span className="text-emerald-400 font-extrabold text-sm shrink-0">
                    ${item.price} JMD
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 my-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex justify-between items-center mt-2">
                  {item.inStock ? (
                    <button
                      onClick={() => handleOpenCustomizeModal(item)}
                      style={{ backgroundColor: currentShop.themeColor }}
                      className="text-white border-none px-3 py-1 rounded-md text-xs cursor-pointer font-bold transition hover:opacity-90 shadow-sm"
                    >
                      + Add to Plate
                    </button>
                  ) : (
                    <span className="text-xs text-red-400 font-semibold">Out of Stock</span>
                  )}
                  <button
                    onClick={() => handleToggleLike(item.id)}
                    className={`bg-transparent border-none text-xs cursor-pointer font-medium transition ${
                      likedDishIds[item.id] ? "text-pink-500 font-bold" : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    ❤️ {item.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER PLATE / CART */}
        <div className="mt-6 bg-neutral-800/90 rounded-xl p-4 border border-neutral-700/60 shadow-xl">
          <h2 className="text-base font-bold m-0 mb-3 text-white flex items-center gap-2">
            🛒 Your Order Plate <span className="text-xs font-normal text-neutral-400">({cart.length} items)</span>
          </h2>
          {cart.length === 0 ? (
            <p className="text-xs text-neutral-400 italic m-0">Your plate is empty.</p>
          ) : (
            <div>
              <div className="space-y-2 mb-3 divide-y divide-neutral-700/50">
                {cart.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-neutral-100">
                        {item.quantity}x {item.dish.name}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Spice: {item.spiceLevel} | Gravy: {item.gravyType}
                        {item.addKetchup && " | +Ketchup"}
                        {item.addPepper && " | +Pepper"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-400">${item.dish.price * item.quantity} JMD</span>
                      <button 
                        onClick={() => removeFromCart(idx)} 
                        className="bg-transparent text-red-400 hover:text-red-300 border-none cursor-pointer text-sm font-bold"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* SERVICE TOGGLES */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setOrderType("Delivery")}
                  style={{
                    backgroundColor: orderType === "Delivery" ? currentShop.themeColor : "#262626",
                  }}
                  className="flex-1 py-2 border-none rounded-lg text-white text-xs font-bold cursor-pointer transition shadow-sm"
                >
                  🚚 Delivery
                </button>
                <button
                  onClick={() => setOrderType("Pickup")}
                  style={{
                    backgroundColor: orderType === "Pickup" ? currentShop.themeColor : "#262626",
                  }}
                  className="flex-1 py-2 border-none rounded-lg text-white text-xs font-bold cursor-pointer transition shadow-sm"
                >
                  🏪 Store Pickup
                </button>
              </div>

              {/* DYNAMIC DELIVERY ZONE SELECTOR */}
              {orderType === "Delivery" && (
                <div className="mt-3">
                  <label className="text-[11px] text-neutral-400 block mb-1 font-medium">
                    Delivery Zone:
                  </label>
                  <select
                    value={selectedZoneIndex}
                    onChange={(e) => setSelectedZoneIndex(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    {currentShop.deliveryZones.map((zone, i) => (
                      <option key={i} value={i}>
                        {zone.name} (+${zone.price} JMD)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* PAYMENT METHOD SELECTOR */}
              <div className="mt-3">
                <label className="text-[11px] text-neutral-400 block mb-1 font-medium">
                  Payment Method:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="Cash">Cash on Delivery / Pickup</option>
                  <option value="Lynk / Bank Transfer">Lynk / Bank Transfer</option>
                </select>
              </div>

              {/* DRIVER TIP INPUT */}
              <div className="mt-3">
                <label className="text-[11px] text-neutral-400 block mb-1 font-medium">
                  Driver Tip ($ JMD):
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={driverTip || ""}
                  onChange={(e) => setDriverTip(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* CUSTOMER INPUTS WITH GPS BUTTON */}
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  placeholder="Your Name / Nickname *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                />
                {orderType === "Delivery" && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Delivery Address / Landmark *"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      onClick={handleFetchGPS}
                      disabled={isFetchingLocation}
                      className="bg-sky-600 hover:bg-sky-500 text-white border-none px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition shadow-sm"
                    >
                      {isFetchingLocation ? "..." : "📍 GPS"}
                    </button>
                  </div>
                )}
              </div>

              {/* TOTAL & DISPATCH BUTTONS */}
              <div className="mt-4 border-t border-neutral-700 pt-3">
                <div className="flex justify-between items-center text-base font-extrabold text-white">
                  <span>Total</span>
                  <span className="text-emerald-400">${total} JMD</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button 
                    onClick={() => handleDispatchOrder("whatsapp")} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white border-none py-2.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    📱 WhatsApp
                  </button>
                  <button 
                    onClick={() => handleDispatchOrder("instagram")} 
                    className="bg-pink-600 hover:bg-pink-500 text-white border-none py-2.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    📸 Instagram DM
                  </button>
                  <button 
                    onClick={() => handleDispatchOrder("tiktok")} 
                    className="bg-cyan-500 hover:bg-cyan-400 text-black border-none py-2.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    🎵 TikTok DM
                  </button>
                  <button 
                    onClick={() => handleDispatchOrder("facebook")} 
                    className="bg-blue-600 hover:bg-blue-500 text-white border-none py-2.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    📘 Facebook DM
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER SOCIAL PORTALS */}
        <footer className="mt-8 py-4 border-t border-neutral-800 text-center">
          <p className="text-[11px] text-neutral-400 mb-2">Visit our social channels:</p>
          <div className="flex justify-center gap-4 text-xs font-medium">
            <a href={`https://instagram.com/${currentShop.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="text-pink-400 hover:underline">
              Instagram ({currentShop.instagram})
            </a>
            <a href={`https://tiktok.com/${currentShop.tiktok.replace("@", "")}`} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
              TikTok ({currentShop.tiktok})
            </a>
            <a href={`https://facebook.com/${currentShop.facebook}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              Facebook
            </a>
          </div>
          {currentShop.address && (
            <p className="text-[10px] text-neutral-500 mt-3">
              📍 {currentShop.address} {currentShop.mapLink && <a href={currentShop.mapLink} target="_blank" rel="noreferrer" className="text-emerald-400 underline ml-1">(Map Link)</a>}
            </p>
          )}
        </footer>
      </main>

      {/* SHARE & QR CODE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[1500] p-4">
          <div className="bg-neutral-800 p-5 rounded-2xl w-full max-w-xs text-center border border-neutral-700 shadow-2xl">
            <h3 className="m-0 mb-1 text-base font-bold text-white">📲 Share {currentShop.name}</h3>
            <p className="text-[11px] text-neutral-400 m-0 mb-4">Scan this QR code or copy the link to open your menu.</p>
            
            <div className="bg-white p-3 rounded-xl inline-block mb-4 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.href)}`}
                alt="Menu QR Code"
                className="w-44 h-44 block"
              />
            </div>

            <div className="grid gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Menu link copied to clipboard!");
                }}
                style={{ backgroundColor: currentShop.themeColor }}
                className="py-2.5 text-white border-none rounded-lg text-xs font-bold cursor-pointer transition shadow-md"
              >
                📋 Copy Menu Link
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="py-2 bg-neutral-700 text-neutral-300 border-none rounded-lg text-xs cursor-pointer hover:bg-neutral-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISH CUSTOMIZATION MODAL */}
      {selectedDishForCart && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1200] p-4">
          <div className="bg-neutral-800 p-5 rounded-2xl w-full max-w-sm border border-neutral-700 shadow-2xl">
            <h3 className="m-0 mb-3 text-base font-bold text-white">Customize: {selectedDishForCart.name}</h3>
            
            <div className="grid gap-3 mb-4">
              <div>
                <label className="text-[11px] text-neutral-400 font-medium">Gravy Level:</label>
                <select value={optGravy} onChange={(e) => setOptGravy(e.target.value)} className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs mt-1 outline-none">
                  <option value="Normal">Normal Gravy</option>
                  <option value="Extra Gravy">Extra Gravy</option>
                  <option value="No Gravy / Dry">No Gravy (Dry)</option>
                  <option value="Gravy on Side">Gravy on Side</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 font-medium">Spice Level:</label>
                <select value={optSpice} onChange={(e) => setOptSpice(e.target.value)} className="w-full p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs mt-1 outline-none">
                  <option value="Mild">Mild</option>
                  <option value="Medium">Medium</option>
                  <option value="Hot & Spicy">Hot & Spicy</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <label className="text-xs flex items-center gap-2 cursor-pointer text-neutral-200">
                  <input type="checkbox" checked={optKetchup} onChange={(e) => setOptKetchup(e.target.checked)} className="rounded text-emerald-500" />
                  Add Ketchup
                </label>
                <label className="text-xs flex items-center gap-2 cursor-pointer text-neutral-200">
                  <input type="checkbox" checked={optPepper} onChange={(e) => setOptPepper(e.target.checked)} className="rounded text-emerald-500" />
                  Add Scotch Bonnet Pepper
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleConfirmAddToCart} 
                style={{ backgroundColor: currentShop.themeColor }}
                className="flex-1 py-2 text-white border-none rounded-lg font-bold text-xs cursor-pointer shadow-md transition hover:opacity-90"
              >
                Add to Plate
              </button>
              <button onClick={() => setSelectedDishForCart(null)} className="py-2 px-4 bg-neutral-700 text-white border-none rounded-lg text-xs cursor-pointer hover:bg-neutral-600 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showAdminModal && !isAdminLoggedIn && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-neutral-800 p-5 rounded-2xl w-full max-w-sm border border-neutral-700 shadow-2xl">
            <h3 className="m-0 mb-3 text-base font-bold text-white">🔐 Enter Admin PIN</h3>
            <input
              type="password"
              placeholder="****"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-lg text-center tracking-widest mb-3 outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleAdminLogin} 
                style={{ backgroundColor: currentShop.themeColor }}
                className="flex-1 py-2 text-white border-none rounded-lg text-xs font-bold cursor-pointer transition shadow-md hover:opacity-90"
              >
                Unlock Panel
              </button>
              <button onClick={() => setShowAdminModal(false)} className="py-2 px-4 bg-neutral-700 text-white border-none rounded-lg text-xs cursor-pointer hover:bg-neutral-600 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER CONTROL CENTER */}
      {showAdminModal && isMasterLoggedIn && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
          <div className="bg-neutral-800 p-5 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-neutral-700 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-700">
              <h3 className="m-0 text-base font-bold text-red-500 flex items-center gap-2">👑 Master Control Center</h3>
              <button onClick={() => { setIsMasterLoggedIn(false); setIsAdminLoggedIn(false); setShowAdminModal(false); }} className="bg-neutral-700 text-white border-none px-3 py-1 rounded text-xs cursor-pointer hover:bg-neutral-600">
                Logout Master
              </button>
            </div>

            <div className="flex gap-2 mb-4 border-b border-neutral-700 pb-2 overflow-x-auto">
              <button onClick={() => setActiveMasterTab("shops")} className={`py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition border-none ${activeMasterTab === "shops" ? "bg-red-600 text-white" : "bg-neutral-700 text-neutral-300"}`}>
                Shops Manager
              </button>
              <button onClick={() => setActiveMasterTab("supabase")} className={`py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition border-none ${activeMasterTab === "supabase" ? "bg-red-600 text-white" : "bg-neutral-700 text-neutral-300"}`}>
                ⚡ Supabase Config
              </button>
              <button onClick={() => setActiveMasterTab("devChat")} className={`py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition border-none ${activeMasterTab === "devChat" ? "bg-red-600 text-white" : "bg-neutral-700 text-neutral-300"}`}>
                Dev Chat
              </button>
              <button onClick={() => setActiveMasterTab("masterPin")} className={`py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer transition border-none ${activeMasterTab === "masterPin" ? "bg-red-600 text-white" : "bg-neutral-700 text-neutral-300"}`}>
                Master PIN
              </button>
            </div>

            {/* SHOPS MANAGER */}
            {activeMasterTab === "shops" && (
              <div>
                <h4 className="m-0 mb-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">Register New Cookshop</h4>
                <div className="grid gap-2 mb-4">
                  <input type="text" placeholder="Cookshop Name" value={newShopName} onChange={(e) => setNewShopName(e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
                  <input type="text" placeholder="Access PIN (4 digits)" value={newShopPin} onChange={(e) => setNewShopPin(e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
                  <input type="text" placeholder="WhatsApp Number" value={newShopWhatsapp} onChange={(e) => setNewShopWhatsapp(e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
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
                    className="p-2 bg-red-600 hover:bg-red-500 text-white border-none rounded-lg text-xs font-bold cursor-pointer transition shadow-md"
                  >
                    Create Shop
                  </button>
                </div>

                <h4 className="m-0 mb-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">Select Active Cookshop ({shops.length})</h4>
                <select
                  value={currentShopId}
                  onChange={(e) => {
                    setCurrentShopId(e.target.value);
                    setIsMasterLoggedIn(false);
                  }}
                  className="w-full p-2.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs font-medium cursor-pointer outline-none"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (PIN: {s.pin} | WA: {s.whatsapp})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SUPABASE CONFIG */}
            {activeMasterTab === "supabase" && (
              <div className="grid gap-3">
                <h4 className="m-0 text-xs font-bold text-neutral-300 uppercase tracking-wider">⚡ Connect Database (Supabase)</h4>
                <p className="text-[11px] text-neutral-400 m-0">
                  Enter your project API URL and public Anon key below. These will persist in browser storage and connect your app directly to your cloud tables.
                </p>

                <label className="text-[11px] text-neutral-400 font-medium">Supabase Project URL:</label>
                <input
                  type="text"
                  placeholder="https://xyz.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none"
                />

                <label className="text-[11px] text-neutral-400 font-medium">Supabase Anon API Key:</label>
                <textarea
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none h-20"
                />

                <button
                  onClick={handleSaveSupabaseConfig}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white border-none rounded-lg text-xs font-bold cursor-pointer transition shadow-md"
                >
                  Save Supabase Settings
                </button>
              </div>
            )}

            {/* DEV CHAT */}
            {activeMasterTab === "devChat" && (
              <div>
                <div className="h-48 overflow-y-auto border border-neutral-700 rounded-lg p-2.5 mb-2 bg-neutral-900 space-y-2">
                  {(chatMessages[currentShopId] || []).map((msg) => (
                    <div key={msg.id} className={`text-${msg.sender === "master" ? "right" : "left"}`}>
                      <span className="text-[10px] text-neutral-500 block mb-0.5">{msg.timestamp}</span>
                      <div className={`inline-block p-2 rounded-lg text-xs ${msg.sender === "master" ? "bg-red-600 text-white" : "bg-neutral-800 text-neutral-200"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Message shop admin..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
                  <button onClick={() => handleSendMessage("master")} className="bg-red-600 hover:bg-red-500 text-white border-none px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition">
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* MASTER PIN */}
            {activeMasterTab === "masterPin" && (
              <div className="grid gap-2">
                <h4 className="m-0 text-xs font-bold text-neutral-300 uppercase tracking-wider">Update Master PIN</h4>
                <input type="text" placeholder="New Master PIN (4 digits)" value={masterPin} onChange={(e) => setMasterPin(e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
                <button onClick={() => alert("Master PIN updated successfully.")} className="p-2 bg-red-600 text-white border-none rounded-lg text-xs font-bold cursor-pointer hover:bg-red-500 transition">
                  Save Master PIN
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHOP ADMIN PANEL */}
      {showAdminModal && isAdminLoggedIn && !isMasterLoggedIn && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
          <div className="bg-neutral-800 p-5 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-neutral-700 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-700">
              <h3 className="m-0 text-base font-bold text-white">⚙️ {currentShop.name} Admin Panel</h3>
              <button onClick={() => { setIsAdminLoggedIn(false); setShowAdminModal(false); }} className="bg-neutral-700 text-white border-none px-3 py-1 rounded text-xs cursor-pointer hover:bg-neutral-600">
                Logout Admin
              </button>
            </div>

            <div className="flex gap-2 mb-4 border-b border-neutral-700 pb-2 overflow-x-auto">
              <button 
                onClick={() => setActiveAdminTab("control")} 
                style={{ backgroundColor: activeAdminTab === "control" ? currentShop.themeColor : "#262626" }}
                className="py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer border-none text-white transition"
              >
                🎛️ Control
              </button>
              <button 
                onClick={() => setActiveAdminTab("orders")} 
                style={{ backgroundColor: activeAdminTab === "orders" ? currentShop.themeColor : "#262626" }}
                className="py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer border-none text-white transition"
              >
                📋 Orders ({orders.filter((o) => o.shopId === currentShopId).length})
              </button>
              <button 
                onClick={() => setActiveAdminTab("menu")} 
                style={{ backgroundColor: activeAdminTab === "menu" ? currentShop.themeColor : "#262626" }}
                className="py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer border-none text-white transition"
              >
                📜 Menu
              </button>
              <button 
                onClick={() => setActiveAdminTab("settings")} 
                style={{ backgroundColor: activeAdminTab === "settings" ? currentShop.themeColor : "#262626" }}
                className="py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer border-none text-white transition"
              >
                ⚙️ Settings
              </button>
              <button 
                onClick={() => setActiveAdminTab("devChat")} 
                style={{ backgroundColor: activeAdminTab === "devChat" ? currentShop.themeColor : "#262626" }}
                className="py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer border-none text-white transition"
              >
                💬 Dev Chat
              </button>
            </div>

            {/* OPERATIONAL CONTROL */}
            {activeAdminTab === "control" && (
              <div>
                <h4 className="m-0 mb-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">⏰ Operational Toggles</h4>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => updateCurrentShop("isOpenManual", !currentShop.isOpenManual)} className={`flex-1 py-2 text-white border-none rounded-lg text-xs font-bold cursor-pointer transition ${currentShop.isOpenManual ? "bg-emerald-600" : "bg-red-600"}`}>
                    {currentShop.isOpenManual ? "STORE OPEN" : "STORE CLOSED"}
                  </button>
                  <button onClick={() => updateCurrentShop("isDeliveryActive", !currentShop.isDeliveryActive)} className={`flex-1 py-2 text-white border-none rounded-lg text-xs font-bold cursor-pointer transition ${currentShop.isDeliveryActive ? "bg-emerald-600" : "bg-red-600"}`}>
                    {currentShop.isDeliveryActive ? "DELIVERY ACTIVE" : "DELIVERY OFF"}
                  </button>
                </div>

                <h4 className="m-0 mb-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">📅 Weekly Schedule</h4>
                {Object.keys(currentShop.weeklySchedule).map((day) => (
                  <div key={day} className="flex items-center gap-2 mb-2 text-xs text-neutral-300">
                    <span className="w-8 font-bold">{day}:</span>
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
                      className="bg-neutral-900 text-white border border-neutral-700 rounded p-1 text-xs"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={currentShop.weeklySchedule[day].closeTime}
                      onChange={(e) => {
                        const updated = { ...currentShop.weeklySchedule, [day]: { ...currentShop.weeklySchedule[day], closeTime: e.target.value } };
                        updateCurrentShop("weeklySchedule", updated);
                      }}
                      className="bg-neutral-900 text-white border border-neutral-700 rounded p-1 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ORDERS, PREPARATION STATUS & DISH TICKETS */}
            {activeAdminTab === "orders" && (
              <div>
                <h4 className="m-0 mb-3 text-xs font-bold text-neutral-300 uppercase tracking-wider">🧾 Incoming Orders & Digital Receipts</h4>
                {orders.filter((o) => o.shopId === currentShopId).length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No active orders found for this shop.</p>
                ) : (
                  <div className="grid gap-3">
                    {orders
                      .filter((o) => o.shopId === currentShopId)
                      .map((ord) => (
                        <div key={ord.id} className="bg-neutral-900 border border-neutral-700/80 p-3 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-white">Order #{ord.id.slice(-4)}</span>
                            <span className="text-emerald-400 text-xs font-extrabold">${ord.total} JMD</span>
                          </div>
                          
                          <div className="text-[11px] text-neutral-400">
                            👤 {ord.customerName} | 🚚 {ord.orderType} ({ord.deliveryZone}) | ⏰ {ord.createdAt}
                          </div>
                          
                          {ord.customerAddress && (
                            <div className="text-[11px] text-sky-400">
                              📍 {ord.customerAddress}
                            </div>
                          )}

                          {/* ORDER STATUS CONTROL & TIME NOTIFIER */}
                          <div className="bg-neutral-800 p-2.5 rounded-lg space-y-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span>Status: <strong className={ord.status === "Ready" ? "text-emerald-400" : ord.status === "Preparing" ? "text-amber-400" : "text-white"}>{ord.status}</strong></span>
                              {ord.estimatedTime && <span className="text-amber-300 font-medium">⏱️ {ord.estimatedTime}</span>}
                            </div>

                            <div className="flex gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "Preparing", "15-20 mins")}
                                className="bg-amber-500 hover:bg-amber-400 text-black border-none px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition"
                              >
                                ⏳ Preparing (15m)
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "Preparing", "30-40 mins")}
                                className="bg-amber-500 hover:bg-amber-400 text-black border-none px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition"
                              >
                                ⏳ Preparing (30m)
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "Ready")}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white border-none px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition"
                              >
                                ✅ Mark Ready & Alert
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "Completed")}
                                className="bg-sky-600 hover:bg-sky-500 text-white border-none px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition"
                              >
                                🎉 Complete
                              </button>
                            </div>
                          </div>

                          {/* DISH ITEM-LEVEL CHECKLIST */}
                          <div className="border-t border-neutral-800 pt-2 text-[11px]">
                            <div className="text-[10px] text-neutral-400 mb-1">Item Checklist (Tap item to toggle done):</div>
                            {ord.items.map((it, i) => (
                              <div
                                key={i}
                                onClick={() => handleToggleItemCompleted(ord.id, i)}
                                className={`flex justify-between items-center py-1 cursor-pointer transition ${
                                  it.isItemCompleted ? "line-through text-emerald-400" : "text-neutral-200"
                                }`}
                              >
                                <div>
                                  {it.isItemCompleted ? "✅ " : "🍳 "}
                                  {it.quantity}x {it.dish.name} (${it.dish.price * it.quantity})
                                  <span className="text-neutral-400">
                                    {" "}[Spice: {it.spiceLevel}, Gravy: {it.gravyType}{it.addKetchup ? ", +Ketchup" : ""}{it.addPepper ? ", +Pepper" : ""}]
                                  </span>
                                </div>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded ${it.isItemCompleted ? "bg-emerald-800 text-emerald-200" : "bg-neutral-800 text-neutral-400"}`}>
                                  {it.isItemCompleted ? "Done" : "Cooking"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* MENU EDITOR */}
            {activeAdminTab === "menu" && (
              <div>
                <h4 className="m-0 mb-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">{editingDish ? "Edit Dish" : "Add New Dish"}</h4>
                <div className="grid gap-2 mb-4">
                  <input type="text" placeholder="Dish Name" value={dishForm.name} onChange={(e) => setDishForm((p) => ({ ...p, name: e.target.value }))} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
                  <input type="number" placeholder="Price (JMD)" value={dishForm.price} onChange={(e) => setDishForm((p) => ({ ...p, price: e.target.value }))} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
                  <textarea placeholder="Description" value={dishForm.description} onChange={(e) => setDishForm((p) => ({ ...p, description: e.target.value }))} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
                  <select value={dishForm.category} onChange={(e) => setDishForm((p) => ({ ...p, category: e.target.value as Dish["category"] }))} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none">
                    <option value="Mains">Mains</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Sides">Sides</option>
                    <option value="Soups">Soups</option>
                  </select>
                  <label className="text-xs flex items-center gap-2 text-neutral-300">
                    <input type="checkbox" checked={dishForm.isSpecial} onChange={(e) => setDishForm((p) => ({ ...p, isSpecial: e.target.checked }))} />
                    Mark as ⭐ Special / Featured Item
                  </label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs text-neutral-400" />
                  <button 
                    onClick={handleSaveDish} 
                    style={{ backgroundColor: currentShop.themeColor }}
                    className="p-2 text-white border-none rounded-lg text-xs font-bold cursor-pointer transition shadow-md hover:opacity-90"
                  >
                    {editingDish ? "Update Dish" : "Add Dish"}
                  </button>
                </div>

                <h4 className="m-0 mb-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">Current Items</h4>
                <div className="grid gap-2">
                  {menu.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                      <div>
                        <div className="font-bold text-xs text-white">
                          {item.name} (${item.price} JMD) {item.isSpecial && "⭐"}
                        </div>
                        <div className="text-[10px] text-neutral-400">{item.category}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={async () => {
                            const updatedMenu = menu.map((d) => (d.id === item.id ? { ...d, inStock: !d.inStock } : d));
                            setMenu(updatedMenu);
                            const updatedItem = updatedMenu.find((d) => d.id === item.id);
                            if (updatedItem) await supabaseFetch("menu", "POST", updatedItem);
                          }}
                          className={`border-none px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${item.inStock ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
                        >
                          {item.inStock ? "In Stock" : "Sold Out"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingDish(item);
                            setDishForm({ name: item.name, price: item.price.toString(), description: item.description, category: item.category, image: item.image, isSpecial: item.isSpecial || false });
                          }}
                          className="bg-sky-600 text-white border-none px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition hover:bg-sky-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setMenu((prev) => prev.filter((d) => d.id !== item.id))}
                          className="bg-neutral-800 text-red-400 border-none px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition hover:bg-neutral-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS (DELIVERY ZONES & BRANDING) */}
            {activeAdminTab === "settings" && (
              <div className="grid gap-2">
                <h4 className="m-0 mb-1 text-xs font-bold text-neutral-300 uppercase tracking-wider">🎨 Branding, Delivery & Location Settings</h4>

                <label className="text-[11px] text-neutral-400 font-medium">Upload Header Banner Image:</label>
                <input type="file" accept="image/*" onChange={handleHeaderBannerUpload} className="text-xs text-neutral-400" />
                {currentShop.headerBanner && (
                  <img src={currentShop.headerBanner} alt="Header Preview" className="w-full h-20 object-cover rounded-lg mt-1" />
                )}

                <label className="text-[11px] text-neutral-400 font-medium">Cookshop Name:</label>
                <input type="text" value={currentShop.name} onChange={(e) => updateCurrentShop("name", e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />

                <label className="text-[11px] text-neutral-400 font-medium">Font Style:</label>
                <select value={currentShop.fontStyle} onChange={(e) => updateCurrentShop("fontStyle", e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none">
                  <option value="Sans-Serif">Sans-Serif</option>
                  <option value="Monospace">Monospace</option>
                  <option value="Serif">Serif</option>
                  <option value="Cursive">Cursive</option>
                </select>

                <label className="text-[11px] text-neutral-400 font-medium">Theme Color:</label>
                <input type="color" value={currentShop.themeColor} onChange={(e) => updateCurrentShop("themeColor", e.target.value)} className="w-full h-10 border-none rounded cursor-pointer bg-transparent" />

                <h4 className="m-0 mt-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">🚚 Delivery Pricing Zones</h4>
                {currentShop.deliveryZones.map((zone, zIdx) => (
                  <div key={zIdx} className="flex gap-2">
                    <input
                      type="text"
                      value={zone.name}
                      onChange={(e) => {
                        const updated = [...currentShop.deliveryZones];
                        updated[zIdx].name = e.target.value;
                        updateCurrentShop("deliveryZones", updated);
                      }}
                      className="flex-1 p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none"
                    />
                    <input
                      type="number"
                      value={zone.price}
                      onChange={(e) => {
                        const updated = [...currentShop.deliveryZones];
                        updated[zIdx].price = parseFloat(e.target.value) || 0;
                        updateCurrentShop("deliveryZones", updated);
                      }}
                      className="w-24 p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none"
                    />
                  </div>
                ))}

                <label className="text-[11px] text-neutral-400 font-medium">Delivery Zone Coverage Note:</label>
                <input type="text" value={currentShop.deliveryZoneNote} onChange={(e) => updateCurrentShop("deliveryZoneNote", e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />

                <label className="text-[11px] text-neutral-400 font-medium">WhatsApp Number:</label>
                <input type="text" value={currentShop.whatsapp} onChange={(e) => updateCurrentShop("whatsapp", e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />

                <label className="text-[11px] text-neutral-400 font-medium">Instagram Handle:</label>
                <input type="text" value={currentShop.instagram} onChange={(e) => updateCurrentShop("instagram", e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />

                <label className="text-[11px] text-neutral-400 font-medium">TikTok Handle:</label>
                <input type="text" value={currentShop.tiktok} onChange={(e) => updateCurrentShop("tiktok", e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />

                <label className="text-[11px] text-neutral-400 font-medium">Facebook Name:</label>
                <input type="text" value={currentShop.facebook} onChange={(e) => updateCurrentShop("facebook", e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />

                <label className="text-[11px] text-neutral-400 font-medium">Physical Address / Location:</label>
                <input type="text" value={currentShop.address} onChange={(e) => updateCurrentShop("address", e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />

                <label className="text-[11px] text-neutral-400 font-medium">Google Maps Link:</label>
                <input type="text" value={currentShop.mapLink} onChange={(e) => updateCurrentShop("mapLink", e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />

                <label className="text-[11px] text-neutral-400 font-medium">Admin Access PIN:</label>
                <input type="text" value={currentShop.adminPin} onChange={(e) => updateCurrentShop("adminPin", e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
              </div>
            )}

            {/* DEV CHAT */}
            {activeAdminTab === "devChat" && (
              <div>
                <div className="h-48 overflow-y-auto border border-neutral-700 rounded-lg p-2.5 mb-2 bg-neutral-900 space-y-2">
                  {(chatMessages[currentShopId] || []).map((msg) => (
                    <div key={msg.id} className={`text-${msg.sender === "admin" ? "right" : "left"}`}>
                      <span className="text-[10px] text-neutral-500 block mb-0.5">{msg.timestamp}</span>
                      <div 
                        style={{ backgroundColor: msg.sender === "admin" ? currentShop.themeColor : "#262626" }}
                        className="inline-block p-2 rounded-lg text-xs text-white"
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Message developer..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
                  <button 
                    onClick={() => handleSendMessage("admin")} 
                    style={{ backgroundColor: currentShop.themeColor }}
                    className="text-white border-none px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition hover:opacity-90"
                  >
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-neutral-800 p-5 rounded-2xl w-full max-w-sm border border-neutral-700 shadow-2xl">
            <h3 className="m-0 mb-3 text-base font-bold text-white">🍲 Order Custom Dish</h3>
            <div className="grid gap-2 mb-3">
              <input type="text" placeholder="Dish Name (e.g. Steamed Fish)" value={customDishName} onChange={(e) => setCustomDishName(e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
              <input type="number" placeholder="Agreed Price ($ JMD)" value={customDishPrice} onChange={(e) => setCustomDishPrice(e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
              <textarea placeholder="Special instructions or notes..." value={customDishNotes} onChange={(e) => setCustomDishNotes(e.target.value)} className="p-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs outline-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddCustomDish} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white border-none rounded-lg text-xs font-bold cursor-pointer transition shadow-md">
                Add to Plate
              </button>
              <button onClick={() => setShowCustomDishModal(false)} className="py-2 px-4 bg-neutral-700 text-white border-none rounded-lg text-xs cursor-pointer hover:bg-neutral-600 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      {zoomedImage && (
        <div onClick={() => setZoomedImage(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[2000] p-4 cursor-pointer">
          <img src={zoomedImage} alt="Full View" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
