import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  // Estado
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)

  // Datos de usuarios en JSON (simulación de base de datos)
  const usersData = ref([
    {
      id: 1,
      username: 'profesor@universidad.edu',
      password: 'profesor123',
      role: 'profesor',
      name: 'Dr. Juan Pérez',
      department: 'Ingeniería de Sistemas'
    },
    {
      id: 2,
      username: 'decanato@universidad.edu',
      password: 'decanato123',
      role: 'decanato',
      name: 'Lic. María González',
      department: 'Decanato de Facultad'
    }
  ])

  // Métodos
  const login = async (username, password, selectedRole) => {  // ← AGREGAR selectedRole
    const foundUser = usersData.value.find(
      user => user.username === username && user.password === password
    )

    if (foundUser) {
      // ✅ NUEVA VALIDACIÓN: Verificar coincidencia de rol
      if (foundUser.role !== selectedRole) {
        return {
          success: false,
          error: `Error de rol: Las credenciales corresponden al rol "${foundUser.role}" pero está intentando acceder como "${selectedRole}". Seleccione el rol correcto.`
        }
      }

      user.value = foundUser
      token.value = 'mock-jwt-token-' + Date.now()
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(foundUser))

      // Redirigir según rol
      if (foundUser.role === 'profesor') {
        await router.push('/professor/dashboard')
      } else if (foundUser.role === 'decanato') {
        await router.push('/dean/dashboard')
      }

      return { success: true, user: foundUser }
    }

    return { success: false, error: 'Credenciales incorrectas' }
  }
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const checkAuth = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    login,
    logout,
    checkAuth
  }
})
