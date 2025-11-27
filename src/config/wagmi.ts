import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// 你需要在 WalletConnect Cloud 获取 projectId: https://cloud.walletconnect.com
const projectId = "YOUR_WALLETCONNECT_PROJECT_ID";

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected(), walletConnect({ projectId })],
  transports: {
    [sepolia.id]: http(),
  },
});

// 合约地址 - 部署后需要更新
export const RED_PACKET_ADDRESS =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;
