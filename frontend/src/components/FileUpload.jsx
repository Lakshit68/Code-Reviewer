// In FileUpload.jsx
import { useCallback, useState } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

const FileUpload = ({ onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const newFiles = Array.from(e.dataTransfer.files);
    handleFiles(newFiles);
  }, []);

  const handleFileInput = (e) => {
    const newFiles = Array.from(e.target.files);
    handleFiles(newFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => 
      file.type.startsWith('text/') || 
      file.name.endsWith('.js') || 
      file.name.endsWith('.jsx') ||
      file.name.endsWith('.ts') ||
      file.name.endsWith('.tsx') ||
      file.name.endsWith('.py') ||
      file.name.endsWith('.java') ||
      file.name.endsWith('.c') ||
      file.name.endsWith('.cpp') ||
      file.name.endsWith('.h') ||
      file.name.endsWith('.go') ||
      file.name.endsWith('.rs') ||
      file.name.endsWith('.rb') ||
      file.name.endsWith('.php') ||
      file.name.endsWith('.swift') ||
      file.name.endsWith('.kt') ||
      file.name.endsWith('.scala')
    );

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    try {
      const fileContents = await Promise.all(
        files.map(file => 
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({
              name: file.name,
              content: e.target.result,
              type: file.type,
              size: file.size
            });
            reader.readAsText(file);
          })
        )
      );

      if (onFileSelect) {
        onFileSelect(fileContents);
      }
    } catch (error) {
      console.error('Error reading files:', error);
    }
  };

  return (
    <div className="file-upload-root">
      <div className="file-upload-card">
        <div 
          className={`file-upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="file-upload-icon">
            <FiUpload />
          </div>

          <p className="file-upload-title">
            Drag & drop files here
          </p>
          <p className="file-upload-subtitle">
            or choose files from your device
          </p>

          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="file-upload-input-hidden"
            id="file-upload"
            accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.go,.rs,.rb,.php,.swift,.kt,.scala,.txt"
          />
          <label 
            htmlFor="file-upload" 
            className="file-upload-button"
          >
            Choose files
          </label>

          <p className="file-upload-formats">
            Supported: .js, .jsx, .ts, .tsx, .py, .java, .c, .cpp, .h, .go, .rs, .rb, .php, .swift, .kt, .scala
          </p>
        </div>

        {files.length > 0 && (
          <div className="file-upload-selected">
            <div className="file-upload-selected-header">
              <h3 className="file-upload-selected-title">
                Selected files ({files.length})
              </h3>
              <button
                onClick={uploadFiles}
                className="file-upload-upload-btn"
              >
                Upload & review
              </button>
            </div>

            <div className="file-upload-selected-list">
              {files.map((file, index) => (
                <div 
                  key={index}
                  className="file-upload-selected-item"
                >
                  <div className="file-upload-selected-info">
                    <div className="file-upload-selected-icon">
                      <FiFile />
                    </div>
                    <div className="file-upload-selected-text">
                      <p className="file-upload-selected-name">
                        {file.name}
                      </p>
                      <p className="file-upload-selected-size">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="file-upload-remove-btn"
                    aria-label="Remove file"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;