import GameLayout from '@/components/GameLayout'
import CharacterCreation from '@/components/CharacterCreation'

export default function Home() {
  return <GameLayout centerContent={<CharacterCreation />} />
}