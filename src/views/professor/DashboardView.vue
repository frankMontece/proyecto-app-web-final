<template>
  <div class="dashboard">
    <h1>Panel del Profesor</h1>
    <div class="welcome">
      <p>Bienvenido, {{ authStore.user?.name }}</p>
      <p>Departamento: {{ authStore.user?.department }}</p>
      <div v-if="estadisticas.totalObservacionesNoLeidas > 0" class="alert-observaciones">
        <span class="alert-icon">💬</span>
        <span>Tienes {{ estadisticas.totalObservacionesNoLeidas }} observación(es) nueva(s) del decanato</span>
        <button @click="irAObservaciones" class="btn-ver-observaciones">
          Ver observaciones
        </button>
      </div>
    </div>


    <div class="quick-actions">
      <h2>Acciones Rápidas</h2>
      <div class="actions-grid">
        <router-link to="/professor/crear-silabo" class="action-card">
          <span class="action-icon">➕</span>
          <h3>Crear Nuevo Sílabo</h3>
          <p>Desarrollar un nuevo sílabo desde cero</p>
        </router-link>

        <router-link to="/professor/mis-silabos" class="action-card">
          <span class="action-icon">📚</span>
          <h3>Mis Sílabos</h3>
          <p>Ver y editar sílabos existentes</p>
          <span v-if="estadisticas.totalObservacionesNoLeidas > 0" class="card-badge">
            {{ estadisticas.totalObservacionesNoLeidas }}
          </span>
        </router-link>

        <div @click="irAObservaciones" class="action-card observaciones-card">
          <span class="action-icon">💬</span>
          <h3>Observaciones</h3>
          <p>Revisar comentarios del decanato</p>
          <span v-if="estadisticas.totalObservacionesNoLeidas > 0" class="card-badge alert">
            {{ estadisticas.totalObservacionesNoLeidas }} nuevas
          </span>
        </div>
      </div>
    </div>

    <!-- Observaciones recientes (si hay) -->
    <div v-if="observacionesRecientes.length > 0" class="recent-observations">
      <div class="section-header">
        <h2>Observaciones Recientes</h2>
        <button @click="irAObservaciones" class="btn-ver-todas">
          Ver todas →
        </button>
      </div>

      <div class="observations-list">
        <div
          v-for="obs in observacionesRecientes"
          :key="obs.id"
          class="observation-card"
          :class="{ 'unread': !obs.leida && !obs.visto }"
          @click="verSilaboObservaciones(obs.silaboId)"
        >
          <div class="obs-header">
            <span class="obs-subject">
              {{ obtenerNombreAsignatura(obs.silaboId) }}
            </span>
            <span class="obs-date">{{ formatRelativeDate(obs.fecha) }}</span>
          </div>
          <div class="obs-preview">
            <p>{{ truncateText(obs.observacion, 120) }}</p>
          </div>
          <div class="obs-footer">
            <span class="obs-status" v-if="!obs.leida && !obs.visto">
              🔴 No leída
            </span>
            <span class="obs-status" v-else>
              ✅ Leída
            </span>
            <button
              @click.stop="marcarComoLeida(obs.id)"
              class="btn-marcar-leida"
              v-if="!obs.leida && !obs.visto"
            >
              Marcar como leída
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sílabos recientes -->
    <div class="recent-syllabi" v-if="silabosRecientes.length > 0">
      <div class="section-header">
        <h2>Sílabos Recientes</h2>
        <router-link to="/professor/mis-silabos" class="btn-ver-todas">
          Ver todos →
        </router-link>
      </div>

      <div class="syllabi-list">
        <div
          v-for="silabo in silabosRecientes"
          :key="silabo.id"
          class="syllabus-card"
          @click="verSilabo(silabo.id)"
        >
          <div class="syllabus-header">
            <h4>{{ silabo.datosGenerales?.nombreAsignatura || 'Sílabo sin nombre' }}</h4>
            <span class="syllabus-status" :class="getStatusClass(silabo)">
              {{ getStatusText(silabo) }}
            </span>
          </div>
          <div class="syllabus-details">
            <span class="detail-item">
              📝 {{ silabo.datosGenerales?.codigoAsignatura || 'Sin código' }}
            </span>
            <span class="detail-item">
              📅 {{ formatDate(silabo.metadata?.fechaCreacion) }}
            </span>
            <span v-if="tieneObservaciones(silabo.id)" class="detail-item obs-indicator">
              💬 {{ contarObservaciones(silabo.id) }} obs.
            </span>
          </div>
        </div>
      </div>
    </div>

    <button @click="logout" class="logout-button">Cerrar Sesión</button>
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
const observaciones = ref([])
const silabos = ref([])

