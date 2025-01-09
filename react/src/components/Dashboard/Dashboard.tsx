import './Dashboard.css'
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { axiosClient } from "../../axiosClient";
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

  useEffect(() => {
    const getData = async () => {
      try {
        const res: AxiosResponse = await axiosClient.get("/dashboard");
        setMsg(res.data.message);
        setPieDataArr(res.data.pieDataArr);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.log(error.status, error.message)
        } else {
          console.error(error);
        }
        setMsg("API is down");
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);


  return isLoading ? (
    <p id="dashLoader">Loding...</p>
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
