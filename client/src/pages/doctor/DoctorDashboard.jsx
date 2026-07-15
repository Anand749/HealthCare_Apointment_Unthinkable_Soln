import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, Users, FileText, CheckCircle, XCircle, Clock,
  MessageSquare, ChevronRight, Activity, Heart, Sparkles, BrainCircuit,
  Stethoscope, AlertCircle, FileEdit, ClipboardList, PenTool
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDoctorSchedule, updateConsultation } from '../../services/appointmentService';
import { generateExplanation } from '../../services/aiService';

/* ── Sub Components ────────────────────────────────────────────────────── */
const ConsultationPanel = () => {
  const [appointments, setAppointments] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [patientFriendly, setPatientFriendly] = useState('');

  const fetchApts = async () => {
    try {
      const res = await getDoctorSchedule();
      setAppointments(res.data);
    } catch (err) {
      toast.error('Failed to load queue');
    }
  };

  useEffect(() => {
    fetchApts();
  }, []);

  // Filter today's appointments
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayAppointments = appointments.filter(apt => {
    const d = new Date(apt.date);
    return d >= startOfDay && d <= endOfDay;
  });

  const handleGenerateExplanation = async () => {
    if (!notes && !prescription) { toast.error('Add notes or prescription first'); return; }
    setGenerating(true);
    try {
      const res = await generateExplanation(notes, prescription);
      setPatientFriendly(res.explanation);
      toast.success('Patient-friendly explanation generated!');
    } catch (err) {
      toast.error('AI Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const completeConsult = async () => {
    try {
      await updateConsultation(activePatient._id, {
        diagnosis: 'Completed consultation', // Simplified
        prescription,
        visitNotes: notes,
        aiPatientExplanation: patientFriendly
      });
      toast.success(`Consultation completed for ${activePatient.patient.user.name}.`);
      setActivePatient(null); setNotes(''); setPrescription(''); setPatientFriendly('');
      fetchApts(); // Refresh queue
    } catch (err) {
      toast.error('Failed to complete consultation');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in">
      {/* Queue Sidebar */}
      <div className="xl:col-span-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users className="h-4 w-4 text-blue-500" /> Today's Queue</h3>
            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{todayAppointments.length} Total</span>
          </div>
          <div className="space-y-3">
            {todayAppointments.map(apt => {
              // Convert to mock-like object structure for rendering
              const patientObj = {
                id: apt._id,
                _id: apt._id,
                patient: apt.patient.user.name,
                age: new Date().getFullYear() - new Date(apt.patient.dob).getFullYear(),
                gender: apt.patient.gender === 'male' ? 'M' : 'F',
                time: apt.slot,
                reason: apt.symptoms,
                status: apt.status === 'scheduled' ? 'waiting' : apt.status,
                patientRef: apt.patient
              };

              return (
                <div
                  key={apt._id}
                  onClick={() => patientObj.status === 'waiting' && setActivePatient(patientObj)}
                  className={`p-4 rounded-2xl border transition-all ${
                    activePatient?.id === patientObj.id ? 'bg-blue-50 border-blue-300 shadow-md' :
                    patientObj.status === 'completed' ? 'bg-slate-50 border-slate-200 opacity-60' :
                    'bg-white border-slate-200 hover:border-blue-200 cursor-pointer hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{patientObj.patient}</span>
                      <span className="text-xs text-slate-500 ml-2">{patientObj.age}y • {patientObj.gender}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      patientObj.status === 'completed' ? 'bg-slate-200 text-slate-600' :
                      patientObj.status === 'waiting' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {patientObj.time}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-start gap-1.5 line-clamp-1">
                    <Activity className="h-3.5 w-3.5 shrink-0 mt-0.5 text-teal-500" />
                    {patientObj.reason}
                  </div>
                </div>
              );
            })}
            {todayAppointments.length === 0 && <p className="text-xs text-slate-400">No appointments for today.</p>}
          </div>
        </div>
      </div>

      {/* Main Consultation Area */}
      <div className="xl:col-span-8">
        {activePatient ? (
          <div className="space-y-4">
            {/* Patient Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-lg font-bold">
                  {activePatient.patient.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">{activePatient.patient}</h2>
                  <p className="text-sm text-slate-500">{activePatient.age} years old • {activePatient.gender} • Appt: {activePatient.time}</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 max-w-[280px]">
                <div className="text-[10px] font-bold uppercase text-amber-600 mb-0.5">Chief Complaint</div>
                <div className="text-xs font-semibold text-amber-800">{activePatient.reason}</div>
              </div>
            </div>

            {/* Notes & Prescriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <FileEdit className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-bold text-slate-800">Clinical Notes</span>
                </div>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Enter diagnosis, observations..."
                  className="flex-1 w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none min-h-[160px] outline-none focus:border-blue-400"
                />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <PenTool className="h-4 w-4 text-teal-500" />
                  <span className="text-sm font-bold text-slate-800">Prescription</span>
                </div>
                <textarea
                  value={prescription} onChange={e => setPrescription(e.target.value)}
                  placeholder="Rx Details (Medicine, Dosage, Duration)..."
                  className="flex-1 w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none min-h-[160px] outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Patient Friendly Explanation */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-bold text-slate-800">Patient-Friendly Explanation</span>
                </div>
                <button onClick={handleGenerateExplanation} disabled={generating} className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> {generating ? 'Generating...' : 'Auto-Generate via AI'}
                </button>
              </div>
              <div className="p-5">
                {patientFriendly ? (
                  <p className="text-sm text-slate-700 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">{patientFriendly}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic text-center py-6">Write notes/prescription first, then use AI to generate an easy-to-understand summary for the patient.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setActivePatient(null)} className="h-11 px-6 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={completeConsult} className="h-11 px-8 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                Complete Consultation
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[500px] bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
            <Stethoscope className="h-16 w-16 mb-4 text-slate-300" />
            <p className="text-lg font-bold text-slate-600 mb-1">Consultation Room</p>
            <p className="text-sm max-w-sm text-center">Select a waiting patient from the queue to start their consultation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AppointmentsPanel = () => {
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    const fetchApts = async () => {
      try {
        const res = await getDoctorSchedule();
        const startOfDay = new Date();
        startOfDay.setHours(23, 59, 59, 999);
        
        // Filter future appointments
        const future = res.data.filter(apt => new Date(apt.date) > startOfDay);
        setUpcoming(future);
      } catch (err) {
        toast.error('Failed to load upcoming appointments');
      }
    };
    fetchApts();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" /> Upcoming Schedule</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {upcoming.map(apt => (
            <div key={apt._id} className="p-6 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-blue-500 uppercase">{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="text-xs font-black text-blue-700">{apt.slot}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{apt.patient.user.name}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{apt.symptoms}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Reschedule</button>
                <button className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100">Cancel</button>
              </div>
            </div>
          ))}
          {upcoming.length === 0 && <div className="p-6 text-sm text-slate-500">No upcoming appointments found.</div>}
        </div>
      </div>
    </div>
  );
};

/* ── Main Dashboard ──────────────────────────────────────────────────── */
const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('consult');

  const tabs = [
    { id: 'consult', label: 'Consultation Room', icon: Stethoscope },
    { id: 'appointments', label: 'Upcoming Appointments', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">
          Welcome back, {user?.name}
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Your clinical workspace.</p>
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
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'consult' && <ConsultationPanel />}
        {activeTab === 'appointments' && <AppointmentsPanel />}
      </div>
    </div>
  );
};

export default DoctorDashboard;
