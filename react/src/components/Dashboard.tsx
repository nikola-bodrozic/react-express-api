import { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { axiosClient } from '../axiosClient';

const Dashboard: React.FC = () => {
    console.log("dashboard")
    const [msg, setMsg] = useState("")

    useEffect(() => {
        const fd = async () => {
            try {
                const res: AxiosResponse = await axiosClient.get("/dashboard");
                setMsg(JSON.stringify(res.data, null,2))
                console.log(res.status, res.statusText)
            } catch (error: any) {
                console.log(error)
                setMsg("API is down")
            }
        }

        fd()
    }, [])
    return (
        <>
            <p>{msg}</p>
        </>
    );
};

export default Dashboard;
