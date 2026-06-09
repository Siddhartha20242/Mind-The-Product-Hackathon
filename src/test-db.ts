import { prisma } from './database/client'

async function test() {
  try {
    const count = await prisma.user.count()
    console.log(`✅ Database connected! Found ${count} users`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

test()
