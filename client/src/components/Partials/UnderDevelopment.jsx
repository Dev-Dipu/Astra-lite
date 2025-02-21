import React from "react";

const UnderDevelopment = () => {
  return (
    <div className="bg-black h-[80vh] flex flex-col items-center justify-center text-white p-6 overflow-hidden">
      <p 
        className="text-lg text-gray-400 flex items-center gap-2 bg-gradient-to-r from-gray-600 via-white to-gray-600 bg-clip-text text-transparent animate-gradient"
      >
        <span className="text-xl text-white">⚡</span> Something cool is coming soon. Stay tuned!
      </p>
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
        `}
      </style>
    </div>
  );
};

export default UnderDevelopment;
