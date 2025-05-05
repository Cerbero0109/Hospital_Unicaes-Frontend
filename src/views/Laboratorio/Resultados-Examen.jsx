import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Container, Row, Modal, Form, Button } from 'react-bootstrap';
import Card from '../../components/Card/MainCard';
import { mostrarResultadosExamenService } from 'services/examenService';
import Swal from 'sweetalert2';

const ResultadosExamen = () => {
  const { id_examen } = useParams();
  const navigate = useNavigate();
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResultData, setNewResultData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingRowId, setEditingRowId] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [showConfirmCompleteModal, setShowConfirmCompleteModal] = useState(false);

  const cargarResultados = async () => {
    setLoading(true);
    try {
      const data = await mostrarResultadosExamenService.getResultadosExamen(id_examen);
      setResultados(data.filter(item => item.id_resultado !== null));
    } catch (error) {
      console.error('Error al cargar los resultados del examen:', error);
      Swal.fire('Error', 'No se pudieron cargar los resultados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarResultados();
  }, [id_examen]);

  const handleOpenAddModal = () => {
    setNewResultData({});
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewResultData({
      ...newResultData,
      [name]: value,
    });
  };

  const handleSaveNewResult = async () => {
    try {
      await mostrarResultadosExamenService.crearResultadoExamen(id_examen, newResultData);
      Swal.fire('Éxito', 'Resultado agregado correctamente.', 'success');
      handleCloseAddModal();
      cargarResultados();
    } catch (error) {
      console.error('Error al guardar el nuevo resultado:', error);
      Swal.fire('Error', 'No se pudo agregar el resultado.', 'error');
    }
  };

  const handleOpenEditModal = (row) => {
    setEditingRowId(row.id_resultado);
    setEditFormData({ ...row });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingRowId(null);
    setEditFormData({});
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleSaveEditResult = async () => {
    try {
      await mostrarResultadosExamenService.actualizarResultadoExamen(editingRowId, editFormData);
      Swal.fire('Éxito', 'Resultado actualizado correctamente.', 'success');
      handleCloseEditModal();
      cargarResultados();
    } catch (error) {
      console.error('Error al guardar los cambios del resultado:', error);
      Swal.fire('Error', 'No se pudo actualizar el resultado.', 'error');
    }
  };

  const handleOpenConfirmDeleteModal = (id) => {
    setDeleteRowId(id);
    setShowConfirmDeleteModal(true);
  };

  const handleCloseConfirmDeleteModal = () => {
    setShowConfirmDeleteModal(false);
    setDeleteRowId(null);
  };

  const handleDeleteResult = async () => {
    try {
      await mostrarResultadosExamenService.eliminarResultadoExamen(deleteRowId);
      Swal.fire('Éxito', 'Resultado eliminado correctamente.', 'success');
      handleCloseConfirmDeleteModal();
      cargarResultados();
    } catch (error) {
      console.error('Error al eliminar el resultado:', error);
      Swal.fire('Error', 'No se pudo eliminar el resultado.', 'error');
    }
  };

  const handleOpenConfirmCompleteModal = () => {
    setShowConfirmCompleteModal(true);
  };

  const handleCloseConfirmCompleteModal = () => {
    setShowConfirmCompleteModal(false);
  };

  const handleMarcarComoCompletado = async () => {
    try {
      await mostrarResultadosExamenService.marcarExamenComoCompletadoService(id_examen);
      Swal.fire('Éxito', 'Examen marcado como completado.', 'success').then(() => {
        navigate('/examenes-pendientes'); 
      });
      handleCloseConfirmCompleteModal();
    } catch (error) {
      console.error('Error al marcar el examen como completado:', error);
      Swal.fire('Error', 'No se pudo marcar el examen como completado.', 'error');
    }
  };

  const columns = [
    { name: 'Nombre del Resultado', selector: row => row.nombre_parametro, sortable: true },
    { name: 'Valor', selector: row => row.valor, sortable: true },
    { name: 'Unidad', selector: row => row.unidad, sortable: true },
    { name: 'Rango Referencia', selector: row => row.rango_referencia, sortable: true },
    {
      name: 'Acciones',
      cell: row => (
        <>
          <button
            className="btn btn-warning btn-sm mt-2 mb-2 ps-3 pe-2"
            onClick={() => handleOpenEditModal(row)}
            disabled={loading}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="btn btn-danger btn-sm mt-2 mb-2 ps-3 pe-2 ms-2"
            onClick={() => handleOpenConfirmDeleteModal(row.id_resultado)}
            disabled={loading}
          >
            <i className="fas fa-trash"></i>
          </button>
        </>
      ),
    },
  ];

  if (loading) return <p>Cargando resultados...</p>;

  return (
    <Row>
      <Card title="Resultados del Examen">
        <p>Nombre Paciente: <span className='fw-bold'> {resultados[0]?.nombre_paciente || 'No disponible'} {resultados[0]?.apellido_paciente || ''} </span></p>
        <p>Muestra: <span className='fw-bold'>{resultados[0]?.nombre_muestra || 'No disponible'}</span></p>
        <p>Nombre Examen: <span className='fw-bold'>{resultados[0]?.nombre_examen || 'No disponible' }</span></p>

        <div className="mb-3">
          <button className="btn btn-primary me-2" onClick={handleOpenAddModal} disabled={loading}>
            Adicionar Resultado
          </button>
          <button className="btn btn-success" onClick={handleOpenConfirmCompleteModal} disabled={loading}>
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
            progressPending={loading}
            noDataComponent={<div>Por el momento no has registrado ningún resultado.</div>}
          />
        </Container>
      </Card>

      {/* Modal para Adicionar Resultado */}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Nuevo Resultado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicNombreParametro">
              <Form.Label>Nombre del Resultado</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre del resultado"
                name="nombre_parametro"
                value={newResultData.nombre_parametro || ''}
                onChange={handleAddInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicValor">
              <Form.Label>Valor</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el valor"
                name="valor"
                value={newResultData.valor || ''}
                onChange={handleAddInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicUnidad">
              <Form.Label>Unidad</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese la unidad"
                name="unidad"
                value={newResultData.unidad || ''}
                onChange={handleAddInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicRangoReferencia">
              <Form.Label>Rango de Referencia</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el rango de referencia"
                name="rango_referencia"
                value={newResultData.rango_referencia || ''}
                onChange={handleAddInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleSaveNewResult} disabled={loading}>
            Guardar Nuevo Resultado
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Editar Resultado */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Resultado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formEditNombreParametro">
              <Form.Label>Nombre del Resultado</Form.Label>
              <Form.Control
                type="text"
                name="nombre_parametro"
                value={editFormData.nombre_parametro || ''}
                onChange={handleEditInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEditValor">
              <Form.Label>Valor</Form.Label>
              <Form.Control
                type="text"
                name="valor"
                value={editFormData.valor || ''}
                onChange={handleEditInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEditUnidad">
              <Form.Label>Unidad</Form.Label>
              <Form.Control
                type="text"
                name="unidad"
                value={editFormData.unidad || ''}
                onChange={handleEditInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEditRangoReferencia">
              <Form.Label>Rango de Referencia</Form.Label>
              <Form.Control
                type="text"
                name="rango_referencia"
                value={editFormData.rango_referencia || ''}
                onChange={handleEditInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleSaveEditResult} disabled={loading}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación para Eliminar Resultado */}
      <Modal show={showConfirmDeleteModal} onHide={handleCloseConfirmDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este resultado?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteResult} disabled={loading}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación para Marcar como Completado */}
      <Modal show={showConfirmCompleteModal} onHide={handleCloseConfirmCompleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que se registró todo correctamente?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmCompleteModal}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleMarcarComoCompletado} disabled={loading}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default ResultadosExamen;