import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, DollarSign, Globe,
  Target, BookOpen, FileText, Award, Calendar,
  Briefcase, TrendingUp, CheckCircle, MapPin,
  Building, Flag, Percent, CreditCard, Save,
  ArrowLeft, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../Config/api';

const ProfileUpdatePage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [onboardingForm, setOnboardingForm] = useState({
    educationLevel: 'Bachelors',
    major: '',
    graduationYear: new Date().getFullYear(),
    gpa: '',
    intendedDegree: 'Masters',
    fieldOfStudy: '',
    intakeYear: new Date().getFullYear() + 1,
    preferredCountries: ['USA'],
    budget: '',
    fundingPlan: 'Self',
    testStatus: 'Not Taken',
    greStatus: 'Not Taken',
    greScore: '',
    sopStatus: 'Not Started',
  });

  const [errors, setErrors] = useState({});
  const [profileCompletion, setProfileCompletion] = useState(0);

  const educationLevels = [
    'High School',
    'Bachelors',
    'Masters',
    'PhD',
    'Diploma',
    'Other'
  ];

  const degreeTypes = [
    'Bachelors',
    'Masters',
    'PhD',
    'Diploma',
    'Certificate',
    'Other'
  ];

  const countries = [
    'USA',
    'Canada',
    'UK',
    'Australia',
    'Germany',
    'France',
    'Netherlands',
    'Sweden',
    'Singapore',
    'Japan',
    'Other'
  ];

  const fundingPlans = [
    'Self',
    'Scholarship',
    'Loan',
    'Sponsor',
    'Family',
    'Mixed'
  ];

  const testStatuses = [
    'Not Taken',
    'Planned',
    'In Progress',
    'Completed',
    'Scored'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchOnboardingData();
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchOnboardingData = async () => {
    try {
      const response = await api.get('/onboarding');
      const data = response.data;

      if (data.success && data.onboarding) {
        const onboarding = data.onboarding;

        setOnboardingForm({
          educationLevel: onboarding.educationLevel || 'Bachelors',
          major: onboarding.major || '',
          graduationYear: onboarding.graduationYear || new Date().getFullYear(),
          gpa: onboarding.gpa || '',
          intendedDegree: onboarding.intendedDegree || 'Masters',
          fieldOfStudy: onboarding.fieldOfStudy || '',
          intakeYear: onboarding.intakeYear || new Date().getFullYear() + 1,
          preferredCountries: Array.isArray(onboarding.preferredCountries)
            ? onboarding.preferredCountries
            : (onboarding.preferredCountries ? [onboarding.preferredCountries] : ['USA']),
          budget: onboarding.budget || '',
          fundingPlan: onboarding.fundingPlan || 'Self',
          testStatus: onboarding.testStatus || 'Not Taken',
          greStatus: onboarding.greStatus || 'Not Taken',
          greScore: onboarding.greScore || '',
          sopStatus: onboarding.sopStatus || 'Not Started',
        });

        calculateProfileCompletion(onboarding);
      }
    } catch (error) {
      console.log('No onboarding data found or error:', error.response?.data?.message || error.message);
    }
  };

  const calculateProfileCompletion = (onboarding) => {
    if (!onboarding) {
      setProfileCompletion(0);
      return;
    }

    const fields = [
      'educationLevel',
      'major',
      'graduationYear',
      'gpa',
      'intendedDegree',
      'fieldOfStudy',
      'intakeYear',
      'preferredCountries',
      'budget',
      'fundingPlan',
      'testStatus',
      'greStatus',
      'sopStatus'
    ];

    const completedFields = fields.filter(field => {
      const value = onboarding[field];
      return value !== null && value !== undefined && value !== '' &&
        (!Array.isArray(value) || value.length > 0);
    }).length;

    const completion = Math.round((completedFields / fields.length) * 100);
    setProfileCompletion(completion);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields for onboarding
    if (!onboardingForm.major.trim()) newErrors.major = 'Major is required';
    if (!onboardingForm.fieldOfStudy.trim()) newErrors.fieldOfStudy = 'Field of study is required';

    // GPA validation
    if (onboardingForm.gpa) {
      const gpaValue = parseFloat(onboardingForm.gpa);
      if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4.0) {
        newErrors.gpa = 'GPA must be between 0 and 4.0';
      }
    }

    // GRE score validation
    if (onboardingForm.greScore) {
      const greValue = parseInt(onboardingForm.greScore);
      if (isNaN(greValue) || greValue < 260 || greValue > 340) {
        newErrors.greScore = 'GRE score must be between 260 and 340';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOnboardingUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        educationLevel: onboardingForm.educationLevel,
        major: onboardingForm.major,
        graduationYear: onboardingForm.graduationYear,
        gpa: onboardingForm.gpa,
        intendedDegree: onboardingForm.intendedDegree,
        fieldOfStudy: onboardingForm.fieldOfStudy,
        intakeYear: onboardingForm.intakeYear,
        preferredCountries: Array.isArray(onboardingForm.preferredCountries)
          ? onboardingForm.preferredCountries
          : [onboardingForm.preferredCountries],
        budget: onboardingForm.budget,
        fundingPlan: onboardingForm.fundingPlan,
        testStatus: onboardingForm.testStatus,
        greStatus: onboardingForm.greStatus,
        greScore: onboardingForm.greScore,
        sopStatus: onboardingForm.sopStatus,
      };

      const response = await api.patch('/onboarding/update', updateData);
      const result = response.data;

      if (result.success) {
        toast.success('Academic profile updated successfully!');

        // Update user in context
        if (setUser) {
          setUser(prevUser => ({
            ...prevUser,
            onboardingComplete: result.user.onboardingComplete,
            onboarding: result.user.onboarding
          }));
        }

        // Recalculate profile completion
        if (result.user?.onboarding) {
          calculateProfileCompletion(result.user.onboarding);
        }
      } else {
        toast.error(result.message || 'Failed to update academic profile');
      }
    } catch (error) {
      console.error('Error updating onboarding:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while updating academic profile';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleOnboardingChange = (field, value) => {
    setOnboardingForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleMultiSelect = (field, value) => {
    const currentValues = [...(onboardingForm[field] || [])];
    const index = currentValues.indexOf(value);

    if (index === -1) {
      currentValues.push(value);
    } else {
      currentValues.splice(index, 1);
    }

    setOnboardingForm(prev => ({
      ...prev,
      [field]: currentValues
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Update Academic Profile
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your academic information and study preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 sticky top-8">
              <div className="mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <h3 className="text-xl font-bold text-center">{user?.name}</h3>
                <p className="text-gray-400 text-center text-sm">{user?.email}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Profile Completion</span>
                  <span className="text-sm font-semibold text-purple-400">{profileCompletion}%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key="academic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-purple-400" />
                    Academic Information
                  </h3>

                  <form onSubmit={handleOnboardingUpdate} className="space-y-8">
                    {/* Academic Background */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-300 border-b border-gray-800 pb-2">
                        Academic Background
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Education Level *
                          </label>
                          <select
                            value={onboardingForm.educationLevel}
                            onChange={(e) => handleOnboardingChange('educationLevel', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {educationLevels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Major / Field *
                          </label>
                          <input
                            type="text"
                            value={onboardingForm.major}
                            onChange={(e) => handleOnboardingChange('major', e.target.value)}
                            className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.major ? 'border-red-500' : 'border-gray-700'
                              }`}
                            placeholder="e.g., Computer Science"
                          />
                          {errors.major && (
                            <p className="mt-1 text-sm text-red-400">{errors.major}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Graduation Year
                          </label>
                          <input
                            type="number"
                            value={onboardingForm.graduationYear}
                            onChange={(e) => handleOnboardingChange('graduationYear', parseInt(e.target.value) || '')}
                            min="2000"
                            max="2030"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            GPA (out of 4.0)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="4.0"
                            value={onboardingForm.gpa}
                            onChange={(e) => handleOnboardingChange('gpa', parseFloat(e.target.value) || '')}
                            className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.gpa ? 'border-red-500' : 'border-gray-700'
                              }`}
                            placeholder="e.g., 3.8"
                          />
                          {errors.gpa && (
                            <p className="mt-1 text-sm text-red-400">{errors.gpa}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Study Goals */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-300 border-b border-gray-800 pb-2">
                        Study Goals
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Intended Degree
                          </label>
                          <select
                            value={onboardingForm.intendedDegree}
                            onChange={(e) => handleOnboardingChange('intendedDegree', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {degreeTypes.map(degree => (
                              <option key={degree} value={degree}>{degree}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Field of Study *
                          </label>
                          <input
                            type="text"
                            value={onboardingForm.fieldOfStudy}
                            onChange={(e) => handleOnboardingChange('fieldOfStudy', e.target.value)}
                            className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.fieldOfStudy ? 'border-red-500' : 'border-gray-700'
                              }`}
                            placeholder="e.g., Artificial Intelligence"
                          />
                          {errors.fieldOfStudy && (
                            <p className="mt-1 text-sm text-red-400">{errors.fieldOfStudy}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Intake Year
                          </label>
                          <input
                            type="number"
                            value={onboardingForm.intakeYear}
                            onChange={(e) => handleOnboardingChange('intakeYear', parseInt(e.target.value) || '')}
                            min="2024"
                            max="2030"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Preferred Countries
                          </label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {countries.map(country => (
                              <button
                                key={country}
                                type="button"
                                onClick={() => handleMultiSelect('preferredCountries', country)}
                                className={`px-4 py-2 rounded-lg border transition-all ${onboardingForm.preferredCountries?.includes(country)
                                  ? 'bg-purple-900/30 border-purple-500 text-purple-300'
                                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-purple-500 hover:text-purple-300'
                                  }`}
                              >
                                {country}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Budget & Funding */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-300 border-b border-gray-800 pb-2">
                        Budget & Funding
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Total Budget (USD)
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="number"
                              value={onboardingForm.budget}
                              onChange={(e) => handleOnboardingChange('budget', parseInt(e.target.value) || '')}
                              min="0"
                              className={`w-full pl-10 pr-4 py-3 bg-gray-900 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.budget ? 'border-red-500' : 'border-gray-700'
                                }`}
                              placeholder="e.g., 50000"
                            />
                          </div>
                          {errors.budget && (
                            <p className="mt-1 text-sm text-red-400">{errors.budget}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Funding Plan
                          </label>
                          <select
                            value={onboardingForm.fundingPlan}
                            onChange={(e) => handleOnboardingChange('fundingPlan', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {fundingPlans.map(plan => (
                              <option key={plan} value={plan}>{plan}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Test Scores */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-300 border-b border-gray-800 pb-2">
                        Test Scores & Readiness
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            GRE Status
                          </label>
                          <select
                            value={onboardingForm.greStatus}
                            onChange={(e) => handleOnboardingChange('greStatus', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {testStatuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>

                        {onboardingForm.greStatus === 'Scored' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              GRE Score
                            </label>
                            <input
                              type="number"
                              value={onboardingForm.greScore}
                              onChange={(e) => handleOnboardingChange('greScore', parseInt(e.target.value) || '')}
                              min="260"
                              max="340"
                              className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.greScore ? 'border-red-500' : 'border-gray-700'
                                }`}
                              placeholder="260-340"
                            />
                            {errors.greScore && (
                              <p className="mt-1 text-sm text-red-400">{errors.greScore}</p>
                            )}
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            SOP Status
                          </label>
                          <select
                            value={onboardingForm.sopStatus}
                            onChange={(e) => handleOnboardingChange('sopStatus', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="Draft">Draft</option>
                            <option value="Review">Under Review</option>
                            <option value="Finalized">Finalized</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-800">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Academic Profile
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-900/30 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Onboarding Status</p>
                    <p className="text-lg font-bold">
                      {user?.onboardingComplete ? 'Complete' : 'In Progress'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-900/30 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Profile Score</p>
                    <p className="text-lg font-bold">
                      {user?.onboarding?.profileScore || 0}/100
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-900/30 rounded-xl">
                    <Calendar className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Current Stage</p>
                    <p className="text-lg font-bold">
                      Stage {user?.onboarding?.currentStage || 1}/4
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdatePage;