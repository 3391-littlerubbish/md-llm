<template>
  <div class="md-editor">
    <!-- 工具栏 -->
    <!-- #region -->
    <div class="toolbar">
      <el-button size="small" class="history" @click="isHistory = !isHistory"
        >历史记录</el-button
      >
      <el-button size="small" class="save" @click="saveToFile">保存</el-button>
      <el-button size="small" class="aichat" @click="isShow = !isShow"
        >AI小助手</el-button
      >
      <el-button size="small" class="improve" @click="aiImprove"
        >一键润色</el-button
      >
      <!-- @click="$router.push('/markdown/llmchat')" -->
    </div>
    <!-- #endregion -->

    <!-- 编辑区 + 预览区 -->
    <div class="editor-body">
      <el-splitter>
        <!-- 左：历史记录 -->
        <el-splitter-panel
          v-if="isHistory"
          :collapsible="isCollapsible"
          size="200px"
        >
          <div class="demo-panel">
            <ul>
              <li
                v-for="(item, index) in History.historyContentList"
                :key="item.id"
                @click="showHistoryContent(index)"
              >
                <div class="history-title">
                  <strong>{{ item?.title }}</strong>
                </div>
                <div class="history-time">编辑时间 : {{ item.updateAt }}</div>
              </li>
            </ul>
          </div>
        </el-splitter-panel>

        <!-- 中：编辑 -->
        <el-splitter-panel :collapsible="isCollapsible" min="50">
          <div class="pane pane-editor">
            <!-- 1. -->
            <div>
              <div class="pane-label">
                编辑
                <el-button-group>
                  <el-button size="small" @click="insert('# ', '')"
                    >H1</el-button
                  >
                  <el-button size="small" @click="insert('## ', '')"
                    >H2</el-button
                  >
                  <el-button size="small" @click="insert('### ', '')"
                    >H3</el-button
                  >
                </el-button-group>

                <el-divider direction="vertical" />

                <el-button-group>
                  <el-button size="small" @click="wrap('**', '**')"
                    ><b>B</b></el-button
                  >
                  <el-button size="small" @click="wrap('*', '*')"
                    ><i>I</i></el-button
                  >
                  <el-button size="small" @click="wrap('~~', '~~')"
                    ><s>S</s></el-button
                  >
                  <el-button size="small" @click="wrap('`', '`')"
                    >Code</el-button
                  >
                </el-button-group>

                <el-divider direction="vertical" />

                <el-button-group>
                  <el-button size="small" @click="insert('- ', '')"
                    >列表</el-button
                  >
                  <el-button size="small" @click="insert('> ', '')"
                    >引用</el-button
                  >
                  <el-button size="small" @click="insertCodeBlock()"
                    >代码块</el-button
                  >
                  <el-button size="small" @click="insertHr()">分割线</el-button>
                </el-button-group>

                <el-divider direction="vertical" />

                <el-button
                  size="small"
                  @click="clearContent"
                  type="danger"
                  plain
                  >清空</el-button
                >
              </div>
            </div>
            <!-- 2. -->
            <textarea
              ref="textareaRef"
              v-model="content"
              class="editor-textarea"
              placeholder="开始写作..."
              @keydown.tab.prevent="handleTab"
            ></textarea>
            <!-- 3. -->
            <div class="status-bar">
              <span>字数：{{ wordCount }}</span>
              <span>行数：{{ lineCount }}</span>
              <span>字符：{{ content.length }}</span>
            </div>
          </div>
        </el-splitter-panel>

        <!-- 分隔线 -->
        <div class="divider"></div>

        <!-- 右：预览 -->
        <el-splitter-panel :collapsible="isCollapsible">
          <div class="pane pane-preview">
            <div class="pane-label">预览</div>
            <div class="preview-content" v-html="renderedHTML"></div>
          </div>
        </el-splitter-panel>
      </el-splitter>
    </div>
  </div>

  <!-- 抽屉式ai-chat -->
  <transition name="aichat">
    <div v-if="isShow" class="ai-chat">
      <!-- 头部 -->
      <div class="chat-header">
        <div class="chat-header-left">
          <div class="chat-avatar">AI</div>
          <div>
            <div class="chat-title">AI 助手</div>
            <div class="chat-subtitle">随时为你解答</div>
          </div>
        </div>
        <el-tooltip content="模型设置" placement="bottom">
          <el-button text circle @click="settingVisible = true">
            <el-icon size="16"><Setting /></el-icon>
          </el-button>
        </el-tooltip>
      </div>

      <!-- 消息列表 -->
      <div class="chat-messages" ref="messagesRef">
        <!-- <div>{{ aiReply }}</div> -->
        <div v-for="(item, index) in messages" :key="index">
          <div
            v-if="item.role === 'assistant'"
            v-html="renderSafeMarkdown(item.content)"
            :class="{
              assistant: item.role === 'assistant',
            }"
          ></div>
          <div
            v-else
            :class="{
              user: item.role === 'user',
            }"
            v-html="renderSafeMarkdown(item.content)"
          ></div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="chat-input">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="3"
          placeholder="有什么可以帮你的..."
          resize="none"
        />
        <div class="chat-input-footer">
          <span class="hint">Shift + Enter 换行</span>
          <el-button
            type="primary"
            size="small"
            round
            @click="getInput"
            :disabled="loading"
          >
            发送 ↑
          </el-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
