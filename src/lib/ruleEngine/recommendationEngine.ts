/**
 * Recommendation Engine
 * 
 * Evaluates genetic markers against rules to generate personalized recommendations.
 * Integrates with Gemini AI for patient-friendly explanations.
 */

import type { GeneticMarker, GeneticRule, Recommendation, UserProfile } from '@/types/domain';
import { geneticRules } from './geneticRules';
import { geminiClient } from '../geminiClient';

interface EvaluationOptions {
  useGemini?: boolean;
  maxRecommendations?: number;
}

/**
 * Evaluate genetic markers against rule database
 */
export async function evaluateGenetics(
  markers: GeneticMarker[],
  userProfile?: UserProfile,
  options: EvaluationOptions = {}
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];
  const { useGemini = false, maxRecommendations = 50 } = options;

  // Create marker lookup map for efficient matching
  const markerMap = new Map<string, GeneticMarker>();
  markers.forEach(marker => {
    markerMap.set(marker.rsid, marker);
  });

  // Evaluate each rule
  for (const rule of geneticRules) {
    for (const rsid of rule.rsids) {
      const marker = markerMap.get(rsid);
      if (!marker) continue;

      // Check if genotype matches pattern
      if (matchesGenotypePattern(marker.genotype, rule.genotypePattern)) {
        // Apply user-specific modifiers
        const adjustedConfidence = applyUserModifiers(rule, userProfile);
        
        recommendations.push({
          id: `rec-${rule.id}-${rsid}-${Date.now()}`,
          ruleId: rule.id,
          gene: rule.gene,
          rsid: rsid,
          category: rule.category,
          title: `${rule.gene}: ${rule.implication.substring(0, 50)}...`,
          explanation: rule.recommendation,
          confidence: adjustedConfidence,
          actions: generateActions(rule),
          status: 'pending',
          createdAt: Date.now(),
          geminiRefined: false,
        });

        // Only match one rsid per rule to avoid duplicates
        break;
      }
    }
  }

  // Sort by confidence and weight
  recommendations.sort((a, b) => {
    const weightA = geneticRules.find(r => r.id === a.ruleId)?.weight || 0.5;
    const weightB = geneticRules.find(r => r.id === b.ruleId)?.weight || 0.5;
    return weightB - weightA;
  });

  // Limit number of recommendations
  const limited = recommendations.slice(0, maxRecommendations);

  // Optionally enhance with Gemini
  if (useGemini && geminiClient.hasApiKey()) {
    await enhanceWithGemini(limited);
  }

  return limited;
}

/**
 * Check if genotype matches rule pattern
 */
function matchesGenotypePattern(
  genotype: string,
  pattern: string | string[]
): boolean {
  const normalized = genotype.toUpperCase().replace(/[^ACGT]/g, '');
  
  if (Array.isArray(pattern)) {
    return pattern.some(p => {
      const normalizedPattern = p.toUpperCase().replace(/[^ACGT]/g, '');
      return normalized === normalizedPattern || 
             normalized === reverseGenotype(normalizedPattern);
    });
  }
  
  const normalizedPattern = pattern.toUpperCase().replace(/[^ACGT]/g, '');
  return normalized === normalizedPattern || 
         normalized === reverseGenotype(normalizedPattern);
}

/**
 * Reverse genotype for matching (e.g., AG === GA)
 */
function reverseGenotype(genotype: string): string {
  return genotype.split('').reverse().join('');
}

/**
 * Apply user-specific modifiers to confidence score
 */
function applyUserModifiers(
  rule: GeneticRule,
  userProfile?: UserProfile
): 'low' | 'medium' | 'high' {
  if (!userProfile) return rule.confidence;

  let confidence = rule.confidence;
  
  // Age modifiers for certain conditions
  if (userProfile.age) {
    if (rule.category === 'cancer' && userProfile.age > 50) {
      // Higher concern for cancer markers in older individuals
      if (confidence === 'medium') confidence = 'high';
    }
    
    if (rule.category === 'metabolic' && userProfile.age < 30) {
      // Lower immediate concern for younger individuals
      if (confidence === 'high') confidence = 'medium';
    }
  }

  // Medication interaction modifiers
  if (userProfile.medications && userProfile.medications.length > 0) {
    if (rule.category === 'drug') {
      // Check if user is on related medications
      const relatedDrugs = ['warfarin', 'clopidogrel', 'statin', 'plavix', 'coumadin'];
      const isRelevant = userProfile.medications.some(med => 
        relatedDrugs.some(drug => med.toLowerCase().includes(drug))
      );
      if (isRelevant && confidence === 'medium') {
        confidence = 'high';
      }
    }
  }

  return confidence;
}

