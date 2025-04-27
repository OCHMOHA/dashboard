import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { orderColumns } from "../../orderdatatablesource";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, onValue, get, remove, query, orderByChild, equalTo } from "firebase/database";
import { db } from "../../firebase";

const OrdersDatatable = ({ statusFilter }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      
      try {
        // Create a reference to orders in Realtime Database
        let ordersRef;
        
        if (statusFilter === "all") {
          // Get all orders
          ordersRef = ref(db, "orders");
        } else {
          // Filter orders by status
          ordersRef = query(
            ref(db, "orders"),
            orderByChild("status"),
            equalTo(statusFilter)
          );
        }

        // Listen for real-time updates
        const unsubscribe = onValue(ordersRef, async (snapshot) => {
          const ordersData = [];

          if (snapshot.exists()) {
            const orders = snapshot.val();
            
            // Process and fetch related data for each order
            for (const orderId in orders) {
              const orderData = orders[orderId];
              
              // Fetch client data if available
              let clientData = null;
              let workerData = null;
              
              try {
                if (orderData.clientId) {
                  const clientRef = ref(db, `users/${orderData.clientId}`);
                  const clientSnapshot = await get(clientRef);
                  
                  if (clientSnapshot.exists()) {
                    clientData = clientSnapshot.val();
                  }
                }
                
                if (orderData.workerId) {
                  const workerRef = ref(db, `users/${orderData.workerId}`);
                  const workerSnapshot = await get(workerRef);
                  
                  if (workerSnapshot.exists()) {
                    workerData = workerSnapshot.val();
                  }
                }
              } catch (error) {
                console.error("Error fetching user data:", error);
              }
              
              // Add order to the data array
              ordersData.push({
                id: orderId,
                ...orderData,
                clientName: clientData ? `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() : "Unknown",
                clientImg: clientData?.img || null,
                workerName: workerData ? `${workerData.firstName || ''} ${workerData.lastName || ''}`.trim() : "Not Assigned",
                workerImg: workerData?.img || null,
              });
            }
          }
          
          setData(ordersData);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching orders:", error);
          setLoading(false);
        });

        // Return cleanup function
        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up orders query:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  const handleDelete = async (id) => {
    try {
      const orderRef = ref(db, `orders/${id}`);
      await remove(orderRef);
      // No need to filter data manually as the onValue listener will update
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/orders/${params.row.id}`} style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </div>
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
        pageSize={12}
        rowsPerPageOptions={[12, 24, 36]}
        checkboxSelection
        loading={loading}
        disableSelectionOnClick
        disableColumnFilter
        sortingMode="server"
        components={{
          Pagination: () => null,
        }}
        getRowClassName={(params) => `row-status-${params.row.status}`}
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
          }
        }}
      />
    </div>
  );
};

export default OrdersDatatable; 