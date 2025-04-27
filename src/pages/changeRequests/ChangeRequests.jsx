import { useState, useEffect, useContext } from "react";
import "./changeRequests.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { firestore } from "../../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { DataGrid } from "@mui/x-data-grid";
import { FaCheck, FaTimes, FaEye, FaClock, FaCopy, FaSync } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const ChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [copyFeedback, setCopyFeedback] = useState({ id: null, copied: false });
  const [refreshing, setRefreshing] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [showCopyToast, setShowCopyToast] = useState(false);

  useEffect(() => {
    document.title = "Change Requests | Admin Dashboard";
    fetchChangeRequests();
  }, []);

  useEffect(() => {
    // Filter requests based on active tab
    if (activeTab === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(request => request.status === activeTab));
    }
  }, [activeTab, requests]);

  useEffect(() => {
    // Reset copy feedback after 1 second
    if (copyFeedback.copied) {
      const timer = setTimeout(() => {
        setCopyFeedback({ id: null, copied: false });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [copyFeedback]);

  useEffect(() => {
    // Hide toast after 2 seconds
    if (showCopyToast) {
      const timer = setTimeout(() => {
        setShowCopyToast(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showCopyToast]);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      // Create a query to sort by request date descending
      const requestsQuery = query(
        collection(firestore, "jobChangeRequests"),
        orderBy("requestDate", "desc")
      );
      
      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot(
        requestsQuery, 
        (snapshot) => {
          const requestsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            formattedDate: formatDate(doc.data().requestDate?.toDate())
          }));
          
          setRequests(requestsList);
          setFilteredRequests(activeTab === "all" ? requestsList : requestsList.filter(request => request.status === activeTab));
          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          console.error("Error fetching change requests:", error);
          setLoading(false);
          setRefreshing(false);
        }
      );
      
      // Clean up the listener on unmount
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up change requests listener:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Unknown";
    
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyFeedback({ id, copied: true });
        setCopiedText(text);
        setShowCopyToast(true);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await updateDoc(doc(firestore, "jobChangeRequests", requestId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // The UI will update automatically due to onSnapshot
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await deleteDoc(doc(firestore, "jobChangeRequests", requestId));
        // The UI will update automatically due to onSnapshot
      } catch (error) {
        console.error("Error deleting request:", error);
      }
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const columns = [
    { 
      field: "id", 
      headerName: "Request ID", 
      minWidth: 120, 
      flex: 1,
      renderCell: (params) => (
        <div 
          className={`copyableId ${copyFeedback.id === params.row.id && copyFeedback.copied ? 'copied' : ''}`}
          onClick={() => {
            // Create a combined text with all IDs from this row
            const combinedText = `Request ID: ${params.row.id}\nUser ID: ${params.row.userId}`;
            copyToClipboard(combinedText, params.row.id);
          }}
          title="Click to copy all IDs"
        >
          <span className="requestId">-{params.row.id.substring(0, 16)}...</span>
          <FaCopy className="copyIcon" />
          {copyFeedback.id === params.row.id && copyFeedback.copied && (
            <span className="inlineCopyIndicator">Copied!</span>
          )}
        </div>
      )
    },
    { 
      field: "userId", 
      headerName: "User ID", 
      minWidth: 120, 
      flex: 1,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div 
          className={`copyableId ${copyFeedback.id === `user-${params.row.id}` && copyFeedback.copied ? 'copied' : ''}`}
          onClick={() => {
            copyToClipboard(params.row.userId, `user-${params.row.id}`);
          }}
          title="Click to copy User ID"
        >
          <span className="userId">-{params.row.userId.substring(0, 16)}...</span>
          <FaCopy className="copyIcon" />
          {copyFeedback.id === `user-${params.row.id}` && copyFeedback.copied && (
            <span className="inlineCopyIndicator">Copied!</span>
          )}
        </div>
      )
    },
    { 
      field: "currentServices", 
      headerName: "Services", 
      minWidth: 150,
      flex: 1,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div className="servicesList">
          {params.row.currentServices?.map((service, index) => (
            <span key={index} className="serviceTag">
              {service}
            </span>
          ))}
        </div>
      )
    },
    { 
      field: "requestDate", 
      headerName: "Request Date", 
      minWidth: 180,
      flex: 1,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <span className="dateCell">{params.row.formattedDate}</span>
      )
    },
    { 
      field: "status", 
      headerName: "Status", 
      minWidth: 120,
      flex: 0.5,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div className={`statusCell ${params.row.status}`}>
          {params.row.status === "pending" && <FaClock className="statusIcon" />}
          {params.row.status === "approved" && <FaCheck className="statusIcon" />}
          {params.row.status === "rejected" && <FaTimes className="statusIcon" />}
          {params.row.status}
        </div>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 100,
      flex: 0.5,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <div className="actionButtons">
          <button 
            className="viewButton"
            onClick={() => handleViewDetails(params.row)}
          >
            <FaEye /> View
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="changeRequests">
      <Sidebar />
      <div className="changeRequestsContainer">
        <Navbar />
        
        <div className="content">
          <div className="header">
            <h1>Job Change Requests</h1>
            <button 
              className={`refreshButton ${refreshing ? 'refreshing' : ''}`}
              onClick={fetchChangeRequests}
              disabled={refreshing}
            >
              <FaSync className="refreshIcon" /> Refresh
            </button>
          </div>
          
          <div className="tabsAndTableWrapper">
            <div className="tabContainer">
              <button 
                className={`tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All Requests
              </button>
              <button 
                className={`tab ${activeTab === "pending" ? "active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending
              </button>
              <button 
                className={`tab ${activeTab === "approved" ? "active" : ""}`}
                onClick={() => setActiveTab("approved")}
              >
                Approved
              </button>
              <button 
                className={`tab ${activeTab === "rejected" ? "active" : ""}`}
                onClick={() => setActiveTab("rejected")}
              >
                Rejected
              </button>
            </div>
            
            <div className="tableWrapper">
              <div className="tableHeader">
                <div className="allRequests">
                  {activeTab === "all" ? "All Requests" : 
                    activeTab === "pending" ? "Pending Requests" : 
                    activeTab === "approved" ? "Approved Requests" : 
                    "Rejected Requests"}
                </div>
              </div>
              
              <div className="tableContent">
                <DataGrid
                  rows={filteredRequests}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 50]}
                  checkboxSelection
                  disableSelectionOnClick
                  disableColumnFilter
                  loading={loading}
                  className="dataGrid"
                  getRowClassName={(params) => `row-status-${params.row.status}`}
                  autoHeight
                  sortingMode="server"
                  components={{
                    Pagination: () => null,
                  }}
                  sx={{
                    '& .MuiDataGrid-cell:focus': {
                      outline: 'none',
                    },
                    '& .MuiDataGrid-row.Mui-selected': {
                      backgroundColor: 'transparent',
                    },
                    '& .MuiDataGrid-row:focus': {
                      outline: 'none',
                    },
                    '& .MuiDataGrid-cell.Mui-selected': {
                      backgroundColor: 'transparent',
                      outline: 'none',
                    },
                    '& .MuiDataGrid-columnHeader:focus': {
                      outline: 'none',
                    },
                    '& .MuiDataGrid-columnHeader:focus-within': {
                      outline: 'none',
                    },
                    '& .MuiDataGrid-columnHeader.Mui-focused': {
                      outline: 'none',
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: '600',
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {showDetailModal && selectedRequest && (
          <div className="detailModal">
            <div className="modalContent">
              <button 
                className="closeButton"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
              
              <h2>Request Details</h2>
              
              <div className="detailRow">
                <span className="detailLabel">Request ID:</span>
                <span className="detailValue">{selectedRequest.id}</span>
              </div>
              
              <div className="detailRow">
                <span className="detailLabel">User ID:</span>
                <span className="detailValue">{selectedRequest.userId}</span>
              </div>
              
              <div className="detailRow">
                <span className="detailLabel">Request Date:</span>
                <span className="detailValue">{selectedRequest.formattedDate}</span>
              </div>
              
              <div className="detailRow">
                <span className="detailLabel">Status:</span>
                <span className={`statusBadge ${selectedRequest.status}`}>
                  {selectedRequest.status}
                </span>
              </div>
              
              <div className="detailRow">
                <span className="detailLabel">Services:</span>
                <div className="servicesDetailList">
                  {selectedRequest.currentServices?.map((service, index) => (
                    <span key={index} className="serviceDetailTag">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="detailRow">
                <span className="detailLabel">Description:</span>
                <span className="detailValue description">
                  {selectedRequest.description || "No description provided"}
                </span>
              </div>
              
              <div className="modalActions">
                <button
                  className="deleteButton"
                  onClick={() => {
                    handleDeleteRequest(selectedRequest.id);
                    setShowDetailModal(false);
                  }}
                >
                  Delete
                </button>
                <button
                  className="backButton"
                  onClick={() => setShowDetailModal(false)}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangeRequests; 