//npm install jquery datatables.net datatables.net-bs5 datatables.net-responsive-bs5
import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Card, Table, Badge, Spinner, Form, InputGroup } from 'react-bootstrap';
import { inventarioMovimientosService } from '../../../services/inventarioMovimientosService';

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
  
  .text-overflow-ellipsis {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const VerMedicamentoModal = ({ show, onHide, medicamento, onAddLote, onEdit }) => {
  // Si no hay medicamento seleccionado, no mostramos el modal
  if (!medicamento) {
    return null;
  }
  
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

  // Estados para el historial de movimientos
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [errorMovimientos, setErrorMovimientos] = useState(null);
  
  // Estados para paginación y búsqueda
  const [searchLotes, setSearchLotes] = useState('');
  const [searchMovimientos, setSearchMovimientos] = useState('');
  const [currentPageLotes, setCurrentPageLotes] = useState(1);
  const [currentPageMovimientos, setCurrentPageMovimientos] = useState(1);
  const [itemsPerPageLotes, setItemsPerPageLotes] = useState(5);
  const [itemsPerPageMovimientos, setItemsPerPageMovimientos] = useState(10);

  // Cargar historial de movimientos cuando se abre el modal
  useEffect(() => {
    if (show && medicamento && medicamento.id_medicamento) {
      cargarHistorialMovimientos();
    }
  }, [show, medicamento]);

  // Función para cargar el historial de movimientos
  const cargarHistorialMovimientos = async () => {
    setLoadingMovimientos(true);
    setErrorMovimientos(null);
    try {
      const response = await inventarioMovimientosService.obtenerMovimientosPorMedicamento(medicamento.id_medicamento);
      setMovimientos(response.data || []);
    } catch (error) {
      console.error("Error al cargar historial de movimientos:", error);
      setErrorMovimientos("No se pudo cargar el historial de movimientos");
    } finally {
      setLoadingMovimientos(false);
    }
  };

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
  
  // Filtrar lotes
  const filteredLotes = medicamento.lotes ? medicamento.lotes.filter(lote => {
    return (
      String(lote.id_stock || '').toLowerCase().includes(searchLotes.toLowerCase()) ||
      String(lote.numero_lote || '').toLowerCase().includes(searchLotes.toLowerCase()) ||
      formatDate(lote.fecha_caducidad).toLowerCase().includes(searchLotes.toLowerCase())
    );
  }) : [];
  
  // Filtrar movimientos
  const filteredMovimientos = movimientos.filter(movimiento => {
    return (
      formatDateTime(movimiento.fecha_hora).toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.tipo || '').toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.cantidad || '').toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.numero_lote || '').toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.usuario || '').toLowerCase().includes(searchMovimientos.toLowerCase()) ||
      String(movimiento.origen_destino || '').toLowerCase().includes(searchMovimientos.toLowerCase())
    );
  });
  
  // Calcular índices para paginación de lotes
  const indexOfLastLote = currentPageLotes * itemsPerPageLotes;
  const indexOfFirstLote = indexOfLastLote - itemsPerPageLotes;
  const currentLotes = filteredLotes.slice(indexOfFirstLote, indexOfLastLote);
  
  // Calcular índices para paginación de movimientos
  const indexOfLastMovimiento = currentPageMovimientos * itemsPerPageMovimientos;
  const indexOfFirstMovimiento = indexOfLastMovimiento - itemsPerPageMovimientos;
  const currentMovimientos = filteredMovimientos.slice(indexOfFirstMovimiento, indexOfLastMovimiento);
  
  // Calcular total de páginas
  const totalPagesLotes = Math.ceil(filteredLotes.length / itemsPerPageLotes);
  const totalPagesMovimientos = Math.ceil(filteredMovimientos.length / itemsPerPageMovimientos);
  
  // Funciones para cambiar de página
  const paginate = (pageNumber, setPage) => setPage(pageNumber);
  
  // Renderizar paginación
  const renderPagination = (currentPage, totalPages, paginate, setPage, itemsPerPage, setItemsPerPage, totalItems, firstIndex, lastIndex) => {
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
                setPage(1);
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
                onClick={() => paginate(1, setPage)}
                className="page-link"
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
            </li>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(currentPage - 1, setPage)}
                className="page-link"
                disabled={currentPage === 1}
              >
                &lt;
              </button>
            </li>
            
            {pageNumbers.map(number => (
              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <button
                  onClick={() => paginate(number, setPage)}
                  className="page-link"
                >
                  {number}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(currentPage + 1, setPage)}
                className="page-link"
                disabled={currentPage === totalPages || totalPages === 0}
              >
                &gt;
              </button>
            </li>
            <li className={`page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
              <button
                onClick={() => paginate(totalPages, setPage)}
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
    <Modal show={show} onHide={onHide} size="xl" className="modal-extra-wide">
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Medicamento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-3">
          <Card.Header>
            <h6 className="mb-0">Información General</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Código</p>
                <p className="fw-bold">{medicamento.codigo}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Nombre</p>
                <p className="fw-bold">{medicamento.nombre}</p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Categoría</p>
                <p>{medicamento.nombre_categoria}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Presentación</p>
                <p>{medicamento.nombre_presentacion}</p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Concentración</p>
                <p>{medicamento.concentracion}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Vía de Administración</p>
                <p>{medicamento.via_administracion}</p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Stock Actual</p>
                <p className={`fw-bold ${(medicamento.stock_actual < medicamento.stock_minimo) ? 'text-danger' : ''}`}>
                  {medicamento.stock_actual || 0}
                </p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Stock Mínimo</p>
                <p>{medicamento.stock_minimo}</p>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Unidad de Medida</p>
                <p>{medicamento.unidad_medida}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Estado</p>
                <p>
                  <Badge bg={medicamento.estado === 'activo' ? 'success' : 'danger'}>
                    {medicamento.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </p>
              </Col>
            </Row>
            {medicamento.ubicacion_almacen && (
              <Row>
                <Col md={12}>
                  <p className="text-muted mb-1">Ubicación en Almacén</p>
                  <p>{medicamento.ubicacion_almacen}</p>
                </Col>
              </Row>
            )}
            {medicamento.descripcion && (
              <Row>
                <Col md={12}>
                  <p className="text-muted mb-1">Descripción</p>
                  <p>{medicamento.descripcion}</p>
                </Col>
              </Row>
            )}
            <Row>
              <Col md={12}>
                <p className="text-muted mb-1">Requiere Receta</p>
                <p>
                  <Badge bg={medicamento.requiere_receta ? "info" : "secondary"}>
                    {medicamento.requiere_receta ? "Sí" : "No"}
                  </Badge>
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Lotes Disponibles</h6>
            <Button size="sm" variant="primary" onClick={onAddLote}>
              <i className="fas fa-plus-circle me-1"></i> Nuevo Lote
            </Button>
          </Card.Header>
          <Card.Body>
            {medicamento.lotes && medicamento.lotes.length > 0 ? (
              <>
                <div className="search-container">
                  <InputGroup size="sm">
                    <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar lotes..."
                      value={searchLotes}
                      onChange={(e) => {
                        setSearchLotes(e.target.value);
                        setCurrentPageLotes(1);
                      }}
                    />
                  </InputGroup>
                </div>
                
                <div className="table-container">
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>ID Stock</th>
                        <th>Lote</th>
                        <th>Fecha Caducidad</th>
                        <th>Cantidad</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLotes.map(lote => {
                        // Determinar estado del lote
                        let badgeVariant = "success";
                        let estadoText = "Activo";

                        if (lote.estado === 'agotado') {
                          badgeVariant = "secondary";
                          estadoText = "Agotado";
                        } else if (lote.estado === 'vencido') {
                          badgeVariant = "danger";
                          estadoText = "Vencido";
                        } else {
                          // Calcular si está próximo a vencer
                          const hoy = new Date();
                          const fechaCaducidad = new Date(lote.fecha_caducidad);
                          const diasRestantes = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));

                          if (diasRestantes <= 90) {
                            badgeVariant = "warning";
                            estadoText = "Próximo a vencer";
                          }
                        }

                        return (
                          <tr key={lote.id_stock}>
                            <td>{lote.id_stock}</td>
                            <td>{lote.numero_lote}</td>
                            <td>{formatDate(lote.fecha_caducidad)}</td>
                            <td>{lote.cantidad_disponible}</td>
                            <td>
                              <Badge bg={badgeVariant}>
                                {estadoText}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                      {currentLotes.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center">No se encontraron lotes con el criterio de búsqueda</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
                
                {renderPagination(
                  currentPageLotes,
                  totalPagesLotes,
                  paginate,
                  setCurrentPageLotes,
                  itemsPerPageLotes,
                  setItemsPerPageLotes,
                  filteredLotes.length,
                  indexOfFirstLote,
                  indexOfLastLote
                )}
              </>
            ) : (
              <div className="alert alert-info">
                No hay lotes disponibles para este medicamento
              </div>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h6 className="mb-0">Historial de Movimientos</h6>
          </Card.Header>
          <Card.Body>
            {loadingMovimientos ? (
              <div className="text-center p-3">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 mb-0">Cargando historial de movimientos...</p>
              </div>
            ) : errorMovimientos ? (
              <div className="alert alert-danger">{errorMovimientos}</div>
            ) : (
              <>
                {movimientos.length > 0 ? (
                  <>
                    <div className="search-container">
                      <InputGroup size="sm">
                        <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Buscar movimientos..."
                          value={searchMovimientos}
                          onChange={(e) => {
                            setSearchMovimientos(e.target.value);
                            setCurrentPageMovimientos(1);
                          }}
                        />
                      </InputGroup>
                    </div>
                    
                    <div className="table-container">
                      <Table hover responsive>
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Cantidad</th>
                            <th>Lote</th>
                            <th>Usuario</th>
                            <th>Origen/Destino</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMovimientos.map((movimiento, index) => (
                            <tr key={index}>
                              <td>{formatDateTime(movimiento.fecha_hora)}</td>
                              <td>
                                <Badge bg={movimiento.tipo === 'Entrada' ? 'success' : 'danger'}>
                                  {movimiento.tipo}
                                </Badge>
                              </td>
                              <td>{movimiento.cantidad}</td>
                              <td>{movimiento.numero_lote}</td>
                              <td>{movimiento.usuario}</td>
                              <td className="text-overflow-ellipsis" title={movimiento.origen_destino}>
                                {movimiento.origen_destino}
                              </td>
                            </tr>
                          ))}
                          {currentMovimientos.length === 0 && (
                            <tr>
                              <td colSpan="6" className="text-center">No se encontraron movimientos con el criterio de búsqueda</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                    
                    {renderPagination(
                      currentPageMovimientos,
                      totalPagesMovimientos,
                      paginate,
                      setCurrentPageMovimientos,
                      itemsPerPageMovimientos,
                      setItemsPerPageMovimientos,
                      filteredMovimientos.length,
                      indexOfFirstMovimiento,
                      indexOfLastMovimiento
                    )}
                  </>
                ) : (
                  <div className="alert alert-info">
                    No hay movimientos registrados para este medicamento
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={onEdit}>
          Editar Medicamento
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VerMedicamentoModal;