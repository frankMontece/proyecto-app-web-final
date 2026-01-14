<template>
  <div class="estructura-conceptual-container">
    <!-- Encabezado simple -->
    <div class="form-header">
      <h1>Estructura Conceptual</h1>
      <p class="subtitle">{{ esModoEdicion ? 'Modificación del sílabo' : 'Complete los datos requeridos' }}</p>

      <!-- Indicador simple de edición -->
      <div v-if="esModoEdicion" class="edit-indicator">
        <span>Editando sílabo</span>
      </div>
    </div>

    <!-- Contenido del formulario -->
    <div class="form-content">
      <!-- Sección 1: Datos de la actividad -->
      <div class="form-section">
        <h2 class="section-title">1. Datos de la actividad</h2>

        <div class="form-row">
          <div class="label-col">
            <label>Nombre de la actividad curricular:</label>
          </div>
          <div class="input-col">
            <input
              type="text"
              v-model="formData.activityName"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="label-col">
            <label>Resultados de aprendizaje:</label>
          </div>
          <div class="input-col">
            <textarea
              v-model="formData.learningResults"
              class="form-textarea"
              rows="2"
            ></textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="label-col">
            <label>Fecha de inicio:</label>
          </div>
          <div class="input-col">
            <input
              type="date"
              v-model="formData.startDate"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="label-col">
            <label>Fecha de fin:</label>
          </div>
          <div class="input-col">
            <input
              type="date"
              v-model="formData.endDate"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="label-col">
            <label>Logros de aprendizaje:</label>
          </div>
          <div class="input-col">
            <textarea
              v-model="formData.learningAchievements"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Sección 2: Aprendizaje en contacto con el docente -->
      <div class="form-section">
        <h2 class="section-title">2. Aprendizaje en contacto con el docente</h2>

        <div class="form-row">
          <div class="label-col">
            <label>Número de contenidos:</label>
          </div>
          <div class="input-col">
            <input
              type="number"
              v-model.number="contactLearning.numContents"
              min="0"
              max="20"
              class="form-input small-input"
              @input="generateContactTable"
            />
          </div>
        </div>

        <!-- Tabla dinámica simplificada -->
        <div v-if="contactLearning.numContents > 0" class="table-container">
          <div class="table-responsive">
            <table class="simple-table">
              <thead>
                <tr>
                  <th>Contenidos</th>
                  <th>Procesos didácticos</th>
                  <th>Recursos</th>
                  <th>Escenarios</th>
                  <th>Horas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in contactLearning.tableData" :key="index">
                  <td><input type="text" v-model="row.contenidos" class="table-input" /></td>
                  <td><input type="text" v-model="row.procesos" class="table-input" /></td>
                  <td><input type="text" v-model="row.recursos" class="table-input" /></td>
                  <td><input type="text" v-model="row.escenarios" class="table-input" /></td>
                  <td><input type="number" v-model.number="row.horas" min="0" class="table-input hours-input" @input="calculateContactHours" /></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="total-label">Total horas contacto:</td>
                  <td class="total-value">{{ contactLearning.totalHours }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Sección 3: Aprendizaje práctico-experimental -->
      <div class="form-section">
        <h2 class="section-title">3. Aprendizaje práctico-experimental</h2>

        <div class="form-row">
          <div class="label-col">
            <label>Número de actividades:</label>
          </div>
          <div class="input-col">
            <input
              type="number"
              v-model.number="practicalLearning.numActivities"
              min="0"
              max="15"
              class="form-input small-input"
              @input="generatePracticalTable"
            />
          </div>
        </div>

        <!-- Tabla dinámica simplificada -->
        <div v-if="practicalLearning.numActivities > 0" class="table-container">
          <div class="table-responsive">
            <table class="simple-table">
              <thead>
                <tr>
                  <th>Actividades</th>
                  <th>Escenarios</th>
                  <th>Contacto docente</th>
                  <th>Horas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in practicalLearning.tableData" :key="index">
                  <td><input type="text" v-model="row.actividad" class="table-input" /></td>
                  <td><input type="text" v-model="row.escenarios" class="table-input" /></td>
                  <td>
                    <select v-model="row.contacto" class="table-select">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </td>
                  <td><input type="number" v-model.number="row.horas" min="0" class="table-input hours-input" @input="calculatePracticalHours" /></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="total-label">Total horas prácticas:</td>
                  <td class="total-value">{{ practicalLearning.totalHours }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Botones simplificados -->
      <div class="form-footer">
        <button @click="retroceder" class="btn btn-outline">
          {{ esModoEdicion ? 'Cancelar' : 'Atrás' }}
        </button>
        <div class="form-actions">
          <button @click="guardarBorrador" class="btn btn-secondary">
            Guardar
          </button>
          <button @click="guardarYFinalizar" class="btn btn-primary">
            {{ esModoEdicion ? 'Actualizar' : 'Finalizar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// El SCRIPT se mantiene EXACTAMENTE IGUAL - solo cambia el template y estilos
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import silaboStorage from '@/services/silaboStorage'

const router = useRouter()

// Variables para modo edición
const esModoEdicion = ref(false)
const nombreSilaboEdicion = ref('')
const silaboIdEdicion = ref(null)

// Datos principales del formulario (Sección 1)
const formData = reactive({
  activityName: 'UNIDAD 1: Tecnologías y Estándares Front-End',
  learningResults: 'Identifica y aplica los estándares para el desarrollo de aplicaciones web en el cliente.',
  startDate: '',
  endDate: '',
  learningAchievements: ''
})

// Datos para Sección 2: Aprendizaje en contacto con el docente
const contactLearning = reactive({
  numContents: 0,
  tableData: [],
  totalHours: 0
})

// Datos para Sección 3: Aprendizaje práctico-experimental
const practicalLearning = reactive({
  numActivities: 0,
  tableData: [],
  totalHours: 0
})

// Generar tabla dinámica para Sección 2
const generateContactTable = () => {
  const numRows = Math.min(contactLearning.numContents, 20)

  if (numRows < contactLearning.tableData.length) {
    contactLearning.tableData = contactLearning.tableData.slice(0, numRows)
  } else if (numRows > contactLearning.tableData.length) {
    const rowsToAdd = numRows - contactLearning.tableData.length
    for (let i = 0; i < rowsToAdd; i++) {
      contactLearning.tableData.push({
        contenidos: '',
        procesos: '',
        recursos: '',
        escenarios: '',
        horas: 0
      })
    }
  }

  calculateContactHours()
}

// Generar tabla dinámica para Sección 3
const generatePracticalTable = () => {
  const numRows = Math.min(practicalLearning.numActivities, 15)

  if (numRows < practicalLearning.tableData.length) {
    practicalLearning.tableData = practicalLearning.tableData.slice(0, numRows)
  } else if (numRows > practicalLearning.tableData.length) {
    const rowsToAdd = numRows - practicalLearning.tableData.length
    for (let i = 0; i < rowsToAdd; i++) {
      practicalLearning.tableData.push({
        actividad: '',
        escenarios: '',
        contacto: 'Sí',
        horas: 0
      })
    }
  }

  calculatePracticalHours()
}

// Calcular total de horas para Sección 2
const calculateContactHours = () => {
  contactLearning.totalHours = contactLearning.tableData.reduce((total, row) => {
    const horas = parseInt(row.horas) || 0
    return total + horas
  }, 0)
}

// Calcular total de horas para Sección 3
const calculatePracticalHours = () => {
  practicalLearning.totalHours = practicalLearning.tableData.reduce((total, row) => {
    const horas = parseInt(row.horas) || 0
    return total + horas
  }, 0)
}

// Función para retroceder al formulario anterior
const retroceder = () => {
  if (esModoEdicion.value) {
    if (confirm('¿Cancelar la edición? Los cambios no guardados se perderán.')) {
      localStorage.removeItem('silabo_editar_id')
      silaboStorage.eliminarDatosTemporales()
      router.push('/professor/dashboard')
    }
  } else {
    guardarBorrador()
    router.push('/professor/crear-silabo')
  }
}

// Función para guardar borrador
const guardarBorrador = () => {
  try {
    const datosBorrador = {
      formData: { ...formData },
      contactLearning: { ...contactLearning },
      practicalLearning: { ...practicalLearning }
    }

    const resultado = silaboStorage.guardarEstructuraConceptual(datosBorrador)

    if (resultado.success) {
      alert('Borrador guardado correctamente')
    } else {
      alert('Error al guardar borrador: ' + resultado.message)
    }

    return resultado
  } catch (error) {
    console.error('Error en guardarBorrador:', error)
    alert('Error inesperado al guardar borrador')
    return { success: false, message: error.message }
  }
}

// Función para guardar/actualizar el sílabo
const guardarYFinalizar = () => {
  try {
    const datosGenerales = silaboStorage.obtenerDatosGenerales()

    if (!datosGenerales || Object.keys(datosGenerales).length === 0) {
      alert('No se encontraron datos generales del sílabo. Complete el formulario anterior primero.')
      return
    }

    const estructuraConceptual = {
      formData: { ...formData },
      contactoDocente: { ...contactLearning },
      aprendizajePractico: { ...practicalLearning }
    }

    let resultado
    const silaboId = localStorage.getItem('silabo_editar_id')

    if (silaboId) {
      resultado = silaboStorage.actualizarSilaboCompleto(
        silaboId,
        datosGenerales,
        estructuraConceptual
      )

      if (resultado.success) {
        localStorage.removeItem('silabo_editar_id')
      }
    } else {
      resultado = silaboStorage.guardarSilaboCompleto(
        datosGenerales,
        estructuraConceptual,
        {
          profesor: 'profesor_actual',
          estado: 'completado'
        }
      )
    }

    if (resultado.success) {
      const mensaje = silaboId
        ? `Sílabo actualizado exitosamente`
        : `Sílabo guardado exitosamente`

      alert(mensaje)
      router.push('/professor/dashboard')
    } else {
      alert('Error: ' + resultado.message)
    }

    return resultado
  } catch (error) {
    console.error('Error en guardarYFinalizar:', error)
    alert('Error inesperado al guardar el sílabo')
    return { success: false, message: error.message }
  }
}

// Verificar modo edición y cargar datos
const verificarModoEdicion = () => {
  const silaboId = localStorage.getItem('silabo_editar_id')

  if (silaboId) {
    esModoEdicion.value = true
    silaboIdEdicion.value = silaboId

    const silabo = silaboStorage.obtenerSilaboPorId(silaboId)
    if (silabo) {
      nombreSilaboEdicion.value = silabo.datosGenerales?.nombreAsignatura || 'Sílabo sin nombre'
    }
  }
}

// Cargar datos al montar el componente
onMounted(() => {
  verificarModoEdicion()

  const borrador = silaboStorage.obtenerEstructuraConceptual()

  if (borrador) {
    try {
      if (borrador.formData) {
        Object.assign(formData, borrador.formData)
      }

      if (borrador.contactLearning) {
        contactLearning.numContents = borrador.contactLearning.numContents || 0
        contactLearning.tableData = borrador.contactLearning.tableData || []
        contactLearning.totalHours = borrador.contactLearning.totalHours || 0

        if (contactLearning.numContents > 0 && contactLearning.tableData.length === 0) {
          generateContactTable()
        }
      }

      if (borrador.practicalLearning) {
        practicalLearning.numActivities = borrador.practicalLearning.numActivities || 0
        practicalLearning.tableData = borrador.practicalLearning.tableData || []
        practicalLearning.totalHours = borrador.practicalLearning.totalHours || 0

        if (practicalLearning.numActivities > 0 && practicalLearning.tableData.length === 0) {
          generatePracticalTable()
        }
      }

      calculateContactHours()
      calculatePracticalHours()
    } catch (error) {
      console.error('Error al cargar borrador:', error)
    }
  }
})
</script>

<style scoped>
/* Estilos minimalistas y funcionales */
.estructura-conceptual-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 1rem;
}

.form-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.form-header h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.subtitle {
  color: #6c757d;
  font-size: 1rem;
}

.edit-indicator {
  display: inline-block;
  background: #fff3cd;
  color: #856404;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.form-content {
  max-width: 1200px;
  margin: 0 auto;
}

.form-section {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
}

/* Estructura de dos columnas simplificada */
.form-row {
  display: flex;
  margin-bottom: 1.25rem;
  align-items: center;
}

.label-col {
  flex: 0 0 200px;
  padding-right: 1rem;
  font-weight: 500;
  color: #495057;
  font-size: 0.95rem;
}

.input-col {
  flex: 1;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.15s ease-in-out;
  background: white;
}

.form-input.small-input {
  width: 100px;
}

.form-input:focus {
  border-color: #4dabf7;
  outline: none;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.form-textarea:focus {
  border-color: #4dabf7;
  outline: none;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

/* Tablas simplificadas */
.table-container {
  margin-top: 1rem;
}

.table-responsive {
  overflow-x: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.simple-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 0.9rem;
}

.simple-table th {
  background-color: #f8f9fa;
  color: #495057;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.simple-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #e9ecef;
  border-right: 1px solid #e9ecef;
}

.simple-table td:last-child {
  border-right: none;
}

.table-input {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 3px;
  font-size: 0.9rem;
  background: white;
}

.table-input.hours-input {
  width: 70px;
  text-align: center;
}

.table-select {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 3px;
  font-size: 0.9rem;
  background: white;
}

.simple-table tfoot {
  background-color: #f8f9fa;
  font-weight: 600;
}

.total-label {
  text-align: right;
  padding-right: 1rem;
  color: #495057;
}

.total-value {
  color: #198754;
  font-weight: 600;
  text-align: center;
}

/* Botones simplificados */
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  margin-top: 2rem;
  border-top: 1px solid #dee2e6;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}

/* Responsive */
@media (max-width: 768px) {
  .estructura-conceptual-container {
    padding: 1rem 0.75rem;
  }

  .form-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .label-col {
    flex: none;
    padding-right: 0;
    padding-bottom: 0.375rem;
    width: 100%;
  }

  .form-footer {
    flex-direction: column;
    gap: 1rem;
  }

  .form-actions {
    width: 100%;
    justify-content: space-between;
  }

  .btn {
    flex: 1;
    text-align: center;
  }

  .simple-table {
    font-size: 0.85rem;
  }

  .table-input, .table-select {
    font-size: 0.85rem;
    padding: 0.25rem 0.375rem;
  }

  .form-header h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .form-section {
    padding: 1rem;
  }

  .form-input.small-input {
    width: 80px;
  }

  .table-input.hours-input {
    width: 60px;
  }
}
</style>
