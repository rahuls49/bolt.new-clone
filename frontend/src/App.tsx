import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './pages/Home';
import { Builder } from './pages/Builder';
// import { parseXml } from './steps';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;