import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';
import { parseGeneticData, generateSampleData } from '@/lib/parser/geneticParser';
import { readFileAsText } from '@/lib/utils';

export const UploadGenetics: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addGeneticMarkers } = useAppStore();

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParseResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const content = await readFileAsText(file);
      const result = parseGeneticData(content, file.name);

      setParseResult(result);

      if (result.success && result.markers.length > 0) {
        showToast(
          `Successfully parsed ${result.markers.length} genetic markers`,
          'success'
        );
      } else {
        showToast('Failed to parse file: ' + result.errors.join(', '), 'error');
      }
    } catch (error: any) {
      showToast(`Error reading file: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (parseResult?.markers) {
      addGeneticMarkers(parseResult.markers);
      showToast(
        `Added ${parseResult.markers.length} markers to your profile`,
        'success'
      );
      navigate('/dashboard');
    }
  };

  const handleLoadSample = (preset: 'healthy' | 'diabetes_risk' | 'brca_like') => {
    const sampleData = generateSampleData(preset);
    setParseResult({
      success: true,
      markers: sampleData,
      errors: [],
      warnings: [],
    });
    showToast(`Loaded ${sampleData.length} sample markers`, 'info');
  };

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-semibold text-text mb-2">Upload Genetics Data</h1>
          <p className="text-gray-600 mb-8">
            Upload a file containing your genetic markers or load sample data.
          </p>

          {/* Upload Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select File</CardTitle>
              <CardDescription>
                Supported formats: JSON, text/tab-delimited, VCF-lite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-primary font-medium hover:underline">
                    Choose a file
                  </span>
                  <span className="text-gray-600"> or drag and drop</span>
                  <input
                    type="file"
                    accept=".json,.txt,.vcf,.tsv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {file && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-700">
                    <FileText className="w-4 h-4" />
                    <span>{file.name}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!file || isProcessing}
                  loading={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Parse File'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/manual')}
                  disabled={isProcessing}
                >
                  Manual Entry Instead
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sample Data */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Try Sample Data</CardTitle>
              <CardDescription>
                Load pre-configured genetic profiles for testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleLoadSample('healthy')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <h4 className="font-semibold text-text mb-1">Healthy Profile</h4>
                  <p className="text-sm text-gray-600">
                    Basic pharmacogenomics markers, low risk
                  </p>
                </button>
                <button
                  onClick={() => handleLoadSample('diabetes_risk')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <h4 className="font-semibold text-text mb-1">Diabetes Risk</h4>
                  <p className="text-sm text-gray-600">
                    Includes metabolic risk markers
                  </p>
                </button>
                <button
                  onClick={() => handleLoadSample('brca_like')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <h4 className="font-semibold text-text mb-1">Cancer Predisposition</h4>
                  <p className="text-sm text-gray-600">
                    BRCA and other cancer markers
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Parse Results */}
          {parseResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {parseResult.success ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                    <CardTitle>
                      {parseResult.success ? 'Parse Successful' : 'Parse Failed'}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {parseResult.success && (
                    <>
                      <p className="text-gray-700 mb-4">
                        Found <strong>{parseResult.markers.length}</strong> genetic markers
                      </p>

                      {/* Preview */}
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg mb-4">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left">rsID</th>
                              <th className="px-4 py-2 text-left">Gene</th>
                              <th className="px-4 py-2 text-left">Genotype</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parseResult.markers.slice(0, 10).map((marker: any, idx: number) => (
                              <tr key={idx} className="border-t border-gray-200">
                                <td className="px-4 py-2">{marker.rsid}</td>
                                <td className="px-4 py-2">{marker.gene || '-'}</td>
                                <td className="px-4 py-2 font-medium">{marker.genotype}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {parseResult.markers.length > 10 && (
                          <div className="p-2 text-center text-xs text-gray-500 border-t border-gray-200">
                            ... and {parseResult.markers.length - 10} more
                          </div>
                        )}
                      </div>

                      {parseResult.warnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-yellow-800 mb-1">Warnings:</p>
                          <ul className="text-xs text-yellow-700 list-disc list-inside">
                            {parseResult.warnings.map((warning: string, idx: number) => (
                              <li key={idx}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button onClick={handleSave} size="lg" className="w-full">
                        Save to Profile
                      </Button>
                    </>
                  )}

                  {!parseResult.success && (
                    <>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
                        <ul className="text-sm text-red-700 space-y-1">
                          {parseResult.errors.map((error: string, idx: number) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-sm text-gray-600">
                        Please check your file format and try again, or use manual entry.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

