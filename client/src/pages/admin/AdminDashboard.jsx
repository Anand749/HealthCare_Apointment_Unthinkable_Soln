import React, { useState } from 'react';
import {
  Users, Calendar, DollarSign, TrendingUp, Award, CheckCircle, XCircle,
  Stethoscope, Plus, Trash2, MailWarning, AlertTriangle, HelpCircle, ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';

/* ── Mock Data ─────────────────────────────────────────────────────────── */
const appointmentTrends = [
  { month: 'Jan', appointments: 85, revenue: 41000 },
  { month: 'Feb', appointments: 94, revenue: 47000 },
  { month: 'Mar', appointments: 78, revenue: 38000 },
  { month: 'Apr', appointments: 110, revenue: 55000 },
  { month: 'May', appointments: 102, revenue: 51000 },
  { month: 'Jun', appointments: 128, revenue: 64000 },
];

const departmentData = [
  { name: 'Cardiology', value: 45, color: '#3b82f6' },
  { name: 'Dermatology', value: 30, color: '#14b8a6' },
  { name: 'General', value: 55, color: '#10b981' },
  { name: 'Neurology', value: 22, color: '#8b5cf6' },
  { name: 'Ortho', value: 28, color: '#f59e0b' },
];

const doctorPerformance = [
  { name: 'Dr. Raj S.', rating: 4.9, patients: 145 },
  { name: 'Dr. Sarah C.', rating: 4.8, patients: 120 },
  { name: 'Dr. Michael C.', rating: 4.7, patients: 98 },
  { name: 'Dr. Lisa R.', rating: 4.6, patients: 87 },
];

const patientGrowth = [
  { month: 'Jan', new: 32, returning: 53 },
  { month: 'Feb', new: 45, returning: 49 },
  { month: 'Mar', new: 38, returning: 40 },
  { month: 'Apr', new: 60, returning: 50 },
  { month: 'May', new: 54, returning: 48 },
  { month: 'Jun', new: 72, returning: 56 },
];

const mockDoctors = [
  { id: 'd1', name: 'Dr. Raj Sharma', spec: 'Cardiologist', exp: 18, status: 'active', leaves: 0 },
  { id: 'd2', name: 'Dr. Sarah Connor', spec: 'Cardiologist', exp: 15, status: 'on-leave', leaves: 3 },
  { id: 'd3', name: 'Dr. Michael Cho', spec: 'Dermatologist', exp: 10, status: 'active', leaves: 1 },
  { id: 'd4', name: 'Dr. Lisa Ray', spec: 'General Physician', exp: 8, status: 'active', leaves: 0 },
];

const mockLeaveConflicts = [
  { id: 'l1', doctor: 'Dr. Sarah Connor', from: '2026-07-15', to: '2026-07-18', affected: 9 },
  { id: 'l2', doctor: 'Dr. Michael Cho', from: '2026-07-20', to: '2026-07-20', affected: 4 },
];

const mockNotificationLog = [
  { id: 'n1', type: 'email', to: 'arun.k@example.com', status: 'delivered', subject: 'Appointment confirmed', ts: '2026-07-14 10:02' },
  { id: 'n2', type: 'email', to: 'priya.s@example.com', status: 'failed', subject: 'Appointment rescheduled', ts: '2026-07-14 09:48' },
  { id: 'n3', type: 'email', to: 'ravi.m@example.com', status: 'retrying', subject: 'Medication reminder', ts: '2026-07-14 09:30' },
  { id: 'n4', type: 'email', to: 'meena.r@example.com', status: 'delivered', subject: 'Doctor on leave – reschedule', ts: '2026-07-14 08:15' },
];

/* ── Sub Components ────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, trend }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <div className={`p-2 rounded-xl ${iconBg}`}><Icon className={`h-4 w-4 ${iconColor}`} /></div>
    </div>
    <div className="text-2xl font-extrabold text-slate-800">{value}</div>
    {sub && (
      <div className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
        {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : trend === 'down' ? <TrendingUp className="h-3.5 w-3.5 rotate-180" /> : null}
        {sub}
      </div>
    )}
  </div>
);

const OverviewPanel = () => (
  <div className="space-y-6 animate-in fade-in">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Doctors" value="28" sub="+3 this month" icon={Stethoscope} iconBg="bg-blue-50" iconColor="text-blue-600" trend="up" />
      <StatCard label="Total Patients" value="1,342" sub="+72 this month" icon={Users} iconBg="bg-teal-50" iconColor="text-teal-600" trend="up" />
      <StatCard label="Appointments" value="128" sub="June total" icon={Calendar} iconBg="bg-purple-50" iconColor="text-purple-600" trend="up" />
      <StatCard label="Revenue (Est.)" value="₹64,000" sub="June gross" icon={DollarSign} iconBg="bg-amber-50" iconColor="text-amber-500" trend="up" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-slate-800">Appointment & Revenue Trend</h3>
          <p className="text-xs text-slate-400">Monthly bookings and estimated revenue</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={appointmentTrends} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
            <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Line name="Appointments" type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-slate-800">Dept. Distribution</h3>
          <p className="text-xs text-slate-400">Appointments by specialization</p>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={departmentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
              {departmentData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1.5">
          {departmentData.map(d => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
              <span className="flex-1 text-slate-500">{d.name}</span>
              <span className="font-bold text-slate-700">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-slate-800">Doctor Performance</h3>
          <p className="text-xs text-slate-400">Rating and consultations by doctor</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={doctorPerformance} layout="vertical" margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} width={90} />
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} />
            <Bar name="Patients" dataKey="patients" fill="#3b82f6" radius={[0, 6, 6, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-slate-800">Patient Growth</h3>
          <p className="text-xs text-slate-400">New vs. returning patients per month</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={patientGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
            <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Bar name="New" dataKey="new" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={24} stackId="a" />
            <Bar name="Returning" dataKey="returning" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={24} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const DoctorManagePanel = () => {
  const [doctors, setDoctors] = useState(mockDoctors);
  const [showAdd, setShowAdd] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', spec: '', exp: '' });

  const addDoctor = () => {
    if (!newDoc.name || !newDoc.spec || !newDoc.exp) { toast.error('Fill all fields'); return; }
    setDoctors(p => [...p, { id: `d${Date.now()}`, ...newDoc, exp: Number(newDoc.exp), status: 'active', leaves: 0 }]);
    setNewDoc({ name: '', spec: '', exp: '' }); setShowAdd(false);
    toast.success('Doctor added successfully!');
  };

  const removeDoctor = (id) => { setDoctors(p => p.filter(d => d.id !== id)); toast.success('Doctor removed.'); };

  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800">Manage Doctors</h3>
          <p className="text-xs text-slate-400 mt-0.5">{doctors.length} registered physicians</p>
        </div>
        <button onClick={() => setShowAdd(p => !p)} className="flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Doctor
        </button>
      </div>

      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h4 className="font-bold text-sm text-slate-800 mb-4">New Doctor Registration</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <input value={newDoc.name} onChange={e => setNewDoc(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" className="h-10 bg-white border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-blue-400" />
            <input value={newDoc.spec} onChange={e => setNewDoc(p => ({ ...p, spec: e.target.value }))} placeholder="Specialization" className="h-10 bg-white border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-blue-400" />
            <input type="number" value={newDoc.exp} onChange={e => setNewDoc(p => ({ ...p, exp: e.target.value }))} placeholder="Experience (yrs)" className="h-10 bg-white border border-slate-200 rounded-xl px-4 text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-2">
            <button onClick={addDoctor} className="flex-1 h-9 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">Add Doctor</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 h-9 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 px-5 py-3 bg-slate-50">
          <div className="col-span-4">Doctor</div>
          <div className="col-span-3">Specialization</div>
          <div className="col-span-2">Experience</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        {doctors.map(doc => (
          <div key={doc.id} className="grid grid-cols-12 items-center px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
            <div className="col-span-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">{doc.name.split(' ')[1]?.charAt(0)}</div>
              <span className="text-sm font-semibold text-slate-800">{doc.name}</span>
            </div>
            <div className="col-span-3 text-sm text-slate-500">{doc.spec}</div>
            <div className="col-span-2 text-sm text-slate-500">{doc.exp} yrs</div>
            <div className="col-span-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {doc.status === 'active' ? 'Active' : 'On Leave'}
              </span>
            </div>
            <div className="col-span-1 flex justify-end">
              <button onClick={() => removeDoctor(doc.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LeaveConflictPanel = () => {
  const [leaves, setLeaves] = useState(mockLeaveConflicts);

  const handleCancelLeave = (id) => {
    setLeaves(p => p.filter(l => l.id !== id));
    toast.success('Leave cancelled. Affected patients notified via email.');
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      <div>
        <h3 className="font-bold text-slate-800">Leave Conflict Management</h3>
        <p className="text-xs text-slate-400 mt-0.5">Manage doctor leaves and notify affected patients automatically</p>
      </div>

      {leaves.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <p className="font-bold text-green-700">No Leave Conflicts</p>
          <p className="text-xs text-green-500 mt-1">All doctor schedules are clear and conflict-free.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map(leave => (
            <div key={leave.id} className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="font-bold text-slate-800">{leave.doctor}</span>
                    <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Leave Conflict</span>
                  </div>
                  <p className="text-sm text-slate-500">Leave period: <strong>{leave.from}</strong> → <strong>{leave.to}</strong></p>
                  <p className="text-sm text-amber-600 font-semibold mt-1">{leave.affected} patient appointments affected</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { toast.success(`${leave.affected} patients notified. One-click reschedule links sent.`); }} className="flex items-center gap-2 text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 px-3.5 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                  <MailWarning className="h-4 w-4" /> Notify & Send Reschedule Links
                </button>
                <button onClick={() => handleCancelLeave(leave.id)} className="flex items-center gap-2 text-xs font-semibold bg-red-50 border border-red-200 text-red-600 px-3.5 py-2 rounded-xl hover:bg-red-100 transition-colors">
                  <XCircle className="h-4 w-4" /> Cancel Leave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NotificationPanel = () => {
  const [logs, setLogs] = useState(mockNotificationLog);

  const retryAll = () => {
    setLogs(p => p.map(l => l.status === 'failed' ? { ...l, status: 'retrying' } : l));
    toast.success('Retrying failed notifications...');
    setTimeout(() => {
      setLogs(p => p.map(l => l.status === 'retrying' ? { ...l, status: 'delivered' } : l));
      toast.success('All notifications delivered!');
    }, 2000);
  };

  const statusColors = {
    delivered: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-600',
    retrying: 'bg-amber-100 text-amber-600',
  };

  const failedCount = logs.filter(l => l.status === 'failed').length;

  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800">Notification Logs</h3>
          <p className="text-xs text-slate-400 mt-0.5">Email delivery tracking with retry support</p>
        </div>
        {failedCount > 0 && (
          <button onClick={retryAll} className="flex items-center gap-2 text-xs font-semibold bg-amber-600 text-white px-4 py-2.5 rounded-xl hover:bg-amber-700 transition-colors">
            <MailWarning className="h-4 w-4" /> Retry {failedCount} Failed
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 px-5 py-3 bg-slate-50">
          <div className="col-span-3">Recipient</div>
          <div className="col-span-4">Subject</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Timestamp</div>
        </div>
        {logs.map(n => (
          <div key={n.id} className="grid grid-cols-12 items-center px-5 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
            <div className="col-span-3 text-xs text-slate-700 font-medium truncate">{n.to}</div>
            <div className="col-span-4 text-xs text-slate-500 truncate">{n.subject}</div>
            <div className="col-span-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[n.status]}`}>{n.status}</span>
            </div>
            <div className="col-span-3 text-xs text-slate-400">{n.ts}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Admin Dashboard ───────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === 'overview' && <OverviewPanel />}
        {activeTab === 'doctors' && <DoctorManagePanel />}
        {activeTab === 'leaves' && <LeaveConflictPanel />}
        {activeTab === 'notifications' && <NotificationPanel />}
      </div>
    </div>
  );
};

export default AdminDashboard;
