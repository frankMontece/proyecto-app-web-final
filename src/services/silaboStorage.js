// Servicio para manejar el almacenamiento de sílabos
// Este servicio centraliza todas las operaciones de localStorage

// Claves para localStorage
const STORAGE_KEYS = {
  // Datos del formulario general
  SILABO_GENERAL: 'silabo_general',

  // Borrador del formulario de estructura conceptual
  ESTRUCTURA_CONCEPTUAL_BORRADOR: 'estructura_conceptual_borrador',

  // Lista de sílabos completos
  SILABOS_COMPLETOS: 'silabos_completos',

  // Lista de sílabos en revisión (para decanato)
  SILABOS_REVISION: 'silabos_revision',

  // Observaciones de decanato
  OBSERVACIONES: 'observaciones_silabos',

  // Clave adicional para compatibilidad
  OBSERVACIONES_PROFESOR: 'observaciones_profesor'
}

// ==============================================
// FUNCIONES PARA DATOS GENERALES (Formulario 1)
// ==============================================

/**
 * Guarda los datos generales del sílabo
 * @param {Object} datos - Datos del formulario general
 * @returns {Object} Resultado de la operación
 */
export function guardarDatosGenerales(datos) {
  try {
    localStorage.setItem(STORAGE_KEYS.SILABO_GENERAL, JSON.stringify(datos))
    console.log('📁 Datos generales guardados:', datos)
    return {
      success: true,
      message: 'Datos generales guardados exitosamente',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ Error al guardar datos generales:', error)
    return {
      success: false,
      message: 'Error al guardar datos generales',
      error: error.message
    }
  }
}

/**
 * Obtiene los datos generales del sílabo
 * @returns {Object|null} Datos guardados o null si no existen
 */
export function obtenerDatosGenerales() {
  try {
    const datos = localStorage.getItem(STORAGE_KEYS.SILABO_GENERAL)
    if (datos) {
      const parsed = JSON.parse(datos)
      console.log('📁 Datos generales obtenidos:', parsed)
      return parsed
    }
    return null
  } catch (error) {
    console.error('❌ Error al obtener datos generales:', error)
    return null
  }
}

// ==============================================
// FUNCIONES PARA ESTRUCTURA CONCEPTUAL (Formulario 2)
// ==============================================

/**
 * Guarda el borrador de la estructura conceptual
 * @param {Object} datos - Datos del formulario de estructura conceptual
 * @returns {Object} Resultado de la operación
 */
export function guardarEstructuraConceptual(datos) {
  try {
    const borrador = {
      ...datos,
      savedAt: new Date().toISOString(),
      version: '1.0'
    }

    localStorage.setItem(STORAGE_KEYS.ESTRUCTURA_CONCEPTUAL_BORRADOR, JSON.stringify(borrador))
    console.log('📁 Borrador de estructura conceptual guardado:', borrador)
    return {
      success: true,
      message: 'Borrador guardado exitosamente',
      timestamp: borrador.savedAt
    }
  } catch (error) {
    console.error('❌ Error al guardar borrador:', error)
    return {
      success: false,
      message: 'Error al guardar borrador',
      error: error.message
    }
  }
}

/**
 * Obtiene el borrador de la estructura conceptual
 * @returns {Object|null} Borrador guardado o null si no existe
 */
export function obtenerEstructuraConceptual() {
  try {
    const borrador = localStorage.getItem(STORAGE_KEYS.ESTRUCTURA_CONCEPTUAL_BORRADOR)
    if (borrador) {
      const parsed = JSON.parse(borrador)
      console.log('📁 Borrador de estructura conceptual obtenido:', parsed)
      return parsed
    }
    return null
  } catch (error) {
    console.error('❌ Error al obtener borrador:', error)
    return null
  }
}

/**
 * Elimina el borrador de estructura conceptual
 * @returns {Object} Resultado de la operación
 */
export function eliminarBorradorEstructura() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ESTRUCTURA_CONCEPTUAL_BORRADOR)
    console.log('🗑️ Borrador de estructura conceptual eliminado')
    return {
      success: true,
      message: 'Borrador eliminado exitosamente'
    }
  } catch (error) {
    console.error('❌ Error al eliminar borrador:', error)
    return {
      success: false,
      message: 'Error al eliminar borrador',
      error: error.message
    }
  }
}

