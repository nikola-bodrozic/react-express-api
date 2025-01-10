import React from 'react';
import { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../axiosGlobalConfig';

const About: React.FC = () => {
  const [hostInfo, setHostInfo] = useState("")

  useEffect(() => {
    const getData = async () => {
      try {
        const res: AxiosResponse = await axios.get(`${baseURL}/pod`, {
          withCredentials: false,
          timeout: 3000
        });
        setHostInfo(res.data.hostname)
      } catch (error: unknown) {
        console.log(error);
      }
    };

    getData();
  }, []);

  return (
    <div>
      <h2>About</h2>
      <p>Environment: <b>{process.env.NODE_ENV?.toUpperCase()}</b>, App Version: <b>{import.meta.env.VITE_APP_VER}</b></p>
      <p>Frontend Host: <b>{hostInfo}</b></p>
    </div>
  );
};

export default About;
