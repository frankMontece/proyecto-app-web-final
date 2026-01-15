<template>
  <div class="detalle-silabo-container">
    <!-- Encabezado con navegación -->
    <div class="page-header">
      <button @click="volverLista" class="btn-back">
        ← Volver a Revisar Sílabos
      </button>
      <h1>Revisión de Sílabo</h1>
      <div class="header-actions">
        <span class="status-badge" :class="getStatusClass()">
          {{ getStatusText() }}
        </span>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-if="cargando" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando sílabo...</p>
    </div>

    <div v-else-if="silabo" class="silabo-content">
      <!-- Información general -->
      <div class="info-section">
        <h2>
          <span class="section-icon">📋</span>
          Información General
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Asignatura:</label>
            <span class="info-value">{{ silabo.datosGenerales?.nombreAsignatura || 'No especificado' }}</span>
          </div>
          <div class="info-item">
            <label>Código:</label>
            <span class="info-value">{{ silabo.datosGenerales?.codigoAsignatura || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Profesor:</label>
            <span class="info-value">{{ silabo.metadata?.creadoPor || 'Profesor' }}</span>
          </div>
          <div class="info-item">
            <label>Ciclo:</label>
            <span class="info-value">{{ silabo.datosGenerales?.ciclo || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Créditos:</label>
            <span class="info-value">{{ silabo.datosGenerales?.creditos || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Fecha creación:</label>
            <span class="info-value">{{ formatDate(silabo.metadata?.fechaCreacion) }}</span>
          </div>
          <div class="info-item" v-if="silabo.metadata?.ultimaModificacion">
            <label>Última modificación:</label>
            <span class="info-value">{{ formatDate(silabo.metadata.ultimaModificacion) }}</span>
          </div>
          <div class="info-item" v-if="silabo.metadata?.fechaRevision">
            <label>Última revisión:</label>
            <span class="info-value">{{ formatDate(silabo.metadata.fechaRevision) }}</span>
          </div>
        </div>
      </div>

      <!-- Estructura conceptual -->
      <div class="estructura-section">
        <h2>
          <span class="section-icon">📊</span>
          Estructura Conceptual
        </h2>

        <!-- Datos de actividad -->
        <div class="sub-section" v-if="silabo.estructuraConceptual?.formData">
          <h3>Datos de la actividad</h3>
          <div class="content-box">
            <div class="data-row">
              <label>Nombre de la actividad:</label>
              <span>{{ silabo.estructuraConceptual.formData.activityName || 'No especificado' }}</span>
            </div>
            <div class="data-row">
              <label>Resultados de aprendizaje:</label>
              <span>{{ silabo.estructuraConceptual.formData.learningResults || 'No especificado' }}</span>
            </div>
            <div class="data-row">
              <label>Logros de aprendizaje:</label>
              <span>{{ silabo.estructuraConceptual.formData.learningAchievements || 'No especificado' }}</span>
            </div>
          </div>
        </div>

        <!-- Contacto con docente -->
        <div class="sub-section" v-if="silabo.estructuraConceptual?.contactoDocente">
          <h3>Aprendizaje en contacto con el docente</h3>
          <div class="content-box">
            <div class="data-row">
              <label>Total de horas:</label>
              <span class="highlight">{{ silabo.estructuraConceptual.contactoDocente.totalHours || 0 }} horas</span>
            </div>

            <div v-if="silabo.estructuraConceptual.contactoDocente.tableData?.length > 0" class="table-container">
              <h4>Distribución de contenidos:</h4>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Contenidos</th>
                      <th>Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in silabo.estructuraConceptual.contactoDocente.tableData" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ row.contenidos || 'Contenido sin especificar' }}</td>
                      <td class="text-center">{{ row.horas || 0 }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" class="total-label">Total horas:</td>
                      <td class="total-value">{{ silabo.estructuraConceptual.contactoDocente.totalHours || 0 }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div v-else class="empty-table">
              <p>No se han especificado contenidos para el contacto con el docente.</p>
            </div>
          </div>
        </div>

        <!-- Aprendizaje práctico -->
        <div class="sub-section" v-if="silabo.estructuraConceptual?.aprendizajePractico">
          <h3>Aprendizaje práctico-experimental</h3>
          <div class="content-box">
            <div class="data-row">
              <label>Total de horas:</label>
              <span class="highlight">{{ silabo.estructuraConceptual.aprendizajePractico.totalHours || 0 }} horas</span>
            </div>

            <div v-if="silabo.estructuraConceptual.aprendizajePractico.tableData?.length > 0" class="table-container">
              <h4>Actividades prácticas:</h4>
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Actividad</th>
                      <th>Contacto docente</th>
                      <th>Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in silabo.estructuraConceptual.aprendizajePractico.tableData" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ row.actividad || 'Actividad sin especificar' }}</td>
                      <td class="text-center">{{ row.contacto || 'No' }}</td>
                      <td class="text-center">{{ row.horas || 0 }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" class="total-label">Total horas:</td>
                      <td class="total-value">{{ silabo.estructuraConceptual.aprendizajePractico.totalHours || 0 }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div v-else class="empty-table">
              <p>No se han especificado actividades prácticas.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Observaciones existentes -->
      <div class="observaciones-section" v-if="observaciones.length > 0">
        <h2>
          <span class="section-icon">💬</span>
          Observaciones anteriores
          <span class="count-badge">{{ observaciones.length }}</span>
        </h2>
        <div class="observaciones-list">
          <div
            v-for="observacion in observacionesOrdenadas"
            :key="observacion.id"
            class="observacion-card"
            :class="{ 'no-leida': !observacion.leida && !observacion.visto }"
          >
            <div class="obs-header">
              <div class="obs-metadata">
                <span class="obs-date">{{ formatDate(observacion.fecha || observacion.fechaCreacion) }}</span>
                <span class="obs-author">Por: {{ observacion.creadoPor || 'Decanato' }}</span>
              </div>
              <span class="obs-status" :class="{ 'leida': observacion.leida || observacion.visto }">
                {{ (observacion.leida || observacion.visto) ? 'Vista' : 'Nueva' }}
              </span>
            </div>
            <div class="obs-content">
              <p>{{ observacion.observacion }}</p>
            </div>
            <div class="obs-footer" v-if="observacion.leida || observacion.visto">
              <span class="obs-read-date">
                Visto: {{ formatDate(observacion.fechaLectura || observacion.fechaVisto) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de acciones del decanato -->
      <div class="acciones-section">
        <h2>
          <span class="section-icon">⚡</span>
          Acciones de revisión
        </h2>
        <div class="acciones-panel">
          <div class="acciones-buttons">
            <button
              @click="aprobarSilabo"
              class="btn-accion btn-aprobar"
              :disabled="cambiandoEstado || silabo.metadata?.estado === 'aprobado'"
            >
              <span class="btn-icon">✅</span>
              <span class="btn-text">
                {{ cambiandoEstado && accionActual === 'aprobar' ? 'Procesando...' : 'Aprobar Sílabo' }}
              </span>
            </button>

            <button
              @click="mostrarFormularioObservacion"
              class="btn-accion btn-observar"
              :disabled="cambiandoEstado"
            >
              <span class="btn-icon">💬</span>
              <span class="btn-text">
                {{ cambiandoEstado && accionActual === 'observar' ? 'Procesando...' : 'Enviar Observación' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <div class="error-icon">❌</div>
      <h3>Sílabo no encontrado</h3>
      <p>El sílabo que intentas revisar no existe o ha sido eliminado.</p>
      <button @click="volverLista" class="btn-error">
        Volver a la lista de sílabos
      </button>
    </div>

    <!-- Modal para observación -->
    <div v-if="mostrarModalObservacion" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Enviar observación</h3>
          <button @click="cerrarModal" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="observacion">
              <span class="label-icon">📝</span>
              Observación para el profesor:
            </label>
            <textarea
              id="observacion"
              v-model="nuevaObservacion"
              placeholder="Escriba aquí las observaciones que desea enviar al profesor..."
              rows="6"
              class="observacion-textarea"
              :disabled="enviandoObservacion"
            ></textarea>
            <div class="char-counter" :class="{ 'warning': nuevaObservacion.length > 490 }">
              {{ nuevaObservacion.length }}/500 caracteres
            </div>
          </div>

          <div class="form-tips">
            <p><strong>💡 Recomendaciones para observaciones:</strong></p>
            <ul>
              <li>Sea específico y claro en sus comentarios</li>
              <li>Mencione la sección que necesita corrección</li>
              <li>Proporcione sugerencias de mejora cuando sea posible</li>
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-cancel" :disabled="enviandoObservacion">
            Cancelar
          </button>
          <button
            @click="enviarObservacion"
            class="btn-confirm"
            :disabled="!nuevaObservacion.trim() || enviandoObservacion || nuevaObservacion.length > 500"
          >
            <span v-if="enviandoObservacion" class="spinner-small"></span>
            <span v-else>Enviar Observación</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import silaboStorage from '@/services/silaboStorage'

const route = useRoute()
const router = useRouter()

// Estado
const silabo = ref(null)
const cargando = ref(true)
const observaciones = ref([])
const cambiandoEstado = ref(false)
const accionActual = ref('')
const enviandoObservacion = ref(false)
const mostrarModalObservacion = ref(false)
const nuevaObservacion = ref('')

// Cargar datos al montar el componente
onMounted(() => {
  cargarSilabo()
})

// Observar cambios en el parámetro ID
watch(() => route.params.id, () => {
  cargarSilabo()
})

// Computed
const observacionesOrdenadas = computed(() => {
  return [...observaciones.value].sort((a, b) => {
    const fechaA = new Date(a.fecha || a.fechaCreacion)
    const fechaB = new Date(b.fecha || b.fechaCreacion)
    return fechaB - fechaA // Orden descendente (más reciente primero)
  })
})

// Funciones
const cargarSilabo = async () => {
  try {
    cargando.value = true
    const silaboId = route.params.id

    if (!silaboId) {
      throw new Error('No se proporcionó ID de sílabo')
    }

    // Cargar sílabo
    const silaboEncontrado = silaboStorage.obtenerSilaboPorId(silaboId)

    if (!silaboEncontrado) {
      throw new Error('Sílabo no encontrado')
    }

    silabo.value = silaboEncontrado

    // Cargar observaciones
    observaciones.value = silaboStorage.obtenerObservacionesPorSilabo(silaboId)

    // Verificar si hay parámetro para mostrar modal
    if (route.query.modal === 'observacion') {
      mostrarFormularioObservacion()
    }

  } catch (error) {
    console.error('Error al cargar sílabo:', error)
    alert('Error al cargar el sílabo: ' + error.message)
  } finally {
    cargando.value = false
  }
}

const volverLista = () => {
  router.push('/dean/revisar-silabos')
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

const getStatusClass = () => {
  const estado = silabo.value?.metadata?.estado || 'pendiente'
  const clases = {
    'pendiente': 'status-pending',
    'revision': 'status-review',
    'aprobado': 'status-approved',
    'observado': 'status-observed'
  }
  return clases[estado] || 'status-pending'
}

const getStatusText = () => {
  const estado = silabo.value?.metadata?.estado || 'pendiente'
  const textos = {
    'pendiente': 'Pendiente',
    'revision': 'En revisión',
    'aprobado': 'Aprobado',
    'observado': 'Observado'
  }
  return textos[estado] || 'Pendiente'
}

const aprobarSilabo = async () => {
  if (!silabo.value) return

  if (!confirm('¿Está seguro de aprobar este sílabo?\n\nUna vez aprobado, no podrá enviar nuevas observaciones.')) {
    return
  }

  cambiandoEstado.value = true
  accionActual.value = 'aprobar'

  try {
    const resultado = silaboStorage.cambiarEstadoSilabo(
      silabo.value.id,
      'aprobado',
      {
        revisadoPor: 'decanato',
        fechaAprobacion: new Date().toISOString()
      }
    )

    if (resultado.success) {
      alert('✅ Sílabo aprobado exitosamente')
      // Recargar datos
      await cargarSilabo()
    } else {
      alert(`❌ Error: ${resultado.message}`)
    }
  } catch (error) {
    console.error('Error al aprobar sílabo:', error)
    alert('Error al aprobar el sílabo')
  } finally {
    cambiandoEstado.value = false
    accionActual.value = ''
  }
}

const mostrarFormularioObservacion = () => {
  nuevaObservacion.value = ''
  mostrarModalObservacion.value = true
}

const cerrarModal = () => {
  if (!enviandoObservacion.value) {
    mostrarModalObservacion.value = false
    nuevaObservacion.value = ''
  }
}

const enviarObservacion = async () => {
  if (!silabo.value) return

  const observacionTexto = nuevaObservacion.value.trim()

  if (!observacionTexto) {
    alert('Por favor, escriba una observación')
    return
  }

  if (observacionTexto.length > 500) {
    alert('La observación no puede exceder los 500 caracteres')
    return
  }

  enviandoObservacion.value = true

  try {
    const resultado = silaboStorage.agregarObservacion(
      silabo.value.id,
      observacionTexto,
      {
        creadoPor: 'decanato',
        fechaCreacion: new Date().toISOString()
      }
    )

    if (resultado.success) {
      alert('📝 Observación enviada exitosamente')
      // Cerrar modal y recargar
      cerrarModal()
      await cargarSilabo()
    } else {
      alert(`❌ Error: ${resultado.message}`)
    }
  } catch (error) {
    console.error('Error al enviar observación:', error)
    alert('Error al enviar la observación')
  } finally {
    enviandoObservacion.value = false
  }
}
</script>

<style scoped>
.detalle-silabo-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Encabezado */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.btn-back {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-back:hover {
  background: #545b62;
}

.page-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
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

/* Estados de carga y error */
.loading-state {
  text-align: center;
  padding: 4rem;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #dc3545;
  margin-bottom: 1rem;
}

.btn-error {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-error:hover {
  background: #0056b3;
}

/* Secciones */
.info-section,
.estructura-section,
.observaciones-section,
.acciones-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.section-icon {
  font-size: 1.5rem;
}

/* Información general */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.info-value {
  color: #6c757d;
  font-size: 1rem;
}

/* Sub-secciones */
.sub-section {
  margin-bottom: 2rem;
}

.sub-section:last-child {
  margin-bottom: 0;
}

.sub-section h3 {
  color: #495057;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.content-box {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1.5rem;
  border-left: 4px solid #007bff;
}

.data-row {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
}

.data-row:last-child {
  margin-bottom: 0;
}

.data-row label {
  font-weight: 600;
  color: #495057;
  min-width: 200px;
}

.highlight {
  font-weight: 600;
  color: #007bff;
}

/* Tablas */
.table-container {
  margin-top: 1.5rem;
}

.table-container h4 {
  color: #6c757d;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th {
  background: #e9ecef;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border: 1px solid #dee2e6;
}

td {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  color: #6c757d;
}

.text-center {
  text-align: center;
}

tfoot tr {
  background: #f8f9fa;
}

.total-label {
  font-weight: 600;
  text-align: right;
}

.total-value {
  font-weight: 600;
  color: #28a745;
}

.empty-table {
  text-align: center;
  color: #6c757d;
  padding: 1rem;
  font-style: italic;
}

/* Observaciones */
.count-badge {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}

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

.obs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.obs-metadata {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.obs-date {
  font-size: 0.9rem;
  color: #6c757d;
}

.obs-author {
  font-size: 0.85rem;
  color: #495057;
  font-weight: 600;
}

.obs-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #6c757d;
  color: white;
}

.obs-status.leida {
  background: #28a745;
}

.obs-content {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.obs-footer {
  border-top: 1px solid #e9ecef;
  padding-top: 0.75rem;
}

.obs-read-date {
  font-size: 0.85rem;
  color: #6c757d;
}

/* Acciones */
.acciones-panel {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1.5rem;
}

.acciones-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-accion {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 200px;
  justify-content: center;
}

.btn-accion:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-aprobar {
  background: #28a745;
  color: white;
}

.btn-aprobar:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.btn-observar {
  background: #ffc107;
  color: #212529;
}

.btn-observar:hover:not(:disabled) {
  background: #e0a800;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.25rem;
}

/* Modal */
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

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
}

.btn-close:hover {
  color: #dc3545;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.observacion-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #ced4da;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.observacion-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}

.observacion-textarea:disabled {
  background: #e9ecef;
  cursor: not-allowed;
}

.char-counter {
  text-align: right;
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.char-counter.warning {
  color: #dc3545;
  font-weight: 600;
}

.form-tips {
  background: #e7f1ff;
  border-radius: 6px;
  padding: 1rem;
  border-left: 4px solid #007bff;
}

.form-tips ul {
  margin: 0.5rem 0 0 1.5rem;
  color: #495057;
}

.form-tips li {
  margin-bottom: 0.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 2px solid #e9ecef;
}

.btn-cancel,
.btn-confirm {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  background: #545b62;
}

.btn-confirm {
  background: #007bff;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #0056b3;
}

.btn-confirm:disabled {
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
  display: inline-block;
  margin-right: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .detalle-silabo-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .page-header h1 {
    text-align: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .acciones-buttons {
    flex-direction: column;
  }

  .btn-accion {
    min-width: 100%;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}

@media (max-width: 480px) {
  .sub-section h3 {
    font-size: 1.1rem;
  }

  .data-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .data-row label {
    min-width: auto;
  }

  .table-wrapper {
    font-size: 0.9rem;
  }

  th, td {
    padding: 0.5rem;
  }
}
</style>
