import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuestionProvider } from './context/QuestionContext';
import { ExamProvider } from './context/ExamContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        <QuestionProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </QuestionProvider>
      </ExamProvider>
    </AuthProvider>
  );
}

export default App;
