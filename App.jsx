<! = useState('// Scilab 2025.1.0 Example\nx = 0:0.1:2*%pi;\ny = sin(x);\nplot(x, y);');
  const [jobId, setJobId] = useState(null);
  const = useState('idle');
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = '[http://127.0.0.1:8000](http://127.0.0.1:8000)'; // Backend API URL

  useEffect(() => {
    if (status!== 'queued' && status!== 'running') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/job/${jobId}`);
        if (!res.ok) throw new Error('Failed to fetch job status');
        const data = await res.json();
        
        if (data.status === 'completed' |

| data.status === 'failed') {
          setStatus(data.status);
          setOutput(data.output);
          setError(data.error);
          clearInterval(interval);
        }
      } catch (err) {
        setError(err.message);
        setStatus('failed');
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [status, jobId]);

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
    <div className="app-container">
      <header>
        <h1>Scilab on Cloud</h1>
      </header>
      <main>
        <div className="editor-container">
          <h3>Code Editor</h3>
          <CodeEditor code={code} setCode={setCode} />
          <button onClick={handleSubmit} disabled={status === 'running' |

| status === 'submitting'}>
            {status === 'running'? 'Executing...' : 'Execute'}
          </button>
        </div>
        <div className="output-container">
          <h3>Results</h3>
          <p>Status: {status}</p>
          <ResultsPanel output={output} error={error} />
        </div>
      </main>
    </div>
  );
}

export default App;

