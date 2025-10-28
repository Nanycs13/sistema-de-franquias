import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // trazer todos os dados do banco
    const franquias = await prisma.franquia.findMany({
      include: {
        funcionarios: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const funcionarios = await prisma.funcionario.findMany({
      include: {
        franquia: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // total de franquias e funcionarios
    const totalFranquias = franquias.length;
    const totalFuncionarios = funcionarios.length;

    // somas dos salarios
    let somaSalarios = 0;

    funcionarios.forEach((funcionario) => {
      somaSalarios += funcionario.salario;
    });

    //media dos salarios
    const salarioMedio =
      totalFuncionarios > 0 ? somaSalarios / totalFuncionarios : 0;

    //agrupamento: franquias por cidade
    const cidades = [];

    franquias.forEach((franquia) => {
      const existe = cidades.find((c) => c.cidade === franquia.cidade);
      if (existe) {
        existe.total++;
      } else {
        cidades.push({
          cidade: franquia.cidade,
          total: 1,
        });
      }
    });

    cidades.sort((a, b) => b.total - a.total);

    //agrupamento de funcionarios por cargo
    const cargos = [];

    funcionarios.forEach((funcionario) => {
      const existe = cargos.find((c) => c.cargo === funcionario.cargo);
      if (existe) {
        existe.total++;
      } else {
        cargos.push({
          cargo: funcionario.cargo,
          total: 1,
        });
      }
    });

    cargos.sort((a, b) => b.total - a.total);

    // agrupamento de funcionario por faixa salarial

    let ate2mil = 0;
    let de2a4mil = 0;
    let de4a6mil = 0;
    let de6a8mil = 0;
    let acima8mil = 0;

    funcionarios.forEach((f) => {
      if (f.salario <= 2000) {
        ate2mil++;
      } else if (f.salario <= 4000) {
        de2a4mil++;
      } else if (f.salario <= 6000) {
        de4a6mil++;
      } else if (f.salario <= 8000) {
        de6a8mil++;
      } else {
        acima8mil++;
      }
    });

    //array para ficar bonito a info e o frontend mais facil de manipular
    const faixaSalarial = [
      { faixa: "Até R$2.000", total: ate2mil },
      { faixa: "R$2.001 a R$4.000", total: de2a4mil },
      { faixa: "R$4.001 a R$6.000", total: de4a6mil },
      { faixa: "R$6.001 a R$8.000", total: de6a8mil },
      { faixa: "Acima de R$8.000", total: acima8mil },
    ];

    //top 5 franquias, pela quantidade de funcionarios, exibindo tambem o salario total dessa franquia
 const todasFranquias = []

        franquias.forEach(franquia => {
            //Calcular os salarios de todos os funcionarios dessa franquia

            let salarios = 0
            let quantidade = franquia.funcionarios.length

            franquia.funcionarios.forEach(f => {
                salarios += f.salario
            })

            todasFranquias.push({
                id: franquia.id,
                nome: franquia.nome,
                cidade: franquia.cidade,
                totalFuncionarios: quantidade,
                totalSalario: salarios
            })
        })

    //ordenar todasFranquias
    todasFranquias.sort((a, b) => b.totalFuncionarios - a.totalFuncionarios);

    const top5Franquias = todasFranquias.slice(0, 5);

    // 5 ultimas franquias criadas e 5 ultimos funcionarios criados
    const ultimas5Franquia = franquias.slice(0, 5).map((franquia) => ({
      id: franquia.id,
      nome: franquia.nome,
      cidade: franquia.cidade,
      totalFuncionarios: franquia.funcionarios.length,
      createdAt: franquia.createdAt,
    }));

    //5 ultimos funcionarios
    let ultimos5Funcionarios = funcionarios.slice(0, 5);
    ultimos5Funcionarios = ultimos5Funcionarios.map((funcionario) => ({
      id: funcionario.id,
      nome: funcionario.nome,
      cargo: funcionario.cargo,
      franquia: funcionario.franquia?.nome || "N/A",
      createdAt: funcionario.createdAt,
    }));

    //franquias sem funcionarios
    const franquiasSemFuncionarios = [];
    franquias.forEach((franquia) => {
      if (franquia.funcionarios.length === 0) {
        franquiasSemFuncionarios.push({
          id: franquia.id,
          nome: franquia.nome,
          cidade: franquia.cidade,
          createdAt: franquia.createdAt,
        });
      }
    });

    //funcionarios sem franquia
    const funcionariosSemFranquia = [];
    funcionarios.forEach((funcionario) => {
      // when including franquia via select, franquia will be an object or null
      if (!funcionario.franquia) {
        funcionariosSemFranquia.push({
          id: funcionario.id,
          nome: funcionario.nome,
          cargo: funcionario.cargo,
          salario: funcionario.salario,
          createdAt: funcionario.createdAt,
        });
      }
    });

    //retornar o objeto com todas as informacoes do dashboard
    // normalize keys to match frontend expectations
    const topFranquias = todasFranquias.slice(0, 5).map((f) => ({
      id: f.id,
      nome: f.nome,
      cidade: f.cidade,
      totalFuncionarios: f.totalFuncionarios,
      folhaSalarial: f.totalSalario,
    }));

    const dashboard = {
      totalFranquias,
      totalFuncionarios,
      somaSalarios: Number(somaSalarios.toFixed(2)),
      salarioMedio: Number(salarioMedio.toFixed(2)),
      franquiasPorCidade: cidades,
      funcionariosPorCargo: cargos,
      faixasSalariais: faixaSalarial,
      topFranquias,
      ultimasFranquias: ultimas5Franquia,
      ultimosFuncionarios: ultimos5Funcionarios,
      franquiasSemFuncionarios,
      funcionariosSemFranquia,
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
