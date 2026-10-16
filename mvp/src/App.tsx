import { useState } from 'react';
import { PROFILES, Profile, Screen, UNIDADES, unidadesVisiveis } from './domain';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardScreen } from './screens/Dashboard';
import { IndicadoresScreen } from './screens/Lancamento';
import { MotorScreen } from './screens/Motor';

export default function App() {
  const [profile, setProfile] = useState<Profile>('cam');
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [unidadeSel, setUnidadeSel] = useState<number | null>(null);

  const handleProfile = (p: Profile) => {
    setProfile(p);
    const allowed = PROFILES[p].screens;
    if (!allowed.includes(screen)) setScreen(allowed[0]);
  };

  // A unidade selecionada só vale se estiver na jurisdição do perfil atual.
  const visiveis = unidadesVisiveis(profile);
  const unidade = visiveis.find(u => u.id === unidadeSel) ?? visiveis[0] ?? UNIDADES[0];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar screen={screen} onNav={setScreen} profile={profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header profile={profile} onChange={handleProfile} />
        <main className="flex-1 overflow-y-auto">
          {screen === 'dashboard' && <DashboardScreen profile={profile} onVer={id => { setUnidadeSel(id); setScreen('indicadores'); }} />}
          {screen === 'indicadores' && <IndicadoresScreen key={`${profile}-${unidade.id}`} profile={profile} unidade={unidade} onUnidade={setUnidadeSel} />}
          {screen === 'motor' && profile === 'cam' && <MotorScreen profile={profile} />}
        </main>
      </div>
    </div>
  );
}
