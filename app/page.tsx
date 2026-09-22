import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Error from "./error";
import AsyncUI from "./ui/asyncUILayer";

export default function Home() {
  return (
    <div>
      <ErrorBoundary errorComponent={Error}>
        <AsyncUI/>
      </ErrorBoundary>
    </div>
  );
}
