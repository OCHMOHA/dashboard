import "./latestOrders.scss";
import { DataGrid } from "@mui/x-data-grid";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { ref, get, query, limitToLast, orderByChild } from "firebase/database";
import { db } from "../../firebase";
import { CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";

const LatestOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestOrders = async () => {
      setLoading(true);
      try {
        // Get the latest 8 orders from the Realtime Database
        const ordersRef = query(
          ref(db, "orders"),
          orderByChild("createdAt"), 
          limitToLast(8)
        );
        
        const snapshot = await get(ordersRef);
        
        if (snapshot.exists()) {
          const ordersData = [];
          const orders = snapshot.val();
          
          // Convert object to array and sort by createdAt
          Object.keys(orders).forEach(key => {
            ordersData.push({
              id: key,
              ...orders[key],
              date: orders[key].createdAt ? new Date(orders[key].createdAt) : new Date(),
            });
          });
          
          // Sort by date (newest first)
          ordersData.sort((a, b) => b.date - a.date);
          
          setOrders(ordersData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching latest orders:", error);
        setLoading(false);
      }
    };
    
    fetchLatestOrders();
  }, []);

  const columns = [
    { field: "id", headerName: "Order ID", width: 100 },
    { 
      field: "clientName",
      headerName: "Customer", 
      width: 160,
      valueGetter: (params) => params.row.clientName || "Unknown"
    },
    { 
      field: "serviceNameKey", 
      headerName: "Service", 
      width: 180,
      valueGetter: (params) => params.row.serviceNameKey || "Unknown" 
    },
    { 
      field: "date", 
      headerName: "Date", 
      width: 120,
      renderCell: (params) => {
        return format(params.row.date, "MMM dd, yyyy");
      }
    },
    { 
      field: "price", 
      headerName: "Amount", 
      width: 120,
      renderCell: (params) => {
        return "$" + (params.row.price || 0).toLocaleString();
      }
    },
    { 
      field: "status", 
      headerName: "Status", 
      width: 120,
      renderCell: (params) => {
        const statusText = params.row.status === "in_progress" 
          ? "Processing" 
          : params.row.status.charAt(0).toUpperCase() + params.row.status.slice(1);
        
        return <div className={`status ${params.row.status?.toLowerCase()}`}>{statusText}</div>;
      }
    },
  ];

  if (loading) {
    return (
      <div className="latestOrders loading">
        <CircularProgress size={40} />
        <p>Loading latest orders...</p>
      </div>
    );
  }

  return (
    <div className="latestOrders">
      <div className="title">
        <h2>Latest Orders</h2>
        <Link to="/orders">View All</Link>
      </div>
      <div className="table">
        <DataGrid
          rows={orders}
          columns={columns}
          pageSize={8}
          rowsPerPageOptions={[8]}
          disableSelectionOnClick
          hideFooterPagination
          autoHeight
          className="dataGrid"
        />
      </div>
    </div>
  );
};

export default LatestOrders; 