import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { formatPrice, cn } from '../lib/utils';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ShoppingBag, ArrowRight } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const zoomX = useMotionValue(0);
  const zoomY = useMotionValue(0);
  const isHovered = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-200, 200], [5, -5]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-200, 200], [-5, 10]), { stiffness: 100, damping: 30 });
  const scale = useSpring(useTransform(isHovered, [0, 1], [1, 1.2]), { stiffness: 100, damping: 30 });
  const translateX = useSpring(useTransform(zoomX, [-200, 200], [20, -20]), { stiffness: 100, damping: 30 });
  const translateY = useSpring(useTransform(zoomY, [-200, 200], [20, -20]), { stiffness: 100, damping: 30 });

  function handleMouseMove(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    x.set(mouseX - width / 2);
    y.set(mouseY - height / 2);
    zoomX.set(mouseX - width / 2);
    zoomY.set(mouseY - height / 2);
    isHovered.set(1);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    zoomX.set(0);
    zoomY.set(0);
    isHovered.set(0);
  }

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast.error('Product not found');
        navigate('/');
        return;
      }

      setProduct(data as Product);
      setLoading(false);
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin opacity-20" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <main id="product-detail-page" className="pt-32 px-6 md:px-10 max-w-[1440px] mx-auto mb-40">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-black transition-colors mb-12 group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Return to Collection
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
        {/* Image Section */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="aspect-[3/4] bg-current/5 rounded-sm overflow-hidden flex items-center justify-center p-12 relative group perspective-1000 transform-gpu"
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                src={product.images[activeImage]} 
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-2xl"
                referrerPolicy="no-referrer"
                style={{ z: 100, scale, x: translateX, y: translateY }}
              />
            </AnimatePresence>
            
            {product.images.length > 1 && (
              <div className="absolute inset-x-0 bottom-8 flex justify-center gap-2">
                {product.images.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "w-12 h-[2px] transition-all duration-500",
                      activeImage === idx ? "bg-black" : "bg-black/10"
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "aspect-[3/4] bg-current/5 rounded-sm overflow-hidden p-3 border transition-all duration-300",
                  activeImage === idx ? "border-current" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">
                Slixy / {product.category}
              </p>
              <h1 className="text-4xl md:text-6xl font-display font-light tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl font-light italic font-display mt-4">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Details</span>
                <div className="h-[1px] flex-1 bg-current opacity-10" />
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed uppercase tracking-widest max-w-md">
                {product.description || "No description available for this curated piece."}
              </p>
              <ul className="space-y-3 text-[11px] font-medium uppercase tracking-widest text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />
                  Ethically crafted in Italy
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />
                  Premium heavyweight cotton
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />
                  Relaxed, structured fit
                </li>
              </ul>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    addToCart(product.id);
                    toast.success('Added to Shopping Bag');
                  }}
                  id="add-to-cart-detail"
                  className="flex-1 py-6 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-4 group overflow-hidden relative shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <span className="relative z-10">Add to Bag</span>
                  <ShoppingBag size={16} strokeWidth={1.5} className="relative z-10" />
                  <div className="absolute inset-0 bg-gray-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>

              <div className="pt-12 border-t border-current opacity-10 grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Shipping</p>
                  <p className="text-[10px] uppercase tracking-widest leading-relaxed">Global express delivery in 2-4 business days.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Inventory</p>
                  <p className="text-[10px] uppercase tracking-widest leading-relaxed">
                    {product.stock > 0 ? `Limited supply available (${product.stock} pieces)` : 'Waitlist only'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
