import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useDreams } from "../dreamStore";

// get playback rate from local storage
const playbackRate = parseFloat(localStorage.getItem("playbackRate") || 0.5)

export default function DreamsPlayer() {

    const { lastN=99 } = useParams()
    const { dreams, index, nextDream: triggerNextDream, dreamsName } = useDreamsWithIndex(lastN)
    const [activePlayer, setActivePlayer] = useState(-1);

    const videoRefs = [useRef(null), useRef(null)]


    console.log("dreamsPlayer dreams", dreams)

    const dream = dreams[index];
    const nextDream = dreams[(index + 1) % dreams.length]

    const [text, setText] = useState("---")

    // Switch to the next dream and toggle the active video player
    const triggerNextDreamAndTogglePlayer = () => {
        triggerNextDream()
        setActivePlayer(1-activePlayer)
    }

    // Set initial video sources and active player
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
            loadVideoSwitchActivePlayer(videoRefs, activePlayer, nextDream.videoURL);
            const duration = videoRefs[activePlayer].current.duration;
            setTimeout(() => {
                setText(dream.dream)
            }, Math.round((duration * 1000) / (2 * playbackRate)));
        }
        
    }, [activePlayer])

    if (!dream)
        return <h1>loading first dream...</h1>

    return <Container style={{position:"initial"}}>
        <div style={{width:"100%", height:"100%"}}>
        <Legenda>
             {text.slice(0,80)}
            </Legenda>
            <VideoPlayer playerRef={videoRefs[0]} onEnded={triggerNextDreamAndTogglePlayer} />
            <VideoPlayer playerRef={videoRefs[1]} onEnded={triggerNextDreamAndTogglePlayer} />
            <DreamBanner dreamsName={dreamsName} />

        </div>

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

function loadVideoSwitchActivePlayer(videoRefs, activePlayer, videoURL) {
    videoRefs[0].current.playbackRate = playbackRate;
    videoRefs[1].current.playbackRate = playbackRate;
    videoRefs[1 - activePlayer].current.pause();
    videoRefs[1 - activePlayer].current.currentTime = 0;
    videoRefs[1 - activePlayer].current.src = videoURL;
    videoRefs[1 - activePlayer].current.style.zIndex = -2;
    videoRefs[activePlayer].current.play();
    videoRefs[activePlayer].current.style.zIndex = -1;
}

function DreamBanner({dreamsName}) {
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
    return <URL style={{display: visible ? "":"none"}}>{"Participate ->"}<b>{`dreamachine.art`}</b></URL>
}

// brutalist css styling
// with monospace font
const Legenda = styled.p`
    text-align: center;
    position: absolute;
    background: rgba(0, 0, 0, 0.6);
    font-weight: 400;
    font-size: 3vw;
    top: 20px;
    margin: 0 auto;
    width: 100%;
    // height:100px;
`;

const URL = styled.p`
    text-align: center;
    position: absolute;
    background: rgba(0, 0, 0, 0.35);
    font-weight: 400;
    padding: 0.5em;
    font-size: 2vw;
    bottom: 0px;
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

export function useDreamsWithIndex(lastN=4) {
  const {dreams: allDreams, dreamsName } = useDreams();
  const dreams = allDreams.slice(-1 * lastN);

  const [index, setIndex] = useState(null);

  useEffect(() => {
    if (dreams.length > 0 && index === null) {
      // Set index to a random value only the first time dreams are populated
      setIndex(Math.floor(Math.random() * dreams.length));
    }
  }, [dreams, index]);

  const nextDream = () => {
    if (dreams.length > 0 && index !== null) {
      setIndex((index + 1) % dreams.length);
    }
  };

  console.log("dreamIndex", index, "dreams", dreams);

  return { dreams, index, nextDream, dreamsName };
}

const speak = (text) =>{ 
        const utterance = new window.SpeechSynthesisUtterance(text)
    
        // select random voice
        const voices = window.speechSynthesis.getVoices();
        utterance.voice = voices[Math.floor(Math.random() * voices.length)];
    
        // return a method that can be called to speak the utterance
        window.speechSynthesis.speak(utterance)
}
