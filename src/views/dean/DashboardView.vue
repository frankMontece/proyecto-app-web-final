<template>
  <div class="dashboard">
    <h1>Panel del Decanato</h1>
    <div class="welcome">
      <p>Bienvenido/a, {{ authStore.user?.name }}</p>
      <p>Departamento: {{ authStore.user?.department }}</p>
    </div>

    <div class="quick-actions">
      <h2>Acciones Rápidas</h2>
      <div class="actions-grid">
        <router-link to="/dean/revisar-silabos" class="action-card">
          <h3>Revisar Sílabos</h3>
          <p>Ver sílabos pendientes de revisión</p>
        </router-link>
        <router-link to="/dean/aprobados" class="action-card">
          <h3>Sílabos Aprobados</h3>
          <p>Historial de sílabos aprobados</p>
        </router-link>
        <router-link to="/dean/observaciones" class="action-card">
          <h3>Enviar Observaciones</h3>
          <p>Realizar comentarios sobre sílabos</p>
        </router-link>
      </div>
    </div>

    <button @click="logout" class="logout-button">Cerrar Sesión</button>
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
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 40px;
}

.welcome p {
  margin: 10px 0;
  font-size: 18px;
}

.quick-actions {
  margin-bottom: 40px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.action-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 25px;
  text-decoration: none;
  color: #333;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.action-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.action-card p {
  color: #7f8c8d;
  font-size: 14px;
}

.logout-button {
  padding: 12px 30px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-button:hover {
  background: #c0392b;
}
</style>
