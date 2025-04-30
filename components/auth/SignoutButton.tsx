"use client"
import React from 'react'
import { signOut } from 'next-auth/react'

const SignOutButton = () => {
  return (
    <div>
        <button onClick={() => signOut()} className='bg-red-500 text-white px-4 py-2 rounded'>
            Sign Out
        </button>
    </div>
  )
}

export default SignOutButton