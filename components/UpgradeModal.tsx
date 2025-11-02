
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { XIcon, SparklesIcon } from './icons';

const UpgradeModal: React.FC = () => {
    const { closeUpgradeModal, upgradeToPro } = useAuth();

    const handleUpgrade = () => {
        upgradeToPro();
        closeUpgradeModal();
    };

    const proFeatures = [
        "Unlimited AI Itinerary Plans",
        "Ad-Free Experience (Coming Soon)",
        "Priority Support",
        "Early Access to New Features",
    ];

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={closeUpgradeModal}
        >
            <div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 sm:p-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-orange-400 to-pink-500 rounded-full text-white">
                        <SparklesIcon />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Go Pro!
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Unlock the full power of iLoveGorakhpur with a Pro membership.
                    </p>

                    <div className="space-y-3 text-left my-8">
                        {proFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="font-bold text-2xl text-orange-600">₹499 <span className="text-base font-normal text-gray-600">/ year</span></p>
                        <p className="text-xs text-gray-500">(This is a simulation. No payment will be processed.)</p>
                    </div>

                    <button
                        onClick={handleUpgrade}
                        className="w-full mt-8 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                    >
                        Upgrade Now
                    </button>

                    <button
                        onClick={closeUpgradeModal}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                    >
                        Maybe later
                    </button>
                </div>

                <button
                    onClick={closeUpgradeModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close modal"
                >
                    <XIcon />
                </button>
            </div>
        </div>
    );
};

export default UpgradeModal;
