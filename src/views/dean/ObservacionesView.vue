<template>
  <div class="observaciones-view-container">
    <!-- Encabezado -->
    <div class="page-header">
      <div class="header-content">
        <h1>Observaciones</h1>
        <p class="subtitle">Gestión de observaciones enviadas a profesores</p>
      </div>
      <div class="header-actions">
        <button @click="volverDashboard" class="btn-volver">
          ← Dashboard
        </button>
        <button @click="volverRevisar" class="btn-revisar">
          📝 Revisar Sílabos
        </button>
      </div>
    </div>

    <!-- Filtros y estadísticas -->
    <div class="filters-section">
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-number">{{ estadisticas.total }}</span>
          <span class="stat-label">Total Observaciones</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ estadisticas.noLeidas }}</span>
          <span class="stat-label">No Leídas</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ estadisticas.porResponder }}</span>
          <span class="stat-label">Por Responder</span>
        </div>
      </div>

      <div class="filter-controls">
        <div class="filter-group">
          <label for="filtroEstado">Filtrar por estado:</label>
          <select id="filtroEstado" v-model="filtroEstado" class="filter-select">
            <option value="">Todas las observaciones</option>
            <option value="no-leidas">No leídas</option>
            <option value="leidas">Leídas</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filtroProfesor">Filtrar por profesor:</label>
          <select id="filtroProfesor" v-model="filtroProfesor" class="filter-select">
            <option value="">Todos los profesores</option>
            <option
              v-for="profesor in profesoresUnicos"
              :key="profesor"
              :value="profesor"
            >
              {{ profesor }}
            </option>
          </select>
        </div>

        <div class="search-box">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Buscar en observaciones..."
            class="search-input"
          />
        </div>
      </div>
    </div>

    <!-- Lista de observaciones -->
    <div class="observaciones-container">
      <div class="observaciones-header">
        <h2>Observaciones enviadas</h2>
        <button
          @click="actualizarLista"
          class="btn-refresh"
          :disabled="actualizando"
          title="Actualizar lista"
        >
          <span v-if="actualizando" class="spinner-small"></span>
          <span v-else>🔄 Actualizar</span>
        </button>
      </div>

      <!-- Mensaje si no hay observaciones -->
      <div v-if="cargando" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando observaciones...</p>
      </div>

      <div v-else-if="observacionesPaginadas.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No hay observaciones</h3>
        <p v-if="filtroEstado || filtroProfesor || searchTerm">
          No se encontraron observaciones con los filtros aplicados
        </p>
        <p v-else>
          Aún no se han enviado observaciones a los profesores
        </p>
        <button @click="irARevisarSilabos" class="btn-primary">
          Ir a Revisar Sílabos
        </button>
      </div>

      <!-- Lista de observaciones -->
      <div v-else class="observaciones-list">
        <div
          v-for="observacion in observacionesPaginadas"
          :key="observacion.id"
          class="observacion-card"
          :class="{ 'no-leida': !observacion.leida && !observacion.visto }"
        >
          <div class="observacion-header">
            <div class="observacion-meta">
              <div class="meta-row">
                <span class="meta-label">Para:</span>
                <span class="meta-value profesor">
                  {{ obtenerNombreProfesor(observacion.silaboId) }}
                </span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Asignatura:</span>
                <span class="meta-value asignatura">
                  {{ obtenerNombreAsignatura(observacion.silaboId) }}
                </span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Fecha:</span>
                <span class="meta-value fecha">
                  {{ formatDate(observacion.fecha || observacion.fechaCreacion) }}
                </span>
              </div>
            </div>

            <div class="observacion-status">
              <span
                class="status-badge"
                :class="{
                  'status-leida': observacion.leida || observacion.visto,
                  'status-no-leida': !observacion.leida && !observacion.visto
                }"
              >
                {{ (observacion.leida || observacion.visto) ? 'Leída' : 'No leída' }}
              </span>
              <span
                v-if="observacion.silaboEstado === 'observado'"
                class="estado-badge estado-observado"
              >
                Observado
              </span>
              <span
                v-else-if="observacion.silaboEstado === 'aprobado'"
                class="estado-badge estado-aprobado"
              >
                Aprobado
              </span>
            </div>
          </div>

          <div class="observacion-content">
            <div class="content-header">
              <h4>Observación:</h4>
              <button
                @click="toggleExpand(observacion.id)"
                class="btn-expand"
              >
                {{ observacionExpandida === observacion.id ? '▲' : '▼' }}
              </button>
            </div>

            <div
              class="observacion-text"
              :class="{ expanded: observacionExpandida === observacion.id }"
            >
              <p>{{ observacion.observacion }}</p>

              <div v-if="observacionExpandida === observacion.id" class="expanded-info">
                <div class="info-section">
                  <h5>Información adicional:</h5>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>Enviado por:</label>
                      <span>{{ observacion.creadoPor || 'Decanato' }}</span>
                    </div>
                    <div class="info-item" v-if="observacion.leida || observacion.visto">
                      <label>Fecha lectura:</label>
                      <span>{{ formatDate(observacion.fechaLectura || observacion.fechaVisto) }}</span>
                    </div>
                    <div class="info-item">
                      <label>ID Observación:</label>
                      <span class="monospace">{{ observacion.id }}</span>
                    </div>
                  </div>
                </div>

                <div class="action-buttons">
                  <button
                    @click="verSilabo(observacion.silaboId)"
                    class="btn-action btn-ver-silabo"
                  >
                    <span class="btn-icon">📖</span>
                    Ver Sílabo
                  </button>

                  <button
                    @click="marcarComoLeida(observacion.id)"
                    class="btn-action btn-marcar-leida"
                    v-if="!observacion.leida && !observacion.visto"
                  >
                    <span class="btn-icon">✓</span>
                    Marcar como leída
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="observacion-footer">
            <button
              @click="verSilabo(observacion.silaboId)"
              class="btn-small btn-outline"
            >
              Ir al sílabo
            </button>

            <span class="time-ago">
              {{ getTimeAgo(observacion.fecha || observacion.fechaCreacion) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="observacionesFiltradas.length > itemsPorPagina" class="pagination">
        <button
          @click="paginaActual--"
          :disabled="paginaActual === 1"
          class="btn-pagination"
        >
          ← Anterior
        </button>

        <span class="page-info">
          Página {{ paginaActual }} de {{ totalPaginas }}
        </span>

        <button
          @click="paginaActual++"
          :disabled="paginaActual === totalPaginas"
          class="btn-pagination"
        >
          Siguiente →
        </button>
      </div>
    </div>

    <!-- Resumen -->
    <div class="resumen-section" v-if="observacionesFiltradas.length > 0">
      <h3>Resumen</h3>
      <div class="resumen-grid">
        <div class="resumen-card">
          <div class="resumen-icon">📊</div>
          <div class="resumen-content">
            <h4>Distribución por profesor</h4>
            <div class="distribucion-list">
              <div
                v-for="(count, profesor) in distribucionPorProfesor"
                :key="profesor"
                class="distribucion-item"
              >
                <span class="dist-profe">{{ profesor }}</span>
                <span class="dist-count">{{ count }} obs.</span>
              </div>
            </div>
          </div>
        </div>

        <div class="resumen-card">
          <div class="resumen-icon">📈</div>
          <div class="resumen-content">
            <h4>Actividad reciente</h4>
            <div class="actividad-list">
              <div v-if="observacionMasReciente" class="actividad-item">
                <span class="act-label">Última observación:</span>
                <span class="act-value">{{ formatRelativeDate(observacionMasReciente.fecha) }}</span>
              </div>
              <div class="actividad-item">
                <span class="act-label">Total esta semana:</span>
                <span class="act-value">{{ observacionesEstaSemana }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import silaboStorage from '@/services/silaboStorage'

const router = useRouter()

// Estado
const observaciones = ref([])
const silabos = ref([])
const cargando = ref(true)
const actualizando = ref(false)
const filtroEstado = ref('')
const filtroProfesor = ref('')
const searchTerm = ref('')
const observacionExpandida = ref(null)
const paginaActual = ref(1)
const itemsPorPagina = 10

// Cargar datos al montar
onMounted(() => {
  cargarDatos()
})

// Computed
const observacionesFiltradas = computed(() => {
  let filtradas = observaciones.value

  // Filtrar por estado de lectura
  if (filtroEstado.value === 'no-leidas') {
    filtradas = filtradas.filter(obs => !obs.leida && !obs.visto)
  } else if (filtroEstado.value === 'leidas') {
    filtradas = filtradas.filter(obs => obs.leida || obs.visto)
  }

  // Filtrar por profesor
  if (filtroProfesor.value) {
    filtradas = filtradas.filter(obs => {
      const silabo = silabos.value.find(s => s.id === obs.silaboId)
      return silabo?.metadata?.creadoPor === filtroProfesor.value
    })
  }

  // Filtrar por búsqueda
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase()
    filtradas = filtradas.filter(obs => {
      const textoObservacion = obs.observacion?.toLowerCase() || ''
      const nombreProfesor = obtenerNombreProfesor(obs.silaboId)?.toLowerCase() || ''
      const nombreAsignatura = obtenerNombreAsignatura(obs.silaboId)?.toLowerCase() || ''

      return textoObservacion.includes(term) ||
             nombreProfesor.includes(term) ||
             nombreAsignatura.includes(term)
    })
  }

  return filtradas
})

const observacionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  return observacionesFiltradas.value.slice(inicio, fin)
})

