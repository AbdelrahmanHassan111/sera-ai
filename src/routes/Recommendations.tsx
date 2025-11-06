import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, CheckCircle, XCircle, Heart, MessageCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import { geminiClient } from '@/lib/geminiClient';
import { getCategoryIcon, getConfidenceColor, downloadJSON, generateId } from '@/lib/utils';
import type { Recommendation, LifestylePlanItem } from '@/types/domain';

export const Recommendations: React.FC = () => {
  const { showToast } = useToast();
  const {
    recommendations,
    updateRecommendation,
    acceptRecommendation,
    declineRecommendation,
    addLifestylePlanItem,
    settings,
  } = useAppStore();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');

  // Filter recommendations
  const filteredRecs = recommendations.filter((rec) => {
    if (filterCategory !== 'all' && rec.category !== filterCategory) return false;
    if (filterConfidence !== 'all' && rec.confidence !== filterConfidence) return false;
    return true;
  });

  const categories = Array.from(new Set(recommendations.map((r) => r.category)));

  const handleAccept = (id: string) => {
    acceptRecommendation(id);
    showToast('Recommendation accepted', 'success');
  };

  const handleDecline = (id: string) => {
    declineRecommendation(id);
    showToast('Recommendation declined', 'info');
  };

  const handleSaveToPlan = (rec: Recommendation) => {
    const planItem: LifestylePlanItem = {
      id: generateId('plan'),
      title: `${rec.gene}: ${rec.rsid}`,
      description: rec.explanation,
      frequency: rec.category === 'drug' ? 'screening' : 'monthly',
      category: rec.category === 'drug' ? 'medication' : 'screening',
      completed: false,
      linkedRecommendationId: rec.id,
    };

    addLifestylePlanItem(planItem);
    updateRecommendation(rec.id, { status: 'saved' });
    showToast('Added to lifestyle plan', 'success');
  };

  const handleAskAI = async (rec: Recommendation) => {
    setSelectedRec(rec);
    setAiExplanation('');
    setIsAskingAI(true);

    try {
      const hasKey = settings.geminiApiKey || geminiClient.hasApiKey();

      if (hasKey && settings.geminiApiKey) {
        geminiClient.setApiKey(settings.geminiApiKey, settings.persistApiKey);
      }

      const prompt = `
Please explain this genetic finding in simple, patient-friendly language:

Gene: ${rec.gene}
Variant: ${rec.rsid}
Category: ${rec.category}
Finding: ${rec.explanation}

Provide:
1. What this means in everyday terms
2. Why it matters for the patient
3. Practical next steps (emphasize consulting healthcare providers)

Keep it reassuring, clear, and under 200 words.
      `.trim();

      let fullResponse = '';
      await geminiClient.generate(prompt, {
        stream: true,
        onToken: (token) => {
          fullResponse += token;
          setAiExplanation(fullResponse);
        },
        onComplete: (text) => {
          setAiExplanation(text);
          updateRecommendation(rec.id, {
            patientFriendlyExplanation: text,
            geminiRefined: true,
          });
        },
      });
    } catch (error: any) {
      showToast(`AI error: ${error.message}`, 'error');
      setAiExplanation('Unable to generate AI explanation. Please check your API key in Settings.');
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleExport = (rec: Recommendation) => {
    downloadJSON(rec, `recommendation-${rec.rsid}-${Date.now()}.json`);
    showToast('Recommendation exported', 'success');
  };

  if (recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">No Recommendations Yet</h3>
            <p className="text-gray-600 mb-6">
              Add genetic markers and generate recommendations from your dashboard.
            </p>
            <Button onClick={() => window.history.back()}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-semibold text-text mb-2">Recommendations</h1>
          <p className="text-gray-600 mb-8">
            Review {filteredRecs.length} personalized recommendations based on your genetic profile
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Confidence:</span>
              <select
                value={filterConfidence}
                onChange={(e) => setFilterConfidence(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            {filteredRecs.map((rec) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`border-l-4 ${
                    rec.confidence === 'high'
                      ? 'border-l-red-500'
                      : rec.confidence === 'medium'
                      ? 'border-l-yellow-500'
                      : 'border-l-green-500'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-text mb-1">
                            {rec.gene}: {rec.rsid}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge
                              variant={
                                rec.confidence === 'high'
                                  ? 'danger'
                                  : rec.confidence === 'medium'
                                  ? 'warning'
                                  : 'success'
                              }
                              size="sm"
                            >
                              {rec.confidence} confidence
                            </Badge>
                            <Badge variant="default" size="sm">
                              {rec.category}
                            </Badge>
                            {rec.status !== 'pending' && (
                              <Badge variant="primary" size="sm">
                                {rec.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-11">
                      <p className="text-gray-700 mb-3">{rec.explanation}</p>

                      {rec.patientFriendlyExplanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-blue-900 mb-1 flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            AI Explanation
                          </p>
                          <p className="text-sm text-blue-800">{rec.patientFriendlyExplanation}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {rec.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleAccept(rec.id)}
                              className="gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDecline(rec.id)}
                              className="gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Decline
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveToPlan(rec)}
                          className="gap-1"
                        >
                          <Heart className="w-4 h-4" />
                          Save to Plan
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAskAI(rec)}
                          className="gap-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Ask AI
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExport(rec)}
                          className="gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Explanation Modal */}
      <Modal
        isOpen={selectedRec !== null}
        onClose={() => setSelectedRec(null)}
        title="AI Explanation"
        size="lg"
      >
        {selectedRec && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700">
                {selectedRec.gene}: {selectedRec.rsid}
              </p>
              <p className="text-xs text-gray-600 mt-1">{selectedRec.explanation}</p>
            </div>

            {isAskingAI && !aiExplanation && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Generating explanation...</p>
                </div>
              </div>
            )}

            {aiExplanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 whitespace-pre-wrap">{aiExplanation}</p>
              </div>
            )}

            {!isAskingAI && !aiExplanation && (
              <p className="text-sm text-gray-600">Click "Ask AI" to generate an explanation.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

