# 技术验证调研报告
日期：2026年3月 | 工具：OpenRouter API

---

## 一、验证目标

验证"向 AI 平台发送问题 → 解析品牌提及 → 统计可见度"这条核心技术链路是否可行。

测试品牌：Rankscale（目标）vs Otterly、Scrunch、Peec（竞品）
测试问题：10条 GEO 相关问题
测试平台：Llama、Mistral、Perplexity

---

## 二、测试问题集

1. What are the best tools to track if my brand appears in ChatGPT answers?
2. How can I improve my visibility in AI search engines like Perplexity?
3. What is generative engine optimization (GEO) and what tools help with it?
4. Which SaaS tools help with AI SEO or GEO optimization?
5. How do I know if my website is being cited by AI chatbots?
6. What tools track brand mentions in ChatGPT and Perplexity?
7. Best tools for monitoring AI search engine visibility?
8. How to optimize content for AI-powered search engines?
9. What is the best GEO tool for small businesses?
10. How do I get my product recommended by ChatGPT?

---

## 三、最终结果

| 品牌 | Llama | Mistral | Perplexity | 总计 |
|------|-------|---------|------------|------|
| Rankscale（目标） | 0 | 0 | 1 | **1** |
| Otterly | 0 | 0 | 5 | **5** |
| Peec | 0 | 0 | 2 | **2** |
| Scrunch | 0 | 0 | 1 | **1** |


---

## 四、关键发现

### 1. Perplexity 是唯一有效数据源
Llama 和 Mistral 对所有品牌几乎全是 0，原因是这些开源模型的训练数据里没有这些小工具的信息，回答的是通用知识而非真实市场数据。

Perplexity 有实时联网能力，每次回答都会抓取最新网页并附上引用来源，是唯一能反映真实市场状态的平台。

**结论：MVP 只需要接入 Perplexity API，不需要其他模型。**

### 2. Otterly 为什么赢（5次 vs Rankscale 1次）

从 Perplexity 的完整回答里可以清楚看到原因：

- Otterly 被大量第三方 roundup 文章引用，例如"best GEO tools"、"AI visibility tracking tools"类文章
- Perplexity 在第7题回答里明确说：**"Otterly.ai excels in focused GEO monitoring with clear action items for 20,000+ users"**——用户数量、功能描述、定位都很清晰
- Otterly 在多个对比表格里出现，有具体的功能描述和定价信息

Rankscale 只在第7题的一个表格里被顺带提及，没有专门的推荐文字。

### 3. Perplexity 推荐逻辑

Perplexity 引用工具的依据是：
- 第三方评测/对比文章（roundup）
- G2、Capterra 等评测平台的收录
- 功能描述清晰、有具体数据（用户数、效果数据）
- Reddit、Quora 等社区的真实讨论

**不是靠官网内容，是靠第三方提及。**

---

## 五、模型可用性测试结果

| 模型 | OpenRouter ID | 状态 | 原因 |
|------|--------------|------|------|
| Claude Sonnet | anthropic/claude-sonnet-4-5 | ❌ 403 | 地区限制 |
| GPT-4o mini | openai/gpt-4o-mini | ❌ 403 | 地区限制 |
| Gemini Flash | google/gemini-2.0-flash-001 | ❌ 403 | 地区限制 |
| Llama 3.1 8B | meta-llama/llama-3.1-8b-instruct | ✅ 可用 | 无地区限制 |
| Mistral Nemo | mistralai/mistral-nemo | ✅ 可用 | 无地区限制 |
| Perplexity Sonar | perplexity/sonar | ✅ 可用 | 无地区限制，有联网 |

---

## 六、技术验证结论

✅ 核心链路验证通过：输入品牌名 → 向 AI 发问 → 解析提及次数 → 输出报告

✅ Perplexity API 稳定可用，数据质量高

✅ 品牌可见度差距真实存在且可量化（Otterly 5次 vs Rankscale 1次）

✅ 引用来源可追踪（Perplexity 回答里包含具体的引用网站）

---

## 七、对产品设计的启示

1. **MVP 只需要 Perplexity**：一个 API 就够，不需要多平台整合
2. **问题集是核心资产**：问题设计得好不好直接影响数据质量，需要扩展到 50 条
3. **"为什么竞品被引用"比"你被引用几次"更有价值**：这是产品最大差异化点
4. **第三方平台攻略是产品的核心内容**：要告诉用户去 G2、Capterra、哪些 roundup 文章里露出

---

## 八、下一步

- [ ] 把问题集扩展到 50 条，覆盖更多用户搜索场景
- [ ] 搭建 Web 界面（Next.js + Supabase）
- [ ] 实现引用来源域名分析（竞品被哪些网站引用）
- [ ] 做第一个 Landing Page，开始收集邮件
