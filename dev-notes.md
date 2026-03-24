# Visora — Dev Notes
> 跨对话积累的开发经验，避免重复踩坑。

---

## 工具使用约定

### 文件写到哪里？
- **`bash_tool` / `create_file`** → Anthropic 云端沙盒容器，路径 `/home/claude/...`，对话结束即销毁，你的 Mac 看不到
- **`Desktop Commander:write_file`** → 直接操作你的 Mac 文件系统
- **结论：凡是要落地到本地的文件，必须用 Desktop Commander**

### npm install 走代理
npm 不读 shell 的 `https_proxy` 环境变量，需要显式指定：

```bash
npm install --proxy http://127.0.0.1:1087 --https-proxy http://127.0.0.1:1087
```

或永久配置（推荐，一劳永逸）：
```bash
npm config set proxy http://127.0.0.1:1087
npm config set https-proxy http://127.0.0.1:1087
```

### 代理端口
- v2ray HTTP 代理：**1087**（不是 7890）
- v2ray SOCKS：1080
- 用 `lsof -iTCP -sTCP:LISTEN -P | grep v2ray` 随时确认

---

## 部署方案

| 服务 | 平台 | 说明 |
|------|------|------|
| 前端 dashboard (Next.js) | Vercel | 连 GitHub，push 自动部署，免费 |
| 后端 mvp (Express) | Railway | Node 直跑，$5/月起 |
| 数据库 | Supabase | 已建好，us-east-1 |

---

## 端口占用情况（本机）

| 端口 | 服务 |
|------|------|
| 3000 | 已被占用（别的服务） |
| 3001 | mvp Express backend |
| 3002 | dashboard Next.js dev |
| 8080 | nginx |

---

## CSS / Tailwind 注意事项

- `@import url()` 必须放在 `@tailwind` 指令**之前**，否则 webpack 报 `Unexpected character '@'`
- 推荐做法：Google Fonts 的 `<link>` 放 `layout.tsx` 的 `<head>`，globals.css 只保留 `@tailwind` 三行 + 自定义样式

---

## NODE_ENV 陷阱

- 如果 shell 全局设了 `NODE_ENV=production`，`next dev` 会在生产模式下跑，导致 webpack CSS 规则不同，PostCSS/Tailwind 不被调用，报 `Unexpected character '@'`
- 表现：`.next` 清了、配置改了，错误死活不变
- 修法1：`NODE_ENV=development npm run dev`（临时）
- 修法2：直接在 `package.json` 的 dev script 里写死 `"dev": "NODE_ENV=development next dev -p 3002"`（永久，已修）
