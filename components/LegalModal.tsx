
import React from 'react';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';
import AboutUs from './AboutUs';
import ContactUs from './ContactUs';
import { XIcon } from './icons';
import type { ModalContentType } from '../App';

interface LegalModalProps {
  content: ModalContentType;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ content, onClose }) => {
  let title = '';
  let ContentComponent: React.FC = () => null;

  switch (content) {
    case 'terms':
      title = 'Terms of Service';
      ContentComponent = TermsOfService;
      break;
    case 'privacy':
      title = 'Privacy Policy';
      ContentComponent = PrivacyPolicy;
      break;
    case 'about':
      title = 'About Us';
      ContentComponent = AboutUs;
      break;
    case 'contact':
      title = 'Contact Us';
      ContentComponent = ContactUs;
      break;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          <ContentComponent />
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
