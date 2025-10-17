 'use client'
  
  import { useState, useEffect } from 'react'
  import { Button, Table, Modal, Form, Input, InputNumber, Select, message, Space, Popconfirm } from 'antd'
  import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
  import styles from './funcionarios.module.css'
  
  
  export default function FuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState([])
    const [franquias, setFranquias] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)
    const [editandoId, setEditandoId] = useState(null)
    const [form] = Form.useForm()
  
    async function carregarFuncionarios() {
      try {
        setLoading(true)
        const response = await fetch('/api/funcionarios')
        const data = await response.json()
        setFuncionarios(data)
      } catch (error) {
        message.error('Erro ao carregar funcionários')
      } finally {
        setLoading(false)
      }
    }
  
    async function carregarFranquias() {
      try {
        const response = await fetch('/api/franquias')
        const data = await response.json()
        setFranquias(data)
      } catch (error) {
        message.error('Erro ao carregar franquias')
      }
    }
  
    useEffect(() => {
      carregarFuncionarios()
      carregarFranquias()
    }, [])
  
    async function salvarFuncionario(values) {
      try {
        const url = editandoId ? `/api/funcionarios/${editandoId}` : '/api/funcionarios'
        const payload = { ...values }
        const response = await fetch(url, {
          method: editandoId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (response.ok) {
          message.success(`Funcionário ${editandoId ? 'atualizado' : 'criado'} com sucesso!`)
          setModalVisible(false)
          form.resetFields()
          setEditandoId(null)
          carregarFuncionarios()
        } else {
          message.error('Erro ao salvar funcionário')
        }
      } catch (error) {
        message.error('Erro ao salvar funcionário')
      }
    }
  
    async function removerFuncionario(id) {
      try {
        const response = await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' })
        if (response.ok) {
          message.success('Funcionário removido!')
          carregarFuncionarios()
        } else {
          message.error('Erro ao remover funcionário')
        }
      } catch (error) {
        message.error('Erro ao remover funcionário')
      }
    }
  
    function editar(funcionario) {
      setEditandoId(funcionario.id)
      form.setFieldsValue({
        nome: funcionario.nome,
        email: funcionario.email,
        cargo: funcionario.cargo,
        salario: funcionario.salario,
        franquiaId: funcionario.franquiaId,
      })
      setModalVisible(true)
    }
  
    const columns = [
      {
        title: 'Nome',
        dataIndex: 'nome',
        key: 'nome',
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Cargo',
        dataIndex: 'cargo',
        key: 'cargo',
      },
      {
        title: 'Salário',
        dataIndex: 'salario',
        key: 'salario',
        render: (valor) => valor
          ? `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : 'R$ 0,00'
      },
      {
        title: 'Franquia',
        dataIndex: ['franquia', 'nome'],
        key: 'franquia',
        render: (nome) => nome || 'Sem franquia'
      },
      {
        title: 'Ações',
        key: 'acoes',
        render: (_, record) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => editar(record)}
              size="small"
            />
            <Popconfirm
              title="Confirma remover?"
              onConfirm={() => removerFuncionario(record.id)}
              okText="Sim"
              cancelText="Não"
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Popconfirm>
          </Space>
        ),
      }
    ]
  
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <UserOutlined className={styles.titleIcon} /> Funcionários
          </h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={styles.addButton}
            onClick={() => setModalVisible(true)}
          >
            Adicionar
          </Button>
        </div>
  
        <div className={styles.tableContainer}>
          <Table
            columns={columns}
            dataSource={funcionarios}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
  
        <Modal
          title={editandoId ? 'Editar Funcionário' : 'Novo Funcionário'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false)
            setEditandoId(null)
            form.resetFields()
          }}
          onOk={() => form.submit()}
          okText="Salvar"
          cancelText="Cancelar"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={salvarFuncionario}
          >
            <Form.Item
              name="nome"
              label="Nome"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Input />
            </Form.Item>
  
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Campo obrigatório' },
                { type: 'email', message: 'Email inválido' }
              ]}
            >
              <Input />
            </Form.Item>
  
            <Form.Item
              name="cargo"
              label="Cargo"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Input />
            </Form.Item>
  
            <Form.Item
              name="salario"
              label="Salário"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                prefix="R$"
                min={0}
                precision={2}
                decimalSeparator=","
                step={100}
              />
            </Form.Item>

            {/* telefone removed for funcionarios - only franquias keep telefone */}
  
            <Form.Item
              name="franquiaId"
              label="Franquia"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Select
                placeholder="Selecione uma franquia"
                showSearch
                optionFilterProp="children"
              >
                {franquias.map(franquia => (
                  <Select.Option key={franquia.id} value={franquia.id}>
                    {franquia.nome} - {franquia.cidade}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
  