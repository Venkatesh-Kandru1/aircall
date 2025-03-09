import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import './css/app.css';
const BASE_URL = "https://aircall-api.onrender.com";

function App() {
  return (
    <Router>
      <div className="p-4">
        <nav className="flex justify-between mb-4">
          <Link to="/">Activity Feed</Link>
          <Link to="/archived">Archived</Link>
        </nav>
        <Routes>
          <Route path="/" element={<ActivityFeed />} />
          <Route path="/archived" element={<ArchivedCalls />} />
          <Route path="/call/:id" element={<CallDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

function Button({ children, onClick, className = "" }) {
  return (
    <button onClick={onClick} className={`archive-button ${className}`}>
      {children}
    </button>
  );
}

function CardContent({ children }) {
  return <div className="call-details">{children}</div>;
}

function Card({ children }) {
  return <div className="call-item">{children}</div>;
}

function ActivityFeed() {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const res = await fetch(`${BASE_URL}/activities`);
      const data = await res.json();
      setCalls(data.filter(call => !call.is_archived));
    } catch (error) {
      console.error(error);
    }
  };

  const archiveCall = async (id) => {
    try {
      await fetch(`${BASE_URL}/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_archived: true }),
      });
      fetchCalls();
    } catch (error) {
      console.error(error);
    }
  };

  const archiveAll = async () => {
    await Promise.all(calls.map(call => archiveCall(call.id)));
  };

  return (
    <div className="activity-feed">
      <div>
        <Button onClick={archiveAll} className="mb-2">Archive All</Button>
      </div>
      {calls.map((call, i) => (
          <Card key={i}>
            <CardContent>
              <p>{call.from} → {call.to}</p>
              <p>Type: {call.call_type}</p>
              <Button onClick={() => archiveCall(call.id)}>Archive</Button>
              <Link to={`/call/${call.id}`}>Details</Link>
            </CardContent>
          </Card>
      ))}
    </div>
  );
}

function ArchivedCalls() {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const res = await fetch(`${BASE_URL}/activities`);
      const data = await res.json();
      setCalls(data.filter(call => call.is_archived));
    } catch (error) {
      console.error(error);
    }
  };

  const unarchiveCall = async (id) => {
    try {
      await fetch(`${BASE_URL}/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_archived: false }),
      });
      fetchCalls();
    } catch (error) {
      console.error(error);
    }
  };

  const unarchiveAll = async () => {
    await Promise.all(calls.map(call => unarchiveCall(call.id)));
  };

  return (
    <div className="activity-feed">
      <div>
        <Button onClick={unarchiveAll} className="mb-2">Unarchive All</Button>
      </div>
      {calls.map((call) => (
          <Card>
            <CardContent>
              <p>{call.from} → {call.to}</p>
              <p>Type: {call.call_type}</p>
              <Button onClick={() => unarchiveCall(call.id)}>Unarchive</Button>
            </CardContent>
          </Card>
      ))}
    </div>
  );
}

function CallDetail() {
  const [call, setCall] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetchCallDetail();
  }, [id]);

  const fetchCallDetail = async () => {
    try {
      const res = await fetch(`${BASE_URL}/activities/${id}`);
      const data = await res.json();
      setCall(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!call) return <p>Loading...</p>;

  return (
    <Card>
      <CardContent>
        <p>From: {call.from}</p>
        <p>To: {call.to}</p>
        <p>Type: {call.call_type}</p>
        <p>Duration: {call.duration} sec</p>
        <p>Direction: {call.direction}</p>
      </CardContent>
    </Card>
  );
}

export default App;

ReactDOM.render(<App/>, document.getElementById('app'));
