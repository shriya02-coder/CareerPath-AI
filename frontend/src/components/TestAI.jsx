import React, { useState } from 'react';
import { Button } from './ui/button';
import { identityAPI } from '../services/api';

const TestAI = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testAI = async () => {
    setLoading(true);
    setError('');
    setResult('');

    const testData = {
      currentRole: "Software Developer",
      yearsExperience: "3-5 years",
      education: "Bachelor's Degree",
      selectedSkills: ["JavaScript", "React", "Problem Solving"],
      interests: "Building innovative applications",
      achievements: "Led multiple successful projects",
      careerGoals: "Become a Senior Developer"
    };

    try {
      console.log('🚀 Testing AI API with:', testData);
      console.log('🔗 API URL:', 'http://localhost:8001/api/identity/generate');
      
      const response = await identityAPI.generateStatement(testData);
      console.log('✅ AI Response received:', response);
      
      if (response.success) {
        setResult(response.statement);
      } else {
        setError(`API Error: ${response.message}`);
      }
    } catch (err) {
      console.error('❌ Test AI Error:', err);
      console.error('❌ Error Response:', err.response?.data);
      console.error('❌ Error Request:', err.request);
      setError(`Connection Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 AI Connection Test</h1>
      
      <Button 
        onClick={testAI} 
        disabled={loading} 
        className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
      >
        {loading ? '🔄 Testing AI...' : '🚀 Test Real AI Connection'}
      </Button>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
          <p className="text-red-700 font-semibold">❌ Error:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
          <p className="text-green-700 font-semibold">✅ Success! Real AI Generated Statement:</p>
          <p className="text-green-600 mt-2 italic">"{result}"</p>
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm text-blue-600">
          <strong>How this works:</strong><br/>
          1. Frontend sends request to: http://localhost:8001/api/identity/generate<br/>
          2. Backend processes with real AI (Emergent LLM Key)<br/>
          3. AI returns personalized career statement<br/>
          4. Check browser console (F12) for detailed logs
        </p>
      </div>
    </div>
  );
};

export default TestAI;