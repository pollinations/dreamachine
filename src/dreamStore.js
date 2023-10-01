import Store from "@pollinations/ipfs/pollenStore";
import { useEffect, useState } from "react";
import useInterval from "use-interval";
import { createImage, getPrediction, pollPrediction } from "./replicate";
import { timeBasedPromptPimper } from "./promptPimpers";
import { useParams } from "react-router-dom";

const dreamStore = Store("dreamachine");


// Function to get initial dream machine name
function getInitialdreamsName() {
  return new URLSearchParams(window.location.search).get("dream") || "aliveinteraction_1";
}


async function loadDreams(dreamsName) {
    const dreams = (await dreamStore.get(dreamsName)) || [];
    console.log("got dreams", dreamsName, dreams)

    const dreamsWithPrompts = dreams.map(buildPrompt);
    const newDreams = await Promise.all(dreamsWithPrompts.map(processPending));

    return newDreams;

}

const processPending = async (dream) => {
  if (dream.started === false) {
    console.log("starting dream", dream);
    return await generateDream(dream);
  }
  if (dream.loading === true) {
    console.log("polling dream", dream);
    // getPrediction
    const data = await getPrediction(dream.predictionID);
    if (data.status === 'succeeded' || data.status === 'failed') {
      const videoURL = data?.output && data.output[data.output.length - 1];
      return {
        ...dream, 
        loading: false, 
        videoURL, 
        status: data.status
      };
    }
  }
  return dream;
};


const buildPrompt = (dream, i ,dreams)  => {
  const previousDream = dreams[i-1]?.dream
  const compositePrompt = 
              (previousDream ? [previousDream, dream.dream] : [dream.dream])
              .map(timeBasedPromptPimper)
              .join("\n")
              
  const dreamWithResults =  {...dream, prompt: compositePrompt }

  return dreamWithResults
}


const generateDream = async dream => {
  console.log("executing / loading dream", dream);

  let [prompt1, prompt2] = dream.prompt.split("\n").slice(0,2);
  if (!prompt2) prompt2 = prompt1;
  console.log("running model for dream", prompt1, prompt2);

  const id = await createImage({
    prompt1,
    prompt2,
    num_inference_steps: 25,
    interpolate_frames: 18,
    scheduler: "KarrasDPM",
    seed:512,
    negative_prompt:"",
    width: 1280,
    height: 720,
  });
  
  return {...dream, predictionID: id, loading: true, started: true};
};


// poll dream store every 5 seconds and return the current state of dreams
export function useDreams(dreamFilter = filterDreams) {
    const { dreamId } = useParams();
    console.log("dreamId", dreamId)
    const dreamsName = dreamId || getInitialdreamsName();

    const [dreams, setDreamsState] = useState([]);

    console.log("useDreams", dreams)


    const refreshDreams = async () => {
      const newDreams = await loadDreams(dreamsName);
      console.log("loaded dreams", newDreams);
      const newDreamsFiltered = newDreams.filter(dreamFilter);
      // only update dreams if they are different
      if (JSON.stringify(newDreamsFiltered) !== JSON.stringify(dreams)) {
        setDreamsState(newDreamsFiltered);
        dreamStore.set(dreamsName, newDreams);
      }
    };

    const addDream = async dream => {
      const newDreams = await dreamStore.get(dreamsName) || [];
      newDreams.push(dream);
      setDreamsState(newDreams.filter(dreamFilter));
      await dreamStore.set(dreamsName, newDreams);
    };

    useEffect(() => {
      setTimeout(() => {
        refreshDreams();
      }, 100);
    }, []);

    useInterval(refreshDreams, 10000);
    
    return {dreams, dreamsName, addDream };
  
}




const filterDreams = ({loading, videoURL}) => loading === false && videoURL





