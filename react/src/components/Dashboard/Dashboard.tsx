import './Dashboard.css'
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);
import axiosRetry from 'axios-retry';
import { baseURL, withCredentials } from '../../axiosGlobalConfig';

interface IDatasets {
  data: number[];
  backgroundColor: string[];
  borderWidth: number;
}

interface IPieData {
  labelers: string[]
  datasets: IDatasets[]
}

axiosRetry(axios, {
  retries: 5,
  retryDelay: (retryCount) => {
    console.log(`Retry attempt: ${retryCount}`);
    return 1000;
  },
  retryCondition: (error) => {
    return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
  },
});

const Dashboard = () => {
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pieDataArr, setPieDataArr] = useState<IPieData[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const getData = async () => {
      try {
        const res: AxiosResponse = await axios.get(`${baseURL}/dashboard`, { signal, withCredentials });
        setMsg(res.data.message);
        setPieDataArr(res.data.pieDataArr);
      } catch (error: unknown) {
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

    return () => {
      controller.abort();
    };
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