const totalPaginas = computed(() => {
  return Math.ceil(observacionesFiltradas.value.length / itemsPorPagina)
})

const profesoresUnicos = computed(() => {
  const profesores = new Set()
  observaciones.value.forEach(obs => {
    const silabo = silabos.value.find(s => s.id === obs.silaboId)
    if (silabo?.metadata?.creadoPor) {
      profesores.add(silabo.metadata.creadoPor)
    }
  })
  return Array.from(profesores).sort()
})

const estadisticas = computed(() => {
  const total = observaciones.value.length
  const noLeidas = observaciones.value.filter(obs => !obs.leida && !obs.visto).length
  const porResponder = observaciones.value.filter(obs => {
    const silabo = silabos.value.find(s => s.id === obs.silaboId)
    return silabo?.metadata?.estado === 'observado'
  }).length

  return { total, noLeidas, porResponder }
})

const distribucionPorProfesor = computed(() => {
  const distribucion = {}
  observaciones.value.forEach(obs => {
    const profesor = obtenerNombreProfesor(obs.silaboId)
    if (profesor) {
      distribucion[profesor] = (distribucion[profesor] || 0) + 1
    }
  })
  return distribucion
})

const observacionMasReciente = computed(() => {
  if (observaciones.value.length === 0) return null
  return [...observaciones.value].sort((a, b) => {
    const fechaA = new Date(a.fecha || a.fechaCreacion)
    const fechaB = new Date(b.fecha || b.fechaCreacion)
    return fechaB - fechaA
  })[0]
})

