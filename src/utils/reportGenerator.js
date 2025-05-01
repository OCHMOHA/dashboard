import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { firestore, db } from '../firebase';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { ref, get } from 'firebase/database';

// Helper function to create a title and add it to the PDF
const addTitle = (doc, text, y) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(text, 14, y);
  doc.setLineWidth(0.5);
  doc.line(14, y + 3, 196, y + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  return y + 15;
};

// Fetch real sales data from Firebase
const fetchSalesData = async () => {
  try {
    // Try to get orders data from Firestore
    const ordersRef = collection(firestore, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);
    
    if (!ordersSnapshot.empty) {
      console.log("Found orders in Firestore");
      
      // Get orders data and aggregate by month
      const ordersByMonth = {};
      
      ordersSnapshot.forEach(doc => {
        const order = doc.data();
        let orderDate;
        
        // Handle different timestamp formats
        if (order.createdAt && order.createdAt.toDate) {
          // Firestore Timestamp
          orderDate = order.createdAt.toDate();
        } else if (order.createdAt && typeof order.createdAt === 'string') {
          // ISO string
          orderDate = new Date(order.createdAt);
        } else if (order.createdAt && order.createdAt.seconds) {
          // Timestamp object
          orderDate = new Date(order.createdAt.seconds * 1000);
        } else if (order.date) {
          // Direct date field
          orderDate = new Date(order.date);
        } else {
          // Skip orders without dates
          return;
        }
        
        // Format to YYYY-MM
        const monthKey = format(orderDate, 'yyyy-MM');
        
        // Get price
        const price = order.price ? parseFloat(order.price) : 0;
        
        // Initialize month data if needed
        if (!ordersByMonth[monthKey]) {
          ordersByMonth[monthKey] = {
            month: format(orderDate, 'yyyy-MM-dd'),
            orders: 0,
            sales: 0,
            target: 0
          };
        }
        
        // Increment orders and sales
        ordersByMonth[monthKey].orders += 1;
        ordersByMonth[monthKey].sales += price;
      });
      
      // Set targets (typically 10% higher than previous month's sales)
      const months = Object.keys(ordersByMonth).sort();
      for (let i = 1; i < months.length; i++) {
        const prevMonth = months[i-1];
        const currMonth = months[i];
        ordersByMonth[currMonth].target = ordersByMonth[prevMonth].sales * 1.1;
      }
      
      // If first month doesn't have a target, set it to 110% of sales
      if (months.length > 0) {
        const firstMonth = months[0];
        if (ordersByMonth[firstMonth].target === 0) {
          ordersByMonth[firstMonth].target = ordersByMonth[firstMonth].sales * 1.1;
        }
      }
      
      // Convert to array and sort by date
      const salesData = Object.values(ordersByMonth).sort((a, b) => 
        new Date(a.month) - new Date(b.month)
      );
      
      // Return at least the last 3 months of data, or fallback if too few
      return salesData.length >= 3 ? salesData.slice(-3) : salesData;
    }
    
    // Try to get data from Realtime Database
    const dbOrdersRef = ref(db, 'orders');
    const dbSnapshot = await get(dbOrdersRef);
    
    if (dbSnapshot.exists()) {
      console.log("Found orders in Realtime Database");
      const orders = dbSnapshot.val();
      
      // Get orders data and aggregate by month
      const ordersByMonth = {};
      
      Object.keys(orders).forEach(key => {
        const order = orders[key];
        let orderDate;
        
        // Handle different date formats
        if (order.createdAt) {
          orderDate = new Date(order.createdAt);
        } else if (order.date) {
          orderDate = new Date(order.date);
        } else {
          // Skip orders without dates
          return;
        }
        
        // Format to YYYY-MM
        const monthKey = format(orderDate, 'yyyy-MM');
        
        // Get price
        const price = order.price ? parseFloat(order.price) : 0;
        
        // Initialize month data if needed
        if (!ordersByMonth[monthKey]) {
          ordersByMonth[monthKey] = {
            month: format(orderDate, 'yyyy-MM-dd'),
            orders: 0,
            sales: 0,
            target: 0
          };
        }
        
        // Increment orders and sales
        ordersByMonth[monthKey].orders += 1;
        ordersByMonth[monthKey].sales += price;
      });
      
      // Set targets (typically 10% higher than previous month's sales)
      const months = Object.keys(ordersByMonth).sort();
      for (let i = 1; i < months.length; i++) {
        const prevMonth = months[i-1];
        const currMonth = months[i];
        ordersByMonth[currMonth].target = ordersByMonth[prevMonth].sales * 1.1;
      }
      
      // If first month doesn't have a target, set it to 110% of sales
      if (months.length > 0) {
        const firstMonth = months[0];
        if (ordersByMonth[firstMonth].target === 0) {
          ordersByMonth[firstMonth].target = ordersByMonth[firstMonth].sales * 1.1;
        }
      }
      
      // Convert to array and sort by date
      const salesData = Object.values(ordersByMonth).sort((a, b) => 
        new Date(a.month) - new Date(b.month)
      );
      
      // Return at least the last 3 months of data, or fallback if too few
      return salesData.length >= 3 ? salesData.slice(-3) : salesData;
    }
    
    // Try to get direct sales data as a last resort
    const salesRef = collection(firestore, 'sales');
    const salesSnapshot = await getDocs(salesRef);
    
    if (!salesSnapshot.empty) {
      console.log("Found sales collection in Firestore");
      const salesData = [];
      salesSnapshot.forEach(doc => {
        const data = doc.data();
        salesData.push({
          month: data.date || data.month,
          orders: parseInt(data.orders || 0),
          sales: parseFloat(data.sales || 0),
          target: parseFloat(data.target || 0)
        });
      });
      
      // Sort by date
      return salesData.sort((a, b) => new Date(a.month) - new Date(b.month));
    }
    
    console.log("No real sales data found, using sample data");
    // Fallback to sample data if no real data found
    const today = new Date();
    const month1 = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const month2 = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const month3 = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return [
      { month: format(month1, 'yyyy-MM-dd'), orders: 2400, sales: 4000, target: 4500 },
      { month: format(month2, 'yyyy-MM-dd'), orders: 1398, sales: 3000, target: 3500 },
      { month: format(month3, 'yyyy-MM-dd'), orders: 3800, sales: 5000, target: 4500 }
    ];
  } catch (error) {
    console.error("Error fetching sales data:", error);
    // Return sample data as fallback
    const today = new Date();
    const month1 = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const month2 = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const month3 = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return [
      { month: format(month1, 'yyyy-MM-dd'), orders: 2400, sales: 4000, target: 4500 },
      { month: format(month2, 'yyyy-MM-dd'), orders: 1398, sales: 3000, target: 3500 },
      { month: format(month3, 'yyyy-MM-dd'), orders: 3800, sales: 5000, target: 4500 }
    ];
  }
};

