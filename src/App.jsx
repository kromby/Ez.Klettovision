import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Voting from './pages/Voting.jsx';
import Scoreboard from './pages/Scoreboard.jsx';
import Admin from './pages/Admin.jsx';

const router = createBrowserRouter([
  { path: '/',           element: <Voting /> },
  { path: '/scoreboard', element: <Scoreboard /> },
  { path: '/admin',      element: <Admin /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
