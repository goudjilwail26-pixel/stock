module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createOrder",
    ()=>createOrder,
    "createProduct",
    ()=>createProduct,
    "createWholesaler",
    ()=>createWholesaler,
    "deleteProduct",
    ()=>deleteProduct,
    "getOrders",
    ()=>getOrders,
    "getProducts",
    ()=>getProducts,
    "getUserOrders",
    ()=>getUserOrders,
    "getWholesalers",
    ()=>getWholesalers,
    "supabase",
    ()=>supabase,
    "updateOrderStatus",
    ()=>updateOrderStatus,
    "updateProduct",
    ()=>updateProduct
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;
const supabase = isSupabaseConfigured ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey) : null;
// Initial Mock Data
const initialWholesalers = [
    {
        id: 'w1',
        name: 'Alpha Apparel',
        phone_number: '+1 555-0199',
        provides_category: 'Clothing & Textiles'
    },
    {
        id: 'w2',
        name: 'TechFlow Logistics',
        phone_number: '+1 555-0245',
        provides_category: 'Electronics'
    },
    {
        id: 'w3',
        name: 'GreenGrocers Ltd',
        phone_number: '+1 555-0377',
        provides_category: 'Food & Produce'
    }
];
const initialProducts = [
    {
        id: 'p1',
        wholesaler_id: 'w1',
        name: 'Organic Cotton Tees (Bulk 50x)',
        wholesale_price: 249.99,
        stock_quantity: 45,
        in_stock: true
    },
    {
        id: 'p2',
        wholesaler_id: 'w1',
        name: 'Fleece Hoodies Pack (20x)',
        wholesale_price: 399.99,
        stock_quantity: 12,
        in_stock: true
    },
    {
        id: 'p3',
        wholesaler_id: 'w2',
        name: 'USB-C Charging Hubs (10x)',
        wholesale_price: 129.99,
        stock_quantity: 28,
        in_stock: true
    },
    {
        id: 'p4',
        wholesaler_id: 'w2',
        name: 'Bluetooth Earbuds Bulk (25x)',
        wholesale_price: 450.00,
        stock_quantity: 8,
        in_stock: true
    },
    {
        id: 'p5',
        wholesaler_id: 'w3',
        name: 'Hass Avocados Box (40 count)',
        wholesale_price: 59.99,
        stock_quantity: 75,
        in_stock: true
    },
    {
        id: 'p6',
        wholesaler_id: 'w3',
        name: 'Organic Fuji Apples Box',
        wholesale_price: 34.50,
        stock_quantity: 0,
        in_stock: false
    }
];
// Helper to access LocalStorage safely in NextJS SSR
const getStorageItem = (key, defaultValue)=>{
    if ("TURBOPACK compile-time truthy", 1) return defaultValue;
    //TURBOPACK unreachable
    ;
    const stored = undefined;
};
const setStorageItem = (key, value)=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
};
const getWholesalers = async ()=>{
    if (supabase) {
        const { data, error } = await supabase.from('wholesalers').select('*');
        if (error) throw error;
        return data || [];
    } else {
        return getStorageItem('stokiloo_wholesalers', initialWholesalers);
    }
};
const createWholesaler = async (wholesaler)=>{
    if (supabase) {
        const { data, error } = await supabase.from('wholesalers').insert(wholesaler).select().single();
        if (error) throw error;
        return data;
    } else {
        const wholesalers = await getWholesalers();
        const newWholesaler = {
            ...wholesaler,
            id: 'w_' + Math.random().toString(36).substr(2, 9)
        };
        wholesalers.push(newWholesaler);
        setStorageItem('stokiloo_wholesalers', wholesalers);
        return newWholesaler;
    }
};
const getProducts = async (searchQuery)=>{
    if (supabase) {
        let query = supabase.from('products').select(`
      *,
      wholesalers (name)
    `);
        if (searchQuery) {
            query = query.ilike('name', `%${searchQuery}%`);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((p)=>({
                ...p,
                wholesaler_name: p.wholesalers?.name || 'Unknown Wholesaler'
            }));
    } else {
        const products = getStorageItem('stokiloo_products', initialProducts);
        const wholesalers = await getWholesalers();
        const joined = products.map((p)=>({
                ...p,
                wholesaler_name: wholesalers.find((w)=>w.id === p.wholesaler_id)?.name || 'Unknown Wholesaler'
            }));
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            return joined.filter((p)=>p.name.toLowerCase().includes(lower));
        }
        return joined;
    }
};
const createProduct = async (product)=>{
    if (supabase) {
        const { data, error } = await supabase.from('products').insert(product).select().single();
        if (error) throw error;
        return data;
    } else {
        const products = getStorageItem('stokiloo_products', initialProducts);
        const newProduct = {
            ...product,
            id: 'p_' + Math.random().toString(36).substr(2, 9)
        };
        products.push(newProduct);
        setStorageItem('stokiloo_products', products);
        return newProduct;
    }
};
const updateProduct = async (id, updates)=>{
    if (supabase) {
        const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    } else {
        const products = getStorageItem('stokiloo_products', initialProducts);
        const index = products.findIndex((p)=>p.id === id);
        if (index === -1) throw new Error('Product not found');
        const updated = {
            ...products[index],
            ...updates
        };
        products[index] = updated;
        setStorageItem('stokiloo_products', products);
        return updated;
    }
};
const deleteProduct = async (id)=>{
    if (supabase) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        return true;
    } else {
        const products = getStorageItem('stokiloo_products', initialProducts);
        const filtered = products.filter((p)=>p.id !== id);
        setStorageItem('stokiloo_products', filtered);
        return true;
    }
};
const getOrders = async ()=>{
    if (supabase) {
        const { data, error } = await supabase.from('orders').select(`
      *,
      order_items (
        *,
        products (name, wholesale_price)
      )
    `).order('created_at', {
            ascending: false
        });
        if (error) throw error;
        return (data || []).map((o)=>({
                id: o.id,
                user_id: o.user_id,
                status: o.status,
                total_revenue: Number(o.total_revenue),
                created_at: o.created_at,
                items: o.order_items?.map((item)=>({
                        id: item.id,
                        order_id: item.order_id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        product_name: item.products?.name || 'Deleted Product',
                        wholesale_price: Number(item.products?.wholesale_price || 0)
                    })) || []
            }));
    } else {
        const orders = getStorageItem('stokiloo_orders', []);
        return orders.sort((a, b)=>new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
};
const getUserOrders = async (userId)=>{
    if (supabase) {
        const { data, error } = await supabase.from('orders').select(`
      *,
      order_items (
        *,
        products (name, wholesale_price)
      )
    `).eq('user_id', userId).order('created_at', {
            ascending: false
        });
        if (error) throw error;
        return (data || []).map((o)=>({
                id: o.id,
                user_id: o.user_id,
                status: o.status,
                total_revenue: Number(o.total_revenue),
                created_at: o.created_at,
                items: o.order_items?.map((item)=>({
                        id: item.id,
                        order_id: item.order_id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        product_name: item.products?.name || 'Deleted Product',
                        wholesale_price: Number(item.products?.wholesale_price || 0)
                    })) || []
            }));
    } else {
        const orders = await getOrders();
        return orders.filter((o)=>o.user_id === userId);
    }
};
const createOrder = async (userId, items)=>{
    if (supabase) {
        // 1. Get products to calculate prices
        const { data: productsData, error: prodErr } = await supabase.from('products').select('id, wholesale_price, stock_quantity');
        if (prodErr) throw prodErr;
        let totalRevenue = 0;
        const itemsWithPrices = items.map((item)=>{
            const prod = productsData.find((p)=>p.id === item.productId);
            const price = Number(prod?.wholesale_price || 0);
            totalRevenue += price * item.quantity;
            return {
                product_id: item.productId,
                quantity: item.quantity
            };
        });
        // 2. Insert order
        const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
            user_id: userId,
            status: 'pending',
            total_revenue: totalRevenue
        }).select().single();
        if (orderErr) throw orderErr;
        // 3. Insert order items
        const orderItemsToInsert = itemsWithPrices.map((item)=>({
                order_id: orderData.id,
                product_id: item.product_id,
                quantity: item.quantity
            }));
        const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsToInsert);
        if (itemsErr) throw itemsErr;
        // 4. Update stock quantities
        for (const item of items){
            const prod = productsData.find((p)=>p.id === item.productId);
            if (prod) {
                const newStock = Math.max(0, prod.stock_quantity - item.quantity);
                await supabase.from('products').update({
                    stock_quantity: newStock,
                    in_stock: newStock > 0
                }).eq('id', item.productId);
            }
        }
        return orderData;
    } else {
        const products = getStorageItem('stokiloo_products', initialProducts);
        const orders = getStorageItem('stokiloo_orders', []);
        let totalRevenue = 0;
        const orderItems = [];
        // Calculate total and decrement stock
        for (const item of items){
            const prodIndex = products.findIndex((p)=>p.id === item.productId);
            if (prodIndex !== -1) {
                const prod = products[prodIndex];
                totalRevenue += prod.wholesale_price * item.quantity;
                // Decrement stock
                const newStock = Math.max(0, prod.stock_quantity - item.quantity);
                products[prodIndex] = {
                    ...prod,
                    stock_quantity: newStock,
                    in_stock: newStock > 0
                };
                orderItems.push({
                    id: 'oi_' + Math.random().toString(36).substr(2, 9),
                    product_id: item.productId,
                    quantity: item.quantity,
                    product_name: prod.name,
                    wholesale_price: prod.wholesale_price
                });
            }
        }
        // Save updated products stock
        setStorageItem('stokiloo_products', products);
        const newOrder = {
            id: 'o_' + Math.random().toString(36).substr(2, 9),
            user_id: userId,
            status: 'pending',
            total_revenue: Number(totalRevenue.toFixed(2)),
            created_at: new Date().toISOString(),
            items: orderItems
        };
        orders.push(newOrder);
        setStorageItem('stokiloo_orders', orders);
        return newOrder;
    }
};
const updateOrderStatus = async (orderId, status)=>{
    if (supabase) {
        const { data, error } = await supabase.from('orders').update({
            status
        }).eq('id', orderId).select().single();
        if (error) throw error;
        return data;
    } else {
        const orders = getStorageItem('stokiloo_orders', []);
        const index = orders.findIndex((o)=>o.id === orderId);
        if (index === -1) throw new Error('Order not found');
        orders[index].status = status;
        setStorageItem('stokiloo_orders', orders);
        return orders[index];
    }
};
}),
"[project]/lib/auth.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const AuthProvider = ({ children })=>{
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // If Supabase is active, handle real auth state changes
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession().then(({ data: { session } })=>{
                if (session?.user) {
                    // In real Supabase, user roles could be stored in a profiles table or metadata.
                    // For simplicity in this blueprint, we default email ending with '@admin.com' or '@stokiloo-admin.com' to admin.
                    const email = session.user.email || '';
                    const role = email.includes('admin') ? 'admin' : 'buyer';
                    setUser({
                        id: session.user.id,
                        email,
                        role
                    });
                } else {
                    setUser(null);
                }
                setLoading(false);
            });
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange((_event, session)=>{
                if (session?.user) {
                    const email = session.user.email || '';
                    const role = email.includes('admin') ? 'admin' : 'buyer';
                    setUser({
                        id: session.user.id,
                        email,
                        role
                    });
                } else {
                    setUser(null);
                }
                setLoading(false);
            });
            return ()=>{
                subscription.unsubscribe();
            };
        } else {
            // Mock Authentication Flow using localStorage
            const cached = localStorage.getItem('stokiloo_session');
            if (cached) {
                try {
                    setUser(JSON.parse(cached));
                } catch  {
                    setUser(null);
                }
            }
            setLoading(false);
        }
    }, []);
    const login = async (email, role)=>{
        setLoading(true);
        try {
            if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
                // In real Supabase, this would trigger signInWithPassword.
                // We'll simulate a fast email-only sign in or sign up.
                // Since we're demonstrating code, we'll run standard signInWithOtp or password.
                // But for mock convenience, if we use mock emails, we can also fall back.
                const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithOtp({
                    email
                });
                if (error) throw error;
                alert(`Supabase magic link sent to ${email}!`);
            } else {
                const id = role === 'admin' ? 'u_admin_1' : 'u_buyer_' + Math.random().toString(36).substr(2, 9);
                const sessionUser = {
                    id,
                    email,
                    role
                };
                setUser(sessionUser);
                localStorage.setItem('stokiloo_session', JSON.stringify(sessionUser));
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'Login failed');
        } finally{
            setLoading(false);
        }
    };
    const logout = async ()=>{
        setLoading(true);
        try {
            if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
            } else {
                setUser(null);
                localStorage.removeItem('stokiloo_session');
            }
        } catch (err) {
            console.error(err);
        } finally{
            setLoading(false);
        }
    };
    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isAuthenticated,
            isAdmin,
            loading,
            login,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/auth.tsx",
        lineNumber: 124,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useAuth = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
}),
"[project]/lib/cart.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartProvider",
    ()=>CartProvider,
    "useCart",
    ()=>useCart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const CartContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const CartProvider = ({ children })=>{
    const [cart, setCart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isCartOpen, setIsCartOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const stored = localStorage.getItem('stokiloo_cart');
        if (stored) {
            try {
                setCart(JSON.parse(stored));
            } catch  {
                setCart([]);
            }
        }
    }, []);
    const saveCart = (newCart)=>{
        setCart(newCart);
        localStorage.setItem('stokiloo_cart', JSON.stringify(newCart));
    };
    const addToCart = (product, quantity = 1)=>{
        const existing = cart.find((item)=>item.productId === product.id);
        let newCart;
        if (existing) {
            const targetQty = existing.quantity + quantity;
            const finalQty = Math.min(targetQty, product.stock_quantity);
            newCart = cart.map((item)=>item.productId === product.id ? {
                    ...item,
                    quantity: finalQty
                } : item);
        } else {
            newCart = [
                ...cart,
                {
                    productId: product.id,
                    name: product.name,
                    price: product.wholesale_price,
                    quantity: Math.min(quantity, product.stock_quantity),
                    stock_quantity: product.stock_quantity,
                    wholesaler_name: product.wholesaler_name
                }
            ];
        }
        saveCart(newCart);
    };
    const removeFromCart = (productId)=>{
        const newCart = cart.filter((item)=>item.productId !== productId);
        saveCart(newCart);
    };
    const updateQuantity = (productId, quantity)=>{
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        const item = cart.find((i)=>i.productId === productId);
        if (!item) return;
        const finalQty = Math.min(quantity, item.stock_quantity);
        const newCart = cart.map((i)=>i.productId === productId ? {
                ...i,
                quantity: finalQty
            } : i);
        saveCart(newCart);
    };
    const clearCart = ()=>{
        saveCart([]);
    };
    const totalItems = cart.reduce((acc, item)=>acc + item.quantity, 0);
    const totalCost = Number(cart.reduce((acc, item)=>acc + item.price * item.quantity, 0).toFixed(2));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CartContext.Provider, {
        value: {
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            totalCost,
            isCartOpen,
            setIsCartOpen
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/cart.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useCart = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0arj_1o._.js.map