import React from 'react';
import { Modal, Button, Table, Badge, Card } from 'react-bootstrap';

const VerDespachoModal = ({ show, onHide, despacho }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalles de Despacho #{despacho?.id_despacho}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-3">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Información del Despacho</h6>
              <Badge bg={despacho?.estado_despacho === 'completo' ? 'success' : 'warning'}>
                {despacho?.estado_despacho}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div className="col-md-4">
                <p><strong>ID Despacho:</strong> {despacho?.id_despacho}</p>
                <p><strong>Fecha:</strong> {new Date(despacho?.fecha_despacho).toLocaleString('es-ES')}</p>
              </div>
              <div className="col-md-4">
                <p><strong>Despachado por:</strong> {despacho?.nombre_despachador}</p>
                <p><strong>Receta:</strong> #{despacho?.id_receta}</p>
              </div>
              <div className="col-md-4">
                <p><strong>Paciente:</strong> {despacho?.nombre_paciente}</p>
                <p><strong>Médico:</strong> {despacho?.nombre_medico}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h6 className="mb-0">Medicamentos Despachados</h6>
          </Card.Header>
          <Card.Body>
            <Table hover>
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Cantidad</th>
                  <th>Lote</th>
                  <th>Vencimiento</th>
                  <th>Instrucciones</th>
                </tr>
              </thead>
              <tbody>
                {despacho?.detalles?.map((detalle, index) => (
                  <tr key={index}>
                    <td>{detalle.nombre_medicamento}</td>
                    <td>{detalle.cantidad_despachada}</td>
                    <td>{detalle.numero_lote}</td>
                    <td>{new Date(detalle.fecha_caducidad).toLocaleDateString('es-ES')}</td>
                    <td>{detalle.instrucciones}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {despacho?.observaciones && (
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