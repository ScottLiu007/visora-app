#!/bin/zsh
# Visora — 一键启动脚本
# 用法：./start.sh
# 自动 kill 占用 3001/3002 的进程，再启动 backend + dashboard

BACKEND_PORT=3001
DASHBOARD_PORT=3002
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "${CYAN}╔══════════════════════════════════════╗${NC}"
echo "${CYAN}║        Visora Dev Launcher           ║${NC}"
echo "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ─── Kill 占用端口的进程 ──────────────────────────────────────────────────────
kill_port() {
  local port=$1
  local pids
  pids=$(lsof -iTCP:${port} -sTCP:LISTEN -t 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    echo "${YELLOW}⚠️  端口 ${port} 被占用（PID: $pids），正在 kill...${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 0.5
    echo "${GREEN}✅ 端口 ${port} 已释放${NC}"
  else
    echo "${GREEN}✅ 端口 ${port} 空闲${NC}"
  fi
}

echo "🔍 检查端口占用..."
kill_port $BACKEND_PORT
kill_port $DASHBOARD_PORT
echo ""

# ─── 启动 Backend（Express, port 3001）────────────────────────────────────────
echo "🚀 启动 Backend（Express :${BACKEND_PORT}）..."
cd "${ROOT_DIR}/mvp"

if [[ ! -f ".env" ]]; then
  echo "${RED}❌ mvp/.env 不存在，请先：cp .env.example .env 并填入 API key${NC}"
  exit 1
fi

if [[ ! -d "node_modules" ]]; then
  echo "${YELLOW}📦 安装 backend 依赖（走代理）...${NC}"
  npm install --proxy http://127.0.0.1:1087 --https-proxy http://127.0.0.1:1087
fi

NODE_ENV=development node src/index.js &
BACKEND_PID=$!
echo "${GREEN}✅ Backend 已启动（PID: ${BACKEND_PID}）${NC}"
echo ""

# ─── 等待 backend 就绪 ────────────────────────────────────────────────────────
echo "⏳ 等待 backend 就绪..."
for i in {1..10}; do
  if curl -s --noproxy localhost --max-time 1 http://localhost:${BACKEND_PORT}/health > /dev/null 2>&1; then
    echo "${GREEN}✅ Backend 健康检查通过${NC}"
    break
  fi
  sleep 0.8
  if [[ $i -eq 10 ]]; then
    echo "${YELLOW}⚠️  10s 内未响应，继续启动 Dashboard...${NC}"
  fi
done
echo ""

# ─── 启动 Dashboard（Next.js, port 3002）─────────────────────────────────────
echo "🚀 启动 Dashboard（Next.js :${DASHBOARD_PORT}）..."
cd "${ROOT_DIR}/dashboard"

if [[ ! -d "node_modules" ]]; then
  echo "${YELLOW}📦 安装 dashboard 依赖（走代理）...${NC}"
  npm install --proxy http://127.0.0.1:1087 --https-proxy http://127.0.0.1:1087
fi

npm run dev &
DASHBOARD_PID=$!
echo "${GREEN}✅ Dashboard 已启动（PID: ${DASHBOARD_PID}）${NC}"
echo ""

# ─── 汇总 ─────────────────────────────────────────────────────────────────────
echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "  Backend   → http://localhost:${BACKEND_PORT}/health"
echo "  Dashboard → http://localhost:${DASHBOARD_PORT}"
echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "按 ${YELLOW}Ctrl+C${NC} 停止所有服务"
echo ""

# ─── Ctrl+C 清理子进程 ────────────────────────────────────────────────────────
trap "echo ''; echo '🛑 停止所有服务...'; kill $BACKEND_PID $DASHBOARD_PID 2>/dev/null; exit 0" INT TERM

wait
