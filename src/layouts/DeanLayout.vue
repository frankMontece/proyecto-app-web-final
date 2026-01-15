<template>
  <div class="dean-layout">
    <!-- Sidebar de navegación -->
    <aside class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo-section">
          <div class="logo-icon">🏛️</div>
          <div class="logo-text" v-if="!sidebarCollapsed">
            <h3>Sistema Sílabos</h3>
            <p class="logo-subtitle">Decanato</p>
          </div>
          <button @click="toggleSidebar" class="sidebar-toggle-btn">
            {{ sidebarCollapsed ? '→' : '←' }}
          </button>
        </div>

        <div class="user-profile" v-if="!sidebarCollapsed">
          <div class="user-avatar">👨‍🎓</div>
          <div class="user-info">
            <p class="user-name">{{ userName }}</p>
            <p class="user-role">Decanato</p>
          </div>
        </div>
      </div>

      <!-- Menú de navegación -->
      <nav class="sidebar-menu">
        <router-link
          to="/dean/dashboard"
          class="menu-item"
          :class="{ active: $route.name === 'dean-dashboard' }"
        >
          <span class="menu-icon">📊</span>
          <span class="menu-text" v-if="!sidebarCollapsed">Dashboard</span>
          <span v-if="!sidebarCollapsed && estadisticas.pendientes > 0" class="menu-badge">
            {{ estadisticas.pendientes }}
          </span>
        </router-link>

        <router-link
          to="/dean/revisar-silabos"
          class="menu-item"
          :class="{ active: $route.name === 'revisar-silabos' }"
        >
          <span class="menu-icon">📝</span>
          <span class="menu-text" v-if="!sidebarCollapsed">Revisar Sílabos</span>
          <span v-if="!sidebarCollapsed && estadisticas.pendientes > 0" class="menu-badge warning">
            {{ estadisticas.pendientes }}
          </span>
        </router-link>

        <router-link
          to="/dean/aprobados"
          class="menu-item"
          :class="{ active: $route.name === 'silabos-aprobados' }"
        >
          <span class="menu-icon">✅</span>
          <span class="menu-text" v-if="!sidebarCollapsed">Sílabos Aprobados</span>
          <span v-if="!sidebarCollapsed && estadisticas.aprobados > 0" class="menu-badge success">
            {{ estadisticas.aprobados }}
          </span>
        </router-link>

        <router-link
          to="/dean/observaciones"
          class="menu-item"
          :class="{ active: $route.name === 'observaciones-decanato' }"
        >
          <span class="menu-icon">💬</span>
          <span class="menu-text" v-if="!sidebarCollapsed">Observaciones</span>
          <span v-if="!sidebarCollapsed && estadisticas.observacionesNoLeidas > 0" class="menu-badge danger">
            {{ estadisticas.observacionesNoLeidas }}
          </span>
        </router-link>

        <div class="menu-divider" v-if="!sidebarCollapsed"></div>

        <!-- Enlaces adicionales -->
        <div class="menu-section" v-if="!sidebarCollapsed">
          <p class="section-title">Herramientas</p>
          <button @click="exportarReporteCompleto" class="menu-item menu-btn">
            <span class="menu-icon">📥</span>
            <span class="menu-text">Exportar Reporte</span>
          </button>

          <button @click="actualizarEstadisticas" class="menu-item menu-btn">
            <span class="menu-icon">🔄</span>
            <span class="menu-text">Actualizar Datos</span>
          </button>
        </div>

        <!-- Vista rápida de estadísticas -->
        <div class="stats-preview" v-if="!sidebarCollapsed">
          <div class="stat-item">
            <span class="stat-value">{{ estadisticas.total }}</span>
            <span class="stat-label">Total Sílabos</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ estadisticas.aprobados }}</span>
            <span class="stat-label">Aprobados</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ estadisticas.pendientes }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>
      </nav>

      <!-- Pie del sidebar -->
      <div class="sidebar-footer" v-if="!sidebarCollapsed">
        <button @click="logout" class="logout-btn">
          <span class="logout-icon">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
        <div class="system-info">
          <span class="version">v1.0</span>
          <span class="status">● En línea</span>
        </div>
      </div>
    </aside>

    <!-- Contenido principal -->
    <main class="main-content" :class="{ 'expanded': sidebarCollapsed }">
      <!-- Header superior -->
      <header class="top-header">
        <div class="breadcrumb">
          <span class="breadcrumb-item">Decanato</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item current">{{ getCurrentPageTitle() }}</span>
        </div>

        <div class="header-actions">
          <!-- Notificaciones -->
          <div class="notifications-container">
            <button @click="toggleNotifications" class="notifications-btn">
              <span class="notifications-icon">🔔</span>
              <span v-if="notificacionesPendientes > 0" class="notifications-count">
                {{ notificacionesPendientes }}
              </span>
            </button>

            <div v-if="showNotifications" class="notifications-dropdown">
              <div class="notifications-header">
                <h4>Notificaciones</h4>
                <button @click="toggleNotifications" class="close-btn">×</button>
              </div>
              <div class="notifications-list">
                <div v-if="notificaciones.length === 0" class="no-notifications">
                  No hay notificaciones nuevas
                </div>
                <div
                  v-for="notif in notificaciones"
                  :key="notif.id"
                  class="notification-item"
                  :class="{ 'unread': !notif.leida }"
                  @click="handleNotificationClick(notif)"
                >
                  <div class="notification-icon">{{ notif.icon }}</div>
                  <div class="notification-content">
                    <p class="notification-title">{{ notif.title }}</p>
                    <p class="notification-message">{{ notif.message }}</p>
                    <span class="notification-time">{{ notif.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Perfil de usuario -->
          <div class="user-profile-dropdown">
            <button @click="toggleUserMenu" class="user-profile-btn">
              <div class="user-avatar-small">👨‍🎓</div>
              <span class="user-name-small">{{ userName }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>

            <div v-if="showUserMenu" class="user-menu-dropdown">
              <div class="user-info-card">
                <div class="user-avatar-menu">👨‍🎓</div>
                <div class="user-details-menu">
                  <p class="user-name-menu">{{ userName }}</p>
                  <p class="user-role-menu">Decanato</p>
                </div>
              </div>
              <div class="user-menu-options">
                <button @click="verPerfil" class="user-menu-option">
                  <span class="option-icon">👤</span>
                  Mi Perfil
                </button>
                <button @click="verConfiguracion" class="user-menu-option">
                  <span class="option-icon">⚙️</span>
                  Configuración
                </button>
                <div class="menu-divider"></div>
                <button @click="logout" class="user-menu-option logout-option">
                  <span class="option-icon">🚪</span>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenido de la página -->
      <div class="page-content">
        <router-view />
      </div>

      <!-- Footer -->
      <footer class="page-footer">
        <p>Sistema de Gestión de Sílabos - Decanato © {{ currentYear }}</p>
        <p class="footer-links">
          <a href="#">Términos de uso</a> •
          <a href="#">Política de privacidad</a> •
          <a href="#">Soporte técnico</a>
        </p>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import silaboStorage from '@/services/silaboStorage'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Estado
const sidebarCollapsed = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)
const userName = ref('Decano')
const estadisticas = ref({
  total: 0,
  pendientes: 0,
  aprobados: 0,
  observacionesNoLeidas: 0
})
const notificaciones = ref([])

// Computed
const currentYear = computed(() => new Date().getFullYear())
const notificacionesPendientes = computed(() => {
  return notificaciones.value.filter(n => !n.leida).length
})

// Funciones
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    showUserMenu.value = false
    // Marcar como leídas al abrir
    notificaciones.value = notificaciones.value.map(n => ({ ...n, leida: true }))
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) {
    showNotifications.value = false
  }
}

