# Visora Roadmap
> visoraapp.com · 更新：2026-03-25（Session 16 · PH Launch Gallery 真实截图已保存）

---

## 总体思路

**先让 Visora 自己被 AI 推荐，再卖帮别人被 AI 推荐的工具。**

产品开发和市场推广同步进行。用 Visora 自己做 GEO 的过程，既验证产品逻辑，又积累第一批用户。

### 产品核心定位（Session 16 确认）

用户为**效果**付费，不是为报告或教育付费。Visora 的目标是：

> 用户贴网址 → Visora 生成所有内容 → 用户一键提交 → GEO 就做好了

三个阶段执行路径：
1. **GTM 先行**：Visora 自己先把 G2 / PH / Reddit 做完，分数从 8 涨上去，截图当营销素材
2. **产品改造**：P0 修 Query 引导 → P1 一键执行 Actions（生成内容 + URL 预填）→ P2 状态记忆
3. **Landing 改造**：首页加"输入网址免费测"入口，支持匿名扫描

---

## ✅ 已完成

### 基础设施
- [x] visoraapp.com 上线，robots.txt / llms.txt / Schema 结构化数据
- [x] Creem 支付接入（Builder $29/mo、Growth $79/mo，KYC 已验证）
- [x] GitHub Actions 自动部署（landing page）

### MVP 后端
- [x] scanner.js — 向 AI 搜索引擎提 10 个行业问题，统计品牌提及
- [x] scorer.js — 4 维 GEO Score（Appearance / Density / Sentiment / Source Quality）
- [x] analyzer.js — 竞品 Citation Gap 分析 + Priority Actions 生成
- [x] Express API：`/api/scan` `/api/report` `/api/user` `/api/webhooks`
- [x] VPS 部署（Node 20 + pm2 + nginx + HTTPS，api.visoraapp.com）

### Dashboard
- [x] Next.js 14 + Supabase Auth
- [x] 扫描页、报告页（ScoreRing / RadarChart / GapChart / Priority Actions）
- [x] Overview 页（历史扫描列表、汇总指标）
- [x] Vercel 部署，自定义域名 dashboard.visoraapp.com

### Paywall（Session 9）
- [x] Free tier：1 次免费扫描（scan_credits = 1）
- [x] 升级墙 UI（Builder / Growth 方案 + Creem 直链）
- [x] 后端 paywall 检查（credits 不足返回 402）
- [x] 扫描后自动扣 credits（仅 starter）
- [x] Creem webhook 自动升降级 plan

### 中期能力（Session 15）
- [x] 每周自动扫描 — `POST /api/cron/weekly-auto-scan` + Growth 用户 `weekly_scan_config` + VPS crontab
- [x] 分数变化邮件 — Resend，Builder/Growth 扫描完成触发（需 `RESEND_API_KEY`）
- [x] 报告公开分享 — `share_token` + `/share/:token` + 报告页复制链接
- [x] Citation 机会提醒 — `opportunities.js` 单次 Perplexity，写入报告 JSON

### 历史趋势对比（Session 14）
- [x] Overview 页：Score Trend 折线图（同品牌多次扫描历史，≥2 条才显示）
- [x] 报告页：标题旁「+5 vs last scan」/ 「-3 vs last scan」delta badge（绿/红色）
- [x] 并发加载当前报告 + 用户历史，找到同品牌上一次完成的分数做对比

### 报告透明度（Session 12）
- [x] 报告页「How We Scored You」—— 4 维权重分解可视化
- [x] 报告页「Queries Asked to AI」—— 所有 prompt + ✅/❌ 品牌提及状态
- [x] Action Items 低分专属路径（G2 / PH / Reddit 带直链）
- [x] VPS pm2 路径修复，deploy.sh 更新
- [x] llms.txt 自动生成（模板引擎，无 API 调用，每次扫描即生成）
- [x] 竞品引用来源归因「Why AI Cites Your Competitors」柱状图模块

---

## 🔜 第一阶段：GTM 先行（本周，不写代码）

> 目标：让 Visora 自己的 GEO 分数从 8 涨上去，产出"分数对比截图"作为营销素材

