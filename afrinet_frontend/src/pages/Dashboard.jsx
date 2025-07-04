import React from 'react';
import { Box } from '@mui/material';
import PageLayout from './PageLayout';
import Insights from './InsightCard';

const Dashboard = () => {
  return (
    <PageLayout 
      title="Dashboard" 
      description="Overview of your network operations"
    >
      <Insights />
    </PageLayout>
  );
};

export default Dashboard;