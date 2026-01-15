<template>
  <div class="mis-silabos-container">
    <!-- Encabezado -->
    <div class="page-header">
      <div class="header-content">
        <h1>Mis Sílabos</h1>
        <p class="subtitle">Gestiona todos los sílabos que has creado</p>
      </div>
      <button @click="volverDashboard" class="btn-volver">
        ← Volver al Dashboard
      </button>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <h3>{{ estadisticas.total }}</h3>
          <p>Sílabos Totales</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>{{ estadisticas.aprobados }}</h3>
          <p>Aprobados</p>
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
            placeholder="Buscar sílabos..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>

        <div class="filter-options">
          <div class="filter-group">
            <label for="filtroEstado">Filtrar por estado:</label>
            <select id="filtroEstado" v-model="filtroEstado" class="filter-select">
              <option value="">Todos los estados</option>
              <option value="aprobado">Aprobados</option>
            </select>
          </div>

          <button @click="crearNuevoSilabo" class="btn-nuevo">
            + Nuevo Sílabo
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de sílabos -->
    <div class="silabos-list-container">
      <div class="list-header">
        <h2>Sílabos ({{ silabosFiltrados.length }})</h2>
        <div class="list-info">
          <span class="info-item">
            <span class="info-dot aprobado"></span>
            {{ estadisticas.aprobados }} aprobados
          </span>
        </div>
      </div>

      <!-- Mensaje si no hay sílabos -->
      <div v-if="cargando" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando sílabos...</p>
      </div>

      <div v-else-if="silabosFiltrados.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>No hay sílabos</h3>
        <p v-if="searchTerm || filtroEstado || filtroObservaciones">
          No se encontraron sílabos con los filtros aplicados
        </p>
        <p v-else>
          Crea tu primer sílabo para comenzar a gestionarlos aquí.
        </p>
        <button @click="crearNuevoSilabo" class="btn-primary">
          Crear mi primer sílabo
        </button>
      </div>

      <!-- Lista de sílabos -->
      <div v-else class="silabos-list">
        <div
          v-for="silabo in silabosPaginados"
          :key="silabo.id"
          class="silabo-card"
          :class="{
            'con-observaciones': tieneObservaciones(silabo.id),
            'observaciones-no-leidas': tieneObservacionesNoLeidas(silabo.id)
          }"
        >
          <!-- Información principal del sílabo -->
          <div class="silabo-info">
            <div class="silabo-header">
              <div class="silabo-title-section">
                <h3 class="silabo-title">
                  {{ silabo.datosGenerales?.nombreAsignatura || 'Sílabo sin nombre' }}
                </h3>
                <div class="silabo-codigo">
                  {{ silabo.datosGenerales?.codigoAsignatura || 'Sin código' }}
                </div>
              </div>

              <div class="silabo-status-section">
                <span class="silabo-status" :class="getStatusClass(silabo)">
                  {{ getStatusText(silabo) }}
                </span>
                <span class="silabo-fecha">
                  {{ formatDate(silabo.metadata?.fechaCreacion) }}
                </span>
              </div>
            </div>

            <!-- Detalles del sílabo -->
            <div class="silabo-details">
              <div class="detail-row">
                <span class="detail-label">Ciclo:</span>
                <span class="detail-value">{{ silabo.datosGenerales?.ciclo || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Créditos:</span>
                <span class="detail-value">{{ silabo.datosGenerales?.creditos || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Horas totales:</span>
                <span class="detail-value">{{ calcularTotalHoras(silabo) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Última modificación:</span>
                <span class="detail-value">{{ formatDate(silabo.metadata?.ultimaModificacion) }}</span>
              </div>
            </div>

            <!-- Información de estructura -->
            <div v-if="silabo.estructuraConceptual" class="silabo-extra">
              <div class="extra-tag">
                <span class="tag-icon">📝</span>
                <span>{{ silabo.estructuraConceptual.formData?.activityName || 'Sin actividad' }}</span>
              </div>
              <div class="extra-tag">
                <span class="tag-icon">👨‍🏫</span>
                <span>{{ silabo.estructuraConceptual.contactoDocente?.totalHours || 0 }}h contacto</span>
              </div>
              <div class="extra-tag">
                <span class="tag-icon">🔬</span>
                <span>{{ silabo.estructuraConceptual.aprendizajePractico?.totalHours || 0 }}h prácticas</span>
              </div>
            </div>

            <!-- Observaciones del sílabo -->
            <div v-if="tieneObservaciones(silabo.id)" class="silabo-observaciones">
              <div class="observaciones-header">
                <span class="obs-icon">💬</span>
                <span class="obs-count">{{ contarObservaciones(silabo.id) }} observación(es)</span>
                <span
                  v-if="tieneObservacionesNoLeidas(silabo.id)"
                  class="obs-nuevas-badge"
                >
                  {{ contarObservacionesNoLeidas(silabo.id) }} nueva(s)
                </span>
              </div>

              <div class="observaciones-preview">
                <div
                  v-for="obs in obtenerObservacionesRecientes(silabo.id, 2)"
                  :key="obs.id"
                  class="observacion-preview-item"
                  :class="{ 'no-leida': !obs.leida && !obs.visto }"
                  @click.stop="verObservacion(obs)"
                >
                  <div class="obs-preview-header">
                    <span class="obs-preview-date">{{ formatRelativeDate(obs.fecha) }}</span>
                    <span v-if="!obs.leida && !obs.visto" class="obs-preview-new">NUEVO</span>
                  </div>
                  <p class="obs-text-preview">{{ truncateText(obs.observacion, 80) }}</p>
                </div>
              </div>

              <div class="observaciones-actions">
                <button
                  @click.stop="verTodasObservaciones(silabo.id)"
                  class="btn-ver-todas-observaciones"
                >
                  Ver todas las observaciones
                </button>
                <button
                  v-if="tieneObservacionesNoLeidas(silabo.id)"
                  @click.stop="marcarTodasComoLeidas(silabo.id)"
                  class="btn-marcar-leidas"
                >
                  Marcar todas como leídas
                </button>
              </div>
            </div>

            <!-- Mensaje si no tiene observaciones pero está observado -->
            <div v-else-if="silabo.metadata?.estado === 'observado'" class="sin-observaciones">
              <span class="info-icon">ℹ️</span>
              <span>Este sílabo fue marcado como observado, pero no hay observaciones registradas.</span>
            </div>
          </div>

          <!-- Acciones del sílabo -->
          <div class="silabo-actions">
            <button
              @click="editarSilabo(silabo.id)"
              class="btn-action btn-editar"
              title="Editar sílabo"
            >
              <span class="action-icon">✏️</span>
              <span class="action-text">Editar</span>
            </button>

            <button
              @click="exportarSilabo(silabo.id)"
              class="btn-action btn-exportar"
              title="Exportar como JSON"
            >
              <span class="action-icon">📤</span>
              <span class="action-text">Exportar</span>
            </button>

            <button
              v-if="tieneObservaciones(silabo.id)"
              @click="verTodasObservaciones(silabo.id)"
              class="btn-action btn-observaciones"
              :class="{ 'urgente': tieneObservacionesNoLeidas(silabo.id) }"
              :title="tieneObservacionesNoLeidas(silabo.id) ? 'Ver observaciones nuevas' : 'Ver observaciones'"
            >
              <span class="action-icon">💬</span>
              <span class="action-text">
                {{ tieneObservacionesNoLeidas(silabo.id) ? 'Ver observaciones' : 'Observaciones' }}
              </span>
              <span v-if="contarObservacionesNoLeidas(silabo.id) > 0" class="action-badge">
                {{ contarObservacionesNoLeidas(silabo.id) }}
              </span>
            </button>

            <button
              @click="confirmarEliminar(silabo)"
              class="btn-action btn-eliminar"
              title="Eliminar sílabo"
            >
              <span class="action-icon">🗑️</span>
              <span class="action-text">Eliminar</span>
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

    <!-- Modal de observaciones -->
    <div v-if="showObservacionesModal" class="modal-overlay">
      <div class="modal-container modal-observaciones">
        <div class="modal-header">
          <h3>Observaciones del sílabo</h3>
          <div class="modal-subtitle">
            <strong>{{ silaboObservaciones?.datosGenerales?.nombreAsignatura || 'Sílabo' }}</strong>
            <span class="modal-codigo">{{ silaboObservaciones?.datosGenerales?.codigoAsignatura }}</span>
          </div>
          <button @click="cerrarModalObservaciones" class="modal-close">×</button>
        </div>

        <div class="modal-body">
          <div v-if="observacionesModal.length === 0" class="no-observaciones-modal">
            <div class="no-obs-icon">📭</div>
            <h4>No hay observaciones</h4>
            <p>El decanato no ha enviado observaciones para este sílabo.</p>
          </div>

          <div v-else class="observaciones-modal-list">
            <div
              v-for="obs in observacionesModal"
              :key="obs.id"
              class="observacion-modal-item"
              :class="{ 'no-leida': !obs.leida && !obs.visto }"
            >
              <div class="obs-modal-header">
                <div class="obs-modal-meta">
                  <span class="obs-modal-date">{{ formatDate(obs.fecha) }}</span>
                  <span class="obs-modal-author">Por: {{ obs.creadoPor || 'Decanato' }}</span>
                </div>
                <div class="obs-modal-status">
                  <span v-if="!obs.leida && !obs.visto" class="obs-status-new">NUEVA</span>
                  <span v-else class="obs-status-read">LEÍDA</span>
                </div>
              </div>

              <div class="obs-modal-content">
                <p>{{ obs.observacion }}</p>
              </div>

              <div class="obs-modal-actions">
                <button
                  v-if="!obs.leida && !obs.visto"
                  @click="marcarObservacionComoLeida(obs.id)"
                  class="btn-marcar-leida-modal"
                >
                  ✅ Marcar como leída
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="cerrarModalObservaciones" class="btn-secondary">
            Cerrar
          </button>
          <button
            v-if="observacionesNoLeidasModal.length > 0"
            @click="marcarTodasComoLeidasModal"
            class="btn-primary"
          >
            ✅ Marcar todas como leídas ({{ observacionesNoLeidasModal.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>¿Eliminar sílabo?</h3>
          <button @click="cancelarEliminar" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar el sílabo <strong>{{ silaboAEliminar?.datosGenerales?.nombreAsignatura || 'este sílabo' }}</strong>?</p>
          <p class="modal-warning">⚠️ Esta acción no se puede deshacer.</p>
          <div v-if="tieneObservaciones(silaboAEliminar?.id)" class="modal-alert">
            <span class="alert-icon">💬</span>
            <span>Este sílabo tiene {{ contarObservaciones(silaboAEliminar?.id) }} observación(es) que también se eliminarán.</span>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cancelarEliminar" class="btn-secondary">
            Cancelar
          </button>
          <button @click="eliminarSilaboConfirmado" class="btn-danger">
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import silaboStorage from '@/services/silaboStorage'

const router = useRouter()
const route = useRoute()

// Estado
const silabos = ref([])
const observaciones = ref([])
const cargando = ref(true)
const searchTerm = ref('')
const filtroEstado = ref('')
const filtroObservaciones = ref('')
const paginaActual = ref(1)
const itemsPorPagina = 10
const showDeleteModal = ref(false)
const silaboAEliminar = ref(null)
const showObservacionesModal = ref(false)
const silaboObservaciones = ref(null)
const observacionesModal = ref([])

// Cargar datos al montar
onMounted(() => {
  cargarDatos()

  // Verificar si hay parámetro para mostrar observaciones
  if (route.query.verObservaciones) {
    const silaboId = route.query.verObservaciones
    verTodasObservaciones(silaboId)
  }

  if (route.query.mostrarObservaciones === 'true') {
    mostrarTodasObservaciones()
  }
})

// Computed
const estadisticas = computed(() => {
  const total = silabos.value.length
  const aprobados = silabos.value.filter(s => s.metadata?.estado === 'aprobado').length
  const observados = silabos.value.filter(s => s.metadata?.estado === 'observado').length
  const pendientes = silabos.value.filter(s => s.metadata?.estado === 'pendiente').length

  const totalObservaciones = observaciones.value.length
  const observacionesNoLeidas = observaciones.value.filter(obs => !obs.leida && !obs.visto).length

  return {
    total,
    aprobados,
    observados,
    pendientes,
    observaciones: totalObservaciones,
    observacionesNoLeidas
  }
})

const silabosFiltrados = computed(() => {
  let filtrados = silabos.value

  // Filtrar por estado
  if (filtroEstado.value) {
    filtrados = filtrados.filter(silabo => {
      const estado = silabo.metadata?.estado || 'pendiente'
      return estado === filtroEstado.value
    })
  }

  // Filtrar por observaciones
  if (filtroObservaciones.value === 'con-observaciones') {
    filtrados = filtrados.filter(silabo => tieneObservaciones(silabo.id))
  } else if (filtroObservaciones.value === 'sin-observaciones') {
    filtrados = filtrados.filter(silabo => !tieneObservaciones(silabo.id))
  } else if (filtroObservaciones.value === 'no-leidas') {
    filtrados = filtrados.filter(silabo => tieneObservacionesNoLeidas(silabo.id))
  }

  // Filtrar por búsqueda
  if (searchTerm.value.trim()) {
    const termino = searchTerm.value.toLowerCase()
    filtrados = filtrados.filter(silabo => {
      const nombre = silabo.datosGenerales?.nombreAsignatura?.toLowerCase() || ''
      const codigo = silabo.datosGenerales?.codigoAsignatura?.toLowerCase() || ''
      const ciclo = silabo.datosGenerales?.ciclo?.toString().toLowerCase() || ''

      return nombre.includes(termino) ||
             codigo.includes(termino) ||
             ciclo.includes(termino)
    })
  }

  // Ordenar: primero los con observaciones no leídas, luego por fecha
  filtrados.sort((a, b) => {
    const aTieneNoLeidas = tieneObservacionesNoLeidas(a.id)
    const bTieneNoLeidas = tieneObservacionesNoLeidas(b.id)

    if (aTieneNoLeidas && !bTieneNoLeidas) return -1
    if (!aTieneNoLeidas && bTieneNoLeidas) return 1

    const fechaA = new Date(a.metadata?.fechaCreacion || 0)
    const fechaB = new Date(b.metadata?.fechaCreacion || 0)
    return fechaB - fechaA
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

const observacionesNoLeidasModal = computed(() => {
  return observacionesModal.value.filter(obs => !obs.leida && !obs.visto)
})

// Watch para resetear página cuando cambian filtros
watch([filtroEstado, filtroObservaciones, searchTerm], () => {
  paginaActual.value = 1
})

// Funciones
const cargarDatos = () => {
  try {
    cargando.value = true

    // Cargar sílabos del profesor actual
    const todosSilabos = silaboStorage.obtenerTodosSilabos()

    // Filtrar sílabos del profesor actual (basado en creadoPor)
    silabos.value = todosSilabos.filter(silabo => {
      // Asumimos que el profesor actual es el creador del sílabo
      return silabo.metadata?.creadoPor?.includes('profesor') ||
             silabo.metadata?.creadoPor === 'Profesor' ||
             silabo.metadata?.profesorId
    })

    // Cargar todas las observaciones
    const todasObservaciones = silaboStorage.obtenerTodasObservaciones()

    // Filtrar observaciones de los sílabos del profesor
    observaciones.value = todasObservaciones.filter(obs => {
      return silabos.value.some(s => s.id === obs.silaboId)
    })

    console.log(`📚 ${silabos.value.length} sílabos cargados`)
    console.log(`💬 ${observaciones.value.length} observaciones cargadas`)

  } catch (error) {
    console.error('❌ Error al cargar datos:', error)
    alert('Error al cargar los datos')
  } finally {
    cargando.value = false
  }
}

// Funciones para observaciones
const tieneObservaciones = (silaboId) => {
  return observaciones.value.some(obs => obs.silaboId === silaboId)
}

const contarObservaciones = (silaboId) => {
  return observaciones.value.filter(obs => obs.silaboId === silaboId).length
}

const contarObservacionesNoLeidas = (silaboId) => {
  return observaciones.value.filter(obs =>
    obs.silaboId === silaboId && (!obs.leida && !obs.visto)
  ).length
}

const tieneObservacionesNoLeidas = (silaboId) => {
  return contarObservacionesNoLeidas(silaboId) > 0
}

const obtenerObservacionesRecientes = (silaboId, limit = 2) => {
  return observaciones.value
    .filter(obs => obs.silaboId === silaboId)
    .sort((a, b) => new Date(b.fecha || b.fechaCreacion) - new Date(a.fecha || a.fechaCreacion))
    .slice(0, limit)
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatRelativeDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
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
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return 'Fecha inválida'
  }
}

const getStatusClass = (silabo) => {
  const estado = silabo.metadata?.estado || 'pendiente'
  const clases = {
    'pendiente': 'status-pendiente',
    'aprobado': 'status-aprobado',
    'observado': 'status-observado'
  }
  return clases[estado] || 'status-pendiente'
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

const calcularTotalHoras = (silabo) => {
  if (!silabo.estructuraConceptual) return '0h'

  const contacto = silabo.estructuraConceptual.contactoDocente?.totalHours || 0
  const practico = silabo.estructuraConceptual.aprendizajePractico?.totalHours || 0

  return `${contacto + practico}h`
}

// Funciones de navegación
const volverDashboard = () => {
  router.push('/professor/dashboard')
}

const crearNuevoSilabo = () => {
  silaboStorage.eliminarDatosTemporales()
  router.push('/professor/crear-silabo')
}

// Funciones de observaciones
const verObservacion = (observacion) => {
  // Encontrar el sílabo
  const silabo = silabos.value.find(s => s.id === observacion.silaboId)
  if (silabo) {
    silaboObservaciones.value = silabo
    observacionesModal.value = [observacion]
    showObservacionesModal.value = true

    // Marcar como leída automáticamente al ver
    if (!observacion.leida && !observacion.visto) {
      marcarObservacionComoLeida(observacion.id)
    }
  }
}

const verTodasObservaciones = (silaboId) => {
  const silabo = silabos.value.find(s => s.id === silaboId)
  if (silabo) {
    silaboObservaciones.value = silabo
    observacionesModal.value = observaciones.value.filter(obs => obs.silaboId === silaboId)
    showObservacionesModal.value = true
  }
}

const mostrarTodasObservaciones = () => {
  // Mostrar todos los sílabos con observaciones
  filtroObservaciones.value = 'con-observaciones'
}

const cerrarModalObservaciones = () => {
  showObservacionesModal.value = false
  silaboObservaciones.value = null
  observacionesModal.value = []
}

const marcarObservacionComoLeida = (observacionId) => {
  const resultado = silaboStorage.marcarObservacionLeida(observacionId)

  if (resultado.success) {
    // Actualizar estado local
    const index = observaciones.value.findIndex(obs => obs.id === observacionId)
    if (index !== -1) {
      observaciones.value[index].leida = true
      observaciones.value[index].visto = true
    }

    // Actualizar en modal si está abierto
    const modalIndex = observacionesModal.value.findIndex(obs => obs.id === observacionId)
    if (modalIndex !== -1) {
      observacionesModal.value[modalIndex].leida = true
      observacionesModal.value[modalIndex].visto = true
    }
  }
}

const marcarTodasComoLeidas = (silaboId) => {
  const obsDelSilabo = observaciones.value.filter(obs =>
    obs.silaboId === silaboId && (!obs.leida && !obs.visto)
  )

  obsDelSilabo.forEach(obs => {
    marcarObservacionComoLeida(obs.id)
  })

  alert(`✅ ${obsDelSilabo.length} observación(es) marcada(s) como leída(s)`)
}

const marcarTodasComoLeidasModal = () => {
  observacionesNoLeidasModal.value.forEach(obs => {
    marcarObservacionComoLeida(obs.id)
  })

  alert(`✅ ${observacionesNoLeidasModal.value.length} observación(es) marcada(s) como leída(s)`)
}

// Funciones de acción
const editarSilabo = (silaboId) => {
  localStorage.setItem('silabo_editar_id', silaboId)
  const silabo = silaboStorage.obtenerSilaboPorId(silaboId)

  if (silabo) {
    silaboStorage.guardarDatosGenerales(silabo.datosGenerales)

    if (silabo.estructuraConceptual) {
      const estructuraData = {
        formData: silabo.estructuraConceptual.formData || {},
        contactLearning: silabo.estructuraConceptual.contactoDocente || {},
        practicalLearning: silabo.estructuraConceptual.aprendizajePractico || {}
      }
      silaboStorage.guardarEstructuraConceptual(estructuraData)
    }

    router.push('/professor/crear-silabo')
  } else {
    alert('❌ No se pudo cargar el sílabo para editar')
  }
}

const confirmarEliminar = (silabo) => {
  silaboAEliminar.value = silabo
  showDeleteModal.value = true
}

const cancelarEliminar = () => {
  showDeleteModal.value = false
  silaboAEliminar.value = null
}

const eliminarSilaboConfirmado = () => {
  if (silaboAEliminar.value) {
    const resultado = silaboStorage.eliminarSilabo(silaboAEliminar.value.id)

    if (resultado.success) {
      // Recargar datos
      cargarDatos()
      alert('✅ Sílabo eliminado exitosamente')
    } else {
      alert('❌ Error al eliminar el sílabo: ' + resultado.message)
    }
  }

  cancelarEliminar()
}

const exportarSilabo = (silaboId) => {
  const resultado = silaboStorage.exportarSilaboJSON(silaboId)

  if (!resultado.success) {
    alert('❌ ' + resultado.message)
  }
}
</script>

<style scoped>
.mis-silabos-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.header-content {
  flex: 1;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
}

.observaciones-alert {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  backdrop-filter: blur(10px);
  margin-top: 1rem;
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
  white-space: nowrap;
}

.btn-ver-observaciones:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
}

.btn-volver {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-volver:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Estadísticas */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
}

.stat-badge {
  display: inline-block;
  background: #e74c3c;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-weight: 600;
  margin-top: 0.5rem;
}

/* Filtros */
.filters-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 2px solid #dee2e6;
  border-radius: 0.5rem;
  width: 100%;
  font-size: 1rem;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1.2rem;
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
  border: 2px solid #dee2e6;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.95rem;
  transition: border-color 0.3s;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-nuevo {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.btn-nuevo:hover {
  background: #218838;
}

/* Lista de sílabos */
.silabos-list-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
  flex-wrap: wrap;
  gap: 1rem;
}

.list-header h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
}

.list-info {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.info-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.info-dot.aprobado {
  background: #28a745;
}

.info-dot.observado {
  background: #ffc107;
}

.info-dot.pendiente {
  background: #6c757d;
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
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 2rem;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #0056b3;
}

/* Tarjetas de sílabo */
.silabos-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.silabo-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
}

.silabo-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.silabo-card.con-observaciones {
  border-left: 4px solid #ffc107;
}

.silabo-card.observaciones-no-leidas {
  border-left: 4px solid #e74c3c;
  background: #fff5f5;
}

.silabo-info {
  flex: 1;
  min-width: 0;
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
  font-size: 1.4rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.silabo-codigo {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.silabo-status-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  min-width: 150px;
}

.silabo-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-pendiente {
  background: #fff3cd;
  color: #856404;
}

.status-aprobado {
  background: #d4edda;
  color: #155724;
}

.status-observado {
  background: #f8d7da;
  color: #721c24;
}

.silabo-fecha {
  color: #6c757d;
  font-size: 0.8rem;
}

.silabo-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
  font-size: 0.9rem;
}

.detail-value {
  color: #6c757d;
  font-size: 0.9rem;
}

.silabo-extra {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.extra-tag {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-icon {
  font-size: 0.9rem;
}

/* Observaciones en tarjetas */
.silabo-observaciones {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.observaciones-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.obs-icon {
  font-size: 1rem;
  color: #ffc107;
}

.obs-count {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.obs-nuevas-badge {
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  font-weight: 600;
  margin-left: 0.5rem;
}

.observaciones-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.observacion-preview-item {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #6c757d;
  cursor: pointer;
  transition: all 0.3s;
}

.observacion-preview-item:hover {
  background: #e9ecef;
}

.observacion-preview-item.no-leida {
  background: #fff5f5;
  border-left-color: #e74c3c;
}

.obs-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.obs-preview-date {
  color: #6c757d;
  font-size: 0.75rem;
}

.obs-preview-new {
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
}

.obs-text-preview {
  margin: 0;
  color: #495057;
  font-size: 0.85rem;
  line-height: 1.4;
}

.observaciones-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-ver-todas-observaciones {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.3s;
  flex: 1;
}

.btn-ver-todas-observaciones:hover {
  background: #0056b3;
}

.btn-marcar-leidas {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
}

.btn-marcar-leidas:hover {
  background: #218838;
}

.sin-observaciones {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.85rem;
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.info-icon {
  font-size: 1rem;
}

/* Acciones del sílabo */
.silabo-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-left: 1.5rem;
  min-width: 120px;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
}

.btn-action:hover {
  transform: translateY(-2px);
}

.action-icon {
  font-size: 1.2rem;
}

.action-text {
  font-size: 0.9rem;
}

.action-badge {
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

.btn-editar {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-editar:hover {
  background: #bbdefb;
}

.btn-exportar {
  background: #f3e5f5;
  color: #7b1fa2;
}

.btn-exportar:hover {
  background: #e1bee7;
}

.btn-observaciones {
  background: #fff3cd;
  color: #856404;
}

.btn-observaciones:hover {
  background: #ffeaa7;
}

.btn-observaciones.urgente {
  background: #f8d7da;
  color: #721c24;
}

.btn-observaciones.urgente:hover {
  background: #f5c6cb;
}

.btn-eliminar {
  background: #ffebee;
  color: #d32f2f;
}

.btn-eliminar:hover {
  background: #ffcdd2;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
}

.btn-pagination {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-pagination:hover:not(:disabled) {
  background: #5a6268;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #495057;
  font-weight: 600;
}

/* Modal de observaciones */
.modal-observaciones {
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-subtitle {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
  color: #6c757d;
}

.modal-codigo {
  background: #e9ecef;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
}

.no-observaciones-modal {
  text-align: center;
  padding: 3rem;
}

.no-obs-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-observaciones-modal h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.no-observaciones-modal p {
  color: #6c757d;
}

.observaciones-modal-list {
  overflow-y: auto;
  max-height: 50vh;
  padding-right: 0.5rem;
}

.observacion-modal-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s;
}

.observacion-modal-item.no-leida {
  border-left: 4px solid #e74c3c;
  background: #fff5f5;
}

.obs-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.obs-modal-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.obs-modal-date {
  color: #6c757d;
  font-size: 0.85rem;
}

.obs-modal-author {
  color: #495057;
  font-weight: 500;
  font-size: 0.9rem;
}

.obs-modal-status {
  display: flex;
  gap: 0.5rem;
}

.obs-status-new {
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.obs-status-read {
  background: #28a745;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.obs-modal-content {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.obs-modal-actions {
  text-align: right;
}

.btn-marcar-leida-modal {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-marcar-leida-modal:hover {
  background: #218838;
}

/* Modal de confirmación */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 2rem;
}

.modal-body p {
  margin-bottom: 1rem;
  color: #495057;
}

.modal-warning {
  color: #dc3545;
  font-weight: 600;
}

.modal-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fff3cd;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  color: #856404;
}

.alert-icon {
  font-size: 1.2rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-danger:hover {
  background: #c82333;
}

/* Responsive */
@media (max-width: 1024px) {
  .silabo-card {
    flex-direction: column;
    gap: 1.5rem;
  }

  .silabo-actions {
    margin-left: 0;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    width: 100%;
  }

  .btn-action {
    flex: 1;
    min-width: 140px;
  }
}

@media (max-width: 768px) {
  .mis-silabos-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .btn-volver {
    align-self: flex-start;
  }

  .filter-options {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: 100%;
  }

  .list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .list-info {
    width: 100%;
    justify-content: space-between;
  }

  .silabo-header {
    flex-direction: column;
    align-items: stretch;
  }

  .silabo-status-section {
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
  }

  .silabo-details {
    grid-template-columns: 1fr;
  }

  .observaciones-actions {
    flex-direction: column;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
  }

  .silabo-actions {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  .modal-container {
    width: 95%;
    margin: 1rem;
  }
}
</style>
