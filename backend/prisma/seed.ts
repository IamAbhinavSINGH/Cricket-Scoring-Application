import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a match
  const match = await prisma.match.create({
    data: {
      team1: 'RCB',
      team2: 'Mumbai Indians',
    },
  })

  // Create an inning
  const inning = await prisma.inning.create({
    data: {
      match: { connect: { id: match.id } },
      team: 'Team A',
      total: 0,
      wickets: 0,
      balls: 0,
    },
  })

  // Create an over
  const over = await prisma.over.create({
    data: {
      inning: { connect: { id: inning.id } },
      number: 1,
      runs: 0,
      wickets: 0,
    },
  })

  // Create players for Team A
  const teamAPlayers = ['Virat Kohli', 'KL Rahul', 'Faf du Plessis', 'Glenn Maxwell', 'Rajat Patidar' , 'Dinesh Karthik' , 'Will Jacks' , 'Mahipal Lomror' , 'Mohammad Siraj']
  for (const playerName of teamAPlayers) {
    await prisma.player.create({
      data: {
        name: playerName,
        team: 'RCB',
        runsScored: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        wicketsTaken: 0,
        runsConceded: 0,
        oversBowled: 0,
        maidens: 0,
      },
    })
  }

  // Create players for Team B
  const teamBPlayers = ['Rohit Sharma', 'Hardik Pandya', 'Dewald Brevis', 'Suryakumar Yadav', 'Ishan Kishan']
  for (const playerName of teamBPlayers) {
    await prisma.player.create({
      data: {
        name: playerName,
        team: 'Mumbai Indians',
        runsScored: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        wicketsTaken: 0,
        runsConceded: 0,
        oversBowled: 0,
        maidens: 0,
      },
    })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })