<template>
  <div class="roadmap" v-if="selectedRoadmap" @click="handleClickOutside">
    <h1>{{ selectedRoadmap.generalTitle }}</h1>

    <!-- Tabs for selecting roadmaps -->
    <div class="roadmap-tabs">
      <button v-for="(roadmap, index) in roadmaps" :key="index" @click="selectRoadmap(index)"
        :class="{ active: index === selectedRoadmapIndex }">
        {{ roadmap.generalTitle }}
      </button>
    </div>

    <div class="roadmap-container">
      <svg id="svgContainer" class="svg-lines"></svg>

      <div v-for="(item, index) in selectedRoadmap.roadmap" :key="index" class="roadmap-item-container">
        <!-- Parent -->
        <div :id="'parent-' + index" class="roadmap-item-parent">
          <div class="roadmap-item" @click.stop="selectItem(item)">
            <h2>{{ item.title }}</h2>
          </div>
        </div>

        <!-- Children -->
        <div v-if="item.children" class="roadmap-children">
          <div v-for="(child, childIndex) in item.children" :key="childIndex" class="roadmap-item-container">
            <div :id="'child-' + index + '-' + childIndex" class="roadmap-item" @click.stop="selectItem(child)">
              <h2>{{ child.title }}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay -->
    <div v-if="selectedItem" class="overlay" @click="selectedItem = null"></div>


    <!-- Sidebar with selected item information -->
    <div ref="sidebar" class="sidebar" :class="{ show: selectedItem }">
      <h2 v-if="selectedItem">{{ selectedItem.title }}</h2>
      <p v-if="selectedItem">{{ selectedItem.description }}</p>

      <!-- Resources Footer -->
      <div v-if="selectedItem && selectedItem.resources && selectedItem.resources.length" class="sidebar-footer">
        <h3>Additional Resources</h3>
        <ul>
          <li v-for="(resource, index) in selectedItem.resources" :key="index">
            <a :href="resource.url" target="_blank">{{ resource.text }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { nextTick } from "vue";

export default {
  name: "Roadmap",
  data() {
    return {
      roadmaps: [],
      selectedRoadmapIndex: 0,
      selectedItem: null,
    };
  },
  computed: {
    selectedRoadmap() {
      return this.roadmaps.length > 0 ? this.roadmaps[this.selectedRoadmapIndex] : null;
    }
  },
  mounted() {
    this.loadRoadmaps();
    window.addEventListener("resize", this.drawLines);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.drawLines);
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

        this.$nextTick(() => {
          this.drawLines();
        });
      } catch (err) {
        console.error("Failed to load roadmaps:", err);
      }
    },
    selectRoadmap(index) {
      this.selectedRoadmapIndex = index;
      this.selectedItem = null;
      this.$nextTick(this.drawLines);
    },
    selectItem(item) {
      this.selectedItem = item;
    },
    handleClickOutside(event) {
      const sidebar = this.$refs.sidebar;
      const clickedOnRoadmapItem = event.target.closest(".roadmap-item");

      if (!sidebar.contains(event.target) && !clickedOnRoadmapItem) {
        this.selectedItem = null;
      }
    },
    drawLines() {
      nextTick(() => {
        const svg = document.getElementById("svgContainer");
        if (!svg) return;

        svg.innerHTML = ""; // Clear previous lines

        this.selectedRoadmap.roadmap.forEach((item, index) => {
          const parentElement = document.getElementById(`parent-${index}`).querySelector(".roadmap-item");
          if (!parentElement) return;

          const svgRect = svg.getBoundingClientRect();
          const parentRect = parentElement.getBoundingClientRect();
          const parentX = parentRect.right - svgRect.left;
          const parentY = parentRect.top - svgRect.top + parentRect.height / 2;

          item.children?.forEach((child, childIndex) => {
            const childElement = document.getElementById(`child-${index}-${childIndex}`);
            if (!childElement) return;

            const childRect = childElement.getBoundingClientRect();
            const childX = childRect.left - svgRect.left;
            const childY = childRect.top - svgRect.top + childRect.height / 2;

            this.createLine(svg, parentX, parentY, childX, childY);
          });
        });
      });
    },
    createLine(svg, x1, y1, x2, y2) {
      // If the parent and child are at the same Y level, draw a straight line
      if (y1 === y2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "#0388fc");
        line.setAttribute("stroke-width", "3");
        line.setAttribute("stroke-dasharray", "0,6");  // Dashed line pattern (5px dash, 5px gap)
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
      } else {
        // Calculate control points for the cubic Bézier curve
        const controlX1 = x1 + 50;  // Slightly offset for the first control point
        const controlY1 = y1 + (y2 > y1 ? 50 : -50); // Move the first control point up or down

        const controlX2 = x2 - 50;  // Slightly offset for the second control point
        const controlY2 = y2 + (y2 > y1 ? -50 : 50); // Move the second control point up or down

        // Create a path element for the cubic Bézier curve
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const pathData = `M ${x1} ${y1} C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${x2} ${y2}`;
        path.setAttribute("d", pathData);  // Set the path data for the Bézier curve
        path.setAttribute("stroke", "#0388fc");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("fill", "transparent");  // Don't fill the curve, just stroke it
        path.setAttribute("stroke-dasharray", "0,6");  // Dashed line pattern (5px dash, 5px gap)
        path.setAttribute("stroke-linecap", "round");

        svg.appendChild(path);
      }
    },
  },
};


</script>

<style scoped>
html,
body,
#app {
  height: 100%;
  margin: 0;
}

.roadmap {
  padding: 20px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.roadmap-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  flex-grow: 1;
  position: relative;
}

.roadmap-item-container {
  display: flex;
  align-items: flex-start;
  margin: 10px;
  position: relative;
}

.roadmap-item-parent {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin: 10px;
}

.roadmap-item {
  background-color: #ffeb3b;
  border: 2px solid #fbc02d;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}

.roadmap-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.roadmap-item h2 {
  font-size: 14px;
  margin: 0;
  color: #333;
}

.roadmap-children {
  margin-left: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.svg-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Sidebar Styling */
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  /* Extend from top to bottom */
  background-color: #f9f9f9;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
  opacity: 0;
  pointer-events: none;
  z-index: 1000;
  /* Ensure it is above the overlay */
}

.sidebar.show {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
}

.sidebar h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.sidebar p {
  font-size: 14px;
  margin-bottom: 20px;
}

.sidebar-footer {
  margin-top: 20px;
}

.sidebar-footer h3 {
  font-size: 16px;
  margin-bottom: 10px;
}

.sidebar-footer ul {
  list-style-type: none;
  padding-left: 0;
}

.sidebar-footer ul li {
  margin-bottom: 5px;
}

.sidebar-footer ul li a {
  color: #007bff;
  text-decoration: none;
}

.sidebar-footer ul li a:hover {
  text-decoration: underline;
}

.roadmap-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.roadmap-tabs button {
  padding: 10px 20px;
  border: none;
  background-color: #ddd;
  cursor: pointer;
  margin: 0 5px;
  border-radius: 5px;
  transition: background 0.3s;
}

.roadmap-tabs button.active {
  background-color: #ffeb3b;
  font-weight: bold;
}

.roadmap-tabs button:hover {
  background-color: #fbc02d;
}

/* Overlay Styling */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* Grey out the rest of the screen */
  z-index: 999;
  /* Ensure it is below the sidebar */
}
</style>
