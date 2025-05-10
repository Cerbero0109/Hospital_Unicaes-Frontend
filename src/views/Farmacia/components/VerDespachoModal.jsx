import React from 'react';
import { Modal, Button, Table, Badge, Card, Row, Col } from 'react-bootstrap';

const VerDespachoModal = ({ show, onHide, despacho }) => {
  // Función para determinar el color del Badge según el estado
  const getBadgeVariant = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completo':
        return 'success';
      case 'parcial':
        return 'warning';
      case 'cancelado':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Función para obtener un texto formateado del estado
  const getEstadoText = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completo':
        return 'Despacho Completo';
      case 'parcial':
        return 'Despacho Parcial';
      case 'cancelado':
        return 'Despacho Cancelado';
      default:
        return estado || 'Desconocido';
    }
  };

  // Si no hay despacho, no mostramos nada
  if (!despacho) {
    return null;
  }

  // Determinar si es un despacho cancelado
  const esDespachoRequerido = despacho?.estado_despacho?.toLowerCase() === 'completo';
  const esDespachoAgotado = despacho?.estado_despacho?.toLowerCase() === 'parcial';
  const esDespachoCancelado = despacho?.estado_despacho?.toLowerCase() === 'cancelado';

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Detalles de Despacho #{despacho.id_despacho}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-3">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Información del Despacho</h6>
              <Badge 
                bg={getBadgeVariant(despacho.estado_despacho)} 
                className="fs-6 px-3 py-2"
              >
                {getEstadoText(despacho.estado_despacho)}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <p className="mb-1"><strong>ID Despacho:</strong></p>
                <p>{despacho.id_despacho}</p>
              </Col>
              <Col md={4}>
                <p className="mb-1"><strong>Fecha:</strong></p>
                <p>{new Date(despacho.fecha_despacho).toLocaleString('es-ES')}</p>
              </Col>
              <Col md={4}>
                <p className="mb-1"><strong>Despachado por:</strong></p>
                <p>{despacho.nombre_despachador}</p>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <p className="mb-1"><strong>Receta #:</strong></p>
                <p>{despacho.id_receta}</p>
              </Col>
              <Col md={4}>
                <p className="mb-1"><strong>Paciente:</strong></p>
                <p>{despacho.nombre_paciente}</p>
              </Col>
              <Col md={4}>
                <p className="mb-1"><strong>Médico:</strong></p>
                <p>{despacho.nombre_medico} {despacho.especialidad && `(${despacho.especialidad})`}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Mostrar razón de cancelación si el estado es 'cancelado' */}
        {esDespachoCancelado && despacho.razon_cancelacion && (
          <Card className="mb-3 border-danger">
            <Card.Header className="bg-danger bg-opacity-10 text-danger">
              <h6 className="mb-0">Razón de Cancelación</h6>
            </Card.Header>
            <Card.Body>
              <p className="mb-0">{despacho.razon_cancelacion}</p>
            </Card.Body>
          </Card>
        )}

        {/* Información de medicamentos solo si no es cancelado */}
        {!esDespachoCancelado && (
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Medicamentos Despachados</h6>
                {esDespachoAgotado && (
                  <Badge bg="warning">Despacho Parcial</Badge>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {despacho.detalles && despacho.detalles.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Medicamento</th>
                        <th>Concentración</th>
                        <th>Cantidad</th>
                        <th>Lote</th>
                        <th>Vencimiento</th>
                        <th>Instrucciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {despacho.detalles.map((detalle, index) => {
                        // Formatear fecha de caducidad
                        const fechaCaducidad = new Date(detalle.fecha_caducidad);
                        const hoy = new Date();
                        const diasHastaCaducidad = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));
                        const estaProximoAVencer = diasHastaCaducidad <= 90;
                        const estaVencido = diasHastaCaducidad <= 0;
                        
                        return (
                          <tr key={index}>
                            <td>{detalle.nombre_medicamento}</td>
                            <td>{detalle.concentracion}</td>
                            <td>{detalle.cantidad_despachada}</td>
                            <td>{detalle.numero_lote}</td>
                            <td>
                              <span className={estaVencido ? 'text-danger' : estaProximoAVencer ? 'text-warning' : ''}>
                                {fechaCaducidad.toLocaleDateString('es-ES')}
                              </span>
                            </td>
                            <td>{detalle.instrucciones}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted mb-0">No hay detalles de medicamentos disponibles.</p>
              )}
            </Card.Body>
            
            {/* Información relacionada con receta original */}
            {esDespachoAgotado && (
              <Card.Footer className="bg-light">
                <div className="d-flex align-items-center">
                  <div className="me-2">
                    <i className="fas fa-info-circle text-warning"></i>
                  </div>
                  <div>
                    <small className="text-muted">
                      Este es un despacho parcial. Se entregaron menos medicamentos de los prescritos originalmente debido a disponibilidad de stock.
                    </small>
                  </div>
                </div>
              </Card.Footer>
            )}
          </Card>
        )}

        {/* Observaciones */}
        {despacho.observaciones && (
          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">Observaciones</h6>
            </Card.Header>
            <Card.Body>
              <p className="mb-0">{despacho.observaciones}</p>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary">
          <i className="fas fa-print me-1"></i> Imprimir
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VerDespachoModal;