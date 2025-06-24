<template>
  <div class="modern-roadmap">
    <!-- Sidebar Roadmap List -->
    <aside class="sidebar">
      <h2>Roadmaps</h2>
      <ul>
        <li v-for="(rm, index) in roadmaps" :key="index" :class="{ active: index === selectedRoadmapIndex }"
          @click="selectRoadmap(index)">
          {{ rm.generalTitle }}
        </li>
      </ul>
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
        <div v-if="selectedItem.resources && selectedItem.resources.length">
          <h3>Resources</h3>
          <ul>
            <li v-for="(res, i) in selectedItem.resources" :key="i">
                <span v-if="!res.url">{{ res.text }}</span>
                <a v-if="res.url" :href="res.url" target="_blank">{{ res.text }}</a>
            </li>
          </ul>
        </div>
      </div>
    <!-- </transition> -->
  </div>
</template>

<script>
export default {
  name: 'RoadmapModern',
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

      fetch('http://localhost:3001/api/views/' + this.selectedRoadmap.generalTitle , {method: 'POST'})
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
  grid-template-rows: 1fr auto; /* conținut + footer */
  grid-template-areas:
    "sidebar main"
    "sidebar footer";
  height: auto;
  font-family: 'Segoe UI', Roboto, sans-serif;
  background: var(--primary-text);
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
}

.sidebar {
  grid-area: sidebar;
  width: 250px;
  background: var(--primary-background);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.04);
  height: 100%;
  box-sizing: border-box;
}

.sidebar h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #fdfaff;
}

.sidebar ul {
  padding: 0;
  list-style: none;
}

.sidebar li {
  background: var(--primary-background);
  padding: 10px 14px;
  margin-bottom: 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s;
  font-weight: 500;
  color: #f5f5f6a1;
  text-align: left;
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

.content {
  grid-area: main;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background-color: var(--main-content-bg);
  padding: 35px;
}

.roadmap-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: left;
}

.level-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.level-tabs button {
  padding: 10px 20px;
  border: none;
  border-radius: 999px;
  background: var(--not-active-bg);
  font-weight: 500;
  color: var(--primary-text);
  cursor: pointer;
  transition: all 0.2s ease;
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
  gap: 20px;
}

.topic-card {
  background: var(--topic-card-bg);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.topic-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.topic-title {
  font-weight: 700;
  font-size: 16px;
  text-align: left;
  margin-bottom: 12px;
}

.tags {
  display: flex;
  justify-content: left;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--not-active-bg);
  color: var(--primary-text);
  font-weight: 500;
}

.details-drawer {
  grid-area: footer;
  background: var(--drawer-bg);
  border-radius: 16px;
  padding: 0 24px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  height: 450px;
  text-align: left;
  color: var(--primary-text);
}

.details-drawer h2 {
  font-size: 30px;
  font-weight: 700;
}

.details-drawer p {
  font-size: 20px;
  color: var(--primary-text);
}

.details-drawer h3 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
}

.details-drawer ul {
  list-style-type: disc;
  padding-left: 20px;
}

.details-drawer li {
  position: relative;
  font-size: 18px;
}

.details-drawer li a {
  color: #9191ee;
  text-decoration: none;
  transition: color 0.2s ease;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>