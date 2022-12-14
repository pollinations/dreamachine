import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useDreams } from "../dreamStore";

// get playback rate from local storage
const playbackRate = parseFloat(localStorage.getItem("playbackRate") || 1.5)

export default function DreamsPlayer() {

    const { lastN=99 } = useParams()
    const { dreams, index, nextDream: triggerNextDream } = useDreamsWithIndex(lastN)
    const [activePlayer, setActivePlayer] = useState(-1);

    const videoRefs = [useRef(null), useRef(null)]


    console.log("dreamsPlayer dreams", dreams)

    const dream = dreams[index]

    const [text, setText] = useState("---")
    const nextDream = dreams[(index + 1) % dreams.length]

    
    const triggerNextDreamAndTogglePlayer = () => {
        triggerNextDream()
        setActivePlayer(1-activePlayer)
    }


    useEffect(() => {
        if (dreams.length > 1 && activePlayer === -1) {
            videoRefs[0].current.src = dream.videoURL
            videoRefs[1].current.src = nextDream.videoURL
            console.log(dream.videoURL, nextDream.videoURL)
            setActivePlayer(0)
        }

    }, [activePlayer, dream])

    useEffect(() => {
        if (activePlayer !== -1) {
            console.log("activePlayer", activePlayer)
            videoRefs[0].current.playbackRate = playbackRate;
            videoRefs[1].current.playbackRate = playbackRate;
            videoRefs[1-activePlayer].current.pause()
            videoRefs[1-activePlayer].current.currentTime = 0
            videoRefs[1-activePlayer].current.src = nextDream.videoURL
            videoRefs[1-activePlayer].current.style.zIndex = -2
            videoRefs[activePlayer].current.play()
            videoRefs[activePlayer].current.style.zIndex = -1

            const duration = videoRefs[activePlayer].current.duration;
            console.log("duration", duration)
            setTimeout(() => {
                setText(dream.dream)
            }, Math.round((duration * 1000) / (2 * playbackRate)));
        }
        
    }, [activePlayer])

    if (!dream)
        return <h1>loading first dream...</h1>

    return <Container>
        <div style={{width:"100%", height:"100%", position:"relative"}}>   
        <DreamBanner />
            <VideoPlayer playerRef={videoRefs[0]} onEnded={triggerNextDreamAndTogglePlayer} />
            <VideoPlayer playerRef={videoRefs[1]} onEnded={triggerNextDreamAndTogglePlayer} />
        </div>
        <Legenda>
             {text}
        </Legenda>
    </Container>
}

const VideoPlayer = ({playerRef, onEnded}) => {
   return <video 
    onEnded={onEnded} 
    playsInline 
    muted 
    // controls
    ref={playerRef}
    preload="auto"
    // hidden
    style={{position: "absolute"}}
    />
}

let showBannerNum =0;

function DreamBanner() {
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        showBannerNum++;
        if (showBannerNum % 2 === 0) {
            setTimeout(() => {
                setVisible(true)
            } ,2000)
        }
        setTimeout(() => {
            setVisible(true)
        } ,15000)
    },[])
    return <URL style={{display: visible ? "":"none"}}>Send your dream: <b>https://dreamachine.pollinations.ai</b></URL>
}

// brutalist css styling
// with monospace font
const Legenda = styled.p`
    text-align: center;
    position: absolute;
    background: rgba(0, 0, 0, 0.35);
    font-weight: 400;
    font-size: 3vw;
    bottom: 00px;
    margin: 0 auto;
    width: 100%;
`;

const URL = styled.p`
    text-align: center;
    position: absolute;
    background: rgba(0, 0, 0, 0.35);
    font-weight: 400;
    padding: 0.5em;
    font-size: 2vw;
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

export function useDreamsWithIndex(lastN=4) {

    const allDreams = useDreams();
    const dreams = allDreams.slice(-1 * lastN);
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
