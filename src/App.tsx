import React, { useState, useEffect } from 'react';
import { ShoppingBag, Utensils, Settings, ClipboardList, Plus, Trash2, MapPin, Clock, Edit2, Check, Flame } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; price: number }[];
  total: number;
  type: 'Pickup' | 'Delivery';
  status: 'Received' | 'Completed';
  timestamp: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'menu' | 'owner'>('menu');
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Customizable Shop Settings State (Persisted with LocalStorage)
  const [shopName, setShopName] = useState(() => localStorage.getItem('cookshop_name') || 'Island Spice Cookshop');
  const [shopPhone, setShopPhone] = useState(() => localStorage.getItem('cookshop_phone') || '18767739161');
  const [shopAddress, setShopAddress] = useState(() => localStorage.getItem('cookshop_address') || 'Main Street, Montego Bay');
  const [shopMapLink, setShopMapLink] = useState(() => localStorage.getItem('cookshop_map') || 'https://maps.google.com');
  const [shopStatus, setShopStatus] = useState<'Open' | 'Closing Soon' | 'Closed'>(() => (localStorage.getItem('cookshop_status') as any) || 'Open');
  const [deliveryEnabled, setDeliveryEnabled] = useState(() => localStorage.getItem('cookshop_delivery') === 'true');
  const [deliveryFee, setDeliveryFee] = useState(() => Number(localStorage.getItem('cookshop_delivery_fee')) || 300);
  const [ownerPin, setOwnerPin] = useState(() => localStorage.getItem('cookshop_pin') || '1234');

  // Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('cookshop_menu');
    if (saved) return JSON.parse(saved);
    return [
      { 
        id: '1', 
        name: 'Brown Stew Chicken', 
        category: 'Mains', 
        description: 'Served with rice and peas or ground provision.', 
        price: 1000,
        imageUrl: 'https://images.unsplash.com/photo-1545224182-5e04c8f5f3e4?auto=format&fit=crop&w=400&q=80',
        isAvailable: true
      },
      { 
        id: '2', 
        name: 'Curry Goat', 
        category: 'Mains', 
        description: 'Tender goat mutton cooked in authentic island curry.', 
        price: 1500,
        imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
        isAvailable: true
      },
      { 
        id: '3', 
        name: 'Fried Dumplings (3pc)', 
        category: 'Sides', 
        description: 'Crispy golden fried dough dumplings.', 
        price: 300,
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80',
        isAvailable: true
      },
      { 
        id: '4', 
        name: 'Cornmeal Porridge', 
        category: 'Breakfast Sides', 
        description: 'Rich, smooth coconut-flavored cornmeal porridge.', 
        price: 500,
        imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80',
        isAvailable: true
      }
    ];
  });

  // Cart State
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'Pickup' | 'Delivery'>('Pickup');

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cookshop_orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cookshop_name', shopName);
    localStorage.setItem('cookshop_phone', shopPhone);
    localStorage.setItem('cookshop_address', shopAddress);
    localStorage.setItem('cookshop_map', shopMapLink);
    localStorage.setItem('cookshop_status', shopStatus);
    localStorage.setItem('cookshop_delivery', String(deliveryEnabled));
    localStorage.setItem('cookshop_delivery_fee', String(deliveryFee));
    localStorage.setItem('cookshop_pin', ownerPin);
    localStorage.setItem('cookshop_menu', JSON.stringify(menuItems));
    localStorage.setItem('cookshop_orders', JSON.stringify(orders));
  }, [shopName, shopPhone, shopAddress, shopMapLink, shopStatus, deliveryEnabled, deliveryFee, ownerPin, menuItems, orders]);

  // Dish Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('Mains');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishImage, setDishImage] = useState('');

  const handleOwnerTabClick = () => {
    if (isOwnerUnlocked) {
      setActiveTab('owner');
    } else {
      const pinInput = prompt('Enter Owner PIN to access panel:');
      if (pinInput === ownerPin) {
        setIsOwnerUnlocked(true);
        setActiveTab('owner');
      } else if (pinInput !== null) {
        alert('Incorrect PIN! Access denied.');
      }
    }
  };

  const addToCart = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setCart([...cart, item]);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + item.price, 0);
  const calculateGrandTotal = () => {
    const sub = calculateSubtotal();
    return orderType === 'Delivery' ? sub + deliveryFee : sub;
  };

  const handleCheckout = () => {
    if (!customerName || !customerPhone) {
      alert('Please enter your name and phone number.');
      return;
    }

    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const subtotal = calculateSubtotal();
    const grandTotal = calculateGrandTotal();
    
    const itemsList = cart.map(i => `- ${i.name} ($${i.price} JMD)`).join('\n');
    let orderMessage = `Hi! I'd like to order *${orderId}*:\n${itemsList}\n\n*Subtotal:* $${subtotal} JMD`;
    if (orderType === 'Delivery') {
      orderMessage += `\n*Delivery Fee:* $${deliveryFee} JMD`;
    }
    orderMessage += `\n*Total:* $${grandTotal} JMD\n*Type:* ${orderType}\n*Name:* ${customerName}\n*Phone:* ${customerPhone}`;

    const cleanPhone = shopPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderMessage)}`;
    
    const formattedTime = new Date().toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const newOrder: Order = {
      id: orderId,
      customerName,
      customerPhone,
      items: cart,
      total: grandTotal,
      type: orderType,
      status: 'Received',
      timestamp: formattedTime
    };
    setOrders([newOrder, ...orders]);
    
    window.open(whatsappUrl, '_blank');
    setCart([]);
  };

  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName || !dishPrice) return;

    if (editingId) {
      setMenuItems(menuItems.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            name: dishName,
            category: dishCategory,
            description: dishDesc,
            price: parseFloat(dishPrice),
            imageUrl: dishImage || item.imageUrl
          };
        }
        return item;
      }));
      setEditingId(null);
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        name: dishName,
        category: dishCategory,
        description: dishDesc,
        price: parseFloat(dishPrice),
        imageUrl: dishImage || 'https://images.unsplash.com/photo-1545224182-5e04c8f5f3e4?auto=format&fit=crop&w=400&q=80',
        isAvailable: true
      };
      setMenuItems([...menuItems, newItem]);
    }

    setDishName('');
    setDishDesc('');
    setDishPrice('');
    setDishImage('');
    setDishCategory('Mains');
  };

  const startEditing = (item: MenuItem) => {
    setEditingId(item.id);
    setDishName(item.name);
    setDishCategory(item.category);
    setDishDesc(item.description);
    setDishPrice(item.price.toString());
    setDishImage(item.imageUrl || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDishName('');
    setDishDesc('');
    setDishPrice('');
    setDishImage('');
  };

  const toggleAvailability = (id: string) => {
    setMenuItems(menuItems.map(i => i.id === id ? { ...i, isAvailable: !i.isAvailable } : i));
  };

  const deleteDish = (id: string) => {
    if (confirm('Are you sure you want to delete this dish?')) {
      setMenuItems(menuItems.filter(i => i.id !== id));
    }
  };

  const toggleOrderStatus = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: o.status === 'Received' ? 'Completed' : 'Received' } : o));
  };

  const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category)))];
  const filteredMenuItems = selectedCategory === 'All' ? menuItems : menuItems.filter(i => i.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/50 to-stone-100 text-stone-900 font-sans pb-16">
      {/* Vibrant Header */}
      <header className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-950 text-white p-5 shadow-xl border-b-4 border-amber-500 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-600 p-2 rounded-xl shadow-md border border-amber-400">
              <Flame className="text-amber-100" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-wide drop-shadow">{shopName}</h1>
              <p className="text-[11px] text-amber-200 tracking-widest uppercase font-bold flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${shopStatus === 'Open' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                Authentic Jamaican Taste
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 bg-black/30 p-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
            <button 
              onClick={() => setActiveTab('menu')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all shadow-sm ${activeTab === 'menu' ? 'bg-amber-500 text-white shadow-md scale-105' : 'text-amber-100 hover:text-white hover:bg-white/10'}`}
            >
              Menu
            </button>
            <button 
              onClick={handleOwnerTabClick}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all shadow-sm ${activeTab === 'owner' ? 'bg-amber-500 text-white shadow-md scale-105' : 'text-amber-100 hover:text-white hover:bg-white/10'}`}
            >
              🔒 Owner
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Status Banner */}
        {shopStatus !== 'Open' && (
          <div className={`mb-6 p-3.5 rounded-xl text-sm font-black text-center shadow-md flex items-center justify-center gap-2 border-2 ${shopStatus === 'Closing Soon' ? 'bg-amber-300 text-amber-950 border-amber-400' : 'bg-red-500 text-white border-red-600 animate-bounce'}`}>
            <Clock size={20} /> Notice: We are currently {shopStatus.toUpperCase()}!
          </div>
        )}

        {activeTab === 'menu' ? (
          <div>
            {/* Info & Map Card */}
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl border-2 border-amber-200 text-amber-950 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
              <div>
                <p className="flex items-center gap-2 font-bold text-base">
                  <MapPin size={18} className="text-amber-800 flex-shrink-0" /> {shopAddress}
                </p>
                <p className="text-xs mt-1 font-semibold text-amber-900/80 pl-6">
                  🛵 Delivery Fee: <span className="font-black">${deliveryFee} JMD</span> ({deliveryEnabled ? 'Available' : 'Disabled'})
                </p>
              </div>
              {shopMapLink && (
                <a 
                  href={shopMapLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-amber-900 text-amber-50 px-4 py-2 rounded-xl text-xs font-black hover:bg-amber-950 transition-all shadow hover:shadow-md flex items-center gap-1.5"
                >
                  📍 View Pinned Map
                </a>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-stone-800 tracking-tight">Today's Menu</h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-sm ${selectedCategory === cat ? 'bg-amber-900 text-white shadow-md scale-105 ring-2 ring-amber-600/50' : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* Menu Grid */}
            <div className="grid gap-4 sm:gap-5 mb-8">
              {filteredMenuItems.map(item => (
                <div key={item.id} className={`bg-white p-4 sm:p-5 rounded-2xl shadow-sm border-2 transition-all duration-300 flex gap-4 items-center hover:-translate-y-0.5 hover:shadow-md ${item.isAvailable ? 'border-stone-100 hover:border-amber-400' : 'border-red-100 opacity-60 bg-stone-50'}`}>
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-stone-200 flex-shrink-0 shadow-sm" 
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-lg text-stone-900">{item.name}</h3>
                      {!item.isAvailable && (
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Sold Out</span>
                      )}
                    </div>
                    <span className="inline-block text-[11px] uppercase font-black text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-md mt-1">{item.category}</span>
                    <p className="text-stone-600 text-xs sm:text-sm mt-1.5 line-clamp-2">{item.description}</p>
                    <p className="font-black text-amber-900 text-base mt-2">${item.price} <span className="text-xs text-stone-500 font-bold">JMD</span></p>
                  </div>
                  <button 
                    onClick={() => addToCart(item)}
                    disabled={!item.isAvailable}
                    className={`px-4 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-1.5 flex-shrink-0 shadow ${item.isAvailable ? 'bg-amber-800 text-white hover:bg-amber-900 hover:scale-105 active:scale-95 shadow-amber-900/20' : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'}`}
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              ))}
            </div>

            {/* Cart Section */}
            {cart.length > 0 && (
              <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-amber-300 mt-6 animate-fadeIn">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-stone-900 border-b pb-3">
                  <ShoppingBag className="text-amber-800" size={22} /> Your Order ({cart.length} items)
                </h3>
                <div className="divide-y divide-stone-100 mb-4 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item, index) => (
                    <div key={index} className="py-3 flex justify-between items-center text-sm">
                      <span className="font-bold text-stone-800">{item.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-amber-900">${item.price} JMD</span>
                        <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-dashed border-stone-200 pt-4 space-y-2 text-sm mb-6 bg-amber-50/50 p-4 rounded-2xl">
                  <div className="flex justify-between text-stone-600 font-semibold">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal()} JMD</span>
                  </div>
                  {orderType === 'Delivery' && (
                    <div className="flex justify-between text-stone-600 font-semibold">
                      <span>Delivery Fee:</span>
                      <span>${deliveryFee} JMD</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-xl pt-2 border-t border-amber-200 text-amber-950">
                    <span>Total:</span>
                    <span>${calculateGrandTotal()} JMD</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Your Name</label>
                    <input 
                      type="text" 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Omarian Smith"
                      className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={customerPhone} 
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 876-555-0199"
                      className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Order Type</label>
                    <select 
                      value={orderType} 
                      onChange={(e) => setOrderType(e.target.value as 'Pickup' | 'Delivery')}
                      className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-bold bg-white focus:border-amber-600 focus:outline-none"
                    >
                      <option value="Pickup">Pickup</option>
                      {deliveryEnabled && <option value="Delivery">Delivery (+${deliveryFee} JMD)</option>}
                    </select>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30 text-base tracking-wide mt-2"
                  >
                    Send Order via WhatsApp 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-stone-900">Owner Management Panel</h2>

            {/* Shop Settings Card */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-stone-200">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-stone-900 border-b pb-3">
                <Settings className="text-amber-800" size={20} /> Shop Settings & Security
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Cookshop Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-bold focus:border-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Owner PIN (Change anytime)</label>
                  <input
                    type="text"
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value)}
                    className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-black text-amber-900 focus:border-amber-600 focus:outline-none"
                    placeholder="1234"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Shop Status Banner</label>
                  <select
                    value={shopStatus}
                    onChange={(e) => setShopStatus(e.target.value as any)}
                    className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm bg-white font-black focus:border-amber-600 focus:outline-none"
                  >
                    <option value="Open">🟢 Open for Business</option>
                    <option value="Closing Soon">⚠️ Closing Soon</option>
                    <option value="Closed">🔴 Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Shop Address Text</label>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Google Maps Pinned Location Link</label>
                  <input
                    type="text"
                    value={shopMapLink}
                    onChange={(e) => setShopMapLink(e.target.value)}
                    className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border">
                    <span className="text-sm font-black text-stone-800">Enable Delivery</span>
                    <input
                      type="checkbox"
                      checked={deliveryEnabled}
                      onChange={(e) => setDeliveryEnabled(e.target.checked)}
                      className="w-5 h-5 accent-amber-800 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Delivery Fee (JMD)</label>
                    <input
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Number(e.target.value))}
                      className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-bold focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Add / Edit Dish Card */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-stone-200">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-stone-900 border-b pb-3">
                <Plus className="text-amber-800" size={20} /> {editingId ? 'Edit Existing Dish' : 'Add New Dish'}
              </h3>
              <form onSubmit={handleSaveDish} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Dish Name</label>
                  <input 
                    type="text" 
                    value={dishName} 
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="e.g. Oxtail"
                    className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Category</label>
                  <input 
                    type="text" 
                    value={dishCategory} 
                    onChange={(e) => setDishCategory(e.target.value)}
                    placeholder="e.g. Mains"
                    className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Description</label>
                  <input 
                    type="text" 
                    value={dishDesc} 
                    onChange={(e) => setDishDesc(e.target.value)}
                    placeholder="e.g. Slow-cooked with butter beans."
                    className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Image URL (Photo link)</label>
                  <input 
                    type="text" 
                    value={dishImage} 
                    onChange={(e) => setDishImage(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Price (JMD)</label>
                  <input 
                    type="number" 
                    value={dishPrice} 
                    onChange={(e) => setDishPrice(e.target.value)}
                    placeholder="1800"
                    className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    className="flex-1 bg-amber-900 text-white py-3.5 rounded-2xl text-sm font-black hover:bg-amber-950 transition-all shadow-md"
                  >
                    {editingId ? 'Save Changes' : 'Add Dish to Menu'}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={cancelEditing}
                      className="bg-stone-200 text-stone-700 px-6 py-3.5 rounded-2xl text-sm font-black hover:bg-stone-300 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Manage Menu Items */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-stone-200">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-stone-900 border-b pb-3">
                <Utensils className="text-amber-800" size={20} /> Manage Menu Items
              </h3>
              <div className="space-y-3">
                {menuItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border-2 border-stone-200 text-sm">
                    <div className="min-w-0 pr-2">
                      <span className="font-black text-stone-900 block truncate">{item.name}</span>
                      <span className="text-xs text-stone-500 font-bold">${item.price} JMD</span>
                      {!item.isAvailable && <span className="ml-2 text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded-full">Sold Out</span>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={() => toggleAvailability(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${item.isAvailable ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'}`}
                      >
                        {item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                      </button>
                      <button 
                        onClick={() => startEditing(item)}
                        className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all"
                        title="Edit dish"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteDish(item.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                        title="Delete dish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Orders Log */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-stone-200">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="font-black text-lg flex items-center gap-2 text-stone-900">
                  <ClipboardList className="text-amber-800" size={20} /> Live Customer Orders ({orders.length})
                </h3>
                {orders.length > 0 && (
                  <button 
                    onClick={() => setOrders([])}
                    className="text-xs text-red-600 hover:underline font-black"
                  >
                    Clear All Orders
                  </button>
                )}
              </div>
              {orders.length === 0 ? (
                <p className="text-sm text-stone-500 py-4 text-center font-medium">No orders received yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-2xl border-2 border-amber-200 text-sm shadow-sm">
                      <div className="flex justify-between items-start font-black text-amber-950 mb-3 border-b border-amber-200/60 pb-3">
                        <div>
                          <span className="text-base tracking-wide">{order.id}</span>
                          <p className="text-[11px] font-bold text-stone-500 mt-0.5">{order.timestamp}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs text-white font-black shadow-sm ${order.status === 'Completed' ? 'bg-emerald-600' : 'bg-amber-800'}`}>
                            {order.status}
                          </span>
                          <span className="bg-stone-900 text-white px-2.5 py-1 rounded-full text-xs font-black">{order.type}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-xl border-2 border-stone-200 mb-3 shadow-inner">
                        <p className="font-black text-stone-900 text-sm">👤 {order.customerName}</p>
                        <p className="text-stone-600 text-xs font-bold mt-1">📞 {order.customerPhone}</p>
                      </div>

                      <ul className="list-disc list-inside text-xs font-medium text-stone-700 mb-3 space-y-1 pl-1">
                        {order.items.map((it, idx) => (
                          <li key={idx} className="font-bold">{it.name} - <span className="text-amber-900">${it.price} JMD</span></li>
                        ))}
                      </ul>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-amber-200/60 mt-2">
                        <span className="font-black text-stone-900 text-base">Total: ${order.total} JMD</span>
                        <button
                          onClick={() => toggleOrderStatus(order.id)}
                          className={`text-xs px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 shadow-sm ${order.status === 'Completed' ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                        >
                          <Check size={14} /> {order.status === 'Completed' ? 'Reopen Order' : 'Mark Completed'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
