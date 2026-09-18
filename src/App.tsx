import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Clock, Truck, Store, MapPin, RefreshCw, Plus, Trash2, Edit3, Settings, Navigation, ImageIcon, MessageSquare } from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface OrderRecord {
  orderNum: string;
  customerName: string;
  customerPhone: string;
  orderType: 'Pickup' | 'Delivery';
  deliveryAddress: string;
  locationLink?: string; // Google Maps pin link, set via browser geolocation at checkout
  paymentMethod: string;
  items: OrderItem[];
  total: number;
  timestamp: string;
  status: 'Pending' | 'Ready';
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image?: string; // compressed base64 thumbnail, optional
}

// ==========================================
// CONSTANTS & INITIAL DATA
// ==========================================

const SHARED_ORDERS_KEY = 'cookshop_orders_log';
const SHARED_MENU_KEY = 'cookshop_menu_items';
const SHARED_SETTINGS_KEY = 'cookshop_settings';
const OWNER_PHONE_NUMBER = '18765550199';
const MAX_IMAGE_DIMENSION = 300;
const IMAGE_JPEG_QUALITY = 0.6;

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Brown Stew Chicken', price: 1200, category: 'Mains', description: 'Served with rice and peas or ground provision.' },
  { id: 'm2', name: 'Curry Goat', price: 1500, category: 'Mains', description: 'Tender goat mutton cooked in authentic island curry.' },
  { id: 'm3', name: 'Fried Dumplings (3pcs)', price: 300, category: 'Sides', description: 'Crispy golden fried dough dumplings.' },
  { id: 'm4', name: 'Cornmeal Porridge', price: 500, category: 'Breakfast/Sides', description: 'Rich, smooth coconut-flavored cornmeal porridge.' },
];

// Blank editable item used to safely seed the Add/Edit form.
// Every field has a concrete default so the form never reads undefined.
const BLANK_MENU_ITEM: MenuItem = {
  id: '',
  name: '',
  price: 0,
  category: 'Mains',
  description: '',
  image: '',
};

declare global {
  interface Window {
    storage?: {
      get: (key: string, options?: { shared: boolean }) => Promise<{ value: string | null }>;
      set: (key: string, value: string, options?: { shared: boolean }) => Promise<void>;
    };
  }
}

// ==========================================
// STORAGE HELPERS
// ==========================================

const getStorageItem = async <T,>(key: string, fallback: T): Promise<T> => {
  try {
    if (typeof window !== 'undefined' && window.storage) {
      const res = await window.storage.get(key, { shared: true });
      return res?.value ? JSON.parse(res.value) : fallback;
    } else {
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : fallback;
    }
  } catch (e) {
    console.error(`Failed to fetch ${key} from storage:`, e);
    return fallback;
  }
};

const setStorageItem = async <T,>(key: string, value: T): Promise<void> => {
  try {
    const jsonStr = JSON.stringify(value);
    if (typeof window !== 'undefined' && window.storage) {
      await window.storage.set(key, jsonStr, { shared: true });
    } else {
      localStorage.setItem(key, jsonStr);
    }
  } catch (e) {
    console.error(`Failed to write ${key} to storage:`, e);
  }
};

