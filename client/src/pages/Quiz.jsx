import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import QuizCard from '../components/quiz/QuizCard';
import ProgressBar from '../components/quiz/ProgressBar';

const Quiz = () => {
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [questionsLoading, setQuestionsLoading] = useState(true);

    // Load questions on mount
    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const res = await quizAPI.getQuestions();
                const loadedQuestions = res.data.data.questions || [];
                setQuestions(loadedQuestions);
                setResponses(new Array(loadedQuestions.length).fill(null));
            } catch (error) {
                console.error('Failed to load questions:', error);
            } finally {
                setQuestionsLoading(false);
            }
        };
        loadQuestions();
    }, []);

    const handleSelect = (option) => {
        const optionIndex = questions[currentIndex].image_options.findIndex(
            opt => opt.image_url === option.image_url
        );
        setSelectedOption(optionIndex);

        // Save response in state
        const newResponses = [...responses];
        newResponses[currentIndex] = {
            questionId: questions[currentIndex]._id,
            selectedStyle: option.style_tag
        };
        setResponses(newResponses);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);

            // Load previous selection if exists
            const prevResponse = responses[nextIndex];
            if (prevResponse) {
                const prevOptionIndex = questions[nextIndex].image_options.findIndex(
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
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);

            // Load previous selection
            const prevResponse = responses[prevIndex];
            if (prevResponse) {
                const prevOptionIndex = questions[prevIndex].image_options.findIndex(
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

    if (questionsLoading && questions.length === 0) {
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
