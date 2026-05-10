<script setup lang="ts">
import { ref, onMounted } from 'vue';

const buildTime = ref(new Date().toLocaleString('en-GB'));
const version = '8.0.0-alpha.0';

// Tiny smoke test that Vue's reactivity works end-to-end.
// Phase 1 will replace this with actual app initialization.
const tickCount = ref(0);
onMounted(() => {
  setInterval(() => {
    tickCount.value++;
  }, 1000);
});
</script>

<template>
  <main class="shell">
    <div class="card">
      <div class="logo">FCC</div>
      <h1>v8 — under construction</h1>
      <p class="lede">
        We're rebuilding FCC on a modular foundation.
        The current version (v7.47) remains live and unaffected.
      </p>

      <div class="status">
        <div class="row">
          <span class="label">Phase</span>
          <span class="value">0 — foundation</span>
        </div>
        <div class="row">
          <span class="label">Version</span>
          <span class="value">{{ version }}</span>
        </div>
        <div class="row">
          <span class="label">Build</span>
          <span class="value">{{ buildTime }}</span>
        </div>
        <div class="row">
          <span class="label">Reactivity check</span>
          <span class="value">{{ tickCount }}s since load</span>
        </div>
      </div>

      <p class="footer">
        If you're seeing this page locally, the toolchain is working.
        Vue, TypeScript, Vite — all wired up.
      </p>
    </div>
  </main>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

.card {
  max-width: 560px;
  width: 100%;
  background: #111111;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
}

.logo {
  display: inline-block;
  font-weight: 800;
  font-size: 28px;
  letter-spacing: 2px;
  color: #ff8c42;
  border: 2px solid #ff8c42;
  border-radius: 12px;
  padding: 8px 16px;
  margin-bottom: 24px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #f5f5f5;
}

.lede {
  color: #aaaaaa;
  line-height: 1.5;
  margin: 0 0 32px;
}

.status {
  background: #0a0a0a;
  border: 1px solid #222;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  text-align: left;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #1a1a1a;
}

.row:last-child {
  border-bottom: none;
}

.label {
  color: #888;
  font-size: 14px;
}

.value {
  color: #f5f5f5;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.footer {
  color: #666;
  font-size: 13px;
  margin: 0;
}
</style>
