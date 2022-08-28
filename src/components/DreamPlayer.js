import useIPFS from '@pollinations/ipfs/reactHooks/useIPFS';
import { last } from 'ramda';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useDreamResults, useDreams } from "../dreamStore";


export default function DreamsPlayer() {

    const { dreams, index, nextDream } = useDreamsWithIndex();


    // useEffect(() => {
    //     speak(dreamText);
    // } ,[dreamText]);


    return <Container>
        { dreams.map((dream, dreamIndex) => 
            <Dream 
                dream={dream} 
                key={dreamIndex}
                visible={dreamIndex === index}
                next={nextDream}
            />
        ) }
    </Container>
}

function Dream({ dream, visible, next }) {
    const { videoURL, text } = useDream(dream)

    if (visible)
        console.log("visible dream", text, "dreamVideoURL", videoURL)
    
    useEffect(() => {
        if (!videoURL)
            setTimeout(() => next(), 1000) 
            // next()
    }, [videoURL])

    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play();
            videoRef.current.playbackRate = 0.5;
        }
    } ,[visible])
    
    return <div style={{display: visible ? "block" : "none"}}>   
        <video 
            onEnded={next} 
            // autoPlay 
            playsInline 
            muted 
            src={videoURL}
            ref={videoRef}
            />

        <Legenda>
            {text}
        </Legenda>
    </div>
}

const getLastDream = dreamPrompts => last(dreamPrompts?.split("\n"))

// brutalist css styling
// with monospace font
const Legenda = styled.p`
    text-align: center;
    top: 20px;
    background: rgba(0, 0, 0, 0.8);
    font-weight: 400;
    padding: 0.5em;
    font-size: 2em;
`;

const Container = styled.div`
width: 100%;
min-height: 100vh;

display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
position: fixed;

video {
    width: 100%;
    max-height: calc(100vh - 200px);
}
`


function useDream(dream){

    const dreamResultsID = useDreamResults(dream.dreamID)
    const data = useIPFS(dreamResultsID)
    console.log("dreamResultsID", dreamResultsID, "data", data)
    const videoURL = data?.output && data?.output["out_0.mp4"]
  
    return { 
        videoURL, 
        text: dream ? getLastDream(dream.dream) : "", 
        dreamResultsID
    }
}




// return dream and possibility to jump to the next dream

export function useDreamsWithIndex() {

    const dreams = useDreams();
    const [index, setIndex] = useState(0);
  
    const nextDream = () => dreams.length > 0 && setIndex((index + 1) % dreams.length);
  
    console.log("dreamIndex", index, "dreams", dreams);
    
    return {dreams, index, nextDream};
  }

const speak = (text) =>{ 
        const utterance = new window.SpeechSynthesisUtterance(text)
    
        // select random voice
        const voices = window.speechSynthesis.getVoices();
        utterance.voice = voices[Math.floor(Math.random() * voices.length)];
    
        // return a method that can be called to speak the utterance
        window.speechSynthesis.speak(utterance)
}
