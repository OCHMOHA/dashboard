import "./featured.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useState, useEffect } from "react";

const Featured = () => {
  const [percentageValue, setPercentageValue] = useState(70);
  const [amount, setAmount] = useState(420);
  const [goalAmount, setGoalAmount] = useState(600);

  // Simulate real-time revenue updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Small random fluctuations for demo purposes
      const newAmount = Math.floor(amount + (Math.random() * 20) - 5);
      setAmount(newAmount);
      setPercentageValue(Math.round((newAmount / goalAmount) * 100));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [amount, goalAmount]);

  return (
    <div className="featured">
      <div className="top">
        <h1 className="title">Revenue Overview</h1>
        <MoreVertIcon fontSize="small" />
      </div>
      <div className="bottom">
        <div className="featuredChart">
          <CircularProgressbar 
            value={percentageValue} 
            text={`${percentageValue}%`} 
            strokeWidth={8}
            styles={buildStyles({
              pathColor: percentageValue >= 75 ? '#36B37E' : percentageValue >= 50 ? '#00BFFF' : '#ff9f40',
              textColor: percentageValue >= 75 ? '#36B37E' : percentageValue >= 50 ? '#00BFFF' : '#ff9f40',
              trailColor: '#d6d6d6',
              textSize: '1.5rem',
              pathTransition: 'ease 0.3s'
            })}
          />
        </div>
        <p className="title">Total sales made today</p>
        <p className="amount">${amount}</p>
        <div className="goalInfo">
          <TrendingUpIcon className="trendIcon" />
          <span className="goalText">
            <span className="goalPercent">${goalAmount}</span> daily target
          </span>
        </div>
        <p className="desc">
          Previous transactions processing. Last payments may not be included.
        </p>
        <div className="summary">
          <div className="item">
            <div className="itemTitle">Target</div>
            <div className="itemResult negative">
              <KeyboardArrowDownIcon fontSize="small"/>
              <div className="resultAmount">$12.4k</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Week</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small"/>
              <div className="resultAmount">$12.4k</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Month</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small"/>
              <div className="resultAmount">$12.4k</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
