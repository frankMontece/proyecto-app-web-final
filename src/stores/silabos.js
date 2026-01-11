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
    addSilabo,
    loadSilabosFromStorage,
    clearGeneralData
  }
})
