import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap';
import { inventarioMovimientosService } from '../../../services/inventarioMovimientosService';

const VerMedicamentoModal = ({ show, onHide, medicamento, onAddLote, onEdit }) => {
  // Si no hay medicamento seleccionado, no mostramos el modal
  if (!medicamento) {
    return null;
  }

  // Estados para el historial de movimientos
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [errorMovimientos, setErrorMovimientos] = useState(null);

  // Cargar historial de movimientos cuando se abre el modal
  useEffect(() => {
    if (show && medicamento && medicamento.id_medicamento) {
      cargarHistorialMovimientos();
    }
  }, [show, medicamento]);

  // Función para cargar el historial de movimientos
  const cargarHistorialMovimientos = async () => {
    setLoadingMovimientos(true);
    setErrorMovimientos(null);
    try {
      const response = await inventarioMovimientosService.obtenerMovimientosPorMedicamento(medicamento.id_medicamento);
      setMovimientos(response.data || []);
    } catch (error) {
      console.error("Error al cargar historial de movimientos:", error);
      setErrorMovimientos("No se pudo cargar el historial de movimientos");
    } finally {
      setLoadingMovimientos(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Medicamento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Información General</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Código</p>
                <p className="fw-bold">{medicamento.codigo}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Nombre</p>
                <p className="fw-bold">{medicamento.nombre}</p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Categoría</p>
                <p>{medicamento.nombre_categoria}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Presentación</p>
                <p>{medicamento.nombre_presentacion}</p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Concentración</p>
                <p>{medicamento.concentracion}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Vía de Administración</p>
                <p>{medicamento.via_administracion}</p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Stock Actual</p>
                <p className={`fw-bold ${(medicamento.stock_actual < medicamento.stock_minimo) ? 'text-danger' : ''}`}>
                  {medicamento.stock_actual || 0}
                </p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Stock Mínimo</p>
                <p>{medicamento.stock_minimo}</p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Unidad de Medida</p>
                <p>{medicamento.unidad_medida}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Estado</p>
                <p>
                  <Badge bg={medicamento.estado === 'activo' ? 'success' : 'danger'}>
                    {medicamento.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </p>
              </Col>
            </Row>
            {medicamento.ubicacion_almacen && (
              <Row>
                <Col md={12}>
                  <p className="text-muted mb-1">Ubicación en Almacén</p>
                  <p>{medicamento.ubicacion_almacen}</p>
                </Col>
              </Row>
            )}
            {medicamento.descripcion && (
              <Row>
                <Col md={12}>
                  <p className="text-muted mb-1">Descripción</p>
                  <p>{medicamento.descripcion}</p>
                </Col>
              </Row>
            )}
            {medicamento.requiere_receta && (
              <Row>
                <Col md={12}>
                  <p className="text-muted mb-1">Requiere Receta</p>
                  <p>
                    <Badge bg="info">Sí</Badge>
                  </p>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Lotes Disponibles</h6>
            <Button size="sm" variant="primary" onClick={onAddLote}>
              <i className="fas fa-plus-circle me-1"></i> Nuevo Lote
            </Button>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID Stock</th>
                    <th>Lote</th>
                    <th>Fecha Caducidad</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {medicamento.lotes && medicamento.lotes.length > 0 ? (
                    medicamento.lotes.map(lote => {
                      // Determinar estado del lote
                      let badgeVariant = "success";
                      let estadoText = "Activo";

                      if (lote.estado === 'agotado') {
                        badgeVariant = "secondary";
                        estadoText = "Agotado";
                      } else if (lote.estado === 'vencido') {
                        badgeVariant = "danger";
                        estadoText = "Vencido";
                      } else {
                        // Calcular si está próximo a vencer
                        const hoy = new Date();
                        const fechaCaducidad = new Date(lote.fecha_caducidad);
                        const diasRestantes = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));

                        if (diasRestantes <= 90) {
                          badgeVariant = "warning";
                          estadoText = "Próximo a vencer";
                        }
                      }

                      return (
                        <tr key={lote.id_stock}>
                          <td>{lote.id_stock}</td>
                          <td>{lote.numero_lote}</td>
                          <td>{formatDate(lote.fecha_caducidad)}</td>
                          <td>{lote.cantidad_disponible}</td>
                          <td>
                            <Badge bg={badgeVariant}>
                              {estadoText}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No hay lotes disponibles para este medicamento
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h6 className="mb-0">Historial de Movimientos</h6>
          </Card.Header>
          <Card.Body>
            {loadingMovimientos ? (
              <div className="text-center p-3">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 mb-0">Cargando historial de movimientos...</p>
              </div>
            ) : errorMovimientos ? (
              <div className="alert alert-danger">{errorMovimientos}</div>
            ) : (
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Lote</th>
                      <th>Usuario</th>
                      <th>Origen/Destino</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.length > 0 ? (
                      movimientos.map((movimiento, index) => (
                        <tr key={index}>
                          <td>{formatDateTime(movimiento.fecha_hora)}</td>
                          <td>
                            <Badge bg={movimiento.tipo === 'Entrada' ? 'success' : 'danger'}>
                              {movimiento.tipo}
                            </Badge>
                          </td>
                          <td>{movimiento.cantidad}</td>
                          <td>{movimiento.numero_lote}</td>
                          <td>{movimiento.usuario}</td>
                          <td>{movimiento.origen_destino}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No hay movimientos registrados para este medicamento
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={onEdit}>
          Editar Medicamento
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VerMedicamentoModal;