import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useDreams } from "../dreamStore";


export default function DreamsPlayer() {

    const { dreams, index, nextDream } = useDreamsWithIndex()

    console.log("dreamsPlayer dreams", dreams)

    const dream = dreams[index]

    if (!dream)
        return <h1>loading first dream...</h1>

    return <Container>
        {/* { dreams.map((dream, dreamIndex) =>  */}
            <Dream 
                dream={dream} 
                key={dream.dream}
                next={nextDream}
            />
        {/* ) } */}
    </Container>
}

function Dream({ dream,  next }) {
    const { videoURL, dream: text } = dream


    console.log("visible dream", text, "dreamVideoURL", videoURL)

    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            // videoRef.current.play();
            videoRef.current.playbackRate = 0.5;
        }
    } ,[videoRef.current])
    
    return <div style={{
        // display: visible ? "block" : "none", 
        width:"100%", height:"100%"}}>   
        <DreamBanner />
        <video 
            onEnded={next} 
            autoPlay 
            playsInline 
            muted 
            // controls
            src={videoURL}
            ref={videoRef}
            />

        <Legenda>
            {text}
        </Legenda>
    </div>
}

let showBannerNum =0;

function DreamBanner() {
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        showBannerNum++;
        if (showBannerNum % 3 === 0) {
            setTimeout(() => {
                setVisible(true)
            } ,5000)
        }
        setTimeout(() => {
            setVisible(false)
        } ,10000)
    },[])
    return <URL style={{display: visible ? "":"none"}}>Submit your dream @ <b>dreamachine.pollinations.ai</b></URL>
}

// brutalist css styling
// with monospace font
const Legenda = styled.p`
    text-align: center;
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    font-weight: 400;
    padding: 0.5em;
    font-size: 2em;
    bottom: 0px;
    margin: 0 auto;
    width: 100%;
`;

const URL = styled.p`
    text-align: center;
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    font-weight: 400;
    padding: 0.5em;
    font-size: 2em;
    top: 0px;
    margin: 0 auto;
    width: 100%;
`;

const Container = styled.div`
width: 100%;
height: 100%;
align-items: center;
justify-content: center;
position: relative;

video {
    width: 100%;
    max-height: calc(100vh - 0px);
}
`





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
