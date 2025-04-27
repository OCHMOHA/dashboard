import "./productAnalysisChart.scss";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { useState, useEffect } from "react";

const ProductAnalysisChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  const COLORS = ["#6f42c1", "#ff6384", "#4bc0c0", "#ff9f40", "#63a4ff"];

  useEffect(() => {
    // Simulate fetching data - would be replaced with API call
    const fetchData = () => {
      // Sample data for product market share
      const marketShareData = [
        { name: "Product A", value: 400 },
        { name: "Product B", value: 300 },
        { name: "Product C", value: 300 },
        { name: "Product D", value: 200 },
        { name: "Product E", value: 100 },
      ];
      
      setData(marketShareData);
      setLoading(false);
    };

    // Simulate API delay
    setTimeout(fetchData, 800);
  }, []);

  if (loading) {
    return <div className="productAnalysisChart loading">Loading chart data...</div>;
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="productAnalysisChart">
      <div className="title">
        <h2>Product Market Share</h2>
        <p>Distribution across different product categories</p>
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
              formatter={(value) => [`${value} units (${((value / totalValue) * 100).toFixed(1)}%)`, 'Value']}
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
      
      <div className="productSummary">
        {data.map((item, index) => (
          <div 
            className="productItem" 
            key={index}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="productInfo">
              <div className="colorBox" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <div className="name">{item.name}</div>
            </div>
            <div className="stats">
              <div className="value">{item.value}</div>
              <div className="percent">
                {((item.value / totalValue) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="chartInfo">
        <p>This chart shows the market share distribution across different products.</p>
      </div>
    </div>
  );
};

export default ProductAnalysisChart; 