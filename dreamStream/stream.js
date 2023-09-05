// dotenv
// require('dotenv').config();

// const fs = require('fs');
// // const ffmpeg = require('fluent-ffmpeg');
// const fetch = require('node-fetch');
// const { spawn } = require('child_process');

// esm
import fs from 'fs';
import { spawn } from 'child_process';

// dotenv
import dotenv from 'dotenv';
import { generateDream, pollPrediction } from "../src/replicate.js";
import { registerListener } from './twitchChat.js';
import { last } from 'ramda';
import { timeBasedPromptPimper } from '../src/promptPimpers.js';
import awaitSleep from 'await-sleep';
dotenv.config();


const videoStreamFile = "/tmp/concatenatecStream.ts";

let ffmpegStreamStarted = false;

// download a video, convert it to .ts and concatenate it to the end of the video stream file
// pipe it directly to ffmpeg and then pipe it from ffmpeg to the end of the video stream file
async function downloadVideo(videoUrl) {
    const ffmpegCommand = `-i ${videoUrl} -vcodec libx264 -r 30 -g 30 -preset fast -vb 3000k -pix_fmt yuv420p -f mpegts pipe:`;
    console.log('ffmpeg command', ffmpegCommand);
    const ffmpeg = spawn('ffmpeg', ffmpegCommand.split(" "));
    const stream = fs.createWriteStream(videoStreamFile, { flags: 'a' });
    ffmpeg.stdout.pipe(stream);
    ffmpeg.stderr.on('data', (data) => {
        // console.log(`stderr: ${data}`);
    });

    return new Promise((resolve, reject) => {
        ffmpeg.on('exit', (code) => {
            if (code !== 0) {
                console.log(`child process exited with code ${code}`);  
                reject();
            }
            if (!ffmpegStreamStarted) {
                startFfmpeg();
                ffmpegStreamStarted = true;
            }
            resolve();
        });
    });
}

async function startFfmpeg() {
    // ffmpeg -re -f mpegts -i pipe: -vcodec libx264 -r 30 -g 30 -acodec copy -preset fast -vb 300k -pix_fmt yuv420p -f flv rtmp://live-ber.twitch.tv/app/live_882056162_hhQ8qcyHY7qmYxUJ0HNb9AGTcIbv5m

    const ffmpegCommand = `-f mpegts -re -stream_loop 9999 -i ${videoStreamFile} -vcodec libx264 -r 30 -g 30 -acodec copy -preset fast -vb 300k -pix_fmt yuv420p -f flv rtmp://live-ber.twitch.tv/app/${process.env.TWITCH_STREAM_KEY}`;

    const ffmpeg = spawn('ffmpeg', ffmpegCommand.split(" "));

    ffmpeg.stderr.on('data', (data) => {
        // console.log(`stderr: ${data}`);
    }
    );


    return new Promise((resolve, reject) => {
        ffmpeg.on('exit', (code) => {
            console.log(`child process exited with code ${code}`);
            resolve();
        });
    });

}


// delete the video stream file and start downloading the videos
// if (fs.existsSync(videoStreamFile))
//     fs.unlinkSync(videoStreamFile);
// downloadVideos(videoList);


const getVideoURLPromise = async (lastmessage, message) => {
    console.log('message', message);

    // prompt is the last message and new message with a new line in between
    const prompt = [lastmessage, message].map(timeBasedPromptPimper).join("\n");
    const unstyledPrompt = [lastmessage, message].join("\n");
    const dream = await generateDream({prompt, unstyledPrompt}, {fastMode: false});
    lastmessage = message;

    const result = await pollPrediction(dream.predictionID);

    if (result.status === 'succeeded') {
        const videoURL = last(result.output);
        console.log("videoURL", videoURL);
        return videoURL;
    }
    console.log("generated dream", dream);

}

let lastmessage = null;
const downloadQueue = [];

async function processDownloadQueue() {
    while (true) {
      if (downloadQueue.length === 0) {
        await awaitSleep(1000);
        continue;
      }
      const videoURLPromise = downloadQueue.shift();
      try {
        const videoURL = await videoURLPromise;
        if (videoURL) {
          await downloadVideo(videoURL);
        }
      } catch (error) {
        console.error('Error in download:', error);
      }
    }
  }


// we want to make sure we upload videos in the right order
registerListener(message => {
    if (lastmessage === null) {
        lastmessage = message;
        return;
    }
    const videoURLPromise = getVideoURLPromise(lastmessage, message);

    downloadQueue.push(videoURLPromise);

    lastmessage = message;
});

processDownloadQueue();