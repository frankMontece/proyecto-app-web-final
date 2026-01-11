<template>
  <div class="silabo-form-container">
    <div class="form-header">
      <h1>Creación de Sílabo</h1>
      <p class="subtitle">Complete los datos generales de la asignatura</p>
    </div>

    <div class="form-content">
      <SilaboGeneralData />
    </div>

    <div class="form-footer">
      <button @click="volverDashboard" class="btn btn-outline">
        Volver al Dashboard
      </button>
      <button @click="exportarJSON" class="btn btn-success">
        Exportar JSON
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useSilaboStore } from '@/stores/silabos'
import SilaboGeneralData from '@/components/silabos/SilaboGeneralData.vue'

const router = useRouter()
const silaboStore = useSilaboStore()

const volverDashboard = () => {
  router.push('/professor/dashboard')
}

const exportarJSON = () => {
  const data = silaboStore.generalData
  if (!data || Object.keys(data).length === 0) {
    alert('No hay datos para exportar. Complete el formulario primero.')
    return
  }

  const jsonData = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `silabo_${data.codigoAsignatura || 'generico'}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.silabo-form-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.form-header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.form-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.form-content {
  max-width: 1200px;
  margin: 0 auto;
}

.form-footer {
  max-width: 1200px;
  margin: 2rem auto 0;
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}
</style>
