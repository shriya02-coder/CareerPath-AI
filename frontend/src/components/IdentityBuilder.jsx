import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, ArrowRight, Sparkles, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { identityAPI } from '../services/api';

// Import static data that doesn't need backend
const skills = [
  "JavaScript", "Python", "React", "Node.js", "SQL", "Machine Learning",
  "Design Thinking", "Project Management", "Data Analysis", "Communication",
  "Leadership", "Problem Solving", "Critical Thinking", "Creativity",
  "Collaboration", "Time Management", "Adaptability", "Customer Service",
  "Marketing", "Sales", "SEO/SEM", "Content Writing", "Social Media",
  "Financial Analysis", "Strategic Planning", "Team Building", "Negotiation",
  "Public Speaking", "Research", "Quality Assurance", "DevOps", "Cloud Computing",
  "Cybersecurity", "UI/UX Design", "Mobile Development", "Database Management",
  "Business Analysis", "Product Management", "Agile/Scrum", "Digital Marketing",
  "Graphic Design", "Video Editing", "Photography", "Copywriting"
];

const popularRoles = [
  "Software Engineer", "Data Scientist", "Product Manager", "UX/UI Designer",
  "Marketing Manager", "Sales Representative", "Business Analyst", "Project Manager",
  "Financial Analyst", "HR Manager", "Operations Manager", "Customer Success Manager",
  "Content Creator", "Graphic Designer", "DevOps Engineer", "Cybersecurity Analyst",
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer",
  "Data Analyst", "Marketing Specialist", "Social Media Manager", "SEO Specialist",
  "Account Manager", "Consultant", "Teacher", "Healthcare Professional",
  "Recent Graduate", "Career Changer", "Freelancer", "Entrepreneur", "Student"
];

const experiences = [
  "Internship", "Entry Level", "1-2 years", "3-5 years", "5-10 years", "10+ years"
];

const educationLevels = [
  "High School", "Associate Degree", "Bachelor's Degree", "Master's Degree", "PhD", "Professional Certification"
];

