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
          <h3>{{ totalSilabos }}</h3>
          <p>Sílabos Totales</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <h3>{{ silabosRecientes }}</h3>
          <p>Creados este mes</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <h3>{{ ultimoSilaboFecha }}</h3>
          <p>Última actualización</p>
        </div>
      </div>
    </div>

    <!-- Lista de sílabos -->
    <div class="silabos-list-container">
      <div class="list-header">
        <h2>Lista de Sílabos</h2>
        <div class="list-actions">
          <button @click="crearNuevoSilabo" class="btn-nuevo">
            + Nuevo Sílabo
          </button>
          <div class="search-box">
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Buscar sílabos..."
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
        </div>
      </div>

      <!-- Mensaje si no hay sílabos -->
      <div v-if="silabosFiltrados.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>No hay sílabos creados</h3>
        <p>Crea tu primer sílabo para comenzar a gestionarlos aquí.</p>
        <button @click="crearNuevoSilabo" class="btn-primary">
          Crear mi primer sílabo
        </button>
      </div>

      <!-- Lista de sílabos -->
      <div v-else class="silabos-list">
        <div
          v-for="silabo in silabosFiltrados"
          :key="silabo.id"
          class="silabo-card"
        >
          <!-- Lado izquierdo: Información del sílabo -->
          <div class="silabo-info">
            <div class="silabo-header">
              <h3 class="silabo-title">
                {{ silabo.datosGenerales.nombreAsignatura || 'Sílabo sin nombre' }}
              </h3>
              <span class="silabo-status" :class="getStatusClass(silabo)">
                {{ getStatusText(silabo) }}
              </span>
            </div>

            <div class="silabo-details">
              <div class="detail-row">
                <span class="detail-label">Código:</span>
                <span class="detail-value">{{ silabo.datosGenerales.codigoAsignatura || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Unidad:</span>
                <span class="detail-value">{{ silabo.datosGenerales.unidadAcademica || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Período:</span>
                <span class="detail-value">{{ silabo.datosGenerales.periodoAcademico || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Creado:</span>
                <span class="detail-value">{{ formatDate(silabo.metadata.fechaCreacion) }}</span>
              </div>
            </div>

            <!-- Información adicional de estructura conceptual -->
            <div v-if="silabo.estructuraConceptual" class="silabo-extra">
              <div class="extra-tag">
                <span class="tag-icon">📅</span>
                <span>{{ silabo.estructuraConceptual.formData.activityName || 'Sin actividad' }}</span>
              </div>
              <div class="extra-tag">
                <span class="tag-icon">⏱️</span>
                <span>{{ calcularTotalHoras(silabo) }} horas totales</span>
              </div>
            </div>
          </div>

          <!-- Lado derecho: Botones de acción -->
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
              @click="confirmarEliminar(silabo)"
              class="btn-action btn-eliminar"
              title="Eliminar sílabo"
            >
              <span class="action-icon">🗑️</span>
              <span class="action-text">Eliminar</span>
            </button>

            <button
              @click="exportarSilabo(silabo.id)"
              class="btn-action btn-exportar"
              title="Exportar como JSON"
            >
              <span class="action-icon">📤</span>
              <span class="action-text">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Paginación (si hay muchos sílabos) -->
      <div v-if="silabosFiltrados.length > 10" class="pagination">
        <button @click="paginaAnterior" :disabled="paginaActual === 1" class="pagination-btn">
          ← Anterior
        </button>
        <span class="pagination-info">
          Página {{ paginaActual }} de {{ totalPaginas }}
        </span>
        <button @click="paginaSiguiente" :disabled="paginaActual === totalPaginas" class="pagination-btn">
          Siguiente →
        </button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import silaboStorage from '@/services/silaboStorage'

const router = useRouter()

// Estado reactivo
const silabos = ref([])
const searchTerm = ref('')
const paginaActual = ref(1)
const elementosPorPagina = 10
const showDeleteModal = ref(false)
const silaboAEliminar = ref(null)

// Cargar sílabos al montar el componente
onMounted(() => {
  cargarSilabos()
})

// Cargar todos los sílabos desde el almacenamiento
const cargarSilabos = () => {
  try {
    silabos.value = silaboStorage.obtenerTodosSilabos()
    console.log(`📚 ${silabos.value.length} sílabos cargados`)
  } catch (error) {
    console.error('❌ Error al cargar sílabos:', error)
    silabos.value = []
  }
}

// Filtrar sílabos según búsqueda
const silabosFiltrados = computed(() => {
  if (!searchTerm.value.trim()) {
    return silabos.value
  }

  const termino = searchTerm.value.toLowerCase()
  return silabos.value.filter(silabo => {
    const nombre = silabo.datosGenerales?.nombreAsignatura?.toLowerCase() || ''
    const codigo = silabo.datosGenerales?.codigoAsignatura?.toLowerCase() || ''
    const unidad = silabo.datosGenerales?.unidadAcademica?.toLowerCase() || ''

    return nombre.includes(termino) ||
           codigo.includes(termino) ||
           unidad.includes(termino)
  })
})

// Estadísticas
const totalSilabos = computed(() => silabos.value.length)

const silabosRecientes = computed(() => {
  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  return silabos.value.filter(silabo => {
    const fechaCreacion = new Date(silabo.metadata?.fechaCreacion)
    return fechaCreacion >= inicioMes
  }).length
})

const ultimoSilaboFecha = computed(() => {
  if (silabos.value.length === 0) return 'N/A'

  const ultimo = silabos.value.reduce((masReciente, silabo) => {
    const fechaActual = new Date(silabo.metadata?.fechaCreacion)
    const fechaReciente = new Date(masReciente.metadata?.fechaCreacion)
    return fechaActual > fechaReciente ? silabo : masReciente
  })

  return formatDate(ultimo.metadata?.fechaCreacion)
})

// Paginación
const totalPaginas = computed(() => {
  return Math.ceil(silabosFiltrados.value.length / elementosPorPagina)
})


const paginaAnterior = () => {
  if (paginaActual.value > 1) {
    paginaActual.value--
  }
}

const paginaSiguiente = () => {
  if (paginaActual.value < totalPaginas.value) {
    paginaActual.value++
  }
}

// Funciones de formato
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getStatusClass = (silabo) => {
  const estado = silabo.metadata?.estado || 'pendiente'
  return {
    'pendiente': 'status-pendiente',
    'completado': 'status-completado',
    'revision': 'status-revision',
    'aprobado': 'status-aprobado'
  }[estado] || 'status-pendiente'
}

const getStatusText = (silabo) => {
  const estado = silabo.metadata?.estado || 'pendiente'
  const textos = {
    'pendiente': 'Pendiente',
    'completado': 'Completado',
    'revision': 'En revisión',
    'aprobado': 'Aprobado'
  }
  return textos[estado] || 'Pendiente'
}

const calcularTotalHoras = (silabo) => {
  if (!silabo.estructuraConceptual) return 0

  const contacto = silabo.estructuraConceptual.contactoDocente?.totalHours || 0
  const practico = silabo.estructuraConceptual.aprendizajePractico?.totalHours || 0

  return contacto + practico
}

// Funciones de navegación
const volverDashboard = () => {
  router.push('/professor/dashboard')
}

const crearNuevoSilabo = () => {
  // Limpiar datos temporales antes de crear nuevo
  silaboStorage.eliminarDatosTemporales()
  router.push('/professor/crear-silabo')
}

// Funciones de acción
const editarSilabo = (silaboId) => {
  // Guardar el ID del sílabo a editar en localStorage temporal
  localStorage.setItem('silabo_editar_id', silaboId)

  // Cargar el sílabo a editar
  const silabo = silaboStorage.obtenerSilaboPorId(silaboId)

  if (silabo) {
    // Guardar datos en localStorage para que el formulario los cargue
    silaboStorage.guardarDatosGenerales(silabo.datosGenerales)

    if (silabo.estructuraConceptual) {
      const estructuraData = {
        formData: silabo.estructuraConceptual.formData || {},
        contactLearning: silabo.estructuraConceptual.contactoDocente || {},
        practicalLearning: silabo.estructuraConceptual.aprendizajePractico || {}
      }
      silaboStorage.guardarEstructuraConceptual(estructuraData)
    }

    // Navegar al formulario de edición
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
      // Recargar la lista
      cargarSilabos()
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
  align-items: center;
  margin-bottom: 2rem;
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
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content h3 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: #7f8c8d;
  font-size: 0.9rem;
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
}

.list-header h2 {
  font-size: 1.8rem;
  color: #2c3e50;
}

.list-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
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
}

.btn-nuevo:hover {
  background: #218838;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 2px solid #dee2e6;
  border-radius: 0.5rem;
  width: 300px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

/* Estado vacío */
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
}

.silabo-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.silabo-info {
  flex: 1;
}

.silabo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.silabo-title {
  font-size: 1.4rem;
  color: #2c3e50;
  margin: 0;
}

.silabo-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pendiente {
  background: #fff3cd;
  color: #856404;
}

.status-completado {
  background: #d4edda;
  color: #155724;
}

.status-revision {
  background: #cce5ff;
  color: #004085;
}

.status-aprobado {
  background: #d1ecf1;
  color: #0c5460;
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
  min-width: 80px;
}

.detail-value {
  color: #6c757d;
}

.silabo-extra {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.extra-tag {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-icon {
  font-size: 0.9rem;
}

/* Acciones del sílabo */
.silabo-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: 1.5rem;
}

.btn-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.btn-action:hover {
  transform: translateY(-2px);
}

.action-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.action-text {
  font-size: 0.8rem;
  font-weight: 600;
}

.btn-editar {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-editar:hover {
  background: #bbdefb;
}

.btn-eliminar {
  background: #ffebee;
  color: #d32f2f;
}

.btn-eliminar:hover {
  background: #ffcdd2;
}

.btn-exportar {
  background: #f3e5f5;
  color: #7b1fa2;
}

.btn-exportar:hover {
  background: #e1bee7;
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

.pagination-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #5a6268;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #495057;
  font-weight: 600;
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
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .search-input {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .mis-silabos-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .list-actions {
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }

  .search-input {
    width: 100%;
  }

  .silabo-details {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
