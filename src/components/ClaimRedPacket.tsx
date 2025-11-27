import React, { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi'
import { formatEther } from 'viem'
import { RED_PACKET_ABI } from '../contracts/RedPacketABI'
import { RED_PACKET_ADDRESS } from '../config/wagmi'

interface PacketInfo {
  creator: string
  totalAmount: bigint
  remainAmount: bigint
  totalCount: bigint
  remainCount: bigint
  timestamp: bigint
  isRandom: boolean
}

interface ClaimRedPacketProps {
  selectedId?: string
}

export const ClaimRedPacket: React.FC<ClaimRedPacketProps> = ({ selectedId }) => {
  const { address } = useAccount()
  const [packetId, setPacketId] = useState('')
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  // 读取红包信息
  const { data: packetInfo, refetch } = useReadContract({
    address: RED_PACKET_ADDRESS,
    abi: RED_PACKET_ABI,
    functionName: 'getPacketInfo',
    args: packetId ? [BigInt(packetId)] : undefined,
  }) as { data: PacketInfo | undefined, refetch: () => void }

  // 检查是否已领取
  const { data: hasClaimed } = useReadContract({
    address: RED_PACKET_ADDRESS,
    abi: RED_PACKET_ABI,
    functionName: 'hasClaimed',
    args: packetId && address ? [BigInt(packetId), address] : undefined,
  })

  // 抢红包
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // 监听红包领取事件
  useWatchContractEvent({
    address: RED_PACKET_ADDRESS,
    abi: RED_PACKET_ABI,
    eventName: 'PacketClaimed',
    onLogs(logs) {
      logs.forEach((log) => {
        const { packetId: eventPacketId, claimer, amount } = log.args
        if (eventPacketId?.toString() === packetId && claimer === address) {
          setNotification({
            type: 'success',
            message: `🎉 恭喜！你抢到了 ${formatEther(amount || 0n)} ETH`
          })
          refetch()
        }
      })
    },
  })

  // 监听红包抢完事件
  useWatchContractEvent({
    address: RED_PACKET_ADDRESS,
    abi: RED_PACKET_ABI,
    eventName: 'PacketFinished',
    onLogs(logs) {
      logs.forEach((log) => {
        const { packetId: eventPacketId } = log.args
        if (eventPacketId?.toString() === packetId) {
          setNotification({
            type: 'info',
            message: '😢 红包已被抢完了'
          })
          refetch()
        }
      })
    },
  })

  // 监听已领取事件
  useWatchContractEvent({
    address: RED_PACKET_ADDRESS,
    abi: RED_PACKET_ABI,
    eventName: 'AlreadyClaimed',
    onLogs(logs) {
      logs.forEach((log) => {
        const { packetId: eventPacketId, claimer } = log.args
        if (eventPacketId?.toString() === packetId && claimer === address) {
          setNotification({
            type: 'error',
            message: '⚠️ 你已经抢过这个红包了'
          })
        }
      })
    },
  })

  const handleClaim = async () => {
    if (!packetId) {
      setNotification({
        type: 'error',
        message: '请输入红包ID'
      })
      return
    }

    if (hasClaimed) {
      setNotification({
        type: 'error',
        message: '你已经抢过这个红包了'
      })
      return
    }

    try {
      writeContract({
        address: RED_PACKET_ADDRESS,
        abi: RED_PACKET_ABI,
        functionName: 'claimPacket',
        args: [BigInt(packetId)],
      })
    } catch (err) {
      console.error('抢红包失败:', err)
    }
  }

  useEffect(() => {
    if (error) {
      setNotification({
        type: 'error',
        message: error.message.includes('Already claimed') 
          ? '你已经抢过这个红包了' 
          : error.message.includes('Packet is finished')
          ? '红包已被抢完了'
          : `错误: ${error.message}`
      })
    }
  }, [error])

  useEffect(() => {
    if (selectedId) {
      setPacketId(selectedId)
      setNotification(null)
    }
  }, [selectedId])

  useEffect(() => {
    if (isSuccess) {
      refetch()
    }
  }, [isSuccess, refetch])

  if (!address) {
    return (
      <div className="card">
        <p className="text-center text-gray-400">请先连接钱包</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        💰 抢红包
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            红包ID
          </label>
          <input
            type="number"
            min="0"
            value={packetId}
            onChange={(e) => {
              setPacketId(e.target.value)
              setNotification(null)
            }}
            placeholder="输入红包ID"
            className="input-field"
          />
        </div>

        {packetInfo && packetInfo.totalAmount > 0n && (
          <div className="red-packet-card space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">红包类型</span>
              <span className="font-semibold">
                {packetInfo.isRandom ? '🎲 拼手气红包' : '📦 普通红包'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">总金额</span>
              <span className="font-semibold">
                {formatEther(packetInfo.totalAmount)} ETH
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">剩余金额</span>
              <span className="font-semibold">
                {formatEther(packetInfo.remainAmount)} ETH
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">剩余个数</span>
              <span className="font-semibold">
                {packetInfo.remainCount.toString()} / {packetInfo.totalCount.toString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">创建者</span>
              <span className="font-mono text-xs">
                {packetInfo.creator.slice(0, 6)}...{packetInfo.creator.slice(-4)}
              </span>
            </div>
            
            {hasClaimed && (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 mt-3">
                <p className="text-yellow-200 text-sm text-center">
                  ✅ 你已经领取过这个红包了
                </p>
              </div>
            )}

            {packetInfo.remainCount === 0n && (
              <div className="bg-gray-500/20 border border-gray-500 rounded-lg p-3 mt-3">
                <p className="text-gray-200 text-sm text-center">
                  😢 红包已被抢完
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={isPending || isConfirming || !packetId || hasClaimed || (packetInfo?.remainCount === 0n)}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {isPending ? '确认中...' : '处理中...'}
            </span>
          ) : (
            '抢红包 💸'
          )}
        </button>

        {notification && (
          <div className={`
            rounded-lg p-3 border
            ${notification.type === 'success' ? 'bg-green-900/50 border-green-500' : ''}
            ${notification.type === 'error' ? 'bg-red-900/50 border-red-500' : ''}
            ${notification.type === 'info' ? 'bg-blue-900/50 border-blue-500' : ''}
          `}>
            <p className={`
              text-sm
              ${notification.type === 'success' ? 'text-green-200' : ''}
              ${notification.type === 'error' ? 'text-red-200' : ''}
              ${notification.type === 'info' ? 'text-blue-200' : ''}
            `}>
              {notification.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