// Fetch real order status data from Firebase
const fetchOrderStatusData = async () => {
  try {
    // Get orders from Firebase
    const ordersRef = collection(firestore, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);
    
    if (!ordersSnapshot.empty) {
      // Count orders by status
      const statusCounts = {
        'Completed': 0,
        'Processing': 0,
        'Pending': 0,
        'Cancelled': 0
      };
      
      ordersSnapshot.forEach(doc => {
        const order = doc.data();
        if (order.status) {
          const status = order.status.charAt(0).toUpperCase() + order.status.slice(1);
          if (statusCounts[status] !== undefined) {
            statusCounts[status]++;
          } else {
            statusCounts[status] = 1;
          }
        }
      });
      
      // Convert to array format needed for the chart
      return Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
      }));
    }
    
    // Try from Realtime Database if Firestore failed
    const dbOrdersRef = ref(db, 'orders');
    const dbSnapshot = await get(dbOrdersRef);
    
    if (dbSnapshot.exists()) {
      const orders = dbSnapshot.val();
      
      // Count orders by status
      const statusCounts = {
        'Completed': 0,
        'Processing': 0,
        'Pending': 0,
        'Cancelled': 0
      };
      
      Object.keys(orders).forEach(key => {
        const order = orders[key];
        if (order.status) {
          const status = order.status.charAt(0).toUpperCase() + order.status.slice(1);
          if (statusCounts[status] !== undefined) {
            statusCounts[status]++;
          } else {
            statusCounts[status] = 1;
          }
        }
      });
      
      return Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
      }));
    }
    
    // Fallback to sample data
    return [
      { name: 'Completed', value: 650 },
      { name: 'Processing', value: 120 },
      { name: 'Pending', value: 80 },
      { name: 'Cancelled', value: 40 }
    ];
  } catch (error) {
    console.error("Error fetching order status data:", error);
    // Return sample data as fallback
    return [
      { name: 'Completed', value: 650 },
      { name: 'Processing', value: 120 },
      { name: 'Pending', value: 80 },
      { name: 'Cancelled', value: 40 }
    ];
  }
};

