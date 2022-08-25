import useIPFS from '@pollinations/ipfs/reactHooks/useIPFS';
import { useEffect, useState } from "react";
import useInterval from 'use-interval';
import './App.css';
import { DreamForm } from './DreamForm';
import { getDreamResults, getDreams } from "./dreamStore";

function App() {

  
  return (
    <div className="App">
      <DreamsPlayer />
      <DreamForm />
    </div> 
  );
}


function DreamsPlayer() {

  const {currentDream, increaseDreamIndex }  = useDreams();

  console.log("useDreams", currentDream);

  return <><DreamPlayer dream={currentDream} donePlaying={increaseDreamIndex} /></>
}

function DreamPlayer({ donePlaying, dream }) {

  const dreamResultsID = useDreamResults(dream);
  const data = useIPFS(dreamResultsID);

  const dreamVideoURL = data?.output && data?.output["out_0.mp4"];
  // useInterval(donePlaying, 10000);
  console.log("dreamVideoURL", dreamVideoURL, data);
  return <>
  {JSON.stringify(data)}
    <video controls onEnded={donePlaying} autoPlay playsInline muted >
      <source src={dreamVideoURL} type="video/mp4" />
    </video>
  </>
}



export default App;





function useDreams() {

  const dreams = usePollDreams();
  const [dreamIndex, setDreamIndex] = useState(0);

  const increaseDreamIndex = () => setDreamIndex((dreamIndex + 1) % dreams.length);

  console.log("dreamIndex", dreamIndex)
  const currentDream = dreams[dreamIndex];
  
  return {currentDream, increaseDreamIndex};
}


function useDreamResults(dream) {
  
  const [dreamResultsID, setDreamResultsID] = useState(null);

  useEffect(() => {
    if (dream?.dreamID) {
      (async () => setDreamResultsID(await getDreamResults(dream.dreamID)))();
    }
  }
  , [dream?.dreamID]);

  return dreamResultsID;
}


function usePollDreams() {
    const [dreams, sDreams] = useState([]);

    useEffect(() => {
      (async () => sDreams(await getDreams()))();
    }, []);

    useInterval(async () => sDreams( await getDreams()), 5000);
    return dreams;
  
}
