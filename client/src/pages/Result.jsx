import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import StyleChip from '../components/ui/StyleChip';
import ColorSwatch from '../components/moodboard/ColorSwatch';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const STYLE_TO_FOLDER = {
    'minimalist': 'Minimalist',
    'bohemian': 'Bohemian',
    'scandinavian': 'Scandinavian',
    'industrial': 'Industrial',
    'modern-luxury': 'ModernLuxury',
    'traditional': 'Traditional',
    'maximalist': 'Maximalist'
};

const VIBE_FOLDERS = [
    'Minimalist', 'Bohemian', 'Scandinavian', 
    'Industrial', 'ModernLuxury', 'Traditional', 'Maximalist'
];

const BOARD_CATEGORIES = [
    { folder: 'Bedroom 20', max: 20 },
    { folder: 'Object 20', max: 20 },
    { folder: 'Texture 15', max: 15 },
    { folder: 'Color 8', max: 8 },
    { folder: 'Rug 6', max: 6 },
    { folder: 'Overall Room 6', max: 6 }
];

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/Likk18/VibeSpace@main/client/assets';

const getWeightedImages = (rawScores, count = 9) => {
    const images = [];
    
    if (!rawScores || Object.keys(rawScores).length === 0) {
        const defaultFolder = 'Minimalist';
        const shuffledCats = [...BOARD_CATEGORIES].sort(() => Math.random() - 0.5);
        for (const cat of shuffledCats) {
            if (images.length >= count) break;
            const imgNum = Math.floor(Math.random() * cat.max) + 1;
            images.push(`${CDN_BASE}/${defaultFolder}/${encodeURIComponent(cat.folder)}/${imgNum}.jpg`);
        }
        return images;
    }

    const weights = {};
    let totalScore = 0;
    for (const [style, score] of Object.entries(rawScores)) {
        const folder = STYLE_TO_FOLDER[style];
        if (folder) {
            weights[folder] = (weights[folder] || 0) + score;
            totalScore += score;
        }
    }

    for (const folder of VIBE_FOLDERS) {
        if (weights[folder] === undefined) {
            weights[folder] = 0;
        }
    }

    const normalizedWeights = {};
    for (const [folder, score] of Object.entries(weights)) {
        normalizedWeights[folder] = totalScore > 0 ? score / totalScore : 0;
    }

    const selectWeightedFolder = () => {
        const rand = Math.random();
        let cumulative = 0;
        for (const [folder, weight] of Object.entries(normalizedWeights)) {
            cumulative += weight;
            if (rand <= cumulative) return folder;
        }
        return VIBE_FOLDERS[0];
    };

    const usedCombos = new Set();

    while (images.length < count) {
        const folder = selectWeightedFolder();
        const shuffledCats = [...BOARD_CATEGORIES].sort(() => Math.random() - 0.5);
        
        for (const cat of shuffledCats) {
            if (images.length >= count) break;
            const imgNum = Math.floor(Math.random() * cat.max) + 1;
            const comboKey = `${folder}-${cat.folder}-${imgNum}`;
            
            if (!usedCombos.has(comboKey)) {
                usedCombos.add(comboKey);
                images.push(`${CDN_BASE}/${folder}/${encodeURIComponent(cat.folder)}/${imgNum}.jpg`);
            }
        }
    }

    return images.slice(0, count);
};

