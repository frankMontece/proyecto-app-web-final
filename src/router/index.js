import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/professor',
      name: 'professor',
      component: () => import('@/layouts/ProfessorLayout.vue'),
      meta: { requiresAuth: true, role: 'profesor' },
      children: [
        {
          path: 'dashboard',
          name: 'professor-dashboard',
          component: () => import('@/views/professor/DashboardView.vue')
        },
        {
          path: 'crear-silabo',  // Ruta existente
          name: 'crear-silabo',
          component: () => import('@/components/silabos/SilaboForm.vue')
        },
        {
          path: 'estructura-conceptual/:id?',  // NUEVA RUTA AGREGADA
          name: 'estructura-conceptual',
          component: () => import('@/components/silabos/EstructuraConceptualForm.vue'),
          props: true  // Permite pasar parámetros como props
        },
        {
          path: 'mis-silabos',  // ← NUEVA RUTA A AGREGAR
          name: 'mis-silabos',
          component: () => import('@/views/professor/MisSilabosView.vue')
        }
      ]
    },
    {
      path: '/dean',
      name: 'dean',
      component: () => import('@/layouts/DeanLayout.vue'),
      meta: { requiresAuth: true, role: 'decanato' },
      children: [
        {
          path: 'dashboard',
          name: 'dean-dashboard',
          component: () => import('@/views/dean/DashboardView.vue')
        },
        // ============================================
        // NUEVAS RUTAS PARA DECANATO - PASO 3
        // ============================================
        {
          path: 'revisar-silabos',
          name: 'revisar-silabos',
          component: () => import('@/views/dean/RevisarSilabosView.vue'),
          meta: { requiresAuth: true, role: 'decanato' }
        },
        {
          path: 'silabo/:id',
          name: 'detalle-silabo',
          component: () => import('@/views/dean/DetalleSilaboView.vue'),
          props: true,
          meta: { requiresAuth: true, role: 'decanato' }
        },
        {
          path: 'observaciones',
          name: 'observaciones-decanato',
          component: () => import('@/views/dean/ObservacionesView.vue'),
          meta: { requiresAuth: true, role: 'decanato' }
        },
        {
          path: 'aprobados',
          name: 'silabos-aprobados',
          component: () => import('@/views/dean/SilabosAprobadosView.vue'),
          meta: { requiresAuth: true, role: 'decanato' }
        }
        // ============================================
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// Guardia de navegación (MANTENER IGUAL - NO CAMBIAR)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Verificar autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Verificar si es invitado
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirigir según rol
    if (authStore.userRole === 'profesor') {
      next('/professor/dashboard')
    } else if (authStore.userRole === 'decanato') {
      next('/dean/dashboard')
    }
    return
  }

  // Verificar rol
  if (to.meta.role && to.meta.role !== authStore.userRole) {
    next('/login')
    return
  }

  next()
})

export default router
