import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Shield,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import { geminiClient } from '@/lib/geminiClient';
import { downloadJSON, readFileAsText } from '@/lib/utils';

export const Settings: React.FC = () => {
  const { showToast } = useToast();
  const {
    settings,
    updateSettings,
    setGeminiApiKey,
    clearGeminiApiKey,
    clearAllData,
    exportData,
    importData,
    userProfile,
    updateUserProfile,
  } = useAppStore();

  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [persistKey, setPersistKey] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  // User profile fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');

  useEffect(() => {
    setApiKey(settings.geminiApiKey || '');
    setPersistKey(settings.persistApiKey);
    setName(userProfile.name || '');
    setAge(userProfile.age?.toString() || '');
    setSex(userProfile.sex || '');
  }, [settings, userProfile]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      showToast('Please enter an API key', 'warning');
      return;
    }

    setGeminiApiKey(apiKey, persistKey);
    geminiClient.setApiKey(apiKey, persistKey);
    showToast('API key saved', 'success');
  };

  const handleClearApiKey = () => {
    clearGeminiApiKey();
    geminiClient.clearApiKey();
    setApiKey('');
    showToast('API key cleared', 'info');
  };

  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      showToast('Please enter an API key first', 'warning');
      return;
    }

    setTestingApi(true);
    setTestResult(null);

    try {
      // Temporarily set the API key for testing
      geminiClient.setApiKey(apiKey, false);

      const testPrompt = 'Say "Hello! Your Gemini API key is working perfectly!" in a friendly way.';
      const response = await geminiClient.generate(testPrompt, {
        temperature: 0.7,
        maxTokens: 100,
      });

      if (response.text && response.text.length > 0) {
        setTestResult({
          success: true,
          message: response.text,
        });
        showToast('✅ API key is working!', 'success');
      } else {
        setTestResult({
          success: false,
          message: 'Received empty response from Gemini',
        });
        showToast('API key test failed', 'error');
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Failed to connect to Gemini API',
      });
      showToast(`API test failed: ${error.message}`, 'error');
    } finally {
      setTestingApi(false);
    }
  };

  const handleSaveProfile = () => {
    updateUserProfile({
      name: name.trim() || undefined,
      age: age ? parseInt(age, 10) : undefined,
      sex: (sex as any) || undefined,
    });
    showToast('Profile updated', 'success');
  };

  const handleExport = () => {
    const data = exportData();
    downloadJSON(data, `sera-ai-export-${Date.now()}.json`);
    showToast('Data exported successfully', 'success');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const data = JSON.parse(content);
      importData(data);
      showToast('Data imported successfully', 'success');
    } catch (error: any) {
      showToast(`Import failed: ${error.message}`, 'error');
    }
  };

  const handleClearData = () => {
    clearAllData();
    showToast('All data cleared', 'info');
    setShowClearModal(false);
  };

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-semibold text-text mb-2">Settings</h1>
          <p className="text-gray-600 mb-8">Manage your profile, API keys, and data</p>

          {/* User Profile */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Optional information to personalize recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                />

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="gap-2">
                <Save className="w-4 h-4" />
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Gemini API Key */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Gemini API Key
              </CardTitle>
              <CardDescription>
                Required for AI-powered features. Get your key at{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>
                    Your API key is used directly by your browser to call Gemini. It is never sent
                    to any servers except Google's Gemini API. If you choose to persist the key, it
                    will be stored in your browser's local storage (unencrypted).
                  </p>
                </div>
              </div>

              <div className="relative">
                <Input
                  label="API Key"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={persistKey}
                  onChange={(e) => setPersistKey(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  Store API key in browser (persists across sessions)
                </span>
              </label>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSaveApiKey} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save API Key
                </Button>
                <Button variant="secondary" onClick={handleTestApiKey} loading={testingApi} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Test API Key
                </Button>
                <Button variant="outline" onClick={handleClearApiKey} className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Clear Key
                </Button>
              </div>

              {/* Test Result Display */}
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-lg border-2 ${
                    testResult.success
                      ? 'bg-success/10 border-success text-success'
                      : 'bg-danger/10 border-danger text-danger'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold mb-1">
                        {testResult.success ? '✅ API Key Working!' : '❌ Test Failed'}
                      </p>
                      <p className="text-sm opacity-90">{testResult.message}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export, import, or clear your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button onClick={handleExport} variant="outline" className="gap-2 w-full">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>

                <label className="cursor-pointer">
                  <Button variant="outline" asChild className="...">
                    <a href="/somewhere">Open</a>
                  </Button>
                    <Upload className="w-4 h-4" />
                    Import Data
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <Button
                  onClick={() => setShowClearModal(true)}
                  variant="danger"
                  className="gap-2 w-full"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This will delete all genetic markers, recommendations, and settings (except
                  consent status)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & About */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy & About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-text mb-1">🔒 Local-Only Storage</p>
                <p>
                  All your genetic data is stored locally in your browser using IndexedDB. Nothing
                  is transmitted to external servers.
                </p>
              </div>
              <div>
                <p className="font-semibold text-text mb-1">🤖 AI Integration</p>
                <p>
                  When you provide a Gemini API key, your queries and genetic context are sent to
                  Google's Gemini API for AI responses. Review Google's privacy policy for details.
                </p>
              </div>
              <div>
                <p className="font-semibold text-text mb-1">⚕️ Medical Disclaimer</p>
                <p>
                  SERA AI is for educational purposes only and does not constitute medical advice.
                  Always consult qualified healthcare professionals before making medical decisions.
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  SERA AI v1.0.0 • Built with Vite, React, Three.js, and Gemini AI
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Clear Data Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Data?"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Warning: This action cannot be undone</p>
              <p>
                This will permanently delete all your genetic markers, recommendations, lifestyle
                plan items, chat history, and settings from this browser.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-700">
            Consider exporting your data first if you want to keep a backup.
          </p>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowClearModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearData} className="flex-1">
              Yes, Clear All Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

