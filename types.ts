export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'money' | 'pix' | 'card';
  timestamp: number;
  buyerName?: string;
  buyerPhone?: string;
}

export interface Settings {
  shop_name: string;
  shop_logo: string;
  pix_key?: string;
  adminPassword?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalAmount: number;
  todaySales: number;
  todayAmount: number;
}
