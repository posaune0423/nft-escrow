import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const LP = () => {
  return (
    <main className="flex flex-col min-h-[100dvh]">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-16">
        <h1 className="text-5xl font-bold">Welcome to NFT Trade</h1>
      </div>

      <div className="bg-white text-black px-4 py-16">
        <p className="text-3xl font-bold">NFTを安全に取引</p>
        <p className="text-muted-foreground">
          NFTを簡単に交換できる方法を見つけましょう。 作成、共有、取引を簡単に行えます。
        </p>
      </div>
      <div className="px-6">
        <Button className="w-full h-12 text-lg" size="lg">
          <Link to="/trade">取引を始める</Link>
        </Button>
      </div>
    </main>
  );
};