// Fetch real user activity data from Firebase
const fetchUserActivityData = async () => {
  try {
    // Create a query to get users
    const usersQuery = query(
      collection(firestore, "users"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    // Execute the query
    const usersSnapshot = await getDocs(usersQuery);
    
    // Process the data by day (last 7 days)
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push({
        date: date,
        name: format(date, 'EEE'),
        Clients: 0,
        Workers: 0
      });
    }
    
    if (!usersSnapshot.empty) {
      // Count users by creation date and type
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        let creationDate;
        
        // Handle different timestamp formats
        if (userData.createdAt && userData.createdAt.toDate) {
          // Firestore Timestamp
          creationDate = userData.createdAt.toDate();
        } else if (userData.createdAt && typeof userData.createdAt === 'string') {
          // ISO string
          creationDate = new Date(userData.createdAt);
        } else if (userData.createdAt && userData.createdAt.seconds) {
          // Timestamp object
          creationDate = new Date(userData.createdAt.seconds * 1000);
        }
        
        if (creationDate) {
          const creationDay = format(creationDate, 'yyyy-MM-dd');
          
          // Find matching day in our array
          const dayMatch = days.find(day => {
            return format(day.date, 'yyyy-MM-dd') === creationDay;
          });
          
          if (dayMatch) {
            if (userData.isWorker) {
              dayMatch.Workers++;
            } else {
              dayMatch.Clients++;
            }
          }
        }
      });
      
      return days;
    }
    
    // Fallback to sample data
    return [
      { name: "Mon", Clients: 12, Workers: 5, date: new Date(today.setDate(today.getDate() - 6)) },
      { name: "Tue", Clients: 8, Workers: 3, date: new Date(today.setDate(today.getDate() + 1)) },
      { name: "Wed", Clients: 15, Workers: 7, date: new Date(today.setDate(today.getDate() + 1)) },
      { name: "Thu", Clients: 10, Workers: 4, date: new Date(today.setDate(today.getDate() + 1)) },
      { name: "Fri", Clients: 14, Workers: 6, date: new Date(today.setDate(today.getDate() + 1)) },
      { name: "Sat", Clients: 18, Workers: 9, date: new Date(today.setDate(today.getDate() + 1)) },
      { name: "Sun", Clients: 16, Workers: 8, date: new Date(today.setDate(today.getDate() + 1)) }
    ];
  } catch (error) {
    console.error("Error fetching user activity data:", error);
    // Return sample data as fallback
    const today = new Date();
    return [
      { name: "Mon", Clients: 12, Workers: 5, date: new Date(today.setDate(today.getDate() - 6)) },
      { name: "Tue", Clients: 8, Workers: 3, date: new Date(today.setDate(today.getDate() + 1)) },
      { name: "Wed", Clients: 15, Workers: 7, date: new Date(today.setDate(today.getDate() + 1)) },
      { name: "Thu", Clients: 10, Workers: 4, date: new Date(today.setDate(today.getDate() + 1)) },
      { name: "Fri", Clients: 14, Workers: 6, date: new Date(today.setDate(today.getDate() + 1)) },
      { name: "Sat", Clients: 18, Workers: 9, date: new Date(today.setDate(today.getDate() + 1)) },
      { name: "Sun", Clients: 16, Workers: 8, date: new Date(today.setDate(today.getDate() + 1)) }
    ];
  }
};

