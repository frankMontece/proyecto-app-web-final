import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './auth'
import {
  validateRequired,
  validateTextOnly,
  validateNumberOnly,
  validateAlphanumeric,
  validateCourseCode,
  validateCredits,
  validateAcademicHours,
  validateAcademicPeriod,
  validateEmail,        // ← AGREGAR ESTA LÍNEA
  //validatePhone         // ← AGREGAR ESTA LÍNEA (si la necesitas)
} from '@/utils/validators'

export const useSilabosStore = defineStore('silabos', () => {
  const authStore = useAuthStore()

  // ========== ESTADO ==========
  const silabosList = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Plantilla completa para nuevo sílabo
  const currentSilabo = ref({
    // === SECCIÓN 1: DATOS GENERALES ===
    unidadAcademica: 'CIENCIAS DE LA VIDA Y TECNOLOGÍAS',
    carrera: 'TECNOLOGÍAS DE LA INFORMACIÓN 2024 -AS',
    unidadOrganizacionCurricular: 'UNIDAD PROFESIONAL',
    periodoAcademico: '2025-2 PERIODO ORDINARIO',
    paralelo: 'A',
    nivel: '5',

    // === ORGANIZACIÓN DEL TIEMPO ===
    horasContactoDocente: 48,
    horasPracticaContacto: 48,
    horasPracticaSinContacto: 0,
    horasAutonomo: 48,
    totalHoras: 144,
    creditos: 3,

    // === DOCENTE ===
    docenteResponsable: 'QUIROZ PALMA PATRICIA ALEXANDRA',
    emailDocente: '',
    telefonoDocente: '',

    // === INFORMACIÓN DE LA ASIGNATURA ===
    codigoAsignatura: '',
    nombreAsignatura: '',
    areaConocimiento: '',
    tipoAsignatura: 'obligatoria', // obligatoria, electiva, optativa
    prerequisitos: '',
    correquisitos: '',

    // === METADATOS DEL SÍLABO ===
    fechaCreacion: new Date().toISOString().split('T')[0],
    fechaInicio: '',
    fechaFin: '',
    estado: 'borrador', // borrador, en_revision, aprobado, rechazado
    version: '1.0',

    // === SISTEMA DE OBSERVACIONES ===
    observaciones: [],

    // === HISTORIAL DE CAMBIOS ===
    historial: []
  })

  // ========== GETTERS (PROPIEDADES COMPUTADAS) ==========
  const totalSilabos = computed(() => silabosList.value.length)

  const silabosPorEstado = computed(() => {
    const conteo = {
      borrador: 0,
      en_revision: 0,
      aprobado: 0,
      rechazado: 0
    }
    silabosList.value.forEach(silabo => {
      conteo[silabo.estado] = (conteo[silabo.estado] || 0) + 1
    })
    return conteo
  })

  const silabosDelUsuario = computed(() => {
    if (!authStore.user) return []
    return silabosList.value.filter(
      silabo => silabo.docenteResponsable === authStore.user.name
    )
  })

  const silabosPendientesRevision = computed(() => {
    return silabosList.value.filter(s => s.estado === 'en_revision')
  })

  const ultimoSilaboCreado = computed(() => {
    if (silabosList.value.length === 0) return null
    return silabosList.value
      .slice()
      .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))[0]
  })

  // ========== VALIDACIONES COMPLETAS ==========

  const validarCampo = (campo, valor) => {
    switch (campo) {
      case 'unidadAcademica':
      case 'carrera':
      case 'unidadOrganizacionCurricular':
      case 'docenteResponsable':
      case 'nombreAsignatura':
      case 'areaConocimiento':
        return validateRequired(valor) && validateTextOnly(valor)

      case 'paralelo':
        return validateRequired(valor) && validateAlphanumeric(valor)

      case 'nivel':
        return validateRequired(valor) && validateNumberOnly(valor)

      case 'periodoAcademico':
        return validateRequired(valor) && validateAcademicPeriod(valor)

      case 'codigoAsignatura':
        return validateRequired(valor) && validateCourseCode(valor)

      case 'creditos':
        return validateRequired(valor) && validateCredits(valor)

      case 'horasContactoDocente':
      case 'horasPracticaContacto':
      case 'horasPracticaSinContacto':
      case 'horasAutonomo':
        return validateRequired(valor) && validateAcademicHours(valor)

      case 'emailDocente':
        return valor ? validateEmail(valor) : true

      case 'telefonoDocente':
        // Validación simple de teléfono
        return valor ? /^\d{7,15}$/.test(valor) || 'Teléfono inválido' : true

      default:
        return true
    }
  }

  const validarSilaboCompleto = (silaboData) => {
    const errores = []

    // Campos obligatorios
    const camposRequeridos = [
      'unidadAcademica', 'carrera', 'unidadOrganizacionCurricular',
      'periodoAcademico', 'paralelo', 'nivel', 'codigoAsignatura',
      'nombreAsignatura', 'docenteResponsable'
    ]

    camposRequeridos.forEach(campo => {
      const resultado = validarCampo(campo, silaboData[campo])
      if (resultado !== true) {
        errores.push(`${campo}: ${resultado}`)
      }
    })

    // Validar cálculos de horas
    const horasContacto = Number(silaboData.horasContactoDocente) || 0
    const horasPracticaCon = Number(silaboData.horasPracticaContacto) || 0
    const horasPracticaSin = Number(silaboData.horasPracticaSinContacto) || 0
    const horasAutonomo = Number(silaboData.horasAutonomo) || 0
    const totalCalculado = horasContacto + horasPracticaCon + horasPracticaSin + horasAutonomo

    if (totalCalculado <= 0) {
      errores.push('totalHoras: El total de horas debe ser mayor a 0')
    }

    return errores
  }

  // ========== MANEJO DE LOCALSTORAGE (JSON) ==========

  const STORAGE_KEY = 'sistema_silabos_v2'

  const guardarEnLocalStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: '2.0',
        fechaBackup: new Date().toISOString(),
        totalSilabos: silabosList.value.length,
        datos: silabosList.value
      }))
      return true
    } catch (e) {
      console.error('Error al guardar en localStorage:', e)
      error.value = 'Error al guardar datos localmente'
      return false
    }
  }

  const cargarDesdeLocalStorage = () => {
    try {
      const datosGuardados = localStorage.getItem(STORAGE_KEY)
      if (!datosGuardados) return []

      const parsed = JSON.parse(datosGuardados)

      // Migración de versiones si es necesario
      if (parsed.version === '1.0') {
        // Convertir de versión 1.0 a 2.0
        return migrarV1aV2(parsed.datos)
      }

      return parsed.datos || []
    } catch (e) {
      console.error('Error al cargar desde localStorage:', e)
      error.value = 'Error al cargar datos locales'
      return []
    }
  }

  // ========== ACCIONES PRINCIPALES ==========

  const crearSilabo = async (silaboData) => {
    isLoading.value = true
    error.value = null

    try {
      // 1. Validación completa
      const erroresValidacion = validarSilaboCompleto(silaboData)
      if (erroresValidacion.length > 0) {
        throw new Error(`Errores de validación:\n${erroresValidacion.join('\n')}`)
      }

      // 2. Calcular total de horas automáticamente
      const totalHoras =
        Number(silaboData.horasContactoDocente || 0) +
        Number(silaboData.horasPracticaContacto || 0) +
        Number(silaboData.horasPracticaSinContacto || 0) +
        Number(silaboData.horasAutonomo || 0)

      // 3. Crear sílabo con metadatos completos
      const nuevoSilabo = {
        id: generarIDUnico(),
        version: '2.0',
        ...currentSilabo.value,
        ...silaboData,
        totalHoras,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        creadoPor: authStore.user?.id || 'sistema',
        creadoPorNombre: authStore.user?.name || 'Usuario',
        estado: 'borrador',
        observaciones: [],
        historial: [{
          fecha: new Date().toISOString(),
          usuario: authStore.user?.name || 'Sistema',
          accion: 'creacion',
          detalles: 'Sílabo creado inicialmente'
        }]
      }

      // 4. Agregar a la lista
      silabosList.value.push(nuevoSilabo)

      // 5. Persistir en localStorage
      if (!guardarEnLocalStorage()) {
        throw new Error('No se pudo guardar el sílabo localmente')
      }

      // 6. Resetear formulario
      resetearCurrentSilabo()

      // 7. Retornar resultado
      return {
        success: true,
        data: nuevoSilabo,
        message: 'Sílabo creado exitosamente'
      }

    } catch (err) {
      error.value = err.message
      return {
        success: false,
        error: err.message,
        timestamp: new Date().toISOString()
      }
    } finally {
      isLoading.value = false
    }
  }

  const actualizarSilabo = async (id, datosActualizados) => {
    isLoading.value = true
    error.value = null

    try {
      const index = silabosList.value.findIndex(s => s.id === id)
      if (index === -1) {
        throw new Error(`Sílabo con ID ${id} no encontrado`)
      }

      // Validar datos actualizados
      const errores = validarSilaboCompleto({
        ...silabosList.value[index],
        ...datosActualizados
      })

      if (errores.length > 0) {
        throw new Error(`Errores de validación:\n${errores.join('\n')}`)
      }

      // Calcular nuevo total de horas si hay cambios
      let totalHoras = silabosList.value[index].totalHoras
      if (datosActualizados.horasContactoDocente !== undefined ||
          datosActualizados.horasPracticaContacto !== undefined ||
          datosActualizados.horasPracticaSinContacto !== undefined ||
          datosActualizados.horasAutonomo !== undefined) {

        totalHoras =
          Number(datosActualizados.horasContactoDocente || silabosList.value[index].horasContactoDocente) +
          Number(datosActualizados.horasPracticaContacto || silabosList.value[index].horasPracticaContacto) +
          Number(datosActualizados.horasPracticaSinContacto || silabosList.value[index].horasPracticaSinContacto) +
          Number(datosActualizados.horasAutonomo || silabosList.value[index].horasAutonomo)
      }

      // Crear entrada de historial
      const entradaHistorial = {
        fecha: new Date().toISOString(),
        usuario: authStore.user?.name || 'Sistema',
        accion: 'actualizacion',
        detalles: 'Sílabo actualizado',
        cambios: Object.keys(datosActualizados)
      }

      // Actualizar sílabo
      silabosList.value[index] = {
        ...silabosList.value[index],
        ...datosActualizados,
        totalHoras,
        fechaActualizacion: new Date().toISOString(),
        historial: [...silabosList.value[index].historial, entradaHistorial]
      }

      // Persistir cambios
      if (!guardarEnLocalStorage()) {
        throw new Error('No se pudieron guardar los cambios')
      }

      return {
        success: true,
        data: silabosList.value[index],
        message: 'Sílabo actualizado exitosamente'
      }

    } catch (err) {
      error.value = err.message
      return {
        success: false,
        error: err.message
      }
    } finally {
      isLoading.value = false
    }
  }

  const eliminarSilabo = async (id) => {
    if (!confirm('¿Está seguro de eliminar este sílabo? Esta acción no se puede deshacer.')) {
      return { success: false, message: 'Eliminación cancelada' }
    }

    isLoading.value = true

    try {
      const nuevaLista = silabosList.value.filter(s => s.id !== id)

      if (nuevaLista.length === silabosList.value.length) {
        throw new Error(`Sílabo con ID ${id} no encontrado`)
      }

      silabosList.value = nuevaLista
      guardarEnLocalStorage()

      return {
        success: true,
        message: 'Sílabo eliminado exitosamente'
      }
    } catch (err) {
      error.value = err.message
      return {
        success: false,
        error: err.message
      }
    } finally {
      isLoading.value = false
    }
  }

  const cambiarEstadoSilabo = (id, nuevoEstado, motivo = '') => {
    const index = silabosList.value.findIndex(s => s.id === id)
    if (index === -1) return false

    const estadoAnterior = silabosList.value[index].estado
    silabosList.value[index].estado = nuevoEstado
    silabosList.value[index].fechaActualizacion = new Date().toISOString()

    // Agregar al historial
    silabosList.value[index].historial.push({
      fecha: new Date().toISOString(),
      usuario: authStore.user?.name || 'Sistema',
      accion: 'cambio_estado',
      detalles: `Estado cambiado de ${estadoAnterior} a ${nuevoEstado}`,
      motivo: motivo
    })

    guardarEnLocalStorage()
    return true
  }

  const agregarObservacion = (id, observacion) => {
    const index = silabosList.value.findIndex(s => s.id === id)
    if (index === -1) return false

    const nuevaObservacion = {
      id: `OBS-${Date.now()}`,
      fecha: new Date().toISOString(),
      autor: authStore.user?.name || 'Anónimo',
      rol: authStore.user?.role || 'sistema',
      mensaje: observacion,
      leido: false
    }

    silabosList.value[index].observaciones.push(nuevaObservacion)

    // Si es decanato agregando observación, cambiar estado a "en_revision"
    if (authStore.user?.role === 'decanato') {
      silabosList.value[index].estado = 'en_revision'
    }

    guardarEnLocalStorage()
    return nuevaObservacion
  }

  // ========== FUNCIONALIDADES AVANZADAS ==========

  const exportarSilabosJSON = () => {
    try {
      const datosExportar = {
        version: '2.0',
        fechaExportacion: new Date().toISOString(),
        totalSilabos: silabosList.value.length,
        generadoPor: authStore.user?.name || 'Sistema',
        datos: silabosList.value
      }

      const jsonString = JSON.stringify(datosExportar, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      return {
        success: true,
        url,
        filename: `silabos_export_${new Date().toISOString().split('T')[0]}.json`
      }
    } catch (err) {
      return {
        success: false,
        error: err.message
      }
    }
  }

  const exportarSilaboXML = (id) => {
    const silabo = obtenerSilabo(id)
    if (!silabo) return { success: false, error: 'Sílabo no encontrado' }

    try {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
      xml += '<silabo>\n'

      // Convertir objeto a XML
      Object.entries(silabo).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          xml += `  <${key}>\n`
          value.forEach(item => {
            xml += `    <item>${escapeXML(JSON.stringify(item))}</item>\n`
          })
          xml += `  </${key}>\n`
        } else {
          xml += `  <${key}>${escapeXML(value.toString())}</${key}>\n`
        }
      })

      xml += '</silabo>'

      const blob = new Blob([xml], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)

      return {
        success: true,
        url,
        filename: `silabo_${silabo.codigoAsignatura}_${new Date().toISOString().split('T')[0]}.xml`
      }
    } catch (err) {
      return {
        success: false,
        error: err.message
      }
    }
  }

  const importarSilabosJSON = (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData)

      // Validar estructura
      if (!parsed.datos || !Array.isArray(parsed.datos)) {
        throw new Error('Formato JSON inválido')
      }

      // Validar cada sílabo
      parsed.datos.forEach(silabo => {
        const errores = validarSilaboCompleto(silabo)
        if (errores.length > 0) {
          throw new Error(`Sílabo inválido: ${errores.join(', ')}`)
        }
      })

      // Fusionar con datos existentes (evitar duplicados)
      parsed.datos.forEach(nuevoSilabo => {
        const existe = silabosList.value.some(s => s.id === nuevoSilabo.id)
        if (!existe) {
          silabosList.value.push(nuevoSilabo)
        }
      })

      guardarEnLocalStorage()

      return {
        success: true,
        importados: parsed.datos.length,
        total: silabosList.value.length,
        message: 'Sílabos importados exitosamente'
      }
    } catch (err) {
      return {
        success: false,
        error: err.message
      }
    }
  }

  // ========== FUNCIONES DE UTILIDAD ==========

  const generarIDUnico = () => {
    return `SIL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const escapeXML = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  const migrarV1aV2 = (datosV1) => {
    return datosV1.map(silabo => ({
      ...silabo,
      version: '2.0',
      observaciones: silabo.observaciones || [],
      historial: silabo.historial || []
    }))
  }

  const obtenerSilabo = (id) => {
    return silabosList.value.find(s => s.id === id)
  }

  const buscarSilabos = (criterios) => {
    return silabosList.value.filter(silabo => {
      return Object.entries(criterios).every(([key, value]) => {
        if (!value) return true
        const silaboValue = silabo[key]
        if (typeof silaboValue === 'string') {
          return silaboValue.toLowerCase().includes(value.toLowerCase())
        }
        return silaboValue == value
      })
    })
  }

  const resetearCurrentSilabo = () => {
    currentSilabo.value = {
      unidadAcademica: 'CIENCIAS DE LA VIDA Y TECNOLOGÍAS',
      carrera: 'TECNOLOGÍAS DE LA INFORMACIÓN 2024 -AS',
      unidadOrganizacionCurricular: 'UNIDAD PROFESIONAL',
      periodoAcademico: '2025-2 PERIODO ORDINARIO',
      paralelo: 'A',
      nivel: '5',
      horasContactoDocente: 48,
      horasPracticaContacto: 48,
      horasPracticaSinContacto: 0,
      horasAutonomo: 48,
      totalHoras: 144,
      creditos: 3,
      docenteResponsable: 'QUIROZ PALMA PATRICIA ALEXANDRA',
      emailDocente: '',
      telefonoDocente: '',
      codigoAsignatura: '',
      nombreAsignatura: '',
      areaConocimiento: '',
      tipoAsignatura: 'obligatoria',
      prerequisitos: '',
      correquisitos: '',
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaInicio: '',
      fechaFin: '',
      estado: 'borrador',
      version: '1.0',
      observaciones: [],
      historial: []
    }
  }

  // ========== INICIALIZACIÓN ==========

  const inicializar = () => {
    silabosList.value = cargarDesdeLocalStorage()
    console.log(`Cargados ${silabosList.value.length} sílabos desde localStorage`)
  }

  // Inicializar automáticamente
  inicializar()

  // ========== WATCHERS (OBSERVADORES) ==========

  // Auto-guardar cuando cambia la lista de sílabos
  watch(silabosList, () => {
    guardarEnLocalStorage()
  }, { deep: true })

  // ========== EXPORTACIÓN ==========

  return {
    // Estado
    silabosList,
    currentSilabo,
    isLoading,
    error,

    // Getters
    totalSilabos,
    silabosPorEstado,
    silabosDelUsuario,
    silabosPendientesRevision,
    ultimoSilaboCreado,

    // Acciones principales
    crearSilabo,
    actualizarSilabo,
    eliminarSilabo,
    obtenerSilabo,
    cambiarEstadoSilabo,
    agregarObservacion,

    // Validaciones
    validarCampo,
    validarSilaboCompleto,

    // Búsquedas
    buscarSilabos,

    // Exportación/Importación
    exportarSilabosJSON,
    exportarSilaboXML,
    importarSilabosJSON,

    // Utilidades
    resetearCurrentSilabo,
    inicializar
  }
})
