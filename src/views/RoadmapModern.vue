<template>
  <div class="modern-roadmap">
    <!-- Sidebar Roadmap List -->
    <aside class="sidebar">
      <div>
        <h2>Roadmaps</h2>
        <ul>
          <li v-for="(rm, index) in roadmaps" :key="index" :class="{ active: index === selectedRoadmapIndex }"
            @click="selectRoadmap(index)">
            {{ rm.generalTitle }}
          </li>
        </ul>
      </div>
      <span class="header-toggle-button" @click="emitToggleHeader">
            Toggle Header Visibility
      </span>
    </aside>

    <!-- Main Content -->
    <div class="content" v-if="selectedRoadmap && selectedLevel" @click.self="clearSelectedItem()">
      <h1 class="roadmap-title">{{ selectedRoadmap.generalTitle }}</h1>

      <!-- Tabs for Levels -->
      <div class="level-tabs" @click="clearSelectedItem()">
        <button v-for="(level, index) in selectedRoadmap.roadmap" :key="index"
          :class="{ active: index === selectedLevelIndex }" @click="selectedLevelIndex = index">
          {{ level.title }}
        </button>
      </div>

      <!-- Grid of Topics -->
      <div class="topics-grid" @click.self="clearSelectedItem()">
        <div v-for="(topic, index) in selectedLevel.children" :key="index" class="topic-card"
          @click="selectItem(topic)">
          <div class="topic-title">{{ topic.title }}</div>
          <div class="tags">
            <span v-for="(tag, i) in topic.tags" :key="i" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>


    <!-- Bottom Drawer Details -->
    <!-- <transition name="slide-up"> -->
    <div class="details-drawer" v-if="selectedItem">
      <h2>{{ selectedItem.title }}</h2>
      <p>{{ selectedItem.description }}</p>
      <h3>Subtopics</h3>
      <ul class="subtopics-list">
        <li v-for="(subtopic, i) in selectedItem.subtopics" :key="i">
          <span v-if="subtopic.title">{{ subtopic.title }}</span>
        </li>
      </ul>
      <div v-if="selectedItem.resources && selectedItem.resources.length">
        <h3>Resources</h3>
        <ul class="resource-list">
          <li v-for="(res, i) in selectedItem.resources" :key="i">
            <span class="icon">{{ getResourceIcon(res.type) }}</span>
            <span v-if="!res.url">{{ res.text }}</span>
            <a v-else :href="res.url" target="_blank" rel="noopener noreferrer">
              {{ res.text }}
            </a>
          </li>
        </ul>

      </div>
    </div>
  </div>
</template>

<script>
import { getResourceIcon } from '@/utils/getResourceIcon';

export default {
  name: 'RoadmapModern',
  props: {
    showHeader: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      roadmaps: [],
      selectedRoadmapIndex: 0,
      selectedLevelIndex: 0,
      selectedItem: null
    };
  },
  computed: {
    selectedRoadmap() {
      return this.roadmaps.length > 0
        ? this.roadmaps[this.selectedRoadmapIndex]
        : null;
    },
    selectedLevel() {
      return this.selectedRoadmap && this.selectedRoadmap.roadmap.length > 0
        ? this.selectedRoadmap.roadmap[this.selectedLevelIndex]
        : null;
    }
  }
  ,
  mounted() {
    this.loadRoadmaps();
  },
  methods: {
    emitToggleHeader() {
      this.$emit('toggle-header');
    },
    getResourceIcon,
    async loadRoadmaps() {
      try {
        const indexRes = await fetch('/roadmaps/index.json');
        const files = await indexRes.json();

        const roadmapPromises = files.map(file =>
          fetch(`/roadmaps/${file}`).then(res => res.json())
        );

        this.roadmaps = await Promise.all(roadmapPromises);
      } catch (err) {
        console.error("Failed to load roadmaps:", err);
      }
    },
    selectRoadmap(index) {
      this.selectedRoadmapIndex = index;
      this.selectedLevelIndex = 0;
      this.selectedItem = null;

      fetch('http://localhost:3001/api/views/' + this.selectedRoadmap.generalTitle, { method: 'POST' })
    },
    selectItem(item) {
      this.selectedItem = item;
    },
    clearSelectedItem() {
      this.selectedItem = null;
    }
  }
};
</script>