### 第三方平台收录（直接影响 GEO 分数）
- [x] **G2** — 已批准 listing（2026-03-25）
- [x] **Capterra** — Gartner Digital Markets 已提交 + 邮箱已验证（2026-03-25）；入口：`https://digitalmarkets.gartner.com/get-listed/start`（旧 `/vendors/sign-up` 已 404）
- [x] **Product Hunt** — launch 已创建，排期 **2026-04-01 PT**；**Gallery** 已上传 3 张报告页截图并保存（`assets/image1.png`～`image3.png`，2026-03-25）· `https://www.producthunt.com/products/visora?launch=visora` · Pre-Launch：`https://www.producthunt.com/products/visora/visora/prelaunch` · 编辑：`https://www.producthunt.com/posts/visora/edit`
- [ ] Trustpilot / AlternativeTo / dev.to

### Reddit 首帖（最快获取第一批用户）
- [ ] r/SEO — 分享 GEO 数据洞察（草稿在 `gtm/reddit-posts.md`）
- [ ] r/SaaS — 分享 Visora 自己的 GEO 实验
- [ ] r/entrepreneur — 出海工具的分发困境

### 内容
- [ ] "What is GEO and why your SaaS is invisible to ChatGPT"
- [ ] "Best GEO tools for indie hackers in 2026"（自己上榜）
- [ ] "Visora vs Otterly vs Rankscale"

---

## 🔧 第二阶段：产品核心改造（本周 + 下周）

### P0 — Query 引导修复（半天）
- [ ] Product Keywords 字段改为强推荐填写
- [ ] 加 placeholder 示例：`e.g. GEO optimization tool, AI visibility for SaaS`
- [ ] 字段下方加提示：`Specific keywords = more relevant AI queries = accurate score`

### P1 — 一键执行 Actions（2-3天，核心功能）
- [ ] 每个 Priority Action 生成对应内容（Reddit 帖子、G2 文案、PH tagline）
- [ ] 按钮点击 → 新标签页打开目标平台 + URL 参数预填内容
- [ ] Reddit 实现：`reddit.com/r/SaaS/submit?title=xxx&text=xxx`
- [ ] 用户只需登录 → 点发送

### P2 — Action 完成状态记忆（半天）
- [ ] 每个 Action 加复选框，勾选后持久化
- [ ] 已完成 Action 折叠/灰掉，不再重复推

---

## 🏠 第三阶段：Landing Page 改造（下下周）

- [ ] 首页加"输入你的网址，免费测一次"入口
- [ ] 支持匿名扫描（不用注册）
- [ ] 预览报告看完 → 注册解锁完整版

---

## 📋 产品迭代队列

| 功能 | 说明 | 状态 | 影响 |
|------|------|------|------|
| ~~历史趋势图~~ | Overview 折线图 + 报告页 delta badge | ✅ | 留存 |
| ~~邮件通知~~ | Resend，Builder/Growth 扫描完成 + 周报复用同一模板 | ✅ | 留存 |
| ~~定时扫描 cron~~ | Growth + `weekly_scan_config` + `CRON_SECRET` | ✅ | 核心卖点 |
| ~~报告分享链接~~ | `share_token` + 公开 API + `/share` 页 | ✅ | 传播 |
| ~~Citation 机会~~ | Perplexity 一次调用，结构化机会列表 | ✅ | 差异化 |
| **Query 引导修复** | Keywords 字段强引导，placeholder + 提示文案 | P0 本周 | 体验 |
| **一键执行 Actions** | 生成内容 + URL 预填，用户只需点提交 | P1 本周 | 核心价值 |
| **Action 状态记忆** | 完成后打勾，不再重复推 | P2 本周 | 留存 |
| **Landing 匿名扫描** | 首页输入网址直接测，不用注册 | 第三阶段 | 转化 |
| 报告导出 PDF | 一键导出，方便分享给团队 | 远期 | 传播 |
| FAQ 内容生成 | 基于扫描结果自动生成 FAQ 文案 | 远期 | 差异化 |
| Schema 代码生成 | 一键生成 FAQPage schema markup | 远期 | 差异化 |
| 多模型覆盖 | Claude / Gemini / Perplexity 分别测，对比可见性 | 远期 | 核心竞争力 |

---

## 📈 里程碑目标

| 时间 | 目标 |
|------|------|
| 2026-04（发布后 2 周）| 200 注册用户 |
| 2026-04（发布后 1 个月）| 10 付费用户（$290 MRR）|
| 2026-06 | 100 付费用户（$2,900 MRR）|
| 2026-09 | $5,000 MRR |

---

## 🔑 关键原则

1. **Visora 自己是第一个客户** — 所有功能先在 visoraapp.com 自身跑
2. **先 GTM 后功能** — 没有用户的功能迭代是浪费
3. **Perplexity 是温度计** — 每周用自己的工具检测 Visora 的 GEO 分数
4. **不做完美，做够用** — 有 paywall 就能开始推