// ==============================================
// FUNCIONES PARA SÍLABOS COMPLETOS
// ==============================================

/**
 * Guarda un sílabo completo (combinando ambos formularios)
 * @param {Object} datosGenerales - Datos del formulario general
 * @param {Object} estructuraConceptual - Datos del formulario de estructura
 * @param {Object} metadata - Metadatos adicionales (profesor, estado, etc.)
 * @returns {Object} Resultado con ID del sílabo guardado
 */
export function guardarSilaboCompleto(datosGenerales, estructuraConceptual, metadata = {}) {
  try {
    // Validar datos requeridos
    if (!datosGenerales || !estructuraConceptual) {
      throw new Error('Datos incompletos para guardar sílabo')
    }

    // Generar ID único para el sílabo
    const silaboId = `silabo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Crear objeto completo del sílabo
    const silaboCompleto = {
      id: silaboId,
      datosGenerales: { ...datosGenerales },
      estructuraConceptual: { ...estructuraConceptual },
      metadata: {
        estado: metadata.estado || 'pendiente', // Cambiado a 'pendiente' por defecto para revisión
        fechaCreacion: new Date().toISOString(),
        creadoPor: metadata.profesor || 'profesor_anonimo',
        profesorId: metadata.profesorId || obtenerProfesorActual() || 'unknown',
        ultimaModificacion: new Date().toISOString(),
        ...metadata
      }
    }

    // Obtener lista existente de sílabos
    const silabosExistentes = obtenerTodosSilabos()

    // Agregar nuevo sílabo
    silabosExistentes.push(silaboCompleto)

    // Guardar lista actualizada
    localStorage.setItem(STORAGE_KEYS.SILABOS_COMPLETOS, JSON.stringify(silabosExistentes))

    // Limpiar datos temporales
    eliminarDatosTemporales()

    console.log('✅ Sílabo completo guardado:', silaboCompleto)

    return {
      success: true,
      message: 'Sílabo guardado exitosamente',
      silaboId: silaboId,
      timestamp: silaboCompleto.metadata.fechaCreacion
    }
  } catch (error) {
    console.error('❌ Error al guardar sílabo completo:', error)
    return {
      success: false,
      message: 'Error al guardar sílabo completo',
      error: error.message
    }
  }
}

/**
 * Actualiza un sílabo existente manteniendo su ID (PARA EDICIÓN)
 * @param {string} silaboId - ID del sílabo a actualizar
 * @param {Object} datosGenerales - Nuevos datos generales
 * @param {Object} estructuraConceptual - Nueva estructura conceptual
 * @returns {Object} Resultado de la operación
 */
export function actualizarSilaboCompleto(silaboId, datosGenerales, estructuraConceptual) {
  try {
    // Validar datos
    if (!datosGenerales || !estructuraConceptual) {
      throw new Error('Datos incompletos para actualizar sílabo')
    }

    // Obtener lista de sílabos
    const todosSilabos = obtenerTodosSilabos()
    const indice = todosSilabos.findIndex(s => s.id === silaboId)

    if (indice === -1) {
      return {
        success: false,
        message: 'Sílabo no encontrado para actualizar'
      }
    }

    // Crear sílabo actualizado
    const silaboActualizado = {
      id: silaboId, // Mantener el mismo ID
      datosGenerales: { ...datosGenerales },
      estructuraConceptual: { ...estructuraConceptual },
      metadata: {
        ...todosSilabos[indice].metadata,
        estado: 'pendiente', // Al editar, vuelve a estado pendiente para revisión
        ultimaModificacion: new Date().toISOString()
      }
    }

    // Reemplazar el sílabo antiguo
    todosSilabos[indice] = silaboActualizado

    // Guardar lista actualizada
    localStorage.setItem(STORAGE_KEYS.SILABOS_COMPLETOS, JSON.stringify(todosSilabos))

    // Limpiar datos temporales
    eliminarDatosTemporales()

    console.log('✏️ Sílabo actualizado exitosamente:', silaboId)

    return {
      success: true,
      message: 'Sílabo actualizado exitosamente',
      silaboId: silaboId,
      timestamp: silaboActualizado.metadata.ultimaModificacion
    }
  } catch (error) {
    console.error('❌ Error al actualizar sílabo completo:', error)
    return {
      success: false,
      message: 'Error al actualizar sílabo',
      error: error.message
    }
  }
}

/**
 * Obtiene todos los sílabos completos guardados
 * @returns {Array} Lista de sílabos completos
 */
export function obtenerTodosSilabos() {
  try {
    const silabos = localStorage.getItem(STORAGE_KEYS.SILABOS_COMPLETOS)
    if (silabos) {
      const parsed = JSON.parse(silabos)
      console.log(`📚 Obtenidos ${parsed.length} sílabos completos`)
      return parsed
    }
    return []
  } catch (error) {
    console.error('❌ Error al obtener sílabos completos:', error)
    return []
  }
}

/**
 * Obtiene un sílabo específico por ID
 * @param {string} silaboId - ID del sílabo a obtener
 * @returns {Object|null} Sílabo encontrado o null
 */
export function obtenerSilaboPorId(silaboId) {
  try {
    const todosSilabos = obtenerTodosSilabos()
    const silabo = todosSilabos.find(s => s.id === silaboId)

    if (silabo) {
      console.log('📖 Sílabo encontrado:', silaboId)
      return silabo
    }

    console.log('⚠️ Sílabo no encontrado:', silaboId)
    return null
  } catch (error) {
    console.error('❌ Error al obtener sílabo por ID:', error)
    return null
  }
}

/**
 * Actualiza un sílabo existente (versión mejorada)
 * @param {string} silaboId - ID del sílabo a actualizar
 * @param {Object} nuevosDatos - Nuevos datos para el sílabo
 * @param {boolean} mantenerMetadata - Si se debe mantener la metadata existente
 * @returns {Object} Resultado de la operación
 */
export function actualizarSilabo(silaboId, nuevosDatos, mantenerMetadata = true) {
  try {
    const todosSilabos = obtenerTodosSilabos()
    const indice = todosSilabos.findIndex(s => s.id === silaboId)

    if (indice === -1) {
      return {
        success: false,
        message: 'Sílabo no encontrado'
      }
    }

    // Actualizar sílabo
    const silaboActual = todosSilabos[indice]
    todosSilabos[indice] = {
      ...silaboActual,
      ...nuevosDatos,
      metadata: mantenerMetadata ? {
        ...silaboActual.metadata,
        ultimaModificacion: new Date().toISOString()
      } : {
        ...(nuevosDatos.metadata || {}),
        ultimaModificacion: new Date().toISOString()
      }
    }

    // Guardar lista actualizada
    localStorage.setItem(STORAGE_KEYS.SILABOS_COMPLETOS, JSON.stringify(todosSilabos))

    console.log('✏️ Sílabo actualizado:', silaboId)

    return {
      success: true,
      message: 'Sílabo actualizado exitosamente'
    }
  } catch (error) {
    console.error('❌ Error al actualizar sílabo:', error)
    return {
      success: false,
      message: 'Error al actualizar sílabo',
      error: error.message
    }
  }
}

/**
 * Elimina un sílabo por ID
 * @param {string} silaboId - ID del sílabo a eliminar
 * @returns {Object} Resultado de la operación
 */
export function eliminarSilabo(silaboId) {
  try {
    const todosSilabos = obtenerTodosSilabos()
    const nuevosSilabos = todosSilabos.filter(s => s.id !== silaboId)

    // Si no se eliminó ningún elemento
    if (todosSilabos.length === nuevosSilabos.length) {
      return {
        success: false,
        message: 'Sílabo no encontrado'
      }
    }

    // Guardar lista actualizada
    localStorage.setItem(STORAGE_KEYS.SILABOS_COMPLETOS, JSON.stringify(nuevosSilabos))

    console.log('🗑️ Sílabo eliminado:', silaboId)

    return {
      success: true,
      message: 'Sílabo eliminado exitosamente'
    }
  } catch (error) {
    console.error('❌ Error al eliminar sílabo:', error)
    return {
      success: false,
      message: 'Error al eliminar sílabo',
      error: error.message
    }
  }
}

// ==============================================
// FUNCIONES PARA DECANATO
// ==============================================

/**
 * Obtiene sílabos por estado (para decanato)
 * @param {string} estado - Estado del sílabo
 * @returns {Array} Sílabos filtrados
 */
export function obtenerSilabosPorEstado(estado) {
  const todosSilabos = obtenerTodosSilabos()
  return todosSilabos.filter(silabo =>
    silabo.metadata?.estado === estado
  )
}

/**
 * Cambia el estado de un sílabo
 * @param {string} silaboId - ID del sílabo
 * @param {string} nuevoEstado - Nuevo estado
 * @param {Object} metadataAdicional - Metadata adicional
 * @returns {Object} Resultado de la operación
 */
export function cambiarEstadoSilabo(silaboId, nuevoEstado, metadataAdicional = {}) {
  try {
    const todosSilabos = obtenerTodosSilabos()
    const indice = todosSilabos.findIndex(s => s.id === silaboId)

    if (indice === -1) {
      return {
        success: false,
        message: 'Sílabo no encontrado'
      }
    }

    // Actualizar estado y metadata
    todosSilabos[indice].metadata = {
      ...todosSilabos[indice].metadata,
      estado: nuevoEstado,
      fechaRevision: nuevoEstado === 'aprobado' || nuevoEstado === 'observado'
        ? new Date().toISOString()
        : todosSilabos[indice].metadata.fechaRevision,
      revisadoPor: metadataAdicional.revisadoPor || 'decanato',
      ...metadataAdicional
    }

    // Guardar cambios
    localStorage.setItem(STORAGE_KEYS.SILABOS_COMPLETOS, JSON.stringify(todosSilabos))

    console.log(`📝 Estado cambiado: ${silaboId} -> ${nuevoEstado}`)

    return {
      success: true,
      message: `Sílabo ${nuevoEstado} exitosamente`
    }
  } catch (error) {
    console.error('❌ Error al cambiar estado:', error)
    return {
      success: false,
      message: 'Error al cambiar estado',
      error: error.message
    }
  }
}

// ==============================================
// FUNCIONES PARA OBSERVACIONES
// ==============================================

/**
 * Agrega una observación a un sílabo
 * @param {string} silaboId - ID del sílabo
 * @param {string} observacion - Texto de la observación
 * @param {Object} metadata - Metadatos adicionales
 * @returns {Object} Resultado de la operación
 */
export function agregarObservacion(silaboId, observacion, metadata = {}) {
  try {
    // Obtener observaciones existentes
    const observacionesExistentes = obtenerTodasObservaciones()

    // Crear nueva observación
    const nuevaObservacion = {
      id: `obs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      silaboId: silaboId,
      observacion: observacion,
      fecha: new Date().toISOString(),
      creadoPor: metadata.creadoPor || 'decanato',
      leida: false, // Compatibilidad con código original
      visto: false, // Nuevo campo
      ...metadata
    }

    // Agregar a la lista principal
    observacionesExistentes.push(nuevaObservacion)

    // Guardar observaciones principales
    localStorage.setItem(STORAGE_KEYS.OBSERVACIONES, JSON.stringify(observacionesExistentes))

    // Guardar también para profesor (compatibilidad)
    guardarObservacionParaProfesor(nuevaObservacion)

    // Cambiar estado del sílabo a "observado"
    const resultadoEstado = cambiarEstadoSilabo(silaboId, 'observado', {
      ultimaObservacion: nuevaObservacion.fecha,
      ...metadata
    })

    console.log('📝 Observación agregada:', nuevaObservacion)

    return {
      success: true,
      message: 'Observación agregada exitosamente',
      observacionId: nuevaObservacion.id,
      ...resultadoEstado
    }
  } catch (error) {
    console.error('❌ Error al agregar observación:', error)
    return {
      success: false,
      message: 'Error al agregar observación',
      error: error.message
    }
  }
}

