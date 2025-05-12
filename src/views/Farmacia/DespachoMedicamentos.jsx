import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tab, Nav, Button, Table, Badge, Alert, Pagination, InputGroup, FormControl, Form } from 'react-bootstrap';
import MainCard from '../../components/Card/MainCard';
import { despachoService } from '../../services/despachoService';
import { notificacionesService } from '../../services/notificacionesService';
import DespachoModal from './components/DespachoModal';
import VerDespachoModal from './components/VerDespachoModal';

const DespachoMedicamentos = () => {
    // Estados
    const [recetasPendientes, setRecetasPendientes] = useState([]);
    const [historialDespachos, setHistorialDespachos] = useState([]);
    const [activeTab, setActiveTab] = useState('recetas');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDespachoModal, setShowDespachoModal] = useState(false);
    const [showVerDespachoModal, setShowVerDespachoModal] = useState(false);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
    const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Estado para filtros
    const [filtros, setFiltros] = useState({
        estado: '',
        fechaInicio: '',
        fechaFin: ''
    });

    // Cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    // Cargar historial cuando cambia el tab o la página
    useEffect(() => {
        if (activeTab === 'historial') {
            cargarHistorial(currentPage);
        }
    }, [activeTab, currentPage]);

    // Recargar historial cuando cambian los filtros
    useEffect(() => {
        if (activeTab === 'historial') {
            // Resetear a la primera página cuando cambian los filtros
            setCurrentPage(1);
            cargarHistorial(1);
        }
    }, [filtros]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar recetas pendientes
            const recetasResponse = await despachoService.listarRecetasPendientes();
            if (recetasResponse.success) {
                setRecetasPendientes(recetasResponse.data);
            }

            // Obtener notificaciones
            const notificacionesResponse = await notificacionesService.obtenerNotificaciones();
            if (notificacionesResponse.success) {
                // Aquí podrías manejar las notificaciones si es necesario
            }

        } catch (err) {
            console.error("Error al cargar datos:", err);
            setError("Error al cargar los datos. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const cargarHistorial = async (page) => {
        try {
            setLoading(true);
            const response = await despachoService.listarHistorialDespachos(page, 10, filtros);
            if (response.success) {
                setHistorialDespachos(response.data);
                setTotalPages(response.pagination.totalPages);
                setTotalItems(response.pagination.total);
            }
        } catch (err) {
            console.error("Error al cargar historial:", err);
            setError("Error al cargar el historial de despachos.");
        } finally {
            setLoading(false);
        }
    };

    const handleDespachar = (receta) => {
        setRecetaSeleccionada(receta);
        setShowDespachoModal(true);
    };

    const handleVerDespacho = async (idDespacho) => {
        try {
            const response = await despachoService.obtenerDetalleDespacho(idDespacho);
            if (response.success) {
                setDespachoSeleccionado(response.data);
                setShowVerDespachoModal(true);
            }
        } catch (err) {
            console.error("Error al obtener detalle de despacho:", err);
            alert("Error al obtener los detalles del despacho");
        }
    };

    const handleDespachoCompletado = () => {
        setShowDespachoModal(false);
        cargarDatos();
        if (activeTab === 'historial') {
            cargarHistorial(currentPage);
        }
    };

    const limpiarFiltros = () => {
        setFiltros({
            estado: '',
            fechaInicio: '',
            fechaFin: ''
        });
    };

    const filteredRecetas = recetasPendientes.filter(receta =>
        receta.nombre_paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receta.nombre_medico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receta.id_receta.toString().includes(searchTerm)
    );

    const getBadgeVariant = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'completo':
                return 'success';
            case 'parcial':
                return 'warning';
            case 'cancelado':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    if (loading && historialDespachos.length === 0 && recetasPendientes.length === 0) {
        return (
            <MainCard title="Despacho de Medicamentos">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </MainCard>
        );
    }

    if (error && historialDespachos.length === 0 && recetasPendientes.length === 0) {
        return (
            <MainCard title="Despacho de Medicamentos">
                <Alert variant="danger">{error}</Alert>
            </MainCard>
        );
    }

    return (
        <MainCard title="Despacho de Medicamentos">
            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Nav variant="pills" className="mb-3">
                    <Nav.Item>
                        <Nav.Link eventKey="recetas">
                            <i className="fas fa-clipboard-list me-1"></i> Recetas
                            {recetasPendientes.length > 0 && (
                                <Badge bg="danger" className="ms-1">{recetasPendientes.length}</Badge>
                            )}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="historial">
                            <i className="fas fa-history me-1"></i> Historial
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    {/* Tab de Recetas Pendientes */}
                    <Tab.Pane eventKey="recetas">
                        <Card>
                            <Card.Body>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <InputGroup>
                                            <InputGroup.Text>
                                                <i className="fas fa-search"></i>
                                            </InputGroup.Text>
                                            <FormControl
                                                placeholder="Buscar recetas por paciente, médico o número..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </InputGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    {filteredRecetas.length > 0 ? (
                                        filteredRecetas.map((receta) => (
                                            <Col md={6} lg={4} key={receta.id_receta} className="mb-4">
                                                <Card className="h-100">
                                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                                        <Badge bg="warning" text="dark">
                                                            <i className="fas fa-clock me-1"></i> Pendiente
                                                        </Badge>
                                                        <small className="text-muted">
                                                            {new Date(receta.fecha_receta).toLocaleString('es-ES')}
                                                        </small>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <h5 className="card-title">Receta #{receta.id_receta}</h5>
                                                        <div className="mb-3">
                                                            <p className="mb-1"><strong>Paciente:</strong> {receta.nombre_paciente}</p>
                                                            <p className="mb-1"><strong>Médico:</strong> {receta.nombre_medico}</p>
                                                            <p className="mb-0"><strong>Especialidad:</strong> {receta.especialidad || 'N/A'}</p>
                                                        </div>
                                                        <Button
                                                            variant="primary"
                                                            className="w-100"
                                                            onClick={() => handleDespachar(receta)}
                                                        >
                                                            <i className="fas fa-pills me-1"></i> Despachar
                                                        </Button>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))
                                    ) : (
                                        <Col>
                                            <Alert variant="info" className="text-center">
                                                No hay recetas pendientes para despachar
                                            </Alert>
                                        </Col>
                                    )}
                                </Row>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>

                    {/* Tab de Historial */}
                    <Tab.Pane eventKey="historial">
                        <Card>
                            <Card.Body>
                                {/* Filtros */}
                                <Row className="mb-3">
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Estado</Form.Label>
                                            <Form.Select
                                                value={filtros.estado}
                                                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                                            >
                                                <option value="">Todos los estados</option>
                                                <option value="completo">Completo</option>
                                                <option value="parcial">Parcial</option>
                                                <option value="cancelado">Cancelado</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Fecha Inicio</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filtros.fechaInicio}
                                                onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label>Fecha Fin</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filtros.fechaFin}
                                                onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3} className="d-flex align-items-end">
                                        <Button 
                                            variant="secondary" 
                                            onClick={limpiarFiltros}
                                            className="w-100"
                                        >
                                            <i className="fas fa-eraser me-1"></i> Limpiar Filtros
                                        </Button>
                                    </Col>
                                </Row>

                                {loading && (
                                    <div className="text-center py-3">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <Alert variant="danger" className="mb-3">{error}</Alert>
                                )}

                                <div className="table-responsive">
                                    <Table hover>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Fecha</th>
                                                <th>Receta</th>
                                                <th>Paciente</th>
                                                <th>Medicamentos</th>
                                                <th>Despachado por</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historialDespachos.length > 0 ? (
                                                historialDespachos.map((despacho) => (
                                                    <tr key={despacho.id_despacho}>
                                                        <td>{despacho.id_despacho}</td>
                                                        <td>{new Date(despacho.fecha_despacho).toLocaleString('es-ES')}</td>
                                                        <td>#{despacho.id_receta}</td>
                                                        <td>{despacho.nombre_paciente}</td>
                                                        <td>
                                                            <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={despacho.medicamentos}>
                                                                {despacho.medicamentos}
                                                            </div>
                                                        </td>
                                                        <td>{despacho.nombre_despachador}</td>
                                                        <td>
                                                            <Badge bg={getBadgeVariant(despacho.estado_despacho)}>
                                                                {despacho.estado_despacho === 'completo' ? 'Completo' : 
                                                                 despacho.estado_despacho === 'parcial' ? 'Parcial' : 'Cancelado'}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => handleVerDespacho(despacho.id_despacho)}
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="text-center">
                                                        {!loading ? 'No hay despachos que coincidan con los filtros aplicados' : 'Cargando...'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>

                                {/* Paginación */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <div>
                                            Mostrando {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalItems)} de {totalItems} registros
                                        </div>
                                        <Pagination>
                                            <Pagination.First
                                                onClick={() => setCurrentPage(1)}
                                                disabled={currentPage === 1}
                                            />
                                            <Pagination.Prev
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                            />

                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;
                                                if (
                                                    pageNumber === 1 ||
                                                    pageNumber === totalPages ||
                                                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                                                ) {
                                                    return (
                                                        <Pagination.Item
                                                            key={pageNumber}
                                                            active={pageNumber === currentPage}
                                                            onClick={() => setCurrentPage(pageNumber)}
                                                        >
                                                            {pageNumber}
                                                        </Pagination.Item>
                                                    );
                                                } else if (
                                                    pageNumber === currentPage - 3 ||
                                                    pageNumber === currentPage + 3
                                                ) {
                                                    return <Pagination.Ellipsis key={pageNumber} />;
                                                }
                                                return null;
                                            })}

                                            <Pagination.Next
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                            />
                                            <Pagination.Last
                                                onClick={() => setCurrentPage(totalPages)}
                                                disabled={currentPage === totalPages}
                                            />
                                        </Pagination>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            {/* Modales */}
            {recetaSeleccionada && (
                <DespachoModal
                    show={showDespachoModal}
                    onHide={() => setShowDespachoModal(false)}
                    receta={recetaSeleccionada}
                    onDespachoCompletado={handleDespachoCompletado}
                />
            )}

            {despachoSeleccionado && (
                <VerDespachoModal
                    show={showVerDespachoModal}
                    onHide={() => setShowVerDespachoModal(false)}
                    despacho={despachoSeleccionado}
                />
            )}
        </MainCard>
    );
};

export default DespachoMedicamentos;