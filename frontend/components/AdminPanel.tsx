"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import Scoreboard from '@/components/Scoreboard'

const API_URL = 'http://localhost:3001/api'

export default function AdminPanel() {
  const [selectedRuns, setSelectedRuns] = useState<number | null>(null)
  const [extras, setExtras] = useState({
    wide: false,
    noBall: false,
    bye: false,
    legBye: false,
    overthrow: false,
  })
  const [isWicket, setIsWicket] = useState(false)
  const [overthrowRuns, setOverthrowRuns] = useState(0)
  const [currentMatch, setCurrentMatch] = useState<any>(null)
  const [currentInning, setCurrentInning] = useState<any>(null)
  const [currentOver, setCurrentOver] = useState<any>(null)
  const [batsmen, setBatsmen] = useState<any[]>([])
  const [bowlers, setBowlers] = useState<any[]>([])
  const [striker, setStriker] = useState<string>('')
  const [nonStriker, setNonStriker] = useState<string>('')
  const [currentBowler, setCurrentBowler] = useState<string>('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const matchResponse = await axios.get(`${API_URL}/match/current`)
      const inningResponse = await axios.get(`${API_URL}/inning/current`)
      const overResponse = await axios.get(`${API_URL}/over/current`)
      const playersResponse = await axios.get(`${API_URL}/players`)

      const match = matchResponse.data.match
      const inning = inningResponse.data.inning
      const over = overResponse.data.over
      const players = playersResponse.data.players

      setCurrentMatch(match)
      setCurrentInning(inning)
      setCurrentOver(over)

      console.log(match);

      if (inning) {
        setBatsmen(players.filter((p: any) => p.team === inning.team))
        setBowlers(players.filter((p: any) => p.team !== inning.team))
      } else {
        setBatsmen([])
        setBowlers([])
      }

      console.log('Data fetched:', { match, inning, over, players })
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  const handleRunClick = (runs: number) => {
    setSelectedRuns(runs)
  }

  const handleExtraToggle = (extra: keyof typeof extras) => {
    setExtras((prev) => ({ ...prev, [extra]: !prev[extra] }))
  }

  const handleSubmit = async () => {
    try {
      if (!currentMatch || !currentInning || !currentOver) {
        console.error('Match, inning, or over data is missing')
        return
      }

      const ballData = {
        matchId: currentMatch.id,
        inningId: currentInning.id,
        overId: currentOver.id,
        runs: selectedRuns ? selectedRuns : 0,
        isWide: extras.wide,
        isNoBall: extras.noBall,
        isBye: extras.bye,
        isLegBye: extras.legBye,
        isWicket: isWicket,
        isOverthrow: extras.overthrow,
        overthrowRuns: extras.overthrow ? overthrowRuns : 0,
        batsmanId: striker,
        bowlerId: currentBowler,
      }

      console.log('Submitting ball data:', ballData)

      await axios.post(`${API_URL}/ball`, ballData)

      // Reset state after submission
      setSelectedRuns(null)
      setExtras({
        wide: false,
        noBall: false,
        bye: false,
        legBye: false,
        overthrow: false,
      })
      setIsWicket(false)
      setOverthrowRuns(0)

      // Fetch updated data
      fetchInitialData()
    } catch (error) {
      console.error('Error submitting ball data:', error)
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server response:', error.response.data)
      }
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div>
              {
                currentMatch?.team1 && currentMatch?.team2 ?
                <p className='text-lg text-black'>{`${currentMatch.team1} v/s ${currentMatch.team2}`}</p> : null
              }
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5, 6].map((run) => (
                <Button
                  key={run}
                  onClick={() => handleRunClick(run)}
                  variant={selectedRuns === run ? "default" : "outline"}
                >
                  {run}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(extras).map(([key, value]) => (
                <Button
                  key={key}
                  onClick={() => handleExtraToggle(key as keyof typeof extras)}
                  variant={value ? "default" : "outline"}
                >
                  {key}
                </Button>
              ))}
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="isWicket"
                checked={isWicket}
                onCheckedChange={(checked) => setIsWicket(checked as boolean)}
              />
              <label
                htmlFor="isWicket"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Wicket
              </label>
            </div>

            {extras.overthrow && (
              <Input
                type="number"
                placeholder="Overthrow runs"
                value={overthrowRuns}
                onChange={(e) => setOverthrowRuns(parseInt(e.target.value))}
                className="mb-4"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              <Select value={striker} onValueChange={setStriker}>
                <SelectTrigger>
                  <SelectValue placeholder="Select striker" />
                </SelectTrigger>
                <SelectContent>
                  {batsmen.map((batsman) => (
                    <SelectItem key={batsman.id} value={batsman.id}>
                      {batsman.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={nonStriker} onValueChange={setNonStriker}>
                <SelectTrigger>
                  <SelectValue placeholder="Select non-striker" />
                </SelectTrigger>
                <SelectContent>
                  {batsmen.map((batsman) => (
                    <SelectItem key={batsman.id} value={batsman.id}>
                      {batsman.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={currentBowler} onValueChange={setCurrentBowler}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bowler" />
                </SelectTrigger>
                <SelectContent>
                  {bowlers.map((bowler) => (
                    <SelectItem key={bowler.id} value={bowler.id}>
                      {bowler.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSubmit} className="w-full">
              Submit
            </Button>
          </CardContent>
        </Card>

        <CardContent>
            {currentInning && (
              <Scoreboard
                inning={currentInning}
                batsmen={batsmen}
                bowlers={bowlers}
              />
            )}
          </CardContent>
      </div>
    </div>
  )
}