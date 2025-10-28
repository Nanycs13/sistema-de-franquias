'use client'
import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css'

import { Spin } from 'antd';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  async function carregarDashboard() {
    try {
      setLoading(true)

      const response = await fetch('/api/dashboard');

      if (!response.ok) {
        console.error('Erro ao carregar dados do dashboard');
        throw new Error('Erro ao carregar dados do dashboard');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDashboard()
  }, [])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Spin size="large" tip="Carregando dados do dashboard..." />
        </div>
      </div>
    )
  }
  return (
    <div className={styles.container}>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
    </div>
  )
}

export default Dashboard;