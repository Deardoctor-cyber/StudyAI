/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { DoubtSolver } from './components/DoubtSolver';
import { StudyPlanner } from './components/StudyPlanner';
import { MockTests } from './components/MockTests';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'doubts':
        return <DoubtSolver />;
      case 'planner':
        return <StudyPlanner />;
      case 'tests':
        return <MockTests />;
      default:
        return <Home />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
