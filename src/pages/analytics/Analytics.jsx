import "./analytics.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import OrderStatusChart from "../../components/orderStatusChart/OrderStatusChart";
import UserActivityChart from "../../components/userActivityChart/UserActivityChart";
import ServiceTypeAnalysisChart from "../../components/serviceTypeAnalysis/ServiceTypeAnalysisChart";
import generateReport from "../../utils/reportGenerator";
import { useState, useRef } from "react";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportMessage, setReportMessage] = useState(null);
  const reportOptionsRef = useRef(null);
  const [showReportOptions, setShowReportOptions] = useState(false);

  const renderActiveChart = () => {
    switch (activeTab) {
      case "users":
        return <UserActivityChart />;
      case "services":
        return <ServiceTypeAnalysisChart />;
      case "orderStatus":
        return <OrderStatusChart />;
      default:
        return <div>No data available</div>;
    }
  };

  const handleGenerateReport = async (reportType) => {
    setIsGeneratingReport(true);
    setReportMessage(null);
    setShowReportOptions(false);
    
    try {
      const fileName = await generateReport(reportType);
      setReportMessage({
        type: "success",
        text: `Report "${fileName}" has been generated and downloaded.`
      });
    } catch (error) {
      console.error("Report generation error:", error);
      setReportMessage({
        type: "error",
        text: `Error generating report: ${error.message}`
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const toggleReportOptions = () => {
    setShowReportOptions(!showReportOptions);
  };

  return (
    <div className="analytics">
      <Sidebar />
      <div className="analyticsContainer">
        <Navbar />
        <div className="titleBar">
          <h1>Analytics Dashboard</h1>
          <p>Visualize your business performance with interactive charts</p>
        </div>
        
        <div className="tabsContainer">
          <div className="tabs">
            <div 
              className={`tab ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              New User Registrations
            </div>
            <div 
              className={`tab ${activeTab === "services" ? "active" : ""}`}
              onClick={() => setActiveTab("services")}
            >
              Service Type Analysis
            </div>
            <div 
              className={`tab ${activeTab === "orderStatus" ? "active" : ""}`}
              onClick={() => setActiveTab("orderStatus")}
            >
              Order Status
            </div>
          </div>
        </div>
        
        <div className="chartsContent">
          {renderActiveChart()}
        </div>
        
        <div className="infoCards">
          <div className="infoCard">
            <div className="infoCardTitle">Data Sources</div>
            <div className="infoCardContent">
              <p>The data presented is based on:</p>
              <ul>
                <li>Order transactions</li>
                <li>User registration data</li>
                <li>Service performance metrics</li>
              </ul>
            </div>
          </div>
          
          <div className="infoCard">
            <div className="infoCardTitle">Custom Reports</div>
            <div className="infoCardContent">
              <p>Need a custom report?</p>
              <div className="reportActions">
                <button 
                  className={`customReportBtn ${isGeneratingReport ? 'loading' : ''}`}
                  onClick={toggleReportOptions}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                </button>
                
                {showReportOptions && !isGeneratingReport && (
                  <div className="reportOptions" ref={reportOptionsRef}>
                    <div className="reportOption" onClick={() => handleGenerateReport("User Activity")}>
                      New User Registrations Report
                    </div>
                    <div className="reportOption" onClick={() => handleGenerateReport("Service Type")}>
                      Service Type Report
                    </div>
                    <div className="reportOption" onClick={() => handleGenerateReport("Order Status")}>
                      Order Status Report
                    </div>
                    <div className="reportOption" onClick={() => handleGenerateReport("Summary")}>
                      Summary Report
                    </div>
                    <div className="reportOption" onClick={() => handleGenerateReport("Full Dashboard")}>
                      Complete Dashboard Report
                    </div>
                  </div>
                )}
              </div>
              
              {reportMessage && (
                <div className={`reportMessage ${reportMessage.type}`}>
                  {reportMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 