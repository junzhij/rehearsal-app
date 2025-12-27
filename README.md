# 歌曲排练与分词演唱助手 (Choir Rehearsal App)

这是一个面向**多人合唱 / 对唱 / 轮唱排练场景**的 Web 应用。核心目标是解决纸质或群聊歌词分配混乱、排练时反复确认“我唱哪句”的问题，提供清晰的歌词展示和便捷的音频辅助功能。

## ✨ 核心功能

*   **清晰的歌词展示**：明确区分每一句歌词由谁演唱，解决分词混乱问题。
*   **排练模式 (Rehearsal Mode)**：
    *   专注于练习的界面，减少干扰。
    *   **音频播放**：支持调节音调 (Pitch) 但不改变速度，方便寻找适合的调式。
    *   **颜色编码**：不同成员/声部使用不同颜色高亮，一目了然。
*   **项目管理**：
    *   创建和管理多个排练项目。
    *   支持搜索和筛选项目。
*   **灵活配置**：
    *   **成员管理**：自定义成员及代表色。
    *   **歌词分配**：简单的勾选交互即可完成歌词分词。

## 🛠️ 技术栈

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **Build Tool**: Vite
*   **Backend / Database**: Supabase

## 🚀 快速开始

### 1. 环境准备

确保本地已安装 [Node.js](https://nodejs.org/)。

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录创建一个 `.env` 文件（参考 `.env.example`，如果存在），并填入你的 Supabase 配置信息：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 数据库设置

本项目使用 Supabase 作为后端。请在 Supabase Dashboard 中运行 `supabase/migrations` 目录下的 SQL 脚本以初始化数据库结构。

### 5. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问控制台输出的地址（http://localhost:3000）。

## 📂 项目结构

```
/src
  /components   # 公共组件 (Layout, UI elements)
  /pages        # 页面组件 (Dashboard, Rehearsal, Settings)
  /services     # API 服务 (Supabase 交互)
  /lib          # 工具库 (Supabase client)
  /types        # TypeScript 类型定义
```

## 📄 版权说明

&copy; 2025 Junzhi. All Rights Reserved.
