import React, { useEffect, useState } from 'react';
import { Container, InputGroup, FormControl, Row ,Button} from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { listarExamenesPendientesService } from 'services/examenService';
import Card from '../../components/Card/MainCard';
import { useNavigate } from 'react-router-dom';



const Examenes = () => {
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadExamenes = async () => {
      try {
        const data = await listarExamenesPendientesService.getExamenesPendientes();
        setExamenes(data);
      } catch (error) {
        console.error('Error al cargar exámenes pendientes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExamenes();
  }, []);

  const navigate = useNavigate(); 

  const columns = [
    { name: 'Nombre de Muestra', selector: row => `${row.nombre_muestra}`, sortable: true },
    { name: 'Examen', selector: row => row.examen_nombre, sortable: true },
    { name: 'Nombre del Paciente', selector: row => `${row.nombre_paciente} ${row.apellido_paciente}`, sortable: true },
    { name: 'Doctor Responsable', selector: row => `${row.doctor_nombre} ${row.doctor_apellido}`, sortable: true },
    { name: 'Fecha de Solicitud', selector: row => new Date(row.fecha_solicitud).toLocaleDateString('es-ES'), sortable: true },
    {
      name: 'Completar',
      cell: row => (
        <Button
          variant="success"
          size="sm"
          className="mt-2 mb-2 ps-3 pe-2"
          onClick={() => navigate(`/registrar-examen/${row.id_examen}`)} 
        >
          <i className="fas fa-pen"></i>
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    },
    {
      name: 'Eliminar',
      cell: row => (
        <Button
          variant="danger"
          size="sm"
          className="mt-2 mb-2 ps-3 pe-2"
          onClick={() => navigate(`/#`)}
        >
          <i className="fas fa-trash"></i>
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

  if (loading) return <p>Cargando exámenes pendientes...</p>;

  return (
    <Row>
      <Card title="Exámenes Pendientes">
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
          noDataComponent={<div>No hay exámenes pendientes para mostrar.</div>}
        />
      </Card>
    </Row>
  );
};

export default Examenes;
