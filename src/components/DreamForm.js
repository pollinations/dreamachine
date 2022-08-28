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
    console.log("timeSinceLastSubmit", timeSinceLastSubmit)
    
    setDisabled(timeSinceLastSubmit < 120000)
  
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
      <h1>Pollinations Dreamachine @ Documenta</h1>
      <p>You can submit any kind of dream. For example</p>
      <ul>
        <li>What you dreamed last night</li>
        <li>What you are dreaming of for the future</li>
        <li>A psychedelic experience</li>
      </ul>
      <p>Enter your dream here and press ENTER (max 100 characters):</p>
      <Input 
        type="text" 
        name="dream" 
        onChange={event => setDreamPrompt(event.target.value)} 
        value={dreamPrompt} 
        maxLength={100} 
        disabled={disabled}
        />
      {disabled && <p>Wait a little before submitting the next dream...</p>}
      <Button type="submit">
      </Button>
      <p>An AI will turn your dream into pictures. It should appear in the collective dream video in a few minutes...</p>
    </Form>
  );
}

const Form = styled.form`
position: fixed;
z-index: 1;
display: ${props => props.isVisible ? "flex" : "none"};
flex-direction: column;
gap: 1em;
background-color: rgba(0, 0, 0, 0.8);
padding: 1.25em;
border-radius: 0.5em;
left: 0%;
top: 100px;
`
const Input = styled.input`
background-color: transparent;
font-size: 16px;
padding: 0.5em;
color: #888;
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
background-color: transparent;
font-size: 15px;
color: #888;
border: none;
`

function useDreamDispatch(dreamText, setDreamPrompt){

  const dispatchDream = async (event) => {
    event.preventDefault();

    console.log("dispatching dream", dreamText);
    
    const dreamsUntilNow = await getDreams()

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


