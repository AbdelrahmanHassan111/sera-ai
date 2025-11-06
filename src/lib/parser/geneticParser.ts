/**
 * Genetic Data Parser
 * 
 * Parses various genetic data formats:
 * - JSON format: { rsid: "rs12345", gene: "CYP2D6", genotype: "AG" }
 * - Simple VCF-lite text format
 */

import type { GeneticMarker } from '@/types/domain';

export interface ParseResult {
  success: boolean;
  markers: GeneticMarker[];
  errors: string[];
  warnings: string[];
}

/**
 * Main parser function - detects format and parses accordingly
 */
export function parseGeneticData(content: string, filename?: string): ParseResult {
  const result: ParseResult = {
    success: false,
    markers: [],
    errors: [],
    warnings: [],
  };

  try {
    // Try JSON first
    const jsonResult = parseJSON(content);
    if (jsonResult.success) {
      return jsonResult;
    }

    // Try VCF-lite format
    const vcfResult = parseVCFLite(content);
    if (vcfResult.success) {
      return vcfResult;
    }

    // Try tab-delimited format
    const tabResult = parseTabDelimited(content);
    if (tabResult.success) {
      return tabResult;
    }

    result.errors.push('Unable to detect file format. Supported formats: JSON, VCF-lite, tab-delimited.');
    return result;
  } catch (error: any) {
    result.errors.push(`Parse error: ${error.message}`);
    return result;
  }
}

/**
 * Parse JSON format
 */
function parseJSON(content: string): ParseResult {
  const result: ParseResult = {
    success: false,
    markers: [],
    errors: [],
    warnings: [],
  };

  try {
    const parsed = JSON.parse(content);

    // Handle array format
    if (Array.isArray(parsed)) {
      parsed.forEach((item, index) => {
        const marker = normalizeMarker(item);
        if (marker) {
          result.markers.push(marker);
        } else {
          result.warnings.push(`Skipped invalid entry at index ${index}`);
        }
      });
    }
    // Handle object format with rsid keys
    else if (typeof parsed === 'object') {
      Object.entries(parsed).forEach(([key, value]) => {
        if (key.startsWith('rs')) {
          // Simple format: { "rs12345": "AG", ... }
          if (typeof value === 'string') {
            result.markers.push({
              rsid: key,
              gene: '',
              genotype: value,
            });
          }
          // Complex format: { "rs12345": { genotype: "AG", gene: "CYP2D6" }, ... }
          else if (typeof value === 'object') {
            const marker = normalizeMarker({ rsid: key, ...(value as any) });
            if (marker) {
              result.markers.push(marker);
            }
          }
        }
      });
    }

    result.success = result.markers.length > 0;
    if (!result.success) {
      result.errors.push('No valid genetic markers found in JSON');
    }

    return result;
  } catch (error) {
    result.errors.push('Invalid JSON format');
    return result;
  }
}

/**
 * Parse VCF-lite text format
 */
function parseVCFLite(content: string): ParseResult {
  const result: ParseResult = {
    success: false,
    markers: [],
    errors: [],
    warnings: [],
  };

  const lines = content.split('\n');
  let headerFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      if (line.startsWith('#CHROM')) {
        headerFound = true;
      }
      continue;
    }

    // Simple VCF format: CHROM POS ID REF ALT
    const parts = line.split(/\s+/);
    if (parts.length >= 5) {
      const [chrom, pos, id, ref, alt] = parts;
      
      if (id.startsWith('rs')) {
        result.markers.push({
          rsid: id,
          gene: '',
          genotype: `${ref}${alt}`,
          chromosome: chrom,
          position: parseInt(pos, 10),
        });
      }
    }
  }

  result.success = result.markers.length > 0;
  if (!result.success && headerFound) {
    result.errors.push('VCF header found but no variant data parsed');
  }

  return result;
}

/**
 * Parse tab-delimited format
 */
