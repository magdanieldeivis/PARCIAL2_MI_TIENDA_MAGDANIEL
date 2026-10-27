import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { db } from '../db';
import migrations from '../drizzle/migrations';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

function RootLayoutNav() {
  const { session, loading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Ejecuta y verifica las migraciones de Drizzle sobre SQLite
  const { success: migrationsSuccess, error: migrationsError } = useMigrations(db, migrations);

  useEffect(() => {
    if (authLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'registro';

    if (!session && !inAuthGroup) {
      // Si no hay sesión y no está en login/registro, redirigir a login
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // Si hay sesión y está en login/registro, redirigir al inventario principal
      router.replace('/');
    }
  }, [session, authLoading, segments]);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Iniciando Mi Tienda...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F3F4F6' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Inventario' }} />
        <Stack.Screen name="producto" options={{ title: 'Producto' }} />
        <Stack.Screen name="login" options={{ title: 'Iniciar Sesión' }} />
        <Stack.Screen name="registro" options={{ title: 'Registrarse' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});
