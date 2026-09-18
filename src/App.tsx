import React, { useState } from 'react';
import { ShoppingBag, Utensils, Settings, ClipboardList, Plus, Trash2 } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
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
  
  // Customizable Shop Settings State
  const [shopPhone, setShopPhone] = useState('18767739161');
  const [shopAddress, setShopAddress] = useState('Main Street, Montego Bay');
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);

  // Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', name: 'Brown Stew Chicken', category: 'Mains', description: 'Served with rice and peas or ground provision.', price: 1000 },
    { id: '2', name: 'Curry Goat', category: 'Mains', description: 'Tender goat mutton cooked in authentic island curry.', price: 1500 },
    { id: '3', name: 'Fried Dumplings (3pc)', category: 'Sides', description: 'Crispy golden fried dough dumplings.', price: 300 },
    { id: '4', name: 'Cornmeal Porridge', category: 'Breakfast Sides', description: 'Rich, smooth coconut-flavored cornmeal porridge.', price: 500 }
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

    // Use the dynamic shopPhone state
    const whatsappUrl = `https://wa.me/${shopPhone}?text=${encodeURIComponent(orderMessage)}`;
    
    // Save to owner orders log
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
      price: parseFloat(newDishPrice)
    };

    setMenuItems([...menuItems, newItem]);
    setNewDishName('');
    setNewDishDesc('');
    setNewDishPrice('');
  };

  const handleDeleteDish = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-amber-900 text-white p-4 shadow-md">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">Island Spice Cookshop</h1>
          <div className="space-x-2">
            <button 
              onClick={() => setActiveTab('menu')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${activeTab === 'menu' ? 'bg-amber-700 text-white' : 'bg-amber-950 text-amber-200'}`}
            >
              Menu
            </button>
            <button 
              onClick={() => setActiveTab('owner')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${activeTab === 'owner' ? 'bg-amber-700 text-white' : 'bg-amber-950 text-amber-200'}`}
            >
              Owner Panel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        {activeTab === 'menu' ? (
          <div>
            <div className="mb-6 p-4 bg-amber-100 rounded-lg border border-amber-200 text-amber-900 text-sm">
              📍 <strong>Location:</strong> {shopAddress} | 🛵 <strong>Delivery Service:</strong> {deliveryEnabled ? 'ENABLED' : 'DISABLED'}
            </div>

            <h2 className="text-xl font-bold mb-4 text-stone-700">Today's Menu</h2>
            
            <div className="grid gap-4 mb-8">
              {menuItems.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-stone-200 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">{item.name}</h3>
                    <span className="text-xs uppercase font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">{item.category}</span>
                    <p className="text-stone-600 text-sm mt-1">{item.description}</p>
                    <p className="font-bold text-amber-900 mt-2">${item.price} JMD</p>
                  </div>
                  <button 
                    onClick={() => addToCart(item)}
                    className="bg-amber-800 text-white px-3 py-1.5 rounded text-sm hover:bg-amber-900 transition flex items-center gap-1"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              ))}
            </div>

            {/* Cart Section */}
            {cart.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200 mt-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
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
            <h2 className="text-xl font-bold text-stone-700">Owner Management Panel</h2>

            {/* Shop Settings Card */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-stone-200">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-stone-800">
                <Settings size={18} /> Shop Settings & Contact Info
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">WhatsApp Phone Number (Orders go here)</label>
                  <input
                    type="text"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                    placeholder="18767739161"
                  />
                  <p className="text-xs text-stone-400 mt-1">Include country code without the plus sign (e.g., 1876...)</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Shop Address / Location</label>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                    placeholder="Main Street, Montego Bay"
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
                <Plus size={18} /> Add New Dish to Menu
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
                  className="w-full bg-amber-800 text-white py-2 rounded text-sm font-bold hover:bg-amber-900 transition"
                >
                  Add Dish
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
                    <div key={order.id} className="p-3 bg-stone-50 rounded border border-stone-200 text-sm">
                      <div className="flex justify-between font-bold text-amber-900 mb-1">
                        <span>{order.id}</span>
                        <span>{order.type}</span>
                      </div>
                      <p className="text-xs text-stone-600 mb-2">Customer: {order.name} ({order.phone})</p>
                      <ul className="list-disc list-inside text-xs text-stone-700 mb-2">
                        {order.items.map((it, idx) => (
                          <li key={idx}>{it.name} - ${it.price} JMD</li>
                        ))}
                      </ul>
                      <div className="font-bold text-stone-900 text-xs">Total: ${order.total} JMD</div>
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
