# Visora 完整执行计划
visoraapp.com | 更新日期：2026年3月

---

## 总体思路

**先让 Visora 自己被 AI 推荐，再卖帮别人被 AI 推荐的工具。**

产品开发和市场推广同步进行，不是先做完产品再推广。
用 Visora 自己做 GEO 的过程，既验证产品逻辑，又积累第一批用户。

---

## 阶段一：地基（第1-2周）

### 1.1 域名和基础设施
- [x] 注册 visoraapp.com
- [x] 部署最简 Landing Page（一句话说清楚是什么 + 邮件收集）
- [x] 配置基础 Schema 标注（SoftwareApplication + FAQPage）
- [x] 允许 GPTBot、PerplexityBot 爬取（robots.txt）
- [x] Privacy Policy / Terms of Service 页面
- [x] Creem 支付接入（Builder $29/月、Growth $79/月，KYC 已验证）
- [x] Git 管理 + GitHub Actions 自动部署

### 1.2 品牌内容基础
- [x] 建立 FAQ 页面内容（50个问题，AI 友好结构）
- [x] 对比文章草稿："Best GEO tools for indie hackers in 2026"
- [ ] FAQ 独立页面上线（内容已有，需发布）
- [ ] 写一篇定义性文章："What is GEO and why your SaaS is invisible to ChatGPT"
- [ ] 注册 G2 产品页（即使产品还没上线，可以先建页面）
- [ ] 注册 Product Hunt 即将发布页（Coming Soon）

---

## 阶段二：内容轰炸（第3-4周）

### 2.1 核心对比文章（最重要）
这类文章是 Perplexity 引用最多的内容类型：
- [ ] "Best GEO tools for indie hackers in 2026"（自己写，自己上榜）
- [ ] "Visora vs Otterly vs Rankscale: which GEO tool is right for you"
- [ ] "How we grew from 0 to X AI citations in 30 days"（真实案例）

### 2.2 Reddit 社区渗透
- [ ] r/SEO：分享 GEO 数据洞察（不是广告，是真实数据）
- [ ] r/SaaS：分享 Visora 自己的 GEO 实验过程
- [ ] r/entrepreneur：讲出海工具的分发困境
- [ ] r/ClaudeAI / r/ChatGPT：分享如何让产品被 AI 推荐

### 2.3 第三方平台收录
- [ ] Capterra 收录
- [ ] Trustpilot 建立页面
- [ ] dev.to 发技术文章
- [ ] Medium 发商业角度文章
- [ ] Hacker News Show HN 发布

---

## 阶段三：MVP 开发（第3-6周，与阶段二并行）

### 3.1 检测层（Week 3）
- [ ] Perplexity API 集成
- [ ] 问题集扩展到 50 条
- [ ] 品牌提及解析 + 引用来源域名分析
- [ ] AI 可见度评分算法（0-100）

### 3.2 分析层（Week 4）
- [ ] 竞品对比 Dashboard
- [ ] "竞品为什么被引用"分析（引用来源溯源）
- [ ] 用户注册 / 登录 / 网站添加流程
- [ ] 每周自动扫描 + 邮件报告

### 3.3 生成层（Week 5）
- [ ] FAQ 自动生成（基于用户产品信息）
- [ ] GEO 友好内容草稿生成
- [ ] Schema 标注代码自动生成
- [ ] 具体可执行建议（"你需要出现在这3个网站"）

### 3.4 分发层（Week 6）
- [ ] Reddit 帖子草稿生成
- [ ] G2/Capterra 产品描述生成
- [ ] 内容发布日历建议
- [ ] （V2）自动发布到各平台（需用户授权）

---

## 阶段四：发布（第7周）

### 4.1 发布日准备
- [ ] Product Hunt 发布（提前预热 Coming Soon 1-2周）
- [ ] 邮件列表通知（目标发布前积累200+）
- [ ] Hacker News Show HN
- [ ] Reddit 多社区同步发布

### 4.2 定价上线
- [ ] Starter（免费）：1个网站，每月1次扫描
- [ ] Builder（$29/月）：1个网站，每周扫描，完整报告
- [ ] Growth（$79/月）：3个网站，每日监测，内容生成
- [ ] Stripe 接入

---

## 阶段五：增长（第8-12周）

### 5.1 内容飞轮
每周发布一个行业 GEO 可见度报告：
- "Which CRM tools appear most in ChatGPT?"
- "Top project management tools in Perplexity 2026"
被提到的品牌会自发转发，带来免费流量。

### 5.2 代理商渠道
- [ ] 联系 SEO 代理商，提供白标方案
- [ ] 建立 affiliate 计划

### 5.3 目标里程碑
| 时间 | 目标 |
|------|------|
| 发布后 2 周 | 200 注册用户 |
| 发布后 1 个月 | 10 付费用户（$290 MRR） |
| 发布后 3 个月 | 100 付费用户（$2900 MRR） |
| 发布后 6 个月 | $5000 MRR |

---

## 关键原则

1. **Visora 自己是第一个客户**：所有 GEO 功能先在 visora 自己身上跑
2. **先内容后代码**：Landing Page 和对比文章比 Dashboard 更重要
3. **Perplexity 是温度计**：每周用自己的工具检测 Visora 的可见度
4. **不做完美，做够用**：4周出 MVP，6周出付费版

---

## 当前进度（阶段一已完成，进入阶段二）

**阶段一已完成项**（2026-03-23 ~ 03-24）
- [x] 产品全景设计 + 中国 GEO 产业研究
- [x] 技术验证（Perplexity API 跑通）
- [x] 产品命名（Visora / visoraapp.com）
- [x] 域名注册（visoraapp.com，$10.46/年）
- [x] Landing Page 上线（https://visoraapp.com）
- [x] robots.txt / llms.txt / Schema 结构化数据
- [x] 邮件收集表单（Formspree）
- [x] 50条 FAQ 内容文档 + 对比文章草稿
- [x] Privacy Policy / Terms of Service 页面
- [x] Creem 支付接入（Builder $29/月、Growth $79/月，KYC 已验证，Payout 已绑定）
- [x] Git 管理（GitHub: ScottLiu007/visora-landing）
- [x] GitHub Actions 自动部署（push main → 自动上线）

**下一步**
- [ ] FAQ 独立页面上线（内容已有，需发布）← 最近
- [ ] 文章发布（Medium / dev.to）
- [ ] G2 / Capterra 收录（需要你的账号）
- [ ] Product Hunt Coming Soon（需要你的账号）
- [ ] Reddit 首帖
- [ ] MVP 开发 Week 1（检测层）
