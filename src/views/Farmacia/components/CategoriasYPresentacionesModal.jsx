import React, { useState } from 'react';
import { Modal, Button, Tab, Nav, Table, Badge } from 'react-bootstrap';
import CategoriaModal from './CategoriaModal';
import PresentacionModal from './PresentacionModal';

const CategoriasYPresentacionesModal = ({ 
  show, 
  onHide, 
  categorias, 
  presentaciones,
  onAddCategoria,
  onUpdateCategoria,
  onDeleteCategoria,
  onAddPresentacion,
  onUpdatePresentacion,
  onDeletePresentacion
}) => {
  // Estado para modales de edición
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showPresentacionModal, setShowPresentacionModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState(null);

  // Manejadores para modales de categoría
  const handleShowNewCategoria = () => {
    setCategoriaSeleccionada(null);
    setShowCategoriaModal(true);
  };

  const handleEditCategoria = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setShowCategoriaModal(true);
  };

  const handleGuardarCategoria = (categoriaData) => {
    if (categoriaSeleccionada) {
      onUpdateCategoria(categoriaSeleccionada.id_categoria, categoriaData);
    } else {
      onAddCategoria(categoriaData);
    }
    setShowCategoriaModal(false);
  };

  // Manejadores para modales de presentación
  const handleShowNewPresentacion = () => {
    setPresentacionSeleccionada(null);
    setShowPresentacionModal(true);
  };

  const handleEditPresentacion = (presentacion) => {
    setPresentacionSeleccionada(presentacion);
    setShowPresentacionModal(true);
  };

  const handleGuardarPresentacion = (presentacionData) => {
    if (presentacionSeleccionada) {
      onUpdatePresentacion(presentacionSeleccionada.id_presentacion, presentacionData);
    } else {
      onAddPresentacion(presentacionData);
    }
    setShowPresentacionModal(false);
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Administrar Categorías y Presentaciones</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tab.Container id="admin-tabs" defaultActiveKey="categorias">
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="categorias">Categorías</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="presentaciones">Presentaciones</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content>
              {/* Tab Categorías */}
              <Tab.Pane eventKey="categorias">
                <div className="d-flex justify-content-end mb-3">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleShowNewCategoria}
                  >
                    <i className="fas fa-plus-circle me-1"></i> Nueva Categoría
                  </Button>
                </div>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre Categoría</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorias.length > 0 ? (
                        categorias.map(cat => (
                          <tr key={cat.id_categoria}>
                            <td>{cat.id_categoria}</td>
                            <td>{cat.nombre_categoria}</td>
                            <td>{cat.descripcion || '-'}</td>
                            <td>
                              <Badge bg={cat.estado === 'activo' ? 'success' : 'danger'}>
                                {cat.estado === 'activo' ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                            <td>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                className="me-1"
                                onClick={() => handleEditCategoria(cat)}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              {cat.estado === 'activo' && (
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => {
                                    if (window.confirm(`¿Está seguro de desactivar la categoría ${cat.nombre_categoria}?`)) {
                                      onDeleteCategoria(cat.id_categoria);
                                    }
                                  }}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No hay categorías disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Tab.Pane>
              
              {/* Tab Presentaciones */}
              <Tab.Pane eventKey="presentaciones">
                <div className="d-flex justify-content-end mb-3">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleShowNewPresentacion}
                  >
                    <i className="fas fa-plus-circle me-1"></i> Nueva Presentación
                  </Button>
                </div>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre Presentación</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {presentaciones.length > 0 ? (
                        presentaciones.map(pres => (
                          <tr key={pres.id_presentacion}>
                            <td>{pres.id_presentacion}</td>
                            <td>{pres.nombre_presentacion}</td>
                            <td>{pres.descripcion || '-'}</td>
                            <td>
                              <Badge bg={pres.estado === 'activo' ? 'success' : 'danger'}>
                                {pres.estado === 'activo' ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                            <td>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                className="me-1"
                                onClick={() => handleEditPresentacion(pres)}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              {pres.estado === 'activo' && (
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => {
                                    if (window.confirm(`¿Está seguro de desactivar la presentación ${pres.nombre_presentacion}?`)) {
                                      onDeletePresentacion(pres.id_presentacion);
                                    }
                                  }}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No hay presentaciones disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Categoría */}
      <CategoriaModal 
        show={showCategoriaModal}
        onHide={() => setShowCategoriaModal(false)}
        categoria={categoriaSeleccionada}
        onGuardar={handleGuardarCategoria}
      />

      {/* Modal para Presentación */}
      <PresentacionModal 
        show={showPresentacionModal}
        onHide={() => setShowPresentacionModal(false)}
        presentacion={presentacionSeleccionada}
        onGuardar={handleGuardarPresentacion}
      />
    </>
  );
};

export default CategoriasYPresentacionesModal;