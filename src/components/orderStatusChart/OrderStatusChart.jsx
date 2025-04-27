import "./orderStatusChart.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";
import { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { ref, get } from "firebase/database";
import { db } from "../../firebase";

// Define order status colors
const statusColors = {
  completed: "#36B37E",
  in_progress: "#00BFFF",
  pending: "#FFAB00",
  cancelled: "#FF5630"
};

// Map database status values to display labels
const statusLabels = {
  completed: "Completed",
  in_progress: "Processing",
  pending: "Pending",
  cancelled: "Cancelled"
};

export const OrderStatusChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({
    completed: 0,
    in_progress: 0,
    pending: 0,
    cancelled: 0,
    total: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Get the current date
        const now = new Date();
        // Calculate date 6 months ago
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        // Get all orders from the Realtime Database
        const ordersRef = ref(db, "orders");
        const snapshot = await get(ordersRef);
        
        // Process orders into monthly data
        const months = [];
        for (let i = 0; i < 6; i++) {
          const month = new Date();
          month.setMonth(now.getMonth() - i);
          months.unshift(month.toLocaleString('default', { month: 'long' }));
        }
        
        // Initialize monthly data structure
        const monthlyData = months.map(month => ({
          month,
          completed: 0,
          in_progress: 0,
          pending: 0,
          cancelled: 0,
        }));
        
        // Calculate totals
        const newTotals = {
          completed: 0,
          in_progress: 0,
          pending: 0,
          cancelled: 0,
          total: 0
        };
        
        // Process each order
        if (snapshot.exists()) {
          const orders = snapshot.val();
          
          Object.keys(orders).forEach(key => {
            const order = orders[key];
            
            // Skip orders older than 6 months
            if (order.createdAt) {
              const orderDate = new Date(order.createdAt);
              if (orderDate < sixMonthsAgo) return;
              
              // Get the month name
              const monthName = orderDate.toLocaleString('default', { month: 'long' });
              
              // Find the corresponding month in our data
              const monthIndex = months.indexOf(monthName);
              if (monthIndex !== -1 && order.status) {
                // Normalize status to match our keys
                const status = order.status.toLowerCase();
                
                // Only count statuses we're tracking
                if (['completed', 'in_progress', 'pending', 'cancelled'].includes(status)) {
                  // Increment the monthly count
                  monthlyData[monthIndex][status]++;
                  
                  // Increment the total
                  newTotals[status]++;
                  newTotals.total++;
                }
              }
            }
          });
        }
        
        // Transform data for the chart (use display names for the chart)
        const transformedData = monthlyData.map(item => ({
          month: item.month,
          Completed: item.completed,
          Processing: item.in_progress,
          Pending: item.pending,
          Cancelled: item.cancelled,
        }));
        
        setData(transformedData);
        setTotals(newTotals);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order status data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="orderStatusChart loading">
        <CircularProgress size={40} />
        <p>Loading order status data...</p>
      </div>
    );
  }

  const formatPercent = (value) => {
    return `${Math.round((value / totals.total) * 100)}%`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: 'var(--bg)', padding: '10px', border: '1px solid var(--border)', borderRadius: '5px' }}>
          <p className="label" style={{ margin: '0', fontWeight: 'bold' }}>{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ margin: '5px 0', color: entry.color }}>
              {`${entry.name}: ${entry.value} orders`}
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="orderStatusChart">
      <div className="title">
        <h2>Order Status Overview</h2>
        <p>Distribution of order statuses over the last 6 months</p>
      </div>

      <div className="statsOverview">
        <div className="statItem completed">
          <div className="label">Completed</div>
          <div className="value">{totals.completed}</div>
          <div className="percent">{formatPercent(totals.completed)}</div>
        </div>
        <div className="statItem processing">
          <div className="label">Processing</div>
          <div className="value">{totals.in_progress}</div>
          <div className="percent">{formatPercent(totals.in_progress)}</div>
        </div>
        <div className="statItem pending">
          <div className="label">Pending</div>
          <div className="value">{totals.pending}</div>
          <div className="percent">{formatPercent(totals.pending)}</div>
        </div>
        <div className="statItem cancelled">
          <div className="label">Cancelled</div>
          <div className="value">{totals.cancelled}</div>
          <div className="percent">{formatPercent(totals.cancelled)}</div>
        </div>
      </div>

      <div className="chartContainer">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Completed" name="Completed" fill={statusColors.completed} />
            <Bar dataKey="Processing" name="Processing" fill={statusColors.in_progress} />
            <Bar dataKey="Pending" name="Pending" fill={statusColors.pending} />
            <Bar dataKey="Cancelled" name="Cancelled" fill={statusColors.cancelled} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chartInfo">
        <p>Data is from Firebase Realtime Database. Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default OrderStatusChart; 