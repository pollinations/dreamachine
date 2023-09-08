import { append } from "ramda";
import { useState } from "react";
import { useMatch } from 'react-router-dom';
import styled from 'styled-components';
import useInterval from "use-interval";
import { getInitialdreamsName, getDreams, setDreams, useDreams } from "../dreamStore";
import useLocalStorage from "../useLocalStorage";


const bgblacktrans = { backgroundColor: "rgba(0,0,0,0.4)" };

export default function DreamForm() {
  const isMatch = !useMatch('/view')

  const [lastSubmittedTime, setLastSubmittedTime] = useLocalStorage("lastDreamSubmitTime", 0)

  const [disabled, setDisabled] = useState(true)

  useInterval(() => {
    const now = new Date().getTime()
    const timeSinceLastSubmit = now - lastSubmittedTime
    
    setDisabled(timeSinceLastSubmit < 100)
  
  }, 1000)
  
  const [dreamPrompt, setDreamPrompt] = useState("");
  const {dreams, dreamsName, addDream } = useDreams(()=>true);
  const dispatchDream = useDreamDispatch(dreamPrompt, setDreamPrompt, addDream);
 

  const lastDream = dreams && dreams[dreams.length -1]?.dream;

  return (
    <Form onSubmit={(event) => {
        if (dreamPrompt.trim().length === 0) 
          return;
        setLastSubmittedTime(new Date().getTime());
        dispatchDream(event);
      }} isVisible={isMatch} >
        <a href='https://pollinations.ai'>
        <img style={{width: 100, margin:'2em 0'}}
        src='https://i.imgur.com/TtlWIYp.png' alt="pollinations"/>
      </a>
      <h1>Onism</h1>
      <p>An animation is worth more than a million words. It should appear in the collective video in a few minutes...</p>
      Send a dream or something related to your feeling in this moment i.e. your internal state or your surroundings. Let's write a story together.
      <p>Session: <b style={bgblacktrans}><a href={`/${dreamsName}/view/`}>{dreamsName}</a></b></p> 
      <p>Last sentence: <b style={bgblacktrans}>{lastDream}</b></p>
      <p>Type here:</p>
      <Input 
        type="text" 
        name="dream" 
        onChange={event => setDreamPrompt(event.target.value)} 
        value={dreamPrompt} 
        maxLength={1500} 
        // disabled={disabled}
        />
      {disabled && <p><b>Wait a little before submitting the next dream...</b></p>}
      <CreateButton type="submit" disabled={disabled}>
        Submit
      </CreateButton>
    </Form>
  );
}

const CreateButton = styled.button`

width: 129px;
height: 52px;
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
height: 52px;
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
border-radius: 2em;
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

function useDreamDispatch(dreamText, setDreamPrompt, addDream){

  const dispatchDream = async (event) => {
    event.preventDefault();

    console.log("dispatching dream", dreamText);

    await addDream({ 
      dream: dreamText,
      started: false,
    });
    setDreamPrompt("")
  };
  
  return dispatchDream;
}


