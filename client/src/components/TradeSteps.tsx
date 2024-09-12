"use client";

import React, { ReactNode, useCallback, useState } from "react";
import { StepFlow } from "@/components/StepFlow";
import { BackButton } from "@/app/trade/_components/BackButton";
import { Button } from "./ui/button";
import { InitiateTradeButton } from "./InitiateTradeButton";
import { WalletConnectScreen } from "@/app/trade/_components/WalletConnectScreen";
import { useAccount } from "wagmi";
import { useTradeStore } from "@/providers/tradeStoreProvider";

interface TradeStepsProps {
  children: ReactNode[];
}

export const TradeSteps: React.FC<TradeStepsProps> = ({ children }) => {
  const [step, setStep] = useState<number>(1);
  const { address } = useAccount();
  const { selectedNfts } = useTradeStore((state) => ({
    selectedNfts: state.selectedNfts,
  }));

  const back = useCallback(() => {
    if (step === 1) return;
    setStep((prev) => prev - 1);
  }, [step]);

  const next = useCallback(() => {
    if (step === 4) return;
    setStep((prev) => prev + 1);
  }, [step]);

  if (!address) {
    return <WalletConnectScreen />;
  }

  return (
    <main className="flex flex-col min-h-[calc(100dvh-180px)] py-8 max-w-md mx-auto">
      <StepFlow currentStep={step} />
      {step === 1 && children[0]}
      {step === 2 && children[1]}
      {step === 3 && children[2]}
      {step === 4 && children[3]}

      {step !== 4 && (
        <div className="flex justify-between space-x-4 mt-4 p-4 fixed bottom-0 left-0 right-0 bg-white/80">
          <BackButton setStep={back} disabled={step === 1} />
          {step !== 3 && (
            <Button onClick={next} className="w-full" disabled={selectedNfts.length < step}>
              次へ
            </Button>
          )}
          {step === 3 && <InitiateTradeButton setStep={setStep} />}
        </div>
      )}
    </main>
  );
};