/**
 * Guarda una observación (alias de agregarObservacion para compatibilidad)
 * @param {Object} observacion - Datos de la observación
 * @returns {Object} Resultado de la operación
 */
export function guardarObservacion(observacion) {
  // Para mantener compatibilidad con el código proporcionado
  return agregarObservacion(
    observacion.silaboId,
    observacion.observacion,
    observacion
  )
}

/**
 * Obtiene todas las observaciones
 * @returns {Array} Lista de observaciones
 */
export function obtenerTodasObservaciones() {
  try {
    const observaciones = localStorage.getItem(STORAGE_KEYS.OBSERVACIONES)
    if (observaciones) {
      const parsed = JSON.parse(observaciones)
      console.log(`📋 Obtenidas ${parsed.length} observaciones`)
      return parsed
    }
    return []
  } catch (error) {
    console.error('❌ Error al obtener observaciones:', error)
    return []
  }
}

/**
 * Obtiene observaciones por sílabo ID
 * @param {string} silaboId - ID del sílabo
 * @returns {Array} Observaciones del sílabo
 */
export function obtenerObservacionesPorSilabo(silaboId) {
  const todasObservaciones = obtenerTodasObservaciones()
  return todasObservaciones.filter(obs => obs.silaboId === silaboId)
}

/**
 * Obtiene observaciones por profesor
 * @param {string} profesorId - ID del profesor
 * @returns {Array} Observaciones para el profesor
 */
