import runModel, { getPollens } from "@pollinations/ipfs/awsPollenRunner";
import Store from "@pollinations/ipfs/pollenStore";
import awaitSleep from "await-sleep";
import memoize from "lodash.memoize";
import { useEffect, useState } from "react";
import useInterval from "use-interval";
import promiseQueue from "./promiseQueue";

const dreamStore = Store("dreamachine");


export const dreamMachineName = "documenta_fridericianum_performance_4";

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

  promiseQueue(() => {
    console.log("running model for dream", dreamPrompt);
    runModel({ 
      prompts: dreamPrompt,
      num_frames_per_prompt: 25,
      random_seed: 28
      // prompt_scale: 12,
    }, "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/stable-diffusion-private")
    .then(data => {
      const videoURL = data?.output && data?.output["out_0.mp4"]
      console.log("loaded dream", dreamPrompt, videoURL)
      result.videoURL = videoURL;
      result.loading = false;
    })
    return awaitSleep(2000);
  })
  
  return result
})

export async function loadDreams() {
    const dreams = await getDreams()
    const newDreams = dreams.map(buildPromptAndLoadDream)
    await setDreams(newDreams)
    return newDreams;
            // .filter(dream => !dream.loading)
            //.map(({result, ...dream}) => ({...dream, ...result}))
}

const buildPromptAndLoadDream = (dream, i ,dreams)  => {
  
  if (dream.loading === false)
    return dream;
    
  const previousDream = dreams[i-1]?.dream || dream.dream
  const compositePrompt = 
              [previousDream, dream.dream]
              .map(vintagePhotoPimper)
              .join("\n")
              
  const dreamWithResults =  {...dream, ...loadDream(compositePrompt) }

  return dreamWithResults
}

// poll dream store every 5 seconds and return the current state of dreams
export function useDreams() {
    const [dreams, sDreams] = useState([]);


    console.log(dreams)

    useEffect(() => {
      (async () => sDreams((await loadDreams()).filter(({loading}) => loading === false)))();
    }, []);

    useInterval(async () => {
      
      const newDreams = await loadDreams();
      console.log("loaded dreams", newDreams)
      const newDreamsFiltered = newDreams.filter(({loading}) => loading === false)
      // only update dreams if they are different
      if (JSON.stringify(newDreamsFiltered) !== JSON.stringify(dreams)) 
        sDreams( newDreamsFiltered );

    }, 30000);
    
    return dreams;
  
}





const surrealistPromptPimper1 = prompt => `Dream of ${prompt}. Surrealism. Klarwein, Dali, Magritte.`;
const surrealistPromptPimper2 = prompt => `Dream of ${prompt}. Beautiful surrealistic surrealistic. illustration. painting. Hand drawn. Black and white.`;
const risographPromptPimper3 = prompt => `${prompt}. Risograph. Risograph.`;
const retroFuturisticPromptPimper4 = prompt => `${prompt}. Retro futurist poster. detail render, realistic maya, octane render, rtx, photo `;
const vintagePhotoPimper = prompt => `Vintage polaroid photo of ${prompt}. highly detailed shot, eerie 8 k uhd. dreamy`;

// const pimpDreamPrompts = (prompts) => prompts.split("\n").map(risographPromptPimper3).join("\n");

// execute one of the previously defined promptPimpers depending on the minute of the hour
const timeBasedPromptPimper = prompt => {
  const minute = new Date().getMinutes();
  if (minute < 10) return surrealistPromptPimper1(prompt);
  if (minute < 20) return surrealistPromptPimper2(prompt);
  if (minute < 40) return risographPromptPimper3(prompt);
  return vintagePhotoPimper(prompt);
}
