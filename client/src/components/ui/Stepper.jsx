import React, { useState, Children, cloneElement } from 'react';
import './Stepper.css';

export const Step = ({ children }) => {
    return <div className="stepper-step-content">{children}</div>;
};

const Stepper = ({
    children,
    initialStep = 1,
    onStepChange,
    onFinalStepCompleted,
    backButtonText = "Back",
    nextButtonText = "Next",
    finishButtonText = "Finish"
}) => {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const steps = Children.toArray(children);
    const totalSteps = steps.length;

    const handleNext = () => {
        if (currentStep < totalSteps) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            if (onStepChange) onStepChange(nextStep);
        } else {
            if (onFinalStepCompleted) onFinalStepCompleted();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);
            if (onStepChange) onStepChange(prevStep);
        }
    };

    return (
        <div className="stepper-container">
            <div className="stepper-progress-bar">
                {steps.map((_, index) => (
                    <div
                        key={index}
                        className={`stepper-dot ${index + 1 === currentStep ? 'active' : ''} ${index + 1 < currentStep ? 'completed' : ''}`}
                    />
                ))}
            </div>

            <div className="stepper-content">
                {steps[currentStep - 1]}
            </div>

            <div className="stepper-actions">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="stepper-btn-back"
                >
                    {backButtonText}
                </button>
                <button
                    onClick={handleNext}
                    className="stepper-btn-next"
                >
                    {currentStep === totalSteps ? finishButtonText : nextButtonText}
                </button>
            </div>
        </div>
    );
};

export default Stepper;
