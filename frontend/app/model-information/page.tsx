import { getModelEvaluation } from "@/lib/server/get-model-evaluation";
import { ModelInformationView } from "./model-information-view";

export const metadata = {
  title: "Model Information"
};

export default function ModelInformationPage() {
  const result = getModelEvaluation();

  return (
    <ModelInformationView
      initialEvaluation={result.evaluation}
      initialError={result.error}
    />
  );
}