const IdentityBuilder = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    currentRole: '',
    customRole: '',
    yearsExperience: '',
    education: '',
    selectedSkills: [],
    customSkills: [],
    interests: '',
    achievements: '',
    careerGoals: ''
  });
  const [generatedStatement, setGeneratedStatement] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  };

  const addCustomSkill = () => {
    if (newSkill.trim() && !formData.customSkills.includes(newSkill.trim()) && !formData.selectedSkills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        customSkills: [...prev.customSkills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeCustomSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      customSkills: prev.customSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const getAllSelectedSkills = () => {
    return [...formData.selectedSkills, ...formData.customSkills];
  };

  const getCurrentRole = () => {
    return formData.currentRole === 'Other' ? formData.customRole : formData.currentRole;
  };

  const generateIdentityStatement = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      // Prepare data with defaults for optional fields
      const requestData = {
        currentRole: getCurrentRole(),
        yearsExperience: formData.yearsExperience,
        education: formData.education,
        selectedSkills: getAllSelectedSkills(),
        interests: formData.interests || "Professional development and growth",
        achievements: formData.achievements || "Various professional accomplishments",
        careerGoals: formData.careerGoals || "Career advancement and skill development"
      };

      console.log('🚀 Sending request to AI API:', requestData);
      console.log('🔗 API URL:', 'http://localhost:8001/api/identity/generate');
      
      const response = await identityAPI.generateStatement(requestData);

      console.log('✅ AI Response received:', response);

      if (response.success) {
        setGeneratedStatement(response.statement);
        setCurrentStep(4);
        toast.success('✨ AI-Generated Career Identity Statement created!');
      } else {
        setError(`AI Error: ${response.message}`);
        toast.error(`AI Error: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error generating identity statement:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      
      setError(`Connection Error: ${error.message}. Please check that the backend is running.`);
      toast.error(`Connection Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackStatement = () => {
    const role = getCurrentRole();
    const experience = formData.yearsExperience;
    const skills = getAllSelectedSkills().slice(0, 3).join(', ');
    const education = formData.education;
    
    return `As a ${experience} ${role} with ${education}, I bring valuable expertise in ${skills}. My professional background and commitment to continuous learning position me well for career advancement. I am eager to leverage my skills and experience to contribute meaningfully to innovative teams and challenging projects that align with my professional aspirations.`;
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

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Current Role or Job Title</label>
                    <select 
                      value={formData.currentRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value, customRole: '' }))}
                      className="w-full p-3 border border-gray-200 rounded-md focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="">Select your current role</option>
                      {popularRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                      <option value="Other">Other (specify below)</option>
                    </select>
                    
                    {formData.currentRole === 'Other' && (
                      <Input
                        placeholder="Enter your custom role or job title"
                        value={formData.customRole}
                        onChange={(e) => setFormData(prev => ({ ...prev, customRole: e.target.value }))}
                        className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 mt-2"
                      />
                    )}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
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
                    
                    {/* Custom Skills Section */}
                    <div className="border-t pt-4">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Add custom skills
                      </label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="Add a skill not listed above"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                          className="flex-1 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                        <Button
                          type="button"
                          onClick={addCustomSkill}
                          disabled={!newSkill.trim()}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Add
                        </Button>
                      </div>
                      
                      {/* Display Custom Skills */}
                      {formData.customSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.customSkills.map(skill => (
                            <Badge
                              key={skill}
                              className="bg-blue-100 text-blue-800 border-blue-200 cursor-pointer hover:bg-blue-200"
                              onClick={() => removeCustomSkill(skill)}
                            >
                              {skill} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-2">
                      Selected: {getAllSelectedSkills().length} skills
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                      💡 <strong>These fields are optional!</strong> If you're not sure about your goals or interests, you can skip this step. 
                      CareerPath AI will help you discover them through career exploration.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Areas of Interest <span className="text-gray-400">(Optional)</span>
                    </label>
                    <Textarea
                      placeholder="What topics, industries, or types of work excite you most? (Leave blank if you're not sure)"
                      value={formData.interests}
                      onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[80px]"
                    />
                    <div className="text-xs text-gray-500">
                      Examples: Technology innovation, helping people, creative problem-solving, data analysis, team collaboration
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Career Goals <span className="text-gray-400">(Optional)</span>
                    </label>
                    <Textarea
                      placeholder="What do you hope to achieve in your career? What impact do you want to make? (Leave blank if exploring)"
                      value={formData.careerGoals}
                      onChange={(e) => setFormData(prev => ({ ...prev, careerGoals: e.target.value }))}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[100px]"
                    />
                    <div className="text-xs text-gray-500">
                      Examples: Lead a team, work remotely, make a social impact, start my own business, achieve work-life balance
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Quick Goal Ideas:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        "Advance to a leadership role",
                        "Work at a tech startup",
                        "Make a positive social impact", 
                        "Achieve better work-life balance",
                        "Work remotely or freelance",
                        "Start my own business",
                        "Learn new technologies",
                        "Increase my salary significantly"
                      ].map(goal => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            careerGoals: prev.careerGoals ? `${prev.careerGoals}, ${goal}` : goal 
                          }))}
                          className="text-left p-2 text-sm bg-white border border-gray-200 rounded hover:bg-purple-50 hover:border-purple-300 transition-colors"
                        >
                          + {goal}
                        </button>
                      ))}
                    </div>
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
                  ) : generatedStatement ? (
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
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="text-gray-400 h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate Your Statement</h3>
                      <p className="text-gray-600 mb-4">Click the button below to create your personalized Career Identity Statement</p>
                      <Button
                        onClick={generateIdentityStatement}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Statement
                      </Button>
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
              
              <div className="flex gap-3">
                {currentStep === 3 && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // Clear optional fields and proceed
                      setFormData(prev => ({ ...prev, interests: '', careerGoals: '' }));
                      generateIdentityStatement();
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Skip & Generate
                  </Button>
                )}
                
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
                    (currentStep === 1 && (!getCurrentRole() || !formData.yearsExperience || !formData.education)) ||
                    (currentStep === 2 && getAllSelectedSkills().length < 3)
                    // Step 3 is now optional - no validation needed
                  }
                >
                  {currentStep === 3 ? 'Generate Statement' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdentityBuilder;