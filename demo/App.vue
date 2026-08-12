<script setup lang="ts">
import { computed } from 'vue'
import {
  defaultViewports,
  toMediaQuery,
  useMediaQuery,
  useViewport,
} from 'vue-viewports'

// No setupViewports() and no plugin on purpose: useViewport() lazily installs
// the default breakpoints on first call.
const viewport = useViewport()
const isLandscape = useMediaQuery('(orientation: landscape)')
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

const rows = computed(() =>
  defaultViewports.map((config) => ({
    label: config.label,
    query: toMediaQuery(config.rule),
    active: config.label === viewport.value?.label,
  })),
)
</script>

<template>
  <main>
    <h1>vue-viewports</h1>
    <p class="lede">
      Resize the window: the value below changes only when a breakpoint is
      actually crossed, because it is backed by <code>matchMedia</code> and not
      by a resize listener.
    </p>

    <p class="current">
      <span class="label">current viewport</span>
      <strong>{{ viewport?.label ?? 'none' }}</strong>
    </p>

    <table>
      <thead>
        <tr>
          <th>label</th>
          <th>media query</th>
          <th>matches</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.label" :class="{ active: row.active }">
          <td>{{ row.label }}</td>
          <td><code>{{ row.query }}</code></td>
          <td>{{ row.active ? 'yes' : '—' }}</td>
        </tr>
      </tbody>
    </table>

    <h2>useMediaQuery</h2>
    <ul>
      <li><code>(orientation: landscape)</code> → {{ isLandscape }}</li>
      <li><code>(prefers-color-scheme: dark)</code> → {{ prefersDark }}</li>
    </ul>
  </main>
</template>

<style scoped>
.current {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin: 0 0 2rem;
  padding: 1.25rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
}

.current strong {
  font-family: var(--mono);
  font-size: 1.75rem;
  color: var(--accent);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.5rem 0.5rem 0.5rem 0;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

th {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}

tr.active td {
  color: var(--accent);
}

ul {
  padding-left: 1.25rem;
  margin: 0;
}
</style>
