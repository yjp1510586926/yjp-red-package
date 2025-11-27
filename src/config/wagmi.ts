import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// 你需要在 WalletConnect Cloud 获取 projectId: https://cloud.walletconnect.com
const projectId = "6b34a0eff998c7a65907ef58454314d0";

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected(), walletConnect({ projectId })],
  transports: {
    [sepolia.id]: http(),
  },
});

// 合约地址 - 部署后需要更新
export const RED_PACKET_ADDRESS =
  "0xB2e4C00c08dd3A0FeE409E3D906DEf1D585cF125" as `0x${string}`;
