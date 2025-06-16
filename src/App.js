import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import Routines from './components/Routines';
import Post from './components/Post';
import ChExercise from './components/ChExercise';
import RDFViewer from './components/RDFViewer';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/routines" element={<Routines />} />
        <Route path="/post" element={<Post />} />
        <Route path="/chexercise" element={<ChExercise />} />
        <Route path="/rdf" element={<RDFViewer />} />
      </Routes>
    </Router>
  );
};

export default App;
