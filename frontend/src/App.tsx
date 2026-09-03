import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { TenderProvider } from './context/TenderContext';

export function App() {
  return (
    <TenderProvider>
      <RouterProvider router={router} />
    </TenderProvider>
  );
}

export default App;
