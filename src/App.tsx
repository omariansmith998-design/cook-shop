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
  instagram: string;
  facebook: string;
  deliveryFee: number;
  isOpen: boolean;
  isDeliveryActive: boolean;
  deliveryZoneNote: string;
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
    themeColor: "emerald",
    instagram: "mamas_yard_ja",
    facebook: "MamasYardCookshop",
    deliveryFee: 300,
    isOpen: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery within Montego Bay main town & Hip Strip. Hills/out-of-town = Pickup only.",
  },
  {
    id: "shop2",
    name: "Auntie's Ital Corner",
    tagline: "Fresh Natural Juices & Ital Stews",
    whatsapp: "18765555678",
    address: "Falmouth Main Road, Trelawny",
    pin: "5678",
    themeColor: "amber",
    instagram: "aunties_ital",
    facebook: "AuntiesItalCorner",
    deliveryFee: 250,
    isOpen: true,
    isDeliveryActive: true,
    deliveryZoneNote: "Delivery available across Falmouth coastal strip.",
  }
];

export default function App() {
  // --- STATE MANAGEMENT ---
  const [shops, setShops] = useState<ShopProfile[]>(() => {
    const saved = localStorage.getItem("cookshop_all_shops");
    return saved ? JSON.parse(saved) : DEFAULT_SHOPS;
  });

  // Active Shop Selection (default or via URL param ?shop=id)
  const [activeShopId, setActiveShopId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get("shop");
    if (shopParam && shops.some(s => s.id === shopParam)) return shopParam;
    return shops[0]?.id || "shop1";
  });

  const activeShop = shops.find(s => s.id === activeShopId) || shops[0];

  // Menus per shop
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

  // Orders per shop
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

  // --- PERSISTENCE & AUTO-PRUNING ---
  useEffect(() => {
    try {
      localStorage.setItem("cookshop_all_shops", JSON.stringify(shops));
      localStorage.setItem("cookshop_all_menus", JSON.stringify(menus));
      
      // Auto-prune receipt history to latest 50 entries per shop to avoid quota limits
      const prunedOrders: Record<string, Order[]> = {};
      Object.keys(orders).forEach(id => {
        prunedOrders[id] = (orders[id] || []).slice(0, 50);
      });
      localStorage.setItem("cookshop_all_orders", JSON.stringify(prunedOrders));
    } catch (err) {
      console.warn("Storage quota exceeded or warning:", err);
    }
  }, [shops, menus, orders]);

  // --- CANVAS IMAGE COMPRESSOR (~30KB max 500px) ---
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
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
          callback(compressedDataUrl);
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  // --- GPS GEOLOCATION PINNING ---
  const handlePinLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const mapsUrl = `https://maps.google.com/?q=${lat},${lon}`;
        setCustomerAddress(mapsUrl);
      },
      () => {
        alert("Unable to retrieve your location. Please type your address or landmark manually.");
      },
      { timeout: 10000 }
    );
  };

  // --- CART OPERATIONS ---
  const addToCart = (dish: Dish) => {
    setCart(prev => [
      ...prev,
      { dish, quantity: 1, spiceLevel, gravyLevel, notes: itemNotes }
    ]);
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

  // --- ORDER DISPATCHING & QUEUING ---
  const dispatchOrder = (method: "whatsapp" | "social") => {
    if (!customerName.trim()) {
      alert("Please enter your name or nickname so the cookshop knows who you are!");
      return;
    }
    if (orderType === "delivery" && !customerAddress.trim()) {
      alert("Please provide a delivery address or pin your GPS location!");
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

    // Save to active shop queue
    setOrders(prev => ({
      ...prev,
      [activeShop.id]: [newOrder, ...(prev[activeShop.id] || [])]
    }));

    setActiveReceipt(newOrder);
    setCart([]);

    // Format text
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
🔗 Reopen Menu / App: ${appRefSanitize(appReturnUrl)}`;

    if (method === "whatsapp") {
      const encoded = encodeURIComponent(fullText);
      const cleanPhone = activeShop.whatsapp.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    } else {
      navigator.clipboard.writeText(fullText);
      alert("Order receipt copied to clipboard! Paste it directly into your Instagram or Facebook DM.");
    }
  };

  const appRefSanitize = (url: string) => url;

  // --- ADMIN AUTHENTICATION ---
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

    alert("Invalid PIN. Please check your code.");
  };

  // --- ADMIN ACTIONS ---
  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(prev => ({
      ...prev,
      [activeShop.id]: (prev[activeShop.id] || []).map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    }));
  };

  const saveEditedDish = () => {
    if (!loggedInAdminShopId) return;
    if (!dishNameInput || !dishPriceInput) {
      alert("Dish name and price are required!");
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
      const newList = exists ? currentList.map(d => d.id === updatedDish.id ? updatedDish : d) : [updatedDish, ...currentList];
      return { ...prev, [loggedInAdminShopId]: newList };
    });

    setEditingDish(null);
    setDishNameInput("");
    setDishPriceInput("");
    setDishDescInput("");
    setDishImageInput("");
  };

  const deleteDish = (dishId: string) => {
    if (!loggedInAdminShopId) return;
    if (window.confirm("Are you sure you want to delete this dish?")) {
      setMenus(prev => ({
        ...prev,
        [loggedInAdminShopId]: (prev[loggedInAdminShopId] || []).filter(d => d.id !== dishId)
      }));
    }
  };

  const createNewShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName || !newShopWhatsapp) {
      alert("Shop Name and WhatsApp number are required!");
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
      themeColor: "emerald",
      instagram: "",
      facebook: "",
      deliveryFee: 300,
      isOpen: true,
      isDeliveryActive: true,
      deliveryZoneNote: "Standard delivery radius applies."
    };

    setShops(prev => [...prev, newShop]);
    setMenus(prev => ({ ...prev, [shopId]: [] }));
    setActiveShopId(shopId);

    setNewShopName("");
    setNewShopTagline("");
    setNewShopWhatsapp("");
    setNewShopAddress("");
    alert(`Shop "${newShop.name}" created successfully!`);
  };

  const changeMasterCredentials = () => {
    if (currentMasterPassCheck !== masterRecoveryPass) {
      alert("Incorrect Master Recovery Password! Access denied.");
      return;
    }
    if (!newMasterPinInput || newMasterPinInput.length !== 4) {
      alert("New Master PIN must be exactly 4 digits.");
      return;
    }

    localStorage.setItem("cookshop_master_pin", newMasterPinInput);
    setMasterPin(newMasterPinInput);
    if (newMasterRecoveryInput.trim()) {
      localStorage.setItem("cookshop_master_recovery", newMasterRecoveryInput);
      setMasterRecoveryPass(newMasterRecoveryInput);
    }
    setNewMasterPinInput("");
    setNewMasterRecoveryInput("");
    setCurrentMasterPassCheck("");
    alert("Master Developer PIN updated securely!");
  };

  // Theme color mapping
  const themeClasses: Record<string, { bg: string, text: string, border: string, badge: string }> = {
    emerald: { bg: "bg-emerald-700", text: "text-emerald-700", border: "border-emerald-600", badge: "bg-emerald-100 text-emerald-800" },
    amber: { bg: "bg-amber-700", text: "text-amber-700", border: "border-amber-600", badge: "bg-amber-100 text-amber-800" }
  };
  const activeTheme = themeClasses[activeShop.themeColor] || themeClasses.emerald;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24">
      {/* --- HEADER BAR --- */}
      <header className={`${activeTheme.bg} text-white shadow-md sticky top-0 z-40 transition-colors duration-300`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight">{activeShop.name}</h1>
            <p className="text-xs opacity-90">{activeShop.tagline}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Cross-Promo Shop Switcher */}
            <select
              value={activeShopId}
              onChange={(e) => {
                setActiveShopId(e.target.value);
                window.history.pushState({}, "", `?shop=${e.target.value}`);
              }}
              className="bg-black/30 text-white text-xs font-medium px-2 py-1.5 rounded border border-white/20 outline-none cursor-pointer"
            >
              {shops.map(s => (
                <option key={s.id} value={s.id} className="text-stone-900">
                  🏪 {s.name}
                </option>
              ))}
            </select>

            {/* Admin Trigger */}
            <button
              onClick={() => setAdminModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-xs font-bold transition-all border border-white/30"
            >
              🔐 Admin
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-4xl mx-auto px-4 pt-6">
        {/* Status Banners */}
        {!activeShop.isOpen && (
          <div className="bg-rose-100 border border-rose-300 text-rose-800 p-3 rounded-lg mb-4 text-center font-bold text-sm">
            🔴 This cookshop is currently closed for new orders. Check back later!
          </div>
        )}

        {/* Categories / Filter View */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-800">Today's Menu</h2>
            <span className="text-xs bg-stone-200 px-2.5 py-1 rounded-full font-semibold">
              {currentShopMenu.filter(d => d.inStock).length} Available Items
            </span>
          </div>

          {/* Dish Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentShopMenu.map(dish => (
              <div key={dish.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col justify-between transition-all hover:shadow-md">
                <div className="p-4 flex gap-4">
                  {dish.image && (
                    <img 
                      src={dish.image} 
                      alt={dish.name} 
                      className="w-24 h-24 object-cover rounded-lg border border-stone-100 bg-stone-100 shrink-0" 
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-stone-900">{dish.name}</h3>
                      <span className="font-extrabold text-emerald-700 whitespace-nowrap">${dish.price} JMD</span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">{dish.description}</p>
                    <span className="inline-block mt-2 text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
                      {dish.category}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-50 px-4 py-2.5 border-t border-stone-100 flex items-center justify-between">
                  <span className={`text-xs font-bold ${dish.inStock ? "text-emerald-600" : "text-rose-600"}`}>
                    {dish.inStock ? "🟢 In Stock" : "🔴 Sold Out"}
                  </span>
                  {activeShop.isOpen && dish.inStock && (
                    <button
                      onClick={() => setSelectedDish(dish)}
                      className={`${activeTheme.bg} text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all`}
                    >
                      + Add to Plate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- ACTIVE CART / CHECKOUT SECTION --- */}
        {cart.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-5 mt-8 mb-12">
            <h3 className="text-base font-black text-stone-800 mb-3 flex items-center justify-between">
              <span>🛒 Your Order Plate</span>
              <span className="text-xs font-normal text-stone-500">{cart.length} items</span>
            </h3>

            <div className="divide-y divide-stone-100 mb-4">
              {cart.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-bold text-stone-800">{item.quantity}x {item.dish.name}</span>
                    <div className="text-xs text-stone-500">Spice: {item.spiceLevel} | Gravy: {item.gravyLevel}</div>
                    {item.notes && <div className="text-xs italic text-stone-500">Note: "{item.notes}"</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-stone-900">${item.dish.price * item.quantity} JMD</span>
                    <button onClick={() => removeFromCart(idx)} className="text-rose-500 hover:text-rose-700 text-xs font-bold">✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery vs Pickup Selector */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-4 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType("delivery")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${orderType === "delivery" ? `${activeTheme.bg} text-white border-transparent` : "bg-white text-stone-700 border-stone-300"}`}
                >
                  🚚 Delivery (${activeShop.deliveryFee} JMD)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("pickup")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${orderType === "pickup" ? `${activeTheme.bg} text-white border-transparent` : "bg-white text-stone-700 border-stone-300"}`}
                >
                  🏪 Store Pickup
                </button>
              </div>

              {/* Delivery Zone Note Warning */}
              {orderType === "delivery" && activeShop.deliveryZoneNote && (
                <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠️ <strong>Delivery Notice:</strong> {activeShop.deliveryZoneNote}
                </p>
              )}

              {/* Customer Info Form */}
              <div className="space-y-2 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Your Name / Nickname *</label>
                  <input
                    type="text"
                    placeholder="e.g. Omarian"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white text-stone-900 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-500"
                  />
                </div>

                {orderType === "delivery" && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">Delivery Address / Landmark *</label>
                      <button
                        type="button"
                        onClick={handlePinLocation}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        📍 Pin My Current GPS Location
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Near Hip Strip / Paste Google Maps link here"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full bg-white text-stone-900 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Totals & Dispatch Buttons */}
            <div className="border-t border-stone-200 pt-3 mb-4 space-y-1 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>${cartSubtotal} JMD</span>
              </div>
              {orderType === "delivery" && activeShop.isDeliveryActive && (
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Fee</span>
                  <span>${deliveryCost} JMD</span>
                </div>
              )}
              <div className="flex justify-between text-stone-900 font-black text-base pt-1 border-t border-dashed border-stone-200">
                <span>Total Due</span>
                <span>${cartTotal} JMD</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => dispatchOrder("whatsapp")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                📲 Dispatch via WhatsApp
              </button>
              <button
                onClick={() => dispatchOrder("social")}
                className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                📋 Copy Order for IG / FB DM
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- DISH CUSTOMIZER MODAL --- */}
      {selectedDish && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black text-stone-900">{selectedDish.name}</h3>
                <p className="text-emerald-700 font-extrabold text-sm">${selectedDish.price} JMD</p>
              </div>
              <button onClick={() => setSelectedDish(null)} className="text-stone-400 hover:text-stone-700 font-bold text-lg">✕</button>
            </div>

            <p className="text-xs text-stone-600 mb-4">{selectedDish.description}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">🌶️ Pepper / Spice Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {["No Pepper", "Medium", "Extra Scotch Bonnet"].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSpiceLevel(lvl)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${spiceLevel === lvl ? `${activeTheme.bg} text-white border-transparent` : "bg-stone-50 text-stone-700 border-stone-200"}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">🍲 Gravy Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {["No Gravy", "Normal", "Extra Drowned"].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setGravyLevel(lvl)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${gravyLevel === lvl ? `${activeTheme.bg} text-white border-transparent` : "bg-stone-50 text-stone-700 border-stone-200"}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Special Cooking Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Separate gravy, extra fork please"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedDish(null)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => addToCart(selectedDish)}
                className={`flex-1 ${activeTheme.bg} text-white font-bold py-2.5 rounded-xl text-xs shadow-sm hover:opacity-90`}
              >
                Add to Plate (${selectedDish.price} JMD)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- POST-DISPATCH RECEIPT & TRACKING MODAL --- */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="text-center mb-4">
              <span className="text-3xl">✅</span>
              <h3 className="text-lg font-black text-stone-900 mt-1">Order Dispatched!</h3>
              <p className="text-xs text-stone-500">Order ID: {activeReceipt.id}</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs mb-4">
              <div className="flex justify-between"><span className="font-bold">Customer:</span><span>{activeReceipt.customerName}</span></div>
              <div className="flex justify-between"><span className="font-bold">Fulfillment:</span><span className="capitalize">{activeReceipt.type}</span></div>
              <div className="flex justify-between"><span className="font-bold">Total:</span><span className="font-black text-emerald-700">${activeReceipt.total} JMD</span></div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-stone-700 mb-2">Need to make a change? Choose an option below:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    alert("Acknowledged. Waiting for delivery time.");
                    setActiveReceipt(null);
                  }}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold py-2.5 px-1 rounded-lg text-center"
                >
                  ⏱️ Wait for Delivery
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(activeReceipt.id, "Cancelled");
                    window.open(`https://wa.me/${activeShop.whatsapp.replace(/[^0-9]/g, "")}?text=Hi,%20I%20would%20like%20to%20switch%20my%20order%20%23${activeReceipt.id}%20to%20Store%20Pickup.`, "_blank");
                    setActiveReceipt(null);
                  }}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold py-2.5 px-1 rounded-lg text-center border border-amber-200"
                >
                  🏪 Switch to Pickup
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(activeReceipt.id, "Cancelled");
                    window.open(`https://wa.me/${activeShop.whatsapp.replace(/[^0-9]/g, "")}?text=Hi,%20I%20need%20to%20CANCEL%20my%20order%20%23${activeReceipt.id}.`, "_blank");
                    setActiveReceipt(null);
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold py-2.5 px-1 rounded-lg text-center border border-rose-200"
                >
                  ❌ Cancel Order
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveReceipt(null)}
              className="w-full bg-stone-900 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* --- ADMIN AUTH / DASHBOARD MODAL --- */}
      {adminModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">
                {isMasterSession ? "⚡ Master Developer Panel" : loggedInAdminShopId ? `🛠️ Admin Panel: ${shops.find(s => s.id === loggedInAdminShopId)?.name}` : "🔐 Enter Admin PIN"}
              </h3>
              <button onClick={() => { setAdminModalOpen(false); setLoggedInAdminShopId(null); setIsMasterSession(false); }} className="text-stone-400 hover:text-stone-700 font-bold text-lg">✕</button>
            </div>

            {/* UNAUTHENTICATED: PIN LOGIN */}
            {!isMasterSession && !loggedInAdminShopId && (
              <div className="space-y-4 py-4 text-center">
                <p className="text-xs text-stone-600">Enter your 4-digit shop PIN or Master PIN to access management controls.</p>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="w-36 text-center tracking-widest text-xl bg-stone-50 border border-stone-300 rounded-xl py-3 mx-auto outline-none focus:border-stone-500 font-mono"
                />
                <div>
                  <button
                    onClick={handleAdminLogin}
                    className="bg-stone-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm hover:bg-stone-800"
                  >
                    Unlock Admin Access
                  </button>
                </div>
              </div>
            )}

            {/* MASTER DEVELOPER PANEL */}
            {isMasterSession && (
              <div className="space-y-6">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-800 text-sm mb-2">⚡ Master Controls & Security</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">Current Master Recovery Password</label>
                      <input
                        type="password"
                        placeholder="Enter recovery password"
                        value={currentMasterPassCheck}
                        onChange={(e) => setCurrentMasterPassCheck(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">New 4-Digit Master PIN</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="New PIN"
                        value={newMasterPinInput}
                        onChange={(e) => setNewMasterPinInput(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs outline-none font-mono"
                      />
                    </div>
                  </div>
                  <button
                    onClick={changeMasterCredentials}
                    className="mt-3 bg-stone-800 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-stone-900"
                  >
                    Update Master PIN Securely
                  </button>
                </div>

                {/* Multi-Shop Creator Form */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-800 text-sm mb-3">➕ Spin Up New Cookshop</h4>
                  <form onSubmit={createNewShop} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Shop Name (e.g. Babsie's Seafood)"
                        value={newShopName}
                        onChange={(e) => setNewShopName(e.target.value)}
                        className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Tagline / Description"
                        value={newShopTagline}
                        onChange={(e) => setNewShopTagline(e.target.value)}
                        className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="WhatsApp Number (e.g. 18765550000)"
                        value={newShopWhatsapp}
                        onChange={(e) => setNewShopWhatsapp(e.target.value)}
                        className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Operational PIN (e.g. 4321)"
                        maxLength={4}
                        value={newShopPin}
                        onChange={(e) => setNewShopPin(e.target.value)}
                        className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs outline-none font-mono"
                      />
                    </div>
                    <button type="submit" className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-emerald-700">
                      Launch Shop Instantly
                    </button>
                  </form>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => { setIsMasterSession(false); setLoggedInAdminShopId(null); }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Log Out of Master Panel
                  </button>
                </div>
              </div>
            )}

            {/* SHOP OWNER ADMIN PANEL */}
            {loggedInAdminShopId && (
              <div className="space-y-6">
                {/* Shop Toggles & QR Code Generator */}
                {(() => {
                  const shop = shops.find(s => s.id === loggedInAdminShopId);
                  if (!shop) return null;
                  const shopUrl = `${window.location.origin}${window.location.pathname}?shop=${shop.id}`;
                  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shopUrl)}`;

                  return (
                    <div className="space-y-4">
                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-stone-800 text-sm">Operational Status</h4>
                          <p className="text-xs text-stone-500">Toggle whether your shop is currently accepting orders.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShops(prev => prev.map(s => s.id === shop.id ? { ...s, isOpen: !s.isOpen } : s));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${shop.isOpen ? "bg-emerald-600" : "bg-rose-600"}`}
                          >
                            {shop.isOpen ? "🟢 Shop Open" : "🔴 Shop Closed"}
                          </button>
                          <button
                            onClick={() => {
                              setShops(prev => prev.map(s => s.id === shop.id ? { ...s, isDeliveryActive: !s.isDeliveryActive } : s));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${shop.isDeliveryActive ? "bg-blue-600" : "bg-stone-400"}`}
                          >
                            {shop.isDeliveryActive ? "🚚 Delivery Active" : "🛑 Delivery Off"}
                          </button>
                        </div>
                      </div>

                      {/* Built-in QR Code Card */}
                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex items-center gap-4">
                        <img src={qrCodeUrl} alt="Shop QR Code" className="w-24 h-24 bg-white p-1 rounded border border-stone-300 shrink-0" />
                        <div>
                          <h4 className="font-bold text-stone-800 text-sm">Counter & Flyer QR Code</h4>
                          <p className="text-xs text-stone-600 mt-0.5">Customers can scan this code with their phone camera to open your menu instantly.</p>
                          <a
                            href={qrCodeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-2 text-xs font-bold text-blue-600 hover:underline"
                          >
                            📥 Download / Print QR Code
                          </a>
                        </div>
                      </div>

                      {/* Driver Status & ETA */}
                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                        <h4 className="font-bold text-stone-800 text-sm">🛵 Driver Logistics & Turnaround</h4>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setDriverStatus(prev => prev === "ready" ? "out" : "ready")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${driverStatus === "ready" ? "bg-emerald-600" : "bg-amber-600"}`}
                          >
                            {driverStatus === "ready" ? "🟢 Driver Ready" : "🛵 Driver Out on Run"}
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-stone-600 font-medium">Quick ETA:</span>
                            {["+15 mins", "+30 mins", "+45 mins"].map(time => (
                              <button
                                key={time}
                                onClick={() => setDriverEta(time)}
                                className={`px-2 py-1 text-[11px] font-bold rounded border ${driverEta === time ? "bg-stone-900 text-white" : "bg-white text-stone-700 border-stone-300"}`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                        {driverEta && <p className="text-xs text-stone-500 font-medium">Estimated Driver Return: <strong className="text-stone-800">{driverEta}</strong></p>}
                      </div>
                    </div>
                  );
                })()}

                {/* Menu CRUD Editor */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-stone-800 text-sm">🍽️ Menu Management</h4>
                    <button
                      onClick={() => {
                        setEditingDish({ id: "", name: "", price: 0, description: "", category: "Mains", image: "", inStock: true });
                        setDishNameInput("");
                        setDishPriceInput("");
                        setDishDescInput("");
                        setDishImageInput("");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      + Add New Dish
                    </button>
                  </div>

                  {/* Add/Edit Form Modal or Section */}
                  {editingDish !== null && (
                    <div className="bg-white p-4 rounded-xl border border-stone-300 mb-4 space-y-3">
                      <h5 className="font-bold text-xs text-stone-800">{editingDish.id ? "Edit Dish" : "Create New Dish"}</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Dish Name"
                          value={dishNameInput}
                          onChange={(e) => setDishNameInput(e.target.value)}
                          className="bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Price ($ JMD)"
                          value={dishPriceInput}
                          onChange={(e) => setDishPriceInput(e.target.value)}
                          className="bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Description"
                        value={dishDescInput}
                        onChange={(e) => setDishDescInput(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs outline-none"
                      />
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-stone-700">Photo:</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageCompression(e, (base64) => setDishImageInput(base64))}
                          className="text-xs text-stone-500"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={saveEditedDish} className="bg-stone-900 text-white font-bold px-3 py-1.5 rounded text-xs">Save Dish</button>
                        <button onClick={() => setEditingDish(null)} className="bg-stone-200 text-stone-700 font-bold px-3 py-1.5 rounded text-xs">Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(menus[loggedInAdminShopId] || []).map(dish => (
                      <div key={dish.id} className="bg-white p-3 rounded-lg border border-stone-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-stone-900">{dish.name}</span> - <span className="font-semibold text-emerald-700">${dish.price} JMD</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setMenus(prev => ({
                                ...prev,
                                [loggedInAdminShopId]: (prev[loggedInAdminShopId] || []).map(d => d.id === dish.id ? { ...d, inStock: !d.inStock } : d)
                              }));
                            }}
                            className={`px-2 py-1 rounded font-bold text-[10px] ${dish.inStock ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
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
                            className="text-blue-600 font-bold hover:underline"
                          >
                            Edit
                          </button>
                          <button onClick={() => deleteDish(dish.id)} className="text-rose-600 font-bold hover:underline">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Order Queue */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-800 text-sm mb-3">📋 Live Order Queue ({currentShopOrders.length})</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {currentShopOrders.length === 0 ? (
                      <p className="text-xs text-stone-500 italic text-center py-4">No active orders in queue.</p>
                    ) : (
                      currentShopOrders.map(order => (
                        <div key={order.id} className="bg-white p-3 rounded-lg border border-stone-200 text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-stone-900">#{order.id} - {order.customerName}</span>
                            <span className="text-stone-500">{order.timestamp}</span>
                          </div>
                          <div className="text-stone-600">
                            {order.items.map((it, idx) => (
                              <div key={idx}>• {it.quantity}x {it.dish.name} ({it.spiceLevel})</div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                            <span className="font-bold text-emerald-700">${order.total} JMD ({order.type})</span>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                              className="bg-stone-100 border border-stone-300 rounded px-2 py-1 text-[11px] font-bold outline-none cursor-pointer"
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

                <div className="text-center pt-2">
                  <button
                    onClick={() => { setLoggedInAdminShopId(null); setAdminModalOpen(false); }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Log Out of Admin Dashboard
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
