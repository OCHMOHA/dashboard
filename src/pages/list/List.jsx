import "./list.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import { useState, useEffect } from "react"
import WorkersDatatable from "../../components/datatable/WorkersDatatable"
import ClientsDatatable from "../../components/datatable/ClientsDatatable"

const List = () => {
  const [activeTab, setActiveTab] = useState("workers");
  
  // Check localStorage on component mount to see if we need to switch tabs
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType) {
      setActiveTab(userType === 'worker' ? 'workers' : 'clients');
      // No need to remove the viewUserId as each datatable component will handle that
    }
  }, []);
  
  return (
    <div className="list">
      <Sidebar/>
      <div className="usersContainer">
        <Navbar/>
        <div className="content">
          <div className="tabs">
            <div 
              className={`tab ${activeTab === "workers" ? "active" : ""}`}
              onClick={() => setActiveTab("workers")}
            >
              Workers
            </div>
            <div 
              className={`tab ${activeTab === "clients" ? "active" : ""}`}
              onClick={() => setActiveTab("clients")}
            >
              Clients
            </div>
          </div>
          
          {activeTab === "workers" ? <WorkersDatatable /> : <ClientsDatatable />}
        </div>
      </div>
    </div>
  )
}

export default List