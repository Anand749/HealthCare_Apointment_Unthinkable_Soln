import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, TrendingDown, Calendar, AlertTriangle, FileText,
  Activity, Heart, Clock, Sparkles, ArrowRight, BrainCircuit, ClipboardList,
  Search, Upload, Star, ChevronRight, Stethoscope, CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import { holdSlot, bookAppointment, getPatientAppointments } from '../../services/appointmentService';
import { getAllDoctors } from '../../services/doctorService';
import { getHealthInsights, triageSymptoms, getRecommendations, scanPrescription } from '../../services/aiService';

/* ── Mock Data for Charts (Time Series missing in backend) ── */
const healthData = [
  { name: 'Jan', bp: 118, weight: 77, sugar: 92, adherence: 90 },
  { name: 'Feb', bp: 120, weight: 76, sugar: 95, adherence: 95 },
  { name: 'Mar', bp: 122, weight: 75, sugar: 94, adherence: 100 },
  { name: 'Apr', bp: 125, weight: 74, sugar: 96, adherence: 92 },
  { name: 'May', bp: 124, weight: 73, sugar: 95, adherence: 95 },
  { name: 'Jun', bp: 122, weight: 72, sugar: 95, adherence: 95 },
];

/* ── Shared tiny components ──────────────────────────────────────────── */
const StatCard = ({ label, value, sub, subColor = 'text-green-500', icon: Icon, iconBg = 'bg-blue-50', iconColor = 'text-blue-600' }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <div className={`p-2 rounded-xl ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
    </div>
    <div className="text-2xl font-extrabold text-slate-800">{value}</div>
    {sub && <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${subColor}`}>{sub}</div>}
  </div>
);

