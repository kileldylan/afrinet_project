import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Grid,
  Box,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  People,
  Sms,
  MonetizationOn,
  FlashOn,
  Receipt
} from '@mui/icons-material';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend 
} from 'chart.js';
import axiosInstance from '../api/axios';
import PageLayout from './PageLayout';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [paymentData, setPaymentData] = useState(null);
  const [userActivityData, setUserActivityData] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsRes, paymentsRes, usersRes, packagesRes, activeUsersRes] = await Promise.all([
          axiosInstance.get('/api/dashboard/stats/'),
          axiosInstance.get('/api/dashboard/payment-chart/'),
          axiosInstance.get('/api/dashboard/user-activity/'),
          axiosInstance.get('/api/dashboard/package-distribution/'),
          axiosInstance.get('/api/active-users/stats/')
        ]);

        // Update stats cards
        setStats([
          {
            title: 'Monthly Revenue',
            value: `Ksh ${statsRes.data.monthly_amount?.toLocaleString() || '0'}`,
            description: 'Total revenue this month',
            icon: <MonetizationOn color="primary" />,
          },
          {
            title: 'SMS Balance',
            value: `Ksh ${statsRes.data.sms_balance?.toFixed(2) || '0.00'}`,
            description: 'Current SMS credit balance',
            icon: <Sms color="primary" />,
          },
          {
            title: 'Total Users',
            value: statsRes.data.total_users || '0',
            description: 'Active hotspot users',
            icon: <People color="primary" />,
          }
        ]);

        // Update charts data
        setPaymentData({
          labels: paymentsRes.data.labels || [],
          datasets: [{
            label: 'Daily Revenue (Ksh)',
            data: paymentsRes.data.data || [],
            backgroundColor: '#ff9800',
            borderColor: '#f57c00',
            borderWidth: 1,
            barThickness: 20,
          }]
        });

        setUserActivityData({
          labels: usersRes.data.labels || [],
          datasets: [{
            label: 'Daily Active Users',
            data: usersRes.data.data || [],
            fill: false,
            borderColor: '#4caf50',
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: '#4caf50',
          }]
        });

        setPackageData({
          labels: packagesRes.data.labels || [],
          datasets: [{
            data: packagesRes.data.data || [],
            backgroundColor: [
              '#4caf50', '#2196f3', '#ff9800', '#9c27b0', 
              '#607d8b', '#795548', '#e91e63'
            ],
            borderColor: '#fff',
            borderWidth: 2,
          }]
        });

        setActiveUsers(activeUsersRes.data || []);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <PageLayout title="AFRINET" description="Good morning, Afrinet">
      {/* Stats Cards */}
      <Grid container spacing={2} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card sx={{ 
              p: 2, 
              height: '100%',
              background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
              borderRadius: 2,
              boxShadow: 4,
            }}>
              <Box display="flex" alignItems="center">
                <Box sx={{ mr: 2 }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="body1" color="text.primary">{stat.title}</Typography>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.description}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 2, 
            height: 400,
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            borderRadius: 2,
            boxShadow: 4,
          }}>
            <Typography variant="h6" mb={1}>Daily Revenue</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Last 7 days revenue trend
            </Typography>
            <Box sx={{ height: 'calc(100% - 60px)' }}>
              {paymentData ? (
                <Bar data={paymentData} options={chartOptions} />
              ) : (
                <Typography>No revenue data available</Typography>
              )}
            </Box>
          </Card>
        </Grid>

        {/* User Activity Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 2, 
            height: 400,
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            borderRadius: 2,
            boxShadow: 4,
          }}>
            <Typography variant="h6" mb={1}>User Activity</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Daily active users (last 7 days)
            </Typography>
            <Box sx={{ height: 'calc(100% - 60px)' }}>
              {userActivityData ? (
                <Line data={userActivityData} options={chartOptions} />
              ) : (
                <Typography>No user activity data available</Typography>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Package Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 2, 
            height: 400,
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            borderRadius: 2,
            boxShadow: 4,
          }}>
            <Typography variant="h6" mb={1}>Package Popularity</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Most used packages (last 30 days)
            </Typography>
            <Box sx={{ height: 'calc(100% - 60px)' }}>
              {packageData ? (
                <Pie data={packageData} options={chartOptions} />
              ) : (
                <Typography>No package data available</Typography>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Most Active Users Table */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 2, 
            height: 400,
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            borderRadius: 2,
            boxShadow: 4,
          }}>
            <Typography variant="h6" mb={2}>Most Active Users</Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 340 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell align="right">Sessions</TableCell>
                    <TableCell>Last Active</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeUsers.length > 0 ? (
                    activeUsers.map((user) => (
                      <TableRow key={user.username}>
                        <TableCell>{user.username || 'N/A'}</TableCell>
                        <TableCell align="right">{user.sessions || 0}</TableCell>
                        <TableCell>{user.last_active || 'Never'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No active user data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default Dashboard;