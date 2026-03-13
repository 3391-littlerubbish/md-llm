<template>
  <div class="md-editor">
    <!-- 工具栏 -->
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

      <el-button
        size="small"
        @click="$router.push('/markdown/llmchat')"
        class="aichat"
        >AI小助手</el-button
      >
    </div>

    <!-- 编辑区 + 预览区 -->
    <div class="editor-body">
      <!-- 左：编辑 -->
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

      <!-- 分隔线 -->
      <div class="divider"></div>

      <!-- 右：预览 -->
      <div class="pane pane-preview">
        <div class="pane-label">预览</div>
        <div class="preview-content" v-html="renderedHTML"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { marked } from "marked";

import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/el-message.css";

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
</script>

<style scoped>
.md-editor {
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
  flex: 1;
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
</style>