// Customer-facing: always targets the customer's own phone number.
// Auto-prepends the '1' country code for a bare 10-digit Jamaican number
// (876XXXXXXX) so wa.me gets a fully-qualified number either way.
export const generateOrderReadyLink = (order: OrderRecord): string => {
  let cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10 && cleanPhone.startsWith('876')) {
    cleanPhone = '1' + cleanPhone;
  }
  const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
  const message = `Hi ${order.customerName}! Your order #${order.orderNum} (${itemsSummary}) from the cookshop is READY for ${order.orderType.toLowerCase()}. Total: $${order.total.toLocaleString()} JMD.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

// Owner-facing: always targets whatever ownerPhone is passed in (the
// cookshop's own number), never the customer's. Kept as an explicit
// parameter rather than reading OWNER_PHONE_NUMBER internally, so this
// function can't silently drift into being called with the wrong number.
export const generateNewOrderAlertLink = (order: OrderRecord, ownerPhone: string): string => {
  const cleanNumber = ownerPhone.replace(/[^0-9]/g, '');
  const formattedItems = order.items
    .map((i) => `• ${i.quantity}x ${i.name} ($${i.price * i.quantity} JMD)${i.note ? `\n  ↳ Note: "${i.note}"` : ''}`)
    .join('\n');
  const message = `🧾 *NEW ORDER #${order.orderNum}*\n----------------------------\n*Customer:* ${order.customerName}\n*Phone:* ${order.customerPhone}\n*Order Type:* ${order.orderType}\n${
    order.orderType === 'Delivery' ? `*Address:* ${order.deliveryAddress}\n${order.locationLink ? `*Map Pin:* ${order.locationLink}\n` : ''}` : ''
  }*Payment:* ${order.paymentMethod}\n----------------------------\n*Items:*\n${formattedItems}\n----------------------------\n*TOTAL DUE:* $${order.total.toLocaleString()} JMD\n*Time:* ${order.timestamp}`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

// Compresses an uploaded image file down to a small JPEG thumbnail via canvas,
// so a menu photo never balloons the shared storage payload.
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_IMAGE_DIMENSION) {
            height *= MAX_IMAGE_DIMENSION / width;
            width = MAX_IMAGE_DIMENSION;
          }
        } else {
          if (height > MAX_IMAGE_DIMENSION) {
            width *= MAX_IMAGE_DIMENSION / height;
            height = MAX_IMAGE_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', IMAGE_JPEG_QUALITY));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// ==========================================
// MENU ITEM MODAL (decoupled add/edit form)
// ==========================================
// Kept as its own component with its own local state, seeded from a safe
// default object rather than the raw item being edited. This is what
// prevents the "editing crashes" failure mode: every field always has a
// concrete value, so there's never an uncontrolled-to-controlled input
// transition or a read of `undefined.something`.

interface MenuItemModalProps {
  editingItem: MenuItem | null;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
}

function MenuItemModal({ editingItem, onSave, onCancel }: MenuItemModalProps) {
  const [draft, setDraft] = useState<MenuItem>(BLANK_MENU_ITEM);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setDraft({
        id: editingItem.id,
        name: editingItem.name ?? '',
        price: editingItem.price ?? 0,
        category: editingItem.category ?? 'Mains',
        description: editingItem.description ?? '',
        image: editingItem.image ?? '',
      });
    } else {
      setDraft(BLANK_MENU_ITEM);
    }
  }, [editingItem]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const compressed = await compressImageFile(file);
      setDraft((prev) => ({ ...prev, image: compressed }));
    } catch (err) {
      console.error('Image compression failed:', err);
      alert('Could not process that image. Try a different file.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || draft.price <= 0) {
      alert('Please enter a dish name and a price greater than zero.');
      return;
    }
    onSave({
      ...draft,
      id: draft.id || 'm_' + Date.now(),
    });
  };

  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm h-fit">
      <h3 className="font-bold text-gray-900 border-b pb-2 mb-3 flex items-center gap-1.5">
        {editingItem ? <Edit3 className="w-4 h-4 text-amber-600" /> : <Plus className="w-4 h-4 text-amber-600" />}
        {editingItem ? 'Edit Dish' : 'Add New Dish'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Dish Name</label>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Oxtail & Beans"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Price (JMD)</label>
          <input
            type="number"
            value={draft.price || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))}
            placeholder="e.g. 1800"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
          <select
            value={draft.category}
            onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="Mains">Mains</option>
            <option value="Sides">Sides</option>
            <option value="Breakfast/Sides">Breakfast/Sides</option>
            <option value="Soups & Drinks">Soups & Drinks</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            value={draft.description}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Brief dish details..."
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500 h-20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" /> Dish Photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-800 file:font-semibold"
          />
          {isCompressing && <p className="text-xs text-gray-400 mt-1">Compressing image...</p>}
          {draft.image && !isCompressing && (
            <img src={draft.image} alt="Preview" className="w-16 h-16 mt-2 rounded-lg object-cover border" />
          )}
        </div>
        <div className="flex gap-2 pt-2">
          {editingItem && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-bold text-xs"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isCompressing}
            className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2 rounded-lg font-bold text-xs shadow"
          >
            {editingItem ? 'Update Dish' : 'Save Dish'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [viewMode, setViewMode] = useState<'customer' | 'owner'>('customer');
  const [ownerTab, setOwnerTab] = useState<'orders' | 'menu'>('orders');

  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState<boolean>(true);
  const [ordersLog, setOrdersLog] = useState<OrderRecord[]>([]);

  const [cart, setCart] = useState<{ [id: string]: { item: MenuItem; quantity: number; note: string } }>({});
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [orderType, setOrderType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod] = useState('Cash');
  const [locationLink, setLocationLink] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<OrderRecord | null>(null);

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    if (!isDeliveryAvailable && orderType === 'Delivery') {
      setOrderType('Pickup');
    }
  }, [isDeliveryAvailable, orderType]);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      const savedMenu = await getStorageItem<MenuItem[]>(SHARED_MENU_KEY, DEFAULT_MENU_ITEMS);
      const savedSettings = await getStorageItem<{ delivery: boolean }>(SHARED_SETTINGS_KEY, { delivery: true });
      const savedOrders = await getStorageItem<OrderRecord[]>(SHARED_ORDERS_KEY, []);

      if (isMounted) {
        setMenuItems(savedMenu);
        setIsDeliveryAvailable(savedSettings.delivery);
        setOrdersLog(savedOrders);
      }
    };

    loadInitialData();

    const intervalId = setInterval(async () => {
      const freshOrders = await getStorageItem<OrderRecord[]>(SHARED_ORDERS_KEY, []);
      const freshMenu = await getStorageItem<MenuItem[]>(SHARED_MENU_KEY, DEFAULT_MENU_ITEMS);
      const freshSettings = await getStorageItem<{ delivery: boolean }>(SHARED_SETTINGS_KEY, { delivery: true });

      if (isMounted) {
        setOrdersLog(freshOrders);
        setMenuItems(freshMenu);
        setIsDeliveryAvailable(freshSettings.delivery);
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleToggleDelivery = async () => {
    const updated = !isDeliveryAvailable;
    setIsDeliveryAvailable(updated);
    await setStorageItem(SHARED_SETTINGS_KEY, { delivery: updated });
  };

  const handleSaveMenuItem = async (item: MenuItem) => {
    const exists = menuItems.some((it) => it.id === item.id);
    const updatedList = exists
      ? menuItems.map((it) => (it.id === item.id ? item : it))
      : [...menuItems, item];

    setMenuItems(updatedList);
    await setStorageItem(SHARED_MENU_KEY, updatedList);
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setIsAddingNew(false);
    setEditingItem(item);
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    const updatedList = menuItems.filter((it) => it.id !== id);
    setMenuItems(updatedList);
    await setStorageItem(SHARED_MENU_KEY, updatedList);
    if (editingItem?.id === id) setEditingItem(null);
  };

  const closeMenuForm = () => {
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const markOrderReadyInStorage = async (orderNum: string) => {
    const currentOrders = await getStorageItem<OrderRecord[]>(SHARED_ORDERS_KEY, []);
    const updatedLog = currentOrders.map((o) =>
      o.orderNum === orderNum ? { ...o, status: 'Ready' as const } : o
    );
    await setStorageItem(SHARED_ORDERS_KEY, updatedLog);
    setOrdersLog(updatedLog);
  };

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: existing ? existing.quantity + 1 : 1,
          note: existing ? existing.note : '',
        },
      };
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: { ...existing, quantity: newQty },
      };
    });
  };

  const totalPrice = Object.values(cart).reduce(
    (sum, entry) => sum + entry.item.price * entry.quantity,
    0
  );

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationLink(`https://www.google.com/maps?q=${latitude},${longitude}`);
        setIsLocating(false);
      },
      (err) => {
        setLocationError(err.message || 'Could not get your location.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleGenerateReceipt = async () => {
    if (!custName.trim() || !custPhone.trim()) {
      alert('Please enter your Name and Phone Number.');
      return;
    }
    const finalOrderType = isDeliveryAvailable ? orderType : 'Pickup';
    if (finalOrderType === 'Delivery' && !deliveryAddress.trim()) {
      alert('Please enter your Delivery Address.');
      return;
    }

    const uniqueOrderNum = 'ORD-' + Date.now().toString().slice(-6);
    const cartItemsList: OrderItem[] = Object.values(cart).map((entry) => ({
      id: entry.item.id,
      name: entry.item.name,
      price: entry.item.price,
      quantity: entry.quantity,
      note: entry.note || undefined,
    }));

    const receiptObj: OrderRecord = {
      orderNum: uniqueOrderNum,
      customerName: custName,
      customerPhone: custPhone,
      orderType: finalOrderType,
      deliveryAddress: finalOrderType === 'Delivery' ? deliveryAddress : 'Pickup at Cookshop',
      locationLink: finalOrderType === 'Delivery' && locationLink ? locationLink : undefined,
      paymentMethod,
      items: cartItemsList,
      total: totalPrice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
    };

    const currentOrders = await getStorageItem<OrderRecord[]>(SHARED_ORDERS_KEY, []);
    const updatedLog = [receiptObj, ...currentOrders];
    await setStorageItem(SHARED_ORDERS_KEY, updatedLog);
    setOrdersLog(updatedLog);

    setActiveReceipt(receiptObj);
    setShowCheckoutModal(false);
    setShowReceiptModal(true);
    setCart({});
    setLocationLink('');
    setLocationError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <header className="bg-amber-600 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Store className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-wide">Island Spice Cookshop</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('customer')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                viewMode === 'customer' ? 'bg-white text-amber-700 shadow' : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setViewMode('owner')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                viewMode === 'owner' ? 'bg-white text-amber-700 shadow' : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              <span>Owner Panel</span>
              {ordersLog.filter((o) => o.status === 'Pending').length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {ordersLog.filter((o) => o.status === 'Pending').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {viewMode === 'customer' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Today's Menu</h2>
              <div className="grid gap-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover border flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-amber-50 border flex items-center justify-center text-2xl flex-shrink-0">🍲</div>
                    )}
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                      <span className="inline-block mt-2 font-semibold text-amber-600">
                        ${item.price.toLocaleString()} JMD
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm flex-shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border h-fit sticky top-20">
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-600" /> Your Order
                </h2>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                  {Object.keys(cart).length} items
                </span>
              </div>

              {Object.keys(cart).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">Your cart is empty.</p>
              ) : (
                <div className="space-y-3">
                  {Object.values(cart).map(({ item, quantity }) => (
                    <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">${item.price} JMD each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 bg-gray-200 text-gray-700 rounded flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-semibold">{quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 bg-gray-200 text-gray-700 rounded flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t flex justify-between items-center font-bold text-base">
                    <span>Total:</span>
                    <span className="text-amber-600">${totalPrice.toLocaleString()} JMD</span>
                  </div>

                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-bold text-center mt-4 transition shadow-md"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-wrap justify-between items-center gap-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setOwnerTab('orders')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                    ownerTab === 'orders' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Clock className="w-4 h-4" /> Orders Log ({ordersLog.length})
                </button>
                <button
                  onClick={() => setOwnerTab('menu')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                    ownerTab === 'menu' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Settings className="w-4 h-4" /> Manage Menu & Settings
                </button>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg border">
                <span className="text-xs font-bold text-gray-700">Delivery Service:</span>
                <button
                  onClick={handleToggleDelivery}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition ${
                    isDeliveryAvailable ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {isDeliveryAvailable ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>

            {ownerTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">Live Customer Orders</h2>
                  <button
                    onClick={async () => setOrdersLog(await getStorageItem(SHARED_ORDERS_KEY, []))}
                    className="flex items-center gap-1.5 text-xs bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg border font-medium shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-gray-600" /> Refresh Log
                  </button>
                </div>

                {ordersLog.length === 0 ? (
                  <div className="bg-white p-8 text-center rounded-xl border text-gray-500">
                    No orders received yet.
                  </div>
                ) : (
                  ordersLog.map((order) => (
                    <div
                      key={order.orderNum}
                      className={`bg-white p-5 rounded-xl border shadow-sm transition ${
                        order.status === 'Ready' ? 'border-green-300 bg-green-50/20' : 'border-amber-200'
                      }`}
                    >
                      <div className="flex justify-between items-start border-b pb-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-amber-700 text-lg">#{order.orderNum}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                order.status === 'Ready'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {order.customerName} ({order.customerPhone})
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {order.timestamp} • {order.orderType}
                          </p>
                          {order.orderType === 'Delivery' && (
                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1 font-medium">
                              <MapPin className="w-3 h-3 text-red-500" /> {order.deliveryAddress}
                            </p>
                          )}
                          {order.locationLink && (
                            <a
                              href={order.locationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-medium"
                            >
                              <Navigation className="w-3 h-3" /> View Exact Pin on Map
                            </a>
                          )}
                        </div>
                        <span className="text-lg font-bold text-gray-900">${order.total.toLocaleString()} JMD</span>
                      </div>

                      <div className="space-y-1 mb-4">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="text-sm flex justify-between text-gray-700">
                            <span>
                              {it.quantity}x <strong className="text-gray-900">{it.name}</strong>
                            </span>
                            <span>${(it.price * it.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t">
                        {order.status === 'Pending' ? (
                          <>
                            <a
                              href={generateNewOrderAlertLink(order, OWNER_PHONE_NUMBER)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-xs transition border flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-green-600" /> Order Summary
                            </a>
                            <a
                              href={generateOrderReadyLink(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => markOrderReadyInStorage(order.orderNum)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition shadow-sm flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-4 h-4" /> Mark Ready & Notify Customer
                            </a>
                          </>
                        ) : (
                          <span className="text-xs text-green-700 font-semibold bg-green-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Order Completed
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {ownerTab === 'menu' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(editingItem || isAddingNew) ? (
                  <MenuItemModal
                    editingItem={editingItem}
                    onSave={handleSaveMenuItem}
                    onCancel={closeMenuForm}
                  />
                ) : (
                  <div className="bg-white p-5 rounded-xl border shadow-sm h-fit flex flex-col items-center justify-center text-center gap-3 py-10">
                    <Plus className="w-8 h-8 text-amber-500" />
                    <p className="text-sm text-gray-500">Add a new dish to the menu.</p>
                    <button
                      onClick={() => setIsAddingNew(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow"
                    >
                      + Add New Dish
                    </button>
                  </div>
                )}

                <div className="md:col-span-2 space-y-3">
                  <h3 className="font-bold text-gray-900 border-b pb-2">Active Menu Items ({menuItems.length})</h3>
                  {menuItems.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-amber-50 border flex items-center justify-center text-lg flex-shrink-0">🍲</div>
                      )}
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-800">{item.name}</h4>
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        <p className="text-sm font-bold text-amber-600 mt-1">${item.price.toLocaleString()} JMD</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditMenuItem(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border transition"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg border transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Complete Your Order</h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Omarian"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="e.g. 876-555-0199"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Fulfillment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('Pickup')}
                    className={`py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1 border ${
                      orderType === 'Pickup' ? 'bg-amber-600 text-white border-amber-600' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" /> Pickup
                  </button>
                  <button
                    type="button"
                    disabled={!isDeliveryAvailable}
                    onClick={() => isDeliveryAvailable && setOrderType('Delivery')}
                    className={`py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-1 border ${
                      !isDeliveryAvailable
                        ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
                        : orderType === 'Delivery'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" /> Delivery
                  </button>
                </div>
              </div>

              {orderType === 'Delivery' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Address</label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter detailed delivery location..."
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none h-16 text-sm"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 py-2 rounded-lg transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      {isLocating ? 'Getting your location...' : locationLink ? 'Location pinned ✓ (tap to redo)' : 'Pin My Exact Location'}
                    </button>
                    {locationError && <p className="text-xs text-red-500 mt-1">{locationError}</p>}
                    {locationLink && !locationError && (
                      <a href={locationLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                        Preview pinned location
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-lg font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReceipt}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-bold text-sm transition shadow-md"
              >
                Submit Order (${totalPrice.toLocaleString()} JMD)
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceiptModal && activeReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-xl space-y-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h3 className="text-xl font-extrabold text-gray-900">Order Placed!</h3>
            <p className="text-xs text-gray-500">Receipt #{activeReceipt.orderNum}</p>

            <div className="bg-gray-50 p-3 rounded-xl border text-left text-xs space-y-1.5">
              <p><strong>Name:</strong> {activeReceipt.customerName}</p>
              <p><strong>Phone:</strong> {activeReceipt.customerPhone}</p>
              <p><strong>Type:</strong> {activeReceipt.orderType}</p>
              {activeReceipt.locationLink && (
                <p>
                  <strong>Location:</strong>{' '}
                  <a href={activeReceipt.locationLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View pinned map
                  </a>
                </p>
              )}
              <p><strong>Total Amount:</strong> ${activeReceipt.total.toLocaleString()} JMD</p>
            </div>

            <p className="text-xs text-amber-700 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200">
              The cookshop has received your order. You'll receive a notification when it's ready!
            </p>

            <button
              onClick={() => setShowReceiptModal(false)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-bold text-sm transition"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
          }
