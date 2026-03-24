# Visora MVP 技术架构

## 技术栈

- **前端**: Next.js 14 (App Router) — Week 2
- **后端**: Node.js + Express API routes — ✅ 完成
- **数据库**: Supabase (PostgreSQL + Auth) — schema 已写，待接入
- **AI 查询**: OpenRouter → Perplexity Sonar
- **邮件**: Resend — Week 4
- **部署**: Vercel (前端) + Railway (后端)
- **支付**: Stripe — Week 4

## 文件结构

```
mvp/
├── src/
│   ├── scanner.js   ✅ 核心扫描引擎
│   ├── scorer.js    ✅ 加权评分算法 (Week 1)
│   ├── analyzer.js  ✅ 竞品引用分析 + 行动建议 (Week 1)
│   ├── generator.js ✅ FAQ/Schema/llms.txt 生成 (Week 1)
│   └── index.js     ✅ Express server 入口 (Week 1)
├── api/
│   ├── scan.js      ✅ POST /api/scan (Week 1)
│   ├── report.js    ✅ GET /api/report/:id (Week 1)
│   └── waitlist.js  ✅ POST /api/waitlist (Week 1)
├── supabase/
│   └── schema.sql   ✅ DB schema: profiles / scans / waitlist
├── .env.example     ✅
└── package.json     ✅
```

## API Endpoints

| Method | Path | 描述 |
|--------|------|------|
| GET | /health | 健康检查 |
| POST | /api/scan | 触发扫描，返回完整报告 |
| GET | /api/report/:id | 获取历史扫描报告 |
| GET | /api/report/user/:userId | 用户扫描列表 |
| POST | /api/waitlist | 加入等待列表 |
| GET | /api/waitlist/count | 等待列表人数 |

## 运行方式

```bash
cd mvp
cp .env.example .env  # 填入 API keys
npm install
npm run dev           # 启动 API server (port 3001)
npm run scan          # 直接跑扫描 CLI
```

## 评分模型 (scorer.js)

| 维度 | 权重 | 说明 |
|------|------|------|
| 出现率 | 50% | 问题集中被提及的比例 |
| 提及密度 | 20% | 每次出现平均提及次数 |
| 情感得分 | 15% | 上下文正负面分析 |
| 来源质量 | 15% | 引用域名权威度 |

## Week 2 计划

- [ ] Next.js Dashboard 基础 UI
- [ ] Supabase Auth (邮箱注册/登录)
- [ ] 扫描界面（输入 URL + 竞品 → 触发扫描 → 展示报告）
- [ ] 评分可视化 (分数环 + 竞品对比条)
- [ ] Railway 部署 backend
