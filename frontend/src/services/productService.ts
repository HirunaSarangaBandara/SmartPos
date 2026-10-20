import { api } from './api';

export type Product = {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  priceMinor: number;
  stockQuantity: number;
  reorderLevel: number;
  active: boolean;
};

export type ProductInput = Omit<Product, 'id' | 'stockQuantity'>;

export const productService = {
  list: async (): Promise<Product[]> => (await api.get<Product[]>('/products')).data,
  create: async (data: ProductInput): Promise<Product> => (await api.post<Product>('/products', data)).data,
  update: async (id: string, data: ProductInput): Promise<Product> => (await api.put<Product>(`/products/${id}`, data)).data,
  setActive: async (id: string, active: boolean): Promise<void> => {
    await api.patch(`/products/${id}/status`, { active });
  },
};
