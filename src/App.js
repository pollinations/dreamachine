import DreamPlayer from './components/DreamPlayer';
import DreamForm from './components/DreamForm';
import { Route, Routes } from 'react-router-dom';

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


export default App;
