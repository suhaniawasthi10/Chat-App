import './style.css';
import { getToken } from './api/client';
import { renderLoginPage } from './pages/LoginPage';
import { renderRegisterPage } from './pages/RegisterPage';
import { renderChatListPage } from './pages/ChatListPage';
import { renderChatPage } from './pages/ChatPage';
import { renderFriendsPage } from './pages/FriendsPage';
import { renderProfilePage } from './pages/ProfilePage';

const app = document.getElementById('app') as HTMLElement;

interface NavigateEvent extends CustomEvent {
    detail: {
        page: string;
        conversationId?: string;
    };
}

const navigate = (page: string, conversationId?: string) => {
    const isAuthenticated = !!getToken();

    if (!isAuthenticated && page !== 'login' && page !== 'register') {
        page = 'login';
    }

    switch (page) {
        case 'login':
            renderLoginPage(app);
            break;
        case 'register':
            renderRegisterPage(app);
            break;
        case 'chatlist':
            renderChatListPage(app);
            break;
        case 'chat':
            if (conversationId) {
                renderChatPage(app, conversationId);
            } else {
                navigate('chatlist');
            }
            break;
        case 'friends':
            renderFriendsPage(app);
            break;
        case 'profile':
            renderProfilePage(app);
            break;
        default:
            navigate('login');
    }
};

// Listen for navigation events
window.addEventListener('navigate', ((e: NavigateEvent) => {
    navigate(e.detail.page, e.detail.conversationId);
}) as EventListener);

// Initial navigation
navigate(getToken() ? 'chatlist' : 'login');
