import React, {useEffect, useState} from 'react';
import { Row, Col, Card, Table, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from 'components/AuthContext';
import { color } from 'd3';


const DashDefault = () => {
  const { user } = useAuth(); 
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer); 
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '15%' }}>
      <h2 style={{color: "#9a2921"}}>{time.toLocaleTimeString()}</h2>
      <h3 className='mt-3'>
       Bienvenido {user?.rol}: {user?.nombre} {user?.apellido} 
      </h3>
    </div>
  );
};

export default DashDefault;
