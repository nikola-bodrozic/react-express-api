import React from 'react';

const About: React.FC = () => {
  return (
    <div>
      <h2>About</h2>
      <p>Environment: <b>{process.env.NODE_ENV?.toUpperCase()}</b>, App Version: <b>{import.meta.env.VITE_APP_VER}</b></p>
    </div>
  );
};

export default About;
