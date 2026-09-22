import { getData } from "../lib/data";
import MainUI from "./mainUI";

export default async function AsyncUI() {
    const clusters = await getData();    
    return (
        <div className="flex">
            <MainUI clusters={clusters}/>
        </div>
    );
}