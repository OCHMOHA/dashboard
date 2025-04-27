import "./orderAnalytics.scss";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import { useState, useEffect, useContext } from "react";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';
import { DarkModeContext } from "../../context/darkModeContext";
import { ref, get } from "firebase/database";
import { db } from "../../firebase";
import { CircularProgress } from "@mui/material";

const OrderAnalytics = () => {
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useContext(DarkModeContext);
  
  // Define order statuses with colors and icons
  const ORDER_STATUSES = [
    { 
      name: 'Completed', 
      dbKey: 'completed',
      color: darkMode ? '#4ade80' : '#36B37E', 
      icon: <CheckCircleOutlineIcon className="statusIcon" /> 
    },
    { 
      name: 'Processing', 
      dbKey: 'in_progress',
      color: darkMode ? '#59a5e8' : '#00BFFF', 
      icon: <HourglassEmptyIcon className="statusIcon" />
    },
    { 
      name: 'Pending', 
      dbKey: 'pending',
      color: darkMode ? '#f59e0b' : '#FFAB00', 
      icon: <PendingActionsIcon className="statusIcon" />
    },
    { 
      name: 'Cancelled', 
      dbKey: 'cancelled',
      color: darkMode ? '#ef4444' : '#FF5630', 
      icon: <CancelIcon className="statusIcon" />
    }
  ];
  
  const COLORS = ORDER_STATUSES.map(status => status.color);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Get orders from Firebase Realtime Database
        const ordersRef = ref(db, "orders");
        const snapshot = await get(ordersRef);
        
        // Initialize counters for each status
        const statusCounts = {
          completed: 0,
          in_progress: 0,
          pending: 0,
          cancelled: 0
        };
        
        // Count orders by status
        if (snapshot.exists()) {
          const orders = snapshot.val();
          
          Object.keys(orders).forEach(key => {
            const order = orders[key];
            if (order.status) {
              const status = order.status.toLowerCase();
              if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
              }
            }
          });
        }
        
        // Transform to chart data format
        const chartData = ORDER_STATUSES.map(status => ({
          name: status.name,
          value: statusCounts[status.dbKey] || 0
        }));
        
        setData(chartData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order analytics data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const totalOrders = data.reduce((sum, item) => sum + item.value, 0);
  
  const getStatusInfo = (statusName) => {
    return ORDER_STATUSES.find(status => status.name === statusName);
  };

  if (loading) {
    return (
      <div className="orderAnalytics loading">
        <CircularProgress size={40} />
        <p>Loading order analytics data...</p>
      </div>
    );
  }

  return (
    <div className="orderAnalytics">
      <div className="title">
        <h2>Order Status Distribution</h2>
        <p>Overview of all orders by current status ({totalOrders} total orders)</p>
      </div>
      
      <div className="chartContainer">
        <div className="pieChartWrapper">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                activeIndex={activeIndex}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke={darkMode ? "#1e272e" : "#fff"}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  `${value} orders (${((value / totalOrders) * 100).toFixed(1)}%)`,
                  ``
                ]}
                contentStyle={{
                  backgroundColor: darkMode ? '#293845' : '#fff',
                  color: darkMode ? '#f8f9fa' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                  padding: '10px 14px',
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                layout="horizontal"
                align="center"
                formatter={(value, entry, index) => (
                  <span style={{ color: COLORS[index % COLORS.length], fontWeight: 500 }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="statsContainer">
          {data.map((item, index) => {
            const statusInfo = getStatusInfo(item.name);
            return (
              <div 
                className="statItem" 
                key={index}
                style={{
                  borderLeft: `4px solid ${statusInfo.color}`
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="statHeader">
                  <div className={item.name.toLowerCase()}>
                    {statusInfo.icon}
                  </div>
                  <div className="statLabel">{item.name}</div>
                </div>
                <div className="statValue">{item.value}</div>
                <div className="statPercent">
                  {totalOrders > 0 ? ((item.value / totalOrders) * 100).toFixed(1) : 0}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderAnalytics; 