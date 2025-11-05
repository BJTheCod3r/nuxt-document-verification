<template>
  <div class="dv-header">
    <img :src="logo" alt="Logo" class="dv-header__logo" />
    <h1 class="dv-header__title">Document Verification</h1>
  </div>
</template>

<script setup>
import '../assets/documentVerification.css'
defineProps({
  logo: {
    type: String,
    required: true,
  },
})
</script>
