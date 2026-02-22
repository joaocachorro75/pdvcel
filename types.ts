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
  shopName: string;
  shopLogo: string;
  adminPassword: string;
  pixKey: string;
}

export interface DashboardStats {
  totalSales: number;
  totalAmount: number;
  todaySales: number;
  todayAmount: number;
}
