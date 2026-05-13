import React, { useState, useEffect, FormEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Product } from './types';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';
import { cn, formatPrice } from './lib/utils';
import { ShoppingCart, LogOut, User as UserIcon, Plus, Edit2, Trash2, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';
import { useMotionValue, useTransform, useSpring, useScroll } from 'motion/react';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ProductDetail from './pages/ProductDetail';
import Surreal3D from './components/Surreal3D';
import Hero3D from './components/Hero3D';
import { ProtectedRoute } from './components/ProtectedRoute';

// --- Navbar ---
function Navbar({ 
  onCartOpen, 
  onAdminOpen, 
  activeCategory, 
  onCategoryChange,
  style
}: { 
  onCartOpen: () => void, 
  onAdminOpen: () => void, 
  activeCategory: string,
  onCategoryChange: (cat: string) => void,
  style?: any
}) {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <motion.nav 
      style={style}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <button 
            onClick={() => {
              onCategoryChange('all');
              navigate('/');
            }}
            className="text-xl font-bold tracking-tighter uppercase font-display hover:opacity-70 transition-opacity"
          >
            SLIXY
          </button>
          <div className="hidden md:flex items-center gap-8 text-[12px] font-medium uppercase tracking-wider opacity-60">
            <button 
              onClick={() => {
                onCategoryChange('t-shirt');
                navigate('/');
              }}
              className={cn("transition-colors", activeCategory === 't-shirt' ? "opacity-100 font-bold" : "hover:opacity-100")}
            >
              T-Shirts
            </button>
            <button 
              onClick={() => {
                onCategoryChange('hoodie');
                navigate('/');
              }}
              className={cn("transition-colors", activeCategory === 'hoodie' ? "opacity-100 font-bold" : "hover:opacity-100")}
            >
              Hoodies
            </button>
            <button 
              className="hover:opacity-100 transition-colors"
              onClick={() => toast('Collection coming soon')}
            >
              Collections
            </button>
            <button 
              className="hover:opacity-100 transition-colors"
              onClick={() => toast('Custom Lab is in development')}
            >
              Custom Lab
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[inherit]">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em]">
            {user ? (
              <>
                <span className="hidden sm:inline opacity-40">{user.email}</span>
                {user.role === 'admin' && (
                  <button 
                    onClick={onAdminOpen} 
                    className="flex items-center gap-2 hover:opacity-60 transition-opacity bg-current px-3 py-1 rounded-sm"
                  >
                    <Plus size={14} className="invert" />
                    <span className="invert">Admin</span>
                  </button>
                )}
                <span className="w-[1px] h-3 bg-current opacity-20" />
                <button onClick={logout} className="hover:opacity-60 transition-opacity">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="hover:opacity-60 transition-opacity">Login</Link>
                <span className="w-[1px] h-3 bg-current opacity-20" />
                <Link to="/signup" className="hover:opacity-60 transition-opacity">Sign Up</Link>
              </>
            )}
          </div>
          
          <button 
            onClick={onCartOpen}
            className="group relative p-1.5 transition-transform hover:scale-105"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-current text-background text-[8px] flex items-center justify-center rounded-full font-bold">
                <span className="invert">{totalItems}</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

// --- Product Card ---
function ProductCard({ 
  product, 
  onEdit
}: { 
  product: Product; 
  onEdit?: (p: Product) => void;
}) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), { stiffness: 150, damping: 20 });

  function handleMouseMove(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    x.set(mouseX - width / 2);
    y.set(mouseY - height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
    >
      <div className="relative aspect-[3/4] bg-current/5 rounded-sm overflow-hidden mb-6 flex items-center justify-center transform-gpu translate-z-10 bg-gradient-to-br from-white/10 to-transparent">
        <Link to={`/products/${product.id}`} className="w-full h-full flex items-center justify-center">
          <motion.img 
            src={product.images[0]} 
            alt={product.name}
            className="w-[85%] h-[85%] object-contain transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
            style={{ z: 50 }}
          />
        </Link>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 pointer-events-none transition-colors duration-300" />
        
        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
          <button 
            onClick={() => {
              addToCart(product.id);
              toast.success('Added to Bag');
            }}
            className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors shadow-xl"
          >
            Add to Shopping Bag
          </button>
        </div>
        
        {user?.role === 'admin' && onEdit && (
          <button 
            onClick={() => onEdit(product)}
            className="absolute top-4 right-4 p-2 bg-white text-black rounded-full shadow-sm hover:shadow-md transition-all scale-0 group-hover:scale-100 duration-300 z-20"
          >
            <Edit2 size={14} />
          </button>
        )}
      </div>
      <motion.div className="space-y-1" style={{ z: 30 }}>
        <div className="flex justify-between items-baseline">
          <h3 className="text-[13px] font-medium">{product.name}</h3>
          <p className="text-[13px] font-semibold">{formatPrice(product.price)}</p>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{product.category}</p>
      </motion.div>
    </motion.div>
  );
}

