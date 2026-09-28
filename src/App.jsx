import React, { useEffect } from 'react';
import { useAppState } from './context/AppStateContext.jsx';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import Home from './pages/Home.jsx';
import Subjects from './pages/Subjects.jsx';
import ProgressPage from './pages/Progress.jsx';
import Game from './pages/Game.jsx';
import MemoryGame from './pages/MemoryGame.jsx';
import Auth from './pages/Auth.jsx';
import Characters from './pages/Characters.jsx';
import Plans from './pages/Plans.jsx';
import SubscriptionGate from './components/SubscriptionGate.jsx';

const VIEWS = {
  home: Home,
  subjects: Subjects,
  progress: ProgressPage,
  plans: Plans,
  game: Game,
  'memory-game': MemoryGame,
  characters: Characters,
};

export default function App() {
  const { state, auth, authReady } = useAppState();
  const ActiveView = VIEWS[state.activeView] || Home;

  // El hook debe ejecutarse en todos los renders, también mientras se muestra auth.
  useEffect(() => {
    if (authReady && auth) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [authReady, auth, state.activeView]);

  if (!authReady) return null;
  if (!auth) return <Auth />;

  return <SubscriptionGate>
    <div className="bg-background text-on-surface flex flex-col min-h-screen relative select-none pb-24 md:pb-10">
      <Header />
      <main className="flex-1 w-full pt-20 sm:pt-24 md:pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col transition-all">
        <ActiveView />
      </main>
      <BottomNav />
    </div>
  </SubscriptionGate>;
}
