import React, { useEffect, useState } from 'react';
import { Container, InputGroup, FormControl, Row, Button } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { listarExamenesCompletadosService } from 'services/examenService';
import Card from '../../components/Card/MainCard';
import { useNavigate } from 'react-router-dom';

const GestionReportes = () => {
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const navigate = useNavigate();

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
          onClick={() => navigate(`/#`)} 
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
          <Button variant="success" onClick={() => {}}>
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
    </Row>
  );
};

export default GestionReportes;
