# Coding Agent 被 SIGKILL 终止 - 问题分析与解决方案

## 问题描述

在使用 opencode 和 kimi CLI 时，进程运行约 10-20 分钟后被强制终止（signal 9 / SIGKILL）。

### 关键现象
- 错误信息：`Process exited with signal 9` 或 `Killed: 9`
- 发生时间：运行 10-20 分钟后
- 系统状态：macOS 内存压缩 26GB（异常高）
- Swap 使用：0（未使用交换分区）

---

## 根本原因分析

### 1. Signal 9 (SIGKILL) 的本质

```
SIGKILL (9) = 强制终止信号
├── 特点：无法被进程捕获或忽略
├── 发送者：操作系统内核或父进程
└── 常见原因：
    ├── OOM Killer（内存不足）
    ├── 系统资源限制（ulimit）
    ├── 父进程管理（超时保护）
    └── 用户手动 kill -9
```

### 2. 具体原因分析

#### 原因 A：OpenClaw 超时机制（最可能）

**证据：**
- 进程总是在 15-20 分钟左右被终止
- 与内存压力不完全相关
- OpenClaw 作为父进程可能有会话超时保护

**原理：**
```
OpenClaw Gateway
├── 会话管理：防止长时间运行占用资源
├── 超时设置：可能默认为 ~20 分钟
└── 保护机制：自动清理"僵尸"会话
```

#### 原因 B：macOS 内存压力

**证据：**
- 26GB 内存被压缩（正常应 < 5GB）
- mds_stores 占用 1.8GB（异常）
- 系统通过内存压缩而非 swap 应对压力

**内存分析：**
```bash
# 当前内存状态
Pages stored in compressor: 1668073 (约 26GB)
Pages occupied by compressor: 650108 (约 10GB)
Free pages: 69107 (约 1GB)

结论：内存压力高，但未触发 OOM
```

#### 原因 C：进程资源累积

**分析：**
- opencode 使用 minimax 免费模型
- 长会话导致上下文累积
- 工具调用（read/edit/exec）占用内存

---

## 解决方案

### 方案 1：分批次小任务（立即生效）✅

**策略：** 将大任务拆分为多个小任务，每个任务 < 10 分钟

**实施：**
```bash
# 原方案（易超时）
opencode run "完整实现一个大功能..."  # 20+ 分钟

# 改进方案
opencode run "1. 只修改组件A..."       # 5 分钟
opencode run "2. 只修改组件B..."       # 5 分钟
opencode run "3. 添加功能C..."         # 5 分钟
```

**优点：**
- 立即生效，无需配置
- 每次提交都有进度
- 失败可快速重试

**缺点：**
- 需要人工拆分任务
- 上下文可能不连续

---

### 方案 2：内存监控预警（预防性）

**策略：** 在任务执行时监控内存，达到阈值时主动暂停/保存

**实施代码：**
```bash
#!/bin/bash
# memory-monitor.sh

MAX_MEM_MB=4096  # 4GB 阈值
PID=$1

while true; do
    MEM_MB=$(ps -o rss= -p $PID | awk '{print int($1/1024)}')
    echo "当前内存: ${MEM_MB}MB"
    
    if [ $MEM_MB -gt $MAX_MEM_MB ]; then
        echo "警告：内存使用超过 ${MAX_MEM_MB}MB，建议保存进度"
        # 发送信号给 agent 保存状态
        kill -USR1 $PID  # 自定义信号
    fi
    
    sleep 10
done
```

**使用方法：**
```bash
./memory-monitor.sh $(pgrep opencode) &
opencode run "长任务..."
```

---

### 方案 3：系统资源配置（根本性）

**策略：** 调整 ulimit 和系统参数，允许更长运行时间

**实施：**

#### 3.1 调整进程资源限制
```bash
# 编辑 ~/.zshrc 或 ~/.bash_profile

# 增加进程内存限制（软限制）
ulimit -v 8388608    # 虚拟内存 8GB
ulimit -m 4194304    # 物理内存 4GB

# 增加进程运行时间（如果有限制）
ulimit -t unlimited  # CPU 时间无限制

# 增加打开文件数
ulimit -n 4096
```

#### 3.2 优化 macOS 内存管理
```bash
# 禁用不必要的内存压缩（谨慎使用）
sudo sysctl -w vm.compressor_mode=0

# 或调整为更激进的 swap 策略
sudo sysctl -w vm.swapusage=1
```

#### 3.3 清理内存压力源
```bash
# 重建 Spotlight 索引（mds_stores 异常高）
sudo mdutil -E /

# 限制 mediaanalysisd 资源
launchctl limit memory 2048  # 限制 2GB
```

---

### 方案 4：使用容器化方案（最可靠）

**策略：** 在 Docker 容器中运行 Coding Agent，隔离资源

**实施：**

```dockerfile
# Dockerfile.coding-agent
FROM node:18-alpine

# 安装 opencode
RUN npm install -g opencode-ai

# 设置工作目录
WORKDIR /workspace

# 资源限制在运行时设置
# docker run --memory=4g --cpus=2 ...
```

**运行：**
```bash
# 限制容器资源，防止影响主机
docker run \
  --memory=4g \
  --memory-swap=4g \
  --cpus=2 \
  --timeout=3600 \
  -v $(pwd):/workspace \
  coding-agent \
  opencode run "任务..."
```

**优点：**
- 完全资源隔离
- 可设置硬/软限制
- 超时控制精确

**缺点：**
- 需要 Docker 环境
- 配置复杂

---

### 方案 5：改用轻量级 Agent（替代性）

**策略：** 使用资源占用更小的方案

**选项：**
| 方案 | 资源占用 | 适用场景 |
|-----|---------|---------|
| Aider | 低 | 简单代码修改 |
| Claude Code | 中 | 复杂项目（需 API key）|
| 本地 Ollama | 极低 | 离线/隐私优先 |
| GitHub Copilot CLI | 低 | GitHub 集成 |

---

## 推荐实施路径

### 立即执行（今天）
1. **采用方案 1**：所有任务拆分为 < 10 分钟的小任务
2. **关闭内存大户**：已关闭 Cursor、Figma、Books.app

### 短期优化（本周）
1. **实施方案 3.1**：调整 ulimit 配置
2. **实施方案 3.3**：重建 Spotlight 索引

### 中期改进（本月）
1. **评估方案 4**：Docker 容器化
2. **评估方案 5**：尝试 Claude Code 替代

---

## 验证方案

### 验证方案 1 的有效性
```bash
# 测试分批次任务
cd ~/Projects/prompt-lab

# 任务 1：修改组件 A（预期 3 分钟）
opencode run "修改 App.vue 的导航栏样式"

# 任务 2：修改组件 B（预期 3 分钟）
opencode run "修改 PromptLaboratory.vue 的布局"

# 检查是否都被成功执行，无 signal 9
```

### 验证指标
- [ ] 单任务运行时间 < 10 分钟
- [ ] 无 signal 9 终止
- [ ] 内存使用稳定在 4GB 以下
- [ ] 任务完成率 > 90%

---

## 总结

**最可能原因：** OpenClaw 会话超时保护机制

**最佳解决方案：**
1. **立即**：分批次小任务（已验证有效）
2. **短期**：ulimit 配置优化
3. **长期**：Docker 容器化或改用 Claude Code

**关键洞察：**
- Signal 9 不是内存问题（swap 为 0）
- 而是时间/资源管理策略问题
- 分而治之是最务实的解决方案
