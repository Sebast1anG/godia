'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar'
import LeftSidebar from '@/components/LeftSidebar'
import SettingsPanel from '@/components/SettingsPanel'
import BottomBar from '@/components/BottomBar'
import LoginForm from '@/components/LoginForm'
import UserPanel from '@/components/UserPanel'
import AccountSettings from '@/components/AccountSettings'
import CharacterManagement from '@/components/CharacterManagement'
import { authService } from '@/lib/authService'

type ViewType = 'home' | 'account-settings' | 'premium' | 'regulations' | 'character-management';

interface GameLayoutProps {
    centerContent: React.ReactNode;
}

export default function GameLayout({ centerContent }: GameLayoutProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState<ViewType>('home');
    const [characters, setCharacters] = useState<any[]>([]);

    const fetchCharacters = async () => {
        const token = authService.getToken();
        if (!token) return;

        try {
            const response = await fetch('/api/characters', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                const mapped = data.characters.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    level: c.level,
                    class: c.class,
                    gameMode: c.game_mode,
                    gender: c.gender,
                    race: c.race,
                    serverId: c.server_id
                }));
                setCharacters(mapped);
            }
        } catch (error) {
            console.error('Błąd pobierania postaci:', error);
        }
    };

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isAuthenticated && currentView === 'character-management') {
            fetchCharacters();
        }
    }, [isAuthenticated, currentView]);

    const handleViewChange = (view: ViewType) => {
        if (view === 'account-settings' && !isAuthenticated) {
            return;
        }
        setCurrentView(view);
    };

    const user = authService.getUser();

    const renderCenterContent = () => {
        switch (currentView) {
            case 'account-settings':
                if (!isAuthenticated) return centerContent;
                return (
                    <AccountSettings
                        accountInfo={{
                            login: user?.username || '',
                            createdAt: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pl-PL') : '',
                            forumPosts: 0,
                            reputation: 0
                        }}
                        onChangePassword={async (current, newPass) => {
                            // TODO: API call
                            console.log('Change password', current, newPass);
                        }}
                        onChangeEmail={async (email, code) => {
                            // TODO: API call
                            console.log('Change email', email, code);
                        }}
                        onSendVerificationCode={async (email) => {
                            // TODO: API call
                            console.log('Send code to', email);
                        }}
                        onLogout={() => {
                            authService.logout();
                            window.location.reload();
                        }}
                        onNavigateToCharacterManagement={() => setCurrentView('character-management')}
                    />
                );
            case 'premium':
                return <div>Waluta Premium - TODO</div>;
            case 'regulations':
                return <div>Regulamin - TODO</div>;
            case 'character-management':
                return (
                    <CharacterManagement
                        characters={characters}
                        onLogout={() => {
                            authService.logout();
                            window.location.reload();
                        }}
                        onDeleteCharacter={async (id, confirmation) => {
                            if (confirmation !== 'TAK') return;
                            try {
                                const token = authService.getToken();
                                const response = await fetch(`/api/characters?id=${id}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    }
                                });
                                if (response.ok) {
                                    fetchCharacters();
                                }
                            } catch (error) {
                                console.error('Błąd usuwania postaci:', error);
                            }
                        }}
                        onChangeNick={async (id, newNick) => {
                            try {
                                const token = authService.getToken();
                                const response = await fetch('/api/characters', {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        characterId: id,
                                        name: newNick
                                    })
                                });
                                if (response.ok) {
                                    fetchCharacters();
                                }
                            } catch (error) {
                                console.error('Błąd zmiany nicku:', error);
                            }
                        }}
                        onChangeGender={async (id, gender) => {
                            try {
                                const token = authService.getToken();
                                const response = await fetch('/api/characters', {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        characterId: id,
                                        gender: gender
                                    })
                                });
                                if (response.ok) {
                                    fetchCharacters();
                                }
                            } catch (error) {
                                console.error('Błąd zmiany płci:', error);
                            }
                        }}
                        onChangeRace={async (id, race) => {
                            try {
                                const token = authService.getToken();
                                const response = await fetch('/api/characters', {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        characterId: id,
                                        race: race
                                    })
                                });
                                if (response.ok) {
                                    fetchCharacters();
                                }
                            } catch (error) {
                                console.error('Błąd zmiany rasy:', error);
                            }
                        }}
                    />
                );
            default:
                return centerContent;
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

            <TopBar />

            <div style={{
                display: 'flex',
                gap: '20px',
                padding: '35px 20px',
                justifyContent: 'center'
            }}>
                <LeftSidebar />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {renderCenterContent()}
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '25px'
                }}>
                    {loading ? (
                        <div>Ładowanie...</div>
                    ) : (
                        isAuthenticated ? <UserPanel /> : <LoginForm />
                    )}
                    <SettingsPanel 
                        onNavigate={handleViewChange}
                        isAuthenticated={isAuthenticated}
                    />
                </div>
            </div>

            <BottomBar />
        </main>
    )
}