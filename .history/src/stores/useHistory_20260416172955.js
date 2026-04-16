import { ref } from "vue";
import { defineStore } from "pinia";

const STORAGE_KEY = "c7084b5b-9a5a-416a-8a89-5d08ce0e115f";
const HISTORY_TTL_MS = 1000 * 60 * 60 * 24 * 3;
const HISTORY_MAX_COUNT = 100;

function formatTime(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function parseTime(value) {
    const ts = new Date(value).getTime();
    return Number.isNaN(ts) ? 0 : ts;
}

function getTitleFromContent(content) {
    const firstLine = (content || "").split("\n")[0] || "";
    return firstLine.replace(/^#+\s*/, "").trim() || "无标题";
}

export const useHistory = defineStore("history", () => {
    const historyContent = ref({});
    const historyContentList = ref([]);

    function persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(historyContentList.value));
    }

    function cleanupExpired(now = Date.now()) {
        historyContentList.value = historyContentList.value.filter((item) => {
            const ts = parseTime(item.updateAt);
            return ts && now - ts <= HISTORY_TTL_MS;
        });
    }

    function trimToMax() {
        if (historyContentList.value.length > HISTORY_MAX_COUNT) {
            historyContentList.value = historyContentList.value.slice(-HISTORY_MAX_COUNT);
        }
    }

    function loadFromLocal() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            historyContentList.value = [];
            return;
        }

        try {
            const parsed = JSON.parse(raw);
            historyContentList.value = Array.isArray(parsed) ? parsed : [];
        } catch {
            historyContentList.value = [];
        }

        cleanupExpired();
        trimToMax();
        persist();
    }

    function saveSnapshot(contentText) {
        const text = (contentText || "").trim();
        if (!text) return;

        const latest = historyContentList.value[historyContentList.value.length - 1];
        if (latest && latest.content === contentText) return;

        const snapshot = {
            id: crypto.randomUUID(),
            title: getTitleFromContent(contentText),
            content: contentText,
            updateAt: formatTime(new Date()),
        };

        historyContent.value = snapshot;
        historyContentList.value.push(snapshot);
        cleanupExpired();
        trimToMax();
        persist();
    }

    return {
        historyContent,
        historyContentList,
        loadFromLocal,
        saveSnapshot,
    };
});
