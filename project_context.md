# Visora — Project Context
> 每次开新对话时，把这个文件内容告诉 Claude，即可无缝继续工作。
> 最后更新：2026-03-25（Session 15 完结）
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
| GitHub（代码） | ScottLiu007/visora-app（dashboard + mvp，同一个仓库根目录） |
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
| Dashboard | https://dashboard.visoraapp.com |
| Dashboard（Vercel URL）| https://visora-app-git-main-scottliu007s-projects.vercel.app |
| Backend API | https://api.visoraapp.com |
| API Health | https://api.visoraapp.com/health |
| VPS SSH | `ssh -i ~/.ssh/deeask-usa.pem root@47.85.12.236` |
| VPS git root | `/opt/visora/mvp` |
| VPS pm2 运行路径 | `/opt/visora/mvp/mvp`（git pull 嵌套一层，Session 12 确认） |
| pm2 管理 | `pm2 list / logs visora-api / restart visora-api --update-env` |
| 一键部署 | `ssh -i ~/.ssh/deeask-usa.pem root@47.85.12.236 "bash /opt/visora/deploy.sh"` |

---

## 工程目录结构

```
visora/                         ← git 仓库根（ScottLiu007/visora-app）
├── project_context.md
├── ROADMAP.md
├── landing/                    ← visoraapp.com（GitHub Pages，独立仓库）
├── dashboard/                  ← Next.js 14（Vercel 自动部署）
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx        ← Overview（趋势图、统计）
│   │   │   ├── scan/page.tsx   ← 扫描表单（含 Product Keywords 字段）
│   │   │   └── report/[id]/page.tsx  ← 报告详情（含分享、delta badge）
│   │   └── share/[token]/page.tsx    ← 公开只读报告页（无需登录）
│   └── lib/api.ts              ← 前端 API 类型 + 请求封装
└── mvp/                        ← Node.js 后端（VPS 已部署）
    ├── src/
    │   ├── index.js            ← Express app 入口
    │   ├── scanner.js          ← Perplexity 问答引擎
    │   ├── scorer.js           ← 4 维 GEO 评分
    │   ├── analyzer.js         ← Gap 分析 + Priority Actions
    │   ├── generator.js        ← llms.txt / FAQ / Schema 生成
    │   ├── executeScan.js      ← 扫描流水线（HTTP + cron 共用）
    │   ├── opportunities.js    ← Citation 机会（单次 Perplexity）
    │   └── email.js            ← Resend 邮件（可选）
    ├── api/
    │   ├── scan.js             ← POST /api/scan
    │   ├── report.js           ← GET /api/report/:id + /public/:token + /:id/share
    │   ├── cron.js             ← POST /api/cron/weekly-auto-scan
    │   ├── user.js             ← GET /api/user/plan
    │   ├── webhooks.js         ← POST /api/webhooks/creem
    │   └── waitlist.js
    ├── supabase/
    │   ├── schema.sql          ← 完整建表 SQL（含 Session 15 新列）
    │   └── migration_session14.sql  ← 增量迁移（已在生产库执行）
    └── package.json            ← 依赖：openai / express / cors / @supabase / resend
```

---

## VPS 环境变量（/opt/visora/mvp/mvp/.env）

| 变量 | 值/状态 |
|------|---------|
| `OPENROUTER_API_KEY` | ✅ 已配置 |
| `SUPABASE_URL` | `https://nbeklglegiqfrrrlvwfb.supabase.co` |
| `SUPABASE_SERVICE_KEY` | ✅ 已配置 |
| `SUPABASE_ANON_KEY` | ✅ 已配置 |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGIN` | dashboard.visoraapp.com + Vercel URL + visoraapp.com + localhost |
| `RESEND_API_KEY` | ✅ `re_SEWAd4nk_...`（已配置） |
| `RESEND_FROM` | `Visora <hello@visoraapp.com>`（visoraapp.com 域名 2026-03-25 验证 ✅）|
| `CRON_SECRET` | ✅ 已配置（随机 base64，保密） |
| `PUBLIC_DASHBOARD_URL` | `https://dashboard.visoraapp.com` |

**更新 env 后必须执行**：`pm2 restart visora-api --update-env`，并同步 `cp -f mvp/.env mvp/mvp/.env`（或反向）。

---

## VPS Crontab（每周一 09:00 UTC）

```bash
0 9 * * 1 curl -fsS -X POST -H 'Authorization: Bearer <CRON_SECRET>' https://api.visoraapp.com/api/cron/weekly-auto-scan >> /var/log/visora-cron.log 2>&1
```

触发条件：`plan=growth` 且 `weekly_scan_config` 非空（Growth 用户每次手动扫描后自动保存上次参数）。

---

## Supabase 项目信息

