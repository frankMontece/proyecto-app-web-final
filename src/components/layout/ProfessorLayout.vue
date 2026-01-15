<template>
  <div class="professor-layout">
    <header class="layout-header">
      <div class="header-content">
        <div class="header-left">
          <h1>Sistema de Automatización de Sílabos</h1>
          <p class="header-subtitle">Panel del Profesor</p>
        </div>

        <nav class="nav-menu">
          <router-link to="/professor/dashboard" class="nav-link">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </router-link>

          <router-link to="/professor/mis-silabos" class="nav-link">
            <span class="nav-icon">📚</span>
            <span>Mis Sílabos</span>
            <span v-if="observacionesNoLeidas > 0" class="nav-badge">
              {{ observacionesNoLeidas }}
            </span>
          </router-link>

          <router-link to="/professor/crear-silabo" class="nav-link">
            <span class="nav-icon">➕</span>
            <span>Crear Sílabo</span>
          </router-link>

          <div class="notifications-container">
            <button @click="toggleNotifications" class="notifications-btn">
              <span class="notifications-icon">🔔</span>
              <span v-if="observacionesNoLeidas > 0" class="notifications-count">
                {{ observacionesNoLeidas }}
              </span>
            </button>
          </div>

          <button @click="logout" class="logout-btn">
            <span class="logout-icon">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- Dropdown de notificaciones -->
    <div v-if="showNotifications" class="notifications-dropdown-global">
      <div class="notifications-header">
        <h3>Notificaciones</h3>
        <button @click="toggleNotifications" class="close-btn">×</button>
      </div>
      <div class="notifications-list">
        <div v-if="observaciones.length === 0" class="no-notifications">
          No hay notificaciones nuevas
        </div>
        <div
          v-for="obs in observacionesRecientes"
          :key="obs.id"
          class="notification-item"
          :class="{ 'unread': !obs.leida && !obs.visto }"
          @click="verObservacion(obs)"
        >
          <div class="notification-icon">💬</div>
          <div class="notification-content">
            <p class="notification-title">Observación del Decanato</p>
            <p class="notification-text">{{ truncateText(obs.observacion, 60) }}</p>
            <span class="notification-time">{{ formatRelativeDate(obs.fecha) }}</span>
          </div>
        </div>
      </div>
    </div>

    <main class="layout-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import silaboStorage from '@/services/silaboStorage'

const router = useRouter()
const authStore = useAuthStore()

// Estado
const showNotifications = ref(false)
const observaciones = ref([])

// Computed
const observacionesNoLeidas = computed(() => {
  return observaciones.value.filter(obs => !obs.leida && !obs.visto).length
})

const observacionesRecientes = computed(() => {
  return [...observaciones.value]
    .sort((a, b) => new Date(b.fecha || b.fechaCreacion) - new Date(a.fecha || a.fechaCreacion))
    .slice(0, 5)
})

// Funciones
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatRelativeDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now - date) / 3600000)

    if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
    }
  } catch {
    return ''
  }
}

const verObservacion = (observacion) => {
  silaboStorage.marcarObservacionLeida(observacion.id)
  router.push({
    path: '/professor/mis-silabos',
    query: { verObservaciones: observacion.silaboId }
  })
  showNotifications.value = false
}

const cargarObservaciones = () => {
  const todasObservaciones = silaboStorage.obtenerTodasObservaciones()
  const silabosProfesor = silaboStorage.obtenerTodosSilabos().filter(s =>
    s.metadata?.creadoPor === authStore.user?.name
  )

  observaciones.value = todasObservaciones.filter(obs =>
    silabosProfesor.some(s => s.id === obs.silaboId)
  )
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

// Cargar datos al montar
onMounted(() => {
  cargarObservaciones()
})
</script>

<style scoped>
.professor-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.header-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-icon {
  font-size: 1.1rem;
}

.nav-badge {
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  font-weight: 600;
  position: absolute;
  top: -5px;
  right: -5px;
}

.notifications-container {
  position: relative;
}

.notifications-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
}

.notifications-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.notifications-icon {
  font-size: 1.2rem;
}

.notifications-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  font-weight: 600;
}

/* Dropdown global de notificaciones */
.notifications-dropdown-global {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.notifications-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.no-notifications {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background 0.3s;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.unread {
  background: #e7f1ff;
}

.notification-icon {
  font-size: 1.2rem;
  color: #007bff;
  margin-top: 0.25rem;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
}

.notification-text {
  color: #495057;
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  line-height: 1.4;
}

.notification-time {
  color: #6c757d;
  font-size: 0.8rem;
}

.logout-btn {
  background-color: rgba(220, 53, 69, 0.2);
  color: white;
  border: 1px solid rgba(220, 53, 69, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn:hover {
  background-color: rgba(220, 53, 69, 0.3);
}

.logout-icon {
  font-size: 1rem;
}

.layout-main {
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
}

/* Responsive */
@media (max-width: 768px) {
  .layout-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .header-left h1 {
    font-size: 1.2rem;
    text-align: center;
  }

  .nav-menu {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .nav-link span:not(.nav-icon):not(.nav-badge) {
    display: none;
  }

  .logout-btn span:not(.logout-icon) {
    display: none;
  }

  .notifications-dropdown-global {
    width: 300px;
    right: 10px;
  }
}
</style>
