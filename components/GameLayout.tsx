'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import TopBar from '@/components/TopBar'
import LeftSidebar from '@/components/LeftSidebar'
import SettingsPanel from '@/components/SettingsPanel'
import BottomBar from '@/components/BottomBar'
import LoginForm from '@/components/LoginForm'
import UserPanel from '@/components/UserPanel'
import AccountSettings from '@/components/AccountSettings'
import CharacterManagement from '@/components/CharacterManagement'
import CharacterCreation from '@/components/CharacterCreation'
import CharacterSelect from '@/components/CharacterSelect'
import GameNews from '@/components/GameNews'
import { CharactersProvider, useCharacters } from '@/lib/CharactersContext'
import { authService } from '@/lib/authService'

type ViewType = 'home' | 'account-settings' | 'premium' | 'regulations' | 'character-management' | 'create-character';

const viewToPath: Record<ViewType, string> = {
    'home': '/',
    'account-settings': '/account-settings',
    'premium': '/premium',
    'regulations': '/regulations',
    'character-management': '/character-management',
    'create-character': '/create-character',
};

const pathToView = (pathname: string): ViewType => {
    const entry = Object.entries(viewToPath).find(([, path]) => path === pathname);
    return (entry?.[0] as ViewType) || 'home';
};

interface GameLayoutProps {
    centerContent: React.ReactNode;
}

function GameLayoutContent({ centerContent }: GameLayoutProps) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState<ViewType>(pathToView(pathname));
    const [showCharacterSelect, setShowCharacterSelect] = useState(false);
    const { refetch } = useCharacters();

    useEffect(() => {
        setMounted(true);
        setIsAuthenticated(authService.isAuthenticated());
        setLoading(false);
    }, []);

    useEffect(() => {
        const handlePopState = () => {
            setCurrentView(pathToView(window.location.pathname));
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigateTo = (view: ViewType) => {
        const authRequiredViews: ViewType[] = ['account-settings', 'character-management', 'create-character'];
        if (authRequiredViews.includes(view) && !isAuthenticated) {
            return;
        }
        setCurrentView(view);
        window.history.pushState(null, '', viewToPath[view]);
    };

    const handleGoHome = () => {
        setCurrentView('home');
        window.history.pushState(null, '', '/');
        setShowCharacterSelect(false);
    };

    const user = mounted ? authService.getUser() : null;

    const renderCenterContent = () => {
        if (!mounted) {
            if (currentView === 'home') return <GameNews />;
            return <div style={{ width: 879 }} />;
        }
        switch (currentView) {
            case 'account-settings':
                if (!isAuthenticated) return <GameNews />;
                return (
                    <AccountSettings
                        accountInfo={{
                            login: user?.username || '',
                            createdAt: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pl-PL') : '',
                            forumPosts: 0,
                            reputation: 0,
                            email: user?.email || '',
                            goldCoins: 0
                        }}
                        onChangePassword={async (current, newPass) => {
                            console.log('Change password', current, newPass);
                        }}
                        onChangeEmail={async (email, code) => {
                            console.log('Change email', email, code);
                        }}
                        onSendVerificationCode={async (email) => {
                            console.log('Send code to', email);
                        }}
                        onLogout={() => {
                            authService.logout();
                            window.location.reload();
                        }}
                        onNavigateToCreateCharacter={() => navigateTo('create-character')}
                        onNavigateToCharacterManagement={() => navigateTo('character-management')}
                    />
                );
            case 'premium':
                return <div>Waluta Premium - TODO</div>;
            case 'regulations':
                return <div>Regulamin - TODO</div>;
            case 'character-management':
                return (
                    <CharacterManagement
                        onLogout={() => {
                            authService.logout();
                            window.location.reload();
                        }}
                        onNavigateToAccount={() => navigateTo('account-settings')}
                        onNavigateToCreateCharacter={() => navigateTo('create-character')}
                    />
                );
            case 'create-character':
                return (
                    <CharacterCreation
                        onCharacterCreated={() => {
                            refetch();
                            navigateTo('character-management');
                        }}
                        onLogout={() => {
                            authService.logout();
                            window.location.reload();
                        }}
                        onNavigateToAccount={() => navigateTo('account-settings')}
                        onNavigateToCharacterManagement={() => navigateTo('character-management')}
                    />
                );
            default:
                return <GameNews />;
        }
    };

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

            <TopBar onLogoClick={handleGoHome} />

            <div style={{
                display: 'flex',
                gap: '20px',
                padding: '35px 20px',
                justifyContent: 'center'
            }}>
                <LeftSidebar />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {centerContent || renderCenterContent()}
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '25px'
                }}>
                    {!mounted || loading ? (
                        <div>Ładowanie...</div>
                    ) : (
                        isAuthenticated ? (
                            <UserPanel
                                onNavigateToCharacterSelection={() => setShowCharacterSelect(true)}
                            />
                        ) : <LoginForm />
                    )}
                    <SettingsPanel 
                        onNavigate={navigateTo}
                        isAuthenticated={isAuthenticated}
                    />
                </div>
            </div>

            <BottomBar />

            {/* Modal wyboru postaci */}
            {showCharacterSelect && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setShowCharacterSelect(false)}
                >
                    <div onClick={(e) => e.stopPropagation()}>
                        <CharacterSelect
                            onSelect={(id) => {
                                setShowCharacterSelect(false);
                            }}
                            onClose={() => setShowCharacterSelect(false)}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}

export default function GameLayout({ centerContent }: GameLayoutProps) {
    return (
        <CharactersProvider>
            <GameLayoutContent centerContent={centerContent} />
        </CharactersProvider>
    );
}