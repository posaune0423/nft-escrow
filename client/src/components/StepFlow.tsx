export const StepFlow = ({ currentStep }: { currentStep: number }) => {
  const steps = ["自分のNFTを選択", "交換条件の入力", "確認", "相手に共有"];
  return (
    <section className="flex justify-between items-center w-full max-w-3xl mx-auto mb-8 px-4">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index + 1 <= currentStep ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {index + 1}
          </div>
          <span className="text-xs mt-1">{step}</span>
        </div>
      ))}
    </section>
  );
};
