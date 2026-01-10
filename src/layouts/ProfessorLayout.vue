<template>
  <div class="professor-layout">
    <header class="header">
      <div class="logo">
        <h2>Sistema de Sílabos - Profesor</h2>
      </div>
      <nav class="nav">
        <router-link to="/professor/dashboard">Inicio</router-link>
        <router-link to="#">Sílabos</router-link>
        <router-link to="#">Perfil</router-link>
        <button @click="logout" class="logout-btn">Cerrar Sesión</button>
      </nav>
    </header>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
}
</script>

<style scoped>
.professor-layout {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h2 {
  margin: 0;
  font-size: 22px;
}

.nav {
  display: flex;
  gap: 30px;
  align-items: center;
}

.nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.nav a:hover {
  opacity: 0.8;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid white;
  color: white;
  padding: 8px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  padding: 30px;
}
</style>
