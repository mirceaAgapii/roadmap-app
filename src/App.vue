<template>
  <div id="app">
    <!-- Mode selector -->
    <div class="mode-toggle">
      <button
        @click="mode = 'modern'"
        :class="{ active: mode === 'modern' }"
      >
        Roadmap
      </button>
      <button
        @click="mode = 'editor'"
        :class="{ active: mode === 'editor' }"
      >
        Create/Edit Roadmap
      </button>
    </div>

    <!-- Render selected roadmap -->
    <RoadmapModern v-if="mode === 'modern'" />
    <RoadmapEditor v-if="mode === 'editor'" />
  </div>
</template>

<script>
import RoadmapModern from './views/RoadmapModern.vue';
import RoadmapEditor from './views/RoadmapEditor.vue';

export default {
  name: 'App',
  components: {
    RoadmapModern,
    RoadmapEditor
  },
  data() {
    return {
      mode: 'modern'
    };
  }
};
</script>

<style>
:root {
  --primary-background: #ef682f;
  --primary-text: #f5f5f5;
  --topic-card-bg: #ffffff;
  --not-active-bg: #f0c4b2;
  --main-content-bg: #fafcfc;
  --drawer-bg: #7f5d4f;
  --plain-text: #020202;
}

html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
}

/* Mode toggle styles */
.mode-toggle {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: #f2f2f2;
}
.mode-toggle button {
  padding: 8px 20px;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  background-color: #f0c4b2;
  color: #f5f5f5;
  cursor: pointer;
  transition: background 0.3s ease;
}
.mode-toggle button.active {
  color: #f5f5f5;
  background: #f1682f;
}
.mode-toggle button:hover {
  background: #f5f5f5;
  color: #f1682f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
