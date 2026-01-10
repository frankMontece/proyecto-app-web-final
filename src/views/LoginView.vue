<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Sistema de Automatización de Sílabos</h1>
        <p class="subtitle">Universidad Tecnológica</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Correo Institucional</label>
          <input id="username" v-model="form.username" type="email" placeholder="usuario@universidad.edu" required
            :class="{ 'error': errors.username }" />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input id="password" v-model="form.password" type="password" placeholder="Ingrese su contraseña" required
            :class="{ 'error': errors.password }" />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="role">Rol</label>
          <select id="role" v-model="form.role" required :class="{ 'error': errors.role }">
            <option value="" disabled>Seleccione su rol</option>
            <option value="profesor">Profesor</option>
            <option value="decanato">Decanato</option>
          </select>
          <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          <span v-if="loading">Iniciando sesión...</span>
          <span v-else>Iniciar Sesión</span>
        </button>

        <div v-if="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>

        <div class="login-info">
          <p><strong>Credenciales de prueba:</strong></p>
          <p>Profesor: profesor@universidad.edu / profesor123</p>
          <p>Decanato: decanato@universidad.edu / decanato123</p>
        </div>
      </form>

      <div class="login-footer">
        <p>Sistema v2.0 - Desarrollado con Vue.js</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
  role: ''
})

const errors = reactive({
  username: '',
  password: '',
  role: ''
})

const loading = ref(false)
const errorMessage = ref('')

const validateForm = () => {
  let isValid = true

  // Reset errors
  errors.username = ''
  errors.password = ''
  errors.role = ''

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.username) {
    errors.username = 'El correo es requerido'
    isValid = false
  } else if (!emailRegex.test(form.username)) {
    errors.username = 'Ingrese un correo válido'
    isValid = false
  }

  // Validate password
  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Mínimo 6 caracteres'
    isValid = false
  }

  // Validate role
  if (!form.role) {
    errors.role = 'Seleccione un rol'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''

  try {
    // ✅ LÍNEA CORREGIDA: Agregar form.role como tercer parámetro
    const result = await authStore.login(form.username, form.password, form.role)

    if (!result.success) {
      errorMessage.value = result.error
    }
  } catch (error) {
    errorMessage.value = 'Error en el servidor. Intente nuevamente.'
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 8px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 14px;
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input.error,
.form-group select.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-alert {
  margin-top: 16px;
  padding: 12px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: #c33;
  font-size: 14px;
  text-align: center;
}

.login-info {
  margin-top: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-size: 12px;
  color: #6c757d;
  line-height: 1.5;
}

.login-info p {
  margin: 4px 0;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: #95a5a6;
  font-size: 12px;
}
</style>