const getCurrentPageTitle = () => {
  const routeNames = {
    'dean-dashboard': 'Dashboard',
    'revisar-silabos': 'Revisar Sílabos',
    'detalle-silabo': 'Detalle del Sílabo',
    'observaciones-decanato': 'Observaciones',
    'silabos-aprobados': 'Sílabos Aprobados'
  }
  return routeNames[route.name] || 'Dashboard'
}

const cargarEstadisticas = () => {
  try {
    const stats = silaboStorage.obtenerEstadisticasDecanato()
    estadisticas.value = {
      total: stats.total || 0,
      pendientes: stats.pendientes || 0,
      aprobados: stats.aprobados || 0,
      observacionesNoLeidas: stats.observacionesNoLeidas || 0
    }

    // Actualizar notificaciones basadas en estadísticas
    actualizarNotificaciones()
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  }
}

const actualizarEstadisticas = () => {
  cargarEstadisticas()
  // Mostrar mensaje de confirmación
  alert('✅ Estadísticas actualizadas correctamente')
}

const actualizarNotificaciones = () => {
  const nuevasNotificaciones = []

  // Notificaciones basadas en estadísticas
  if (estadisticas.value.pendientes > 0) {
    nuevasNotificaciones.push({
      id: 1,
      icon: '📝',
      title: 'Sílabos pendientes',
      message: `Tienes ${estadisticas.value.pendientes} sílabos pendientes de revisión`,
      time: 'Reciente',
      leida: false,
      action: () => router.push('/dean/revisar-silabos')
    })
  }

  if (estadisticas.value.observacionesNoLeidas > 0) {
    nuevasNotificaciones.push({
      id: 2,
      icon: '💬',
      title: 'Observaciones sin leer',
      message: `Hay ${estadisticas.value.observacionesNoLeidas} observaciones sin leer`,
      time: 'Reciente',
      leida: false,
      action: () => router.push('/dean/observaciones')
    })
  }

  // Mantener notificaciones existentes si las hay
  notificaciones.value = [...nuevasNotificaciones, ...notificaciones.value.slice(0, 5)]
}

