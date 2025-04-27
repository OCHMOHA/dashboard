import "./usersAnalysis.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { useState, useContext, useMemo } from "react";
import { DarkModeContext } from "../../context/darkModeContext";

// Sample data for user growth and activity
const userData = {
  weekly: [
    { name: "Mon", totalUsers: 2100, activeUsers: 1400 },
    { name: "Tue", totalUsers: 2200, activeUsers: 1500 },
    { name: "Wed", totalUsers: 2300, activeUsers: 1600 },
    { name: "Thu", totalUsers: 2400, activeUsers: 1700 },
    { name: "Fri", totalUsers: 2500, activeUsers: 1800 },
    { name: "Sat", totalUsers: 2300, activeUsers: 1500 },
    { name: "Sun", totalUsers: 2200, activeUsers: 1400 },
  ],
  monthly: [
    { name: "Jan", totalUsers: 2000, activeUsers: 1300 },
    { name: "Feb", totalUsers: 2100, activeUsers: 1400 },
    { name: "Mar", totalUsers: 2300, activeUsers: 1600 },
    { name: "Apr", totalUsers: 2500, activeUsers: 1800 },
    { name: "May", totalUsers: 2700, activeUsers: 2000 },
    { name: "Jun", totalUsers: 3000, activeUsers: 2200 },
    { name: "Jul", totalUsers: 3300, activeUsers: 2400 },
    { name: "Aug", totalUsers: 3500, activeUsers: 2600 },
    { name: "Sep", totalUsers: 3700, activeUsers: 2700 },
    { name: "Oct", totalUsers: 3900, activeUsers: 2800 },
    { name: "Nov", totalUsers: 4100, activeUsers: 2900 },
    { name: "Dec", totalUsers: 4300, activeUsers: 3000 },
  ],
  yearly: [
    { name: "2018", totalUsers: 1500, activeUsers: 1000 },
    { name: "2019", totalUsers: 2000, activeUsers: 1400 },
    { name: "2020", totalUsers: 2800, activeUsers: 2000 },
    { name: "2021", totalUsers: 3500, activeUsers: 2600 },
    { name: "2022", totalUsers: 4000, activeUsers: 3000 },
    { name: "2023", totalUsers: 4300, activeUsers: 3000 },
  ],
};

const UsersAnalysis = () => {
  const [timeRange, setTimeRange] = useState("monthly");
  const { darkMode } = useContext(DarkModeContext);

  const data = userData[timeRange];

  // Calculate statistics
  const totalUsers = data[data.length - 1].totalUsers;
  const activeUsers = data[data.length - 1].activeUsers;
  const retentionRate = ((activeUsers / totalUsers) * 100).toFixed(1);

  // Define theme colors based on dark mode
  const chartColors = useMemo(() => {
    return {
      totalUsersStroke: darkMode ? "#a78bfa" : "#8884d8",
      totalUsersFill: darkMode ? "#a78bfa" : "#8884d8",
      activeUsersStroke: darkMode ? "#4ade80" : "#82ca9d",
      activeUsersFill: darkMode ? "#4ade80" : "#82ca9d",
      axisColor: darkMode ? "#ccc" : "#666",
      backgroundColor: darkMode ? "#1e272e" : "#f0f2f5"
    };
  }, [darkMode]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{label}</p>
          <div className="entry">
            <div
              className="color-indicator"
              style={{ backgroundColor: chartColors.totalUsersStroke }}
            ></div>
            <span className="label">Total Users: </span>
            <span className="value">{payload[0].value.toLocaleString()}</span>
          </div>
          <div className="entry">
            <div
              className="color-indicator"
              style={{ backgroundColor: chartColors.activeUsersStroke }}
            ></div>
            <span className="label">Active Users: </span>
            <span className="value">{payload[1].value.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="usersAnalysis">
      <div className="title">
        <h2>Users Analysis</h2>
        <div className="range">
          <button
            className={timeRange === "weekly" ? "active" : ""}
            onClick={() => setTimeRange("weekly")}
          >
            Weekly
          </button>
          <button
            className={timeRange === "monthly" ? "active" : ""}
            onClick={() => setTimeRange("monthly")}
          >
            Monthly
          </button>
          <button
            className={timeRange === "yearly" ? "active" : ""}
            onClick={() => setTimeRange("yearly")}
          >
            Yearly
          </button>
        </div>
      </div>
      <div className="chartInfo">
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="totalUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.totalUsersFill} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartColors.totalUsersFill} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="activeUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.activeUsersFill} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartColors.activeUsersFill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                stroke={chartColors.axisColor}
                tick={{ fill: chartColors.axisColor }}
              />
              <YAxis 
                stroke={chartColors.axisColor} 
                tick={{ fill: chartColors.axisColor }}
              />
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="totalUsers"
                stroke={chartColors.totalUsersStroke}
                fillOpacity={1}
                fill="url(#totalUsers)"
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke={chartColors.activeUsersStroke}
                fillOpacity={1}
                fill="url(#activeUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="stats">
          <div className="item">
            <span className="itemTitle">Total Users</span>
            <span className="itemValue">{totalUsers.toLocaleString()}</span>
            <span className="itemPercentage positive">+15.3%</span>
            <span className="itemDesc">Compared to last year</span>
          </div>
          <div className="item">
            <span className="itemTitle">Active Users</span>
            <span className="itemValue">{activeUsers.toLocaleString()}</span>
            <span className="itemPercentage positive">+12.8%</span>
            <span className="itemDesc">Compared to last year</span>
          </div>
          <div className="item">
            <span className="itemTitle">User Retention</span>
            <span className="itemValue">{retentionRate}%</span>
            <span className="itemPercentage negative">-2.4%</span>
            <span className="itemDesc">Compared to last year</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersAnalysis; 