import React, {useEffect, useState} from 'react';
import { Row, Col, Card, Table, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from 'components/AuthContext';

// Componentes específicos para cada rol
const LaboratoristasDashboard = () => {
  return (
    <div>
      <Row>
        <Col md={6} xl={4}>
          <Card>
            <Card.Body>
              <h6 className='mb-4'>Exámenes Pendientes</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="feather icon-arrow-up text-c-green f-30 m-r-5"/>
                  </h3>
                </div>
                <div className="col-3 text-right">
                  <p className="m-b-0">
                    <Link to="/examenes-pendientes" className="btn btn-primary">Ver</Link>
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={4}>
          <Card>
            <Card.Body>
              <h6 className='mb-4'>Pacientes</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="feather icon-user text-c-blue f-30 m-r-5"/>
                  </h3>
                </div>
                <div className="col-3 text-right">
                  <p className="m-b-0">
                    <Link to="/pacientes-historial" className="btn btn-primary">Ver</Link>
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={4}>
          <Card>
            <Card.Body>
              <h6 className='mb-4'>Reportes</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="fas fa-chart-bar text-c-red f-30 m-r-5"/>
                  </h3>
                </div>
                <div className="col-3 text-right">
                  <p className="m-b-0">
                    <Link to="/gestion-reportes" className="btn btn-primary">Ver</Link>
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const FarmaciaDashboard = () => {
  return (
    <div>
      <Row>
        <Col md={6} xl={6}>
          <Card>
            <Card.Body>
              <h6 className='mb-4'>Inventario de Medicamentos</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="feather icon-package text-c-green f-30 m-r-5"/>
                  </h3>
                </div>
                <div className="col-3 text-right">
                  <p className="m-b-0">
                    <Link to="/inventario-medicamentos" className="btn btn-primary">Ver</Link>
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={6}>
          <Card>
            <Card.Body>
              <h6 className='mb-4'>Despacho de Medicamentos</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="fas fa-capsules text-c-blue f-30 m-r-5"/>
                  </h3>
                </div>
                <div className="col-3 text-right">
                  <p className="m-b-0">
                    <Link to="/despacho-medicamentos" className="btn btn-primary">Ver</Link>
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const DefaultDashboard = () => {
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

const DashDefault = () => {
  const { user } = useAuth();
  
  // Renderizar dashboard específico según el rol
  if (user?.rol === 'Laboratorista') {
    return (
      <>
        <h3 className='mb-4'>Panel de Control - Laboratorio</h3>
        <LaboratoristasDashboard />
      </>
    );
  } else if (user?.rol === 'Farmacia') {
    return (
      <>
        <h3 className='mb-4'>Panel de Control - Farmacia</h3>
        <FarmaciaDashboard />
      </>
    );
  } else {
    return <DefaultDashboard />;
  }
};

export default DashDefault;