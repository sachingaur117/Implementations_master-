import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] });

export const metadata: Metadata = {
  title: 'Rentlz Implementation Portal',
  description: 'Standardized onboarding engine for Rentlz product implementations',
};

const CHATBOT_URL = process.env.NEXT_PUBLIC_CHATBOT_URL || 'https://udify.app/chat/9glzPyXUAA7WEKQO';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}

        {/* Floating AI Chat button — opens chatbot URL in a new tab */}
        <style>{`
          .ai-chat-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            box-shadow: 0 4px 20px rgba(79,70,229,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            cursor: pointer;
            text-decoration: none;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .ai-chat-btn:hover {
            transform: scale(1.12);
            box-shadow: 0 6px 28px rgba(79,70,229,0.7);
          }
        `}</style>

        <a
          href={CHATBOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Open AI Assistant"
          className="ai-chat-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </body>
    </html>
  );
}