/**
 * Generate actionable items for a recommendation
 */
function generateActions(rule: GeneticRule): string[] {
  const actions: string[] = [];

  switch (rule.category) {
    case 'drug':
      actions.push('Discuss with physician before starting new medications');
      actions.push('Add to medical record');
      actions.push('Inform pharmacist');
      if (rule.confidence === 'high') {
        actions.push('Consider wearing medical alert bracelet');
      }
      break;

    case 'cancer':
      actions.push('Schedule genetic counseling consultation');
      actions.push('Discuss enhanced screening with oncologist');
      actions.push('Inform family members of hereditary risk');
      break;

    case 'disease':
      actions.push('Discuss with primary care physician');
      actions.push('Consider preventive screening');
      actions.push('Implement lifestyle modifications');
      break;

    case 'metabolic':
      actions.push('Schedule bloodwork to assess current status');
      actions.push('Consult with dietitian for meal planning');
      actions.push('Establish exercise routine');
      break;

    case 'lifestyle':
      actions.push('Implement recommended modifications');
      actions.push('Track progress in health journal');
      break;
  }

  actions.push('Save to lifestyle plan');
  actions.push('Export for medical records');

  return actions;
}

/**
 * Enhance recommendations with Gemini AI explanations
 */
async function enhanceWithGemini(recommendations: Recommendation[]): Promise<void> {
  // Process in batches to avoid rate limits
  const batchSize = 5;
  
  for (let i = 0; i < recommendations.length; i += batchSize) {
    const batch = recommendations.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (rec) => {
        try {
          const prompt = `
You are a genetic counselor explaining test results to a patient.

Genetic finding:
- Gene: ${rec.gene}
- Variant: ${rec.rsid}
- Technical explanation: ${rec.explanation}

Provide a SHORT (2-3 sentences), patient-friendly explanation that:
1. Explains what this means in simple terms
2. Mentions practical implications
3. Emphasizes consulting healthcare providers for medical decisions

Keep it reassuring and educational. Do not make specific medical recommendations.
          `.trim();

          const response = await geminiClient.generate(prompt, {
            temperature: 0.7,
            maxTokens: 200,
          });

          if (response.text) {
            rec.patientFriendlyExplanation = response.text;
            rec.geminiRefined = true;
          }
        } catch (error) {
          console.error(`Failed to enhance recommendation ${rec.id}:`, error);
          // Continue without Gemini enhancement
        }
      })
    );

    // Rate limiting: wait between batches
    if (i + batchSize < recommendations.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Calculate overall risk score
 */
export function calculateRiskScore(recommendations: Recommendation[]): {
  overall: number;
  byCategory: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  let totalWeight = 0;
  let weightedSum = 0;

  recommendations.forEach(rec => {
    const rule = geneticRules.find(r => r.id === rec.ruleId);
    if (!rule) return;

    const weight = rule.weight || 0.5;
    const confidenceScore = rec.confidence === 'high' ? 1.0 : rec.confidence === 'medium' ? 0.6 : 0.3;
    const score = weight * confidenceScore;

    weightedSum += score;
    totalWeight += weight;

    byCategory[rec.category] = (byCategory[rec.category] || 0) + score;
  });

  const overall = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

  return { overall, byCategory };
}

/**
 * Generate prioritized action list
 */
export function generatePrioritizedActions(recommendations: Recommendation[]): string[] {
  const actions: string[] = [];
  const highPriority = recommendations.filter(r => r.confidence === 'high');
  
  if (highPriority.length > 0) {
    actions.push('⚠️ High Priority Actions:');
    highPriority.slice(0, 3).forEach(rec => {
      actions.push(`  • ${rec.gene}: ${rec.explanation.substring(0, 80)}...`);
    });
  }

  const drugRelated = recommendations.filter(r => r.category === 'drug');
  if (drugRelated.length > 0) {
    actions.push('💊 Medication Considerations:');
    actions.push(`  • Discuss ${drugRelated.length} pharmacogenomic findings with physician`);
  }

  const cancerRelated = recommendations.filter(r => r.category === 'cancer');
  if (cancerRelated.length > 0) {
    actions.push('🧬 Genetic Counseling Recommended:');
    actions.push(`  • ${cancerRelated.length} hereditary cancer risk markers identified`);
  }

  return actions;
}

