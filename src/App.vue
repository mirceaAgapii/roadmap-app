<template>
  <div id="app">
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

    <div class="main-content-wrapper">
      <RoadmapModern v-if="mode === 'modern'" />
      <RoadmapEditor v-if="mode === 'editor'" />
    </div>
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
/* Variabilele CSS rămân la fel */
:root {
  --primary-background: #ef682f;
  --primary-text: #f5f5f5;
  --topic-card-bg: #ffffff;
  --not-active-bg: #f0c4b2;
  --main-content-bg: #fafcfc;
  --drawer-bg: #7f5d4f;
  --plain-text: #020202;
}

/* Reset de bază pentru a asigura ca totul începe de la 0 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%; /* Important: HTML și Body ocupă înălțimea completă a viewport-ului */
  overflow: hidden; /* Previne bara de scroll pe html/body */
}

#app {
  height: 100%; /* #app ocupă 100% din înălțimea body */
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex; /* Face din #app un container flex */
  flex-direction: column; /* Organizează elementele pe coloană (header sus, conținut jos) */
  overflow: hidden; /* Asigură că #app nu va avea scrollbar propriu, ci gestionează intern */
}

/* Mode toggle styles (Header) */
.mode-toggle {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: #f2f2f2;
  flex-shrink: 0; /* Previne micșorarea header-ului dacă spațiul este limitat */
  /* Adaugă o margine de jos pentru spațiere */
  margin-bottom: 20px; /* Sau o altă valoare care să se potrivească cu gap-ul din .modern-roadmap */
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

/* Wrapper for the main content (RoadmapModern/Editor) */
.main-content-wrapper {
  flex-grow: 1;
  display: flex;
  overflow: hidden; /* Asigură că wrapper-ul gestionează scroll-ul intern */
  padding: 0 20px 20px 20px; /* Adaugă padding la stânga, dreapta și JOS */
  /* Sus este deja gestionat de margin-bottom al .mode-toggle */
}

/* Media Queries for App.vue header (reconfirmat) */
@media (max-width: 576px) {
  .mode-toggle {
    padding: 10px;
    gap: 10px;
    margin-bottom: 10px;
  }
  .mode-toggle button {
    padding: 6px 12px;
    font-size: 0.85rem;
  }

  .main-content-wrapper {
    padding: 0 10px 10px 10px; /* Reduce padding-ul pe mobil */
  }
}
</style>