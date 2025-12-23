export const handleLogin = (token, setUser, setCurrentPage, fetchVaultItems, showNotification) => {
        console.log('Login successful, token:', token);
            setUser({ token });
            localStorage.setItem('token', token);
            setCurrentPage('dashboard');
            fetchVaultItems();
            // showNotification('Login successful!');
          }