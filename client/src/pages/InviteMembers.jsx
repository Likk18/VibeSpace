import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { groupAPI, profileAPI } from '../services/api';
import { jsPDF } from 'jspdf';

const InviteMembers = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, updateUser } = useAuth();
    const { groupStatus, fetchGroupStatus, isGroupComplete, getGroupMemberCount, getCompletedMemberCount } = useProfile();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.group_id) {
            fetchGroupStatus();
        }
        setLoading(false);
    }, [user?.group_id]);

    const groupComplete = isGroupComplete();
    const totalMembers = getGroupMemberCount();
    const completedMembers = getCompletedMemberCount();
    const remainingSlots = totalMembers - completedMembers;

    const handleTakeQuiz = () => {
        if (!isAuthenticated) {
            navigate('/register', { 
                state: { 
                    redirectTo: '/quiz',
                    groupId: user.group_id,
                    joinGroup: true
                } 
            });
        } else {
            navigate('/quiz');
        }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/join/${groupStatus?.group?.invite_code}`;
        navigator.clipboard.writeText(link);
        alert('Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (!user?.group_id) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-400 mb-4">You're not in a group</p>
                    <button onClick={() => navigate('/mode-select')} className="btn-primary">
                        Create a Group
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">
                        {groupComplete ? '🎉' : '👥'}
                    </div>
                    <h1 className="text-4xl font-display font-bold mb-2">
                        {groupComplete ? 'All Done!' : 'Invite Your Team'}
                    </h1>
                    <p className="text-gray-400">
                        {groupComplete 
                            ? 'Everyone has completed their quiz!'
                            : `${remainingSlots} more ${remainingSlots === 1 ? 'person' : 'people'} to go`
                        }
                    </p>
                </div>

                {!groupComplete && (
                    <div className="bg-surface rounded-2xl shadow-xl p-6 mb-6">
                        <h3 className="font-semibold mb-4">Share Invite Link</h3>
                        
                        <div className="bg-background rounded-lg p-4 text-center mb-4">
                            <span className="text-3xl font-mono font-bold tracking-wider text-primary">
                                {groupStatus?.group?.invite_code}
                            </span>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleCopyLink}
                                className="flex-1 btn-secondary"
                            >
                                Copy Link
                            </button>
                            <button
                                onClick={() => {
                                    const link = `${window.location.origin}/join/${groupStatus?.group?.invite_code}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent('Join my VibeSpace group! ' + link)}`, '_blank');
                                }}
                                className="flex-1 bg-[#25D366] text-white py-3 rounded-lg hover:bg-[#20bd5a] transition-colors"
                            >
                                WhatsApp
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-surface rounded-2xl shadow-xl p-6 mb-6">
                    <h3 className="font-semibold mb-4">Members ({completedMembers}/{totalMembers})</h3>
                    <div className="space-y-3">
                        {groupStatus?.members?.map((member, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                        {member.name ? member.name.charAt(0).toUpperCase() : `M${index + 1}`}
                                    </div>
                                    <span>{member.name || `Member ${index + 1}`}</span>
                                </div>
                                {member.quiz_complete ? (
                                    <span className="text-green-500 text-sm flex items-center gap-1">
                                        ✓ Done
                                    </span>
                                ) : (
                                    <span className="text-yellow-500 text-sm">Pending</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {!groupComplete && (
                        <button
                            onClick={handleTakeQuiz}
                            className="w-full btn-primary py-4 text-lg"
                        >
                            {isAuthenticated ? "Take My Quiz" : "Login & Take Quiz"}
                        </button>
                    )}

                    {groupComplete && (
                        <button
                            onClick={() => navigate('/moodboard', { state: { mode: 'group' } })}
                            className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 text-lg rounded-full hover:shadow-lg transition-all"
                        >
                            ✨ Generate Group Mood Board
                        </button>
                    )}

                    {groupComplete && (
                        <button
                            onClick={async () => {
                                try {
                                    const response = await profileAPI.getGroupReport();
                                    const groupData = response.data.data;
                                    
                                    const pdf = new jsPDF('p', 'mm', 'a4');
                                    const pageWidth = pdf.internal.pageSize.getWidth();
                                    
                                    pdf.setFontSize(24);
                                    pdf.setTextColor(91, 77, 207);
                                    pdf.text('Group Style Report', pageWidth / 2, 20, { align: 'center' });
                                    
                                    pdf.setFontSize(16);
                                    pdf.setTextColor(0, 0, 0);
                                    pdf.text(`Group Style: ${groupData.group.style_label}`, pageWidth / 2, 35, { align: 'center' });
                                    
                                    pdf.setFontSize(12);
                                    pdf.setTextColor(100, 100, 100);
                                    pdf.text(`Primary: ${groupData.group.primary_style} | Secondary: ${groupData.group.secondary_style || 'None'}`, pageWidth / 2, 45, { align: 'center' });
                                    
                                    pdf.setFontSize(14);
                                    pdf.setTextColor(0, 0, 0);
                                    pdf.text('Group Color Palette:', 15, 60);
                                    
                                    const colors = groupData.group.color_palette || [];
                                    colors.forEach((hex, idx) => {
                                        pdf.setFillColor(hex);
                                        pdf.rect(15 + (idx * 35), 65, 25, 15, 'F');
                                        pdf.setFontSize(8);
                                        pdf.setTextColor(100, 100, 100);
                                        pdf.text(hex, 15 + (idx * 35) + 12.5, 85, { align: 'center' });
                                    });
                                    
                                    pdf.setFontSize(14);
                                    pdf.setTextColor(0, 0, 0);
                                    pdf.text('Individual Member Profiles:', 15, 100);
                                    
                                    let yPos = 110;
                                    groupData.members.forEach((member, idx) => {
                                        if (yPos > 250) {
                                            pdf.addPage();
                                            yPos = 20;
                                        }
                                        
                                        pdf.setFontSize(12);
                                        pdf.setTextColor(91, 77, 207);
                                        pdf.text(`${member.name || `Member ${idx + 1}`}: ${member.style_label}`, 15, yPos);
                                        
                                        pdf.setFontSize(10);
                                        pdf.setTextColor(60, 60, 60);
                                        pdf.text(`Primary: ${member.primary_style} | Colors: ${member.color_palette?.join(', ')}`, 20, yPos + 7);
                                        
                                        yPos += 20;
                                    });
                                    
                                    pdf.setFontSize(10);
                                    pdf.setTextColor(150, 150, 150);
                                    pdf.text('Created with VibeSpace', pageWidth / 2, 285, { align: 'center' });
                                    
                                    pdf.save(`VibeSpace-Group-${groupData.group.style_label}.pdf`);
                                } catch (error) {
                                    console.error('Group PDF generation failed:', error);
                                    alert('Failed to generate group PDF.');
                                }
                            }}
                            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 text-lg rounded-full hover:shadow-lg transition-all"
                        >
                            📄 Download Group Report
                        </button>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/aesthetic-report')}
                            className="flex-1 btn-secondary py-3"
                        >
                            My Report
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 btn-primary py-3"
                        >
                            Browse Catalogue
                        </button>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full text-gray-400 hover:text-white py-2"
                    >
                        ← Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteMembers;
