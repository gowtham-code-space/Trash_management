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
    return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>Loading...</div>
  }

  return (
    <Navigator/>
  )
}

export default App
