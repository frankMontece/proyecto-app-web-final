<template>
  <div class="silabo-general-data">
    <h2 class="section-title">Datos Generales de la Asignatura</h2>

    <div class="two-column-form">
      <!-- Columna Izquierda - Etiquetas -->
      <div class="label-column">
        <div class="form-label-item">Unidad Académica:</div>
        <div class="form-label-item">Carrera:</div>
        <div class="form-label-item">Unidad de Organización Curricular:</div>
        <div class="form-label-item">Período Académico:</div>
        <div class="form-label-item">Paralelo:</div>
        <div class="form-label-item">Nivel:</div>
        <div class="form-label-item">Nombre de la Asignatura:</div>
        <div class="form-label-item">Código de la Asignatura:</div>
        <div class="form-label-item">Número de Créditos:</div>
        <div class="form-label-item">Horas Presenciales:</div>
        <div class="form-label-item">Horas No Presenciales:</div>
        <div class="form-label-item">Prerrequisitos:</div>
        <div class="form-label-item">Correquisitos:</div>
      </div>

      <!-- Columna Derecha - Campos -->
      <div class="input-column">
        <FormSelect
          id="unidad-academica"
          :modelValue="formData.unidadAcademica"
          @update:modelValue="updateField('unidadAcademica', $event)"
          :options="unidadAcademicaOptions"
          placeholder="Seleccione unidad académica"
          :required="true"
          :error="errors.unidadAcademica"
        />

        <FormSelect
          id="carrera"
          :modelValue="formData.carrera"
          @update:modelValue="updateField('carrera', $event)"
          :options="carreraOptions"
          placeholder="Seleccione carrera"
          :required="true"
          :error="errors.carrera"
        />

        <FormSelect
          id="unidad-organizacion"
          :modelValue="formData.unidadOrganizacionCurricular"
          @update:modelValue="updateField('unidadOrganizacionCurricular', $event)"
          :options="unidadOrganizacionOptions"
          placeholder="Seleccione unidad curricular"
          :required="true"
          :error="errors.unidadOrganizacionCurricular"
        />

        <FormSelect
          id="periodo-academico"
          :modelValue="formData.periodoAcademico"
          @update:modelValue="updateField('periodoAcademico', $event)"
          :options="periodoAcademicoOptions"
          placeholder="Seleccione período"
          :required="true"
          :error="errors.periodoAcademico"
        />

        <FormInput
          id="paralelo"
          label=""
          type="text"
          :modelValue="formData.paralelo"
          @update:modelValue="updateField('paralelo', $event)"
          placeholder="Ej: A, B, C"
          :required="true"
          :error="errors.paralelo"
        />

        <FormSelect
          id="nivel"
          :modelValue="formData.nivel"
          @update:modelValue="updateField('nivel', $event)"
          :options="nivelOptions"
          placeholder="Seleccione nivel"
          :required="true"
          :error="errors.nivel"
        />

        <FormInput
          id="nombre-asignatura"
          label=""
          type="text"
          :modelValue="formData.nombreAsignatura"
          @update:modelValue="updateField('nombreAsignatura', $event)"
          placeholder="Nombre completo de la asignatura"
          :required="true"
          :error="errors.nombreAsignatura"
        />

        <FormInput
          id="codigo-asignatura"
          label=""
          type="text"
          :modelValue="formData.codigoAsignatura"
          @update:modelValue="updateField('codigoAsignatura', $event)"
          placeholder="Ej: TICS-501"
          :required="true"
          :error="errors.codigoAsignatura"
        />

        <FormInput
          id="creditos"
          label=""
          type="number"
          :modelValue="formData.creditos"
          @update:modelValue="updateField('creditos', $event)"
          placeholder="Número de créditos"
          :required="true"
          :error="errors.creditos"
          min="1"
          max="10"
        />

        <FormInput
          id="horas-presenciales"
          label=""
          type="number"
          :modelValue="formData.horasPresenciales"
          @update:modelValue="updateField('horasPresenciales', $event)"
          placeholder="Horas presenciales"
          :required="true"
          :error="errors.horasPresenciales"
          min="0"
        />

        <FormInput
          id="horas-no-presenciales"
          label=""
          type="number"
          :modelValue="formData.horasNoPresenciales"
          @update:modelValue="updateField('horasNoPresenciales', $event)"
          placeholder="Horas no presenciales"
          :required="true"
          :error="errors.horasNoPresenciales"
          min="0"
        />

        <FormInput
          id="prerrequisitos"
          label=""
          type="text"
          :modelValue="formData.prerrequisitos"
          @update:modelValue="updateField('prerrequisitos', $event)"
          placeholder="Códigos de asignaturas prerrequisito"
          :error="errors.prerrequisitos"
        />

        <FormInput
          id="correquisitos"
          label=""
          type="text"
          :modelValue="formData.correquisitos"
          @update:modelValue="updateField('correquisitos', $event)"
          placeholder="Códigos de asignaturas correquisito"
          :error="errors.correquisitos"
        />
      </div>
    </div>

    <div class="form-actions">
      <button @click="guardarDatos" class="btn btn-primary">
        Guardar Sección
      </button>
      <button @click="limpiarFormulario" class="btn btn-secondary">
        Limpiar
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useSilaboStore } from '@/stores/silabos'
import { validateGeneralData } from '@/utils/validators'
import FormInput from '@/components/ui/FormInput.vue'
import FormSelect from '@/components/ui/FormSelect.vue'

