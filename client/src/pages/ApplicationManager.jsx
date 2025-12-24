import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shortlistAPI, commentsAPI } from '../services/api';
import { CheckCircle, Circle, Clock, FileText, Calendar, AlertCircle } from 'lucide-react';

const ApplicationManager = () => {
    const { uniId } = useParams();
    const { user, updateUser } = useAuth();
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
                color: 'bg-slate-100 text-slate-600 border-slate-200',
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
                color: daysLeft < 30 ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-green-100 text-green-700 border-green-200',
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
                color: 'bg-red-100 text-red-700 border-red-200',
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
                const token = await user.getIdToken();
                await axios.post('http://localhost:5000/api/collaboration/collaborate', {
                    universityId: uniId,
                    email,
                    message: "Please review my application."
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Invitation sent successfully!');
            } catch (error) {
                alert('Failed to send invitation.');
            }
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Link to="/dashboard" className="text-slate-500 hover:text-slate-900 mb-4 inline-block">&larr; Back to Dashboard</Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{applicationData.university.name}</h1>
                        <p className="text-slate-600">Application Manager</p>
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

            <header className="flex items-center gap-6 mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {uniData.images?.[0] ? (
                    <img src={uniData.images[0]} alt={uniData.name} className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                    <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-3xl">🏛️</div>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{uniData.name}</h1>
                    <p className="text-slate-500">Application Manager</p>
                    <div className="mt-2 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full inline-block font-medium">
                        Status: <span className="uppercase">{applicationData.applicationStatus || 'Not Started'}</span>
                    </div>
                    <button
                        onClick={handleCollaborate}
                        className="ml-4 text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full inline-block font-medium hover:bg-indigo-100"
                    >
                        🤝 Collaborate
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Tabs & Main Content */}
                <div className="lg:col-span-2">
                    <div className="flex gap-4 border-b border-slate-200 mb-6">
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'timeline' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Application Timeline
                        </button>
                        <button
                            onClick={() => setActiveTab('checklist')}
                            className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'checklist' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Document Checklist
                        </button>
                        <button
                            onClick={() => setActiveTab('collaboration')}
                            className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'collaboration' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Collaborate
                        </button>
                    </div>

                    {activeTab === 'timeline' && (
                        <div className="space-y-6">
                            {finalTimeline.map((step, idx) => (
                                <div key={idx} className={`flex gap-4 p-4 rounded-xl border ${step.status === 'Completed' ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                                    <div className="mt-1">
                                        {step.status === 'Completed' ? <CheckCircle className="text-green-600" /> : <Circle className="text-slate-300" />}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`font-semibold text-lg ${step.status === 'Completed' ? 'text-green-800' : 'text-slate-900'}`}>{step.stepName}</h3>
                                            {step.deadlineDate && (
                                                <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-1 rounded flex items-center gap-1">
                                                    <Clock size={12} /> Due: {new Date(step.deadlineDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-600 text-sm mt-1">{step.description || 'Complete this step to move forward.'}</p>

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
                                                    className="px-3 py-1.5 bg-slate-200 text-slate-600 text-sm rounded hover:bg-slate-300 transition"
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
                                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-slate-400" />
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{doc.documentName}</h3>
                                            <p className="text-xs text-slate-500">{doc.description || 'Required document'}</p>
                                            {doc.actionLink && (
                                                <Link to={doc.actionLink} target="_blank" className="text-xs text-blue-600 hover:underline mt-1 inline-block font-medium">
                                                    👉 Study Resources
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={doc.status || 'Pending'}
                                            onChange={(e) => handleChecklistUpdate(doc.documentName, e.target.value)}
                                            className={`text-sm font-medium px-3 py-1.5 rounded border border-slate-300 ${doc.status === 'Uploaded' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                doc.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50'
                                                }`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Uploaded">Uploaded</option>
                                            <option value="Verified">Verified</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex items-start gap-3">
                                <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Upload feature is currently in simulation mode. Mark items as "Uploaded" to track your progress manually.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'collaboration' && (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[500px]">
                            <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-semibold text-slate-900">Application Workspace</h3>
                                <p className="text-xs text-slate-500">Collaborate with mentors on this application.</p>
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
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-indigo-600" />
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
                                        <div key={idx} className={`p-4 rounded-xl border ${isOpen ? 'bg-indigo-50 border-indigo-200' : isPast ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-dashed border-slate-300'}`}>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-bold text-slate-900">{intake.term} {intake.year || deadlineDate.getFullYear()}</span>
                                                {isOpen ? <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">OPEN NOW</span> :
                                                    isPast ? <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">CLOSED</span> :
                                                        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">SOON</span>}
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justifies-between items-center text-slate-600">
                                                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Applications Open:</span>
                                                    <span className="font-medium ml-auto">{startDate.toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justifies-between items-center text-slate-600">
                                                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Deadline:</span>
                                                    <span className="font-medium ml-auto">{deadlineDate.toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6 text-slate-500 italic text-sm">No intake dates available.</div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats or Contact */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-3">Admissions Contact</h3>
                        <div className="space-y-3 text-sm text-slate-600">
                            {uniData.contact?.email && <div className="flex items-center gap-3"><span className="bg-slate-100 p-1.5 rounded">✉️</span> {uniData.contact.email}</div>}
                            {uniData.contact?.phone && <div className="flex items-center gap-3"><span className="bg-slate-100 p-1.5 rounded">📞</span> {uniData.contact.phone}</div>}
                            {uniData.contact?.website && (
                                <a href={uniData.contact.website} target="_blank" className="block text-center mt-4 btn-secondary text-xs">
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
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const fetchComments = async () => {
        try {
            const res = await commentsAPI.get(uniId);
            setComments(res.data);
        } catch (e) {
            console.error('Failed to fetch comments');
        }
    };

    useEffect(() => {
        fetchComments();
        // Poll for updates (simple real-time sim)
        const interval = setInterval(fetchComments, 5000);
        return () => clearInterval(interval);
    }, [uniId]);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await commentsAPI.create({ universityId: uniId, content: newComment });
            setNewComment('');
            fetchComments();
        } catch (e) {
            alert('Failed to post comment');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow space-y-4 mb-4">
                {comments.length === 0 ? (
                    <div className="text-center text-slate-400 py-10 text-sm">No comments yet. Start a discussion!</div>
                ) : (
                    comments.map(c => (
                        <div key={c._id} className={`flex flex-col ${c.studentId === user._id ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${c.studentId === user._id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                <p className="text-sm">{c.content}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1">
                                {c.author?.name} • {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
            </div>
            <form onSubmit={handlePost} className="pt-2 border-t border-slate-100 flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Send</button>
            </form>
            <div className="px-4 pb-2">
                <label className="text-xs text-blue-600 cursor-pointer flex items-center gap-1 hover:underline">
                    📎 Attach File (PDF/Doc)
                    <input type="file" className="hidden" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                                // Upload file first
                                const res = await axios.post('http://localhost:5000/api/upload', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                // Post comment with attachment path
                                await commentsAPI.create({
                                    universityId: uniId,
                                    content: `[File Sent] ${file.name}`,
                                    attachments: [res.data.filePath]
                                });
                                fetchComments(); // Refresh UI
                                alert('File uploaded successfully!');
                            } catch (err) {
                                alert('Upload failed: ' + (err.response?.data?.message || err.message));
                            }
                        }
                    }} />
                </label>
            </div>
        </div >
    );
};

export default ApplicationManager;
