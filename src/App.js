import { Route, Routes } from 'react-router-dom';
import DreamForm from './components/DreamForm';
import DreamList from './components/DreamList';
import DreamPlayer from './components/DreamPlayer';

function App() {

  
  return (
    <Routes>
      <Route path='/' element={<DreamForm />} />
      <Route path='/view/:lastN' element={<DreamPlayer />}/>
      <Route path='/view' element={<DreamPlayer />}/>
      <Route path='/list' element={<DreamList />}/>
    </Routes>
  );
}

console.log("starting dreamachine...");

export default App;
