import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { syncProducts } from '../services/sync';
import { ProductSelect } from '../db/schema';

export default function InventarioScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    products,
    totalUnits,
    totalValue,
    pendingCount,
    deleteProduct,
    refreshProducts,
  } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  // Formato en pesos colombianos sin decimales
  const formatCOP = (amount: number): string => {
    return '$ ' + Math.floor(amount).toLocaleString('es-CO');
  };

  // Manejar sincronización manual
  const handleSync = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await syncProducts(user?.id);
      await refreshProducts();
      setSyncFeedback({
        text: result.message,
        isError: !result.success,
      });
    } catch (err: any) {
      setSyncFeedback({
        text: 'Error inesperado durante la sincronización.',
        isError: true,
      });
    } finally {
      setSyncing(false);
    }
  };

  // Confirmar y eliminar producto localmente
  const handleDelete = (item: ProductSelect) => {
    Alert.alert(
      'Eliminar producto',
      `¿Deseas eliminar "${item.name}" de la tienda? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(item.id);
          },
        },
      ]
    );
  };

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Determinar estado de sincronización
  const isSynced = (item: ProductSelect): boolean => {
    if (!item.syncedAt) return false;
    return new Date(item.syncedAt).getTime() >= new Date(item.updatedAt).getTime();
  };

  return (
    <View style={styles.container}>
      {/* Header con título y botón de Cerrar sesión */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Mi Tienda</Text>
          <Text style={styles.appSubtitle}>Inventario Riohacha</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas salir?', [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Cerrar sesión',
                style: 'destructive',
                onPress: async () => {
                  await signOut();
                },
              },
            ]);
          }}
        >
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Tarjeta de métricas y totales */}
      <View style={styles.summaryCard}>
        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Total Unidades</Text>
            <Text style={styles.metricValue}>{totalUnits}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Valor Total</Text>
            <Text style={styles.metricValuePrimary}>{formatCOP(totalValue)}</Text>
          </View>
        </View>

        <View style={styles.pendingBadgeRow}>
          <Text style={styles.pendingText}>
            Estado:{' '}
            <Text
              style={{
                fontWeight: 'bold',
                color: pendingCount > 0 ? '#D97706' : '#059669',
              }}
            >
              {pendingCount > 0
                ? `${pendingCount} pendiente(s) de subir`
                : 'Todo sincronizado en la nube'}
            </Text>
          </Text>
        </View>
      </View>

      {/* Mensaje de retroalimentación de sincronización */}
      {syncFeedback && (
        <View
          style={[
            styles.feedbackContainer,
            syncFeedback.isError ? styles.feedbackError : styles.feedbackSuccess,
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              syncFeedback.isError ? styles.feedbackTextError : styles.feedbackTextSuccess,
            ]}
          >
            {syncFeedback.isError ? '⚠️ ' : '✅ '}
            {syncFeedback.text}
          </Text>
        </View>
      )}

      {/* Botones de acción principales: Agregar y Sincronizar */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/producto')}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>➕ Agregar Producto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.syncButton, syncing && styles.buttonDisabled]}
          onPress={handleSync}
          disabled={syncing}
          activeOpacity={0.8}
        >
          {syncing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.syncButtonText}>🔄 Sincronizar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda para productos (Punto Extra) */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar producto por nombre..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de productos de SQLite */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={syncing}
            onRefresh={async () => {
              await handleSync();
              await refreshProducts();
            }}
            colors={['#2563EB']}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No se encontraron resultados' : 'No hay productos registrados'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Intenta con otro término de búsqueda.'
                : 'Toca "Agregar Producto" para registrar el primero.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const synced = isSynced(item);
          return (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => router.push({ pathname: '/producto', params: { id: item.id.toString() } })}
              onLongPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <View style={styles.productMainInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.productMetaRow}>
                  <Text style={styles.productQuantity}>
                    Stock: <Text style={styles.boldText}>{item.quantity}</Text> u.
                  </Text>
                  <Text style={styles.productDot}>•</Text>
                  <Text style={styles.productPrice}>{formatCOP(item.price)}</Text>
                </View>
              </View>

              <View style={styles.productRightCol}>
                <View
                  style={[
                    styles.statusBadge,
                    synced ? styles.badgeSynced : styles.badgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      synced ? styles.badgeTextSynced : styles.badgeTextPending,
                    ]}
                  >
                    {synced ? '☁️ Sincronizado' : '⏳ Pendiente'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteIconButton}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deleteIconText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appSubtitle: {
    fontSize: 12,
    color: '#93C5FD',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  metricValuePrimary: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E5E7EB',
  },
  pendingBadgeRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 13,
    color: '#4B5563',
  },
  feedbackContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  feedbackSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  feedbackTextSuccess: {
    color: '#065F46',
  },
  feedbackTextError: {
    color: '#991B1B',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },
  addButton: {
    flex: 3,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  syncButton: {
    flex: 2,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
  },
  clearSearch: {
    position: 'absolute',
    right: 12,
    top: 10,
  },
  clearSearchText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  productMainInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  productMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productQuantity: {
    fontSize: 13,
    color: '#4B5563',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#111827',
  },
  productDot: {
    marginHorizontal: 8,
    color: '#9CA3AF',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  productRightCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSynced: {
    backgroundColor: '#DEF7EC',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextSynced: {
    color: '#03543F',
  },
  badgeTextPending: {
    color: '#92400E',
  },
  deleteIconButton: {
    padding: 4,
  },
  deleteIconText: {
    fontSize: 16,
  },
});
