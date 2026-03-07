import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import QuizCard from '../components/quiz/QuizCard';
import ProgressBar from '../components/quiz/ProgressBar';

const Quiz = () => {
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await quizAPI.getQuestions();
            setQuestions(response.data.data.questions);
            setResponses(new Array(response.data.data.questions.length).fill(null));
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            alert('Failed to load quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (option) => {
        const optionIndex = questions[currentIndex].image_options.findIndex(
            opt => opt.image_url === option.image_url
        );
        setSelectedOption(optionIndex);

        // Save response — only track style (vibe)
        const newResponses = [...responses];
        newResponses[currentIndex] = {
            questionId: questions[currentIndex]._id,
            selectedStyle: option.style_tag
        };
        setResponses(newResponses);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            // Load previous selection if exists
            const prevResponse = responses[currentIndex + 1];
            if (prevResponse) {
                const prevOptionIndex = questions[currentIndex + 1].image_options.findIndex(
                    opt => opt.style_tag === prevResponse.selectedStyle
                );
                setSelectedOption(prevOptionIndex);
            } else {
                setSelectedOption(null);
            }
        } else {
            // Last question - submit
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            // Load previous selection
            const prevResponse = responses[currentIndex - 1];
            if (prevResponse) {
                const prevOptionIndex = questions[currentIndex - 1].image_options.findIndex(
                    opt => opt.style_tag === prevResponse.selectedStyle
                );
                setSelectedOption(prevOptionIndex);
            } else {
                setSelectedOption(null);
            }
        }
    };

    const handleSkip = () => {
        const newResponses = [...responses];
        newResponses[currentIndex] = {
            questionId: questions[currentIndex]._id,
            selectedStyle: null
        };
        setResponses(newResponses);
        setSelectedOption(null);
        handleNext();
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await quizAPI.submitQuiz(responses.filter(r => r !== null));
            updateUser({ quiz_complete: true });
            navigate('/result');
        } catch (error) {
            console.error('Failed to submit quiz:', error);
            alert('Failed to submit quiz. Please try again.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-400">No questions available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Progress Bar */}
                <ProgressBar current={currentIndex + 1} total={questions.length} />

                {/* Quiz Card */}
                <QuizCard
                    question={questions[currentIndex]}
                    onSelect={handleSelect}
                    selectedOption={selectedOption}
                />

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    {/* Previous Button */}
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all
              ${currentIndex === 0
                                ? 'opacity-0 cursor-not-allowed'
                                : 'text-gray-300 hover:bg-surface'
                            }
            `}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Previous</span>
                    </button>

                    {/* Skip Button */}
                    <button
                        onClick={handleSkip}
                        className="text-sm text-muted hover:text-gray-300 transition-colors"
                    >
                        Skip this one
                    </button>

                    {/* Next/Submit Button */}
                    <button
                        onClick={handleNext}
                        disabled={selectedOption === null || submitting}
                        className={`
              btn-primary px-8 py-3
              ${(selectedOption === null || submitting) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                    >
                        {submitting ? (
                            <span className="flex items-center">
                                <div className="spinner mr-2" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                                Submitting...
                            </span>
                        ) : currentIndex === questions.length - 1 ? (
                            'Finish'
                        ) : (
                            'Next'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Quiz;
