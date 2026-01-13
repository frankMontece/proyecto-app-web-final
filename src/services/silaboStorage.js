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
  OBSERVACIONES: 'observaciones_silabos'
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
        estado: 'pendiente_revision',
        fechaCreacion: new Date().toISOString(),
        creadoPor: metadata.profesor || 'profesor_anonimo',
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
 * Actualiza un sílabo existente
 * @param {string} silaboId - ID del sílabo a actualizar
 * @param {Object} nuevosDatos - Nuevos datos para el sílabo
 * @returns {Object} Resultado de la operación
 */
export function actualizarSilabo(silaboId, nuevosDatos) {
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
    todosSilabos[indice] = {
      ...todosSilabos[indice],
      ...nuevosDatos,
      metadata: {
        ...todosSilabos[indice].metadata,
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

    return {
      totalSilabos: todosSilabos.length,
      tieneDatosGenerales: !!datosGenerales,
      tieneBorrador: !!borrador,
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
  obtenerTodosSilabos,
  obtenerSilaboPorId,
  actualizarSilabo,
  eliminarSilabo,

  // Utilidades
  eliminarDatosTemporales,
  exportarSilaboJSON,
  obtenerEstadisticas,

  // Constantes (opcional, para uso externo)
  STORAGE_KEYS
}
