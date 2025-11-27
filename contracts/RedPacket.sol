// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RedPacket
 * @dev 链上红包合约 - 支持创建红包和抢红包功能
 */
contract RedPacket {
    // 防止重入攻击的锁
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    // 红包结构体
    struct Packet {
        address creator;        // 创建者地址
        uint256 totalAmount;    // 红包总金额
        uint256 remainAmount;   // 剩余金额
        uint256 totalCount;     // 红包总个数
        uint256 remainCount;    // 剩余个数
        uint256 timestamp;      // 创建时间
        bool isRandom;          // 是否随机红包
        mapping(address => bool) claimed; // 记录已领取地址
    }

    // 红包ID计数器
    uint256 public packetIdCounter;
    
    // 红包映射
    mapping(uint256 => Packet) public packets;

    // 事件定义
    event PacketCreated(
        uint256 indexed packetId,
        address indexed creator,
        uint256 totalAmount,
        uint256 count,
        bool isRandom,
        uint256 timestamp
    );

    event PacketClaimed(
        uint256 indexed packetId,
        address indexed claimer,
        uint256 amount,
        uint256 timestamp
    );

    event PacketFinished(
        uint256 indexed packetId,
        uint256 timestamp
    );

    event AlreadyClaimed(
        uint256 indexed packetId,
        address indexed claimer,
        uint256 timestamp
    );

    /**
     * @dev 创建红包
     * @param count 红包个数
     * @param isRandom 是否随机红包
     */
    function createPacket(uint256 count, bool isRandom) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(count > 0, "Count must be greater than 0");
        require(msg.value >= count, "Amount too small for count");

        uint256 packetId = packetIdCounter++;
        Packet storage packet = packets[packetId];
        
        packet.creator = msg.sender;
        packet.totalAmount = msg.value;
        packet.remainAmount = msg.value;
        packet.totalCount = count;
        packet.remainCount = count;
        packet.timestamp = block.timestamp;
        packet.isRandom = isRandom;

        emit PacketCreated(
            packetId,
            msg.sender,
            msg.value,
            count,
            isRandom,
            block.timestamp
        );
    }

    /**
     * @dev 抢红包
     * @param packetId 红包ID
     */
    function claimPacket(uint256 packetId) external nonReentrant {
        Packet storage packet = packets[packetId];
        
        require(packet.totalAmount > 0, "Packet does not exist");
        require(packet.remainCount > 0, "Packet is finished");
        
        // 检查是否已经领取过
        if (packet.claimed[msg.sender]) {
            emit AlreadyClaimed(packetId, msg.sender, block.timestamp);
            revert("Already claimed");
        }

        // 标记为已领取
        packet.claimed[msg.sender] = true;

        // 计算领取金额
        uint256 amount;
        if (packet.remainCount == 1) {
            // 最后一个红包，领取所有剩余金额
            amount = packet.remainAmount;
        } else if (packet.isRandom) {
            // 随机红包算法
            amount = _randomAmount(packet.remainAmount, packet.remainCount);
        } else {
            // 平均红包
            amount = packet.remainAmount / packet.remainCount;
        }

        // 更新红包状态
        packet.remainAmount -= amount;
        packet.remainCount--;

        // 转账
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit PacketClaimed(packetId, msg.sender, amount, block.timestamp);

        // 如果红包已抢完，触发完成事件
        if (packet.remainCount == 0) {
            emit PacketFinished(packetId, block.timestamp);
        }
    }

    /**
     * @dev 随机金额算法（二倍均值法）
     * @param remainAmount 剩余金额
     * @param remainCount 剩余个数
     */
    function _randomAmount(uint256 remainAmount, uint256 remainCount) private view returns (uint256) {
        if (remainCount == 1) {
            return remainAmount;
        }

        // 计算最大可领取金额（二倍均值）
        uint256 max = (remainAmount * 2) / remainCount;
        
        // 生成随机数
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            remainAmount,
            remainCount
        ))) % max;

        // 确保至少领取 1 wei
        uint256 amount = random + 1;
        
        // 确保不超过剩余金额
        if (amount > remainAmount) {
            amount = remainAmount;
        }

        return amount;
    }

    /**
     * @dev 查询红包信息
     * @param packetId 红包ID
     */
    function getPacketInfo(uint256 packetId) external view returns (
        address creator,
        uint256 totalAmount,
        uint256 remainAmount,
        uint256 totalCount,
        uint256 remainCount,
        uint256 timestamp,
        bool isRandom
    ) {
        Packet storage packet = packets[packetId];
        return (
            packet.creator,
            packet.totalAmount,
            packet.remainAmount,
            packet.totalCount,
            packet.remainCount,
            packet.timestamp,
            packet.isRandom
        );
    }

    /**
     * @dev 检查地址是否已领取
     * @param packetId 红包ID
     * @param user 用户地址
     */
    function hasClaimed(uint256 packetId, address user) external view returns (bool) {
        return packets[packetId].claimed[user];
    }
}
