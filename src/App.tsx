import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Trash2, Plus, Minus, Settings, CheckCircle2, 
  Clock, Flame, MapPin, Send, Heart, ChevronDown, ChevronUp,
  Store, AlertCircle, Edit3, DollarSign, HeartHandshake, X, Image as ImageIcon
} from 'lucide-react';

// --- TYPES ---
interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  isSpecial?: boolean;
  likes: number;
  imageUrl?: string;
  description?: string;
}

interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
}

interface OrderItem {
  item: MenuItem;
  quantity: number;
  spiceLevel?: string;
  gravy?: string;
  ketchup?: boolean;
  pepper?: boolean;
  specialInstructions?: string;
}

interface ActiveOrder {
  id: string;
  shopName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tipAmount: number;
  total: number;
  status: 'Preparing' | 'Ready' | 'Completed';
  prepTimeMinutes: number;
  createdAt: Date;
  deliveryZone: string;
  checklist: Record<string, boolean>;
}

// --- INITIAL DATA ---
const INITIAL_ZONES: DeliveryZone[] = [
  { id: 'z1', name: 'Zone A (Downtown / Local)', fee: 300 },
  { id: 'z2', name: 'Zone B (Midtown / Suburban)', fee: 500 },
  { id: 'z3', name: 'Zone C (Outskirts / Extended)', fee: 800 }
];

const INITIAL_MENU: MenuItem[] = [
  { id: 'm1', name: 'Jerk Chicken Meal', category: 'Chicken', price: 1200, inStock: true, isSpecial: true, likes: 24, description: 'Authentic pan-jerked chicken served with rice and peas.' },
  { id: 'm2', name: 'Curry Goat Plate', category: 'Goat & Meat', price: 1600, inStock: true, likes: 18, description: 'Tender slow-cooked mutton in rich spicy Jamaican curry.' },
  { id: 'm3', name: 'Steamed Fish & Bammy', category: 'Seafood', price: 2000, inStock: false, likes: 9, description: 'Fresh catch steamed with okra, crackers, and cassava bammy.' },
  { id: 'm4', name: 'Ital Vegetable Stew', category: 'Vegetarian', price: 1000, inStock: true, likes: 15, description: 'Coconut milk based vegetable rundown with pumpkin and yellow yam.' },
  { id: 'm5', name: 'Fried Plantains (Side)', category: 'Sides', price: 400, inStock: true, likes: 30, description: 'Sweet ripe plantain slices fried golden brown.' }
];

