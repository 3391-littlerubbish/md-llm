import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useHistory = defineStore('history', () => {
    const historyContent = ref({});
    const historyContentList = ref([]);

    const historySave = function (singleContent) {
        const now = new Date();


        historyContent.value = {
            id: singleContent.id,
            title: singleContent.title,
            content: singleContent.content,
            updateAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
                2,
                "0"
            )}-${String(now.getDate()).padStart(2, "0")} ${String(
                now.getHours()
            ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        };

        historyContentList.value.push(historyContent.value);

        localStorage.setItem(
            "c7084b5b-9a5a-416a-8a89-5d08ce0e115f",
            JSON.stringify(historyContentList.value)
        );
    }

    return {
        historyContent,
        historyContentList,
        historySave
    }
})