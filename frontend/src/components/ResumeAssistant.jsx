import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  Copy, 
  Download,
  CheckCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { resumeAPI } from '../services/api';
// Import PDF parsing library
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const ResumeAssistant = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resume');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    jobDescription: '',
    currentResume: '',
    careerGoals: '',
    uploadedFile: null
  });
  const [generatedContent, setGeneratedContent] = useState({
    resume: '',
    coverLetter: '',
    suggestions: [],
    extractedResumeText: ''
  });
  const [error, setError] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

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
            suggestions: response.suggestions
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
          userProfile: null // Could be enhanced to include user profile
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

  const handleFileUpload = (file) => {
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, Word document, or text file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setFormData(prev => ({ ...prev, uploadedFile: file }));
    extractTextFromFile(file);
  };

  const extractTextFromFile = async (file) => {
    setIsExtracting(true);
    
    try {
      if (file.type === 'text/plain') {
        const text = await file.text();
        setFormData(prev => ({ ...prev, currentResume: text }));
        toast.success('✅ Text file loaded successfully!');
      } 
      else if (file.type === 'application/pdf') {
        // AUTOMATIC PDF TEXT EXTRACTION
        toast.info('🔄 Extracting text from PDF...');
        
        const arrayBuffer = await file.arrayBuffer();
        
        try {
          const pdfData = await pdfParse(arrayBuffer);
          const extractedText = pdfData.text.trim();
          
          if (extractedText && extractedText.length > 50) {
            setFormData(prev => ({ ...prev, currentResume: extractedText }));
            toast.success('🎉 PDF text extracted successfully! Ready for AI optimization.');
          } else {
            // Fallback for scanned/image PDFs
            setFormData(prev => ({ 
              ...prev, 
              currentResume: `PDF processed: ${file.name}\n\nThis appears to be a scanned PDF or image-based document. Please paste your resume text below for the best AI analysis results.` 
            }));
            toast.warning('⚠️ PDF appears to be scanned/image-based. Please paste your resume text below.');
          }
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          setFormData(prev => ({ 
            ...prev, 
            currentResume: `PDF uploaded: ${file.name}\n\nCouldn't extract text automatically. Please paste your resume content below.` 
          }));
          toast.error('❌ PDF text extraction failed. Please paste your resume text below.');
        }
      } 
      else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        // AUTOMATIC WORD DOCUMENT TEXT EXTRACTION
        toast.info('🔄 Extracting text from Word document...');
        
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          const extractedText = result.value.trim();
          
          if (extractedText && extractedText.length > 50) {
            setFormData(prev => ({ ...prev, currentResume: extractedText }));
            toast.success('🎉 Word document text extracted successfully!');
          } else {
            setFormData(prev => ({ 
              ...prev, 
              currentResume: `Word document processed: ${file.name}\n\nPlease paste your resume content below for AI analysis.` 
            }));
            toast.warning('⚠️ Could not extract text from Word document. Please paste content below.');
          }
        } catch (wordError) {
          console.error('Word extraction error:', wordError);
          setFormData(prev => ({ 
            ...prev, 
            currentResume: `Word document: ${file.name}\n\nPlease paste your resume content below.` 
          }));
          toast.error('❌ Word extraction failed. Please paste your resume text below.');
        }
      } 
      else {
        toast.error('❌ Please upload a PDF, Word document, or text file.');
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('❌ File processing failed. Please paste your resume text below.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
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
          <div className="text-xl font-semibold text-gray-800">Resume & Cover Letter Assistant</div>
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
              Get AI-powered assistance to optimize your resume and craft compelling cover letters 
              that stand out to hiring managers and pass through ATS systems.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* File Upload Section - FIRST */}
            <Card className="lg:col-span-1 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Upload Your Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload Area */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="space-y-2">
                    <FileText className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Drag and drop your resume here, or{' '}
                      <label className="text-purple-600 hover:text-purple-700 cursor-pointer font-medium">
                        browse files
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => handleFileUpload(e.target.files[0])}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports PDF, Word documents, and text files (max 10MB)
                    </p>
                  </div>
                  
                  {formData.uploadedFile && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-purple-700 font-medium">
                          {formData.uploadedFile.name}
                        </span>
                        {isExtracting && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center text-gray-500 text-sm">or</div>
                
                <Textarea
                  placeholder="Paste your resume content here..."
                  value={formData.currentResume}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentResume: e.target.value }))}
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[150px]"
                />
              </CardContent>
            </Card>

            {/* Job Information - SECOND */}
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
                    💡 <strong>Pro Tip:</strong> Upload your resume first, then fill in the job details. 
                    Our AI will analyze your resume against the specific job requirements for better optimization.
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
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                              {generatedContent.resume}
                            </pre>
                          </div>
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
                            Fill in the job information and click "Optimize Resume" to get AI-powered suggestions.
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
                    {suggestions.map((suggestion, index) => (
                      <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
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
                        </CardContent>
                      </Card>
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