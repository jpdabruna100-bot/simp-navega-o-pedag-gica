import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import ProfileSelection from "./pages/ProfileSelection";
import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import StudentList from "./pages/professor/StudentList";
import StudentDetail from "./pages/professor/StudentDetail";
import NewAssessment from "./pages/professor/NewAssessment";
import PsychologyDashboard from "./pages/psychology/PsychologyDashboard";
import PsychStudentDetail from "./pages/psychology/PsychStudentDetail";
import CoordinationDashboard from "./pages/coordination/CoordinationDashboard";
import AlertsPanel from "./pages/coordination/AlertsPanel";
import InterventionManagement from "./pages/coordination/InterventionManagement";
import CoordStudentDetail from "./pages/coordination/CoordStudentDetail";
import DirectoryDashboard from "./pages/directory/DirectoryDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import ExperimentalAssessment from "./pages/professor/ExperimentalAssessment";
import CriticalOccurrenceDetail from "./pages/coordination/CriticalOccurrenceDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProfileSelection />} />
            <Route path="/professor" element={<ProfessorDashboard />} />
            <Route path="/professor/turma/:turmaId" element={<StudentList />} />
            <Route path="/professor/aluno/:studentId" element={<StudentDetail />} />
            <Route path="/professor/aluno/:studentId/avaliacao" element={<NewAssessment />} />
            <Route path="/professor/aluno/:studentId/avaliacao-teste" element={<ExperimentalAssessment />} />
            <Route path="/psicologia" element={<PsychologyDashboard />} />
            <Route path="/psicologia/aluno/:studentId" element={<PsychStudentDetail />} />
            <Route path="/coordenacao" element={<CoordinationDashboard />} />
            <Route path="/coordenacao/alertas" element={<AlertsPanel />} />
            <Route path="/coordenacao/aluno/:studentId" element={<CoordStudentDetail />} />
            <Route path="/coordenacao/intervencoes" element={<InterventionManagement />} />
            <Route path="/coordenacao/ocorrencias/:id" element={<CriticalOccurrenceDetail />} />
            <Route path="/diretoria" element={<DirectoryDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
