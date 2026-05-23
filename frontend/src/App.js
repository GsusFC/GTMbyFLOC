import React from 'react';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <iframe
        title="GTM by FLOC"
        src="/floc-landing.html"
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
          display: 'block',
          background: '#000',
        }}
      />
    </div>
  );
}

export default App;
