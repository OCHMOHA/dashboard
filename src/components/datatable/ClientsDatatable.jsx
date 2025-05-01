import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { clientColumns } from "../../datatablesource";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import { FaEye, FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const ClientsDatatable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    
    // Create a query to get only clients (isWorker = false)
    const clientsQuery = query(
      collection(firestore, "users"),
      where("isWorker", "==", false)
    );

    // LISTEN (REALTIME) - using the same approach as in WorkersDatatable
    const unsub = onSnapshot(
      clientsQuery,
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setData(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching clients:", error);
        setLoading(false);
      }
    );

    return () => {
      unsub();
    };
  }, []);
  
  // Check for viewUserId in localStorage when the component mounts or when data changes
  useEffect(() => {
    const viewUserId = localStorage.getItem('viewUserId');
    const fromOrderId = localStorage.getItem('fromOrderId');
    
    if (viewUserId && data.length > 0) {
      const clientToView = data.find(client => client.id === viewUserId);
      
      if (clientToView) {
        // If coming from an order, set a flag to show this context
        if (fromOrderId) {
          setSelectedClient({
            ...clientToView,
            fromOrderId
          });
        } else {
          setSelectedClient(clientToView);
        }
        
        setShowDetailModal(true);
        // Clear the localStorage items
        localStorage.removeItem('viewUserId');
        localStorage.removeItem('userType');
        localStorage.removeItem('fromOrderId');
      }
    }
  }, [data]);

  // Fetch reviews when a client is selected
  useEffect(() => {
    if (selectedClient) {
      fetchClientReviews(selectedClient.id);
    }
  }, [selectedClient]);

  const fetchClientReviews = async (clientId) => {
    setLoadingReviews(true);
    try {
      // Query reviews where the revieweeId matches the client's id
      const reviewsQuery = query(
        collection(firestore, "reviews"),
        where("revieweeId", "==", clientId),
        orderBy("createdAt", "desc"),
        limit(5) // Limit to 5 most recent reviews
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsList = [];

      // For each review, fetch the reviewer's information
      for (const reviewDoc of reviewsSnapshot.docs) {
        const reviewData = reviewDoc.data();
        let reviewerData = { firstName: "Anonymous", lastName: "User" };

        try {
          // Get reviewer info if not anonymous
          if (reviewData.reviewerId && !reviewData.isAnonymous) {
            // First try to find the user in our existing data
            const existingUser = data.find(u => u.id === reviewData.reviewerId);
            
            if (existingUser) {
              reviewerData = existingUser;
            } else {
              // If not found locally, fetch from firestore
              const userDoc = await getDocs(
                query(
                  collection(firestore, "users"),
                  where("id", "==", reviewData.reviewerId)
                )
              );
              
              if (!userDoc.empty) {
                reviewerData = userDoc.docs[0].data();
              }
            }
          }

          reviewsList.push({
            id: reviewDoc.id,
            ...reviewData,
            reviewerName: reviewData.isAnonymous 
              ? "Anonymous User" 
              : `${reviewerData.firstName || ''} ${reviewerData.lastName || ''}`.trim(),
            reviewDate: reviewData.createdAt && reviewData.createdAt.toDate 
              ? reviewData.createdAt.toDate().toLocaleDateString() 
              : reviewData.createdAt && typeof reviewData.createdAt === 'object' && reviewData.createdAt.seconds
              ? new Date(reviewData.createdAt.seconds * 1000).toLocaleDateString()
              : reviewData.createdAt 
              ? new Date(reviewData.createdAt).toLocaleDateString() 
              : "Unknown date"
          });
        } catch (error) {
          console.error("Error fetching reviewer data:", error);
        }
      }

      setReviews(reviewsList);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowDetailModal(false);
    }
  };

  const handleOrderClick = (orderId) => {
    setShowDetailModal(false); // Close the modal
    // Store the orderId in localStorage so Orders component can find and view it
    localStorage.setItem('viewOrderId', orderId);
    navigate('/orders'); // Navigate to orders page
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Actions",
      minWidth: 120,
      flex: 0.5,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <div className="actionButtons">
            <button 
              className="viewButton"
              onClick={() => handleViewDetails(params.row)}
            >
              <FaEye /> View
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatable">
      <DataGrid
        className="datagrid"
        rows={data}
        columns={clientColumns.concat(actionColumn)}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        checkboxSelection
        disableSelectionOnClick
        disableColumnFilter
        disableColumnMenu
        loading={loading}
        autoHeight
        sortingMode="server"
        disableColumnSortingModel
        components={{
          Pagination: () => null,
        }}
        getRowClassName={(params) => 
          params.row.status ? `row-status-${params.row.status}` : ''
        }
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
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: '600',
          }
        }}
      />

      {showDetailModal && selectedClient && (
        <div className="detailModal" onClick={handleModalClick}>
          <div className="modalContent">
            <button 
              className="closeButton"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailModal(false);
              }}
            >
              ×
            </button>
            
            <h2>Client Details</h2>
            
            {selectedClient.fromOrderId && (
              <div className="contextInfo">
                Viewing client from Order: {selectedClient.fromOrderId}
              </div>
            )}

            <div className="detailRow">
              <span className="detailLabel">ID:</span>
              <span className="detailValue">{selectedClient.id}</span>
            </div>

            <div className="detailRow">
              <span className="detailLabel">Name:</span>
              <span className="detailValue">{`${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim()}</span>
            </div>

            <div className="detailRow">
              <span className="detailLabel">Email:</span>
              <span className="detailValue">{selectedClient.email || "N/A"}</span>
            </div>
            
            <div className="detailRow">
              <span className="detailLabel">Phone:</span>
              <span className="detailValue">{selectedClient.phoneNumber || "N/A"}</span>
            </div>
            
            <div className="detailRow">
              <span className="detailLabel">Location:</span>
              <span className="detailValue">{selectedClient.location || "N/A"}</span>
            </div>
            
            <div className="detailRow">
              <span className="detailLabel">Status:</span>
              <span className={`statusBadge ${selectedClient.isActive ? "active" : "inactive"}`}>
                {selectedClient.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="detailRow">
              <span className="detailLabel">Joined Date:</span>
              <span className="detailValue">
                {selectedClient.joinedDate ? new Date(selectedClient.joinedDate).toLocaleDateString() : "N/A"}
              </span>
            </div>

            <div className="detailRow">
              <span className="detailLabel">Created At:</span>
              <span className="detailValue">
                {selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>

            <h3 className="sectionTitle">Reviews</h3>
            <div className="reviewsSection">
              {loadingReviews ? (
                <div className="loadingReviews">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="reviewItem">
                    <div className="reviewHeader">
                      <div className="reviewerName">{review.reviewerName}</div>
                      <div className="reviewFeedback">
                        {review.isPositive ? (
                          <span className="positiveReview">
                            <FaThumbsUp /> Positive
                          </span>
                        ) : (
                          <span className="negativeReview">
                            <FaThumbsDown /> Negative
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="reviewMetadata">
                      <span className="reviewDate">
                        <strong>Date:</strong> {review.reviewDate}
                      </span>
                      <span className="reviewParticipants">
                        <strong>From:</strong> {review.reviewerName} 
                        <strong> To:</strong> {selectedClient.firstName} {selectedClient.lastName}
                      </span>
                    </div>
                    
                    {review.tags && review.tags.length > 0 && (
                      <div className="reviewTags">
                        {review.tags.map((tag, idx) => (
                          <span key={idx} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    {review.comment && (
                      <div className="reviewComment">{review.comment}</div>
                    )}
                    
                    {review.orderId && (
                      <div 
                        className="reviewOrderId"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(review.orderId);
                        }}
                      >
                        Order: {review.orderId}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="noReviews">No reviews available.</div>
              )}
            </div>

            <div className="modalActions">
              <button
                className="backButton"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailModal(false);
                }}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsDatatable; 