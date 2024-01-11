#!/usr/bin/env node
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    terminal: false
});

let buffer = '';
let lastLine = '';
let timeout;

rl.on('line', (line) => {
    clearTimeout(timeout);  // Clear any previous timeout

    if (line !== buffer) {
        buffer = line;
        
    }

    // Set a timeout to check if no new content is received after 3 seconds
    timeout = setTimeout(() => {
        let outString = buffer.replace(lastLine, '');
        // only return the last 5 words max.
        outString = outString.split(' ').slice(-5).join(' ');
        console.log(outString);
        lastLine = buffer;
        buffer = '';
    }, 1500);
});

rl.on('close', () => {
    if (buffer) {
        console.log(buffer);
    }
});
