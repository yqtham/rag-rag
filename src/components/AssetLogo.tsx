import React from 'react';

interface AssetLogoProps {
  symbol: string;
  name?: string;
  size?: number;
  className?: string;
}

export const AssetLogo: React.FC<AssetLogoProps> = ({ symbol, size = 24, className = '' }) => {
  const s = symbol.toUpperCase();

  // Known brand icon rendering or stylized SVG
  const renderIcon = () => {
    switch (s) {
      case 'AAPL':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#1e222d] border border-[#363a45] text-white"
            style={{ width: size, height: size }}
          >
            <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.58-.7.97-1.68.86-2.66-.84.03-1.85.56-2.45 1.26-.52.6-.98 1.57-.86 2.52.93.07 1.87-.42 2.45-1.12z" />
            </svg>
          </div>
        );
      case 'NVDA':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#76b900] text-black font-bold"
            style={{ width: size, height: size, fontSize: size * 0.45 }}
          >
            N
          </div>
        );
      case 'MSFT':
        return (
          <div
            className="grid grid-cols-2 gap-0.5 p-1 rounded-full bg-[#1e222d] border border-[#363a45]"
            style={{ width: size, height: size }}
          >
            <div className="bg-[#f25022] rounded-xs"></div>
            <div className="bg-[#7fba00] rounded-xs"></div>
            <div className="bg-[#00a4ef] rounded-xs"></div>
            <div className="bg-[#ffb900] rounded-xs"></div>
          </div>
        );
      case 'AMZN':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#ff9900] text-black font-extrabold"
            style={{ width: size, height: size, fontSize: size * 0.5 }}
          >
            a
          </div>
        );
      case 'GOOGL':
      case 'GOOG':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#1e222d] border border-[#363a45] text-[#4285f4] font-bold"
            style={{ width: size, height: size, fontSize: size * 0.5 }}
          >
            G
          </div>
        );
      case 'META':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#0668e1] text-white font-bold"
            style={{ width: size, height: size, fontSize: size * 0.45 }}
          >
            M
          </div>
        );
      case 'TSLA':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#cc0000] text-white font-bold"
            style={{ width: size, height: size, fontSize: size * 0.5 }}
          >
            T
          </div>
        );
      case 'BTCUSD':
      case 'BTC':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#f7931a] text-white font-bold"
            style={{ width: size, height: size, fontSize: size * 0.5 }}
          >
            ₿
          </div>
        );
      case 'ETHUSD':
      case 'ETH':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#627eea] text-white font-bold"
            style={{ width: size, height: size, fontSize: size * 0.5 }}
          >
            Ξ
          </div>
        );
      case 'SOLUSD':
      case 'SOL':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-gradient-to-tr from-[#9945ff] to-[#14f195] text-black font-bold"
            style={{ width: size, height: size, fontSize: size * 0.45 }}
          >
            S
          </div>
        );
      case 'XAUUSD':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-gradient-to-tr from-[#b8860b] to-[#ffd700] text-black font-bold shadow-xs"
            style={{ width: size, height: size, fontSize: size * 0.4 }}
          >
            AU
          </div>
        );
      case 'XAGUSD':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-gradient-to-tr from-[#708090] to-[#e0e0e0] text-black font-bold shadow-xs"
            style={{ width: size, height: size, fontSize: size * 0.4 }}
          >
            AG
          </div>
        );
      case 'USOIL':
      case 'UKOIL':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#22272f] border border-[#434651] text-[#ff7043] font-bold"
            style={{ width: size, height: size, fontSize: size * 0.45 }}
          >
            🛢
          </div>
        );
      case 'EURUSD':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#003399] text-[#ffcc00] font-bold"
            style={{ width: size, height: size, fontSize: size * 0.45 }}
          >
            €
          </div>
        );
      case 'GBPUSD':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#c8102e] text-white font-bold"
            style={{ width: size, height: size, fontSize: size * 0.45 }}
          >
            £
          </div>
        );
      case 'USDJPY':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-white text-[#bc002d] font-bold"
            style={{ width: size, height: size, fontSize: size * 0.45 }}
          >
            ¥
          </div>
        );
      case 'SPX':
      case 'NDX':
      case 'DJI':
      case 'RUT':
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#2962ff] text-white font-bold"
            style={{ width: size, height: size, fontSize: size * 0.35 }}
          >
            IDX
          </div>
        );
      default:
        return (
          <div
            className="flex items-center justify-center rounded-full bg-[#2a2e39] text-[#dfe2f2] font-semibold border border-[#363a45]"
            style={{ width: size, height: size, fontSize: size * 0.4 }}
          >
            {s.slice(0, 2)}
          </div>
        );
    }
  };

  return <div className={`shrink-0 select-none ${className}`}>{renderIcon()}</div>;
};