const observacionesEstaSemana = computed(() => {
  const unaSemanaAtras = new Date()
  unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7)

  return observaciones.value.filter(obs => {
    const fechaObs = new Date(obs.fecha || obs.fechaCreacion)
    return fechaObs >= unaSemanaAtras
  }).length
})

// Watch para resetear página cuando cambian filtros
watch([filtroEstado, filtroProfesor, searchTerm], () => {
  paginaActual.value = 1
})

// Funciones
const cargarDatos = async () => {
  try {
    cargando.value = true

    // Cargar observaciones
    observaciones.value = silaboStorage.obtenerTodasObservaciones()

    // Cargar sílabos para información adicional
    silabos.value = silaboStorage.obtenerTodosSilabos()

    // Enriquecer observaciones con estado del sílabo
    observaciones.value = observaciones.value.map(obs => {
      const silabo = silabos.value.find(s => s.id === obs.silaboId)
      return {
        ...obs,
        silaboEstado: silabo?.metadata?.estado || 'desconocido'
      }
    })

  } catch (error) {
    console.error('Error al cargar observaciones:', error)
    alert('Error al cargar las observaciones')
  } finally {
    cargando.value = false
    actualizando.value = false
  }
}

const actualizarLista = () => {
  actualizando.value = true
  cargarDatos()
}

const obtenerNombreProfesor = (silaboId) => {
  const silabo = silabos.value.find(s => s.id === silaboId)
  return silabo?.metadata?.creadoPor || 'Profesor desconocido'
}

const obtenerNombreAsignatura = (silaboId) => {
  const silabo = silabos.value.find(s => s.id === silaboId)
  return silabo?.datosGenerales?.nombreAsignatura || 'Asignatura desconocida'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Fecha inválida'
  }
}

const formatRelativeDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    } else if (diffDays < 7) {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short'
      })
    }
  } catch {
    return 'Fecha inválida'
  }
}

const getTimeAgo = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffHours < 1) {
      return 'Hace menos de 1 hora'
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    } else {
      const diffDays = Math.floor(diffMs / 86400000)
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
    }
  } catch {
    return ''
  }
}

const toggleExpand = (observacionId) => {
  observacionExpandida.value = observacionExpandida.value === observacionId ? null : observacionId
}

const verSilabo = (silaboId) => {
  router.push({
    name: 'detalle-silabo',
    params: { id: silaboId }
  })
}

