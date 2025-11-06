import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import type { GeneticMarker } from '@/types/domain';

interface MarkerRow {
  id: string;
  rsid: string;
  gene: string;
  genotype: string;
  note: string;
}

export const ManualEntry: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addGeneticMarkers } = useAppStore();

  const [rows, setRows] = useState<MarkerRow[]>([
    { id: '1', rsid: '', gene: '', genotype: '', note: '' },
  ]);

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), rsid: '', gene: '', genotype: '', note: '' }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof MarkerRow, value: string) => {
    setRows(
      rows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const validateRows = (): { valid: GeneticMarker[]; errors: string[] } => {
    const valid: GeneticMarker[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      if (!row.rsid && !row.genotype) {
        // Empty row, skip
        return;
      }

      if (!row.rsid || !row.rsid.startsWith('rs')) {
        errors.push(`Row ${index + 1}: Invalid rsID (must start with 'rs')`);
        return;
      }

      if (!row.genotype || !/^[ACGT]{1,2}$/i.test(row.genotype)) {
        errors.push(
          `Row ${index + 1}: Invalid genotype (must be 1-2 letters: A, C, G, or T)`
        );
        return;
      }

      valid.push({
        rsid: row.rsid.toLowerCase(),
        gene: row.gene.toUpperCase(),
        genotype: row.genotype.toUpperCase(),
        note: row.note,
      });
    });

    return { valid, errors };
  };

  const handleSave = () => {
    const { valid, errors } = validateRows();

    if (errors.length > 0) {
      showToast(`Validation errors: ${errors[0]}`, 'error');
      return;
    }

    if (valid.length === 0) {
      showToast('Please enter at least one genetic marker', 'warning');
      return;
    }

    addGeneticMarkers(valid);
    showToast(`Added ${valid.length} markers to your profile`, 'success');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-semibold text-text mb-2">Manual Entry</h1>
          <p className="text-gray-600 mb-8">
            Enter your genetic markers one by one. Need help? Check the format guide below.
          </p>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Genetic Markers</CardTitle>
              <CardDescription>
                Enter rsID (e.g., rs1065852), gene symbol (e.g., CYP2D6), and genotype (e.g., AG)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        rsID <span className="text-red-500">*</span>
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Gene</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Genotype <span className="text-red-500">*</span>
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Note</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.id} className="border-t border-gray-200">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={row.rsid}
                            onChange={(e) => updateRow(row.id, 'rsid', e.target.value)}
                            placeholder="rs1065852"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={row.gene}
                            onChange={(e) => updateRow(row.id, 'gene', e.target.value)}
                            placeholder="CYP2D6"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={row.genotype}
                            onChange={(e) => updateRow(row.id, 'genotype', e.target.value)}
                            placeholder="AG"
                            maxLength={2}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={row.note}
                            onChange={(e) => updateRow(row.id, 'note', e.target.value)}
                            placeholder="Optional note"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => removeRow(row.id)}
                            disabled={rows.length === 1}
                            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Remove row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex gap-3">
                <Button variant="outline" onClick={addRow} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Row
                </Button>
                <Button onClick={handleSave} className="gap-2 flex-1">
                  <Save className="w-4 h-4" />
                  Save All Markers
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Format Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Format Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <strong className="text-text">rsID:</strong> SNP identifier starting with 'rs'
                  followed by numbers (e.g., rs1065852)
                </div>
                <div>
                  <strong className="text-text">Gene:</strong> Gene symbol, usually 3-8 uppercase
                  letters (e.g., CYP2D6, BRCA1)
                </div>
                <div>
                  <strong className="text-text">Genotype:</strong> Your two alleles, each A/C/G/T
                  (e.g., AA, AG, CT, TT)
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Example:</strong> rsID: rs1065852, Gene: CYP2D6, Genotype: CT
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

