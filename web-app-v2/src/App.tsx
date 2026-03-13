import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ExplorerPage } from './features/explorador/ExplorerPage';
import { BuilderPage } from './features/edu-continua/BuilderPage';
import { CatalogPage } from './features/edu-continua/CatalogPage';
import { EduContinuaDetallePage } from './features/edu-continua/EduContinuaDetallePage';
import { ComingSoonPage } from './features/ComingSoonPage';

import { WizardProgramaPage } from './features/programas/WizardProgramaPage';
import { ListaProgramasPage } from './features/programas/ListaProgramasPage';
import { ConstructorRutasPage } from './features/rutas/ConstructorRutasPage';
import { ListaRutasPage } from './features/rutas/ListaRutasPage';

/* ═══════════════════════════════════════════════════════
   App — Diseño Curricular Inteligente V2
   ═══════════════════════════════════════════════════════ */

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/explorador" element={<ExplorerPage />} />
                <Route path="/edu-continua/constructor" element={<BuilderPage />} />
                <Route path="/edu-continua/catalogo" element={<CatalogPage />} />
                <Route path="/edu-continua/:id" element={<EduContinuaDetallePage />} />

                {/* Programas ETDH */}
                <Route path="/programas/nuevo" element={<WizardProgramaPage />} />
                <Route path="/programas" element={<ListaProgramasPage />} />

                {/* Rutas Formativas */}
                <Route path="/rutas/constructor" element={<ConstructorRutasPage />} />
                <Route path="/rutas" element={<ListaRutasPage />} />

                {/* Módulos próximos */}
                <Route path="/ia/contenidos" element={<ComingSoonPage titulo="Generador de Contenidos" />} />
                <Route path="/ia/evaluaciones" element={<ComingSoonPage titulo="Generador de Evaluaciones" />} />
                <Route path="/ia/documentos" element={<ComingSoonPage titulo="Generador de Documentos" />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
