import React, { useEffect, useState } from 'react';
import { Container, InputGroup, FormControl, Row, Button, Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { listarExamenesCompletadosService, mostrarResultadosExamenService } from 'services/examenService';
import Card from '../../components/Card/MainCard';
import { useNavigate } from 'react-router-dom';

const GestionReportes = () => {
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResultadosModal, setShowResultadosModal] = useState(false);
  const [selectedResultado, setSelectedResultado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarExamenes = async () => {
      try {
        const data = await listarExamenesCompletadosService.getExamenesCompletados();
        setExamenes(data);
      } catch (error) {
        console.error('Error al cargar los exámenes completados:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarExamenes();
  }, []);

  const handleOpenResultadosModal = (resultado) => {
    setSelectedResultado(resultado);
    setShowResultadosModal(true);
  };

  const handleCloseResultadosModal = () => {
    setShowResultadosModal(false);
    setSelectedResultado(null);
  };

  const columns = [
    { name: 'Paciente', selector: row => `${row.nombre_paciente} ${row.apellido_paciente}`, sortable: true },
    { name: 'Tipo de Examen', selector: row => row.examen_nombre, sortable: true },
    { name: 'Doctor Responsable', selector: row => `${row.doctor_nombre} ${row.doctor_apellido}`, sortable: true },
    { name: 'Fecha de Solicitud', selector: row => new Date(row.fecha_solicitud).toLocaleDateString('es-ES'), sortable: true },
    {
      name: 'Ver Resultados',
      cell: row => (
        <Button
          variant="info"
          size="sm"
          className="mt-2 mb-2 ps-3 pe-2"
          onClick={async () => {
            setLoading(true);
            try {
              const resultados = await mostrarResultadosExamenService.getResultadosExamen(row.id_examen);
              setSelectedResultado({
                paciente: `${row.nombre_paciente} ${row.apellido_paciente}`,
                muestra: row.nombre_muestra,
                numeroExamen: row.id_examen,
                fechaEmision: new Date(row.fecha_solicitud).toLocaleDateString('es-ES'),
                examen: row.examen_nombre,
                parametros: resultados, 
              });
              setShowResultadosModal(true);
            } catch (error) {
              console.error('Error al obtener los resultados del examen:', error);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          <i className="fas fa-eye"></i>
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    },
    {
      name: 'Descargar',
      cell: row => (
        <Button
          variant="warning"
          size="sm"
          className="mt-2 mb-2 ps-3 pe-2"
          onClick={() => navigate(`/#`)}
        >
          <i className="fas fa-download"></i>
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    }
  ];

  const filteredExamenes = examenes.filter(examen =>
    `${examen.nombre_paciente} ${examen.apellido_paciente} ${examen.examen_nombre}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Cargando exámenes completados...</p>;

  return (
    <Row>
      <Card title="Gestión de Reportes">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Catálogo de exámenes completados</h5>
          <Button variant="success" onClick={() => { }}>
            <i className="fas fa-file-export me-2"></i>
            Exportar Exámenes
          </Button>
        </div>
        <Container className="mb-3">
          <InputGroup>
            <FormControl
              placeholder="Buscar examen o paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Container>
        <DataTable
          columns={columns}
          data={filteredExamenes}
          pagination
          striped
          highlightOnHover
          responsive
          dense
          noDataComponent={<div>No hay exámenes completados para mostrar.</div>}
        />
      </Card>

      {/* Modal de Resultados */}
      <Modal show={showResultadosModal} onHide={handleCloseResultadosModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Resultados de Laboratorio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
  {selectedResultado && (
    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
      <p><strong>Paciente:</strong> {selectedResultado.paciente}</p>
      <p><strong>Muestra:</strong> {selectedResultado.muestra}</p>
      <p><strong>Número de Examen:</strong> {selectedResultado.numeroExamen}</p>
      <p><strong>Fecha de Emisión:</strong> {selectedResultado.fechaEmision}</p>
      <p><strong>Examen:</strong> {selectedResultado.examen}</p>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Parámetro</th>
              <th>Valor</th>
              <th>Unidad</th>
              <th>Valor Referencia</th>
            </tr>
          </thead>
          <tbody>
            {selectedResultado.parametros && Array.isArray(selectedResultado.parametros) && selectedResultado.parametros.map((parametro, index) => (
              <tr key={index}>
                <td>{parametro.nombre_parametro}</td>
                <td>{parametro.valor}</td>
                <td>{parametro.unidad}</td>
                <td>{parametro.rango_referencia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}
</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseResultadosModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default GestionReportes;