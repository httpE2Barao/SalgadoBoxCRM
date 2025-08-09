import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  try {
    const order = await prisma.order.create({
      data: {
        orderNumber: 'TEST-123',
        status: 'PENDING',
        customerName: 'Test Customer',
        customerPhone: '+5511999999999',
        deliveryAddress: JSON.stringify({
          address: 'Rua Teste',
          number: '123',
          neighborhood: 'Bairro Teste',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          instructions: 'Teste'
        }),
        paymentMethod: 'cash',
        subtotal: 10,
        deliveryFee: 5,
        total: 15,
        restaurantId: 'default'
      }
    })
    
    console.log('Order created:', order)
  } catch (error) {
    console.error('Error:', error)
  }
}

test()