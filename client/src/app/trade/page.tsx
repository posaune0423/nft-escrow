import { NextPage } from "next";
import { Step1 } from "./_components/Step1";
import { Step2 } from "./_components/Step2";
import { Step3 } from "./_components/Step3";
import { Step4 } from "./_components/Step4";

import { TradeSteps } from "@/components/TradeSteps";

const TradePage: NextPage = () => {
  return (
    <TradeSteps>
      <Step1 />
      <Step2 />
      <Step3 />
      <Step4 />
    </TradeSteps>
  );
};

export default TradePage;
