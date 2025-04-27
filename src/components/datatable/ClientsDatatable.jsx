import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { clientColumns } from "../../datatablesource";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../../firebase";

const ClientsDatatable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, "users", id));
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting client: ", err);
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
            <Link to={`/users/${params.row.id}`} style={{ textDecoration: "none" }}>
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
        columns={clientColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        loading={loading}
        disableSelectionOnClick
        disableColumnFilter
        sortingMode="server"
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
          }
        }}
      />
    </div>
  );
};

export default ClientsDatatable; 