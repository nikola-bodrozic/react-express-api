import { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { axiosClient } from '../axiosClient';

const Dashboard: React.FC = () => {
    const [msg, setMsg] = useState("")

    useEffect(() => {
        const getData = async () => {
            try {
                const res: AxiosResponse = await axiosClient.get("/dashboard");
                setMsg(res.data.message)
                console.log(res.data)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.log(error)
                setMsg("API is down")
            }
        }
        getData()
    }, [])

    return <p id='msg'>{msg}</p>
};

export default Dashboard;
