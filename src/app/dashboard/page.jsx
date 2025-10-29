'use client'

import { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Statistic, Spin, message, Alert, Button, Modal, Radio, Select, Space } from 'antd'
import {
  DashboardOutlined,
  ShopOutlined,
  UserOutlined,
  DollarOutlined,
  WalletOutlined,
  WarningOutlined
} from '@ant-design/icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Line,
  Legend
} from 'recharts'
import styles from './dashboard.module.css'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [showCargosModal, setShowCargosModal] = useState(false)
  const [labelMode, setLabelMode] = useState('percent') // 'none' | 'percent'
  const [precision, setPrecision] = useState(0)

  // prepare cargos list for chart and modal (defensive)
  const cargosList = Array.isArray(dashboardData?.funcionariosPorCargo)
    ? dashboardData.funcionariosPorCargo.slice().sort((a, b) => b.total - a.total)
    : []

  // ==========================================
  // CARREGAR DADOS DA API
  // ==========================================
  async function carregarDashboard() {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')

      if (!response.ok) {
        throw new Error('Erro ao carregar dashboard')
      }

      const data = await response.json()
      console.log('📊 Dados recebidos:', data)
      setDashboardData(data)

    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error)
      message.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Carregar quando o componente montar
  useEffect(() => {
    carregarDashboard()
  }, [])

  // ==========================================
  // CORES PARA OS GRÁFICOS
  // ==========================================
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']

  // ==========================================
  // COLUNAS DAS TABELAS
  // ==========================================

  // Tabela: Top 5 Franquias
  const columnsTopFranquias = [
    {
      title: 'Franquia',
      dataIndex: 'nome',
      key: 'nome',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Cidade',
      dataIndex: 'cidade',
      key: 'cidade'
    },
    {
      title: 'Funcionários',
      dataIndex: 'totalFuncionarios',
      key: 'totalFuncionarios',
      align: 'center'
    },
    {
      title: 'Folha Salarial',
      dataIndex: 'folhaSalarial',
      key: 'folhaSalarial',
      render: (value) => `R$ ${Number(value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }
  ]

  // Tabela: Últimas Franquias
  const columnsUltimasFranquias = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome'
    },
    {
      title: 'Cidade',
      dataIndex: 'cidade',
      key: 'cidade'
    },
    {
      title: 'Funcionários',
      dataIndex: 'totalFuncionarios',
      key: 'totalFuncionarios',
      align: 'center'
    },
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('pt-BR')
    }
  ]

  // Tabela: Últimos Funcionários
  const columnsUltimosFuncionarios = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome'
    },
    {
      title: 'Cargo',
      dataIndex: 'cargo',
      key: 'cargo'
    },
    {
      title: 'Salário',
      dataIndex: 'salario',
      key: 'salario',
      render: (value) => `R$ ${Number(value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    },
    {
      title: 'Franquia',
      dataIndex: 'franquia',
      key: 'franquia'
    }
  ]

  // Tabela: Alertas - Franquias sem funcionários
  const columnsFranquiasSemFuncionarios = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome'
    },
    {
      title: 'Cidade',
      dataIndex: 'cidade',
      key: 'cidade'
    },
    {
      title: 'Data Cadastro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('pt-BR')
    }
  ]

  // Tabela: Alertas - Funcionários sem franquia
  const columnsFuncionariosSemFranquia = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome'
    },
    {
      title: 'Cargo',
      dataIndex: 'cargo',
      key: 'cargo'
    },
    {
      title: 'Salário',
      dataIndex: 'salario',
      key: 'salario',
      render: (value) => `R$ ${Number(value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }
  ]

  // ==========================================
  // LOADING E ERROS
  // ==========================================
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Spin size="large" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>Erro ao carregar dados do dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>

      {/* ==========================================
          HEADER
          ========================================== */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <DashboardOutlined className={styles.titleIcon} />
          Dashboard - Business Intelligence
        </h1>
      </div>

      {/* ==========================================
          CARDS DE TOTAIS
          ========================================== */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={12} sm={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Total de Franquias"
              value={dashboardData.totalFranquias}
              prefix={<ShopOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Total de Funcionários"
              value={dashboardData.totalFuncionarios}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Salário Médio"
              value={dashboardData.salarioMedio}
              prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
              precision={2}
              valueStyle={{ color: '#fa8c16' }}
              formatter={(value) => `R$ ${Number(value ?? 0).toLocaleString('pt-BR')}`}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="Folha Salarial Total"
              value={dashboardData.folhaTotal ?? dashboardData.somaSalarios}
              prefix={<WalletOutlined style={{ color: '#eb2f96' }} />}
              precision={2}
              valueStyle={{ color: '#eb2f96' }}
              formatter={(value) => `R$ ${Number(value ?? 0).toLocaleString('pt-BR')}`}
            />
          </Card>
        </Col>
      </Row>

      {/* ==========================================
          GRÁFICOS - PRIMEIRA LINHA
          ========================================== */}
      <Row gutter={[16, 16]} className={styles.chartsRow}>

        {/* Franquias por Cidade */}
        <Col xs={24} lg={12}>
          <Card title="📍 Franquias por Cidade" className={styles.chartCard}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.franquiasPorCidade}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cidade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Funcionários por Cargo */}
        <Col xs={24} lg={12}>
          <Card title="👥 Funcionários por Cargo" className={styles.chartCard}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.funcionariosPorCargo}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                  label={({ cargo, total }) => `${cargo}: ${total}`}
                >
                  {dashboardData.funcionariosPorCargo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

      </Row>

      {/* ==========================================
          GRÁFICOS - SEGUNDA LINHA
          ========================================== */}
      <Row gutter={[16, 16]} className={styles.chartsRow}>

        {/* Distribuição por Faixa Salarial */}
        <Col xs={24} lg={24}>
          <Card title="💰 Distribuição por Faixa Salarial" className={styles.chartCard}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.faixasSalariais || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="faixa" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

      </Row>

      {/* ==========================================
          TABELAS - RANKINGS E RECENTES
          ========================================== */}
      <Row gutter={[16, 16]} className={styles.tablesRow}>

        {/* Top 5 Franquias */}
        <Col xs={24} lg={8}>
          <Card title="🏆 Top 5 Franquias" className={styles.tableCard}>
            <Table
              dataSource={dashboardData.topFranquias}
              columns={columnsTopFranquias}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Últimas Franquias */}
        <Col xs={24} lg={8}>
          <Card title="🆕 Últimas Franquias Cadastradas" className={styles.tableCard}>
            <Table
              dataSource={dashboardData.ultimasFranquias}
              columns={columnsUltimasFranquias}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Últimos Funcionários */}
        <Col xs={24} lg={8}>
          <Card title="🆕 Últimos Funcionários Cadastrados" className={styles.tableCard}>
            <Table
              dataSource={dashboardData.ultimosFuncionarios}
              columns={columnsUltimosFuncionarios}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

      </Row>

      {/* ==========================================
          ALERTAS
          ========================================== */}
      {(dashboardData.franquiasSemFuncionarios.length > 0 || dashboardData.funcionariosSemFranquia.length > 0) && (
        <Row gutter={[16, 16]} className={styles.alertsRow}>

          {/* Franquias sem Funcionários */}
          {dashboardData.franquiasSemFuncionarios.length > 0 && (
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    Franquias sem Funcionários ({dashboardData.franquiasSemFuncionarios.length})
                  </span>
                }
                className={styles.alertCard}
              >
                <Alert
                  message="Atenção!"
                  description="Estas franquias não possuem funcionários cadastrados"
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Table
                  dataSource={dashboardData.franquiasSemFuncionarios}
                  columns={columnsFranquiasSemFuncionarios}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          )}

          {/* Funcionários sem Franquia */}
          {dashboardData.funcionariosSemFranquia.length > 0 && (
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    Funcionários sem Franquia ({dashboardData.funcionariosSemFranquia.length})
                  </span>
                }
                className={styles.alertCard}
              >
                <Alert
                  message="Atenção!"
                  description="Estes funcionários não estão alocados em nenhuma franquia"
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Table
                  dataSource={dashboardData.funcionariosSemFranquia}
                  columns={columnsFuncionariosSemFranquia}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          )}

        </Row>
      )}

    </div>
  )
}