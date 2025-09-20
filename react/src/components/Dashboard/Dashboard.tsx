import './Dashboard.css';
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

interface IPost {
  id: number;
  title: string;
  content: string;
  created_at?: string;
  username: string;
}

interface IPieData {
  labelers: string[];
  datasets: IDatasets[];
}

const Dashboard = () => {
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [deletingPosts, setDeletingPosts] = useState<number[]>([]);
  const [pieDataArr, setPieDataArr] = useState<IPieData[] | null>(null);
  const [username, setUsername] = useState<string | null>(null);

axiosRetry(axios, {
  retries: 3,
  retryDelay: retryCount => retryCount * 1000,
  retryCondition: (error) => {
    const status = error.response?.status;
    return status === 500 || status === 503;
  }
});


  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const getData = async () => {
      try {
        const res = await axios.get("/dashboard", {signal});

        setMsg(res.data.message);
        setPosts(res.data.posts);
        setPieDataArr(res.data.pieDataArr);
        setUsername(res.data.username);
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
  }, []);

  const handleDelete = async (postId: number) => {
    try {
      setDeletingPosts(prev => [...prev, postId]);
      await new Promise(resolve => setTimeout(resolve, 800));
      await axios.delete(`/posts/${postId}`, {
        withCredentials: true
      });
      setPosts(prev => prev.filter(post => post.id !== postId));
      setDeletingPosts(prev => prev.filter(id => id !== postId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return isLoading ? (
    <p id="dashLoader">Loading...</p>
  ) : (
    <>
      <p id="msg">{msg}</p>
      <div className='pies'>
        {pieDataArr?.map((pieData, index) => (
          <div key={`holder${index}`} className="pieHolder">
            <Pie
              id={`pie${index}`}
              data={pieData}
              width={"80%"}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        ))}
      </div>
      <div>
        {posts.map(post => (
          <div key={post.id} className={`post ${deletingPosts.includes(post.id) ? 'disappearing' : ''}`}>
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
