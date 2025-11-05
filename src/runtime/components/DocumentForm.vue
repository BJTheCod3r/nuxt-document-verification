<template>
  <div class="dv-form">
    <div class="dv-form__group">
      <label class="dv-form__label" for="document-id">Document ID</label>
      <input
        id="document-id"
        v-model="inputValue"
        type="text"
        placeholder="Enter document ID"
        class="dv-form__input"
        @keyup.enter="handleVerify"
        @focus="handleFocus"
      />
    </div>

    <button class="dv-button" :disabled="isLoading" :style="buttonStyleVars" @click="handleVerify">
      {{ isLoading ? 'Verifying...' : 'Verify Document' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import '../assets/documentVerification.css'

const props = defineProps({
  documentId: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  buttonColor: {
    type: String,
    default: '#4f46e5',
  },
  buttonHoverColor: {
    type: String,
    default: '#4338ca',
  },
})

const emit = defineEmits(['verify', 'focus'])

const inputValue = ref(props.documentId)

const buttonStyleVars = computed(() => ({
  '--dv-button-bg': props.buttonColor,
  '--dv-button-bg-hover': props.buttonHoverColor,
}))

watch(
  () => props.documentId,
  (newValue) => {
    inputValue.value = newValue
  }
)

const handleVerify = () => {
  emit('verify', inputValue.value)
}

const handleFocus = () => {
  emit('focus')
}
</script>