// --- Cart Panel ---
function CartPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, updateQuantity, removeFromCart, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [viewingOrders, setViewingOrders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  
  // Checkout fields
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsCheckingOut(false);
      setViewingOrders(false);
    }
  }, [isOpen]);

  // Fetch user's orders when viewing orders tab
  useEffect(() => {
    if (isOpen && viewingOrders && user) {
      const fetchMyOrders = async () => {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.uid)
          .order('created_at', { ascending: false });
        if (data) setMyOrders(data);
      };
      fetchMyOrders();
    }
  }, [isOpen, viewingOrders, user]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      if (data) {
        const pMap: Record<string, Product> = {};
        data.forEach(p => pMap[p.id] = p as Product);
        setProducts(pMap);
      }
    };
    fetchProducts();
  }, []);

  const subtotal = items.reduce((acc, item) => {
    const p = products[item.productId];
    return acc + (p ? p.price * item.quantity : 0);
  }, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to checkout');
      return;
    }
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      // Enrich items with product details for history
      const enrichedItems = items.map(item => ({
        ...item,
        productName: products[item.productId]?.name,
        productCategory: products[item.productId]?.category
      }));

      const orderData = {
        user_id: user.uid,
        email: user.email,
        items: enrichedItems,
        total: subtotal,
        address,
        apartment,
        phone,
        payment_method: 'cod',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;

      toast.success('Order placed successfully!');
      clearCart();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Checkout failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="px-10 h-20 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight uppercase font-display">
                {isCheckingOut ? 'Shipping Details' : viewingOrders ? 'Order History' : `Shopping Bag (${totalItems})`}
              </h2>
              <div className="flex items-center gap-4">
                {user && !isCheckingOut && (
                  <button 
                    onClick={() => setViewingOrders(!viewingOrders)}
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                  >
                    {viewingOrders ? 'Show Bag' : 'Order History'}
                  </button>
                )}
                {isCheckingOut && (
                  <button 
                    onClick={() => setIsCheckingOut(false)}
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                  >
                    Back
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-black">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 py-8">
              {viewingOrders ? (
                <div className="space-y-6">
                  {myOrders.length === 0 ? (
                    <p className="text-[10px] uppercase tracking-widest text-center text-gray-400 py-20 italic">No orders logged yet.</p>
                  ) : (
                    myOrders.map(order => (
                      <div key={order.id} className="p-4 border border-gray-100 rounded-sm space-y-4">
                        <div className="flex justify-end items-center">
                          <span className="text-[9px] px-2 py-0.5 bg-black text-white uppercase tracking-widest">{order.status}</span>
                        </div>
                        <p className="text-[9px] text-gray-400 font-mono italic">{new Date(order.created_at).toLocaleString()}</p>
                        <div className="space-y-1">
                          {order.items.map((item: any, idx: number) => {
                             const p = products[item.productId];
                             return (
                               <p key={idx} className="text-[10px] uppercase tracking-widest flex justify-between">
                                 <span className="flex items-center gap-2">
                                   <span className="text-black">{item.productName || p?.name || 'Unknown Item'}</span>
                                   <span className="text-[8px] text-gray-300 font-bold">[{item.productCategory || p?.category || '---'}]</span>
                                 </span>
                                 <span className="text-gray-400">x{item.quantity}</span>
                               </p>
                             );
                          })}
                        </div>
                        <p className="text-[11px] font-bold tracking-tight italic text-right border-t border-gray-50 pt-2">
                          Total: {formatPrice(order.total)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              ) : !isCheckingOut ? (
                <div className="space-y-8">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center pt-20">
                      <ShoppingBag size={48} strokeWidth={1} className="text-gray-100 mb-6" />
                      <p className="text-[12px] uppercase tracking-widest text-gray-400 font-medium">Your bag is empty</p>
                      <button onClick={onClose} className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] underline underline-offset-8 decoration-gray-200 hover:decoration-black transition-colors">Keep Shopping</button>
                    </div>
                  ) : (
                    items.map(item => {
                      const p = products[item.productId];
                      if (!p) return null;
                      return (
                        <div key={item.productId} className="flex gap-6">
                          <div className="w-24 h-32 bg-[#f3f3f3] flex-shrink-0 rounded-sm overflow-hidden p-2">
                            <img 
                              src={p.images[0]} 
                              alt={p.name} 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                              <div className="flex justify-between items-start gap-4">
                                <h3 className="text-[13px] font-medium leading-tight">{p.name}</h3>
                                <p className="text-[13px] font-semibold">{formatPrice(p.price * item.quantity)}</p>
                              </div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2">{p.category}</p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center border border-gray-100 rounded-sm overflow-hidden">
                                <button 
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  className="px-2.5 py-1 hover:bg-gray-50 text-gray-400 hover:text-black transition-colors"
                                >-</button>
                                <span className="px-3 text-[11px] font-mono font-medium">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="px-2.5 py-1 hover:bg-gray-50 text-gray-400 hover:text-black transition-colors"
                                >+</button>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.productId)}
                                className="text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-red-400 transition-colors"
                              >Remove</button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Street Address</label>
                      <input 
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-100 focus:border-black outline-none transition-all text-sm placeholder:text-gray-300"
                        placeholder="123 Minimalist St."
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Apartment, suite, etc. (optional)</label>
                      <input 
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-100 focus:border-black outline-none transition-all text-sm placeholder:text-gray-300"
                        placeholder="Apt 4B"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Phone Number</label>
                      <input 
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-100 focus:border-black outline-none transition-all text-sm placeholder:text-gray-300"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-sm space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Payment Method</p>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-black" />
                      <span className="text-[11px] uppercase tracking-widest font-medium">Cash on Delivery</span>
                    </div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">
                      Please have the exact amount ready upon delivery.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400">Total to Pay</span>
                      <span className="text-xl font-display font-light italic">{formatPrice(subtotal)}</span>
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing Order...' : 'Confirm Order'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {!isCheckingOut && !viewingOrders && items.length > 0 && (
              <div className="p-10 border-t border-gray-100 bg-[#fafafa]/50 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Subtotal</span>
                  <span className="text-2xl font-light tracking-tight italic font-display">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest text-center italic leading-relaxed">
                  Sustainability is at our core. Your order supports ethical sourcing.
                </p>
                <button 
                  onClick={() => {
                    if (!user) {
                      toast.error('Please login to checkout');
                      return;
                    }
                    setIsCheckingOut(true);
                  }}
                  className="w-full py-5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl active:scale-[0.98]"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- Admin Modal ---
function AdminModal({ 
  isOpen, 
  onClose, 
  editingProduct
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  editingProduct: Product | null;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<'hoodie' | 't-shirt'>('t-shirt');

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setDescription(editingProduct.description);
      setPrice(editingProduct.price.toString());
      setImageUrl(editingProduct.images[0]);
      setCategory(editingProduct.category);
    } else {
      setName('');
      setDescription('');
      setPrice('0');
      setImageUrl('');
      setCategory('t-shirt');
    }
  }, [editingProduct, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const productData = {
      name,
      description,
      price: parseFloat(price),
      images: [imageUrl],
      category,
      stock: 100,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast.success('Inventory updated');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...productData, created_at: new Date().toISOString() }]);
        
        if (error) throw error;
        toast.success('Collection entry created');
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error modifying collection');
    }
  };

  const handleDelete = async () => {
    if (!editingProduct) return;
    if (window.confirm('Remove this piece from the collection?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', editingProduct.id);
      
      if (error) {
        toast.error('Delete failed');
      } else {
        toast.success('Item removed');
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[80]">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative bg-black text-white w-full max-w-lg shadow-2xl overflow-hidden rounded-sm border border-white/10"
          >
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase">
                {editingProduct ? 'Curate Selection' : 'Archive Entry'}
              </h2>
              <button onClick={onClose} className="p-1 hover:opacity-60 transition-opacity">
                <X size={20} strokeWidth={1} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Item Name</label>
                  <input 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white outline-none transition-all text-sm placeholder:text-gray-600"
                    placeholder="Essential Heavyweight Hoodie"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Composition / Details</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white outline-none transition-all text-sm min-h-[100px] placeholder:text-gray-600"
                    placeholder="Describe the fabric and fit..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Price (USD)</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white outline-none transition-all text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-white outline-none transition-all text-sm text-white appearance-none"
                    >
                      <option value="t-shirt" className="bg-black">T-Shirt</option>
                      <option value="hoodie" className="bg-black">Hoodie</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Primary Asset (BMP/PNG/JPG)</label>
                  <div className="relative group/file">
                    <input 
                      type="file"
                      accept=".bmp,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImageUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full px-4 py-3 border border-white/10 group-hover/file:border-white transition-all text-[11px] uppercase tracking-widest text-white flex items-center justify-between">
                      <span className="truncate max-w-[200px]">
                        {imageUrl ? (imageUrl.startsWith('data:') ? 'Custom file selected' : imageUrl) : 'Select masterpiece file'}
                      </span>
                      <div className="flex items-center gap-3">
                        {imageUrl && (
                          <img src={imageUrl} alt="" className="w-6 h-6 object-cover rounded-sm border border-white/20" />
                        )}
                        <span className="px-2 py-1 bg-white text-[8px] font-bold text-black font-sans">Browse</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                {editingProduct && (
                  <button 
                    type="button"
                    onClick={handleDelete}
                    className="px-5 border border-red-900/50 text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={18} strokeWidth={1.5} />
                  </button>
                )}
                <button 
                  type="submit"
                  className="flex-1 py-5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-[0.98]"
                >
                  {editingProduct ? 'Update Selection' : 'Confirm Entry'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function HomePage({ 
  products, 
  activeCategory, 
  setActiveCategory, 
  handleEdit, 
  handleSeedData,
  onShopNow,
  heroColor
}: { 
  products: Product[], 
  activeCategory: string, 
  setActiveCategory: (cat: string) => void,
  handleEdit: (p: Product) => void,
  handleSeedData: () => void,
  onShopNow: () => void,
  heroColor?: any
}) {
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="pt-32 px-6 md:px-10 max-w-[1440px] mx-auto">
      {/* Hero Section */}
      <section className="mb-32 flex flex-col items-center text-center">
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 mb-6"
        >
          {activeCategory === 'all' ? 'Slixy / Collection' : `Slixy / ${activeCategory}s`}
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-8xl font-display font-light tracking-tight leading-[0.95] relative"
        >
          {activeCategory === 'all' ? 'Essential Objects.' : `${activeCategory}s.`} <br />
          <span className="opacity-20 italic">Minimum Design.</span>
          
          <motion.span 
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-12 -right-12 text-[10px] font-bold uppercase tracking-[0.5em] text-current hidden lg:block"
          >
            Digital Ether
          </motion.span>
        </motion.h1>
        
        <div className="flex flex-col items-center gap-6 mt-0">
          <Hero3D color={heroColor} />
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={scrollToCollection}
            className="group relative px-12 py-5 bg-current text-background text-[10px] font-bold uppercase tracking-[0.4em] overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 invert">Shop Now</span>
            <div className="absolute inset-0 bg-current opacity-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </motion.button>
          
          {useAuth().user?.role === 'admin' && products.length === 0 && (
            <button 
              onClick={handleSeedData}
              className="text-[9px] uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity underline underline-offset-[12px] decoration-current"
            >
              Populate initial collection
            </button>
          )}
        </div>
      </section>

      {/* Product Grid */}
      <div id="collection" className="scroll-mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
        {useAuth().user?.role === 'admin' && (
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => handleEdit(null as any)}
            className="group relative aspect-[3/4] border-2 border-dashed border-current/10 rounded-sm flex flex-col items-center justify-center gap-4 hover:border-current hover:bg-current/5 transition-all duration-500 mb-6"
          >
            <div className="w-12 h-12 rounded-full bg-current/5 flex items-center justify-center group-hover:bg-current group-hover:text-background transition-colors duration-500">
              <Plus size={24} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Add New Piece</p>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Curate your collection</p>
            </div>
          </motion.button>
        )}

        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onEdit={handleEdit} />
        ))}

        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="col-span-full py-40 border border-white/5 rounded-sm flex flex-col items-center justify-center text-center space-y-4">
             <ShoppingBag size={32} strokeWidth={1} className="text-white/10" />
             <div className="space-y-1">
               <p className="text-[12px] font-medium uppercase tracking-widest text-gray-500">No {activeCategory}s found in this selection</p>
               <button 
                onClick={() => setActiveCategory('all')}
                className="text-[10px] font-bold uppercase tracking-[0.2em] underline underline-offset-8 decoration-white/10 hover:decoration-white transition-colors"
               >Show All Selection</button>
             </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="col-span-full py-40 bg-[#f9f9f9] border border-gray-100 rounded-sm flex flex-col items-center justify-center text-center space-y-4">
             <ShoppingBag size={32} strokeWidth={1} className="text-gray-300" />
             <div className="space-y-1">
               <p className="text-[12px] font-medium uppercase tracking-widest">Entry collection pending</p>
               <p className="text-[10px] text-gray-400 uppercase tracking-widest italic">Curate your inventory to begin</p>
             </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { scrollYProgress } = useScroll();
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5],
    ["#ffffff", "#0d2b33"] // White to Deep Greenish Blue
  );
  const textColor = useTransform(
    scrollYProgress,
    [0, 0.4],
    ["#000000", "#e0f2f1"] // Black to Light Teal
  );
  const navBg = useTransform(
    scrollYProgress,
    [0, 0.1],
    ["rgba(255,255,255,0)", "rgba(13, 43, 51, 0.8)"] // Glass effect with greenish blue
  );
  const navBorder = useTransform(
    scrollYProgress,
    [0, 0.1],
    ["rgba(0,0,0,0)", "rgba(255,255,255,0.1)"]
  );

  const heroColor = useTransform(
    scrollYProgress,
    [0, 0.4],
    ["#000000", "#38bdf8"] // Black to sky blue (complementing)
  );

  const surrealColor = useTransform(
    scrollYProgress,
    [0, 0.5],
    ["#111111", "#5eead4"] // Dark to Teal 300
  );

  const surrealOffset = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 3] // Subtle horizontal drift
  );

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setProducts(data as Product[]);
      }
    };

    fetchProducts();

    // Direct subscription for real-time updates
    const subscription = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setIsAdminOpen(true);
  };

  const closeAdmin = () => {
    setIsAdminOpen(false);
    setEditingProduct(null);
  };

  const handleSeedData = async () => {
    const initialProducts = [
      {
        name: "Minimalist Black Hoodie",
        description: "Premium 400GSM heavy cotton fleece. Clean aesthetic with a structured fit.",
        price: 89.00,
        images: ["https://picsum.photos/seed/hoodie1/1200/1600"],
        category: "hoodie",
        stock: 100,
        created_at: new Date().toISOString()
      },
      {
        name: "Essential White Tee",
        description: "Standard fit t-shirt made from 100% organic cotton. Soft touch and breathable.",
        price: 35.00,
        images: ["https://picsum.photos/seed/tee1/1200/1600"],
        category: "t-shirt",
        stock: 200,
        created_at: new Date().toISOString()
      },
      {
        name: "Oversized Grey Hoodie",
        description: "Relaxed dropped shoulder fit. Perfect for layering and ultimate comfort.",
        price: 95.00,
        images: ["https://picsum.photos/seed/hoodie2/1200/1600"],
        category: "hoodie",
        stock: 50,
        created_at: new Date().toISOString()
      },
      {
        name: "Graphic Print Tee",
        description: "Limited edition graphic print inspired by modern ink art.",
        price: 42.00,
        images: ["https://picsum.photos/seed/tee2/1200/1600"],
        category: "t-shirt",
        stock: 150,
        created_at: new Date().toISOString()
      }
    ];

    try {
      const { error } = await supabase
        .from('products')
        .insert(initialProducts);
      
      if (error) throw error;
      toast.success('Collection initialized');
    } catch (err) {
      console.error(err);
      toast.error('Initialization error');
    }
  };

  return (
    <Router>
      <motion.div 
        style={{ backgroundColor, color: textColor }}
        className="min-h-screen selection:bg-black selection:text-white pb-20 relative overflow-hidden transition-colors duration-500"
      >
        <Surreal3D color={surrealColor} offset={surrealOffset} />
        <Toaster 
          toastOptions={{
            style: {
              borderRadius: '2px',
              background: '#fff',
              color: '#1a1a1a',
              fontSize: '12px',
              fontFamily: 'Inter',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              border: '1px solid #f3f3f3',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
          }} 
        />
        
        <Navbar 
          onCartOpen={() => setIsCartOpen(true)} 
          onAdminOpen={() => setIsAdminOpen(true)}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          style={{ backgroundColor: navBg, borderBottom: `1px solid`, borderBottomColor: navBorder, color: textColor }}
        />
        
        <Routes>
          <Route path="/" element={
            <HomePage 
              products={products}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              handleEdit={handleEdit}
              handleSeedData={handleSeedData}
              onShopNow={() => {}}
              heroColor={heroColor}
            />
          } />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>

        <footer className="mt-40 border-t border-current opacity-20 px-6 md:px-10 py-20">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start gap-16 md:items-center">
            <div className="space-y-6">
              <p className="text-xl font-bold tracking-tighter uppercase font-display">SLIXY</p>
              <p className="text-[11px] text-gray-400 leading-relaxed max-w-[280px] uppercase tracking-widest">
                High fidelity essentials. Crafted for those who value the space between details.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-20 gap-y-10">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">Explore</p>
                <ul className="space-y-2 text-[11px] font-medium uppercase tracking-widest">
                  <li><a href="#" className="hover:text-black">T-Shirts</a></li>
                  <li><a href="#" className="hover:text-black">Hoodies</a></li>
                  <li><a href="#" className="hover:text-black">Custom Lab</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">Support</p>
                <ul className="space-y-2 text-[11px] font-medium uppercase tracking-widest">
                  <li><a href="#" className="hover:text-black transition-colors">Shipping</a></li>
                  <li><a href="#" className="hover:text-black transition-colors">Returns</a></li>
                  <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-colors flex items-center gap-2">Contact Instagram</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">Legal</p>
                <ul className="space-y-2 text-[11px] font-medium uppercase tracking-widest">
                  <li><a href="#" className="hover:text-black">Privacy</a></li>
                  <li><a href="#" className="hover:text-black">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="max-w-[1440px] mx-auto mt-20 pt-10 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300">
              &copy; 2026 SLIXY. Crafted with precision.
            </p>
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              <a href="#" className="hover:text-black transition-colors">Instagram</a>
              <a href="#" className="hover:text-black transition-colors">Twitter</a>
            </div>
          </div>
        </footer>

        <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <AdminModal 
          isOpen={isAdminOpen} 
          onClose={closeAdmin} 
          editingProduct={editingProduct} 
        />
      </motion.div>
    </Router>
  );
}
