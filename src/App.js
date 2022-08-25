import useAWSNode from '@pollinations/ipfs/reactHooks/useAWSNode';
import { append, last, update } from "ramda";
import { useState } from "react";
import './App.css';
import { getDreams, setDreams } from "./dreamStore";


function App() {

  return (
    <div className="App">
       bla
      <DreamForm />
    </div> 
  );
}

function DreamForm() {

  const [dreamPrompt, setDream] = useState({});
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
      <input type="text" name="dream" onChange={event => setDream(event.target.value)} />
      <input type="submit" value="Submit" />
    </form>
  );
}

export default App;



