import { PrismaClient } from '@prisma/client'
import { fakerPT_BR as faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpando banco de dados...')
  await prisma.funcionario.deleteMany()
  await prisma.franquia.deleteMany()

  console.log('🏗️ Criando franquias e funcionários...')

for (let i = 0; i < 10; i++) {
  const franquia = await prisma.franquia.create({
    data: {
      nome: `TechStore ${faker.location.city()}`,
      cidade: faker.location.city(),
      endereco: faker.location.streetAddress(),
      telefone: faker.phone.number({ style: 'national' }),
      funcionarios: {
        create: Array.from({ length: 5 }).map(() => ({
          nome: faker.person.fullName(),
          email: faker.internet.email(),
          cargo: faker.person.jobTitle(),
          salario: faker.number.float({ min: 2000, max: 12000, fractionDigits: 2 }),
        })),
      },
    },
  })

  console.log(`✅ Criada franquia: ${franquia.nome}`)
}


  console.log('\n✨ Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao rodar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
