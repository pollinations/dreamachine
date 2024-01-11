import Store from "@pollinations/ipfs/pollenStore.js";
import OpenAI from 'openai';

const OPENAI_API_KEY="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"

const dreamStore = Store("dreamachine");


const openai = new OpenAI({
    apiKey: OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
  });
  
  async function visualize(transcription) {

    if (transcription.length < 50)
        return;
    console.error("---calling chatgpt with----\n", transcription);
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: `
# here are some lines that have been transcribed from the microphone
${transcription}

- i want you to come up with a short image prompt for an image generator to illustrate what was said in the previous lines
- respond on exactly 1 lines
- line 1: image prompt (maximum 160 characters)
` }],
      model: 'gpt-3.5-turbo',
    });
    const message = chatCompletion.choices[0]?.message?.content;
    console.error("got message---", message)
    
    await addDreamToDreamStore(message);
    return message;
  }
  

// function to continuously read from stdin. it will accumulate lines in a buffer. 
// if more than 2 minutes have passed since last time the buffer was flushed, it will flush the buffer to callback

function readStdin(callback) {
    let buffer = "";
    let lastFlush = Date.now();
    process.stdin.on('data', function (data) {
        data = data.toString().trim();
        if (data.startsWith("[") || data.includes("listening"))
            return;
        if (data.toString().trim().length > 5)
            console.error("NEW SPEACH:", data);
        buffer = addToBuffer(buffer, data);
        // remove all lines that start with "[" or lines that contain any casing of listening or uppercase INFO
        buffer = buffer.split("\n").filter(line => !line.startsWith("[") && !line.includes("listening") && !line.includes("INFO")).join("\n");
        // console.error("---new buffer", buffer)

    });
    setInterval(function () {
        if (Date.now() - lastFlush > 120000) {
            if (buffer.length > 0)
                callback(buffer);
            lastFlush = Date.now();
            buffer = "";
        }
    }, 1000);
}

// adds data to the buffer. 
// if the last line of the buffer is same as line to be added, skip
// filter any lines that are less than 3 characters or contain lowercase "thank you"

function addToBuffer(buffer, data) {

    return ""+buffer+"\n"+data;
}

const addDreamToDreamStore = async prompt => {
    const dreamsName = "worldbank_creativity_ai";
    const newDreams = await dreamStore.get(dreamsName) || [];
    // console.log("dreams", newDreams)
    const dream = { dream: prompt, started: false };
    newDreams.push(dream);
    // setDreamsState(newDreams.filter(dreamFilter));
    await dreamStore.set(dreamsName, newDreams);
} 


readStdin(visualize);


// addDreamToDreamStore()

