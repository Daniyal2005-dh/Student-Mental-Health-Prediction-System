import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Activity, 
  BarChart3, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Sparkles,
  Heart,
  BookOpen,
  Calendar,
  Award,
  Users,
  Compass,
  FileText
} from 'lucide-react';

// List of courses matching generate_data.py
const COURSES = [
  'Engineering', 'CSE', 'BIT', 'BCS', 'Business Administration', 
  'Laws', 'Psychology', 'Education', 'Medicine', 'Art & Design'
];

const CGPA_RANGES = ['0 - 1.99', '2.00 - 2.49', '2.50 - 2.99', '3.00 - 3.49', '3.50 - 4.00'];
const YEARS = ['year 1', 'year 2', 'year 3', 'year 4'];

function App() {
  const [activeTab, setActiveTab] = useState('predict');
  
  // Prediction Form State
  const [surveyInput, setSurveyInput] = useState({
    gender: 'Male',
    age: 20,
    course: 'CSE',
    year_of_study: 'year 1',
    cgpa: '3.00 - 3.49',
    marital_status: 'No'
  });
  
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState(null);
  
  // EDA Analytics State
  const [edaData, setEdaData] = useState(null);
  const [edaLoading, setEdaLoading] = useState(false);
  const [edaError, setEdaError] = useState(null);
  
  // Model Metrics State
  const [metricsData, setMetricsData] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('RandomForest');

  // Load initial data on mount
  useEffect(() => {
    fetchEda();
    fetchMetrics();
  }, []);

  const fetchEda = async () => {
    setEdaLoading(true);
    setEdaError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/eda');
      if (!response.ok) throw new Error('Failed to fetch EDA data.');
      const data = await response.json();
      setEdaData(data);
    } catch (err) {
      setEdaError(err.message || 'Error loading survey statistics.');
    } finally {
      setEdaLoading(false);
    }
  };

  const fetchMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics.');
      const data = await response.json();
      setMetricsData(data);
    } catch (err) {
      setMetricsError(err.message || 'Error loading model metrics.');
    } finally {
      setMetricsLoading(false);
    }
  };

  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    setPredictLoading(true);
    setPredictError(null);
    setPredictionResult(null);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyInput)
      });
      if (!response.ok) throw new Error('Server returned an error.');
      const data = await response.json();
      setPredictionResult(data);
    } catch (err) {
      setPredictError(err.message || 'Prediction failed. Please try again.');
    } finally {
      setPredictLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSurveyInput(prev => ({
      ...prev,
      [field]: field === 'age' ? parseInt(value) || 18 : value
    }));
  };

  // Helper to trigger active class name
  const navClass = (tab) => `nav-item ${activeTab === tab ? 'active' : ''}`;

  return (
    <div className="glass-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Brain size={24} />
          </div>
          <div className="brand-info">
            <h2 className="brand-name">MindGuard</h2>
            <span className="brand-sub">SMHS Analytics</span>
          </div>
        </div>

        <nav>
          <ul className="nav-menu">
            <li>
              <div className={navClass('predict')} onClick={() => setActiveTab('predict')}>
                <Activity size={20} />
                <span>Prediction Portal</span>
              </div>
            </li>
            <li>
              <div className={navClass('eda')} onClick={() => setActiveTab('eda')}>
                <BarChart3 size={20} />
                <span>EDA Center</span>
              </div>
            </li>
            <li>
              <div className={navClass('models')} onClick={() => setActiveTab('models')}>
                <Compass size={20} />
                <span>Model Evaluation</span>
              </div>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">AD</div>
            <div className="user-info">
              <span className="user-name">Counselor Panel</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-title">
            {activeTab === 'predict' && (
              <>
                <h1>Student Prediction Portal</h1>
                <p>Enter survey parameters to assess mental health risks and obtain clinical insights.</p>
              </>
            )}
            {activeTab === 'eda' && (
              <>
                <h1>Exploratory Data Analysis</h1>
                <p>Interactive survey statistics and insights generated from the student sample dataset.</p>
              </>
            )}
            {activeTab === 'models' && (
              <>
                <h1>Model Evaluation Center</h1>
                <p>Compare performance and inspect parameters of Random Forest, SVM, and XGBoost classifiers.</p>
              </>
            )}
          </div>
          
          <div className="header-action">
            <button className="btn-refresh" onClick={() => { fetchEda(); fetchMetrics(); }}>
              <RefreshCw size={16} />
              <span>Sync System</span>
            </button>
          </div>
        </header>

        {/* ==================== TAB 1: PREDICTION PORTAL ==================== */}
        <div className={`tab-content ${activeTab === 'predict' ? 'active' : ''}`}>
          <div className="grid-2col">
            {/* Input Form Glass Card */}
            <div className="glass-card">
              <div className="card-title">
                <FileText size={20} />
                <h3>Student Demographics Survey</h3>
              </div>
              
              <form onSubmit={handlePredictSubmit}>
                <div className="survey-grid">
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select 
                      className="form-select"
                      value={surveyInput.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input 
                      type="number"
                      min="15"
                      max="35"
                      className="form-input"
                      value={surveyInput.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Academic Specialization (Course)</label>
                  <select 
                    className="form-select"
                    value={surveyInput.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                  >
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="survey-grid">
                  <div className="form-group">
                    <label className="form-label">Current Academic Year</label>
                    <select 
                      className="form-select"
                      value={surveyInput.year_of_study}
                      onChange={(e) => handleInputChange('year_of_study', e.target.value)}
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current CGPA Range</label>
                    <select 
                      className="form-select"
                      value={surveyInput.cgpa}
                      onChange={(e) => handleInputChange('cgpa', e.target.value)}
                    >
                      {CGPA_RANGES.map(cg => <option key={cg} value={cg}>{cg}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Is Maritally Active?</label>
                  <select 
                    className="form-select"
                    value={surveyInput.marital_status}
                    onChange={(e) => handleInputChange('marital_status', e.target.value)}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <button type="submit" className="btn-submit" disabled={predictLoading}>
                  {predictLoading ? (
                    <>
                      <RefreshCw size={18} className="spinner" style={{ margin: 0, width: 18, height: 18 }} />
                      <span>Processing Clinical Data...</span>
                    </>
                  ) : (
                    <>
                      <Brain size={18} />
                      <span>Assess Risk Profile</span>
                    </>
                  )}
                </button>
              </form>

              {predictError && (
                <div style={{ marginTop: '1.25rem', color: 'var(--high-risk)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <AlertCircle size={16} />
                  <span>{predictError}</span>
                </div>
              )}
            </div>

            {/* Prediction Output Panel */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {!predictionResult && !predictLoading && (
                <div style={{ textAlignment: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyAlignment: 'center', margin: '0 auto 1.5rem', color: 'var(--color-primary)' }}>
                    <Sparkles size={32} style={{ margin: '0 auto' }} />
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Awaiting Risk Assessment</h3>
                  <p style={{ fontSize: '0.9rem', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5 }}>
                    Provide student information in the survey panel and click "Assess Risk Profile" to run predictions.
                  </p>
                </div>
              )}

              {predictLoading && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>Running ML Classifiers</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Comparing Random Forest, SVM, and XGBoost predictions...</p>
                </div>
              )}

              {predictionResult && (
                <div>
                  <div className="results-header">
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Ensemble Risk Verdict
                    </h3>
                    
                    {predictionResult.ensemble.risk_level === 0 && (
                      <span className="risk-badge low">Low Risk</span>
                    )}
                    {predictionResult.ensemble.risk_level === 1 && (
                      <span className="risk-badge moderate">Moderate Risk</span>
                    )}
                    {predictionResult.ensemble.risk_level === 2 && (
                      <span className="risk-badge high">High Risk</span>
                    )}
                    
                    {/* Gauge meter */}
                    <div className="gauge-container">
                      <div className="gauge-track"></div>
                      <div 
                        className={`gauge-fill ${predictionResult.ensemble.risk_level === 0 ? 'low' : predictionResult.ensemble.risk_level === 1 ? 'moderate' : 'high'}`}
                        style={{ 
                          transform: `rotate(${
                            predictionResult.ensemble.risk_level === 0 ? 30 : predictionResult.ensemble.risk_level === 1 ? 90 : 150
                          }deg)` 
                        }}
                      ></div>
                      <div className="gauge-value">
                        {predictionResult.ensemble.risk_level === 0 ? '0-30%' : predictionResult.ensemble.risk_level === 1 ? '30-70%' : '70-100%'}
                      </div>
                    </div>
                  </div>

                  {/* Probabilities distribution */}
                  <div className="probability-list">
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Probability Distribution</h4>
                    
                    <div className="prob-item">
                      <div className="prob-label">
                        <span>Low Risk</span>
                        <span>{Math.round(predictionResult.ensemble.probabilities['Low Risk'] * 100)}%</span>
                      </div>
                      <div className="prob-bar-bg">
                        <div className="prob-bar-fill low" style={{ width: `${predictionResult.ensemble.probabilities['Low Risk'] * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="prob-item">
                      <div className="prob-label">
                        <span>Moderate Risk</span>
                        <span>{Math.round(predictionResult.ensemble.probabilities['Moderate Risk'] * 100)}%</span>
                      </div>
                      <div className="prob-bar-bg">
                        <div className="prob-bar-fill moderate" style={{ width: `${predictionResult.ensemble.probabilities['Moderate Risk'] * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="prob-item">
                      <div className="prob-label">
                        <span>High Risk</span>
                        <span>{Math.round(predictionResult.ensemble.probabilities['High Risk'] * 100)}%</span>
                      </div>
                      <div className="prob-bar-bg">
                        <div className="prob-bar-fill high" style={{ width: `${predictionResult.ensemble.probabilities['High Risk'] * 100}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Model breakdown predictions comparison */}
                  <div className="model-predictions-compare">
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Classifier Predictions Breakdown</h4>
                    
                    <div className="model-compare-row">
                      <span className="model-name">Random Forest</span>
                      <span className={`model-risk ${predictionResult.model_predictions.randomforest.risk_level === 0 ? 'low' : predictionResult.model_predictions.randomforest.risk_level === 1 ? 'moderate' : 'high'}`}>
                        {predictionResult.model_predictions.randomforest.label}
                      </span>
                    </div>

                    <div className="model-compare-row">
                      <span className="model-name">Support Vector Machine (SVM)</span>
                      <span className={`model-risk ${predictionResult.model_predictions.svm.risk_level === 0 ? 'low' : predictionResult.model_predictions.svm.risk_level === 1 ? 'moderate' : 'high'}`}>
                        {predictionResult.model_predictions.svm.label}
                      </span>
                    </div>

                    <div className="model-compare-row">
                      <span className="model-name">XGBoost Classifier</span>
                      <span className={`model-risk ${predictionResult.model_predictions.xgboost.risk_level === 0 ? 'low' : predictionResult.model_predictions.xgboost.risk_level === 1 ? 'moderate' : 'high'}`}>
                        {predictionResult.model_predictions.xgboost.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations section (rendered if prediction exists) */}
          {predictionResult && (
            <div className="glass-card recommendations-box">
              <div className="card-title">
                <Heart size={20} style={{ color: 'var(--color-accent)' }} />
                <h3>Actionable Clinical Recommendations & Insights</h3>
              </div>
              <div className="recommendations-list">
                {predictionResult.recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-item" style={{ borderLeftColor: predictionResult.ensemble.risk_level === 0 ? 'var(--low-risk)' : predictionResult.ensemble.risk_level === 1 ? 'var(--mod-risk)' : 'var(--high-risk)' }}>
                    {predictionResult.ensemble.risk_level === 0 ? (
                      <CheckCircle2 size={18} style={{ color: 'var(--low-risk)' }} />
                    ) : predictionResult.ensemble.risk_level === 1 ? (
                      <AlertCircle size={18} style={{ color: 'var(--mod-risk)' }} />
                    ) : (
                      <AlertCircle size={18} style={{ color: 'var(--high-risk)' }} />
                    )}
                    <p className="recommendation-text">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ==================== TAB 2: EDA CENTER ==================== */}
        <div className={`tab-content ${activeTab === 'eda' ? 'active' : ''}`}>
          {edaLoading && (
            <div className="glass-card" style={{ padding: '4rem' }}>
              <div className="loading-overlay">
                <div className="spinner"></div>
                <h3 style={{ color: 'var(--text-primary)' }}>Loading Survey Analysis</h3>
                <p>Computing statistical distributions from survey database...</p>
              </div>
            </div>
          )}

          {edaError && (
            <div className="glass-card" style={{ color: 'var(--high-risk)', textAlign: 'center', padding: '3rem' }}>
              <AlertCircle size={36} style={{ margin: '0 auto 1rem' }} />
              <h3>Failed to load statistics</h3>
              <p>{edaError}</p>
            </div>
          )}

          {edaData && !edaLoading && (
            <>
              {/* Overall stats cards */}
              <div className="stats-grid">
                <div className="glass-card stat-card">
                  <div className="stat-icon primary">
                    <BookOpen size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Total Sample Size</span>
                    <span className="stat-value">{edaData.overall_stats.total}</span>
                    <span className="stat-desc">Student surveys</span>
                  </div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-icon secondary">
                    <Activity size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Anxiety Rate</span>
                    <span className="stat-value">{edaData.overall_stats.anxiety_rate}%</span>
                    <span className="stat-desc">Of total sample</span>
                  </div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-icon danger">
                    <Heart size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Depression Rate</span>
                    <span className="stat-value">{edaData.overall_stats.depression_rate}%</span>
                    <span className="stat-desc">Of total sample</span>
                  </div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-icon warning">
                    <Users size={24} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">High Risk Level</span>
                    <span className="stat-value">{edaData.overall_stats.high_risk_rate}%</span>
                    <span className="stat-desc">Co-occurring symptoms</span>
                  </div>
                </div>
              </div>

              {/* Chart Grid */}
              <div className="grid-2col">
                {/* 1. Age Distribution Stacked Bar Chart */}
                <div className="glass-card">
                  <div className="card-title">
                    <Calendar size={18} />
                    <h3>Mental Health Risk by Student Age</h3>
                  </div>
                  <div className="chart-container">
                    <SVGAgeRiskChart data={edaData.age_distribution} />
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item"><span className="legend-dot low"></span><span>Low Risk</span></div>
                    <div className="legend-item"><span className="legend-dot moderate"></span><span>Moderate Risk</span></div>
                    <div className="legend-item"><span className="legend-dot high"></span><span>High Risk</span></div>
                  </div>
                </div>

                {/* 2. CGPA Impact Stacked Bar Chart */}
                <div className="glass-card">
                  <div className="card-title">
                    <Award size={18} />
                    <h3>Mental Health Risk by CGPA Band</h3>
                  </div>
                  <div className="chart-container">
                    <SVGCGPARiskChart data={edaData.cgpa_impact} />
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item"><span className="legend-dot low"></span><span>Low Risk</span></div>
                    <div className="legend-item"><span className="legend-dot moderate"></span><span>Moderate Risk</span></div>
                    <div className="legend-item"><span className="legend-dot high"></span><span>High Risk</span></div>
                  </div>
                </div>
              </div>

              <div className="grid-2col">
                {/* 3. Gender Comparison Chart */}
                <div className="glass-card">
                  <div className="card-title">
                    <Users size={18} />
                    <h3>Symptom Prevalence by Gender</h3>
                  </div>
                  <div className="chart-container">
                    <SVGGenderComparisonChart data={edaData.gender_comparison} />
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item"><span className="legend-dot depression"></span><span>Depression %</span></div>
                    <div className="legend-item"><span className="legend-dot anxiety"></span><span>Anxiety %</span></div>
                    <div className="legend-item"><span className="legend-dot panic"></span><span>Panic Attacks %</span></div>
                  </div>
                </div>

                {/* 4. Specialist Treatment by Risk */}
                <div className="glass-card">
                  <div className="card-title">
                    <UserCheck size={18} />
                    <h3>Treatment Seeking Behavior by Risk Profile</h3>
                  </div>
                  <div className="chart-container">
                    <SVGTreatmentChart data={edaData.treatment_behavior} />
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item"><span className="legend-dot anxiety"></span><span>Sought Treatment</span></div>
                    <div className="legend-item"><span className="legend-dot low"></span><span>No Treatment</span></div>
                  </div>
                </div>
              </div>

              {/* 5. Course comparison (Wide card) */}
              <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <div className="card-title">
                  <BookOpen size={18} />
                  <h3>Top 8 Specialized Courses vs Mental Health Risk Levels</h3>
                </div>
                <div style={{ height: '320px', width: '100%' }}>
                  <SVGCourseRiskChart data={edaData.course_impact} />
                </div>
                <div className="chart-legend">
                  <div className="legend-item"><span className="legend-dot low"></span><span>Low Risk</span></div>
                  <div className="legend-item"><span className="legend-dot moderate"></span><span>Moderate Risk</span></div>
                  <div className="legend-item"><span className="legend-dot high"></span><span>High Risk</span></div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ==================== TAB 3: MODEL PERFORMANCE HUB ==================== */}
        <div className={`tab-content ${activeTab === 'models' ? 'active' : ''}`}>
          {metricsLoading && (
            <div className="glass-card" style={{ padding: '4rem' }}>
              <div className="loading-overlay">
                <div className="spinner"></div>
                <h3 style={{ color: 'var(--text-primary)' }}>Loading Classifier Metrics</h3>
                <p>Retrieving trained model stats from server...</p>
              </div>
            </div>
          )}

          {metricsError && (
            <div className="glass-card" style={{ color: 'var(--high-risk)', textAlign: 'center', padding: '3rem' }}>
              <AlertCircle size={36} style={{ margin: '0 auto 1rem' }} />
              <h3>Failed to load metrics</h3>
              <p>{metricsError}</p>
            </div>
          )}

          {metricsData && !metricsLoading && (
            <>
              {/* Models select row */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {Object.keys(metricsData).map(mName => (
                  <button
                    key={mName}
                    onClick={() => setSelectedModel(mName)}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '12px',
                      background: selectedModel === mName ? 'var(--gradient-primary)' : 'var(--bg-card)',
                      border: '1px solid',
                      borderColor: selectedModel === mName ? 'transparent' : 'var(--border-glass)',
                      color: selectedModel === mName ? 'white' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      boxShadow: selectedModel === mName ? 'var(--shadow-glow)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {mName === 'RandomForest' ? 'Random Forest' : mName === 'SVM' ? 'Support Vector Machine' : 'XGBoost Classifier'}
                  </button>
                ))}
              </div>

              {/* Active Model Info Grid */}
              <div className="grid-2col">
                {/* Metrics detail panel */}
                <div className="glass-card">
                  <div className="card-title">
                    <Activity size={18} />
                    <h3>{selectedModel === 'RandomForest' ? 'Random Forest' : selectedModel === 'SVM' ? 'SVM' : 'XGBoost'} Classifier Performance</h3>
                  </div>

                  <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    Standard model performance indicators computed on a 20% validation split (stratified).
                  </p>

                  <div className="metric-pill-grid">
                    <div className="metric-pill">
                      <span className="metric-pill-label">Accuracy</span>
                      <span className="metric-pill-value">{roundPct(metricsData[selectedModel].accuracy)}%</span>
                    </div>

                    <div className="metric-pill">
                      <span className="metric-pill-label">Precision</span>
                      <span className="metric-pill-value">{roundPct(metricsData[selectedModel].precision)}%</span>
                    </div>

                    <div className="metric-pill">
                      <span className="metric-pill-label">Recall</span>
                      <span className="metric-pill-value">{roundPct(metricsData[selectedModel].recall)}%</span>
                    </div>

                    <div className="metric-pill">
                      <span className="metric-pill-label">F1-Score</span>
                      <span className="metric-pill-value">{roundPct(metricsData[selectedModel].f1_score)}%</span>
                    </div>
                  </div>

                  {/* Feature importance list (only RF or XGBoost) */}
                  {metricsData[selectedModel].feature_importances && metricsData[selectedModel].feature_importances.length > 0 ? (
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={16} style={{ color: 'var(--color-secondary)' }} />
                        <span>Core Prediction Factors</span>
                      </h4>
                      <div className="feature-importance-list">
                        {metricsData[selectedModel].feature_importances.slice(0, 7).map((f, idx) => (
                          <div key={idx} className="feature-row">
                            <span className="feature-name" title={cleanFeatureName(f.feature)}>{cleanFeatureName(f.feature)}</span>
                            <div className="feature-bar-bg">
                              <div className="feature-bar-fill" style={{ width: `${f.importance * 100}%` }}></div>
                            </div>
                            <span className="feature-value">{roundPct(f.importance)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', border: '1px dashed var(--border-glass)', textAlign: 'center' }}>
                      <AlertCircle size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem' }} />
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>No direct feature coefficients</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        SVM uses RBF radial kernel mapping. Direct linear weights/coefficients are not computed. Please check tree classifiers (Random Forest or XGBoost) for predictive factors.
                      </p>
                    </div>
                  )}
                </div>

                {/* Confusion Matrix heatmap card */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="card-title" style={{ width: '100%' }}>
                    <BarChart3 size={18} />
                    <h3>Interactive Confusion Matrix</h3>
                  </div>
                  
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', alignSelf: 'flex-start' }}>
                    Visualizes correct predictions vs misclassifications for each Risk Level.
                  </p>

                  <div className="confusion-matrix-wrapper">
                    <div className="matrix-headers-top">
                      <div className="matrix-header-top">Low</div>
                      <div className="matrix-header-top">Moderate</div>
                      <div className="matrix-header-top">High</div>
                    </div>
                    
                    <div style={{ display: 'flex', position: 'relative' }}>
                      <span className="matrix-axes-title-y">Actual Class</span>
                      
                      <div className="matrix-grid">
                        {/* Row 1: Actual Low */}
                        <div className="matrix-label">Low</div>
                        <MatrixCell val={metricsData[selectedModel].confusion_matrix[0][0]} total={sumRow(metricsData[selectedModel].confusion_matrix[0])} correct={true} />
                        <MatrixCell val={metricsData[selectedModel].confusion_matrix[0][1]} total={sumRow(metricsData[selectedModel].confusion_matrix[0])} correct={false} />
                        <MatrixCell val={metricsData[selectedModel].confusion_matrix[0][2]} total={sumRow(metricsData[selectedModel].confusion_matrix[0])} correct={false} />

                        {/* Row 2: Actual Moderate */}
                        <div className="matrix-label">Mod.</div>
                        <MatrixCell val={metricsData[selectedModel].confusion_matrix[1][0]} total={sumRow(metricsData[selectedModel].confusion_matrix[1])} correct={false} />
                        <MatrixCell val={metricsData[selectedModel].confusion_matrix[1][1]} total={sumRow(metricsData[selectedModel].confusion_matrix[1])} correct={true} />
                        <MatrixCell val={metricsData[selectedModel].confusion_matrix[1][2]} total={sumRow(metricsData[selectedModel].confusion_matrix[1])} correct={false} />

                        {/* Row 3: Actual High */}
                        <div className="matrix-label">High</div>
                        <MatrixCell val={metricsData[selectedModel].confusion_matrix[2][0]} total={sumRow(metricsData[selectedModel].confusion_matrix[2])} correct={false} />
                        <MatrixCell val={metricsData[selectedModel].confusion_matrix[2][1]} total={sumRow(metricsData[selectedModel].confusion_matrix[2])} correct={false} />
                        <MatrixCell val={metricsData[selectedModel].confusion_matrix[2][2]} total={sumRow(metricsData[selectedModel].confusion_matrix[2])} correct={true} />
                      </div>
                    </div>

                    <div className="matrix-axes-title-x">Predicted Class</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper formatting utilities
const roundPct = (num) => Math.round(num * 100);
const cleanFeatureName = (name) => {
  if (name.startsWith('cat__Choose your gender_')) return `Gender: ${name.replace('cat__Choose your gender_', '')}`;
  if (name.startsWith('cat__What is your course?_')) return `Course: ${name.replace('cat__What is your course?_', '')}`;
  if (name.startsWith('cat__Your current year of Study_')) return `Year: ${name.replace('cat__Your current year of Study_', '')}`;
  if (name.startsWith('cat__What is your CGPA?_')) return `CGPA Range: ${name.replace('cat__What is your CGPA?_', '')}`;
  if (name.startsWith('cat__Marital status_')) return `Marital Active: ${name.replace('cat__Marital status_', '')}`;
  if (name === 'num__Age') return 'Age of Student';
  return name;
};

const sumRow = (arr) => arr.reduce((a, b) => a + b, 0);

// Confusion Matrix cell helper component
function MatrixCell({ val, total, correct }) {
  const pct = total > 0 ? Math.round((val / total) * 100) : 0;
  
  // Dynamic class matching correct classification
  let cellClass = "matrix-cell";
  if (correct) {
    cellClass += " diagonal";
  } else {
    cellClass += pct > 20 ? " off-diagonal" : " off-diagonal mild";
  }
  
  return (
    <div className={cellClass}>
      <span className="matrix-value">{val}</span>
      <span className="matrix-pct">{pct}%</span>
    </div>
  );
}

// Custom SVG Chart components
function SVGAgeRiskChart({ data }) {
  const width = 600;
  const height = 280;
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };
  
  // Stack calculation
  const stacked = data.map(d => ({
    age: d.age,
    low: d['Low Risk'],
    mod: d['Moderate Risk'],
    high: d['High Risk'],
    total: d['Low Risk'] + d['Moderate Risk'] + d['High Risk']
  }));
  
  const maxTotal = Math.max(...stacked.map(d => d.total), 1);
  const xScale = (idx) => padding.left + (idx / data.length) * (width - padding.left - padding.right);
  const yScale = (val) => height - padding.bottom - (val / maxTotal) * (height - padding.top - padding.bottom);
  const barWidth = ((width - padding.left - padding.right) / data.length) * 0.6;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
        const val = p * maxTotal;
        const y = yScale(val);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} className="chart-grid" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="chart-text">{Math.round(val)}</text>
          </g>
        );
      })}
      
      {/* Bars */}
      {stacked.map((d, itemIdx) => {
        const x = xScale(itemIdx) + barWidth * 0.3;
        const yHigh = yScale(d.high);
        const yMod = yScale(d.high + d.mod);
        const yLow = yScale(d.total);
        
        const hHigh = height - padding.bottom - yHigh;
        const hMod = yHigh - yMod;
        const hLow = yMod - yLow;
        
        return (
          <g key={itemIdx}>
            {/* Low Risk segment (bottom) */}
            {hLow > 0 && (
              <rect x={x} y={yLow} width={barWidth} height={hLow} fill="var(--low-risk)" className="chart-bar">
                <title>{`Age ${d.age} - Low Risk: ${d.low}`}</title>
              </rect>
            )}
            {/* Moderate Risk segment (middle) */}
            {hMod > 0 && (
              <rect x={x} y={yMod} width={barWidth} height={hMod} fill="var(--mod-risk)" className="chart-bar">
                <title>{`Age ${d.age} - Moderate Risk: ${d.mod}`}</title>
              </rect>
            )}
            {/* High Risk segment (top) */}
            {hHigh > 0 && (
              <rect x={x} y={yHigh} width={barWidth} height={hHigh} fill="var(--high-risk)" className="chart-bar">
                <title>{`Age ${d.age} - High Risk: ${d.high}`}</title>
              </rect>
            )}
            
            {/* X label */}
            <text x={x + barWidth / 2} y={height - padding.bottom + 16} textAnchor="middle" className="chart-text">
              {d.age} yrs
            </text>
          </g>
        );
      })}
      
      {/* Axis lines */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} className="chart-axis" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} className="chart-axis" />
    </svg>
  );
}

function SVGCGPARiskChart({ data }) {
  const width = 600;
  const height = 280;
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };
  
  const stacked = data.map(d => ({
    cgpa: d.cgpa,
    low: d['Low Risk'],
    mod: d['Moderate Risk'],
    high: d['High Risk'],
    total: d['Low Risk'] + d['Moderate Risk'] + d['High Risk']
  }));
  
  const maxTotal = Math.max(...stacked.map(d => d.total), 1);
  const xScale = (idx) => padding.left + (idx / data.length) * (width - padding.left - padding.right);
  const yScale = (val) => height - padding.bottom - (val / maxTotal) * (height - padding.top - padding.bottom);
  const barWidth = ((width - padding.left - padding.right) / data.length) * 0.65;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
        const val = p * maxTotal;
        const y = yScale(val);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} className="chart-grid" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="chart-text">{Math.round(val)}</text>
          </g>
        );
      })}
      
      {/* Bars */}
      {stacked.map((d, itemIdx) => {
        const x = xScale(itemIdx) + barWidth * 0.25;
        const yHigh = yScale(d.high);
        const yMod = yScale(d.high + d.mod);
        const yLow = yScale(d.total);
        
        const hHigh = height - padding.bottom - yHigh;
        const hMod = yHigh - yMod;
        const hLow = yMod - yLow;
        
        return (
          <g key={itemIdx}>
            {hLow > 0 && (
              <rect x={x} y={yLow} width={barWidth} height={hLow} fill="var(--low-risk)" className="chart-bar">
                <title>{`CGPA ${d.cgpa} - Low Risk: ${d.low}`}</title>
              </rect>
            )}
            {hMod > 0 && (
              <rect x={x} y={yMod} width={barWidth} height={hMod} fill="var(--mod-risk)" className="chart-bar">
                <title>{`CGPA ${d.cgpa} - Moderate Risk: ${d.mod}`}</title>
              </rect>
            )}
            {hHigh > 0 && (
              <rect x={x} y={yHigh} width={barWidth} height={hHigh} fill="var(--high-risk)" className="chart-bar">
                <title>{`CGPA ${d.cgpa} - High Risk: ${d.high}`}</title>
              </rect>
            )}
            
            {/* X label */}
            <text x={x + barWidth / 2} y={height - padding.bottom + 16} textAnchor="middle" className="chart-text">
              {d.cgpa}
            </text>
          </g>
        );
      })}
      
      {/* Axis lines */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} className="chart-axis" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} className="chart-axis" />
    </svg>
  );
}

function SVGGenderComparisonChart({ data }) {
  const width = 600;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };
  
  // Calculate max scale rate %
  const maxRate = 100;
  
  const xScale = (idx) => padding.left + (idx / data.length) * (width - padding.left - padding.right);
  const yScale = (val) => height - padding.bottom - (val / maxRate) * (height - padding.top - padding.bottom);
  
  const groupWidth = ((width - padding.left - padding.right) / data.length) * 0.7;
  const barWidth = groupWidth / 3.5;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((val, i) => {
        const y = yScale(val);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} className="chart-grid" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="chart-text">{val}%</text>
          </g>
        );
      })}
      
      {/* Group bars */}
      {data.map((d, idx) => {
        const groupStart = xScale(idx) + groupWidth * 0.15;
        const xDep = groupStart;
        const xAnx = groupStart + barWidth * 1.15;
        const xPanic = groupStart + barWidth * 2.3;
        
        const yDep = yScale(d['Depression %']);
        const yAnx = yScale(d['Anxiety %']);
        const yPanic = yScale(d['Panic Attacks %']);
        
        const hDep = height - padding.bottom - yDep;
        const hAnx = height - padding.bottom - yAnx;
        const hPanic = height - padding.bottom - yPanic;
        
        return (
          <g key={idx}>
            {/* Depression bar */}
            <rect x={xDep} y={yDep} width={barWidth} height={hDep} fill="var(--high-risk)" className="chart-bar" rx="2">
              <title>{`${d.gender} - Depression: ${d['Depression %']}%`}</title>
            </rect>
            
            {/* Anxiety bar */}
            <rect x={xAnx} y={yAnx} width={barWidth} height={hAnx} fill="var(--color-primary)" className="chart-bar" rx="2">
              <title>{`${d.gender} - Anxiety: ${d['Anxiety %']}%`}</title>
            </rect>
            
            {/* Panic bar */}
            <rect x={xPanic} y={yPanic} width={barWidth} height={hPanic} fill="var(--color-secondary)" className="chart-bar" rx="2">
              <title>{`${d.gender} - Panic attacks: ${d['Panic Attacks %']}%`}</title>
            </rect>
            
            {/* X label */}
            <text x={groupStart + groupWidth / 2} y={height - padding.bottom + 16} textAnchor="middle" className="chart-text">
              {d.gender} (n={d.count})
            </text>
          </g>
        );
      })}
      
      {/* Axis lines */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} className="chart-axis" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} className="chart-axis" />
    </svg>
  );
}

function SVGTreatmentChart({ data }) {
  const width = 600;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };
  
  const maxVal = Math.max(...data.map(d => d['Sought Treatment'] + d['No Treatment']), 1);
  const xScale = (idx) => padding.left + (idx / data.length) * (width - padding.left - padding.right);
  const yScale = (val) => height - padding.bottom - (val / maxVal) * (height - padding.top - padding.bottom);
  
  const groupWidth = ((width - padding.left - padding.right) / data.length) * 0.7;
  const barWidth = groupWidth / 2.3;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
        const val = p * maxVal;
        const y = yScale(val);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} className="chart-grid" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="chart-text">{Math.round(val)}</text>
          </g>
        );
      })}
      
      {/* Bars */}
      {data.map((d, idx) => {
        const groupStart = xScale(idx) + groupWidth * 0.15;
        const xSought = groupStart;
        const xNo = groupStart + barWidth * 1.15;
        
        const ySought = yScale(d['Sought Treatment']);
        const yNo = yScale(d['No Treatment']);
        
        const hSought = height - padding.bottom - ySought;
        const hNo = height - padding.bottom - yNo;
        
        return (
          <g key={idx}>
            {/* Sought Treatment */}
            <rect x={xSought} y={ySought} width={barWidth} height={hSought} fill="var(--color-primary)" className="chart-bar" rx="2">
              <title>{`${d.risk} - Sought Specialist: ${d['Sought Treatment']}`}</title>
            </rect>
            
            {/* No Treatment */}
            <rect x={xNo} y={yNo} width={barWidth} height={hNo} fill="var(--border-glass-hover)" className="chart-bar" rx="2">
              <title>{`${d.risk} - No Specialist: ${d['No Treatment']}`}</title>
            </rect>
            
            {/* X label */}
            <text x={groupStart + groupWidth / 2} y={height - padding.bottom + 16} textAnchor="middle" className="chart-text">
              {d.risk}
            </text>
          </g>
        );
      })}
      
      {/* Axis lines */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} className="chart-axis" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} className="chart-axis" />
    </svg>
  );
}

function SVGCourseRiskChart({ data }) {
  const width = 800;
  const height = 280;
  const padding = { top: 20, right: 30, bottom: 40, left: 160 };
  
  const maxTotal = Math.max(...data.map(d => d['Low Risk'] + d['Moderate Risk'] + d['High Risk']), 1);
  const yScale = (idx) => padding.top + (idx / data.length) * (height - padding.top - padding.bottom);
  const xScale = (val) => padding.left + (val / maxTotal) * (width - padding.left - padding.right);
  const barHeight = ((height - padding.top - padding.bottom) / data.length) * 0.65;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
      {/* Vertical grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
        const val = p * maxTotal;
        const x = xScale(val);
        return (
          <g key={i}>
            <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} className="chart-grid" />
            <text x={x} y={height - padding.bottom + 16} textAnchor="middle" className="chart-text">{Math.round(val)}</text>
          </g>
        );
      })}
      
      {/* Horizontal Stacked Bars */}
      {data.map((d, idx) => {
        const y = yScale(idx) + barHeight * 0.25;
        const wLow = xScale(d['Low Risk']) - padding.left;
        const wMod = xScale(d['Low Risk'] + d['Moderate Risk']) - xScale(d['Low Risk']);
        const wHigh = xScale(d['Low Risk'] + d['Moderate Risk'] + d['High Risk']) - xScale(d['Low Risk'] + d['Moderate Risk']);
        
        return (
          <g key={idx}>
            {/* Label (course name) */}
            <text x={padding.left - 12} y={y + barHeight / 2 + 4} textAnchor="end" className="chart-text" style={{ fontSize: '11px', fill: 'var(--text-primary)' }}>
              {d.course}
            </text>
            
            {/* Low Risk segment */}
            {wLow > 0 && (
              <rect x={padding.left} y={y} width={wLow} height={barHeight} fill="var(--low-risk)" className="chart-bar">
                <title>{`${d.course} - Low Risk: ${d['Low Risk']}`}</title>
              </rect>
            )}
            
            {/* Moderate Risk segment */}
            {wMod > 0 && (
              <rect x={padding.left + wLow} y={y} width={wMod} height={barHeight} fill="var(--mod-risk)" className="chart-bar">
                <title>{`${d.course} - Moderate Risk: ${d['Moderate Risk']}`}</title>
              </rect>
            )}
            
            {/* High Risk segment */}
            {wHigh > 0 && (
              <rect x={padding.left + wLow + wMod} y={y} width={wHigh} height={barHeight} fill="var(--high-risk)" className="chart-bar">
                <title>{`${d.course} - High Risk: ${d['High Risk']}`}</title>
              </rect>
            )}
          </g>
        );
      })}
      
      {/* Axis lines */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} className="chart-axis" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} className="chart-axis" />
    </svg>
  );
}

export default App;
