import { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [convertedFile, setConvertedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [converting, setConverting] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setConvertedFile(null);
    setUploadProgress(0);
    setConverting(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setConverting(true);

    try {
      const response = await axios.post('https://mkv-to-mp4-video-converter-backend.onrender.com/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setConvertedFile(url);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-700">MKV to MP4 Converter</h1>
      <input
        type="file"
        accept=".mkv"
        onChange={handleFileChange}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        disabled={!file || converting}
      >
        {converting ? 'Converting...' : 'Convert'}
      </button>
      {converting && (
        <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      {convertedFile && (
        <a
          href={convertedFile}
          download="converted.mp4"
          className="mt-4 text-blue-500 underline"
        >
          Download Converted File
        </a>
      )}
    </div>
  );
}

export default App;
