import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { orderColumns } from "../../orderdatatablesource";
import { useEffect, useState } from "react";
import { ref, onValue, get, remove, query as dbQuery, orderByChild, equalTo } from "firebase/database";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db, firestore } from "../../firebase";
import { FaEye, FaVideo, FaMicrophone, FaTimes, FaUser, FaChevronLeft, FaChevronRight, FaExpandAlt, FaCompress } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OrdersDatatable = ({ statusFilter }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImagesView, setShowImagesView] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      
      try {
        let ordersRef;
        
        if (statusFilter === "all") {
          ordersRef = ref(db, "orders");
        } else {
          ordersRef = dbQuery(
            ref(db, "orders"),
            orderByChild("status"),
            equalTo(statusFilter)
          );
        }

        const unsubscribe = onValue(ordersRef, async (snapshot) => {
          const ordersData = [];

          if (snapshot.exists()) {
            const orders = snapshot.val();
            
            for (const orderId in orders) {
              const orderData = orders[orderId];
              
              let clientData = null;
              let workerData = null;
              
              try {
                // Try to get client data from Firestore
                if (orderData.clientId) {
                  try {
                    const clientDocRef = doc(firestore, "users", orderData.clientId);
                    const clientDocSnapshot = await getDoc(clientDocRef);
                    
                    if (clientDocSnapshot.exists()) {
                      clientData = clientDocSnapshot.data();
                      console.log("Found client in Firestore:", clientData);
                    } else {
                      // Fallback to Realtime Database
                      const clientRef = ref(db, `users/${orderData.clientId}`);
                      const clientSnapshot = await get(clientRef);
                      
                      if (clientSnapshot.exists()) {
                        clientData = clientSnapshot.val();
                        console.log("Found client in RTDB:", clientData);
                      }
                    }
                  } catch (error) {
                    console.error("Error fetching client data:", error);
                  }
                }
                
                // Try to get worker data from Firestore
                if (orderData.workerId) {
                  try {
                    const workerDocRef = doc(firestore, "users", orderData.workerId);
                    const workerDocSnapshot = await getDoc(workerDocRef);
                    
                    if (workerDocSnapshot.exists()) {
                      workerData = workerDocSnapshot.data();
                      console.log("Found worker in Firestore:", workerData);
                    } else {
                      // Fallback to Realtime Database
                      const workerRef = ref(db, `users/${orderData.workerId}`);
                      const workerSnapshot = await get(workerRef);
                      
                      if (workerSnapshot.exists()) {
                        workerData = workerSnapshot.val();
                        console.log("Found worker in RTDB:", workerData);
                      }
                    }
                  } catch (error) {
                    console.error("Error fetching worker data:", error);
                  }
                }
              } catch (error) {
                console.error("Error fetching user data:", error);
              }
              
              ordersData.push({
                id: orderId,
                ...orderData,
                clientData,
                workerData,
                clientName: clientData ? `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() : "Unknown",
                clientImg: clientData?.img || null,
                workerName: workerData ? `${workerData.firstName || ''} ${workerData.lastName || ''}`.trim() : "Not Assigned",
                workerImg: workerData?.img || null,
              });
            }
          }
          
          setData(ordersData);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up orders query:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  // Check for the viewOrderId in localStorage when the component mounts
  useEffect(() => {
    const viewOrderId = localStorage.getItem('viewOrderId');
    
    if (viewOrderId && data.length > 0) {
      const orderToView = data.find(order => order.id === viewOrderId);
      
      if (orderToView) {
        handleViewDetails(orderToView);
        // Clear the localStorage item to prevent showing the same order on page refresh
        localStorage.removeItem('viewOrderId');
      }
    }
  }, [data]); // Run this effect whenever the data changes

  const handleDelete = async (id) => {
    try {
      const orderRef = ref(db, `orders/${id}`);
      await remove(orderRef);
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
    setShowImagesView(false);
    setCurrentImageIndex(0);
    setIsFullscreen(false);
  };

  const handleViewVideo = (videoUrl) => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  const handlePlayVoiceMessage = (audioUrl) => {
    if (audioUrl) {
      window.open(audioUrl, '_blank');
    }
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      if (isFullscreen) {
        setIsFullscreen(false);
      } else {
        setShowDetailModal(false);
        setShowImagesView(false);
      }
    }
  };

  const handleViewUser = (userId, isWorker) => {
    setShowDetailModal(false); // Close the modal
    localStorage.setItem('viewUserId', userId);
    localStorage.setItem('userType', isWorker ? 'worker' : 'client');
    localStorage.setItem('fromOrderId', selectedOrder.id); // Store the order ID
    navigate('/users'); // Navigate to users page
  };

  const handleViewImages = () => {
    setShowImagesView(true);
    setCurrentImageIndex(0);
    setIsFullscreen(false);
  };

  const handleNavigateImages = (direction) => {
    const allImages = [
      ...(selectedOrder.images || []),
      ...(selectedOrder.imageUrls || [])
    ];
    
    let newIndex = currentImageIndex + direction;
    if (newIndex < 0) newIndex = allImages.length - 1;
    if (newIndex >= allImages.length) newIndex = 0;
    
    setCurrentImageIndex(newIndex);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Handle keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showImagesView) return;
      
      if (e.key === 'ArrowLeft') {
        handleNavigateImages(-1);
      } else if (e.key === 'ArrowRight') {
        handleNavigateImages(1);
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          setShowImagesView(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImagesView, currentImageIndex, isFullscreen]);

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
        columns={orderColumns.concat(actionColumn)}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        checkboxSelection
        disableSelectionOnClick
        disableColumnFilter
        loading={loading}
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
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: '600',
          }
        }}
      />

      {showDetailModal && selectedOrder && (
        <div className={`detailModal ${isFullscreen ? 'fullscreenModal' : ''}`} onClick={handleModalClick}>
          <div className={`modalContent ${isFullscreen ? 'fullscreenContent' : ''}`}>
            <button 
              className="closeButton"
              onClick={(e) => {
                e.stopPropagation();
                if (isFullscreen) {
                  setIsFullscreen(false);
                } else if (showImagesView) {
                  setShowImagesView(false);
                } else {
                  setShowDetailModal(false);
                }
              }}
            >
              ×
            </button>
            
            {!showImagesView ? (
              <>
                <h2>Order Details</h2>
                
                <div className="detailRow">
                  <span className="detailLabel">Order ID:</span>
                  <span className="detailValue">{selectedOrder.id}</span>
                </div>

                <div className="detailRow">
                  <span className="detailLabel">Client:</span>
                  <div className="detailValue">
                    <div 
                      className="userName"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedOrder.clientId) {
                          handleViewUser(selectedOrder.clientId, false);
                        }
                      }}
                    >
                      {selectedOrder.clientData && `${selectedOrder.clientData.firstName || ''} ${selectedOrder.clientData.lastName || ''}`.trim() || selectedOrder.clientName || "Unknown"}
                      {selectedOrder.clientId && <FaUser className="nameIcon" />}
                    </div>
                    {selectedOrder.clientId && (
                      <div 
                        className="userId" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewUser(selectedOrder.clientId, false);
                        }}
                      >
                        <FaUser /> ID: {selectedOrder.clientId}
                      </div>
                    )}
                  </div>
                </div>

                <div className="detailRow">
                  <span className="detailLabel">Worker:</span>
                  <div className="detailValue">
                    <div 
                      className="userName"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedOrder.workerId) {
                          handleViewUser(selectedOrder.workerId, true);
                        }
                      }}
                    >
                      {selectedOrder.workerData && `${selectedOrder.workerData.firstName || ''} ${selectedOrder.workerData.lastName || ''}`.trim() || selectedOrder.workerName || "Not Assigned"}
                      {selectedOrder.workerId && <FaUser className="nameIcon" />}
                    </div>
                    {selectedOrder.workerId && (
                      <div 
                        className="userId" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewUser(selectedOrder.workerId, true);
                        }}
                      >
                        <FaUser /> ID: {selectedOrder.workerId}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="detailRow">
                  <span className="detailLabel">Scheduled Date:</span>
                  <span className="detailValue">
                    {selectedOrder.scheduledDate ? new Date(selectedOrder.scheduledDate).toLocaleString() : "Not scheduled"}
                  </span>
                </div>
                
                <div className="detailRow">
                  <span className="detailLabel">Created At:</span>
                  <span className="detailValue">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "Unknown"}
                  </span>
                </div>
                
                <div className="detailRow">
                  <span className="detailLabel">Status:</span>
                  <span className={`statusBadge ${selectedOrder.status}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="detailRow">
                  <span className="detailLabel">Services:</span>
                  <div className="servicesList">
                    {selectedOrder.services?.map((service, index) => (
                      <span key={index} className="serviceBadge">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="detailRow">
                  <span className="detailLabel">Description:</span>
                  <div className="descriptionBox">
                    {selectedOrder.description || "No description provided"}
                  </div>
                </div>

                <div className="detailRow">
                  <span className="detailLabel">Price:</span>
                  <span className="detailValue">${selectedOrder.price || 0}</span>
                </div>

                <div className="detailRow">
                  <span className="detailLabel">Emergency:</span>
                  <span className={`featureBadge ${selectedOrder.emergency ? 'yes' : 'no'}`}>
                    {selectedOrder.emergency ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="detailRow">
                  <span className="detailLabel">Has Video:</span>
                  {selectedOrder.videoUrl ? (
                    <span 
                      className="featureBadge yes clickable"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewVideo(selectedOrder.videoUrl);
                      }}
                    >
                      <FaVideo style={{ marginRight: '4px' }} />
                      View Video
                    </span>
                  ) : (
                    <span className="featureBadge no">No</span>
                  )}
                </div>

                <div className="detailRow">
                  <span className="detailLabel">Voice Message:</span>
                  {selectedOrder.voiceMessageUrl ? (
                    <span 
                      className="featureBadge yes clickable"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVoiceMessage(selectedOrder.voiceMessageUrl);
                      }}
                    >
                      <FaMicrophone style={{ marginRight: '4px' }} />
                      Play Message
                    </span>
                  ) : (
                    <span className="featureBadge no">No</span>
                  )}
                </div>

                <div className="detailRow">
                  <span className="detailLabel">Images:</span>
                  {(selectedOrder.images?.length > 0 || selectedOrder.imageUrls?.length > 0) ? (
                    <span 
                      className="featureBadge yes clickable"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewImages();
                      }}
                    >
                      <FaEye style={{ marginRight: '4px' }} />
                      View Images ({(selectedOrder.images?.length || 0) + (selectedOrder.imageUrls?.length || 0)})
                    </span>
                  ) : (
                    <span className="featureBadge no">No images</span>
                  )}
                </div>
                
                <div className="modalActions">
                  <button
                    className="deleteButton"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(selectedOrder.id);
                      setShowDetailModal(false);
                    }}
                  >
                    Delete
                  </button>
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
              </>
            ) : (
              <>
                {!isFullscreen && <h2>Order Images</h2>}
                
                <div className={`imagesViewer ${isFullscreen ? 'fullscreenViewer' : ''}`}>
                  {(() => {
                    const allImages = [
                      ...(selectedOrder.images || []),
                      ...(selectedOrder.imageUrls || [])
                    ];
                    
                    return (
                      <>
                        <div className="imageNavigation">
                          <button 
                            className="prevButton" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigateImages(-1);
                            }}
                          >
                            <FaChevronLeft />
                          </button>
                          <span className="imageCounter">
                            Image {currentImageIndex + 1} of {allImages.length}
                          </span>
                          <button 
                            className="nextButton" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigateImages(1);
                            }}
                          >
                            <FaChevronRight />
                          </button>
                        </div>
                        <div 
                          className="imageWrapper"
                          onClick={(e) => {
                            if (e.target.tagName === 'IMG') {
                              e.stopPropagation();
                              toggleFullscreen();
                            }
                          }}
                        >
                          <img 
                            src={allImages[currentImageIndex]} 
                            alt={`Order image ${currentImageIndex + 1}`} 
                            className="fullImage"
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
                
                {!isFullscreen && (
                  <div className="modalActions">
                    <button
                      className="backButton"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowImagesView(false);
                      }}
                    >
                      Back to Details
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersDatatable; 