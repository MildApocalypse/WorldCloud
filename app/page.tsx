import WordCloud from "./ui/cloud";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Error from "./error";
export default function Home() {
  return (
    <ErrorBoundary errorComponent={Error}>
      <div className="pl-[9vw] h-full">
        <WordCloud/>
      </div>
    </ErrorBoundary>
  );
}
