import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload,
  Database,
  Sparkles,
  FileDown,
  AlertTriangle,
  TrendingUp,
  Activity,
  Heart,
  Zap,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import { Helix3DEnhanced } from '@/components/helix3d/Helix3DEnhanced';
import { evaluateGenetics, calculateRiskScore } from '@/lib/ruleEngine/recommendationEngine';
import { downloadJSON, getCategoryIcon, generateId } from '@/lib/utils';
import type { Recommendation } from '@/types/domain';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    geneticMarkers,
    recommendations,
    addRecommendations,
    userProfile,
    exportData,
    settings,
  } = useAppStore();

  const hasMarkers = geneticMarkers.length > 0;
  const hasRecommendations = recommendations.length > 0;

  const riskScore = hasRecommendations ? calculateRiskScore(recommendations) : null;

  const handleGenerateRecommendations = async () => {
    if (geneticMarkers.length === 0) {
      showToast('Please add genetic markers first', 'warning');
      return;
    }

    setIsGenerating(true);

    try {
      const useGemini = settings.geminiApiKey && settings.geminiApiKey.length > 0;
      const newRecs = await evaluateGenetics(geneticMarkers, userProfile, {
        useGemini,
        maxRecommendations: 50,
      });

      addRecommendations(newRecs);
      showToast(`✅ Generated ${newRecs.length} recommendations!`, 'success');
      
      // Auto-generate lifestyle plan from high-priority recommendations
      const highPriorityRecs = newRecs.filter(r => r.confidence === 'high' || r.confidence === 'medium');
      if (highPriorityRecs.length > 0) {
        generateLifestylePlan(highPriorityRecs);
      }
      
      if (newRecs.length > 0) {
        setTimeout(() => navigate('/recommendations'), 800);
      }
    } catch (error: any) {
      showToast(`Failed to generate recommendations: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLifestylePlan = (recommendations: Recommendation[]) => {
    const { addLifestylePlanItem } = useAppStore.getState();
    
    recommendations.slice(0, 10).forEach((rec) => {
      const frequency = rec.category === 'drug' ? 'screening' : 
                       rec.category === 'cancer' ? 'monthly' :
                       rec.category === 'metabolic' ? 'weekly' : 'daily';
      
      const category = rec.category === 'drug' ? 'medication' :
                      rec.category === 'cancer' ? 'screening' :
                      rec.category === 'metabolic' ? 'diet' : 'lifestyle';
      
      addLifestylePlanItem({
        id: generateId('plan'),
        title: `${rec.gene}: ${rec.rsid}`,
        description: rec.explanation,
        frequency: frequency as any,
        category: category as any,
        completed: false,
        linkedRecommendationId: rec.id,
      });
    });
    
    showToast('📅 Lifestyle plan created!', 'success');
  };

  const handleExportData = () => {
    const data = exportData();
    downloadJSON(data, `sera-ai-export-${Date.now()}.json`);
    showToast('Data exported successfully', 'success');
  };

  // Get top 5 high-priority recommendations
  const topRecommendations = recommendations
    .filter((r) => r.confidence === 'high')
    .slice(0, 5);

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-5xl font-bold mb-3">
                {userProfile.name ? `Welcome back, ${userProfile.name}!` : 'Dashboard'}
              </h1>
              <p className="text-text-secondary text-lg">
                Your personalized genetics health insights
              </p>
            </div>
            
            {hasMarkers && (
              <div className="flex gap-3">
                <Button
                  onClick={handleGenerateRecommendations}
                  loading={isGenerating}
                  size="lg"
                  className="gap-2 shadow-glow"
                >
                  <Sparkles className="w-5 h-5" />
                  {hasRecommendations ? 'Regenerate' : 'Generate'} Insights
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats Grid - Reorganized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          {/* Stat Card 1 */}
          <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="hover:shadow-glow transition-all border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-muted uppercase tracking-wide">Genetic Markers</p>
                    <p className="text-4xl font-bold text-primary mt-2">
                      {geneticMarkers.length}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">Uploaded variants</p>
                  </div>
                  <div className="bg-gradient-to-br from-primary/20 to-primary-light/20 p-4 rounded-2xl">
                    <Database className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stat Card 2 */}
          <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="hover:shadow-glow-secondary transition-all border-l-4 border-l-secondary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-muted uppercase tracking-wide">Insights</p>
                    <p className="text-4xl font-bold text-secondary mt-2">
                      {recommendations.length}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">Total recommendations</p>
                  </div>
                  <div className="bg-gradient-to-br from-secondary/20 to-secondary-light/20 p-4 rounded-2xl">
                    <Sparkles className="w-8 h-8 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stat Card 3 */}
          <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="hover:shadow-glow transition-all border-l-4 border-l-danger">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-muted uppercase tracking-wide">High Priority</p>
                    <p className="text-4xl font-bold text-danger mt-2">
                      {topRecommendations.length}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">Requires attention</p>
                  </div>
                  <div className="bg-gradient-to-br from-danger/20 to-red-500/20 p-4 rounded-2xl">
                    <AlertTriangle className="w-8 h-8 text-danger" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stat Card 4 */}
          <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="hover:shadow-glow-accent transition-all border-l-4 border-l-accent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-muted uppercase tracking-wide">Health Score</p>
                    <p className="text-4xl font-bold text-accent mt-2">
                      {riskScore ? Math.round(riskScore.overall) : '-'}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">Overall assessment</p>
                  </div>
                  <div className="bg-gradient-to-br from-accent/20 to-accent-light/20 p-4 rounded-2xl">
                    <TrendingUp className="w-8 h-8 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* No Data State */}
        {!hasMarkers && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center py-16 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Get Started</h2>
                  <p className="text-text-secondary mb-8 text-lg">
                    Upload your genetic data or enter markers manually to unlock personalized insights
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate('/upload')} size="lg" className="gap-2">
                      <Upload className="w-5 h-5" />
                      Upload Genetics
                    </Button>
                    <Button onClick={() => navigate('/manual')} variant="outline" size="lg" className="gap-2">
                      <Database className="w-5 h-5" />
                      Manual Entry
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Grid */}
        {hasMarkers && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - 3D Helix (Larger) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Activity className="w-7 h-7 text-primary" />
                        3D Genetic Visualization
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Interactive DNA helix showing your genetic markers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Helix3DEnhanced
                    markers={geneticMarkers}
                    recommendations={recommendations}
                    animate={true}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Actions & Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-surface/90 to-surface/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasMarkers && (
                    <>
                      <Button
                        onClick={handleGenerateRecommendations}
                        loading={isGenerating}
                        variant="primary"
                        className="w-full justify-start gap-3 h-14 text-base shadow-glow"
                      >
                        <Sparkles className="w-5 h-5" />
                        {hasRecommendations ? 'Regenerate Insights' : 'Generate Insights'}
                      </Button>

                      <Button
                        onClick={() => navigate('/recommendations')}
                        variant="secondary"
                        className="w-full justify-start gap-3 h-14 text-base"
                        disabled={!hasRecommendations}
                      >
                        <Target className="w-5 h-5" />
                        View All Recommendations
                      </Button>

                      <Button
                        onClick={() => navigate('/lifestyle')}
                        variant="outline"
                        className="w-full justify-start gap-3 h-14 text-base"
                        disabled={!hasRecommendations}
                      >
                        <Heart className="w-5 h-5" />
                        Lifestyle Planner
                      </Button>

                      <Button
                        onClick={handleExportData}
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12 text-sm"
                      >
                        <FileDown className="w-4 h-4" />
                        Export Data
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* High Priority Findings */}
              {topRecommendations.length > 0 && (
                <Card className="border-2 border-danger/30 bg-gradient-to-br from-danger/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-danger">
                      <AlertTriangle className="w-6 h-6 animate-pulse" />
                      High Priority
                    </CardTitle>
                    <CardDescription>
                      {topRecommendations.length} findings require attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {topRecommendations.map((rec, index) => (
                        <motion.div
                          key={rec.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-white rounded-xl border-2 border-danger/20 hover:border-danger/40 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => navigate('/recommendations')}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-bold text-text text-sm">
                                  {rec.gene}
                                </p>
                                <Badge variant="danger" size="sm">
                                  {rec.confidence}
                                </Badge>
                              </div>
                              <p className="text-xs text-text-muted mb-2">{rec.rsid}</p>
                              <p className="text-sm text-text-secondary line-clamp-2">
                                {rec.explanation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <Button
                      onClick={() => navigate('/recommendations')}
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                    >
                      View All Recommendations →
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Category Breakdown */}
              {riskScore && Object.keys(riskScore.byCategory).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      Risk by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(riskScore.byCategory).map(([category, score]) => {
                        const percentage = Math.min((score as number) * 100, 100);
                        const colorClass = percentage > 70 ? 'bg-danger' : percentage > 40 ? 'bg-warning' : 'bg-success';
                        
                        return (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-text capitalize flex items-center gap-2">
                                <span className="text-lg">{getCategoryIcon(category)}</span>
                                {category}
                              </span>
                              <span className="text-sm font-bold text-primary">
                                {Math.round((score as number) * 10) / 10}
                              </span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={`h-full ${colorClass} rounded-full transition-all`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
