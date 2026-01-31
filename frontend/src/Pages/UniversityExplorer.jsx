import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  MapPin,
  GraduationCap,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Shield,
  Target,
  Sparkles,
  ArrowLeft,
  Plus,
  X,
  Globe,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  BarChart,
  Bookmark as BookmarkIcon // Added for filter icon
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../Config/api";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const UniversityExplorer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    country: "",
    category: "",
    minScore: 0,
    maxFees: null,
    sortBy: "score",
    shortlistedOnly: false // Added new filter
  });
  const [showFilters, setShowFilters] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [aiRecommendedIds, setAiRecommendedIds] = useState(new Set());
  const [error, setError] = useState("");

  // Countries for filter
  const countries = [
    "USA", "UK", "Canada", "Australia", "Germany",
    "France", "Netherlands", "Sweden", "Switzerland", "Japan",
    "Singapore", "China", "Ireland", "New Zealand", "Italy",
    "Spain", "Denmark", "Norway", "Finland", "Austria"
  ];

  // Categories
  const categories = [
    { id: "dream", label: "Dream Universities", color: "from-purple-600 to-pink-600" },
    { id: "target", label: "Target Universities", color: "from-blue-600 to-cyan-600" },
    { id: "safe", label: "Safe Universities", color: "from-green-600 to-emerald-600" },
  ];

  useEffect(() => {
    fetchUniversities();

    if (user) {
      fetchShortlisted();
      fetchAIGenerated();
    }
  }, [user]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const response = await api.get("/universities");
      setUniversities(response.data.data || []);
    } catch (error) {
      console.error("Error fetching universities:", error);
      setError("Failed to load universities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlisted = async () => {
    if (!user) return;

    try {
      const response = await api.get("/universities/shortlisted");
      if (response.data.success) {
        const shortlisted = response.data.data || [];
        const validIds = shortlisted
          .filter(u => u && typeof u.id === 'number')
          .map(u => u.id);
        setShortlistedIds(new Set(validIds));
      }
    } catch (error) {
      console.error("Error fetching shortlisted:", error.response?.data || error.message);
    }
  };

  const fetchAIGenerated = async () => {
    if (!user) return;

    try {
      const response = await api.get("/universities/ai/recommendations");
      console.log("AI recommendations response:", response.data);

      if (response.data.success && response.data.data) {
        const data = response.data.data;

        // Extract all AI recommended university IDs
        let aiIds = [];

        if (data.recommendations) {
          // Flatten all recommendations
          const allRecommendations = [
            ...(data.recommendations.dream || []),
            ...(data.recommendations.target || []),
            ...(data.recommendations.safe || [])
          ];
          console.log("Flattened AI recommendations:", allRecommendations);
          aiIds = allRecommendations
            .filter(aiUni => aiUni && aiUni.id)
            .map(aiUni => aiUni.id);
        } else if (Array.isArray(data)) {
          aiIds = data
            .filter(aiUni => aiUni && aiUni.id)
            .map(aiUni => aiUni.id);
        }

        setAiRecommendedIds(new Set(aiIds));
      }
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      setAiRecommendedIds(new Set());
    }
  };

  const toggleShortlist = async (universityId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const isCurrentlyShortlisted = shortlistedIds.has(universityId);

      if (isCurrentlyShortlisted) {
        await api.delete(`/universities/shortlist/${universityId}`);
        setShortlistedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(universityId);
          return newSet;
        });
      } else {
        await api.post("/universities/shortlist", { universityId });
        setShortlistedIds(prev => new Set(prev).add(universityId));
      }

    } catch (error) {
      console.error("Error toggling shortlist:", error);
      alert("Failed to update shortlist. Please try again.");
    }
  };

  const handleViewDetails = (university) => {
    navigate(`/university/${university.id}`);
  };

  // Filter and sort universities
  const filteredUniversities = universities.filter(university => {
    if (!university || !university.name) return false;

    // Shortlisted filter (only show if user is logged in)
    if (filters.shortlistedOnly && user) {
      if (!shortlistedIds.has(university.id)) {
        return false;
      }
    }

    // Search filter
    if (searchTerm && !university.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !university.country?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Country filter
    if (filters.country && university.country !== filters.country) {
      return false;
    }

    // Category filter
    if (filters.category) {
      const score = university.matchScore || 0;
      if (filters.category === "dream" && score < 80) return false;
      if (filters.category === "target" && (score < 60 || score >= 80)) return false;
      if (filters.category === "safe" && score >= 60) return false;
    }

    // Score filter
    if (filters.minScore > 0 && (university.matchScore || 0) < filters.minScore) {
      return false;
    }

    // Fees filter
    if (filters.maxFees && university.fees && university.fees > filters.maxFees) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case "score":
        return (b.matchScore || 0) - (a.matchScore || 0);
      case "ranking":
        return (a.ranking || 9999) - (b.ranking || 9999);
      case "fees":
        return (a.fees || 9999999) - (b.fees || 9999999);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Get category based on score
  const getCategory = (score) => {
    if (score >= 80) return "dream";
    if (score >= 60) return "target";
    return "safe";
  };

  const getCategoryColor = (score) => {
    const category = getCategory(score);
    switch (category) {
      case "dream": return "bg-gradient-to-r from-purple-600 to-pink-600";
      case "target": return "bg-gradient-to-r from-blue-600 to-cyan-600";
      case "safe": return "bg-gradient-to-r from-green-600 to-emerald-600";
      default: return "bg-gray-600";
    }
  };

  const getCategoryIcon = (score) => {
    const category = getCategory(score);
    switch (category) {
      case "dream": return <Sparkles className="w-4 h-4" />;
      case "target": return <Target className="w-4 h-4" />;
      case "safe": return <Shield className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      country: "",
      category: "",
      minScore: 0,
      maxFees: null,
      sortBy: "score",
      shortlistedOnly: false
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading universities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-8 h-8 text-purple-500" />
                <h1 className="text-2xl font-bold">University Explorer</h1>
              </div>
              {user && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-purple-900/30 rounded-full text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Recommendations</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Login to Save
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="hidden md:block px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Back to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-200">{error}</p>
              <button
                onClick={() => setError("")}
                className="ml-auto px-3 py-1 bg-red-800 hover:bg-red-700 rounded-lg text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Authentication Alert */}
        {!user && (
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <p className="text-yellow-200">
                Login to access AI recommendations, shortlist universities, and save your preferences.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="ml-auto px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search universities by name, country, or program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors",
                showFilters
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-gray-900 border-gray-800 hover:bg-gray-800"
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilters(prev => ({
                  ...prev,
                  category: prev.category === cat.id ? "" : cat.id
                }))}
                className={cn(
                  "px-4 py-2 rounded-xl border transition-all",
                  filters.category === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white border-transparent`
                    : "bg-gray-900 border-gray-800 hover:bg-gray-800"
                )}
              >
                {cat.label}
              </button>
            ))}

            {/* Shortlisted Filter Button - Only show if user is logged in */}
            {user && (
              <button
                onClick={() => setFilters(prev => ({
                  ...prev,
                  shortlistedOnly: !prev.shortlistedOnly
                }))}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
                  filters.shortlistedOnly
                    ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-transparent"
                    : "bg-gray-900 border-gray-800 hover:bg-gray-800",
                  !user && "opacity-50 cursor-not-allowed"
                )}
                disabled={!user}
                title={!user ? "Login to use shortlist filter" : "Show only shortlisted universities"}
              >
                <BookmarkIcon className="w-4 h-4" />
                Shortlisted Only
                {filters.shortlistedOnly && (
                  <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {shortlistedIds.size}
                  </span>
                )}
              </button>
            )}

            <div className="ml-auto flex items-center gap-4">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="score">Sort by Match Score</option>
                <option value="ranking">Sort by World Ranking</option>
                <option value="fees">Sort by Tuition Fees</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
                    <select
                      value={filters.country}
                      onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Countries</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Minimum Match Score: {filters.minScore}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.minScore}
                      onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) }))}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Max Annual Fees: {filters.maxFees ? `$${filters.maxFees.toLocaleString()}` : "No limit"}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="5000"
                      value={filters.maxFees || 0}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        maxFees: e.target.value ? parseInt(e.target.value) : null
                      }))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  {/* Shortlisted Filter in Advanced Filters */}
                  <div className="flex flex-col justify-end">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="shortlistedFilter"
                        checked={filters.shortlistedOnly}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          shortlistedOnly: e.target.checked
                        }))}
                        disabled={!user}
                        className="w-5 h-5 accent-yellow-600"
                      />
                      <label htmlFor="shortlistedFilter" className={cn(
                        "text-sm font-medium",
                        !user ? "text-gray-500" : "text-gray-400"
                      )}>
                        Show only shortlisted
                        {!user && <span className="ml-2 text-xs text-yellow-500">(Login required)</span>}
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Display */}
          {(filters.country || filters.category || filters.minScore > 0 || filters.maxFees || filters.shortlistedOnly) && (
            <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-900/30 border border-gray-800 rounded-2xl">
              <span className="text-sm text-gray-400">Active filters:</span>

              {filters.country && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/30 rounded-full text-sm">
                  <Globe className="w-3 h-3" />
                  Country: {filters.country}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, country: "" }))}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {filters.category && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-900/30 rounded-full text-sm">
                  <Target className="w-3 h-3" />
                  Category: {categories.find(c => c.id === filters.category)?.label}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, category: "" }))}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {filters.minScore > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-900/30 rounded-full text-sm">
                  <BarChart className="w-3 h-3" />
                  Min Score: {filters.minScore}%
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, minScore: 0 }))}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {filters.maxFees && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/30 rounded-full text-sm">
                  <DollarSign className="w-3 h-3" />
                  Max Fees: ${filters.maxFees.toLocaleString()}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, maxFees: null }))}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {filters.shortlistedOnly && (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900/30 rounded-full text-sm">
                  <BookmarkIcon className="w-3 h-3" />
                  Shortlisted Only
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, shortlistedOnly: false }))}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button
                onClick={handleClearFilters}
                className="ml-auto px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl font-bold">{filteredUniversities.length}</div>
            <div className="text-gray-400 text-sm">Universities Found</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-purple-400">
              {filteredUniversities.filter(u => getCategory(u.matchScore || 0) === "dream").length}
            </div>
            <div className="text-gray-400 text-sm">Dream Universities</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-blue-400">
              {filteredUniversities.filter(u => getCategory(u.matchScore || 0) === "target").length}
            </div>
            <div className="text-gray-400 text-sm">Target Universities</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-green-400">
              {filteredUniversities.filter(u => getCategory(u.matchScore || 0) === "safe").length}
            </div>
            <div className="text-gray-400 text-sm">Safe Universities</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-yellow-400">
              {user ? shortlistedIds.size : "0"}
            </div>
            <div className="text-gray-400 text-sm">Shortlisted</div>
          </div>
        </div>

        {/* University Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUniversities.length > 0 ? (
            filteredUniversities.map((university, index) => (
              <motion.div
                key={`${university.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col">
                  {/* University Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1",
                          getCategoryColor(university.matchScore || 0)
                        )}>
                          {getCategoryIcon(university.matchScore || 0)}
                          {getCategory(university.matchScore || 0).toUpperCase()}
                        </div>
                        {/* AI Recommended Badge */}
                        {user && aiRecommendedIds.has(university.id) && (
                          <div className="px-2 py-1 bg-purple-900/30 rounded-full text-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Recommended
                          </div>
                        )}
                        {/* Shortlisted Badge */}
                        {user && shortlistedIds.has(university.id) && (
                          <div className="px-2 py-1 bg-yellow-900/30 rounded-full text-xs flex items-center gap-1">
                            <BookmarkIcon className="w-3 h-3" />
                            Shortlisted
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-purple-400 transition-colors">
                        {university.name}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{university.location}, {university.country}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleShortlist(university.id)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                      title={user
                        ? (shortlistedIds.has(university.id) ? "Remove from shortlist" : "Add to shortlist")
                        : "Login to shortlist"
                      }
                      disabled={!user}
                    >
                      {user && shortlistedIds.has(university.id) ? (
                        <BookmarkCheck className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <Bookmark className={cn(
                          "w-5 h-5",
                          user ? "text-gray-500 hover:text-yellow-500" : "text-gray-700"
                        )} />
                      )}
                    </button>
                  </div>

                  {/* University Image */}
                  <div className="relative w-full h-48 mb-4 overflow-hidden rounded-xl">
                    {university.imageUrl ? (
                      <img
                        src={university.imageUrl}
                        alt={university.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name)}&background=6d28d9&color=fff&size=512`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center">
                        <GraduationCap className="w-16 h-16 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  {/* Match Score */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-400">Match Score</span>
                      <span className="text-2xl font-bold" style={{
                        color: `hsl(${(university.matchScore || 0) * 1.2}, 80%, 60%)`
                      }}>
                        {university.matchScore || "N/A"}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", getCategoryColor(university.matchScore || 0))}
                        style={{ width: `${university.matchScore || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <BarChart className="w-4 h-4" />
                        <span>World Ranking</span>
                      </div>
                      <div className="text-lg font-bold">
                        {university.ranking ? `#${university.ranking}` : "Not ranked"}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <DollarSign className="w-4 h-4" />
                        <span>Annual Fees</span>
                      </div>
                      <div className="text-lg font-bold">
                        {university.fees ? `$${university.fees.toLocaleString()}` : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Description Preview */}
                  {university.description && (
                    <div className="mb-6 flex-1">
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {university.description}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-auto pt-4 border-t border-gray-800">
                    <button
                      onClick={() => handleViewDetails(university)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4" />
                      View Details
                    </button>

                    {university.officialWebsite && (
                      <a
                        href={university.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center"
                        title="Visit official website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">
                {filters.shortlistedOnly ? "No shortlisted universities found" : "No universities found"}
              </h3>
              <p className="text-gray-400 mb-6">
                {filters.shortlistedOnly && user
                  ? "You haven't shortlisted any universities yet. Try adding some from the list."
                  : "Try adjusting your filters or search term"}
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UniversityExplorer;