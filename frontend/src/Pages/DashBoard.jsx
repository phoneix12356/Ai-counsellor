import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, TrendingUp, CheckCircle, Target, BookOpen, ArrowRight, MessageSquare, Briefcase, Sparkles, School, FileText, Plus, LogOut, Compass, Search, Bell, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch Onboarding Data
  useEffect(() => {
    // Simulate fetching or use user context
    if (user?.onboarding) {
      setProfileData(user.onboarding);
    }
    setLoading(false);
  }, [user]);

  if (loading) return <div className="flex justify-center items-center h-screen bg-black text-white">Loading...</div>;

  const currentStage = profileData?.currentStage || 1;
  const profileScore = profileData?.profileScore || 0;

  // Stages Configuration
  const stages = [
    { id: 1, label: "Profile", icon: <TrendingUp size={20} /> },
    { id: 2, label: "Discover", icon: <Target size={20} /> },
    { id: 3, label: "Shortlist", icon: <CheckCircle size={20} /> },
    { id: 4, label: "Apply", icon: <BookOpen size={20} /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-900 selection:text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-gray-800 hidden lg:flex flex-col fixed h-full z-50">
        <div className="p-6 flex items-center gap-3">
          <GraduationCap className="text-purple-500 w-8 h-8" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">AI Counsellor</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "overview", label: "Overview", icon: Compass },
            { id: "counsellor", label: "AI Chatbot", icon: MessageSquare },
            { id: "profile", label: "Profile", icon: User },
            { id: "university", label: "University", icon: GraduationCap },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "counsellor") {
                  navigate("/counsellor");
                } else if (item.id === "profile") {
                  navigate("/profile-update");
                } else if (item.id === "university") {
                  navigate("/universities");
                }
                else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id
                ? "bg-purple-900/20 text-purple-400 border border-purple-500/20"
                : "text-gray-500 hover:bg-gray-900 hover:text-white"
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-900/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 min-h-screen relative">
        {/* Decoration */}
        <div className="absolute top-0 left-0 w-full h-96 bg-purple-900/10 blur-[120px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">
          {/* Header Area */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight">
                Dashboard
              </h2>
              <p className="text-gray-400 mt-2">Track your progress and AI insights</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="font-bold text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 uppercase">Student Account</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-lg ring-2 ring-white/10">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Progress Stepper */}
          <section className="relative py-8">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -z-10 transform -translate-y-1/2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-1000 ease-out"
                style={{ width: `${((currentStage - 1) / (stages.length - 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between w-full max-w-4xl mx-auto px-4">
              {stages.map((stage) => {
                const isActive = stage.id <= currentStage;
                const isCompleted = stage.id < currentStage;
                return (
                  <div key={stage.id} className="flex flex-col items-center gap-3 bg-black px-2 z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive
                        ? "bg-black border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-110"
                        : "bg-black border-gray-700 text-gray-600"
                        }`}
                    >
                      {isCompleted ? <CheckCircle size={20} className="text-green-500" /> : stage.icon}
                    </div>
                    <span
                      className={`text-xs font-bold tracking-wide transition-colors ${isActive ? "text-white" : "text-gray-600"
                        }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Card */}
            <div className="col-span-1 bg-gray-900/50 border border-gray-800 rounded-3xl p-8 hover:bg-gray-900 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-purple-600/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-gray-400 font-medium mb-4 flex items-center gap-2">
                <TrendingUp size={18} /> Profile Strength
              </h3>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                  {profileScore}
                </span>
                <span className="text-xl text-gray-500 mb-2">/100</span>
              </div>
              {/* Score Bar */}
              <div className="w-full h-2 bg-gray-800 rounded-full mt-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-1000"
                  style={{ width: `${profileScore}%` }}
                />
              </div>
              <p className="mt-4 text-sm text-gray-400">
                {profileScore >= 80 ? "Exceptional! Aim for Ivy Leagues." :
                  profileScore >= 60 ? "Strong profile. Good for Top 50." :
                    "Keep improving. Focus on GRE/GPA."}
              </p>
            </div>

            {/* AI Analysis Card */}
            <div className="col-span-2 bg-gray-900/50 border border-gray-800 rounded-3xl p-8 hover:border-purple-500/30 transition-all">
              <h3 className="text-gray-400 font-medium mb-4 flex items-center gap-2">
                <MessageSquare size={18} /> AI Analysis
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-xl text-gray-200 leading-relaxed font-light italic">
                  "{profileData?.profileAnalysis || "Your profile looks promising! Complete all sections to get a detailed AI analysis of your admission chances."}"
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {/* Chips for quick stats */}
                <div className="px-4 py-2 bg-gray-800 rounded-full text-sm font-medium text-gray-300 border border-gray-700">
                  GPA: {profileData?.gpa || "N/A"}
                </div>
                <div className="px-4 py-2 bg-gray-800 rounded-full text-sm font-medium text-gray-300 border border-gray-700">
                  GRE: {profileData?.greScore || "Not taken"}
                </div>
                <div className="px-4 py-2 bg-gray-800 rounded-full text-sm font-medium text-gray-300 border border-gray-700">
                  Budget: ${profileData?.budget?.toLocaleString() || "0"}
                </div>
              </div>
            </div>
          </div>

          {/* Action Modules */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {/* Discover Module */}
            <Link to="/universities" className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8 rounded-3xl hover:border-blue-500/50 transition-all flex flex-col justify-between h-64 shadow-lg shadow-black/50">
              <div>
                <div className="w-14 h-14 bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <Target size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Discover Universities</h3>
                <p className="text-gray-400">View Dream, Target, and Safe schools curated by AI based on your profile.</p>
              </div>
              <div className="flex items-center text-blue-400 font-bold group-hover:gap-2 transition-all">
                Explore Recommendations <ArrowRight size={18} className="ml-2" />
              </div>
            </Link>

            {/* Application Guide Module (Locked if stage < 4) */}
            {currentStage < 4 ? (
              <div className="bg-gray-900/30 border border-gray-800 p-8 rounded-3xl opacity-50 cursor-not-allowed h-64 flex flex-col justify-between grayscale">
                <div>
                  <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-500 mb-6">
                    <Briefcase size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-500 mb-2">Application Guide</h3>
                  <p className="text-gray-600">Lock a university to unlock your personalized application checklist.</p>
                </div>
              </div>
            ) : (
              <Link to="/application-guide" className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8 rounded-3xl hover:border-green-500/50 transition-all flex flex-col justify-between h-64 shadow-lg shadow-black/50">
                <div>
                  <div className="w-14 h-14 bg-green-900/20 rounded-2xl flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <CheckCircle size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Application Guide</h3>
                  <p className="text-gray-400">Track your SOPs, LORs, and deadlines for your locked university.</p>
                </div>
                <div className="flex items-center text-green-400 font-bold group-hover:gap-2 transition-all">
                  View Checklist <ArrowRight size={18} className="ml-2" />
                </div>
              </Link>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
