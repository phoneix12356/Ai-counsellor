import React from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Cpu,
  Lock,
  CheckCircle2,
  PlayCircle
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DECISION_STEPS = [
  {
    step: "01",
    title: "Profile Build",
    desc: "Mandatory onboarding to analyze academic and budget gaps.",
    icon: GraduationCap,
  },
  {
    step: "02",
    title: "AI Discovery",
    desc: "Smart shortlisting based on Dream, Target, and Safe criteria.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "University Lock",
    desc: "Commit to a choice to unlock specialized application tasks.",
    icon: Lock,
  },
  {
    step: "04",
    title: "Execution",
    desc: "AI-driven to-dos for SOPs, transcripts, and visa readiness.",
    icon: CheckCircle2,
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-900">
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-xl shadow-lg shadow-purple-200/20">
              <Compass className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AI Counsellor
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#logic"
              className="text-sm font-medium text-gray-400 hover:text-purple-400 transition-colors"
            >
              How it Works
            </a>
            <div className="h-6 w-px bg-gray-800" />
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 active:scale-95"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <header className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-900/20 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full -z-10" />

        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-800 text-purple-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-lg shadow-purple-900/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Stage-Based Admission System</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            Plan your study-abroad journey with a{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              guided AI counsellor.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Stop browsing aimlessly. Move through a structured execution system that builds your profile, shortlists universities, and locks your path to success.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button
              onClick={() => navigate("/register")}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-purple-700 hover:to-blue-700 hover:shadow-2xl hover:shadow-purple-500/20 transition-all group active:scale-[0.98]"
            >
              <span>Sign Up</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      </header>

      {/* ================= LOGIC ================= */}
      <section id="logic" className="py-24 bg-gray-900/30 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold mb-6 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              The Decision Framework
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Our prototype enforces a linear path. Each stage unlocks the next to ensure complete clarity.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {DECISION_STEPS.map((item) => (
              <motion.div
                key={item.step}
                variants={fadeInUp}
                className="group relative p-8 rounded-3xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800/50 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-black rounded-2xl shadow-sm border border-gray-800 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                    <item.icon className="w-6 h-6 text-purple-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-4xl font-black text-gray-800 group-hover:text-purple-900/30 transition-colors">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-16 px-4 border-t border-gray-800 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-lg">
                <Compass className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                AI Counsellor
              </span>
            </div>

            <p className="text-gray-500 text-sm font-medium">
              © 2026 AI Counsellor Hackathon Project
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;