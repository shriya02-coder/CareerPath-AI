import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  TrendingUp, 
  DollarSign, 
  Users, 
  GraduationCap,
  Building,
  MapPin,
  Clock,
  CheckCircle,
  Loader
} from 'lucide-react';
import { careersAPI } from '../services/api';
import { toast } from 'sonner';

const CareerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [career, setCareer] = useState(null);
  const [relatedCareers, setRelatedCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCareerDetail();
  }, [id]);

  const loadCareerDetail = async () => {
    try {
      setLoading(true);
      const response = await careersAPI.getCareerById(id);
      
      if (response.success) {
        setCareer(response.career);
        // Load related careers if available
        if (response.career.relatedCareers && response.career.relatedCareers.length > 0) {
          loadRelatedCareers(response.career.relatedCareers);
        } else {
          // If no specific related careers, get some from the same category
          loadSimilarCareers(response.career.category);
        }
        setError('');
      } else {
        setError('Career not found');
      }
    } catch (error) {
      console.error('Error loading career detail:', error);
      setError('Failed to load career details. Please try again.');
      toast.error('Failed to load career details');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedCareers = async (careerIds) => {
    try {
      const relatedData = await Promise.all(
        careerIds.slice(0, 3).map(async (careerId) => {
          const response = await careersAPI.getCareerById(careerId);
          return response.success ? response.career : null;
        })
      );
      setRelatedCareers(relatedData.filter(Boolean));
    } catch (error) {
      console.error('Error loading related careers:', error);
    }
  };

  const loadSimilarCareers = async (category) => {
    try {
      const response = await careersAPI.getCareers('', category, 4);
      if (response.success) {
        // Filter out the current career and take up to 3 similar ones
        const similar = response.careers.filter(c => c.id !== id).slice(0, 3);
        setRelatedCareers(similar);
      }
    } catch (error) {
      console.error('Error loading similar careers:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading career details...</p>
        </div>
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Career not found'}
          </h2>
          <Button onClick={() => navigate('/explore')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explorer
          </Button>
        </div>
      </div>
    );
  }

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
          <div className="text-xl font-semibold text-gray-800">Career Details</div>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            onClick={() => navigate('/resume')}
          >
            Get Resume Help
          </Button>
        </div>
      </header>

      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Career Hero */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="bg-white/20 text-white mb-4">
                  {career.category}
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                  {career.title}
                </h1>
                <p className="text-xl opacity-90 mb-6">
                  {career.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    <span>{career.growthRate} growth</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span>{career.averageSalary}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{career.jobPostings.toLocaleString()} jobs</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-4">Career Match Score</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Skills Alignment</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2 bg-white/20" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Growth Potential</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2 bg-white/20" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Market Demand</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2 bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Skills Required */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
                    Skills & Qualifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {career.skills.map(skill => (
                          <Badge key={skill} variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Education Requirements</h4>
                      <div className="flex items-center text-gray-700">
                        <GraduationCap className="h-4 w-4 mr-2 text-purple-600" />
                        {career.education}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Career Path */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                    Career Progression
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Entry Level</h4>
                        <p className="text-gray-600 text-sm">Junior {career.title} • $45,000 - $65,000</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Mid Level</h4>
                        <p className="text-gray-600 text-sm">{career.title} • {career.averageSalary}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Senior Level</h4>
                        <p className="text-gray-600 text-sm">Senior {career.title} • $120,000 - $180,000</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Companies */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-purple-600" />
                    Top Hiring Companies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {career.companies.map(company => (
                      <div key={company} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                          {company[0]}
                        </div>
                        <span className="font-medium text-gray-900">{company}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Growth Rate</span>
                    <span className="font-semibold text-green-600">{career.growthRate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Job Openings</span>
                    <span className="font-semibold">{career.jobPostings.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Salary Range</span>
                    <span className="font-semibold">{career.averageSalary}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Take Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    onClick={() => navigate('/resume')}
                  >
                    Optimize Resume
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                    onClick={() => navigate('/identity')}
                  >
                    Build Identity Statement
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    Find Job Openings
                  </Button>
                </CardContent>
              </Card>

              {/* Related Careers */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Similar Careers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedCareers.map(relatedCareer => (
                    <div 
                      key={relatedCareer.id}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                      onClick={() => navigate(`/career/${relatedCareer.id}`)}
                    >
                      <h4 className="font-medium text-gray-900">{relatedCareer.title}</h4>
                      <p className="text-sm text-gray-600">{relatedCareer.category}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDetail;