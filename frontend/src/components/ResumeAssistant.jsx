import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  Copy, 
  Download,
  Lightbulb,
  Target,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { resumeAPI } from '../services/api';

const ResumeAssistant = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resume');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    jobDescription: '',
    currentResume: '', // backward compatibility if needed
    jobs: [
      { company: '', role: '', period: '', bullets: [''] }
    ],
  });
  const [generatedContent, setGeneratedContent] = useState({
    resume: '',
    coverLetter: '',
    suggestions: [],
    bulletEdits: []
  });
  const [error, setError] = useState('');

  const addJob = () => {
    setFormData(prev => ({
      ...prev,
      jobs: [...prev.jobs, { company: '', role: '', period: '', bullets: [''] }]
    }));
  };

  const updateJobField = (idx, field, value) => {
    setFormData(prev => {
      const jobs = [...prev.jobs];
      jobs[idx] = { ...jobs[idx], [field]: value };
      return { ...prev, jobs };
    });
  };

  const updateBullet = (idx, bIdx, value) => {
    setFormData(prev => {
      const jobs = [...prev.jobs];
      const bullets = [...jobs[idx].bullets];
      bullets[bIdx] = value;
      jobs[idx] = { ...jobs[idx], bullets };
      return { ...prev, jobs };
    });
  };

  const addBullet = (idx) => {
    setFormData(prev => {
      const jobs = [...prev.jobs];
      const bullets = [...jobs[idx].bullets, ''];
      jobs[idx] = { ...jobs[idx], bullets };
      return { ...prev, jobs };
    });
  };

  const handleGenerate = async (type) => {
    setIsGenerating(true);
    setError('');
    
    try {
      if (type === 'resume') {
        const response = await resumeAPI.optimizeResume({
          jobTitle: formData.jobTitle,
          company: formData.company,
          jobDescription: formData.jobDescription,
          currentResume: formData.currentResume
        });

        if (response.success) {
          setGeneratedContent(prev => ({
            ...prev,
            resume: response.optimizedContent,
            suggestions: response.suggestions || [],
            bulletEdits: response.bulletEdits || []
          }));
          toast.success('Resume optimization completed!');
        } else {
          setError(response.message || 'Failed to optimize resume');
          toast.error('Failed to optimize resume');
        }
      } else if (type === 'coverLetter') {
        const response = await resumeAPI.generateCoverLetter({
          jobTitle: formData.jobTitle,
          company: formData.company,
          jobDescription: formData.jobDescription,
          userProfile: null
        });

        if (response.success) {
          setGeneratedContent(prev => ({
            ...prev,
            coverLetter: response.coverLetter
          }));
          toast.success('Cover letter generated successfully!');
        } else {
          setError(response.message || 'Failed to generate cover letter');
          toast.error('Failed to generate cover letter');
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error generating ${type}:`, error);
      setError('Unable to connect to AI service. Please try again.');
      toast.error(`Unable to generate ${type}. Please check your connection.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  const suggestions = [
    {
      type: 'improvement',
      title: 'Quantify Your Achievements',
      description: 'Add specific numbers, percentages, or metrics to demonstrate your impact.',
      example: 'Instead of "Improved sales" try "Increased sales by 25% over 6 months"'
    },
    {
      type: 'keyword',
      title: 'Optimize for ATS',
      description: 'Include relevant keywords from the job description to pass applicant tracking systems.',
      example: 'Use exact terms from the job posting like "project management" instead of "managing projects"'
    },
    {
      type: 'action',
      title: 'Strengthen Action Verbs',
      description: 'Start bullet points with powerful action verbs to show leadership and initiative.',
      example: 'Use "Spearheaded," "Orchestrated," "Implemented" instead of "Responsible for"'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="px-6 py-4 border-b border-purple-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/explore')}
            className="text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explorer
          </Button>
          <div className="text-xl font-semibold text-gray-800">Resume &amp; Cover Letter Assistant</div>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            onClick={() => navigate('/identity')}
          >
            Build Identity
          </Button>
        </div>
      </header>

      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Perfect Your
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}Application Materials
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Paste your resume bullet points below. Our AI will tailor improvements and tips directly on your points for the target job.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Paste Section ONLY */}
            <Card className="lg:col-span-1 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Jobs & Resume Bullets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.jobs.map((job, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-purple-100 bg-white/70 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input placeholder="Company" value={job.company} onChange={(e) => updateJobField(idx, 'company', e.target.value)} />
                      <Input placeholder="Role / Title" value={job.role} onChange={(e) => updateJobField(idx, 'role', e.target.value)} />
                      <Input placeholder="Period (e.g., 2022–Present)" value={job.period || ''} onChange={(e) => updateJobField(idx, 'period', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      {job.bullets.map((b, bIdx) => (
                        <Input key={bIdx} placeholder={`Bullet ${bIdx + 1}`} value={b} onChange={(e) => updateBullet(idx, bIdx, e.target.value)} />
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addBullet(idx)} className="border-purple-200 text-purple-600">
                        <Plus className="h-4 w-4 mr-1" /> Add Bullet
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addJob} className="border-purple-200 text-purple-600">
                  <Plus className="h-4 w-4 mr-2" /> Add Job
                </Button>
              </CardContent>
            </Card>

            {/* Job Information */}
            <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  Target Job Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Target Job Title</label>
                  <Input
                    placeholder="e.g., Senior UX Designer"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Company Name</label>
                  <Input
                    placeholder="e.g., Google, Microsoft, etc."
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Job Description</label>
                  <Textarea
                    placeholder="Paste the job description here to get tailored suggestions..."
                    value={formData.jobDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[120px]"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Tip:</strong> Paste concise bullets. The AI will rewrite each line with quantified, role-aligned impact and keyword suggestions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Generated Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
                  <TabsTrigger value="resume" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    Resume Optimization
                  </TabsTrigger>
                  <TabsTrigger value="cover-letter" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    Cover Letter
                  </TabsTrigger>
                  <TabsTrigger value="tips" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    Pro Tips
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="resume">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-purple-600" />
                        Resume Optimization
                      </CardTitle>
                      <Button
                        onClick={() => handleGenerate('resume')}
                        disabled={!formData.jobTitle || isGenerating}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Optimize Resume
                          </>
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {generatedContent.resume ? (
                        <div className="space-y-8">
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                              {generatedContent.resume}
                            </pre>
                          </div>

                          {generatedContent.bulletEdits && generatedContent.bulletEdits.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Per‑bullet improvements</h4>
                              <div className="space-y-3">
                                {generatedContent.bulletEdits.map((b, idx) => (
                                  <div key={idx} className="p-4 rounded-lg border border-purple-100 bg-white/70">
                                    <div className="text-xs text-gray-500 mb-1">Original</div>
                                    <div className="text-sm text-gray-700 mb-2">{b.original}</div>
                                    <div className="text-xs text-gray-500 mb-1">Improved</div>
                                    <div className="text-sm text-gray-900 mb-2">{b.improved}</div>
                                    {b.rationale && (
                                      <div className="text-xs text-gray-600 mb-1">Why: {b.rationale}</div>
                                    )}
                                    {Array.isArray(b.keywords) && b.keywords.length > 0 && (
                                      <div className="text-xs text-gray-600">Keywords: {b.keywords.join(', ')}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(generatedContent.resume)}
                              className="border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            Paste your bullets and job info, then click "Optimize Resume" to get line‑by‑line improvements.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="cover-letter">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-purple-600" />
                        Cover Letter Generator
                      </CardTitle>
                      <Button
                        onClick={() => handleGenerate('coverLetter')}
                        disabled={!formData.jobTitle || !formData.company || isGenerating}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Letter
                          </>
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {generatedContent.coverLetter ? (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                              {generatedContent.coverLetter}
                            </pre>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(generatedContent.coverLetter)}
                              className="border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            Fill in the job title and company name to generate a personalized cover letter.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tips">
                  <div className="space-y-6">
                    {[{
                      type: 'improvement',
                      title: 'Quantify Your Achievements',
                      description: 'Add specific numbers, percentages, or metrics to demonstrate your impact.',
                      example: 'Instead of "Improved sales" try "Increased sales by 25% over 6 months"'
                    },{
                      type: 'keyword',
                      title: 'Optimize for ATS',
                      description: 'Include relevant keywords from the job description to pass applicant tracking systems.',
                      example: 'Use exact terms from the job posting like "project management" instead of "managing projects"'
                    },{
                      type: 'action',
                      title: 'Strengthen Action Verbs',
                      description: 'Start bullet points with powerful action verbs to show leadership and initiative.',
                      example: 'Use "Spearheaded," "Orchestrated," "Implemented" instead of "Responsible for"'
                    }].map((suggestion, index) => (
                      <div key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <Lightbulb className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {suggestion.title}
                            </h3>
                            <p className="text-gray-600 mb-3">
                              {suggestion.description}
                            </p>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                              <p className="text-sm text-gray-700">
                                <strong>Example:</strong> {suggestion.example}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to land your dream job?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Combine your optimized resume with a strong Career Identity Statement 
              to create a compelling professional narrative.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4"
                onClick={() => navigate('/identity')}
              >
                Build Your Identity
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-4"
                onClick={() => navigate('/explore')}
              >
                Explore More Careers
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAssistant;