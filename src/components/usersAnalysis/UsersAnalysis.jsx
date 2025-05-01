import "./usersAnalysis.scss";
import { useState, useContext, useEffect } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase";
import { FaUsers, FaUserTie, FaUserCheck } from "react-icons/fa";

const UsersAnalysis = () => {
  const { darkMode } = useContext(DarkModeContext);
  const [clientsCount, setClientsCount] = useState(0);
  const [workersCount, setWorkersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Fetch real client and worker counts
  useEffect(() => {
    const fetchUserCounts = async () => {
      setLoading(true);
      try {
        // Create a query to get clients (isWorker = false)
        const clientsQuery = query(
          collection(firestore, "users"),
          where("isWorker", "==", false)
        );
        
        // Create a query to get workers (isWorker = true)
        const workersQuery = query(
          collection(firestore, "users"),
          where("isWorker", "==", true)
        );

        // Execute both queries
        const [clientsSnapshot, workersSnapshot] = await Promise.all([
          getDocs(clientsQuery),
          getDocs(workersQuery)
        ]);
        
        // Set the counts
        setClientsCount(clientsSnapshot.size);
        setWorkersCount(workersSnapshot.size);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user counts:", error);
        setLoading(false);
      }
    };

    fetchUserCounts();
  }, []);

  // Calculate statistics
  const totalUsers = clientsCount + workersCount;
  const activeUsers = clientsCount;
  const retentionRate = ((activeUsers / totalUsers) * 100).toFixed(1);
  const clientWorkerRatio = workersCount > 0 ? (clientsCount / workersCount).toFixed(1) : "N/A";

  return (
    <div className="usersAnalysis">
      <div className="title">
        <h2>Workforce Analysis</h2>
      </div>
      <div className="statsCards">
        <div className="widget">
          <div className="left">
            <span className="title">Total Clients</span>
            <span className="counter">{loading ? "Loading..." : clientsCount}</span>
            <span className="link">
              <span className="percentage positive">+15.3%</span>
              <span className="text">Compared to last year</span>
            </span>
          </div>
          <div className="right">
            <div className="percentage positive">
              <FaUsers />
            </div>
          </div>
        </div>
        
        <div className="widget">
          <div className="left">
            <span className="title">Total Workers</span>
            <span className="counter">{loading ? "Loading..." : workersCount}</span>
            <span className="link">
              <span className="percentage positive">+12.8%</span>
              <span className="text">Compared to last year</span>
            </span>
          </div>
          <div className="right">
            <div className="percentage positive">
              <FaUserTie />
            </div>
          </div>
        </div>
        
        <div className="widget">
          <div className="left">
            <span className="title">Client to Worker Ratio</span>
            <span className="counter">{clientWorkerRatio}:1</span>
            <span className="link">
              <span className="percentage positive">+5.2%</span>
              <span className="text">Compared to last year</span>
            </span>
          </div>
          <div className="right">
            <div className="percentage positive">
              <FaUserCheck />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersAnalysis; 