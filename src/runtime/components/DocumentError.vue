<template>
  <div class="dv-error">
    {{ message }}
  </div>
</template>

<script setup>
import '../assets/documentVerification.css'
defineProps({
  message: {
    type: String,
    required: true,
  },
})
</script>
