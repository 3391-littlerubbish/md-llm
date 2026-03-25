<template>
  <div class="landing-page">
    <div class="star-field">
      <div
        v-for="i in 80"
        :key="i"
        class="star"
        :style="generateStarStyle()"
      ></div>
    </div>

    <header class="header">
      <div class="container nav-inner">
        <div class="logo">Mark<span class="pink-glow">AI</span></div>
        <nav>
          <RouterLink to="/markdown" class="nav-link">进入编辑器</RouterLink>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <div class="hero">
          <h1 class="main-title">书写，是一场粉色的觉醒</h1>
          <p class="subtitle">AI 赋能，让 Markdown 拥有浪漫的生命力。</p>
        </div>

        <section class="features">
          <div class="glass-card">
            <div class="card-glow"></div>
            <h3>实时预览</h3>
            <p>标准语法实时渲染，让每一个字符的跳动都清晰可见。</p>
          </div>
          <div class="glass-card">
            <div class="card-glow"></div>
            <h3>AI 推拉窗</h3>
            <p>侧边唤起智慧之门。它是你的影子，也是你的灵感导师。</p>
          </div>
          <div class="glass-card">
            <div class="card-glow"></div>
            <h3>一键优化</h3>
            <p>拒绝平庸。AI 自动重塑文本，赋予字里行间高级的质感。</p>
          </div>
        </section>

        <div class="cta-wrapper">
          <RouterLink to="/markdown" class="mega-btn">
            进入编辑器
            <div class="btn-reflection"></div>
          </RouterLink>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>© 2026 MarkAI. 浪漫至死不渝。</p>
    </footer>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";

const generateStarStyle = function () {
  const isPink = Math.random() > 0.4;
  return {
    left: Math.random() * 100 + "%",
    top: Math.random() * 100 + "%",
    width: Math.random() * 3 + 1 + "px",
    height: Math.random() * 3 + 1 + "px",
    backgroundColor: isPink ? "hotpink" : "#fff",
    boxShadow: isPink ? "0 0 10px hotpink" : "0 0 8px #fff",
    animationDuration: Math.random() * 5 + 3 + "s",
    animationDelay: Math.random() * 5 + "s",
  };
};
</script>

<style scoped>
.landing-page {
  /* 背景：黑紫粉渐变，更有深度感 */
  background: radial-gradient(circle at 50% 50%, #200015 0%, #050505 100%);
  min-height: 100vh;
  color: #fff;
  font-family: "Inter", sans-serif;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 粒子流星动画 */
.star-field {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.star {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  animation: meteor linear infinite;
}

@keyframes meteor {
  0% {
    transform: translate(0, 0) scale(0.5);
    opacity: 0;
  }
  20% {
    opacity: 0.8;
  }
  100% {
    transform: translate(-200px, 200px) scale(1.2);
    opacity: 0;
  }
}

/* 导航与 Logo */
.header {
  position: relative;
  z-index: 10;
  padding: 40px 0;
}
.nav-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -1px;
}
.pink-glow {
  color: hotpink;
  text-shadow: 0 0 20px hotpink, 0 0 40px hotpink;
  animation: blink 2s infinite ease-in-out;
}

/* 英雄区标题 */
.main-content {
  position: relative;
  z-index: 10;
  flex: 1;
  padding: 60px 0;
  text-align: center;
}
.main-title {
  font-size: 4rem;
  background: linear-gradient(to bottom, #fff 30%, hotpink 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 10px 20px rgba(255, 105, 180, 0.4));
  margin-bottom: 20px;
}
.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 300;
  letter-spacing: 4px;
}

/* 玻璃质感卡片 */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin: 80px 0;
}
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 105, 180, 0.2);
  border-radius: 20px;
  padding: 50px 30px;
  position: relative;
  transition: 0.4s;
  overflow: hidden;
}
.glass-card:hover {
  border-color: hotpink;
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(255, 105, 180, 0.2);
}
.glass-card h3 {
  color: hotpink;
  margin-bottom: 15px;
  font-size: 1.4rem;
}
.glass-card p {
  color: #ccc;
  line-height: 1.8;
  font-size: 0.95rem;
}

/* 核心冲击力按钮 */
.cta-wrapper {
  margin-top: 40px;
}
.mega-btn {
  position: relative;
  display: inline-block;
  padding: 20px 60px;
  background: hotpink;
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.2rem;
  border-radius: 50px;
  box-shadow: 0 0 30px hotpink, 0 0 60px rgba(255, 105, 180, 0.5);
  transition: 0.3s;
  overflow: hidden;
}
.mega-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 50px hotpink, 0 0 100px hotpink;
}
.btn-reflection {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transform: skewX(-25deg);
  transition: 0.5s;
}
.mega-btn:hover .btn-reflection {
  left: 150%;
}

/* 动画定义 */
@keyframes blink {
  0%,
  100% {
    opacity: 1;
    filter: brightness(1.2);
  }
  50% {
    opacity: 0.8;
    filter: brightness(0.8);
  }
}

.footer {
  padding: 40px;
  opacity: 0.4;
  font-size: 0.8rem;
  border-top: 1px solid rgba(255, 105, 180, 0.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }
  .mega-btn {
    padding: 15px 40px;
  }
}
</style>