export function obtenerObservacionesPorProfesor(profesorId) {
  const todasObservaciones = obtenerTodasObservaciones()
  const todosSilabos = obtenerTodosSilabos()

  // Filtrar observaciones de sílabos creados por el profesor
  return todasObservaciones.filter(obs => {
    const silabo = todosSilabos.find(s => s.id === obs.silaboId)
    return silabo?.metadata?.profesorId === profesorId
  })
}

/**
 * Obtener observaciones para profesor (versión simplificada)
 * @returns {Array} Observaciones del profesor
 */
export function obtenerObservacionesParaProfesor() {
  const profesorId = obtenerProfesorActual() || 'default'
  return obtenerObservacionesPorProfesor(profesorId)
}

/**
 * Marcar observación como vista
 * @param {string} observacionId - ID de la observación
 * @returns {Object} Resultado de la operación
 */
export function marcarObservacionVista(observacionId) {
  try {
    const todasObservaciones = obtenerTodasObservaciones()
    const indice = todasObservaciones.findIndex(obs => obs.id === observacionId)

    if (indice === -1) {
      return {
        success: false,
        message: 'Observación no encontrada'
      }
    }

    // Marcar como vista/leída
    todasObservaciones[indice].visto = true
    todasObservaciones[indice].leida = true // Compatibilidad
    todasObservaciones[indice].fechaVisto = new Date().toISOString()
    todasObservaciones[indice].fechaLectura = new Date().toISOString() // Compatibilidad

    // Guardar cambios en observaciones principales
    localStorage.setItem(STORAGE_KEYS.OBSERVACIONES, JSON.stringify(todasObservaciones))

    // Actualizar también para profesor (compatibilidad)
    const observacionesProfesor = obtenerObservacionesParaProfesorStorage()
    const indiceProfesor = observacionesProfesor.findIndex(obs => obs.id === observacionId)
    if (indiceProfesor !== -1) {
      observacionesProfesor[indiceProfesor].leida = true
      observacionesProfesor[indiceProfesor].fechaLectura = new Date().toISOString()
      localStorage.setItem(STORAGE_KEYS.OBSERVACIONES_PROFESOR, JSON.stringify(observacionesProfesor))
    }

    console.log('👁️ Observación marcada como vista:', observacionId)

    return {
      success: true,
      message: 'Observación marcada como vista'
    }
  } catch (error) {
    console.error('❌ Error al marcar observación como vista:', error)
    return {
      success: false,
      message: 'Error al marcar observación como vista',
      error: error.message
    }
  }
}

