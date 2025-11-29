import { useState, useEffect } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios';
import { FiUpload, FiGithub, FiCode, FiCopy, FiSun, FiMoon } from 'react-icons/fi';
import './App.css';

// Import components
import FileUpload from './components/FileUpload';
import GitHubIntegration from './components/GithubIntegration';

const themes = [
  { name: 'Prism Tomorrow', value: 'prism-tomorrow' },
  { name: 'GitHub Dark', value: 'github-dark' },
  { name: 'GitHub Light', value: 'github' },
];

function App() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1
}`);
  const [review, setReview] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [theme, setTheme] = useState(themes[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('code'); // 'code', 'upload', or 'github'

  useEffect(() => {
    prism.highlightAll();
    document.body.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  async function reviewCode(codeToReview = code) {
    try {
      setIsLoading(true);
      const response = await axios.post('https://code-reviewer-sovf.onrender.com/ai/get-review', { 
        code: codeToReview 
      });
      setReview(response.data);
    } catch (error) {
      setReview('**Error:** Could not get review. Please try again.');
      console.error('Review error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(review);
    alert('Review copied to clipboard!');
  }

  function toggleTheme() {
    setDarkMode(!darkMode);
  }

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      const fileContent = files[0].content;
      setCode(fileContent);
      if (fileContent.trim()) {
        reviewCode(fileContent);
      }
    }
  };

  return (
    <main>
      <div className='header'>
        <h1>CODE REVIEWER</h1>
        <div className="controls">
          <select
            className="theme-selector"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {themes.map((t) => (
              <option key={t.value} value={t.value}>{t.name}</option>
            ))}
          </select>
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? <FiSun className="icon" /> : <FiMoon className="icon" />}
            {darkMode ? ' Light' : ' Dark'}
          </button>
        </div>
      </div>
      
      <div className="content">
        <div className="left">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              <FiCode className="icon" /> Write Code
            </button>
            <button
              className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <FiUpload className="icon" /> Upload File
            </button>
            <button
              className={`tab ${activeTab === 'github' ? 'active' : ''}`}
              onClick={() => setActiveTab('github')}
            >
              <FiGithub className="icon" /> GitHub
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'code' && (
              <div className="code-editor-container">
                <Editor
                  value={code}
                  onValueChange={setCode}
                  highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 16,
                    border: "1px solid var(--border-color)",
                    borderRadius: "4px",
                    minHeight: "300px",
                    height: "100%",
                    width: "100%",
                    backgroundColor: "var(--editor-bg)",
                    color: "var(--text-color)",
                    overflow: "auto"
                  }}
                />
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="file-upload-container">
                <FileUpload onFileSelect={handleFileSelect} />
              </div>
            )}

            {activeTab === 'github' && (
              <div className="github-container">
                <GitHubIntegration onFileSelect={handleFileSelect} />
              </div>
            )}
          </div>

          <button
            onClick={() => reviewCode(code)}
            className="review"
            disabled={isLoading || !code.trim()}
          >
            {isLoading ? 'Reviewing...' : 'Review Code'}
          </button>
        </div>
        <div className="right">
          <div className="review-container">
            <div className="review-header">
              <h2>Code Review</h2>
              <div className="review-actions">
                <button 
                  onClick={copyToClipboard} 
                  className="copy-btn"
                  disabled={!review}
                  aria-label="Copy review to clipboard"
                >
                  <FiCopy className="icon" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
            
            <div className="review-content">
              {isLoading ? (
                <div className="loading-state">
                  <div className="loader"></div>
                  <p>Analyzing your code...</p>
                </div>
              ) : review ? (
                <div className="markdown-content">
                  <Markdown rehypePlugins={[rehypeHighlight]}>
                    {review}
                  </Markdown>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <FiCode size={48} />
                  </div>
                  <h3>No Review Yet</h3>
                  <p>Write some code or upload a file to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
