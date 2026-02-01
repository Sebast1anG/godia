'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar'
import LeftSidebar from '@/components/LeftSidebar'
import SettingsPanel from '@/components/SettingsPanel'
import BottomBar from '@/components/BottomBar'
import LoginForm from '@/components/LoginForm'
import UserPanel from '@/components/UserPanel'
import AccountSettings from '@/components/AccountSettings'
import { authService } from '@/lib/authService'

type ViewType = 'home' | 'account-settings' | 'premium' | 'regulations';

interface GameLayoutProps {
    centerContent: React.ReactNode;
}

export default function GameLayout({ centerContent }: GameLayoutProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState<ViewType>('home');

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
        setLoading(false);
    }, []);

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
                        onLogout={() => {
                            authService.logout();
                            window.location.reload();
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
                    />
                );
            case 'premium':
                return <div>Waluta Premium - TODO</div>;
            case 'regulations':
                return <div>Regulamin - TODO</div>;
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