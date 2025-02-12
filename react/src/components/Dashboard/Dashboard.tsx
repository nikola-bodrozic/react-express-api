import './Dashboard.css'
import { useEffect, useState } from "react";
import axiosRetry from 'axios-retry';
import axios from "../../axiosConfig";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

interface IDatasets {
  data: number[];
  backgroundColor: string[];
  borderWidth: number;
}

interface IPieData {
  labelers: string[]
  datasets: IDatasets[]
}

const Dashboard = () => {
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pieDataArr, setPieDataArr] = useState<IPieData[] | null>(null);
  axiosRetry(axios, { 
    retries: 3, 
    retryDelay: (retryCount: number) => {
      return retryCount * 1000;
    },
    retryCondition: (error: any) => {
      return error.response && (error.response.status === 500 || error.response.status === 503);
    }
  });
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const getData = async () => {
      const token = localStorage.getItem('jwtToken'); // Retrieve the token from local storage
      try {
        const res = await axios.get("/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the Authorization header
          },
          signal: signal
        });
        setMsg(res.data.message);
        setPieDataArr(res.data.pieDataArr);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.error('Request canceled:', error.message);
        } else {
          console.error('Request failed:', error);
          setMsg("API is down");
        }
      } finally {
        setIsLoading(false);
      }
    };

    getData();
    // Cleanup function to abort the request if the component unmounts
    return () => controller.abort();

  }, []);



  return isLoading ? (
    <p id="dashLoader">Loading...</p>
  ) : (
    <>
      <p id="msg">{msg}</p>
      <div className='pies'>
        {pieDataArr?.map((pieData: IPieData, index: number) => <div key={`holder${index}`} className="pieHolder"><Pie id={`pie${index}`} data={pieData} width={"80%"} options={{ maintainAspectRatio: false }} /></div>)}
      </div>
    </>
  );
};

export default Dashboard;
