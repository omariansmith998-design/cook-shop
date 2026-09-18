import React, { useState, useEffect } from 'react';
import { ShoppingBag, Utensils, Settings, ClipboardList, Plus, Trash2, MapPin, Clock, Edit2, Check, Flame, Star, Image as ImageIcon, Database, ShieldAlert, Lock, Image } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isSpecial?: boolean;
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
  // Inject Tailwind & Supabase CDNs
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
    if (!document.getElementById('supabase-cdn')) {
      const sbScript = document.createElement('script');
      sbScript.id = 'supabase-cdn';
      sbScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      sbScript.onload = () => setSbLoaded(true);
      document.head.appendChild(sbScript);
    } else if ((window as any).supabase) {
      setSbLoaded(true);
    }
  }, []);

  const [sbLoaded, setSbLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'owner'>('menu');
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Supabase Credentials State
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('cookshop_sb_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('cookshop_sb_key') || '');
  
  // Shop Settings State
  const [shopName, setShopName] = useState(() => localStorage.getItem('cookshop_name') || 'Island Spice Cookshop');
  const [shopPhone, setShopPhone] = useState(() => localStorage.getItem('cookshop_phone') || '18767739161');
  const [shopAddress, setShopAddress] = useState(() => localStorage.getItem('cookshop_address') || 'Main Street, Montego Bay');
  const [shopMapLink, setShopMapLink] = useState(() => localStorage.getItem('cookshop_map') || 'https://maps.google.com');
  const [shopStatus, setShopStatus] = useState<'Open' | 'Closing Soon' | 'Closed'>(() => (localStorage.getItem('cookshop_status') as any) || 'Open');
  const [deliveryEnabled, setDeliveryEnabled] = useState(() => localStorage.getItem('cookshop_delivery') === 'true');
  const [deliveryFee, setDeliveryFee] = useState(() => Number(localStorage.getItem('cookshop_delivery_fee')) || 300);
  const [ownerPin, setOwnerPin] = useState(() => localStorage.getItem('cookshop_pin') || '1234');
  const [shopHeaderImage, setShopHeaderImage] = useState(() => localStorage.getItem('cookshop_header_img') || '');

  // Master Developer PIN
  const MASTER_DEV_PIN = '9999';

  // Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('cookshop_menu');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Brown Stew Chicken', category: 'Mains', description: 'Served with rice and peas or ground provision.', price: 1000, imageUrl: 'https://images.unsplash.com/photo-1545224182-5e04c8f5f3e4?auto=format&fit=crop&w=400&q=80', isAvailable: true, isSpecial: true },
      { id: '2', name: 'Curry Goat', category: 'Mains', description: 'Tender goat mutton cooked in authentic island curry.', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80', isAvailable: true, isSpecial: true },
      { id: '3', name: 'Fried Dumplings (3pc)', category: 'Sides', description: 'Crispy golden fried dough dumplings.', price: 300, imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', isAvailable: true, isSpecial: false },
      { id: '4', name: 'Cornmeal Porridge', category: 'Breakfast Sides', description: 'Rich, smooth coconut-flavored cornmeal porridge.', price: 500, imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80', isAvailable: true, isSpecial: false }
    ];
  });

  // Cart & Orders State
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cookshop_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const getSupabaseClient = () => {
    if (!sbLoaded || !supabaseUrl || !supabaseKey || !(window as any).supabase) return null;
    try {
      if (!supabaseUrl.startsWith('https://')) return null;
      return (window as any).supabase.createClient(supabaseUrl.trim(), supabaseKey.trim());
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('cookshop_sb_url', supabaseUrl);
      localStorage.setItem('cookshop_sb_key', supabaseKey);
      localStorage.setItem('cookshop_name', shopName);
      localStorage.setItem('cookshop_phone', shopPhone);
      localStorage.setItem('cookshop_address', shopAddress);
      localStorage.setItem('cookshop_map', shopMapLink);
      localStorage.setItem('cookshop_status', shopStatus);
      localStorage.setItem('cookshop_delivery', String(deliveryEnabled));
      localStorage.setItem('cookshop_delivery_fee', String(deliveryFee));
      localStorage.setItem('cookshop_pin', ownerPin);
      localStorage.setItem('cookshop_header_img', shopHeaderImage);
      localStorage.setItem('cookshop_menu', JSON.stringify(menuItems));
      localStorage.setItem('cookshop_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Storage quota limit reached.');
    }

    const sb = getSupabaseClient();
    if (sb) {
      sb.from('shop_settings').upsert({
        id: 1,
        shop_name: shopName,
        shop_phone: shopPhone,
        shop_address: shopAddress,
        shop_map: shopMapLink,
        shop_status: shopStatus,
        delivery_enabled: deliveryEnabled,
        delivery_fee: deliveryFee,
        owner_pin: ownerPin
      }).then(() => {});

      menuItems.forEach(item => {
        sb.from('menu_items').upsert({
          id: item.id,
          name: item.name,
          category: item.category,
          description: item.description,
          price: item.price,
          image_url: item.imageUrl,
          is_available: item.isAvailable,
          is_special: item.isSpecial
        }).then(() => {});
      });
    }
  }, [supabaseUrl, supabaseKey, shopName, shopPhone, shopAddress, shopMapLink, shopStatus, deliveryEnabled, deliveryFee, ownerPin, shopHeaderImage, menuItems, orders, sbLoaded]);

  // Dish Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('Mains');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishImage, setDishImage] = useState('');
  const [dishIsSpecial, setDishIsSpecial] = useState(false);

  // Compressed Image Upload Helper to prevent quota crashes
  const handleCompressedImage = (file: File, callback: (result: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCompressedImage(file, (compressedBase64) => setDishImage(compressedBase64));
    }
  };

  const handleHeaderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCompressedImage(file, (compressedBase64) => setShopHeaderImage(compressedBase64));
    }
  };

  const handleOwnerTabClick = () => {
    if (isOwnerUnlocked) {
      setActiveTab('owner');
    } else {
      const pinInput = prompt('Enter PIN to access orders or admin panel:');
      if (pinInput === MASTER_DEV_PIN) {
        setIsOwnerUnlocked(true);
        setIsDevMode(true);
        setActiveTab('owner');
      } else if (pinInput === ownerPin) {
        setIsOwnerUnlocked(true);
        setIsDevMode(false);
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

  const handleCheckout = async () => {
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
    
    const formattedTime = new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

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

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    const sb = getSupabaseClient();
    if (sb) {
      await sb.from('orders').upsert({
        id: orderId,
        customer_name: customerName,
        customer_phone: customerPhone,
        items: cart,
        total: grandTotal,
        type: orderType,
        status: 'Received',
        timestamp: formattedTime
      });
    }
    
    window.open(whatsappUrl, '_blank');
    setCart([]);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName || !dishPrice) return;

    let updatedMenu = [...menuItems];
    if (editingId) {
      updatedMenu = menuItems.map(item => item.id === editingId ? {
        ...item,
        name: dishName,
        category: dishCategory,
        description: dishDesc,
        price: parseFloat(dishPrice),
        imageUrl: dishImage || item.imageUrl,
        isSpecial: dishIsSpecial
      } : item);
      setEditingId(null);
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        name: dishName,
        category: dishCategory,
        description: dishDesc,
        price: parseFloat(dishPrice),
        imageUrl: dishImage || 'https://images.unsplash.com/photo-1545224182-5e04c8f5f3e4?auto=format&fit=crop&w=400&q=80',
        isAvailable: true,
        isSpecial: dishIsSpecial
      };
      updatedMenu = [...menuItems, newItem];
    }

    setMenuItems(updatedMenu);

    const sb = getSupabaseClient();
    if (sb) {
      const targetItem = updatedMenu.find(i => i.id === (editingId || updatedMenu[updatedMenu.length - 1].id));
      if (targetItem) {
        await sb.from('menu_items').upsert({
          id: targetItem.id,
          name: targetItem.name,
          category: targetItem.category,
          description: targetItem.description,
          price: targetItem.price,
          image_url: targetItem.imageUrl,
          is_available: targetItem.isAvailable,
          is_special: targetItem.isSpecial
        });
      }
    }

    setDishName('');
    setDishDesc('');
    setDishPrice('');
    setDishImage('');
    setDishIsSpecial(false);
    setDishCategory('Mains');
  };

  const startEditing = (item: MenuItem) => {
    setEditingId(item.id);
    setDishName(item.name);
    setDishCategory(item.category);
    setDishDesc(item.description);
    setDishPrice(item.price.toString());
    setDishImage(item.imageUrl || '');
    setDishIsSpecial(item.isSpecial || false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDishName('');
    setDishDesc('');
    setDishPrice('');
    setDishImage('');
    setDishIsSpecial(false);
  };

  const toggleAvailability = async (id: string) => {
    const updated = menuItems.map(i => i.id === id ? { ...i, isAvailable: !i.isAvailable } : i);
    setMenuItems(updated);
    const item = updated.find(i => i.id === id);
    const sb = getSupabaseClient();
    if (sb && item) {
      await sb.from('menu_items').update({ is_available: item.isAvailable }).eq('id', id);
    }
  };

  const toggleSpecial = async (id: string) => {
    const updated = menuItems.map(i => i.id === id ? { ...i, isSpecial: !i.isSpecial } : i);
    setMenuItems(updated);
    const item = updated.find(i => i.id === id);
    const sb = getSupabaseClient();
    if (sb && item) {
      await sb.from('menu_items').update({ is_special: item.isSpecial }).eq('id', id);
    }
  };

  const deleteDish = async (id: string) => {
    if (confirm('Are you sure you want to delete this dish?')) {
      setMenuItems(menuItems.filter(i => i.id !== id));
      const sb = getSupabaseClient();
      if (sb) {
        await sb.from('menu_items').delete().eq('id', id);
      }
    }
  };

  const toggleOrderStatus = async (id: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, status: (o.status === 'Received' ? 'Completed' : 'Received') as any } : o);
    setOrders(updated);
    const order = updated.find(o => o.id === id);
    const sb = getSupabaseClient();
    if (sb && order) {
      await sb.from('orders').update({ status: order.status }).eq('id', id);
    }
  };

  const categories = ['All', '⭐ Specials', ...Array.from(new Set(menuItems.map(i => i.category)))];
  const filteredMenuItems = selectedCategory === 'All' 
    ? menuItems 
    : selectedCategory === '⭐ Specials' 
      ? menuItems.filter(i => i.isSpecial) 
      : menuItems.filter(i => i.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/50 to-stone-100 text-stone-900 font-sans pb-16">
      <header className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-950 text-white p-4 sm:p-5 shadow-xl border-b-4 border-amber-500 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            {shopHeaderImage ? (
              <img src={shopHeaderImage} alt="Logo" className="w-10 h-10 object-cover rounded-xl border border-amber-400 shadow-md" />
            ) : (
              <div className="bg-amber-600 p-2 rounded-xl shadow-md border border-amber-400">
                <Flame className="text-amber-100" size={24} />
              </div>
            )}
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-wide drop-shadow">{shopName}</h1>
              <p className="text-[10px] sm:text-[11px] text-amber-200 tracking-widest uppercase font-bold flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${shopStatus === 'Open' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                Authentic Jamaican Taste
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 bg-black/30 p-1 rounded-xl border border-white/10">
            <button onClick={() => setActiveTab('menu')} className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'menu' ? 'bg-amber-500 text-white shadow-md' : 'text-amber-100 hover:text-white'}`}>Menu</button>
            <button onClick={handleOwnerTabClick} className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'owner' ? 'bg-amber-500 text-white shadow-md' : 'text-amber-100 hover:text-white'}`}>🔒 Orders / Admin</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        {shopStatus !== 'Open' && (
          <div className={`mb-6 p-3.5 rounded-xl text-sm font-black text-center shadow-md flex items-center justify-center gap-2 border-2 ${shopStatus === 'Closing Soon' ? 'bg-amber-300 text-amber-950 border-amber-400' : 'bg-red-500 text-white border-red-600 animate-bounce'}`}>
            <Clock size={20} /> Notice: We are currently {shopStatus.toUpperCase()}!
          </div>
        )}

        {activeTab === 'menu' ? (
          <div>
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl border-2 border-amber-200 text-amber-950 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
              <div>
                <p className="flex items-center gap-2 font-bold text-base"><MapPin size={18} className="text-amber-800 flex-shrink-0" /> {shopAddress}</p>
                <p className="text-xs mt-1 font-semibold text-amber-900/80 pl-6">🛵 Delivery Fee: <span className="font-black">${deliveryFee} JMD</span> ({deliveryEnabled ? 'Available' : 'Disabled'})</p>
              </div>
              {shopMapLink && (
                <a href={shopMapLink} target="_blank" rel="noopener noreferrer" className="bg-amber-900 text-amber-50 px-4 py-2 rounded-xl text-xs font-black hover:bg-amber-950 transition-all shadow flex items-center gap-1.5">📍 View Pinned Map</a>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-stone-800 tracking-tight">Today's Menu</h2>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-sm ${selectedCategory === cat ? 'bg-amber-900 text-white shadow-md ring-2 ring-amber-600/50' : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'}`}>{cat}</button>
              ))}
            </div>
            
            <div className="grid gap-4 sm:gap-5 mb-8">
              {filteredMenuItems.map(item => (
                <div key={item.id} className={`bg-white p-4 sm:p-5 rounded-2xl shadow-sm border-2 transition-all flex gap-4 items-center relative overflow-hidden ${item.isSpecial ? 'border-amber-400 bg-gradient-to-r from-amber-50/60 to-white shadow-md' : item.isAvailable ? 'border-stone-100 hover:border-amber-300' : 'border-red-100 opacity-60 bg-stone-50'}`}>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-stone-200 flex-shrink-0 shadow-sm" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-lg text-stone-900">{item.name}</h3>
                      {item.isSpecial && <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm"><Star size={10} fill="currentColor" /> Chef's Special</span>}
                      {!item.isAvailable && <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Sold Out</span>}
                    </div>
                    <span className="inline-block text-[11px] uppercase font-black text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-md mt-1">{item.category}</span>
                    <p className="text-stone-600 text-xs sm:text-sm mt-1.5 line-clamp-2">{item.description}</p>
                    <p className="font-black text-amber-900 text-base mt-2">${item.price} <span className="text-xs text-stone-500 font-bold">JMD</span></p>
                  </div>
                  <button onClick={() => addToCart(item)} disabled={!item.isAvailable} className={`px-4 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-1.5 flex-shrink-0 shadow ${item.isAvailable ? 'bg-amber-800 text-white hover:bg-amber-900 shadow-amber-900/20' : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'}`}><Plus size={16} /> Add</button>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-amber-300 mt-6">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-stone-900 border-b pb-3"><ShoppingBag className="text-amber-800" size={22} /> Your Order ({cart.length} items)</h3>
                <div className="divide-y divide-stone-100 mb-4 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item, index) => (
                    <div key={index} className="py-3 flex justify-between items-center text-sm">
                      <span className="font-bold text-stone-800">{item.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-amber-900">${item.price} JMD</span>
                        <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-dashed border-stone-200 pt-4 space-y-2 text-sm mb-6 bg-amber-50/50 p-4 rounded-2xl">
                  <div className="flex justify-between text-stone-600 font-semibold"><span>Subtotal:</span><span>${calculateSubtotal()} JMD</span></div>
                  {orderType === 'Delivery' && <div className="flex justify-between text-stone-600 font-semibold"><span>Delivery Fee:</span><span>${deliveryFee} JMD</span></div>}
                  <div className="flex justify-between font-black text-xl pt-2 border-t border-amber-200 text-amber-950"><span>Total:</span><span>${calculateGrandTotal()} JMD</span></div>
                </div>

                <div className="space-y-4">
                  <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Your Name</label><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Omarian Smith" className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none" /></div>
                  <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Phone Number</label><input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="e.g. 876-555-0199" className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none" /></div>
                  <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Order Type</label><select value={orderType} onChange={(e) => setOrderType(e.target.value as any)} className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-bold bg-white focus:border-amber-600 focus:outline-none"><option value="Pickup">Pickup</option>{deliveryEnabled && <option value="Delivery">Delivery (+${deliveryFee} JMD)</option>}</select></div>
                  <button onClick={handleCheckout} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30 text-base tracking-wide mt-2">Send Order via WhatsApp 🚀</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {!isDevMode ? (
              <div className="space-y-6">
                <div className="bg-amber-100 p-4 rounded-2xl border-2 border-amber-300 text-amber-950 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base flex items-center gap-2"><Lock size={18} /> Cookshop Owner Orders Dashboard</h3>
                    <p className="text-xs font-medium mt-0.5">Viewing incoming customer orders. Menu editing is managed by your developer.</p>
                  </div>
                  <button onClick={() => { setIsOwnerUnlocked(false); setActiveTab('menu'); }} className="text-xs bg-amber-900 text-white px-3 py-1.5 rounded-xl font-bold">Lock / Exit</button>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-stone-200">
                  <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="font-black text-lg flex items-center gap-2 text-stone-900"><ClipboardList className="text-amber-800" size={20} /> Live Customer Orders ({orders.length})</h3>
                    {orders.length > 0 && <button onClick={() => setOrders([])} className="text-xs text-red-600 hover:underline font-black">Clear All Orders</button>}
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-sm text-stone-500 py-6 text-center font-medium">No orders received yet.</p>
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
                              <span className={`px-2.5 py-1 rounded-full text-xs text-white font-black shadow-sm ${order.status === 'Completed' ? 'bg-emerald-600' : 'bg-amber-800'}`}>{order.status}</span>
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
                            <button onClick={() => toggleOrderStatus(order.id)} className={`text-xs px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 shadow-sm ${order.status === 'Completed' ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}><Check size={14} /> {order.status === 'Completed' ? 'Reopen Order' : 'Mark Completed'}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl border-2 border-purple-400">
                  <h3 className="font-black text-lg mb-2 flex items-center gap-2 border-b border-purple-800 pb-3">
                    <ShieldAlert className="text-purple-300" size={22} /> Developer Master Control (Full Admin)
                  </h3>
                  <p className="text-xs text-purple-200 mb-4 font-medium">Logged in via Master Developer PIN (`9999`). You control the menu, header branding, and client PINs.</p>
                  
                  <div className="space-y-3 bg-black/30 p-4 rounded-2xl border border-purple-500/30">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-widest block">Client Owner PIN Management</span>
                    <div className="flex gap-3">
                      <input type="text" value={ownerPin} onChange={(e) => setOwnerPin(e.target.value)} className="w-full p-2.5 bg-stone-900 text-white border border-purple-400 rounded-xl text-sm font-bold" />
                      <button onClick={() => alert('Client Owner PIN updated successfully!')} className="bg-purple-600 hover:bg-purple-700 px-4 py-2.5 rounded-xl text-xs font-black">Save PIN</button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-amber-300 bg-gradient-to-br from-amber-50/40 to-white">
                  <h3 className="font-black text-lg mb-2 flex items-center gap-2 text-stone-900 border-b pb-3">
                    <Database className="text-amber-800" size={20} /> Supabase Cloud Database Connection
                  </h3>
                  <p className="text-xs text-stone-600 mb-4 font-medium">Connect your Supabase project so menu items, settings, and orders sync live in the cloud!</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Supabase Project URL</label>
                      <input type="text" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} placeholder="https://xxxxxx.supabase.co" className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Supabase Anon Key</label>
                      <input type="password" value={supabaseKey} onChange={(e) => setSupabaseKey(e.target.value)} placeholder="eyJhbGciOi..." className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-stone-200">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-stone-900 border-b pb-3"><Settings className="text-amber-800" size={20} /> Shop Settings & Header Branding</h3>
                  <div className="space-y-4">
                    <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Cookshop Name</label><input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-bold focus:border-amber-600 focus:outline-none" /></div>
                    
                    <div>
                      <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Image size={16} className="text-amber-800" /> Header Logo / Banner Photo</label>
                      <input type="file" accept="image/*" onChange={handleHeaderImageUpload} className="w-full p-2.5 border-2 border-stone-200 rounded-xl text-sm bg-stone-50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-800 file:text-white hover:file:bg-amber-900 cursor-pointer" />
                      {shopHeaderImage && <div className="mt-2 flex items-center gap-3 bg-amber-50 p-2.5 rounded-xl border border-amber-200"><img src={shopHeaderImage} alt="Header Preview" className="w-12 h-12 object-cover rounded-lg border" /><span className="text-xs font-bold text-amber-900">Header photo active!</span></div>}
                    </div>

                    <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Shop Status Banner</label><select value={shopStatus} onChange={(e) => setShopStatus(e.target.value as any)} className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm bg-white font-black focus:border-amber-600 focus:outline-none"><option value="Open">🟢 Open for Business</option><option value="Closing Soon">⚠️ Closing Soon</option><option value="Closed">🔴 Closed</option></select></div>
                    <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">WhatsApp Phone Number</label><input type="text" value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none" /></div>
                    <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Shop Address Text</label><input type="text" value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none" /></div>
                    <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Google Maps Pinned Location Link</label><input type="text" value={shopMapLink} onChange={(e) => setShopMapLink(e.target.value)} className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none" /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
                      <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border"><span className="text-sm font-black text-stone-800">Enable Delivery</span><input type="checkbox" checked={deliveryEnabled} onChange={(e) => setDeliveryEnabled(e.target.checked)} className="w-5 h-5 accent-amber-800 rounded" /></div>
                      <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Delivery Fee (JMD)</label><input type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(Number(e.target.value))} className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-bold focus:border-amber-600 focus:outline-none" /></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-stone-200">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-stone-900 border-b pb-3"><Plus className="text-amber-800" size={20} /> {editingId ? 'Edit Existing Dish' : 'Add New Dish'}</h3>
                  <form onSubmit={handleSaveDish} className="space-y-4">
                    <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Dish Name</label><input type="text" value={dishName} onChange={(e) => setDishName(e.target.value)} placeholder="e.g. Oxtail" className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none" required /></div>
                    <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Category</label><input type="text" value={dishCategory} onChange={(e) => setDishCategory(e.target.value)} placeholder="e.g. Mains" className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none" /></div>
                    <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Description</label><input type="text" value={dishDesc} onChange={(e) => setDishDesc(e.target.value)} placeholder="e.g. Slow-cooked with butter beans." className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none" /></div>
                    <div>
                      <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5"><ImageIcon size={16} className="text-amber-800" /> Upload Photo from Gallery</label>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-2.5 border-2 border-stone-200 rounded-xl text-sm bg-stone-50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-800 file:text-white hover:file:bg-amber-900 cursor-pointer" />
                      {dishImage && <div className="mt-2 flex items-center gap-3 bg-amber-50 p-2.5 rounded-xl border border-amber-200"><img src={dishImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg border" /><span className="text-xs font-bold text-amber-900">Photo loaded successfully!</span></div>}
                    </div>
                    <div><label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">Price (JMD)</label><input type="number" value={dishPrice} onChange={(e) => setDishPrice(e.target.value)} placeholder="1800" className="w-full p-3 border-2 border-stone-200 rounded-xl text-sm font-medium focus:border-amber-600 focus:outline-none" required /></div>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <input type="checkbox" id="isSpecialCheck" checked={dishIsSpecial} onChange={(e) => setDishIsSpecial(e.target.checked)} className="w-5 h-5 accent-amber-800 rounded" />
                      <label htmlFor="isSpecialCheck" className="text-xs font-black text-amber-950 uppercase tracking-wide cursor-pointer">⭐ Mark as Chef's Special (Highlights on Menu)</label>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="flex-1 bg-amber-900 text-white py-3.5 rounded-2xl text-sm font-black hover:bg-amber-950 transition-all shadow-md">{editingId ? 'Save Changes' : 'Add Dish to Menu'}</button>
                      {editingId && <button type="button" onClick={cancelEditing} className="bg-stone-200 text-stone-700 px-6 py-3.5 rounded-2xl text-sm font-black hover:bg-stone-300 transition-all">Cancel</button>}
                    </div>
                  </form>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-stone-200">
                  <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-stone-900 border-b pb-3"><Utensils className="text-amber-800" size={20} /> Manage Menu Items</h3>
                  <div className="space-y-3">
                    {menuItems.map(item => (
                      <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-stone-50 rounded-2xl border-2 border-stone-200 text-sm gap-3">
                        <div className="min-w-0 pr-2 flex items-center gap-3">
                          {item.imageUrl && <img src={item.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg border flex-shrink-0" />}
                          <div>
                            <span className="font-black text-stone-900 block truncate">{item.name}</span>
                            <span className="text-xs text-stone-500 font-bold">${item.price} JMD</span>
                            {item.isSpecial && <span className="ml-2 text-[10px] bg-amber-100 text-amber-900 font-black px-2 py-0.5 rounded-full">⭐ Special</span>}
                            {!item.isAvailable && <span className="ml-2 text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded-full">Sold Out</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => toggleSpecial(item.id)} className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${item.isSpecial ? 'bg-amber-500 text-stone-950' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}>{item.isSpecial ? '⭐ Starred' : 'Make Special'}</button>
                          <button onClick={() => toggleAvailability(item.id)} className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${item.isAvailable ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'}`}>{item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}</button>
                          <button onClick={() => startEditing(item)} className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all" title="Edit dish"><Edit2 size={16} /></button>
                          <button onClick={() => deleteDish(item.id)} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all" title="Delete dish"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-stone-200">
                  <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="font-black text-lg flex items-center gap-2 text-stone-900"><ClipboardList className="text-amber-800" size={20} /> Live Customer Orders ({orders.length})</h3>
                    {orders.length > 0 && <button onClick={() => setOrders([])} className="text-xs text-red-600 hover:underline font-black">Clear All Orders</button>}
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
                              <span className={`px-2.5 py-1 rounded-full text-xs text-white font-black shadow-sm ${order.status === 'Completed' ? 'bg-emerald-600' : 'bg-amber-800'}`}>{order.status}</span>
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
                            <button onClick={() => toggleOrderStatus(order.id)} className={`text-xs px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 shadow-sm ${order.status === 'Completed' ? 'bg-stone-200 text-stone-700 hover:bg-stone-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}><Check size={14} /> {order.status === 'Completed' ? 'Reopen Order' : 'Mark Completed'}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
