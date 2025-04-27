import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./home.scss";
import Widget from "../../components/widget/Widget";
import UsersAnalysis from "../../components/usersAnalysis/UsersAnalysis";
import OrderAnalytics from "../../components/orderAnalytics/OrderAnalytics";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const [greeting, setGreeting] = useState("");
  
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
    };
    
    setGreeting(getGreeting());
  }, []);
  
  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        
        <div className="welcomeBanner">
          <div className="welcomeContent">
            <h1>{greeting}, {currentUser?.displayName || 'Admin'}</h1>
            <p>Welcome to your Mihnati dashboard</p>
          </div>
          <div className="welcomeImage"></div>
        </div>
        
        <div className="widgets">
          <Widget type="user" />
          <Widget type="product" />
          <Widget type="order" />
          <Widget type="earning" />
        </div>
        
        <div className="charts">
          <OrderAnalytics />
          <UsersAnalysis />
        </div>
      </div>
    </div>
  );
};

export default Home;
