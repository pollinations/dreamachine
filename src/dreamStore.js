import runModel, { getPollens } from "@pollinations/ipfs/awsPollenRunner";
import Store from "@pollinations/ipfs/pollenStore";
import memoize from "lodash.memoize";
import { update } from "ramda";
import { useEffect, useState } from "react";
import useInterval from "use-interval";

const dreamStore = Store("dreamachine");


export const dreamMachineName = "documenta_preparation_saturday_riso_5";

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

const loadDream = memoize(dreamPrompt => {
  console.log("loading dream", dreamPrompt);
  const result = {
    loading: true,
    videoURL: null
  }

  runModel({ 
    prompts: dreamPrompt,
    num_frames_per_prompt: 25,
    prompt_scale: 12,
  }, "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/stable-diffusion-private")
  .then(data => {
    const videoURL = data?.output && data?.output["out_0.mp4"]
    console.log("loaded dream", dreamPrompt, videoURL)
    result.videoURL = videoURL;
    result.loading = false;
  })
  
  return result
})

export async function loadDreams() {
    const dreams = await getDreams()
    return dreams
            .map(buildPromptAndLoadDream)
            // .filter(dream => !dream.loading)
            //.map(({result, ...dream}) => ({...dream, ...result}))
}

const buildPromptAndLoadDream = (dream, i ,dreams)  => {
  
  if (dream.loading === false)
    return dream;
    
  const previousDream = dreams[i-1]?.dream || dream.dream
  const compositePrompt = 
              [previousDream, dream.dream]
              .map(risographPromptPimper3)
              .join("\n")
              
  const dreamWithResults =  {...dream, ...loadDream(compositePrompt) }

  const updatedDreams = update(i, dreamWithResults, dreams)

  setDreams(updatedDreams)

  return dreamWithResults
}

// poll dream store every 5 seconds and return the current state of dreams
export function useDreams() {
    const [dreams, sDreams] = useState([]);


    console.log(dreams)

    useEffect(() => {
      (async () => sDreams(await loadDreams()))();
    }, []);

    useInterval(async () => {
      
      const newDreams = await loadDreams();
      // only update dreams if they are different
      if (JSON.stringify(newDreams) !== JSON.stringify(dreams)) 
        sDreams( newDreams );

    }, 5000);
    
    return dreams.filter(({loading}) => loading === false);
  
}





const surrealistPromptPimper1 = prompt => `Dream of ${prompt}. Surrealism. Klarwein, Dali, Magritte.`;
const surrealistPromptPimper2 = prompt => `Dream of ${prompt}. Beautiful surrealistic surrealistic. illustration. painting. Hand drawn. Black and white.`;
const risographPromptPimper3 = prompt => `${prompt}. Risograph. Risograph.`;


// const pimpDreamPrompts = (prompts) => prompts.split("\n").map(risographPromptPimper3).join("\n");