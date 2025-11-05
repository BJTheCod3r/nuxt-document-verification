<template>
  <div class="dv-image-section">
    <h2 class="dv-image-section__heading">Document Preview</h2>
    <div class="dv-image">
      <img :src="displayUrl" alt="Document" />
    </div>
  </div>
</template>

<script setup>
import '../assets/documentVerification.css'
defineProps({
  displayUrl: {
    type: String,
    required: true,
  },
})
</script>
