# Visora — Project Context
> 每次开新对话时，把这个文件内容告诉 Claude，即可无缝继续工作。
> 最后更新：2026-03-24（Session 7 完成）

---

## 一句话

**Visora (visoraapp.com)** 是面向英文市场 indie hacker 和小型 SaaS 的 GEO 自助优化工具。
帮助用户出现在 ChatGPT、Perplexity、Claude 的推荐结果里。定价 $29-79/月，竞品最低 $99+。

---

## 关键信息

| 项目 | 值 |
|------|-----|
| 域名 | visoraapp.com |
| GitHub | ScottLiu007/visora-landing |
| 支付 | Creem 已接入（Builder $29/mo、Growth $79/mo，KYC 已验证） |
| 本地路径 | `/Users/scott/.claude/projects/visora/` |
| 联系邮件 | hello@visoraapp.com |
| 表单 | Formspree xpwzgqvk |

---

## 工程目录结构

```
visora/
├── project_context.md      ← 你正在看的这个文件
├── start.sh                ✅ 一键启动脚本（kill 占用端口 + 起 backend + dashboard）
├── dev-notes.md            ✅ 开发约定（工具选择/代理/端口/部署）
├── README.md
├── ROADMAP.md
├── COSTS.md
├── landing/                ← 已上线 (GitHub Pages / Actions 自动部署)
│   ├── index.html          ✅ 首页（含 nav 链接到 FAQ + 博客）
│   ├── faq.html            ✅ FAQ 独立页面（50 问）
│   ├── blog/
│   │   ├── what-is-geo.html        ✅ 定义性文章
│   │   └── best-geo-tools-2026.html ✅ 对比文章
│   ├── privacy.html        ✅
│   ├── terms.html          ✅
│   ├── robots.txt          ✅ 允许 GPTBot/PerplexityBot/ClaudeBot
│   └── llms.txt            ✅
├── dashboard/              ← Next.js 14 Dashboard（Week 2 完成，本地 :3002 运行中）
│   ├── app/layout.tsx + page.tsx                    ✅
│   ├── app/auth/login + signup + callback            ✅
│   ├── app/dashboard/layout(guard) + page(overview)  ✅
│   ├── app/dashboard/scan/page.tsx                   ✅
│   ├── app/dashboard/report/[id]/page.tsx            ✅
│   ├── components/dashboard/ DashboardNav/ScanRow/EmptyState ✅
│   ├── lib/ api.ts + supabase.ts + utils.ts          ✅
│   ├── middleware.ts                                  ✅
│   ├── .env.local（SUPABASE_ANON_KEY 已填）           ✅
│   └── package.json dev script: NODE_ENV=development -p 3002 ✅
├── mvp/                    ← Node.js 后端（Week 1 完成）
│   ├── src/
│   │   ├── scanner.js      ✅ 核心扫描引擎（Perplexity API）
│   │   ├── scorer.js       ✅ 4维加权评分算法
│   │   ├── analyzer.js     ✅ 竞品 citation gap 分析 + 行动建议
│   │   ├── generator.js    ✅ FAQ/Schema/llms.txt 生成
│   │   └── index.js        ✅ Express server (port 3001)
│   ├── api/
│   │   ├── scan.js         ✅ POST /api/scan
│   │   ├── report.js       ✅ GET /api/report/:id
│   │   └── waitlist.js     ✅ POST /api/waitlist
│   ├── supabase/
│   │   └── schema.sql      ✅ DB schema（待在 Supabase 执行）
│   ├── .env.example        ✅
│   └── package.json        ✅ (openai, express, cors, dotenv, supabase)
├── product/
│   ├── design.md           ✅ 完整产品设计文档
│   └── mvp.md              ✅ MVP 范围 + 技术栈
├── tech/
│   ├── architecture.md         ✅ 技术架构（已更新）
│   └── vps-deploy.md           ✅ VPS 完整部署手册（nginx/pm2/HTTPS/Vercel）
├── gtm/
│   ├── strategy.md         ✅ GTM 策略
│   ├── reddit-posts.md     ✅ 4篇 Reddit 帖子草稿（可直接发）
│   └── g2-capterra-content.md ✅ G2/Capterra/Product Hunt 文案
└── research/
    ├── china-geo.md
    └── tech-validation.md
```

---

## 当前进度

### ✅ 阶段一（已完成）
- 产品设计、市场研究
- 域名注册 + Landing Page 上线
- Creem 支付接入
- robots.txt / llms.txt / Schema 数据
- 邮件收集（Formspree）
- GitHub Actions 自动部署

### ✅ 阶段二 — 内容（已完成，2026-03-24）
- FAQ 独立页面上线（`/faq`）
- 定义性文章：`/blog/what-is-geo`
- 对比文章：`/blog/best-geo-tools-2026`
- 首页 nav + footer 加了文章链接
- 全部 push 到 main，自动部署

