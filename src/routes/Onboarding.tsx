import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/store/useAppStore';

const steps = [
  {
    title: 'Welcome to SERA AI',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">
          SERA AI helps you understand your genetic data and its implications for medication
          responses and health risks.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> All data is stored locally on your device. Nothing is sent
            to external servers (except optional Gemini AI API calls when you provide your own API
            key).
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Privacy & Consent',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">Before proceeding, please understand:</p>
        <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
          <li>Your genetic data is stored locally using browser storage (IndexedDB)</li>
          <li>No data is transmitted to any servers owned by SERA AI</li>
          <li>
            If you enable Gemini AI, your queries are sent to Google's Gemini API (you provide your
            own API key)
          </li>
          <li>This is an educational tool and does not replace medical advice</li>
          <li>You can export, import, or delete your data at any time</li>
        </ul>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-medium">
            Medical Disclaimer: This tool is for educational and informational purposes only.
            Always consult qualified healthcare professionals before making medical decisions.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'How to Add Your Data',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">You have two options to input your genetic data:</p>
        <div className="space-y-3">
          <div className="bg-surface border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-text mb-2">1. Upload Genetics File</h4>
            <p className="text-sm text-gray-600">
              Upload a JSON or text file containing your genetic markers (rsIDs and genotypes).
            </p>
          </div>
          <div className="bg-surface border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-text mb-2">2. Manual Entry</h4>
            <p className="text-sm text-gray-600">
              Manually enter genetic markers one by one using our form interface.
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Not sure where to get genetic data? Services like 23andMe, AncestryDNA, and others
          provide raw data downloads.
        </p>
      </div>
    ),
  },
  {
    title: 'Ready to Start!',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">You're all set! Here's what you can do:</p>
        <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
          <li>Upload or manually enter your genetic data</li>
          <li>Generate personalized recommendations based on pharmacogenomics rules</li>
          <li>Create a lifestyle plan tailored to your genetic profile</li>
          <li>Chat with AI assistant for explanations and guidance</li>
          <li>Export your data and recommendations for medical records</li>
        </ul>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-primary font-medium">
            🎉 Click "Finish" to access your dashboard and get started!
          </p>
        </div>
      </div>
    ),
  },
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setConsentGiven, setOnboardingCompleted } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const handleNext = () => {
    if (currentStep === 1) {
      // Show consent modal on privacy step
      setShowConsentModal(true);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finish onboarding
      finishOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishOnboarding = () => {
    setOnboardingCompleted(true);
    navigate('/dashboard');
  };

  const handleConsent = (accepted: boolean) => {
    if (accepted) {
      setConsentGiven(true);
      setShowConsentModal(false);
      setCurrentStep(currentStep + 1);
    } else {
      setShowConsentModal(false);
      navigate('/');
    }
  };

  const step = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg to-primary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface rounded-card shadow-card max-w-2xl w-full p-8"
      >
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((_, index) => (
            <div key={index} className="flex-1">
              <div
                className={`h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-semibold text-text mb-4">{step.title}</h2>
            <div className="text-gray-600 mb-8">{step.content}</div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>

          <Button onClick={handleNext} className="gap-2">
            {currentStep === steps.length - 1 ? (
              <>
                Finish
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Consent Modal */}
      <Modal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        title="Privacy Consent Required"
        size="lg"
        closeOnOverlayClick={false}
        showCloseButton={false}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            By proceeding, you acknowledge and agree to the following:
          </p>
          <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
            <li>I understand my data is stored locally on my device only</li>
            <li>I understand this is an educational tool, not medical advice</li>
            <li>
              I will consult healthcare professionals before making medical decisions based on this
              information
            </li>
            <li>
              I understand that if I enable Gemini AI features, my queries will be sent to
              Google's API
            </li>
            <li>I am responsible for the security of my own API keys</li>
          </ul>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => handleConsent(false)} className="flex-1">
              Decline
            </Button>
            <Button onClick={() => handleConsent(true)} className="flex-1">
              I Accept
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

