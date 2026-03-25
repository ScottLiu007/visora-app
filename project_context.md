# Visora — Project Context
> 每次开新对话时，把这个文件内容告诉 Claude，即可无缝继续工作。
> 最后更新：2026-03-25（Session 15）
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
| VPS git root | /opt/visora/mvp |
| VPS pm2 运行路径 | /opt/visora/mvp/mvp（Session 12 修复，git pull 导致嵌套一层）|
| pm2 管理 | `pm2 list / logs visora-api / restart visora-api` |
| 一键部署 | `ssh -i ~/.ssh/deeask-usa.pem root@47.85.12.236 "bash /opt/visora/deploy.sh"` |

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

### ✅ 阶段七 — Paywall 接入（Session 9 续）
- **升级墙组件** `components/ui/UpgradeWall.tsx`：显示 Builder/Growth 两个方案，直链 Creem checkout ✅
- **扫描页 plan 检查**：登录后自动拉取 `plan + scan_credits`，credits=0 且 plan=starter 时显示升级墙 ✅
- **后端 paywall**：`api/scan.js` 扫描前检查 credits，不足返回 402 + `upgrade_required` ✅
- **后端扣 credits**：扫描成功后自动 -1（仅 starter plan）✅
- **新增 `api/user.js`**：GET `/api/user/plan` 返回用户 plan 和 scan_credits ✅
- **新增 `api/webhooks.js`**：POST `/api/webhooks/creem` 处理 `checkout.completed` / `subscription.active` / `subscription.canceled`，自动升降级 plan ✅
- **Creem webhook 配置**：`https://api.visoraapp.com/api/webhooks/creem`，13 个事件全选 ✅
- Vercel deploy `CzqDaKX39` Ready ✅

## Creem 支付信息
| 字段 | 值 |
|------|-----|
| Builder $29/mo checkout | https://www.creem.io/payment/prod_1dI5h87ZhzzodGpRrRSvbW |
| Growth $79/mo checkout | https://www.creem.io/payment/prod_1Xl8T46dBXT2zWowehqoQf |
| Webhook URL | https://api.visoraapp.com/api/webhooks/creem |
- **生产完整流程验证通过**：Vercel URL 登录 → 扫描（~60s）→ 报告页，全程无阻 ✅

### ✅ 阶段八 — 真实用户流程测试（Session 10）
- **playwright-cdp 调通**：NO_PROXY 环境变量修复代理拦截问题 ✅
- **新用户注册流程验证**：liutao0518@qq.com 注册 → Supabase 邮件验证 → 登录 → Dashboard，全流程 ✅
- **Credits 显示正确**：新用户进扫描页显示 "Free scans left: 1" ✅
- **国内访问 VPS 结论**：Chrome CDP 独立 profile 默认不走系统代理，访问境外 VPS 需加 `--proxy-server` 启动参数（本机代理端口 1087）

### ✅ 阶段十 — 报告透明度升级 + VPS 路径修复（Session 12）
- **报告页新增「How We Scored You」模块**：4 维权重分解（50/20/15/15）+ 原始分 + 贡献点数 ✅
- **报告页新增「Queries Asked to AI」模块**：10 条 prompt 全列出，✅ Cited / ❌ Missed + 竞品被提情况 ✅
- **Action Items 低分优化**：Score < 10 时改为 G2 / Product Hunt / Reddit 具体 GTM 行动，每条带直链 ✅
- **scan.js**：存入 `scan_questions`、`score weights`、`stats` 到 `report_json` ✅
- **修复 VPS pm2 路径问题**：git pull 导致代码嵌套到 `/opt/visora/mvp/mvp/`，重新指向 pm2 并更新 deploy.sh ✅
- **api.visoraapp.com/health 验证**：`{"status":"ok"}` ✅
- **llms.txt 自动生成**：每次扫描自动生成用户专属 llms.txt，存入 `report_json.generated_content.llms_txt`，报告页 CodeBlock 展示 ✅
- **竞品引用来源归因**：`competitor_sources` 存入 report_json，报告页新增「Why AI Cites Your Competitors」柱状图模块 ✅
- **Product Keywords 字段**：扫描表单新增可选字段，用实际产品关键词生成精准问题（"GEO optimization" 而非 "SaaS / Software"），透传链路完整 ✅
- **scanner.js buildQuestions 优化**：优先用 keywords 第一词，支持多词轮转，fallback 到 category ✅

