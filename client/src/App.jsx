import { useEffect, useState } from 'react'
import Navigator from './Navigation/Navigator'
import { silentRefresh } from './services/core/session'

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session on app load via silent refresh (HttpOnly cookie)
    const restoreSession = async () => {
      await silentRefresh();
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Navigator/>
  )
}

export default App
