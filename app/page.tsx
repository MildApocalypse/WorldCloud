import { SS4 } from "./ui/fonts";
import WordCloud from "./ui/cloud";

export default function Home() {
  return (
    <div className="p-10">
      <h1 className={`${SS4.className} text-[100px] opacity-50`}>World Cloud</h1>
      <div className="pl-[9vw] h-screen">
        <WordCloud/>
      </div>
    </div>
  );
}
