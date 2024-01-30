"use client"

import axios from "axios";
import React, { useState } from "react";

function Home() {

    const [url, setUrl] = useState('');
    const [data, setData] = useState(null);
    const [progress, setProgress] = useState('');

    const handleLoadSong = async () => {
        setProgress('');
        setData(null);
        try {
            const res = await axios.post(process.env.NEXT_PUBLIC_API_URL+'/fetch', { 'url': url });
            res.data?.songs_list.map(item => { item.status = "Not Downloaded Yet" });
            setData({...res.data});
        } catch (e) {
            console.log(e);
        }
    }

    const handleStartDownload = async () => {
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL+'/playlist', {
                method: "POST",
                headers: {
                    Accept: 'text/event-stream',
                },
                body: JSON.stringify(data),
            });

            const reader = res.body.getReader();

            while (true) {
                const { done, value } = await reader.read();
                const d = {...data};
                let x = new TextDecoder().decode(value);
                if (!done) {
                    if (x[0] === 's') {
                        d.songs_list[d.songs_list.length - 1].status = "Download Complete";
                        setProgress((prog) => prog = x);
                    } else {
                        if (x <= d.songs_list.length) d.songs_list[x-1].status = "Downloading";
                        if (x != 1) d.songs_list[x-2].status = "Download Complete";
                    }
                    setData(d);
                }

                if (done) {
                    break;
                }

            }
        } catch (e) {
            console.log(e);
        }
    }

    const startDownload = async () => {
        try {
            console.log(progress);
            let res = await axios.get(process.env.NEXT_PUBLIC_API_URL+'/download?id='+progress, 
                {
                    'responseType': 'arraybuffer'
                }
            );

            // Create a Blob from the response data
            const blob = new Blob([res.data], { type: 'application/zip; charset=utf-8' });

            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = progress+'.zip';

            // Append the link to the document
            document.body.appendChild(link);

            // Trigger the download
            link.click();

            // Remove the link from the document
            document.body.removeChild(link);
        } catch (e) {
            console.log(e);
        }
    }

    window.onload = () => {};

    return (
        <main className="flex min-h-screen flex-col items-center p-24 bg-slate-950">
            <h1 className="text-xl">MAAP BELOM RESPONSIVE</h1>
            <div className="flex items-center gap-2">
                <input onChange={(e) => setUrl(e.target.value)} type="text" name="url" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Enter Url.." />
                <button onClick={handleLoadSong} className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none">Fetch</button>
                <button disabled={data === null} onClick={handleStartDownload} className="text-white bg-blue-700 disabled:bg-gray-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none">Confirm</button>
                <button disabled={progress[0] !== 's'} onClick={startDownload} className="text-white bg-orange-700 disabled:bg-gray-500 hover:bg-orange-800 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none">Download</button>
            </div>
            <section className="my-3"/>
            <div className="w-10/12">
                {data?.songs_list &&
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    #
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Cover
                                </th>
                                <th scope="col" className="px-6 w-1/2 py-3">
                                    Title
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Status
                                </th>
                            </tr>
                        </thead>
                    {data?.songs_list && 
                        data?.songs_list?.map((item, key) => (
                            <React.Fragment key={key}>
                                <tbody>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <p>{item?.id}</p>
                                        </th>
                                        <td className="px-6 py-4 w-1/4">
                                            <img alt={key} className="w-full" src={item?.thumbnail} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-lg">{item?.title}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p>{item?.status}</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </React.Fragment>
                        ))
                    }
                    </table>
                }
            </div>
        </main>
    );
}

export default Home; 