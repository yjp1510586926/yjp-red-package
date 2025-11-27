# 🔧 合约功能说明

## 合约地址

部署后填写：`0x_______________`

## 核心功能

### 1. createPacket - 创建红包

**函数签名：**

```solidity
function createPacket(uint256 count, bool isRandom) external payable
```

**参数说明：**

- `count`: 红包个数（必须 > 0）
- `isRandom`:
  - `true` = 拼手气红包（随机金额）
  - `false` = 普通红包（平均金额）
- `msg.value`: 红包总金额（必须 > 0）

**使用示例：**

```javascript
// 创建 0.01 ETH 的拼手气红包，分成 5 个
createPacket(5, true) { value: 0.01 ETH }

// 创建 0.01 ETH 的普通红包，分成 3 个
createPacket(3, false) { value: 0.01 ETH }
```

**触发事件：**

```solidity
event PacketCreated(
    uint256 indexed packetId,
    address indexed creator,
    uint256 totalAmount,
    uint256 count,
    bool isRandom,
    uint256 timestamp
)
```

---

### 2. claimPacket - 抢红包

**函数签名：**

```solidity
function claimPacket(uint256 packetId) external
```

**参数说明：**

- `packetId`: 红包 ID（从 0 开始递增）

**限制条件：**

- 红包必须存在
- 红包未被抢完
- 当前地址未领取过

**触发事件：**

```solidity
// 成功领取
event PacketClaimed(
    uint256 indexed packetId,
    address indexed claimer,
    uint256 amount,
    uint256 timestamp
)

// 已经领取过
event AlreadyClaimed(
    uint256 indexed packetId,
    address indexed claimer,
    uint256 timestamp
)

// 红包抢完（最后一个）
event PacketFinished(
    uint256 indexed packetId,
    uint256 timestamp
)
```

---

### 3. getPacketInfo - 查询红包信息

**函数签名：**

```solidity
function getPacketInfo(uint256 packetId) external view returns (
    address creator,
    uint256 totalAmount,
    uint256 remainAmount,
    uint256 totalCount,
    uint256 remainCount,
    uint256 timestamp,
    bool isRandom
)
```

**返回值说明：**

- `creator`: 创建者地址
- `totalAmount`: 红包总金额
- `remainAmount`: 剩余金额
- `totalCount`: 红包总个数
- `remainCount`: 剩余个数
- `timestamp`: 创建时间戳
- `isRandom`: 是否随机红包

---

### 4. hasClaimed - 检查是否已领取

**函数签名：**

```solidity
function hasClaimed(uint256 packetId, address user) external view returns (bool)
```

**参数说明：**

- `packetId`: 红包 ID
- `user`: 用户地址

**返回值：**

- `true`: 已领取
- `false`: 未领取

---

### 5. packetIdCounter - 获取红包计数器

**函数签名：**

```solidity
function packetIdCounter() external view returns (uint256)
```

**说明：**

- 返回下一个将要创建的红包 ID
- 当前最新红包 ID = packetIdCounter - 1

---

## 红包算法

### 普通红包（平均分配）

```
每个红包金额 = 剩余金额 / 剩余个数
```

### 拼手气红包（随机分配）

使用**二倍均值法**：

```
最大金额 = (剩余金额 × 2) / 剩余个数
随机金额 = random(1, 最大金额)
```

**特点：**

- 保证每个红包至少 1 wei
- 最后一个红包获得所有剩余金额
- 金额分布相对均匀

**随机源：**

```solidity
keccak256(
    block.timestamp,
    block.prevrandao,
    msg.sender,
    remainAmount,
    remainCount
)
```

---

## 安全特性

### ✅ 防重入

- 使用 `claimed` mapping 记录领取状态
- 先更新状态，后转账

### ✅ 防溢出

- Solidity 0.8+ 自动检查溢出

### ✅ 访问控制

- 任何人都可以创建红包
- 任何人都可以抢红包
- 每个地址只能抢一次

### ✅ 金额验证

- 创建时检查金额 > 0
- 创建时检查个数 > 0
- 创建时检查金额 >= 个数

---

## Gas 优化

1. **使用 mapping 而非 array**

   - 避免遍历数组
   - O(1) 查询复杂度

2. **事件代替存储**

   - 历史记录通过事件查询
   - 节省存储成本

3. **最小化状态变量**
   - 只存储必要信息
   - 减少 SSTORE 操作

---

## 测试用例

### 测试场景 1：创建红包

```
1. 创建 0.01 ETH，5 个，拼手气
2. 检查 packetIdCounter 增加
3. 检查 PacketCreated 事件
4. 查询红包信息验证
```

### 测试场景 2：抢红包

```
1. 用户 A 抢红包
2. 检查余额增加
3. 检查 PacketClaimed 事件
4. 验证 hasClaimed = true
```

### 测试场景 3：重复抢红包

```
1. 用户 A 再次抢同一个红包
2. 应该失败并触发 AlreadyClaimed 事件
```

### 测试场景 4：红包抢完

```
1. 最后一个用户抢红包
2. 检查 PacketFinished 事件
3. 验证 remainCount = 0
4. 新用户尝试抢应该失败
```

---

## 前端集成示例

### 监听红包创建

```typescript
useWatchContractEvent({
  address: RED_PACKET_ADDRESS,
  abi: RED_PACKET_ABI,
  eventName: "PacketCreated",
  onLogs(logs) {
    logs.forEach((log) => {
      const { packetId, totalAmount, count } = log.args;
      console.log(`新红包 #${packetId}: ${totalAmount} ETH, ${count} 个`);
    });
  },
});
```

### 监听红包领取

```typescript
useWatchContractEvent({
  address: RED_PACKET_ADDRESS,
  abi: RED_PACKET_ABI,
  eventName: "PacketClaimed",
  onLogs(logs) {
    logs.forEach((log) => {
      const { packetId, claimer, amount } = log.args;
      console.log(`${claimer} 领取了 ${amount} ETH`);
    });
  },
});
```

---

## 注意事项

⚠️ **重要提示：**

1. **测试网使用**

   - 仅在 Sepolia 测试网使用
   - 不要在主网部署未审计的合约

2. **随机性**

   - 使用链上随机数，可预测
   - 主网使用建议集成 Chainlink VRF

3. **Gas 费用**

   - 创建红包需要支付 Gas
   - 抢红包也需要 Gas
   - 建议预留足够 Gas

4. **金额限制**

   - 建议设置最小金额（如 0.001 ETH）
   - 避免创建过小的红包

5. **时间限制**
   - 当前版本无过期时间
   - 可以添加 deadline 参数

---

## 升级建议

### 功能增强

- [ ] 添加红包过期时间
- [ ] 支持 ERC20 代币
- [ ] 添加红包密码
- [ ] 支持退款功能
- [ ] 添加红包留言

### 安全增强

- [ ] 集成 Chainlink VRF（真随机）
- [ ] 添加暂停功能
- [ ] 添加紧急提款
- [ ] 合约审计

### Gas 优化

- [ ] 批量创建红包
- [ ] 使用 EIP-2929 优化
- [ ] 优化存储布局
