import "./orders.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState } from "react";
import OrdersDatatable from "../../components/datatable/OrdersDatatable";
import { Link } from "react-router-dom";

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  
  return (
    <div className="orders">
      <Sidebar />
      <div className="ordersContainer">
        <Navbar />
        <div className="content">
          <div className="tabs">
            <div 
              className={`tab ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All Orders
            </div>
            <div 
              className={`tab ${statusFilter === "completed" ? "active" : ""}`}
              onClick={() => setStatusFilter("completed")}
            >
              Completed
            </div>
            <div 
              className={`tab ${statusFilter === "in_progress" ? "active" : ""}`}
              onClick={() => setStatusFilter("in_progress")}
            >
              In Progress
            </div>
            <div 
              className={`tab ${statusFilter === "pending" ? "active" : ""}`}
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </div>
            <div 
              className={`tab ${statusFilter === "cancelled" ? "active" : ""}`}
              onClick={() => setStatusFilter("cancelled")}
            >
              Cancelled
            </div>
          </div>
          
          <OrdersDatatable statusFilter={statusFilter} />
        </div>
      </div>
    </div>
  );
};

export default Orders; 