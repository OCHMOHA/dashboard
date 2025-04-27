import "./serviceTypeAnalysisChart.scss";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { useState, useEffect } from "react";

const ServiceTypeAnalysisChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  const COLORS = ["#6f42c1", "#ff6384", "#4bc0c0", "#ff9f40", "#63a4ff"];

  useEffect(() => {
    // Simulate fetching data - would be replaced with API call
    const fetchData = () => {
      // Sample data for service type distribution
      const serviceData = [
        { name: "Consulting", value: 450 },
        { name: "Development", value: 380 },
        { name: "Maintenance", value: 320 },
        { name: "Training", value: 180 },
        { name: "Support", value: 250 },
      ];
      
      setData(serviceData);
      setLoading(false);
    };

    // Simulate API delay
    setTimeout(fetchData, 800);
  }, []);

  if (loading) {
    return <div className="serviceTypeAnalysisChart loading">Loading chart data...</div>;
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="serviceTypeAnalysisChart">
      <div className="title">
        <h2>Service Type Analysis</h2>
        <p>Distribution of revenue across different service categories</p>
      </div>
      
      <div className="chartContainer">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={100}
              outerRadius={140}
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke={index === activeIndex ? "#fff" : "transparent"}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`$${value.toLocaleString()} (${((value / totalValue) * 100).toFixed(1)}%)`, 'Revenue']}
              contentStyle={{
                backgroundColor: "var(--bgSoft)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                border: "none"
              }}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{
                paddingLeft: 20
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="serviceSummary">
        {data.map((item, index) => (
          <div 
            className="serviceItem" 
            key={index}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="serviceInfo">
              <div className="colorBox" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <div className="name">{item.name}</div>
            </div>
            <div className="stats">
              <div className="value">${item.value.toLocaleString()}</div>
              <div className="percent">
                {((item.value / totalValue) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="chartInfo">
        <p>This chart shows the revenue distribution across different service types offered.</p>
      </div>
    </div>
  );
};

export default ServiceTypeAnalysisChart; 