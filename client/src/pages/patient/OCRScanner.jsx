import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Upload,
  Brain,
  Sparkles,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const mockOcrResult = [
  {
    medicine: 'Paracetamol (Calpol)',
    dosage: '500mg',
    frequency: 'Morning, Afternoon, Night',
    duration: '5 Days',
    time: ['08:00 AM', '01:00 PM', '08:00 PM']
  },
  {
    medicine: 'Amoxicillin (Antibiotic)',
    dosage: '250mg',
    frequency: 'Morning, Night',
    duration: '7 Days',
    time: ['08:00 AM', '08:00 PM']
  },
  {
    medicine: 'Montelukast (Montek-LC)',
    dosage: '10mg',
    frequency: 'Night only',
    duration: '10 Days',
    time: ['09:00 PM']
  }
];

const OCRScanner = () => {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [ocrRawText, setOcrRawText] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success('Prescription image selected!');
    }
  };

  const startOcrScan = () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }
    setScanning(true);
    setOcrRawText('Loading OCR engine... Reading pixel boundaries... raw text detected: "Pracetml 500mg MRNG AFTN NGHT - Amoxcilin 250mg 2x/d - Montek-LC nightly"');

    // Simulate OCR + AI correction
    setTimeout(() => {
      setReminders(mockOcrResult);
      setScanning(false);
      toast.success('Prescription processed and reminders scheduled!');
    }, 2000);
  };

  const removeReminder = (index) => {
    const updated = [...reminders];
    updated.splice(index, 1);
    setReminders(updated);
    toast.success('Medication reminder removed');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Upload Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" /> Upload Prescription
              </CardTitle>
              <CardDescription className="text-xs">
                Upload a handwritten or printed prescription image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Upload className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold">
                    {file ? file.name : 'Choose Prescription Image'}
                  </span>
                  <span className="text-[10px] text-slate-400">Drag & drop image here</span>
                </div>
              </div>

              <Button
                onClick={startOcrScan}
                disabled={scanning || !file}
                className="w-full rounded-xl gap-2 font-medium"
              >
                {scanning ? 'Running AI OCR Engine...' : 'Scan & Extract Reminders'}
              </Button>
            </CardContent>
          </Card>

          {scanning && (
            <Card className="bg-slate-950 text-slate-400 border-none rounded-2xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Brain className="h-3.5 w-3.5 animate-pulse" /> OCR Terminal Output
              </div>
              <p className="text-[11px] leading-relaxed select-none">{ocrRawText}</p>
            </Card>
          )}
        </div>

        {/* Right Schedule Output */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-500" /> Medication Schedule Reminders
                </CardTitle>
                <CardDescription className="text-xs">
                  Review generated reminders below.
                </CardDescription>
              </div>
              {reminders.length > 0 && (
                <Badge variant="secondary" className="bg-teal-500/10 text-teal-600 dark:text-teal-400 border-none font-bold text-[10px] uppercase">
                  {reminders.length} Active Reminders
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {reminders.length > 0 ? (
                <div className="space-y-4">
                  {reminders.map((rem, i) => (
                    <div key={i} className="flex items-start justify-between p-4.5 bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
                      <div className="space-y-2.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{rem.medicine}</h4>
                          <Badge variant="outline" className="text-[9px] font-semibold border-slate-200 dark:border-slate-800 py-px bg-slate-50 dark:bg-slate-900">
                            {rem.dosage}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Frequency</span>
                            <span className="font-medium text-slate-600 dark:text-slate-350">{rem.frequency}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Duration</span>
                            <span className="font-medium text-slate-600 dark:text-slate-350">{rem.duration}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100/50 dark:border-slate-900/50">
                          {rem.time.map((t, index) => (
                            <span key={index} className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-lg">
                              <Clock className="h-3 w-3" /> {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReminder(i)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <AlertCircle className="h-8 w-8 text-slate-300" />
                  <span className="text-xs font-semibold">No reminders generated yet</span>
                  <span className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                    Upload your handwritten prescription image on the left and run AI scan to generate schedule notifications automatically.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OCRScanner;