/**
 * Marcar observación como leída (compatible con el código proporcionado)
 * @param {string} observacionId - ID de la observación
 * @returns {Object} Resultado de la operación
 */
export function marcarObservacionLeida(observacionId) {
  return marcarObservacionVista(observacionId)
}

/**
 * Guardar observación para profesor (privado) - compatibilidad
 */
function guardarObservacionParaProfesor(observacion) {
  try {
    const observacionesProfesor = obtenerObservacionesParaProfesorStorage()
    observacionesProfesor.push(observacion)
    localStorage.setItem(STORAGE_KEYS.OBSERVACIONES_PROFESOR, JSON.stringify(observacionesProfesor))
    console.log('📝 Observación guardada para profesor:', observacion.id)
  } catch (error) {
    console.error('❌ Error al guardar observación para profesor:', error)
  }
}

/**
 * Obtener observaciones para profesor desde storage específico - compatibilidad
 */
function obtenerObservacionesParaProfesorStorage() {
  try {
    const observaciones = localStorage.getItem(STORAGE_KEYS.OBSERVACIONES_PROFESOR)
    return observaciones ? JSON.parse(observaciones) : []
  } catch (error) {
    console.error('❌ Error al obtener observaciones para profesor:', error)
    return []
  }
}

/**
 * Función auxiliar para obtener el profesor actual
 * Esto debería venir de un servicio de autenticación
 */
