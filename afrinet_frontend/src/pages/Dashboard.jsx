import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Checkbox,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  PersonAdd,
  FlashOn,
  QueryStats,
  CreditCard,
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
  Legend,
} from 'chart.js';
import PageLayout from './PageLayout';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, ChartTooltip, Legend);

const Dashboard = () => {
  // Stats data
  const stats = [
    {
      title: 'Amount this month',
      value: 'Ksh 1,180.00',
      description: 'Total earned this month',
      icon: <CreditCard color="primary" />,
      tooltip: 'Sum of all paid transactions this month',
    },
    {
      title: 'St16 balance',
      value: 'Ksh 0.20',
      description: 'Your arm balance',
      icon: <QueryStats color="primary" />,
      tooltip: 'Current balance in your account',
    },
    {
      title: 'Total clients',
      value: '282',
      description: 'Number of clients',
      icon: <PersonAdd color="primary" />,
      tooltip: 'Total registered clients',
    },
  ];

  // Chart data
  const paymentData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Payments (Ksh)',
        data: [12000, 10000, 8000, 6000, 4000, 2000, 0],
        backgroundColor: '#ff9800',
        borderColor: '#f57c00',
        borderWidth: 1,
        barThickness: 20,
      },
    ],
  };

  const usersData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active Users',
        data: [10, 15, 18, 20, 23, 18, 12],
        fill: false,
        borderColor: '#4caf50',
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: '#4caf50',
      },
    ],
  };

  const pieData = {
    labels: ['Paid', 'Pending'],
    datasets: [
      {
        data: [70, 30],
        backgroundColor: ['#4caf50', '#f44336'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const barDataGrowth = {
    labels: ['May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue Growth (%)',
        data: [5, 12, 8],
        backgroundColor: '#ffca28',
        borderColor: '#ffa000',
        borderWidth: 1,
        barThickness: 30,
      },
    ],
  };

  const pieDataRetention = {
    labels: ['Retained', 'Churned'],
    datasets: [
      {
        data: [85, 15],
        backgroundColor: ['#81c784', '#e57373'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const lineDataUptime = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Uptime (%)',
        data: [98.5, 99.0, 99.2, 99.1, 99.3, 99.4, 99.5],
        fill: false,
        borderColor: '#4caf50',
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: '#4caf50',
      },
    ],
  };

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

  return (
    <PageLayout 
      title="AFRINET" 
      description="Good morning, Afrinet"
      disablePadding // Optional prop to remove default padding if needed
    >
      {/* Stats Cards - Single Row */}
      <Grid container spacing={2} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Tooltip title={stat.tooltip} arrow>
              <Card sx={{ 
                p: 2, 
                height: '100%',
                background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
                borderRadius: 2,
                boxShadow: 4,
              }}>
                <Box display="flex" alignItems="center">
                  <Checkbox />
                  <Box ml={1}>
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
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Charts - Two per row */}
      <Grid container spacing={3}>
        {/* Payments Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 2, 
            height: 300,
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            borderRadius: 2,
            boxShadow: 4,
          }}>
            <Typography variant="h6" mb={1}>Payments</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Payments and expenses trend
            </Typography>
            <Box sx={{ height: 'calc(100% - 60px)' }}>
              <Bar data={paymentData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>

        {/* Active Users Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 2, 
            height: 300,
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            borderRadius: 2,
            boxShadow: 4,
          }}>
            <Typography variant="h6" mb={1}>Active Users</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Average (10) users, Peak (23) users this week
            </Typography>
            <Box sx={{ height: 'calc(100% - 60px)' }}>
              <Line data={usersData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>

        {/* Expense Status Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 2, 
            height: 300,
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            borderRadius: 2,
            boxShadow: 4,
          }}>
            <Typography variant="h6" mb={1}>Expense Status</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Paid vs pending expenses
            </Typography>
            <Box sx={{ height: 'calc(100% - 60px)' }}>
              <Pie data={pieData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>

        {/* Revenue Growth Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 2, 
            height: 300,
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            borderRadius: 2,
            boxShadow: 4,
          }}>
            <Typography variant="h6" mb={1}>Revenue Growth</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Monthly revenue growth percentage
            </Typography>
            <Box sx={{ height: 'calc(100% - 60px)' }}>
              <Bar data={barDataGrowth} options={chartOptions} />
            </Box>
          </Card>
        </Grid>

        {/* User Retention Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 2, 
            height: 300,
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            borderRadius: 2,
            boxShadow: 4,
          }}>
            <Typography variant="h6" mb={1}>User Retention</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Retained vs churned users
            </Typography>
            <Box sx={{ height: 'calc(100% - 60px)' }}>
              <Pie data={pieDataRetention} options={chartOptions} />
            </Box>
          </Card>
        </Grid>

        {/* Network Uptime Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 2, 
            height: 300,
            background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
            borderRadius: 2,
            boxShadow: 4,
          }}>
            <Typography variant="h6" mb={1}>Network Uptime</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Weekly network uptime percentage
            </Typography>
            <Box sx={{ height: 'calc(100% - 60px)' }}>
              <Line data={lineDataUptime} options={chartOptions} />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default Dashboard;