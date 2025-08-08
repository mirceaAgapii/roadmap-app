<template>
  <div class="roadmap-horizon-layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <h2>{{ roadmap.generalTitle }}</h2>
    </aside>
    <!-- MAIN CONTENT -->
    <main class="main-content">
      <div class="roadmap-horizontal">
        <div
          v-for="(direction, dIdx) in roadmap.directions"
          :key="dIdx"
          class="roadmap-row"
        >
          <div class="direction-card sticky">{{ direction.title }}</div>
          <div class="subtopics-scroll">
            <div
              v-for="(sub, sIdx) in direction.subtopics"
              :key="sIdx"
              class="subtopic-card"
              :class="levelClass(sub.level)"
              @mouseenter="hovered = dIdx + '-' + sIdx"
              @mouseleave="hovered = null"
              @click="openDrawer(sub)"
            >
              <!-- CARD MIC colorat -->
              <div class="card-dot"></div>
              <!-- CARD HOVER (popup, nu mută layout) -->
              <transition name="grow">
                <div
                  v-if="hovered === dIdx + '-' + sIdx"
                  class="subtopic-hover-abs"
                >
                  <div class="subtopic-title">{{ sub.title }}</div>
                  <span class="badge">{{ sub.level }}</span>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </main>
    <!-- DRAWER bottom -->
    <div v-if="drawer" class="drawer-backdrop" @click="drawer = null">
      <div class="drawer" @click.stop>
        <h2>{{ drawer.title }}</h2>
        <div v-if="drawer.level" class="badge" style="margin-bottom:8px">{{ drawer.level }}</div>
        <div v-if="drawer.resources && drawer.resources.length">
          <h4>Resources</h4>
          <ul>
            <li v-for="(res, i) in drawer.resources" :key="i">
              <span>{{ res.type }}:</span> {{ res.text }}
            </li>
          </ul>
        </div>
        <button @click="drawer = null" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RoadmapHorizonLayout",
  data() {
    return {
      hovered: null,
      drawer: null,
      roadmap: {
        generalTitle: "Java",
        directions: [
          {
            title: "Language & Ecosystem",
            subtopics: [
              {
                title: "Java fundamentals (syntax, OOP, collections, streams, exception handling, concurrency, generics)",
                level: "junior",
                resources: [
                  { type: "BOOK", text: "Effective Java [Joshua Bloch]", url: "" },
                  { type: "BOOK", text: "Java: The Complete Reference [Herbert Schildt]", url: "" },
                  { type: "BOOK", text: "Java 8 in Action. Lambdas, Streams, and functional-style programming [Raoul-Gabriel Urma, Mario Fusco, Alan Mycroft]", url: "" },
                  { type: "BOOK", text: "The Well-Grounded Java Developer, Second Edition [Benjamin Evans, Martijn Verburg, Jason Clark]", url: "" },
                  { type: "BOOK", text: "OCP Oracle Certified Professional Java SE 17 Developer Study Guide [Jeanne Boyarsky, Scott Selikoff]", url: "" }
                ]
              },
              {
                title: "Java 8+ features (lambdas, functional interfaces, CompletableFuture)",
                level: "middle",
                resources: [
                  { type: "BOOK", text: "Java 8 in Action. Lambdas, Streams, and functional-style programming [Raoul-Gabriel Urma, Mario Fusco, Alan Mycroft]", url: "" },
                  { type: "BOOK", text: "Effective Java [Joshua Bloch]", url: "" }
                ]
              }
            ]
          },
          {
            title: "Frameworks",
            subtopics: [
              {
                title: "Spring Boot basics (REST APIs, controllers, services)",
                level: "junior",
                resources: [
                  { type: "VIDEO", text: "Spring Boot Crash Course - Java Brains", url: "" },
                  { type: "BOOK", text: "Spring Boot in Action [Craig Walls]", url: "" },
                  { type: "BOOK", text: "RESTful Web Services [Leonard Richardson, Sam Ruby]", url: "" }
                ]
              },
              {
                title: "Spring Data JPA (CRUD operations, Hibernate, JDBC, transaction management)",
                level: "middle",
                resources: [
                  { type: "BOOK", text: "Java Persistence with Hibernate [Christian Bauer, Gavin King]", url: "" }
                ]
              }
            ]
          }
        ]
      }
    };
  },
  methods: {
    openDrawer(sub) {
      this.drawer = sub;
    },
    levelClass(level) {
      return {
        "level-trainee": level === "trainee",
        "level-junior": level === "junior",
        "level-middle": level === "middle",
        "level-middleplus": level === "middle+",
        "level-senior": level === "senior"
      };
    }
  }
};
</script>

<style scoped>
.roadmap-horizon-layout {
  display: flex;
  height: 100vh;
  background: #f6f7fb;
}
.sidebar {
  width: 230px;
  background: #222a34;
  color: #fff;
  padding: 32px 18px;
  min-height: 100vh;
  box-sizing: border-box;
}
.main-content {
  flex: 1;
  overflow: auto;
  padding: 32px 24px;
  background: #f6f7fb;
  min-height: 100vh;
}
.roadmap-horizontal {
  width: 100%;
  padding: 32px 0;
}
.roadmap-row {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  overflow: visible !important;
}
.direction-card {
  min-width: 260px;
  font-weight: bold;
  font-size: 1.1rem;
  background: #eee;
  padding: 28px 16px;
  border-radius: 16px;
  text-align: center;
  margin-right: 16px;
  position: sticky;
  left: 0;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.subtopics-scroll {
  display: flex;
  gap: 18px;
  position: relative;
  overflow: visible !important;
}
.subtopic-card {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible !important;
}
.card-dot {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: inherit;
  transition: background 0.15s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.subtopic-card.level-trainee .card-dot { background: #f9f9f9; }
.subtopic-card.level-junior .card-dot { background: #b7e7a0; }
.subtopic-card.level-middle .card-dot { background: #ffe480; }
.subtopic-card.level-middleplus .card-dot { background: #ffbe76; }
.subtopic-card.level-senior .card-dot { background: #ff7979; }
.subtopic-hover-abs {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 240px;
  height: 110px;
  transform: translate(-50%, -50%) scale(1.05);
  z-index: 20;
  background: inherit;
  border-radius: 16px;
  box-shadow: 0 6px 30px 0 rgba(0,0,0,0.18);
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  pointer-events: none;
}
.subtopic-title {
  font-size: 1rem;
  font-weight: 500;
  color: #222;
  margin-bottom: 7px;
}
.badge {
  background: #fff;
  color: #212121;
  border-radius: 8px;
  padding: 2px 10px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.drawer-backdrop {
  position: fixed;
  left: 0; right: 0; bottom: 0; top: 0;
  background: rgba(0,0,0,0.25);
  z-index: 30;
  display: flex;
  align-items: flex-end;
}
.drawer {
  background: #fff;
  width: 100%;
  max-width: 500px;
  margin: auto;
  border-radius: 24px 24px 0 0;
  padding: 32px 24px 24px 24px;
  min-height: 200px;
  box-shadow: 0 -4px 28px rgba(0,0,0,0.18);
  position: relative;
}
.close-btn {
  background: #eee;
  border: none;
  border-radius: 8px;
  padding: 8px 22px;
  font-weight: bold;
  margin-top: 16px;
  cursor: pointer;
}
.grow-enter-active, .grow-leave-active {
  transition: all 0.15s cubic-bezier(.57,.07,.51,.97);
}
.grow-enter, .grow-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>
