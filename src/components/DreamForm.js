import useAWSNode from '@pollinations/ipfs/reactHooks/useAWSNode';
import { append, last, update } from "ramda";
import { useState } from "react";
import styled from 'styled-components';
import { getDreams, setDreams } from "../dreamStore";


export default function DreamForm() {

  const [dreamPrompt, setDreamPrompt] = useState("");
  const { dispatchDream, isLoading } = useDreamDispatch(dreamPrompt);
  
  return (
    <Form onSubmit={dispatchDream} >
      <Input type="text" name="dream" onChange={event => setDreamPrompt(event.target.value)} disabled={isLoading} />
      <Button type="submit" disabled={isLoading}>
        <i>
          {isLoading ? 'Sending dream...' : 'Type your dream and hit enter'}
        </i>
      </Button>
    </Form>
  );
}

const Form = styled.form`
position: fixed;
z-index: 1;
max-width: 600px;
display: flex;
flex-direction: column;
gap: 1em;
background-color: rgba(0, 0, 0, 0.8);
padding: 1.25em;
border-radius: 0.5em;
left: 0%;
bottom: 0;
`
const Input = styled.input`
background-color: transparent;
font-size: 20px;
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

function useDreamDispatch(dreamPrompt){

  const { submitToAWS } = useAWSNode({});
  const [ isLoading, setLoading ] = useState(false);
  
  const dispatchDream = async (event) => {
    event.preventDefault();

    console.log("dispatching dream", dreamPrompt);
    setLoading(true);

    const dreamsUntilNow = await getDreams();
    const lastDreamIndex = dreamsUntilNow.length - 1;
    const lastDream = dreamsUntilNow[lastDreamIndex];

    const dreamWithLast = !lastDream ? dreamPrompt : `${getDestinationDream(lastDream.dream)}\n${dreamPrompt}`;

    const dreamsWithNewOne = append({ dream: dreamWithLast }, dreamsUntilNow);

    const currentDreamIndex = dreamsWithNewOne.length - 1;

    console.log("dreamsWithNewOne", dreamsWithNewOne, "updating db");
    await setDreams(dreamsWithNewOne);

    const { nodeID } = await submitToAWS({ prompts: pimpDreamPrompts(dreamWithLast) }, "614871946825.dkr.ecr.us-east-1.amazonaws.com/pollinations/stable-diffusion-private");

    const newDreams = update(currentDreamIndex,
      {
        dream: dreamWithLast,
        dreamID: nodeID,
      },
      dreamsWithNewOne);

    console.log("dream submitted, nodeID:", nodeID, "new dreams:", newDreams);
    await setDreams(newDreams);
    setLoading(false)
  };
  
  return { dispatchDream, isLoading };
}

const getDestinationDream = dreamPrompts => last(dreamPrompts?.split("\n"))


const pimpDreamPrompts = (prompts) => prompts.split("\n").map(prompt => `Dream of ${prompt}. Surrealism. Klarwein, Dali, Magritte.`).join("\n");