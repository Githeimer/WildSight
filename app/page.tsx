"use client"
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/auth/SignoutButton';

const Homepage = () => {
  const {data:session} = useSession();

  useEffect(() => {
    if (!session) {
      console.log("User is not logged in");
      redirect("/auth");
    }
  }
  , [session]);

  return (
    <div className='landing_container'>
      <h1 className='text-2xl font-semibold'>WildSight</h1>
      <SignOutButton/>
    </div>
  )
}

export default Homepage