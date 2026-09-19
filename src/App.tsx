import React, { useState } from 'react';
import { ShopData, Order, Dish } from './types';
import { MASTER_PIN } from './initialData';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: Record<string, ShopData>;
  setShops: React.Dispatch<React.SetStateAction<Record<string, ShopData>>>;
  currentShopId: string;
  setCurrentShopId: (id: string) => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onEditDish: (dish: Dish) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  shops,
  setShops,
  currentShopId,
  setCurrentShopId,
  orders,
  setOrders,
  onEditDish
}) => {
  const [adminRole, setAdminRole] = useState<'master' | 'cousin' | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');

  if (!isOpen) return null;

  activeShop = shops[currentShopId] || shops['shop1'];
  const t = activeShop.theme;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (enteredPin === MASTER_PIN) {
      setAdminRole('master');
    } else if (enteredPin === activeShop.pin) {
      setAdminRole('cousin');
    } else {
      setAuthError('Incorrect PIN code.');
    }
  };

  const handleLogout = () => {
    setAdminRole(null);
    setEnteredPin('');
    onClose();
  };

  const shopOrders = orders.filter(o => o.shopId === currentShopId);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 my-auto">
        
        {!adminRole ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-white">Enter Admin or Master PIN</h3>
              <button type="button" onClick={onClose} className="text-slate-400 font-bold hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-400">
              Cousin PIN accesses active shop shift controls & menu. Master PIN (9999) accesses absolute developer controls.
            </p>
            <input 
              type="password" 
              maxLength={4}
              placeholder="Enter 4-digit PIN"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-center text-lg tracking-widest text-white focus:outline-none focus:border-amber-500"
              autoFocus
            />
            {authError && <p className="text-xs text-red-400 text-center font-bold">{authError}</p>}
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition">
              Unlock Dashboard
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-white">
                  {adminRole === 'master' ? '👑 Master Developer Dashboard' : `🔒 ${activeShop.name} Admin`}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {adminRole === 'master' ? 'Full access to Supabase & all shops' : 'Manage daily menu & incoming orders'}
                </p>
              </div>
              <button onClick={handleLogout} className="text-slate-400 font-bold text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition">
                Logout
              </button>
            </div>

            {/* MASTER DEVELOPER ONLY: SUPABASE & GLOBAL CONFIG */}
            {adminRole === 'master' && (
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-3 shadow-inner">
                <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wide">
                  Supabase Cloud Database Connection
                </h4>
                <p className="text-[10px] text-slate-400">
                  Connect your Supabase project so menu items, settings, and orders sync live in the cloud!
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">Select Shop to Manage</label>
                  <select 
                    value={currentShopId} 
                    onChange={(e) => setCurrentShopId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none">
                    <option value="shop1">Mama's Yard Cookshop</option>
                    <option value="shop2">Auntie's Ital Corner</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">SUPABASE PROJECT URL</label>
                  <input 
                    type="text" 
                    placeholder="https://xxxxxx.supabase.co"
                    value={activeShop.supabaseUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setShops({...shops, [currentShopId]: {...activeShop, supabaseUrl: val}});
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">SUPABASE ANON KEY</label>
                  <input 
                    type="password" 
                    placeholder="eyJhGciOi..."
                    value={activeShop.supabaseKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      setShops({...shops, [currentShopId]: {...activeShop, supabaseKey: val}});
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1 border-t border-slate-800 pt-2">
                  <label className="text-[11px] text-slate-300 font-medium">Shop WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={activeShop.whatsapp}
                    onChange={(e) => {
                      const val = e.target.value;
                      setShops({...shops, [currentShopId]: {...activeShop, whatsapp: val}});
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* INCOMING ORDERS QUEUE */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Incoming Orders Queue ({shopOrders.length})
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {shopOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4 bg-slate-950/40 rounded-lg border border-slate-800/50">
                    No active orders yet.
                  </p>
                ) : (
                  shopOrders.map(order => (
                    <div key={order.id} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-bold text-emerald-400">
                        <span>Order #{order.id} ({order.fulfillment})</span>
                        <span>${order.total}</span>
                      </div>
                      <p className="text-slate-300">{order.items.map(i => i.name).join(', ')}</p>
                      {order.deliveryAddress && <p className="text-[10px] text-slate-400">Address: {order.deliveryAddress}</p>}
                      <button 
                        onClick={() => setOrders(orders.filter(o => o.id !== order.id))}
                        className="text-[10px] bg-red-950/50 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-bold hover:bg-red-900/50 transition">
                        Clear / Complete Order
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SHIFT CONTROLS & DELIVERY TOGGLE */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Shift Controls</h4>
              
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-xs font-medium text-slate-300">Shop Open Status</span>
                <button 
                  onClick={() => setShops({...shops, [currentShopId]: {...activeShop, isOpen: !activeShop.isOpen}})}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeShop.isOpen ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                  {activeShop.isOpen ? 'OPEN' : 'CLOSED'}
                </button>
              </div>

              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-xs font-medium text-slate-300">Delivery Option (Enable/Disable)</span>
                <button 
                  onClick={() => setShops({...shops, [currentShopId]: {...activeShop, deliveryEnabled: !activeShop.deliveryEnabled}})}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeShop.deliveryEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {activeShop.deliveryEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-xs font-medium text-slate-300">Event Mode Banner</span>
                <button 
                  onClick={() => setShops({...shops, [currentShopId]: {...activeShop, eventMode: !activeShop.eventMode}})}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeShop.eventMode ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {activeShop.eventMode ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>

            {/* MENU MANAGEMENT & EDITING */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Menu Management & Editing</h4>
              
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {activeShop.menu.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs">
                    <span className="font-medium truncate max-w-[120px] text-slate-200">{item.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => onEditDish(item)}
                        className="px-2 py-1 rounded font-bold text-[10px] bg-slate-800 text-slate-200 hover:bg-slate-700 transition">
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          const updatedMenu = activeShop.menu.map(m => m.id === item.id ? {...m, soldOut: !m.soldOut} : m);
                          setShops({...shops, [currentShopId]: {...activeShop, menu: updatedMenu}});
                        }}
                        className={`px-2 py-1 rounded font-bold text-[10px] transition ${item.soldOut ? 'bg-red-950 text-red-400 border border-red-900' : 'bg-emerald-950 text-emerald-400 border border-emerald-900'}`}>
                        {item.soldOut ? 'Sold Out' : 'In Stock'}
                      </button>
                      <button 
                        onClick={() => {
                          const updatedMenu = activeShop.menu.filter(m => m.id !== item.id);
                          setShops({...shops, [currentShopId]: {...activeShop, menu: updatedMenu}});
                        }}
                        className="text-red-400 hover:text-red-300 font-bold px-1">✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300">Add New Menu Dish</span>
                <input 
                  type="text" 
                  placeholder="Dish Name..." 
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none" 
                />
                <input 
                  type="number" 
                  placeholder="Price ($)..." 
                  value={newDishPrice}
                  onChange={(e) => setNewDishPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none" 
                />
                <button 
                  onClick={() => {
                    if(!newDishName || !newDishPrice) return;
                    const newItem: Dish = { 
                      id: Date.now(), 
                      name: newDishName, 
                      price: Number(newDishPrice), 
                      category: "Mains", 
                      soldOut: false, 
                      desc: "Freshly prepared daily." 
                    };
                    setShops({...shops, [currentShopId]: {...activeShop, menu: [...activeShop.menu, newItem]}});
                    setNewDishName('');
                    setNewDishPrice('');
                  }}
                  className={`w-full ${t.accentBg} text-white font-bold py-1.5 rounded text-xs transition`}>
                  + Add Dish to Menu
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
