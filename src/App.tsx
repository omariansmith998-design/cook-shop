import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, Settings, Lock, LogOut, Plus, Search, Home, MoreVertical, AlertCircle, CheckCircle2, Clock, Zap } from "lucide-react";

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

interface AdminSession {
  shopId: string;
  role: "admin" | "master";
  loginTime: number;
  lastActivity: number;
}

// --- SECURITY HELPERS ---
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const PIN_SALT = "cookshop_2024"; // In production, use bcrypt or argon2

// Basic PIN hashing (for demo - use proper bcrypt in production)
const hashPin = (pin: string): string => {
  return btoa(pin + PIN_SALT).slice(0, 32);
};

const validatePin = (inputPin: string, storedHash: string): boolean => {
  return hashPin(inputPin) === storedHash;
};

const isSessionValid = (session: AdminSession): boolean => {
  const now = Date.now();
  return now - session.lastActivity < SESSION_TIMEOUT_MS;
};

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
    pin: hashPin("1234"),
    headerBanner: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000",
    deliveryZones: DEFAULT_DELIVERY_ZONES,
    isOpenManual: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery within Montego Bay main town & Hip Strip.",
    weeklySchedule: DEFAULT_SCHEDULE,
    themeColor: "#d4522d",
    fontStyle: "system-ui",
    adminPin: hashPin("1234"),
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
    pin: hashPin("5678"),
    headerBanner: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000",
    deliveryZones: DEFAULT_DELIVERY_ZONES,
    isOpenManual: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Local Montego Bay delivery.",
    weeklySchedule: DEFAULT_SCHEDULE,
    themeColor: "#2d6a4f",
    fontStyle: "system-ui",
    adminPin: hashPin("5678"),
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