### ✅ 阶段九 — Bug 修复 + 完整流程验证（Session 11）
- **修复 Bug 1**：`lib/api.ts` 所有接口加 `fetchWithTimeout(15s)` + `normalizeError()`，错误提示友好化 ✅
- **修复 Bug 2（核心）**：CORS `Access-Control-Allow-Origin` 返回整个逗号分隔列表 → 改为 origin callback 只返回匹配的单个域名 ✅
- **修复 Bug 3**：扫描接口 timeout 15s → 120s（扫描本身需 ~60s）✅
- **VPS 配置 git**：`/opt/visora/mvp` 初始化 git，绑定 GitHub remote，一键部署脚本 `/opt/visora/deploy.sh` ✅
- **完整流程验证通过**：注册→邮件验证→登录→扫描页(credits=1)→扫描提交→VPS 执行完成→升级墙触发，全程 ✅
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

### 🐛 已发现 Bug（Session 10 真实用户流程测试）
- [x] **Dashboard 新用户 "Failed to fetch"**：已修复 → 友好错误提示 + ⚠ 图标 + retry 按钮。
- [x] **扫描页 plan 检查 "Failed to fetch"**：已修复 → silent fallback + 友好提示。

### ✅ Session 12 端到端测试通过
- 登录 → 扫描页（credits=5）→ 填表 → 扫描（~95s）→ 报告页全流程 ✅
- Priority Actions：3 条 GTM 专属行动（G2 / PH / Reddit）+ Do it now 链接 ✅
- How We Scored You：4 维权重分解 + "0 of 10 AI queries" 统计 ✅
- Queries Asked to AI：10 条 prompt 全部 Missed（Visora 尚不可见）✅
- Generated Content：llms.txt 展开 + Copy 按钮 ✅

### ✅ Session 15 — 中期功能包（cron / Resend / 公开分享 / Citation 机会）
- **每周自动扫描**：`POST /api/cron/weekly-auto-scan`，请求头 `Authorization: Bearer $CRON_SECRET`（或 `X-Visora-Cron`）。对 `plan=growth` 且 `weekly_scan_config` 非空的用户各跑一次扫描（插入 `scans` → `runScanPipeline` → 写库 → 更新 `last_auto_scan_at`）。**Growth 用户每次手动扫描成功后**会把当次参数写入 `weekly_scan_config`（作为下周 cron 的配置）。
- **邮件（Resend）**：Builder/Growth 扫描完成后发一封「分数 + vs 上次 + 报告链接」；未配置 `RESEND_API_KEY` 时静默跳过。环境变量：`RESEND_API_KEY`、`RESEND_FROM`（默认 `Visora <onboarding@resend.dev>`）、`PUBLIC_DASHBOARD_URL`（邮件内报告链接）。
- **公开分享**：`POST /api/report/:id/share`（需用户 JWT）生成/复用 `share_token`；`GET /api/report/public/:token` 无鉴权返回报告 JSON。前端 `/share/[token]` 只读页 + 报告页「Public link」复制。
- **Citation opportunities**：`mvp/src/opportunities.js` 单次 Perplexity 调用，结构化写入 `report_json.citation_opportunities`；报告页与公开页展示。
- **数据库**：执行 `mvp/supabase/migration_session14.sql`（或新库用已更新的 `schema.sql`）：`profiles.weekly_scan_config`、`email_notifications`、`last_auto_scan_at`；`scans.share_token` 唯一索引。
- **依赖**：`mvp/package.json` 增加 `resend`；VPS 需 `npm install`、`pm2 restart`，并配置 `CRON_SECRET` + crontab 示例见下。

