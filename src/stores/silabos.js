import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

export const useSilaboStore = defineStore('silabo', () => {
  // Estado reactivo para los datos generales
  const generalData = reactive({
    unidadAcademica: '',
    carrera: '',
    unidadOrganizacionCurricular: '',
    periodoAcademico: '',
    paralelo: '',
    nivel: '',
    nombreAsignatura: '',
    codigoAsignatura: '',
    creditos: '',
    horasPresenciales: '',
    horasNoPresenciales: '',
    prerrequisitos: '',
    correquisitos: ''
  })

  // Estado para almacenar múltiples sílabos
  const silabos = ref([])

  // Getters
  const getGeneralData = computed(() => generalData)
  const getAllSilabos = computed(() => silabos.value)

  // Actions
  const setGeneralData = (data) => {
    Object.assign(generalData, data)
  }

  // NUEVO MÉTODO: Guardar datos generales en localStorage
  const guardarDatosGenerales = () => {
    try {
      localStorage.setItem('silabo_general', JSON.stringify(generalData))
      console.log('Datos generales guardados:', generalData)
      return { success: true, message: 'Datos guardados exitosamente' }
    } catch (error) {
      console.error('Error al guardar datos:', error)
      return { success: false, message: 'Error al guardar datos' }
    }
  }

  // NUEVO MÉTODO: Cargar datos generales desde localStorage
  const cargarDatosGenerales = () => {
    try {
      const stored = localStorage.getItem('silabo_general')
      if (stored) {
        const datos = JSON.parse(stored)
        Object.assign(generalData, datos)
        console.log('Datos generales cargados:', datos)
        return { success: true, message: 'Datos cargados exitosamente' }
      }
      return { success: false, message: 'No hay datos guardados' }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      return { success: false, message: 'Error al cargar datos' }
    }
  }

  const addSilabo = (silabo) => {
    silabos.value.push({
      ...silabo,
      id: Date.now(),
      fechaCreacion: new Date().toISOString()
    })
    // También guardar en localStorage
    localStorage.setItem('silabos', JSON.stringify(silabos.value))
  }

  const loadSilabosFromStorage = () => {
    const stored = localStorage.getItem('silabos')
    if (stored) {
      silabos.value = JSON.parse(stored)
    }
  }

  const clearGeneralData = () => {
    Object.keys(generalData).forEach(key => {
      if (key !== 'unidadAcademica' && key !== 'carrera' &&
          key !== 'unidadOrganizacionCurricular' && key !== 'periodoAcademico' &&
          key !== 'paralelo' && key !== 'nivel') {
        generalData[key] = ''
      }
    })
  }

  return {
    // State
    generalData,
    silabos,

    // Getters
    getGeneralData,
    getAllSilabos,

    // Actions
    setGeneralData,
    guardarDatosGenerales,  // NUEVO
    cargarDatosGenerales,   // NUEVO
    addSilabo,
    loadSilabosFromStorage,
    clearGeneralData
  }
})
