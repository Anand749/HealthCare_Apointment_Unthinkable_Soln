import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Calendar,
  Activity,
  Heart,
  TrendingUp,
  Sparkles,
  ClipboardCheck,
  Stethoscope
} from 'lucide-react';

const timelineEvents = [
  {
    id: 1,
    date: 'July 10, 2026',
    type: 'consultation',
    title: 'General checkup & Cardiopulmonary Consult',
    doctor: 'Dr. Sarah Connor',
    notes: 'Mild hypertension noted. Advised reduction in daily sodium intake. Light cardio 3x per week.',
    aiSummary: 'Analyzed blood pressure metrics show slight upward trend. Follow diet and exercise updates. Next evaluation in 30 days.',
    prescriptions: ['Amlodipine 5mg (Once daily)', 'Omega-3 Fish Oil (Twice daily)']
  },
  {
    id: 2,
    date: 'May 14, 2026',
    type: 'report',
    title: 'Comprehensive Lab Report - CBC & Lipid Panel',
    doctor: 'Metro Diagnostic Lab',
    notes: 'Total Cholesterol: 195 mg/dL (Normal < 200). Glucose: 92 mg/dL. Hemoglobin levels standard.',
    aiSummary: 'Lipid panel has improved by 6% since the previous March audit. Diet revisions are successfully maintaining glucose levels.'
  },
  {
    id: 3,
    date: 'March 02, 2026',
    type: 'consultation',
    title: 'Initial Consultation - Cardiology Division',
    doctor: 'Dr. Raj Sharma',
    notes: 'Patient reports mild shortness of breath during heavy exertion. ECG shows normal sinus rhythm. Scheduled lipid panels.',
    aiSummary: 'Evaluated for mild exertion dyspnea. Basic testing clear. Recommend lipid control adjustments.',
    prescriptions: ['Atorvastatin 10mg (Nightly)']
  }
];

const Timeline = () => {
  return (
    <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 md:ml-8 pl-6 md:pl-10 space-y-8 py-4 animate-in fade-in duration-300">
      {/* Dynamic line indicator dot overlay */}
      <div className="absolute top-0 bottom-0 left-[-1.5px] w-[3px] bg-gradient-to-b from-primary via-teal-500 to-slate-200 dark:to-slate-850 rounded-full" />

      {timelineEvents.map((event) => {
        return (
          <div key={event.id} className="relative group">
            {/* Dot Indicator */}
            <div className="absolute left-[-31.5px] md:left-[-45.5px] top-1 h-5 w-5 md:h-7 md:w-7 rounded-full bg-white dark:bg-slate-900 border-2 border-primary flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
              {event.type === 'consultation' ? (
                <Stethoscope className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-primary" />
              ) : (
                <FileText className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-teal-500" />
              )}
            </div>

            {/* Content card */}
            <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-400">{event.date}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      event.type === 'consultation'
                        ? 'bg-primary/10 text-primary border-none font-semibold text-[10px]'
                        : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-none font-semibold text-[10px]'
                    }
                  >
                    {event.type.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="text-base md:text-lg font-bold mt-1.5">{event.title}</CardTitle>
                <CardDescription className="text-xs">Authorized by {event.doctor}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Clinic notes */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ClipboardCheck className="h-3.5 w-3.5 text-slate-400" /> Clinic Notes & Findings
                  </span>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-350">{event.notes}</p>
                </div>

                {/* AI Summary */}
                {event.aiSummary && (
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/20 dark:border-slate-800/20 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary fill-primary/10" /> AI Patient-Friendly translation
                    </span>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 italic">
                      "{event.aiSummary}"
                    </p>
                  </div>
                )}

                {/* Prescriptions widget */}
                {event.prescriptions && (
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Prescribed Treatments</span>
                    <div className="flex flex-wrap gap-2">
                      {event.prescriptions.map((med, i) => (
                        <Badge key={i} variant="outline" className="rounded-lg px-2.5 py-1 text-xs border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
