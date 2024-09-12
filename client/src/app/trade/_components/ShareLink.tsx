"use client";

import { useTradeStore } from "@/providers/tradeStoreProvider";
import { getBaseUrl } from "@/utils";
import { Check, Clipboard } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useChainId } from "wagmi";

export const ShareLink = () => {
  const chainId = useChainId();
  const { tradeId } = useTradeStore((state) => ({
    tradeId: state.tradeId,
  }));
  const link = `${getBaseUrl()}/trade/${chainId}/${tradeId}`;
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };
  return (
    <section className="flex flex-col items-center space-y-4">
      <div
        onClick={onCopy}
        className="flex items-center space-x-2 bg-gray-100 p-3 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
      >
        {copied ? <Check size={20} className="text-green-500" /> : <Clipboard size={20} className="text-blue-500" />}
        <p className="text-blue-500 font-medium">{link}</p>
      </div>
      <p className="text-sm text-gray-500 text-center">
        取引リンクもしくはQRコードをシェアして、相手の承認を待ちましょう!
      </p>
      <QRCodeSVG value={link} />
    </section>
  );
};
