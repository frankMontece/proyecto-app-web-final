/**
 * UTILIDADES DE VALIDACIÓN PARA FORMULARIOS
 * Sistema de Automatización de Sílabos
 * Versión: 2.0
 *
 * Buenas prácticas:
 * - Funciones puras (mismo input → mismo output)
 * - Retornan `true` si es válido, `string` con mensaje de error si no
 * - No tienen efectos secundarios
 */

// ========== VALIDACIONES BÁSICAS ==========

/**
 * Validar campo requerido
 * @param {string|number} value - Valor a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateRequired = (value) => {
  if (value === undefined || value === null) {
    return 'Este campo es requerido'
  }

  const stringValue = value.toString().trim()
  if (stringValue === '') {
    return 'Este campo es requerido'
  }

  return true
}

/**
 * Validar solo texto (letras, espacios y caracteres especiales en español)
 * @param {string} value - Texto a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateTextOnly = (value) => {
  if (!value) return true

  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s.,;():-]+$/
  if (!regex.test(value)) {
    return 'Solo se permiten letras, espacios y signos de puntuación básicos'
  }

  return true
}

/**
 * Validar solo números (enteros positivos)
 * @param {string|number} value - Valor a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateNumberOnly = (value) => {
  if (!value) return true

  const regex = /^\d+$/
  if (!regex.test(value.toString())) {
    return 'Solo se permiten números enteros positivos'
  }

  return true
}

/**
 * Validar alfanumérico (letras, números y espacios)
 * @param {string} value - Valor a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateAlphanumeric = (value) => {
  if (!value) return true

  const regex = /^[A-Za-z0-9\s]+$/
  if (!regex.test(value)) {
    return 'Solo se permiten letras, números y espacios'
  }

  return true
}

// ========== VALIDACIONES DE FORMATO ==========

/**
 * Validar email (opcional, si se proporciona debe ser válido)
 * @param {string} value - Email a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateEmail = (value) => {
  if (!value || value.trim() === '') {
    return true // Email es opcional
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(value)) {
    return 'Ingrese un correo electrónico válido (ej: usuario@dominio.com)'
  }

  return true
}

/**
 * Validar formato de código de curso (ej: ISW-401)
 * @param {string} value - Código a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateCourseCode = (value) => {
  if (!value) return 'El código de asignatura es requerido'

  const regex = /^[A-Z]{2,4}-\d{3}$/
  if (!regex.test(value)) {
    return 'Formato inválido. Use: LLL-NNN donde L=letra, N=número (ej: ISW-401)'
  }

  return true
}

/**
 * Validar período académico (formato: AAAA-N PERIODO TIPO)
 * @param {string} value - Período a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateAcademicPeriod = (value) => {
  if (!value) return 'El período académico es requerido'

  const regex = /^\d{4}-[12]\sPERIODO\s(ORDINARIO|EXTRAORDINARIO)$/
  if (!regex.test(value)) {
    return 'Formato inválido. Use: AAAA-N PERIODO TIPO (ej: 2025-2 PERIODO ORDINARIO)'
  }

  // Validar año (no menor a 2020, no mayor a 2030)
  const year = parseInt(value.substring(0, 4))
  if (year < 2020 || year > 2030) {
    return 'El año debe estar entre 2020 y 2030'
  }

  return true
}

/**
 * Validar teléfono (formato básico)
 * @param {string} value - Teléfono a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validatePhone = (value) => {
  if (!value || value.trim() === '') {
    return true // Teléfono es opcional
  }

  const regex = /^[\d\s\-+()]{7,20}$/
  if (!regex.test(value)) {
    return 'Ingrese un número de teléfono válido (7-20 dígitos, puede incluir espacios, guiones, paréntesis)'
  }

  // Contar solo dígitos
  const digitCount = (value.match(/\d/g) || []).length
  if (digitCount < 7 || digitCount > 15) {
    return 'El teléfono debe tener entre 7 y 15 dígitos'
  }

  return true
}

// ========== VALIDACIONES DE LONGITUD ==========

/**
 * Validar longitud mínima
 * @param {string} value - Texto a validar
 * @param {number} min - Longitud mínima requerida
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateMinLength = (value, min) => {
  if (!value) return `Se requieren al menos ${min} caracteres`

  if (value.length < min) {
    return `Mínimo ${min} caracteres (actual: ${value.length})`
  }

  return true
}

/**
 * Validar longitud máxima
 * @param {string} value - Texto a validar
 * @param {number} max - Longitud máxima permitida
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateMaxLength = (value, max) => {
  if (!value) return true

  if (value.length > max) {
    return `Máximo ${max} caracteres (actual: ${value.length})`
  }

  return true
}

/**
 * Validar longitud exacta
 * @param {string} value - Texto a validar
 * @param {number} exact - Longitud exacta requerida
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateExactLength = (value, exact) => {
  if (!value) return `Se requieren exactamente ${exact} caracteres`

  if (value.length !== exact) {
    return `Se requieren exactamente ${exact} caracteres (actual: ${value.length})`
  }

  return true
}

// ========== VALIDACIONES NUMÉRICAS ==========

/**
 * Validar rango numérico
 * @param {string|number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateRange = (value, min, max) => {
  if (value === undefined || value === null || value === '') {
    return `El valor debe estar entre ${min} y ${max}`
  }

  const num = Number(value)
  if (isNaN(num)) {
    return 'Ingrese un número válido'
  }

  if (num < min || num > max) {
    return `El valor debe estar entre ${min} y ${max} (actual: ${num})`
  }

  return true
}

/**
 * Validar créditos académicos (1-10)
 * @param {string|number} value - Créditos a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateCredits = (value) => {
  return validateRange(value, 1, 10)
}

/**
 * Validar horas académicas (0-200)
 * @param {string|number} value - Horas a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateAcademicHours = (value) => {
  return validateRange(value, 0, 200)
}

/**
 * Validar número positivo
 * @param {string|number} value - Valor a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validatePositive = (value) => {
  if (value === undefined || value === null || value === '') {
    return 'Ingrese un número positivo'
  }

  const num = Number(value)
  if (isNaN(num)) {
    return 'Ingrese un número válido'
  }

  if (num < 0) {
    return 'El valor debe ser positivo o cero'
  }

  return true
}

/**
 * Validar número entero (sin decimales)
 * @param {string|number} value - Valor a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateInteger = (value) => {
  if (value === undefined || value === null || value === '') {
    return 'Ingrese un número entero'
  }

  const num = Number(value)
  if (isNaN(num)) {
    return 'Ingrese un número válido'
  }

  if (!Number.isInteger(num)) {
    return 'El valor debe ser un número entero (sin decimales)'
  }

  return true
}

// ========== VALIDACIONES ESPECIALIZADAS ==========

/**
 * Validar fecha (formato: YYYY-MM-DD)
 * @param {string} value - Fecha a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateDate = (value) => {
  if (!value) return true // Fecha es opcional a menos que sea requerida

  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(value)) {
    return 'Formato de fecha inválido. Use: AAAA-MM-DD (ej: 2025-01-15)'
  }

  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return 'Fecha inválida'
  }

  // Validar que no sea fecha futura excesiva (máximo 2 años en el futuro)
  const maxFuture = new Date()
  maxFuture.setFullYear(maxFuture.getFullYear() + 2)

  if (date > maxFuture) {
    return 'La fecha no puede ser más de 2 años en el futuro'
  }

  return true
}

/**
 * Validar lista de códigos separados por comas (ej: ISW-301, MAT-201)
 * @param {string} value - Lista a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateCourseList = (value) => {
  if (!value || value.trim() === '') {
    return true // Lista vacía es válida
  }

  const courses = value.split(',').map(course => course.trim())

  for (const course of courses) {
    const result = validateCourseCode(course)
    if (result !== true) {
      return `Código inválido en la lista: "${course}". ${result}`
    }
  }

  return true
}

/**
 * Validar porcentaje (0-100)
 * @param {string|number} value - Porcentaje a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validatePercentage = (value) => {
  return validateRange(value, 0, 100)
}

// ========== VALIDACIONES COMPUESTAS ==========

/**
 * Validar horas totales (suma de diferentes tipos de horas)
 * @param {Object} horas - Objeto con diferentes tipos de horas
 * @param {number} horas.contacto - Horas de contacto con docente
 * @param {number} horas.practicaCon - Horas práctica con contacto
 * @param {number} horas.practicaSin - Horas práctica sin contacto
 * @param {number} horas.autonomo - Horas de aprendizaje autónomo
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateTotalHours = (horas) => {
  const { contacto = 0, practicaCon = 0, practicaSin = 0, autonomo = 0 } = horas

  // Validar cada tipo de horas individualmente
  const validaciones = [
    validateAcademicHours(contacto),
    validateAcademicHours(practicaCon),
    validateAcademicHours(practicaSin),
    validateAcademicHours(autonomo)
  ]

  for (const validacion of validaciones) {
    if (validacion !== true) {
      return validacion
    }
  }

  // Calcular total
  const total = contacto + practicaCon + practicaSin + autonomo

  if (total <= 0) {
    return 'El total de horas debe ser mayor a 0'
  }

  if (total > 300) {
    return 'El total de horas no puede exceder 300 horas'
  }

  return true
}

/**
 * Validar paralelo (ej: A, B, C, 1, 2, 3)
 * @param {string} value - Paralelo a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateParallel = (value) => {
  if (!value) return 'El paralelo es requerido'

  const regex = /^[A-Z1-9]$/
  if (!regex.test(value)) {
    return 'Paralelo inválido. Use una sola letra (A-Z) o número (1-9)'
  }

  return true
}

/**
 * Validar nivel académico (1-10)
 * @param {string|number} value - Nivel a validar
 * @returns {boolean|string} true si válido, mensaje de error si no
 */
