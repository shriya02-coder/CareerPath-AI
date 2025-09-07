import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight, Play, Rocket, Target, TrendingUp } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="px-6 py-4 border-b border-purple-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">
              <span className="text-gray-800">CareerPath</span>
              <span className="text-purple-600 ml-1">AI</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">How it works</a>
            <Button 
              variant="outline" 
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
              onClick={() => navigate('/resume')}
            >
              Resume Help
            </Button>
            <Button 
              variant="outline" 
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
              onClick={() => navigate('/explore')}
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Explore your
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {" "}career possibilities
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Career paths aren't always straightforward, but your unique life experiences are a superpower. 
                They're full of valuable skills that employers need. CareerPath AI helps you uncover those skills 
                and explore new career possibilities in a simple, intelligent way.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
                onClick={() => navigate('/identity')}
              >
                Get started now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg"
                onClick={() => navigate('/explore')}
              >
                Explore Careers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-8">
              <div className="aspect-video bg-white rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                    <Target className="text-white h-6 w-6" />
                  </div>
                  <p className="text-gray-600">AI-Powered Career Guidance</p>
                  <p className="text-sm text-gray-500">Discover your perfect career match</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-xl text-gray-600">Three simple steps to discover your career potential</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                <Target className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Shape your professional story</h3>
              <p className="text-gray-600">
                Draft a Career Identity Statement that showcases the unique skills and experiences you bring to the workforce, 
                and add it to your resume or professional profile.
              </p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Explore career possibilities</h3>
              <p className="text-gray-600">
                Uncover a variety of careers that might align with your unique background, delve deeper into those that interest you, 
                and find relevant opportunities near you.
              </p>
            </div>
            
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                <Rocket className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Take the next step</h3>
              <p className="text-gray-600">
                Collaborate with AI to craft compelling cover letters, refine your resume, 
                and take the first steps toward your career goals.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
              onClick={() => navigate('/identity')}
            >
              Start exploring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Room to explore</h2>
            <p className="text-xl text-gray-600">Explore your options with confidence. CareerPath AI helps you reflect, explore, and uncover new possibilities.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Rocket className="text-purple-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No prep work needed</h3>
              <p className="text-gray-600">
                CareerPath AI does the hard work for you. With just a few basic facts, 
                it can help you shape your professional story.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="text-purple-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalized insights</h3>
              <p className="text-gray-600">
                CareerPath AI reveals your transferable skills and potential for growth to help you 
                confidently imagine where you could go next.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="text-purple-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Data-driven, AI-enhanced</h3>
              <p className="text-gray-600">
                CareerPath AI is grounded in job market data, empowering you to make the best choices for your career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold mb-4">
            <span>CareerPath</span>
            <span className="text-purple-400 ml-1">AI</span>
          </div>
          <p className="text-gray-400 mb-8">Discover your dream career with AI-powered insights</p>
          <div className="flex justify-center space-x-8">
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;