<template>
  <div class="dv-footer">
    <a :href="backLink" class="dv-footer__link">{{ backLinkText }}</a>
  </div>
</template>

<script setup>
import '../assets/documentVerification.css'
defineProps({
  backLink: {
    type: String,
    required: true,
  },
  backLinkText: {
    type: String,
    required: true,
  },
})
</script>
