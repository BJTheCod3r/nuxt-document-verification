<template>
  <div class="dv-info-row">
    <span class="dv-info-row__label">{{ field.label }}</span>
    <span class="dv-info-row__value" :class="valueClasses">
      <template v-if="hasLink">
        <a :href="linkHref" class="dv-info-row__link" target="_blank" rel="noopener">
          {{ linkLabel }}
        </a>
      </template>
      <template v-else-if="isStatus">
        <strong class="dv-info-row__status" :class="statusClass">{{ displayValue }}</strong>
      </template>
      <template v-else>
        <span :class="{ 'dv-info-row__value--emphasis': isDocumentId }">{{ displayValue }}</span>
      </template>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResolvedField } from '../composables/types'
import { NORMALIZED_FIELD_KEYS } from '../composables/constants'
import '../assets/documentVerification.css'

const props = defineProps<{ field: ResolvedField }>()

const isLinkType = computed(() => props.field.type === 'image' || props.field.type === 'pdf')
const isStatus = computed(() => props.field.type === 'status')
const isDocumentId = computed(() => props.field.key === NORMALIZED_FIELD_KEYS.id)

const displayValue = computed(() => {
  return String(props.field.value)
})

const linkHref = computed(() => {
  if (!isLinkType.value) {
    return ''
  }
  return displayValue.value || ''
})

const hasLink = computed(() => linkHref.value.length > 0)

const linkLabel = computed(() => {
  if (!hasLink.value) {
    return ''
  }

  if (props.field.type === 'pdf') {
    return 'Download Document'
  }
  if (props.field.type === 'image') {
    return 'View Document'
  }

  return displayValue.value
})

const statusClass = computed(() => {
  if (props.field.isValid === true) {
    return 'dv-info-row__status--valid'
  }
  if (props.field.isValid === false) {
    return 'dv-info-row__status--invalid'
  }
  const value = displayValue.value.trim().toLowerCase()
  if (value === 'valid') {
    return 'dv-info-row__status--valid'
  }
  if (value === 'invalid') {
    return 'dv-info-row__status--invalid'
  }
  return ''
})

const valueClasses = computed(() => ({
  'dv-info-row__value--link': hasLink.value,
  'dv-info-row__value--status': isStatus.value,
}))
</script>
