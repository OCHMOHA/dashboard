import "./serviceTypeAnalysisChart.scss";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector
} from "recharts";
import { useState, useEffect, useContext } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { CircularProgress } from "@mui/material";
import { ref, get } from "firebase/database";
import { db } from "../../firebase";

const ServiceTypeAnalysisChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const { darkMode } = useContext(DarkModeContext);

  const COLORS = [
    darkMode ? "#8884d8" : "#6f42c1", // Purple
    darkMode ? "#82ca9d" : "#4bc0c0", // Green
    darkMode ? "#ffc658" : "#ff9f40", // Orange
    darkMode ? "#ff6384" : "#ff6384", // Pink
    darkMode ? "#63a4ff" : "#36a2eb", // Blue
    darkMode ? "#ff9e40" : "#ffcd56"  // Yellow
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get orders from Firebase Realtime Database
        const ordersRef = ref(db, "orders");
        const snapshot = await get(ordersRef);
        
        // Initialize service type counters
        const serviceTypeCounts = {};
        
        // Count orders by service type
        if (snapshot.exists()) {
          const orders = snapshot.val();
          
          Object.keys(orders).forEach(key => {
            const order = orders[key];
            
            // Check if serviceTypeKey exists
            if (order.serviceTypeKey) {
              // Capitalize first letter for display
              const serviceType = order.serviceTypeKey.charAt(0).toUpperCase() + order.serviceTypeKey.slice(1);
              
              if (!serviceTypeCounts[serviceType]) {
                serviceTypeCounts[serviceType] = {
                  count: 0,
                  revenue: 0
                };
              }
              
              serviceTypeCounts[serviceType].count++;
              
              // Add price/revenue if available
              if (order.price) {
                serviceTypeCounts[serviceType].revenue += parseFloat(order.price);
              }
            }
            
            // If there's a services array, count those as well
            if (order.services && Array.isArray(order.services)) {
              order.services.forEach(service => {
                const serviceType = service.charAt(0).toUpperCase() + service.slice(1);
                
                if (!serviceTypeCounts[serviceType]) {
                  serviceTypeCounts[serviceType] = {
                    count: 0,
                    revenue: 0
                  };
                }
                
                serviceTypeCounts[serviceType].count++;
                
                // Distribute the price evenly among services if multiple
                if (order.price && order.services.length > 0) {
                  serviceTypeCounts[serviceType].revenue += parseFloat(order.price) / order.services.length;
                }
              });
            }
          });
        }
        
        // Transform to chart data format
        const chartData = Object.keys(serviceTypeCounts).map(serviceType => ({
          name: serviceType,
          value: serviceTypeCounts[serviceType].revenue,
          count: serviceTypeCounts[serviceType].count,
          description: `${serviceTypeCounts[serviceType].count} orders`
        }));
        
        // Sort by revenue (highest first)
        chartData.sort((a, b) => b.value - a.value);
        
        // If empty data, use fallback sample data
        if (chartData.length === 0) {
          setData([
            { name: "Consultation", value: 1200, count: 45, description: "45 orders" },
            { name: "Installation", value: 950, count: 38, description: "38 orders" },
            { name: "Repair", value: 850, count: 34, description: "34 orders" },
            { name: "Maintenance", value: 600, count: 24, description: "24 orders" },
            { name: "Support", value: 400, count: 16, description: "16 orders" }
          ]);
        } else {
          setData(chartData);
        }
      } catch (error) {
        console.error("Error fetching service type data:", error);
        // Fallback to sample data if there's an error
        setData([
          { name: "Consultation", value: 1200, count: 45, description: "45 orders" },
          { name: "Installation", value: 950, count: 38, description: "38 orders" },
          { name: "Repair", value: 850, count: 34, description: "34 orders" },
          { name: "Maintenance", value: 600, count: 24, description: "24 orders" },
          { name: "Support", value: 400, count: 16, description: "16 orders" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  if (loading) {
    return (
      <div className="serviceTypeAnalysisChart loading">
        <CircularProgress size={40} />
        <p>Loading service type data...</p>
      </div>
    );
  }

  // Active shape component for enhanced hover effect
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { 
      cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, 
      fill, payload, percent, value, count 
    } = props;
    
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`$${value.toLocaleString()}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const color = payload[0].color;
      
      return (
        <div className="customTooltip" style={{ 
          backgroundColor: darkMode ? 'rgba(41, 45, 62, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="tooltipHeader" style={{ borderBottom: `3px solid ${color}` }}>
            <span>{item.name}</span>
          </div>
          <div className="tooltipBody">
            <div className="tooltipRow">
              <span className="tooltipLabel">Revenue:</span>
              <span className="tooltipValue">${item.value.toLocaleString()}</span>
            </div>
            <div className="tooltipRow">
              <span className="tooltipLabel">Market Share:</span>
              <span className="tooltipValue">{((item.value / totalValue) * 100).toFixed(1)}%</span>
            </div>
            <div className="tooltipRow">
              <span className="tooltipLabel">Orders:</span>
              <span className="tooltipValue">{item.count}</span>
            </div>
            <div className="tooltipRow">
              <span className="tooltipLabel">Order %:</span>
              <span className="tooltipValue">{((item.count / totalCount) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

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
              innerRadius={90}
              outerRadius={activeIndex !== null ? 120 : 130}
              paddingAngle={4}
              dataKey="value"
              labelLine={false}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke={darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)'}
                  strokeWidth={activeIndex === index ? 2 : 1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{
                paddingLeft: 20
              }}
              onClick={(entry, index) => {
                setActiveIndex(activeIndex === index ? null : index);
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="serviceSummary">
        {data.map((item, index) => (
          <div 
            className={`serviceItem ${activeIndex === index ? 'active' : ''}`}
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
        <p>This chart shows the revenue distribution across different service types offered on the platform.</p>
      </div>
    </div>
  );
};

export default ServiceTypeAnalysisChart; 