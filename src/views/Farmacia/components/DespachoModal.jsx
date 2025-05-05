import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Alert, Form, ProgressBar } from 'react-bootstrap';
import { despachoService } from '../../../services/despachoService';

const DespachoModal = ({ show, onHide, receta, onDespachoCompletado }) => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paso, setPaso] = useState(1);
  const [lotesSeleccionados, setLotesSeleccionados] = useState({});
  const [observaciones, setObservaciones] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (show && receta) {
      cargarDetalleReceta();
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

  const cargarLotesDisponibles = async (medicamento) => {
    try {
      const response = await despachoService.obtenerLotesDisponibles(medicamento.id_medicamento);
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.error("Error al cargar lotes disponibles:", err);
      return [];
    }
  };

  const handleSeleccionarLote = (idDetalleReceta, lote, cantidad) => {
    setLotesSeleccionados(prev => {
      const lotes = [...(prev[idDetalleReceta] || [])];
      const indexExistente = lotes.findIndex(l => l.id_stock === lote.id_stock);
      
      if (indexExistente >= 0) {
        lotes[indexExistente].cantidad = cantidad;
      } else {
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
    for (let medicamento of medicamentos) {
      const totalSeleccionado = calcularTotalSeleccionado(medicamento.id_detalle_receta);
      if (totalSeleccionado !== medicamento.cantidad) {
        return false;
      }
    }
    return true;
  };

  const handleConfirmarDespacho = async () => {
    if (!validarSeleccionLotes()) {
      alert("Por favor, seleccione lotes para todos los medicamentos con las cantidades correctas");
      return;
    }

    try {
      setProcesando(true);
      const detalles = medicamentos.map(med => ({
        id_detalle_receta: med.id_detalle_receta,
        lotes: lotesSeleccionados[med.id_detalle_receta].map(lote => ({
          id_stock: lote.id_stock,
          cantidad: parseInt(lote.cantidad)
        }))
      }));

      const despachoData = {
        id_receta: receta.id_receta,
        detalles,
        observaciones
      };

      const response = await despachoService.realizarDespacho(despachoData);
      if (response.success) {
        alert("Despacho realizado exitosamente");
        onDespachoCompletado();
        onHide();
      }
    } catch (err) {
      console.error("Error al realizar despacho:", err);
      alert("Error al realizar el despacho");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
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
            <div className="mb-4">
              <h6>Información de la Receta</h6>
              <p><strong>Paciente:</strong> {receta.nombre_paciente}</p>
              <p><strong>Médico:</strong> {receta.nombre_medico}</p>
              <p><strong>Fecha:</strong> {new Date(receta.fecha_receta).toLocaleString('es-ES')}</p>
            </div>

            {/* Pasos de despacho */}
            <div className="mb-4">
              <ProgressBar>
                <ProgressBar now={paso === 1 ? 50 : 100} label={paso === 1 ? "Selección de Lotes" : "Confirmación"} />
              </ProgressBar>
            </div>

            {paso === 1 ? (
              <>
                <h6>Selección de Lotes</h6>
                {medicamentos.map((medicamento) => (
                  <div key={medicamento.id_detalle_receta} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <div>
                        <h6>{medicamento.nombre_medicamento}</h6>
                        <p className="mb-0">Cantidad a despachar: {medicamento.cantidad}</p>
                        <p className="mb-0">Ubicación: {medicamento.ubicacion_almacen}</p>
                      </div>
                      <Badge bg={medicamento.stock_disponible >= medicamento.cantidad ? 'success' : 'danger'}>
                        {medicamento.stock_disponible >= medicamento.cantidad ? 'Disponible' : 'Stock Insuficiente'}
                      </Badge>
                    </div>
                    
                    <LoteSelectorComponent
                      medicamento={medicamento}
                      onSeleccionarLote={handleSeleccionarLote}
                      totalSeleccionado={calcularTotalSeleccionado(medicamento.id_detalle_receta)}
                    />
                  </div>
                ))}
              </>
            ) : (
              <>
                <h6>Confirmación de Despacho</h6>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Medicamento</th>
                      <th>Cantidad</th>
                      <th>Lotes Seleccionados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicamentos.map((medicamento) => (
                      <tr key={medicamento.id_detalle_receta}>
                        <td>{medicamento.nombre_medicamento}</td>
                        <td>{medicamento.cantidad}</td>
                        <td>
                          {(lotesSeleccionados[medicamento.id_detalle_receta] || []).map(lote => (
                            <div key={lote.id_stock}>
                              {lote.numero_lote} - {lote.cantidad} unidades
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="mt-3">
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
              </>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={procesando}>
          Cancelar
        </Button>
        {paso === 1 ? (
          <Button 
            variant="primary" 
            onClick={() => setPaso(2)}
            disabled={!validarSeleccionLotes() || procesando}
          >
            Siguiente
          </Button>
        ) : (
          <Button 
            variant="success" 
            onClick={handleConfirmarDespacho}
            disabled={procesando}
          >
            {procesando ? 'Procesando...' : 'Confirmar Despacho'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

// Componente para seleccionar lotes
const LoteSelectorComponent = ({ medicamento, onSeleccionarLote, totalSeleccionado }) => {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await despachoService.obtenerLotesDisponibles(medicamento.id_medicamento);
        if (response.success) {
          setLotes(response.data);
        }
      } catch (err) {
        console.error("Error al cargar lotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLotes();
  }, [medicamento.id_medicamento]);

  if (loading) {
    return <div>Cargando lotes...</div>;
  }

  return (
    <div>
      <p>Total seleccionado: {totalSeleccionado} / {medicamento.cantidad}</p>
      {lotes.map((lote) => (
        <div key={lote.id_stock} className="d-flex align-items-center mb-2">
          <div className="me-3">
            <Badge bg="secondary">
              {lote.numero_lote} - {lote.cantidad_disponible} disponibles
            </Badge>
            <small className="ms-2">
              Vence: {new Date(lote.fecha_caducidad).toLocaleDateString('es-ES')}
            </small>
          </div>
          <Form.Control
            type="number"
            style={{ width: '100px' }}
            min="0"
            max={Math.min(lote.cantidad_disponible, medicamento.cantidad - totalSeleccionado)}
            onChange={(e) => {
              const cantidad = parseInt(e.target.value) || 0;
              onSeleccionarLote(medicamento.id_detalle_receta, lote, cantidad);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default DespachoModal;