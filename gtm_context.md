# Visora — GTM 上下文
> 最后更新：2026-03-25（Session 17）

---

## 第三方平台收录

| 平台 | 状态 |
|------|------|
| G2 | ✅ 已批准 listing |
| Capterra（Gartner Digital Markets） | ✅ 已提交，邮箱已验证 |
| Product Hunt | ✅ Launch 排期 **2026-04-01 PT**，Gallery 已上传 3 张截图 |
| Reddit | 🔄 进行中（见下） |
| Trustpilot / AlternativeTo / dev.to | ⏳ 待定 |

---

## Reddit 进度

| 项目 | 值 |
|------|-----|
| 账号 | FreedomGlad3739（新账号） |
| 目标 karma | 100+（可带链接发帖） |
| 节奏 | 每天 1-2 条评论，不超过 5-6 条 |

**已发评论：**
1. r/ChatGPT —「AI search tracking dash」帖，2026-03-25，讨论 citation source attribution
2. r/SaaS —「Bootstrapped $40k MRR SEO」帖，2026-03-25，讨论 G2 review cold start 问题

**待发帖子（karma 够后）：**
- 教育帖（无链接版）→ r/ChatGPT 或 r/ArtificialIntelligence
- 故事帖（带 Visora 链接）→ r/entrepreneur，配合 PH 4/1 上线
- Show HN → Hacker News，PH 上线当天

---

## Reddit 人设：FreedomGlad3739

**背景：** indie hacker，做过几个 SaaS，对 SEO 有了解，最近在研究 GEO，不是专家，是在摸索中的从业者

**说话风格：** casual、有点 skeptical、偶尔自嘲

**用：** yeah / tbh / ngl / idk / honestly，句子长短混搭，问句不一定带问号

**禁止：** em dash（—）改逗号或换行、三段式结构、"Great point" 开场、书面连接词、每段都收口

**示例（✅ 对）：**
> yeah the traffic data is useful but tbh the harder part for me has been figuring out *why* perplexity is citing a competitor vs not citing you at all
>
> like i went down this rabbit hole a few weeks ago and it seemed like most of it traces back to G2/capterra listings and "best X tools" roundup articles. so you can track the inbound fine, but without knowing which sources are driving the citations you still don't know what to actually change

**阶段规则：** 新账号期不提 Visora、不带外链；karma 100+ 后可自然带出

---

## 帖子草稿

### 教育帖（r/ChatGPT，无链接，随时可发）

**标题：** `Your product is probably invisible to ChatGPT — and it's not about SEO`

**正文：**
```
Been digging into how ChatGPT and Perplexity decide what products to recommend.
Turns out it has almost nothing to do with your Google rankings.

Here's what actually drives AI citations:

**Review aggregators matter most.**
G2, Capterra, Trustpilot — these sites are heavily crawled and trusted by AI
systems. If you're not listed, you're missing a huge citation source. Free to
list, takes an afternoon.

**"Best X tools" roundup articles.**
AI systems love structured comparison content. Getting included in even a
mid-authority "best tools for Y" article can push you into AI recommendations
for that category.

**Your own structured content.**
A proper FAQ page with FAQPage JSON-LD schema makes it easy for AI to extract
and cite your content. Most SaaS sites skip this entirely.

**Community presence.**
Reddit threads and HN discussions show up in Perplexity citations more than
people realize. Genuine participation in relevant communities helps.

**Two things you can check right now:**

1. Ask Perplexity: "What are the best tools for [your category]?" — see if
   you appear, and who does.

2. Check if your robots.txt blocks AI crawlers (GPTBot, PerplexityBot,
   ClaudeBot). A lot of sites accidentally block them.

The gap between AI-visible and AI-invisible products is growing fast.
Curious if anyone else has been thinking about this.
```

---

### 故事帖（r/entrepreneur，配合 PH 4/1，届时加 Visora 链接）

**标题：** `I discovered my SaaS was invisible to AI search. Here's the audit I ran and what I'm doing about it.`

核心内容：发现被 Perplexity 0 引用 → 竞品被引用 7/10 → 找到原因（G2、roundup articles、FAQ schema）→ 采取行动 → 开始出现 → 顺带提 Visora

---

### Show HN（Hacker News，PH 同天）

**标题：** `Show HN: I'm building a GEO (AI visibility) tracker for indie hackers`

---

## 产品改造队列（排队中）

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P0 | Product Keywords 强引导 | placeholder + 提示文案，半天 |
| P1 | 一键执行 Actions | 生成内容 + URL 预填，2-3天 |
| P2 | Action 完成状态记忆 | 打勾持久化，半天 |
| 第三阶段 | Landing 匿名扫描入口 | 输入网址 → 预览 → 注册解锁 |