// ---------------引入----------------
// #region
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { marked } from "marked";

import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/el-message.css";

// 引入设置图标
import { Setting } from "@element-plus/icons-vue";

// pinia引入封装函数
import { useHistory } from "@/stores/useHistory";
const History = useHistory();
//#endregion

import DOMPurify from "dompurify";

// --------------保存---------------
const saveToFile = function () {
  // 1. 创建Blob,它二进制大对象，用于存储文件数据
  const blob = new Blob([content.value], { type: "text/markdown" });
  // 2. 创建一个隐藏a标签，添加href属性，设置download表示a标签的用途是下载文件，最后执行点击a实现下载文件并保存
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); // 为 Blob 数据生成一个临时的本地 URL，和当前项目运行所在的浏览器的默认下载位置相同
  const fileTitle =
    content.value
      .split("\n")[0]
      .replace(/^#+\s*/, "")
      .trim() || "未命名";
  a.download = `${fileTitle}.md`;
  a.click();

  URL.revokeObjectURL(a.href); // 释放内存
};

const isCollapsible = ref(true);

const loading = ref(false);
//#region

const content = ref("欢迎使用Md编辑器");
// `# 欢迎使用 Markdown 编辑器

// **左边写，右边实时预览。**

// ## 支持的语法

// - *斜体* 和 **粗体**
// - ~~删除线~~
// - \`行内代码\`

// ## 代码块

// \`\`\`javascript
// console.log('Hello World')
// \`\`\`

// ## 引用

// > 纸上得来终觉浅，绝知此事要躬行。

// ---

// 开始你的创作吧 ✍️
// `

// ------------md书写逻辑-------------
//#region
// --------文本框元素---------
const textareaRef = ref(null);

function renderSafeMarkdown(mdText) {
  const rawHtml = marked.parse(mdText || "");
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
  });
}
// ── 渲染 Markdown ─────────────────────────────
const renderedHTML = computed(() => renderSafeMarkdown(content.value));

// ── 统计信息 ──────────────────────────────────
const wordCount = computed(() => {
  const t = content.value.trim();
  return t === "" ? 0 : t.split(/\s+/).length;
});
const lineCount = computed(() => {
  return content.value === "" ? 0 : content.value.split("\n").length;
});

// ── 工具函数：返回DOM元素 ─────────────────
function getTextarea() {
  return textareaRef.value;
}

// 行首插入前缀（适合标题、列表、引用）
function insert(prefix) {
  const el = getTextarea();
  const start = el.selectionStart;
  const lineStart = content.value.lastIndexOf("\n", start - 1) + 1;
  content.value =
    content.value.slice(0, lineStart) + prefix + content.value.slice(lineStart);
  el.focus();
}

