export interface Product {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image: string | null;
  price: number | string;
  min_order_quantity?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Order {
  id: number;
  phone_number: string;
  items: CartItem[];
  total_price: number | string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  checkout_request_id: string | null;
  mpesa_receipt_number: string | null;
  customer_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  delivery_address: string | null;
  county: string | null;
  notes: string | null;
  created_at: Date;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  qty: number;
  minQty?: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  county: string | null;
  created_at: Date;
  order_count: number;
  total_spent: number | string;
  last_order_at: Date | null;
}
