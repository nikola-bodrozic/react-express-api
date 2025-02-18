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
import {jwtDecode} from 'jwt-decode';

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

interface ITokenPayload {
  username: string;
  // Add any other fields your token payload might contain
}

const Dashboard = () => {
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [pieDataArr, setPieDataArr] = useState<IPieData[] | null>(null);
  const token = localStorage.getItem('jwtToken');

  const decodeToken = (token: string) => {
    try {
      const decoded = jwtDecode<ITokenPayload>(token);
      return decoded.username;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  const username = decodeToken(token as string);

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
      try {
        const res = await axios.get("/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
          signal: signal
        });
        setMsg(res.data.message);
        setPosts(res.data.posts);
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

    return () => controller.abort();
  }, [token]);

  const handleDelete = async (postId: number) => {
    try {
      await axios.delete(`/posts/${postId}`, { 
        headers: {
          Authorization: `Bearer ${token}`, 
        },
        withCredentials: true
      });
      setPosts(prevPosts => prevPosts.filter((post:any) => post.id !== postId));
    } catch (error) {
      console.error('Delete faixcled:', error);
    }
  }

  return isLoading ? (
    <p id="dashLoader">Loading..</p>
  ) : (
    <>
      <p id="msg">{msg}</p>
      <div className='pies'>
        {pieDataArr?.map((pieData: IPieData, index: number) => <div key={`holder${index}`} className="pieHolder"><Pie id={`pie${index}`} data={pieData} width={"80%"} options={{ maintainAspectRatio: false }} /></div>)}
      </div>
      <div>
        {posts.map((post: any) => (
          <div key={post.id} className="post">
            <div className="content">
              <h2>{post.title}</h2>
              <p>{post.content}</p>
            </div>
            {post.username === username && (
              <button className="deleteButton" onClick={() => handleDelete(post.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Dashboard;
