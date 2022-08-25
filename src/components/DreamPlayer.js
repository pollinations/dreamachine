import useIPFS from '@pollinations/ipfs/reactHooks/useIPFS';
import styled from 'styled-components';
import { getDreamResults, useDreamResults, useDreams } from "../dreamStore";


export default function DreamPlayer() {

    const { dreamVideoURL, increaseDreamIndex } = useDream()
  
    return <Container>
        { dreamVideoURL &&
        <video 
            onEnded={increaseDreamIndex} 
            autoPlay 
            playsInline 
            muted 
            src={dreamVideoURL}/>
            
        }
    </Container>
}

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
    const { currentDream, increaseDreamIndex }  = useDreams();
    const dreamResultsID = useDreamResults(currentDream);
    const data = useIPFS(dreamResultsID);
    
    const dreamVideoURL = data?.output && data?.output["out_0.mp4"];
  
    return { dreamVideoURL, increaseDreamIndex, dreamResultsID }
}