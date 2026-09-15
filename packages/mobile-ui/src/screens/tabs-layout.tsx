import { MobileShell } from '../components/mobile-shell';

export default function TabsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <MobileShell>{children}</MobileShell>;
}
