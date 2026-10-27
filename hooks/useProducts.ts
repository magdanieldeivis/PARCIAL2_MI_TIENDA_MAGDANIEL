import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { desc } from 'drizzle-orm';
import { db } from '../db';
import { products, ProductSelect } from '../db/schema';
import { productsRepository } from '../repositories/products';
import { ProductFormData } from '../types';

export function useProducts() {
  const { data: rawProducts, error } = useLiveQuery(
    db.select().from(products).orderBy(desc(products.updatedAt))
  );

  const productList: ProductSelect[] = rawProducts ?? [];

  // Total de unidades sumando quantity
  const totalUnits = productList.reduce((acc, p) => acc + (p.quantity || 0), 0);

  // Valor total del inventario: suma de quantity * price
  const totalValue = productList.reduce(
    (acc, p) => acc + (p.quantity || 0) * (p.price || 0),
    0
  );

  // Cantidad de productos pendientes de sincronización (syncedAt nulo o < updatedAt)
  const pendingCount = productList.filter(
    (p) => !p.syncedAt || new Date(p.syncedAt).getTime() < new Date(p.updatedAt).getTime()
  ).length;

  return {
    products: productList,
    totalUnits,
    totalValue,
    pendingCount,
    error,
    createProduct: (data: ProductFormData) => productsRepository.create(data),
    updateProduct: (id: number, data: ProductFormData) => productsRepository.update(id, data),
    deleteProduct: (id: number) => productsRepository.delete(id),
    getProductById: (id: number) => productsRepository.getById(id),
  };
}
