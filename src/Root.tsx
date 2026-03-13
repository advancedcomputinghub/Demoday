import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Team from './pages/Team';

export default function Root() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/team" element={<Team />} />
      </Routes>
    </Router>
  );
}
