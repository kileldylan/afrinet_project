import React from 'react';
import { Box } from '@mui/material';
import PageLayout from './PageLayout';
import Insights from './InsightCard';

const Dashboard = () => {
  return (
    <PageLayout>
      <Insights />
    </PageLayout>
  );
};

export default Dashboard;