//Importar o nextResponse da lib next/server.
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PrismaClient } from '@prisma/client'


//GetById
export async function GET(request, { params }) {
    try {
        const routeParams = await params
        const id = parseInt(routeParams.id, 10)
        if (Number.isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

        const funcionario = await prisma.funcionario.findUnique({
            where: { id },
            include: {
                // Selecionar dados/colunas especificos. Caso queira todos, olhar em franquias e fazer igual
                franquia: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        })

        if (!funcionario) {
            return NextResponse.json(
                { error: 'Funcionário não encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json(funcionario);

    } catch (error) {
        console.error('Erro interno de servidor', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

//Delete
export async function DELETE(request, { params }) {
    try {
        //capturar o id pelo params
        const routeParams = await params
        const id = parseInt(routeParams.id, 10)
        if (Number.isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

        // Verificar se existe funcionario
        const existeFuncionario = await prisma.funcionario.findUnique({
            where: { id }
        })

        // Verifico e dou uma mensagem de erro
        if (!existeFuncionario) {
            return NextResponse.json(
                { error: 'Funcionário não encontrado' },
                { status: 404 }
            )
        }

        // Realiza o delete
        await prisma.funcionario.delete({
            where: { id }
        })

        // Resposta com o funcionario que foi apagado.
        return NextResponse.json({
            apagado: existeFuncionario,
            msg: 'Funcionário apagada com sucesso'
        })

    } catch (error) {
        console.error('Erro ao deletar funcionário', error)
        return NextResponse.json(
            { error: 'Erro interno de servidor' },
            { status: 500 }
        )
    }

}

//Editar
export async function PUT(request, { params }) {
    try {
        const routeParams = await params
        const id = parseInt(routeParams.id, 10)
        if (Number.isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

        const data = await request.json().catch(() => null)
        if (!data || typeof data !== 'object') return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })

        const { nome, email, cargo, salario, franquiaId } = data

        // Verificar se funcionario existe
        const funcionarioExiste = await prisma.funcionario.findUnique({
            where: { id }
        })

        if (!funcionarioExiste) {
            return NextResponse.json(
                { error: 'Funcionário não encontrado' },
                { status: 404 }
            )
        }

        // Verificar se estou passando algum dado, ali de data
        if (!data || Object.keys(data).length === 0) {
            return NextResponse.json(
                { error: 'Voce precisa enviar algum dado' },
                { status: 400 }
            )
        }

        // Verifico se tem franquiaId, entao verifico se franquia existe
        if (franquiaId) {
            const franquiaIdNum = parseInt(franquiaId, 10)
            if (Number.isNaN(franquiaIdNum)) return NextResponse.json({ error: 'franquiaId inválido' }, { status: 400 })
            // Verificar se franquia existe usando o franquiaId
            const franquia = await prisma.franquia.findUnique({
                where: { id: franquiaIdNum }
            })

            // Verifico
            if (!franquia) {
                return NextResponse.json(
                    { error: 'Franquia não encontrada, verifique o id para adicionar o funcionário' },
                    { status: 404 }
                )
            }
        }

        if (email) {
            // Verificar se o email já existe, pois os emails sao unique
            const emailExiste = await prisma.funcionario.findFirst({
                where: {
                    email,
                    id: { not: id }
                }
            })

            if (emailExiste) {
                return NextResponse.json(
                    { error: 'Email já está em uso!' },
                    { status: 400 }
                )
            }
        }

        const funcionario = await prisma.funcionario.update({
            where: { id },
            data: {
                nome: nome ?? funcionarioExiste.nome,
                email: email ?? funcionarioExiste.email, // if ternário reduzido
                cargo: cargo ?? funcionarioExiste.cargo, // if ternário
                salario: salario ? parseFloat(salario) : funcionarioExiste.salario,
                franquiaId: franquiaId ? parseInt(franquiaId) : funcionarioExiste.franquiaId
            }
        })

        // Retorna a resposta
        return NextResponse.json({
            funcionario: funcionario,
            msg: 'Funcionario atualizado com sucesso!'
        })

    } catch (error) {
        console.error('Erro ao atualizar funcionario', error)
        return NextResponse.json(
            { error: 'Erro interno de servidor', error },
            { status: 500 }
        )
    }
}