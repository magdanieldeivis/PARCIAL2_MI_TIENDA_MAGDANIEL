import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProducts } from '../hooks/useProducts';

export default function ProductoFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { createProduct, updateProduct, getProductById } = useProducts();

  const isEditing = Boolean(id);
  const numericId = id ? parseInt(id, 10) : null;

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Errores de validación
  const [nameError, setNameError] = useState<string | null>(null);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Cargar producto existente si se está editando
  useEffect(() => {
    if (numericId) {
      getProductById(numericId).then((prod) => {
        if (prod) {
          setName(prod.name);
          setQuantity(prod.quantity.toString());
          setPrice(prod.price.toString());
        } else {
          Alert.alert('Error', 'No se encontró el producto a editar.', [
            { text: 'Volver', onPress: () => router.back() },
          ]);
        }
        setLoadingInitial(false);
      });
    }
  }, [numericId]);

  const validate = (): boolean => {
    let isValid = true;
    setNameError(null);
    setQuantityError(null);
    setPriceError(null);

    // 1. Validar nombre obligatorio
    if (!name.trim()) {
      setNameError('El nombre del producto es obligatorio.');
      isValid = false;
    }

    // 2. Validar cantidad entero >= 0
    const parsedQty = parseInt(quantity, 10);
    if (quantity.trim() === '' || isNaN(parsedQty) || parsedQty < 0) {
      setQuantityError('La cantidad debe ser un número entero mayor o igual a 0.');
      isValid = false;
    }

    // 3. Validar precio entero >= 0
    const parsedPrice = parseInt(price, 10);
    if (price.trim() === '' || isNaN(parsedPrice) || parsedPrice < 0) {
      setPriceError('El precio debe ser un número entero mayor o igual a 0 en pesos.');
      isValid = false;
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    const parsedQty = Math.floor(parseInt(quantity, 10));
    const parsedPrice = Math.floor(parseInt(price, 10));

    try {
      if (isEditing && numericId) {
        await updateProduct(numericId, {
          name: name.trim(),
          quantity: parsedQty,
          price: parsedPrice,
        });
      } else {
        await createProduct({
          name: name.trim(),
          quantity: parsedQty,
          price: parsedPrice,
        });
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo guardar el producto en la base de datos local.');
      console.warn('Error al guardar en SQLite:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando datos del producto...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.formTitle}>
            {isEditing ? '✏️ Editar Producto' : '✨ Nuevo Producto'}
          </Text>
          <Text style={styles.formSubtitle}>
            {isEditing
              ? 'Modifica los datos del producto existente'
              : 'Registra un nuevo producto en el inventario local'}
          </Text>

          {/* Campo Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nombre del Producto <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, nameError && styles.inputError]}
              placeholder="Ej: Harina PAN 1kg, Arroz Diana..."
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameError(null);
              }}
              editable={!saving}
            />
            {nameError && <Text style={styles.fieldErrorText}>{nameError}</Text>}
          </View>

          {/* Campo Cantidad */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Cantidad en Existencia (Unidades) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, quantityError && styles.inputError]}
              placeholder="Ej: 24"
              placeholderTextColor="#9CA3AF"
              value={quantity}
              onChangeText={(text) => {
                setQuantity(text);
                setQuantityError(null);
              }}
              keyboardType="number-pad"
              editable={!saving}
            />
            {quantityError && <Text style={styles.fieldErrorText}>{quantityError}</Text>}
          </View>

          {/* Campo Precio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Precio Unitario (COP sin decimales) <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, priceError && styles.inputError]}
              placeholder="Ej: 4500"
              placeholderTextColor="#9CA3AF"
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                setPriceError(null);
              }}
              keyboardType="number-pad"
              editable={!saving}
            />
            {priceError && <Text style={styles.fieldErrorText}>{priceError}</Text>}
          </View>

          {/* Botones Guardar y Cancelar */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>💾 Guardar en SQLite</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 10,
    color: '#4B5563',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  formSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#DC2626',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  fieldErrorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
  },
  buttonGroup: {
    marginTop: 16,
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
