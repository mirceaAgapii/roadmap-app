<template>
    <div class="vertical-roadmap" @click="handleClickOutside">
        <!-- Roadmap Tabs -->
        <div class="roadmap-tabs">
            <button v-for="(roadmap, index) in roadmaps" :key="index" @click="selectRoadmap(index)"
                :class="{ active: index === selectedRoadmapIndex }">
                {{ roadmap.generalTitle }}
            </button>
        </div>

        <div class="roadmap-structure">
            <svg id="svgContainer" class="svg-lines"></svg>

            <div class="roadmap-row" v-for="(level, levelIndex) in selectedRoadmap.roadmap" :key="levelIndex">
                <!-- Stânga: topicuri impare -->
                <div>
                    <div v-for="(topic, i) in level.children.filter((_, idx) => idx % 2 === 0)"
                        :key="'left-' + levelIndex + '-' + i" :id="'topic-left-' + levelIndex + '-' + i"
                        class="topic-card" @click.stop="selectItem(topic)">
                        <h3>{{ topic.title }}</h3>
                    </div>
                </div>

                <!-- Mijloc: nivelul -->
                <div :id="'level-' + levelIndex" class="level-label">
                    {{ level.title }}
                </div>

                <!-- Dreapta: topicuri pare -->
                <div>
                    <div v-for="(topic, i) in level.children.filter((_, idx) => idx % 2 !== 0)"
                        :key="'right-' + levelIndex + '-' + i" :id="'topic-right-' + levelIndex + '-' + i"
                        class="topic-card" @click.stop="selectItem(topic)">
                        <h3>{{ topic.title }}</h3>
                    </div>
                </div>
            </div>
        </div>

        <div class="overlay" v-if="selectedItem" @click="selectedItem = null"></div>
        <div ref="sidebar" class="sidebar" :class="{ show: selectedItem }">
            <h2>{{ selectedItem && selectedItem.title }}</h2>
            <p>{{ selectedItem && selectedItem.description }}</p>
            <div class="resources" v-if="selectedItem && selectedItem.resources && selectedItem.resources.length">
                <h3>Resources</h3>
                <ul>
                    <li v-for="(res, i) in selectedItem.resources" :key="i">
                        <a :href="res.url" target="_blank">{{ res.text }}</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { nextTick } from 'vue';

