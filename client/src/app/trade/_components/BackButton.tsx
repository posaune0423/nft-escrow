import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { ArrowLeft } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export const BackButton = ({
  setStep,
  className,
  disabled,
}: {
  setStep: Dispatch<SetStateAction<number>>;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <Button
      onClick={() => setStep((prevStep) => prevStep - 1)}
      className={cn("w-full flex justify-center items-center", className)}
      disabled={disabled}
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
    </Button>
  );
};
