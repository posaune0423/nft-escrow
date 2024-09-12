"use client";

import { Check, Clipboard } from "lucide-react";
import { useState } from "react";

export const ShareLink = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };
  return (
    <div
      onClick={onCopy}
      className="flex items-center space-x-2 bg-gray-100 p-3 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
    >
      {copied ? <Check size={20} className="text-green-500" /> : <Clipboard size={20} className="text-blue-500" />}
      <p className="text-blue-500 font-medium">{text}</p>
    </div>
  );
};
