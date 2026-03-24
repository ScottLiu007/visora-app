# Visora VPS 部署手册

> VPS: `root@47.85.12.236`（Debian 11）| SSH: `ssh -i ~/.ssh/deeask-usa.pem root@47.85.12.236`

## VPS 环境现状

| 项目 | 状态 |
|------|------|
| OS | Debian GNU/Linux 11 (bullseye) |
| 磁盘 | 40G 总量，11G 已用，28G 可用 |
| 内存 | 1.8G 总量，~900M 可用 |
| nginx | ✅ 已安装（1.18.0），正在运行 |
| Node.js | ❌ 未安装 |
| npm | ❌ 未安装 |
| pm2 | ❌ 未安装 |
| git | ❌ 未安装 |

---

## 一键部署脚本（复制到 VPS 执行）

```bash
# ── 1. 安装依赖 ──────────────────────────────────────────
apt-get update -y
apt-get install -y git curl build-essential

# 安装 Node.js 20 LTS（via NodeSource）
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 安装 pm2
npm install -g pm2

# 验证
node --version   # v20.x
pm2 --version

# ── 2. 克隆代码 ──────────────────────────────────────────
mkdir -p /opt/visora
cd /opt/visora
git clone git@github.com:ScottLiu007/visora-app.git .
# 注意：需要先把 VPS 的 SSH 公钥加到 GitHub（见下方步骤）

# ── 3. 配置环境变量 ──────────────────────────────────────
cp mvp/.env.example mvp/.env
nano mvp/.env
# 填入以下内容：
# OPENROUTER_API_KEY=你的key
# SUPABASE_URL=https://nbeklglegiqfrrrlvwfb.supabase.co
# SUPABASE_SERVICE_KEY=你的service_key
# ALLOWED_ORIGIN=https://dashboard.visoraapp.com（或 Vercel URL）
# PORT=3001

# ── 4. 安装依赖并启动 ────────────────────────────────────
cd /opt/visora/mvp
npm install

pm2 start src/index.js --name visora-api --interpreter node
pm2 save
pm2 startup   # 生成开机自启命令，复制执行

# 验证
curl http://localhost:3001/health

# ── 5. 配置 nginx 反代 ───────────────────────────────────
nano /etc/nginx/sites-available/visora-api
```

**nginx 配置文件内容：**

```nginx
server {
    listen 80;
    server_name api.visoraapp.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;  # scan 需要 ~60s
    }
}
```

```bash
# 启用站点
ln -s /etc/nginx/sites-available/visora-api /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# ── 6. 配置 HTTPS（Let's Encrypt）────────────────────────
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d api.visoraapp.com
# 按提示填 email，同意协议，选自动重定向

# ── 7. DNS 配置（Cloudflare）────────────────────────────
# 在 Cloudflare visoraapp.com → DNS 添加：
# A 记录：api → 47.85.12.236（Proxy: DNS only，灰云）
```

---

## VPS SSH 公钥加到 GitHub（clone 私有仓库用）

```bash
# 在 VPS 上执行
ssh-keygen -t ed25519 -C "visora-vps" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
# 复制输出，去 GitHub → Settings → SSH Keys → Add 粘贴进去
```

---

## 日常运维命令

```bash
# 查看日志
pm2 logs visora-api

# 重启
pm2 restart visora-api

# 更新代码
cd /opt/visora && git pull && pm2 restart visora-api

# nginx 日志
tail -f /var/log/nginx/error.log
```

---

## Dashboard（Vercel）部署步骤

1. 打开 vercel.com → New Project
2. Import `ScottLiu007/visora-app`
3. Root Directory 选 `dashboard`
4. Framework: Next.js（自动检测）
5. 环境变量填入：
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://nbeklglegiqfrrrlvwfb.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = （见 .env.local）
   - `NEXT_PUBLIC_API_URL` = `https://api.visoraapp.com`
6. Deploy → 完成后绑定自定义域名 `dashboard.visoraapp.com`

---

## 部署完成后要做的事

- [ ] Supabase → Authentication → URL Configuration → 加入 `https://dashboard.visoraapp.com`
- [ ] mvp/.env 的 `ALLOWED_ORIGIN` 改为 Vercel 生产域名
- [ ] 测试生产环境扫描流程
