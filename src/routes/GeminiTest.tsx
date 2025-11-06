import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { geminiClient } from '@/lib/geminiClient';

export const GeminiTest: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [testPrompt, setTestPrompt] = useState('Hello! Can you introduce yourself?');
  const [isTestingNonStream, setIsTestingNonStream] = useState(false);
  const [isTestingStream, setIsTestingStream] = useState(false);
  const [nonStreamResult, setNonStreamResult] = useState<any>(null);
  const [streamResult, setStreamResult] = useState<any>(null);
  const [streamingText, setStreamingText] = useState('');

  const testNonStreaming = async () => {
    if (!apiKey.trim()) {
      setNonStreamResult({ success: false, error: 'Please enter API key' });
      return;
    }

    setIsTestingNonStream(true);
    setNonStreamResult(null);

    try {
      geminiClient.setApiKey(apiKey, false);
      
      console.log('🧪 Testing NON-STREAMING...');
      console.log('Model:', 'gemini-1.5-flash');
      console.log('Prompt:', testPrompt);

      const response = await geminiClient.generate(testPrompt, {
        stream: false,
        temperature: 0.7,
        maxTokens: 200,
      });

      console.log('✅ Response:', response);

      setNonStreamResult({
        success: true,
        response: response.text,
        usage: response.usage,
      });
    } catch (error: any) {
      console.error('❌ Error:', error);
      setNonStreamResult({
        success: false,
        error: error.message,
        fullError: error.toString(),
      });
    } finally {
      setIsTestingNonStream(false);
    }
  };

  const testStreaming = async () => {
    if (!apiKey.trim()) {
      setStreamResult({ success: false, error: 'Please enter API key' });
      return;
    }

    setIsTestingStream(true);
    setStreamResult(null);
    setStreamingText('');

    try {
      geminiClient.setApiKey(apiKey, false);
      
      console.log('🧪 Testing STREAMING...');
      console.log('Model:', 'gemini-1.5-flash');
      console.log('Prompt:', testPrompt);

      let fullText = '';

      await geminiClient.generate(testPrompt, {
        stream: true,
        temperature: 0.7,
        maxTokens: 200,
        onToken: (token) => {
          console.log('📥 Token:', token);
          fullText += token;
          setStreamingText(fullText);
        },
        onComplete: (text) => {
          console.log('✅ Complete:', text);
          setStreamResult({
            success: true,
            response: text,
          });
        },
        onError: (error) => {
          console.error('❌ Stream Error:', error);
          setStreamResult({
            success: false,
            error: error.message,
          });
        },
      });
    } catch (error: any) {
      console.error('❌ Error:', error);
      setStreamResult({
        success: false,
        error: error.message,
        fullError: error.toString(),
      });
    } finally {
      setIsTestingStream(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">🧪 Gemini API Test</h1>
            <p className="text-text-secondary">Debug Gemini integration and test API calls</p>
          </div>

          {/* Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Gemini API Key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
              />
              
              <div>
                <label className="block text-sm font-medium text-text mb-2">Test Prompt</label>
                <textarea
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="bg-info/10 border border-info/30 rounded-lg p-4">
                <p className="text-sm text-info font-medium mb-2">📝 Debug Info:</p>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>• Model: <code>gemini-1.5-flash</code></li>
                  <li>• Endpoint: <code>https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash</code></li>
                  <li>• Check browser console for detailed logs</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Test Non-Streaming */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>2. Test Non-Streaming API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={testNonStreaming}
                loading={isTestingNonStream}
                disabled={!apiKey.trim()}
                className="w-full"
              >
                Test Non-Streaming
              </Button>

              {nonStreamResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 ${
                    nonStreamResult.success
                      ? 'bg-success/10 border-success'
                      : 'bg-danger/10 border-danger'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {nonStreamResult.success ? (
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold mb-2">
                        {nonStreamResult.success ? 'Success!' : 'Error'}
                      </p>
                      {nonStreamResult.response && (
                        <div className="bg-white/50 p-3 rounded text-sm mb-2">
                          <strong>Response:</strong>
                          <p className="mt-1">{nonStreamResult.response}</p>
                        </div>
                      )}
                      {nonStreamResult.error && (
                        <div className="bg-white/50 p-3 rounded text-sm">
                          <strong>Error:</strong>
                          <p className="mt-1 font-mono text-xs">{nonStreamResult.error}</p>
                          {nonStreamResult.fullError && (
                            <p className="mt-1 font-mono text-xs opacity-70">{nonStreamResult.fullError}</p>
                          )}
                        </div>
                      )}
                      {nonStreamResult.usage && (
                        <div className="text-xs mt-2 opacity-70">
                          Tokens: {nonStreamResult.usage.totalTokens} total
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Test Streaming */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>3. Test Streaming API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={testStreaming}
                loading={isTestingStream}
                disabled={!apiKey.trim()}
                variant="secondary"
                className="w-full"
              >
                Test Streaming
              </Button>

              {streamingText && isTestingStream && (
                <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Streaming response...</p>
                  <p className="text-sm">{streamingText}<span className="animate-pulse">▋</span></p>
                </div>
              )}

              {streamResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 ${
                    streamResult.success
                      ? 'bg-success/10 border-success'
                      : 'bg-danger/10 border-danger'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {streamResult.success ? (
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold mb-2">
                        {streamResult.success ? 'Streaming Complete!' : 'Streaming Error'}
                      </p>
                      {streamResult.response && (
                        <div className="bg-white/50 p-3 rounded text-sm">
                          <strong>Final Response:</strong>
                          <p className="mt-1">{streamResult.response}</p>
                        </div>
                      )}
                      {streamResult.error && (
                        <div className="bg-white/50 p-3 rounded text-sm">
                          <strong>Error:</strong>
                          <p className="mt-1 font-mono text-xs">{streamResult.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-text-secondary">
                <div>
                  <strong className="text-text">1. Get API Key:</strong>
                  <p>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener" className="text-primary hover:underline">https://makersuite.google.com/app/apikey</a></p>
                </div>
                <div>
                  <strong className="text-text">2. Check Console:</strong>
                  <p>Open browser DevTools (F12) → Console tab to see detailed logs</p>
                </div>
                <div>
                  <strong className="text-text">3. Common Errors:</strong>
                  <ul className="ml-4 mt-1 list-disc">
                    <li>HTTP 400: Invalid API key or request format</li>
                    <li>HTTP 403: API key doesn't have permission</li>
                    <li>HTTP 404: Wrong model name</li>
                    <li>HTTP 429: Rate limit exceeded</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-text">4. Verify:</strong>
                  <p>Both tests should succeed if your API key is valid</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

