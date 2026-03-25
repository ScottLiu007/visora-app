# Visora — Project Context
> 每次开新对话时，把这个文件内容告诉 Claude，即可无缝继续工作。
> 最后更新：2026-03-25（Session 9 完成）
> **规则：每次操作完成后必须立即更新本文件。**

---

## 一句话

**Visora (visoraapp.com)** 是面向英文市场 indie hacker 和小型 SaaS 的 GEO 自助优化工具。
帮助用户出现在 ChatGPT、Perplexity、Claude 的推荐结果里。定价 $29-79/月，竞品最低 $99+。

---

## 关键信息

| 项目 | 值 |
|------|-----|
| 域名 | visoraapp.com |
| GitHub（代码） | ScottLiu007/visora-app（dashboard + mvp） |
| GitHub（landing） | ScottLiu007/visora-landing |
| 支付 | Creem 已接入（Builder $29/mo、Growth $79/mo，KYC 已验证） |
| 本地路径 | `/Users/scott/.claude/projects/visora/` |
| 联系邮件 | hello@visoraapp.com |
| 表单 | Formspree xpwzgqvk |

---

## 生产环境地址

| 项目 | 地址 |
|------|------|
| Landing Page | https://visoraapp.com |
| Dashboard（正式域名）| https://dashboard.visoraapp.com ✅（Session 9 绑定）|
| Dashboard（Vercel 原 URL）| https://visora-app-git-main-scottliu007s-projects.vercel.app |
| Backend API | https://api.visoraapp.com |
| API Health Check | https://api.visoraapp.com/health |
| VPS SSH | `ssh -i ~/.ssh/deeask-usa.pem root@47.85.12.236` |
| VPS 后端路径 | /opt/visora/mvp |
| pm2 管理 | `pm2 list / logs visora-api / restart visora-api` |

---

## 工程目录结构

```
visora/
├── project_context.md      ← 你正在看的这个文件
├── start.sh                ✅ 一键启动脚本（kill 占用端口 + 起 backend + dashboard）
├── landing/                ← 已上线 (GitHub Pages / Actions 自动部署)
├── dashboard/              ← Next.js 14 Dashboard（Vercel 已部署）
│   ├── app/auth/callback/route.ts   ✅（TypeScript 类型已修复）
│   ├── middleware.ts                ✅（TypeScript 类型已修复）
│   └── .env.local
└── mvp/                    ← Node.js 后端（VPS 已部署）
    ├── src/scanner.js / scorer.js / analyzer.js / generator.js / index.js
    ├── api/scan.js / report.js / waitlist.js
    └── supabase/schema.sql
```

---

## 已完成进度（截至 Session 9）

### ✅ 阶段一 — 基础设施
- Landing page 上线（visoraapp.com），FAQ、博客、robots.txt/llms.txt
- Creem 支付接入（Builder $29/mo、Growth $79/mo）
- Supabase 项目：nbeklglegiqfrrrlvwfb（us-east-1），三表 schema + RLS

### ✅ 阶段二 — MVP 后端（Session 1-2）
- scanner.js 扫描引擎、scorer.js 4维评分、analyzer.js gap分析
- Express API：/api/scan、/api/report、/api/waitlist
- 测试账号：dev@visoraapp.com / Visora2026!

### ✅ 阶段三 — Dashboard（Session 3-5）
- Next.js 14，Supabase Auth，扫描页，报告页（ScoreRing/RadarChart/GapChart）
- 端到端联调通过（登录→扫描→报告页全流程）

### ✅ 阶段四 — VPS 后端上线（Session 7）
- Node 20 + pm2 + nginx + HTTPS（Let's Encrypt，自动续期至2026-06-22）
- https://api.visoraapp.com/health 已验证 ✅

### ✅ 阶段五 — Vercel Dashboard 上线（Session 8）
- 创建 visora-app 项目，Root Directory=dashboard，Framework=Next.js
- 环境变量：NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / API_URL
- 修复 TypeScript 类型错误（cookie handler 参数），tsc 0 错误后 push
- Vercel 构建成功，deploy id: 3DZarFsq2，状态 Ready ✅
- Supabase Auth URL Configuration 已更新（Site URL + Redirect URLs 加入 Vercel 域名）✅

### ✅ 阶段六 — 生产流程验证 + 自定义域名（Session 9）
- **生产完整流程验证通过**：Vercel URL 登录 → 扫描（~60s）→ 报告页，全程无阻 ✅
- **修复 CORS 问题**：VPS `.env` 的 `ALLOWED_ORIGIN` 只有 `dashboard.visoraapp.com`（未绑定），
  导致 Vercel URL 被拒绝。修复：
  - `.env` 新增所有允许来源（Vercel URL、visoraapp.com、localhost 3000/3002）
  - `src/index.js` CORS 改为支持逗号分隔多域名（split(',').map(s => s.trim())）
  - `pm2 restart visora-api --update-env` 重启加载新配置 ✅
- **绑定自定义域名 dashboard.visoraapp.com**：
  - Cloudflare：CNAME `dashboard → cname.vercel-dns.com`，代理关闭（DNS only）✅
  - Vercel：visora-app 项目添加域名，Production 环境，SSL 自动签发 ✅
  - Supabase Auth Redirect URLs：新增 `https://dashboard.visoraapp.com/**`（共 2 条）✅

---

## VPS 后端 CORS 配置（重要）

`/opt/visora/mvp/.env` 中的 `ALLOWED_ORIGIN`（逗号分隔）：
```
ALLOWED_ORIGIN=https://dashboard.visoraapp.com,https://visora-app-git-main-scottliu007s-projects.vercel.app,https://visoraapp.com,http://localhost:3000,http://localhost:3002
```
如未来新增域名，需 SSH 到 VPS 更新此行并 `pm2 restart visora-api --update-env`。

---

## 待完成

- [ ] 确认 dashboard.visoraapp.com SSL 证书激活后，用正式域名完整测试登录→扫描→报告
- [ ] Reddit 首帖 r/SEO（草稿在 `gtm/reddit-posts.md`）
- [ ] G2 注册：https://www.g2.com/products/new
- [ ] Capterra 注册：https://www.capterra.com/vendors/sign-up
- [ ] Product Hunt Coming Soon（账号 scott_liu3，liutao0518@qq.com）

---

## Supabase 项目信息

| 字段 | 值 |
|------|-----|
| 项目 ID | nbeklglegiqfrrrlvwfb |
| URL | https://nbeklglegiqfrrrlvwfb.supabase.co |
| DB 密码 | 5VZOkGfC5uwxsKvG |
| Dashboard | https://supabase.com/dashboard/project/nbeklglegiqfrrrlvwfb |
| Auth Redirect URLs | Vercel URL + dashboard.visoraapp.com（共 2 条）|

## 测试账号

| 字段 | 值 |
|------|-----|
| Email | dev@visoraapp.com |
| Password | Visora2026! |
| 登录地址（本地） | http://localhost:3002/auth/login |
| 登录地址（生产） | https://dashboard.visoraapp.com/auth/login |

---

## 如何开始新对话

说：`"请读 /Users/scott/.claude/projects/visora/project_context.md"` 即可无缝接上。
