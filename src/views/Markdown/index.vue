<template>
  <div class="md-editor">
    <!-- 工具栏 -->
    <!-- #region -->
    <div class="toolbar">
      <el-button-group>
        <el-button size="small" @click="insert('# ', '')">H1</el-button>
        <el-button size="small" @click="insert('## ', '')">H2</el-button>
        <el-button size="small" @click="insert('### ', '')">H3</el-button>
      </el-button-group>

      <el-divider direction="vertical" />

      <el-button-group>
        <el-button size="small" @click="wrap('**', '**')"><b>B</b></el-button>
        <el-button size="small" @click="wrap('*', '*')"><i>I</i></el-button>
        <el-button size="small" @click="wrap('~~', '~~')"><s>S</s></el-button>
        <el-button size="small" @click="wrap('`', '`')">Code</el-button>
      </el-button-group>

      <el-divider direction="vertical" />

      <el-button-group>
        <el-button size="small" @click="insert('- ', '')">列表</el-button>
        <el-button size="small" @click="insert('> ', '')">引用</el-button>
        <el-button size="small" @click="insertCodeBlock()">代码块</el-button>
        <el-button size="small" @click="insertHr()">分割线</el-button>
      </el-button-group>

      <el-divider direction="vertical" />

      <el-button size="small" @click="clearContent" type="danger" plain
        >清空</el-button
      >

      <el-button size="small" class="aichat" @click="isShow = !isShow"
        >AI小助手</el-button
      >
      <!-- @click="$router.push('/markdown/llmchat')" -->
    </div>
    <!-- #endregion -->

    <!-- 编辑区 + 预览区 -->
    <div class="editor-body">
      <el-splitter>
        <!-- 左：编辑 -->
        <el-splitter-panel :collapsible="isCollapsible" min="50">
          <div class="pane pane-editor">
            <!-- 1. -->
            <div class="pane-label">编辑</div>
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
            v-html="marked.parse(item.content)"
            :class="{
              user: item.role === 'user',
              assistant: item.role === 'assistant',
            }"
          ></div>
          <div
            v-else
            :class="{
              user: item.role === 'user',
              assistant: item.role === 'assistant',
            }"
          >
            {{ item.content }}
          </div>
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
import { ref, computed } from "vue";
import { marked } from "marked";

import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/el-message.css";

// 引入设置图标
import { Setting } from "@element-plus/icons-vue";
const isCollapsible = ref(true);

const loading = ref(false);
const goChat = async () => {
  const res = await fetch("/api/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_KEY}`,
    },
    body: JSON.stringify(data.value),
    // 注意是data.value不是data，一天在这里栽了两回
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder(); // 将二进制转为字符串

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      loading.value = false;
      break;
    }

    const text = decoder.decode(value);

    // 第一步：按换行分割，可能有多行
    const lines = text.split("\n");

    // 第二步：遍历每一行
    for (const line of lines) {
      // 第三步：跳过空行和 [DONE]
      if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;

      // 第四步：去掉 'data: ' 前缀，再 JSON.parse
      const json = JSON.parse(line.slice(6));

      // 第五步：取内容
      const text = json.choices?.[0]?.delta?.content;
      if (text) {
        console.log(text);
        messages.value[messages.value.length - 1].content += text;
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
      }
    }
  }
};

const messagesRef = ref(null);

const messages = ref([]);
let data = ref({
  messages: messages.value,
  model: "qwen-turbo",
  stream: true,
});

//#region
// ── 初始内容 ──────────────────────────────────
const content = ref(`# 欢迎使用 Markdown 编辑器

**左边写，右边实时预览。**

## 支持的语法

- *斜体* 和 **粗体**
- ~~删除线~~
- \`行内代码\`

## 代码块

\`\`\`javascript
console.log('Hello World')
\`\`\`

## 引用

> 纸上得来终觉浅，绝知此事要躬行。

---

开始你的创作吧 ✍️
`);

// --------文本框元素---------
const textareaRef = ref(null);

// ── 渲染 Markdown ─────────────────────────────
const renderedHTML = computed(() => marked.parse(content.value));

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

// 展示ai对话框
const isShow = ref(true);

const inputText = ref("");

function getInput() {
  loading.value = true;
  messages.value.push({
    role: "user",
    content: inputText.value,
  });

  messages.value.push({
    role: "assistant",
    content: "",
  });
  goChat();
  inputText.value = "";
}
</script>

<style scoped>
/* #region */
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;

  padding-right: 100px;
}

.aichat {
  margin-left: auto;
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