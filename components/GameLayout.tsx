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
import GameLoadingScreen from '@/components/GameLoadingScreen'
import GameNews from '@/components/GameNews'
import { CharactersProvider, useCharacters } from '@/lib/CharactersContext'
import { authService } from '@/lib/authService'
import styles from './GameLayout.module.css'

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
    const [showGameLoading, setShowGameLoading] = useState(false);
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

    const authRequiredViews: ViewType[] = ['account-settings', 'character-management', 'create-character'];

    const navigateTo = (view: ViewType) => {
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
            return <div className={styles.placeholder} />;
        }
        if (authRequiredViews.includes(currentView) && !isAuthenticated) {
            return <GameNews />;
        }
        switch (currentView) {
            case 'account-settings':
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
                            const token = authService.getToken();
                            const response = await fetch('/api/auth/change-password', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ currentPassword: current, newPassword: newPass })
                            });
                            const data = await response.json();
                            if (!response.ok) {
                                throw new Error(data.error || 'Błąd zmiany hasła');
                            }
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
        <main className={styles.main}>
            <TopBar onLogoClick={handleGoHome} />

            <div className={`${styles.contentArea}${currentView === 'create-character' ? ` ${styles.contentAreaCreateCharacter}` : ''}`}>
                <LeftSidebar />

                <div className={styles.centerColumn}>
                    {centerContent || renderCenterContent()}
                </div>

                <div className={styles.rightColumn}>
                    {!mounted || loading ? (
                        <div>Ładowanie...</div>
                    ) : (
                        isAuthenticated ? (
                            <UserPanel
                                onNavigateToCharacterSelection={() => setShowCharacterSelect(true)}
                                onJoinGame={() => setShowGameLoading(true)}
                            />
                        ) : <LoginForm />
                    )}
                    <SettingsPanel 
                        onNavigate={navigateTo}
                        isAuthenticated={isAuthenticated}
                    />
                </div>
            </div>

            <div className={styles.bottomBarWrapper}>
                <BottomBar />
            </div>

            {showGameLoading && (
                <GameLoadingScreen
                    onLoadingComplete={() => {
                        setShowGameLoading(false);
                        window.location.href = '/game';
                    }}
                />
            )}

            {/* Modal wyboru postaci */}
            {showCharacterSelect && (
                <div
                    className={styles.modalOverlay}
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