### ✅ 阶段二 — MVP Week 1（已完成，2026-03-24）
- `scorer.js`：4维加权评分（出现率50%+密度20%+情感15%+来源质量15%）
- `analyzer.js`：citation gap 分析 + 竞品来源溯源 + 3条优先行动
- `generator.js`：FAQ生成/Schema markup/platform文案/llms.txt
- `index.js`：Express server，带 CORS、日志、错误处理
- `api/scan.js`：完整扫描流水线（scan→score→analyze→存 Supabase）
- `api/report.js` / `api/waitlist.js`
- `supabase/schema.sql`：三张表（profiles/scans/waitlist）+ RLS + 自动建 profile
- 模块联测通过（mock data 跑出正确分数、gap分析、行动建议）

### ✅ 阶段二 — 环境配置（已完成，2026-03-24 Session 2）
- Product Hunt 账号注册：scott_liu3（liutao0518@qq.com Google 登录）
- Supabase 项目创建：visora（项目ID: nbeklglegiqfrrrlvwfb，区域: us-east-1）
- 数据库 schema 执行成功（profiles / scans / waitlist 三表 + RLS + trigger）
- `.env` 已完整配置：OPENROUTER_API_KEY + SUPABASE_URL + SUPABASE_SERVICE_KEY + SUPABASE_ANON_KEY

---

## 待完成任务

### 阶段二 — 需要你手动操作（账号类）
- [ ] Reddit 首帖：发 r/SEO（用 `gtm/reddit-posts.md` 帖子1，纯数据帖，不提 Visora）
- [ ] G2 注册：https://www.g2.com/products/new（文案在 `gtm/g2-capterra-content.md`）
- [ ] Capterra 注册：https://www.capterra.com/vendors/sign-up
- [ ] Product Hunt Coming Soon：https://www.producthunt.com/coming-soon

### 阶段二 — 需要你配置（环境）
- [ ] 创建 `.env` 文件：`cp mvp/.env.example mvp/.env`，填入 OPENROUTER_API_KEY
- [ ] Supabase 建项目：新建 → SQL Editor → 粘贴 `mvp/supabase/schema.sql` 执行
- [ ] 填入 Supabase 的 SUPABASE_URL 和 SUPABASE_SERVICE_KEY 到 .env

### ✅ 阶段三 — MVP Week 2（已完成，2026-03-24 Session 3）
- [x] Next.js 14 Dashboard 初始化（26个文件，本地 :3002）
- [x] Supabase Auth（注册/登录/callback/middleware 路由守护）
- [x] 扫描界面：输入 URL + 竞品 → 触发 scan API
- [x] 报告页：ScoreRing + RadarChart + Gap BarChart + Action Items + 生成内容
- [x] .env.local 配置完成（SUPABASE_ANON_KEY 已填）
- [x] NODE_ENV 问题定位修复（写入 package.json dev script）

### ✅ 阶段三 — New Scan 端到端联调（已完成，2026-03-24 Session 5）
- [x] 修复 `mvp/api/scan.js`：新增 `buildScanReport()` 统一数据转换层
  - `score_breakdown` 扁平化（appearance_rate / citation_density / sentiment / source_quality）
  - per-question gaps → 按竞品聚合的 `citation_gaps`
  - `priority: 1/2/3` → `'high'/'medium'/'low'`，`reason` → `description`
  - 返回值改为 `{ scanId, success }`（前端 triggerScan 期望格式）
- [x] 修复 `mvp/api/report.js`：GET /:id 直接返回 ScanReport 对象（去掉外层包装）
  - running/pending 状态返回最小结构支持 polling
  - 列表接口 `visibility_score` → `score` 映射
- [x] 修复报告页 Sentiment 5000 bug（`* 100` 多乘一次）
- [x] 端到端全流程验证：填表单 → Running scan → 跳转报告页 → 渲染 GEO Score / Radar / Gap Chart / Actions
- [x] start.sh 启动脚本（自动 kill 占用端口，启动 backend + dashboard）
- [x] Supabase Admin API 创建测试账号（dev@visoraapp.com / Visora2026!，已 email_confirm）
- [x] 登录流程端到端测试通过（login → /dashboard 跳转正常）
- [x] middleware 路由守护验证通过（未登录自动跳 /auth/login）
- [x] Session 持久化验证通过（刷新后保持登录）
- [x] CORS 修复：mvp/.env ALLOWED_ORIGIN 从 3000 → 3002（"Failed to fetch" 消除）
- [x] Dashboard Overview 界面正常渲染（No scans yet 空态）

