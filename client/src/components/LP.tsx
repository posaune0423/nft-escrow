import { APP_NAME } from "@/constants";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const LP = () => {
  return (
    <main className="flex flex-col justify-between min-h-[100dvh] p-4">
      <h1 className="text-6xl font-bold text-primary font-delaGothicOne mx-auto py-12">{APP_NAME}</h1>

      <div className="bg-white text-slate-900 px-8 py-20 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-6">NFTを安全・簡単に取引</h2>
        <p className="text-lg text-muted-foreground mb-4">
          エスクローでは、NFTの個人間取引を安全かつ簡単に行うことができます。
        </p>
        <ul className="list-disc list-inside text-md text-muted-foreground space-y-2 mb-6">
          <li>簡単な操作で NFT の作成、共有が可能</li>
          <li>セキュアな環境での取引を実現</li>
          <li>豊富な NFT コレクションへのアクセス</li>
        </ul>
        <p className="text-xl font-semibold">NFT 取引の新しい扉を開きましょう。</p>
      </div>

      <Button className="w-full h-16 text-lg rounded-3xl" size="lg">
        <Link to="/trade">交換を始める 👈🏻</Link>
      </Button>
    </main>
  );
};
