import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { groupAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Invite = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, updateUser } = useAuth();
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    const groupId = location.state?.groupId;
    const memberCount = location.state?.memberCount;

    useEffect(() => {
        if (!groupId) {
            navigate('/mode-select');
            return;
        }
        fetchGroupStatus();
    }, [groupId]);

    const fetchGroupStatus = async () => {
        try {
            const response = await groupAPI.getStatus(groupId);
            setGroupData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch group status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTakeQuiz = async () => {
        if (isAuthenticated) {
            if (groupData?.group?._id) {
                try {
                    await groupAPI.join(groupData.group._id);
                    updateUser({ mode: 'group', group_id: groupData.group._id });
                } catch (err) {
                    console.error('Failed to join group:', err);
                }
            }
            navigate('/quiz');
        } else {
            navigate('/register', { 
                state: { 
                    redirectTo: '/quiz',
                    groupId: groupId,
                    joinGroup: true
                } 
            });
        }
    };

    const handleContinueAsGuest = () => {
        navigate('/quiz', { state: { isGuest: true, groupId } });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    const currentMembers = groupData?.members?.length || 1;
    const remainingSlots = memberCount - currentMembers;

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-md mx-auto px-4">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">👥</div>
                    <h1 className="text-3xl font-display font-bold mb-2">
                        Invite Your {groupData?.group?.mode_label === 'partner' ? 'Partner' : 'Family'}
                    </h1>
                    <p className="text-gray-400">
                        {remainingSlots > 0 
                            ? `${remainingSlots} more ${remainingSlots === 1 ? 'person' : 'people'} to go`
                            : 'All members added!'
                        }
                    </p>
                </div>

                <div className="bg-surface rounded-xl p-6 mb-6">
                    <h3 className="font-semibold mb-4">Share this invite code:</h3>
                    
                    <div className="bg-background rounded-lg p-4 text-center mb-4">
                        <span className="text-3xl font-mono font-bold tracking-wider text-primary">
                            {groupData?.group?.invite_code}
                        </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center mb-4">
                        Or share this link: {window.location.origin}/join/{groupData?.group?.invite_code}
                    </p>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `${window.location.origin}/join/${groupData?.group?.invite_code}`
                            );
                            alert('Link copied!');
                        }}
                        className="w-full btn-secondary"
                    >
                        Copy Link
                    </button>
                </div>

                <div className="bg-surface rounded-xl p-6 mb-6">
                    <h3 className="font-semibold mb-4">Members so far:</h3>
                    <div className="space-y-2">
                        {groupData?.members?.map((member, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                                <span>{member.name || 'Member ' + (index + 1)}</span>
                                {member.quiz_complete ? (
                                    <span className="text-green-500 text-sm">✓ Completed</span>
                                ) : (
                                    <span className="text-yellow-500 text-sm">Pending...</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleTakeQuiz}
                        className="w-full btn-primary py-4"
                    >
                        {isAuthenticated ? 'Take Your Quiz' : 'Login & Take Quiz'}
                    </button>

                    {!isAuthenticated && (
                        <button
                            onClick={handleContinueAsGuest}
                            className="w-full btn-secondary py-3"
                        >
                            Continue as Guest
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/result')}
                        className="w-full text-gray-500 hover:text-primary transition-colors py-2"
                    >
                        Skip & View Results
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Invite;
