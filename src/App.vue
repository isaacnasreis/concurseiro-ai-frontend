<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="main-header">
    <div class="wrapper">
      <h1>ConcurseiroAI 🧠</h1>
      <nav>
        <RouterLink to="/">Gerador</RouterLink>
        <RouterLink to="/simulado">Simulado</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
.main-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 2rem;
}
.wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}
h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #343a40;
}
nav {
  display: flex;
  gap: 1rem;
}
nav a {
  text-decoration: none;
  color: #007bff;
  font-weight: 500;
}
nav a.router-link-exact-active {
  color: #343a40;
  text-decoration: underline;
}
</style>