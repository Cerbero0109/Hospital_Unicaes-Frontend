import React, { useEffect, useState } from 'react';
import { Container, InputGroup, FormControl, Row, Button, Modal, Table } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { pacientesConExamenService, historialExamenesPorPacienteService } from 'services/examenService';
import Card from '../../components/Card/MainCard';

const PacientesHistorial = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [historialExamenes, setHistorialExamenes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  useEffect(() => {
    const loadPacientes = async () => {
      try {
        const data = await pacientesConExamenService.getPacientesConExamen();
        setPacientes(data);
      } catch (error) {
        console.error('Error al cargar pacientes con examen:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPacientes();
  }, []);

  const handleVerHistorial = async (paciente) => {
    try {
      const data = await historialExamenesPorPacienteService.getHistorialExamenesPorPaciente(paciente.id_paciente);
      setHistorialExamenes(data);
      setPacienteSeleccionado(paciente);
      setShowModal(true);
    } catch (error) {
      console.error('Error al cargar historial del paciente:', error);
    }
  };

  const columns = [
    { name: 'Nombre', selector: row => `${row.nombre_paciente} ${row.apellido_paciente}`, sortable: true },
    { name: 'DUI', selector: row => row.dui_paciente, sortable: true },
    { name: 'Sexo', selector: row => row.sexo_paciente, sortable: true },
    { name: 'Teléfono', selector: row => row.telefono_paciente, sortable: true },
    { name: 'Ultima Solicitud', selector: row => new Date(row.ultima_fecha_solicitud).toLocaleDateString('es-ES'), sortable: true },
    {
      name: 'Ver Historial',
      cell: row => (
        <Button
          variant="warning"
          size="sm"
          className="mt-2 mb-2 ps-3 pe-2"
          onClick={() => handleVerHistorial(row)}
        >
          <i className="fas fa-clipboard-list"></i>
        </Button>
        
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    },
    {
      name: 'Descartar',
      cell: row => (
        <Button
          variant="danger"
          size="sm"
          className="mt-2 mb-2 ps-3 pe-2"
        >
          <i className="fas fa-times"></i>
        </Button>
        
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    }
  ];

  const filteredPacientes = pacientes.filter(paciente =>
    `${paciente.nombre_paciente} ${paciente.apellido_paciente} ${paciente.dui_paciente}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Cargando pacientes...</p>;

  return (
    <>
      <Row>
        <Card title="Pacientes con Exámenes">
          <Container className="mb-3">
            <InputGroup>
              <FormControl
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Container>
          <DataTable
            columns={columns}
            data={filteredPacientes}
            pagination
            striped
            highlightOnHover
            responsive
            dense
            noDataComponent={<div>No hay pacientes con exámenes para mostrar.</div>}
          />
        </Card>
      </Row>

      {/* Modal para mostrar historial */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Historial de Exámenes {pacienteSeleccionado && `- ${pacienteSeleccionado.nombre_paciente} ${pacienteSeleccionado.apellido_paciente}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historialExamenes.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nombre Examen</th>
                  <th>Fecha de Solicitud</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historialExamenes.map((examen) => (
                  <tr key={examen.id_examen}>
                    <td>{examen.nombre_examen}</td>
                    <td>{new Date(examen.fecha_solicitud).toLocaleDateString('es-ES')}</td>
                    <td>{examen.estado}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>Este paciente no tiene exámenes registrados.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PacientesHistorial;
