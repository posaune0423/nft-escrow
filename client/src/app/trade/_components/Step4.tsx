import { ShareLink } from "./ShareLink";

export const Step4 = () => {
  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">取引リンクをシェア! 🎉</h2>
      <ShareLink />
    </div>
  );
};
