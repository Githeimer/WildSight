"use client"
import AlertStatusCard from '@/components/sidebar/AlertStatusCard'
import AnimalTrackingList from '@/components/sidebar/AnimalTrackingList'
import TrackerStatusCard from '@/components/sidebar/TrackerStatusCard'
import axios from 'axios'
import React, { useEffect } from 'react'

const Homepage = () => {
    const [totalDevices, setTotalDevices] = React.useState(0);
    const [activeDevices, setActiveDevices] = React.useState(0);

    useEffect(() => {
        getDevicesNumber();
    }
    , []);

    const getDevicesNumber = async () => {
        const response=await axios.get('/api/devices/all');
        console.log(response.data);

        if (response.status === 200) {
            setTotalDevices(response.data.totalDevices);
            setActiveDevices(response.data.availableDevices);
        } else {
            console.error("Error fetching devices data:", response.statusText);
        }
        
    }
        

  return (
    <div className='flex flex-col gap-4 p-4'> 
        <div className=' flex flex-col md:flex-row items-center justify-between'> 
        <TrackerStatusCard activeCount={activeDevices} totalCount={totalDevices}></TrackerStatusCard>
            <AlertStatusCard criticalCount={0} warningCount={2}></AlertStatusCard>
             </div>
             <div className='h-full'>
                <AnimalTrackingList></AnimalTrackingList>

             </div>
    </div>
  )
}

export default Homepage