{
  "appVersion": "2.0.0",
  "masterPin": "9999",
  "shops": {
    "shop1": {
      "id": "shop1",
      "name": "Mama's Yard Cookshop",
      "tagline": "Authentic Jamaican Flame & Pot",
      "whatsapp": "8765550192",
      "address": "Main Street, Montego Bay",
      "pin": "1234",
      "crossPromoName": "Auntie's Ital Corner",
      "crossPromoId": "shop2",
      "isOpen": true,
      "autoCloseEnabled": true,
      "closeHour": 21,
      "deliveryEnabled": true,
      "eventMode": false,
      "eventTitle": "Weekend Fish Fry & Soup Special!",
      "eventBanner": "Live Red Peas Soup & Fried Snapper available today!",
      "deliveryFee": 300,
      "supabaseUrl": "",
      "supabaseKey": "",
      "theme": {
        "primaryBg": "bg-emerald-950",
        "primaryBorder": "border-emerald-800/60",
        "accentText": "text-emerald-400",
        "accentBg": "bg-emerald-600 hover:bg-emerald-500",
        "badgeBg": "bg-emerald-900/40 text-emerald-200 border-emerald-700/40"
      },
      "menu": [
        { "id": 1, "name": "Brown Stew Chicken", "price": 900, "category": "Mains", "soldOut": false, "desc": "Tender chicken simmered in rich gravy with carrots & butter beans." },
        { "id": 2, "name": "Curry Goat", "price": 1200, "category": "Mains", "soldOut": false, "desc": "Slow-cooked tender goat meat packed with authentic curry spices." },
        { "id": 3, "name": "Fried Dumpling & Ackee & Saltfish", "price": 1000, "category": "Breakfast / Staples", "soldOut": false, "desc": "National dish served with hot golden fried dumplings." },
        { "id": 4, "name": "Rice & Peas", "price": 350, "category": "Sides", "soldOut": false, "desc": "Gungo peas and coconut milk seasoned to perfection." },
        { "id": 5, "name": "Soup of the Day (Red Peas)", "price": 500, "category": "Soups", "soldOut": false, "desc": "Loaded with beef, spinners, yam, and red peas." },
        { "id": 6, "name": "Ice-Cold Carrot Juice", "price": 250, "category": "Drinks", "soldOut": false, "desc": "Blended fresh with condensed milk, spices, and vanilla." }
      ]
    },
    "shop2": {
      "id": "shop2",
      "name": "Auntie's Ital Corner",
      "tagline": "Pure Natural Livity & Plant-Based Meals",
      "whatsapp": "8765550999",
      "address": "Market Square, Montego Bay",
      "pin": "5678",
      "crossPromoName": "Mama's Yard Cookshop",
      "crossPromoId": "shop1",
      "isOpen": true,
      "autoCloseEnabled": true,
      "closeHour": 20,
      "deliveryEnabled": true,
      "eventMode": false,
      "eventTitle": "Ital Stew Special",
      "eventBanner": "Fresh coconut run-down with breadfruit and callaloo.",
      "deliveryFee": 250,
      "supabaseUrl": "",
      "supabaseKey": "",
      "theme": {
        "primaryBg": "bg-amber-950",
        "primaryBorder": "border-amber-800/60",
        "accentText": "text-amber-400",
        "accentBg": "bg-amber-600 hover:bg-amber-500",
        "badgeBg": "bg-amber-900/40 text-amber-200 border-amber-700/40"
      },
      "menu": [
        { "id": 201, "name": "Ital Coconut Stew", "price": 800, "category": "Mains", "soldOut": false, "desc": "Fresh vegetables simmered in pure coconut cream." },
        { "id": 202, "name": "Roasted Breadfruit & Callaloo", "price": 700, "category": "Mains", "soldOut": false, "desc": "Flame-roasted breadfruit loaded with steamed seasoned callaloo." },
        { "id": 203, "name": "Natural Soursop Juice", "price": 300, "category": "Drinks", "soldOut": false, "desc": "Freshly squeezed natural soursop with touch of cane and lime." }
      ]
    }
  },
  "initialSuggestions": [
    { "id": 1, "text": "Oxtail with Broad Beans", "votes": 14 },
    { "id": 2, "text": "Curry Mutton Weekend Special", "votes": 9 }
  ]
}
