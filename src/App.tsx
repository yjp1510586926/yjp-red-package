import { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi'
import { WalletConnect } from './components/WalletConnect'
import { CreateRedPacket } from './components/CreateRedPacket'
import { ClaimRedPacket } from './components/ClaimRedPacket'
import { PacketList } from './components/PacketList'
import './index.css'

const queryClient = new QueryClient()

function App() {
  const [selectedPacketId, setSelectedPacketId] = useState<string>('')

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {/* Header */}
          <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🧧</div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      链上抢红包系统
                    </h1>
                    <p className="text-sm text-gray-400">
                      基于 Sepolia 测试网
                    </p>
                  </div>
                </div>
                <WalletConnect />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* 发红包区域 */}
              <div className="space-y-4">
                <CreateRedPacket />
                
                {/* 使用说明 */}
                <div className="card bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    📖 发红包说明
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>输入红包总金额和个数</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>选择红包类型：拼手气（随机）或普通（平均）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>确认交易后，记住红包ID分享给朋友</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 抢红包区域 */}
              <div className="space-y-4">
                <ClaimRedPacket selectedId={selectedPacketId} />
                
                <PacketList onSelect={setSelectedPacketId} />
                
                {/* 使用说明 */}
                <div className="card bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    📖 抢红包说明
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400">•</span>
                      <span>输入红包ID或从列表选择</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400">•</span>
                      <span>每个地址只能抢一次</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400">•</span>
                      <span>系统会实时提示红包状态</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-12 max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-white text-center mb-8">
                ✨ 功能特性
              </h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="card text-center">
                  <div className="text-4xl mb-3">🔐</div>
                  <h3 className="font-bold text-white mb-2">安全可靠</h3>
                  <p className="text-sm text-gray-400">
                    基于智能合约，公开透明
                  </p>
                </div>
                <div className="card text-center">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="font-bold text-white mb-2">实时通知</h3>
                  <p className="text-sm text-gray-400">
                    事件监听，即时反馈
                  </p>
                </div>
                <div className="card text-center">
                  <div className="text-4xl mb-3">🎲</div>
                  <h3 className="font-bold text-white mb-2">随机算法</h3>
                  <p className="text-sm text-gray-400">
                    二倍均值法，公平分配
                  </p>
                </div>
                <div className="card text-center">
                  <div className="text-4xl mb-3">🌐</div>
                  <h3 className="font-bold text-white mb-2">去中心化</h3>
                  <p className="text-sm text-gray-400">
                    无需信任第三方
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-700 mt-12 py-6">
            <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
              <p>基于 React + Wagmi + TailwindCSS + The Graph 构建</p>
              <p className="mt-2">Sepolia 测试网 | 仅供学习使用</p>
            </div>
          </footer>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
