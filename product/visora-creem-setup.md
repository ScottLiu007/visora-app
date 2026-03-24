# Visora Creem Store 开通记录

**日期:** 2026-03-24  
**操作人:** Scott（liutao0518）

---

## 完成事项

### 1. DNS 配置（Cloudflare）
- 域名：`visoraapp.com`
- 添加 CNAME 记录：`@` → `visora-apr.pages.dev`
- Proxy：开启（橙色云朵）

### 2. Creem Business Details（Visora Store）
- Business type: Individual
- Country of Tax Residency: China
- Full name: LIU TAO
- Product name: Visora
- Website URL: https://visoraapp.com/
- Contact Email: scott@chaoge.site
- Product ready: Yes（已上线）
- Existing customers: No（新开始）

### 3. KYC & Payout 绑定
- **Identity verification**：复用 Clarix store 已批准的 Sumsub 认证，直接 Link
- **Payout account**：复用 Clarix store 已批准的 PAYSWAY 银行账号（•••• 4205），直接 Link
- 无需重新提交证件，同一账号下两个 store 可以共享验证

## 最终状态

| Store | Identity | Payout |
|-------|---------|--------|
| Visora | ✅ Identity verified | ✅ Payout ready |
| Clarix | ✅ Identity verified | ✅ Payout ready |

> 等 Creem 团队审核通过后，Visora 的 payouts 即可启用。

---

## 关键经验

- Creem KYC 是 **store 级别**，不是账号级别——每个 store 都需要单独走流程
- 但同一账号下已通过的身份验证和银行账号**可以复用**到新 store，不需要重复上传证件
- Business Details 表单有很多步骤（类型 → 国家 → checkbox × 多批 → 姓名 → 产品名 → URL → 邮箱 → 简介 → 产品描述 → 合规声明 × 多批 → 有无客户 → 有无评价 → 是否 AI wrapper）
