import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const PresentacionModal = ({ show, onHide, presentacion, onGuardar }) => {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    nombre_presentacion: '',
    descripcion: '',
    estado: 'activo'
  });

  // Actualizar formulario cuando se selecciona una presentación para editar
  useEffect(() => {
    if (presentacion) {
      setFormData({
        nombre_presentacion: presentacion.nombre_presentacion || '',
        descripcion: presentacion.descripcion || '',
        estado: presentacion.estado || 'activo'
      });
    } else {
      // Resetear formulario
      setFormData({
        nombre_presentacion: '',
        descripcion: '',
        estado: 'activo'
      });
    }
    setValidated(false);
  }, [presentacion, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'radio' ? value : (type === 'checkbox' ? checked : value)
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
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {presentacion ? 'Editar Presentación' : 'Nueva Presentación'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="presentacionNombre">
            <Form.Label>Nombre de la Presentación</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej. Tableta, Jarabe, Inyectable, etc."
              name="nombre_presentacion"
              value={formData.nombre_presentacion}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              El nombre de la presentación es obligatorio.
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="presentacionDescripcion">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Descripción de la presentación (opcional)"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Form.Group>
          
          {presentacion && (
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  label="Activo"
                  name="estado"
                  id="estadoActivo"
                  value="activo"
                  checked={formData.estado === 'activo'}
                  onChange={handleChange}
                  inline
                />
                <Form.Check
                  type="radio"
                  label="Inactivo"
                  name="estado"
                  id="estadoInactivo"
                  value="inactivo"
                  checked={formData.estado === 'inactivo'}
                  onChange={handleChange}
                  inline
                />
              </div>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {presentacion ? 'Actualizar' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PresentacionModal;