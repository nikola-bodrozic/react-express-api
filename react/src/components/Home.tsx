import React from 'react';

const Home: React.FC = () => {
    return (
        <div>
            <h2>Home</h2>
            <p>Environment: <b>{process.env.NODE_ENV?.toUpperCase()}</b>, App Version: <b>{import.meta.env.VITE_APP_VER}</b></p>
        </div>
    );
};

export default Home;