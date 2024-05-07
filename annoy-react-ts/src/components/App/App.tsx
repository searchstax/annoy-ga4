import React from 'react';
import './App.css';
import { Routes, Route, Link } from "react-router-dom";

import { RecommendationPage } from '../RecommendationPage/RecommendationPage';
import { NewRecommendations } from '../NewRecommendations/NewRecommendations';

// MUI
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

function App() {
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            ANNOY
          </Typography>
          <Button component={Link} to={'/'} sx={{ color: '#fff' }}>Recommenders</Button>
          <Button component={Link} to={'/new'} sx={{ color: '#fff' }}>New</Button>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/">
          <Route index element={<RecommendationPage />} />
          <Route path="new" element={<NewRecommendations />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
