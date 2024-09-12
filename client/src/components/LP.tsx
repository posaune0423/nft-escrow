import { APP_NAME } from "@/constants";
import { Button } from "./ui/button";
import Link from "next/link";

export const LP = () => {
  return (
    <main className="flex flex-col justify-between p-4 max-w-md mx-auto min-h-[calc(100dvh-180px)] space-y-4 md:space-y-6">
      <h1 className="text-6xl font-bold text-primary font-delaGothicOne mx-auto">{APP_NAME}</h1>

      <div className="bg-white text-slate-900 px-8 py-10 rounded-lg shadow-xl border">
        <h2 className="text-xl md:text-2xl font-bold mb-6">NFT・トークンを安全に交換</h2>
        <p className="text-sm md:text-lg text-muted-foreground mb-4 px-2">
          エスクローでは、NFTやトークンの個人間取引を安全かつ簡単に行うことができます。
        </p>
        <ul className="list-disc list-inside text-sm md:text-lg text-muted-foreground space-y-2 mb-6">
          <li>簡単な操作でセキュアな交換が可能</li>
          <li>NFT同士の物々交換も可能</li>
          <li>圧倒的な手数料の安さ</li>
        </ul>
        <p className="text-lg md:text-xl font-semibold">スムーズで安心な個人間取引を。</p>
      </div>

      <Button className="w-full h-16 text-lg rounded-3xl" size="lg">
        <Link href="/trade">交換を始める 👈🏻</Link>
      </Button>
    </main>
  );
};