const silaboStore = useSilaboStore()

// Datos del formulario
const formData = reactive({
  unidadAcademica: 'Ciencias de la Vida y Tecnologías',
  carrera: 'Tecnologías de la Información 2024 - AS',
  unidadOrganizacionCurricular: 'Unidad Profesional',
  periodoAcademico: '2025-2 Período Ordinario',
  paralelo: 'A',
  nivel: '5',
  nombreAsignatura: '',
  codigoAsignatura: '',
  creditos: '',
  horasPresenciales: '',
  horasNoPresenciales: '',
  prerrequisitos: '',
  correquisitos: ''
})

// Errores de validación
const errors = reactive({})

// Opciones para los selects
const unidadAcademicaOptions = [
  { value: 'Ciencias de la Vida y Tecnologías', label: 'Ciencias de la Vida y Tecnologías' }
]

const carreraOptions = [
  { value: 'Tecnologías de la Información 2024 - AS', label: 'Tecnologías de la Información 2024 - AS' }
]

const unidadOrganizacionOptions = [
  { value: 'Unidad Profesional', label: 'Unidad Profesional' },
  { value: 'Unidad Básica', label: 'Unidad Básica' },
  { value: 'Unidad de Integración Curricular', label: 'Unidad de Integración Curricular' }
]

const periodoAcademicoOptions = [
  { value: '2025-2 Período Ordinario', label: '2025-2 Período Ordinario' },
  { value: '2025-1 Período Ordinario', label: '2025-1 Período Ordinario' },
  { value: '2024-2 Período Ordinario', label: '2024-2 Período Ordinario' }
]

const nivelOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: '10', label: '10' }
]

// Actualizar campo
const updateField = (field, value) => {
  formData[field] = value
  // Limpiar error al modificar
  if (errors[field]) {
    errors[field] = ''
  }
}

// Guardar datos
const guardarDatos = () => {
  const validation = validateGeneralData(formData)

  if (validation.isValid) {
    // Guardar en el store
    silaboStore.setGeneralData(formData)

    // Convertir a JSON y guardar en localStorage
    const jsonData = JSON.stringify(formData, null, 2)
    localStorage.setItem('silaboGeneralData', jsonData)

    alert('Datos guardados correctamente en formato JSON')
    console.log('JSON guardado:', jsonData)
  } else {
    // Mostrar errores
    Object.assign(errors, validation.errors)
  }
}

// Limpiar formulario
const limpiarFormulario = () => {
  Object.keys(formData).forEach(key => {
    if (key !== 'unidadAcademica' && key !== 'carrera' &&
        key !== 'unidadOrganizacionCurricular' && key !== 'periodoAcademico' &&
        key !== 'paralelo' && key !== 'nivel') {
      formData[key] = ''
    }
  })
  Object.keys(errors).forEach(key => errors[key] = '')
}
</script>

<style scoped>
.silabo-general-data {
  background: #fff;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
}

.two-column-form {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.label-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-label-item {
  padding: 0.75rem 0;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  min-height: 3rem;
  display: flex;
  align-items: center;
}

.input-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>
