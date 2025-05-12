import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Alert, Form, ProgressBar, Row, Col, Card } from 'react-bootstrap';
import { despachoService } from '../../../services/despachoService';

const DespachoModal = ({ show, onHide, receta, onDespachoCompletado }) => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paso, setPaso] = useState(1);
  const [lotesSeleccionados, setLotesSeleccionados] = useState({});
  const [observaciones, setObservaciones] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [tipoDespacho, setTipoDespacho] = useState('completo'); // 'completo', 'parcial', 'cancelado'
  const [razonCancelacion, setRazonCancelacion] = useState('');

  useEffect(() => {
    if (show && receta) {
      cargarDetalleReceta();
      // Resetear estados
      setPaso(1);
      setTipoDespacho('completo');
      setRazonCancelacion('');
      setObservaciones('');
    }
  }, [show, receta]);

  const cargarDetalleReceta = async () => {
    try {
      setLoading(true);
      const response = await despachoService.obtenerDetalleReceta(receta.id_receta);
      if (response.success) {
        setMedicamentos(response.data);
        // Inicializar lotes seleccionados
        const lotesInicial = {};
        response.data.forEach(med => {
          lotesInicial[med.id_detalle_receta] = [];
        });
        setLotesSeleccionados(lotesInicial);
      }
    } catch (err) {
      console.error("Error al cargar detalle de receta:", err);
      setError("Error al cargar los medicamentos de la receta");
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarLote = (idDetalleReceta, lote, cantidad) => {
    setLotesSeleccionados(prev => {
      const lotes = [...(prev[idDetalleReceta] || [])];
      const indexExistente = lotes.findIndex(l => l.id_stock === lote.id_stock);
      
      if (indexExistente >= 0) {
        // Si la cantidad es 0, eliminar el lote
        if (cantidad === 0) {
          lotes.splice(indexExistente, 1);
        } else {
          lotes[indexExistente].cantidad = cantidad;
        }
      } else if (cantidad > 0) {
        lotes.push({ ...lote, cantidad });
      }
      
      return { ...prev, [idDetalleReceta]: lotes };
    });
  };

  const calcularTotalSeleccionado = (idDetalleReceta) => {
    return (lotesSeleccionados[idDetalleReceta] || []).reduce(
      (sum, lote) => sum + (parseInt(lote.cantidad) || 0), 
      0
    );
  };

  const validarSeleccionLotes = () => {
    // Si es despacho cancelado, no necesitamos validar lotes
    if (tipoDespacho === 'cancelado') {
      return razonCancelacion.trim() !== ''; // Validar que haya una razón de cancelación
    }
    
    // Para despacho completo, verificar que todas las cantidades están cubiertas
    if (tipoDespacho === 'completo') {
      for (let medicamento of medicamentos) {
        const totalSeleccionado = calcularTotalSeleccionado(medicamento.id_detalle_receta);
        if (totalSeleccionado !== medicamento.cantidad) {
          return false;
        }
      }
      return true;
    }
    
    // Para despacho parcial, verificar que al menos un medicamento tenga lotes seleccionados
    // y que ningún lote seleccionado exceda lo disponible
    if (tipoDespacho === 'parcial') {
      let hayAlgunLoteSeleccionado = false;
      
      for (let medicamento of medicamentos) {
        const lotesDelMedicamento = lotesSeleccionados[medicamento.id_detalle_receta] || [];
        
        if (lotesDelMedicamento.length > 0) {
          hayAlgunLoteSeleccionado = true;
          
          // Verificar que no se exceda la cantidad disponible en ningún lote
          for (let lote of lotesDelMedicamento) {
            if (lote.cantidad > lote.cantidad_disponible) {
              return false;
            }
          }
          
          // Verificar que no se exceda la cantidad requerida del medicamento
          const totalSeleccionado = calcularTotalSeleccionado(medicamento.id_detalle_receta);
          if (totalSeleccionado > medicamento.cantidad) {
            return false;
          }
        }
      }
      
      return hayAlgunLoteSeleccionado;
    }
    
    return false;
  };

  const esPosibleDespachoCompleto = () => {
    for (let medicamento of medicamentos) {
      if (medicamento.stock_disponible < medicamento.cantidad) {
        return false;
      }
    }
    return true;
  };

  const handleConfirmarDespacho = async () => {
    if (!validarSeleccionLotes()) {
      if (tipoDespacho === 'cancelado' && razonCancelacion.trim() === '') {
        alert("Por favor, ingrese la razón de cancelación");
      } else {
        alert("Por favor, revise la selección de lotes para los medicamentos");
      }
      return;
    }

    try {
      setProcesando(true);
      
      if (tipoDespacho === 'cancelado') {
        // Proceso de cancelación
        const cancelacionData = {
          id_receta: receta.id_receta,
          razon_cancelacion: razonCancelacion,
          observaciones
        };
        
        const response = await despachoService.cancelarDespacho(cancelacionData);
        if (response.success) {
          alert("Despacho cancelado exitosamente");
          onDespachoCompletado();
          onHide();
        }
      } else {
        // Proceso de despacho completo o parcial
        const detalles = medicamentos.map(med => ({
          id_detalle_receta: med.id_detalle_receta,
          lotes: lotesSeleccionados[med.id_detalle_receta].map(lote => ({
            id_stock: lote.id_stock,
            cantidad: parseInt(lote.cantidad)
          }))
        }));

        const despachoData = {
          id_receta: receta.id_receta,
          tipo_despacho: tipoDespacho,
          detalles,
          observaciones
        };

        const response = await despachoService.realizarDespacho(despachoData);
        if (response.success) {
          alert(`Despacho ${tipoDespacho === 'parcial' ? 'parcial' : 'completo'} realizado exitosamente`);
          onDespachoCompletado();
          onHide();
        }
      }
    } catch (err) {
      console.error("Error al procesar despacho:", err);
      alert("Error al procesar el despacho");
    } finally {
      setProcesando(false);
    }
  };

  const haySuficienteStock = esPosibleDespachoCompleto();

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Despacho de Receta #{receta?.id_receta}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            {/* Información de la receta */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Información de la Receta</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <p className="mb-1"><strong>Paciente:</strong></p>
                    <p>{receta.nombre_paciente}</p>
                  </Col>
                  <Col md={4}>
                    <p className="mb-1"><strong>Médico:</strong></p>
                    <p>{receta.nombre_medico}</p>
                  </Col>
                  <Col md={4}>
                    <p className="mb-1"><strong>Fecha:</strong></p>
                    <p>{new Date(receta.fecha_receta).toLocaleString('es-ES')}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Pasos de despacho */}
            <div className="mb-4">
              <ProgressBar>
                <ProgressBar 
                  variant={paso === 1 ? "primary" : "success"}
                  now={paso === 1 ? 50 : 100} 
                  label={paso === 1 ? "Selección de Lotes" : "Confirmación"} 
                />
              </ProgressBar>
            </div>

            {!haySuficienteStock && paso === 1 && (
              <Alert variant="warning" className="mb-3">
                <Alert.Heading>Stock insuficiente</Alert.Heading>
                <p>
                  No hay suficiente stock para completar el despacho total. Puede seleccionar "Despacho Parcial" 
                  para despachar lo que esté disponible, o puede cancelar el despacho.
                </p>
              </Alert>
            )}

            {paso === 1 ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Selección de Lotes</h6>
                  <Form.Group>
                    <Form.Select 
                      value={tipoDespacho}
                      onChange={(e) => setTipoDespacho(e.target.value)}
                      className={tipoDespacho === 'parcial' || tipoDespacho === 'cancelado' ? 'text-warning' : ''}
                    >
                      <option value="completo" disabled={!haySuficienteStock}>
                        {haySuficienteStock ? 'Despacho Completo' : 'Despacho Completo (No disponible)'}
                      </option>
                      <option value="parcial">Despacho Parcial</option>
                      <option value="cancelado">Cancelar Despacho</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                {tipoDespacho === 'cancelado' ? (
                  <div className="mb-4">
                    <Form.Group>
                      <Form.Label>Razón de Cancelación</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={razonCancelacion}
                        onChange={(e) => setRazonCancelacion(e.target.value)}
                        required
                        placeholder="Especifique la razón por la cual se cancela este despacho"
                      />
                      <Form.Text className="text-muted">
                        Este campo es obligatorio para cancelar el despacho.
                      </Form.Text>
                    </Form.Group>
                  </div>
                ) : (
                  <>
                    {medicamentos.map((medicamento) => (
                      <Card key={medicamento.id_detalle_receta} className="mb-3">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">{medicamento.nombre_medicamento}</h6>
                          <div>
                            <Badge bg={medicamento.stock_disponible >= medicamento.cantidad ? 'success' : 'danger'}>
                              {medicamento.stock_disponible >= medicamento.cantidad ? 'Stock Suficiente' : 'Stock Insuficiente'}
                            </Badge>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          <div className="mb-3">
                            <Row>
                              <Col md={4}>
                                <strong>Cantidad a Despachar:</strong> {medicamento.cantidad}
                              </Col>
                              <Col md={4}>
                                <strong>Stock Disponible:</strong> {medicamento.stock_disponible}
                              </Col>
                              <Col md={4}>
                                <strong>Ubicación:</strong> {medicamento.ubicacion_almacen || 'No especificada'}
                              </Col>
                            </Row>
                          </div>
                          
                          <LoteSelectorComponent
                            medicamento={medicamento}
                            onSeleccionarLote={handleSeleccionarLote}
                            totalSeleccionado={calcularTotalSeleccionado(medicamento.id_detalle_receta)}
                            tipoDespacho={tipoDespacho}
                            lotesSeleccionados={lotesSeleccionados[medicamento.id_detalle_receta] || []}
                          />
                        </Card.Body>
                      </Card>
                    ))}
                  </>
                )}
              </>
            ) : (
              <>
                <Card className="mb-4">
                  <Card.Header>
                    <h6 className="mb-0">Confirmación de Despacho</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <Badge bg={
                        tipoDespacho === 'completo' ? 'success' : 
                        tipoDespacho === 'parcial' ? 'warning' : 'danger'
                      } className="fs-6 mb-3 px-4 py-2">
                        {tipoDespacho === 'completo' ? 'Despacho Completo' : 
                         tipoDespacho === 'parcial' ? 'Despacho Parcial' : 'Despacho Cancelado'}
                      </Badge>
                    </div>

                    {tipoDespacho === 'cancelado' ? (
                      <div className="mb-3">
                        <h6>Razón de Cancelación:</h6>
                        <div className="p-3 bg-light rounded">{razonCancelacion}</div>
                      </div>
                    ) : (
                      <>
                        {tipoDespacho === 'parcial' && (
                          <Alert variant="warning" className="mb-3">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            Está realizando un despacho parcial. No se entregarán todos los medicamentos prescritos.
                          </Alert>
                        )}
                        <Table hover className="border">
                          <thead className="bg-light">
                            <tr>
                              <th>Medicamento</th>
                              <th>Cantidad Requerida</th>
                              <th>Cantidad a Despachar</th>
                              <th>Lotes Seleccionados</th>
                            </tr>
                          </thead>
                          <tbody>
                            {medicamentos.map((medicamento) => {
                              const lotesDelMedicamento = lotesSeleccionados[medicamento.id_detalle_receta] || [];
                              const totalSeleccionado = calcularTotalSeleccionado(medicamento.id_detalle_receta);
                              const cantidadFaltante = medicamento.cantidad - totalSeleccionado;
                              
                              return (
                                <tr key={medicamento.id_detalle_receta} className={cantidadFaltante > 0 ? 'table-warning' : ''}>
                                  <td>{medicamento.nombre_medicamento}</td>
                                  <td>{medicamento.cantidad}</td>
                                  <td>
                                    <Badge bg={
                                      totalSeleccionado === 0 ? 'danger' :
                                      totalSeleccionado < medicamento.cantidad ? 'warning' : 'success'
                                    }>
                                      {totalSeleccionado} {cantidadFaltante > 0 && `(Faltan ${cantidadFaltante})`}
                                    </Badge>
                                  </td>
                                  <td>
                                    {lotesDelMedicamento.length > 0 ? (
                                      lotesDelMedicamento.map(lote => (
                                        <div key={lote.id_stock} className="mb-1">
                                          <strong>{lote.numero_lote}</strong> - {lote.cantidad} unidades
                                          <small className="ms-2 text-muted">
                                            (Vence: {new Date(lote.fecha_caducidad).toLocaleDateString('es-ES')})
                                          </small>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-muted">Ningún lote seleccionado</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </>
                    )}

                    <div className="mt-4">
                      <Form.Group>
                        <Form.Label>Observaciones</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                          placeholder="Opcional: Añadir observaciones sobre el despacho"
                        />
                      </Form.Group>
                    </div>
                  </Card.Body>
                </Card>
              </>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {paso === 1 ? (
          <>
            <Button variant="secondary" onClick={onHide} disabled={procesando}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setPaso(2)}
              disabled={!validarSeleccionLotes() || procesando}
            >
              Siguiente
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setPaso(1)} disabled={procesando}>
              Volver
            </Button>
            <Button 
              variant={tipoDespacho === 'cancelado' ? 'danger' : 'success'}
              onClick={handleConfirmarDespacho}
              disabled={procesando}
            >
              {procesando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Procesando...
                </>
              ) : (
                tipoDespacho === 'cancelado' ? 'Confirmar Cancelación' : 
                tipoDespacho === 'parcial' ? 'Confirmar Despacho Parcial' : 'Confirmar Despacho'
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

// Componente para seleccionar lotes
const LoteSelectorComponent = ({ medicamento, onSeleccionarLote, totalSeleccionado, tipoDespacho, lotesSeleccionados }) => {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await despachoService.obtenerLotesDisponibles(medicamento.id_medicamento);
        if (response.success) {
          // Ordenar lotes por fecha de caducidad (primero los que caducan antes)
          const lotesOrdenados = response.data.sort((a, b) => {
            return new Date(a.fecha_caducidad) - new Date(b.fecha_caducidad);
          });
          setLotes(lotesOrdenados);
        }
      } catch (err) {
        console.error("Error al cargar lotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLotes();
  }, [medicamento.id_medicamento]);

  // Calcular cuánto queda por seleccionar
  const cantidadRestante = medicamento.cantidad - totalSeleccionado;
  const porcentajeSeleccionado = Math.min((totalSeleccionado / medicamento.cantidad) * 100, 100);

  // Verificar si se ha excedido la cantidad requerida
  const excedido = totalSeleccionado > medicamento.cantidad;

  // Si es despacho cancelado, no mostrar nada
  if (tipoDespacho === 'cancelado') {
    return null;
  }

  if (loading) {
    return <div className="text-center py-2">Cargando lotes...</div>;
  }

  // Si no hay lotes disponibles
  if (lotes.length === 0) {
    return (
      <Alert variant="warning">
        No hay lotes disponibles para este medicamento.
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <div className="d-flex justify-content-between mb-1">
          <div>
            <strong>Total seleccionado:</strong> {totalSeleccionado} / {medicamento.cantidad}
          </div>
          <div>
            <strong>Restante:</strong> <span className={excedido ? 'text-danger' : cantidadRestante === 0 ? 'text-success' : ''}>{excedido ? 'Excedido' : cantidadRestante}</span>
          </div>
        </div>
        <ProgressBar>
          <ProgressBar 
            variant={excedido ? 'danger' : cantidadRestante === 0 ? 'success' : 'warning'} 
            now={porcentajeSeleccionado} 
            label={`${totalSeleccionado} / ${medicamento.cantidad}`} 
          />
        </ProgressBar>
      </div>

      <div className="table-responsive">
        <Table hover size="sm" className="border">
          <thead className="bg-light">
            <tr>
              <th>Lote</th>
              <th>Disponible</th>
              <th>Fecha Caducidad</th>
              <th>Seleccionar</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map((lote) => {
              // Obtener lote seleccionado (si existe)
              const loteSeleccionado = lotesSeleccionados.find(l => l.id_stock === lote.id_stock);
              const cantidadSeleccionada = loteSeleccionado ? loteSeleccionado.cantidad : 0;
              
              // Calcular la máxima cantidad que se puede seleccionar de este lote
              const maxCantidad = tipoDespacho === 'completo' 
                ? Math.min(lote.cantidad_disponible, cantidadRestante + cantidadSeleccionada)
                : lote.cantidad_disponible;
              
              // Determinar si este lote ya está "completo" (ya no se puede seleccionar más)
              const loteCompleto = cantidadSeleccionada >= lote.cantidad_disponible;
              
              // Fecha de caducidad
              const fechaCaducidad = new Date(lote.fecha_caducidad);
              const hoy = new Date();
              const diasHastaCaducidad = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));
              const estaProximoAVencer = diasHastaCaducidad <= 90;
              const estaVencido = diasHastaCaducidad <= 0;
              
              return (
                <tr key={lote.id_stock}>
                  <td>{lote.numero_lote}</td>
                  <td>{lote.cantidad_disponible}</td>
                  <td>
                    <span className={estaVencido ? 'text-danger fw-bold' : estaProximoAVencer ? 'text-warning fw-bold' : ''}>
                      {fechaCaducidad.toLocaleDateString('es-ES')}
                      {estaVencido && <Badge bg="danger" className="ms-1">Vencido</Badge>}
                      {!estaVencido && estaProximoAVencer && <Badge bg="warning" className="ms-1">Próximo</Badge>}
                    </span>
                  </td>
                  <td style={{ width: '150px' }}>
                    <Form.Control
                      type="number"
                      size="sm"
                      min="0"
                      max={maxCantidad}
                      value={cantidadSeleccionada}
                      onChange={(e) => {
                        const cantidad = parseInt(e.target.value) || 0;
                        if (cantidad >= 0 && cantidad <= lote.cantidad_disponible) {
                          onSeleccionarLote(medicamento.id_detalle_receta, lote, cantidad);
                        }
                      }}
                      disabled={tipoDespacho === 'completo' && cantidadRestante === 0 && cantidadSeleccionada === 0}
                      className={loteCompleto ? 'bg-success text-white' : ''}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default DespachoModal;