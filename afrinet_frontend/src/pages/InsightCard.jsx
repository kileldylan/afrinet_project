import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
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

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, ChartTooltip, Legend);

const insights = [
  {
    title: 'Total Revenue',
    value: 'Ksh 12,500',
    icon: <CreditCard fontSize="large" color="primary" />,
    color: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
    tooltip: 'Sum of all paid transactions',
  },
  {
    title: 'Most Popular Package',
    value: 'Daily Unlimited',
    icon: <QueryStats fontSize="large" color="primary" />,
    color: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
    tooltip: 'Top-selling plan by usage',
  },
  {
    title: 'New Users Today',
    value: 9,
    icon: <PersonAdd fontSize="large" color="primary" />,
    color: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
    tooltip: 'New accounts created today',
  },
  {
    title: 'Peak Usage Hour',
    value: '8 PM - 9 PM',
    icon: <FlashOn fontSize="large" color="primary" />,
    color: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
    tooltip: 'Time of highest usage',
  },
];

const InsightCard = () => {
  const barData = {
    labels: ['Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29', 'Jun 30', 'Jul 01', 'Jul 02'],
    datasets: [
      {
        label: 'Revenue (Ksh)',
        data: [5000, 7500, 6000, 10000, 8000, 9000, 11000, 12500],
        backgroundColor: '#ff9800',
        borderColor: '#f57c00',
        borderWidth: 1,
        barThickness: 20,
      },
    ],
  };

  const lineData = {
    labels: ['Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29', 'Jun 30', 'Jul 01', 'Jul 02'],
    datasets: [
      {
        label: 'Users Online',
        data: [50, 65, 70, 85, 90, 95, 105, 110],
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
    labels: ['Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29', 'Jun 30', 'Jul 01', 'Jul 02'],
    datasets: [
      {
        label: 'Uptime (%)',
        data: [98.5, 99.0, 99.2, 99.1, 99.3, 99.4, 99.5, 99.9],
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
      legend: { position: 'top', labels: { color: '#fff' } },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#fff' } },
      x: { ticks: { color: '#fff' } },
    },
  };

  return (
    <Box sx={{ display: 'flex', fontFamily: 'Roboto, sans-serif', backgroundColor: '#f5f5f5' }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          background: 'linear-gradient(135deg, rgb(64, 161, 241) 0%, rgb(193, 219, 240) 100%)',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={4} color="text.primary">
          Good Afternoon, Afrinet!
        </Typography>

        {/* Insight Cards */}
        <Grid container spacing={4}>
          {insights.map((item, index) => (
            <Grid item xs={12} sm={12} md={6} key={index}>
              <Tooltip title={item.tooltip} arrow>
                <Card
                  sx={{
                    background: item.color,
                    borderRadius: 2,
                    boxShadow: 4,
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'scale(1.03)', boxShadow: 6 },
                    height: 100,
                    display: 'flex',
                    alignItems: 'center',
                    padding: 3,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box mr={3}>{item.icon}</Box>
                      <Box textAlign="right">
                        <Typography variant="h7" color="text.secondary" fontWeight="medium">
                          {item.title}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          ))}

          <Grid item xs={12} sm={12} md={8}>

            <Card sx={{ background: 'linear-gradient(135deg, #40a1f1, #c1dbf0)', borderRadius: 2, p: 2, height: 300 }}>
              <Typography variant="h6" color="text.primary" mb={2}>Revenue Trend</Typography>
              <Bar data={barData} options={chartOptions} />
            </Card>
          </Grid>

          <Grid item xs={12} sm={12} md={8}>
            <Card sx={{ background: 'linear-gradient(135deg, #40a1f1, #c1dbf0)', borderRadius: 2, p: 2, height: 300 }}>
              <Typography variant="h6" color="text.primary" mb={2}>Users Online</Typography>
              <Line data={lineData} options={chartOptions} />
            </Card>
          </Grid>

          <Grid item xs={12} sm={12} md={8}>

            <Card sx={{ background: 'linear-gradient(135deg, #40a1f1, #c1dbf0)', borderRadius: 2, p: 2, height: 300 }}>
              <Typography variant="h6" color="text.primary" mb={2}>Expense Status</Typography>
              <Pie data={pieData} options={chartOptions} />
            </Card>
          </Grid>

          <Grid item xs={12} sm={12} md={8}>
            <Card sx={{ background: 'linear-gradient(135deg, #40a1f1, #c1dbf0)', borderRadius: 2, p: 2, height: 300 }}>
              <Typography variant="h6" color="text.primary" mb={2}>Monthly Revenue Growth</Typography>
              <Bar data={barDataGrowth} options={chartOptions} />
            </Card>
          </Grid>

          <Grid item xs={12} sm={12} md={8}>
            <Card sx={{ background: 'linear-gradient(135deg, #40a1f1, #c1dbf0)', borderRadius: 2, p: 2, height: 300 }}>
              <Typography variant="h6" color="text.primary" mb={2}>User Retention</Typography>
              <Pie data={pieDataRetention} options={chartOptions} />
            </Card>
          </Grid>

          <Grid item xs={12} sm={24} md={6}>
            <Card sx={{ background: 'linear-gradient(135deg, #40a1f1, #c1dbf0)', borderRadius: 2, p: 2, height: 300 }}>
              <Typography variant="h6" color="text.primary" mb={2}>Network Uptime Trend</Typography>
              <Line data={lineDataUptime} options={chartOptions} />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default InsightCard;
