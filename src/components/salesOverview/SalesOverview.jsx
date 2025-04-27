import "./salesOverview.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useState, useEffect } from "react";

const SalesOverview = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulate data fetching - in a real app, you would fetch from your API
    const generateData = () => {
      const categories = ["Electronics", "Clothing", "Home", "Books", "Beauty"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      
      return months.map(month => {
        const dataPoint = { name: month };
        
        categories.forEach(category => {
          dataPoint[category] = Math.floor(Math.random() * 1000) + 200;
        });
        
        return dataPoint;
      });
    };
    
    setData(generateData());
  }, []);

  return (
    <div className="salesOverview">
      <div className="title">
        <h2>Sales by Category</h2>
        <p>Compare sales across different product categories</p>
      </div>
      <div className="chartWrapper">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`$${value}`, ``]}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                backgroundColor: '#f5f5f5',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            <Bar dataKey="Electronics" fill="#6f42c1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Clothing" fill="#ff6384" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Home" fill="#4bc0c0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Books" fill="#ff9f40" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Beauty" fill="#36a2eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesOverview; 