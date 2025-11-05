<p align="center">
  <img src="./art/logo-wide.png" alt="Document Verification" />
</p>

# Document Verification Module for Nuxt

A reusable Nuxt 3 module for document verification.  
Add a simple `<DocumentVerification />` component and endpoint configuration to verify and preview documents.

## Highlights

- Plug-and-play verification page backed by the `useDocumentVerification` composable
- Configurable document fields with optional resolver functions for derived values
- Automatic routing support: watches the URL and re-verifies on change
- Built‑in loading and error handling states
- Document image support and smart status fallback when only a boolean validity flag is available
- Centralised styling with CSS custom properties, including a default dark theme

## Installation

1. Copy the `document-verification` package into your Nuxt workspace (or install it through your preferred package manager if published).
2. Enable the module in your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: [
    // ...other modules
    '~/packages/document-verification/nuxt',
  ],

  documentVerification: {
    logo: '/art/documents-logo.svg',
    verificationEndpoint: '/api/documents',
    documentIdParam: 'document_id',
    backLink: '/',
    backLinkText: 'Back to dashboard',
    showBackLink: true,
    buttonColor: '#4f46e5',
    buttonHoverColor: '#4338ca',
    showDocument: true,
    displayField: 'displayUrl',
    displayTitle: 'Uploaded Document',
    displayType: 'image',
    showDocumentTitle: true,
    idField: 'id',
    issuedToField: 'recipientName',
    titleField: 'documentTitle',
    issueDateField: 'issuedOn',
    validityField: 'isValid',
    statusResolver: (payload) => payload.statusText,
    messages: {
      description: 'Enter the document ID to verify authenticity.',
      requiredIdError: 'Document ID is required',
      verificationFailedError: 'We could not verify that document',
      generalError: 'Something unexpected happened. Try again shortly.',
    },
    fields: [
      { label: 'Document ID:', key: 'id', type: 'id' },
      { label: 'Issued To:', key: 'issuedTo', type: 'text' },
      { label: 'Programme:', key: 'title', type: 'text' },
      { label: 'Issue Date:', key: 'issueDate', type: 'date' },
      {
        label: 'Status:',
        key: 'status',
        type: 'status',
        resolver: (raw, normalised) =>
          (raw.statusText ?? normalised.isValid) ? 'Valid' : 'Invalid',
      },
    ],
  },
})
```

The configuration object is optional—omit or override keys to fall back to the bundled defaults.

## Usage

The module globally registers the `DocumentVerification` component. Drop it into any page:

```vue
<template>
  <DocumentVerification />
</template>
```

All verification requests read the document identifier from the current route query string. By default the ID comes from the `?document_id=` parameter; override `documentIdParam` to match your API naming.

## Verification Endpoint

Expose an endpoint that accepts the configured identifier and returns the document payload. A minimal JSON response looks like:

```json
{
  "id": "DOC-123456",
  "issuedTo": "Ayo Bello",
  "title": "Data Analytics Credential",
  "issueDate": "2024-05-12",
  "status": "Valid",
  "isValid": true,
  "displayUrl": "https://cdn.example.com/documents/DOC-123456.png",
  "displayType": "image"
}
```

By default the module requests `/api/documents?document_id=DOC-123456`. Override `documentIdParam` when your API expects a different query key.

All response fields are treated as strings except the validity flag. If a status string is missing the module falls back to `isValid` and surfaces `Valid` / `Invalid` automatically.

## Configuration Reference

| Key                                                                                        | Description                                                                              | Default                  |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------ |
| `logo`                                                                                     | Logo URL displayed at the top of the page                                                | `/logo.png`              |
| `verificationEndpoint`                                                                     | API endpoint that validates a document                                                   | **required**             |
| `backLink` / `backLinkText`                                                                | Destination + label for the back button                                                  | `'/'` / `'Back to Home'` |
| `showBackLink`                                                                             | Toggle visibility of the back button                                                     | `true`                   |
| `buttonColor` / `buttonHoverColor`                                                         | Primary button colours                                                                   | `#4f46e5` / `#4338ca`    |
| `fields`                                                                                   | Array describing the detail rows (label, key, type, optional resolver)                   | Built-in defaults        |
| `showDocument`                                                                             | Toggle document image section (hides it entirely when `false`)                           | `true`                   |
| `displayField`                                                                             | Field containing the primary document asset (image/PDF)                                  | `'displayUrl'`           |
| `displayTitle`                                                                             | Heading shown above the preview when visible                                             | `'Document Preview'`     |
| `displayType`                                                                              | Explicitly mark the asset as `'image'` or `'pdf'`; falls back to URL sniffing when unset | `undefined`              |
| `showDocumentTitle`                                                                        | Controls whether the image heading renders                                               | `true`                   |
| `idField`, `issuedToField`, `titleField`, `issueDateField`, `statusField`, `validityField` | Maps raw payload keys to the normalised document fields                                  | sensible defaults        |
| `statusResolver`, `validityResolver`                                                       | Functions that derive status text / validity boolean from the raw payload                | `undefined`              |
| `documentIdParam`                                                                          | Name of the ID parameter used in the query string                                        | `'document_id'`          |
| `messages`                                                                                 | Override copy for the UI (see below)                                                     | bundled strings          |

