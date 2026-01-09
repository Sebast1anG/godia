import TopBar from '@/components/TopBar'
import LeftSidebar from '@/components/LeftSidebar'
import SettingsPanel from '@/components/SettingsPanel'
import BottomBar from '@/components/BottomBar'
import LoginForm from './LoginForm';

interface GameLayoutProps {
    centerContent: React.ReactNode;
}

export default function GameLayout({ centerContent }: GameLayoutProps) {
    return (
        <main style={{
            height: '100vh',
            backgroundColor: '#1a1a1a',
            position: 'relative',
            backgroundImage: 'url(/images/bg-top.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>

            <img
                src="/images/main-bg.svg"
                alt=""
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0,
                    pointerEvents: 'none',
                    opacity: 0.3,
                    mixBlendMode: 'overlay'
                }}
            />

            <TopBar />

            <div style={{
                display: 'flex',
                gap: '20px',
                padding: '35px 20px',
                justifyContent: 'center'
            }}>
                <LeftSidebar />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {centerContent}
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '25px'
                }}>
                    <LoginForm />
                    <SettingsPanel />
                </div>
            </div>

            <BottomBar />
        </main>
    )
}