### ✅ 阶段四 — VPS 后端上线（已完成，2026-03-24 Session 7）
- [x] Node.js 20 + npm + pm2 安装（via nvm）
- [x] 代码 scp 上传到 `/opt/visora/mvp`
- [x] .env 配置（NODE_ENV=production，ALLOWED_ORIGIN=dashboard域名）
- [x] pm2 启动 visora-api（online 状态）
- [x] pm2 开机自启（systemd 配置完成）
- [x] nginx 反代配置（proxy_pass → 3001，120s timeout）
- [x] DNS A 记录：`api.visoraapp.com` → `47.85.12.236`（灰云）
- [x] HTTPS 证书（Let's Encrypt，certbot 5.4.0，自动续期）
- [x] 验证：`https://api.visoraapp.com/health` 返回 `{"status":"ok"}`
- [x] GitHub 仓库创建：`ScottLiu007/visora-app`（Public）
- [x] 代码 push：64 文件，dashboard + mvp 全部提交
- [x] VPS 环境探查完成（root@47.85.12.236，Debian 11）
- [x] 部署步骤文档：`tech/vps-deploy.md`（含 nginx/pm2/HTTPS/Vercel 完整步骤）
- [x] New Scan 页面 → 触发扫描接口联调（填表单 → POST /api/scan → 报告页）✅
### 待完成
- [x] VPS 部署 backend：Node 20 + pm2 + nginx + HTTPS ✅ https://api.visoraapp.com
- [ ] Vercel 部署 dashboard（连 GitHub visora-app → dashboard目录）
- [ ] Supabase Auth URL 加生产域名 dashboard.visoraapp.com
- [ ] dashboard .env 的 NEXT_PUBLIC_API_URL 改为 https://api.visoraapp.com

### 推广（随时可做）
- [ ] Reddit 首帖：发 r/SEO（用 `gtm/reddit-posts.md` 帖子1，纯数据帖，不提 Visora）
- [ ] G2 注册：https://www.g2.com/products/new
- [ ] Capterra 注册：https://www.capterra.com/vendors/sign-up
- [ ] Product Hunt Coming Soon 页面提交（账号已注册：scott_liu3）

---

## API 接口速查

| Method | Path | 说明 |
|--------|------|------|
| GET | /health | 健康检查 |
| POST | /api/scan | 触发扫描，body: `{targetBrand, websiteUrl, category, competitors[], questionLimit?}` |
| GET | /api/report/:id | 获取历史报告 |
| GET | /api/report/user/:userId | 用户扫描列表 |
| POST | /api/waitlist | 加入等待列表，body: `{email, source?}` |
| GET | /api/waitlist/count | 等待列表人数 |

---

## 定价

| 套餐 | 价格 | 核心限制 |
|------|------|----------|
| Starter | 免费 | 1网站，每月1次扫描 |
| Builder | $29/月 | 1网站，每周扫描，5竞品，10次内容生成/月 |
| Growth | $79/月 | 3网站，每日监测，无限内容生成，API访问 |

---

## 技术栈

- 前端：Next.js 14（Week 2 搭建）
- 后端：Node.js + Express（✅ 已完成）
- 数据库：Supabase PostgreSQL（schema 已写，待接入）
- AI 查询：OpenRouter → Perplexity Sonar（中国可用）
- 内容生成：Anthropic claude-sonnet-4-20250514
- 部署：Vercel（前端）+ Railway（后端）
- 支付：Creem（已接入）→ Stripe（v2）
- 邮件：Resend（Week 4）

---

## 如何开始新对话

在新对话框开头说：
> "请读 `/Users/scott/.claude/projects/visora/project_context.md`，然后继续做 [具体任务]"

Claude 读完这个文件就能立即上下文同步，无需重新介绍项目。

---

## Supabase 项目信息

| 字段 | 值 |
|------|-----|
| 项目名 | visora |
| 项目 ID | nbeklglegiqfrrrlvwfb |
| URL | https://nbeklglegiqfrrrlvwfb.supabase.co |
| 区域 | us-east-1（North Virginia） |
| DB 密码 | 5VZOkGfC5uwxsKvG |
| Dashboard | https://supabase.com/dashboard/project/nbeklglegiqfrrrlvwfb |

## 测试账号（本地开发用）

| 字段 | 值 |
|------|-----|
| Email | dev@visoraapp.com |
| Password | Visora2026! |
| 状态 | Supabase email 已 confirm，可直接登录 |
| 登录地址 | http://localhost:3002/auth/login |

## Product Hunt 账号

| 字段 | 值 |
|------|-----|
| 用户名 | scott_liu3 |
| 邮箱 | liutao0518@qq.com（Google 登录） |
| 主页 | https://www.producthunt.com/@scott_liu3 |
