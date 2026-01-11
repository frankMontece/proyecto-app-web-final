import { createApp } from 'vue'
import { createPinia } from 'pinia'  // Importar Pinia
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()  // Crear instancia de Pinia

app.use(pinia)  // Registrar Pinia ANTES del router
app.use(router)

app.mount('#app')
