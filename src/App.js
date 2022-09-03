import { Route, Routes } from 'react-router-dom';
import DreamForm from './components/DreamForm';
import { TwoDreamsPlayer } from './components/DreamPlayer';

function App() {

  
  return (
    <Routes>
      <Route path='/' element={<DreamForm />} />
      <Route path='/view/:lastN' element={<TwoDreamsPlayer />}/>
      <Route path='/view' element={<TwoDreamsPlayer />}/>
    </Routes>
  );
}

console.log("starting dreamachine...");

export default App;
