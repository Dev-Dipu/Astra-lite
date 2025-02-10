import React from "react";
import { FaGithub } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Documentation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <button onClick={() => navigate(-1)} className=" mb-4 px-4 py-2 bg-gray-800 rounded-lg fixed">
        ⬅️ Go Back
      </button>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 mt-2">Astra Code Editor Documentation</h1>
        
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3 ">🚀 Introduction</h2>
          <p className="text-gray-300">
            Astra Code Editor is a powerful, browser-based code editor with real-time collaboration,
            file management, and execution capabilities using the Piston API.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3 ">📌 Features</h2>
          <ul className="list-disc pl-5 text-gray-300">
            <li>Multi-language support with Piston API for code execution</li>
            <li>Real-time collaboration using Liveblocks</li>
            <li>Auto-save functionality for seamless coding experience</li>
            <li>Terminal integration powered by Xterm.js</li>
            <li>Customizable themes and keybindings</li>
            <li>Folder and file management</li>
            <li>Snippet saving and PixelPen for HTML, CSS, and JS previews</li>
            <li>Multiple code editor instances for parallel coding</li>
            <li>Code exploration to browse and like others' code</li>
            <li>Download code directly from the editor</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3 ">⚙️ Tech Stack</h2>
          <div className="grid grid-cols-2 gap-4 text-gray-300">
            <span>🖥️ React.js (Frontend UI)</span>
            <span>🎨 Tailwind CSS (Styling)</span>
            <span>✍️ CodeMirror (Editor)</span>
            <span>💻 Xterm.js (Terminal)</span>
            <span>🚀 Node.js & Express (Backend)</span>
            <span>🗄️ MongoDB (Database)</span>
            <span>🔗 Liveblocks (Collaboration)</span>
            <span>🐳 Docker (Code Execution)</span>
            <span>🛠️ Piston API (Code Execution)</span>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3 ">📂 Project Structure</h2>
          <div className="bg-gray-800 p-4 rounded-lg text-gray-300">
            <pre>
{`/server
  ├── config/         # Database & environment setup
  ├── controllers/    # Business logic
  ├── models/        # Mongoose models
  ├── routes/        # API endpoints
  ├── middlewares/   # Auth & validation
  ├── utils/         # Helper functions
  ├── server.js      # Main server file

/client
  ├── components/    # UI Components
  ├── pages/        # Application pages
  ├── hooks/        # Custom React hooks
  ├── utils/        # API Helpers
  ├── App.js        # Entry point
  ├── index.js      # Root rendering
  ├── styles/       # Theme customization
`}
            </pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3 ">🚀 Upcoming Features</h2>
          <ul className="list-disc pl-5 text-gray-300">
            <li>More customization options for themes</li>
            <li>Enhanced collaboration features with live voice chat</li>
            <li>Better file system with cloud storage integration</li>
            <li>Improved AI-powered code suggestions</li>
          </ul>
        </section>

        <section className="mt-20 text-center flex items-center justify-center">
          <p className="text-gray-300">Developed by Developer Dipu</p>
          <a href="https://github.com/dipu" target="_blank" className=" flex justify-center items-center gap-2 ml-2">
            <FaGithub size={24} />
          </a>
        </section>
      </div>
    </div>
  );
};

export default Documentation;