### Messages

Provide the `messages` object to tailor UI copy:

```ts
messages: {
  description: 'Verify the document below.',
  requiredIdError: 'Please supply a document ID',
  verificationFailedError: 'Verification failed',
  generalError: 'Something went wrong',
  missingConfigError: 'Document verification is not configured.'
}
```

### Field Definitions

Each field in `fields` accepts:

| Property   | Purpose                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| `label`    | Text shown in the UI (`:` is optional)                                                                    |
| `key`      | Normalised document property to read from                                                                 |
| `type`     | One of `id`, `text`, `status`, `date`, `image`, or `pdf`                                                  |
| `resolver` | `(raw, normalised) => unknown` function that supplies a value when the raw payload uses a different shape |

Only fields that resolve to a non-empty value are rendered. `type: 'status'` also exposes `field.isValid` so you can style badges appropriately.

When `showDocument` is `false`, the asset block is skipped altogether even if the API responds with a URL. Use `showDocumentTitle` to hide the heading while keeping the preview itself, or override `displayTitle` to customise the heading copy. Set `displayType` to `'image'` or `'pdf'` when you know the asset format; otherwise the component falls back to inferring it from the URL (still supporting PDF detection). The `displayField` can point to an image or a PDF; PDFs render inside the viewer with a fallback link.

Turn off the footer back button entirely by setting `showBackLink: false`.

```ts
documentVerification: {
  // ...
  displayField: 'assets.preview.url',
  displayTitle: 'Supporting Evidence',
  displayType: 'pdf'
}
```

## Styling & Theming

All component styles live in `packages/document-verification/src/runtime/assets/documentVerification.css`. The sheet defines a set of CSS variables prefixed with `--dv-` plus a dark-mode override block. Override them from your host application to match your brand:

```css
/* app.vue, main.css, etc. */
:root {
  --dv-primary-color: #1e40af;
  --dv-primary-hover: #1d4ed8;
  --dv-link-color: #0f172a;
  --dv-border-radius: 12px;
}

[data-theme='dark'] {
  --dv-card-bg: #010409;
  --dv-surface-color: #111827;
  --dv-border-color: #1f2937;
  --dv-button-text: #f8fafc;
}
```

Set `data-theme="dark"` on any ancestor of the verification component to automatically swap to the dark palette:

```vue
<template>
  <section data-theme="dark">
    <DocumentVerification />
  </section>
</template>
```

Because every component imports the shared stylesheet, overrides apply whether you render the bundled page or re-use individual building blocks.

## Composable

Import `useDocumentVerification()` when you want to extend or completely redesign the UI. It exposes:

```ts
const {
  documentId,
  isLoading,
  error,
  document,
  fields,
  verifyDocument,
  clearError,
  setDocumentId,
  config,
} = useDocumentVerification()
```

The composable mirrors the logic used by the default page—form submission, error handling, field normalisation, and status fallbacks—so you can build bespoke layouts without re-implementing verification logic.

## Playground

Run the playground inside `packages/document-verification/playground` to experiment with configuration, custom CSS, or dark mode. The example page ships with a theme toggle that flips the `data-theme` attribute to demonstrate the built-in palette changes.

## Testing

Vitest unit tests cover the composable and utility helpers. Run them from the package root:

```bash
npm run test
```

Happy verifying!
