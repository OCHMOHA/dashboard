import "./ordersChart.scss";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useState, useEffect } from "react";

const OrdersChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data - would be replaced with API call
    const fetchData = () => {
      // Sample data for yearly orders
      const ordersData = [
        { name: "Jan", Revenue: 4000, Orders: 2400, Target: 4500 },
        { name: "Feb", Revenue: 3000, Orders: 1398, Target: 3500 },
        { name: "Mar", Revenue: 5000, Orders: 3800, Target: 4500 },
        { name: "Apr", Revenue: 2780, Orders: 3908, Target: 4000 },
        { name: "May", Revenue: 1890, Orders: 4800, Target: 3500 },
        { name: "Jun", Revenue: 2390, Orders: 3800, Target: 3000 },
        { name: "Jul", Revenue: 3490, Orders: 4300, Target: 3500 },
        { name: "Aug", Revenue: 4000, Orders: 2400, Target: 4500 },
        { name: "Sep", Revenue: 3000, Orders: 1398, Target: 3500 },
        { name: "Oct", Revenue: 5000, Orders: 3800, Target: 4500 },
        { name: "Nov", Revenue: 2780, Orders: 3908, Target: 4000 },
        { name: "Dec", Revenue: 3890, Orders: 4800, Target: 4300 }
      ];
      
      setData(ordersData);
      setLoading(false);
    };

    // Simulate API delay
    setTimeout(fetchData, 800);
  }, []);

  if (loading) {
    return <div className="ordersChart loading">Loading chart data...</div>;
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.Revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.Orders, 0);
  const averageTarget = data.reduce((sum, item) => sum + item.Target, 0) / data.length;

  return (
    <div className="ordersChart">
      <div className="title">
        <h2>Orders Overview</h2>
        <p>Yearly order volume, revenue, and target goals</p>
      </div>
      
      <div className="statsOverview">
        <div className="statItem">
          <div className="label">Total Revenue</div>
          <div className="value">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="statItem">
          <div className="label">Total Orders</div>
          <div className="value">{totalOrders.toLocaleString()}</div>
        </div>
        <div className="statItem">
          <div className="label">Avg. Monthly Target</div>
          <div className="value">${averageTarget.toLocaleString()}</div>
        </div>
      </div>
      
      <div className="chartContainer">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6f42c1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6f42c1" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6384" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ff6384" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4bc0c0" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4bc0c0" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "var(--bgSoft)", 
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                border: "none"
              }} 
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Revenue"
              stroke="#6f42c1"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="Orders"
              stroke="#ff6384"
              fillOpacity={1}
              fill="url(#colorOrders)"
            />
            <Area
              type="monotone"
              dataKey="Target"
              stroke="#4bc0c0"
              fillOpacity={1}
              fill="url(#colorTarget)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chartInfo">
        <p>This chart shows the yearly order volume, revenue generated, and target goals.</p>
      </div>
    </div>
  );
};

export default OrdersChart; 