import Store from "@pollinations/ipfs/pollenStore";
import { useEffect, useState } from "react";
import useInterval from "use-interval";
import { createImage, getPrediction } from "./replicate";
import { timeBasedPromptPimper } from "./promptPimpers";

const dreamStore = Store("dreamachine");

const state = {
  dreamMachineName: null,
}

// export getter and setter
export const getDreamMachineName = () => state.dreamMachineName;
export const setDreamMachineName = (dreamMachineName) => state.dreamMachineName = dreamMachineName;;

// get dream machine name from query string
const queryDreamMachineName = new URLSearchParams(window.location.search).get("dream");
state.dreamMachineName = queryDreamMachineName || localStorage.getItem("dream") || "aliveinteraction_1";

export const getDreams = async () =>{
  const dreams = await dreamStore.get(getDreamMachineName());
  return dreams || [];
}

export const setDreams = async (dreams) => await dreamStore.set(getDreamMachineName(), dreams);



export async function loadDreams() {
    const dreams = (await getDreams())//.slice(0,5)
    console.log("got dreams", dreams)

    const dreamsWithPrompts = dreams.map(buildPrompt);
    const newDreams = dreamsWithPrompts.map(startPending);
    await setDreams(newDreams);

    return newDreams;

}

const startPending = (dream, i) => {
  if (dream.started === false) {
    console.log("starting dream", dream);
    const startedDream = { ...dream, started: true };
    loadDreamAndUpdateDreams(startedDream, i);
    return startedDream;
  }
  return dream;
};

async function loadDreamAndUpdateDreams(dream, i) {
  const dreamWithResults = await loadDream(dream);
  const newDreams = await getDreams();
  newDreams[i] = dreamWithResults;
  console.log("updated dreams at index ",i, "with", dreamWithResults)
  await setDreams(newDreams)
  return dreamWithResults;
}

const buildPrompt = (dream, i ,dreams)  => {
  const previousDream = dreams[i-1]?.dream
  const compositePrompt = 
              (previousDream ? [previousDream, dream.dream] : [dream.dream])
              .map(timeBasedPromptPimper)
              .join("\n")
              
  const dreamWithResults =  {...dream, prompt: compositePrompt }

  return dreamWithResults
}


const loadDream = async dream => {
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
  console.log("received prediction id", id);
  const data = await getPrediction(id);
  const videoURL = data?.output && data.output[data.output.length - 1];
  console.log("loaded dream", dream.prompt, videoURL)
  
  return {...dream, videoURL, loading: false, started: true};
};


// poll dream store every 5 seconds and return the current state of dreams
export function useDreams(dreamFilter = filterDreams) {
    const [dreams, setDreamsState] = useState([]);

    console.log("useDreams", dreams)


  const refreshDreams = async () => {
    const newDreams = await loadDreams();
    console.log("loaded dreams", newDreams);
    const newDreamsFiltered = newDreams.filter(dreamFilter);
    // only update dreams if they are different
    if (JSON.stringify(newDreamsFiltered) !== JSON.stringify(dreams))
      setDreamsState(newDreamsFiltered);
    };

    useEffect(() => {
      setTimeout(() => {
        refreshDreams();
      }, 100);
    }, []);

    useInterval(refreshDreams, 10000);
    
    return dreams;
  
}

const filterDreams = ({loading, videoURL}) => loading === false && videoURL





