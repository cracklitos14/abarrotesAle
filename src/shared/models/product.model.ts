export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  codigo_barras?: string | null;
  
}

