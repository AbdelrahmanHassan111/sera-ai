import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Database, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { consentGiven, onboardingCompleted } = useAppStore();

  useEffect(() => {
    // Redirect if already set up
    if (consentGiven && onboardingCompleted) {
      navigate('/dashboard');
    }
  }, [consentGiven, onboardingCompleted, navigate]);

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-surface to-primary/10">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg className="w-16 h-16" viewBox="0 0 32 32" fill="none">
              <path
                d="M8 4C8 4 12 8 16 8C20 8 24 4 24 4"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8 16C8 16 12 12 16 12C20 12 24 16 24 16"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8 28C8 28 12 24 16 24C20 24 24 28 24 28"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line x1="10" y1="6" x2="22" y2="14" stroke="var(--accent)" strokeWidth="1.5" />
              <line x1="10" y1="14" x2="22" y2="22" stroke="var(--accent)" strokeWidth="1.5" />
            </svg>
            <h1 className="text-6xl font-bold text-primary">SERA AI</h1>
          </div>

          <p className="text-2xl text-gray-700 mb-4">
            Personalized Genetics Health Platform
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Discover how your genetics influence drug responses and disease risks. Get
            AI-powered insights and personalized lifestyle recommendations.
          </p>

          <Button size="lg" onClick={handleGetStarted} className="group">
            Get Started
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mt-20"
        >
          <div className="bg-surface rounded-card shadow-card p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">100% Private</h3>
            <p className="text-gray-600">
              All data stays on your device. No servers, no uploads, complete privacy.
            </p>
          </div>

          <div className="bg-surface rounded-card shadow-card p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">Evidence-Based</h3>
            <p className="text-gray-600">
              40+ pharmacogenomics rules based on clinical research and guidelines.
            </p>
          </div>

          <div className="bg-surface rounded-card shadow-card p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Gemini AI explains findings in simple terms and answers your questions.
            </p>
          </div>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 bg-surface rounded-card shadow-card p-8"
        >
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-text mb-2">Privacy First</h3>
              <p className="text-gray-700 mb-4">
                SERA AI is a <strong>frontend-only</strong> application. Your genetic data never
                leaves your browser.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Data stored locally using IndexedDB</li>
                <li>✓ Optional Gemini AI integration (you provide your own API key)</li>
                <li>✓ Export and import your data anytime</li>
                <li>✓ Delete all data with one click</li>
              </ul>
              <p className="text-sm text-gray-500 mt-4 italic">
                <strong>Disclaimer:</strong> This tool is for educational purposes only and does
                not constitute medical advice. Always consult healthcare professionals before
                making medical decisions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

