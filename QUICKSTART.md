# 🚀 快速开始指南

## 5 分钟快速部署

### 第 1 步：准备钱包 (1 分钟)

1. 安装 MetaMask: https://metamask.io/
2. 切换到 Sepolia 测试网
3. 获取测试币: https://sepoliafaucet.com/

### 第 2 步：部署合约 (2 分钟)

1. 打开 Remix: https://remix.ethereum.org/
2. 新建文件 `RedPacket.sol`
3. 复制 `contracts/RedPacket.sol` 内容
4. 编译（Solidity 0.8.20+）
5. 部署到 Sepolia
6. **复制合约地址** ✅

### 第 3 步：配置项目 (1 分钟)

编辑 `src/config/wagmi.ts`：

```typescript
// 1. 获取 WalletConnect ID: https://cloud.walletconnect.com/
const projectId = "YOUR_PROJECT_ID";

// 2. 填入合约地址
export const RED_PACKET_ADDRESS = "0xYourContractAddress";
```

### 第 4 步：启动项目 (1 分钟)

```bash
npm install
npm run dev
```

访问: http://localhost:3000

---

## 测试流程

### 发红包测试

```
1. 连接钱包
2. 输入: 0.01 ETH
3. 个数: 3
4. 类型: 拼手气
5. 点击发红包
6. 记住红包ID (例如: 0)
```

### 抢红包测试

```
1. 切换到另一个账户
2. 输入红包ID: 0
3. 查看红包信息
4. 点击抢红包
5. 查看领取结果
```

---

## 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

---

## 项目文件说明

```
📁 contracts/          # 智能合约
  └── RedPacket.sol    # 红包合约

📁 src/
  📁 components/       # React 组件
    ├── CreateRedPacket.tsx   # 发红包
    ├── ClaimRedPacket.tsx    # 抢红包
    └── WalletConnect.tsx     # 钱包连接

  📁 config/
    └── wagmi.ts       # Wagmi 配置 ⚙️

  📁 contracts/
    └── RedPacketABI.ts  # 合约 ABI

  ├── App.tsx          # 主应用
  ├── main.tsx         # 入口文件
  └── index.css        # 全局样式

📁 subgraph/           # The Graph 子图
  ├── schema.graphql   # 数据模型
  ├── subgraph.yaml    # 子图配置
  └── src/mapping.ts   # 事件处理

📄 README.md           # 项目说明
📄 DEPLOYMENT.md       # 部署指南
📄 CONTRACT.md         # 合约文档
```

---

## 核心功能

### ✅ 发红包

- 自定义金额和数量
- 拼手气 / 普通模式
- 实时交易状态

### ✅ 抢红包

- 输入 ID 查询
- 实时红包信息
- 防重复领取

### ✅ 事件通知

- 🎉 领取成功
- ⚠️ 已领取过
- 😢 红包抢完

---

## 技术栈

| 技术        | 用途       |
| ----------- | ---------- |
| React       | 前端框架   |
| TypeScript  | 类型安全   |
| TailwindCSS | 样式设计   |
| Wagmi       | Web3 集成  |
| Viem        | 以太坊交互 |
| The Graph   | 数据索引   |
| Solidity    | 智能合约   |

---

## 获取帮助

### 📚 文档

- [README.md](./README.md) - 完整文档
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南
- [CONTRACT.md](./CONTRACT.md) - 合约说明

### 🔗 链接

- Sepolia 浏览器: https://sepolia.etherscan.io/
- Wagmi 文档: https://wagmi.sh/
- Remix IDE: https://remix.ethereum.org/

### 💧 测试币水龙头

- https://sepoliafaucet.com/
- https://www.infura.io/faucet/sepolia
- https://faucet.quicknode.com/ethereum/sepolia

---

## 下一步

- [ ] 部署合约到 Sepolia
- [ ] 配置 WalletConnect
- [ ] 测试发红包功能
- [ ] 测试抢红包功能
- [ ] 邀请朋友测试
- [ ] 部署 The Graph 子图（可选）

---

## 注意事项

⚠️ **这是测试项目**

- 仅在 Sepolia 测试网使用
- 测试币无实际价值
- 不要在主网使用

✅ **安全提示**

- 妥善保管私钥
- 不要分享助记词
- 确认网络正确

🎯 **最佳实践**

- 先小额测试
- 验证合约地址
- 检查交易详情

---

## 常见问题

**Q: 安装依赖很慢？**
A: 使用国内镜像：

```bash
npm config set registry https://registry.npmmirror.com
```

**Q: 合约部署失败？**
A: 检查：

- 是否有足够测试币
- 编译器版本是否正确
- Gas 限制是否足够

**Q: 前端连接失败？**
A: 确认：

- 合约地址正确
- 网络为 Sepolia
- MetaMask 已连接

**Q: 如何查看红包 ID？**
A: 方法：

1. Etherscan 查看交易日志
2. 监听 PacketCreated 事件
3. 读取 packetIdCounter - 1

---

## 开始使用

```bash
# 克隆项目
git clone <your-repo>

# 进入目录
cd yjp-red-package

# 安装依赖
npm install

# 启动项目
npm run dev
```

🎉 **祝你使用愉快！**