const Result = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { profile, groupProfile, groupStatus, loading, isGroupComplete, getGroupMemberCount, getCompletedMemberCount } = useProfile();
    const [revealed, setRevealed] = useState(false);
    const [boardImages, setBoardImages] = useState([]);
    const resultRef = useRef(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [sharing, setSharing] = useState(false);

    const isGroupMode = user?.mode === 'group';
    const groupComplete = isGroupComplete();
    const totalMembers = getGroupMemberCount();
    const completedMembers = getCompletedMemberCount();

    useEffect(() => {
        const timer = setTimeout(() => setRevealed(true), 300);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (profile?.raw_scores || profile?.primary_style) {
            const newBoard = profile.raw_scores 
                ? getWeightedImages(profile.raw_scores, 9)
                : getWeightedImages({ [profile.primary_style]: 1 }, 9);
            setBoardImages(newBoard);
        }
    }, [profile]);

    const handleDownloadPDF = async () => {
        if (!resultRef.current || generatingPdf) return;
        setGeneratingPdf(true);
        
        try {
            const canvas = await html2canvas(resultRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#F5F0EB',
                logging: false
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            
            pdf.save(`VibeSpace-${profile?.style_label || 'Style'}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handleDownloadGroupPDF = async () => {
        if (generatingPdf) return;
        setGeneratingPdf(true);
        
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
            alert('Failed to generate group PDF. Please try again.');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handleShareImage = async () => {
        if (!resultRef.current || sharing) return;
        setSharing(true);

        try {
            const canvas = await html2canvas(resultRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#F5F0EB',
                logging: false
            });

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], `VibeSpace-${profile?.style_label || 'Style'}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `My Vibe: ${profile?.style_label}`,
                    text: `I just discovered my interior design aesthetic: ${profile?.style_label}! Find yours at VibeSpace.`,
                    files: [file]
                });
            } else {
                const link = document.createElement('a');
                link.download = `VibeSpace-${profile?.style_label || 'Style'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
                const canvas = await html2canvas(resultRef.current, { scale: 2, useCORS: true });
                const link = document.createElement('a');
                link.download = `VibeSpace-${profile?.style_label || 'Style'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        } finally {
            setSharing(false);
        }
    };

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    const shareText = `I just discovered my interior design aesthetic: ${profile.style_label}! Find yours at VibeSpace.`;

    const handleShare = (platform) => {
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`
        };
        window.open(urls[platform], '_blank');
    };

    const formatStyle = (styleStr) => {
        if (!styleStr) return '';
        return styleStr.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className={`transition-all duration-1000 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div ref={resultRef} className="bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 rounded-2xl">
                        <div className="text-center mb-8">
                            <p className="text-lg text-gray-400 mb-2">Your Aesthetic:</p>
                            <h1 className="text-5xl md:text-6xl font-display font-bold text-primary mb-4">
                                {profile.style_label}
                            </h1>
                            {profile.secondary_style && (
                                <p className="text-xl text-gray-400">
                                    with {formatStyle(profile.secondary_style)} influence
                                </p>
                            )}
                        </div>

                        {boardImages.length > 0 && (
                            <div className="bg-surface/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
                                <h2 className="text-2xl font-display font-semibold mb-6">Your Aesthetic Board</h2>
                                <div className="grid grid-cols-3 gap-2 md:gap-3 rounded-xl overflow-hidden">
                                    {boardImages.map((src, index) => (
                                        <div
                                            key={index}
                                            className={`
                                                relative overflow-hidden rounded-lg
                                                ${index === 0 ? 'col-span-2 row-span-2' : ''}
                                                ${index === 4 ? 'col-span-2' : ''}
                                            `}
                                        >
                                            <img
                                                src={src}
                                                alt={`${profile.primary_style} inspiration ${index + 1}`}
                                                className="w-full h-full object-cover aspect-square hover:scale-110 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
                            <h2 className="text-2xl font-display font-semibold mb-6">Your Palette</h2>
                            <div className="flex justify-center space-x-6">
                                {profile.color_palette?.map((hex, index) => (
                                    <ColorSwatch key={index} hex={hex} />
                                ))}
                            </div>
                        </div>

                        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
                            <h2 className="text-2xl font-display font-semibold mb-4">Your Style</h2>
                            <div className="flex justify-center flex-wrap gap-3">
                                <StyleChip style={profile.primary_style} size="lg" />
                                {profile.secondary_style && (
                                    <StyleChip style={profile.secondary_style} size="lg" />
                                )}
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-500">Created with VibeSpace</p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={handleShareImage}
                                disabled={sharing}
                                className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
                            >
                                {sharing ? (
                                    <span className="flex items-center">
                                        <div className="spinner mr-2" style={{ width: '20px', height: '20px' }} />
                                        Processing...
                                    </span>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Share My Style
                                    </>
                                )}
                            </button>
                            
                            <button
                                onClick={handleDownloadPDF}
                                disabled={generatingPdf}
                                className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2"
                            >
                                {generatingPdf ? (
                                    <span className="flex items-center">
                                        <div className="spinner mr-2" style={{ width: '20px', height: '20px' }} />
                                        Generating...
                                    </span>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download PDF
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => handleShare('twitter')}
                                className="px-6 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors"
                            >
                                Twitter
                            </button>
                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="px-6 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors"
                            >
                                WhatsApp
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col space-y-4">
                        {isGroupMode && !groupComplete && (
                            <>
                                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
                                    <p className="text-primary font-medium mb-2">
                                        🎉 You've completed your quiz! 
                                        {completedMembers} of {totalMembers} members done
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        Invite your {user?.group_id ? 'partner' : 'family member'} to take their quiz
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/invite-members')}
                                    className="bg-gradient-to-r from-primary to-accent text-white text-lg px-12 py-4 rounded-full hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                                >
                                    <span>👥 Invite Next Person</span>
                                </button>
                            </>
                        )}

                        {isGroupMode && groupComplete && (
                            <button
                                onClick={() => navigate('/moodboard', { state: { mode: 'group' } })}
                                className="bg-gradient-to-r from-primary to-accent text-white text-lg px-12 py-4 rounded-full hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                            >
                                <span>✨ Generate Group Mood Board</span>
                            </button>
                        )}

                        {isGroupMode && groupComplete && (
                            <button
                                onClick={handleDownloadGroupPDF}
                                disabled={generatingPdf}
                                className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-lg px-12 py-4 rounded-full hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                {generatingPdf ? (
                                    <span className="flex items-center">
                                        <div className="spinner mr-2" style={{ width: '20px', height: '20px' }} />
                                        Generating...
                                    </span>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download Group Report
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            onClick={() => navigate('/aesthetic-report')}
                            className="bg-black text-white text-lg px-12 py-4 rounded-full border border-white/20 hover:bg-black/80 transition-all flex items-center justify-center space-x-2"
                        >
                            <span>View Full Aesthetic Report</span>
                        </button>
                        <button
                            onClick={() => navigate('/moodboard')}
                            className="btn-primary text-lg px-12 py-4"
                        >
                            Generate My Mood Board
                        </button>
                        
                        {!isGroupMode && (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="btn-secondary text-lg px-12 py-4"
                            >
                                Browse Catalogue
                            </button>
                        )}
                        
                        {isGroupMode && groupComplete && (
                            <button
                                onClick={() => navigate('/dashboard', { state: { feedMode: 'group' } })}
                                className="btn-secondary text-lg px-12 py-4"
                            >
                                Browse Group Catalogue
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;
