<template>
  <div class="dv-details">
    <h2 class="dv-details__heading">Document Details</h2>
    <div class="dv-details__info">
      <InfoRow v-for="(field, index) in visibleFields" :key="index" :field="field" />
    </div>

    <div v-if="shouldShowDocument" class="dv-details__asset-section">
      <h3 v-if="shouldShowDocumentTitle" class="dv-details__asset-heading">
        {{ displayTitle }}
      </h3>
      <div class="dv-details__asset" :class="assetClass">
        <template v-if="assetType === 'pdf'">
          <iframe class="dv-details__asset-frame" :src="assetSource" title="Document preview" />
        </template>
        <template v-else>
          <img :src="assetSource" :alt="displayTitle" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InfoRow from './InfoRow.vue'
import type { Document, ResolvedField, DocumentField } from '../composables/types'
import '../assets/documentVerification.css'

const props = withDefaults(
  defineProps<{
    document: Document | null
    fields: ResolvedField[]
    showDocument: boolean
    displayField: string
    displayTitle: string
    displayType?: DocumentField
    showDocumentTitle: boolean
  }>(),
  {
    document: null,
    fields: () => [] as ResolvedField[],
    showDocument: true,
    displayField: 'displayUrl',
    displayTitle: 'Document Preview',
    displayType: undefined,
    showDocumentTitle: true,
  }
)

const visibleFields = computed(() =>
  props.fields.filter((field) => field.value && field.value.trim().length > 0)
)

const assetSource = computed(() => {
  if (!props.document || !props.displayField) {
    return ''
  }
  const value = props.document[props.displayField]
  return typeof value === 'string' ? value : ''
})

const explicitDisplayType = computed<DocumentField | null>(() => {
  const fromDocument = props.document && props.document.displayType
  if (fromDocument === 'image' || fromDocument === 'pdf') {
    return fromDocument
  }
  if (props.displayType === 'image' || props.displayType === 'pdf') {
    return props.displayType
  }
  return null
})

const assetType = computed<DocumentField | null>(() => {
  const explicit = explicitDisplayType.value
  if (explicit) {
    return explicit
  }
  const source = assetSource.value
  if (!source) {
    return null
  }
  const lower = source.toLowerCase()
  if (/\.pdf($|\?)/i.test(lower) || lower.includes('application/pdf')) {
    return 'pdf'
  }
  return 'image'
})

const hasDisplayAsset = computed(() => Boolean(assetSource.value))
const shouldShowDocument = computed(() => props.showDocument && hasDisplayAsset.value)
const shouldShowDocumentTitle = computed(() => shouldShowDocument.value && props.showDocumentTitle)

const assetClass = computed(() => ({
  'dv-details__asset--pdf': assetType.value === 'pdf',
  'dv-details__asset--image': assetType.value === 'image',
}))
</script>
