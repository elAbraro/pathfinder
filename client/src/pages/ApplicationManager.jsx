import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shortlistAPI, commentsAPI, collaborationAPI, BASE_URL } from '../services/api';
import api from '../services/api'; // Import api instance for upload
import { CheckCircle, Circle, Clock, FileText, Calendar, AlertCircle, Plus } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ApplicationManager = () => {
    const { uniId } = useParams();
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('timeline');
    const [loading, setLoading] = useState(true);
    const [uniData, setUniData] = useState(null);
    const [applicationData, setApplicationData] = useState(null);

    useEffect(() => {
        if (user && user.shortlistedUniversities) {
            const item = user.shortlistedUniversities.find(u => u.university && u.university._id === uniId);
            if (item) {
                setUniData(item.university);
                setApplicationData(item);

                // Initialize local timeline/checklist if empty (simulation of "auto-generate from uni requirements")
                if ((!item.myTimeline || item.myTimeline.length === 0) && item.university.admissions?.applicationTimeline) {
                    // In a real app, this sync might happen on backend during shortlist
                    // Here we just display what we have or fallbacks
                }
            }
            setLoading(false);
        }
    }, [user, uniId]);

    const handleTimelineUpdate = async (stepName, status, completedDate = null) => {
        try {
            const res = await shortlistAPI.updateTimeline(uniId, {
                stepName,
                status,
                completedDate: status === 'Completed' ? (completedDate || new Date()) : null
            });
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    const handleChecklistUpdate = async (docName, status, fileUrl = '') => {
        try {
            await shortlistAPI.updateChecklist(uniId, {
                documentName: docName,
                status,
                fileUrl
            });
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-10">Loading application details...</div>;
    if (!uniData) return <div className="p-10">University not found in your shortlist.</div>;


    // --- Dynamic Personalization Logic ---
    const generateSmartChecklist = () => {
        if (!uniData || !user) return [];

        let dynamicItems = [];
        const requiredDocs = uniData.admissions?.requirements?.documents || [];
        const testRequirements = uniData.admissions?.requirements?.testScores || {};

        // 1. Core Documents (Directly from Uni Requirements)
        requiredDocs.forEach(doc => {
            dynamicItems.push({ documentName: doc, required: true, description: 'University Requirement' });
        });

        // 2. Smart Test Suggestions
        // Check SAT
        if (testRequirements.sat?.min) {
            if (!user.testScores?.sat || user.testScores.sat < testRequirements.sat.min) {
                dynamicItems.push({
                    documentName: 'SAT Score Report',
                    required: true,
                    description: `Score Required: ${testRequirements.sat.min}+ (Your Score: ${user.testScores?.sat || 'N/A'})`,
                    actionLink: '/resources?search=SAT'
                });
            } else {
                dynamicItems.push({ documentName: 'SAT Score Report', required: true, status: 'Uploaded', description: 'Score meets requirement!' });
            }
        }

        // Check GRE
        if (testRequirements.gre?.min) {
            if (!user.testScores?.gre || user.testScores.gre < testRequirements.gre.min) {
                dynamicItems.push({
                    documentName: 'GRE Score Report',
                    required: true,
                    description: `Score Required: ${testRequirements.gre.min}+ (Your Score: ${user.testScores?.gre || 'N/A'})`,
                    actionLink: '/resources?search=GRE'
                });
            }
        }

        // Check IELTS/TOEFL
        if (testRequirements.toefl?.min || testRequirements.ielts?.min) {
            const hasToefl = user.testScores?.toefl >= (testRequirements.toefl?.min || 0);
            const hasIelts = user.testScores?.ielts >= (testRequirements.ielts?.min || 0);

            if (!hasToefl && !hasIelts) {
                dynamicItems.push({
                    documentName: 'English Proficiency (IELTS/TOEFL)',
                    required: true,
                    description: `Required. (Your TOEFL: ${user.testScores?.toefl || 'N/A'}, IELTS: ${user.testScores?.ielts || 'N/A'})`,
                    actionLink: '/resources?search=IELTS'
                });
            }
        }

        // 3. Fallbacks
        if (dynamicItems.length === 0) {
            dynamicItems = [
                { documentName: 'High School Transcripts', required: true },
                { documentName: 'Statement of Purpose', required: true },
                { documentName: 'Letters of Recommendation', required: true }
            ];
        }

        // Merge with Personal Progress
        return dynamicItems.map(doc => {
            const personal = applicationData.myChecklist?.find(c => c.documentName === doc.documentName);
            return { ...doc, ...personal };
        });
    };

    const finalChecklist = generateSmartChecklist();

    const generateSmartTimeline = () => {
        // 1. Base Timeline from University Data or Defaults
        let baseTimeline = uniData.admissions?.applicationTimeline || [];

        // If DB has no timeline steps, create a robust default structure
        if (baseTimeline.length === 0) {
            baseTimeline = [
                { stepName: 'Research & Shortlist', description: 'Decide if this uni is right for you', deadlineDate: null },
                { stepName: 'Prepare Documents', description: 'Gather transcripts, LORs, and required test scores', deadlineDate: null },
            ];
        }

        // 2. Inject Deadlines dynamically (Start and End)
        const deadlines = uniData.admissions?.applicationDeadlines || [];
        // Find relevant deadline (e.g., next upcoming or just the first one)
        const relevantDeadline = deadlines.length > 0 ? deadlines[0] : null;

        if (relevantDeadline) {
            // Check if "Submit Application" already exists, if so update it, else add it
            const submitStepIndex = baseTimeline.findIndex(s => s.stepName.toLowerCase().includes('submit'));

            if (submitStepIndex !== -1) {
                baseTimeline[submitStepIndex].deadlineDate = relevantDeadline.deadline;
                baseTimeline[submitStepIndex].description = `Submit by this date for ${relevantDeadline.term} intake.`;
            } else {
                baseTimeline.push({
                    stepName: `Submit Application (${relevantDeadline.term})`,
                    description: 'Complete submission and pay application fees.',
                    deadlineDate: relevantDeadline.deadline
                });
            }
        }

        // 3. Inject Test Prep steps based on gaps (Existing Logic)
        let enhancedTimeline = [...baseTimeline];
        const testRequirements = uniData.admissions?.requirements?.testScores || {};

        if (testRequirements.sat?.min && (!user.testScores?.sat || user.testScores.sat < testRequirements.sat.min)) {
            enhancedTimeline.splice(1, 0, { // Insert early
                stepName: 'Take SAT Exam',
                description: `Target Score: ${testRequirements.sat.min}+. Book a slot soon!`,
                deadlineDate: null,
                isDynamic: true
            });
        }

        return enhancedTimeline.map(step => {
            const personal = applicationData.myTimeline?.find(p => p.stepName === step.stepName);
            return { ...step, ...personal };
        });
    };

    const finalTimeline = generateSmartTimeline();

    const getApplicationStatus = () => {
        if (!applicationData || !applicationData.university) return null;

        const deadlines = applicationData.university.admissions?.applicationDeadlines;

        // Fix: If no deadlines, show "Not Open Yet" or generic status instead of just Unknown
        if (!deadlines || deadlines.length === 0) {
            return {
                status: 'Applications Not Open',
                subtext: 'Check university website for upcoming dates.',
                color: 'bg-slate-100 dark:bg-[#3a3b3c] text-slate-600 dark:text-[#b0b3b8] border-slate-200 dark:border-[#3e4042]',
                isOpen: false
            };
        }

        // Sort deadlines - find the next upcoming one
        const now = new Date();
        const futureDeadlines = deadlines
            .map(d => ({ ...d, date: new Date(d.deadline) }))
            .filter(d => d.date > now)
            .sort((a, b) => a.date - b.date);

        const upcoming = futureDeadlines[0];

        if (upcoming) {
            const daysLeft = Math.ceil((upcoming.date - now) / (1000 * 60 * 60 * 24));
            return {
                status: `Apply for ${upcoming.term}`,
                subtext: `${daysLeft} Days Left (Due: ${upcoming.date.toLocaleDateString()})`,
                color: daysLeft < 30 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
                isOpen: true
            };
        } else {
            // Check if we just missed one
            const lastDeadline = deadlines
                .map(d => ({ ...d, date: new Date(d.deadline) }))
                .sort((a, b) => b.date - a.date)[0]; // Latest one

            return {
                status: 'Applications Closed',
                subtext: lastDeadline ? `Last deadline was ${lastDeadline.date.toLocaleDateString()}` : 'No active intake.',
                color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
                isOpen: false
            };
        }
    };

    const statusBanner = getApplicationStatus();

    if (loading) return <div className="p-8 text-center text-slate-500">Loading application details...</div>;
    if (!applicationData) return <div className="p-8 text-center text-slate-500">Application not found.</div>;

    const handleCollaborate = async () => {
        const email = prompt("Enter mentor's email:");
        if (email) {
            try {
                // user object from AuthContext is the MongoDB profile, no getIdToken()
                // Token is already in localStorage and attached by api interceptor
                await api.post('/collaboration/collaborate', {
                    universityId: uniId,
                    email,
                    message: "Please review my application."
                });
                addToast('Invitation sent successfully!', 'success');
            } catch (error) {
                console.error('Invite error:', error);
                const msg = error.response?.data?.message || 'Failed to send invitation.';
                addToast(msg, 'error');
            }
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Link to="/dashboard" className="text-slate-500 dark:text-[#b0b3b8] hover:text-slate-900 dark:hover:text-[#e4e6eb] mb-4 inline-block">&larr; Back to Dashboard</Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-[#e4e6eb]">{applicationData.university.name}</h1>
                        <p className="text-slate-600 dark:text-[#b0b3b8]">Application Manager</p>
                    </div>
                    {statusBanner && (
                        <div className={`px-4 py-3 rounded-xl border ${statusBanner.color} flex flex-col items-end`}>
                            <span className="font-bold flex items-center gap-2">
                                {statusBanner.isOpen ? <Clock size={16} /> : <AlertCircle size={16} />}
                                {statusBanner.status}
                            </span>
                            <span className="text-xs opacity-90">{statusBanner.subtext}</span>
                        </div>
                    )}
                </div>
            </div>

            <header className="flex items-center gap-6 mb-8 bg-white dark:bg-[#242526] p-6 rounded-xl border border-slate-200 dark:border-[#3e4042] shadow-sm">
                {uniData.images?.[0] ? (
                    <img src={uniData.images[0]} alt={uniData.name} className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                    <div className="w-20 h-20 bg-slate-100 dark:bg-[#3a3b3c] rounded-lg flex items-center justify-center text-3xl">🏛️</div>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e4e6eb]">{uniData.name}</h1>
                    <p className="text-slate-500 dark:text-[#b0b3b8]">Application Manager</p>
                    <div className="mt-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full inline-block font-medium">
                        Status: <span className="uppercase">{applicationData.applicationStatus || 'Not Started'}</span>
                    </div>
                    <button
                        onClick={handleCollaborate}
                        className="ml-4 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full inline-block font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                    >
                        🤝 Collaborate
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Tabs & Main Content */}
                <div className="lg:col-span-2">
                    <div className="flex gap-4 border-b border-slate-200 dark:border-[#3e4042] mb-6">
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'timeline' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-500 dark:text-[#b0b3b8] hover:text-slate-700 dark:hover:text-[#e4e6eb]'}`}
                        >
                            Application Timeline
                        </button>
                        <button
                            onClick={() => setActiveTab('checklist')}
                            className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'checklist' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-500 dark:text-[#b0b3b8] hover:text-slate-700 dark:hover:text-[#e4e6eb]'}`}
                        >
                            Document Checklist
                        </button>
                        <button
                            onClick={() => setActiveTab('collaboration')}
                            className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'collaboration' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-500 dark:text-[#b0b3b8] hover:text-slate-700 dark:hover:text-[#e4e6eb]'}`}
                        >
                            Collaborate
                        </button>
                    </div>

                    {activeTab === 'timeline' && (
                        <div className="space-y-6">
                            {finalTimeline.map((step, idx) => (
                                <div key={idx} className={`flex gap-4 p-4 rounded-xl border ${step.status === 'Completed' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-white dark:bg-[#242526] border-slate-200 dark:border-[#3e4042]'}`}>
                                    <div className="mt-1">
                                        {step.status === 'Completed' ? <CheckCircle className="text-green-600 dark:text-green-400" /> : <Circle className="text-slate-300 dark:text-[#3e4042]" />}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`font-semibold text-lg ${step.status === 'Completed' ? 'text-green-800 dark:text-green-400' : 'text-slate-900 dark:text-[#e4e6eb]'}`}>{step.stepName}</h3>
                                            {step.deadlineDate && (
                                                <span className="text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded flex items-center gap-1">
                                                    <Clock size={12} /> Due: {new Date(step.deadlineDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-600 dark:text-[#b0b3b8] text-sm mt-1">{step.description || 'Complete this step to move forward.'}</p>

                                        <div className="mt-4 flex gap-2">
                                            {step.status !== 'Completed' && (
                                                <button
                                                    onClick={() => handleTimelineUpdate(step.stepName, 'Completed')}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                                >
                                                    Mark as Done
                                                </button>
                                            )}
                                            {step.status === 'Completed' && (
                                                <button
                                                    onClick={() => handleTimelineUpdate(step.stepName, 'Pending')}
                                                    className="px-3 py-1.5 bg-slate-200 dark:bg-[#3a3b3c] text-slate-600 dark:text-[#e4e6eb] text-sm rounded hover:bg-slate-300 dark:hover:bg-[#4e4f50] transition"
                                                >
                                                    Undo
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'checklist' && (
                        <div className="grid gap-4">
                            {finalChecklist.map((doc, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#242526] p-5 rounded-xl border border-slate-200 dark:border-[#3e4042] shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-slate-400 dark:text-[#b0b3b8]" />
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-[#e4e6eb]">{doc.documentName}</h3>
                                            <p className="text-xs text-slate-500 dark:text-[#b0b3b8]">{doc.description || 'Required document'}</p>
                                            {doc.actionLink && (
                                                <Link to={doc.actionLink} target="_blank" className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block font-medium">
                                                    👉 Study Resources
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={doc.status || 'Pending'}
                                            onChange={(e) => handleChecklistUpdate(doc.documentName, e.target.value)}
                                            className={`text-sm font-medium px-3 py-1.5 rounded border ${doc.status === 'Uploaded' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                                                doc.status === 'Verified' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:border-[#3e4042]'
                                                }`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Uploaded">Uploaded</option>
                                            <option value="Verified">Verified</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'collaboration' && (
                        <div className="bg-white dark:bg-[#242526] rounded-xl border border-slate-200 dark:border-[#3e4042] overflow-hidden flex flex-col h-[500px]">
                            <div className="p-4 border-b border-slate-100 dark:border-[#3e4042] bg-slate-50 dark:bg-[#3a3b3c]">
                                <h3 className="font-semibold text-slate-900 dark:text-[#e4e6eb]">Application Workspace</h3>
                                <p className="text-xs text-slate-500 dark:text-[#b0b3b8]">Collaborate with mentors on this application.</p>
                            </div>

                            {/* Comments Area */}
                            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                                <CommentsSection uniId={uniId} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Intake Calendar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#242526] p-5 rounded-2xl border border-slate-200 dark:border-[#3e4042] shadow-sm">
                        <h2 className="font-bold text-slate-900 dark:text-[#e4e6eb] mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-indigo-600 dark:text-indigo-400" />
                            Intake Calendar
                        </h2>
                        <div className="space-y-4">
                            {uniData.admissions?.applicationDeadlines?.length > 0 ? (
                                uniData.admissions.applicationDeadlines.map((intake, idx) => {
                                    // Simulated Opening Date Logic
                                    const deadlineDate = new Date(intake.deadline);
                                    const startDate = new Date(deadlineDate);
                                    startDate.setMonth(deadlineDate.getMonth() - 7); // Usually opens 7 months before

                                    // Status Logic
                                    const today = new Date();
                                    const isOpen = today >= startDate && today <= deadlineDate;
                                    const isPast = today > deadlineDate;

                                    return (
                                        <div key={idx} className={`p-4 rounded-xl border ${isOpen ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' : isPast ? 'bg-slate-50 dark:bg-[#3a3b3c] border-slate-200 dark:border-[#3e4042] opacity-70' : 'bg-white dark:bg-[#242526] border-dashed border-slate-300 dark:border-[#3e4042]'}`}>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-bold text-slate-900 dark:text-[#e4e6eb]">{intake.term} {intake.year || deadlineDate.getFullYear()}</span>
                                                {isOpen ? <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">OPEN NOW</span> :
                                                    isPast ? <span className="text-[10px] font-bold bg-slate-200 dark:bg-[#4e4f50] text-slate-600 dark:text-[#b0b3b8] px-2 py-1 rounded-full">CLOSED</span> :
                                                        <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">SOON</span>}
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justifies-between items-center text-slate-600 dark:text-[#b0b3b8]">
                                                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Applications Open:</span>
                                                    <span className="font-medium ml-auto">{startDate.toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justifies-between items-center text-slate-600 dark:text-[#b0b3b8]">
                                                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Deadline:</span>
                                                    <span className="font-medium ml-auto">{deadlineDate.toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6 text-slate-500 dark:text-[#b0b3b8] italic text-sm">No intake dates available.</div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats or Contact */}
                    <div className="bg-white dark:bg-[#242526] p-5 rounded-2xl border border-slate-200 dark:border-[#3e4042] shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-[#e4e6eb] mb-3">Admissions Contact</h3>
                        <div className="space-y-3 text-sm text-slate-600 dark:text-[#b0b3b8]">
                            {uniData.contact?.email && <div className="flex items-center gap-3"><span className="bg-slate-100 dark:bg-[#3a3b3c] p-1.5 rounded">✉️</span> {uniData.contact.email}</div>}
                            {uniData.contact?.phone && <div className="flex items-center gap-3"><span className="bg-slate-100 dark:bg-[#3a3b3c] p-1.5 rounded">📞</span> {uniData.contact.phone}</div>}
                            {uniData.contact?.website && (
                                <a href={uniData.contact.website} target="_blank" className="block text-center mt-4 btn-secondary dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50] text-xs">
                                    Official Website ↗
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const CommentsSection = ({ uniId }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const res = await collaborationAPI.getUniversityMessages(uniId);
            setMessages(res.data);
        } catch (e) {
            console.error('Failed to fetch messages');
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [uniId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            await collaborationAPI.sendUniversityMessage(uniId, { content: newMessage });
            setNewMessage('');
            fetchMessages();
        } catch (e) {
            console.error('Post message error:', e);
            addToast('Failed to send message', 'error');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#242526] rounded-xl">
            <div className="flex-grow p-4 overflow-y-auto space-y-4 mb-4 bg-slate-50/50 dark:bg-[#18191a]/50 rounded-xl">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-400 dark:text-[#b0b3b8] py-10 text-sm">No messages yet. Start the group discussion!</div>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.sender?._id === user?._id;
                        const senderName = msg.sender?.profile?.firstName || msg.sender?.email?.split('@')[0] || 'User';

                        return (
                            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isMe ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'bg-slate-200 dark:bg-[#3a3b3c] text-slate-600 dark:text-[#e4e6eb]'}`}>
                                        {senderName[0]}
                                    </div>
                                    <div className={`rounded-2xl p-3 shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-[#3a3b3c] dark:text-[#e4e6eb] text-slate-800 rounded-bl-none border border-slate-100 dark:border-[#4e4f50]'}`}>
                                        {!isMe && <p className="text-[10px] font-bold text-slate-400 dark:text-[#b0b3b8] mb-1">{senderName}</p>}
                                        <p className="text-sm font-medium">{msg.content}</p>

                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {msg.attachments.map((file, fIdx) => (
                                                    <a
                                                        key={fIdx}
                                                        href={`${BASE_URL}${file.url?.startsWith('/') ? '' : '/'}${file.url || ''}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex items-center gap-2 p-2 rounded-xl text-xs border transition-colors ${isMe ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-slate-50 dark:bg-[#242526] border-slate-200 dark:border-[#3e4042] hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-indigo-600 dark:text-indigo-400'}`}
                                                    >
                                                        <FileText size={14} />
                                                        <span className="truncate max-w-[150px] font-bold">{file.name}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                        <div className={`text-[9px] mt-1 text-right w-full opacity-60 font-medium ${isMe ? 'text-indigo-100' : 'text-slate-400 dark:text-[#b0b3b8]'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handlePost} className="pt-2 border-t border-slate-100 dark:border-[#3e4042] flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Message the group..."
                    className="flex-grow border border-slate-300 dark:border-[#4e4f50] dark:bg-[#3a3b3c] dark:text-[#e4e6eb] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400 dark:placeholder-[#b0b3b8]"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md shadow-blue-500/20">Send</button>
            </form>

            <label className="text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer flex items-center gap-1 hover:underline font-bold mt-2">
                <Plus size={14} /> Share Document (PDF/Doc)
                <input type="file" className="hidden" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                            addToast('Uploading...', 'info');
                            const res = await api.post('/upload', formData);

                            await collaborationAPI.sendUniversityMessage(uniId, {
                                content: `[Shared Document] ${file.name}`,
                                attachments: [{
                                    name: file.name,
                                    url: res.data.filePath
                                }]
                            });
                            fetchMessages();
                            addToast('File shared!', 'success');
                        } catch (err) {
                            console.error('Upload failed', err);
                            addToast('Upload failed', 'error');
                        }
                    }
                }} />
            </label>
        </div>
    );
};

export default ApplicationManager;
