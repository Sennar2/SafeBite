import React from 'react'
import logo from '../assets/safebites-logo.png' // Adjust path as needed

export default function AppHeader() {
  return (
    <header className="bg-white shadow p-4 flex justify-center items-center">
      <img src={logo} alt="SafeBite Logo" className="h-10" />
    </header>
  )
}
