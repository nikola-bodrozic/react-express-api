import './Dashboard.css'
import { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import { axiosClient } from "../../axiosClient";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

interface IDataSet {
  data: number[];
  backgroundColor: string[];
  borderWidth: number;
}

interface IData {
  labels: string[];
  datasets: IDataSet[];
}

const Dashboard: React.FC = () => {
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pieDataArr, setPieDataArr] = useState<IData[] | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res: AxiosResponse = await axiosClient.get("/dashboard");
        setMsg(res.data.message);
        setIsLoading(false);
        setPieDataArr(res.data.pieDataArr);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.log(error);
        setMsg("API is down");
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
        {pieDataArr?.map((pieData: IData, index: number) => <div key={`holder${index}`} className="pieHolder"><Pie id={`pie${index}`} data={pieData} width={"80%"} options={{ maintainAspectRatio: false }} /></div>)}
      </div>
    </>
  );
};

export default Dashboard;