<style scoped>
.modern-roadmap {
  display: grid;
  grid-template-columns: 250px 1fr; 
  grid-template-rows: 1fr auto; 
  grid-template-areas:
    "sidebar main"
    "sidebar details-drawer"; 
  font-family: 'Segoe UI', Roboto, sans-serif;
  background: transparent; /* Setăm fundalul transparent pentru a vedea fundalul App.vue */
  gap: 20px; /* Spațiere între elementele grilei */
  padding: 0; /* Padding-ul exterior ar trebui gestionat de .main-content-wrapper din App.vue */
  box-sizing: border-box;
  /* Nou: asigură că .modern-roadmap ocupă tot spațiul disponibil de la părintele său */
  width: 100%;
  height: 100%;
  overflow: hidden; /* Important pentru a gestiona scroll-ul intern */
}

/* Sidebar */
.sidebar {
  grid-area: sidebar;
  background: var(--primary-background);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  /* ESENȚIAL: Facem sidebar-ul un container flex vertical */
  display: flex;
  flex-direction: column;
  /* NOU: Adaugă o înălțime minimă pentru a asigura spațiu vizual, dar permite să crească */
  min-height: 200px; /* Ajustează dacă vrei un sidebar mai mic inițial */
  justify-content: space-between;
}

.sidebar h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #fdfaff;
  flex-shrink: 0; /* Împiedică titlul să se micșoreze */
}

.roadmap-list-wrapper {
  flex-grow: 1; /* Permite acestui wrapper să ocupe tot spațiul vertical disponibil */
  overflow-y: auto; /* Aici va fi scrollbar-ul pentru listă, dacă e prea lungă */
  margin-bottom: 10px; /* Un pic de spațiu între listă și butonul de jos */
  -webkit-overflow-scrolling: touch; /* Îmbunătățește scroll-ul pe iOS */
}

.sidebar ul {
  padding: 0;
  list-style: none;
}

.sidebar li {
  background: var(--primary-background);
  padding: 0.625rem 0.875rem;
  margin-bottom: 0.5rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s;
  font-weight: 500;
  color: #f5f5f6a1;
  text-align: left;
}

.header-toggle-button {
    /* Folosim aceleași stiluri de bază ca celelalte li, dar le suprascriem */
    background: transparent !important;
    color: rgba(255, 255, 255, 0.3) !important; /* Discret */
    font-size: 0.8rem;
    text-align: center;
    box-shadow: none !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1); /* Linie subtilă de separare */
    padding-top: 10px; /* Un pic de spațiu de la linie */
    margin-top: 10px; /* Și spațiu de la elementul de deasupra */
    border-radius: 0 0 16px 16px; /* Doar colțurile de jos rotunjite, dacă vrei */
    /* Sau păstrează 10px ca celelalte li dacă preferi */
    border-radius: 10px;
}

.header-toggle-button:hover {
    color: rgba(255, 255, 255, 0.6) !important; /* Devine mai vizibil la hover */
    background: transparent !important;
}