// Fetch real service type data from Firebase
const fetchServiceTypeData = async () => {
  try {
    // Get orders from Firebase Realtime Database
    const ordersRef = ref(db, "orders");
    const snapshot = await get(ordersRef);
    
    if (snapshot.exists()) {
      // Initialize service type counters
      const serviceTypeCounts = {};
      
      // Count orders by service type
      const orders = snapshot.val();
      
      Object.keys(orders).forEach(key => {
        const order = orders[key];
        
        // Check if serviceTypeKey exists
        if (order.serviceTypeKey) {
          // Capitalize first letter for display
          const serviceType = order.serviceTypeKey.charAt(0).toUpperCase() + order.serviceTypeKey.slice(1);
          
          if (!serviceTypeCounts[serviceType]) {
            serviceTypeCounts[serviceType] = {
              count: 0,
              revenue: 0
            };
          }
          
          serviceTypeCounts[serviceType].count++;
          
          // Add price/revenue if available
          if (order.price) {
            serviceTypeCounts[serviceType].revenue += parseFloat(order.price);
          }
        }
        
        // If there's a services array, count those as well
        if (order.services && Array.isArray(order.services)) {
          order.services.forEach(service => {
            const serviceType = service.charAt(0).toUpperCase() + service.slice(1);
            
            if (!serviceTypeCounts[serviceType]) {
              serviceTypeCounts[serviceType] = {
                count: 0,
                revenue: 0
              };
            }
            
            serviceTypeCounts[serviceType].count++;
            
            // Distribute the price evenly among services if multiple
            if (order.price && order.services.length > 0) {
              serviceTypeCounts[serviceType].revenue += parseFloat(order.price) / order.services.length;
            }
          });
        }
      });
      
      // Transform to chart data format
      const chartData = Object.keys(serviceTypeCounts).map(serviceType => ({
        name: serviceType,
        value: serviceTypeCounts[serviceType].revenue,
        count: serviceTypeCounts[serviceType].count
      }));
      
      // Sort by revenue (highest first)
      chartData.sort((a, b) => b.value - a.value);
      
      // Return the data, or fallback to sample if empty
      if (chartData.length > 0) {
        return chartData;
      }
    }
    
    // Try fetching from Firestore if realtime DB failed
    const ordersCollection = collection(firestore, 'orders');
    const ordersSnapshot = await getDocs(ordersCollection);
    
    if (!ordersSnapshot.empty) {
      // Initialize service type counters
      const serviceTypeCounts = {};
      
      // Count orders by service type
      ordersSnapshot.forEach(doc => {
        const order = doc.data();
        
        // Check if serviceTypeKey exists
        if (order.serviceTypeKey) {
          // Capitalize first letter for display
          const serviceType = order.serviceTypeKey.charAt(0).toUpperCase() + order.serviceTypeKey.slice(1);
          
          if (!serviceTypeCounts[serviceType]) {
            serviceTypeCounts[serviceType] = {
              count: 0,
              revenue: 0
            };
          }
          
          serviceTypeCounts[serviceType].count++;
          
          // Add price/revenue if available
          if (order.price) {
            serviceTypeCounts[serviceType].revenue += parseFloat(order.price);
          }
        }
        
        // If there's a services array, count those as well
        if (order.services && Array.isArray(order.services)) {
          order.services.forEach(service => {
            const serviceType = service.charAt(0).toUpperCase() + service.slice(1);
            
            if (!serviceTypeCounts[serviceType]) {
              serviceTypeCounts[serviceType] = {
                count: 0,
                revenue: 0
              };
            }
            
            serviceTypeCounts[serviceType].count++;
            
            // Distribute the price evenly among services if multiple
            if (order.price && order.services.length > 0) {
              serviceTypeCounts[serviceType].revenue += parseFloat(order.price) / order.services.length;
            }
          });
        }
      });
      
      // Transform to chart data format
      const chartData = Object.keys(serviceTypeCounts).map(serviceType => ({
        name: serviceType,
        value: serviceTypeCounts[serviceType].revenue,
        count: serviceTypeCounts[serviceType].count
      }));
      
      // Sort by revenue (highest first)
      chartData.sort((a, b) => b.value - a.value);
      
      // Return the data, or fallback to sample if empty
      if (chartData.length > 0) {
        return chartData;
      }
    }
    
    // Fallback to sample data
    return [
      { name: "Consultation", value: 1200, count: 45 },
      { name: "Installation", value: 950, count: 38 },
      { name: "Repair", value: 850, count: 34 },
      { name: "Maintenance", value: 600, count: 24 },
      { name: "Support", value: 400, count: 16 }
    ];
  } catch (error) {
    console.error("Error fetching service type data:", error);
    // Fallback to sample data
    return [
      { name: "Consultation", value: 1200, count: 45 },
      { name: "Installation", value: 950, count: 38 },
      { name: "Repair", value: 850, count: 34 },
      { name: "Maintenance", value: 600, count: 24 },
      { name: "Support", value: 400, count: 16 }
    ];
  }
};

