# Visora — 工程上下文
> 最后更新：2026-03-25（Session 17）
> GTM 内容见 gtm_context.md

---

## 一句话

**Visora (visoraapp.com)** 是面向英文市场 indie hacker 和小型 SaaS 的 GEO 自助优化工具。
帮助用户出现在 ChatGPT、Perplexity、Claude 的推荐结果里。定价 $29-79/月，竞品最低 $99+。

---

## 关键信息

| 项目 | 值 |
|------|-----|
| 域名 | visoraapp.com |
| GitHub（代码） | ScottLiu007/visora-app |
| GitHub（landing） | ScottLiu007/visora-landing |
| 支付 | Creem（Builder $29/mo、Growth $79/mo，KYC 已验证） |
| 本地路径 | `/Users/scott/.claude/projects/visora/` |
| 联系邮件 | hello@visoraapp.com |
| Product Hunt | 账号 @scott_liu3，Launch 排期 **2026-04-01 PT** |

---

## 生产环境

| 项目 | 地址 |
|------|------|
| Landing | https://visoraapp.com |
| Dashboard | https://dashboard.visoraapp.com |
| API | https://api.visoraapp.com |
| VPS SSH | `ssh -i ~/.ssh/deeask-usa.pem root@47.85.12.236` |
| pm2 | `pm2 list / restart visora-api --update-env` |
| 一键部署 | `ssh -i ~/.ssh/deeask-usa.pem root@47.85.12.236 "bash /opt/visora/deploy.sh"` |

---

## 目录结构

```
visora/
├── project_context.md      ← 工程上下文（本文件）
├── gtm_context.md          ← GTM 上下文
├── ROADMAP.md
├── landing/
├── dashboard/
└── mvp/
```

---

## Supabase

| 字段 | 值 |
|------|-----|
| 项目 ID | nbeklglegiqfrrrlvwfb |
| URL | https://nbeklglegiqfrrrlvwfb.supabase.co |
| Dashboard | https://supabase.com/dashboard/project/nbeklglegiqfrrrlvwfb |

表：**profiles**（id / email / plan / scan_credits / weekly_scan_config / ...）
表：**scans**（id / user_id / target_brand / report_json / share_token / ...）

---

## 支付（Creem）

| 方案 | 链接 |
|------|------|
| Builder $29/mo | https://www.creem.io/payment/prod_1dI5h87ZhzzodGpRrRSvbW |
| Growth $79/mo | https://www.creem.io/payment/prod_1Xl8T46dBXT2zWowehqoQf |
| Webhook | https://api.visoraapp.com/api/webhooks/creem |

---

## 测试账号

Email: dev@visoraapp.com / Password: Visora2026!
登录：https://dashboard.visoraapp.com/auth/login

---

## 已完成功能

- ✅ 扫描流水线（scanner → scorer → analyzer → generator）
- ✅ Dashboard：登录 / 扫描 / 报告 / Overview 趋势图
- ✅ Paywall：Creem webhook 自动升降级
- ✅ 报告透明度：How We Scored / Queries Asked / Citation 归因
- ✅ 历史趋势：折线图 + delta badge
- ✅ 每周自动扫描（cron + Growth 用户配置）
- ✅ 邮件通知（Resend，visoraapp.com 域名已验证）
- ✅ 报告公开分享（share_token + /share/[token]）
- ✅ Citation 机会提醒

---

## 浏览器自动化

```bash
pkill -f "Google Chrome" && sleep 2 && \
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --remote-debugging-port=9222 \
  '--remote-allow-origins=http://127.0.0.1:9222' \
  --user-data-dir=/tmp/chrome_cdp \
  '--proxy-server=http://127.0.0.1:1087' \
  > /tmp/chrome_cdp.log 2>&1 &
```
确认：`curl -s --noproxy '*' http://127.0.0.1:9222/json/version`

---

## 如何开始新对话

说：`"请读 project_context.md 和 gtm_context.md"` 即可无缝接上。
