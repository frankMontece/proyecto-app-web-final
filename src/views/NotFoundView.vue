<template>
  <div class="not-found">
    <h1>404 - Página no encontrada</h1>
    <p>La página que buscas no existe.</p>
    <router-link to="/login" class="back-link">Volver al inicio</router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 100px 20px;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}
</style>
