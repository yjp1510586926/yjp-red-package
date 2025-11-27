import React, { useEffect, useState } from 'react'
import { formatEther } from 'viem'

interface Packet {
  packetId: string
  creator: string
  totalAmount: string
  remainCount: string
  totalCount: string
  isRandom: boolean
  timestamp: string
  isFinished: boolean
}

// 你的 Subgraph URL - 部署后需要替换
const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/YOUR_ID/red-packet-sepolia/version/latest'

export const PacketList: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
  const [packets, setPackets] = useState<Packet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    fetchPackets()
    // 每 10 秒刷新一次
    const timer = setInterval(fetchPackets, 10000)
    return () => clearInterval(timer)
  }, [])

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
          {packets.map((packet) => (
            <div 
              key={packet.packetId}
              onClick={() => onSelect(packet.packetId)}
              className="bg-gray-700/50 p-3 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors border border-gray-600 hover:border-red-500/50 group"
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
                <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full">
                  剩 {packet.remainCount}/{packet.totalCount}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {packet.creator.slice(0, 6)}...{packet.creator.slice(-4)}
                </span>
                <span className="group-hover:text-red-400 transition-colors">
                  点击抢红包 &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
