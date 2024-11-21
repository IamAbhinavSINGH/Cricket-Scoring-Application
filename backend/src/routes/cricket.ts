import express , { Request , Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const BallSchema = z.object({
  matchId: z.string(),
  inningId: z.string(),
  overId: z.string(),
  runs: z.number().min(0).max(6),
  isWide: z.boolean(),
  isNoBall: z.boolean(),
  isBye: z.boolean(),
  isLegBye: z.boolean(),
  isWicket: z.boolean(),
  isOverthrow: z.boolean(),
  batsmanId: z.string(),
  bowlerId: z.string(),
});

router.get('/match/current', async (req : Request , res : Response) => {
  try {
    const match = await prisma.match.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { innings: true },
    });
    res.json({ match });
  } catch (error) {
    console.error('Error fetching current match:', error);
    res.status(500).json({ error: 'Failed to fetch current match' });
  }
});

router.get('/inning/current', async (req : Request , res : Response) => {
  try {
    const inning = await prisma.inning.findFirst({
      orderBy: { id: 'desc' },
      include: { overs: { include: { balls: true } } },
    });
    res.json({ inning });
  } catch (error) {
    console.error('Error fetching current inning:', error);
    res.status(500).json({ error: 'Failed to fetch current inning' });
  }
});

router.get('/over/current', async (req : Request , res : Response) => {
  try {
    const over = await prisma.over.findFirst({
      orderBy: { id: 'desc' },
      include: { balls: true },
    });
    res.json({ over });
  } catch (error) {
    console.error('Error fetching current over:', error);
    res.status(500).json({ error: 'Failed to fetch current over' });
  }
});

router.get('/players', async (req : Request , res : Response) => {
  try {
    const players = await prisma.player.findMany({ include : { ballsBowled : true } });
    res.json({ players });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

router.post('/ball', async (req : Request , res : Response) => {
  try {
    const ballData = BallSchema.parse(req.body);
    const { matchId, inningId, overId, batsmanId, bowlerId, ...ballDetails } = ballData;

    let currentOver = await prisma.over.findUnique({
      where: { id: overId },
      include: { balls: true },
    });

    if (!currentOver || currentOver.balls.length >= 6) {
      const overCount = await prisma.over.count({ where: { inningId } });
      currentOver = await prisma.over.create({
        data: {
          inning: { connect: { id: inningId } },
          number: overCount + 1,
          balls: { create: [] },
          runs: 0,
          wickets: 0,
        },
        include: { balls: true },
      });
    }

    const ball = await prisma.ball.create({
      data: {
        ...ballDetails,
        over: { connect: { id: currentOver.id } },
        number: currentOver.balls.length + 1,
        batsman: { connect: { id: batsmanId } },
        bowler: { connect: { id: bowlerId } },
      },
    });

    await updatePlayerStats(batsmanId, bowlerId, ball);
    await updateInningStats(inningId, ball);

    res.json({ message: 'Ball recorded successfully', ball });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else {
      console.error('Error recording ball:', error);
      res.status(500).json({ error: 'Failed to record ball' });
    }
  }
});

async function updatePlayerStats(batsmanId: string, bowlerId: string, ball: any) {
  const { runs, isWide, isNoBall, isBye, isLegBye, isWicket, isOverthrow, overthrowRuns } = ball;

  await prisma.player.update({
    where: { id: batsmanId },
    data: {
      runsScored: { increment: isWide || isNoBall ? 0 : (isBye || isLegBye ? 0 : runs + (isOverthrow ? overthrowRuns : 0)) },
      ballsFaced: { increment: isWide ? 0 : 1 },
      fours: { increment: runs === 4 ? 1 : 0 },
      sixes: { increment: runs === 6 ? 1 : 0 },
    },
  });

  await prisma.player.update({
    where: { id: bowlerId },
    data: {
      wicketsTaken: { increment: isWicket ? 1 : 0 },
      runsConceded: { increment: isWide || isNoBall ? runs + 1 : runs },
      oversBowled: { increment: isWide || isNoBall ? 0 : 0.1 },
    },
  });
}

async function updateInningStats(inningId: string, ball: any) {
  const { runs, isWide, isNoBall, isBye, isLegBye, isWicket, isOverthrow, overthrowRuns } = ball;

  await prisma.inning.update({
    where: { id: inningId },
    data: {
      total: { increment: runs + (isOverthrow ? overthrowRuns : 0) + (isWide || isNoBall ? 1 : 0) },
      wickets: { increment: isWicket ? 1 : 0 },
      balls: { increment: isWide || isNoBall ? 0 : 1 },
    },
  });

  await prisma.extras.upsert({
    where: { inningId },
    update: {
      wides: { increment: isWide ? 1 : 0 },
      noBalls: { increment: isNoBall ? 1 : 0 },
      byes: { increment: isBye ? runs : 0 },
      legByes: { increment: isLegBye ? runs : 0 },
    },
    create: {
      inning: { connect: { id: inningId } },
      wides: isWide ? 1 : 0,
      noBalls: isNoBall ? 1 : 0,
      byes: isBye ? runs : 0,
      legByes: isLegBye ? runs : 0,
    },
  });
}

export default router;