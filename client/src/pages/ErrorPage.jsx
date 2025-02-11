import React from "react";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white overflow-hidden relative">


      {/* Floating Animation on 404 */}
      <div className="relative text-9xl font-extrabold tracking-widest select-none animate-floating">
        <span className="relative text-white">404</span>
      </div>

      {/* Message */}
      <p className="mt-4 text-lg text-gray-300 animate-fade-in">
        Oops! The page you are looking for doesn’t exist.
      </p>
      <a href="/snippets" className="mt-2 text-gray-500 hover:opacity-90 text-lg">Go Back :(</a>

      {/* Tailwind Animation Styles */}
      <style>
        {`
          @keyframes floating {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          .animate-floating { animation: floating 4s ease-in-out infinite; }

          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 1s ease-out; }
        `}
      </style>
    </div>
  );
};

export default ErrorPage;
