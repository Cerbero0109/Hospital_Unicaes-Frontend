import React, { useState, useEffect } from 'react';
import { Modal, Button, Tab, Nav, Table, Badge, Form, InputGroup, Row, Col } from 'react-bootstrap';
import CategoriaModal from './CategoriaModal';
import PresentacionModal from './PresentacionModal';

// Estilos personalizados para el modal más ancho
const customStyles = `
  .modal-extra-wide .modal-xl {
    max-width: 95%;
  }
  
  @media (min-width: 1200px) {
    .modal-extra-wide .modal-xl {
      max-width: 1400px;
    }
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .pagination-custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
  }
  
  .pagination-info {
    color: #6c757d;
  }
  
  .search-container {
    margin-bottom: 15px;
  }
`;

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
  // Agregar estilos personalizados al documento
  useEffect(() => {
    // Crear elemento de estilo
    const styleElement = document.createElement('style');
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);
    
    // Limpiar al desmontar
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Estado para modales de edición
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showPresentacionModal, setShowPresentacionModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState(null);
  
  // Estados para filtrado y paginación
  const [searchCategorias, setSearchCategorias] = useState('');
  const [searchPresentaciones, setSearchPresentaciones] = useState('');
  const [filtroCategorias, setFiltroCategorias] = useState('todos');
  const [filtroPresentaciones, setFiltroPresentaciones] = useState('todos');
  const [currentPageCategorias, setCurrentPageCategorias] = useState(1);
  const [currentPagePresentaciones, setCurrentPagePresentaciones] = useState(1);
  const [itemsPerPageCategorias, setItemsPerPageCategorias] = useState(10);
  const [itemsPerPagePresentaciones, setItemsPerPagePresentaciones] = useState(10);

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
  
  // Funciones para filtrado
  const filteredCategorias = categorias.filter(cat => {
    const matchesSearch = (
      String(cat.id_categoria || '').toLowerCase().includes(searchCategorias.toLowerCase()) ||
      String(cat.nombre_categoria || '').toLowerCase().includes(searchCategorias.toLowerCase()) ||
      String(cat.descripcion || '').toLowerCase().includes(searchCategorias.toLowerCase())
    );
    
    const matchesEstado = 
      filtroCategorias === 'todos' || 
      cat.estado === filtroCategorias;
    
    return matchesSearch && matchesEstado;
  });
  
  const filteredPresentaciones = presentaciones.filter(pres => {
    const matchesSearch = (
      String(pres.id_presentacion || '').toLowerCase().includes(searchPresentaciones.toLowerCase()) ||
      String(pres.nombre_presentacion || '').toLowerCase().includes(searchPresentaciones.toLowerCase()) ||
      String(pres.descripcion || '').toLowerCase().includes(searchPresentaciones.toLowerCase())
    );
    
    const matchesEstado = 
      filtroPresentaciones === 'todos' || 
      pres.estado === filtroPresentaciones;
    
    return matchesSearch && matchesEstado;
  });
  
  // Cálculos para paginación de categorías
  const indexOfLastCategoria = currentPageCategorias * itemsPerPageCategorias;
  const indexOfFirstCategoria = indexOfLastCategoria - itemsPerPageCategorias;
  const currentCategorias = filteredCategorias.slice(indexOfFirstCategoria, indexOfLastCategoria);
  const totalPagesCategorias = Math.ceil(filteredCategorias.length / itemsPerPageCategorias);
  
  // Cálculos para paginación de presentaciones
  const indexOfLastPresentacion = currentPagePresentaciones * itemsPerPagePresentaciones;
  const indexOfFirstPresentacion = indexOfLastPresentacion - itemsPerPagePresentaciones;
  const currentPresentaciones = filteredPresentaciones.slice(indexOfFirstPresentacion, indexOfLastPresentacion);
  const totalPagesPresentaciones = Math.ceil(filteredPresentaciones.length / itemsPerPagePresentaciones);
  
  // Funciones para cambiar de página
  const paginateCategorias = (pageNumber) => setCurrentPageCategorias(pageNumber);
  const paginatePresentaciones = (pageNumber) => setCurrentPagePresentaciones(pageNumber);
  
  // Renderizar paginación
  const renderPagination = (currentPage, totalPages, paginate, setItemsPerPage, itemsPerPage, totalItems, firstIndex, lastIndex) => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="pagination-custom">
        <div className="pagination-info">
          Mostrando {totalItems === 0 ? 0 : Math.min(firstIndex + 1, totalItems)} - {Math.min(lastIndex, totalItems)} de {totalItems} registros
        </div>
        
        <div className="d-flex align-items-center">
          <div className="me-3">
            <Form.Select 
              size="sm" 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                paginate(1);
              }}
            >
              <option value="5">5 por página</option>
              <option value="10">10 por página</option>
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
            </Form.Select>
          </div>
          
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(1)}
                className="page-link"
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
            </li>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(currentPage - 1)}
                className="page-link"
                disabled={currentPage === 1}
              >
                &lt;
              </button>
            </li>
            
            {pageNumbers.map(number => (
              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <button
                  onClick={() => paginate(number)}
                  className="page-link"
                >
                  {number}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(currentPage + 1)}
                className="page-link"
                disabled={currentPage === totalPages || totalPages === 0}
              >
                &gt;
              </button>
            </li>
            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(totalPages)}
                className="page-link"
                disabled={currentPage === totalPages || totalPages === 0}
              >
                &raquo;
              </button>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" className="modal-extra-wide">
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
                <Row className="mb-3">
                  <Col md={5} className="mb-2 mb-md-0">
                    <InputGroup>
                      <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Buscar categorías..."
                        value={searchCategorias}
                        onChange={(e) => {
                          setSearchCategorias(e.target.value);
                          setCurrentPageCategorias(1);
                        }}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3} className="mb-2 mb-md-0">
                    <Form.Select
                      value={filtroCategorias}
                      onChange={(e) => {
                        setFiltroCategorias(e.target.value);
                        setCurrentPageCategorias(1);
                      }}
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="activo">Activos</option>
                      <option value="inactivo">Inactivos</option>
                    </Form.Select>
                  </Col>
                  <Col md={4} className="text-md-end">
                    <Button 
                      variant="primary" 
                      onClick={handleShowNewCategoria}
                    >
                      <i className="fas fa-plus-circle me-1"></i> Nueva Categoría
                    </Button>
                  </Col>
                </Row>
                
                <div className="table-container">
                  <Table hover responsive>
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
                      {currentCategorias.length > 0 ? (
                        currentCategorias.map(cat => (
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
                            {searchCategorias || filtroCategorias !== 'todos'
                              ? 'No se encontraron categorías con los criterios de búsqueda'
                              : 'No hay categorías disponibles'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
                
                {/* Paginación de categorías */}
                {filteredCategorias.length > 0 && renderPagination(
                  currentPageCategorias,
                  totalPagesCategorias,
                  paginateCategorias,
                  setItemsPerPageCategorias,
                  itemsPerPageCategorias,
                  filteredCategorias.length,
                  indexOfFirstCategoria,
                  indexOfLastCategoria
                )}
              </Tab.Pane>
              
              {/* Tab Presentaciones */}
              <Tab.Pane eventKey="presentaciones">
                <Row className="mb-3">
                  <Col md={5} className="mb-2 mb-md-0">
                    <InputGroup>
                      <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Buscar presentaciones..."
                        value={searchPresentaciones}
                        onChange={(e) => {
                          setSearchPresentaciones(e.target.value);
                          setCurrentPagePresentaciones(1);
                        }}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3} className="mb-2 mb-md-0">
                    <Form.Select
                      value={filtroPresentaciones}
                      onChange={(e) => {
                        setFiltroPresentaciones(e.target.value);
                        setCurrentPagePresentaciones(1);
                      }}
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="activo">Activos</option>
                      <option value="inactivo">Inactivos</option>
                    </Form.Select>
                  </Col>
                  <Col md={4} className="text-md-end">
                    <Button 
                      variant="primary" 
                      onClick={handleShowNewPresentacion}
                    >
                      <i className="fas fa-plus-circle me-1"></i> Nueva Presentación
                    </Button>
                  </Col>
                </Row>
                
                <div className="table-container">
                  <Table hover responsive>
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
                      {currentPresentaciones.length > 0 ? (
                        currentPresentaciones.map(pres => (
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
                            {searchPresentaciones || filtroPresentaciones !== 'todos'
                              ? 'No se encontraron presentaciones con los criterios de búsqueda'
                              : 'No hay presentaciones disponibles'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
                
                {/* Paginación de presentaciones */}
                {filteredPresentaciones.length > 0 && renderPagination(
                  currentPagePresentaciones,
                  totalPagesPresentaciones,
                  paginatePresentaciones,
                  setItemsPerPagePresentaciones,
                  itemsPerPagePresentaciones,
                  filteredPresentaciones.length,
                  indexOfFirstPresentacion,
                  indexOfLastPresentacion
                )}
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