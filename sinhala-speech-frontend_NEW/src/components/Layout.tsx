import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-teal-500 top-[-10%] left-[-5%]" />
      <div className="orb w-80 h-80 bg-amber-500 bottom-[10%] right-[5%]" />
      <div className="orb w-64 h-64 bg-purple-600 top-[50%] left-[40%]" />

      <Sidebar />

      <div className="flex-1 flex flex-col ml-0 md:ml-64 relative z-10">
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
