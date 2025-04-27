import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

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

// Generate a full report including all dashboard data
export const generateFullReport = (salesData, ordersData, userActivityData, serviceTypeData) => {
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
  y = addTitle(doc, 'User Activity', y);
  
  const userActivityTableData = userActivityData.map(item => [
    format(new Date(item.name), 'MMM dd'),
    item.activeUsers.toString(),
    item.newUsers.toString()
  ]);
  
  doc.autoTable({
    head: [['Date', 'Active Users', 'New Users']],
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
    `${((item.value / serviceTypeData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%`
  ]);
  
  doc.autoTable({
    head: [['Service Type', 'Revenue', 'Market Share']],
    body: serviceTypeTableData,
    startY: y,
    margin: { top: 10 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  return doc;
};

// Generate a summary report with key metrics
export const generateSummaryReport = (salesData, ordersData, userActivityData, serviceTypeData) => {
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
  
  const totalActiveUsers = userActivityData.reduce((sum, item) => sum + item.activeUsers, 0);
  const totalNewUsers = userActivityData.reduce((sum, item) => sum + item.newUsers, 0);
  
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
  doc.text(`Total Active Users: ${totalActiveUsers.toLocaleString()}`, 14, y);
  y += 10;
  doc.text(`New User Acquisition: ${totalNewUsers.toLocaleString()}`, 14, y);
  y += 20;

  // Top Service Types
  y = addTitle(doc, 'Top Service Types by Revenue', y);
  
  // Sort service types by value
  const sortedServiceTypes = [...serviceTypeData].sort((a, b) => b.value - a.value);
  
  const serviceTypeTableData = sortedServiceTypes.slice(0, 3).map(item => [
    item.name,
    `$${item.value.toLocaleString()}`,
    `${((item.value / serviceTypeData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%`
  ]);
  
  doc.autoTable({
    head: [['Service Type', 'Revenue', 'Market Share']],
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
export const generateChartReport = (chartType, data) => {
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
      y = addTitle(doc, 'User Activity', y);
      
      const userActivityTableData = data.map(item => [
        format(new Date(item.name), 'MMM dd'),
        item.activeUsers.toString(),
        item.newUsers.toString()
      ]);
      
      doc.autoTable({
        head: [['Date', 'Active Users', 'New Users']],
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
        `${((item.value / data.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%`
      ]);
      
      doc.autoTable({
        head: [['Service Type', 'Revenue', 'Market Share']],
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

// For backward compatibility
const generateReport = (reportType, data = null) => {
  console.log(`Generating report: ${reportType}`);
  
  // Sample data
  const sampleData = {
    salesData: [
      { month: "2023-01-01", orders: 2400, sales: 4000, target: 4500 },
      { month: "2023-02-01", orders: 1398, sales: 3000, target: 3500 },
      { month: "2023-03-01", orders: 3800, sales: 5000, target: 4500 }
    ],
    ordersData: [
      { name: 'Completed', value: 650 },
      { name: 'Processing', value: 120 },
      { name: 'Pending', value: 80 },
      { name: 'Cancelled', value: 40 }
    ],
    userActivityData: [
      { name: "2023-12-01", activeUsers: 4000, newUsers: 2400 },
      { name: "2023-12-02", activeUsers: 3000, newUsers: 1398 },
      { name: "2023-12-03", activeUsers: 2000, newUsers: 9800 }
    ],
    serviceTypeData: [
      { name: "Consulting", value: 450 },
      { name: "Development", value: 380 },
      { name: "Maintenance", value: 320 }
    ]
  };
  
  let doc;
  let fileName;
  
  switch (reportType) {
    case "Orders":
      doc = generateChartReport('Orders Overview', sampleData.salesData);
      fileName = 'orders_report';
      break;
      
    case "User Activity":
      doc = generateChartReport('User Activity', sampleData.userActivityData);
      fileName = 'user_activity_report';
      break;
      
    case "Service Type":
      doc = generateChartReport('Service Type Analysis', sampleData.serviceTypeData);
      fileName = 'service_type_report';
      break;
      
    case "Order Status":
      doc = generateChartReport('Order Status Distribution', sampleData.ordersData);
      fileName = 'order_status_report';
      break;
      
    case "Full Dashboard":
      doc = generateFullReport(
        sampleData.salesData, 
        sampleData.ordersData, 
        sampleData.userActivityData, 
        sampleData.serviceTypeData
      );
      fileName = 'full_dashboard_report';
      break;
      
    default:
      doc = generateSummaryReport(
        sampleData.salesData, 
        sampleData.ordersData, 
        sampleData.userActivityData, 
        sampleData.serviceTypeData
      );
      fileName = 'summary_report';
  }
  
  // Save the PDF with the current date in the filename
  const date = format(new Date(), 'yyyy-MM-dd');
  doc.save(`${fileName}_${date}.pdf`);
  
  return `${fileName}_${date}.pdf`;
};

export default generateReport; 