import React, { useState, useEffect } from 'react';
import { ShoppingBag, Utensils, Settings, ClipboardList, Plus, Trash2, MapPin, Clock, Edit2, Check } from 'lucide-react';

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

  // Sync state changes to browser localStorage automatically
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

  // Dish Form State (Supports Add & Edit)
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

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

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

    const whatsappUrl = `https://wa.me/${shopPhone}?text=${encodeURIComponent(orderMessage)}`;
    
    const newOrder: Order = {
      id: orderId,
      customerName,
      customerPhone,
      items: cart,
      total: grandTotal,
      type: orderType,
      status: 'Received'
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

  // Filter menu items by category
  const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category)))];
  const filteredMenuItems = selectedCategory === 'All' ? menuItems : menuItems.filter(i => i.category === selectedCategory);

  return (
    <div className="min-h-screen bg-orange-50/30 text-stone-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 via-orange-900 to-amber-950 text-white p-5 shadow-lg border-b-4 border-amber-600">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-wide drop-shadow-md">🔥 {shopName}</h1>
            <p className="text-xs text-amber-200 tracking-wider uppercase font-medium">Authentic Jamaican Taste</p>
          </div>
          <div className="space-x-2 bg-black/20 p-1 rounded-lg backdrop-blur-sm">
            <button 
              onClick={() => setActiveTab('menu')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition shadow-sm ${activeTab === 'menu' ? 'bg-amber-600 text-white shadow' : 'text-amber-100 hover:text-white'}`}
            >
              Menu
            </button>
            <button 
              onClick={handleOwnerTabClick}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition shadow-sm ${activeTab === 'owner' ? 'bg-amber-600 text-white shadow' : 'text-amber-100 hover:text-white'}`}
            >
              🔒 Owner Panel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        {/* Closing Soon / Status Notice Banner */}
        {shopStatus !== 'Open' && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-bold text-center shadow-sm flex items-center justify-center gap-2 ${shopStatus === 'Closing Soon' ? 'bg-amber-200 text-amber-900 border border-amber-300' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            <Clock size={18} /> Notice: We are currently <strong>{shopStatus}</strong>!
          </div>
        )}

        {activeTab === 'menu' ? (
          <div>
            <div className="mb-6 p-4 bg-amber-100 rounded-lg border border-amber-200 text-amber-900 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="flex items-center gap-1 font-medium">
                  <MapPin size={16} className="text-amber-800" /> <strong>Location:</strong> {shopAddress}
                </p>
                <p className="text-xs mt-1 text-amber-800">🛵 <strong>Delivery Fee:</strong> ${deliveryFee} JMD ({deliveryEnabled ? 'Available' : 'Disabled'})</p>
              </div>
              {shopMapLink && (
                <a 
                  href={shopMapLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-amber-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-900 transition shadow-sm"
                >
                  📍 View Pinned Map
                </a>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-stone-800">Today's Menu</h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition shadow-sm ${selectedCategory === cat ? 'bg-amber-800 text-white shadow' : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="grid gap-4 mb-8">
              {filteredMenuItems.map(item => (
                <div key={item.id} className={`bg-white p-4 rounded-lg shadow-sm border transition-all flex gap-4 items-center ${item.isAvailable ? 'border-stone-200 hover:border-amber-400' : 'border-red-200 opacity-60 bg-stone-50'}`}>
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-md border border-stone-200 flex-shrink-0 shadow-sm" 
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-stone-900">{item.name}</h3>
                      {!item.isAvailable && (
                        <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">Sold Out</span>
                      )}
                    </div>
                    <span className="text-xs uppercase font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">{item.category}</span>
                    <p className="text-stone-600 text-sm mt-1">{item.description}</p>
                    <p className="font-bold text-amber-900 mt-2">${item.price} JMD</p>
                  </div>
                  <button 
                    onClick={() => addToCart(item)}
                    disabled={!item.isAvailable}
                    className={`px-3 py-2 rounded-lg text-sm transition flex items-center gap-1 flex-shrink-0 shadow ${item.isAvailable ? 'bg-amber-800 text-white hover:bg-amber-900' : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'}`}
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              ))}
            </div>

            {/* Cart Section */}
            {cart.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200 mt-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-stone-800">
                  <ShoppingBag size={20} /> Your Order ({cart.length} items)
                </h3>
                <div className="divide-y divide-stone-100 mb-4">
                  {cart.map((item, index) => (
                    <div key={index} className="py-2 flex justify-between items-center text-sm">
                      <span>{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">${item.price} JMD</span>
                        <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-3 space-y-1 text-sm mb-4">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal()} JMD</span>
                  </div>
                  {orderType === 'Delivery' && (
                    <div className="flex justify-between text-stone-600">
                      <span>Delivery Fee:</span>
                      <span>${deliveryFee} JMD</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-stone-100">
                    <span>Total:</span>
                    <span className="text-amber-900">${calculateGrandTotal()} JMD</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Your Name</label>
                    <input 
                      type="text" 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Omarian Smith"
                      className="w-full p-2 border border-stone-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={customerPhone} 
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 876-555-0199"
                      className="w-full p-2 border border-stone-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Order Type</label>
                    <select 
                      value={orderType} 
                      onChange={(e) => setOrderType(e.target.value as 'Pickup' | 'Delivery')}
                      className="w-full p-2 border border-stone-300 rounded text-sm bg-white"
                    >
                      <option value="Pickup">Pickup</option>
                      {deliveryEnabled && <option value="Delivery">Delivery (+${deliveryFee} JMD)</option>}
                    </select>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition mt-2 shadow"
                  >
                    Send Order via WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">Owner Management Panel</h2>

            {/* Shop Settings Card */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-stone-800">
                <Settings size={18} /> Shop Settings & Security
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Cookshop Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Owner PIN (Change anytime)</label>
                  <input
                    type="text"
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded text-sm font-bold text-amber-900"
                    placeholder="1234"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Shop Status Banner</label>
                  <select
                    value={shopStatus}
                    onChange={(e) => setShopStatus(e.target.value as any)}
                    className="w-full p-2 border border-stone-300 rounded text-sm bg-white font-bold"
                  >
                    <option value="Open">🟢 Open for Business</option>
                    <option value="Closing Soon">⚠️ Closing Soon</option>
                    <option value="Closed">🔴 Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Shop Address Text</label>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Google Maps Pinned Location Link</label>
                  <input
                    type="text"
                    value={shopMapLink}
                    onChange={(e) => setShopMapLink(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-700">Enable Delivery</span>
                    <input
                      type="checkbox"
                      checked={deliveryEnabled}
                      onChange={(e) => setDeliveryEnabled(e.target.checked)}
                      className="w-4 h-4 accent-amber-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Delivery Fee (JMD)</label>
                    <input
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Number(e.target.value))}
                      className="w-full p-1.5 border border-stone-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Add / Edit Dish Card */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-stone-800">
                <Plus size={18} /> {editingId ? 'Edit Existing Dish' : 'Add New Dish'}
              </h3>
              <form onSubmit={handleSaveDish} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Dish Name</label>
                  <input 
                    type="text" 
                    value={dishName} 
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="e.g. Oxtail"
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Category</label>
                  <input 
                    type="text" 
                    value={dishCategory} 
                    onChange={(e) => setDishCategory(e.target.value)}
                    placeholder="e.g. Mains"
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Description</label>
                  <input 
                    type="text" 
                    value={dishDesc} 
                    onChange={(e) => setDishDesc(e.target.value)}
                    placeholder="e.g. Slow-cooked with butter beans."
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Image URL (Photo link)</label>
                  <input 
                    type="text" 
                    value={dishImage} 
                    onChange={(e) => setDishImage(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Price (JMD)</label>
                  <input 
                    type="number" 
                    value={dishPrice} 
                    onChange={(e) => setDishPrice(e.target.value)}
                    placeholder="1800"
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="flex-1 bg-amber-800 text-white py-2 rounded text-sm font-bold hover:bg-amber-900 transition shadow"
                  >
                    {editingId ? 'Save Changes' : 'Add Dish to Menu'}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={cancelEditing}
                      className="bg-stone-300 text-stone-700 px-4 py-2 rounded text-sm font-bold hover:bg-stone-400 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Manage Menu Items (Edit, Sold Out, Delete) */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-stone-800">
                <Utensils size={18} /> Manage Menu Items
              </h3>
              <div className="space-y-3">
                {menuItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200 text-sm">
                    <div>
                      <span className="font-bold text-stone-900">{item.name}</span>
                      <span className="text-xs text-stone-500 ml-2">${item.price} JMD</span>
                      {!item.isAvailable && <span className="ml-2 text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">Sold Out</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleAvailability(item.id)}
                        className={`px-2 py-1 rounded text-xs font-bold ${item.isAvailable ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                      >
                        {item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                      </button>
                      <button 
                        onClick={() => startEditing(item)}
                        className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                        title="Edit dish"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteDish(item.id)}
                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
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
            <div className="bg-white p-5 rounded-lg shadow-sm border border-stone-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-base flex items-center gap-2 text-stone-800">
                  <ClipboardList size={18} /> Live Customer Orders ({orders.length})
                </h3>
                {orders.length > 0 && (
                  <button 
                    onClick={() => setOrders([])}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Clear All Orders
                  </button>
                )}
              </div>
              {orders.length === 0 ? (
                <p className="text-sm text-stone-500">No orders received yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 bg-amber-50/50 rounded-lg border border-amber-200 text-sm shadow-sm">
                      <div className="flex justify-between items-center font-bold text-amber-900 mb-2 border-b border-amber-200 pb-2">
                        <span className="text-base">{order.id}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs text-white ${order.status === 'Completed' ? 'bg-green-700' : 'bg-amber-800'}`}>
                            {order.status}
                          </span>
                          <span className="bg-stone-800 text-white px-2 py-0.5 rounded text-xs">{order.type}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white p-2.5 rounded border border-stone-200 mb-2">
                        <p className="font-bold text-stone-900 text-sm">👤 Customer: {order.customerName}</p>
                        <p className="text-stone-600 text-xs mt-0.5">📞 Phone: {order.customerPhone}</p>
                      </div>

                      <ul className="list-disc list-inside text-xs text-stone-700 mb-2 space-y-1">
                        {order.items.map((it, idx) => (
                          <li key={idx}>{it.name} - ${it.price} JMD</li>
                        ))}
                      </ul>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-stone-200 mt-2">
                        <span className="font-black text-stone-900 text-sm">Total: ${order.total} JMD</span>
                        <button
                          onClick={() => toggleOrderStatus(order.id)}
                          className={`text-xs px-2.5 py-1 rounded font-bold transition flex items-center gap-1 ${order.status === 'Completed' ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-green-600 text-white hover:bg-green-700'}`}
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
