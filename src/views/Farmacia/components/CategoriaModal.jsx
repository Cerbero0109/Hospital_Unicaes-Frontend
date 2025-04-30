import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const CategoriaModal = ({ show, onHide, categoria, onGuardar }) => {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    nombre_categoria: '',
    descripcion: '',
    estado: 'activo'
  });

  // Actualizar formulario cuando se selecciona una categoría para editar
  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre_categoria: categoria.nombre_categoria || '',
        descripcion: categoria.descripcion || '',
        estado: categoria.estado || 'activo'
      });
    } else {
      // Resetear formulario
      setFormData({
        nombre_categoria: '',
        descripcion: '',
        estado: 'activo'
      });
    }
    setValidated(false);
  }, [categoria, show]);

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
          {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="categoriaNombre">
            <Form.Label>Nombre de la Categoría</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej. Analgésicos, Antibióticos, etc."
              name="nombre_categoria"
              value={formData.nombre_categoria}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              El nombre de la categoría es obligatorio.
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="categoriaDescripcion">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Descripción de la categoría (opcional)"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Form.Group>
          
          {categoria && (
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
          {categoria ? 'Actualizar' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CategoriaModal;