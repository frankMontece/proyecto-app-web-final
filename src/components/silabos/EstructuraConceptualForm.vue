<template>
  <div class="estructura-conceptual-container">
    <!-- Encabezado -->
    <div class="form-header">
      <h1>Estructura conceptual y desarrollo metodológico de la asignatura</h1>
      <p class="subtitle">Complete los datos de la estructura conceptual del sílabo</p>
    </div>

    <!-- Contenido del formulario -->
    <div class="form-content">
      <!-- Sección 1: Datos de la actividad -->
      <div class="form-section">
        <h2 class="section-title">Sección 1: Datos de la actividad</h2>

        <div class="form-row">
          <div class="label-col">
            <label for="activityName">Nombre de la actividad curricular:</label>
          </div>
          <div class="input-col">
            <input
              id="activityName"
              type="text"
              v-model="formData.activityName"
              class="form-input"
              placeholder="UNIDAD 1: Tecnologías y Estándares Front-End"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="label-col">
            <label for="learningResults">Resultados de aprendizaje de la actividad curricular:</label>
          </div>
          <div class="input-col">
            <textarea
              id="learningResults"
              v-model="formData.learningResults"
              class="form-textarea"
              rows="3"
              placeholder="Identifica y aplica los estándares para el desarrollo de aplicaciones web en el cliente."
            ></textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="label-col">
            <label for="startDate">Fecha planificada de inicio:</label>
          </div>
          <div class="input-col">
            <input
              id="startDate"
              type="date"
              v-model="formData.startDate"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="label-col">
            <label for="endDate">Fecha planificada de fin:</label>
          </div>
          <div class="input-col">
            <input
              id="endDate"
              type="date"
              v-model="formData.endDate"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="label-col">
            <label for="learningAchievements">Logros de aprendizaje:</label>
          </div>
          <div class="input-col">
            <textarea
              id="learningAchievements"
              v-model="formData.learningAchievements"
              class="form-textarea"
              rows="4"
              placeholder="Ingrese los logros de aprendizaje esperados..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Sección 2: Aprendizaje en contacto con el docente -->
      <div class="form-section">
        <h2 class="section-title">Sección 2: Aprendizaje en contacto con el docente</h2>

        <div class="form-row">
          <div class="label-col">
            <label for="numContents">Número de contenidos:</label>
          </div>
          <div class="input-col">
            <input
              id="numContents"
              type="number"
              v-model.number="contactLearning.numContents"
              min="0"
              max="20"
              class="form-input small-number"
              @input="generateContactTable"
            />
            <span class="input-hint">(Máximo: 20)</span>
          </div>
        </div>

        <!-- Tabla dinámica para Sección 2 -->
        <div v-if="contactLearning.numContents > 0" class="table-container">
          <table class="dynamic-table">
            <thead>
              <tr>
                <th>Contenidos</th>
                <th>Procesos didácticos y estrategias</th>
                <th>Recursos didácticos</th>
                <th>Escenarios de aprendizaje</th>
                <th>Horas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in contactLearning.tableData" :key="index">
                <td>
                  <input
                    type="text"
                    v-model="row.contenidos"
                    class="table-input"
                    placeholder="Ingrese contenido"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.procesos"
                    class="table-input"
                    placeholder="Procesos didácticos"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.recursos"
                    class="table-input"
                    placeholder="Recursos a utilizar"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.escenarios"
                    class="table-input"
                    placeholder="Escenario de aprendizaje"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    v-model.number="row.horas"
                    min="0"
                    class="table-input small-number"
                    @input="calculateContactHours"
                    placeholder="0"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="total-label">
                  <strong>Horas en contacto con el docente:</strong>
                </td>
                <td class="total-value">
                  <strong>{{ contactLearning.totalHours }}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div v-else class="empty-table-message">
          <p>Ingrese un número mayor a 0 para generar la tabla de contenidos.</p>
        </div>
      </div>

      <!-- Sección 3: Aprendizaje práctico-experimental -->
      <div class="form-section">
        <h2 class="section-title">Sección 3: Aprendizaje práctico – experimental</h2>

        <div class="form-row">
          <div class="label-col">
            <label for="numActivities">Número de actividades prácticas:</label>
          </div>
          <div class="input-col">
            <input
              id="numActivities"
              type="number"
              v-model.number="practicalLearning.numActivities"
              min="0"
              max="15"
              class="form-input small-number"
              @input="generatePracticalTable"
            />
            <span class="input-hint">(Máximo: 15)</span>
          </div>
        </div>

        <!-- Tabla dinámica para Sección 3 -->
        <div v-if="practicalLearning.numActivities > 0" class="table-container">
          <table class="dynamic-table">
            <thead>
              <tr>
                <th>Actividades prácticas</th>
                <th>Escenarios de aprendizaje</th>
                <th>Contacto con el docente (Sí / No)</th>
                <th>Horas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in practicalLearning.tableData" :key="index">
                <td>
                  <input
                    type="text"
                    v-model="row.actividad"
                    class="table-input"
                    placeholder="Descripción de la actividad"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    v-model="row.escenarios"
                    class="table-input"
                    placeholder="Escenario de la actividad"
                  />
                </td>
                <td>
                  <select v-model="row.contacto" class="table-select">
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    v-model.number="row.horas"
                    min="0"
                    class="table-input small-number"
                    @input="calculatePracticalHours"
                    placeholder="0"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="total-label">
                  <strong>Total de horas:</strong>
                </td>
                <td class="total-value">
                  <strong>{{ practicalLearning.totalHours }}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div v-else class="empty-table-message">
          <p>Ingrese un número mayor a 0 para generar la tabla de actividades prácticas.</p>
        </div>
      </div>

      <!-- Botones de navegación -->
      <div class="form-footer">
        <button @click="retroceder" class="btn btn-outline">
          Retroceder
        </button>
        <div class="form-actions-right">
          <button @click="guardarBorrador" class="btn btn-secondary">
            Guardar Borrador
          </button>
          <button @click="guardarYFinalizar" class="btn btn-primary">
            Guardar y Finalizar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import silaboStorage from '@/services/silaboStorage'

