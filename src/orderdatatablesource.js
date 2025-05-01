import { FaCopy } from "react-icons/fa";

export const orderColumns = [
  { 
    field: "id", 
    headerName: "Order ID", 
    width: 180,
    sortable: true,
    disableColumnMenu: false,
    renderCell: (params) => {
      // Create a unique ID for this cell to track copy state
      const cellId = `order-${params.id}`;
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
                console.error('Failed to copy order ID: ', err);
              });
          }}
          title="Click to copy full Order ID"
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
    field: "clientName",
    headerName: "Client",
    width: 200,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img 
            className="cellImg" 
            src={params.row.clientImg || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"} 
            alt="avatar" 
          />
          {params.row.clientName || "Unknown Client"}
        </div>
      );
    }
  },
  {
    field: "workerName",
    headerName: "Worker",
    width: 200,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img 
            className="cellImg" 
            src={params.row.workerImg || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"} 
            alt="avatar" 
          />
          {params.row.workerName || "Not Assigned"}
        </div>
      );
    }
  },
  {
    field: "serviceNameKey",
    headerName: "Service",
    width: 150,
    sortable: false,
    disableColumnMenu: true,
  },
  {
    field: "serviceTypeKey",
    headerName: "Service Type",
    width: 150,
    sortable: false,
    disableColumnMenu: true,
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
    }
  },
  {
    field: "scheduledDate",
    headerName: "Scheduled Date",
    width: 180,
    sortable: false,
    disableColumnMenu: true,
    valueGetter: (params) => {
      if (!params.row.scheduledDate) return "Not scheduled";
      const date = new Date(params.row.scheduledDate);
      return date.toLocaleString();
    }
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 180,
    sortable: false,
    disableColumnMenu: true,
    valueGetter: (params) => {
      if (!params.row.createdAt) return "Unknown";
      const date = new Date(params.row.createdAt);
      return date.toLocaleString();
    }
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.status}`}>
          {params.row.status || "pending"}
        </div>
      );
    }
  },
  {
    field: "isEmergency",
    headerName: "Emergency",
    width: 120,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      return (
        <div className={`cellWithEmergency ${params.row.isEmergency ? "yes" : "no"}`}>
          {params.row.isEmergency ? "Yes" : "No"}
        </div>
      );
    }
  },
  {
    field: "hasVideo",
    headerName: "Has Video",
    width: 120,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      return (
        <div className={`cellWithFeature ${params.row.hasVideo ? "yes" : "no"}`}>
          {params.row.hasVideo ? "Yes" : "No"}
        </div>
      );
    }
  },
  {
    field: "hasVoiceMessage",
    headerName: "Voice Message",
    width: 140,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      return (
        <div className={`cellWithFeature ${params.row.hasVoiceMessage ? "yes" : "no"}`}>
          {params.row.hasVoiceMessage ? "Yes" : "No"}
        </div>
      );
    }
  },
]; 