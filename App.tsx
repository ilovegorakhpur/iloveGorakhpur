
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeatureCard from './components/FeatureCard';
import ItineraryPlanner from './components/ItineraryPlanner';
import CommunityBulletin from './components/CommunityBulletin';
import AIAssistant from './components/AIAssistant';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { NewspaperIcon, ServicesIcon, ShoppingCartIcon } from './components/icons';
import LocalServices from './components/LocalServices';
import LocalNews from './components/LocalNews';
import Marketplace from './components/Marketplace';

const App: React.FC = () => {
  const { isAuthModalOpen } = useAuth();
  const features = [
    {
      icon: <ShoppingCartIcon />,
      title: 'Gorakhpur Marketplace',
      description: 'Buy tickets for local events and shop for unique products from city artisans.'
    },
    {
      icon: <ServicesIcon />,
      title: 'Verified Local Services',
      description: 'Find trusted and verified local professionals for all your home and business needs.'
    },
    {
      icon: <NewspaperIcon />,
      title: 'Local Stories & News',
      description: 'Catch up on the latest news and stories from around Gorakhpur, with AI-powered summaries.'
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {isAuthModalOpen && <AuthModal />}
      <Header />
      <main className="flex-grow">
        <Hero />
        <section id="features" className="py-16 sm:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Life in Gorakhpur</h2>
              <p className="mt-4 text-lg text-gray-600">Experience the best our city has to offer.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>
        <Marketplace />
        <LocalNews />
        <ItineraryPlanner />
        <LocalServices />
        <CommunityBulletin />
        <AIAssistant />
      </main>
      <Footer />
    </div>
  );
};

export default App;