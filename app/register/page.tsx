import GameLayout from '@/components/GameLayout'
import RegisterForm from '@/components/RegisterForm'

export default function RegisterPage() {
    return <GameLayout centerContent={<RegisterForm />} />
}