export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: 'hoodie' | 't-shirt';
  stock: number;
  created_at: any;
  updated_at: any;
}

export interface CartItem {
  productId: string;
  quantity: number;
  productName?: string;
  productCategory?: string;
}

export interface Order {
  id: string;
  user_id: string;
  email: string;
  items: CartItem[];
  total: number;
  address: string;
  apartment: string;
  phone: string;
  payment_method: 'cod';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface AppUser {
  uid: string;
  email: string | null;
  role: 'admin' | 'customer';
}
