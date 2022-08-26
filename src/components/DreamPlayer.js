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

            <div style={{position: "absolute", right: "100px", top: "20px", padding:"50px"}}><h1>{getLastDream(dreamText)}</h1></div>

        </>

        }
    </Container>
}

const getLastDream = dreamPrompts => last(dreamPrompts?.split("\n"))

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