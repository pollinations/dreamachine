import useAWSNode from '@pollinations/ipfs/reactHooks/useAWSNode';
import useIPFS from '@pollinations/ipfs/reactHooks/useIPFS';
import { append, last, update } from "ramda";
import { useEffect, useState } from "react";
import useInterval from 'use-interval';
import './App.css';
import { getDreamResults, getDreams, setDreams } from "./dreamStore";

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



function DreamForm() {

  const [dreamPrompt, setDreamPrompt] = useState("");
  const { submitToAWS } = useAWSNode({});

  const dispatchDream = async (event) => {
    event.preventDefault();

    console.log("dispatching dream", dreamPrompt);

    const dreamsUntilNow = await getDreams();
    const lastDreamIndex = dreamsUntilNow.length - 1;
    const lastDream = dreamsUntilNow[lastDreamIndex];
    
    const lastDreamPrompt = last(lastDream.dream.split("\n"));

    const dreamWithLast = !lastDream ? dreamPrompt : `${lastDreamPrompt}\n${dreamPrompt}`;

    const dreamsWithNewOne = append({ dream: dreamWithLast }, dreamsUntilNow);

    const currentDreamIndex = dreamsWithNewOne.length - 1;
    
    console.log("dreamsWithNewOne", dreamsWithNewOne, "updating db");
    await setDreams(dreamsWithNewOne);
    
    const { nodeID } = await submitToAWS({ prompts: dreamWithLast }, "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/stable-diffusion-private");
    
    const newDreams = update(currentDreamIndex, 
      { 
        dream: dreamWithLast, 
        dreamID: nodeID,
      }, 
      dreamsWithNewOne);

    console.log("dream submitted, nodeID:", nodeID, "new dreams:", newDreams);
    await setDreams(newDreams);
  }
  
  return (
    <form onSubmit={dispatchDream}>
      <input type="text" name="dream" onChange={event => setDreamPrompt(event.target.value)} />
      <input type="submit" value="Submit" />
    </form>
  );
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
