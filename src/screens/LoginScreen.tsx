import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Atenção', 'Preencha todos os campos!');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Erro no Login', error.message);
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert('Atenção', 'Preencha todos os campos!');
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Erro no Cadastro', error.message);
    else Alert.alert('Sucesso', 'Bem-vindo! Já pode entrar com sua nova conta.');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#00BFFF', '#1E90FF', '#00008B']} style={StyleSheet.absoluteFillObject} />
      
      {/* Ambient Bubbles */}
      <View style={[styles.bubble, { width: 50, height: 50, top: 100, left: 30 }]} />
      <View style={[styles.bubble, { width: 80, height: 80, top: 250, right: -20 }]} />
      <View style={[styles.bubble, { width: 30, height: 30, top: 400, left: 80 }]} />

      <View style={styles.glassCard}>
        <Text style={styles.title}>Segredos do Mar</Text>
        <Text style={styles.subtitle}>Mergulhe no seu paraíso aquático!</Text>
        
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#ddd"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#ddd"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={handleSignUp}>
              <Text style={styles.outlineButtonText}>Criar Conta</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bubble: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassCard: {
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: { color: '#e0e0e0', fontSize: 14, marginBottom: 30, textAlign: 'center' },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonContainer: { width: '100%', marginTop: 10 },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#32CD32',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#32CD32',
    marginTop: 10,
  },
  outlineButtonText: { color: '#32CD32', fontSize: 18, fontWeight: 'bold' },
});
