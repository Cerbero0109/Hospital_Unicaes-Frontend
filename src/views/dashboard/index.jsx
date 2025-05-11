import React, {useEffect, useState} from 'react';
import { Row, Col, Card, Table} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from 'components/AuthContext';
import {listarUltimosExamenesService , contarExamenesPendientesService, contarExamenesCompletadosService ,contarPacientesConExamenService} from 'services/examenService';
import { set } from 'immutable';

// Componentes específicos para cada rol
const LaboratoristasDashboard = () => {
  const [examenesPendientes, setExamenesPendientes] = useState(0);
  const [examenesCompletados, setExamenesCompletados] = useState(0);
  const [pacientesConExamen, setPacientesConExamen] = useState(0);
  const [ultimosExamenes, setUltimosExamenes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pendientes = await contarExamenesPendientesService.contarExamenesPendientes();
        const completados = await contarExamenesCompletadosService.contarExamenesCompletados();
        const ultimos = await listarUltimosExamenesService.getUltimosExamenes();
        const pacientesConExamen = await contarPacientesConExamenService.contarPacientesConExamen();


        setPacientesConExamen(pacientesConExamen.length);
        setExamenesPendientes(pendientes);
        setExamenesCompletados(completados);
        setUltimosExamenes(ultimos);
      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Row>
        <Col md={6} xl={4}>
          <Card>
            <Card.Body>
              <h6 className='mb-4'>Pacientes Registrados</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="feather icon-user text-c-blue f-30 m-r-5" />
                    {pacientesConExamen}
                  </h3>
                  <p className='mt-2'>Total de Pacientes con Examen</p>
                </div>
                <div className="col-3 text-right">
                  <Link to="/pacientes-historial" className="btn btn-primary">Ver</Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={4}>
          <Card>
            <Card.Body>
              <h6 className='mb-4'>Exámenes Pendientes</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="feather icon-clock text-warning f-30 m-r-5" />
                    {examenesPendientes}
                  </h3>
                  <p className='mt-2'>Total de Resultados Pendientes</p>
                </div>
                <div className="col-3 text-right">
                  <Link to="/examenes-pendientes" className="btn btn-primary">Ver</Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={4}>
          <Card>
            <Card.Body>
              <h6 className='mb-4'>Exámenes Completados</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="feather icon-check-circle text-success f-30 m-r-5" />
                    {examenesCompletados}
                  </h3>
                  <p className='mt-2'>Total de Examenes Completados</p>
                </div>
                <div className="col-3 text-right">
                  <Link to="/gestion-reportes" className="btn btn-primary">Ver</Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>Últimos 5 Exámenes Registrados</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Documento</th>
                    <th>Teléfono</th>
                    <th>Examen</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosExamenes.length > 0 ? (
                    ultimosExamenes.map((examen) => (
                      <tr key={examen.id_examen}>
                        <td>{`${examen.nombre_paciente} ${examen.apellido_paciente}`}</td>
                        <td>{examen.dui_paciente}</td>
                        <td>{examen.telefono_paciente}</td>
                        <td>{examen.nombre_examen}</td>
                        <td>{examen.estado}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No hay exámenes recientes.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
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