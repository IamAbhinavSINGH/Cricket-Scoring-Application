import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScoreboardProps {
  inning: any
  batsmen: any[]
  bowlers: any[]
}

export default function Scoreboard({ inning, batsmen, bowlers }: ScoreboardProps) {

  const formatOvers = (ballsBowled: number) => {
    const oversBowled = Math.floor(ballsBowled / 6);
    const balls = ballsBowled % 6;
    return `${oversBowled}.${balls}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoreboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl mb-4">
          {inning.team}: {inning.total}/{inning.wickets} ({Math.floor(inning.overs.length - 1)}.{inning.balls % 6})
        </div>

        <Table>
          <TableCaption>Batsmen</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Runs</TableHead>
              <TableHead className="text-right">Balls</TableHead>
              <TableHead className="text-right">4s</TableHead>
              <TableHead className="text-right">6s</TableHead>
              <TableHead className="text-right">SR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batsmen.map((batsman) => (
              <TableRow key={batsman.id}>
                <TableCell>{batsman.name}</TableCell>
                <TableCell className="text-right">{batsman.runsScored}</TableCell>
                <TableCell className="text-right">{batsman.ballsFaced}</TableCell>
                <TableCell className="text-right">{batsman.fours}</TableCell>
                <TableCell className="text-right">{batsman.sixes}</TableCell>
                <TableCell className="text-right">
                  {batsman.ballsFaced > 0
                    ? ((batsman.runsScored / batsman.ballsFaced) * 100).toFixed(2)
                    : '0.00'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Table>
          <TableCaption>Bowlers</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Overs</TableHead>
              <TableHead className="text-right">Maidens</TableHead>
              <TableHead className="text-right">Runs</TableHead>
              <TableHead className="text-right">Wickets</TableHead>
              <TableHead className="text-right">Economy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bowlers.map((bowler) => (
              <TableRow key={bowler.id}>
                <TableCell>{bowler.name}</TableCell>
                <TableCell className="text-right">{formatOvers(bowler.ballsBowled.length)}</TableCell>
                <TableCell className="text-right">{bowler.maidens}</TableCell>
                <TableCell className="text-right">{bowler.runsConceded}</TableCell>
                <TableCell className="text-right">{bowler.wicketsTaken}</TableCell>
                <TableCell className="text-right">
                  {bowler.oversBowled > 0
                    ? (bowler.runsConceded / bowler.ballsBowled.length).toFixed(2)
                    : '0.00'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}