import React, { useEffect } from 'react';
import { Route, Routes, Outlet, useParams, useNavigate } from 'react-router-dom';
import DreamForm from './components/DreamForm';
import DreamList from './components/DreamList';
import DreamPlayer from './components/DreamPlayer';

// function App() {

  
//   return (
//     <Routes>
//       <Route path='/' element={<DreamForm />} />
//       <Route path='/view/:lastN' element={<DreamPlayer />}/>
//       <Route path='/view' element={<DreamPlayer />}/>
//       <Route path='/list' element={<DreamList />}/>
//     </Routes>
//   );
// }

// create a systemnof nested routes so that we first have the dreamId then the other routes
// e.g. /:dreamId/view/:lastN
// /:dreamId (for the form)
// /:dreamId//:lastN


const Dream = () => {
    return <div>
      <Outlet />
    </div>
};

const RedirectToAlive = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/worldbank_creativity_ai');
  }, [navigate]);
  return null;
};


function App() {
  return (
    <Routes>
      <Route path='/' element={<RedirectToAlive />} />
      <Route path='/:dreamId/*' element={<Dream />}>
        <Route index element={<DreamForm />} />
        <Route path='view/:lastN' element={<DreamPlayer />} />
        <Route path='view' element={<DreamPlayer />} />
        <Route path='list' element={<DreamList />} />
      </Route>
    </Routes>
  );
}


console.log("starting dreamachine...");

export default App;
