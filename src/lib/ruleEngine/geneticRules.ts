/**
 * Genetic Rules Database
 * 
 * This file contains pharmacogenomics and disease predisposition rules.
 * Based on clinical research - FOR EDUCATIONAL PURPOSES ONLY.
 * 
 * DISCLAIMER: This is not medical advice. Always consult healthcare professionals.
 */

import type { GeneticRule } from '@/types/domain';

export const geneticRules: GeneticRule[] = [
  // ========== PHARMACOGENOMICS - CYP2D6 ==========
  {
    id: 'CYP2D6-PM',
    gene: 'CYP2D6',
    rsids: ['rs3892097', 'rs1065852'],
    genotypePattern: ['TT', 'AA'],
    category: 'drug',
    implication: 'Poor metabolizer - reduced ability to process many common medications',
    recommendation: 'Consider lower doses of CYP2D6-substrate drugs (codeine, tramadol, some antidepressants). Consult physician before starting these medications.',
    confidence: 'high',
    evidenceUrl: 'https://www.pharmgkb.org/gene/PA128',
    weight: 0.9,
  },
  {
    id: 'CYP2D6-UM',
    gene: 'CYP2D6',
    rsids: ['rs1065852'],
    genotypePattern: 'CC',
    category: 'drug',
    implication: 'Ultra-rapid metabolizer - faster drug breakdown than average',
    recommendation: 'May require higher doses for therapeutic effect. Increased risk of side effects with prodrugs like codeine.',
    confidence: 'high',
    evidenceUrl: 'https://www.pharmgkb.org/gene/PA128',
    weight: 0.9,
  },

  // ========== PHARMACOGENOMICS - CYP2C9 ==========
  {
    id: 'CYP2C9-WARFARIN',
    gene: 'CYP2C9',
    rsids: ['rs1799853'],
    genotypePattern: ['CT', 'TT'],
    category: 'drug',
    implication: 'Reduced warfarin metabolism - increased bleeding risk',
    recommendation: 'If prescribed warfarin, may need 20-40% lower dose. More frequent INR monitoring recommended.',
    confidence: 'high',
    evidenceUrl: 'https://www.pharmgkb.org/gene/PA126',
    weight: 0.95,
  },
  {
    id: 'CYP2C9-NSAID',
    gene: 'CYP2C9',
    rsids: ['rs1057910'],
    genotypePattern: ['AC', 'CC'],
    category: 'drug',
    implication: 'Altered NSAID metabolism',
    recommendation: 'Potentially increased sensitivity to NSAIDs (ibuprofen, celecoxib). Use lowest effective dose.',
    confidence: 'medium',
    evidenceUrl: 'https://www.pharmgkb.org/gene/PA126',
    weight: 0.7,
  },

  // ========== PHARMACOGENOMICS - CYP2C19 ==========
  {
    id: 'CYP2C19-PM',
    gene: 'CYP2C19',
    rsids: ['rs4244285'],
    genotypePattern: ['AA'],
    category: 'drug',
    implication: 'Poor metabolizer of clopidogrel (Plavix) - reduced effectiveness',
    recommendation: 'Alternative antiplatelet agents (prasugrel, ticagrelor) may be more effective. Discuss with cardiologist.',
    confidence: 'high',
    evidenceUrl: 'https://www.pharmgkb.org/gene/PA124',
    weight: 0.95,
  },
  {
    id: 'CYP2C19-PPI',
    gene: 'CYP2C19',
    rsids: ['rs4244285'],
    genotypePattern: ['GA', 'AA'],
    category: 'drug',
    implication: 'Reduced metabolism of proton pump inhibitors (PPIs)',
    recommendation: 'May have increased PPI effectiveness. Lower doses may be sufficient for acid reflux.',
    confidence: 'medium',
    weight: 0.6,
  },

  // ========== PHARMACOGENOMICS - CYP3A5 ==========
  {
    id: 'CYP3A5-TACROLIMUS',
    gene: 'CYP3A5',
    rsids: ['rs776746'],
    genotypePattern: ['CC'],
    category: 'drug',
    implication: 'Non-expresser - affects tacrolimus (immunosuppressant) dosing',
    recommendation: 'If receiving tacrolimus post-transplant, may need lower doses than average.',
    confidence: 'high',
    evidenceUrl: 'https://www.pharmgkb.org/gene/PA131',
    weight: 0.85,
  },

  // ========== PHARMACOGENOMICS - VKORC1 ==========
  {
    id: 'VKORC1-WARFARIN-SENSITIVE',
    gene: 'VKORC1',
    rsids: ['rs9923231'],
    genotypePattern: ['AA'],
    category: 'drug',
    implication: 'Highly sensitive to warfarin - significant dose reduction needed',
    recommendation: 'Require 30-50% lower warfarin dose. Increased bleeding risk with standard dosing. Close monitoring essential.',
    confidence: 'high',
    evidenceUrl: 'https://www.pharmgkb.org/gene/PA133787052',
    weight: 0.95,
  },
  {
    id: 'VKORC1-WARFARIN-NORMAL',
    gene: 'VKORC1',
    rsids: ['rs9923231'],
    genotypePattern: ['TT'],
    category: 'drug',
    implication: 'Typical warfarin sensitivity',
    recommendation: 'Standard warfarin dosing protocols appropriate. Regular INR monitoring still required.',
    confidence: 'high',
    weight: 0.5,
  },

  // ========== PHARMACOGENOMICS - TPMT ==========
  {
    id: 'TPMT-DEFICIENT',
    gene: 'TPMT',
    rsids: ['rs1800462', 'rs1800460'],
    genotypePattern: ['CT', 'TT', 'AG', 'GG'],
    category: 'drug',
    implication: 'Reduced TPMT activity - severe toxicity risk with thiopurines',
    recommendation: 'Use 10% of standard dose for azathioprine, mercaptopurine, thioguanine. Consider alternative immunosuppressants.',
    confidence: 'high',
    evidenceUrl: 'https://www.pharmgkb.org/gene/PA356',
    weight: 1.0,
  },

  // ========== PHARMACOGENOMICS - SLCO1B1 ==========
  {
    id: 'SLCO1B1-STATIN',
    gene: 'SLCO1B1',
    rsids: ['rs4149056'],
    genotypePattern: ['TC', 'CC'],
    category: 'drug',
    implication: 'Increased risk of statin-induced myopathy',
    recommendation: 'Use lower doses of simvastatin/atorvastatin or consider alternative statins (pravastatin, rosuvastatin).',
    confidence: 'high',
    evidenceUrl: 'https://www.pharmgkb.org/gene/PA134865839',
    weight: 0.85,
  },

  // ========== PHARMACOGENOMICS - CYP1A2 ==========
  {
    id: 'CYP1A2-CAFFEINE',
    gene: 'CYP1A2',
    rsids: ['rs762551'],
    genotypePattern: ['AC', 'CC'],
    category: 'lifestyle',
    implication: 'Slow caffeine metabolizer - increased cardiovascular risk with high intake',
    recommendation: 'Limit caffeine to <200mg/day. May experience prolonged caffeine effects (insomnia, jitters).',
    confidence: 'medium',
    weight: 0.6,
  },
  {
    id: 'CYP1A2-CLOZAPINE',
    gene: 'CYP1A2',
    rsids: ['rs762551'],
    genotypePattern: ['CC'],
    category: 'drug',
    implication: 'Slow clozapine metabolism',
    recommendation: 'May require lower clozapine doses. Increased monitoring for side effects.',
    confidence: 'medium',
    weight: 0.7,
  },

  // ========== DISEASE RISK - BRCA1/BRCA2 (Cancer) ==========
  {
    id: 'BRCA1-RISK',
    gene: 'BRCA1',
    rsids: ['rs1799966', 'rs799917'],
    genotypePattern: ['AG', 'GG', 'CT', 'TT'],
    category: 'cancer',
    implication: 'Increased breast and ovarian cancer risk',
    recommendation: 'Consider enhanced screening: annual mammography + MRI starting age 30, discuss with oncologist. Genetic counseling recommended.',
    confidence: 'high',
    evidenceUrl: 'https://www.cancer.gov/about-cancer/causes-prevention/genetics/brca-fact-sheet',
    weight: 0.9,
  },
  {
    id: 'BRCA2-RISK',
    gene: 'BRCA2',
    rsids: ['rs144848'],
    genotypePattern: ['CT', 'TT'],
    category: 'cancer',
    implication: 'Elevated breast, ovarian, pancreatic, and prostate cancer risk',
    recommendation: 'Enhanced screening protocol. Consider genetic counseling for family planning. Discuss preventive options with specialist.',
    confidence: 'high',
    evidenceUrl: 'https://www.cancer.gov/about-cancer/causes-prevention/genetics/brca-fact-sheet',
    weight: 0.9,
  },

  // ========== DISEASE RISK - CHEK2 ==========
  {
    id: 'CHEK2-CANCER',
    gene: 'CHEK2',
    rsids: ['rs17879961'],
    genotypePattern: ['CT', 'TT'],
    category: 'cancer',
    implication: 'Moderate increase in breast cancer risk',
    recommendation: 'Annual mammography starting age 40. Maintain healthy weight, limit alcohol. Discuss screening with physician.',
    confidence: 'medium',
    weight: 0.7,
  },

  // ========== DISEASE RISK - ATM ==========
  {
    id: 'ATM-CANCER',
    gene: 'ATM',
    rsids: ['rs1801516'],
    genotypePattern: ['AG', 'GG'],
    category: 'cancer',
    implication: 'Modest increase in breast cancer risk',
    recommendation: 'Standard breast cancer screening, maintain healthy lifestyle. Consider discussion with genetic counselor.',
    confidence: 'medium',
    weight: 0.6,
  },

  // ========== METABOLIC - TCF7L2 (Diabetes) ==========
  {
    id: 'TCF7L2-T2D',
    gene: 'TCF7L2',
    rsids: ['rs7903146'],
    genotypePattern: ['CT', 'TT'],
    category: 'metabolic',
    implication: 'Increased Type 2 Diabetes risk (1.4-2x)',
    recommendation: 'Annual HbA1c and fasting glucose testing. Maintain healthy weight, regular exercise, low glycemic diet. Consider metformin if pre-diabetic.',
    confidence: 'high',
    evidenceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3746083/',
    weight: 0.8,
  },

  // ========== METABOLIC - FTO (Obesity) ==========
  {
    id: 'FTO-OBESITY',
    gene: 'FTO',
    rsids: ['rs9939609'],
    genotypePattern: ['AA'],
    category: 'metabolic',
    implication: 'Higher BMI tendency and obesity risk',
    recommendation: 'Increased focus on portion control and regular physical activity (150+ min/week). May benefit from structured weight management program.',
    confidence: 'medium',
    weight: 0.6,
  },

  // ========== CARDIOVASCULAR - APOE ==========
  {
    id: 'APOE-E4E4',
    gene: 'APOE',
    rsids: ['rs429358', 'rs7412'],
    genotypePattern: ['CC-CC'],
    category: 'disease',
    implication: 'Significantly increased Alzheimer\'s and cardiovascular disease risk',
    recommendation: 'Heart-healthy diet (Mediterranean), regular cognitive engagement, cardiovascular exercise. Aggressive LDL management (<70 mg/dL).',
    confidence: 'high',
    evidenceUrl: 'https://www.alzheimers.gov/alzheimers-dementias/alzheimers-disease/apoe-gene',
    weight: 0.9,
  },
  {
    id: 'APOE-E4E3',
    gene: 'APOE',
    rsids: ['rs429358', 'rs7412'],
    genotypePattern: ['TC-CC', 'CT-CC'],
    category: 'disease',
    implication: 'Moderately increased Alzheimer\'s risk (3-4x)',
    recommendation: 'Cognitive health monitoring, brain-healthy lifestyle, control cardiovascular risk factors. Consider baseline cognitive assessment.',
    confidence: 'high',
    weight: 0.75,
  },
  {
    id: 'APOE-E2',
    gene: 'APOE',
    rsids: ['rs429358', 'rs7412'],
    genotypePattern: ['TT-TT'],
    category: 'disease',
    implication: 'Protective against Alzheimer\'s, but may have slightly higher triglycerides',
    recommendation: 'Standard health maintenance. Monitor lipid panel periodically.',
    confidence: 'medium',
    weight: 0.5,
  },

  // ========== CARDIOVASCULAR - LPA ==========
  {
    id: 'LPA-CVD',
    gene: 'LPA',
    rsids: ['rs10455872'],
    genotypePattern: ['AG', 'GG'],
    category: 'disease',
    implication: 'Elevated lipoprotein(a) - increased heart disease and stroke risk',
    recommendation: 'Aggressive management of other CV risk factors. Consider Lp(a) blood test. Low-dose aspirin may be beneficial (discuss with doctor).',
    confidence: 'high',
    weight: 0.8,
  },

  // ========== PHARMACOGENOMICS - DPYD (5-FU) ==========
  {
    id: 'DPYD-5FU-TOXIC',
    gene: 'DPYD',
    rsids: ['rs3918290'],
    genotypePattern: ['AG', 'GG'],
    category: 'drug',
    implication: 'Severe toxicity risk with 5-fluorouracil (5-FU) chemotherapy',
    recommendation: 'Reduce 5-FU dose by 50% or consider alternative chemotherapy. Pre-treatment testing critical.',
    confidence: 'high',
    evidenceUrl: 'https://www.pharmgkb.org/gene/PA145',
    weight: 1.0,
  },

  // ========== PHARMACOGENOMICS - UGT1A1 ==========
  {
    id: 'UGT1A1-IRINOTECAN',
    gene: 'UGT1A1',
    rsids: ['rs8175347'],
    genotypePattern: ['TA7/TA7'],
    category: 'drug',
    implication: 'Increased irinotecan toxicity risk (chemotherapy)',
    recommendation: 'Reduce irinotecan starting dose by 30%. Monitor closely for neutropenia and diarrhea.',
    confidence: 'high',
    weight: 0.9,
  },

  // ========== PHARMACOGENOMICS - HLA-B*57:01 ==========
  {
    id: 'HLA-B5701-ABACAVIR',
    gene: 'HLA-B',
    rsids: ['rs2395029'],
    genotypePattern: ['TT'],
    category: 'drug',
    implication: 'High risk of abacavir hypersensitivity reaction (potentially fatal)',
    recommendation: 'CONTRAINDICATED: Never use abacavir. Use alternative antiretroviral agents.',
    confidence: 'high',
    evidenceUrl: 'https://www.pharmgkb.org/gene/PA35056',
    weight: 1.0,
  },

  // ========== PHARMACOGENOMICS - HLA-A*31:01 ==========
  {
    id: 'HLA-A3101-CARBAMAZEPINE',
    gene: 'HLA-A',
    rsids: ['rs1061235'],
    genotypePattern: ['CT', 'TT'],
    category: 'drug',
    implication: 'Increased risk of carbamazepine-induced skin reactions',
    recommendation: 'Consider alternative anticonvulsants. If carbamazepine used, close monitoring for rash required.',
    confidence: 'high',
    weight: 0.85,
  },

  // ========== PHARMACOGENOMICS - G6PD ==========
  {
    id: 'G6PD-DEFICIENCY',
    gene: 'G6PD',
    rsids: ['rs1050828', 'rs1050829'],
    genotypePattern: ['CT', 'TT', 'AG', 'GG'],
    category: 'drug',
    implication: 'G6PD deficiency - risk of hemolytic anemia with certain drugs',
    recommendation: 'Avoid: sulfa drugs, aspirin (high dose), antimalarials (primaquine), fava beans. Carry medical alert card.',
    confidence: 'high',
    weight: 0.95,
  },

  // ========== PHARMACOGENOMICS - OPRM1 (Opioids) ==========
  {
    id: 'OPRM1-OPIOID',
    gene: 'OPRM1',
    rsids: ['rs1799971'],
    genotypePattern: ['AG', 'GG'],
    category: 'drug',
    implication: 'Altered opioid receptor response - may need higher doses for pain control',
    recommendation: 'If opioids prescribed, may require dose adjustment. Increased addiction risk - use with caution and close monitoring.',
    confidence: 'medium',
    weight: 0.65,
  },

  // ========== PHARMACOGENOMICS - MTHFR (Folate) ==========
  {
    id: 'MTHFR-FOLATE',
    gene: 'MTHFR',
    rsids: ['rs1801133'],
    genotypePattern: ['TT'],
    category: 'metabolic',
    implication: 'Reduced folate metabolism - elevated homocysteine',
    recommendation: 'Supplement with methylfolate (not folic acid) 400-800mcg daily. Increase leafy greens. Check homocysteine levels.',
    confidence: 'medium',
    evidenceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4489042/',
    weight: 0.7,
  },

  // ========== PHARMACOGENOMICS - NAT2 (Isoniazid) ==========
  {
    id: 'NAT2-SLOW',
    gene: 'NAT2',
    rsids: ['rs1801280'],
    genotypePattern: ['TT'],
    category: 'drug',
    implication: 'Slow acetylator - increased isoniazid (TB drug) toxicity risk',
    recommendation: 'Monitor liver function closely if on isoniazid. Supplement with vitamin B6 (pyridoxine) to reduce neuropathy risk.',
    confidence: 'high',
    weight: 0.8,
  },

  // ========== LIFESTYLE - ALDH2 (Alcohol) ==========
  {
    id: 'ALDH2-ALCOHOL',
    gene: 'ALDH2',
    rsids: ['rs671'],
    genotypePattern: ['AG', 'GG'],
    category: 'lifestyle',
    implication: 'Reduced alcohol tolerance (Asian flush) - increased cancer risk with alcohol',
    recommendation: 'Minimize alcohol consumption. Significantly increased risk of esophageal cancer with regular drinking. Consider complete abstinence.',
    confidence: 'high',
    weight: 0.85,
  },

  // ========== METABOLIC - PPARG (Diabetes) ==========
  {
    id: 'PPARG-T2D',
    gene: 'PPARG',
    rsids: ['rs1801282'],
    genotypePattern: ['GG'],
    category: 'metabolic',
    implication: 'Increased Type 2 Diabetes risk',
    recommendation: 'Regular glucose monitoring. Mediterranean diet and regular exercise. May respond well to thiazolidinedione medications if diabetic.',
    confidence: 'medium',
    weight: 0.65,
  },

  // ========== PHARMACOGENOMICS - IFNL3 (Hepatitis C) ==========
  {
    id: 'IFNL3-HCV',
    gene: 'IFNL3',
    rsids: ['rs12979860'],
    genotypePattern: ['TT'],
    category: 'drug',
    implication: 'Better response to interferon-based Hepatitis C treatment',
    recommendation: 'If HCV positive, favorable prognosis with interferon therapy. Discuss treatment options with hepatologist.',
    confidence: 'high',
    weight: 0.8,
  },

  // ========== COAGULATION - F5 (Factor V Leiden) ==========
  {
    id: 'F5-LEIDEN',
    gene: 'F5',
    rsids: ['rs6025'],
    genotypePattern: ['CT', 'TT'],
    category: 'disease',
    implication: 'Factor V Leiden - increased blood clot risk (DVT/PE)',
    recommendation: 'Avoid prolonged immobility, stay hydrated on flights. Oral contraceptives increase clot risk - discuss alternatives. Alert surgeons before procedures.',
    confidence: 'high',
    evidenceUrl: 'https://www.ncbi.nlm.nih.gov/books/NBK1368/',
    weight: 0.9,
  },

  // ========== COAGULATION - F2 (Prothrombin) ==========
  {
    id: 'F2-PROTHROMBIN',
    gene: 'F2',
    rsids: ['rs1799963'],
    genotypePattern: ['GA', 'AA'],
    category: 'disease',
    implication: 'Prothrombin mutation - elevated clotting risk',
    recommendation: 'Similar to Factor V Leiden. Avoid estrogen-based birth control. Consider anticoagulation for high-risk situations (surgery, long flights).',
    confidence: 'high',
    weight: 0.9,
  },
];

export const getRuleById = (id: string): GeneticRule | undefined => {
  return geneticRules.find(rule => rule.id === id);
};

export const getRulesByGene = (gene: string): GeneticRule[] => {
  return geneticRules.filter(rule => rule.gene === gene);
};

export const getRulesByCategory = (category: string): GeneticRule[] => {
  return geneticRules.filter(rule => rule.category === category);
};

