
import React from 'react';

const ContactUs: React.FC = () => (
  <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
    <h3 className="text-lg font-bold text-gray-800">Get in Touch</h3>
    <p>
      We'd love to hear from you! Whether you have a question, a suggestion, or just want to say hello, feel free to reach out.
    </p>

    <div className="space-y-2 pt-2">
        <p><strong>General Inquiries:</strong> <a href="mailto:support@ilovegorakhpur.com" className="text-orange-600 hover:underline">support@ilovegorakhpur.com</a></p>
        <p><strong>Marketplace Support:</strong> <a href="mailto:marketplace@ilovegorakhpur.com" className="text-orange-600 hover:underline">marketplace@ilovegorakhpur.com</a></p>
        <p><strong>Press & Media:</strong> <a href="mailto:media@ilovegorakhpur.com" className="text-orange-600 hover:underline">media@ilovegorakhpur.com</a></p>
    </div>

    <h3 className="text-lg font-bold text-gray-800 pt-4">Business Listings</h3>
    <p>
      If you are a local business owner and would like to be featured in our Verified Services directory or Marketplace, please contact us at <a href="mailto:business@ilovegorakhpur.com" className="text-orange-600 hover:underline">business@ilovegorakhpur.com</a>.
    </p>
    
    <h3 className="text-lg font-bold text-gray-800 pt-4">Follow Us</h3>
    <p>
      Stay connected with us on social media for the latest updates and stories from around the city.
    </p>
  </div>
);

export default ContactUs;
