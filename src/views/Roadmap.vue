<template>
  <div class="modern-roadmap-v2">
    <!-- HEADER: one-line list of roadmaps -->
    <header class="rm-header" v-if="roadmaps.length">
      <nav class="rm-header-nav">
        <button v-for="(rm, i) in roadmaps" :key="i" class="rm-header-btn"
          :class="{ active: i === selectedRoadmapIndex }" @click="selectRoadmap(i)">
          {{ rm.title }}
        </button>
      </nav>
    </header>

    <!-- MAIN CONTENT (rows = categories) -->
    <div class="content" v-if="selectedRoadmap" @click.self="clearSelectedItem">
      <h1 class="roadmap-title">{{ selectedRoadmapTitle }}</h1>

      <section class="lanes"
        :style="{ '--rows': (selectedRoadmap && selectedRoadmap.categories ? selectedRoadmap.categories.length : 1) }">
        <div v-for="(category, cIdx) in (selectedRoadmap.categories || [])" :key="cIdx" class="lane-row">
          <div class="lane-flex">
            <div v-for="(topic, tIdx) in (category.category_topics || [])" :key="tIdx" class="topic-card"
              @click="selectItem(topic)">
              <div class="topic-title">
                {{ topic.topic_name }}
              </div>
              <div class="tags">
                <span class="tag">{{ (topic.tags && topic.tags[0]) || '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- CENTERED MODAL -->
    <div class="overlay" v-if="selectedItem" @click.self="clearSelectedItem" tabindex="-1"
      @keydown.esc="clearSelectedItem">
      <div class="modal" role="dialog" aria-modal="true">
        <button class="close" aria-label="Close" @click="clearSelectedItem">×</button>

        <h2 class="title">{{ selectedItem.topic_name }}</h2>

        <section class="block" v-if="selectedItem.description">
          <h3>Description</h3>
          <p>{{ selectedItem.description }}</p>
        </section>

        <section class="block" v-if="hasSubTopics(selectedItem)">
          <h3>Subtopics</h3>
          <ul class="bullets">
            <li v-for="(s, i) in selectedItem.sub_topics" :key="i">
              {{ s.title }}
            </li>
          </ul>
        </section>

        <section class="block" v-if="hasResources(selectedItem)">
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
        </section>
      </div>
    </div>

    <div v-if="!roadmaps.length" class="empty-state">Loading roadmaps…</div>
  </div>
</template>

<script>
import { getResourceIcon } from '@/utils/getResourceIcon';

export default {
  name: 'RoadmapModernV2',
  props: {
    showHeader: { type: Boolean, default: false } // kept for compatibility
  },
  data() {
    return {
      roadmaps: [],               // [{ title, data }]
      selectedRoadmapIndex: 0,
      selectedItem: null
    };
  },
  computed: {
    selectedRoadmap() {
      return (this.roadmaps[this.selectedRoadmapIndex] &&
        this.roadmaps[this.selectedRoadmapIndex].data) || null;
    },
    selectedRoadmapTitle() {
      return (this.roadmaps[this.selectedRoadmapIndex] &&
        this.roadmaps[this.selectedRoadmapIndex].title) || '';
    }
  },
  mounted() {
    this.loadRoadmaps();
  },
  methods: {
    getResourceIcon,
    hasSubTopics(item) {
      return item && item.sub_topics && item.sub_topics.length > 0;
    },
    hasResources(item) {
      return item && item.resources && item.resources.length > 0;
    },
    async loadRoadmaps() {
      try {
        const indexRes = await fetch('/roadmaps/index.json');
        const files = await indexRes.json(); // e.g., ["java.json", …]

        const roadmapPromises = files.map(async (file) => {
          const data = await fetch(`/roadmaps/${file}`).then((res) => res.json());
          const title = data.road_map_title || data.generalTitle || file;
          return { title, data };
        });

        this.roadmaps = await Promise.all(roadmapPromises);

        if (this.roadmaps[0]) this.trackView(this.roadmaps[0].title);
      } catch (err) {
        console.error('Failed to load roadmaps:', err);
      }
    },
    selectRoadmap(index) {
      this.selectedRoadmapIndex = index;
      this.selectedItem = null;
      var rm = this.roadmaps[index];
      if (rm && rm.title) this.trackView(rm.title);
    },
    trackView(title) {
      try {
        fetch('http://localhost:3001/api/views/' + encodeURIComponent(title), { method: 'POST' });
      } catch (e) { /* ignore */ }
    },
    selectItem(item) {
      this.selectedItem = item;
      document.body.style.overflow = 'hidden'; // lock scroll while modal open
    },
    clearSelectedItem() {
      this.selectedItem = null;
      document.body.style.overflow = ''; // unlock scroll
    }
  }
};
</script>

<style scoped>
.modern-roadmap-v2 {
  display: grid;
  grid-template-rows: auto 1fr;
  width: 100%;
  height: 100vh;
  /* full viewport */
  background: transparent;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

/* ===== Header (roadmaps list) ===== */
.rm-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--primary-text, #2d2d2d);
  padding: 10px 16px;
}

.rm-header-nav {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.rm-header-btn {
  white-space: nowrap;
  border: none;
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
  background: var(--primary-background);
  color: var(--primary-text);
  opacity: 0.9;
  transition: opacity .2s, transform .2s;
}

.rm-header-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.rm-header-btn.active {
  background: var(--primary-background);
  opacity: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .15);
}

/* ===== Main content ===== */
.content {
  border-radius: 16px;
  background-color: var(--main-content-bg, transparent);
  box-sizing: border-box;
  overflow: hidden;
  /* prevent scrollbars */
  min-height: 0;
  position: relative;
  padding: 0 10px 60px 10px;
}

.roadmap-title {
  font-size: 1.625rem;
  font-weight: 700;
  margin: 16px 0 12px 0;
  text-align: left;
}

/* ===== Equal-height rows ===== */
.lanes {
  height: 100%;
  display: grid;
  gap: 32px;
  grid-template-rows: repeat(var(--rows, 1), minmax(0, 1fr));
  /* equal heights */
  padding: 6px 10px 20px 10px;
}

.lane-row {
  min-height: 0;
  /* allow shrinking */
  overflow: hidden;
  position: relative;
}

.lane-row:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 15px;
  /* moves it into the gap between rows */
  height: 2px;
  background: linear-gradient(to right,
      transparent,
      rgba(0, 0, 0, 0.12),
      transparent);
  border-radius: 1px;
  pointer-events: none;
  z-index: 1;
  /* make sure it's above backgrounds */
}

.lane-flex {
  height: 100%;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(180px, 1fr);
  gap: 16px;
  align-items: stretch;
  overflow: hidden;
}

/* ===== Topic Card ===== */
.topic-card {
  background: var(--topic-card-bg);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 50%;
  overflow: hidden;
}

.topic-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.topic-title {
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.2;
  margin-bottom: 0.75rem;
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  text-align: left;
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
  max-width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* ===== Centered Modal ===== */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, .5);
  display: grid;
  place-items: center;
}

.modal {
  width: 75vw;
  max-width: 1200px;
  height: 75vh;
  max-height: 900px;
  background: var(--drawer-bg);
  color: var(--primary-text);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .25);
  padding: 24px;
  position: relative;
  overflow: auto;
}

.close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  background: var(--primary-background);
  color: var(--primary-text);
}

.title {
  margin: 0 40px 8px 0;
  font-size: 1.6rem;
  font-weight: 700;
}

.block {
  margin-top: 16px;
}

.block h3 {
  margin: 0 0 8px 0;
  font-size: 1.05rem;
  font-weight: 700;
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

/* ===== Small screens ===== */
@media (max-width: 768px) {
  .topic-card {
    flex: 1 1 200px;
    min-width: 140px;
  }

  .modal {
    width: 92vw;
    height: 85vh;
  }
}

/* ===== Force full-width breakout ===== */
.rm-header,
.content {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
}

.modern-roadmap-v2 .content,
.modern-roadmap-v2 .lanes {
  max-width: none !important;
}
</style>
