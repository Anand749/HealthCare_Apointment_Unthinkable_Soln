import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Search,
  Star,
  Clock,
  Filter,
  CheckCircle,
  AlertTriangle,
  Brain,
  Upload,
  Calendar,
  Sparkles,
  Heart,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const mockDoctors = [
  {
    id: 'd1',
    name: 'Dr. Raj Sharma',
    specialization: 'Cardiologist',
    experience: 18,
    rating: 4.9,
    consultations: 1240,
    languages: ['English', 'Hindi'],
    slotsToday: ['2:30 PM', '4:15 PM'],
    slotsTomorrow: ['10:00 AM', '11:30 AM'],
    image: '👨‍⚕️'
  },
  {
    id: 'd2',
    name: 'Dr. Sarah Connor',
    specialization: 'Cardiologist',
    experience: 15,
    rating: 4.8,
    consultations: 850,
    languages: ['English', 'Spanish'],
    slotsToday: [],
    slotsTomorrow: ['9:00 AM', '10:30 AM'],
    image: '👩‍⚕️'
  },
  {
    id: 'd3',
    name: 'Dr. Michael Cho',
    specialization: 'Dermatologist',
    experience: 10,
    rating: 4.7,
    consultations: 620,
    languages: ['English', 'Korean'],
    slotsToday: ['1:00 PM', '3:00 PM'],
    slotsTomorrow: ['2:00 PM', '4:00 PM'],
    image: '👨‍⚕️'
  },
  {
    id: 'd4',
    name: 'Dr. Lisa Ray',
    specialization: 'General Physician',
    experience: 8,
    rating: 4.6,
    consultations: 430,
    languages: ['English', 'French'],
    slotsToday: ['11:00 AM', '12:00 PM', '5:00 PM'],
    slotsTomorrow: ['10:00 AM', '3:30 PM'],
    image: '👩‍⚕️'
  }
];

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState(mockDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('all');
  const [experience, setExperience] = useState('all');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);

  // Recommendations state
  const [aiQuery, setAiQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isRecommending, setIsRecommending] = useState(false);

  // Triage state
  const [riskLevel, setRiskLevel] = useState(null);

  // Booking states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingSymptoms, setBookingSymptoms] = useState('');
  const [holdTimer, setHoldTimer] = useState(0);

  // Auto Release hold mock
  useEffect(() => {
    let interval;
    if (holdTimer > 0) {
      interval = setInterval(() => {
        setHoldTimer((prev) => prev - 1);
      }, 1000);
    } else if (holdTimer === 0 && selectedSlot) {
      setSelectedSlot('');
      toast.error('Booking slot reservation expired (5-minute limit). Please reselect.');
    }
    return () => clearInterval(interval);
  }, [holdTimer, selectedSlot]);

  // AI Recommendation Engine
  const runRecommendationEngine = () => {
    if (!aiQuery) {
      setRecommendations([]);
      setRiskLevel(null);
      return;
    }

    setIsRecommending(true);

    // Simple symptom analysis matching
    setTimeout(() => {
      const query = aiQuery.toLowerCase();
      let matchedRecs = [];
      let calculatedRisk = { level: 'GREEN', text: 'Low risk. Standard consultation recommended.', action: 'Book normal checkup.' };

      // Emergency Risk Check (Extra Feature 1)
      if (query.includes('chest pain') || query.includes('breathing') || query.includes('shortness of breath')) {
        calculatedRisk = {
          level: 'RED',
          text: 'Possible cardiac emergency or severe pulmonary restriction.',
          action: 'Seek immediate emergency services or visit the nearest ER.'
        };
      } else if (query.includes('fever') && query.includes('vomiting')) {
        calculatedRisk = {
          level: 'ORANGE',
          text: 'High infection risk or acute gastroenteritis.',
          action: 'Schedule consultation within 24 hours. Keep hydrated.'
        };
      } else if (query.includes('fever') || query.includes('rash')) {
        calculatedRisk = {
          level: 'YELLOW',
          text: 'Mild inflammatory or minor viral symptom profile.',
          action: 'Schedule routine virtual or clinic visit.'
        };
      }

      setRiskLevel(calculatedRisk);

      // Recommendations matching Doctors (Extra Feature 4)
      if (query.includes('chest') || query.includes('breath') || query.includes('heart') || query.includes('cardio')) {
        // Cardiologist match
        matchedRecs = mockDoctors
          .filter((d) => d.specialization === 'Cardiologist')
          .map((d) => ({
            ...d,
            confidence: 96,
            reason: 'Cardiology specialist matching cardiovascular symptom description. Earliest availability helps manage acute profiles.'
          }));
      } else if (query.includes('skin') || query.includes('rash') || query.includes('itch')) {
        // Dermatologist match
        matchedRecs = mockDoctors
          .filter((d) => d.specialization === 'Dermatologist')
          .map((d) => ({
            ...d,
            confidence: 94,
            reason: 'Dermatology specialist matching skin symptom indicators.'
          }));
      } else {
        // Fallback GPs
        matchedRecs = mockDoctors
          .filter((d) => d.specialization === 'General Physician')
          .map((d) => ({
            ...d,
            confidence: 88,
            reason: 'General diagnostic consultation matches systemic or complex symptoms.'
          }));
      }

      setRecommendations(matchedRecs);
      setIsRecommending(false);
      toast.success('AI recommendation generated!');
    }, 800);
  };

  // Filter application
  useEffect(() => {
    let filtered = mockDoctors.filter((doc) => {
      const matchSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSpecialty = specialization === 'all' || doc.specialization === specialization;
      const matchExp = experience === 'all' ||
        (experience === '15+' && doc.experience >= 15) ||
        (experience === '10-15' && doc.experience >= 10 && doc.experience < 15) ||
        (experience === '<10' && doc.experience < 10);
      const matchToday = !onlyAvailableToday || doc.slotsToday.length > 0;

      return matchSearch && matchSpecialty && matchExp && matchToday;
    });

    setDoctors(filtered);
  }, [searchTerm, specialization, experience, onlyAvailableToday]);

  const selectSlot = (slot) => {
    setSelectedSlot(slot);
    setHoldTimer(300); // 5 minutes in seconds
    toast.success(`Slot ${slot} reserved temporarily for 5 minutes.`);
  };

  const handleBookAppointment = () => {
    if (!bookingDate || !selectedSlot) {
      toast.error('Please choose both Date and Slot');
      return;
    }
    toast.success(`Successfully booked appointment with ${selectedDoctor.name} on ${bookingDate} at ${selectedSlot}!`);
    setSelectedDoctor(null);
    setSelectedSlot('');
    setHoldTimer(0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Search and AI Assistant split panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Search Filters */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" /> Search & Filter Doctors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="search">Name or Specialization</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Search Dr..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 rounded-xl bg-white dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="specialty">Specialization</Label>
                <select
                  id="specialty"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                >
                  <option value="all">All Specialities</option>
                  <option value="Cardiologist">Cardiology</option>
                  <option value="Dermatologist">Dermatology</option>
                  <option value="General Physician">General Practice</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp">Experience</Label>
                <select
                  id="exp"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                >
                  <option value="all">Any Experience</option>
                  <option value="15+">15+ Years</option>
                  <option value="10-15">10 - 15 Years</option>
                  <option value="<10">Less than 10 Years</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="availableToday"
                  checked={onlyAvailableToday}
                  onChange={(e) => setOnlyAvailableToday(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary"
                />
                <Label htmlFor="availableToday" className="cursor-pointer text-xs">Available Today</Label>
              </div>
            </CardContent>
          </Card>

          {/* AI Risk / Triage Assistant Widget */}
          <Card className="bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-teal-500/10 border-b border-slate-200/20 py-4.5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> AI Smart Recommendation
              </CardTitle>
              <CardDescription className="text-xs">
                Enter your symptoms to instantly find doctors and screen for emergencies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="symptoms">Explain how you feel</Label>
                <textarea
                  id="symptoms"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g. Chest pain, difficulty breathing, rash on hands"
                  className="w-full min-h-[90px] text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <Button
                onClick={runRecommendationEngine}
                disabled={isRecommending || !aiQuery}
                className="w-full rounded-xl gap-2 font-medium"
              >
                {isRecommending ? 'Analyzing...' : 'Generate AI Matches'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Doctor Matching Display */}
        <div className="lg:col-span-8 space-y-6">
          {/* Risk Level Triage Box */}
          {riskLevel && (
            <div className={`p-5 rounded-2xl border flex gap-4 ${
              riskLevel.level === 'RED' ? 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300' :
              riskLevel.level === 'ORANGE' ? 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300' :
              riskLevel.level === 'YELLOW' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300' :
              'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300'
            }`}>
              <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Emergency Risk: {riskLevel.level}
                  </span>
                </div>
                <h4 className="font-semibold text-sm">{riskLevel.text}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Recommended Action: <strong className="text-slate-800 dark:text-slate-200">{riskLevel.action}</strong>
                </p>
                <p className="text-[10px] text-slate-400 italic pt-1.5 border-t border-slate-200/20">
                  This is only an AI-assisted recommendation. Always seek professional clinical confirmation.
                </p>
              </div>
            </div>
          )}

          {/* AI Recommended Doctors Section */}
          {recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm tracking-wide uppercase text-slate-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary fill-primary/10" /> AI Recommendation Matches
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((doc) => (
                  <Card key={doc.id} className="border-primary/30 bg-gradient-to-tr from-white to-primary/5 dark:from-slate-900 dark:to-primary/10 rounded-2xl relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 bg-primary text-white text-[10px] uppercase font-bold py-1 px-3.5 rounded-bl-xl flex items-center gap-1">
                      <Sparkles className="h-3 w-3 fill-white" /> Recommended ({doc.confidence}%)
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">{doc.image}</div>
                        <div>
                          <CardTitle className="text-sm font-bold">{doc.name}</CardTitle>
                          <CardDescription className="text-xs">{doc.specialization}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic bg-white/50 dark:bg-slate-950/30 p-2 rounded-lg">
                        "{doc.reason}"
                      </p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{doc.experience} Years Exp.</span>
                        <span className="flex items-center gap-1 font-semibold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-500" /> {doc.rating}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 border-t border-slate-200/30 dark:border-slate-800/30 mt-2 p-4">
                      <Button onClick={() => setSelectedDoctor(doc)} className="w-full rounded-xl text-xs" size="sm">
                        Select Doctor
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Standard Listings */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm tracking-wide uppercase text-slate-400">Available Doctors ({doctors.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doc) => (
                <Card key={doc.id} className="bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex gap-3">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">{doc.image}</div>
                      <div>
                        <CardTitle className="text-base font-bold">{doc.name}</CardTitle>
                        <CardDescription className="text-xs">{doc.specialization}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 border-y border-slate-200/30 dark:border-slate-800/30 py-2.5 text-center text-xs">
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase font-bold">Experience</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{doc.experience} Yrs</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase font-bold">Rating</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-0.5 mt-0.5">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {doc.rating}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase font-bold">Consults</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{doc.consultations}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Available slots today:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {doc.slotsToday.length > 0 ? (
                          doc.slotsToday.map((slot) => (
                            <Badge key={slot} variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-semibold border-none py-0.5">
                              {slot}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No availability remaining today</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 border-t border-slate-200/30 dark:border-slate-800/30 mt-2 p-4">
                    <Button onClick={() => setSelectedDoctor(doc)} variant="outline" className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs hover:bg-slate-50">
                      Book Slot
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Drawer / Panel Overlay */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 flex flex-col justify-between shadow-2xl relative overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Book Consultation</h3>
                <Button variant="ghost" onClick={() => setSelectedDoctor(null)} className="h-8 w-8 p-0 rounded-full">✕</Button>
              </div>

              {/* Doctor Quick View */}
              <div className="flex gap-3 mb-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-lg">{selectedDoctor.image}</div>
                <div>
                  <h4 className="font-bold text-sm">{selectedDoctor.name}</h4>
                  <p className="text-xs text-slate-400">{selectedDoctor.specialization}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bookDate">Select Date</Label>
                  <Input
                    type="date"
                    id="bookDate"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                {/* Slots selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Select Time Slot</Label>
                    {holdTimer > 0 && (
                      <span className="text-[10px] text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full border border-red-500/20 animate-pulse">
                        Reserving Slot: {Math.floor(holdTimer / 60)}:{(holdTimer % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {mockDoctors.find((d) => d.id === selectedDoctor.id)?.slotsToday.map((slot) => (
                      <Button
                        key={slot}
                        type="button"
                        variant={selectedSlot === slot ? 'default' : 'outline'}
                        onClick={() => selectSlot(slot)}
                        className="rounded-xl text-xs py-2 h-auto"
                      >
                        {slot}
                      </Button>
                    ))}
                    {selectedDoctor.slotsToday.length === 0 && (
                      <span className="col-span-3 text-xs text-slate-400 italic">No available slots. Please choose another date or doctor.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bookSymptoms">Explain symptoms (Optional)</Label>
                  <textarea
                    id="bookSymptoms"
                    value={bookingSymptoms}
                    onChange={(e) => setBookingSymptoms(e.target.value)}
                    placeholder="e.g. Cough, sore throat for 3 days"
                    className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:border-primary resize-none min-h-[70px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Upload Clinical Reports (Optional)</Label>
                  <div className="border border-dashed border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/50 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5">
                    <Upload className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-400">PDF, JPG, PNG up to 5MB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
              <Button onClick={handleBookAppointment} disabled={!selectedSlot} className="w-full rounded-xl">
                Confirm Reservation & Book
              </Button>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                By booking, you authorize calendar auto-syncing with HealSync services.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