| 字段 | 值 |
|------|-----|
| 项目 ID | nbeklglegiqfrrrlvwfb |
| URL | https://nbeklglegiqfrrrlvwfb.supabase.co |
| DB 密码 | 5VZOkGfC5uwxsKvG |
| DB 直连（本机 psql）| `host=db.nbeklglegiqfrrrlvwfb.supabase.co port=5432 dbname=postgres user=postgres sslmode=require` |
| Dashboard | https://supabase.com/dashboard/project/nbeklglegiqfrrrlvwfb |
| Auth Redirect URLs | Vercel URL + dashboard.visoraapp.com |

### 数据表（已含 Session 15 迁移）

**profiles**：id / email / plan / scan_credits / websites / weekly_scan_config / email_notifications / last_auto_scan_at / created_at / updated_at

**scans**：id / user_id / target_brand / website_url / category / competitors / status / visibility_score / report_json / share_token / error_message / question_count / created_at / completed_at

---

## 测试账号

| 字段 | 值 |
|------|-----|
| Email | dev@visoraapp.com |
| Password | Visora2026! |
| 生产登录 | https://dashboard.visoraapp.com/auth/login |

credits 不够时用 Supabase Dashboard → Table Editor → profiles → 手动设 `scan_credits = 5`。

---

## 支付信息（Creem）

| 字段 | 值 |
|------|-----|
| Builder $29/mo | https://www.creem.io/payment/prod_1dI5h87ZhzzodGpRrRSvbW |
| Growth $79/mo | https://www.creem.io/payment/prod_1Xl8T46dBXT2zWowehqoQf |
| Webhook URL | https://api.visoraapp.com/api/webhooks/creem |

---

## 已完成功能全览

### 基础 MVP
- ✅ scanner.js → scorer.js → analyzer.js → generator.js 完整扫描流水线
- ✅ Express API：/api/scan / report / user / webhooks / cron / waitlist
- ✅ Dashboard：登录 / 扫描页 / 报告页 / Overview
- ✅ Paywall：starter 1 次免费，Creem webhook 自动升降级

### 报告透明度（Session 12）
- ✅ How We Scored You：4 维权重分解可视化
- ✅ Queries Asked to AI：所有 prompt + ✅/❌ 品牌提及
- ✅ Action Items 低分专属路径（G2 / PH / Reddit 带直链）
- ✅ llms.txt 自动生成（模板引擎，写入 report_json）
- ✅ 竞品引用来源归因「Why AI Cites Your Competitors」
- ✅ Product Keywords 可选字段 → 精准问题生成

### 历史趋势（Session 14）
- ✅ Overview 折线图（同品牌多次扫描，≥2 条显示）
- ✅ 报告页 delta badge（+N / -N vs last scan）

### 中期功能包（Session 15）
- ✅ **每周自动扫描**：cron endpoint + Growth 用户自动保存配置 + VPS crontab
- ✅ **邮件通知**：Resend，扫描完成发送（含分数、对比上次、报告链接）
- ✅ **报告公开分享**：share_token + /share/[token] 只读页 + 报告页复制按钮
- ✅ **Citation opportunities**：Perplexity 单次调用，结构化机会列表，展示在报告页
- ✅ **Supabase 迁移已执行**（migration_session14.sql）
- ✅ **visoraapp.com 邮件域名验证**（Resend DNS 2026-03-25 验证通过）

---

## GTM 待完成

- [ ] Reddit 首帖 r/SEO（草稿在 `gtm/reddit-posts.md`）
- [ ] G2 注册：https://www.g2.com/products/new
- [ ] Capterra 注册：https://www.capterra.com/vendors/sign-up
- [ ] Product Hunt Coming Soon（账号 scott_liu3，liutao0518@qq.com）

---

## VPS 后端 CORS 配置

`ALLOWED_ORIGIN`（逗号分隔，多域名）：
```
https://dashboard.visoraapp.com,https://visora-app-git-main-scottliu007s-projects.vercel.app,https://visoraapp.com,http://localhost:3000,http://localhost:3002
```

---

## 浏览器自动化（auto-browser）

使用 `user-playwright-cdp` 工具集控制真实 Chrome。

### 启动 Chrome（每次使用前执行）

```bash
pkill -f "Google Chrome" && sleep 2 && \
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --remote-debugging-port=9222 \
  '--remote-allow-origins=http://127.0.0.1:9222' \
  --user-data-dir=/tmp/chrome_cdp \
  '--proxy-server=http://127.0.0.1:1087' \
  '--proxy-bypass-list=<-loopback>' \
  > /tmp/chrome_cdp.log 2>&1 &
```

确认：`curl -s --noproxy '*' http://127.0.0.1:9222/json/version`（注意加 `--noproxy '*'`，否则 curl 自身走代理会超时）

**常见坑：**
1. `--user-data-dir` 必须指定
2. `--remote-allow-origins` 必须是 `http://127.0.0.1:9222`（不能用 `*`）
3. 先 pkill 关掉旧 Chrome
4. curl 检测要加 `--noproxy '*'`
5. MCP 配置加 `"env": {"NO_PROXY": "127.0.0.1,localhost"}` 并重启 Cursor

---

## 如何开始新对话

说：`"请读 /Users/scott/.claude/projects/visora/project_context.md"` 即可无缝接上。