const handleNotificationClick = (notification) => {
  if (notification.action) {
    notification.action()
  }
  showNotifications.value = false
}

const exportarReporteCompleto = () => {
  try {
    // Crear reporte básico
    const reporte = {
      fechaGeneracion: new Date().toISOString(),
      usuario: userName.value,
      rol: 'Decanato',
      estadisticas: estadisticas.value,
      timestamp: Date.now()
    }

    const jsonData = JSON.stringify(reporte, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_decanato_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    alert('📥 Reporte exportado exitosamente')
  } catch (error) {
    console.error('Error al exportar reporte:', error)
    alert('Error al exportar el reporte')
  }
}

const verPerfil = () => {
  alert('Función de perfil en desarrollo')
  showUserMenu.value = false
}

const verConfiguracion = () => {
  alert('Función de configuración en desarrollo')
  showUserMenu.value = false
}

const logout = () => {
  if (confirm('¿Está seguro de cerrar sesión?')) {
    authStore.logout()
    router.push('/login')
  }
}

// Cargar datos al montar
onMounted(() => {
  cargarEstadisticas()

  // Obtener nombre de usuario
  const userData = localStorage.getItem('current_user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      userName.value = user.nombre || user.username || 'Decano'
    } catch (error) {
      console.error('Error al cargar usuario:', error)
    }
  }
})

// Actualizar estadísticas cuando cambia la ruta
watch(() => route.path, () => {
  cargarEstadisticas()
})

// Cerrar menús al hacer clic fuera
const handleClickOutside = (event) => {
  const notificationsEl = event.target.closest('.notifications-container')
  const userMenuEl = event.target.closest('.user-profile-dropdown')

  if (!notificationsEl) {
    showNotifications.value = false
  }
  if (!userMenuEl) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dean-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.logo-icon {
  font-size: 2rem;
}

.logo-text h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.logo-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  opacity: 0.8;
}

.sidebar-toggle-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.sidebar-toggle-btn:hover {
  background: rgba(255,255,255,0.2);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  margin: 0;
  font-size: 0.95rem;
}

.user-role {
  font-size: 0.8rem;
  opacity: 0.7;
  margin: 0;
}

/* Menú */
.sidebar-menu {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.menu-item:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.menu-item.active {
  background: rgba(52, 152, 219, 0.2);
  color: white;
  border-left: 3px solid #3498db;
}

.menu-icon {
  font-size: 1.1rem;
  min-width: 20px;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
}

.menu-badge {
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  font-weight: 600;
}

.menu-badge.warning {
  background: #f39c12;
}

.menu-badge.success {
  background: #2ecc71;
}

.menu-badge.danger {
  background: #e74c3c;
}

.menu-divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 1rem 1.5rem;
}

