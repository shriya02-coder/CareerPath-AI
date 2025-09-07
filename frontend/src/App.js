import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import LandingPage from "./components/LandingPage";
import CareerExplorer from "./components/CareerExplorer";
import IdentityBuilder from "./components/IdentityBuilder";
import CareerDetail from "./components/CareerDetail";
import ResumeAssistant from "./components/ResumeAssistant";
import TestAI from "./components/TestAI";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<CareerExplorer />} />
          <Route path="/identity" element={<IdentityBuilder />} />
          <Route path="/career/:id" element={<CareerDetail />} />
          <Route path="/resume" element={<ResumeAssistant />} />
          <Route path="/test-ai" element={<TestAI />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;