import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { proveedorService } from '../../../services/proveedorService';

const MedicamentoModal = ({ show, onHide, medicamento, categorias = [], presentaciones = [], onGuardar }) => {
  const [validated, setValidated] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    id_categoria: '',
    id_presentacion: '',
    id_proveedor: '',
    concentracion: '',
    unidad_medida: '',
    via_administracion: '',
    stock_minimo: 10,
    ubicacion_almacen: '',
    requiere_receta: false
  });

  // Cargar proveedores al montar el componente
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await proveedorService.listarProveedores();
        setProveedores(response.data || []);
      } catch (error) {
        console.error("Error al cargar proveedores:", error);
        setProveedores([]); // Inicializa con array vacío en caso de error
      }
    };

    if (show) {
      fetchProveedores();
    }
  }, [show]);

  // Actualizar formulario cuando se selecciona un medicamento para editar
  useEffect(() => {
    if (medicamento) {
      setFormData({
        codigo: medicamento.codigo || '',
        nombre: medicamento.nombre || '',
        descripcion: medicamento.descripcion || '',
        id_categoria: medicamento.id_categoria || '',
        id_presentacion: medicamento.id_presentacion || '',
        id_proveedor: medicamento.id_proveedor || '',
        concentracion: medicamento.concentracion || '',
        unidad_medida: medicamento.unidad_medida || '',
        via_administracion: medicamento.via_administracion || '',
        stock_minimo: medicamento.stock_minimo || 10,
        ubicacion_almacen: medicamento.ubicacion_almacen || '',
        requiere_receta: medicamento.requiere_receta || false
      });
    } else {
      // Resetear formulario
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        id_categoria: '',
        id_presentacion: '',
        id_proveedor: '',
        concentracion: '',
        unidad_medida: '',
        via_administracion: '',
        stock_minimo: 10,
        ubicacion_almacen: '',
        requiere_receta: false
      });
    }
    setValidated(false);
  }, [medicamento, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
          {medicamento ? 'Editar Medicamento' : 'Nuevo Medicamento'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="medicamentoCodigo">
                <Form.Label>Código</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. ACETAM500"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El código es obligatorio.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="medicamentoNombre">
                <Form.Label>Nombre del Medicamento</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. Acetaminofén 500mg"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El nombre es obligatorio.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="medicamentoCategoria">
                <Form.Label>Categoría</Form.Label>
                <Form.Select
                  name="id_categoria"
                  value={formData.id_categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {Array.isArray(categorias) && categorias.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Debe seleccionar una categoría.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="medicamentoPresentacion">
                <Form.Label>Presentación</Form.Label>
                <Form.Select
                  name="id_presentacion"
                  value={formData.id_presentacion}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una presentación</option>
                  {Array.isArray(presentaciones) && presentaciones.map(pres => (
                    <option key={pres.id_presentacion} value={pres.id_presentacion}>
                      {pres.nombre_presentacion}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Debe seleccionar una presentación.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="medicamentoConcentracion">
                <Form.Label>Concentración</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. 500mg, 250ml, etc."
                  name="concentracion"
                  value={formData.concentracion}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  La concentración es obligatoria.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="medicamentoUnidadMedida">
                <Form.Label>Unidad de Medida</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. mg, ml, unidad"
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  La unidad de medida es obligatoria.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="medicamentoViaAdministracion">
                <Form.Label>Vía de Administración</Form.Label>
                <Form.Select
                  name="via_administracion"
                  value={formData.via_administracion}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione vía de administración</option>
                  <option value="Oral">Oral</option>
                  <option value="Tópica">Tópica</option>
                  <option value="Intravenosa">Intravenosa</option>
                  <option value="Intramuscular">Intramuscular</option>
                  <option value="Subcutánea">Subcutánea</option>
                  <option value="Rectal">Rectal</option>
                  <option value="Inhalatoria">Inhalatoria</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Debe seleccionar una vía de administración.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="medicamentoStockMinimo">
                <Form.Label>Stock Mínimo</Form.Label>
                <Form.Control
                  type="number"
                  name="stock_minimo"
                  value={formData.stock_minimo}
                  onChange={handleChange}
                  min={1}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  El stock mínimo debe ser mayor a 0.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="medicamentoProveedor">
                <Form.Label>Proveedor</Form.Label>
                <Form.Select
                  name="id_proveedor"
                  value={formData.id_proveedor}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un proveedor (opcional)</option>
                  {Array.isArray(proveedores) && proveedores.map(prov => (
                    <option key={prov.id_proveedor} value={prov.id_proveedor}>
                      {prov.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="medicamentoUbicacion">
                <Form.Label>Ubicación en Almacén</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej. Estante A, Gaveta 3"
                  name="ubicacion_almacen"
                  value={formData.ubicacion_almacen}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group controlId="medicamentoDescripcion" className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Describa el medicamento y sus usos"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Group controlId="medicamentoRequiereReceta" className="mb-3">
            <Form.Check 
              type="checkbox"
              label="Requiere receta médica"
              name="requiere_receta"
              checked={formData.requiere_receta}
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
          {medicamento ? 'Actualizar' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MedicamentoModal;