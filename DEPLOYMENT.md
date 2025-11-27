# 📝 部署指南

## 第一步：部署智能合约

### 1. 准备工作

- 安装 MetaMask 钱包
- 切换到 Sepolia 测试网
- 获取测试币：https://sepoliafaucet.com/

### 2. 在 Remix 部署合约

1. 访问 https://remix.ethereum.org/
2. 创建新文件 `RedPacket.sol`
3. 复制 `contracts/RedPacket.sol` 的全部内容
4. 点击左侧"Solidity Compiler"图标
5. 选择编译器版本 `0.8.20` 或更高
6. 点击"Compile RedPacket.sol"
7. 点击左侧"Deploy & Run Transactions"图标
8. Environment 选择 "Injected Provider - MetaMask"
9. 确认 MetaMask 连接到 Sepolia 网络
10. 点击"Deploy"按钮
11. 在 MetaMask 中确认交易
12. 等待交易确认
13. **复制合约地址**（非常重要！）

### 3. 验证合约（可选但推荐）

1. 访问 https://sepolia.etherscan.io/
2. 搜索你的合约地址
3. 点击"Contract" -> "Verify and Publish"
4. 选择编译器版本和优化设置
5. 粘贴合约代码
6. 提交验证

## 第二步：配置前端

### 1. 获取 WalletConnect Project ID

1. 访问 https://cloud.walletconnect.com/
2. 注册/登录账号
3. 创建新项目
4. 复制 Project ID

### 2. 更新配置文件

编辑 `src/config/wagmi.ts`：

```typescript
// 替换为你的 WalletConnect Project ID
const projectId = "YOUR_WALLETCONNECT_PROJECT_ID";

// 替换为你部署的合约地址
export const RED_PACKET_ADDRESS = "0xYourContractAddress" as `0x${string}`;
```

## 第三步：运行项目

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问应用

打开浏览器访问：http://localhost:3000

## 第四步：测试功能

### 测试发红包

1. 点击"连接钱包"
2. 在 MetaMask 中确认连接
3. 确保在 Sepolia 测试网
4. 输入红包金额（例如：0.01 ETH）
5. 输入红包个数（例如：3）
6. 选择红包类型（拼手气或普通）
7. 点击"发红包"
8. 在 MetaMask 中确认交易
9. 等待交易确认
10. **记住红包 ID**（从事件或区块浏览器查看）

### 测试抢红包

1. 使用另一个钱包地址连接
2. 输入红包 ID
3. 查看红包信息
4. 点击"抢红包"
5. 确认交易
6. 查看领取结果

## 第五步：部署 The Graph 子图（可选）

### 1. 安装 Graph CLI

```bash
npm install -g @graphprotocol/graph-cli
```

### 2. 创建子图

1. 访问 https://thegraph.com/studio/
2. 连接钱包
3. 创建新子图
4. 记录子图名称

### 3. 配置子图

编辑 `subgraph/subgraph.yaml`：

```yaml
dataSources:
  - kind: ethereum
    name: RedPacket
    network: sepolia
    source:
      address: "YOUR_CONTRACT_ADDRESS" # 替换为合约地址
      abi: RedPacket
      startBlock: YOUR_START_BLOCK # 替换为部署区块号
```

### 4. 准备 ABI

创建 `subgraph/abis/RedPacket.json`，复制 `src/contracts/RedPacketABI.ts` 的内容，转换为 JSON 格式。

### 5. 部署子图

```bash
cd subgraph
graph codegen
graph build
graph deploy --studio your-subgraph-name
```

## 常见问题

### Q: 合约部署失败？

A: 检查：

- Gas 费用是否足够
- 账户余额是否充足
- 编译器版本是否正确

### Q: 前端连接不上合约？

A: 检查：

- 合约地址是否正确
- 网络是否为 Sepolia
- ABI 是否匹配

### Q: 交易一直 pending？

A: 可能原因：

- Gas 价格设置过低
- 网络拥堵
- 可以在 MetaMask 中加速交易

### Q: 如何查看红包 ID？

A: 方法：

1. 在 Sepolia Etherscan 查看交易日志
2. 监听 PacketCreated 事件
3. 读取合约的 packetIdCounter

## 获取帮助

- Sepolia 区块浏览器：https://sepolia.etherscan.io/
- Wagmi 文档：https://wagmi.sh/
- The Graph 文档：https://thegraph.com/docs/
- Remix 文档：https://remix-ide.readthedocs.io/

## 下一步

- 邀请朋友测试
- 优化用户体验
- 添加更多功能
- 准备主网部署（需要审计）