const router = useRouter()

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
  guardarBorrador()
  router.push('/professor/crear-silabo')
}

// Función para guardar borrador - ACTUALIZADA para usar el servicio
const guardarBorrador = () => {
  try {
    const datosBorrador = {
      formData: { ...formData },
      contactLearning: { ...contactLearning },
      practicalLearning: { ...practicalLearning }
    }

    const resultado = silaboStorage.guardarEstructuraConceptual(datosBorrador)

    if (resultado.success) {
      alert('✅ Borrador guardado correctamente')
      console.log('📁', resultado.message)
    } else {
      alert('❌ Error al guardar borrador: ' + resultado.message)
    }

    return resultado
  } catch (error) {
    console.error('Error en guardarBorrador:', error)
    alert('❌ Error inesperado al guardar borrador')
    return { success: false, message: error.message }
  }
}

// Función para guardar y finalizar - ACTUALIZADA para usar el servicio
const guardarYFinalizar = () => {
  try {
    const datosGenerales = silaboStorage.obtenerDatosGenerales()

    if (!datosGenerales || Object.keys(datosGenerales).length === 0) {
      alert('❌ No se encontraron datos generales del sílabo. Complete el formulario anterior primero.')
      return
    }

    const estructuraConceptual = {
      formData: { ...formData },
      contactLearning: { ...contactLearning },
      practicalLearning: { ...practicalLearning }
    }

    const resultado = silaboStorage.guardarSilaboCompleto(
      datosGenerales,
      estructuraConceptual,
      {
        profesor: 'profesor_actual',
        estado: 'completado'
      }
    )

    if (resultado.success) {
      alert(`✅ ¡Sílabo guardado exitosamente!\nID: ${resultado.silaboId}`)
      router.push('/professor/dashboard')
    } else {
      alert('❌ Error al guardar el sílabo: ' + resultado.message)
    }

    return resultado
  } catch (error) {
    console.error('Error en guardarYFinalizar:', error)
    alert('❌ Error inesperado al guardar el sílabo')
    return { success: false, message: error.message }
  }
}

// Cargar datos al montar el componente - ACTUALIZADA para usar el servicio
onMounted(() => {
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

      console.log('✅ Borrador cargado exitosamente desde servicio')
      calculateContactHours()
      calculatePracticalHours()
    } catch (error) {
      console.error('❌ Error al cargar borrador:', error)
    }
  } else {
    console.log('ℹ️ No se encontró borrador previo')
  }
})
</script>

<style scoped>
.estructura-conceptual-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.form-header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.form-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.form-content {
  max-width: 1400px;
  margin: 0 auto;
}

.form-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

/* Estructura de dos columnas para formulario */
.form-row {
  display: flex;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.label-col {
  flex: 0 0 350px;
  padding-right: 2rem;
  text-align: right;
  font-weight: 500;
  color: #2c3e50;
  padding-top: 0.5rem;
}

.input-col {
  flex: 1;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input.small-number {
  width: 120px;
}

.form-input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.input-hint {
  margin-left: 0.5rem;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Estilos para tablas dinámicas */
.table-container {
  margin-top: 1.5rem;
  overflow-x: auto;
}

.dynamic-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #dee2e6;
  font-size: 0.9rem;
}

.dynamic-table th {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}

.dynamic-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #dee2e6;
  border-right: 1px solid #dee2e6;
  vertical-align: top;
}

.dynamic-table td:last-child {
  border-right: none;
}

.dynamic-table tbody tr:hover {
  background-color: #f8f9fa;
}

.table-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.table-input.small-number {
  width: 80px;
}

.table-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  background: white;
}

.dynamic-table tfoot {
  background-color: #e9ecef;
}

.total-label {
  text-align: right;
  padding-right: 1rem;
  color: #2c3e50;
}

.total-value {
  font-size: 1.1rem;
  color: #27ae60;
  font-weight: bold;
  text-align: center;
}

.empty-table-message {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  border: 2px dashed #dee2e6;
  color: #6c757d;
  margin-top: 1rem;
}

/* Botones */
.form-footer {
  max-width: 1400px;
  margin: 3rem auto 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-actions-right {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
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
  background-color: #28a745;
  color: white;
}

.btn-primary:hover {
  background-color: #218838;
}

/* Responsive */
@media (max-width: 1024px) {
  .label-col {
    flex: 0 0 300px;
  }
}

@media (max-width: 768px) {
  .estructura-conceptual-container {
    padding: 1rem;
  }

  .form-row {
    flex-direction: column;
  }

  .label-col {
    flex: none;
    text-align: left;
    padding-right: 0;
    padding-bottom: 0.5rem;
  }

  .form-footer {
    flex-direction: column;
    gap: 1rem;
  }

  .form-actions-right {
    width: 100%;
    justify-content: space-between;
  }

  .btn {
    padding: 0.75rem 1.5rem;
  }

  .dynamic-table {
    font-size: 0.8rem;
  }

  .table-input, .table-select {
    font-size: 0.8rem;
    padding: 0.4rem;
  }
}
</style>
