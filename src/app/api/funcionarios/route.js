//Importar o nextResponse da lib next/server.
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const funcionarios = await prisma.funcionario.findMany({
            include: {
                franquia: true // Aqui eu incluo a franquia do funcionario na resposta
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(funcionarios);

    } catch (error) {
        console.error('Erro ao buscar funcionários', error);
        return NextResponse.json(
            { error: 'Error interno de servidor!' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        const data = await request.json().catch(() => null)
        if (!data || typeof data !== 'object') return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
        const { nome, email, cargo, salario, franquiaId } = data;

        //Validacao de todos os dados sao obrigatorios

        if (!nome || !email || !cargo || !salario || !franquiaId) {
            return NextResponse.json(
                { error: 'Todos os campos são obrigatórios!' },
                { status: 400 }
            )
        }

        // Verificar se existe a franquia que eu quero cadastrar meu funcionario
        const franquiaIdNum = parseInt(franquiaId, 10)
        if (Number.isNaN(franquiaIdNum)) return NextResponse.json({ error: 'franquiaId inválido' }, { status: 400 })
        const franquiaExiste = await prisma.franquia.findUnique({
            where: { id: franquiaIdNum }
        })

        if (!franquiaExiste) {
            return NextResponse.json(
                { error: 'Id da franquia não existe, verifique.' },
                { status: 404 }
            )
        }

        // Verificar se o email é unico

        const emailExiste = await prisma.funcionario.findUnique({
            where: { email }
        })

        if (emailExiste) {
            return NextResponse.json(
                { error: 'Email já está em uso, tente outro!' },
                { status: 400 }
            )
        }

        // Criar o funcionario
        const salarioNum = parseFloat(salario)
        if (Number.isNaN(salarioNum)) return NextResponse.json({ error: 'salario inválido' }, { status: 400 })

        const funcionario = await prisma.funcionario.create({
            data: {
                nome,
                email,
                cargo,
                salario: salarioNum,
                franquiaId: franquiaIdNum
            }
        })

        // Retornar a resposta
        return NextResponse.json(funcionario, { status: 201 })

    } catch (error) {
        console.error('Erro ao criar funcionário', error);
        return NextResponse.json(
            { error: 'Error interno de servidor!' },
            { status: 500 }
        )
    }
}