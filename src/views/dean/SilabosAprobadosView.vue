<template>
  <div class="silabos-aprobados-container">
    <!-- Encabezado -->
    <div class="page-header">
      <div class="header-content">
        <h1>Sílabos Aprobados</h1>
        <p class="subtitle">Historial de sílabos aprobados por el decanato</p>
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

    <!-- Estadísticas -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card stat-total">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <h3>{{ estadisticas.total }}</h3>
            <p>Total Aprobados</p>
          </div>
        </div>
        <div class="stat-card stat-semana">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3>{{ estadisticas.estaSemana }}</h3>
            <p>Esta semana</p>
          </div>
        </div>
        <div class="stat-card stat-mes">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>{{ estadisticas.esteMes }}</h3>
            <p>Este mes</p>
          </div>
        </div>
        <div class="stat-card stat-profesores">
          <div class="stat-icon">👨‍🏫</div>
          <div class="stat-content">
            <h3>{{ profesoresUnicos.length }}</h3>
            <p>Profesores</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filters-section">
      <div class="filter-controls">
        <div class="search-box">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Buscar sílabos aprobados..."
            class="search-input"
          />
        </div>

        <div class="filter-options">
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

          <div class="filter-group">
            <label for="filtroFecha">Ordenar por fecha:</label>
            <select id="filtroFecha" v-model="ordenFecha" class="filter-select">
              <option value="reciente">Más recientes primero</option>
              <option value="antiguo">Más antiguos primero</option>
            </select>
          </div>

          <button @click="exportarReporte" class="btn-exportar">
            📥 Exportar Reporte
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de sílabos aprobados -->
    <div class="silabos-container">
      <div class="silabos-header">
        <h2>Sílabos Aprobados</h2>
        <div class="header-info">
          <span class="count-badge">{{ silabosFiltrados.length }} sílabos</span>
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
      </div>

      <!-- Mensaje si no hay sílabos -->
      <div v-if="cargando" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando sílabos aprobados...</p>
      </div>

      <div v-else-if="silabosFiltrados.length === 0" class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>No hay sílabos aprobados</h3>
        <p v-if="filtroProfesor || searchTerm">
          No se encontraron sílabos aprobados con los filtros aplicados
        </p>
        <p v-else>
          Aún no se han aprobado sílabos. Los sílabos aprobados aparecerán aquí.
        </p>
        <button @click="irARevisarSilabos" class="btn-primary">
          Ir a Revisar Sílabos
        </button>
      </div>

      <!-- Lista de sílabos -->
      <div v-else class="silabos-list">
        <div
          v-for="silabo in silabosPaginados"
          :key="silabo.id"
          class="silabo-card"
        >
          <div class="silabo-header">
            <div class="silabo-title-section">
              <h3 class="silabo-title">
                {{ silabo.datosGenerales?.nombreAsignatura || 'Sílabo sin nombre' }}
              </h3>
              <div class="silabo-meta">
                <span class="meta-item">
                  <span class="meta-icon">📖</span>
                  {{ silabo.datosGenerales?.codigoAsignatura || 'Sin código' }}
                </span>
                <span class="meta-item">
                  <span class="meta-icon">👨‍🏫</span>
                  {{ silabo.metadata?.creadoPor || 'Profesor' }}
                </span>
                <span class="meta-item">
                  <span class="meta-icon">📅</span>
                  {{ formatDate(silabo.metadata?.fechaAprobacion || silabo.metadata?.fechaRevision) }}
                </span>
              </div>
            </div>

            <div class="silabo-status">
              <span class="status-badge status-aprobado">
                ✅ Aprobado
              </span>
              <span class="fecha-aprobacion">
                Aprobado el {{ formatDateShort(silabo.metadata?.fechaAprobacion || silabo.metadata?.fechaRevision) }}
              </span>
            </div>
          </div>

          <div class="silabo-details">
            <div class="details-grid">
              <div class="detail-item">
                <label>Ciclo:</label>
                <span>{{ silabo.datosGenerales?.ciclo || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <label>Créditos:</label>
                <span>{{ silabo.datosGenerales?.creditos || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <label>Horas teóricas:</label>
                <span>{{ obtenerHorasTeoricas(silabo) }}</span>
              </div>
              <div class="detail-item">
                <label>Horas prácticas:</label>
                <span>{{ obtenerHorasPracticas(silabo) }}</span>
              </div>
              <div class="detail-item">
                <label>Revisado por:</label>
                <span>{{ silabo.metadata?.revisadoPor || 'Decanato' }}</span>
              </div>
              <div class="detail-item">
                <label>Fecha creación:</label>
                <span>{{ formatDate(silabo.metadata?.fechaCreacion) }}</span>
              </div>
            </div>

            <!-- Resumen de estructura -->
            <div class="estructura-resumen">
              <h4>Resumen de estructura:</h4>
              <div class="resumen-content">
                <div class="resumen-item">
                  <span class="resumen-label">Actividad:</span>
                  <span class="resumen-value">
                    {{ silabo.estructuraConceptual?.formData?.activityName || 'No especificada' }}
                  </span>
                </div>
                <div class="resumen-item">
                  <span class="resumen-label">Total horas contacto:</span>
                  <span class="resumen-value">
                    {{ silabo.estructuraConceptual?.contactoDocente?.totalHours || 0 }} hrs
                  </span>
                </div>
                <div class="resumen-item">
                  <span class="resumen-label">Total horas prácticas:</span>
                  <span class="resumen-value">
                    {{ silabo.estructuraConceptual?.aprendizajePractico?.totalHours || 0 }} hrs
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="silabo-actions">
            <button
              @click="verDetalle(silabo.id)"
              class="btn-action btn-ver-detalle"
            >
              <span class="btn-icon">👁️</span>
              Ver Detalles
            </button>

            <button
              @click="exportarSilabo(silabo.id)"
              class="btn-action btn-exportar"
            >
              <span class="btn-icon">📥</span>
              Exportar
            </button>

            <button
              @click="verObservaciones(silabo.id)"
              class="btn-action btn-observaciones"
              v-if="tieneObservaciones(silabo.id)"
            >
              <span class="btn-icon">💬</span>
              Ver Observaciones
            </button>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="silabosFiltrados.length > itemsPorPagina" class="pagination">
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

    <!-- Gráfico de aprobaciones (opcional) -->
    <div class="grafico-section" v-if="silabosFiltrados.length > 0">
      <h3>Distribución de aprobaciones</h3>
      <div class="grafico-container">
        <div class="grafico-item" v-for="(count, profesor) in distribucionPorProfesor" :key="profesor">
          <div class="grafico-bar" :style="{ width: calcularPorcentaje(count) + '%' }"></div>
          <div class="grafico-label">
            <span class="grafico-profesor">{{ profesor }}</span>
            <span class="grafico-count">{{ count }} sílabos</span>
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
const silabos = ref([])
const cargando = ref(true)
const actualizando = ref(false)
const searchTerm = ref('')
const filtroProfesor = ref('')
const ordenFecha = ref('reciente')
const paginaActual = ref(1)
const itemsPorPagina = 10

// Cargar datos al montar
onMounted(() => {
  cargarSilabosAprobados()
})

// Computed
const silabosAprobados = computed(() => {
  return silabos.value.filter(silabo => silabo.metadata?.estado === 'aprobado')
})

const silabosFiltrados = computed(() => {
  let filtrados = [...silabosAprobados.value]

  // Filtrar por profesor
  if (filtroProfesor.value) {
    filtrados = filtrados.filter(silabo =>
      silabo.metadata?.creadoPor === filtroProfesor.value
    )
  }

  // Filtrar por búsqueda
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

  // Ordenar por fecha
  filtrados.sort((a, b) => {
    const fechaA = new Date(a.metadata?.fechaAprobacion || a.metadata?.fechaRevision || 0)
    const fechaB = new Date(b.metadata?.fechaAprobacion || b.metadata?.fechaRevision || 0)

    return ordenFecha.value === 'reciente' ? fechaB - fechaA : fechaA - fechaB
  })

  return filtrados
})

const silabosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  return silabosFiltrados.value.slice(inicio, fin)
})

const totalPaginas = computed(() => {
  return Math.ceil(silabosFiltrados.value.length / itemsPorPagina)
})

const profesoresUnicos = computed(() => {
  const profesores = new Set()
  silabosAprobados.value.forEach(silabo => {
    if (silabo.metadata?.creadoPor) {
      profesores.add(silabo.metadata.creadoPor)
    }
  })
  return Array.from(profesores).sort()
})

const estadisticas = computed(() => {
  const total = silabosAprobados.value.length

  // Calcular aprobaciones esta semana
  const unaSemanaAtras = new Date()
  unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7)
  const estaSemana = silabosAprobados.value.filter(silabo => {
    const fechaAprobacion = new Date(silabo.metadata?.fechaAprobacion || silabo.metadata?.fechaRevision || 0)
    return fechaAprobacion >= unaSemanaAtras
  }).length

  // Calcular aprobaciones este mes
  const unMesAtras = new Date()
  unMesAtras.setMonth(unMesAtras.getMonth() - 1)
  const esteMes = silabosAprobados.value.filter(silabo => {
    const fechaAprobacion = new Date(silabo.metadata?.fechaAprobacion || silabo.metadata?.fechaRevision || 0)
    return fechaAprobacion >= unMesAtras
  }).length

  return { total, estaSemana, esteMes }
})

const distribucionPorProfesor = computed(() => {
  const distribucion = {}
  silabosAprobados.value.forEach(silabo => {
    const profesor = silabo.metadata?.creadoPor || 'Desconocido'
    distribucion[profesor] = (distribucion[profesor] || 0) + 1
  })
  return distribucion
})

// Watch para resetear página cuando cambian filtros
watch([filtroProfesor, searchTerm, ordenFecha], () => {
  paginaActual.value = 1
})

// Funciones
const cargarSilabosAprobados = async () => {
  try {
    cargando.value = true

    // Cargar todos los sílabos
    silabos.value = silaboStorage.obtenerTodosSilabos()

  } catch (error) {
    console.error('Error al cargar sílabos aprobados:', error)
    alert('Error al cargar los sílabos aprobados')
  } finally {
    cargando.value = false
    actualizando.value = false
  }
}

const actualizarLista = () => {
  actualizando.value = true
  cargarSilabosAprobados()
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

const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return 'Fecha inválida'
  }
}

