import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import CountUp from 'react-countup';

const Widget = ({ type }) => {
  const [amount, setAmount] = useState(null);
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(true);
  let data;

  switch (type) {
    case "user":
      data = {
        title: "USERS",
        isMoney: false,
        link: "See all users",
        query:"users",
        icon: (
          <PersonOutlinedIcon
            className="icon"
            style={{
              color: "#6f42c1",
              backgroundColor: "rgba(111, 66, 193, 0.2)",
            }}
          />
        ),
      };
      break;
    case "order":
      data = {
        title: "ORDERS",
        isMoney: false,
        link: "View all orders",
        icon: (
          <ShoppingCartOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              color: "#ff6384",
            }}
          />
        ),
      };
      break;
    case "earning":
      data = {
        title: "EARNINGS",
        isMoney: true,
        link: "View net earnings",
        icon: (
          <MonetizationOnOutlinedIcon
            className="icon"
            style={{ backgroundColor: "rgba(75, 192, 192, 0.2)", color: "#4bc0c0" }}
          />
        ),
      };
      break;
    case "product":
      data = {
        title: "CHANGE REQUESTS",
        query: "change-requests",
        link: "See details",
        icon: (
          <ChangeCircleIcon
            className="icon"
            style={{
              backgroundColor: "rgba(255, 159, 64, 0.2)",
              color: "#ff9f40",
            }}
          />
        ),
      };
      break;
    default:
      break;
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const lastMonth = new Date(new Date().setMonth(today.getMonth() - 1));
        const prevMonth = new Date(new Date().setMonth(today.getMonth() - 2));

        const lastMonthQuery = query(
          collection(db, data.query),
          where("timeStamp", "<=", today),
          where("timeStamp", ">", lastMonth)
        );
        const prevMonthQuery = query(
          collection(db, data.query),
          where("timeStamp", "<=", lastMonth),
          where("timeStamp", ">", prevMonth)
        );

        const lastMonthData = await getDocs(lastMonthQuery);
        const prevMonthData = await getDocs(prevMonthQuery);

        setAmount(lastMonthData.docs.length);
        setDiff(
          ((lastMonthData.docs.length - prevMonthData.docs.length) / prevMonthData.docs.length) *
            100
        );
      } catch (error) {
        console.error("Error fetching widget data:", error);
        setAmount(0);
        setDiff(0);
      } finally {
        setLoading(false);
      }
    };
    
    if (data.query) {
      fetchData();
    } else {
      // Demo data for widgets without a query
      const demoValues = {
        order: { amount: 72, diff: 12 },
        earning: { amount: 1850, diff: 8 }
      };
      
      setTimeout(() => {
        if (demoValues[type]) {
          setAmount(demoValues[type].amount);
          setDiff(demoValues[type].diff);
        } else {
          setAmount(0);
          setDiff(0);
        }
        setLoading(false);
      }, 1000);
    }
  }, [type, data.query]);

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">
          {data.isMoney && "$"} 
          {loading ? (
            <span className="loading">Loading...</span>
          ) : (
            <CountUp 
              end={amount || 0} 
              duration={2} 
              separator="," 
              decimals={data.isMoney ? 0 : 0}
            />
          )}
        </span>
        <span className="link">{data.link}</span>
      </div>
      <div className="right">
        <div className={`percentage ${diff < 0 ? "negative" : "positive"}`}>
          {diff < 0 ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/> }
          {loading ? '' : Math.abs(diff || 0).toFixed(1)} %
        </div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