**VPS crontab 示例（每周一 09:00 UTC）：**
```bash
0 9 * * 1 curl -fsS -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://api.visoraapp.com/api/cron/weekly-auto-scan
```

### ✅ Session 14 — 历史趋势 + Delta 对比
- **Overview 页折线图**：将同品牌历史扫描分数按时间排序，绘制多线趋势图（≥2 条数据才显示）
  - 多品牌各用不同颜色区分
  - Y 轴 0-100，参考线 y=50，tooltip 显示颜色化分数
- **报告页 delta badge**：标题旁显示 "+5 vs last scan"（绿色）/ "-3 vs last scan"（红色）
  - 加载报告时并发请求用户所有扫描，找到同品牌上一次完成的分数
  - 首次扫描不显示 badge
- 前端改动：`dashboard/app/dashboard/page.tsx`、`dashboard/app/dashboard/report/[id]/page.tsx`
- 已 push，Vercel 自动部署中

### GTM
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

## 浏览器自动化工具链（auto-browser）

使用 **playwright-cdp** 工具集控制 Chrome（完整交互能力）。

### Step 1 — 启动 Chrome（每次使用前执行）

**国内环境（需要代理访问 VPS/境外 API）：**
```bash
pkill -f "Google Chrome" && sleep 2 && \
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --remote-debugging-port=9222 \
  '--remote-allow-origins=http://127.0.0.1:9222' \
  --user-data-dir=/tmp/chrome_cdp \
  '--proxy-server=http://127.0.0.1:1087' \
  '--proxy-bypass-list=<-loopback>' \
  &
```

**无代理需求时（纯国内/本地访问）：**
```bash
pkill -f "Google Chrome" && sleep 2 && \
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --remote-debugging-port=9222 \
  '--remote-allow-origins=http://127.0.0.1:9222' \
  --user-data-dir=/tmp/chrome_cdp \
  &
```

确认成功：终端出现 `DevTools listening on ws://127.0.0.1:9222/...`

**坑（血泪教训）：**
1. `--user-data-dir` 必须加，否则 Chrome 报错拒绝开 debug port
2. `--remote-allow-origins` 必须写具体地址 `http://127.0.0.1:9222`，不能用 `*`（zsh 通配符）
3. 必须先 `pkill -f "Google Chrome"` 关掉所有 Chrome，否则参数被转发给旧实例
4. macOS 上 `localhost` 优先解析到 IPv6 `::1`，Chrome 只监听 IPv4，所以 MCP 配置和 allow-origins 都用 `127.0.0.1`
5. MCP 配置（`~/Library/Application Support/Claude/claude_desktop_config.json`）：
   `playwright-cdp.args` 末尾必须是 `"http://127.0.0.1:9222"`，改完需重启 Claude Desktop
6. **系统代理坑（Clash 等）**：如果机器开了系统代理（如 Clash），playwright-cdp MCP 进程连接 127.0.0.1:9222 时流量会被代理拦截，返回 400 错误。
   **解决方案**：在 `claude_desktop_config.json` 的 playwright-cdp 段加 `env`，然后重启 Claude Desktop：
   ```json
   "env": {
     "NO_PROXY": "127.0.0.1,localhost",
     "no_proxy": "127.0.0.1,localhost"
   }
   ```

### Step 2 — playwright-cdp 常用操作
- `browser_navigate` — 导航到 URL
- `browser_snapshot` — 获取页面无障碍树（**操作前必做**）
- `browser_click` — 点击元素（用 snapshot 的 ref）
- `browser_fill_form` / `browser_type` — 填写表单
- `browser_wait_for` — 等待加载或文本出现
- `browser_take_screenshot` — 截图确认结果

**规则：snapshot → 操作 → wait → snapshot 确认。**

---

## 如何开始新对话

说：`"请读 /Users/scott/.claude/projects/visora/project_context.md"` 即可无缝接上。
