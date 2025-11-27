import React, { useEffect, useState } from 'react'
import { formatEther } from 'viem'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { RED_PACKET_ABI } from '../contracts/RedPacketABI'
import { RED_PACKET_ADDRESS } from '../config/wagmi'

interface Packet {
  packetId: string
  creator: string
  totalAmount: string
  remainCount: string
  totalCount: string
  isRandom: boolean
  timestamp: string
  expirationTime: string
  isFinished: boolean
}

// 你的 Subgraph URL - 部署后需要替换
const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/YOUR_ID/red-packet-sepolia/version/latest'

export const PacketList: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
  const { address } = useAccount()
  const [packets, setPackets] = useState<Packet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const fetchPackets = async () => {
    if (SUBGRAPH_URL.includes('YOUR_ID')) {
      // 如果还没有配置 Subgraph，就不请求
      return
    }

    setLoading(true)
    setError(null)

    const query = `
      {
        packets(first: 10, orderBy: timestamp, orderDirection: desc, where: { isFinished: false }) {
          packetId
          creator
          totalAmount
          remainCount
          totalCount
          isRandom
          timestamp
          expirationTime
          isFinished
        }
      }
    `

    try {
      const response = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }
      setPackets(data.data.packets)
    } catch (err) {
      console.error('Failed to fetch packets:', err)
      setError('无法加载红包列表，请检查 Subgraph 配置')
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async (packetId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      writeContract({
        address: RED_PACKET_ADDRESS,
        abi: RED_PACKET_ABI,
        functionName: 'refundExpiredPacket',
        args: [BigInt(packetId)],
      })
    } catch (err) {
      console.error('退款失败:', err)
    }
  }

  useEffect(() => {
    fetchPackets()
    // 每 10 秒刷新一次
    const timer = setInterval(fetchPackets, 10000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isSuccess) {
      alert('退款成功！')
      fetchPackets()
    }
  }, [isSuccess])

  const isExpired = (expirationTime: string) => {
    if (expirationTime === '0') return false
    return Math.floor(Date.now() / 1000) > parseInt(expirationTime)
  }

  if (SUBGRAPH_URL.includes('YOUR_ID')) {
    return (
      <div className="card mt-6 opacity-75">
        <h3 className="text-lg font-bold text-white mb-4">🔥 热门红包</h3>
        <p className="text-sm text-gray-400 text-center py-4">
          配置 The Graph Subgraph URL 后即可查看红包列表
        </p>
      </div>
    )
  }

  return (
    <div className="card mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">🔥 热门红包</h3>
        <button 
          onClick={fetchPackets}
          className="text-sm text-red-400 hover:text-red-300"
        >
          刷新
        </button>
      </div>

      {loading && packets.length === 0 ? (
        <div className="text-center py-4 text-gray-400">加载中...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-400 text-sm">{error}</div>
      ) : packets.length === 0 ? (
        <div className="text-center py-4 text-gray-400">暂无待抢红包</div>
      ) : (
        <div className="space-y-3">
          {packets.map((packet) => {
            const expired = isExpired(packet.expirationTime)
            const isCreator = address?.toLowerCase() === packet.creator.toLowerCase()
            
            return (
              <div 
                key={packet.packetId}
                onClick={() => !expired && onSelect(packet.packetId)}
                className={`bg-gray-700/50 p-3 rounded-xl border border-gray-600 transition-colors ${
                  expired ? 'opacity-60' : 'cursor-pointer hover:bg-gray-700 hover:border-red-500/50 group'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {packet.isRandom ? '🎲' : '📦'}
                    </span>
                    <div>
                      <div className="text-white font-medium text-sm">
                        {formatEther(BigInt(packet.totalAmount))} ETH
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {packet.packetId}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full">
                      剩 {packet.remainCount}/{packet.totalCount}
                    </span>
                    {expired && (
                      <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded-full">
                        ⏰ 已过期
                      </span>
                    )}
                  </div>
                </div>
                
                {packet.expirationTime !== '0' && !expired && (
                  <div className="text-xs text-gray-500 mb-2">
                    过期时间: {new Date(parseInt(packet.expirationTime) * 1000).toLocaleString('zh-CN')}
                  </div>
                )}
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {packet.creator.slice(0, 6)}...{packet.creator.slice(-4)}
                  </span>
                  {expired && isCreator ? (
                    <button
                      onClick={(e) => handleRefund(packet.packetId, e)}
                      disabled={isPending || isConfirming}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs disabled:opacity-50"
                    >
                      {isPending || isConfirming ? '退款中...' : '退款'}
                    </button>
                  ) : !expired ? (
                    <span className="group-hover:text-red-400 transition-colors">
                      点击抢红包 &rarr;
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
