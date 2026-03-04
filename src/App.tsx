import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { AdminRoute } from "@/components/AdminRoute";
import ProfileSelection from "./pages/ProfileSelection";
import Login from "./pages/Login";
import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import StudentList from "./pages/professor/StudentList";
import StudentDetail from "./pages/professor/StudentDetail";

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
          <AuthProvider>
            <Routes>
              <Route path="/" element={<ProfileSelection />} />
              <Route path="/login" element={<Login />} />
              <Route path="/professor" element={<ProfessorDashboard />} />
            <Route path="/professor/turma/:turmaId" element={<StudentList />} />
            <Route path="/professor/aluno/:studentId" element={<StudentDetail />} />
            <Route path="/professor/aluno/:studentId/avaliacao" element={<ExperimentalAssessment />} />
            <Route path="/psicologia" element={<PsychologyDashboard />} />
            <Route path="/psicologia/aluno/:studentId" element={<PsychStudentDetail />} />
            <Route path="/coordenacao" element={<CoordinationDashboard />} />
            <Route path="/coordenacao/alertas" element={<AlertsPanel />} />
            <Route path="/coordenacao/aluno/:studentId" element={<CoordStudentDetail />} />
            <Route path="/coordenacao/intervencoes" element={<InterventionManagement />} />
            <Route path="/coordenacao/ocorrencias/:id" element={<CriticalOccurrenceDetail />} />
            <Route path="/diretoria" element={<DirectoryDashboard />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