// 包裹选中文字（适合粗体、斜体等）
function wrap(before, after) {
  const el = getTextarea();
  const start = el.selectionStart; //
  const end = el.selectionEnd; //
  const selected = content.value.slice(start, end) || "text";
  const newText = before + selected + after;
  content.value =
    content.value.slice(0, start) + newText + content.value.slice(end);
  // 重新定位光标到textarea内容上
  el.focus();
  setTimeout(() => {
    el.selectionStart = start + before.length;
    el.selectionEnd = start + before.length + selected.length;
  });
}

// 插入代码块
function insertCodeBlock() {
  const el = getTextarea();
  const start = el.selectionStart;
  const snippet = "\n```javascript\n// 代码写这里\n```\n";
  content.value =
    content.value.slice(0, start) + snippet + content.value.slice(start);
  el.focus();
}

// 插入分割线
function insertHr() {
  const el = getTextarea();
  const start = el.selectionStart;
  const snippet = "\n\n---\n\n";
  content.value =
    content.value.slice(0, start) + snippet + content.value.slice(start);
  el.focus();
}

// Tab 键插入两个空格
function handleTab() {
  const el = getTextarea();
  const start = el.selectionStart;
  content.value =
    content.value.slice(0, start) + "  " + content.value.slice(start);
  setTimeout(() => {
    el.selectionStart = el.selectionEnd = start + 2;
  });
}

// 清空
function clearContent() {
  content.value = "";
  ElMessage.success("已清空");
}
//#endregion
//#endregion

// ------------历史记录-------------
// #region
// 展示历史记录栏
const isHistory = ref(true);

const showHistoryContent = function (index) {
  // 加一个判断是否保存
  // 1. 未保存，弹窗--是否保存
  // 2. 保存，直接向下执行即可
  const item = History.historyContentList[index];
  if (!item) return;
  content.value = item.content;
};

const AUTO_SAVE_DEBOUNCE_MS = 1200;
let autoSaveTimer = null;

function scheduleHistorySave() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    History.saveSnapshot(content.value);
  }, AUTO_SAVE_DEBOUNCE_MS);
}

watch(content, () => {
  scheduleHistorySave();
});

onMounted(() => {
  History.loadFromLocal();
});

onBeforeUnmount(() => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  History.saveSnapshot(content.value);
});
//#endregion

// #region
// 展示ai对话框
const isShow = ref(false);

const AI_REQUEST_TIMEOUT_MS = 20000;
const AI_MAX_RETRY = 2;
const AI_RETRY_DELAY_MS = 800;

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function saveChatLocal() {
  localStorage.setItem(
    "bb97507d-a94c-4aa5-be91-fd291ddd93d8",
    JSON.stringify({
      messages: messages.value,
      model: "qwen-turbo",
      stream: true,
    })
  );
}

function getLatestAssistantMessage() {
  return messages.value[messages.value.length - 1];
}

