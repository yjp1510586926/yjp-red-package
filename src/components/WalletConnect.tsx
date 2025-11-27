import { useAccount, useConnect, useDisconnect } from 'wagmi'

export const WalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="bg-gray-800 px-4 py-2 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400">已连接</p>
          <p className="font-mono text-white">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <button
          onClick={() => disconnect()}
          className="btn-secondary"
        >
          断开连接
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      {connectors.slice(0, 2).map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="btn-primary"
        >
          连接 {connector.name}
        </button>
      ))}
    </div>
  )
}
