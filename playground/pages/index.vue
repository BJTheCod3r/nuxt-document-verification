<template>
  <div class="playground" :data-theme="theme">
    <header class="playground__header">
      <h1>Document Verification Playground</h1>
      <button class="playground__toggle" @click="toggleTheme">
        Switch to {{ theme === 'light' ? 'dark' : 'light' }} mode
      </button>
    </header>

    <p class="playground__intro">
      Use the controls below to try the document verification experience with different
      configurations. Toggle the theme to see how the built-in light and dark palettes respond to
      CSS variables.
    </p>

    <section class="playground__component">
      <DocumentVerification />
    </section>

    <section class="playground__card">
      <h2>Sample Document IDs</h2>
      <p>The mock API in the playground recognises the following IDs:</p>
      <ul>
        <li><strong>DOC-123456</strong> – returns a valid document response</li>
        <li><strong>DOC-789012</strong> – returns a valid document response</li>
        <li><strong>DOC-345678</strong> – returns an invalid document (validity flag is false)</li>
        <li><strong>DOC-000000</strong> – triggers a “not found” error</li>
        <li><strong>DOC-123498</strong> - returns a valid document response (PDF)</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const theme = ref<'light' | 'dark'>('light')

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<style scoped>
.playground {
  max-width: 960px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 2rem;
  font-family: var(--dv-font-family);
  background-color: var(--dv-surface-color);
  color: var(--dv-text-color);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.playground__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.playground__header h1 {
  margin: 0;
  font-size: 2rem;
  color: var(--dv-heading-color);
}

.playground__toggle {
  border: 1px solid var(--dv-border-color);
  background-color: var(--dv-card-bg);
  color: var(--dv-text-color);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.95rem;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.playground__toggle:hover {
  background-color: var(--dv-primary-color);
  border-color: var(--dv-primary-color);
  color: var(--dv-button-text);
}

.playground__intro {
  margin: 0 0 1.5rem;
  color: var(--dv-subtle-text);
  line-height: 1.6;
}

.playground__component {
  margin-bottom: 2rem;
}

.playground__card {
  background-color: var(--dv-card-bg);
  border-radius: var(--dv-border-radius);
  padding: 1.5rem;
  border: 1px solid var(--dv-border-color);
  box-shadow: var(--dv-shadow);
}

.playground__card h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: var(--dv-heading-color);
}

.playground__card p {
  margin-bottom: 1rem;
  color: var(--dv-subtle-text);
}

.playground__card ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--dv-text-color);
}

.playground__card li {
  margin-bottom: 0.5rem;
}
</style>
