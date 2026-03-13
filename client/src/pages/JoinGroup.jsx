import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groupAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const JoinGroup = () => {
    const { inviteCode } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, updateUser } = useAuth();
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        validateInviteCode();
    }, [inviteCode]);

    const validateInviteCode = async () => {
        try {
            const response = await groupAPI.joinByCode(inviteCode);
            setGroupData(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired invite code');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!isAuthenticated) {
            navigate('/register', { 
                state: { 
                    redirectTo: '/quiz',
                    groupId: groupData.group_id,
                    joinGroup: true
                } 
            });
            return;
        }

        setJoining(true);
        try {
            await groupAPI.join(groupData.group_id);
            updateUser({ mode: 'group', group_id: groupData.group_id });
            navigate('/quiz');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join group');
        } finally {
            setJoining(false);
        }
    };

    const handleContinueAsGuest = () => {
        navigate('/quiz', { state: { isGuest: true, groupId: groupData.group_id } });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold mb-2">Oops!</h1>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-md mx-auto px-4 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-3xl font-display font-bold mb-2">
                    You've Been Invited!
                </h1>
                <p className="text-gray-400 mb-8">
                    Someone wants to shop furniture together with you
                </p>

                <div className="bg-surface rounded-xl p-6 mb-6">
                    <div className="flex justify-center gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">
                                {groupData?.current_members}
                            </div>
                            <div className="text-sm text-gray-400">Current</div>
                        </div>
                        <div className="text-3xl text-gray-600">/</div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">
                                {groupData?.member_count}
                            </div>
                            <div className="text-sm text-gray-400">Total</div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-400">
                        {groupData?.member_count - groupData?.current_members > 0 
                            ? `${groupData?.member_count - groupData?.current_members} more spots available`
                            : 'Group is full'
                        }
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleJoin}
                        disabled={joining || groupData?.member_count - groupData?.current_members <= 0}
                        className="w-full btn-primary py-4"
                    >
                        {joining ? (
                            <span className="flex items-center justify-center">
                                <div className="spinner mr-2" />
                                Joining...
                            </span>
                        ) : isAuthenticated ? (
                            'Join Group'
                        ) : (
                            'Login to Join'
                        )}
                    </button>

                    {!isAuthenticated && (
                        <button
                            onClick={handleContinueAsGuest}
                            className="w-full btn-secondary py-3"
                        >
                            Take Quiz as Guest
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/')}
                        className="w-full text-gray-400 hover:text-white py-2"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinGroup;
