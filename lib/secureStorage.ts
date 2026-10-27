import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1800;
const CHUNK_PREFIX = '__chunked__:';

export const LargeSecureStore = {
  async getItem(key: string): Promise<string | null> {
    try {
      const marker = await SecureStore.getItemAsync(key);
      if (!marker) {
        return null;
      }

      if (marker.startsWith(CHUNK_PREFIX)) {
        const count = parseInt(marker.slice(CHUNK_PREFIX.length), 10);
        const chunks: string[] = [];
        for (let i = 0; i < count; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}.${i}`);
          if (chunk !== null) {
            chunks.push(chunk);
          }
        }
        return chunks.join('');
      }

      return marker;
    } catch (error) {
      console.warn(`[SecureStore] Error leyendo llave "${key}":`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      // Si el valor cabe en una sola entrada
      if (value.length <= CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value);
        // Limpiar fragmento 0 por si antes era fragmentado
        await SecureStore.deleteItemAsync(`${key}.0`).catch(() => {});
        return;
      }

      // Dividir en fragmentos para no exceder los 2048 bytes en Android
      const count = Math.ceil(value.length / CHUNK_SIZE);
      for (let i = 0; i < count; i++) {
        const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await SecureStore.setItemAsync(`${key}.${i}`, chunk);
      }
      await SecureStore.setItemAsync(key, `${CHUNK_PREFIX}${count}`);
    } catch (error) {
      console.warn(`[SecureStore] Error guardando llave "${key}":`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const marker = await SecureStore.getItemAsync(key);
      if (marker && marker.startsWith(CHUNK_PREFIX)) {
        const count = parseInt(marker.slice(CHUNK_PREFIX.length), 10);
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${key}.${i}`).catch(() => {});
        }
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn(`[SecureStore] Error eliminando llave "${key}":`, error);
    }
  },
};
