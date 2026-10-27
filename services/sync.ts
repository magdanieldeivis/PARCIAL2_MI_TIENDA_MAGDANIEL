import { supabase } from '../lib/supabase';
import { productsRepository } from '../repositories/products';
import { RemoteProduct, SyncResult } from '../types';

/**
 * Servicio de sincronización manual bidireccional entre SQLite local y Supabase.
 * Orden de ejecución:
 * 1. Bajar: Descarga los productos remotos del usuario y los inserta en SQLite si no existen.
 * 2. Subir: Envía a Supabase los productos pendientes mediante upsert y los marca como sincronizados.
 */
export async function syncProducts(userId?: string): Promise<SyncResult> {
  let downloadedCount = 0;
  let uploadedCount = 0;

  try {
    // -------------------------------------------------------------
    // PASO 1: BAJAR (Descargar de Supabase)
    // -------------------------------------------------------------
    const { data: remoteProducts, error: fetchError } = await supabase
      .from('products')
      .select('*');

    if (fetchError) {
      throw new Error(fetchError.message || 'Error al conectar con Supabase');
    }

    if (remoteProducts && remoteProducts.length > 0) {
      for (const item of remoteProducts as RemoteProduct[]) {
        const action = await productsRepository.upsertFromRemote(item);
        if (action === 'inserted') {
          downloadedCount++;
        }
      }
    }

    // -------------------------------------------------------------
    // PASO 2: SUBIR (Enviar pendientes locales a Supabase)
    // -------------------------------------------------------------
    const pendingProducts = await productsRepository.getPending();

    for (const p of pendingProducts) {
      const updatedAtDate = new Date(p.updatedAt);

      const { error: upsertError } = await supabase.from('products').upsert(
        {
          client_id: p.clientId,
          name: p.name,
          quantity: p.quantity,
          price: p.price,
          updated_at: updatedAtDate.toISOString(),
        },
        { onConflict: 'client_id' }
      );

      if (upsertError) {
        console.warn(`Error al subir producto ${p.name}:`, upsertError.message);
        throw new Error(upsertError.message);
      }

      // Solo si el upsert fue exitoso, se marca en SQLite como sincronizado
      await productsRepository.markAsSynced(p.clientId, updatedAtDate);
      uploadedCount++;
    }

    // Mensaje de resultado
    let message = 'Todo está sincronizado.';
    if (uploadedCount > 0 || downloadedCount > 0) {
      message = `Sincronización completada: ${uploadedCount} subido(s) y ${downloadedCount} bajado(s).`;
    }

    return {
      success: true,
      uploaded: uploadedCount,
      downloaded: downloadedCount,
      message,
    };
  } catch (error: any) {
    console.warn('[Sync Error]:', error?.message || error);
    return {
      success: false,
      uploaded: uploadedCount,
      downloaded: downloadedCount,
      message: 'No se pudo sincronizar. Tus datos siguen guardados en este dispositivo.',
    };
  }
}
