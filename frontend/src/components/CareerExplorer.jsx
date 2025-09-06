import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Search, Filter, TrendingUp, DollarSign, Users, ArrowRight, Loader } from 'lucide-react';
import { careersAPI } from '../services/api';
import { toast } from 'sonner';

const CareerExplorer = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('growth');
  const [careers, setCareers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load careers and categories on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load careers when search/filter changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadCareers();
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedCategory]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [careersResponse, categoriesResponse] = await Promise.all([
        careersAPI.getCareers('', '', 50),
        careersAPI.getCareerCategories()
      ]);

      if (careersResponse.success) {
        setCareers(careersResponse.careers);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.categories);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load career data. Please refresh the page.');
      toast.error('Failed to load career data');
    } finally {
      setLoading(false);
    }
  };

  const loadCareers = async () => {
    try {
      const response = await careersAPI.getCareers(searchTerm, selectedCategory, 50);
      if (response.success) {
        setCareers(response.careers);
        setError('');
      } else {
        setError('Failed to load careers');
      }
    } catch (error) {
      console.error('Error loading careers:', error);
      setError('Failed to load careers. Please try again.');
    }
  };

  const filteredCareers = useMemo(() => {
    let filtered = [...careers];

    // Sort careers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'growth':
          return parseInt(b.growthRate) - parseInt(a.growthRate);
        case 'salary':
          return parseInt(b.averageSalary.split(' - ')[1].replace(/[^0-9]/g, '')) - 
                 parseInt(a.averageSalary.split(' - ')[1].replace(/[^0-9]/g, ''));
        case 'demand':
          return b.jobPostings - a.jobPostings;
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [careers, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading career data...</p>
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
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="text-xl font-semibold text-gray-800">Career Explorer</div>
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
              Discover Your
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}Perfect Career Match
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore careers that align with your skills, interests, and goals. Use AI-powered insights 
              to discover opportunities you might never have considered.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadInitialData}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search careers, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-md focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-md focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="growth">Growth Rate</option>
                <option value="salary">Salary</option>
                <option value="demand">Job Demand</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-8">
            <p className="text-gray-600">
              Showing {filteredCareers.length} career{filteredCareers.length !== 1 ? 's' : ''} 
              {selectedCategory && ` in ${selectedCategory}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          {/* Career Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers.map(career => (
              <Card 
                key={career.id} 
                className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
                onClick={() => navigate(`/career/${career.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {career.category}
                    </Badge>
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {career.growthRate.split('%')[0]}%
                    </div>
                  </div>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-purple-600 transition-colors">
                    {career.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {career.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      {career.averageSalary}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      {career.jobPostings.toLocaleString()} open positions
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {career.skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {career.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{career.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/career/${career.id}`);
                    }}
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCareers.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No careers found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to discover more opportunities.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to take the next step?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Build your Career Identity Statement to get personalized recommendations 
              and stand out to employers.
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
                onClick={() => navigate('/resume')}
              >
                Get Resume Help
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default CareerExplorer;