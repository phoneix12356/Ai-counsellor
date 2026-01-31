import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Globe,
  Bookmark,
  BookmarkCheck,
  Share2,
  BarChart,
  Target,
  Shield,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  GraduationCap,
  TrendingUp,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import api from "../Config/api";
import { useAuth } from "../context/AuthContext";
import { clsx } from "clsx";

const UniversityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedImage, setSelectedImage] = useState(0);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (id) {
      fetchUniversityDetails();
    }
  }, [id]);

  useEffect(() => {
    if (university) {
      // Generate images based on university data
      const universityImages = [];

      // Add main image if exists
      if (university.imageUrl) {
        universityImages.push({
          id: 0,
          url: university.imageUrl,
          alt: `${university.name} Campus`,
          type: "campus"
        });
      }

      // Add placeholder images (in a real app, these would come from the API)
      const imagePlaceholders = [
        { type: "campus", name: "Main Campus" }
      ];

      imagePlaceholders.forEach((placeholder, index) => {
        if (!university.imageUrl || index > 0) { // Skip if we already have main image
          universityImages.push({
            id: universityImages.length,
            url: `https://source.unsplash.com/featured/?university,${placeholder.type}&sig=${id}${index}`,
            alt: `${university.name} ${placeholder.name}`,
            type: placeholder.type
          });
        }
      });

      setImages(universityImages);
    }
  }, [university, id]);

  // const fetchUniversityDetails = async () => {
  //   try {
  //     setLoading(true);
  //     console.log("Fetching university with ID:", id);
  //     const response = await api.get(`/universities/${id}`);
  //     console.log("University data:", response.data);

  //     if (response.data.success) {
  //       setUniversity(response.data.data);

  //       // Check if already shortlisted (only if user is logged in)
  //       if (user) {
  //         try {
  //           const shortlistResponse = await api.get("/universities/shortlisted");
  //           const shortlistedIds = shortlistResponse.data.data?.map(u => u.id) || [];
  //           setIsShortlisted(shortlistedIds.includes(parseInt(id)));
  //         } catch (shortlistError) {
  //           console.error("Error checking shortlisted status:", shortlistError);
  //         }
  //       }
  //     } else {
  //       console.error("API returned error:", response.data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching university details:", error.response?.data || error.message);
  //     // Try to fetch from local storage as fallback
  //     try {
  //       const allUnis = localStorage.getItem('universities');
  //       if (allUnis) {
  //         const parsed = JSON.parse(allUnis);
  //         const found = parsed.find(u => u.id === parseInt(id));
  //         if (found) {
  //           setUniversity(found);
  //           console.log("Found university in localStorage:", found);
  //         }
  //       }
  //     } catch (e) {
  //       console.error("Failed to get from localStorage:", e);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchUniversityDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching university with ID:", id);
      const response = await api.get(`/universities/${id}`);
      console.log("University data:", response.data);

      if (response.data.success) {
        setUniversity(response.data.data);

        // Check if already shortlisted (only if user is logged in)
        if (user) {
          try {
            const shortlistResponse = await api.get("/universities/shortlisted");
            if (shortlistResponse.data.success) {
              const shortlistedIds = shortlistResponse.data.data?.map(u => u.id) || [];
              setIsShortlisted(shortlistedIds.includes(parseInt(id)));
            }
          } catch (shortlistError) {
            console.error("Error checking shortlisted status:", shortlistError);
            // Don't show error to user, just don't set the shortlisted status
          }
        }
      } else {
        console.error("API returned error:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching university details:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // const toggleShortlist = async () => {
  //   if (!user) {
  //     navigate("/login");
  //     return;
  //   }

  //   try {
  //     if (isShortlisted) {
  //       await api.delete(`/universities/shortlist/${id}`);
  //     } else {
  //       await api.post("/universities/shortlist", { universityId: id });
  //     }
  //     setIsShortlisted(!isShortlisted);
  //   } catch (error) {
  //     console.error("Error toggling shortlist:", error);
  //     alert("Failed to update shortlist. Please try again.");
  //   }
  // };

  const toggleShortlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (isShortlisted) {
        await api.delete(`/universities/shortlist/${id}`);
      } else {
        await api.post("/universities/shortlist", { universityId: id });
      }
      setIsShortlisted(!isShortlisted);
    } catch (error) {
      console.error("Error toggling shortlist:", error);
      alert(error.response?.data?.message || "Failed to update shortlist. Please try again.");
    }
  };

  const getCategory = (score) => {
    if (!score) return { label: "Unknown", color: "from-gray-600 to-gray-800" };
    if (score >= 80) return { label: "Dream", color: "from-purple-600 to-pink-600" };
    if (score >= 60) return { label: "Target", color: "from-blue-600 to-cyan-600" };
    return { label: "Safe", color: "from-green-600 to-emerald-600" };
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: university.name,
        text: `Check out ${university.name} on University Explorer`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading university details...</p>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">University not found</h3>
          <p className="text-gray-400 mb-6">The requested university could not be found.</p>
          <button
            onClick={() => navigate("/universities")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
          >
            Back to Explorer
          </button>
        </div>
      </div>
    );
  }

  const category = getCategory(university.matchScore || 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black -z-10" />

        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/universities")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Explorer
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>

                <button
                  onClick={toggleShortlist}
                  className={clsx(
                    "px-4 py-2 rounded-xl flex items-center gap-2 transition-colors",
                    isShortlisted
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-800 hover:bg-gray-700"
                  )}
                >
                  {isShortlisted ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                  {isShortlisted ? "Shortlisted" : "Shortlist"}
                </button>

                {university.officialWebsite && (
                  <a
                    href={university.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Official Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-8 items-start"
          >
            {/* Left Column */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className={clsx(
                  "px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r",
                  category.color
                )}>
                  {category.label} UNIVERSITY
                </div>
                {university.source === "AI" && (
                  <div className="px-3 py-1 bg-purple-900/30 rounded-full text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Recommended
                  </div>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                {university.name}
              </h1>

              <div className="flex items-center gap-4 text-gray-400 mb-8">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{university.location}, {university.country}</span>
                </div>
                {university.ranking && (
                  <div className="flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    <span className="text-lg">World Rank: #{university.ranking}</span>
                  </div>
                )}
              </div>

              {/* Image Gallery Section */}
              {images.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-purple-500" />
                    <h3 className="text-xl font-bold">Campus Gallery</h3>
                  </div>

                  {/* Main Image */}
                  <div className="relative mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                    <img
                      src={images[selectedImage].url}
                      alt={images[selectedImage].alt}
                      className="w-full h-64 md:h-80 lg:h-96 object-cover transition-opacity duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name)}&background=6d28d9&color=fff&size=512`;
                      }}
                    />
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                      {selectedImage + 1} / {images.length}
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImage(index)}
                          className={clsx(
                            "flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all",
                            selectedImage === index
                              ? "border-purple-500 scale-105"
                              : "border-gray-800 hover:border-gray-600"
                          )}
                        >
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name)}&background=6d28d9&color=fff&size=512`;
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Match Score Card */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Your Match Score</h3>
                    <p className="text-gray-400">Based on your profile and university requirements</p>
                  </div>
                  <div className="text-5xl font-bold" style={{
                    color: `hsl(${(university.matchScore || 0) * 1.2}, 80%, 60%)`
                  }}>
                    {university.matchScore || "N/A"}%
                  </div>
                </div>

                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={clsx("h-full rounded-full", category.color)}
                    style={{ width: `${university.matchScore || 0}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      {university.acceptanceRate || "N/A"}%
                    </div>
                    <div className="text-gray-400 text-sm">Acceptance Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {university.gpaRequirement || "3.0+"}
                    </div>
                    <div className="text-gray-400 text-sm">Avg. GPA Required</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-2">
                      {university.greRequirement || "300+"}
                    </div>
                    <div className="text-gray-400 text-sm">Avg. GRE Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Stats */}
            <div className="w-full lg:w-80 space-y-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-bold mb-4 text-lg">Quick Facts</h3>
                <div className="space-y-4">
                  {university.fees && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400">
                        <DollarSign className="w-5 h-5" />
                        <span>Annual Tuition</span>
                      </div>
                      <div className="font-bold">
                        ${university.fees.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {university.studentCount && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users className="w-5 h-5" />
                        <span>Total Students</span>
                      </div>
                      <div className="font-bold">
                        {university.studentCount.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {university.established && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-5 h-5" />
                        <span>Established</span>
                      </div>
                      <div className="font-bold">
                        {university.established}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Globe className="w-5 h-5" />
                      <span>International Students</span>
                    </div>
                    <div className="font-bold">
                      {university.internationalPercentage || "20"}%
                    </div>
                  </div>

                  {university.imageUrl && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400">
                        <ImageIcon className="w-5 h-5" />
                        <span>Gallery Images</span>
                      </div>
                      <div className="font-bold">
                        {images.length}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-bold mb-4 text-lg">Popular Programs</h3>
                <div className="space-y-3">
                  {(university.popularPrograms ? JSON.parse(university.popularPrograms) : ["Computer Science", "Business Administration", "Data Science"]).map((program, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                      <GraduationCap className="w-5 h-5 text-purple-500" />
                      <span>{program}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campus Images Preview */}
              {images.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                  <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Campus Highlights
                  </h3>
                  <div className="space-y-3">
                    {images.slice(0, 3).map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(image.id)}
                        className="w-full group relative overflow-hidden rounded-xl"
                      >
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name)}&background=6d28d9&color=fff&size=512`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-2 left-3 text-xs font-medium">
                            {image.type.charAt(0).toUpperCase() + image.type.slice(1)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-16 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {["overview", "requirements", "campus", "gallery"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                )}
              >
                {tab === "overview" && "University Overview"}
                {tab === "requirements" && "Admission Requirements"}
                {tab === "campus" && "Campus Life"}
                {tab === "gallery" && "Gallery"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6">About {university.name}</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg text-gray-300 leading-relaxed">
                      {university.description ||
                        `${university.name} is a prestigious institution located in ${university.location}, ${university.country}. 
                       Known for its academic excellence and research contributions, it offers a wide range of undergraduate 
                       and graduate programs across various disciplines.`}
                    </p>

                    {/* Static analysis instead of AI */}
                    <div className="mt-8 p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-800 rounded-2xl">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-bold text-purple-400">Profile Match Analysis</h3>
                      </div>
                      <p className="text-gray-300">
                        Based on your profile, this university is categorized as a <span className="font-bold text-purple-400">{category.label}</span> choice with a match score of <span className="font-bold">{university.matchScore || "N/A"}%</span>.
                        {category.label === "Dream" && " This represents an ambitious target that aligns well with your academic goals."}
                        {category.label === "Target" && " This represents a well-balanced choice that matches your profile effectively."}
                        {category.label === "Safe" && " This represents a realistic choice with good chances of acceptance."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-6">Why Choose {university.name}?</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>World-class faculty and research facilities</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>Strong industry connections and career support</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>Diverse and inclusive campus community</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span>Extensive alumni network across the globe</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-6">Key Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-xl">
                        <span className="text-gray-400">Student-Faculty Ratio</span>
                        <span className="font-bold">{university.studentFacultyRatio || "12:1"}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-xl">
                        <span className="text-gray-400">Research Funding</span>
                        <span className="font-bold">${(university.researchFunding || "500M")}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-xl">
                        <span className="text-gray-400">Graduate Employment Rate</span>
                        <span className="font-bold text-green-500">{university.employmentRate || "95"}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "requirements" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold mb-6">Academic Requirements</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl">
                        <span className="text-gray-400">Minimum GPA</span>
                        <span className="font-bold">{university.gpaRequirement || "3.0/4.0"}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl">
                        <span className="text-gray-400">GRE Requirement</span>
                        <span className="font-bold">{university.greRequirement || "300+"}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl">
                        <span className="text-gray-400">TOEFL/IELTS</span>
                        <span className="font-bold">TOEFL: 90+ / IELTS: 6.5+</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold mb-6">Application Documents</h3>
                    <div className="space-y-3">
                      {["Statement of Purpose", "Letters of Recommendation (2-3)", "Academic Transcripts",
                        "Resume/CV", "Portfolio (if applicable)", "Proof of English Proficiency"].map((doc, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <span>{doc}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "campus" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-6">Student Life</h3>
                    <p className="text-gray-300 mb-6">
                      {university.name} offers a vibrant campus life with over {university.clubsCount || "200"} student organizations,
                      ranging from academic clubs to cultural associations and sports teams.
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-900/50 rounded-xl">
                        <div className="font-bold mb-2">Housing Options</div>
                        <p className="text-gray-300 text-sm">On-campus dormitories, apartments, and off-campus housing assistance</p>
                      </div>
                      <div className="p-4 bg-gray-900/50 rounded-xl">
                        <div className="font-bold mb-2">Career Services</div>
                        <p className="text-gray-300 text-sm">Dedicated career center with internship placement, job fairs, and alumni networking</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-6">Location Benefits</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-900/50 rounded-xl">
                        <div className="font-bold mb-2">Industry Connections</div>
                        <p className="text-gray-300 text-sm">
                          Located in {university.location}, providing access to major companies and internship opportunities
                        </p>
                      </div>
                      <div className="p-4 bg-gray-900/50 rounded-xl">
                        <div className="font-bold mb-2">Cultural Experience</div>
                        <p className="text-gray-300 text-sm">
                          Rich cultural scene with museums, theaters, and diverse culinary options
                        </p>
                      </div>
                      <div className="p-4 bg-gray-900/50 rounded-xl">
                        <div className="font-bold mb-2">Transportation</div>
                        <p className="text-gray-300 text-sm">
                          Excellent public transportation system and bike-friendly campus
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Campus Gallery</h2>
                  <p className="text-gray-300 mb-8">
                    Explore the beautiful campus of {university.name} through our photo gallery.
                    Get a glimpse of the state-of-the-art facilities, vibrant student life, and scenic surroundings.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-purple-500 transition-all duration-300"
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(university.name)}&background=6d28d9&color=fff&size=512`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="text-lg font-bold mb-1">
                            {image.type.charAt(0).toUpperCase() + image.type.slice(1)}
                          </div>
                          <div className="text-sm text-gray-300">
                            {university.name} Campus
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {images.length === 0 && (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Images Available</h3>
                    <p className="text-gray-400">
                      Campus images for {university.name} will be available soon.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UniversityDetail;