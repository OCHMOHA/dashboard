import "./list.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import { useState } from "react"
import WorkersDatatable from "../../components/datatable/WorkersDatatable"
import ClientsDatatable from "../../components/datatable/ClientsDatatable"
import { Link } from "react-router-dom"

const List = () => {
  const [activeTab, setActiveTab] = useState("workers");
  
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
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
          
          <div className="header">
            <h1>
              {activeTab === "workers" ? "Workers" : "Clients"}
            </h1>
            <Link to="/users/new" className="createButton">
              Add New User
            </Link>
          </div>
          
          {activeTab === "workers" ? <WorkersDatatable /> : <ClientsDatatable />}
        </div>
      </div>
    </div>
  )
}

export default List