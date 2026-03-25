# Visora Roadmap
> visoraapp.com · 更新：2026-03-25（Session 12）

---

## 总体思路

**先让 Visora 自己被 AI 推荐，再卖帮别人被 AI 推荐的工具。**

产品开发和市场推广同步进行。用 Visora 自己做 GEO 的过程，既验证产品逻辑，又积累第一批用户。

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

### 报告透明度（Session 12）
- [x] 报告页「How We Scored You」—— 4 维权重分解可视化
- [x] 报告页「Queries Asked to AI」—— 所有 prompt + ✅/❌ 品牌提及状态
- [x] Action Items 低分专属路径（G2 / PH / Reddit 带直链）
- [x] VPS pm2 路径修复，deploy.sh 更新

---

## 🔜 近期（GTM 优先）

### 第三方平台收录（直接影响 GEO 分数，也验证产品本身）
- [ ] **G2** — https://www.g2.com/products/new
- [ ] **Capterra** — https://www.capterra.com/vendors/sign-up
- [ ] **Product Hunt Coming Soon** — 账号 scott_liu3（liutao0518@qq.com）
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

## 📋 产品迭代队列

优先级从高到低：

| 功能 | 说明 | 影响 |
|------|------|------|
| 邮件通知 | 扫描完成 / 分数变化提醒 | 留存 |
| 定时扫描 | 每周自动跑，不用手动触发 | 核心价值 |
| 历史趋势图 | 分数随时间变化曲线 | 留存 |
| 报告导出 PDF | 一键导出，方便分享给团队 | 传播 |
| 报告分享链接 | 公开链接，不用登录也能看 | 传播 |
| FAQ 内容生成 | 基于扫描结果自动生成 FAQ 文案 | 差异化 |
| Schema 代码生成 | 一键生成 FAQPage schema markup | 差异化 |

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
