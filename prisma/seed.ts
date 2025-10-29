import { PrismaClient } from '@prisma/client'
import { fakerPT_BR as faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpando banco de dados...')
  await prisma.funcionario.deleteMany()
  await prisma.franquia.deleteMany()

  console.log('Criando franquias e funcionários...')

  // Lista de cargos fixos
  const cargosBase = ['Gestor', 'Financeiro', 'Recursos Humanos', 'Vendas', 'Suporte Técnico']

  let totalFuncionarios = 0

  for (let i = 0; i < 10; i++) {
    const franquia = await prisma.franquia.create({
      data: {
        nome: `TechStore ${faker.location.city()}`,
        cidade: faker.location.city(),
        endereco: faker.location.streetAddress(),
        telefone: faker.phone.number({ style: 'national' }),
        funcionarios: {
          create: cargosBase.map((cargo) => ({
            nome: faker.person.fullName(),
            email: faker.internet.email(),
            cargo,
            salario: faker.number.float({ min: 2500, max: 10000, fractionDigits: 2 }),
          })),
        },
      },
    })

    totalFuncionarios += cargosBase.length
    console.log(`Criada franquia: ${franquia.nome}`)
  }

  console.log('\nSeed finalizado com sucesso!')
  console.log(`Total: 10 franquias e ${totalFuncionarios} funcionários criados.`)
}

main()
  .catch((e) => {
    console.error('Erro ao rodar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
