import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, ArrowRight, Sparkles, Copy, CheckCircle } from 'lucide-react';
import { skills, experiences, educationLevels, sampleIdentityStatements } from '../data/mock';
import { toast } from 'sonner';

const IdentityBuilder = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    currentRole: '',
    yearsExperience: '',
    education: '',
    selectedSkills: [],
    interests: '',
    achievements: '',
    careerGoals: ''
  });
  const [generatedStatement, setGeneratedStatement] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  };

  const generateIdentityStatement = () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const statement = `As a ${formData.currentRole} with ${formData.yearsExperience} of experience and ${formData.education}, I bring a unique combination of ${formData.selectedSkills.slice(0, 3).join(', ')} to drive meaningful impact. My passion for ${formData.interests} and proven track record in ${formData.achievements} positions me to excel in roles that require ${formData.selectedSkills.slice(3, 6).join(', ')}. I am eager to leverage my expertise to ${formData.careerGoals} and contribute to innovative teams that value collaboration and continuous learning.`;
      
      setGeneratedStatement(statement);
      setIsGenerating(false);
      setCurrentStep(4);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedStatement);
    toast.success('Career Identity Statement copied to clipboard!');
  };

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Tell us about your current situation' },
    { number: 2, title: 'Skills & Expertise', description: 'What are you good at?' },
    { number: 3, title: 'Goals & Aspirations', description: 'Where do you want to go?' },
    { number: 4, title: 'Your Career Identity', description: 'Your personalized statement' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="px-6 py-4 border-b border-purple-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="text-xl font-semibold text-gray-800">Career Identity Builder</div>
        </div>
      </header>

      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${
                    currentStep >= step.number 
                      ? 'bg-purple-600 text-white border-purple-600' 
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-purple-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-600">{steps[currentStep - 1].description}</p>
            </div>
          </div>

          {/* Step Content */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Current Role or Job Title</label>
                    <Input
                      placeholder="e.g., Marketing Coordinator, Student, Career Changer"
                      value={formData.currentRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                    <select 
                      value={formData.yearsExperience}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-md focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="">Select experience level</option>
                      {experiences.map(exp => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Education Level</label>
                    <select 
                      value={formData.education}
                      onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-md focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="">Select education level</option>
                      {educationLevels.map(edu => (
                        <option key={edu} value={edu}>{edu}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-4 block">
                      Select your key skills (choose 3-8 skills)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {skills.map(skill => (
                        <Badge
                          key={skill}
                          variant={formData.selectedSkills.includes(skill) ? "default" : "outline"}
                          className={`cursor-pointer p-3 text-center justify-center transition-all ${
                            formData.selectedSkills.includes(skill)
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'hover:bg-purple-50 hover:border-purple-300'
                          }`}
                          onClick={() => handleSkillToggle(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Selected: {formData.selectedSkills.length} skills
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Key Achievements or Projects</label>
                    <Textarea
                      placeholder="Briefly describe your most significant achievements, projects, or accomplishments..."
                      value={formData.achievements}
                      onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Areas of Interest</label>
                    <Textarea
                      placeholder="What topics, industries, or types of work excite you most?"
                      value={formData.interests}
                      onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Career Goals</label>
                    <Textarea
                      placeholder="What do you hope to achieve in your career? What impact do you want to make?"
                      value={formData.careerGoals}
                      onChange={(e) => setFormData(prev => ({ ...prev, careerGoals: e.target.value }))}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  {isGenerating ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Sparkles className="text-white h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating your Career Identity Statement</h3>
                      <p className="text-gray-600">Our AI is analyzing your information to create a personalized statement...</p>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Sparkles className="text-purple-600 h-5 w-5 mr-2" />
                          Your Career Identity Statement
                        </h3>
                        <p className="text-gray-800 leading-relaxed mb-4 text-lg">
                          {generatedStatement}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy to Clipboard
                        </Button>
                      </div>
                      
                      <div className="text-center space-y-4">
                        <p className="text-gray-600">Ready to explore careers that match your profile?</p>
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          onClick={() => navigate('/explore')}
                        >
                          Explore Career Paths
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                onClick={() => {
                  if (currentStep === 3) {
                    generateIdentityStatement();
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                disabled={
                  (currentStep === 1 && (!formData.currentRole || !formData.yearsExperience || !formData.education)) ||
                  (currentStep === 2 && formData.selectedSkills.length < 3) ||
                  (currentStep === 3 && (!formData.interests || !formData.careerGoals))
                }
              >
                {currentStep === 3 ? 'Generate Statement' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdentityBuilder;