<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {currentShopMenu.map(dish => (
    <div key={dish.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col justify-between transition-all hover:shadow-md">
      <div className="p-4 flex gap-4 items-start">
        {dish.image ? (
          <img 
            src={dish.image} 
            alt={dish.name} 
            className="w-24 h-24 object-cover rounded-lg border border-stone-100 bg-stone-100 shrink-0" 
          />
        ) : (
          <div className="w-24 h-24 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center text-2xl shrink-0">
            🍲
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-stone-900 text-base truncate">{dish.name}</h3>
            <span className="font-extrabold text-emerald-700 whitespace-nowrap text-sm">${dish.price} JMD</span>
          </div>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{dish.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
              {dish.category}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-stone-50 px-4 py-2.5 border-t border-stone-100 flex items-center justify-between">
        <span className={`text-xs font-bold ${dish.inStock ? "text-emerald-600" : "text-rose-600"}`}>
          {dish.inStock ? "🟢 In Stock" : "🔴 Sold Out"}
        </span>
        {activeShop.isOpen && dish.inStock && (
          <button
            onClick={() => setSelectedDish(dish)}
            className={`${activeTheme.bg} text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-sm`}
          >
            + Add to Plate
          </button>
        )}
      </div>
    </div>
  ))}
</div>
