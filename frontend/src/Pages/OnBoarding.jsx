import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Target,
  Wallet,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Compass,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../Config/api";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const STEPS = [
  { id: "academic", title: "Academic Background", icon: GraduationCap },
  { id: "goal", title: "Study Goals", icon: Target },
  { id: "budget", title: "Financial Plan", icon: Wallet },
  { id: "readiness", title: "Readiness", icon: BookOpen },
];

// Validation rules for each field
const VALIDATION_RULES = {
  educationLevel: { required: true, message: "Education level is required" },
  major: {
    required: true,
    message: "Major is required",
    minLength: 2,
    maxLength: 100
  },
  graduationYear: {
    required: true,
    message: "Graduation year is required",
    validate: (value) => {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear + 10;
    },
    errorMessage: "Please enter a valid graduation year (1900 - " + (new Date().getFullYear() + 10) + ")"
  },
  gpa: {
    required: false,
    validate: (value) => {
      if (!value) return true;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 && num <= 4.0;
    },
    errorMessage: "Please enter a valid GPA (0.0 - 4.0)"
  },
  intendedDegree: { required: true, message: "Intended degree is required" },
  fieldOfStudy: {
    required: true,
    message: "Field of study is required",
    minLength: 2,
    maxLength: 100
  },
  intakeYear: {
    required: true,
    message: "Intake year is required",
    validate: (value) => {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      return year >= currentYear && year <= currentYear + 5;
    },
    errorMessage: "Please enter a valid intake year (" + new Date().getFullYear() + " - " + (new Date().getFullYear() + 5) + ")"
  },
  preferredCountries: {
    required: true,
    message: "Preferred countries are required",
    validate: (value) => {
      return value.trim().length > 0;
    }
  },
  budget: { required: true, message: "Budget is required" },
  fundingPlan: { required: true, message: "Funding plan is required" },
  testStatus: { required: false },
  greStatus: { required: false },
  greScore: {
    required: false,
    validate: (value, formData) => {
      if (!value) return true;
      if (formData.greStatus === 'completed') {
        const score = parseInt(value);
        return !isNaN(score) && score >= 260 && score <= 340;
      }
      return true;
    },
    errorMessage: "Please enter a valid GRE score (260-340)"
  },
  sopStatus: { required: false }
};

const OnBoarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    educationLevel: "",
    major: "",
    graduationYear: "",
    gpa: "",
    intendedDegree: "",
    fieldOfStudy: "",
    intakeYear: "",
    preferredCountries: "",
    budget: "",
    fundingPlan: "",
    testStatus: "not-started",
    greStatus: "not-required",
    greScore: "",
    sopStatus: "not-started",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Validate a single field
  const validateField = (name, value) => {
    const rule = VALIDATION_RULES[name];
    if (!rule) return "";

    if (rule.required && !value) {
      return rule.message;
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      return `Must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && value && value.length > rule.maxLength) {
      return `Must be less than ${rule.maxLength} characters`;
    }

    if (rule.validate) {
      const isValid = rule.validate(value, formData);
      if (!isValid) {
        return rule.errorMessage || "Invalid value";
      }
    }

    return "";
  };

  // Validate current step
  const validateStep = () => {
    const stepId = STEPS[currentStep].id;
    const newErrors = {};

    switch (stepId) {
      case "academic":
        ["educationLevel", "major", "graduationYear"].forEach(field => {
          const error = validateField(field, formData[field]);
          if (error) newErrors[field] = error;
        });
        if (formData.gpa) {
          const gpaError = validateField("gpa", formData.gpa);
          if (gpaError) newErrors.gpa = gpaError;
        }
        break;
      case "goal":
        ["intendedDegree", "fieldOfStudy", "intakeYear", "preferredCountries"].forEach(field => {
          const error = validateField(field, formData[field]);
          if (error) newErrors[field] = error;
        });
        break;
      case "budget":
        ["budget", "fundingPlan"].forEach(field => {
          const error = validateField(field, formData[field]);
          if (error) newErrors[field] = error;
        });
        break;
      case "readiness":
        if (formData.greStatus === 'completed' && formData.greScore) {
          const greError = validateField("greScore", formData.greScore);
          if (greError) newErrors.greScore = greError;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepValid = () => {
    return validateStep();
  };

  // Handle field change with validation
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // Handle blur for validation
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleNext = () => {
    if (!isStepValid()) {
      // Mark all fields in current step as touched
      const stepFields = {
        academic: ["educationLevel", "major", "graduationYear", "gpa"],
        goal: ["intendedDegree", "fieldOfStudy", "intakeYear", "preferredCountries"],
        budget: ["budget", "fundingPlan"],
        readiness: ["greScore"]
      };

      const newTouched = { ...touched };
      stepFields[STEPS[currentStep].id]?.forEach(field => {
        newTouched[field] = true;
      });
      setTouched(newTouched);

      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setSubmitError("");
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSubmitError("");
    }
  };

  const { user, setUser } = useAuth();

  const handleComplete = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await api.post("/onboarding/complete", formData);
      if (response.data.success) {
        setUser(response.data.user);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Onboarding failed:", error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong during onboarding. Please try again.";
      setSubmitError(errorMessage);

      // Scroll to error message
      setTimeout(() => {
        const errorElement = document.getElementById("submit-error");
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format GPA input
  const handleGPAChange = (e) => {
    let value = e.target.value;
    // Allow only numbers and one decimal point
    value = value.replace(/[^\d.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 1) {
      value = parts[0] + '.' + parts[1].slice(0, 1);
    }
    // Ensure value is between 0 and 4.0
    const num = parseFloat(value);
    if (!isNaN(num) && num > 4.0) {
      value = "4.0";
    }
    updateField("gpa", value);
  };

  // Format year input
  const handleYearChange = (field, e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    updateField(field, value);
  };

  // Get field status for styling
  const getFieldStatus = (field) => {
    if (!touched[field]) return "default";
    if (errors[field]) return "error";
    if (formData[field]) return "success";
    return "default";
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "academic":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education Level */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  Current Education Level *
                </label>
                <select
                  id="educationLevel"
                  value={formData.educationLevel}
                  onChange={(e) => updateField("educationLevel", e.target.value)}
                  onBlur={() => handleBlur("educationLevel")}
                  className={cn(
                    "w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all",
                    getFieldStatus("educationLevel") === "error"
                      ? "border-red-500 bg-red-900/20 focus:ring-red-500"
                      : getFieldStatus("educationLevel") === "success"
                        ? "border-green-500 bg-green-900/20 focus:ring-green-500"
                        : "bg-gray-800 border-gray-700 focus:ring-purple-500 text-white"
                  )}
                >
                  <option value="" className="bg-gray-900">Select Level</option>
                  <option value="high-school" className="bg-gray-900">High School</option>
                  <option value="bachelors" className="bg-gray-900">Bachelor's Degree</option>
                  <option value="masters" className="bg-gray-900">Master's Degree</option>
                  <option value="phd" className="bg-gray-900">PhD</option>
                </select>
                {errors.educationLevel && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.educationLevel}</span>
                  </div>
                )}
              </div>

              {/* Major */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  Major / Degree *
                </label>
                <input
                  id="major"
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={formData.major}
                  onChange={(e) => updateField("major", e.target.value)}
                  onBlur={() => handleBlur("major")}
                  className={cn(
                    "w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all",
                    getFieldStatus("major") === "error"
                      ? "border-red-500 bg-red-900/20 focus:ring-red-500"
                      : getFieldStatus("major") === "success"
                        ? "border-green-500 bg-green-900/20 focus:ring-green-500"
                        : "bg-gray-800 border-gray-700 focus:ring-purple-500 text-white"
                  )}
                />
                {errors.major && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.major}</span>
                  </div>
                )}
              </div>

              {/* Graduation Year */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  Graduation Year *
                </label>
                <input
                  id="graduationYear"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="2024"
                  value={formData.graduationYear}
                  onChange={(e) => handleYearChange("graduationYear", e)}
                  onBlur={() => handleBlur("graduationYear")}
                  className={cn(
                    "w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all",
                    getFieldStatus("graduationYear") === "error"
                      ? "border-red-500 bg-red-900/20 focus:ring-red-500"
                      : getFieldStatus("graduationYear") === "success"
                        ? "border-green-500 bg-green-900/20 focus:ring-green-500"
                        : "bg-gray-800 border-gray-700 focus:ring-purple-500 text-white"
                  )}
                />
                {errors.graduationYear && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.graduationYear}</span>
                  </div>
                )}
              </div>

              {/* GPA */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  GPA / Percentage (Optional)
                </label>
                <div className="relative">
                  <input
                    id="gpa"
                    type="text"
                    inputMode="decimal"
                    placeholder="3.8 on 4.0 scale"
                    value={formData.gpa}
                    onChange={handleGPAChange}
                    onBlur={() => handleBlur("gpa")}
                    className={cn(
                      "w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all pr-10",
                      getFieldStatus("gpa") === "error"
                        ? "border-red-500 bg-red-900/20 focus:ring-red-500"
                        : getFieldStatus("gpa") === "success"
                          ? "border-green-500 bg-green-900/20 focus:ring-green-500"
                          : "bg-gray-800 border-gray-700 focus:ring-purple-500 text-white"
                    )}
                  />
                  {getFieldStatus("gpa") === "success" && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {errors.gpa && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.gpa}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Enter GPA on 4.0 scale or percentage (0-100)
                </p>
              </div>
            </div>
          </motion.div>
        );
      case "goal":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Intended Degree */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  Intended Degree *
                </label>
                <select
                  id="intendedDegree"
                  value={formData.intendedDegree}
                  onChange={(e) => updateField("intendedDegree", e.target.value)}
                  onBlur={() => handleBlur("intendedDegree")}
                  className={cn(
                    "w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all",
                    getFieldStatus("intendedDegree") === "error"
                      ? "border-red-500 bg-red-900/20 focus:ring-red-500"
                      : getFieldStatus("intendedDegree") === "success"
                        ? "border-green-500 bg-green-900/20 focus:ring-green-500"
                        : "bg-gray-800 border-gray-700 focus:ring-purple-500 text-white"
                  )}
                >
                  <option value="" className="bg-gray-900">Select Degree</option>
                  <option value="bachelors" className="bg-gray-900">Bachelor's</option>
                  <option value="masters" className="bg-gray-900">Master's</option>
                  <option value="mba" className="bg-gray-900">MBA</option>
                  <option value="phd" className="bg-gray-900">PhD</option>
                </select>
                {errors.intendedDegree && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.intendedDegree}</span>
                  </div>
                )}
              </div>

              {/* Field of Study */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  Field of Study *
                </label>
                <input
                  id="fieldOfStudy"
                  type="text"
                  placeholder="e.g. Data Science, Artificial Intelligence"
                  value={formData.fieldOfStudy}
                  onChange={(e) => updateField("fieldOfStudy", e.target.value)}
                  onBlur={() => handleBlur("fieldOfStudy")}
                  className={cn(
                    "w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all",
                    getFieldStatus("fieldOfStudy") === "error"
                      ? "border-red-500 bg-red-900/20 focus:ring-red-500"
                      : getFieldStatus("fieldOfStudy") === "success"
                        ? "border-green-500 bg-green-900/20 focus:ring-green-500"
                        : "bg-gray-800 border-gray-700 focus:ring-purple-500 text-white"
                  )}
                />
                {errors.fieldOfStudy && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.fieldOfStudy}</span>
                  </div>
                )}
              </div>

              {/* Intake Year */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  Target Intake Year *
                </label>
                <input
                  id="intakeYear"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="2025"
                  value={formData.intakeYear}
                  onChange={(e) => handleYearChange("intakeYear", e)}
                  onBlur={() => handleBlur("intakeYear")}
                  className={cn(
                    "w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all",
                    getFieldStatus("intakeYear") === "error"
                      ? "border-red-500 bg-red-900/20 focus:ring-red-500"
                      : getFieldStatus("intakeYear") === "success"
                        ? "border-green-500 bg-green-900/20 focus:ring-green-500"
                        : "bg-gray-800 border-gray-700 focus:ring-purple-500 text-white"
                  )}
                />
                {errors.intakeYear && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.intakeYear}</span>
                  </div>
                )}
              </div>

              {/* Preferred Countries */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  Preferred Countries *
                </label>
                <input
                  id="preferredCountries"
                  type="text"
                  placeholder="USA, UK, Canada, Australia, Germany"
                  value={formData.preferredCountries}
                  onChange={(e) => updateField("preferredCountries", e.target.value)}
                  onBlur={() => handleBlur("preferredCountries")}
                  className={cn(
                    "w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all",
                    getFieldStatus("preferredCountries") === "error"
                      ? "border-red-500 bg-red-900/20 focus:ring-red-500"
                      : getFieldStatus("preferredCountries") === "success"
                        ? "border-green-500 bg-green-900/20 focus:ring-green-500"
                        : "bg-gray-800 border-gray-700 focus:ring-purple-500 text-white"
                  )}
                />
                {errors.preferredCountries && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.preferredCountries}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Enter comma-separated list of countries
                </p>
              </div>
            </div>
          </motion.div>
        );
      case "budget":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Budget */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-300">
                Annual Budget Range (in USD) *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "<$20k", value: 15000 },
                  { label: "$20k-$40k", value: 30000 },
                  { label: "$40k-$60k", value: 50000 },
                  { label: "$60k+", value: 70000 },
                ].map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => updateField("budget", value)}
                    className={cn(
                      "p-4 rounded-2xl border text-sm font-bold transition-all flex flex-col items-center",
                      formData.budget === value
                        ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-900/30"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500"
                    )}
                  >
                    {label}
                    {formData.budget === value && (
                      <CheckCircle className="w-4 h-4 mt-1" />
                    )}
                  </button>
                ))}
              </div>
              {errors.budget && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.budget}</span>
                </div>
              )}
            </div>

            {/* Funding Plan */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-300">
                Funding Plan *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Self-funded", "Scholarship-dependent", "Loan-dependent"].map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => updateField("fundingPlan", plan)}
                    className={cn(
                      "p-4 rounded-2xl border text-sm font-bold transition-all flex items-center justify-center gap-2",
                      formData.fundingPlan === plan
                        ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-900/30"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500"
                    )}
                  >
                    {plan}
                    {formData.fundingPlan === plan && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
              {errors.fundingPlan && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.fundingPlan}</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      case "readiness":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6">
              {/* English Test Status */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  IELTS / TOEFL Status
                </label>
                <select
                  value={formData.testStatus}
                  onChange={(e) => updateField("testStatus", e.target.value)}
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-white"
                >
                  <option value="not-started" className="bg-gray-900">Not Started</option>
                  <option value="booked" className="bg-gray-900">Booked / Scheduled</option>
                  <option value="completed" className="bg-gray-900">Completed with Score</option>
                </select>
              </div>

              {/* GRE Status */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  GRE / GMAT Status
                </label>
                <select
                  value={formData.greStatus}
                  onChange={(e) => {
                    updateField("greStatus", e.target.value);
                    if (e.target.value !== 'completed') {
                      updateField("greScore", "");
                      const newErrors = { ...errors };
                      delete newErrors.greScore;
                      setErrors(newErrors);
                    }
                  }}
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-white"
                >
                  <option value="not-required" className="bg-gray-900">Not Required</option>
                  <option value="not-started" className="bg-gray-900">Not Started</option>
                  <option value="studying" className="bg-gray-900">Studying / Preparing</option>
                  <option value="completed" className="bg-gray-900">Completed with Score</option>
                </select>
              </div>

              {/* GRE Score - Conditionally shown */}
              {formData.greStatus === 'completed' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300">
                    GRE Score (Optional)
                  </label>
                  <input
                    id="greScore"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g., 320 (260-340)"
                    value={formData.greScore}
                    onChange={(e) => updateField("greScore", e.target.value.replace(/\D/g, '').slice(0, 3))}
                    onBlur={() => handleBlur("greScore")}
                    className={cn(
                      "w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all",
                      getFieldStatus("greScore") === "error"
                        ? "border-red-500 bg-red-900/20 focus:ring-red-500"
                        : getFieldStatus("greScore") === "success"
                          ? "border-green-500 bg-green-900/20 focus:ring-green-500"
                          : "bg-gray-800 border-gray-700 focus:ring-purple-500 text-white"
                    )}
                  />
                  {errors.greScore && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.greScore}</span>
                    </div>
                  )}
                </div>
              )}

              {/* SOP Status */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">
                  Statement of Purpose (SOP) Status
                </label>
                <select
                  value={formData.sopStatus}
                  onChange={(e) => updateField("sopStatus", e.target.value)}
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-white"
                >
                  <option value="not-started" className="bg-gray-900">Not Started</option>
                  <option value="draft" className="bg-gray-900">Draft / In Progress</option>
                  <option value="review" className="bg-gray-900">Under Review</option>
                  <option value="ready" className="bg-gray-900">Finalized & Ready</option>
                </select>
              </div>
            </div>

            {/* Progress Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 bg-blue-900/20 border border-blue-800 rounded-2xl"
            >
              <h4 className="font-semibold text-blue-400 mb-2">Ready to Submit?</h4>
              <p className="text-sm text-blue-300">
                All fields marked with * are required. Your profile will be analyzed by AI to provide personalized recommendations.
              </p>
            </motion.div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    const requiredFields = [
      "educationLevel", "major", "graduationYear",
      "intendedDegree", "fieldOfStudy", "intakeYear",
      "preferredCountries", "budget", "fundingPlan"
    ];

    const filled = requiredFields.filter(field => formData[field]).length;
    return Math.round((filled / requiredFields.length) * 100);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full -z-10" />

      {/* Header */}
      <header className="fixed top-0 w-full bg-gray-900/90 backdrop-blur-xl border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-xl">
              <Compass className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-white">Onboarding</span>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 font-medium">
              {calculateCompletion()}% Complete
            </div>
            <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                style={{ width: `${calculateCompletion()}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="w-full max-w-2xl mt-20">
        {/* Submit Error Message */}
        {submitError && (
          <motion.div
            id="submit-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Submission Error</span>
            </div>
            <p className="text-sm text-red-300 mt-1">{submitError}</p>
          </motion.div>
        )}

        <motion.div
          layout
          className="bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl shadow-purple-900/30 p-8 md:p-12"
        >
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center gap-2 relative">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                    currentStep >= idx
                      ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                      : "bg-gray-800 text-gray-400"
                  )}>
                    <step.icon className="w-5 h-5" />
                    {idx < currentStep && (
                      <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-green-500 bg-gray-900 rounded-full" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] uppercase tracking-wider font-bold text-center",
                    currentStep === idx
                      ? "bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"
                      : "text-gray-400"
                  )}>
                    {step.title}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <div className={cn(
                      "absolute top-5 left-12 w-16 h-0.5 hidden md:block",
                      currentStep > idx
                        ? "bg-gradient-to-r from-purple-600 to-pink-600"
                        : "bg-gray-800"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white mb-2">
                {STEPS[currentStep].title}
              </h2>
              <p className="text-gray-400 text-sm">
                {STEPS[currentStep].id === "academic" && "Tell us about your academic background"}
                {STEPS[currentStep].id === "goal" && "Define your study abroad goals"}
                {STEPS[currentStep].id === "budget" && "Plan your financial strategy"}
                {STEPS[currentStep].id === "readiness" && "Track your application readiness"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-800">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all",
                currentStep === 0
                  ? "opacity-0 cursor-default"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <div className="text-xs text-gray-500">
              Step {currentStep + 1} of {STEPS.length}
            </div>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className={cn(
                "flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all group min-w-[140px] justify-center",
                isSubmitting
                  ? "bg-purple-400 cursor-not-allowed"
                  : Object.keys(errors).length > 0
                    ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-900/30"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-900/30"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : currentStep === STEPS.length - 1 ? (
                <>
                  <span>Complete Profile</span>
                  <Sparkles className="w-5 h-5" />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-xl"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>Please fix the following errors:</span>
              </div>
              <ul className="mt-2 text-sm text-red-300 space-y-1 pl-6">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field} className="list-disc">
                    {message}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col items-center gap-3 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Study Abroad Assistant</span>
          </div>
          <p className="text-xs text-gray-500 max-w-md">
            Your data helps us provide personalized university recommendations and application guidance.
            All information is secure and confidential.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default OnBoarding;