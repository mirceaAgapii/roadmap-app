<template>
    <div class="editor-wrapper">
        <aside class="levels-sidebar">
            <h2>Levels</h2>
            <div v-for="(level, index) in levels" :key="index" class="level-item">
                <template v-if="level.editing">
                    <input v-model="level.title" class="level-input" @keyup.enter="confirmEdit(index)" />
                    <div class="level-actions">
                        <button @click="confirmEdit(index)">✔</button>
                        <button @click="deleteLevel(index)">✖</button>
                    </div>
                </template>
                <template v-else>
                    <button :class="['level-button', { active: index === selectedLevelIndex }]"
                        @click="selectedLevelIndex = index">
                        {{ level.title }}
                    </button>
                    <div class="level-actions">
                        <button @click="editLevel(index)">✎</button>
                        <button @click="deleteLevel(index)">🗑</button>
                        <button @click="moveLevel(index, -1)" :disabled="index === 0">⬆</button>
                        <button @click="moveLevel(index, 1)" :disabled="index === levels.length - 1">⬇</button>
                    </div>
                </template>
            </div>
            <button class="add-btn" @click="addLevel">+ Add Level</button>
        </aside>

        <div class="content-area">
            <div class="general-title">
                <label><h2>General Title:</h2></label>
                <input v-model="generalTitle" placeholder="Enter roadmap title" />
            </div>

            <main class="editor-main">
                <h2>Edit Topics for: {{ selectedLevel.title }}</h2>

                <div v-for="(topic, tIndex) in selectedLevel.children" :key="tIndex" class="topic-editor">
                    <input v-model="topic.title" placeholder="Topic title" />
                    <textarea v-model="topic.description" placeholder="Description"></textarea>
                    <div class="tag-editor">
                        <div class="tag-list">
                            <span v-for="(tag, i) in topic.tags" :key="i" class="tag">
                                {{ tag }} <button @click="removeTag(topic, tag)">x</button>
                            </span>
                        </div>
                        <div class="tag-select">
                            <input v-model="newTagInput" @focus="showDropdown = true" @blur="hideDropdownDelayed"
                                @keyup.enter="addTag(selectedLevel.children[selectedLevel.children.length - 1])"
                                placeholder="Add tag" />
                            <div class="tag-dropdown" v-if="showDropdown && availableTags.length">
                                <div class="tag-option" v-for="tag in availableTags" :key="tag">
                                    <div style="display: flex; justify-content: space-between; align-items: center;"
                                        @click="addExistingTag(selectedLevel.children[selectedLevel.children.length - 1], tag)">
                                        <span>{{ tag }}</span>
                                        <button class="remove-tag" @click.stop="removeFromAvailableTags(tag)">✖</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div class="resource-group">
                        <h3>Resources</h3>
                        <div v-for="(res, rIndex) in topic.resources" :key="rIndex" class="resource-inputs">
                            <input v-model="res.text" placeholder="Text" />
                            <input v-model="res.url" placeholder="URL" />
                            <button @click="removeResource(tIndex, rIndex)">Remove</button>
                        </div>
                        <button @click="addResource(tIndex)">Add Resource</button>
                    </div>

                    <button @click="deleteTopic(tIndex)">Delete Topic</button>
                </div>

                <button @click="addTopic">Add New Topic</button>
                <button @click="downloadJSON">Download JSON</button>
            </main>
        </div>
    </div>
</template>

