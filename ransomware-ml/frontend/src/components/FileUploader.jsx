import { useState, useRef } from 'react';
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FileUploader = ({ onFileSelect, accept = '.pdf,.docx,.doc,.json', maxSizeMB = 50 }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    // Validate file extension
    const allowedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert(`Invalid file type. Allowed types: ${accept}`);
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    if (selectedFile.size > maxSize) {
      alert(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setFile(selectedFile);
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 bg-white hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="text-center">
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">
              {file ? file.name : 'Click to upload or drag and drop'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {accept} (MAX. {maxSizeMB}MB)
            </p>
          </div>
        </div>
      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <DocumentArrowUpIcon className="h-6 w-6 text-primary-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;

