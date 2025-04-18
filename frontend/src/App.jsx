import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ContentForm from './ContentForm'
import ContentList from './ContentList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/add" element={<ContentForm />} />
        <Route path="/edit/:id" element={<ContentForm />} />
        <Route path="/contents" element={<ContentList />} />
        <Route path="/" element={<ContentList />} />
      </Routes>
    </Router>
  );
}

export default App
