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
      console.log('Testing AI API with:', testData);
      const response = await identityAPI.generateStatement(testData);
      console.log('AI Response:', response);
      
      if (response.success) {
        setResult(response.statement);
      } else {
        setError(`API Error: ${response.message}`);
      }
    } catch (err) {
      console.error('Test AI Error:', err);
      setError(`Connection Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Connection Test</h1>
      
      <Button onClick={testAI} disabled={loading} className="mb-4">
        {loading ? 'Testing...' : 'Test AI Connection'}
      </Button>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
          <p className="text-red-700 font-semibold">Error:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
          <p className="text-green-700 font-semibold">Success! Generated Statement:</p>
          <p className="text-green-600 mt-2">{result}</p>
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded">
        <p className="text-sm text-gray-600">
          This test page will help us debug the AI connection issue.
          Open the browser console (F12) to see detailed logs.
        </p>
      </div>
    </div>
  );
};

export default TestAI;