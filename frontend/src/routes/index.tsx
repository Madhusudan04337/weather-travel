import { createBrowserRouter } from 'react-router-dom';

// TODO: Import layouts and pages as they are created.
// import { MainLayout } from '../layouts';
// import { HomePage, NotFoundPage } from '../pages';

export const router = createBrowserRouter([
  {
    path: '/',
    // element: <MainLayout />,
    children: [
      // { index: true, element: <HomePage /> },
    ],
  },
  // { path: '*', element: <NotFoundPage /> },
]);
