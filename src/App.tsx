import React, { useState } from 'react';
import { ShoppingBag, Utensils, Settings, ClipboardList, Plus, Trash2, MapPin, Clock } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl?: string;
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
  
  // Customizable Shop Settings State
  const [shopName, setShopName] = useState('Island Spice Cookshop');
  const [shopPhone, setShopPhone] = useState('18767739161');
  const [shopAddress, setShopAddress] = useState('Main Street, Montego Bay');
  const [shopMapLink, setShopMapLink] = useState('https://maps.google.com');
  const [shopStatus, setShopStatus] = useState<'Open' | 'Closing Soon' | 'Closed'>('Open');
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);

  // Menu State with Default Images
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { 
      id: '1', 
      name: 'Brown Stew Chicken', 
      category: 'Mains', 
      description: 'Served with rice and peas or ground provision.', 
      price: 1000,
      imageUrl: 'https://images.unsplash.com/photo-1545224182-5e04c8f5f3e4?auto=format&fit=crop&w=400&q=80'
    },
    { 
      id: '2', 
      name: 'Curry Goat', 
      category: 'Mains', 
      description: 'Tender goat mutton cooked in authentic island curry.', 
      price: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80'
    },
    { 
      id: '3', 
      name: 'Fried Dumplings (3pc)', 
      category: 'Sides', 
      description: 'Crispy golden fried dough dumplings.', 
      price: 300,
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80'
    },
    { 
      id: '4', 
      name: 'Cornmeal Porridge', 
      category: 'Breakfast Sides', 
      description: 'Rich, smooth coconut-flavored cornmeal porridge.', 
      price: 500,
      imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80'
    }
  ]);

  // Cart State
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'Pickup' | 'Delivery'>('Pickup');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);

  // New Dish Form State
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('Mains');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishImage, setNewDishImage] = useState('');

  const handleOwnerTabClick = () => {
    if (isOwnerUnlocked) {
      setActiveTab('owner');
    } else {
      const pinInput = prompt('Enter Owner PIN to access panel:');
      if (pinInput === '1234') {
        setIsOwnerUnlocked(true);
        setActiveTab('owner');
      } else if (pinInput !== null) {
        alert('Incorrect PIN! Access denied.');
      }
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  const handleCheckout = () => {
    if (!customerName || !customerPhone) {
      alert('Please enter your name and phone number.');
      return;
    }

    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const total = calculateTotal();
    
    const itemsList = cart.map(i => `- ${i.name} ($${i.price} JMD)`).join('\n');
    const orderMessage = `Hi! I'd like to order *${orderId}*:\n${itemsList}\n\n*Total:* $${total} JMD\n*Type:* ${orderType}\n*Name:* ${customerName}\n*Phone:* ${customerPhone}`;

    const whatsappUrl = `https://wa.me/${shopPhone}?text=${encodeURIComponent(orderMessage)}`;
    
    const newOrder: Order = {
      id: orderId,
      customerName,
      customerPhone,
      items: cart,
      total,
      type: orderType,
      status: 'Received'
    };
    setOrders([newOrder, ...orders]);
    
    window.open(whatsappUrl, '_blank');
    setCart([]);
  };

  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: newDishName,
      category: newDishCategory,
      description: newDishDesc,
      price: parseFloat(newDishPrice),
      imageUrl: newDishImage || 'https://images.unsplash.com/photo-1545224182-5e04c8f5f3e4?auto=format&fit=crop&w=400&q=80'
    };

    setMenuItems([...menuItems, newItem]);
    setNewDishName('');
    setNewDishDesc('');
    setNewDishPrice('');
    setNewDishImage('');
  };

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
                <p className="text-xs mt-1 text-amber-800">🛵 <strong>Delivery Service:</strong> {deliveryEnabled ? 'ENABLED' : 'DISABLED'}</p>
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

            <h2 className="text-xl font-bold mb-4 text-stone-800">Today's Menu</h2>
            
            <div className="grid gap-4 mb-8">
              {menuItems.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-stone-200 flex gap-4 items-center hover:border-amber-400 transition-all">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-md border border-stone-200 flex-shrink-0 shadow-sm" 
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-stone-900">{item.name}</h3>
                    <span className="text-xs uppercase font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">{item.category}</span>
                    <p className="text-stone-600 text-sm mt-1">{item.description}</p>
                    <p className="font-bold text-amber-900 mt-2">${item.price} JMD</p>
                  </div>
                  <button 
                    onClick={() => addToCart(item)}
                    className="bg-amber-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-amber-900 transition flex items-center gap-1 flex-shrink-0 shadow"
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

                <div className="border-t border-stone-200 pt-3 mb-4 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-amber-900">${calculateTotal()} JMD</span>
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
                      {deliveryEnabled && <option value="Delivery">Delivery</option>}
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
                <Settings size={18} /> Shop Settings & Location Info
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Cookshop Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded text-sm font-bold"
                    placeholder="Island Spice Cookshop"
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
                  <label className="block text-xs font-medium text-stone-600 mb-1">WhatsApp Phone Number (Orders go here)</label>
                  <input
                    type="text"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                    placeholder="18767739161"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Shop Address Text</label>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                    placeholder="Main Street, Montego Bay"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Google Maps Pinned Location Link</label>
                  <input
                    type="text"
                    value={shopMapLink}
                    onChange={(e) => setShopMapLink(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                    placeholder="Paste Google Maps share link here"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium text-stone-700">Enable Delivery Service</span>
                  <input
                    type="checkbox"
                    checked={deliveryEnabled}
                    onChange={(e) => setDeliveryEnabled(e.target.checked)}
                    className="w-4 h-4 accent-amber-800"
                  />
                </div>
              </div>
            </div>

            {/* Add Dish Card */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-stone-800">
                <Plus size={18} /> Add New Dish with Image
              </h3>
              <form onSubmit={handleAddDish} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Dish Name</label>
                  <input 
                    type="text" 
                    value={newDishName} 
                    onChange={(e) => setNewDishName(e.target.value)}
                    placeholder="e.g. Oxtail"
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Category</label>
                  <input 
                    type="text" 
                    value={newDishCategory} 
                    onChange={(e) => setNewDishCategory(e.target.value)}
                    placeholder="e.g. Mains"
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Description</label>
                  <input 
                    type="text" 
                    value={newDishDesc} 
                    onChange={(e) => setNewDishDesc(e.target.value)}
                    placeholder="e.g. Slow-cooked with butter beans."
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Image URL (Photo link)</label>
                  <input 
                    type="text" 
                    value={newDishImage} 
                    onChange={(e) => setNewDishImage(e.target.value)}
                    placeholder="https://example.com/food-photo.jpg"
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Price (JMD)</label>
                  <input 
                    type="number" 
                    value={newDishPrice} 
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    placeholder="1800"
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-amber-800 text-white py-2 rounded text-sm font-bold hover:bg-amber-900 transition shadow"
                >
                  Add Dish to Menu
                </button>
              </form>
            </div>

            {/* Live Orders Log */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-stone-800">
                <ClipboardList size={18} /> Live Customer Orders ({orders.length})
              </h3>
              {orders.length === 0 ? (
                <p className="text-sm text-stone-500">No orders received yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 bg-amber-50/50 rounded-lg border border-amber-200 text-sm shadow-sm">
                      <div className="flex justify-between items-center font-bold text-amber-900 mb-2 border-b border-amber-200 pb-2">
                        <span className="text-base">{order.id}</span>
                        <span className="bg-amber-800 text-white px-2 py-0.5 rounded text-xs">{order.type}</span>
                      </div>
                      
                      {/* Prominent Customer Details */}
                      <div className="bg-white p-2.5 rounded border border-stone-200 mb-2">
                        <p className="font-bold text-stone-900 text-sm">👤 Customer: {order.customerName}</p>
                        <p className="text-stone-600 text-xs mt-0.5">📞 Phone: {order.customerPhone}</p>
                      </div>

                      <ul className="list-disc list-inside text-xs text-stone-700 mb-2 space-y-1">
                        {order.items.map((it, idx) => (
                          <li key={idx}>{it.name} - ${it.price} JMD</li>
                        ))}
                      </ul>
                      <div className="font-black text-stone-900 text-sm pt-1 border-t border-stone-200">Total: ${order.total} JMD</div>
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
