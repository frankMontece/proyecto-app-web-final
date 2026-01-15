<template>
  <div class="revisar-silabos-container">
    <!-- Encabezado -->
    <div class="page-header">
      <div class="header-content">
        <h1>Revisar Sílabos</h1>
        <p class="subtitle">Revise y apruebe sílabos creados por profesores</p>
      </div>
      <button @click="volverDashboard" class="btn-volver">
        ← Volver al Dashboard
      </button>
    </div>

    <!-- Filtros y estadísticas -->
    <div class="filters-section">
      <div class="stats-cards">
        <div class="stat-card" :class="{ active: filtroEstado === 'pendiente' }" @click="cambiarFiltro('pendiente')">
          <h3>{{ estadisticas.pendientes }}</h3>
          <p>Pendientes</p>
        </div>
        <div class="stat-card" :class="{ active: filtroEstado === 'revision' }" @click="cambiarFiltro('revision')">
          <h3>{{ estadisticas.enRevision }}</h3>
          <p>En Revisión</p>
        </div>
        <div class="stat-card" :class="{ active: filtroEstado === 'aprobado' }" @click="cambiarFiltro('aprobado')">
          <h3>{{ estadisticas.aprobados }}</h3>
          <p>Aprobados</p>
        </div>
        <div class="stat-card" :class="{ active: filtroEstado === 'observado' }" @click="cambiarFiltro('observado')">
          <h3>{{ estadisticas.observados }}</h3>
          <p>Observados</p>
        </div>
      </div>
    </div>

    <!-- Lista de sílabos -->
    <div class="silabos-list-container">
      <div class="list-header">
        <h2>Sílabos {{ obtenerTextoFiltro() }}</h2>
        <div class="search-box">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Buscar sílabos..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Mensaje si no hay sílabos -->
      <div v-if="silabosFiltrados.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>No hay sílabos {{ obtenerTextoFiltro().toLowerCase() }}</h3>
        <p v-if="filtroEstado === 'pendiente'">Todos los sílabos han sido revisados</p>
        <p v-else>No se encontraron sílabos con este estado</p>
      </div>

      <!-- Lista de sílabos -->
      <div v-else class="silabos-list">
        <div
          v-for="silabo in silabosFiltrados"
          :key="silabo.id"
          class="silabo-card"
        >
          <div class="silabo-info">
            <div class="silabo-header">
              <h3 class="silabo-title">
                {{ silabo.datosGenerales?.nombreAsignatura || 'Sílabo sin nombre' }}
              </h3>
              <span class="silabo-status" :class="getStatusClass(silabo)">
                {{ getStatusText(silabo) }}
              </span>
            </div>

            <div class="silabo-details">
              <div class="detail-row">
                <span class="detail-label">Código:</span>
                <span class="detail-value">{{ silabo.datosGenerales?.codigoAsignatura || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Profesor:</span>
                <span class="detail-value">{{ silabo.metadata?.creadoPor || 'Profesor' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Ciclo:</span>
                <span class="detail-value">{{ silabo.datosGenerales?.ciclo || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Créditos:</span>
                <span class="detail-value">{{ silabo.datosGenerales?.creditos || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha creación:</span>
                <span class="detail-value">{{ formatDate(silabo.metadata?.fechaCreacion) }}</span>
              </div>
              <div class="detail-row" v-if="silabo.metadata?.fechaRevision">
                <span class="detail-label">Última revisión:</span>
                <span class="detail-value">{{ formatDate(silabo.metadata.fechaRevision) }}</span>
              </div>
            </div>

            <!-- Observaciones si las hay -->
            <div v-if="observacionesPorSilabo[silabo.id]?.length > 0" class="observaciones-preview">
              <span class="obs-icon">💬</span>
              <span>{{ observacionesPorSilabo[silabo.id].length }} observación(es)</span>
              <span class="obs-badge" v-if="tieneObservacionesNoLeidas(silabo.id)">
                Nuevo
              </span>
            </div>
          </div>

          <!-- Acciones del decanato -->
          <div class="silabo-actions">
            <button
              @click="verDetalle(silabo.id)"
              class="btn-action btn-revisar"
              title="Revisar sílabo en detalle"
            >
              <span class="action-icon">📝</span>
              <span class="action-text">Revisar</span>
            </button>

            <div class="quick-actions" v-if="filtroEstado !== 'aprobado'">
              <button
                @click.stop="aprobarSilabo(silabo.id)"
                class="btn-action btn-aprobar"
                title="Aprobar sílabo"
                :disabled="procesandoAprobacion === silabo.id"
              >
                <span class="action-icon" v-if="procesandoAprobacion !== silabo.id">✅</span>
                <span class="action-icon" v-else>⏳</span>
                <span class="action-text">
                  {{ procesandoAprobacion === silabo.id ? 'Procesando...' : 'Aprobar' }}
                </span>
              </button>

              <button
                @click.stop="enviarObservacion(silabo.id)"
                class="btn-action btn-observar"
                title="Enviar observaciones"
              >
                <span class="action-icon">💬</span>
                <span class="action-text">Observar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import silaboStorage from '@/services/silaboStorage'

const router = useRouter()

// Estado
const silabos = ref([])
const searchTerm = ref('')
const filtroEstado = ref('pendiente')
const procesandoAprobacion = ref(null)
const estadisticas = reactive({
  total: 0,
  pendientes: 0,
  enRevision: 0,
  aprobados: 0,
  observados: 0
})

// Cargar datos al montar el componente
onMounted(() => {
  cargarDatos()
})

// Función para cargar todos los datos
const cargarDatos = () => {
  cargarSilabos()
  cargarEstadisticas()
}

// Cargar lista de sílabos
const cargarSilabos = () => {
  try {
    silabos.value = silaboStorage.obtenerTodosSilabos()
  } catch (error) {
    console.error('Error al cargar sílabos:', error)
    alert('Error al cargar los sílabos')
  }
}

// Cargar estadísticas
const cargarEstadisticas = () => {
  try {
    const stats = silaboStorage.obtenerEstadisticasDecanato()
    Object.assign(estadisticas, stats)
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  }
}

// Computed Properties
const silabosFiltrados = computed(() => {
  let filtrados = silabos.value

  // Filtrar por estado
  if (filtroEstado.value) {
    filtrados = filtrados.filter(silabo => {
      const estado = silabo.metadata?.estado || 'pendiente'
      return estado === filtroEstado.value
    })
  }

  // Aplicar búsqueda
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase()
    filtrados = filtrados.filter(silabo => {
      const nombre = silabo.datosGenerales?.nombreAsignatura?.toLowerCase() || ''
      const codigo = silabo.datosGenerales?.codigoAsignatura?.toLowerCase() || ''
      const profesor = silabo.metadata?.creadoPor?.toLowerCase() || ''
      const ciclo = silabo.datosGenerales?.ciclo?.toString() || ''

      return nombre.includes(term) ||
             codigo.includes(term) ||
             profesor.includes(term) ||
             ciclo.includes(term)
    })
  }

  return filtrados
})

// Obtener observaciones por sílabo
const observacionesPorSilabo = computed(() => {
  const mapaObservaciones = {}

  silabos.value.forEach(silabo => {
    const observaciones = silaboStorage.obtenerObservacionesPorSilabo(silabo.id)
    mapaObservaciones[silabo.id] = observaciones
  })

  return mapaObservaciones
})

// Función para verificar si hay observaciones no leídas
const tieneObservacionesNoLeidas = (silaboId) => {
  const observaciones = observacionesPorSilabo.value[silaboId] || []
  return observaciones.some(obs => !obs.leida && !obs.visto)
}

// Funciones de navegación
const volverDashboard = () => {
  router.push('/dean/dashboard')
}

const cambiarFiltro = (estado) => {
  filtroEstado.value = estado
}

const obtenerTextoFiltro = () => {
  const textos = {
    'pendiente': 'Pendientes',
    'revision': 'En Revisión',
    'aprobado': 'Aprobados',
    'observado': 'Observados'
  }
  return textos[filtroEstado.value] || 'Todos'
}

// Formatear fecha
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

// Clases y textos de estado
const getStatusClass = (silabo) => {
  const estado = silabo.metadata?.estado || 'pendiente'
  const clases = {
    'pendiente': 'status-pending',
    'revision': 'status-review',
    'aprobado': 'status-approved',
    'observado': 'status-observed'
  }
  return clases[estado] || 'status-pending'
}

const getStatusText = (silabo) => {
  const estado = silabo.metadata?.estado || 'pendiente'
  const textos = {
    'pendiente': 'Pendiente',
    'revision': 'En revisión',
    'aprobado': 'Aprobado',
    'observado': 'Observado'
  }
  return textos[estado] || 'Pendiente'
}

// Funciones de acción
const verDetalle = (silaboId) => {
  router.push({
    name: 'detalle-silabo',
    params: { id: silaboId }
  })
}

const aprobarSilabo = async (silaboId) => {
  if (!confirm('¿Está seguro de aprobar este sílabo?\n\nUna vez aprobado, el profesor será notificado.')) {
    return
  }

  procesandoAprobacion.value = silaboId

  try {
    const resultado = silaboStorage.cambiarEstadoSilabo(silaboId, 'aprobado', {
      revisadoPor: 'decanato',
      fechaAprobacion: new Date().toISOString()
    })

    if (resultado.success) {
      alert('✅ Sílabo aprobado exitosamente')
      cargarDatos() // Recargar datos
    } else {
      alert(`❌ Error: ${resultado.message}`)
    }
  } catch (error) {
    console.error('Error al aprobar sílabo:', error)
    alert('Error al aprobar el sílabo')
  } finally {
    procesandoAprobacion.value = null
  }
}

const enviarObservacion = (silaboId) => {
  // Redirigir a la vista de detalle para enviar observaciones
  router.push({
    name: 'detalle-silabo',
    params: { id: silaboId },
    query: { modal: 'observacion' }
  })
}
</script>

<style scoped>
.revisar-silabos-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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

.btn-volver {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-volver:hover {
  background: #545b62;
}

/* Filtros y estadísticas */
.filters-section {
  margin-bottom: 2rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.stat-card.active {
  border-color: #007bff;
  background: #e7f1ff;
}

.stat-card h3 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-card p {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Lista de sílabos */
.silabos-list-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.list-header h2 {
  margin: 0;
  color: #2c3e50;
}

.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 300px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}

/* Tarjetas de sílabo */
.silabo-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.silabo-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0,123,255,0.1);
}

.silabo-info {
  flex: 1;
}

.silabo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.silabo-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.silabo-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 1rem;
  white-space: nowrap;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-review {
  background: #cce5ff;
  color: #004085;
  border: 1px solid #b8daff;
}

.status-approved {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-observed {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.silabo-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 600;
  color: #495057;
  min-width: 100px;
}

.detail-value {
  color: #6c757d;
}

.observaciones-preview {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.obs-badge {
  background: #dc3545;
  color: white;
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
}

/* Acciones */
.silabo-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 1rem;
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
  white-space: nowrap;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-revisar {
  background: #007bff;
  color: white;
}

.btn-revisar:hover:not(:disabled) {
  background: #0056b3;
}

.btn-aprobar {
  background: #28a745;
  color: white;
}

.btn-aprobar:hover:not(:disabled) {
  background: #218838;
}

.btn-observar {
  background: #ffc107;
  color: #212529;
}

.btn-observar:hover:not(:disabled) {
  background: #e0a800;
}

.action-icon {
  font-size: 1rem;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
}

/* Empty state */
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

/* Responsive */
@media (max-width: 768px) {
  .revisar-silabos-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .silabo-card {
    flex-direction: column;
    gap: 1rem;
  }

  .silabo-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .silabo-status {
    margin-left: 0;
    align-self: flex-start;
  }

  .silabo-actions {
    margin-left: 0;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  .btn-action {
    flex: 1;
    justify-content: center;
  }

  .search-input {
    width: 100%;
  }

  .quick-actions {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .silabo-actions {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }
}
</style>
