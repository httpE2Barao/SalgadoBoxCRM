import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting simplified database seed...')
  
  try {
    // Create a default owner user first
    const owner = await prisma.user.upsert({
      where: { email: 'owner@salgadobox.com.br' },
      update: {},
      create: {
        email: 'owner@salgadobox.com.br',
        name: 'SALGADO BOX Owner',
        password: process.env.ADMIN_PASSWORD || 'temp-admin-password-change-in-production', // In production, use proper hashing
        role: 'OWNER',
        phone: '+5511999999999'
      }
    })

    // Create a default restaurant
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

    // Create basic products
    const products = await Promise.all([
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

    // Create basic combo
    const combo = await prisma.combo.upsert({
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
    })

    // Create combo items
    const coxinha = products.find(p => p.name === 'Coxinha')
    const kibe = products.find(p => p.name === 'Kibe')

    if (coxinha && kibe) {
      try {
        await prisma.comboItem.create({
          data: {
            comboId: combo.id,
            productId: coxinha.id,
            quantity: 3,
            displayOrder: 1
          }
        })
      } catch (error) {
        console.log('Combo item already exists or error:', error)
      }

      try {
        await prisma.comboItem.create({
          data: {
            comboId: combo.id,
            productId: kibe.id,
            quantity: 2,
            displayOrder: 2
          }
        })
      } catch (error) {
        console.log('Combo item already exists or error:', error)
      }
    }

    console.log('Database seed completed successfully!')
  } catch (error) {
    console.error('Error during seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })