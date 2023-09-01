import Store from "@pollinations/ipfs/pollenStore";
import awaitSleep from "await-sleep";
import memoize from "lodash.memoize";
import { useEffect, useState } from "react";
import useInterval from "use-interval";
import promiseQueue from "./promiseQueue";
import { createImage, getPrediction } from "./replicate";

const dreamStore = Store("dreamachine");

const state = {
  dreamMachineName: null,
}

// export getter and setter
export const getDreamMachineName = () => state.dreamMachineName;
export const setDreamMachineName = (dreamMachineName) => {
  state.dreamMachineName = dreamMachineName;
};

// get dream machine name from query string
const queryDreamMachineName = new URLSearchParams(window.location.search).get("dream");
state.dreamMachineName = queryDreamMachineName || localStorage.getItem("dream") || "aliveinteraction_1";

const initDreamStore =  async () => {
    console.log("initializing dream store if it does not exist yet"); 
    if (!await dreamStore.get(state.dreamMachineName)) {
      console.log("dream store does not exist yet, creating it");
      await dreamStore.set(state.dreamMachineName, []);
    }
  }


export const getDreams = async () => await dreamStore.get(state.dreamMachineName);
export const setDreams = async (dreams) => await dreamStore.set(state.dreamMachineName, dreams);

initDreamStore();

export async function loadDreams() {
    const dreams = (await getDreams())//.slice(0,5)
    console.log("got dreams", dreams)
    const newDreams = dreams.map(buildPromptAndLoadDream)
    await setDreams(newDreams)
    return newDreams;
            // .filter(dream => !dream.loading)
            //.map(({result, ...dream}) => ({...dream, ...result}))
}

const buildPromptAndLoadDream = (dream, i ,dreams)  => {
  
  if (dream.loading === false)
    return dream;
    
  const previousDream = dreams[i-1]?.dream
  const compositePrompt = 
              (previousDream ? [previousDream, dream.dream] : [dream.dream])
              .map(timeBasedPromptPimper)
              .join("\n")
              
  const dreamWithResults =  {...dream, ...loadDream(compositePrompt) }

  return dreamWithResults
}


const loadDream = memoize(dreamPrompt => {
  console.log("loading dream", dreamPrompt);
  const result = {
    loading: true,
    videoURL: null
  }

  promiseQueue(() => {
    // console.log("running model for dream", dreamPrompt);
    let [prompt1, prompt2] = dreamPrompt.split("\n").slice(0,2);
    if (!prompt2) prompt2 = prompt1;
    console.log("running model for dream", prompt1, prompt2);
    (async () => {
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
      console.log("loaded dream", dreamPrompt, videoURL)
      result.videoURL = videoURL;
      result.loading = false;
    })();
    return awaitSleep(15000);
  })
  
  return result
})


// poll dream store every 5 seconds and return the current state of dreams
export function useDreams(dreamFilter = filterDreams, triggerCreate=true) {
    const [dreams, sDreams] = useState([]);

    const dreamFunction = triggerCreate ? loadDreams : getDreams;

    console.log("useDreams", dreams)

    useEffect(() => {
      (async () => sDreams((await dreamFunction()).filter(dreamFilter)))();
    }, [dreamFunction]);

    useInterval(async () => {
      
      const newDreams = await dreamFunction();
      console.log("loaded dreams", newDreams)
      const newDreamsFiltered = newDreams.filter(dreamFilter)
      // only update dreams if they are different
      if (JSON.stringify(newDreamsFiltered) !== JSON.stringify(dreams)) 
        sDreams( newDreamsFiltered );

    }, 10000);
    
    return dreams;
  
}

const filterDreams = ({loading, videoURL}) => loading === false && videoURL




const surrealistPromptPimper1 = prompt => `Dream of ${prompt}. ${prompt}. Surrealism. Klarwein, Dali, Magritte`;
const surrealistPromptPimper2 = prompt => `Dream of ${prompt}. ${prompt}. surrealistic. illustration. painting. Hand drawn. Black and white.`;
const risographPromptPimper3 = prompt => `${prompt}. Risograph. Minimalism.`;
const retroFuturisticPromptPimper4 = prompt => `Retro-futurist ${prompt}. Poster. vintage sci-fi, 50s and 60s style, atomic age, vibrant,`;
const vintagePhotoPimper = prompt => `analog film photo ${prompt} . faded film, desaturated, 35mm photo, grainy, vignette, vintage, Kodachrome, Lomography, stained, highly detailed, found footage`;
const solarPunkPromptPimper = prompt => `A solarpunk ${prompt}, high resolution, neon lights, light and shadow`;
const graffitiPromptPimper = prompt => `Dream of ${prompt}. graffiti art, inspired by Brad Kunkle, tutu, russ mills, hip skirt wings, andrey gordeev`
const paperQuilling = prompt => `paper quilling art of ${prompt} . intricate, delicate, curling, rolling, shaping, coiling, loops, 3D, dimensional, ornamental`;
const paperCut = prompt => `papercut collage of ${prompt} . mixed media, textured paper, overlapping, asymmetrical, abstract, vibrant`
// const pimpDreamPrompts = (prompts) => prompts.split("\n").map(risographPromptPimper3).join("\n");

// execute one of the previously defined promptPimpers depending on the minute of the hour
const timeBasedPromptPimper = prompt => {
  const minute = new Date().getMinutes();
  if (minute < 10) return surrealistPromptPimper1(prompt);
  if (minute < 20) return paperCut(prompt);
  if (minute < 30) return risographPromptPimper3(prompt);
  if (minute < 40) return retroFuturisticPromptPimper4(prompt);
  if (minute < 50) return vintagePhotoPimper(prompt);
  return graffitiPromptPimper(prompt);
}
