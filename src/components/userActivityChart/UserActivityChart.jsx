import "./userActivityChart.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useState, useEffect } from "react";

const UserActivityChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data - would be replaced with API call
    const fetchData = () => {
      // Sample data for weekly user activity
      const activityData = [
        { name: "Mon", Active: 4000, New: 2400 },
        { name: "Tue", Active: 3000, New: 1398 },
        { name: "Wed", Active: 2000, New: 9800 },
        { name: "Thu", Active: 2780, New: 3908 },
        { name: "Fri", Active: 1890, New: 4800 },
        { name: "Sat", Active: 2390, New: 3800 },
        { name: "Sun", Active: 3490, New: 4300 },
      ];
      
      setData(activityData);
      setLoading(false);
    };

    // Simulate API delay
    setTimeout(fetchData, 800);
  }, []);

  if (loading) {
    return <div className="userActivityChart loading">Loading chart data...</div>;
  }

  const totalActive = data.reduce((sum, item) => sum + item.Active, 0);
  const totalNew = data.reduce((sum, item) => sum + item.New, 0);
  const avgDailyActive = Math.round(totalActive / data.length);

  return (
    <div className="userActivityChart">
      <div className="title">
        <h2>User Activity</h2>
        <p>Weekly active users and new user signups</p>
      </div>
      
      <div className="statsOverview">
        <div className="statItem">
          <div className="label">Total Active Users</div>
          <div className="value">{totalActive.toLocaleString()}</div>
        </div>
        <div className="statItem">
          <div className="label">New Signups</div>
          <div className="value">{totalNew.toLocaleString()}</div>
        </div>
        <div className="statItem">
          <div className="label">Avg. Daily Active</div>
          <div className="value">{avgDailyActive.toLocaleString()}</div>
        </div>
      </div>
      
      <div className="chartContainer">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{
                backgroundColor: "var(--bgSoft)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                border: "none"
              }}
            />
            <Legend />
            <Bar 
              dataKey="Active" 
              name="Active Users" 
              fill="#6f42c1" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="New" 
              name="New Users" 
              fill="#ff6384" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chartInfo">
        <p>This chart displays weekly active users and new user signups across the platform.</p>
      </div>
    </div>
  );
};

export default UserActivityChart; 