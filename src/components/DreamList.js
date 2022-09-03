import { useDreams } from "../dreamStore";


export default function DreamsDebug() {
    const allDreams = useDreams(() => true);

    return <div style={{whiteSpace: "pre-wrap"}}>
        { JSON.stringify(allDreams, null, 2) }
    </div>
}