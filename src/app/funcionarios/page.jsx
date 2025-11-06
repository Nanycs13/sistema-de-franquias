'use client'

import React, { useEffect, useState } from 'react'
import styles from './funcionarios.module.css'
import { Table, Modal, Button, Form, Input, InputNumber, Space, Popconfirm, Select, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Funcionarios() {

    const [franquias, setFranquias] = useState([])
    const [funcionarios, setFuncionarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)
    const [editandoId, setEditandoId] = useState(null)
    const [form] = Form.useForm()
    const [filtroNome, setFiltroNome] = useState('')

    async function carregarFuncionarios() {
        try {
            setLoading(true)
            const response = await fetch('/api/funcionarios')
            if (response.ok) {
                const data = await response.json()
                setFuncionarios(data || [])
                toast.success('Funcionários carregados com sucesso!')
            } else {
                const text = await response.text().catch(() => '')
                console.error('Erro ao carregar funcionarios', text)
                toast.error('Erro ao carregar funcionários')
            }
        } catch (error) {
            console.error('Erro ao carregar funcionarios', error)
            toast.error('Erro ao carregar funcionários');
        } finally {
            setLoading(false)
        }
    }

    async function carregarFranquias() {
        try {
            const response = await fetch('/api/franquias')
            if (response.ok) {
                const data = await response.json()
                setFranquias(data || [])
            } else {
                const text = await response.text().catch(() => '')
                console.error('Erro ao carregar franquias', text)
                toast.error('Erro ao carregar franquias')
            }
        } catch (error) {
            console.error('Erro ao carregar franquias', error)
            toast.error('Erro ao carregar franquias')
        }
    }

    const showModal = () => {
        setModalVisible(true);
    }

    const closeModal = () => {
        setModalVisible(false)
        form.resetFields()
        setEditandoId(null)
    }

    const okModal = () => {
        form.submit()
    }

    async function salvarFuncionario(values) {
        try {
            const url = editandoId ? `/api/funcionarios/${editandoId}` : '/api/funcionarios'
            // sanitize/normalize payload
            const payload = { ...values }
            if (payload.franquiaId) payload.franquiaId = Number(payload.franquiaId)
            if (payload.nome) payload.nome = String(payload.nome).trim()
            if (payload.email) payload.email = String(payload.email).trim()
            if (payload.cargo) payload.cargo = String(payload.cargo).trim()

            const response = await fetch(url, {
                method: editandoId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                setModalVisible(false)
                form.resetFields()
                const wasEditing = Boolean(editandoId)
                setEditandoId(null)
                await carregarFuncionarios()

                if (wasEditing) {
                    toast.success('Funcionário editado')
                } else {
                    toast.success('Funcionário cadastrado')
                }

            } else {
                const err = await response.json().catch(() => ({ error: 'Erro' }))
                console.error('Erro ao salvar funcionario', err)
                toast.error(err.error || 'Erro ao salvar funcionário')
            }
        } catch (error) {
            console.error('Erro na funcao de salvar funcionario', error)
            toast.error('Erro ao salvar funcionário')
        }

    }

    async function removerFuncionario(id) {
        try {
            const response = await fetch(`/api/funcionarios/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await carregarFuncionarios();
                toast.success('Funcionário removido')
            } else {
                const err = await response.json().catch(() => ({ error: 'Erro' }))
                console.error('Erro ao remover funcionario', err)
                toast.error(err.error || 'Erro ao remover funcionario')
            }
        } catch (error) {
            console.error('Erro ao remover funcionario', error)
            toast.error('Erro ao remover funcionário')
        }
    }

    function editar(funcionario) {
        setEditandoId(funcionario.id)
        form.setFieldsValue(funcionario)
        setModalVisible(true)
    }

    function formatarSalario(valor) {
        if (valor == null) return 'R$ 0,00'
        const num = Number(valor) || 0
        return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }

    const colunas = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome'
        },
        {
            title: 'E-mail',
            dataIndex: 'email',
            key: 'email'
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
            render: (valor) => formatarSalario(valor)
        },
        {
            title: 'Franquia',
            dataIndex: ['franquia', 'nome'],
            key: 'franquia',
            render: (nome) => nome ?? 'Sem franquia'

        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, funcionario) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size='small'
                        onClick={() => editar(funcionario)}
                    />
                    <Popconfirm
                        title='Confirma remover?'
                        okText="Sim"
                        cancelText="Não"
                        onConfirm={() => removerFuncionario(funcionario.id)}
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            size='small'
                            danger
                        />
                    </Popconfirm>

                </Space>

            )
        }
    ]

    useEffect(() => {
        carregarFranquias()
        carregarFuncionarios()
    }, [])

    const funcionariosFiltrados = funcionarios.filter(f => {
        const pesquisa = filtroNome.toLowerCase()
        return (
            f.nome.toLowerCase().includes(pesquisa) ||
            f.cargo.toLowerCase().includes(pesquisa) ||
            f.email.toLowerCase().includes(pesquisa)
        )
    });

    return (
        <div className={styles.container}>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className={styles.top}>
                <h1 className={styles.title}> Funcionarios </h1>
                <Button
                    type='primary'
                    icon={<PlusOutlined />}
                    className={styles.addButton}
                    onClick={showModal}
                >
                    Adicionar
                </Button>
            </div>

            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder='Buscar por funcionário'
                    prefix={<UserOutlined />}
                    value={filtroNome}
                    onChange={(e) => setFiltroNome(e.target.value)}
                    allowClear
                    style={{ maxWidth: 400 }}
                />
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={colunas}
                    dataSource={funcionariosFiltrados}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        defaultPageSize: 15,
                        showSizeChanger: true,
                        pageSizeOptions: ['10','15','20','50'],
                        showTotal: (total) => `Total de ${total} funcionários`
                    }}
                    locale={{
                        emptyText: <Empty description="Nenhum funcionário encontrado" />
                    }}
                />
            </div>

            <Modal
                title={editandoId ? 'Editar funcionário' : 'Adicionar funcionário'}
                open={modalVisible}
                onCancel={closeModal}
                onOk={okModal}
                maskClosable={false}
                keyboard={false}
            >
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={salvarFuncionario}
                >

                    <Form.Item
                        name='nome'
                        label='Nome'
                        rules={[{ required: true, message: 'Campo obrigatório' }, { min: 3, message: 'Nome deve ter no mínimo 3 caracteres' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name='email'
                        label='E-mail'
                        rules={[
                            { required: true, message: 'Campo obrigatório' },
                            { type: 'email', message: 'Email inválido' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name='cargo'
                        label='Cargo'
                        rules={[{ required: true, message: 'Campo obrigatório' }, { min: 3, message: 'Cargo deve ter no mínimo 3 caracteres' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name='salario'
                        label='Salário'
                        rules={[{ required: true, message: 'Campo obrigatório' }, {
                            type: 'number',
                            min: 100,
                            message: 'Salário deve ser maior que 100'
                        }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            step={100}
                            prefix='R$'
                            min={0}
                            precision={2}
                            decimalSeparator=','
                            placeholder='0,00'
                        />
                    </Form.Item>

                    <Form.Item
                        name='franquiaId'
                        label='Franquia'
                        rules={[{ required: true, message: 'Campo obrigatório' }]}
                    >
                        <Select
                            placeholder='Selecione uma franquia'
                            showSearch
                            optionFilterProp='children'
                        >
                            {franquias.map(franquia => (
                                <Select.Option key={franquia.id} value={franquia.id}>
                                    {franquia.nome}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default Funcionarios