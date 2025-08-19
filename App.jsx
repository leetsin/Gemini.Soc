import React, { useState, useEffect } from 'react';

// --- Placeholder Components ---
// These were missing from your original code. I've created simple
// placeholders so the application can render without errors.

/**
 * A simple code editor component.
 * In a real application, you might use a library like Monaco Editor or CodeMirror.
 * @param {{code: string, setCode: Function}} props
 */
const CodeEditor = ({ code, setCode }) => (
  <textarea
    value={code}
    onChange={(e) => setCode(e.target.value)}
    style={{
      fontFamily: '"Fira code", "Fira Mono", monospace',
      fontSize: '14px',
      width: '100%',
      height: '200px',
      backgroundColor: '#2d2d2d',
      color: '#d4d4d4',
      border: '1px solid #444',
      borderRadius: '8px',
      padding: '10px',
      boxSizing: 'border-box',
    }}
  />
);

/**
 * A panel to display the results or errors from the Scilab execution.
 * @param {{output: any, error: string | null}} props
 */
const ResultsPanel = ({ output, error }) => {
  const resultStyle = {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    minHeight: '100px',
    whiteSpace: 'pre-wrap', // Preserve whitespace and newlines
    wordWrap: 'break-word', // Break long words
    fontFamily: 'monospace',
  };

  if (error) {
    return <div style={{ ...resultStyle, color: '#d8000c', backgroundColor: '#ffbebe' }}>Error: {error}</div>;
  }
  if (output) {
    // Assuming output could be an object, stringify it for display
    const formattedOutput = typeof output === 'object' ? JSON.stringify(output, null, 2) : output;
    return <div style={resultStyle}>{formattedOutput}</div>;
  }
  return <div style={resultStyle}>No output yet. Click "Execute" to run your code.</div>;
};


// --- Main Application Component ---

function App() {
  // FIX 1: Corrected useState initialization for 'code'
  const [code, setCode] = useState('// Scilab 2025.1.0 Example\nx = 0:0.1:2*%pi;\ny = sin(x);\nplot(x, y);');
  const [jobId, setJobId] = useState(null);
  // FIX 2: Correctly destructured useState for 'status'
  const [status, setStatus] = useState('idle');
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);

  // FIX 3: Corrected the API_URL string to be a valid URL
  const API_URL = 'http://127.0.0.1:8000'; // Backend API URL

  // Effect for polling the job status
  useEffect(() => {
    // Only start polling if the job is queued or running
    if (status !== 'queued' && status !== 'running') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/job/${jobId}`);
        if (!res.ok) throw new Error('Failed to fetch job status');
        const data = await res.json();
        
        // FIX 4: Used logical OR (||) instead of bitwise OR (|)
        if (data.status === 'completed' || data.status === 'failed') {
          setStatus(data.status);
          setOutput(data.output);
          setError(data.error);
          clearInterval(interval); // Stop polling
        }
      } catch (err) {
        setError(err.message);
        setStatus('failed');
        clearInterval(interval); // Stop polling on error
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup function to clear the interval when the component unmounts
    // or when the dependencies (status, jobId) change.
    return () => clearInterval(interval);
  }, [status, jobId]);

  // Handler for submitting the code to the backend
  const handleSubmit = async () => {
    setStatus('submitting');
    setOutput(null);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error('Failed to submit job');
      const data = await response.json();
      setJobId(data.job_id);
      setStatus(data.status);
    } catch (err) {
      setError(err.message);
      setStatus('failed');
    }
  };

  return (
    // Basic styling is applied inline for simplicity
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5em', color: '#333' }}>Scilab on Cloud</h1>
      </header>
      <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div className="editor-container">
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Code Editor</h3>
          <CodeEditor code={code} setCode={setCode} />
          <button 
            onClick={handleSubmit} 
            // FIX 5: Used logical OR (||) for the disabled check
            disabled={status === 'running' || status === 'submitting'}
            style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                marginTop: '10px',
                cursor: 'pointer',
                backgroundColor: (status === 'running' || status === 'submitting') ? '#ccc' : '#007BFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                transition: 'background-color 0.3s',
            }}
          >
            {status === 'running' || status === 'submitting' ? 'Executing...' : 'Execute'}
          </button>
        </div>
        <div className="output-container">
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Results</h3>
          <p><b>Status:</b> <span style={{ 
              padding: '4px 8px', 
              borderRadius: '12px', 
              color: 'white',
              backgroundColor: 
                status === 'completed' ? '#28a745' :
                status === 'failed' ? '#dc3545' :
                status === 'running' ? '#17a2b8' : '#6c757d'
            }}>{status}</span></p>
          <ResultsPanel output={output} error={error} />
        </div>
      </main>
    </div>
  );
}

export default App;
