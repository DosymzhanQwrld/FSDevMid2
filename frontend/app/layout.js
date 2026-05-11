import './globals.css';

export const metadata = {
  title: 'Personal Exchange',
  description: 'Stock trading platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}