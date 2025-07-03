import { useState, useEffect } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios';
import './App.css';

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

  useEffect(() => {
    prism.highlightAll();
    document.body.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  async function reviewCode() {
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:3000/ai/get-review', { code });
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
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
      
      <div className="content">
        <div className="left">
          <div className="code">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                border: "1px solid var(--border-color)",
                borderRadius: "5px",
                height: "100%",
                width: "100%",
                backgroundColor: "var(--editor-bg)",
                color: "var(--text-color)"
              }}
            />
          </div>
          <button
            onClick={reviewCode}
            className="review"
            disabled={isLoading}
          >
            {isLoading ? 'Reviewing...' : 'Review Code'}
          </button>
        </div>
        <div className="right">
          {review && (
            <button className="copy-btn" onClick={copyToClipboard}>
              Copy
            </button>
          )}
          <Markdown rehypePlugins={[rehypeHighlight]}>
            {review || '**Code Review** will appear here.'}
          </Markdown>
        </div>
      </div>
    </main>
  );
}

export default App;