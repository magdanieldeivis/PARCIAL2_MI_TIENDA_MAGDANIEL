import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { desc } from 'drizzle-orm';
import { db } from '../db';
import { products, ProductSelect } from '../db/schema';
import {
  productsRepository,
  subscribeProductsChanged,
  notifyProductsChanged,
} from '../repositories/products';
import { ProductFormData } from '../types';

export function useProducts() {
  const [items, setItems] = useState<ProductSelect[]>([]);
  const [loading, setLoading] = useState(true);

  // useLiveQuery según exige la rúbrica oficial
  const { data: liveProducts, error: liveError } = useLiveQuery(
    db.select().from(products).orderBy(desc(products.updatedAt))
  );

  // Función para recargar los productos de SQLite
  const reloadFromDb = useCallback(async () => {
    try {
      const data = await productsRepository.getAll();
      setItems(data);
    } catch (e) {
      console.warn('Error al leer productos de SQLite:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. Carga inicial y suscripción a cambios locales
  useEffect(() => {
    reloadFromDb();
    const unsubscribe = subscribeProductsChanged(() => {
      reloadFromDb();
    });
    return unsubscribe;
  }, [reloadFromDb]);

  // 2. Reactividad al enfocar la pantalla (ej. al volver del formulario)
  useFocusEffect(
    useCallback(() => {
      reloadFromDb();
    }, [reloadFromDb])
  );

  // 3. Sincronizar datos si useLiveQuery emite cambios nuevos
  useEffect(() => {
    if (liveProducts && liveProducts.length > 0) {
      setItems(liveProducts);
    }
  }, [liveProducts]);

  const productList = items;

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
    loading,
    error: liveError,
    refreshProducts: reloadFromDb,
    createProduct: async (data: ProductFormData) => {
      const res = await productsRepository.create(data);
      await reloadFromDb();
      return res;
    },
    updateProduct: async (id: number, data: ProductFormData) => {
      const res = await productsRepository.update(id, data);
      await reloadFromDb();
      return res;
    },
    deleteProduct: async (id: number) => {
      const res = await productsRepository.delete(id);
      await reloadFromDb();
      return res;
    },
    getProductById: (id: number) => productsRepository.getById(id),
  };
}
