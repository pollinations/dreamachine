import { Route, Routes } from 'react-router-dom';
import DreamForm from './components/DreamForm';
import DreamPlayer from './components/DreamPlayer';

function App() {

  
  return (
    <Routes>
      <Route path='*' element={<>
        <DreamForm />
        <DreamPlayer />
      </> }/>
    </Routes>
  );
}

console.log("starting dreamachine...");

export default App;
