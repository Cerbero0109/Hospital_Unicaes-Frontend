import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const LoteModal = ({ show, onHide, medicamentos = [], medicamentoPreseleccionado, onGuardar }) => {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    id_medicamento: '',
    numero_lote: '',
    fecha_fabricacion: '',
    fecha_caducidad: '',
    cantidad_disponible: 0,
    tipo_ingreso: 'compra',
    precio_unitario: 0,
    costo_unitario: 0,
    observaciones: ''
  });

  // Establecer medicamento preseleccionado (si se proporciona)
  useEffect(() => {
    if (show && medicamentoPreseleccionado) {
      setFormData(prev => ({
        ...prev,
        id_medicamento: medicamentoPreseleccionado.id_medicamento
      }));
    } else if (show) {
      // Resetear formulario al abrir modal sin medicamento preseleccionado
      setFormData({
        id_medicamento: '',
        numero_lote: '',
        fecha_fabricacion: '',
        fecha_caducidad: '',
        cantidad_disponible: 0,
        tipo_ingreso: 'compra',
        precio_unitario: 0,
        costo_unitario: 0,
        observaciones: ''
      });
    }
    setValidated(false);
  }, [show, medicamentoPreseleccionado]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convertir a número si el campo es numérico
    const newValue = (type === 'number') ? parseFloat(value) : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Validar que la fecha de caducidad sea mayor que la de fabricación
    const fechaFabricacion = new Date(formData.fecha_fabricacion);
    const fechaCaducidad = new Date(formData.fecha_caducidad);
    
    if (fechaCaducidad <= fechaFabricacion) {
      alert("La fecha de caducidad debe ser posterior a la fecha de fabricación.");
      return;
    }
    
    onGuardar(formData);
  };

  // Calcular fecha mínima (hoy) para fecha de fabricación
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Lote</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="loteMedicamento">
                <Form.Label>Medicamento</Form.Label>
                <Form.Select
                  name="id_medicamento"
                  value={formData.id_medicamento}
                  onChange={handleChange}
                  required
                  disabled={medicamentoPreseleccionado}
                >
                  <option value="">Seleccione un medicamento</option>
                  {Array.isArray(medicamentos) && medicamentos.map(med => (
                    <option key={med.id_medicamento} value={med.id_medicamento}>
                      {med.nombre} ({med.concentracion})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Debe seleccionar un medicamento.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="loteNumero">
                <Form.Label>Número de Lote</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. LOT-A12345"
                  name="numero_lote"
                  value={formData.numero_lote}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El número de lote es obligatorio.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="loteFechaFabricacion">
                <Form.Label>Fecha de Fabricación</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fabricacion"
                  value={formData.fecha_fabricacion}
                  onChange={handleChange}
                  max={today}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  La fecha de fabricación es obligatoria y no puede ser futura.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="loteFechaCaducidad">
                <Form.Label>Fecha de Caducidad</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_caducidad"
                  value={formData.fecha_caducidad}
                  onChange={handleChange}
                  min={today}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  La fecha de caducidad es obligatoria y debe ser futura.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="loteCantidad">
                <Form.Label>Cantidad Inicial</Form.Label>
                <Form.Control
                  type="number"
                  name="cantidad_disponible"
                  value={formData.cantidad_disponible}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  La cantidad inicial debe ser mayor a 0.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="loteTipoIngreso">
                <Form.Label>Tipo de Ingreso</Form.Label>
                <Form.Select
                  name="tipo_ingreso"
                  value={formData.tipo_ingreso}
                  onChange={handleChange}
                  required
                >
                  <option value="compra">Compra</option>
                  <option value="donacion">Donación</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="lotePrecioUnitario">
                <Form.Label>Precio Unitario ($)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="precio_unitario"
                  value={formData.precio_unitario}
                  onChange={handleChange}
                  min="0"
                  disabled={formData.tipo_ingreso === 'donacion'}
                />
                <Form.Text className="text-muted">
                  Precio sin costos adicionales.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="loteCostoUnitario">
                <Form.Label>Costo Unitario ($)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="costo_unitario"
                  value={formData.costo_unitario}
                  onChange={handleChange}
                  min="0"
                  disabled={formData.tipo_ingreso === 'donacion'}
                />
                <Form.Text className="text-muted">
                  Precio total incluyendo transporte, impuestos, etc.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group controlId="loteObservaciones" className="mb-3">
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingrese cualquier información adicional relevante..."
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LoteModal;