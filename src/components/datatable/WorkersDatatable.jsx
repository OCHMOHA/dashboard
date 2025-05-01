import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { workerColumns } from "../../datatablesource";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

const WorkersDatatable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // Create a query to get only workers (isWorker = true)
    const workersQuery = query(
      collection(firestore, "users"),
      where("isWorker", "==", true)
    );

    // LISTEN (REALTIME)
    const unsub = onSnapshot(
      workersQuery,
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setData(list);
        setLoading(false);
      },
      (error) => {
        console.log(error);
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
      const workerToView = data.find(worker => worker.id === viewUserId);
      
      if (workerToView) {
        // If coming from an order, set a flag to show this context
        if (fromOrderId) {
          setSelectedWorker({
            ...workerToView,
            fromOrderId
          });
        } else {
          setSelectedWorker(workerToView);
        }
        
        setShowDetailModal(true);
        // Clear the localStorage items
        localStorage.removeItem('viewUserId');
        localStorage.removeItem('userType');
        localStorage.removeItem('fromOrderId');
      }
    }
  }, [data]);

  // Fetch reviews when a worker is selected
  useEffect(() => {
    if (selectedWorker) {
      fetchWorkerReviews(selectedWorker.id);
    }
  }, [selectedWorker]);

  const fetchWorkerReviews = async (workerId) => {
    setLoadingReviews(true);
    try {
      // Query reviews where the revieweeId matches the worker's id
      const reviewsQuery = query(
        collection(firestore, "reviews"),
        where("revieweeId", "==", workerId),
        orderBy("createdAt", "desc"),
        limit(5) // Limit to 5 most recent reviews
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsList = [];

      // For each review, fetch the reviewer's information
      for (const reviewDoc of reviewsSnapshot.docs) {
        const reviewData = reviewDoc.data();
        console.log("Review createdAt:", reviewData.createdAt);
        console.log("Review createdAt type:", typeof reviewData.createdAt);
        if (reviewData.createdAt && typeof reviewData.createdAt === 'object') {
          console.log("createdAt properties:", Object.keys(reviewData.createdAt));
          if (reviewData.createdAt.toDate) {
            console.log("Has toDate method");
          }
          if (reviewData.createdAt.seconds) {
            console.log("Has seconds property:", reviewData.createdAt.seconds);
          }
        }
        
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

  const handleViewDetails = (worker) => {
    setSelectedWorker(worker);
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
        columns={workerColumns.concat(actionColumn)}
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

      {showDetailModal && selectedWorker && (
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
            
            <h2>Worker Details</h2>
            
            {selectedWorker.fromOrderId && (
              <div className="contextInfo">
                Viewing worker from Order: {selectedWorker.fromOrderId}
              </div>
            )}

            <div className="detailRow">
              <span className="detailLabel">ID:</span>
              <span className="detailValue">{selectedWorker.id}</span>
            </div>

            <div className="detailRow">
              <span className="detailLabel">Name:</span>
              <span className="detailValue">{`${selectedWorker.firstName || ''} ${selectedWorker.lastName || ''}`.trim()}</span>
            </div>

            <div className="detailRow">
              <span className="detailLabel">Email:</span>
              <span className="detailValue">{selectedWorker.email || "N/A"}</span>
            </div>
            
            <div className="detailRow">
              <span className="detailLabel">Phone:</span>
              <span className="detailValue">{selectedWorker.phoneNumber || "N/A"}</span>
            </div>
            
            <div className="detailRow">
              <span className="detailLabel">Location:</span>
              <span className="detailValue">{selectedWorker.location || "N/A"}</span>
            </div>
            
            <div className="detailRow">
              <span className="detailLabel">Status:</span>
              <span className={`statusBadge ${selectedWorker.isActive ? "active" : "inactive"}`}>
                {selectedWorker.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="detailRow">
              <span className="detailLabel">Service Type:</span>
              <span className="detailValue">{selectedWorker.serviceTypeKey || "N/A"}</span>
            </div>

            <div className="detailRow">
              <span className="detailLabel">Rating:</span>
              <span className="detailValue">
                {selectedWorker.rating ? `${selectedWorker.rating} ★` : "N/A"}
              </span>
            </div>

            <div className="detailRow">
              <span className="detailLabel">Price:</span>
              <span className="detailValue">${selectedWorker.price || 0}</span>
            </div>

            <div className="detailRow">
              <span className="detailLabel">Active Jobs:</span>
              <span className="detailValue">{selectedWorker.activeJobs || 0}</span>
            </div>

            <div className="detailRow">
              <span className="detailLabel">Completed Jobs:</span>
              <span className="detailValue">{selectedWorker.completedJobs || 0}</span>
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
                        <strong> To:</strong> {selectedWorker.firstName} {selectedWorker.lastName}
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

export default WorkersDatatable; 