
// import Replicate from "replicate";

import awaitSleep from "await-sleep";
import fetch from "node-fetch";


// const replicate = new Replicate({
//   // get your token from https://replicate.com/account
//   auth: "0ae42be11f9282b5ccadbadf2949aa20fe9d6a9d",
//   fetch: window.fetch
// });
// 
const REPLICATE_API_URL = 'https://dev.soundmosaic.pixelynx-ai.com/replicate';
// const REPLICATE_API_URL = 'http://localhost:8080/replicate';
const SOUNDMOSAIC_TOKEN = "273b1dda33244edf921264fe374994fe"



export async function createImage(input) {

  // remove all null values. clone first
  input = removeNullValues(input);

  console.log("calling createimage with input", input)
  const response = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${SOUNDMOSAIC_TOKEN}`
    },
    body: JSON.stringify({
      version: '6cf757dadbd84da1bda0979c41211a860e852dbbebb793024847c07b3c7ad8a7',
      input
    })
  });
  console.log("got response", response);

  const data = await response.json();
  console.log("got data", data)
  
  return data.id || "";
};


function removeNullValues(input) {
  input = JSON.parse(JSON.stringify(input));
  Object.keys(input).forEach(key => input[key] == null && delete input[key]);
  return input;
}

export async function extractPrompt(base64_image_url) {
  const response = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${SOUNDMOSAIC_TOKEN}`
    },
    body: JSON.stringify({
      version: 'd90ed1292165dbad1fc3fc8ce26c3a695d6a211de00e2bb5f5fec4815ea30e4c',
      input: {
        image: base64_image_url,
        mode: "fast"
      },
    })
  });

  const data = await response.json();
  console.log("got data", data)

  return data.id;
}

export async function pollPrediction(predictionId, statusCallback=() => null) {
  // Poll for the result
  const pollInterval = 3000; // 3 seconds

  while (true) {
    const data = await getPrediction(predictionId);
    statusCallback(data);
    if (data.status === 'succeeded' || data.status === 'failed') {
      return data;
    }

    await awaitSleep(pollInterval);
  }
};

export async function getPrediction(predictionId) {
  try {
    const response = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${SOUNDMOSAIC_TOKEN}`
      }
    });

    const data = await response.json();
    console.log("status", data)
    return data
  } catch (error) {
    // Handle any errors here
    console.error('Error while polling for result:', error);
    return null;
  }
}



export async function getPredictionList(url=null) {

  if (!url)
    url = REPLICATE_API_URL+"/";
  console.log("calling getPredictionList with url", url)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${SOUNDMOSAIC_TOKEN}`
    }
  });

  const data = await response.json();
  console.log("predictions", data)

  return [data.results, data.next];
}





export const generateDream = async (dream, {fastMode=false}) => {
  console.log("executing / loading dream", dream);

  let [prompt1, prompt2] = dream.prompt.split("\n").slice(0, 2);
  if (!prompt2) prompt2 = prompt1;

  let [unstyled_prompt1, unstyled_prompt2] = dream.unstyledPrompt.split("\n").slice(0, 2);
  if (!unstyled_prompt2) unstyled_prompt2 = unstyled_prompt1;

  console.log("running model for dream", prompt1, prompt2);

  const id = await createImage({
    prompt1,
    prompt2,
    unstyled_prompt1,
    unstyled_prompt2,
    num_inference_steps: fastMode ? 20 : 25,
    interpolate_frames: fastMode ? 8 : 18,
    scheduler: "KarrasDPM",
    seed: 512,
    negative_prompt: "",
    width: 1280,
    height: 720,
  });

  return { ...dream, predictionID: id, loading: true, started: true };
};