// Generate a full report including all dashboard data
export const generateFullReport = async () => {
  // Fetch all required data
  const [salesData, ordersData, userActivityData, serviceTypeData] = await Promise.all([
    fetchSalesData(),
    fetchOrderStatusData(),
    fetchUserActivityData(),
    fetchServiceTypeData()
  ]);

  const doc = new jsPDF();
  let y = 20;

  // Add header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Analytics Dashboard Report', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  y += 10;
  
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, y);
  y += 20;

  // Orders Overview Section
  y = addTitle(doc, 'Orders Overview', y);
  
  const ordersTableData = salesData.map(item => [
    format(new Date(item.month), 'MMM yyyy'),
    item.orders.toString(),
    item.sales.toString(),
    item.target.toString()
  ]);
  
  doc.autoTable({
    head: [['Month', 'Orders', 'Sales ($)', 'Target ($)']],
    body: ordersTableData,
    startY: y,
    margin: { top: 10 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  y = doc.lastAutoTable.finalY + 15;

  // Order Status Section
  y = addTitle(doc, 'Order Status Distribution', y);
  
  const totalOrders = ordersData.reduce((sum, item) => sum + item.value, 0);
  
  const orderStatusTableData = ordersData.map(item => [
    item.name,
    item.value.toString(),
    `${((item.value / totalOrders) * 100).toFixed(1)}%`
  ]);
  
  doc.autoTable({
    head: [['Status', 'Count', 'Percentage']],
    body: orderStatusTableData,
    startY: y,
    margin: { top: 10 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  y = doc.lastAutoTable.finalY + 15;
  
  // Check if we need a new page
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  // User Activity Section
  y = addTitle(doc, 'New User Registrations', y);
  
  const userActivityTableData = userActivityData.map(item => [
    format(item.date, 'MMM dd'),
    item.Clients.toString(),
    item.Workers.toString(),
    (item.Clients + item.Workers).toString()
  ]);
  
  doc.autoTable({
    head: [['Date', 'New Clients', 'New Workers', 'Total New Users']],
    body: userActivityTableData,
    startY: y,
    margin: { top: 10 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  y = doc.lastAutoTable.finalY + 15;
  
  // Check if we need a new page
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  // Service Type Analysis
  y = addTitle(doc, 'Service Type Analysis', y);
  
  const serviceTypeTableData = serviceTypeData.map(item => [
    item.name,
    `$${item.value.toLocaleString()}`,
    `${((item.value / serviceTypeData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%`,
    item.count.toString()
  ]);
  
  doc.autoTable({
    head: [['Service Type', 'Revenue', 'Market Share', 'Order Count']],
    body: serviceTypeTableData,
    startY: y,
    margin: { top: 10 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  return doc;
};

// Generate a summary report with key metrics
export const generateSummaryReport = async () => {
  // Fetch all required data
  const [salesData, ordersData, userActivityData, serviceTypeData] = await Promise.all([
    fetchSalesData(),
    fetchOrderStatusData(),
    fetchUserActivityData(),
    fetchServiceTypeData()
  ]);

  const doc = new jsPDF();
  let y = 20;

  // Add header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Analytics Summary Report', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  y += 10;
  
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, y);
  y += 20;

  // Key Metrics Section
  y = addTitle(doc, 'Key Performance Metrics', y);
  
  // Calculate key metrics
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalSales / totalOrders;
  
  const totalClients = userActivityData.reduce((sum, item) => sum + item.Clients, 0);
  const totalWorkers = userActivityData.reduce((sum, item) => sum + item.Workers, 0);
  const totalNewUsers = totalClients + totalWorkers;
  
  const currentMonthSales = salesData[salesData.length - 1]?.sales || 0;
  const prevMonthSales = salesData[salesData.length - 2]?.sales || 0;
  const salesGrowth = prevMonthSales ? ((currentMonthSales - prevMonthSales) / prevMonthSales) * 100 : 0;
  
  // Add metrics to the PDF
  doc.text(`Total Sales: $${totalSales.toLocaleString()}`, 14, y);
  y += 10;
  doc.text(`Total Orders: ${totalOrders.toLocaleString()}`, 14, y);
  y += 10;
  doc.text(`Average Order Value: $${avgOrderValue.toFixed(2)}`, 14, y);
  y += 10;
  doc.text(`Monthly Sales Growth: ${salesGrowth.toFixed(1)}%`, 14, y);
  y += 10;
  doc.text(`New Clients: ${totalClients.toLocaleString()}`, 14, y);
  y += 10;
  doc.text(`New Workers: ${totalWorkers.toLocaleString()}`, 14, y);
  y += 10;
  doc.text(`Total New Users: ${totalNewUsers.toLocaleString()}`, 14, y);
  y += 20;

  // Top Service Types
  y = addTitle(doc, 'Top Service Types by Revenue', y);
  
  // Sort service types by value
  const sortedServiceTypes = [...serviceTypeData].sort((a, b) => b.value - a.value);
  
  const serviceTypeTableData = sortedServiceTypes.slice(0, 3).map(item => [
    item.name,
    `$${item.value.toLocaleString()}`,
    `${((item.value / serviceTypeData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%`,
    item.count.toString()
  ]);
  
  doc.autoTable({
    head: [['Service Type', 'Revenue', 'Market Share', 'Order Count']],
    body: serviceTypeTableData,
    startY: y,
    margin: { top: 10 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  y = doc.lastAutoTable.finalY + 15;

  // Order Status Summary
  y = addTitle(doc, 'Order Status Summary', y);
  
  const totalOrdersStatus = ordersData.reduce((sum, item) => sum + item.value, 0);
  
  const orderStatusTableData = ordersData.map(item => [
    item.name,
    item.value.toString(),
    `${((item.value / totalOrdersStatus) * 100).toFixed(1)}%`
  ]);
  
  doc.autoTable({
    head: [['Status', 'Count', 'Percentage']],
    body: orderStatusTableData,
    startY: y,
    margin: { top: 10 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  return doc;
};

// Generate a custom report for a specific chart
export const generateChartReport = async (chartType) => {
  let data;
  
  // Fetch the appropriate data based on chart type
  switch (chartType) {
    case 'Orders Overview':
      data = await fetchSalesData();
      break;
      
    case 'Order Status Distribution':
      data = await fetchOrderStatusData();
      break;
      
    case 'User Activity':
    case 'New User Registrations':
      data = await fetchUserActivityData();
      break;
      
    case 'Service Type Analysis':
      data = await fetchServiceTypeData();
      break;
      
    default:
      data = [];
  }

  const doc = new jsPDF();
  let y = 20;

  // Add header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(`${chartType} Report`, 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  y += 10;
  
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, y);
  y += 20;

  switch (chartType) {
    case 'Orders Overview':
      y = addTitle(doc, 'Orders Overview', y);
      
      const ordersTableData = data.map(item => [
        format(new Date(item.month), 'MMM yyyy'),
        item.orders.toString(),
        item.sales.toString(),
        item.target.toString()
      ]);
      
      doc.autoTable({
        head: [['Month', 'Orders', 'Sales ($)', 'Target ($)']],
        body: ordersTableData,
        startY: y,
        margin: { top: 10 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      break;
      
    case 'Order Status Distribution':
      y = addTitle(doc, 'Order Status Distribution', y);
      
      const totalOrders = data.reduce((sum, item) => sum + item.value, 0);
      
      const orderStatusTableData = data.map(item => [
        item.name,
        item.value.toString(),
        `${((item.value / totalOrders) * 100).toFixed(1)}%`
      ]);
      
      doc.autoTable({
        head: [['Status', 'Count', 'Percentage']],
        body: orderStatusTableData,
        startY: y,
        margin: { top: 10 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      break;
      
    case 'User Activity':
    case 'New User Registrations':
      y = addTitle(doc, 'New User Registrations', y);
      
      const userActivityTableData = data.map(item => [
        format(item.date, 'MMM dd'),
        item.Clients.toString(),
        item.Workers.toString(),
        (item.Clients + item.Workers).toString()
      ]);
      
      doc.autoTable({
        head: [['Date', 'New Clients', 'New Workers', 'Total New Users']],
        body: userActivityTableData,
        startY: y,
        margin: { top: 10 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      break;
      
    case 'Service Type Analysis':
      y = addTitle(doc, 'Service Type Analysis', y);
      
      const serviceTypeTableData = data.map(item => [
        item.name,
        `$${item.value.toLocaleString()}`,
        `${((item.value / data.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%`,
        item.count.toString()
      ]);
      
      doc.autoTable({
        head: [['Service Type', 'Revenue', 'Market Share', 'Order Count']],
        body: serviceTypeTableData,
        startY: y,
        margin: { top: 10 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      break;
      
    default:
      doc.text('No data available for this chart type', 14, y);
  }

  return doc;
};

// Main report generator function
const generateReport = async (reportType) => {
  console.log(`Generating report: ${reportType}`);
  
  let doc;
  let fileName;
  
  try {
    switch (reportType) {
      case "Orders":
        doc = await generateChartReport('Orders Overview');
        fileName = 'orders_report';
        break;
        
      case "User Activity":
        doc = await generateChartReport('New User Registrations');
        fileName = 'user_activity_report';
        break;
        
      case "Service Type":
        doc = await generateChartReport('Service Type Analysis');
        fileName = 'service_type_report';
        break;
        
      case "Order Status":
        doc = await generateChartReport('Order Status Distribution');
        fileName = 'order_status_report';
        break;
        
      case "Full Dashboard":
        doc = await generateFullReport();
        fileName = 'full_dashboard_report';
        break;
        
      default:
        doc = await generateSummaryReport();
        fileName = 'summary_report';
    }
    
    // Save the PDF with the current date in the filename
    const date = format(new Date(), 'yyyy-MM-dd');
    doc.save(`${fileName}_${date}.pdf`);
    
    return `${fileName}_${date}.pdf`;
  } catch (error) {
    console.error(`Error generating ${reportType} report:`, error);
    throw new Error(`Failed to generate report: ${error.message}`);
  }
};

export default generateReport; 