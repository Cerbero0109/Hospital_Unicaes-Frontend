import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Form, Button, Nav, Tab, Table, Badge, ProgressBar, InputGroup, FormControl, Alert, Pagination } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import MainCard from '../../components/Card/MainCard';
import { medicamentoService } from '../../services/medicamentoService';
import { categoriaService } from '../../services/categoriaService';
import { presentacionService } from '../../services/presentacionService';
import { stockService } from '../../services/stockService';
import { notificacionesService } from '../../services/notificacionesService';
import MedicamentoModal from './components/MedicamentoModal';
import LoteModal from './components/LoteModal';
import VerMedicamentoModal from './components/VerMedicamentoModal';
import VerLoteModal from './components/VerLoteModal';
import CategoriasYPresentacionesModal from './components/CategoriasYPresentacionesModal';
import ProveedoresModal from './components/ProveedoresModal';
import AjustarStockModal from './components/AjustarStockModal';

const InventarioMedicamentos = () => {
  // Estados para almacenar datos
  const [medicamentos, setMedicamentos] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);
  const [proximosVencer, setProximosVencer] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [notificaciones, setNotificaciones] = useState({
    stockBajo: [],
    stockVencimiento: [],
    totalNotificaciones: 0
  });

  // Estado para controlar cuándo se deben recargar los datos
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Estados para filtrar lotes 
  const [showLotesAgotados, setShowLotesAgotados] = useState(false);
  const [lotesAgotados, setLotesAgotados] = useState([]);

  // Estados para modales
  const [showMedicamentoModal, setShowMedicamentoModal] = useState(false);
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [showVerMedicamentoModal, setShowVerMedicamentoModal] = useState(false);
  const [showVerLoteModal, setShowVerLoteModal] = useState(false);
  const [showCategoriasModal, setShowCategoriasModal] = useState(false);
  const [showProveedoresModal, setShowProveedoresModal] = useState(false);

  const [showAjustarStockModal, setShowAjustarStockModal] = useState(false);
  // Función para manejar el ajuste de stock
  const handleAjustarStock = (lote) => {
    setLoteSeleccionado(lote);
    setShowAjustarStockModal(true);
  };

  // Estados para edición
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState(null);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [medicamentoParaLote, setMedicamentoParaLote] = useState(null);

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para pestaña activa
  const [activeTab, setActiveTab] = useState('general');

  const navigate = useNavigate();
  const location = useLocation();

  // Cargar parámetros de URL si existen
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (tab && ['general', 'stockBajo', 'vencimiento', 'lotes'].includes(tab)) {
      setActiveTab(tab);
    }

    if (action === 'addLote' && id) {
      // Buscar el medicamento por ID y abrir modal de lote
      const fetchMedicamento = async () => {
        try {
          const response = await medicamentoService.obtenerMedicamentoPorId(id);
          if (response.data) {
            setMedicamentoParaLote(response.data);
            setShowLoteModal(true);
          }
        } catch (error) {
          console.error("Error al obtener medicamento:", error);
        }
      };

      fetchMedicamento();
    }
  }, [location]);

  // Cargar datos iniciales - Modificado para actualizarse cuando shouldRefresh cambie
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar categorías primero para evitar errores en los modales
        const categoriasResponse = await categoriaService.listarCategorias();
        if (categoriasResponse && categoriasResponse.data) {
          setCategorias(categoriasResponse.data);
        } else {
          setCategorias([]);
        }

        // Cargar presentaciones
        const presentacionesResponse = await presentacionService.listarPresentaciones();
        if (presentacionesResponse && presentacionesResponse.data) {
          setPresentaciones(presentacionesResponse.data);
        } else {
          setPresentaciones([]);
        }

        // Cargar medicamentos
        const medicamentosResponse = await medicamentoService.listarMedicamentos();
        if (medicamentosResponse && medicamentosResponse.data) {
          setMedicamentos(medicamentosResponse.data);
        } else {
          setMedicamentos([]);
        }

        // Cargar medicamentos con stock bajo
        const stockBajoResponse = await medicamentoService.verificarStockBajo();
        if (stockBajoResponse && stockBajoResponse.data) {
          setStockBajo(stockBajoResponse.data);
        } else {
          setStockBajo([]);
        }

        // Cargar lotes próximos a vencer
        const proximosVencerResponse = await stockService.verificarStockProximoVencer();
        if (proximosVencerResponse && proximosVencerResponse.data) {
          setProximosVencer(proximosVencerResponse.data);
        } else {
          setProximosVencer([]);
        }

        // Cargar todos los lotes activos
        const lotesResponse = await stockService.listarStock();
        if (lotesResponse && lotesResponse.data) {
          setLotes(lotesResponse.data);
        } else {
          setLotes([]);
        }

        // Cargar lotes agotados
        const lotesAgotadosResponse = await stockService.listarLotesAgotados();
        if (lotesAgotadosResponse && lotesAgotadosResponse.data) {
          setLotesAgotados(lotesAgotadosResponse.data);
        } else {
          setLotesAgotados([]);
        }

        // Cargar notificaciones
        const notificacionesResponse = await notificacionesService.obtenerNotificaciones();
        if (notificacionesResponse && notificacionesResponse.data) {
          setNotificaciones(notificacionesResponse.data);
        } else {
          setNotificaciones({
            stockBajo: [],
            stockVencimiento: [],
            totalNotificaciones: 0
          });
        }

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Ocurrió un error al cargar los datos. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
        // Resetear el flag de actualización después de cargar
        setShouldRefresh(false);
      }
    };

    fetchData();
  }, [shouldRefresh]); // Ahora este efecto se ejecutará cuando shouldRefresh cambie

  // Función para recargar datos después de ajustar stock - Ahora simplemente activa la actualización
  const handleStockAjustado = async () => {
    setShouldRefresh(true);

    // Si había un lote seleccionado, actualizar su información
    if (loteSeleccionado) {
      const updatedLoteResponse = await stockService.obtenerStockPorId(loteSeleccionado.id_stock);
      if (updatedLoteResponse && updatedLoteResponse.data) {
        setLoteSeleccionado(updatedLoteResponse.data);
      }
    }
  };

  //lógica para filtrar lotes
  const filteredLotesWithoutSearch = useMemo(() => {
    let lotesData = [...lotes];

    // Agregar lotes agotados si se solicita
    if (showLotesAgotados) {
      lotesData = [...lotesData, ...lotesAgotados];
    }

    return lotesData;
  }, [lotes, lotesAgotados, showLotesAgotados]);

  // Filtrar medicamentos según término de búsqueda
  const filteredMedicamentos = medicamentos.filter(med =>
    (med.codigo && med.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (med.nombre && med.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (med.nombre_categoria && med.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Abrir modal para crear nuevo medicamento
  const handleNuevoMedicamento = () => {
    setMedicamentoSeleccionado(null);
    setShowMedicamentoModal(true);
  };

  // Abrir modal para editar medicamento
  const handleEditarMedicamento = (medicamento) => {
    setMedicamentoSeleccionado(medicamento);
    setShowMedicamentoModal(true);
  };
  // Abrir modal para ver detalles de medicamento
  const handleVerMedicamento = async (id) => {
    try {
      const response = await medicamentoService.obtenerMedicamentoPorId(id);
      if (!response || !response.data) {
        throw new Error("No se pudo obtener información del medicamento");
      }

      const stockResponse = await stockService.obtenerStockPorMedicamento(id);

      setMedicamentoSeleccionado({
        ...response.data,
        lotes: stockResponse && stockResponse.data ? stockResponse.data : []
      });

      setShowVerMedicamentoModal(true);
    } catch (error) {
      console.error("Error al obtener detalles del medicamento:", error);
      alert("No se pudo obtener la información del medicamento");
    }
  };

  // Abrir modal para crear nuevo lote
  const handleNuevoLote = (medicamento = null) => {
    setMedicamentoParaLote(medicamento);
    setLoteSeleccionado(null);
    setShowLoteModal(true);
  };

  // Abrir modal para ver detalles de lote
  const handleVerLote = async (id) => {
    try {
      const response = await stockService.obtenerStockPorId(id);
      if (!response || !response.data) {
        throw new Error("No se pudo obtener información del lote");
      }

      setLoteSeleccionado(response.data);
      setShowVerLoteModal(true);
    } catch (error) {
      console.error("Error al obtener detalles del lote:", error);
      alert("No se pudo obtener la información del lote");
    }
  };

  // Manejar guardado de nuevo medicamento o actualización - Actualizado para usar shouldRefresh
  const handleGuardarMedicamento = async (medicamentoData) => {
    try {
      if (medicamentoSeleccionado) {
        // Actualizar medicamento existente
        await medicamentoService.actualizarMedicamento(medicamentoSeleccionado.id_medicamento, medicamentoData);
      } else {
        // Crear nuevo medicamento
        await medicamentoService.crearMedicamento(medicamentoData);
      }

      // Solicitar actualización de datos
      setShouldRefresh(true);

      setShowMedicamentoModal(false);
    } catch (error) {
      console.error("Error al guardar medicamento:", error);
      alert("Error al guardar el medicamento");
    }
  };

  // Manejar guardado de nuevo lote - Actualizado para usar shouldRefresh
  const handleGuardarLote = async (loteData) => {
    try {
      await stockService.crearStock(loteData);

      // Solicitar actualización de datos
      setShouldRefresh(true);

      setShowLoteModal(false);
    } catch (error) {
      console.error("Error al guardar lote:", error);
      alert("Error al guardar el lote");
    }
  };

  // Manejar cambio de estado de medicamento - Actualizado para usar shouldRefresh
  const handleDesactivarMedicamento = async (id) => {
    if (window.confirm("¿Está seguro que desea desactivar este medicamento?")) {
      try {
        await medicamentoService.desactivarMedicamento(id);

        // Solicitar actualización de datos
        setShouldRefresh(true);
      } catch (error) {
        console.error("Error al desactivar medicamento:", error);
        alert("Error al desactivar el medicamento");
      }
    }
  };

  // Manejar cambio de estado de lote - Actualizado para usar shouldRefresh
  const handleDesactivarLote = async (id, estado) => {
    if (window.confirm(`¿Está seguro que desea marcar este lote como ${estado}?`)) {
      try {
        await stockService.cambiarEstadoStock(id, estado);

        // Solicitar actualización de datos
        setShouldRefresh(true);
      } catch (error) {
        console.error("Error al cambiar estado del lote:", error);
        alert("Error al cambiar el estado del lote");
      }
    }
  };

  // Mostrar indicador de carga
  if (loading) {
    return (
      <Row>
        <Col>
          <MainCard title="Inventario de Medicamentos">
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando inventario...</p>
            </div>
          </MainCard>
        </Col>
      </Row>
    );
  }

  // Mostrar mensaje de error si ocurrió alguno
  if (error) {
    return (
      <Row>
        <Col>
          <MainCard title="Inventario de Medicamentos">
            <Alert variant="danger">
              {error}
            </Alert>
          </MainCard>
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      <Col>
        <MainCard title="Inventario de Medicamentos">
          {/* Barra de búsqueda y botones de acción */}
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <FormControl
                  placeholder="Buscar medicamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-end">
              <Button variant="primary" onClick={handleNuevoMedicamento} className="me-2">
                <i className="fas fa-plus-circle me-1"></i> Nuevo Medicamento
              </Button>
              <Button variant="outline-secondary" onClick={() => handleNuevoLote()}>
                <i className="fas fa-box me-1"></i> Nuevo Lote
              </Button>
              <Button variant="outline-info" onClick={() => setShowProveedoresModal(true)}>
                <i className="fas fa-truck me-1"></i> Proveedores
              </Button>
            </Col>
          </Row>

          {/* Pestañas para navegar entre diferentes vistas */}
          <Tab.Container id="inventario-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="pills" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="general">
                  <i className="fas fa-list me-1"></i> Listado General
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="stockBajo">
                  <i className="fas fa-exclamation-triangle me-1"></i> Stock Bajo
                  {stockBajo.length > 0 && (
                    <Badge bg="danger" className="ms-1">{stockBajo.length}</Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="vencimiento">
                  <i className="fas fa-clock me-1"></i> Próximos a Vencer
                  {proximosVencer.length > 0 && (
                    <Badge bg="warning" className="ms-1">{proximosVencer.length}</Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="lotes">
                  <i className="fas fa-boxes me-1"></i> Lotes
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="ms-auto">
                <Button
                  variant="link"
                  className="text-primary"
                  onClick={() => setShowCategoriasModal(true)}
                >
                  <i className="fas fa-cog me-1"></i> Categorías y Presentaciones
                </Button>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* Pestaña: Listado General */}
              <Tab.Pane eventKey="general">
                <Card>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Medicamento</th>
                            <th>Categoría</th>
                            <th>Presentación</th>
                            <th>Concentración</th>
                            <th>Vía Admin.</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMedicamentos.length > 0 ? (
                            filteredMedicamentos.map((med) => {
                              // Calcular porcentaje de stock
                              const stockActual = med.stock_actual || 0;
                              const stockMinimo = med.stock_minimo || 10;
                              const mitadStockMinimo = stockMinimo / 2;
                              const porcentajeStock = Math.min(100, Math.floor((stockActual / stockMinimo) * 100));

                              // Determinar estado y variante de progreso según los nuevos criterios
                              let estadoStock = "Normal";
                              let variantProgress = "success";

                              if (stockActual <= mitadStockMinimo) {
                                // Stock actual es menor o igual a la mitad del stock mínimo
                                estadoStock = "Stock Crítico";
                                variantProgress = "danger";
                              } else if (stockActual <= stockMinimo) {
                                // Stock actual es menor o igual al stock mínimo pero mayor que la mitad
                                estadoStock = "Stock Bajo";
                                variantProgress = "warning";
                              } else {
                                // Stock actual es mayor que el stock mínimo
                                estadoStock = "Stock Normal";
                                variantProgress = "success";
                              }

                              return (
                                <tr key={med.id_medicamento}>
                                  <td>{med.codigo}</td>
                                  <td>{med.nombre}</td>
                                  <td>{med.nombre_categoria}</td>
                                  <td>{med.nombre_presentacion}</td>
                                  <td>{med.concentracion}</td>
                                  <td>{med.via_administracion}</td>
                                  <td>{stockActual}</td>
                                  <td>{med.stock_minimo}</td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="rounded-circle me-1"
                                        style={{
                                          width: '10px',
                                          height: '10px',
                                          backgroundColor: variantProgress === 'danger' ? '#dc3545' :
                                            variantProgress === 'warning' ? '#ffc107' : '#28a745'
                                        }}
                                      />
                                      <span>{estadoStock}</span>
                                    </div>
                                    <ProgressBar
                                      variant={variantProgress}
                                      now={porcentajeStock}
                                      style={{ height: '5px' }}
                                      className="mt-1"
                                    />
                                  </td>
                                  <td>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-1"
                                      onClick={() => handleVerMedicamento(med.id_medicamento)}
                                    >
                                      <i className="fas fa-eye"></i>
                                    </Button>
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() => handleEditarMedicamento(med)}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="10" className="text-center">
                                No se encontraron medicamentos
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Pestaña: Stock Bajo */}
              <Tab.Pane eventKey="stockBajo">
                <Card>
                  <Card.Body>
                    <Alert variant="warning" className="mb-3">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Se muestran medicamentos cuyo stock actual es menor o igual al stock mínimo establecido.
                    </Alert>
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Medicamento</th>
                            <th>Categoría</th>
                            <th>Concentración</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Nivel de Stock</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockBajo.length > 0 ? (
                            stockBajo.map((med) => {
                              const stockActual = med.stock_actual || 0;
                              const stockMinimo = med.stock_minimo || 10;
                              const porcentajeStock = Math.min(100, Math.floor((stockActual / stockMinimo) * 100));

                              let variantProgress = "danger";
                              if (porcentajeStock > 70) {
                                variantProgress = "warning";
                              }

                              return (
                                <tr key={med.id_medicamento}>
                                  <td>{med.codigo}</td>
                                  <td>{med.nombre}</td>
                                  <td>{med.nombre_categoria}</td>
                                  <td>{med.concentracion}</td>
                                  <td>{stockActual}</td>
                                  <td>{stockMinimo}</td>
                                  <td>
                                    <ProgressBar
                                      variant={variantProgress}
                                      now={porcentajeStock}
                                      label={`${porcentajeStock}%`}
                                    />
                                  </td>
                                  <td>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleNuevoLote(med)}
                                    >
                                      <i className="fas fa-plus-circle me-1"></i> Añadir Lote
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="8" className="text-center">
                                <Alert variant="success" className="m-0">
                                  No hay medicamentos con stock bajo
                                </Alert>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Pestaña: Próximos a Vencer */}
              <Tab.Pane eventKey="vencimiento">
                <Card>
                  <Card.Body>
                    <Alert variant="warning" className="mb-3">
                      <i className="fas fa-clock me-2"></i>
                      Se muestran lotes que caducarán en los próximos 90 días.
                    </Alert>
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>ID Stock</th>
                            <th>Número Lote</th>
                            <th>Medicamento</th>
                            <th>Categoría</th>
                            <th>Concentración</th>
                            <th>Fecha Caducidad</th>
                            <th>Días Restantes</th>
                            <th>Cantidad Inicial</th>
                            <th>Cantidad Disponible</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proximosVencer.length > 0 ? (
                            proximosVencer.map((lote) => {
                              // Calcular días restantes
                              const fechaCaducidad = new Date(lote.fecha_caducidad);
                              const hoy = new Date();
                              const diferenciaTiempo = fechaCaducidad.getTime() - hoy.getTime();
                              const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

                              let badgeVariant = "warning";
                              if (diasRestantes <= 30) {
                                badgeVariant = "danger";
                              }

                              return (
                                <tr key={lote.id_stock}>
                                  <td>{lote.id_stock}</td>
                                  <td>{lote.numero_lote}</td>
                                  <td>{lote.nombre}</td>
                                  <td>{lote.nombre_categoria}</td>
                                  <td>{lote.concentracion}</td>
                                  <td>
                                    {new Date(lote.fecha_caducidad).toLocaleDateString('es-ES')}
                                  </td>
                                  <td>
                                    <Badge bg={badgeVariant}>
                                      {diasRestantes} días
                                    </Badge>
                                  </td>
                                  <td>{lote.cantidad_inicial}</td>
                                  <td>{lote.cantidad_disponible}</td>
                                  <td>
                                    <Badge bg="warning">
                                      Próximo a vencer
                                    </Badge>
                                  </td>
                                  <td>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-1"
                                      onClick={() => handleVerLote(lote.id_stock)}
                                    >
                                      <i className="fas fa-eye"></i>
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleDesactivarLote(lote.id_stock, 'vencido')}
                                    >
                                      <i className="fas fa-trash me-1"></i> Descartar
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="11" className="text-center">
                                <Alert variant="success" className="m-0">
                                  No hay lotes próximos a vencer
                                </Alert>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Pestaña: Lotes */}
              <Tab.Pane eventKey="lotes">
                <Card>
                  <Card.Body>
                    {/* Filtros de lotes - Ahora solo con botón para lotes agotados */}
                    <Row className="mb-3">
                      <Col md={12} className="text-end">
                        <Button
                          variant="outline-secondary"
                          className="me-2"
                          onClick={() => setShowLotesAgotados(!showLotesAgotados)}
                        >
                          <i className="fas fa-box me-1"></i>
                          {showLotesAgotados ? "Ocultar lotes agotados" : "Mostrar lotes agotados"}
                        </Button>
                      </Col>
                    </Row>

                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>ID Stock</th>
                            <th>Número Lote</th>
                            <th>Medicamento</th>
                            <th>Fecha Fabricación</th>
                            <th>Fecha Caducidad</th>
                            <th>Cantidad Disponible</th>
                            <th>Fecha Ingreso</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLotesWithoutSearch.length > 0 ? (
                            filteredLotesWithoutSearch.map((lote) => {
                              let badgeVariant = "success";
                              let estadoTexto = "Activo";

                              if (lote.estado === 'agotado') {
                                badgeVariant = "secondary";
                                estadoTexto = "Agotado";
                              } else if (lote.estado === 'vencido') {
                                badgeVariant = "danger";
                                estadoTexto = "Vencido";
                              }

                              // Calcular días hasta vencimiento
                              const fechaCaducidad = new Date(lote.fecha_caducidad);
                              const hoy = new Date();
                              const diferenciaTiempo = fechaCaducidad.getTime() - hoy.getTime();
                              const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

                              if (diasRestantes <= 90 && lote.estado === 'activo') {
                                badgeVariant = "warning";
                                estadoTexto = "Próximo a vencer";
                              }

                              return (
                                <tr key={lote.id_stock}>
                                  <td>{lote.id_stock}</td>
                                  <td>{lote.numero_lote}</td>
                                  <td>{lote.nombre}</td>
                                  <td>
                                    {new Date(lote.fecha_fabricacion).toLocaleDateString('es-ES')}
                                  </td>
                                  <td>
                                    {new Date(lote.fecha_caducidad).toLocaleDateString('es-ES')}
                                  </td>
                                  <td>{lote.cantidad_disponible}</td>
                                  <td>
                                    {new Date(lote.fecha_ingreso).toLocaleString('es-ES')}
                                  </td>
                                  <td>
                                    <Badge bg={badgeVariant}>
                                      {estadoTexto}
                                    </Badge>
                                  </td>
                                  <td>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-1"
                                      onClick={() => handleVerLote(lote.id_stock)}
                                    >
                                      <i className="fas fa-eye"></i>
                                    </Button>
                                    {lote.estado === 'activo' && (
                                      <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => handleAjustarStock(lote)}
                                      >
                                        <i className="fas fa-edit"></i>
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="9" className="text-center">
                                No se encontraron lotes
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </MainCard>
      </Col>

      {/* Modales */}
      <MedicamentoModal
        show={showMedicamentoModal}
        onHide={() => setShowMedicamentoModal(false)}
        medicamento={medicamentoSeleccionado}
        categorias={categorias}
        presentaciones={presentaciones}
        onGuardar={handleGuardarMedicamento}
      />

      <LoteModal
        show={showLoteModal}
        onHide={() => setShowLoteModal(false)}
        medicamentos={medicamentos}
        medicamentoPreseleccionado={medicamentoParaLote}
        onGuardar={handleGuardarLote}
      />

      {medicamentoSeleccionado && (
        <VerMedicamentoModal
          show={showVerMedicamentoModal}
          onHide={() => setShowVerMedicamentoModal(false)}
          medicamento={medicamentoSeleccionado}
          onAddLote={() => {
            setShowVerMedicamentoModal(false);
            setMedicamentoParaLote(medicamentoSeleccionado);
            setTimeout(() => {
              setShowLoteModal(true);
            }, 500);
          }}
          onEdit={() => {
            setShowVerMedicamentoModal(false);
            setTimeout(() => {
              setShowMedicamentoModal(true);
            }, 500);
          }}
        />
      )}

      {loteSeleccionado && (
        <VerLoteModal
          show={showVerLoteModal}
          onHide={() => setShowVerLoteModal(false)}
          lote={loteSeleccionado}
          onDescartar={(id, estado) => {
            setShowVerLoteModal(false);
            setTimeout(() => {
              handleDesactivarLote(id, estado);
            }, 500);
          }}
          onAjustarStock={(lote) => {
            setShowVerLoteModal(false);
            setTimeout(() => {
              handleAjustarStock(lote);
            }, 500);
          }}
        />
      )}

      {/* Nuevo modal para ajustar stock */}
      {loteSeleccionado && (
        <AjustarStockModal
          show={showAjustarStockModal}
          onHide={() => setShowAjustarStockModal(false)}
          lote={loteSeleccionado}
          onSuccess={handleStockAjustado}
        />
      )}

      <CategoriasYPresentacionesModal
        show={showCategoriasModal}
        onHide={() => setShowCategoriasModal(false)}
        categorias={categorias}
        presentaciones={presentaciones}
        onAddCategoria={async (categoria) => {
          try {
            await categoriaService.crearCategoria(categoria);
            // Solicitar actualización de datos
            setShouldRefresh(true);
          } catch (error) {
            console.error("Error al guardar categoría:", error);
            alert("Error al guardar la categoría");
          }
        }}
        onUpdateCategoria={async (id, categoria) => {
          try {
            await categoriaService.actualizarCategoria(id, categoria);
            // Solicitar actualización de datos
            setShouldRefresh(true);
          } catch (error) {
            console.error("Error al actualizar categoría:", error);
            alert("Error al actualizar la categoría");
          }
        }}
        onDeleteCategoria={async (id) => {
          try {
            await categoriaService.desactivarCategoria(id);
            // Solicitar actualización de datos
            setShouldRefresh(true);
          } catch (error) {
            console.error("Error al desactivar categoría:", error);
            alert("Error al desactivar la categoría");
          }
        }}
        onAddPresentacion={async (presentacion) => {
          try {
            await presentacionService.crearPresentacion(presentacion);
            // Solicitar actualización de datos
            setShouldRefresh(true);
          } catch (error) {
            console.error("Error al guardar presentación:", error);
            alert("Error al guardar la presentación");
          }
        }}
        onUpdatePresentacion={async (id, presentacion) => {
          try {
            await presentacionService.actualizarPresentacion(id, presentacion);
            // Solicitar actualización de datos
            setShouldRefresh(true);
          } catch (error) {
            console.error("Error al actualizar presentación:", error);
            alert("Error al actualizar la presentación");
          }
        }}
        onDeletePresentacion={async (id) => {
          try {
            await presentacionService.desactivarPresentacion(id);
            // Solicitar actualización de datos
            setShouldRefresh(true);
          } catch (error) {
            console.error("Error al desactivar presentación:", error);
            alert("Error al desactivar la presentación");
          }
        }}
      />
      <ProveedoresModal
        show={showProveedoresModal}
        onHide={() => setShowProveedoresModal(false)}
      />
    </Row>
  );
};

export default InventarioMedicamentos;