// Imports, sempre vai ser assim dentro de route.
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma'

// GetById, e precisa ter request, { params } 
export async function GET(request, { params }) {
    try {
        // Await params and validate id
        const routeParams = await params
        const id = parseInt(routeParams.id, 10)
        if (Number.isNaN(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
        }

        //Capturei franquia, no singular.
        //Onde o id é o id que esta vindo de params
        const franquia = await prisma.franquia.findUnique({
            // Where/Onde especifica quem
            where: { id },
            //Include pega o relacionamento e os funcionarios dele.
            include: {
                funcionarios: true,
                //count é o total
                _count: {
                    select: { funcionarios: true }
                }
            }
        })

        if (!franquia) {
            return NextResponse.json(
                { error: 'Franquia não encontrada' },
                { status: 404 }
            )
        }

        return NextResponse.json(franquia)

    } catch (error) {
        console.error('Erro ao buscar franquia: ', error)
        return NextResponse.json(
            { error: 'Erro interno de servidor' },
            { status: 500 }
        )
    }
}

export async function DELETE(request, { params }) {
    try {
        const routeParams = await params
        const id = parseInt(routeParams.id, 10)
        if (Number.isNaN(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
        }

        //Verificar se existe
        const franquia = await prisma.franquia.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { funcionarios: true }
                }
            }
        })

        if (!franquia) {
            return NextResponse.json(
                { error: 'Franquia não encontrada' },
                { status: 404 }
            )
        }

        //Verificar se há dependencias com funcionarios
        if (franquia._count.funcionarios > 0) {
            return NextResponse.json(
                { error: 'Não é possivel deletar franquia com funcionários ativos!' },
                { status: 400 }
            )
        }

        await prisma.franquia.delete({
            where: { id }
        })

        return NextResponse.json({
            apagado: franquia,
            msg: 'Franquia apagada com sucesso'
        })

    } catch (error) {
        console.error('Erro ao deletar franquia', error)
        return NextResponse.json(
            { error: 'Erro interno de servidor' },
            { status: 500 }
        )
    }
}

export async function PUT(request, { params }) {
    try {
        // Await params and validate id
        const routeParams = await params
        const id = parseInt(routeParams.id, 10)
        if (Number.isNaN(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
        }

        // parse JSON body safely
        const data = await request.json().catch(() => null)
        if (!data || typeof data !== 'object') {
            return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
        }

        const { nome, cidade, endereco, telefone } = data;

        // check that at least one field is provided
        if (!nome && !cidade && !endereco && !telefone) {
            return NextResponse.json({ error: 'Voce precisa enviar algum dado' }, { status: 400 })
        }

        //Verificar se existe
        const franquiaExiste = await prisma.franquia.findUnique({
            where: { id }
        })

        if (!franquiaExiste) {
            return NextResponse.json(
                { error: 'Franquia não encontrada' },
                { status: 404 }
            )
        }

        // Se esta tudo OK, atualizo no banco de dados
        const franquia = await prisma.franquia.update({
            where: { id },
            data: {
                nome: nome ?? franquiaExiste.nome,
                cidade: cidade ?? franquiaExiste.cidade,
                endereco: endereco ?? franquiaExiste.endereco,
                telefone: telefone ?? franquiaExiste.telefone
            }
        })

        // Retorna a resposta
        return NextResponse.json({
            franquia: franquia,
            msg: 'Franquia atualizada com sucesso!'
        })


    } catch (error) {
        console.error('Erro ao atualizar franquia', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}