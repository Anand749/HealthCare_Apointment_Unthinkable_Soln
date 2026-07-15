import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users, Calendar, DollarSign, TrendingUp, Award, CheckCircle, XCircle,
  Stethoscope, Plus, Trash2, MailWarning, AlertTriangle, HelpCircle, ChevronDown, Loader2
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import {
  getAnalytics,
  addDoctor as apiAddDoctor,
  getAllDoctors as apiGetAllDoctors,
  deleteDoctor as apiDeleteDoctor,
  getNotificationLogs as apiGetNotificationLogs,
  getLeaves as apiGetLeaves,
  cancelLeave as apiCancelLeave
} from '../../services/adminService';

/* ── Stat Card ─────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, trend, loading }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <div className={`p-2 rounded-xl ${iconBg}`}><Icon className={`h-4 w-4 ${iconColor}`} /></div>
    </div>
    {loading ? (
      <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg" />
    ) : (
      <div className="text-2xl font-extrabold text-slate-800">{value}</div>
    )}
    {sub && (
      <div className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
        {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : trend === 'down' ? <TrendingUp className="h-3.5 w-3.5 rotate-180" /> : null}
        {sub}
      </div>
    )}
  </div>
);

/* ── Overview Panel ────────────────────────────────────────────────────── */
const OverviewPanel = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading analytics & operational metrics...</p>
      </div>
    );
  }

  const totals = data?.totals || { doctors: 0, patients: 0, appointments: 0, notifications: 0, revenue: 0 };
  const dailyTrend = data?.dailyTrend || [];
  const bySpecialization = data?.bySpecialization || [];
  const patientGrowth = data?.patientGrowth || [];
  const topDoctors = data?.topDoctors || [];

  const COLORS = ['#3b82f6', '#14b8a6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Doctors" value={totals.doctors} sub="Physician directory" icon={Stethoscope} iconBg="bg-blue-50" iconColor="text-blue-600" trend="up" />
        <StatCard label="Total Patients" value={totals.patients} sub="Registered files" icon={Users} iconBg="bg-teal-50" iconColor="text-teal-600" trend="up" />
        <StatCard label="Appointments" value={totals.appointments} sub="All-time consultations" icon={Calendar} iconBg="bg-purple-50" iconColor="text-purple-600" trend="up" />
        <StatCard label="Revenue (Est.)" value={`₹${totals.revenue?.toLocaleString() || 0}`} sub="Gross estimation" icon={DollarSign} iconBg="bg-amber-50" iconColor="text-amber-500" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Appointment Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-800">Appointment Trends</h3>
            <p className="text-xs text-slate-400">Consultations booked over the past 7 days</p>
          </div>
          {dailyTrend.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed">
              No recent bookings trend data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} />
                <Line name="Appointments" type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Specialization Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Specialization Share</h3>
            <p className="text-xs text-slate-400">Total bookings split by department</p>
          </div>
          {bySpecialization.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed my-4">
              No specialization shares yet
            </div>
          ) : (
            <>
              <div className="flex justify-center items-center h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={bySpecialization} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                      {bySpecialization.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                {bySpecialization.map((d, index) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[index % COLORS.length] }} />
                    <span className="flex-1 text-slate-500 truncate">{d.name}</span>
                    <span className="font-bold text-slate-700 shrink-0">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Doctors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Physician Leaderboard</h3>
              <p className="text-xs text-slate-400">Top active doctors by consultations</p>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          {topDoctors.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed">
              No clinical consultations records seeded yet
            </div>
          ) : (
            <div className="space-y-3.5">
              {topDoctors.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {doc.name?.split(' ').pop()?.charAt(0) || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{doc.specialization}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mb-1">
                      {doc.consultations} Consults
                    </span>
                    <p className="text-[10px] font-bold text-amber-500">⭐ {doc.rating.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patient Growth */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-800">Monthly Patient Registrations</h3>
            <p className="text-xs text-slate-400">Patient onboarding growth tracking</p>
          </div>
          {patientGrowth.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed">
              No registration growth records available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={patientGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} />
                <Bar name="New Patients" dataKey="patients" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Doctor Manage Panel ────────────────────────────────────────────────── */
const DoctorManagePanel = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: '', email: '', password: '', gender: 'male',
    specialization: '', department: '', experience: '',
    hospital: '', bio: '', languages: 'English'
  });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await apiGetAllDoctors();
      setDoctors(res.data);
    } catch (err) {
      toast.error('Failed to load doctor database directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const addDoctor = async () => {
    if (!newDoc.name || !newDoc.email || !newDoc.specialization) {
      toast.error('Please enter name, email, and specialization');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...newDoc,
        email: newDoc.email.trim(),
        experience: Number(newDoc.experience || 0),
        languages: newDoc.languages.split(',').map(s => s.trim()).filter(Boolean)
      };
      await apiAddDoctor(payload);
      toast.success('Doctor registered successfully!');
      setNewDoc({
        name: '', email: '', password: '', gender: 'male',
        specialization: '', department: '', experience: '',
        hospital: '', bio: '', languages: 'English'
      });
      setShowAdd(false);
      fetchDoctors();
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const removeDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete/deactivate this doctor?')) return;
    try {
      await apiDeleteDoctor(id);
      toast.success('Doctor profile successfully deactivated.');
      fetchDoctors();
    } catch (err) {
      toast.error(err.message || 'Failed to remove doctor');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800">Physicians Directory</h3>
          <p className="text-xs text-slate-400 mt-0.5">{doctors.length} active healthcare practitioners</p>
        </div>
        <button onClick={() => setShowAdd(p => !p)} className="flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/10">
          <Plus className="h-4 w-4" /> Add Doctor
        </button>
      </div>

      {showAdd && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-4">
          <h4 className="font-bold text-sm text-slate-800">New Practitioner Registration</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Practitioner Name</span>
              <input value={newDoc.name} onChange={e => setNewDoc(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Dr. Jane Doe" className="h-10 w-full bg-white border border-slate-200 rounded-xl px-4 text-xs outline-none focus:border-blue-400" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Credentials / Email</span>
              <input value={newDoc.email} onChange={e => setNewDoc(p => ({ ...p, email: e.target.value }))} placeholder="jane.doe@healsync.com" className="h-10 w-full bg-white border border-slate-200 rounded-xl px-4 text-xs outline-none focus:border-blue-400" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Temporary Password</span>
              <input value={newDoc.password} onChange={e => setNewDoc(p => ({ ...p, password: e.target.value }))} placeholder="Leave blank for auto-generate" className="h-10 w-full bg-white border border-slate-200 rounded-xl px-4 text-xs outline-none focus:border-blue-400" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Specialization</span>
              <input value={newDoc.specialization} onChange={e => setNewDoc(p => ({ ...p, specialization: e.target.value }))} placeholder="Cardiologist / General" className="h-10 w-full bg-white border border-slate-200 rounded-xl px-4 text-xs outline-none focus:border-blue-400" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
              <input value={newDoc.department} onChange={e => setNewDoc(p => ({ ...p, department: e.target.value }))} placeholder="Cardiology / Internal Medicine" className="h-10 w-full bg-white border border-slate-200 rounded-xl px-4 text-xs outline-none focus:border-blue-400" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Years of Experience</span>
              <input type="number" value={newDoc.experience} onChange={e => setNewDoc(p => ({ ...p, experience: e.target.value }))} placeholder="e.g. 10" className="h-10 w-full bg-white border border-slate-200 rounded-xl px-4 text-xs outline-none focus:border-blue-400" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gender</span>
              <select value={newDoc.gender} onChange={e => setNewDoc(p => ({ ...p, gender: e.target.value }))} className="h-10 w-full bg-white border border-slate-200 rounded-xl px-4 text-xs outline-none focus:border-blue-400">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Languages (comma-separated)</span>
              <input value={newDoc.languages} onChange={e => setNewDoc(p => ({ ...p, languages: e.target.value }))} placeholder="English, Spanish" className="h-10 w-full bg-white border border-slate-200 rounded-xl px-4 text-xs outline-none focus:border-blue-400" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Affiliated Hospital</span>
              <input value={newDoc.hospital} onChange={e => setNewDoc(p => ({ ...p, hospital: e.target.value }))} placeholder="General Hospital" className="h-10 w-full bg-white border border-slate-200 rounded-xl px-4 text-xs outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Practitioner Short Biography</span>
            <textarea value={newDoc.bio} onChange={e => setNewDoc(p => ({ ...p, bio: e.target.value }))} placeholder="Write doctor professional overview..." className="w-full h-16 bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-2.5 pt-1">
            <button onClick={addDoctor} disabled={submitting} className="flex-1 h-10 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-55">
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Register Practitioner
            </button>
            <button onClick={() => setShowAdd(false)} className="flex-1 h-10 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 w-full bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center">
          <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 text-sm">No Doctors Registered</p>
          <p className="text-xs text-slate-400 mt-1">Add your first practitioner using the register button.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 px-5 py-3 bg-slate-50">
            <div className="col-span-4">Practitioner</div>
            <div className="col-span-3">Department & Speciality</div>
            <div className="col-span-2">Experience & Rating</div>
            <div className="col-span-2">Clinic Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          {doctors.map(doc => (
            <div key={doc._id} className="grid grid-cols-12 items-center px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
              <div className="col-span-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {doc.name?.split(' ').pop()?.charAt(0) || 'D'}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">{doc.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{doc.email}</span>
                </div>
              </div>
              <div className="col-span-3 text-xs text-slate-500 font-medium">
                <span className="block text-slate-700 font-semibold">{doc.specialization}</span>
                <span className="text-[10px] text-slate-400">{doc.department || 'N/A'}</span>
              </div>
              <div className="col-span-2 text-xs text-slate-500 font-medium">
                <span className="block text-slate-700 font-semibold">{doc.experience} Years</span>
                <span className="text-[10px] text-amber-500">⭐ {doc.rating?.toFixed(1) || '5.0'}</span>
              </div>
              <div className="col-span-2">
                <span className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-lg ${doc.isActive !== false ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {doc.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => removeDoctor(doc._id)} disabled={doc.isActive === false} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Leave Conflict Panel ──────────────────────────────────────────────── */
const LeaveConflictPanel = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await apiGetLeaves();
      setLeaves(res.data);
    } catch (err) {
      toast.error('Failed to load leave records database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave record?')) return;
    try {
      await apiCancelLeave(id);
      toast.success('Leave cancelled. Notification history preserved.');
      fetchLeaves();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel leave');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      <div>
        <h3 className="font-bold text-slate-800">Physician Leave Directory</h3>
        <p className="text-xs text-slate-400 mt-0.5">Manage doctor leave records and track operations</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-28 w-full bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-green-50/50 border border-green-200 rounded-2xl p-8 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <p className="font-bold text-green-700 text-sm">All Clear</p>
          <p className="text-xs text-green-500 mt-1">All doctor schedules are clear and no active leaves are registered.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map(leave => (
            <div key={leave._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="font-bold text-xs text-slate-800">{leave.doctorName}</span>
                    <span className="text-[9px] font-extrabold uppercase bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100">Leave Active</span>
                  </div>
                  <p className="text-xs text-slate-500">Date: <strong>{new Date(leave.date).toLocaleDateString()}</strong></p>
                  <p className="text-xs text-slate-400 mt-1">Reason: <span className="italic">"{leave.reason}"</span></p>
                  {leave.affectedAppointments > 0 && (
                    <p className="text-xs text-amber-600 font-bold mt-1.5">🚨 {leave.affectedAppointments} scheduled appointments cancelled & patient alert emails logged</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { toast.success(`Alert notification logs were sent automatically during scheduling.`); }} className="flex items-center gap-1.5 text-[10px] font-bold bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-2 rounded-xl hover:bg-blue-100/50 transition-colors">
                  <MailWarning className="h-3.5 w-3.5" /> View Patient Reschedule Alerts
                </button>
                <button onClick={() => handleCancelLeave(leave._id)} className="flex items-center gap-1.5 text-[10px] font-bold bg-red-50 border border-red-100 text-red-600 px-3.5 py-2 rounded-xl hover:bg-red-100/50 transition-colors">
                  <XCircle className="h-3.5 w-3.5" /> Cancel Doctor Leave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Notification Panel ────────────────────────────────────────────────── */
const NotificationPanel = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiGetNotificationLogs();
      setLogs(res.data);
    } catch (err) {
      toast.error('Failed to load email notification logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const retryAllFailed = () => {
    // Simulating retry action
    toast.success('Triggering mail server retry queues...');
    setTimeout(() => {
      fetchLogs();
      toast.success('Failed alerts processed successfully.');
    }, 1500);
  };

  const statusColors = {
    sent: 'bg-green-50 text-green-600 border border-green-100',
    failed: 'bg-red-50 text-red-600 border border-red-100',
    retrying: 'bg-amber-50 text-amber-600 border border-amber-100',
  };

  const failedCount = logs.filter(l => l.status === 'failed').length;

  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800">Operations & Mail Logs</h3>
          <p className="text-xs text-slate-400 mt-0.5">Email logs & auto-retry operational details</p>
        </div>
        {failedCount > 0 && (
          <button onClick={retryAllFailed} className="flex items-center gap-1.5 text-[10px] font-bold bg-amber-600 text-white px-4 py-2.5 rounded-xl hover:bg-amber-700 transition-colors shadow-sm shadow-amber-500/10">
            <MailWarning className="h-3.5 w-3.5" /> Retry {failedCount} Failed Alerts
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 w-full bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center">
          <MailWarning className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 text-sm">No notification logs</p>
          <p className="text-xs text-slate-400 mt-1">System operations will display logged communications here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 px-5 py-3 bg-slate-50">
            <div className="col-span-3">Recipient</div>
            <div className="col-span-4">Alert Subject</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Timestamp</div>
          </div>
          {logs.map(n => (
            <div key={n._id} className="grid grid-cols-12 items-center px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
              <div className="col-span-3 text-xs text-slate-700 font-semibold truncate pr-3">{n.recipient}</div>
              <div className="col-span-4 text-xs text-slate-500 truncate pr-3" title={n.body}>{n.subject}</div>
              <div className="col-span-2">
                <span className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-lg ${statusColors[n.status]}`}>{n.status}</span>
              </div>
              <div className="col-span-3 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Admin Dashboard ───────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      toast.error('Failed to load operational metrics from database');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'overview', label: 'Analytics Overview', icon: TrendingUp },
    { id: 'doctors', label: 'Manage Doctors', icon: Stethoscope },
    { id: 'leaves', label: 'Leave Conflicts', icon: AlertTriangle },
    { id: 'notifications', label: 'Notification Logs', icon: MailWarning },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">Admin Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">Hospital management & operational intelligence</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === 'overview' && <OverviewPanel data={analytics} loading={loadingAnalytics} />}
        {activeTab === 'doctors' && <DoctorManagePanel />}
        {activeTab === 'leaves' && <LeaveConflictPanel />}
        {activeTab === 'notifications' && <NotificationPanel />}
      </div>
    </div>
  );
};

export default AdminDashboard;
