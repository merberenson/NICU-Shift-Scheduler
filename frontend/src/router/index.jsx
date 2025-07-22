import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/register';
import Delete from '../pages/Delete'
import UpdateAvailability from '../pages/Update';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'delete', element: <Delete />},
      { path: 'update', element: < UpdateAvailability /> }
      ],
  },
]);

export default router;