export const validateAcademicLevel = (value) => {
  return validateRange(value, 1, 10)
}

// ========== FUNCIONES DE UTILIDAD ==========

/**
 * Ejecutar múltiples validaciones sobre un valor
 * @param {any} value - Valor a validar
 * @param {Array} validators - Array de funciones validadoras
 * @returns {Array} Array de errores (vacío si todo válido)
 */
export const runValidations = (value, validators) => {
  const errors = []

  for (const validator of validators) {
    const result = validator(value)
    if (result !== true) {
      errors.push(result)
    }
  }

  return errors
}

/**
 * Formatear mensajes de error para mostrar al usuario
 * @param {Array} errors - Array de mensajes de error
 * @returns {string} Mensaje formateado
 */
export const formatValidationErrors = (errors) => {
  if (errors.length === 0) return ''

  if (errors.length === 1) {
    return errors[0]
  }

  return 'Corrija los siguientes errores:\n' + errors.map((error, index) => {
    return `${index + 1}. ${error}`
  }).join('\n')
}

// ========== VALIDACIÓN DE DATOS GENERALES DEL SÍLABO ==========

/**
 * Validar datos generales del sílabo
 * @param {Object} data - Objeto con datos del sílabo
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateGeneralData = (data) => {
  const errors = {}
  let isValid = true

  // Validar unidad académica
  if (!data.unidadAcademica) {
    errors.unidadAcademica = 'La unidad académica es requerida'
    isValid = false
  }

  // Validar carrera
  if (!data.carrera) {
    errors.carrera = 'La carrera es requerida'
    isValid = false
  }

  // Validar nombre de asignatura
  if (!data.nombreAsignatura || data.nombreAsignatura.trim() === '') {
    errors.nombreAsignatura = 'El nombre de la asignatura es requerido'
    isValid = false
  }

  // Validar código de asignatura
  if (!data.codigoAsignatura || data.codigoAsignatura.trim() === '') {
    errors.codigoAsignatura = 'El código de asignatura es requerido'
    isValid = false
  } else {
    // Validar formato del código (ej: ISW-401)
    const codigoRegex = /^[A-Z]{2,4}-\d{3}$/
    if (!codigoRegex.test(data.codigoAsignatura)) {
      errors.codigoAsignatura = 'Formato inválido. Use: LLL-NNN (ej: ISW-401)'
      isValid = false
    }
  }

  // Validar créditos
  if (!data.creditos) {
    errors.creditos = 'El número de créditos es requerido'
    isValid = false
  } else if (data.creditos < 1 || data.creditos > 10) {
    errors.creditos = 'Los créditos deben estar entre 1 y 10'
    isValid = false
  }

  // Validar horas presenciales
  if (!data.horasPresenciales) {
    errors.horasPresenciales = 'Las horas presenciales son requeridas'
    isValid = false
  } else if (data.horasPresenciales < 0) {
    errors.horasPresenciales = 'Las horas presenciales no pueden ser negativas'
    isValid = false
  }

  // Validar horas no presenciales
  if (!data.horasNoPresenciales) {
    errors.horasNoPresenciales = 'Las horas no presenciales son requeridas'
    isValid = false
  } else if (data.horasNoPresenciales < 0) {
    errors.horasNoPresenciales = 'Las horas no presenciales no pueden ser negativas'
    isValid = false
  }

  return { isValid, errors }
}

// Exportación por nombre ya realizada en las declaraciones individuales.
