import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-[60vh] bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/1600/900?random=1&grayscale&blur=2')" }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Discover the Heart of <span className="text-orange-400">Purvanchal</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl">
          Welcome to iLoveGorakhpur, your one-stop portal to explore the vibrant culture, rich history, and hidden gems of our beloved city.
        </p>
        <a 
          href="#ai-assistant"
          className="mt-8 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Ask Our AI Guide
        </a>
      </div>
    </section>
  );
};

export default Hero;
