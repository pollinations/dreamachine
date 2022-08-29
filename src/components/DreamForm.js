import { append } from "ramda";
import { useState } from "react";
import { useMatch } from 'react-router-dom';
import styled from 'styled-components';
import useInterval from "use-interval";
import { getDreams, setDreams } from "../dreamStore";
import useLocalStorage from "../useLocalStorage";


export default function DreamForm() {
  const isMatch = !useMatch('/view')

  const [lastSubmittedTime, setLastSubmittedTime] = useLocalStorage("lastDreamSubmitTime", 0)

  const [disabled, setDisabled] = useState(true)

  useInterval(() => {
    const now = new Date().getTime()
    const timeSinceLastSubmit = now - lastSubmittedTime
    
    setDisabled(timeSinceLastSubmit < 5000)
  
  }, 1000)
  
  const [dreamPrompt, setDreamPrompt] = useState("");
  const dispatchDream = useDreamDispatch(dreamPrompt, setDreamPrompt);

  return (
    <Form onSubmit={(event) => {
        if (dreamPrompt.trim().length === 0) 
          return;
        setLastSubmittedTime(new Date().getTime());
        dispatchDream(event);
      }} isVisible={isMatch} >
        <a href='https://pollinations.ai'>
        <img style={{width: 200, margin:'2em 0'}}
        src='https://pollinations.ai/static/media/logo_light_4.adf04cb01f922bffd8ab.png' alt="pollinations"/>
      </a>
      <h2>Dreamachine - Documenta 15</h2>
      <p>An AI will turn your dream into pictures. It should appear in the collective dream video in a few minutes...</p>
      You can submit any kind of dream. For example:
      <ul>
        <li>What you dreamed last night?</li>
        <li>What you are dreaming of for the future? </li>
        <li>A dreamy psychedelic experience? </li>
      </ul>
      <p>Enter your dream here (max 150 characters):</p>
      <Input 
        type="text" 
        name="dream" 
        onChange={event => setDreamPrompt(event.target.value)} 
        value={dreamPrompt} 
        maxLength={150} 
        disabled={disabled}
        />
      {disabled ?? <p><b>Wait a little before submitting the next dream...</b></p>}
      <CreateButton type="submit" disabled={disabled}>
        Submit
      </CreateButton>
      <BackGroundImage 
          src='https://pollinations.ai/static/media/bgherooverlay.d7c737d250b29f33ecde.jpeg'
          top='auto'
          zIndex='-1' 
          alt="hero_bg_overlay" />
    </Form>
  );
}
const BackGroundImage = styled.img`
position: ${props => props.position ? props.position : 'fixed'};
width: 100%;
height: 100%;
top: ${props => props.top || 0};
left: 0;
opacity: ${props => props.opacity || 1};
z-index: ${props => props.zIndex || 0};
mix-blend-mode: ${props => props.blend || 'normal'};
transform: ${props => props.transform || ''};
object-fit: cover;
`
const CreateButton = styled.button`

width: 129px;
height: 52;
background: #D8E449;
border-radius: 40px;

// margin-left: ${props => props.marginLeft || 'calc(-129px - 0.5em)'};

border: none;

font-family: 'DM Sans';
font-style: normal;
font-weight: 700;
font-size: 17px;
line-height: 22px;
text-align: center;
text-transform: uppercase;
padding: 0.75em 0.3em;
color: #040405;
cursor: pointer;

:disabled {
background-color: grey;
}

margin-left: auto;
`
const Form = styled.form`
max-width: 100vw;
z-index: 1;
display: ${props => props.isVisible ? "flex" : "none"};
flex-direction: column;
gap: 1em;
// background-color: rgba(0, 0, 0, 0.8);
padding: 0 1.25em;
border-radius: 0.5em;
left: 0%;
top: 0px;

width: 95%;
max-width: 600px;
margin: 0 auto;
text-align: left;

// img {
//   width: 200px;
//   margin: 0 auto;
//   margin-top: 2em;
// }

`
const Input = styled.input`
background-color: transparent;
font-size: 16px;
padding: 0.5em;
color: #fff;
border: none;
border-radius: 0.1em;
background-color: rgba(50, 50, 50, 0.5);

:disabled {
  color: hsl(0, 0%, 50%);
}
`
const Button = styled.button`
border-radius: 0.1em;
align-self: flex-end;
background-color: #333;
padding: 1em;
border-radius: 7px;
font-size: 15px;
color: #fff;
border: none;
`

function useDreamDispatch(dreamText, setDreamPrompt){

  const dispatchDream = async (event) => {
    event.preventDefault();

    console.log("dispatching dream", dreamText);
    
    const dreamsUntilNow = await getDreams()
    console.log("got previous dreams", dreamsUntilNow);
    const newDreams = append({ 
      dream: dreamText,
    }, dreamsUntilNow)
//       
    console.log("dreamsWithNewOne", newDreams, "updating db")

    await setDreams(newDreams)
    setDreamPrompt("")
  };
  
  return dispatchDream;
}


