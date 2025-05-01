import { FaCopy } from "react-icons/fa";

// Common columns for both workers and clients
export const commonUserColumns = [
  { 
    field: "id", 
    headerName: "ID", 
    width: 120, 
    sortable: false, 
    disableColumnMenu: true,
    renderCell: (params) => {
      // Create a unique ID for this cell to track copy state
      const cellId = `user-${params.id}`;
      // Get the first 7 characters, removing any leading dashes
      const displayId = params.value.replace(/^-+/, '').substring(0, 7);
      
      return (
        <div 
          className="copyableId"
          onClick={() => {
            // Copy the original full ID to clipboard
            navigator.clipboard.writeText(params.value)
              .then(() => {
                // Find the copy indicator element
                const element = document.querySelector(`.copyIndicator-${cellId}`);
                if (element) {
                  element.style.display = 'block';
                  setTimeout(() => {
                    element.style.display = 'none';
                  }, 1000);
                }
              })
              .catch(err => {
                console.error('Failed to copy user ID: ', err);
              });
          }}
          title="Click to copy full User ID"
        >
          <span className="orderId">{displayId}</span>
          <FaCopy className="copyIcon" />
          <span className={`inlineCopyIndicator copyIndicator-${cellId}`} style={{ display: 'none' }}>
            Copied!
          </span>
        </div>
      );
    }
  },
  {
    field: "user",
    headerName: "User",
    width: 230,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img 
            className="cellImg" 
            src={params.row.img || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"} 
            alt="avatar" 
          />
          {`${params.row.firstName} ${params.row.lastName}`}
        </div>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 230,
    sortable: false,
    disableColumnMenu: true,
  },
  {
    field: "phoneNumber",
    headerName: "Phone",
    width: 150,
    sortable: false,
    disableColumnMenu: true,
  },
  {
    field: "location",
    headerName: "Location",
    width: 150,
    sortable: false,
    disableColumnMenu: true,
  },
  {
    field: "isActive",
    headerName: "Status",
    width: 120,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.isActive ? "active" : "inactive"}`}>
          {params.row.isActive ? "Active" : "Inactive"}
        </div>
      );
    },
  },
];

// Additional columns specific to workers
export const workerColumns = [
  ...commonUserColumns,
  {
    field: "rating",
    headerName: "Rating",
    width: 120,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      return (
        <div className="cellWithRating">
          {params.row.rating || "N/A"} {params.row.rating && "★"}
        </div>
      );
    },
  },
  {
    field: "price",
    headerName: "Price",
    width: 100,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      return (
        <div className="cellWithPrice">
          ${params.row.price || 0}
        </div>
      );
    },
  },
  {
    field: "activeJobs",
    headerName: "Active Jobs",
    width: 120,
    sortable: false,
    disableColumnMenu: true,
  },
  {
    field: "completedJobs",
    headerName: "Completed",
    width: 120,
    sortable: false,
    disableColumnMenu: true,
  },
  {
    field: "serviceType",
    headerName: "Service Type",
    width: 150,
    sortable: false,
    disableColumnMenu: true,
    valueGetter: (params) => {
      return params.row.serviceTypeKey || "N/A";
    }
  },
];

// Columns specific to clients (regular users)
export const clientColumns = [
  ...commonUserColumns,
  {
    field: "joinedDate",
    headerName: "Joined",
    width: 150,
    sortable: false,
    disableColumnMenu: true,
    valueGetter: (params) => {
      if (!params.row.joinedDate) return "N/A";
      const date = new Date(params.row.joinedDate);
      return date.toLocaleDateString();
    }
  },
  {
    field: "createdAt",
    headerName: "Created",
    width: 150,
    sortable: false,
    disableColumnMenu: true,
    valueGetter: (params) => {
      if (!params.row.createdAt) return "N/A";
      const date = new Date(params.row.createdAt);
      return date.toLocaleDateString();
    }
  },
];
