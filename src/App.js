import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Review from './components/Review'; // Ensure this path is correct

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Review />} /> {/* Set Review as the main route */}
      </Routes>
    </Router>
  );
}

export default App;