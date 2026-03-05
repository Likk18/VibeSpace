import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Security.css';

const Security = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleEdit = (field) => {
        alert(`Request to edit ${field} received. This feature will be synchronized with the backend soon.`);
    };

    return (
        <div className="security-container">
            <div className="security-max-width">
                <nav className="text-sm mb-6 flex gap-2 text-gray-400">
                    <span className="cursor-pointer hover:underline" onClick={() => navigate('/settings')}>Your Account</span>
                    <span>›</span>
                    <span className="text-primary font-bold">Login and Security</span>
                </nav>

                <h1 className="text-3xl font-bold mb-8">Login and Security</h1>

                <div className="security-card">
                    {/* Name */}
                    <div className="security-row">
                        <div className="security-row-content">
                            <label>Name</label>
                            <span>{user?.name || 'VibeSpace Customer'}</span>
                        </div>
                        <button onClick={() => handleEdit('name')} className="security-edit-btn">Edit</button>
                    </div>

                    {/* Email */}
                    <div className="security-row">
                        <div className="security-row-content">
                            <label>Email</label>
                            <span>{user?.email}</span>
                        </div>
                        <button onClick={() => handleEdit('email')} className="security-edit-btn">Edit</button>
                    </div>

                    {/* Primary Mobile Number */}
                    <div className="security-row">
                        <div className="security-row-content">
                            <label>Primary mobile number</label>
                            <span>{user?.phone || '+918310438668'}</span>
                            <p>Quickly sign in, easily recover passwords and receive security notifications with this mobile number.</p>
                        </div>
                        <button onClick={() => handleEdit('mobile')} className="security-edit-btn">Edit</button>
                    </div>

                    {/* Passkey */}
                    <div className="security-row">
                        <div className="security-row-content">
                            <label>Passkey</label>
                            <p>Sign in the same way you unlock your device by using your face, fingerprint, or PIN.</p>
                        </div>
                        <button onClick={() => handleEdit('passkey')} className="security-edit-btn">Edit</button>
                    </div>

                    {/* Password */}
                    <div className="security-row">
                        <div className="security-row-content">
                            <label>Password</label>
                            <span>************</span>
                            <div className="security-alert">
                                <span className="security-alert-icon">⚠️</span>
                                <div className="security-alert-text">
                                    To better protect your account, remove your password and use a <b>passkey instead</b>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => handleEdit('password-remove')} className="amazon-btn-white py-1">Remove</button>
                            <button onClick={() => handleEdit('password-edit')} className="security-edit-btn">Edit</button>
                        </div>
                    </div>

                    {/* 2-Step Verification */}
                    <div className="security-row">
                        <div className="security-row-content">
                            <label>2-step verification</label>
                            <div className="security-alert">
                                <span className="security-alert-icon">⚠️</span>
                                <div className="security-alert-text">
                                    Add a layer of security. Require a code in addition to your password.
                                </div>
                            </div>
                        </div>
                        <button onClick={() => handleEdit('2fa')} className="security-edit-btn">Turn on</button>
                    </div>

                    {/* Compromised Account */}
                    <div className="security-row">
                        <div className="security-row-content">
                            <label>Compromised account?</label>
                            <p>Take steps like changing your password and signing out everywhere.</p>
                        </div>
                        <button onClick={() => handleEdit('compromised')} className="security-edit-btn">Start</button>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button onClick={() => navigate('/settings')} className="btn-primary px-10 py-2 rounded-full">Done</button>
                </div>
            </div>
        </div>
    );
};

export default Security;