export default {
    name: 'RoadmapVertical',
    data() {
        return {
            roadmaps: [],
            selectedRoadmapIndex: 0,
            selectedItem: null
        };
    },
    computed: {
        selectedRoadmap() {
            return this.roadmaps[this.selectedRoadmapIndex] || { roadmap: [] };
        }
    },
    mounted() {
        this.loadRoadmaps();
        this.drawLevelConnections();
        window.addEventListener('resize', () => {
            this.drawLines();
            this.drawLevelConnections();
        });
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.drawLines);
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
            this.$nextTick(() => {
                this.drawLines();
                this.drawLevelConnections();
            });
        },
        selectItem(item) {
            this.selectedItem = item;
        },
        handleClickOutside(event) {
            const sidebar = this.$refs.sidebar;
            const clicked = event.target.closest('.topic-card');
            if (!sidebar.contains(event.target) && !clicked) {
                this.selectedItem = null;
            }
        },
        drawLines() {
            nextTick(() => {
                const svg = document.getElementById("svgContainer");
                if (!svg) return;
                svg.innerHTML = "";

                this.selectedRoadmap.roadmap.forEach((level, levelIndex) => {
                    const levelEl = document.getElementById('level-' + levelIndex);
                    if (!levelEl) return;

                    const svgRect = svg.getBoundingClientRect();
                    const levelRect = levelEl.getBoundingClientRect();
                    const levelCenterY = levelRect.top + levelRect.height / 2 - svgRect.top;
                    const levelLeftX = levelRect.left - svgRect.left;
                    const levelRightX = levelRect.right - svgRect.left;

                    level.children.forEach((_, childIndex) => {
                        const isEven = childIndex % 2 === 0;
                        const side = isEven ? 'left' : 'right';
                        const topicEl = document.getElementById(`topic-${side}-${levelIndex}-${Math.floor(childIndex / 2)}`);
                        if (!topicEl) return;

                        const topicRect = topicEl.getBoundingClientRect();
                        const topicCenterY = topicRect.top + topicRect.height / 2 - svgRect.top;
                        const topicLeftX = topicRect.left - svgRect.left;
                        const topicRightX = topicRect.right - svgRect.left;

                        const x1 = isEven ? topicRightX : levelRightX;
                        const y1 = isEven ? topicCenterY : levelCenterY;
                        const x2 = isEven ? levelLeftX : topicLeftX;
                        const y2 = isEven ? levelCenterY : topicCenterY;

                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        const curve = `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
                        path.setAttribute('d', curve);
                        path.setAttribute('stroke', '#0388fc');
                        path.setAttribute('stroke-width', '2');
                        path.setAttribute('fill', 'none');
                        path.setAttribute('stroke-dasharray', '4,4');
                        svg.appendChild(path);
                    });
                });
            });
        },
        drawLevelConnections() {
            nextTick(() => {
                const svg = document.getElementById("svgContainer");
                if (!svg) return;

                this.selectedRoadmap.roadmap.forEach((_, i) => {
                    if (i >= this.selectedRoadmap.roadmap.length - 1) return;

                    const fromEl = document.getElementById(`level-${i}`);
                    const toEl = document.getElementById(`level-${i + 1}`);
                    if (!fromEl || !toEl) return;

                    const svgRect = svg.getBoundingClientRect();
                    const fromRect = fromEl.getBoundingClientRect();
                    const toRect = toEl.getBoundingClientRect();

                    const x1 = fromRect.left + fromRect.width / 2 - svgRect.left;
                    const y1 = fromRect.bottom - svgRect.top;

                    const x2 = toRect.left + toRect.width / 2 - svgRect.left;
                    const y2 = toRect.top - svgRect.top - toRect.height / 2;

                    // definește marker
                    const markerId = `arrowhead-level-${i}`;
                    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
                    marker.setAttribute("id", markerId);
                    marker.setAttribute("markerWidth", "8");
                    marker.setAttribute("markerHeight", "8");
                    marker.setAttribute("refX", "0");
                    marker.setAttribute("refY", "3");
                    marker.setAttribute("orient", "auto");
                    marker.setAttribute("markerUnits", "strokeWidth");

                    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    arrow.setAttribute("d", "M0,0 L0,6 L6,3 z");
                    arrow.setAttribute("fill", "#0388fc");
                    marker.appendChild(arrow);

                    svg.appendChild(marker);

                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
                    path.setAttribute("stroke", "#0388fc");
                    path.setAttribute("stroke-width", "2");
                    path.setAttribute("stroke-dasharray", "4,4");
                    path.setAttribute("fill", "none");
                    path.setAttribute("marker-end", `url(#${markerId})`);

                    svg.appendChild(path);
                });
            });
        }


    }
};
</script>

<style scoped>
.vertical-roadmap {
    display: flex;
    flex-direction: column;
    padding: 20px;
    position: relative;
    height: 100vh;
    overflow: auto;
}

.roadmap-tabs {
    text-align: center;
    margin-bottom: 20px;
}

.roadmap-tabs button {
    margin: 0 5px;
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    background: #eee;
    cursor: pointer;
    font-weight: bold;
}

.roadmap-tabs .active {
    background: #ffeb3b;
}

.roadmap-structure {
    display: flex;
    flex-direction: column;
    gap: 30px;
    position: relative;
    padding: 40px;
}

.roadmap-row {
    display: grid;
    grid-template-columns: 1fr 150px 1fr;
    /* sau 1fr min-content 1fr */
    align-items: center;
    gap: 20px;
}

.svg-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.levels-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    gap: 50px;
}

.level-label {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #ffeb3b;
    padding: 6px 12px;
    border-radius: 9999px;
    font-weight: bold;
    text-align: center;
    z-index: 1;
    min-width: 120px;
}


.topics-columns {
    display: flex;
    flex: 1;
    justify-content: space-between;
    padding: 0 20px;
    z-index: 2;
}

.left-column,
.right-column {
    display: flex;
    flex-direction: column;
    gap: 40px;
    flex: 1;
}

.topic-card {
    background: #fffbe6;
    padding: 5px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    max-width: 280px;
    text-align: center;
    margin: 8px auto;
}

.sidebar {
    position: fixed;
    top: 0;
    right: 0;
    background: white;
    width: 320px;
    height: 100%;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    z-index: 999;
    overflow: auto;
}

.sidebar::-webkit-scrollbar {
    width: 8px;
}

.sidebar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}


.sidebar.show {
    transform: translateX(0);
}

.sidebar li {
    list-style: none;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 998;
}

.resources {
    padding-bottom: 50px;
}

.resources li {
    text-align: left;
}
</style>