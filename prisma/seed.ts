import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')
  
  // Create a default owner user first
  const owner = await prisma.user.upsert({
    where: { email: 'owner@salgadobox.com.br' },
    update: {},
    create: {
      email: 'owner@salgadobox.com.br',
      name: 'SALGADO BOX Owner',
      password: 'hashed_password_here', // In production, use proper hashing
      role: 'OWNER',
      phone: '+5511999999999'
    }
  })

  // Create a default restaurant first
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'SALGADO BOX',
      description: 'Os melhores salgados e doces da cidade!',
      phone: '+5511999999999',
      email: 'contato@salgadobox.com.br',
      address: 'Av. Paulista, 1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      status: 'ACTIVE',
      deliveryEnabled: true,
      takeawayEnabled: true,
      dineInEnabled: true,
      deliveryFee: 5.00,
      minimumOrder: 20.00,
      deliveryRadius: 10,
      paymentMethods: ['credit_card', 'debit_card', 'pix', 'cash'],
      openingHours: [
        { day: 'Monday', open: '08:00', close: '22:00' },
        { day: 'Tuesday', open: '08:00', close: '22:00' },
        { day: 'Wednesday', open: '08:00', close: '22:00' },
        { day: 'Thursday', open: '08:00', close: '22:00' },
        { day: 'Friday', open: '08:00', close: '23:00' },
        { day: 'Saturday', open: '09:00', close: '23:00' },
        { day: 'Sunday', open: '09:00', close: '21:00' }
      ],
      ownerId: owner.id
    }
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-salgados' },
      update: {},
      create: {
        id: 'cat-salgados',
        name: 'Salgados Fritos',
        description: 'Nossos salgados crocantes e saborosos, fritos na hora!',
        icon: '🥟',
        color: '#f59e0b',
        displayOrder: 1,
        restaurantId: restaurant.id
      }
    }),
    prisma.category.upsert({
      where: { id: 'cat-doces' },
      update: {},
      create: {
        id: 'cat-doces',
        name: 'Doces',
        description: 'Nossos doces deliciosos para sobremesa!',
        icon: '🍮',
        color: '#ec4899',
        displayOrder: 2,
        restaurantId: restaurant.id
      }
    }),
    prisma.category.upsert({
      where: { id: 'cat-combos' },
      update: {},
      create: {
        id: 'cat-combos',
        name: 'Combos',
        description: 'Combos especiais para você e sua família!',
        icon: '🎁',
        color: '#10b981',
        displayOrder: 3,
        restaurantId: restaurant.id
      }
    })
  ])

  // Get category IDs
  const salgadosCategory = categories.find(c => c.name === 'Salgados Fritos')
  const docesCategory = categories.find(c => c.name === 'Doces')
  const combosCategory = categories.find(c => c.name === 'Combos')

  // Create products with real stock data (20 units each)
  const products = await Promise.all([
    // Salgados Fritos - 20 units each
    prisma.product.upsert({
      where: { id: 'SF01' },
      update: { stock: 20 },
      create: {
        id: 'SF01',
        name: 'Coxinha',
        description: 'Nossa coxinha especial com frango desfiado temperado, recheio cremoso e massa dourada perfeita!',
        price: 6.50,
        stock: 20,
        minimumStock: 5,
        categoryId: salgadosCategory!.id,
        isFeatured: true,
        tags: ['Mais Vendido', 'Especial da Casa'],
        preparationTime: 15,
        spicyLevel: 0,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isActive: true,
        displayOrder: 1,
        restaurantId: restaurant.id
      }
    }),
    prisma.product.upsert({
      where: { id: 'SF02' },
      update: { stock: 20 },
      create: {
        id: 'SF02',
        name: 'Kibe',
        description: 'Kibe autêntico com carne moída temperada, trigo e especiarias orientais, crocante por fora!',
        price: 6.50,
        stock: 20,
        minimumStock: 5,
        categoryId: salgadosCategory!.id,
        isFeatured: false,
        tags: ['Tradicional', 'Oriental'],
        preparationTime: 15,
        spicyLevel: 1,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isActive: true,
        displayOrder: 2,
        restaurantId: restaurant.id
      }
    }),
    prisma.product.upsert({
      where: { id: 'SF03' },
      update: { stock: 20 },
      create: {
        id: 'SF03',
        name: 'Enroladinho de vina',
        description: 'Massa folhada enrolada com presunto e queijo derretido, uma explosão de sabores!',
        price: 6.50,
        stock: 20,
        minimumStock: 5,
        categoryId: salgadosCategory!.id,
        isFeatured: false,
        tags: ['Folhado', 'Queijo Derretido'],
        preparationTime: 12,
        spicyLevel: 0,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isActive: true,
        displayOrder: 3,
        restaurantId: restaurant.id
      }
    }),
    prisma.product.upsert({
      where: { id: 'SF04' },
      update: { stock: 20 },
      create: {
        id: 'SF04',
        name: 'Travesseirinho de carne',
        description: 'Carne bovina temperada com ervas finas, envolvida em massa macia e suculenta!',
        price: 7.00,
        stock: 20,
        minimumStock: 5,
        categoryId: salgadosCategory!.id,
        isFeatured: true,
        tags: ['Carne Boivina', 'Suculento'],
        preparationTime: 18,
        spicyLevel: 1,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isActive: true,
        displayOrder: 4,
        restaurantId: restaurant.id
      }
    }),
    prisma.product.upsert({
      where: { id: 'SF05' },
      update: { stock: 20 },
      create: {
        id: 'SF05',
        name: 'Travesseirinho de queijo e requeijão',
        description: 'Queijo minas com requeijão cremoso, uma combinação divina em massa dourada!',
        price: 7.00,
        stock: 20,
        minimumStock: 5,
        categoryId: salgadosCategory!.id,
        isFeatured: false,
        tags: ['Queijo', 'Cremoso'],
        preparationTime: 15,
        spicyLevel: 0,
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        isActive: true,
        displayOrder: 5,
        restaurantId: restaurant.id
      }
    }),
    prisma.product.upsert({
      where: { id: 'SF06' },
      update: { stock: 20 },
      create: {
        id: 'SF06',
        name: 'Bolinha de queijo com presunto',
        description: 'Queijo premium com presunto de qualidade, em formato de bolinha crocante!',
        price: 6.50,
        stock: 20,
        minimumStock: 5,
        categoryId: salgadosCategory!.id,
        isFeatured: false,
        tags: ['Queijo', 'Presunto'],
        preparationTime: 12,
        spicyLevel: 0,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isActive: true,
        displayOrder: 6,
        restaurantId: restaurant.id
      }
    }),
    prisma.product.upsert({
      where: { id: 'SF07' },
      update: { stock: 20 },
      create: {
        id: 'SF07',
        name: 'Croquete de frango',
        description: 'Croquete crocante com frango desfiado e temperos especiais!',
        price: 6.00,
        stock: 20,
        minimumStock: 5,
        categoryId: salgadosCategory!.id,
        isFeatured: false,
        tags: ['Crocante', 'Frango'],
        preparationTime: 12,
        spicyLevel: 0,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isActive: true,
        displayOrder: 7,
        restaurantId: restaurant.id
      }
    }),
    prisma.product.upsert({
      where: { id: 'SF08' },
      update: { stock: 20 },
      create: {
        id: 'SF08',
        name: 'Croquete de carne',
        description: 'Croquete suculento com carne bovina temperada!',
        price: 6.00,
        stock: 20,
        minimumStock: 5,
        categoryId: salgadosCategory!.id,
        isFeatured: false,
        tags: ['Crocante', 'Carne'],
        preparationTime: 12,
        spicyLevel: 1,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isActive: true,
        displayOrder: 8,
        restaurantId: restaurant.id
      }
    }),
    prisma.product.upsert({
      where: { id: 'SF09' },
      update: { stock: 20 },
      create: {
        id: 'SF09',
        name: 'Croquete de calabresa',
        description: 'Croquete picante com calabresa defumada e queijo!',
        price: 6.00,
        stock: 20,
        minimumStock: 5,
        categoryId: salgadosCategory!.id,
        isFeatured: false,
        tags: ['Crocante', 'Calabresa'],
        preparationTime: 12,
        spicyLevel: 2,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isActive: true,
        displayOrder: 9,
        restaurantId: restaurant.id
      }
    }),

    // Doces - 20 units each
    prisma.product.upsert({
      where: { id: 'DT01' },
      update: { stock: 20 },
      create: {
        id: 'DT01',
        name: 'Mini Churros de Doce de Leite',
        description: 'Churros mini crocante recheado com doce de leite artesanal!',
        price: 4.50,
        stock: 20,
        minimumStock: 5,
        categoryId: docesCategory!.id,
        isFeatured: true,
        tags: ['Doce de Leite', 'Crocante'],
        preparationTime: 8,
        spicyLevel: 0,
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        isActive: true,
        displayOrder: 1,
        restaurantId: restaurant.id
      }
    })
  ])

  // Create combos with componentized items
  const combos = await Promise.all([
    prisma.combo.upsert({
      where: { id: 'CB01' },
      update: {},
      create: {
        id: 'CB01',
        name: 'Box Me Mimei',
        description: '5 Salgados Fritos (mix do dia)',
        price: 30.00,
        originalPrice: 32.50,
        isActive: true,
        isFeatured: false,
        preparationTime: 20,
        displayOrder: 1,
        restaurantId: restaurant.id
      }
    }),
    prisma.combo.upsert({
      where: { id: 'CB02' },
      update: {},
      create: {
        id: 'CB02',
        name: 'Box Dose Dupla',
        description: '10 Salgados Fritos (mix do dia)',
        price: 58.00,
        originalPrice: 65.00,
        isActive: true,
        isFeatured: false,
        preparationTime: 25,
        displayOrder: 2,
        restaurantId: restaurant.id
      }
    }),
    prisma.combo.upsert({
      where: { id: 'CB03' },
      update: {},
      create: {
        id: 'CB03',
        name: 'Box Salgado & Doce',
        description: '5 Salgados Fritos + 5 Mini Churros',
        price: 45.00,
        originalPrice: 55.00,
        isActive: true,
        isFeatured: true,
        preparationTime: 20,
        displayOrder: 3,
        restaurantId: restaurant.id
      }
    }),
    prisma.combo.upsert({
      where: { id: 'CB04' },
      update: {},
      create: {
        id: 'CB04',
        name: 'Box da Tarde',
        description: '20 Salgados Fritos + 10 Mini Churros',
        price: 110.00,
        originalPrice: 175.00,
        isActive: true,
        isFeatured: false,
        preparationTime: 30,
        displayOrder: 4,
        restaurantId: restaurant.id
      }
    }),
    prisma.combo.upsert({
      where: { id: 'CB05' },
      update: {},
      create: {
        id: 'CB05',
        name: 'Combo "Box netfix"',
        description: '20 Salgados Fritos + 20 Mini Churros',
        price: 160.00,
        originalPrice: 220.00,
        isActive: true,
        isFeatured: true,
        preparationTime: 35,
        displayOrder: 5,
        restaurantId: restaurant.id
      }
    })
  ])

  // Create combo items (componentized items within combos)
  const coxinha = products.find(p => p.name === 'Coxinha')
  const kibe = products.find(p => p.name === 'Kibe')
  const enroladinho = products.find(p => p.name === 'Enroladinho de vina')
  const travesseiroCarne = products.find(p => p.name === 'Travesseirinho de carne')
  const travesseiroQueijo = products.find(p => p.name === 'Travesseirinho de queijo e requeijão')
  const bolinha = products.find(p => p.name === 'Bolinha de queijo com presunto')
  const croqueteFrango = products.find(p => p.name === 'Croquete de frango')
  const churros = products.find(p => p.name === 'Mini Churros de Doce de Leite')

  const comboItems = await Promise.all([
    // Box Me Mimei (CB01) - 5 mixed salgados
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Me Mimei')!.id,
        productId: coxinha!.id,
        quantity: 2,
        displayOrder: 1
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Me Mimei')!.id,
        productId: kibe!.id,
        quantity: 1,
        displayOrder: 2
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Me Mimei')!.id,
        productId: enroladinho!.id,
        quantity: 1,
        displayOrder: 3
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Me Mimei')!.id,
        productId: croqueteFrango!.id,
        quantity: 1,
        displayOrder: 4
      }
    }),

    // Box Dose Dupla (CB02) - 10 mixed salgados
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Dose Dupla')!.id,
        productId: coxinha!.id,
        quantity: 3,
        displayOrder: 1
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Dose Dupla')!.id,
        productId: kibe!.id,
        quantity: 2,
        displayOrder: 2
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Dose Dupla')!.id,
        productId: enroladinho!.id,
        quantity: 2,
        displayOrder: 3
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Dose Dupla')!.id,
        productId: travesseiroCarne!.id,
        quantity: 2,
        displayOrder: 4
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Dose Dupla')!.id,
        productId: croqueteFrango!.id,
        quantity: 1,
        displayOrder: 5
      }
    }),

    // Box Salgado & Doce (CB03) - 5 salgados + 5 churros
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Salgado & Doce')!.id,
        productId: coxinha!.id,
        quantity: 2,
        displayOrder: 1
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Salgado & Doce')!.id,
        productId: kibe!.id,
        quantity: 1,
        displayOrder: 2
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Salgado & Doce')!.id,
        productId: enroladinho!.id,
        quantity: 1,
        displayOrder: 3
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Salgado & Doce')!.id,
        productId: croqueteFrango!.id,
        quantity: 1,
        displayOrder: 4
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box Salgado & Doce')!.id,
        productId: churros!.id,
        quantity: 5,
        displayOrder: 5
      }
    }),

    // Box da Tarde (CB04) - 20 salgados + 10 churros
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box da Tarde')!.id,
        productId: coxinha!.id,
        quantity: 5,
        displayOrder: 1
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box da Tarde')!.id,
        productId: kibe!.id,
        quantity: 3,
        displayOrder: 2
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box da Tarde')!.id,
        productId: enroladinho!.id,
        quantity: 3,
        displayOrder: 3
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box da Tarde')!.id,
        productId: travesseiroCarne!.id,
        quantity: 3,
        displayOrder: 4
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box da Tarde')!.id,
        productId: travesseiroQueijo!.id,
        quantity: 3,
        displayOrder: 5
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box da Tarde')!.id,
        productId: bolinha!.id,
        quantity: 3,
        displayOrder: 6
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Box da Tarde')!.id,
        productId: churros!.id,
        quantity: 10,
        displayOrder: 7
      }
    }),

    // Combo "Box netfix" (CB05) - 20 salgados + 20 churros
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Combo "Box netfix"')!.id,
        productId: coxinha!.id,
        quantity: 5,
        displayOrder: 1
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Combo "Box netfix"')!.id,
        productId: kibe!.id,
        quantity: 3,
        displayOrder: 2
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Combo "Box netfix"')!.id,
        productId: enroladinho!.id,
        quantity: 3,
        displayOrder: 3
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Combo "Box netfix"')!.id,
        productId: travesseiroCarne!.id,
        quantity: 3,
        displayOrder: 4
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Combo "Box netfix"')!.id,
        productId: travesseiroQueijo!.id,
        quantity: 3,
        displayOrder: 5
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Combo "Box netfix"')!.id,
        productId: bolinha!.id,
        quantity: 3,
        displayOrder: 6
      }
    }),
    prisma.comboItem.create({
      data: {
        comboId: combos.find(c => c.name === 'Combo "Box netfix"')!.id,
        productId: churros!.id,
        quantity: 20,
        displayOrder: 7
      }
    })
  ])

  console.log('Database seed completed successfully!')
  console.log(`Created ${products.length} products with 20 units each`)
  console.log(`Created ${combos.length} combos with componentized items`)
  console.log(`Created ${comboItems.length} combo item relationships`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })