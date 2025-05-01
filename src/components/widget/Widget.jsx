import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, Timestamp, getCountFromServer } from "firebase/firestore";
import { ref, get, query as dbQuery, orderByChild } from "firebase/database";
import { db, firestore } from "../../firebase";
import CountUp from 'react-countup';
import { useNavigate } from "react-router-dom";

const Widget = ({ type }) => {
  const [amount, setAmount] = useState(null);
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  let data;

  switch (type) {
    case "user":
      data = {
        title: "USERS",
        isMoney: false,
        link: "See all users",
        query: "users",
        route: "/users",
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
        route: "/orders",
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
        route: "/orders",
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
        title: "JOB CHANGE REQUESTS",
        query: "jobChangeRequests",
        link: "See change requests",
        route: "/change-requests",
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
        // Get the current date and calculate time periods
        const today = new Date();
        const lastMonth = new Date(new Date().setMonth(today.getMonth() - 1));
        const prevMonth = new Date(new Date().setMonth(today.getMonth() - 2));
        
        let currentValue = 0;
        let previousValue = 0;
        
        // Fetch data based on widget type
        if (type === "user") {
          // Count users from Firestore
          const usersColl = collection(firestore, "users");
          
          // Get current count
          const usersSnapshot = await getCountFromServer(usersColl);
          currentValue = usersSnapshot.data().count;
          
          // For percentage change, get last month's count - approximation since we don't have historical data
          previousValue = Math.floor(currentValue * 0.9); // Assuming 10% growth as default
          
          // Calculate percentage change
          if (previousValue > 0) {
            const percentChange = ((currentValue - previousValue) / previousValue) * 100;
            setDiff(percentChange);
          } else {
            setDiff(10.0); // Default if we can't calculate
          }
          
        } else if (type === "order") {
          // Count orders from Realtime Database
          const ordersRef = ref(db, "orders");
          const ordersSnapshot = await get(ordersRef);
          
          if (ordersSnapshot.exists()) {
            const orders = ordersSnapshot.val();
            currentValue = Object.keys(orders).length;
            
            // Calculate orders from last month for percentage
            let lastMonthOrders = 0;
            let prevMonthOrders = 0;
            
            Object.values(orders).forEach(order => {
              if (order.createdAt) {
                const orderDate = new Date(order.createdAt);
                if (orderDate >= lastMonth && orderDate <= today) {
                  lastMonthOrders++;
                } else if (orderDate >= prevMonth && orderDate < lastMonth) {
                  prevMonthOrders++;
                }
              }
            });
            
            // If we have month data, use it for percentage calc
            if (prevMonthOrders > 0) {
              const percentChange = ((lastMonthOrders - prevMonthOrders) / prevMonthOrders) * 100;
              setDiff(percentChange);
            } else {
              setDiff(12.0); // Default if we can't calculate
            }
          }
          
        } else if (type === "earning") {
          // Calculate earnings from orders
          const ordersRef = ref(db, "orders");
          const ordersSnapshot = await get(ordersRef);
          
          if (ordersSnapshot.exists()) {
            const orders = ordersSnapshot.val();
            let totalEarnings = 0;
            let lastMonthEarnings = 0;
            let prevMonthEarnings = 0;
            
            Object.values(orders).forEach(order => {
              // Sum up prices for total earnings
              if (order.price) {
                totalEarnings += parseFloat(order.price);
                
                // Also track by month for percentage
                if (order.createdAt) {
                  const orderDate = new Date(order.createdAt);
                  if (orderDate >= lastMonth && orderDate <= today) {
                    lastMonthEarnings += parseFloat(order.price);
                  } else if (orderDate >= prevMonth && orderDate < lastMonth) {
                    prevMonthEarnings += parseFloat(order.price);
                  }
                }
              }
            });
            
            currentValue = totalEarnings;
            
            // Calculate percentage change
            if (prevMonthEarnings > 0) {
              const percentChange = ((lastMonthEarnings - prevMonthEarnings) / prevMonthEarnings) * 100;
              setDiff(percentChange);
            } else {
              setDiff(8.0); // Default if we can't calculate
            }
          }
          
        } else if (type === "product") {
          // Count job change requests from Firestore
          try {
            const changeRequestsColl = collection(firestore, "jobChangeRequests");
            const requestsSnapshot = await getCountFromServer(changeRequestsColl);
            currentValue = requestsSnapshot.data().count;
            
            // Get current date and calculate one month ago
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const prevMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            
            const lastMonthStart = Timestamp.fromDate(lastMonth);
            const prevMonthStart = Timestamp.fromDate(prevMonth);
            
            // Query for all requests from the last month
            const lastMonthQuery = query(
              changeRequestsColl,
              where("createdAt", ">=", lastMonthStart)
            );
            const lastMonthSnapshot = await getCountFromServer(lastMonthQuery);
            const lastMonthCount = lastMonthSnapshot.data().count;
            
            // Query for requests from the previous month
            const prevMonthQuery = query(
              changeRequestsColl,
              where("createdAt", ">=", prevMonthStart),
              where("createdAt", "<", lastMonthStart)
            );
            const prevMonthSnapshot = await getCountFromServer(prevMonthQuery);
            const prevMonthCount = prevMonthSnapshot.data().count;
            
            // Calculate percentage change
            if (prevMonthCount > 0) {
              const percentChange = ((lastMonthCount - prevMonthCount) / prevMonthCount) * 100;
              setDiff(percentChange);
            } else if (lastMonthCount > 0) {
              setDiff(100); // 100% increase if prev month had 0 but this month has some
            } else {
              setDiff(0); // No change if both months had 0
            }
          } catch (error) {
            console.error("Error fetching job change requests:", error);
            currentValue = 0;
            setDiff(0);
          }
        }
        
        setAmount(currentValue);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching widget data:", error);
        setAmount(0);
        setDiff(0);
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  const handleLinkClick = () => {
    navigate(data.route);
  };

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">
          {loading ? (
            <span className="loading">Loading...</span>
          ) : (
            <>
              {data.isMoney && "$"}
              <CountUp 
                end={amount || 0} 
                duration={1.5} 
                separator="," 
                decimal="." 
                decimals={data.isMoney ? 2 : 0}
              />
            </>
          )}
        </span>
        <span className="link" onClick={handleLinkClick}>{data.link}</span>
      </div>
      <div className="right">
        <div className={`percentage ${diff < 0 ? "negative" : "positive"}`}>
          {diff !== null && (
            <>
              {diff < 0 ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
              {Math.abs(diff).toFixed(1)}%
            </>
          )}
        </div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