export default function App() {
  // --- NAVIGATION & SHOP SELECTOR ---
  const [activeShop, setActiveShop] = useState<'Mamas Yard' | 'Aunties Ital'>("Mama's Yard");
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  
  // --- MENU & CONFIGURATION STATES ---
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(INITIAL_ZONES);
  
  // --- CART & ORDER CUSTOMIZATION ---
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone>(INITIAL_ZONES[0]);
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [customTipInput, setCustomTipInput] = useState<string>('');

  // --- KITCHEN ORDERS & TRACKING ---
  const [orders, setOrders] = useState<ActiveOrder[]>([]);

  // --- MODALS & LIGHTBOXES ---
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showCustomDishModal, setShowCustomDishModal] = useState<boolean>(false);
  const [customDishName, setCustomDishName] = useState<string>('');
  const [customDishPrice, setCustomDishPrice] = useState<string>('');

  // --- ADMIN EDITORS ---
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('Chicken');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editZoneFee, setEditZoneFee] = useState<string>('');

  // --- CALCULATIONS ---
  const cartSubtotal = cart.reduce((sum, entry) => sum + (entry.item.price * entry.quantity), 0);
  const cartTotal = cartSubtotal + (cart.length > 0 ? selectedZone.fee : 0) + selectedTip;

  // --- CART ACTIONS ---
  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1, spiceLevel: 'Medium', gravy: 'Normal Gravy', ketchup: true, pepper: false }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(entry => {
      if (entry.item.id === itemId) {
        const newQty = entry.quantity + delta;
        return newQty > 0 ? { ...entry, quantity: newQty } : null;
      }
      return entry;
    }).filter(Boolean) as OrderItem[]);
  };

  const handleToggleLike = (itemId: string) => {
    setMenuItems(prev => prev.map(item => item.id === itemId ? { ...item, likes: item.likes + 1 } : item));
  };

  // --- ADMIN ACTIONS ---
  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;
    const newItem: MenuItem = {
      id: `m_${Date.now()}`,
      name: newDishName,
      category: newDishCategory,
      price: parseFloat(newDishPrice),
      inStock: true,
      likes: 0
    };
    setMenuItems(prev => [...prev, newItem]);
    setNewDishName('');
    setNewDishPrice('');
  };

  const handleToggleStock = (itemId: string) => {
    setMenuItems(prev => prev.map(item => item.id === itemId ? { ...item, inStock: !item.inStock } : item));
  };

  const handleUpdateZoneFee = (zoneId: string) => {
    if (!editZoneFee) return;
    setDeliveryZones(prev => prev.map(z => z.id === zoneId ? { ...z, fee: parseFloat(editZoneFee) } : z));
    setEditingZoneId(null);
    setEditZoneFee('');
  };

  // --- CUSTOM DISH ADDITION ---
  const handleAddCustomDishToCart = () => {
    if (!customDishName || !customDishPrice) return;
    const customItem: MenuItem = {
      id: `custom_${Date.now()}`,
      name: customDishName,
      category: 'Special Order',
      price: parseFloat(customDishPrice),
      inStock: true,
      likes: 0
    };
    handleAddToCart(customItem);
    setCustomDishName('');
    setCustomDishPrice('');
    setShowCustomDishModal(false);
  };

  // --- ORDER DISPATCHING ---
  const handleDispatchOrder = () => {
    if (cart.length === 0) return;

    const newOrder: ActiveOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      shopName: activeShop,
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee: selectedZone.fee,
      tipAmount: selectedTip,
      total: cartTotal,
      status: 'Preparing',
      prepTimeMinutes: 25,
      createdAt: new Date(),
      deliveryZone: selectedZone.name,
      checklist: {}
    };

    setOrders(prev => [newOrder, ...prev]);

    let text = `*NEW ORDER - ${activeShop.toUpperCase()}*\n`;
    text += `Order ID: #${newOrder.id}\n------------------------------\n`;
    cart.forEach(entry => {
      text += `• ${entry.quantity}x ${entry.item.name} ($${entry.item.price * entry.quantity})\n`;
      text += `  Custom: ${entry.spiceLevel}, ${entry.gravy}${entry.ketchup ? ', Ketchup' : ''}${entry.pepper ? ', Pepper' : ''}\n`;
      if (entry.specialInstructions) text += `  Note: ${entry.specialInstructions}\n`;
    });
    text += `------------------------------\n`;
    text += `Subtotal: $${cartSubtotal}\n`;
    text += `Delivery (${selectedZone.name}): $${selectedZone.fee}\n`;
    if (selectedTip > 0) text += `Cook Tip: $${selectedTip}\n`;
    text += `*TOTAL: $${cartTotal}*\n`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    
    setCart([]);
    setSelectedTip(0);
    setCustomTipInput('');
  };

  const handleProgressStatus = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const nextStatus = o.status === 'Preparing' ? 'Ready' : 'Completed';
        return { ...o, status: nextStatus };
      }
      return o;
    }));
  };

  const handleToggleChecklist = (orderId: string, itemKey: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          checklist: { ...o.checklist, [itemKey]: !o.checklist[itemKey] }
        };
      }
      return o;
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-12">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="w-6 h-6 text-emerald-500" />
          <select 
            value={activeShop} 
            onChange={(e) => setActiveShop(e.target.value as any)}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="Mama's Yard">Mama's Yard Cookshop</option>
            <option value="Auntie's Ital">Auntie's Ital Shack</option>
          </select>
        </div>

        <button 
          onClick={() => setIsAdminOpen(!isAdminOpen)}
          className="flex items-center gap-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3 py-1.5 rounded-lg font-medium transition"
        >
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>{isAdminOpen ? 'Close Admin' : 'Master Control'}</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT COLUMN: MENU & CONTROLS */}
        <div className="md:col-span-2 space-y-6">

          {/* MASTER CONTROL CENTER PANEL */}
          {isAdminOpen && (
            <section className="bg-neutral-900 border border-emerald-500/30 rounded-xl p-5 space-y-6 animate-in fade-in">
              <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Settings className="w-5 h-5" /> Master Control Center
              </h2>

              {/* 1. Add Dish */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-300">Add Menu Item</h3>
                <form onSubmit={handleAddMenuItem} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input 
                    type="text" 
                    placeholder="Dish Name" 
                    value={newDishName} 
                    onChange={e => setNewDishName(e.target.value)}
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="number" 
                    placeholder="Price ($)" 
                    value={newDishPrice} 
                    onChange={e => setNewDishPrice(e.target.value)}
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-2 text-xs font-semibold">
                    Add Dish
                  </button>
                </form>
              </div>

              {/* 2. Adjust Delivery Prices */}
              <div className="space-y-3 pt-3 border-t border-neutral-800">
                <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Adjust Delivery Prices
                </h3>
                <div className="space-y-2">
                  {deliveryZones.map(zone => (
                    <div key={zone.id} className="flex items-center justify-between bg-neutral-800/60 p-2.5 rounded-lg border border-neutral-700/50 text-xs">
                      <span className="font-medium text-neutral-300">{zone.name}</span>
                      {editingZoneId === zone.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            defaultValue={zone.fee} 
                            onChange={e => setEditZoneFee(e.target.value)}
                            className="w-20 bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-xs text-right"
                          />
                          <button onClick={() => handleUpdateZoneFee(zone.id)} className="bg-emerald-600 px-2 py-1 rounded text-white text-xs">
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">${zone.fee}</span>
                          <button onClick={() => { setEditingZoneId(zone.id); setEditZoneFee(zone.fee.toString()); }} className="text-neutral-400 hover:text-white">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. In-Stock Toggles */}
              <div className="space-y-3 pt-3 border-t border-neutral-800">
                <h3 className="text-sm font-semibold text-neutral-300">Inventory Toggles</h3>
                <div className="grid grid-cols-2 gap-2">
                  {menuItems.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => handleToggleStock(item.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between border ${
                        item.inStock ? 'bg-neutral-800/80 border-neutral-700 text-neutral-200' : 'bg-red-950/40 border-red-800/50 text-red-300 line-through'
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-[10px] uppercase font-bold">{item.inStock ? 'In Stock' : 'Sold Out'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* MENU HEADER & CUSTOM DISH TRIGGER */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-black text-white tracking-tight">{activeShop} Menu</h1>
              <button 
                onClick={() => setShowCustomDishModal(true)}
                className="text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3 py-1.5 rounded-lg font-medium text-emerald-400 transition"
              >
                + Custom Dish Request
              </button>
            </div>

            {/* DISH GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {menuItems.map(item => (
                <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-white text-base">{item.name}</h3>
                      <button onClick={() => handleToggleLike(item.id)} className="flex items-center gap-1 text-xs text-rose-400 bg-rose-950/30 px-2 py-1 rounded-full border border-rose-900/40">
                        <Heart className="w-3 h-3 fill-rose-400" /> {item.likes}
                      </button>
                    </div>
                    {item.description && <p className="text-xs text-neutral-400 mt-1">{item.description}</p>}
                    <p className="text-[11px] text-neutral-500 mt-0.5">{item.category}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                    <span className="text-lg font-black text-emerald-400">${item.price}</span>
                    {item.inStock ? (
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-neutral-500 bg-neutral-800 px-2.5 py-1 rounded">Sold Out</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ACTIVE ORDERS KITCHEN CHECKLIST */}
          {orders.length > 0 && (
            <section className="space-y-4 pt-6 border-t border-neutral-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" /> Kitchen Order Checklist
              </h2>
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-sm text-white">#{order.id}</span>
                        <p className="text-xs text-neutral-400">{order.shopName} • {order.deliveryZone}</p>
                      </div>
                      <button 
                        onClick={() => handleProgressStatus(order.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Preparing' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          order.status === 'Ready' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {order.status}
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-neutral-800/60">
                      {order.items.map((entry, idx) => {
                        const itemKey = `${order.id}_${idx}`;
                        const isChecked = order.checklist[itemKey];
                        return (
                          <div 
                            key={idx} 
                            onClick={() => handleToggleChecklist(order.id, itemKey)}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer border ${
                              isChecked ? 'bg-emerald-950/20 border-emerald-900/40 text-neutral-400 line-through' : 'bg-neutral-800/40 border-neutral-700/40 text-white'
                            }`}
                          >
                            <span>{entry.quantity}x {entry.item.name} ({entry.spiceLevel}, {entry.gravy})</span>
                            <CheckCircle2 className={`w-4 h-4 ${isChecked ? 'text-emerald-400' : 'text-neutral-600'}`} />
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center pt-2 text-xs text-neutral-400">
                      <span>Total: <strong className="text-white">${order.total}</strong> (Includes${order.tipAmount} tip)</span>
                      <span>Prep: ~{order.prepTimeMinutes} mins</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* RIGHT COLUMN: CART & CHECKOUT */}
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-5 sticky top-20">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <ShoppingBag className="w-5 h-5 text-emerald-400" /> Your Order
            </h2>

            {cart.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-6">Your cart is empty. Add items from the menu to start!</p>
            ) : (
              <>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cart.map((entry) => (
                    <div key={entry.item.id} className="bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-700/50 text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-white">{entry.item.name}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleUpdateQuantity(entry.item.id, -1)} className="text-neutral-400 hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="font-bold text-white">{entry.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(entry.item.id, 1)} className="text-neutral-400 hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <select 
                          value={entry.spiceLevel} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setCart(prev => prev.map(i => i.item.id === entry.item.id ? { ...i, spiceLevel: val } : i));
                          }}
                          className="bg-neutral-900 border border-neutral-700 rounded px-1.5 py-1 text-neutral-300"
                        >
                          <option>Mild Spice</option>
                          <option>Medium Spice</option>
                          <option>Extra Hot</option>
                        </select>

                        <select 
                          value={entry.gravy} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setCart(prev => prev.map(i => i.item.id === entry.item.id ? { ...i, gravy: val } : i));
                          }}
                          className="bg-neutral-900 border border-neutral-700 rounded px-1.5 py-1 text-neutral-300"
                        >
                          <option>Normal Gravy</option>
                          <option>Extra Gravy</option>
                          <option>Gravy on Side</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DELIVERY ZONE SELECTOR */}
                <div className="space-y-1.5 pt-3 border-t border-neutral-800">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Delivery Zone
                  </label>
                  <select 
                    value={selectedZone.id} 
                    onChange={(e) => {
                      const zone = deliveryZones.find(z => z.id === e.target.value);
                      if (zone) setSelectedZone(zone);
                    }}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-2 text-xs font-medium text-white focus:outline-none"
                  >
                    {deliveryZones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name} (+${zone.fee})</option>
                    ))}
                  </select>
                </div>

                {/* COOK TIP SELECTOR */}
                <div className="space-y-2 pt-3 border-t border-neutral-800">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                    <HeartHandshake className="w-3.5 h-3.5 text-rose-400" /> Add Cook Tip
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 100, 200, 500].map(amount => (
                      <button 
                        key={amount}
                        type="button"
                        onClick={() => { setSelectedTip(amount); setCustomTipInput(''); }}
                        className={`py-1.5 rounded text-xs font-bold border ${
                          selectedTip === amount && !customTipInput ? 'bg-rose-950 border-rose-700 text-rose-300' : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                        }`}
                      >
                        {amount === 0 ? 'None' : `$${amount}`}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="number" 
                    placeholder="Custom tip amount ($)"
                    value={customTipInput}
                    onChange={(e) => {
                      setCustomTipInput(e.target.value);
                      setSelectedTip(parseFloat(e.target.value) || 0);
                    }}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* TOTAL BREAKDOWN */}
                <div className="space-y-1.5 pt-3 border-t border-neutral-800 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span>${cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Delivery</span>
                    <span>${selectedZone.fee}</span>
                  </div>
                  {selectedTip > 0 && (
                    <div className="flex justify-between text-rose-400 font-medium">
                      <span>Cook Tip</span>
                      <span>+${selectedTip}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-neutral-800">
                    <span>Total</span>
                    <span className="text-emerald-400">${cartTotal}</span>
                  </div>
                </div>

                {/* DISPATCH BUTTON */}
                <button 
                  onClick={handleDispatchOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
                >
                  <Send className="w-4 h-4" /> Send Order to WhatsApp
                </button>
              </>
            )}
          </div>
        </div>

      </main>

      {/* CUSTOM DISH MODAL */}
      {showCustomDishModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base">Custom Dish Request</h3>
              <button onClick={() => setShowCustomDishModal(false)} className="text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Dish Name / Special Request" 
                value={customDishName} 
                onChange={e => setCustomDishName(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
              <input 
                type="number" 
                placeholder="Agreed Price ($)" 
                value={customDishPrice} 
                onChange={e => setCustomDishPrice(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowCustomDishModal(false)} className="px-4 py-2 bg-neutral-800 rounded-lg text-xs text-neutral-300">Cancel</button>
              <button onClick={handleAddCustomDishToCart} className="px-4 py-2 bg-emerald-600 rounded-lg text-xs font-bold text-white">Add to Order</button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      {zoomedImage && (
        <div onClick={() => setZoomedImage(null)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <img src={zoomedImage} alt="Full View" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