const obtenerHorasTeoricas = (silabo) => {
  return silabo.estructuraConceptual?.contactoDocente?.totalHours || 0
}

const obtenerHorasPracticas = (silabo) => {
  return silabo.estructuraConceptual?.aprendizajePractico?.totalHours || 0
}

const tieneObservaciones = (silaboId) => {
  const observaciones = silaboStorage.obtenerObservacionesPorSilabo(silaboId)
  return observaciones.length > 0
}

const calcularPorcentaje = (count) => {
  const total = silabosAprobados.value.length
  if (total === 0) return 0
  return (count / total) * 100
}

const verDetalle = (silaboId) => {
  router.push({
    name: 'detalle-silabo',
    params: { id: silaboId }
  })
}

const exportarSilabo = (silaboId) => {
  const resultado = silaboStorage.exportarSilaboJSON(silaboId)
  if (!resultado.success) {
    alert(`Error al exportar: ${resultado.message}`)
  }
}

const verObservaciones = (silaboId) => {
  router.push({
    name: 'detalle-silabo',
    params: { id: silaboId },
    query: { verObservaciones: 'true' }
  })
}

const exportarReporte = () => {
  try {
    const reporte = {
      fechaGeneracion: new Date().toISOString(),
      totalAprobados: silabosAprobados.value.length,
      estadisticas: estadisticas.value,
      distribucionPorProfesor: distribucionPorProfesor.value,
      silabos: silabosAprobados.value.map(silabo => ({
        id: silabo.id,
        asignatura: silabo.datosGenerales?.nombreAsignatura,
        codigo: silabo.datosGenerales?.codigoAsignatura,
        profesor: silabo.metadata?.creadoPor,
        fechaAprobacion: silabo.metadata?.fechaAprobacion || silabo.metadata?.fechaRevision,
        ciclo: silabo.datosGenerales?.ciclo,
        creditos: silabo.datosGenerales?.creditos
      }))
    }

    const jsonData = JSON.stringify(reporte, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_silabos_aprobados_${new Date().toISOString().split('T')[0]}.json`
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
.silabos-aprobados-container {
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

/* Estadísticas */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  font-size: 2.5rem;
  background: #e7f1ff;
  padding: 1rem;
  border-radius: 12px;
}

.stat-content h3 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.stat-content p {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
}

/* Filtros */
.filters-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  width: 100%;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}

.filter-options {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.filter-select {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background: white;
  font-size: 0.95rem;
  transition: border-color 0.3s;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
}

.btn-exportar {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
}

.btn-exportar:hover {
  background: #218838;
}

/* Contenedor de sílabos */
.silabos-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.silabos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.silabos-header h2 {
  margin: 0;
  color: #2c3e50;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.count-badge {
  background: #e7f1ff;
  color: #007bff;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
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

/* Lista de sílabos */
.silabos-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.silabo-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  border-left: 4px solid #28a745;
}

.silabo-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
  border-color: #28a745;
}

.silabo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.silabo-title-section {
  flex: 1;
  min-width: 300px;
}

.silabo-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
}

.silabo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.meta-icon {
  font-size: 1rem;
}

.silabo-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
}

.status-aprobado {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.fecha-aprobacion {
  color: #6c757d;
  font-size: 0.85rem;
}

/* Detalles del sílabo */
.silabo-details {
  margin: 1.5rem 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
}

.detail-item span {
  color: #6c757d;
}

.estructura-resumen {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  border-left: 3px solid #007bff;
}

.estructura-resumen h4 {
  color: #495057;
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
}

.resumen-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.resumen-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.resumen-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.85rem;
}

.resumen-value {
  color: #495057;
}

/* Acciones */
.silabo-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
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

.btn-ver-detalle {
  background: #007bff;
  color: white;
}

.btn-ver-detalle:hover {
  background: #0056b3;
}

.btn-exportar {
  background: #6c757d;
  color: white;
}

.btn-exportar:hover {
  background: #545b62;
}

.btn-observaciones {
  background: #ffc107;
  color: #212529;
}

.btn-observaciones:hover {
  background: #e0a800;
}

.btn-icon {
  font-size: 1rem;
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

/* Gráfico */
.grafico-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.grafico-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.grafico-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.grafico-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.grafico-bar {
  height: 24px;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 4px;
  min-width: 20px;
  transition: width 0.5s ease;
}

.grafico-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  min-width: 200px;
}

.grafico-profesor {
  font-weight: 500;
  color: #495057;
}

.grafico-count {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .silabos-aprobados-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .filter-options {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: 100%;
  }

  .silabo-header {
    flex-direction: column;
    align-items: stretch;
  }

  .silabo-status {
    align-items: flex-start;
    flex-direction: row;
    gap: 1rem;
  }

  .silabo-actions {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
    justify-content: center;
  }

  .grafico-label {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .resumen-content {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
