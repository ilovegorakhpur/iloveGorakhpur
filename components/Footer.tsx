
import React from 'react';
import { TwitterIcon, FacebookIcon, InstagramIcon } from './icons';
import type { ModalContentType } from '../App';

interface FooterProps {
  onShowLegal: (content: ModalContentType) => void;
}

const Footer: React.FC<FooterProps> = ({ onShowLegal }) => {
  return (
    <footer id="about" className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <p className="text-lg font-semibold">iLoveGorakhpur</p>
            <p className="text-sm text-gray-400">Your friendly community guide.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><TwitterIcon /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><FacebookIcon /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><InstagramIcon /></a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
            <div className="mb-4 sm:mb-0">
                &copy; {new Date().getFullYear()} iLoveGorakhpur. All Rights Reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <button onClick={() => onShowLegal('about')} className="hover:text-white transition-colors">About Us</button>
                <button onClick={() => onShowLegal('contact')} className="hover:text-white transition-colors">Contact Us</button>
                <button onClick={() => onShowLegal('terms')} className="hover:text-white transition-colors">Terms of Service</button>
                <button onClick={() => onShowLegal('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
