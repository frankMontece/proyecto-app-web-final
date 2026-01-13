<template>
  <div class="silabo-form-container">
    <div class="form-header">
      <!-- Mostrar título diferente si estamos editando -->
      <h1>{{ esModoEdicion ? 'Editar Sílabo' : 'Creación de Sílabo' }}</h1>
      <p class="subtitle">{{ esModoEdicion ? 'Modifique los datos generales del sílabo' : 'Complete los datos generales de la asignatura' }}</p>

      <!-- Indicador visual si estamos editando -->
      <div v-if="esModoEdicion" class="edit-mode-indicator">
        <span class="edit-badge">✏️ Modo Edición</span>
        <p class="edit-info">Editando: {{ nombreSilaboEdicion }}</p>
      </div>
    </div>

    <div class="form-content">
      <SilaboGeneralData />
    </div>

    <div class="form-footer">
      <button @click="volverDashboard" class="btn btn-outline">
        {{ esModoEdicion ? 'Cancelar' : 'Volver al Dashboard' }}
      </button>
      <div class="form-actions-right">
        <button @click="exportarJSON" class="btn btn-secondary">
          Exportar JSON
        </button>
        <button @click="siguienteFormulario" class="btn btn-primary">
          {{ esModoEdicion ? 'Continuar Edición' : 'Siguiente' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSilaboStore } from '@/stores/silabos'
import SilaboGeneralData from '@/components/silabos/SilaboGeneralData.vue'
import silaboStorage from '@/services/silaboStorage'

const router = useRouter()
const silaboStore = useSilaboStore()

// Variables para modo edición
const esModoEdicion = ref(false)
const nombreSilaboEdicion = ref('')
const silaboIdEdicion = ref(null)

// Cargar datos al montar el componente
onMounted(() => {
  // Cargar datos guardados previamente desde localStorage
  silaboStore.cargarDatosGenerales()

  // Verificar si estamos en modo edición
  verificarModoEdicion()
})

// Función para verificar si estamos editando
const verificarModoEdicion = () => {
  // Buscar ID del sílabo a editar
  const silaboId = localStorage.getItem('silabo_editar_id')

  if (silaboId) {
    esModoEdicion.value = true
    silaboIdEdicion.value = silaboId

    // Cargar información del sílabo para mostrar
    cargarInfoSilaboEdicion(silaboId)

    console.log(`✏️ Modo edición activado para sílabo: ${silaboId}`)
  } else {
    esModoEdicion.value = false
    console.log('📝 Modo creación activado')
  }
}

// Cargar información del sílabo que se está editando
const cargarInfoSilaboEdicion = (silaboId) => {
  try {
    const silabo = silaboStorage.obtenerSilaboPorId(silaboId)

    if (silabo && silabo.datosGenerales) {
      nombreSilaboEdicion.value = silabo.datosGenerales.nombreAsignatura || 'Sílabo sin nombre'

      // Mostrar mensaje en consola
      console.log(`📖 Editando sílabo: ${nombreSilaboEdicion.value}`)
    } else {
      nombreSilaboEdicion.value = 'Sílabo no encontrado'
      console.warn('⚠️ Sílabo no encontrado para edición:', silaboId)
    }
  } catch (error) {
    console.error('❌ Error al cargar información del sílabo:', error)
    nombreSilaboEdicion.value = 'Error al cargar'
  }
}

const volverDashboard = () => {
  if (esModoEdicion.value) {
    // Si estamos editando, preguntar si queremos cancelar
    if (confirm('¿Cancelar la edición? Los cambios no guardados se perderán.')) {
      // Limpiar el ID de edición
      localStorage.removeItem('silabo_editar_id')
      // Limpiar datos temporales
      silaboStorage.eliminarDatosTemporales()
      router.push('/professor/dashboard')
    }
  } else {
    router.push('/professor/dashboard')
  }
}

const exportarJSON = () => {
  const data = silaboStore.generalData
  if (!data || Object.keys(data).length === 0) {
    alert('No hay datos para exportar. Complete el formulario primero.')
    return
  }

  const jsonData = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `silabo_${data.codigoAsignatura || 'generico'}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const siguienteFormulario = () => {
  // Verificar que haya datos en el store antes de continuar
  const data = silaboStore.generalData

  if (!data || Object.keys(data).length === 0) {
    alert('Por favor, complete los datos generales del sílabo antes de continuar.')
    return
  }

  // Verificar campos requeridos básicos
  const camposRequeridos = ['nombreAsignatura', 'codigoAsignatura']
  const faltantes = camposRequeridos.filter(campo => !data[campo])

  if (faltantes.length > 0) {
    alert(`Por favor complete los siguientes campos requeridos: ${faltantes.join(', ')}`)
    return
  }

  // Guardar datos actuales antes de navegar
  silaboStore.guardarDatosGenerales()

  // Si estamos en modo edición, mantener el ID
  if (esModoEdicion.value && silaboIdEdicion.value) {
    console.log(`➡️ Continuando edición del sílabo: ${silaboIdEdicion.value}`)
  }

  // Navegar al formulario de estructura conceptual
  router.push({
    name: 'estructura-conceptual'
  })
}
</script>

<style scoped>
/* ESTILOS EXISTENTES (se mantienen igual) */
.silabo-form-container {
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
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

/* NUEVOS ESTILOS PARA MODO EDICIÓN */
.edit-mode-indicator {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
  display: inline-block;
}

.edit-badge {
  display: inline-block;
  background: #ffc107;
  color: #212529;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.edit-info {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
  font-style: italic;
}

/* ESTILOS EXISTENTES (se mantienen igual) */
.form-content {
  max-width: 1200px;
  margin: 0 auto;
}

.form-footer {
  max-width: 1200px;
  margin: 2rem auto 0;
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
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

/* Responsive */
@media (max-width: 768px) {
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

  .form-header h1 {
    font-size: 2rem;
  }
}
</style>
