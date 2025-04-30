import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const ProveedorModal = ({ show, onHide, proveedor, onGuardar }) => {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    persona_contacto: '',
    telefono: '',
    correo: '',
    direccion: '',
    ruc: ''
  });

  // Actualizar formulario cuando se selecciona un proveedor para editar
  useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre: proveedor.nombre || '',
        persona_contacto: proveedor.persona_contacto || '',
        telefono: proveedor.telefono || '',
        correo: proveedor.correo || '',
        direccion: proveedor.direccion || '',
        ruc: proveedor.ruc || ''
      });
    } else {
      // Resetear formulario
      setFormData({
        nombre: '',
        persona_contacto: '',
        telefono: '',
        correo: '',
        direccion: '',
        ruc: ''
      });
    }
    setValidated(false);
  }, [proveedor, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
    
    onGuardar(formData);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="proveedorNombre">
                <Form.Label>Nombre del Proveedor</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. Distribuidora Farmacéutica S.A."
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El nombre del proveedor es obligatorio.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="proveedorPersonaContacto">
                <Form.Label>Persona de Contacto</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  name="persona_contacto"
                  value={formData.persona_contacto}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="proveedorTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. 2222-9999"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="proveedorCorreo">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Ej. contacto@proveedor.com"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  Ingrese un correo electrónico válido.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="proveedorRUC">
                <Form.Label>RUC / NIT</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. 12345678-9"
                  name="ruc"
                  value={formData.ruc}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group controlId="proveedorDireccion" className="mb-3">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ingrese la dirección completa del proveedor"
              name="direccion"
              value={formData.direccion}
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
          {proveedor ? 'Actualizar' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProveedorModal;