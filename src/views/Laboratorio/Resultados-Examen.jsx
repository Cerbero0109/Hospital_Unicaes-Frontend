import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Container, Row } from 'react-bootstrap';
import Card from '../../components/Card/MainCard'; 
import { mostrarResultadosExamenService } from 'services/examenService'; 

const ResultadosExamen = () => {
  const { id_examen } = useParams(); // para obtener el id_examen de la URL
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarResultados = async () => {
      try {
        const data = await mostrarResultadosExamenService.getResultadosExamen(id_examen);
        setResultados(data);
      } catch (error) {
        console.error('Error al cargar los resultados del examen:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarResultados();
  }, [id_examen]);

  const columns = [
    { name: 'Nombre del Resultado', selector: row => row.nombre_parametro, sortable: true },
    { name: 'Valor', selector: row => row.valor, sortable: true },
    { name: 'Unidad', selector: row => row.unidad, sortable: true },
    { name: 'Rango Referencia', selector: row => row.rango_referencia, sortable: true },
    { 
      name: 'Acciones', 
      cell: row => (
        <>
          <button className="btn btn-warning btn-sm mt-2 mb-2 ps-3 pe-2">
            <i className="fas fa-edit"></i> 
          </button>
          <button className="btn btn-danger btn-sm mt-2 mb-2 ps-3 pe-2">
            <i className="fas fa-trash"></i>
          </button>
        </>
      )
    }
  ];

  if (loading) return <p>Cargando resultados...</p>;

return (
    <Row>
        <Card title="Resultados del Examen">
            <p>Nombre Paciente: <span className='fw-bold'> {resultados[0]?.nombre_paciente || 'No disponible'} {resultados[0]?.apellido_paciente || ''} </span></p>
            <p>Muestra: <span className='fw-bold'>{resultados[0]?.nombre_muestra || 'No disponible'}</span></p>
            <p>Nombre Examen: <span className='fw-bold'>{resultados[0]?.nombre_examen || 'No disponible' }</span></p>

            <div className="mb-3">
                <button className="btn btn-primary me-2">
                    Adicionar Resultado
                </button>
                <button className="btn btn-success">
                    Marcar como Completado
                </button>
            </div>
            <Container className="mb-3">
                <DataTable
                    columns={columns}
                    data={resultados}
                    pagination
                    striped
                    highlightOnHover
                    responsive
                    dense
                    noDataComponent={<div>Por el momento no has registrado ningun resultado.</div>}
                />
            </Container>
        </Card>
    </Row>
);
};

export default ResultadosExamen;
