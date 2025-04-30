import React from 'react';
import { Modal, Button, Row, Col, Card, Table, Badge } from 'react-bootstrap';

const VerLoteModal = ({ show, onHide, lote, onDescartar }) => {
  // Si no hay lote seleccionado, no mostramos el modal
  if (!lote) {
    return null;
  }

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

  // Determinar si el lote está vencido o próximo a vencer
  const fechaCaducidad = new Date(lote.fecha_caducidad);
  const hoy = new Date();
  const diasRestantes = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));
  
  let estadoLote = lote.estado;
  let badgeVariant = "success";
  let estadoTexto = "Activo";
  
  if (estadoLote === 'agotado') {
    badgeVariant = "secondary";
    estadoTexto = "Agotado";
  } else if (estadoLote === 'vencido' || diasRestantes <= 0) {
    badgeVariant = "danger";
    estadoTexto = "Vencido";
  } else if (diasRestantes <= 90) {
    badgeVariant = "warning";
    estadoTexto = "Próximo a vencer";
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Lote</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Información del Lote</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">ID Stock</p>
                <p className="fw-bold">{lote.id_stock}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Número de Lote</p>
                <p className="fw-bold">{lote.numero_lote}</p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Medicamento</p>
                <p className="fw-bold">{lote.nombre}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Código Medicamento</p>
                <p>{lote.codigo}</p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Fecha de Fabricación</p>
                <p>{formatDate(lote.fecha_fabricacion)}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Fecha de Caducidad</p>
                <p className={diasRestantes <= 90 ? "text-danger fw-bold" : ""}>
                  {formatDate(lote.fecha_caducidad)} 
                  {diasRestantes <= 90 && diasRestantes > 0 && ` (${diasRestantes} días restantes)`}
                  {diasRestantes <= 0 && " (Vencido)"}
                </p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Cantidad Disponible</p>
                <p>{lote.cantidad_disponible}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Fecha de Ingreso</p>
                <p>{formatDateTime(lote.fecha_ingreso)}</p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Estado</p>
                <p>
                  <Badge bg={badgeVariant}>{estadoTexto}</Badge>
                </p>
              </Col>
              {lote.concentracion && (
                <Col md={6}>
                  <p className="text-muted mb-1">Concentración</p>
                  <p>{lote.concentracion}</p>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h6 className="mb-0">Historial de Movimientos</h6>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Usuario</th>
                    <th>Origen/Destino</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Aquí se mostrarían los movimientos si estuvieran disponibles en la API */}
                  <tr>
                    <td colSpan="5" className="text-center">
                      No hay movimientos registrados para este lote
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        {estadoLote === 'activo' && (
          <>
            {diasRestantes <= 0 && (
              <Button 
                variant="danger" 
                onClick={() => onDescartar(lote.id_stock, 'vencido')}
              >
                Marcar como Vencido
              </Button>
            )}
            {lote.cantidad_disponible === 0 && (
              <Button 
                variant="warning" 
                onClick={() => onDescartar(lote.id_stock, 'agotado')}
              >
                Marcar como Agotado
              </Button>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default VerLoteModal;