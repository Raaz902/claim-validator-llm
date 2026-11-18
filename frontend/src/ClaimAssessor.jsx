import { useEffect, useState } from 'react';

async function readJson(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return body;
}

const pct = (c) => `${Math.round(c * 100)}%`;

export default function ClaimAssessor() {
  const [claim, setClaim] = useState('');
  const [evidence, setEvidence] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  async function loadHistory() {
    try {
      setHistory(await readJson(await fetch('/api/claims/assessments')));
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/claims/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim, evidence }),
      });
      setResult(await readJson(res));
      loadHistory(); // refresh the list with the new result
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Claims Intelligence Engine</h1>

      <form onSubmit={submit}>
        <label>
          Claim
          <input
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Reduces wrinkles by 20% in 4 weeks"
            required
          />
        </label>
        <label>
          Study results / evidence
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="Randomised, placebo-controlled study, 120 women aged 40-65, 4 weeks..."
            rows={6}
            required
          />
        </label>
        <button disabled={loading}>{loading ? 'Assessing...' : 'Assess'}</button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <section className={`result ${result.justified ? 'yes' : 'no'}`}>
          <p>
            <strong>Justified:</strong> {result.justified ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Confidence:</strong> {pct(result.confidence)}
          </p>
          <p>
            <strong>Reasoning:</strong> {result.reasoning}
          </p>
        </section>
      )}

      <h3>Previous assessments</h3>
      {history.length === 0 ? (
        <p className="muted">No assessments yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Claim</th>
              <th>Justified</th>
              <th>Confidence</th>
              <th>Reasoning</th>
            </tr>
          </thead>
          <tbody>
            {history.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.createdAt).toLocaleString()}</td>
                <td>{a.claim.text}</td>
                <td>{a.justified ? 'Yes' : 'No'}</td>
                <td>{pct(a.confidence)}</td>
                <td>{a.reasoning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