// Computed
const estadisticas = computed(() => {
  const totalSilabos = silabos.value.length
  const silabosAprobados = silabos.value.filter(s => s.metadata?.estado === 'aprobado').length
  const silabosObservados = silabos.value.filter(s => s.metadata?.estado === 'observado').length
  const silabosPendientes = silabos.value.filter(s => s.metadata?.estado === 'pendiente').length

  const totalObservaciones = observaciones.value.length
  const totalObservacionesNoLeidas = observaciones.value.filter(obs => !obs.leida && !obs.visto).length

  return {
    totalSilabos,
    silabosAprobados,
    silabosObservados,
    silabosPendientes,
    totalObservaciones,
    totalObservacionesNoLeidas
  }
})

const observacionesRecientes = computed(() => {
  return [...observaciones.value]
    .sort((a, b) => new Date(b.fecha || b.fechaCreacion) - new Date(a.fecha || a.fechaCreacion))
    .slice(0, 3) // Solo las 3 más recientes
})

const silabosRecientes = computed(() => {
  return [...silabos.value]
    .sort((a, b) => new Date(b.metadata?.fechaCreacion) - new Date(a.metadata?.fechaCreacion))
    .slice(0, 4) // Solo los 4 más recientes
})

// Funciones
const cargarDatos = () => {
  // Cargar sílabos del profesor actual
  const todosSilabos = silaboStorage.obtenerTodosSilabos()
  const profesorId = authStore.user?.id || 'profesor_actual'

  // Filtrar sílabos del profesor actual
  silabos.value = todosSilabos.filter(silabo =>
    silabo.metadata?.profesorId === profesorId || silabo.metadata?.creadoPor === authStore.user?.name
  )

  // Cargar observaciones para los sílabos del profesor
  const todasObservaciones = silaboStorage.obtenerTodasObservaciones()
  observaciones.value = todasObservaciones.filter(obs => {
    const silabo = silabos.value.find(s => s.id === obs.silaboId)
    return silabo !== undefined
  })
}

const obtenerNombreAsignatura = (silaboId) => {
  const silabo = silabos.value.find(s => s.id === silaboId)
  return silabo?.datosGenerales?.nombreAsignatura || 'Asignatura desconocida'
}

const formatRelativeDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    } else if (diffDays < 7) {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    }
  } catch {
    return 'Fecha inválida'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return 'Fecha inválida'
  }
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const tieneObservaciones = (silaboId) => {
  return observaciones.value.some(obs => obs.silaboId === silaboId)
}

const contarObservaciones = (silaboId) => {
  return observaciones.value.filter(obs => obs.silaboId === silaboId).length
}

const getStatusClass = (silabo) => {
  const estado = silabo.metadata?.estado || 'pendiente'
  return {
    'pendiente': 'status-pending',
    'aprobado': 'status-approved',
    'observado': 'status-observed'
  }[estado] || 'status-pending'
}

const getStatusText = (silabo) => {
  const estado = silabo.metadata?.estado || 'pendiente'
  const textos = {
    'pendiente': 'En revisión',
    'aprobado': 'Aprobado',
    'observado': 'Observado'
  }
  return textos[estado] || 'Pendiente'
}

const verSilaboObservaciones = (silaboId) => {
  router.push({
    path: '/professor/mis-silabos',
    query: { verObservaciones: silaboId }
  })
}

