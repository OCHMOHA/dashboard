import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./home.scss";
import Widget from "../../components/widget/Widget";
import UsersAnalysis from "../../components/usersAnalysis/UsersAnalysis";
import OrderAnalytics from "../../components/orderAnalytics/OrderAnalytics";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import workteamImage from "../../images/workteam.jpg";

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  
  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        
        <div className="welcomeBanner">
          <div className="welcomeContent">
            <h1>Good Day, {currentUser?.displayName || 'Admin'}</h1>
            <p>Welcome to your Mihnati dashboard</p>
          </div>
          <div className="welcomeImageContainer">
            <img src={workteamImage} alt="Team collaboration" className="welcomeImage" />
          </div>
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