<script>
export default {
    name: "RoadmapEditor",
    data() {
        return {
            generalTitle: '',
            levels: [
                { title: "Trainee", children: [], editing: false },
                { title: "Junior", children: [], editing: false },
                { title: "Middle", children: [], editing: false },
                { title: "Middle+", children: [], editing: false },
                { title: "Senior", children: [], editing: false },
            ],
            selectedLevelIndex: 0,
            availableTags: ['Core', 'Optional', 'Advanced'],
            newTagInput: '',
            showDropdown: false,
        };
    },
    computed: {
        selectedLevel() {
            return this.levels[this.selectedLevelIndex];
        }
    },
    methods: {
        filteredTags(topic) {
            if (!Array.isArray(topic.tags)) return [];
            return this.availableTags.filter(
                tag =>
                    !topic.tags.includes(tag) &&
                    tag.toLowerCase().includes(this.newTagInput?.toLowerCase())
            );
        },
        hideDropdownDelayed() {
            setTimeout(() => {
                this.showDropdown = false;
            }, 150);
        },
        addTopic() {
            this.selectedLevel.children.push({
                title: "",
                description: "",
                tags: [],
                resources: [],
                newTagInput: "",
            });
        },
        deleteTopic(index) {
            this.selectedLevel.children.splice(index, 1);
        },
        addResource(topicIndex) {
            this.selectedLevel.children[topicIndex].resources.push({ text: "", url: "" });
        },
        removeResource(topicIndex, resourceIndex) {
            this.selectedLevel.children[topicIndex].resources.splice(resourceIndex, 1);
        },
        addTag(topic) {
            const tag = this.newTagInput.trim();
            if (!tag) return;
            if (!this.availableTags.includes(tag)) this.availableTags.push(tag);
            if (!topic.tags.includes(tag)) topic.tags.push(tag);
            this.newTagInput = '';
        },
        addExistingTag(topic, tag) {
            if (!topic.tags.includes(tag)) topic.tags.push(tag);
            this.newTagInput = '';
        },
        removeTag(topic, tag) {
            topic.tags = topic.tags.filter(t => t !== tag);
        },
        removeFromAvailableTags(tag) {
            this.availableTags = this.availableTags.filter(t => t !== tag);
        },
        handleTagInput(topic) {
            if (this.availableTags.includes(this.newTagInput)) {
                this.addExistingTag(topic, this.newTagInput);
            }
        },
        downloadJSON() {
            const json = JSON.stringify({
                generalTitle: this.generalTitle,
                roadmap: this.levels
            }, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "roadmap.json";
            link.click();
        }
        ,
        editLevel(index) {
            this.levels[index].editing = true;
        },
        confirmEdit(index) {
            this.levels[index].editing = false;
        },
        deleteLevel(index) {
            this.levels.splice(index, 1);
            if (this.selectedLevelIndex >= this.levels.length) {
                this.selectedLevelIndex = this.levels.length - 1;
            }
        },
        addLevel() {
            this.levels.push({ title: "", children: [], editing: true });
            this.selectedLevelIndex = this.levels.length - 1;
        },
        moveLevel(index, direction) {
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= this.levels.length) return;
            const temp = this.levels[newIndex];
            this.levels[newIndex] = this.levels[index];
            this.levels[index] = temp;
            this.selectedLevelIndex = newIndex;
        }
    }
};
</script>
<style scoped>
.editor-wrapper {
    display: flex;
    font-family: Arial, sans-serif;
    height: 100vh;
}

.levels-sidebar {
    width: 220px;
    background: #f4f4f4;
    padding: 16px;
    border-right: 1px solid #ddd;
    overflow-y: auto;
}

.levels-sidebar h2 {
    margin-bottom: 12px;
    text-align: center;
}

.level-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
}

.level-button {
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-radius: 10px;
    background: #77aac2;
    cursor: pointer;
    font-weight: bold;
    text-align: left;
}

.level-button.active {
    background: #ffeb3b;
    color: black;
}

.level-actions {
    display: flex;
    gap: 4px;
    margin-top: 4px;
}

.level-input {
    padding: 6px;
    border-radius: 8px;
    border: 1px solid #ccc;
    width: 100%;
}

.add-btn {
    margin-top: 16px;
    width: 100%;
    padding: 6px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
}

.editor-main {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
}

.topic-editor {
    background: #fffbe6;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

input,
textarea {
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
}

.resource-group {
    margin-top: 10px;
}

.resource-inputs {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

button {
    padding: 6px 10px;
    border: none;
    background: #2196f3;
    color: white;
    border-radius: 8px;
    cursor: pointer;
}

button:hover {
    background: #1976d2;
}

.tag-editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.tag {
    background: #e3e3e3;
    padding: 4px 8px;
    border-radius: 8px;
}

.tag-select {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.tag-dropdown {
    position: absolute;
    top: 40px;
    background: #222;
    color: white;
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    z-index: 100;
}

.tag-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    cursor: pointer;
}

.remove-tag {
    margin-left: 10px;
    background: transparent;
    color: red;
    font-weight: bold;
    font-size: 16px;
    border: none;
    cursor: pointer;
}

.general-title {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.general-title label {
    font-weight: bold;
    font-size: 16px;
}

.general-title input {
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 14px;
    background: #fff;
}

.general-title input:focus {
    border-color: #2196f3;
    outline: none;
}

.editor-wrapper {
  display: flex;
  font-family: Arial, sans-serif;
  height: 100vh;
}

.content-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

</style>