// --- COMPONENT: Login Modal ---
function LoginModal({ onLogin, onClose }: { onLogin: (role: "admin" | "master", shopId: string) => void; onClose: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [masterPin] = useState("9999");
  const [shops] = useState(DEFAULT_SHOPS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (validatePin(pin, hashPin(masterPin))) {
      onLogin("master", "master");
      return;
    }

    const matchedShop = shops.find((s) => validatePin(pin, s.adminPin));
    if (matchedShop) {
      onLogin("admin", matchedShop.id);
      return;
    }

    setError("Invalid PIN. Please try again.");
    setPin("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-2xl tracking-widest"
              maxLength={4}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Unlock
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">Demo: Use 9999 for Master or shop PIN</p>
      </div>
    </div>
  );
}

// --- MAIN APP ---
export default function App() {
  const [shops, setShops] = useState<ShopProfile[]>(DEFAULT_SHOPS);
  const [currentShopId, setCurrentShopId] = useState<string>("mamas-yard");
  const [menu, setMenu] = useState<Dish[]>(INITIAL_MENU);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Items");
  const [likedDishIds, setLikedDishIds] = useState<Record<string, boolean>>({});

  // Authentication & Session Management
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const sessionCheckInterval = useRef<ReturnType<typeof setInterval>>();

  // UI State
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDishForCart, setSelectedDishForCart] = useState<Dish | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Customization Options
  const [optSpice, setOptSpice] = useState("Medium");
  const [optGravy, setOptGravy] = useState("Normal");
  const [optKetchup, setOptKetchup] = useState(false);
  const [optPepper, setOptPepper] = useState(false);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0);

  // Checkout
  const [orderType, setOrderType] = useState<"Delivery" | "Pickup">("Delivery");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [driverTip, setDriverTip] = useState(0);

  // Cloud Config
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem("SUPABASE_URL") || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem("SUPABASE_ANON_KEY") || "");

  const currentShop = shops.find((s) => s.id === currentShopId) || shops[0];
  const currentDeliveryFee = orderType === "Delivery" ? currentShop.deliveryZones[selectedZoneIndex]?.price || 300 : 0;
  const subtotal = cart.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  const total = subtotal + currentDeliveryFee + driverTip;

  // Session timeout check
  useEffect(() => {
    if (!adminSession) return;

    sessionCheckInterval.current = setInterval(() => {
      setAdminSession((prev) => {
        if (prev && !isSessionValid(prev)) {
          alert("Session expired. Please log in again.");
          return null;
        }
        return prev ? { ...prev, lastActivity: Date.now() } : null;
      });
    }, 60000); // Check every minute

    return () => clearInterval(sessionCheckInterval.current);
  }, [adminSession]);

  // Activity tracker
  const updateActivity = () => {
    if (adminSession) {
      setAdminSession((prev) => (prev ? { ...prev, lastActivity: Date.now() } : null));
    }
  };

  const handleLogin = (role: "admin" | "master", shopId: string) => {
    const session: AdminSession = {
      shopId: role === "master" ? shopId : shopId,
      role,
      loginTime: Date.now(),
      lastActivity: Date.now(),
    };
    setAdminSession(session);
    setShowLoginModal(false);
    if (shopId !== "master") setCurrentShopId(shopId);
  };

  const handleLogout = () => {
    setAdminSession(null);
  };

  const handleToggleLike = (dishId: string) => {
    const isLiked = likedDishIds[dishId];
    setLikedDishIds((prev) => ({ ...prev, [dishId]: !isLiked }));
    setMenu((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, likes: isLiked ? d.likes - 1 : d.likes + 1 } : d))
    );
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

  const handleDispatchOrder = async (platform: "whatsapp" | "instagram" | "tiktok" | "facebook") => {
    if (!customerName.trim()) {
      alert("Please enter your name/nickname.");
      return;
    }
    if (orderType === "Delivery" && !customerAddress.trim()) {
      alert("Please enter a delivery address.");
      return;
    }
    if (cart.length === 0) {
      alert("Your cart is empty.");
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

  const filteredMenu = selectedCategory === "All Items" ? menu : menu.filter((item) => item.category === selectedCategory);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen" style={{ fontFamily: currentShop.fontStyle }}>
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentShop.name}</h1>
              <p className="text-sm text-gray-600">{currentShop.tagline}</p>
            </div>
            <div className="flex items-center gap-3">
              {adminSession ? (
                <>
                  <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    {adminSession.role === "master" ? "👑 Master" : "⚙️ Admin"}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition font-medium text-sm"
                >
                  <Lock className="w-4 h-4" /> Admin
                </button>
              )}
            </div>
          </div>

          {currentShop.headerBanner && (
            <img
              src={currentShop.headerBanner}
              alt="Header"
              onClick={() => setZoomedImage(currentShop.headerBanner)}
              className="w-full h-32 object-cover rounded-lg cursor-pointer"
            />
          )}

          {!currentShop.isOpenManual && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">Cookshop is closed right now. Check back during business hours.</p>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MENU SECTION */}
          <div className="lg:col-span-2">
            {/* Category Selector */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {["All Items", "Mains", "Drinks", "Snacks", "Sides", "Soups"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? "bg-orange-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Menu</h2>
              {filteredMenu.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition border border-gray-200 p-4 flex gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    onClick={() => setZoomedImage(item.image)}
                    className="w-24 h-24 object-cover rounded-lg cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.isSpecial && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">⭐ Special</span>}
                      </div>
                      <span className="text-lg font-bold text-orange-600">${item.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      {item.inStock ? (
                        <button
                          onClick={() => handleOpenCustomizeModal(item)}
                          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      ) : (
                        <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                      )}
                      <button
                        onClick={() => handleToggleLike(item.id)}
                        className={`text-sm font-medium ${
                          likedDishIds[item.id] ? "text-red-500" : "text-gray-400"
                        }`}
                      >
                        ❤️ {item.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CART SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
                <span className="ml-auto bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                  {cart.length}
                </span>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">
                            {item.quantity}x {item.dish.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{item.spiceLevel} | {item.gravyType}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">${item.dish.price * item.quantity}</span>
                          <button
                            onClick={() => removeFromCart(idx)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>${subtotal}</span>
                    </div>
                    {orderType === "Delivery" && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Delivery</span>
                        <span>${currentDeliveryFee}</span>
                      </div>
                    )}
                    {driverTip > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tip</span>
                        <span>${driverTip}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span className="text-orange-600">${total}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {orderType === "Delivery" && (
                      <input
                        type="text"
                        placeholder="Delivery Address *"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    )}
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setOrderType("Delivery")}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                        orderType === "Delivery"
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      🚚 Delivery
                    </button>
                    <button
                      onClick={() => setOrderType("Pickup")}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                        orderType === "Pickup"
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      🏪 Pickup
                    </button>
                  </div>

                  <button
                    onClick={() => handleDispatchOrder("whatsapp")}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" /> Place Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* LOGIN MODAL */}
      {showLoginModal && <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}

      {/* CUSTOMIZE DISH MODAL */}
      {selectedDishForCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Customize: {selectedDishForCart.name}</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gravy Level</label>
                <select
                  value={optGravy}
                  onChange={(e) => setOptGravy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option>Normal Gravy</option>
                  <option>Extra Gravy</option>
                  <option>No Gravy / Dry</option>
                  <option>Gravy on Side</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spice Level</label>
                <select
                  value={optSpice}
                  onChange={(e) => setOptSpice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option>Mild</option>
                  <option>Medium</option>
                  <option>Hot & Spicy</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optKetchup}
                  onChange={(e) => setOptKetchup(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">Add Ketchup</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optPepper}
                  onChange={(e) => setOptPepper(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">Add Scotch Bonnet Pepper</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Add to Cart
              </button>
              <button
                onClick={() => setSelectedDishForCart(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 cursor-pointer"
        >
          <img src={zoomedImage} alt="Full View" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