/* ── Sub-panels ──────────────────────────────────────────────────────── */
const InsightsPanel = ({ setActiveTab }) => {
  const [timeframe, setTimeframe] = useState('6m');
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await getHealthInsights();
        setInsights(res.data);
      } catch (err) {
        toast.error('Failed to fetch health insights');
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Health Score" value={insights?.healthScore || '--'} sub="Calculated by AI" icon={Activity} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard label="Blood Pressure" value={insights?.metrics.bloodPressure || '--'} sub="Monitoring" subColor="text-slate-500" icon={Heart} iconBg="bg-amber-50" iconColor="text-amber-500" />
        <StatCard label="Body Weight" value={insights?.metrics.weight || '--'} sub="Stable" subColor="text-green-500" icon={TrendingDown} iconBg="bg-green-50" iconColor="text-green-600" />
        <StatCard label="Glucose" value={insights?.metrics.glucose || '--'} sub="Checkup due" subColor="text-slate-500" icon={Clock} iconBg="bg-teal-50" iconColor="text-teal-600" />
      </div>

      {/* AI Insight Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-x-12 -translate-y-24 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit className="h-5 w-5 text-blue-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">AI Clinical Insight</span>
          </div>
          <div className="text-sm text-blue-50 leading-relaxed max-w-2xl mb-4 space-y-1">
            {insights?.insights ? insights.insights.map((ins, i) => (
              <p key={i}>• {ins}</p>
            )) : <p>Loading AI insights...</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setActiveTab('book')} className="flex items-center gap-1.5 bg-white text-blue-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
              Book Follow-up <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setActiveTab('ocr')} className="flex items-center gap-1.5 bg-white/15 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-white/25 transition-colors">
              Scan Prescription
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5">
        <p className="text-[11px] text-blue-500 font-medium italic">
          ⚠️ These insights are AI-generated for informational purposes only and should not replace professional medical advice.
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Blood Pressure & Glucose</h3>
              <p className="text-xs text-slate-400">6-month trend overview</p>
            </div>
            <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
              {['1m', '3m', '6m'].map(t => (
                <button key={t} onClick={() => setTimeframe(t)} className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors ${timeframe === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>{t.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={healthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gBp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSugar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} domain={[60, 140]} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} />
              <Legend verticalAlign="top" height={30} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area name="BP Systolic" type="monotone" dataKey="bp" stroke="#3b82f6" fill="url(#gBp)" strokeWidth={2} dot={false} />
              <Area name="Glucose mg/dL" type="monotone" dataKey="sugar" stroke="#14b8a6" fill="url(#gSugar)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="font-bold text-sm text-slate-800">Weight & Adherence Tracker</h3>
            <p className="text-xs text-slate-400">Monthly weight vs. medication adherence</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={healthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} />
              <Legend verticalAlign="top" height={30} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar name="Weight (kg)" dataKey="weight" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar name="Adherence (%)" dataKey="adherence" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const BookPanel = () => {
  const [symptomQuery, setSymptomQuery] = useState('');
  const [riskLevel, setRiskLevel] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [holdTimer, setHoldTimer] = useState(0);
  const [bookDate, setBookDate] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [filterSpec, setFilterSpec] = useState('all');
  const [onlyToday, setOnlyToday] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await getAllDoctors();
        setDoctors(res.data);
      } catch (error) {
        toast.error('Failed to load doctors');
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    let interval;
    if (holdTimer > 0) {
      interval = setInterval(() => setHoldTimer(p => p - 1), 1000);
    } else if (holdTimer === 0 && selectedSlot) {
      setSelectedSlot('');
      toast.error('Slot reservation expired. Please reselect.');
    }
    return () => clearInterval(interval);
  }, [holdTimer, selectedSlot]);

  const runAI = async () => {
    if (!symptomQuery.trim()) { toast.error('Please describe your symptoms first'); return; }
    setSearching(true);
    try {
      const triageRes = await triageSymptoms(symptomQuery);
      setRiskLevel({
        level: triageRes.data.riskLevel,
        text: triageRes.data.urgency,
        action: triageRes.data.recommendedAction
      });

      const recsRes = await getRecommendations(symptomQuery);
      // Map API response to match our local object structure for UI
      const recs = recsRes.data.map(r => {
        const matchingDoc = doctors.find(d => d.id === r.doctorId) || {};
        return {
          ...matchingDoc,
          confidence: r.confidenceScore,
          reason: r.reason
        };
      });
      setRecommendations(recs);
      toast.success('AI analysis complete!');
    } catch (err) {
      toast.error('AI analysis failed');
    } finally {
      setSearching(false);
    }
  };

  const handleHoldSlot = async (slot) => {
    if (!bookDate) {
        toast.error('Please select a date first');
        return;
    }
    try {
      await holdSlot(selectedDoctor.id, bookDate, slot);
      setSelectedSlot(slot);
      setHoldTimer(300);
      toast.success(`Slot "${slot}" reserved for 5 minutes.`);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to hold slot');
    }
  };

  const confirmBook = async () => {
    if (!bookDate || !selectedSlot) { toast.error('Please select a date and slot.'); return; }
    try {
      await bookAppointment(selectedDoctor.id, bookDate, selectedSlot, symptoms || 'Routine Checkup');
      toast.success(`Appointment booked with ${selectedDoctor.name}!`);
      setSelectedDoctor(null); setSelectedSlot(''); setHoldTimer(0); setBookDate(''); setSymptoms('');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Booking failed');
    }
  };

  const visibleDoctors = doctors.filter(d => {
    if (filterSpec !== 'all' && d.spec !== filterSpec) return false;
    if (onlyToday && d.slotsToday.length === 0) return false;
    return true;
  });

  const riskColors = {
    RED: 'bg-red-50 border-red-200 text-red-700',
    ORANGE: 'bg-orange-50 border-orange-200 text-orange-700',
    YELLOW: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    GREEN: 'bg-green-50 border-green-200 text-green-700',
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filters + AI Search */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
              <div className="flex items-center gap-2 text-white">
                <BrainCircuit className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Doctor Matcher</span>
              </div>
              <p className="text-xs text-blue-200 mt-1">Describe your symptoms to get intelligent recommendations</p>
            </div>
            <div className="p-5 space-y-3">
              <textarea
                value={symptomQuery}
                onChange={e => setSymptomQuery(e.target.value)}
                placeholder="e.g. Chest pain, shortness of breath, fatigue..."
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none min-h-[90px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              />
              <button
                onClick={runAI}
                disabled={searching || !symptomQuery.trim()}
                className="w-full h-10 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {searching ? 'Analysing...' : 'Get AI Recommendations'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Search className="h-4 w-4 text-slate-400" /> Filters</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialization</label>
              <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)} className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm text-slate-700 outline-none">
                <option value="all">All Specialities</option>
                <option value="Cardiologist">Cardiology</option>
                <option value="Dermatologist">Dermatology</option>
                <option value="General Physician">General Practice</option>
              </select>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={onlyToday} onChange={e => setOnlyToday(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 cursor-pointer" />
              <span className="text-sm text-slate-600 group-hover:text-slate-800 font-medium">Available Today</span>
            </label>
          </div>
        </div>

        {/* Doctor Listings */}
        <div className="lg:col-span-8 space-y-5">
          {riskLevel && (
            <div className={`flex gap-3 p-4 rounded-2xl border ${riskColors[riskLevel.level]}`}>
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm mb-0.5">Risk Level: {riskLevel.level}</div>
                <p className="text-sm">{riskLevel.text}</p>
                <p className="text-xs mt-1 font-medium opacity-80">Recommended: {riskLevel.action}</p>
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" /> AI Recommendations
              </h3>
              {recommendations.map(doc => (
                <div key={doc.id} className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 relative">
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">{doc.confidence}% Match</div>
                  <div className="flex gap-3 mb-3">
                    <span className="text-2xl">{doc.emoji}</span>
                    <div>
                      <div className="font-bold text-sm text-slate-800">{doc.name}</div>
                      <div className="text-xs text-slate-500">{doc.spec} • {doc.exp} yrs</div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 bg-blue-100 rounded-lg p-2.5 italic mb-3">"{doc.reason}"</p>
                  <button onClick={() => setSelectedDoctor(doc)} className="w-full h-8 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                    Book This Doctor
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Doctors ({visibleDoctors.length})</h3>
            {visibleDoctors.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">{doc.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">{doc.name}</div>
                    <div className="text-xs text-slate-500">{doc.spec}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-bold"><Star className="h-3.5 w-3.5 fill-amber-500" /> {doc.rating}</div>
                    <div className="text-slate-400 mt-0.5">{doc.exp} yrs exp</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {doc.slotsToday.length > 0
                      ? doc.slotsToday.map(s => <span key={s} className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-md">{s}</span>)
                      : <span className="text-[10px] text-slate-400 italic">No slots today</span>
                    }
                  </div>
                  <button onClick={() => setSelectedDoctor(doc)} className="text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 px-3.5 py-1.5 rounded-lg transition-colors">
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full p-6 flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800">Book Appointment</h3>
              <button onClick={() => { setSelectedDoctor(null); setSelectedSlot(''); setHoldTimer(0); }} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">✕</button>
            </div>
            <div className="flex gap-3 items-center bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-5">
              <span className="text-2xl">{selectedDoctor.emoji}</span>
              <div>
                <div className="font-bold text-sm text-slate-800">{selectedDoctor.name}</div>
                <div className="text-xs text-slate-500">{selectedDoctor.spec}</div>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Date</label>
                <input type="date" value={bookDate} onChange={e => setBookDate(e.target.value)} className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-700 outline-none focus:border-blue-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Slots</label>
                  {holdTimer > 0 && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
                      Holds: {Math.floor(holdTimer / 60)}:{String(holdTimer % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {selectedDoctor.slotsToday.length > 0 ? selectedDoctor.slotsToday.map(slot => (
                    <button
                      key={slot}
                      onClick={() => handleHoldSlot(slot)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${selectedSlot === slot ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'}`}
                    >{slot}</button>
                  )) : <span className="col-span-3 text-xs text-slate-400 italic">No slots available today. Try another date.</span>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Describe Symptoms</label>
                <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g. Chest tightness when climbing stairs..." className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none min-h-[70px] outline-none focus:border-blue-400" />
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button onClick={confirmBook} disabled={!selectedSlot} className="w-full h-11 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TimelinePanel = () => {
  const [timelineEvents, setTimelineEvents] = useState([]);

  useEffect(() => {
    const fetchApts = async () => {
      try {
        const res = await getPatientAppointments();
        const events = res.data.map(apt => ({
          id: apt._id,
          date: new Date(apt.date).toLocaleDateString() + ' ' + apt.slot,
          type: apt.status === 'completed' ? 'consultation' : 'scheduled',
          title: apt.status === 'completed' ? 'Past Consultation' : 'Upcoming Consultation',
          doctor: apt.doctor.user.name,
          notes: apt.visitNotes || apt.symptoms,
          aiSummary: apt.aiPatientExplanation || apt.aiSymptomSummary,
          meds: apt.prescription ? apt.prescription.split(',') : null
        }));
        setTimelineEvents(events);
      } catch (err) {
        toast.error('Failed to load appointments');
      }
    };
    fetchApts();
  }, []);

  return (
    <div className="relative pl-8 space-y-6 animate-in fade-in">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-slate-200" />
      {timelineEvents.map(e => (
        <div key={e.id} className="relative group">
          <div className="absolute left-[-26px] top-2 h-6 w-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            {e.type === 'consultation' ? <Stethoscope className="h-3 w-3 text-blue-600" /> : <Calendar className="h-3 w-3 text-amber-500" />}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{e.date}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${e.type === 'consultation' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>{e.type}</span>
            </div>
            <h4 className="font-bold text-slate-800 mb-0.5">{e.title}</h4>
            <p className="text-xs text-slate-400 mb-3">by {e.doctor}</p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">{e.notes}</p>
            {e.aiSummary && (
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-1.5 text-blue-600 text-[10px] font-bold uppercase mb-1.5"><Sparkles className="h-3 w-3" /> AI Summary</div>
                <p className="text-xs text-slate-600 italic">"{e.aiSummary}"</p>
              </div>
            )}
            {e.meds && e.meds[0] && (
              <div className="flex flex-wrap gap-1.5">
                {e.meds.map((m, i) => <span key={i} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg font-medium">{m}</span>)}
              </div>
            )}
          </div>
        </div>
      ))}
      {timelineEvents.length === 0 && (
         <p className="text-slate-400 text-sm">No appointments found.</p>
      )}
    </div>
  );
};

const OCRPanel = () => {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [reminders, setReminders] = useState([]);

  const scan = async () => {
    if (!file) { toast.error('Please upload a prescription image first'); return; }
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('prescription', file);
      const res = await scanPrescription(formData);
      setReminders(res.data);
      toast.success('Prescription scanned!');
    } catch (err) {
      toast.error('Failed to scan prescription');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 mb-1 flex items-center gap-2"><Upload className="h-4 w-4 text-blue-500" /> Upload Prescription</h3>
            <p className="text-xs text-slate-400 mb-4">Upload handwritten or printed prescription images. AI will extract medicines and build reminders.</p>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
              <Upload className="h-7 w-7 text-slate-300 group-hover:text-blue-500 transition-colors mb-2" />
              <span className="text-sm font-semibold text-slate-500 group-hover:text-blue-600">{file ? file.name : 'Choose File'}</span>
              <span className="text-xs text-slate-400 mt-1">JPG, PNG, PDF up to 5MB</span>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
            </label>
            <button onClick={scan} disabled={scanning || !file} className="w-full h-10 mt-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <BrainCircuit className="h-4 w-4" />
              {scanning ? 'Scanning with AI OCR...' : 'Scan & Generate Reminders'}
            </button>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2"><Clock className="h-4 w-4 text-teal-500" /> Medication Schedule</h3>
              {reminders.length > 0 && <span className="text-[10px] font-bold uppercase bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{reminders.length} Reminders</span>}
            </div>
            {reminders.length > 0 ? (
              <div className="space-y-3">
                {reminders.map((r, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="font-bold text-sm text-slate-800">{r.medicine}</span>
                      <span className="ml-auto text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-md">{r.dosage}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs mb-2.5">
                      <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Frequency</span><span className="text-slate-700 font-medium">{r.frequency}</span></div>
                      <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Duration</span><span className="text-slate-700 font-medium">{r.duration}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Upload className="h-10 w-10 text-slate-200 mb-3" />
                <p className="text-sm font-semibold text-slate-400">No reminders yet</p>
                <p className="text-xs text-slate-300 mt-1 max-w-xs">Upload and scan a prescription to automatically generate your medication schedule.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Dashboard ──────────────────────────────────────────────────── */
const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('insights');

  const tabs = [
    { id: 'insights', label: 'Health Insights', icon: TrendingUp },
    { id: 'timeline', label: 'Timeline', icon: FileText },
    { id: 'book', label: 'Book Appointment', icon: Calendar },
    { id: 'ocr', label: 'Prescription OCR', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Here's your health overview for today.</p>
        </div>
        <button onClick={() => setActiveTab('book')} className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">
          <Calendar className="h-4 w-4" /> Book Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel Content */}
      <div>
        {activeTab === 'insights' && <InsightsPanel setActiveTab={setActiveTab} />}
        {activeTab === 'timeline' && <TimelinePanel />}
        {activeTab === 'book' && <BookPanel />}
        {activeTab === 'ocr' && <OCRPanel />}
      </div>
    </div>
  );
};

export default PatientDashboard;
