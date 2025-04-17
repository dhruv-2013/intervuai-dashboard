import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CareerDashboard = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [responseDetails, setResponseDetails] = useState(null);
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  
  const dashboardRef = useRef(null);

  // Function to load evaluation data from file
  const loadEvaluationData = async () => {
    try {
      // Get data file from URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const dataFile = urlParams.get('data');
      
      if (!dataFile) {
        // If no file specified, use demo data
        return simulateDemoData();
      }
      
      // Load data from file
      const response = await fetch(dataFile);
      if (!response.ok) {
        throw new Error('Failed to load evaluation data');
      }
      
      const data = await response.json();
      processEvaluationData(data);
    } catch (error) {
      console.error('Error loading evaluation data:', error);
      // Fall back to demo data
      simulateDemoData();
    }
  };
  
  const processEvaluationData = (data) => {
    // Process the loaded evaluation data
    const processedData = {
      // Career interests derived from skills demonstrated across responses
      interests: data.skill_assessment.demonstrated_skills.slice(0, 6).map(skill => ({
        name: skill.name,
        score: Math.min(95, 60 + (skill.count * 8)) // Convert frequency to a score
      })),
      
      // Skills from the skill assessment
      skills: data.skill_assessment.assessed_levels,
      
      // Career paths from the career insights
      careerPaths: data.career_insights.careerPaths,
      
      // Work environment preferences
      workEnvironment: data.career_insights.workEnvironment,
      
      // Development recommendations
      development: data.career_insights.development,
      
      // Timestamp
      timestamp: new Date(data.timestamp).toLocaleDateString(),
      
      // Store all response details for viewing
      responses: data.responses
    };
    
    setProfileData(processedData);
    setLoading(false);
  };

  // Function to generate and download PDF
  const generatePDF = async () => {
    if (!dashboardRef.current) return;
    
    setPdfGenerating(true);
    
    try {
      // Save current section to restore later
      const currentSection = activeSection;
      
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      let pdfHeight = 0;
      
      // Array of sections to include in PDF
      const sectionsToInclude = ['overview', 'skills', 'paths', 'responses', 'development'];
      
      // For each section, capture and add to PDF
      for (let i = 0; i < sectionsToInclude.length; i++) {
        const section = sectionsToInclude[i];
        
        // Set section and wait for render
        setActiveSection(section);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Capture the dashboard content
        const canvas = await html2canvas(dashboardRef.current, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          allowTaint: true
        });
        
        // Convert to image
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Add new page for sections after the first
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate dimensions to fit on page
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add image to PDF
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      }
      
      // Save PDF
      pdf.save(`Career_Profile_${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Restore original section
      setActiveSection(currentSection);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  // Simulate API call or load data
  useEffect(() => {
    // Load evaluation data
    loadEvaluationData();
  }, []);

  // Function to view details of a specific interview response
  const viewResponseDetails = (index) => {
    setSelectedResponseIndex(index);
    setResponseDetails(profileData.responses[index]);
  };

  // Function to close response details
  const closeResponseDetails = () => {
    setSelectedResponseIndex(null);
    setResponseDetails(null);
  };

  // Simulation for demo data if no real data available
  const simulateDemoData = () => {
    // This is similar to your original demo data generation
    const demoData = {
      interests: [
        { name: 'Data Analysis', score: 92 },
        { name: 'Problem Solving', score: 88 },
        { name: 'Communication', score: 82 },
        { name: 'Technical Design', score: 77 },
        { name: 'Leadership', score: 72 },
        { name: 'Project Management', score: 68 }
      ],
      skills: [
        { name: 'Data Analysis', current: 88, desired: 95 },
        { name: 'Communication', current: 82, desired: 90 },
        { name: 'Problem Solving', current: 80, desired: 88 },
        { name: 'Technical Knowledge', current: 75, desired: 85 },
        { name: 'Leadership', current: 65, desired: 80 },
        { name: 'Project Management', current: 62, desired: 78 }
      ],
      careerPaths: [
        { 
          name: 'Data Analyst → Senior Analyst → Analytics Manager', 
          compatibility: 92,
          description: 'This path leverages your strong analytical skills with increasing leadership responsibility.',
          keySkills: ['SQL', 'Data Visualization', 'Statistical Analysis', 'Business Acumen']
        },
        { 
          name: 'Data Scientist → ML Engineer → AI Specialist', 
          compatibility: 78,
          description: 'This technical path requires deeper focus on machine learning and algorithm development.',
          keySkills: ['Python', 'Machine Learning', 'Deep Learning', 'Algorithm Design']
        }
      ],
      workEnvironment: [
        { name: 'Collaborative', value: 72 },
        { name: 'Autonomous', value: 85 },
        { name: 'Fast-paced', value: 78 },
        { name: 'Structured', value: 65 },
        { name: 'Creative', value: 70 },
        { name: 'Data-driven', value: 90 }
      ],
      development: [
        {
          area: 'Technical Skills',
          recommendation: 'Deepen machine learning knowledge through applied projects',
          resources: [
            'Stanford Machine Learning Course',
            'Kaggle Competitions',
            'Applied ML Project Portfolio'
          ]
        },
        {
          area: 'Leadership',
          recommendation: 'Build team leadership and management capabilities',
          resources: [
            'Mentor junior analysts',
            'Lead cross-functional projects',
            'Management training courses'
          ]
        },
        {
          area: 'Communication',
          recommendation: 'Enhance data storytelling and executive presentation skills',
          resources: [
            'Data Visualization Workshops',
            'Executive Communication Course',
            'Storytelling with Data Book'
          ]
        }
      ],
      timestamp: new Date().toLocaleDateString(),
      responses: [
        {
          question: "Explain the difference between supervised and unsupervised learning.",
          answer: "Supervised learning uses labeled data where the model learns from input-output pairs, like classification or regression. Unsupervised learning finds patterns in unlabeled data without predefined outputs, like clustering or dimensionality reduction.",
          job_field: "Data Science",
          scores: {
            content: 8,
            clarity: 9,
            technical_accuracy: 9,
            confidence: 7,
            overall: 8
          },
          feedback: {
            strengths: ["Clear distinction between concepts", "Good technical accuracy", "Concise explanation"],
            areas_for_improvement: ["Could provide examples of algorithms", "Deeper dive into applications"]
          },
          skills_demonstrated: ["Technical Knowledge", "Communication", "Machine Learning"]
        },
        {
          question: "How do you handle missing data in a dataset?",
          answer: "I approach missing data by first understanding why it's missing. Is it random or systematic? Then I decide whether to remove rows, impute values with mean/median/mode, or use more advanced methods like KNN or regression. The approach depends on the data type and analysis goals.",
          job_field: "Data Science",
          scores: {
            content: 9,
            clarity: 8,
            technical_accuracy: 9,
            confidence: 8,
            overall: 9
          },
          feedback: {
            strengths: ["Comprehensive approach", "Demonstrates critical thinking", "Considers context"],
            areas_for_improvement: ["Could mention dealing with outliers"]
          },
          skills_demonstrated: ["Data Cleaning", "Critical Thinking", "Problem Solving"]
        }
      ]
    };
    
    setProfileData(demoData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Analyzing your career profile...</p>
          <p className="text-gray-500">Identifying strengths, interests, and opportunities</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return <div className="text-center text-red-500">Error generating career profile. Please try again.</div>;
  }

  // Colors for charts
  const COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#0d9488', '#059669'];
  
  // Render interview response details modal
  const renderResponseDetails = () => {
    if (!responseDetails) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold text-indigo-800">Interview Response Analysis</h3>
            <button 
              onClick={closeResponseDetails}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-1">Question:</h4>
              <p className="text-lg text-indigo-900 font-medium">{responseDetails.question}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-1">Your Answer:</h4>
              <p className="text-gray-800 bg-gray-50 p-3 rounded">{responseDetails.answer}</p>
            </div>
            
            {responseDetails.scores && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Performance Scores:</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(responseDetails.scores).map(([key, value]) => (
                    <div key={key} className="bg-indigo-50 p-3 rounded text-center">
                      <div className="font-medium text-indigo-800 capitalize">{key.replace('_', ' ')}</div>
                      <div className="text-2xl font-bold text-indigo-600">{value}/10</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {responseDetails.feedback && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {responseDetails.feedback.strengths && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {responseDetails.feedback.strengths.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {responseDetails.feedback.areas_for_improvement && (
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-medium text-amber-800 mb-2">Areas for Improvement</h4>
                    <ul className="space-y-1">
                      {responseDetails.feedback.areas_for_improvement.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-amber-500 mr-2">→</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {responseDetails.skills_demonstrated && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Skills Demonstrated:</h4>
                <div className="flex flex-wrap gap-2">
                  {responseDetails.skills_demonstrated.map((skill, i) => (
                    <span key={i} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {responseDetails.improved_answer && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Example Improved Answer:</h4>
                <p className="text-gray-800 bg-blue-50 p-3 rounded border border-blue-100">
                  {responseDetails.improved_answer}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg" ref={dashboardRef}>
      {/* Interview Response Details Modal */}
      {renderResponseDetails()}
      
      {/* Header Section with Download Button */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex justify-between items-center flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-indigo-800">Career Aptitude Profile</h1>
            <p className="text-gray-600">Analysis based on your interview responses - {profileData.timestamp}</p>
          </div>
          
          {/* Download PDF Button */}
          <button
            onClick={generatePDF}
            disabled={pdfGenerating}
            className={`flex items-center bg-indigo-700 hover:bg-indigo-800 text-white py-2 px-4 rounded-lg shadow transition-colors ${pdfGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {pdfGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download PDF Report
              </>
            )}
          </button>
        </div>
        
        {/* Nav Tabs */}
        <div className="flex space-x-2 mt-4 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === 'overview' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection('skills')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === 'skills' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Skills Gap
          </button>
          <button
            onClick={() => setActiveSection('paths')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === 'paths' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Career Paths
          </button>
          <button
            onClick={() => setActiveSection('responses')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === 'responses' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Responses
          </button>
          <button
            onClick={() => setActiveSection('development')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === 'development' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Development
          </button>
        </div>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Career Interests Chart */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">Career Interest Alignment</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={profileData.interests.sort((a, b) => b.score - a.score)}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={180}
                    tick={{ fontSize: 14 }}
                  />
                  <Tooltip formatter={(value) => [`${value}% Match`, 'Alignment']} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {profileData.interests.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Based on your responses, we've identified your strongest career interest alignments.
              {profileData.interests[0] && 
                `${profileData.interests[0].name} shows the highest match at ${profileData.interests[0].score}%.`}
            </p>
          </div>

          {/* Work Environment Preferences */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">Work Environment Preferences</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={profileData.workEnvironment.sort((a, b) => b.value - a.value)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {profileData.workEnvironment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Preference Strength']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Your responses indicate a preference for environments that align with your working style,
              particularly {profileData.workEnvironment[0]?.name.toLowerCase()} and 
              {profileData.workEnvironment[1]?.name.toLowerCase()} settings.
            </p>
          </div>

          {/* Top Career Path */}
          <div className="md:col-span-2 bg-indigo-50 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">Highest Career Path Match</h2>
            {profileData.careerPaths[0] && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-indigo-700">{profileData.careerPaths[0].name}</h3>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {profileData.careerPaths[0].compatibility}% Match
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{profileData.careerPaths[0].description}</p>
                <div className="mt-2 flex flex-col items-center text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Key Skills Required:</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.careerPaths[0].keySkills.map((skill, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills Gap Section */}
      {activeSection === 'skills' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">Skills Assessment</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={profileData.skills}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" name="Current Proficiency" fill="#4f46e5" />
                  <Bar dataKey="desired" name="Target Proficiency" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-medium text-indigo-800 mb-2">Strongest Skills</h3>
                <ul className="space-y-2">
                  {profileData.skills
                    .sort((a, b) => b.current - a.current)
                    .slice(0, 3)
                    .map((skill, index) => (
                      <li key={index}>
                        <div className="flex justify-between">
                          <span className="text-gray-700">{skill.name}</span>
                          <span className="font-medium text-indigo-700">{skill.current}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${skill.current}%` }}
                          ></div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="font-medium text-amber-800 mb-2">Largest Skill Gaps</h3>
                <ul className="space-y-2">
                  {profileData.skills
                    .sort((a, b) => (b.desired - b.current) - (a.desired - a.current))
                    .slice(0, 3)
                    .map((skill, index) => (
                      <li key={index}>
                        <div className="flex justify-between">
                          <span className="text-gray-700">{skill.name}</span>
                          <span className="font-medium text-amber-700">
                            {skill.desired - skill.current}% gap
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-amber-500 h-2 rounded-full" 
                            style={{ width: `${skill.desired - skill.current}%` }}
                          ></div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Career Paths Section */}
      {activeSection === 'paths' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">Career Path Compatibility</h2>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={profileData.careerPaths}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={false} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}% Match`, 'Compatibility']} />
                  <Bar dataKey="compatibility" radius={[4, 4, 0, 0]}>
                    {profileData.careerPaths.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              {profileData.careerPaths.map((path, index) => {
                // Define color schemes for different career paths
                const colorSchemes = [
                  { bg: "bg-indigo-50", badge: "bg-indigo-100 text-indigo-800", text: "text-indigo-700", pill: "bg-indigo-100 text-indigo-800" },
                  { bg: "bg-blue-50", badge: "bg-blue-100 text-blue-800", text: "text-blue-700", pill: "bg-blue-100 text-blue-800" },
                  { bg: "bg-sky-50", badge: "bg-sky-100 text-sky-800", text: "text-sky-700", pill: "bg-sky-100 text-sky-800" },
                  { bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-800", text: "text-emerald-700", pill: "bg-emerald-100 text-emerald-800" }
                ];
                
                const colors = colorSchemes[index % colorSchemes.length];
                
                return (
                  <div key={index} className={`${colors.bg} p-4 rounded-lg shadow-sm border border-gray-100`}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className={`text-lg font-medium ${colors.text}`}>
                        {path.name}
                      </h3>
                      <span className={`${colors.badge} px-3 py-1 rounded-full text-sm font-medium`}>
                        {path.compatibility}% Match
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{path.description}</p>
                    <div className="mt-2 flex flex-col items-center text-center">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Key Skills Required:</h4>
                      <div className="flex flex-wrap gap-2">
                        {path.keySkills.map((skill, skillIndex) => (
                          <span key={skillIndex} className={`${colors.pill} px-3 py-1 rounded-full text-sm`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Interview Responses Section - New */}
      {activeSection === 'responses' && profileData.responses && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">Interview Response Analysis</h2>
            
            <div className="space-y-4">
              {profileData.responses.map((response, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-indigo-700 mb-2">
                        Q: {response.question}
                      </h3>
                      <p className="text-gray-700 mb-3 line-clamp-2">{response.answer}</p>
                    </div>
                    
                    {response.scores && response.scores.overall && (
                      <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                        Score: {response.scores.overall}/10
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {response.skills_demonstrated && response.skills_demonstrated.map((skill, skillIndex) => (
                      <span key={skillIndex} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => viewResponseDetails(index)}
                    className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                  >
                    View detailed analysis
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Response Performance Radar Chart */}
          {profileData.responses && profileData.responses.length > 0 && profileData.responses.some(r => r.scores) && (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <h2 className="text-xl font-semibold text-indigo-800 mb-4">Response Performance Overview</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={150} data={
                    Object.entries(profileData.responses.reduce((acc, response) => {
                      if (response.scores) {
                        Object.entries(response.scores).forEach(([key, value]) => {
                          if (key !== 'overall') {
                            if (!acc[key]) acc[key] = [];
                            acc[key].push(value);
                          }
                        });
                      }
                      return acc;
                    }, {})).map(([key, values]) => ({
                      subject: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
                      average: Math.round(values.reduce((sum, val) => sum + val, 0) / values.length * 10) / 10
                    }))
                  }>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 10]} />
                    <Radar name="Performance" dataKey="average" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                This radar chart shows your average performance across different evaluation dimensions.
                Areas where the blue shape extends outward represent your strengths.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Development Section */}
      {activeSection === 'development' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">Development Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profileData.development.map((item, index) => (
                <div key={index} className="bg-indigo-50 p-5 rounded-lg shadow-sm">
                  <div className="mb-3">
                    <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {item.area}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-indigo-700 mb-3">{item.recommendation}</h3>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Resources:</h4>
                    <ul className="space-y-2">
                      {item.resources.map((resource, rIndex) => (
                        <li key={rIndex} className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-200 text-indigo-800 mr-2 flex-shrink-0 text-xs">→</span>
                          <span className="text-gray-700">{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg shadow border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Long-term Development Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium text-indigo-700 mb-2">3-6 Month Focus</h3>
                <p className="text-gray-700 mb-3">
                  Focus on closing your highest priority skill gaps. Seek out projects that allow you to practice these skills in real-world scenarios.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData.skills
                    .sort((a, b) => (b.desired - b.current) - (a.desired - a.current))
                    .slice(0, 3)
                    .map((skill, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                        {skill.name}
                      </span>
                    ))}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium text-indigo-700 mb-2">1-2 Year Horizon</h3>
                <p className="text-gray-700 mb-3">
                  Position yourself for career advancement by developing a comprehensive portfolio of projects 
                  and taking on increasingly complex responsibilities aligned with your career path.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">Portfolio Building</span>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">Leadership Development</span>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">Industry Certification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-2">About This Assessment</h3>
        <p className="text-gray-600">
          This career aptitude profile is generated based on AI analysis of your interview responses. 
          The assessment identifies patterns in your language that reveal career interests, skills, and work preferences. 
          Use these insights to guide your career development and job search strategy. This analysis should be considered 
          alongside your own self-reflection and other career assessment tools.
        </p>
      </div>
    </div>
  );
};

export default CareerDashboard;