const marcarComoLeida = async (observacionId) => {
  try {
    const resultado = silaboStorage.marcarObservacionLeida(observacionId)

    if (resultado.success) {
      // Actualizar estado localmente
      const index = observaciones.value.findIndex(obs => obs.id === observacionId)
      if (index !== -1) {
        observaciones.value[index].leida = true
        observaciones.value[index].visto = true
        observaciones.value[index].fechaLectura = new Date().toISOString()
        observaciones.value[index].fechaVisto = new Date().toISOString()
      }
    } else {
      alert(`Error: ${resultado.message}`)
    }
  } catch (error) {
    console.error('Error al marcar como leída:', error)
    alert('Error al marcar la observación como leída')
  }
}

const volverDashboard = () => {
  router.push('/dean/dashboard')
}

const volverRevisar = () => {
  router.push('/dean/revisar-silabos')
}

const irARevisarSilabos = () => {
  router.push('/dean/revisar-silabos')
}
</script>

<style scoped>
.observaciones-view-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

/* Encabezado */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6c757d;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-volver,
.btn-revisar {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-volver {
  background: #6c757d;
  color: white;
}

.btn-volver:hover {
  background: #545b62;
}

.btn-revisar {
  background: #007bff;
  color: white;
}

.btn-revisar:hover {
  background: #0056b3;
}

/* Filtros y estadísticas */
.filters-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats-summary {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #007bff;
  line-height: 1;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-size: 0.95rem;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}

.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 100%;
  font-size: 1rem;
  margin-top: 1.25rem;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}

/* Contenedor de observaciones */
.observaciones-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.observaciones-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.observaciones-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-refresh {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-refresh:hover:not(:disabled) {
  background: #545b62;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Estados */
.loading-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e9ecef;
  border-top: 5px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-primary:hover {
  background: #0056b3;
}

/* Lista de observaciones */
.observaciones-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.observacion-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.observacion-card.no-leida {
  border-left: 4px solid #dc3545;
  background: #fff5f5;
}

.observacion-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.observacion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.observacion-meta {
  flex: 1;
  min-width: 300px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.meta-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  min-width: 80px;
}

.meta-value {
  color: #6c757d;
}

.meta-value.profesor {
  color: #007bff;
  font-weight: 600;
}

.meta-value.asignatura {
  color: #28a745;
  font-weight: 500;
}

.observacion-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-no-leida {
  background: #dc3545;
  color: white;
}

.status-leida {
  background: #28a745;
  color: white;
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.estado-observado {
  background: #ffc107;
  color: #212529;
}

.estado-aprobado {
  background: #28a745;
  color: white;
}

/* Contenido de observación */
.observacion-content {
  margin-bottom: 1rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.content-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1.1rem;
}

.btn-expand {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
}

.btn-expand:hover {
  color: #007bff;
}

.observacion-text {
  color: #495057;
  line-height: 1.6;
  max-height: 100px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.observacion-text.expanded {
  max-height: 1000px;
}

.expanded-info {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.info-section h5 {
  color: #495057;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.85rem;
}

.monospace {
  font-family: monospace;
  font-size: 0.9rem;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ver-silabo {
  background: #007bff;
  color: white;
}

.btn-ver-silabo:hover {
  background: #0056b3;
}

.btn-marcar-leida {
  background: #28a745;
  color: white;
}

.btn-marcar-leida:hover {
  background: #218838;
}

.btn-icon {
  font-size: 1rem;
}

/* Footer de observación */
.observacion-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn-small {
  padding: 0.25rem 0.75rem;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-small:hover {
  background: #007bff;
  color: white;
}

.time-ago {
  color: #6c757d;
  font-size: 0.85rem;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e9ecef;
}

.btn-pagination {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-pagination:hover:not(:disabled) {
  background: #545b62;
}

.btn-pagination:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-info {
  color: #495057;
  font-weight: 500;
}

/* Resumen */
.resumen-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.resumen-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.resumen-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.resumen-icon {
  font-size: 2rem;
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.resumen-content {
  flex: 1;
}

.resumen-content h4 {
  color: #495057;
  margin-top: 0;
  margin-bottom: 1rem;
}

.distribucion-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.distribucion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
}

.dist-profe {
  color: #495057;
  font-weight: 500;
}

.dist-count {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.actividad-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.actividad-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
}

.act-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.act-value {
  color: #495057;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .observaciones-view-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .observacion-header {
    flex-direction: column;
    align-items: stretch;
  }

  .observacion-status {
    align-items: flex-start;
    flex-direction: row;
    gap: 1rem;
  }

  .filter-controls {
    grid-template-columns: 1fr;
  }

  .resumen-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-summary {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .observacion-footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .btn-small {
    width: 100%;
    text-align: center;
  }
}
</style>
