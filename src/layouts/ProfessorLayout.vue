<template>
  <div class="professor-layout">
    <header class="header">
      <div class="logo">
        <h2>Sistema de Sílabos - Profesor</h2>
      </div>
      <nav class="nav">
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

        <div class="nav-notifications">
          <button @click="toggleNotifications" class="notifications-btn">
            <span class="notifications-icon">🔔</span>
            <span v-if="observacionesNoLeidas > 0" class="notifications-badge">
              {{ observacionesNoLeidas }}
            </span>
          </button>

          <div v-if="showNotifications" class="notifications-dropdown">
            <div class="notifications-header">
              <h4>Notificaciones</h4>
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
                  <p class="notification-title">Nueva observación</p>
                  <p class="notification-text">{{ truncateText(obs.observacion, 50) }}</p>
                  <span class="notification-time">{{ formatRelativeDate(obs.fecha) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button @click="logout" class="logout-btn">
          <span class="logout-icon">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </nav>
    </header>
    <main class="main-content">
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
const silabos = ref([])

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

    if (diffHours < 1) return 'Ahora mismo'
    if (diffHours < 24) return `Hace ${diffHours}h`

    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays}d`
  } catch {
    return ''
  }
}

const verObservacion = (observacion) => {
  // Marcar como leída
  silaboStorage.marcarObservacionLeida(observacion.id)

  // Navegar a mis sílabos para ver la observación
  router.push({
    path: '/professor/mis-silabos',
    query: { verObservaciones: observacion.silaboId }
  })

  showNotifications.value = false
}

const cargarDatos = () => {
  // Cargar sílabos del profesor
  const todosSilabos = silaboStorage.obtenerTodosSilabos()
  const profesorId = authStore.user?.id || 'profesor_actual'

  silabos.value = todosSilabos.filter(silabo =>
    silabo.metadata?.profesorId === profesorId || silabo.metadata?.creadoPor === authStore.user?.name
  )

  // Cargar observaciones
  const todasObservaciones = silaboStorage.obtenerTodasObservaciones()
  observaciones.value = todasObservaciones.filter(obs => {
    const silabo = silabos.value.find(s => s.id === obs.silaboId)
    return silabo !== undefined
  })
}

const logout = () => {
  authStore.logout()
}

// Cargar datos al montar
onMounted(() => {
  cargarDatos()
})
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.nav {
  display: flex;
  gap: 25px;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.nav-icon {
  font-size: 1.1rem;
}

.nav-badge {
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  position: absolute;
  top: -5px;
  right: -5px;
}

/* Notificaciones */
.nav-notifications {
  position: relative;
}

.notifications-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: background 0.3s;
}

.notifications-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.notifications-icon {
  font-size: 1.2rem;
}

.notifications-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin-top: 10px;
  z-index: 1000;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
}

.notifications-header h4 {
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
  padding: 30px;
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 15px;
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
  margin-top: 2px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 0.9rem;
}

.notification-text {
  color: #495057;
  margin: 0 0 5px 0;
  font-size: 0.85rem;
  line-height: 1.4;
}

.notification-time {
  color: #6c757d;
  font-size: 0.8rem;
}

/* Botón logout */
.logout-btn {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: white;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.logout-btn:hover {
  background: rgba(231, 76, 60, 0.3);
}

.logout-icon {
  font-size: 1rem;
}

.main-content {
  padding: 30px;
}

/* Responsive */
@media (max-width: 1024px) {
  .header {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }

  .nav {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .nav {
    gap: 15px;
  }

  .nav-link span:not(.nav-icon):not(.nav-badge) {
    display: none;
  }

  .notifications-dropdown {
    width: 300px;
    right: -50px;
  }

  .logout-btn span:not(.logout-icon) {
    display: none;
  }
}
</style>