function parseTabDelimited(content: string): ParseResult {
  const result: ParseResult = {
    success: false,
    markers: [],
    errors: [],
    warnings: [],
  };

  const lines = content.split('\n');
  let headers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split('\t');

    // First line might be headers
    if (i === 0 && parts.some(p => p.toLowerCase().includes('rsid') || p.toLowerCase().includes('genotype'))) {
      headers = parts.map(h => h.toLowerCase());
      continue;
    }

    // Try to parse data
    if (headers.length > 0) {
      const rsidIdx = headers.findIndex(h => h.includes('rsid') || h.includes('snp'));
      const genotypeIdx = headers.findIndex(h => h.includes('genotype') || h.includes('allele'));
      const geneIdx = headers.findIndex(h => h.includes('gene'));

      if (rsidIdx >= 0 && genotypeIdx >= 0 && parts.length > Math.max(rsidIdx, genotypeIdx)) {
        result.markers.push({
          rsid: parts[rsidIdx],
          gene: geneIdx >= 0 ? parts[geneIdx] : '',
          genotype: parts[genotypeIdx],
        });
      }
    } else {
      // No headers, assume: rsid, genotype, gene (or rsid, gene, genotype)
      if (parts.length >= 2) {
        const rsid = parts.find(p => p.startsWith('rs'));
        const genotype = parts.find(p => /^[ACGT]{1,2}$/i.test(p));
        
        if (rsid && genotype) {
          result.markers.push({
            rsid,
            gene: parts.find(p => p !== rsid && p !== genotype) || '',
            genotype,
          });
        }
      }
    }
  }

  result.success = result.markers.length > 0;
  return result;
}

/**
 * Normalize marker object
 */
function normalizeMarker(obj: any): GeneticMarker | null {
  if (!obj || typeof obj !== 'object') return null;

  const rsid = obj.rsid || obj.snp || obj.id || obj.rsID;
  const genotype = obj.genotype || obj.allele || obj.gt || obj.call;
  const gene = obj.gene || obj.geneSymbol || '';

  if (!rsid || !genotype) return null;

  // Validate rsid format
  if (!/^rs\d+$/i.test(rsid)) return null;

  // Validate genotype format (should be 1-2 letters from ACGT)
  if (!/^[ACGT]{1,2}$/i.test(genotype)) return null;

  return {
    rsid: rsid.toLowerCase(),
    gene: gene.toUpperCase(),
    genotype: genotype.toUpperCase(),
    chromosome: obj.chromosome || obj.chrom,
    position: obj.position || obj.pos,
    note: obj.note || obj.comment,
  };
}

/**
 * Validate genetic markers
 */
export function validateMarkers(markers: GeneticMarker[]): {
  valid: GeneticMarker[];
  invalid: Array<{ marker: GeneticMarker; reason: string }>;
} {
  const valid: GeneticMarker[] = [];
  const invalid: Array<{ marker: GeneticMarker; reason: string }> = [];

  markers.forEach(marker => {
    if (!marker.rsid || !marker.rsid.startsWith('rs')) {
      invalid.push({ marker, reason: 'Invalid rsid format' });
      return;
    }

    if (!marker.genotype || !/^[ACGT]{1,2}$/i.test(marker.genotype)) {
      invalid.push({ marker, reason: 'Invalid genotype format' });
      return;
    }

    valid.push(marker);
  });

  return { valid, invalid };
}

/**
 * Generate sample genetic data for testing
 */
export function generateSampleData(preset: 'healthy' | 'diabetes_risk' | 'brca_like'): GeneticMarker[] {
  const base: GeneticMarker[] = [
    { rsid: 'rs1065852', gene: 'CYP2D6', genotype: 'CT' },
    { rsid: 'rs1799853', gene: 'CYP2C9', genotype: 'CC' },
    { rsid: 'rs4244285', gene: 'CYP2C19', genotype: 'GG' },
    { rsid: 'rs776746', gene: 'CYP3A5', genotype: 'AG' },
  ];

  switch (preset) {
    case 'diabetes_risk':
      return [
        ...base,
        { rsid: 'rs7903146', gene: 'TCF7L2', genotype: 'CT' }, // T2D risk
        { rsid: 'rs9939609', gene: 'FTO', genotype: 'AA' }, // Obesity risk
        { rsid: 'rs1801282', gene: 'PPARG', genotype: 'GG' }, // T2D risk
      ];

    case 'brca_like':
      return [
        ...base,
        { rsid: 'rs1799966', gene: 'BRCA1', genotype: 'AG' }, // Cancer risk
        { rsid: 'rs144848', gene: 'BRCA2', genotype: 'CT' }, // Cancer risk
        { rsid: 'rs17879961', gene: 'CHEK2', genotype: 'CT' }, // Breast cancer
      ];

    case 'healthy':
    default:
      return base;
  }
}

