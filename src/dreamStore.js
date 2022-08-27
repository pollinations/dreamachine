import { getPollens } from "@pollinations/ipfs/awsPollenRunner";
import Store from "@pollinations/ipfs/pollenStore";
import { useEffect, useState } from "react";
import useInterval from "use-interval";

const dreamStore = Store("dreamachine");


export const dreamMachineName = "documenta_preparation_saturday_riso";

const initDreamStore =  async () => {
    console.log("initializing dream store if it does not exist yet"); 
    if (!await dreamStore.get(dreamMachineName)) {
      console.log("dream store does not exist yet, creating it");
      await dreamStore.set(dreamMachineName, []);
    }
  }


export const getDreams = async () => await dreamStore.get(dreamMachineName);
export const setDreams = async (dreams) => await dreamStore.set(dreamMachineName, dreams);

export const getDreamResults = async (dreamID) => {
    const pollens = await getPollens({input: dreamID});
    return pollens[0]?.output;
}

initDreamStore();


// poll dream store every 5 seconds and return the current state of dreams
function usePollDreams() {
    const [dreams, sDreams] = useState([]);

    useEffect(() => {
      (async () => sDreams(await getDreams()))();
    }, []);

    useInterval(async () => {
      
      const newDreams = await getDreams();
      // only update dreams if they are different
      if (JSON.stringify(newDreams) !== JSON.stringify(dreams)) 
        sDreams( newDreams );

    }, 5000);
    return dreams;
  
}




// return dream and possibility to jump to the next dream

export function useDreams() {

    const dreams = usePollDreams();
    const [dreamIndex, setDreamIndex] = useState(0);
  
    const increaseDreamIndex = () => dreams.length > 0 && setDreamIndex((dreamIndex + 1) % dreams.length);
  
    console.log("dreamIndex", dreamIndex, "dreams", dreams);
    
    const currentDream = dreams && dreams[dreamIndex];
    
    return {currentDream, increaseDreamIndex};
  }
  
  
  // gets the output pollen content id for a given pollen input id
export function useDreamResults(dream) {
  
  const [dreamResultsID, setDreamResultsID] = useState(dream?.dreamID);

  useEffect(() => {
    if (dream?.dreamID) {
      (async () => setDreamResultsID(await getDreamResults(dream.dreamID)))();
    }
  }
  , [dream?.dreamID]);

  return dreamResultsID;
}
