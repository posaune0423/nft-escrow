import React, { ReactNode, useState } from "react";
import { StepFlow } from "@/components/StepFlow";
import { BackButton } from "@/app/trade/_components/BackButton";
import { Button } from "./ui/button";

interface TradeStepProps {
  children: ReactNode[];
}

export const TradeStep: React.FC<TradeStepProps> = ({ children }) => {
  const [step, setStep] = useState<number>(1);
  return (
    <div className="trade-step">
      <StepFlow currentStep={step} />
      {step === 1 && children[0]}
      {step === 2 && children[1]}
      {step === 3 && children[2]}
      {step === 4 && children[3]}
      <div className="flex justify-between mt-4">
        <BackButton setStep={setStep} />
        <Button onClick={() => setStep((prev) => prev + 1)}>次へ</Button>
      </div>
    </div>
  );
};