.sidebar li.active {
  background: var(--primary-text);
  color: var(--primary-background);
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar li:hover {
  background: var(--primary-text);
  color: var(--primary-background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Main Content */
.content {
  grid-area: main; /* Ocupă doar rândul "main" */
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background-color: var(--main-content-bg);
  box-sizing: border-box;
  overflow-y: auto; /* Scroll vertical pentru conținutul principal */
  min-height: 0; /* Permite micșorarea */
  position: relative; /* Pentru a poziționa elemente absolut dacă e cazul */
  padding: 0 10px;
}

.roadmap-title {
  font-size: 1.625rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: left;
  flex-shrink: 0; /* Previne micșorarea titlului */
}

.level-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  flex-shrink: 0; /* Previne micșorarea butoanelor */
}

.level-tabs button {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 999px;
  background: var(--not-active-bg);
  font-weight: 500;
  color: var(--primary-text);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.level-tabs button:hover {
  background: var(--primary-text);
  color: var(--primary-background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.level-tabs button.active {
  background: var(--primary-background);
  color: var(--primary-text);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}

.topic-card {
  background: var(--topic-card-bg);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1.25rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  max-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.topic-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.topic-title {
  font-weight: 700;
  font-size: 1rem;
  text-align: left;
  margin-bottom: 0.75rem;
}

.tags {
  display: flex;
  justify-content: left;
  gap: 0.375rem;
  flex-wrap: wrap;
  margin-top: auto;
}

.tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  background: var(--plain-text);
  color: var(--primary-text);
  font-weight: 500;
}

/* Details Drawer (sertarul de jos) */
.details-drawer {
  grid-area: details-drawer; /* Acum are propria sa zonă în grid */
  background: var(--drawer-bg);
  border-radius: 16px; /* Colțuri rotunjite */
  padding: 24px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* Foarte important pentru scroll intern */

  /* NOUL MOD DE A LIMTA ÎNĂLȚIMEA */
  height: auto; /* Permitem să se adapteze */
  max-height: 35vh; /* Ocupă maxim 35% din înălțimea viewport-ului */
  /* Puteți ajusta '35vh' în funcție de cât de mult doriți să vadă din topic-uri */

  text-align: left;
  color: var(--primary-text);
  /* Adaugăm un margin-bottom la nivelul containerului părinte (.modern-roadmap) */
  /* sau îl facem pe el să aibă o margine de jos. */
  /* Pentru a avea margini în jurul lui, .modern-roadmap ar trebui să aibă padding. */
  /* Dacă .modern-roadmap este flex-grow: 1 în .main-content-wrapper, atunci */
  /* .main-content-wrapper ar trebui să aibă padding. */
}

.details-drawer h2 {
  font-size: 1.875rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.details-drawer p {
  font-size: 1.25rem;
  color: var(--primary-text);
  margin-bottom: 1rem;
}

.details-drawer h3 {
  font-size: 1.375rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.details-drawer ul {
  list-style-type: disc;
  padding-left: 1.25rem;
}

.details-drawer li {
  position: relative;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.details-drawer li a {
  color: #9191ee;
  text-decoration: none;
  transition: color 0.2s ease;
}

.resource-list {
  list-style: none;
  padding: 0;
}

.resource-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.icon {
  width: 1.5rem;
  text-align: center;
  flex-shrink: 0;
}

/* Stiluri pentru animația slide-up (dacă este folosită cu Vue transition) */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}


/* --- Media Queries pentru Responsivitate --- */

/* Pentru ecrane mai mici (de exemplu, tablete în modul portret și telefoane mari) */
@media (max-width: 992px) {
  .modern-roadmap {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      "sidebar"
      "main"
      "details-drawer";
    gap: 15px;
    padding: 0;
  }

  .sidebar {
    width: auto;
    max-height: 200px;
    /* overflow-x: auto; - Mutăm acest overflow pe ul */
    /* white-space: nowrap; - Mutăm acest nowrap pe li, sau îl eliminăm dacă vrem wrap la text în interiorul butonului */
    padding: 15px;
    margin: 0 0 15px 0;
    /* NOU: Facem sidebar-ul flex container pentru a aranja lista de roadmaps */
    display: flex;
    flex-direction: column; /* Asigură că h2 și ul sunt pe coloană */
  }
  .sidebar h2 {
    flex-shrink: 0; /* Previne micșorarea titlului */
    margin-bottom: 10px; /* Asigură spațiu */
  }

  .sidebar ul {
    display: flex; /* Face lista de roadmaps să fie un container flex */
    gap: 10px;
    overflow-x: auto; /* Aici este cheia: scroll orizontal pe UL */
    -webkit-overflow-scrolling: touch; /* Îmbunătățește scroll-ul pe iOS */
    padding-bottom: 5px; /* Adaugă un pic de padding pentru scrollbar, dacă e vizibil */
    margin-bottom: -5px; /* Compensează padding-ul de jos */
  }
  .sidebar li {
    flex-shrink: 0; /* Important: Fiecare element li nu se va micșora */
    /* NOU: Lățime fixă sau minimă pentru butoane pentru a garanta că nu se taie textul */
    min-width: 80px; /* Ajustează această valoare după nevoi */
    /* Dacă vrei ca textul să se încadreze și să nu fie tăiat, poți folosi: */
    /* white-space: normal; */
    /* text-overflow: ellipsis; /* Dar asta necesită overflow: hidden și white-space: nowrap; */
    /* Cel mai simplu este să te asiguri că au o lățime suficientă sau să le lași să se extindă cu scroll. */
    border-bottom: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    text-align: center; /* Centrează textul în butoane */
  }
  .sidebar li:last-child {
    border-bottom: none;
  }

  .content {
    padding: 20px;
    min-height: 250px;
    /* NOU: Adăugăm flexbox la content pentru a centra grila */
    display: flex;
    flex-direction: column; /* Păstrează elementele pe coloană */
    align-items: center; /* Centrează orizontal conținutul */
  }

  .roadmap-title,
  .level-tabs {
    width: 100%; /* Ocupă lățimea disponibilă */
    text-align: left; /* Asigură alinierea la stânga pentru text */
  }

  .level-tabs button {
    padding: 8px 16px;
    font-size: 0.9rem;
  }

  .topics-grid {
    /* NOU: Reintroducem minmax, dar cu o lățime maximă pentru grilă */
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); /* Rămâne la fel ca pe desktop */
    gap: 15px;
    width: 100%; /* Ocupă lățimea disponibilă în .content */
    max-width: 600px; /* Limită lățimea maximă a grilei pe ecrane mai mici */
    /* Centrare va fi dată de align-self pe .content */
  }

  .topic-card {
    padding: 15px;
    /* Min-height este deja setat, nu mai trebuie aici */
  }

  .topic-title {
    font-size: 0.95rem;
  }

  .details-drawer {
    max-height: 40vh; /* Ajustăm și mai mult pentru a fi mai mic pe mobil */
    padding: 20px;
    /* Adăugăm o margine de sus și jos pentru a-l separa de elementele învecinate */
    margin-top: 15px; /* Margine sus */
    margin-bottom: 0; /* Lăsăm marginea de jos să vină de la padding-ul main-content-wrapper */
  }
  .details-drawer h2 {
    font-size: 1.5rem;
  }
  .details-drawer p {
    font-size: 1rem;
  }
  .details-drawer h3 {
    font-size: 1.15rem;
  }
  .details-drawer li {
    font-size: 1rem;
  }
}

/* Pentru ecrane foarte mici (telefoane) */
@media (max-width: 576px) {
  .modern-roadmap {
    padding: 0;
    gap: 10px;
  }

  .sidebar {
    padding: 10px;
    max-height: 150px;
    margin: 0 0 10px 0;
  }
  .sidebar h2 {
    font-size: 1rem;
    margin-bottom: 0.8rem;
  }
  .sidebar ul {
    gap: 8px;
    /* min-height: 40px; /* Optional: Asigură o înălțime minimă pentru rândul de butoane */
  }
  .sidebar li {
    padding: 6px 10px;
    font-size: 0.9rem;
    min-width: 70px; /* Ajustează această valoare pentru telefoane */
  }

  .content {
    padding: 15px;
    min-height: 200px;
  }

  .roadmap-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .level-tabs {
    gap: 8px;
    margin-bottom: 1rem;
  }
  .level-tabs button {
    padding: 6px 12px;
    font-size: 0.85rem;
  }

  .topics-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .topic-card {
    padding: 12px;
    min-height: 100px;
  }
  
  .topic-title {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  .tag {
    font-size: 0.7rem;
    padding: 3px 8px;
  }

  .details-drawer {
    max-height: 50vh; /* Ajustăm pentru a lăsa spațiu pentru topic-uri */
    padding: 15px;
    margin-top: 10px;
    margin-bottom: 0;
  }
  .details-drawer h2 {
    font-size: 1.3rem;
  }
  .details-drawer p {
    font-size: 0.9rem;
  }
  .details-drawer h3 {
    font-size: 1rem;
  }
  .details-drawer li {
    font-size: 0.9rem;
  }
}
</style>