const marcarComoLeida = (observacionId) => {
  const resultado = silaboStorage.marcarObservacionLeida(observacionId)
  if (resultado.success) {
    // Actualizar estado local
    const index = observaciones.value.findIndex(obs => obs.id === observacionId)
    if (index !== -1) {
      observaciones.value[index].leida = true
      observaciones.value[index].visto = true
    }
  }
}

const verSilabo = (silaboId) => {
  // Navegar a mis sílabos con el sílabo seleccionado
  router.push({
    path: '/professor/mis-silabos',
    query: { silaboId: silaboId }
  })
}

const irAObservaciones = () => {
  // Por ahora, navegar a mis sílabos donde se mostrarán las observaciones
  // En el futuro, podríamos crear una vista específica para observaciones
  router.push({
    path: '/professor/mis-silabos',
    query: { mostrarObservaciones: 'true' }
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
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 40px;
  position: relative;
}

.welcome p {
  margin: 10px 0;
  font-size: 18px;
}

.alert-observaciones {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 15px 20px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  backdrop-filter: blur(10px);
}

.alert-icon {
  font-size: 1.5rem;
}

.btn-ver-observaciones {
  background: white;
  color: #667eea;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: auto;
}

.btn-ver-observaciones:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
}

/* Estadísticas */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.stat-content p {
  color: #6c757d;
  margin: 0;
  font-size: 0.95rem;
}

.badge-nuevas {
  display: inline-block;
  background: #e74c3c;
  color: white;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 10px;
  margin-top: 5px;
  font-weight: 600;
}

/* Acciones rápidas */
.quick-actions {
  margin-bottom: 40px;
}

.quick-actions h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  position: relative;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.action-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 15px;
}

.action-card h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.action-card p {
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
  font-size: 0.95rem;
}

.card-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #667eea;
  color: white;
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.card-badge.alert {
  background: #e74c3c;
}

/* Observaciones card específica */
.observaciones-card {
  border-left: 4px solid #ffc107;
}

/* Info card */
.info-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.status-list {
  margin-top: 15px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  color: #495057;
  font-size: 0.9rem;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot.aprobado {
  background: #28a745;
}

.status-dot.observado {
  background: #ffc107;
}

.status-dot.pendiente {
  background: #6c757d;
}

/* Secciones */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.6rem;
}

.btn-ver-todas {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 0;
}

.btn-ver-todas:hover {
  color: #5a67d8;
}

/* Observaciones recientes */
.recent-observations {
  margin-bottom: 40px;
}

.observations-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.observation-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid #ffc107;
}

.observation-card:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.observation-card.unread {
  border-left-color: #e74c3c;
  background: #fff5f5;
}

.obs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.obs-subject {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.obs-date {
  color: #6c757d;
  font-size: 0.85rem;
}

.obs-preview p {
  color: #495057;
  margin: 0 0 15px 0;
  line-height: 1.5;
  font-size: 0.95rem;
}

.obs-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.obs-status {
  font-size: 0.85rem;
  font-weight: 600;
}

.observation-card.unread .obs-status {
  color: #e74c3c;
}

.btn-marcar-leida {
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-marcar-leida:hover {
  background: #218838;
}

/* Sílabos recientes */
.recent-syllabi {
  margin-bottom: 40px;
}

.syllabi-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.syllabus-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e9ecef;
}

.syllabus-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.syllabus-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.syllabus-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  flex: 1;
  line-height: 1.4;
}

.syllabus-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  margin-left: 10px;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-approved {
  background: #d4edda;
  color: #155724;
}

.status-observed {
  background: #f8d7da;
  color: #721c24;
}

.syllabus-details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.85rem;
  color: #6c757d;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.obs-indicator {
  color: #e74c3c;
  font-weight: 600;
}

/* Botón de logout */
.logout-button {
  padding: 12px 30px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
  display: block;
  margin: 40px auto 0 auto;
}

.logout-button:hover {
  background: #c0392b;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard {
    padding: 20px 15px;
  }

  .welcome {
    padding: 20px;
  }

  .alert-observaciones {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .btn-ver-observaciones {
    margin-left: 0;
    width: 100%;
  }

  .stats-panel {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .syllabi-list {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