.menu-section {
  padding: 0 1.5rem;
  margin: 1rem 0;
}

.section-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-bottom: 0.75rem;
  letter-spacing: 1px;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

/* Estadísticas preview */
.stats-preview {
  margin: 1rem;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-value {
  font-weight: 600;
  font-size: 1.1rem;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.7;
}

/* Sidebar footer */
.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background: rgba(231, 76, 60, 0.3);
}

.logout-icon {
  font-size: 1rem;
}

.system-info {
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  opacity: 0.5;
}

/* Main content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left 0.3s ease;
}

.main-content.expanded {
  margin-left: -190px;
}

/* Top header */
.top-header {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 10;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
}

.breadcrumb-item {
  font-size: 0.9rem;
}

.breadcrumb-separator {
  opacity: 0.5;
}

.breadcrumb-item.current {
  color: #2c3e50;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Notificaciones */
.notifications-container {
  position: relative;
}

.notifications-btn {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.3s;
}

.notifications-btn:hover {
  background: #e9ecef;
}

.notifications-icon {
  font-size: 1.25rem;
  color: #495057;
}

.notifications-count {
  position: absolute;
  top: 0;
  right: 0;
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  font-weight: 600;
}

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-top: 0.5rem;
  z-index: 1000;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
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
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
  line-height: 1;
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
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
  font-size: 1.25rem;
  color: #007bff;
  margin-top: 0.25rem;
}

.notification-content {
  flex: 1;
}

.notification-title {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
}

.notification-message {
  margin: 0 0 0.25rem 0;
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
}

.notification-time {
  color: #adb5bd;
  font-size: 0.75rem;
}

.no-notifications {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
}

/* User profile dropdown */
.user-profile-dropdown {
  position: relative;
}

.user-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: 1px solid #e9ecef;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.user-profile-btn:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  background: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.user-name-small {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.dropdown-arrow {
  color: #6c757d;
  font-size: 0.8rem;
}

.user-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-top: 0.5rem;
  z-index: 1000;
}

.user-info-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.user-avatar-menu {
  width: 48px;
  height: 48px;
  background: #e7f1ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.user-details-menu {
  flex: 1;
}

.user-name-menu {
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.user-role-menu {
  color: #6c757d;
  font-size: 0.85rem;
  margin: 0;
}

.user-menu-options {
  padding: 0.5rem 0;
}

.user-menu-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  color: #495057;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 0.9rem;
}

.user-menu-option:hover {
  background: #f8f9fa;
}

.option-icon {
  font-size: 1rem;
  color: #6c757d;
  width: 20px;
}

.logout-option {
  color: #e74c3c;
}

.logout-option:hover {
  background: rgba(231, 76, 60, 0.1);
}

/* Page content */
.page-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Footer */
.page-footer {
  padding: 1.5rem 2rem;
  background: white;
  border-top: 1px solid #e9ecef;
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
}

.page-footer p {
  margin: 0.25rem 0;
}

.footer-links {
  margin-top: 0.5rem;
}

.footer-links a {
  color: #6c757d;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #007bff;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 70px;
  }

  .sidebar:not(.collapsed) {
    width: 260px;
    position: fixed;
    height: 100vh;
    z-index: 1001;
  }

  .main-content {
    margin-left: 70px;
  }

  .main-content.expanded {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .dean-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: static;
  }

  .sidebar.collapsed .sidebar-header,
  .sidebar.collapsed .sidebar-menu .menu-text,
  .sidebar.collapsed .sidebar-footer,
  .sidebar.collapsed .stats-preview,
  .sidebar.collapsed .menu-section {
    display: none;
  }

  .main-content {
    margin-left: 0;
  }

  .top-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .page-content {
    padding: 1rem;
  }

  .notifications-dropdown {
    right: -100px;
    width: 280px;
  }

  .user-menu-dropdown {
    right: -100px;
    width: 250px;
  }
}

@media (max-width: 480px) {
  .notifications-dropdown {
    right: -140px;
    width: 280px;
  }

  .user-menu-dropdown {
    right: -120px;
    width: 250px;
  }

  .user-name-small {
    display: none;
  }

  .user-profile-btn {
    padding: 0.5rem;
  }
}
</style>
