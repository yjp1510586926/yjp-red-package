import React, { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { RED_PACKET_ABI } from '../contracts/RedPacketABI'
import { RED_PACKET_ADDRESS } from '../config/wagmi'

export const CreateRedPacket: React.FC = () => {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [count, setCount] = useState('')
  const [isRandom, setIsRandom] = useState(true)

  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !count) {
      alert('请填写完整信息')
      return
    }

    try {
      writeContract({
        address: RED_PACKET_ADDRESS,
        abi: RED_PACKET_ABI,
        functionName: 'createPacket',
        args: [BigInt(count), isRandom],
        value: parseEther(amount),
      })
    } catch (err) {
      console.error('创建红包失败:', err)
    }
  }

  React.useEffect(() => {
    if (isSuccess) {
      alert('红包创建成功！')
      setAmount('')
      setCount('')
    }
  }, [isSuccess])

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
        🧧 发红包
      </h2>

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            红包金额 (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            红包个数
          </label>
          <input
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="5"
            className="input-field"
            required
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="block text-sm font-medium text-gray-300">
            红包类型
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={isRandom}
                onChange={() => setIsRandom(true)}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-white">拼手气红包</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!isRandom}
                onChange={() => setIsRandom(false)}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-white">普通红包</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming}
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
            '发红包 🎁'
          )}
        </button>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
            <p className="text-red-200 text-sm">
              错误: {error.message}
            </p>
          </div>
        )}

        {isSuccess && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-3">
            <p className="text-green-200 text-sm">
              ✅ 红包创建成功！
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
