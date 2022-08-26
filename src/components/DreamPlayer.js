import useIPFS from '@pollinations/ipfs/reactHooks/useIPFS';
import { last } from 'ramda';
import { useEffect } from 'react';
import styled from 'styled-components';
import { useDreamResults, useDreams } from "../dreamStore";


export default function DreamPlayer() {

    const { dreamVideoURL, dreamText, increaseDreamIndex } = useDream()
  
    console.log("dream", dreamText, "dreamVideoURL", dreamVideoURL);



    return <Container>
        { dreamVideoURL &&
        <>
            
            <video 
                onEnded={increaseDreamIndex} 
                autoPlay 
                playsInline 
                muted 
                src={dreamVideoURL}/>
}
            <Legenda>{getLastDream(dreamText)}</Legenda>

        </>

        }
    </Container>
}

const getLastDream = dreamPrompts => last(dreamPrompts?.split("\n"))

// brutalist css styling
// with monospace font
const Legenda = styled.h1`
    position: absolute;
    right: 100px;
    top: 20px;
    background: rgba(0, 0, 0, 0.8);
    box-decoration-break: clone;    
    font-family: source-code-pro, monospace;
    font-weight: 400;
    padding: 0.5em;
`;

const Container = styled.div`
width: 100%;
min-height: 100vh;

display: flex;
align-items: center;
justify-content: center;
position: fixed;

video {
    width: 100%;
    max-height: 100vh;
}
`


function useDream(){
    const { currentDream, increaseDreamIndex } = useDreams();
    const dreamResultsID = useDreamResults(currentDream);
    const data = useIPFS(dreamResultsID);
    
    const dreamVideoURL = data?.output && data?.output["out_0.mp4"];
  
    useEffect(() => {
        // rather strange condition here but it works
        if (!dreamVideoURL && data?.output && dreamResultsID)
            increaseDreamIndex();
    }, [dreamVideoURL, dreamResultsID]);

    return { 
        dreamVideoURL, 
        dreamText: currentDream?.dream, 
        increaseDreamIndex, 
        dreamResultsID 
    }
}