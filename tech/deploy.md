# Visora Landing Page 部署文档

更新日期：2026-03-24

---

## 架构总览

```
本地编辑（Cursor）
    ↓ git commit + push
GitHub: ScottLiu007/visora-landing (main 分支)
    ↓ GitHub Actions 自动触发
Cloudflare Pages: visora 项目
    ↓ 自动部署（约 30 秒）
visoraapp.com
```

---

## 仓库信息

| 项目 | 值 |
|------|-----|
| GitHub 仓库 | https://github.com/ScottLiu007/visora-landing |
| 分支 | main |
| 部署目录 | `/`（根目录，即 landing/ 的内容） |
| Cloudflare Pages 项目名 | `visora` |
| Cloudflare Account ID | `e2d7bba331b095fd515b4b390a9a3422` |
| 生产域名 | https://visoraapp.com |
| Pages 默认域名 | https://visora-apr.pages.dev |

---

## 日常更新流程

改完文件后，在 `landing/` 目录下执行：

```bash
git add .
git commit -m "描述改了什么"
git push
```

push 后 GitHub Actions 自动触发，约 30 秒上线。可在 GitHub Actions 页面查看部署状态：
https://github.com/ScottLiu007/visora-landing/actions

---

## 文件结构

```
landing/
├── index.html          # 主页
├── privacy.html        # Privacy Policy（/privacy）
├── terms.html          # Terms of Service（/terms）
├── faq.html            # FAQ 页面（/faq）
├── robots.txt          # 允许所有 AI 爬虫
├── llms.txt            # AI 可读产品信息
└── .github/
    └── workflows/
        └── deploy.yml  # 自动部署配置
```

---

## GitHub Secrets 配置

| Secret 名称 | 说明 |
|-------------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token（名称：GitHub Actions Deploy，权限：Cloudflare Pages 编辑） |

`GITHUB_TOKEN` 由 GitHub 自动提供，无需手动配置。

---

## Cloudflare Pages 路由规则

Cloudflare Pages 对 HTML 文件自动做无扩展名路由：
- `/` → `index.html`
- `/privacy` → `privacy.html`
- `/terms` → `terms.html`
- `/faq` → `faq.html`

无需额外配置 `_redirects` 文件。

---

## 历史部署方式（已废弃）

之前用手动上传 zip 到 Cloudflare Pages Dashboard：
1. 登录 Cloudflare → Workers & Pages → visora → 创建部署
2. 上传 zip（需从 landing/ 目录内部打包，不含父目录）
3. 点「保存并部署」

**注意**：手动上传方式仍然可用，但会被 GitHub Actions 的部署覆盖（因为同一个 Pages 项目）。

---

## 关键坑记录

### 1. zip 打包路径问题
❌ 错误方式（文件在 `landing/` 子目录里）：
```bash
cd /projects/visora && zip -r visora.zip landing/
```
结果：zip 里是 `landing/index.html`，Cloudflare 会把 `landing/` 目录当根目录，导致路径变成 `/landing/index.html`。

✅ 正确方式（文件在根目录）：
```bash
cd /projects/visora/landing && zip visora.zip index.html privacy.html terms.html ...
```

### 2. Cloudflare Pages 直接上传不支持后期连接 GitHub
已有直接上传项目无法在设置里添加 Git 连接，解决方案是 GitHub Actions 调用 Cloudflare API 部署到同一个项目。

### 3. Wrangler CLI 需要 Node.js 环境
GitHub Actions 用 `cloudflare/pages-action@v1`，已内置 wrangler，无需额外安装。

---

## DNS 配置（Cloudflare）

| 类型 | 名称 | 内容 |
|------|------|------|
| CNAME | `@` (visoraapp.com) | `visora-apr.pages.dev` |

Proxy 状态：橙色云朵（已开启 Cloudflare 代理）。

---

## AI 友好配置

`robots.txt` 已开放所有 AI 爬虫：
```
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /
```

`llms.txt` 提供结构化产品信息供 AI 读取。
