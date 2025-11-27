# 🧧 链上抢红包系统

基于以太坊 Sepolia 测试网的去中心化红包系统，支持创建和抢红包功能。

## 技术栈

- **前端框架**: React + TypeScript + Vite
- **样式**: TailwindCSS
- **Web3**: Wagmi + Viem
- **智能合约**: Solidity ^0.8.20
- **数据索引**: The Graph
- **测试网**: Sepolia

## 功能特性

✅ **发红包**

- 支持自定义金额和数量
- 两种模式：拼手气红包（随机）和普通红包（平均）
- 基于智能合约，安全可靠

✅ **抢红包**

- 输入红包 ID 即可抢红包
- 每个地址只能抢一次
- 实时显示红包状态

✅ **事件通知**

- 红包抢完提示
- 已领取提示
- 领取成功提示

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置

#### 2.1 更新 Wagmi 配置

编辑 `src/config/wagmi.ts`，替换 WalletConnect Project ID：

```typescript
const projectId = "YOUR_WALLETCONNECT_PROJECT_ID";
```

获取 Project ID: https://cloud.walletconnect.com

#### 2.2 部署智能合约

1. 打开 [Remix IDE](https://remix.ethereum.org/)
2. 创建新文件 `RedPacket.sol`
3. 复制 `contracts/RedPacket.sol` 的内容
4. 编译合约（Solidity 0.8.20+）
5. 连接 MetaMask 到 Sepolia 测试网
6. 部署合约
7. 复制合约地址

#### 2.3 更新合约地址

编辑 `src/config/wagmi.ts`，替换合约地址：

```typescript
export const RED_PACKET_ADDRESS = "0xYourContractAddress";
```

### 3. 运行项目

```bash
npm run dev
```

访问 http://localhost:3000

## 智能合约说明

### 核心功能

#### createPacket

创建红包

```solidity
function createPacket(uint256 count, bool isRandom) external payable
```

参数：

- `count`: 红包个数
- `isRandom`: 是否随机红包

#### claimPacket

抢红包

```solidity
function claimPacket(uint256 packetId) external
```

参数：

- `packetId`: 红包 ID

#### getPacketInfo

查询红包信息

```solidity
function getPacketInfo(uint256 packetId) external view returns (...)
```

### 事件

- `PacketCreated`: 红包创建
- `PacketClaimed`: 红包领取
- `PacketFinished`: 红包抢完
- `AlreadyClaimed`: 重复领取

## The Graph 子图部署（可选）

### 1. 安装 Graph CLI

```bash
npm install -g @graphprotocol/graph-cli
```

### 2. 初始化子图

```bash
cd subgraph
graph init
```

### 3. 更新配置

编辑 `subgraph/subgraph.yaml`：

- 替换合约地址
- 设置起始区块号

### 4. 生成代码

```bash
graph codegen
```

### 5. 部署子图

```bash
graph deploy --studio red-packet-sepolia
```

## 使用流程

### 发红包

1. 连接钱包（MetaMask）
2. 确保在 Sepolia 测试网
3. 输入红包金额（ETH）
4. 输入红包个数
5. 选择红包类型
6. 点击"发红包"
7. 确认交易
8. 记住红包 ID，分享给朋友

### 抢红包

1. 连接钱包
2. 输入红包 ID
3. 查看红包信息
4. 点击"抢红包"
5. 确认交易
6. 等待领取成功

## 获取测试币

Sepolia 测试币水龙头：

- https://sepoliafaucet.com/
- https://www.infura.io/faucet/sepolia
- https://faucet.quicknode.com/ethereum/sepolia

## 项目结构

```
yjp-red-package/
├── contracts/              # 智能合约
│   └── RedPacket.sol
├── src/
│   ├── components/         # React 组件
│   │   ├── CreateRedPacket.tsx
│   │   ├── ClaimRedPacket.tsx
│   │   └── WalletConnect.tsx
│   ├── config/            # 配置文件
│   │   └── wagmi.ts
│   ├── contracts/         # 合约 ABI
│   │   └── RedPacketABI.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── subgraph/              # The Graph 子图
│   ├── schema.graphql
│   ├── subgraph.yaml
│   └── src/
│       └── mapping.ts
└── package.json
```

## 注意事项

⚠️ **重要提示**

1. 这是一个测试项目，仅在 Sepolia 测试网使用
2. 不要在主网使用未经审计的合约
3. 妥善保管私钥，不要泄露
4. 测试币没有实际价值

## 常见问题

### Q: 交易失败怎么办？

A: 检查以下几点：

- 钱包是否连接到 Sepolia 测试网
- 账户是否有足够的测试币
- 合约地址是否正确
- Gas 费用是否足够

### Q: 为什么看不到红包信息？

A: 确保：

- 输入的红包 ID 正确
- 合约地址配置正确
- 网络连接正常

### Q: 如何获取更多测试币？

A: 访问上面列出的水龙头网站，每天可以领取一定数量的测试币

## 开发计划

- [ ] 添加红包历史记录
- [ ] 支持多种代币
- [ ] 添加红包过期时间
- [ ] 优化 UI/UX
- [ ] 移动端适配

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