function obtenerProfesorActual() {
  try {
    const usuario = localStorage.getItem('current_user')
    if (usuario) {
      const parsed = JSON.parse(usuario)
      return parsed.id || parsed.username || null
    }

    // También intentar obtener de metadata del sílabo si no hay usuario activo
    const todosSilabos = obtenerTodosSilabos()
    if (todosSilabos.length > 0) {
      return todosSilabos[0].metadata?.profesorId || null
    }

    return null
  } catch (error) {
    console.error('Error al obtener profesor actual:', error)
    return null
  }
}

/**
 * Obtiene estadísticas para decanato
 * @returns {Object} Estadísticas
 */
export function obtenerEstadisticasDecanato() {
  const todosSilabos = obtenerTodosSilabos()
  const todasObservaciones = obtenerTodasObservaciones()

  const conteoPorEstado = todosSilabos.reduce((acum, silabo) => {
    const estado = silabo.metadata?.estado || 'pendiente'
    acum[estado] = (acum[estado] || 0) + 1
    return acum
  }, {})

  return {
    total: todosSilabos.length,
    pendientes: conteoPorEstado.pendiente || 0,
    enRevision: conteoPorEstado.revision || 0,
    aprobados: conteoPorEstado.aprobado || 0,
    observados: conteoPorEstado.observado || 0,
    totalObservaciones: todasObservaciones.length,
    observacionesNoLeidas: todasObservaciones.filter(obs => !obs.leida && !obs.visto).length,
    ultimaRevision: obtenerFechaUltimaRevision(todosSilabos)
  }
}

function obtenerFechaUltimaRevision(silabos) {
  const silabosRevisados = silabos.filter(s =>
    s.metadata?.estado === 'aprobado' || s.metadata?.estado === 'observado'
  )

  if (silabosRevisados.length === 0) return null

  return silabosRevisados.reduce((masReciente, silabo) => {
    const fecha = new Date(silabo.metadata?.fechaRevision || 0)
    const fechaReciente = new Date(masReciente.metadata?.fechaRevision || 0)
    return fecha > fechaReciente ? silabo : masReciente
  }).metadata?.fechaRevision
}

// ==============================================
// FUNCIONES PARA LIMPIEZA Y UTILIDAD
// ==============================================

/**
 * Elimina todos los datos temporales (borradores)
 * @returns {Object} Resultado de la operación
 */
