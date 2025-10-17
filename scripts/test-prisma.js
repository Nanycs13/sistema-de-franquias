const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // create a Franquia with one Funcionario (if unique constraint conflicts, try different email)
  const franquia = await prisma.franquia.create({
    data: {
      nome: 'Franquia Teste',
      cidade: 'Cidade X',
      endereco: 'Rua Y, 123',
      telefone: '123456789',
      funcionarios: {
        create: [
          {
            nome: 'Funcionario Teste',
            email: `teste+${Date.now()}@example.com`,
            cargo: 'Gerente',
            salario: 2500.0,
          },
        ],
      },
    },
    include: { funcionarios: true },
  });

  console.log('Created franquia:');
  console.dir(franquia, { depth: 3 });

  const all = await prisma.franquia.findMany({ include: { funcionarios: true } });
  console.log('\nAll Franquias:');
  console.dir(all, { depth: 3 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
