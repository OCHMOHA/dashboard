// Common columns for both workers and clients
export const commonUserColumns = [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "user",
    headerName: "User",
    width: 230,
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
  },
  {
    field: "phoneNumber",
    headerName: "Phone",
    width: 150,
  },
  {
    field: "location",
    headerName: "Location",
    width: 150,
  },
  {
    field: "isActive",
    headerName: "Status",
    width: 120,
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
  },
  {
    field: "completedJobs",
    headerName: "Completed",
    width: 120,
  },
  {
    field: "serviceType",
    headerName: "Service Type",
    width: 150,
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
    valueGetter: (params) => {
      if (!params.row.createdAt) return "N/A";
      const date = new Date(params.row.createdAt);
      return date.toLocaleDateString();
    }
  },
];