export function eliminarDatosTemporales() {
  try {
    localStorage.removeItem(STORAGE_KEYS.SILABO_GENERAL)
    localStorage.removeItem(STORAGE_KEYS.ESTRUCTURA_CONCEPTUAL_BORRADOR)

    console.log('🧹 Datos temporales eliminados')

    return {
      success: true,
      message: 'Datos temporales eliminados exitosamente'
    }
  } catch (error) {
    console.error('❌ Error al eliminar datos temporales:', error)
    return {
      success: false,
      message: 'Error al eliminar datos temporales',
      error: error.message
    }
  }
}

/**
 * Exporta un sílabo como archivo JSON
 * @param {string} silaboId - ID del sílabo a exportar
 * @param {string} nombreArchivo - Nombre del archivo (opcional)
 * @returns {Object} Resultado de la operación
 */
export function exportarSilaboJSON(silaboId, nombreArchivo = null) {
  try {
    const silabo = obtenerSilaboPorId(silaboId)

    if (!silabo) {
      return {
        success: false,
        message: 'Sílabo no encontrado para exportar'
      }
    }

    // Crear nombre de archivo si no se proporciona
    const nombre = nombreArchivo || `silabo_${silabo.datosGenerales.codigoAsignatura || silaboId}.json`

    // Crear y descargar archivo
    const jsonData = JSON.stringify(silabo, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombre
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    console.log('📤 Sílabo exportado:', silaboId)

    return {
      success: true,
      message: 'Sílabo exportado exitosamente',
      nombreArchivo: nombre
    }
  } catch (error) {
    console.error('❌ Error al exportar sílabo:', error)
    return {
      success: false,
      message: 'Error al exportar sílabo',
      error: error.message
    }
  }
}

/**
 * Obtiene estadísticas de almacenamiento
 * @returns {Object} Estadísticas de los datos guardados
 */
export function obtenerEstadisticas() {
  try {
    const todosSilabos = obtenerTodosSilabos()
    const datosGenerales = obtenerDatosGenerales()
    const borrador = obtenerEstructuraConceptual()
    const observaciones = obtenerTodasObservaciones()

    return {
      totalSilabos: todosSilabos.length,
      tieneDatosGenerales: !!datosGenerales,
      tieneBorrador: !!borrador,
      totalObservaciones: observaciones.length,
      silabosPorEstado: contarSilabosPorEstado(todosSilabos),
      ultimoSilabo: todosSilabos.length > 0 ? todosSilabos[todosSilabos.length - 1] : null
    }
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error)
    return null
  }
}

/**
 * Función auxiliar para contar sílabos por estado
 */
function contarSilabosPorEstado(silabos) {
  const conteo = {}

  silabos.forEach(silabo => {
    const estado = silabo.metadata?.estado || 'desconocido'
    conteo[estado] = (conteo[estado] || 0) + 1
  })

  return conteo
}

// ==============================================
// EXPORTACIÓN POR DEFECTO
// ==============================================

export default {
  // Datos generales
  guardarDatosGenerales,
  obtenerDatosGenerales,

  // Estructura conceptual
  guardarEstructuraConceptual,
  obtenerEstructuraConceptual,
  eliminarBorradorEstructura,

  // Sílabos completos
  guardarSilaboCompleto,
  actualizarSilaboCompleto,
  obtenerTodosSilabos,
  obtenerSilaboPorId,
  actualizarSilabo,
  eliminarSilabo,

  // Funciones para Decanato
  obtenerSilabosPorEstado,
  cambiarEstadoSilabo,

  // Observaciones
  agregarObservacion,
  guardarObservacion, // Alias para compatibilidad
  obtenerTodasObservaciones,
  obtenerObservacionesPorSilabo,
  obtenerObservacionesPorProfesor,
  obtenerObservacionesParaProfesor,
  marcarObservacionVista,
  marcarObservacionLeida, // Alias para compatibilidad
  obtenerEstadisticasDecanato,

  // Utilidades
  eliminarDatosTemporales,
  exportarSilaboJSON,
  obtenerEstadisticas,

  // Constantes (opcional, para uso externo)
  STORAGE_KEYS
}
