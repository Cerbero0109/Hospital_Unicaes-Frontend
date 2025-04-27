import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

import { useNavigate } from 'react-router-dom';


// Crea el contexto
const AuthContext = createContext();

// Hook para usar el contexto en otros componentes
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

   useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8081/auth/user", {
          withCredentials: true
        });
        if (!response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Sesión cerrada exitosamente',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
          });
          localStorage.removeItem('isAuthenticated');
          navigate('/login');
        }else{
          setUser(response.data.user);
          localStorage.setItem('isAuthenticated', 'true');
        }
        
      } catch (error) {
        localStorage.removeItem('isAuthenticated');
      }
    };
  
    fetchUser();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};