import { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import { axiosClient } from "../axiosClient";
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
  const [pieData, setPieData] = useState<IData | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res: AxiosResponse = await axiosClient.get("/dashboard");
        setMsg(res.data.message);
        setIsLoading(false);
        setPieData(res.data.pieData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.log(error);
        setMsg("API is down");
      }
    };
    getData();
  }, []);

  return isLoading ? (
    <>
      <p>Loding...</p>
    </>
  ) : (
    <>
      <p id="msg">{msg}</p>
      <div style={{ border: "1px solid black", margin: "20px", padding: "5px" }}>
        <Pie data={pieData as IData} width={"80%"} options={{ maintainAspectRatio: false }} />
      </div>
    </>
  );
};

export default Dashboard;