async function requestChatCompletion() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, AI_REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch("/api/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_KEY}`,
      },
      body: JSON.stringify({
        messages: messages.value,
        model: "qwen-turbo",
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP_${res.status}`);
    }

    if (!res.body) {
      throw new Error("EMPTY_RESPONSE_BODY");
    }

    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function streamChatResponse(res) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let sseBuffer = "";

  const queue = [];
  let timer = null;

  function startTypewriter() {
    if (timer) return;
    timer = setInterval(() => {
      if (queue.length === 0) {
        clearInterval(timer);
        timer = null;
        return;
      }

      const latest = getLatestAssistantMessage();
      if (!latest) return;

      latest.content += queue.shift();

      if (messagesRef.value) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
      }
    }, 30);
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    sseBuffer += decoder.decode(value, { stream: true });
    const events = sseBuffer.split("\n\n");
    sseBuffer = events.pop() || "";

    for (const event of events) {
      const lines = event.split("\n");
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;

        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        try {
          const json = JSON.parse(payload);
          const deltaText = json.choices?.[0]?.delta?.content;
          if (deltaText) {
            queue.push(...deltaText);
            startTypewriter();
          }
        } catch {
          // 忽略单条异常分片，避免中断整个会话流
          continue;
        }
      }
    }
  }

  sseBuffer += decoder.decode();
}

const goChat = async () => {
  const latestAssistant = getLatestAssistantMessage();
  try {
    for (let attempt = 0; attempt <= AI_MAX_RETRY; attempt++) {
      if (attempt > 0 && latestAssistant) {
        latestAssistant.content = "";
      }

      try {
        const res = await requestChatCompletion();
        await streamChatResponse(res);
        saveChatLocal();
        return;
      } catch (error) {
        const isLastAttempt = attempt === AI_MAX_RETRY;
        if (isLastAttempt) {
          if (latestAssistant && !latestAssistant.content) {
            latestAssistant.content = "抱歉，当前请求失败，请稍后重试。";
          }
          console.error(error);
          ElMessage.error("AI 请求失败，请检查网络或密钥配置");
          return;
        }
        await wait(AI_RETRY_DELAY_MS * (attempt + 1));
      }
    }
  } finally {
    loading.value = false;
  }
};

const messagesRef = ref(null);

const messages = ref([]);
// let data = ref({
//   messages: messages.value,
//   model: "qwen-turbo",
//   stream: true,
// });

const inputText = ref("");

// 发送问题
function getInput() {
  const question = inputText.value.trim();
  if (!question || loading.value) return;

  loading.value = true;
  messages.value.push({
    role: "user",
    content: question,
  });

  messages.value.push({
    role: "assistant",
    content: "",
  });

  goChat();
  inputText.value = "";
}

// 一键润色
function aiImprove() {
  if (loading.value) return;
  const rawContent = content.value.trim();
  if (!rawContent) {
    ElMessage.warning("当前内容为空，先输入后再润色");
    return;
  }

  isShow.value = true;
  loading.value = true;
  messages.value.push({
    role: "user",
    content: `请帮我润色以下 Markdown 文档：${rawContent}`,
  });

  messages.value.push({
    role: "assistant",
    content: "",
  });

  goChat();
}

onMounted(() => {
  const message = localStorage.getItem("bb97507d-a94c-4aa5-be91-fd291ddd93d8");

  messages.value = message ? JSON.parse(message).messages : messages.value;

  // 这里用data.value.messages而不用[]的原因:
  // 1. data.value.messages初始化为[]，而这里如果再赋值为[]就会导致messages.value的地址改变，而data存的是messages的地址，messages的地址变了，data的指向就是空的，data监测messages不再为实时的
});
</script>

<style scoped>
.md-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
/* 工具栏 */
.toolbar {
  display: relative;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;

  padding-right: 100px;
}

.aichat {
  position: absolute;
  right: 100px;
}

.improve {
  position: absolute;
  right: 10px;
}

/* 编辑区整体 */
.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 分隔线 */
.divider {
  width: 1px;
  background: #e4e7ed;
  flex-shrink: 0;
}

/* 历史记录 */
.demo-panel {
  width: 100%;
  height: 100%;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.demo-panel ul li {
  position: relative;
  width: 100%;
  height: 80px;
  border-bottom: 1px solid #c0c4cc;
  margin: 10px 0;
}

.demo-panel ul li .history-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.demo-panel ul li .history-time {
  position: absolute;
  font-size: 14px;
  color: #909399;
  width: 180px;
  bottom: 5px;
  left: 15px;
}

/* 左右面板 */
.pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.pane-label {
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f0f0f0;
  background: #fcfcfc;
  text-transform: uppercase;
}

/* 编辑器 textarea */
.editor-textarea {
  /* flex: 1; */
  height: 610px;
  padding: 20px;
  border: none;
  outline: none;
  resize: none;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.8;
  color: #303133;
  background: #fff;
  overflow-y: auto;
}

/* 状态栏 */
.status-bar {
  display: flex;
  gap: 16px;
  padding: 4px 16px;
  font-size: 11px;
  color: #c0c4cc;
  border-top: 1px solid #f0f0f0;
  background: #fcfcfc;
}

/* 预览区 */
.preview-content {
  flex: 1;
  padding: 20px 28px;
  overflow-y: auto;
  font-size: 15px;
  line-height: 1.85;
  color: #303133;
}

/* Markdown 样式 */
.preview-content :deep(h1) {
  font-size: 1.8em;
  font-weight: 700;
  margin: 0 0 14px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}
.preview-content :deep(h2) {
  font-size: 1.4em;
  font-weight: 700;
  margin: 24px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}
.preview-content :deep(h3) {
  font-size: 1.15em;
  font-weight: 600;
  margin: 18px 0 8px;
}
.preview-content :deep(p) {
  margin: 0 0 12px;
}
.preview-content :deep(a) {
  color: #409eff;
  text-decoration: underline;
}
.preview-content :deep(strong) {
  font-weight: 700;
}
.preview-content :deep(em) {
  font-style: italic;
  color: #606266;
}
.preview-content :deep(ul),
.preview-content :deep(ol) {
  padding-left: 22px;
  margin: 0 0 12px;
}
.preview-content :deep(li) {
  margin-bottom: 4px;
}
.preview-content :deep(blockquote) {
  margin: 12px 0;
  padding: 8px 16px;
  border-left: 4px solid #dcdfe6;
  background: #f5f7fa;
  color: #606266;
  border-radius: 0 4px 4px 0;
}
.preview-content :deep(code) {
  font-family: "Menlo", "Monaco", monospace;
  font-size: 0.875em;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  color: #e6395a;
}
.preview-content :deep(pre) {
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 6px;
  padding: 16px 18px;
  overflow-x: auto;
  margin: 14px 0;
  font-size: 13px;
  line-height: 1.6;
}
.preview-content :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}
.preview-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 14px 0;
  font-size: 14px;
}
.preview-content :deep(th) {
  background: #f5f7fa;
  font-weight: 600;
  padding: 9px 12px;
  border: 1px solid #e4e7ed;
  text-align: left;
}
.preview-content :deep(td) {
  padding: 8px 12px;
  border: 1px solid #e4e7ed;
}
.preview-content :deep(tr:nth-child(even) td) {
  background: #fafafa;
}
.preview-content :deep(hr) {
  border: none;
  border-top: 2px solid #f0f0f0;
  margin: 20px 0;
}
.preview-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}
/* #endregion */

/* ---------抽屉式ai-chat-------- */
/* #region */
.ai-chat {
  position: absolute;
  z-index: 1;
  right: 0px;
  top: 50px;
  width: 45%;
  height: 80%;
  background: #f7f8fc;
  border-bottom-left-radius: 20px;

  display: flex;
  flex-direction: column;
}

/* 动画效果 */
.aichat-enter-from,
.aichat-leave-to {
  transform: translateX(100%);
}

.aichat-enter-active,
.aichat-leave-active {
  transition: all 0.7s ease;
}

/* 框内样式 */
/* #region */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #409eff, #6b8cff);

  color: #fff;
  font-size: 12px;
  font-weight: 700;

  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.chat-subtitle {
  font-size: 11px;
  color: #aaa;
  margin-top: 1px;
}
/* #endregion */

.chat-messages {
  /* flex: 1; */
  overflow-y: auto;
  padding: 20px 16px;
  height: 61%;
}

/* 输入框 */
/* #region */
.chat-input {
  padding: 12px 16px 16px;
  background: #fff;
  border-top: 1px solid #eee;
  flex-shrink: 0;
  border-bottom-left-radius: 20px;
}

.chat-input .el-textarea__inner {
  background: #f7f8fc;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
  font-size: 13px;
}

.chat-input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.hint {
  font-size: 11px;
  color: #c0c4cc;
}
/* #endregion */

/* #endregion */

.assistant {
  width: fit-content;
  padding: 10px;
  border-radius: 5%;
  background: white;
}
.user {
  width: fit-content;
  margin-left: auto;
  padding: 10px;
  border-radius: 5%;
  background: rgb(219, 236, 243);
}
</style>
