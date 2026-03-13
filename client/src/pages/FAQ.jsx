import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            q: "Where is my order?",
            a: "You can track your order in real-time by visiting the 'Your Orders' section in your account. Once an order is shipped, we provide a tracking link from our premium delivery partners."
        },
        {
            q: "What are the shipping times?",
            a: "VibeSpace offers standard shipping (3-5 business days) and Express Vibe shipping (1-3 business days) for selected aesthetics. Shipping times vary based on your location and store availability."
        },
        {
            q: "How do I process a return?",
            a: "Returns are easy at VibeSpace. Go to 'Your Orders', select the item you wish to return, and click 'Return or replace items'. You have 30 days from delivery to initiate a return."
        },
        {
            q: "Help, I'm missing some parts!",
            a: "If your curated furniture or decor arrives incomplete, please contact our Vibe Support team immediately via the 'Ask Product Question' button in your order details."
        },
        {
            q: "Other Questions?",
            a: "For all other inquiries, including style consultations or VibePay issues, please reach out to hello@vibespace.tech or browse our community forums."
        }
    ];

    return (
        <div className="min-h-screen bg-background py-16 text-white">
            <div className="max-w-3xl mx-auto px-4">
                <nav className="text-sm mb-8 flex gap-2 text-gray-400">
                    <span className="cursor-pointer hover:underline" onClick={() => navigate('/settings')}>Your Account</span>
                    <span>›</span>
                    <span className="text-primary font-bold">Frequently Asked Questions</span>
                </nav>

                <h1 className="text-4xl font-display font-bold mb-12 text-center tracking-widest uppercase">
                    Frequently Asked Questions
                </h1>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border-b border-white/10 transition-all ${openIndex === index ? 'bg-white/5' : ''}`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full py-6 flex justify-between items-center text-left focus:outline-none"
                            >
                                <span className={`text-xl font-medium transition-colors ${openIndex === index ? 'text-primary' : 'text-gray-200'}`}>
                                    {faq.q}
                                </span>
                                <svg
                                    className={`w-6 h-6 transform transition-transform ${openIndex === index ? 'rotate-180 text-primary' : 'text-gray-500'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openIndex === index && (
                                <div className="pb-8 text-gray-400 leading-relaxed text-lg px-2">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-surface/30 p-8 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold mb-1 text-primary">Still have questions?</h3>
                        <p className="text-gray-400">Our support team is available 24/7 to help you curate your space.</p>
                    </div>
                    <button className="btn-primary px-8 py-3 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(132,0,255,0.3)]">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
