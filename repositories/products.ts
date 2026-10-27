import * as Crypto from 'expo-crypto';
import { eq, or, isNull, lt, desc } from 'drizzle-orm';
import { db } from '../db';
import { products, ProductSelect } from '../db/schema';
import { ProductFormData, RemoteProduct } from '../types';

export const productsRepository = {
  /**
   * Obtiene todos los productos de SQLite ordenados por fecha de actualización
   */
  async getAll(): Promise<ProductSelect[]> {
    return await db.select().from(products).orderBy(desc(products.updatedAt));
  },

  /**
   * Obtiene un producto por su ID local
   */
  async getById(id: number): Promise<ProductSelect | null> {
    const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return rows[0] || null;
  },

  /**
   * Obtiene un producto por su clientId UUID
   */
  async getByClientId(clientId: string): Promise<ProductSelect | null> {
    const rows = await db.select().from(products).where(eq(products.clientId, clientId)).limit(1);
    return rows[0] || null;
  },

  /**
   * Crea un producto en SQLite.
   * Genera UUID clientId, asigna updatedAt actual y deja syncedAt en null (pendiente).
   */
  async create(data: ProductFormData): Promise<ProductSelect> {
    const clientId = Crypto.randomUUID();
    const now = new Date();

    const result = await db
      .insert(products)
      .values({
        clientId,
        name: data.name.trim(),
        quantity: Math.max(0, Math.floor(data.quantity)),
        price: Math.max(0, Math.floor(data.price)),
        updatedAt: now,
        syncedAt: null,
      })
      .returning();

    return result[0];
  },

  /**
   * Actualiza un producto existente en SQLite.
   * Actualiza updatedAt con la fecha/hora actual y conserva syncedAt para que quede pendiente.
   */
  async update(id: number, data: ProductFormData): Promise<ProductSelect | null> {
    const now = new Date();

    const result = await db
      .update(products)
      .set({
        name: data.name.trim(),
        quantity: Math.max(0, Math.floor(data.quantity)),
        price: Math.max(0, Math.floor(data.price)),
        updatedAt: now,
      })
      .where(eq(products.id, id))
      .returning();

    return result[0] || null;
  },

  /**
   * Elimina un producto de SQLite
   */
  async delete(id: number): Promise<boolean> {
    await db.delete(products).where(eq(products.id, id));
    return true;
  },

  /**
   * Obtiene los productos pendientes de sincronización:
   * Aquellos con syncedAt nulo O syncedAt < updatedAt.
   */
  async getPending(): Promise<ProductSelect[]> {
    return await db
      .select()
      .from(products)
      .where(or(isNull(products.syncedAt), lt(products.syncedAt, products.updatedAt)));
  },

  /**
   * Marca un producto como sincronizado actualizando syncedAt con la fecha subida
   */
  async markAsSynced(clientId: string, syncedAt: Date): Promise<void> {
    await db
      .update(products)
      .set({
        syncedAt,
      })
      .where(eq(products.clientId, clientId));
  },

  /**
   * Inserta un producto descargado desde Supabase que no existe localmente.
   * Si ya existe, aplica regla opcional de conflicto "gana el último cambio" si no hay cambios locales pendientes.
   */
  async upsertFromRemote(remote: RemoteProduct): Promise<'inserted' | 'updated' | 'skipped'> {
    const existing = await this.getByClientId(remote.client_id);
    const remoteUpdatedAt = new Date(remote.updated_at);

    if (!existing) {
      await db.insert(products).values({
        clientId: remote.client_id,
        name: remote.name,
        quantity: remote.quantity,
        price: remote.price,
        updatedAt: remoteUpdatedAt,
        syncedAt: remoteUpdatedAt, // Se marca sincronizado
      });
      return 'inserted';
    }

    // Si ya existe localmente, verificar si el local tiene cambios pendientes
    const isLocalPending = !existing.syncedAt || existing.syncedAt < existing.updatedAt;
    if (isLocalPending) {
      // Regla de seguridad: preservar los cambios locales pendientes para no perder trabajo offline
      return 'skipped';
    }

    // Regla de conflicto "gana el último cambio": si el remoto es más reciente, actualizar
    if (remoteUpdatedAt.getTime() > existing.updatedAt.getTime()) {
      await db
        .update(products)
        .set({
          name: remote.name,
          quantity: remote.quantity,
          price: remote.price,
          updatedAt: remoteUpdatedAt,
          syncedAt: remoteUpdatedAt,
        })
        .where(eq(products.id, existing.id));
      return 'updated';
    }

    return 'skipped';
  },
};
