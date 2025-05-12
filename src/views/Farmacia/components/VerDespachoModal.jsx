import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Card, Row, Col, ProgressBar, Alert } from 'react-bootstrap';
import { despachoService } from '../../../services/despachoService';
import jsPDF from 'jspdf';
import logoUnicaes from '../../../assets/images/UNICAES_LOGO.png'; // Asegúrate de que la ruta sea correcta
import 'jspdf-autotable'; // Necesitarás instalar esta dependencia

const VerDespachoModal = ({ show, onHide, despacho }) => {
  // Estado para almacenar detalles completos de la receta original
  const [recetaOriginal, setRecetaOriginal] = useState(null);
  const [loadingReceta, setLoadingReceta] = useState(false);
  const [errorReceta, setErrorReceta] = useState(null);
  const [imprimiendo, setImprimiendo] = useState(false);

  // Efecto para cargar los detalles de la receta original cuando sea necesario
  useEffect(() => {
    // Solo cargar receta original si es un despacho parcial o cancelado
    if (show && despacho && (despacho.estado === 'parcial' || despacho.estado === 'cancelado')) {
      cargarDetalleRecetaOriginal();
    }
  }, [show, despacho]);

  // Función para cargar detalles de la receta original
  const cargarDetalleRecetaOriginal = async () => {
    if (!despacho || !despacho.id_receta) return;

    try {
      setLoadingReceta(true);
      setErrorReceta(null);
      const response = await despachoService.obtenerDetalleReceta(despacho.id_receta);
      if (response.success) {
        setRecetaOriginal(response.data);
      } else {
        setErrorReceta("Error al cargar el detalle de la receta original");
      }
    } catch (err) {
      console.error("Error al cargar detalle de receta original:", err);
      setErrorReceta("Error de conexión al cargar detalle de la receta");
    } finally {
      setLoadingReceta(false);
    }
  };

  // Función para determinar el color del Badge según el estado
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

  // Función para obtener un texto formateado del estado
  const getEstadoText = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completo':
        return 'Despacho Completo';
      case 'parcial':
        return 'Despacho Parcial';
      case 'cancelado':
        return 'Despacho Cancelado';
      default:
        return estado || 'Desconocido';
    }
  };

  // Función para calcular estadísticas del despacho
  const calcularEstadisticas = () => {
    if (!despacho.detalles || despacho.estado === 'cancelado') {
      // Para despachos cancelados, si tenemos la receta original, calcular estadísticas
      if (recetaOriginal && recetaOriginal.length > 0) {
        return recetaOriginal.reduce((acc, medicamento) => {
          acc.medicamentosRequeridos = acc.medicamentosRequeridos + 1;
          acc.cantidadRequerida = acc.cantidadRequerida + medicamento.cantidad;
          acc.cantidadDespachada = 0; // No se despachó nada
          acc.cantidadFaltante = acc.cantidadFaltante + medicamento.cantidad;
          return acc;
        }, {
          medicamentosRequeridos: 0,
          cantidadRequerida: 0,
          cantidadDespachada: 0,
          cantidadFaltante: 0,
          porcentajeCompletado: 0
        });
      }
      return null;
    }

    const totales = despacho.detalles.reduce((acc, medicamento) => {
      // Calcular la cantidad despachada sumando todos los lotes de cada medicamento
      const cantidadDespachada = medicamento.lotes.reduce(
        (sum, lote) => sum + parseInt(lote.cantidad_despachada || 0), 0
      );

      acc.medicamentosRequeridos = acc.medicamentosRequeridos + 1;
      acc.cantidadRequerida = acc.cantidadRequerida + medicamento.cantidad_requerida;
      acc.cantidadDespachada = acc.cantidadDespachada + cantidadDespachada;
      acc.cantidadFaltante = acc.cantidadFaltante + Math.max(0, medicamento.cantidad_requerida - cantidadDespachada);
      return acc;
    }, {
      medicamentosRequeridos: 0,
      cantidadRequerida: 0,
      cantidadDespachada: 0,
      cantidadFaltante: 0
    });

    // Calcular porcentaje
    totales.porcentajeCompletado = totales.cantidadRequerida > 0 ?
      Math.round((totales.cantidadDespachada / totales.cantidadRequerida) * 100) : 0;

    return totales;
  };

  // Obtener medicamentos no despachados en un despacho parcial
  const obtenerMedicamentosNoDespachados = () => {
    if (!recetaOriginal || recetaOriginal.length === 0) return [];

    // Mapa de los medicamentos en el despacho actual
    const medicamentosDespachados = new Map();
    if (despacho.detalles) {
      despacho.detalles.forEach(med => {
        medicamentosDespachados.set(med.id_medicamento, med);
      });
    }

    // Filtrar los medicamentos de la receta original que no fueron despachados
    return recetaOriginal.filter(med => {
      // Si el medicamento no está en el mapa, o si está pero no se despachó completamente
      const medicamentoDespachado = medicamentosDespachados.get(med.id_medicamento);
      if (!medicamentoDespachado) {
        return true; // No está en el despacho, así que no fue despachado
      }

      // Si está en el despacho, verificar si se despachó completamente
      return med.cantidad > medicamentoDespachado.cantidad_total_despachada;
    });
  };

  // NUEVA FUNCIÓN: Generar PDF con jsPDF
  const generarPDF = async () => {
    if (!despacho) return;

    try {
      setImprimiendo(true);

      // Crear nuevo documento PDF
      const doc = new jsPDF();

      // Configuraciones
      const pageWidth = doc.internal.pageSize.getWidth();
      const margenLateral = 20;
      const ancho = pageWidth - (margenLateral * 2);

      // Agregar logo
      doc.addImage(logoUnicaes, 'PNG', margenLateral, 10, 20, 20);

      // Título
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text('Hospital UNICAES - Farmacia', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.text(`Despacho de Medicamentos #${despacho.id_despacho}`, pageWidth / 2, 30, { align: 'center' });

      // Estado del despacho
      doc.setFontSize(12);
      const estadoTexto = getEstadoText(despacho.estado);
      doc.setTextColor(
        despacho.estado === 'completo' ? 0 :
          despacho.estado === 'parcial' ? 200 :
            200,
        despacho.estado === 'completo' ? 150 :
          despacho.estado === 'parcial' ? 150 :
            0,
        despacho.estado === 'completo' ? 0 :
          despacho.estado === 'parcial' ? 0 :
            0
      );
      doc.text(estadoTexto, pageWidth / 2, 40, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Restaurar color

      // Datos del despacho
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      let yPos = 55;

      // Información del despacho - Columna izquierda
      doc.setFont("helvetica", "bold");
      doc.text("Información del Despacho:", margenLateral, yPos);
      doc.setFont("helvetica", "normal");

      yPos += 8;
      doc.text(`ID Despacho: ${despacho.id_despacho}`, margenLateral, yPos);
      yPos += 6;
      doc.text(`Fecha: ${new Date(despacho.fecha_despacho).toLocaleString('es-ES')}`, margenLateral, yPos);
      yPos += 6;
      doc.text(`Despachado por: ${despacho.nombre_despachador}`, margenLateral, yPos);

      // Información de la receta - Columna derecha
      yPos = 55;
      const colDerecha = pageWidth / 2 + 10;

      doc.setFont("helvetica", "bold");
      doc.text("Información de la Receta:", colDerecha, yPos);
      doc.setFont("helvetica", "normal");

      yPos += 8;
      doc.text(`Receta #: ${despacho.id_receta}`, colDerecha, yPos);
      yPos += 6;
      doc.text(`Paciente: ${despacho.nombre_paciente}`, colDerecha, yPos);
      yPos += 6;
      doc.text(`Médico: ${despacho.nombre_medico}${despacho.especialidad ? ` (${despacho.especialidad})` : ''}`, colDerecha, yPos);

      yPos += 15;

      // Estadísticas del despacho
      const estadisticas = calcularEstadisticas();
      if (estadisticas) {
        doc.setFont("helvetica", "bold");
        doc.text("Resumen del Despacho:", margenLateral, yPos);
        doc.setFont("helvetica", "normal");

        yPos += 8;
        doc.text(`Medicamentos: ${estadisticas.medicamentosRequeridos}`, margenLateral, yPos);
        yPos += 6;
        doc.text(`Unidades Despachadas: ${estadisticas.cantidadDespachada}`, margenLateral, yPos);
        yPos += 6;
        doc.text(`Unidades Faltantes: ${estadisticas.cantidadFaltante}`, margenLateral, yPos);
        yPos += 6;
        doc.text(`Porcentaje Completado: ${estadisticas.porcentajeCompletado}%`, margenLateral, yPos);

        yPos += 10;
      }

      // Razón de cancelación si aplica
      if (despacho.estado === 'cancelado' && despacho.razon_cancelacion) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(200, 0, 0);
        doc.text("Razón de Cancelación:", margenLateral, yPos);
        doc.setFont("helvetica", "normal");

        yPos += 8;

        // Dividir texto largo en múltiples líneas
        const razonCancelacionSplit = doc.splitTextToSize(despacho.razon_cancelacion, ancho);
        doc.text(razonCancelacionSplit, margenLateral, yPos);

        yPos += (razonCancelacionSplit.length * 6) + 6;
        doc.setTextColor(0, 0, 0); // Restaurar color
      }

      // Tabla de medicamentos despachados
      if (despacho.estado !== 'cancelado' && despacho.detalles && despacho.detalles.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Medicamentos Despachados:", margenLateral, yPos);

        yPos += 8;

        // Crear tabla con autoTable
        const tableColumn = ["Medicamento", "Concentración", "Requerido", "Despachado", "Faltante", "Lotes"];
        const tableRows = [];

        despacho.detalles.forEach(medicamento => {
          const cantidadDespachada = medicamento.lotes.reduce(
            (sum, lote) => sum + parseInt(lote.cantidad_despachada || 0), 0
          );
          const cantidadRequerida = medicamento.cantidad_requerida || 0;
          const cantidadFaltante = Math.max(0, cantidadRequerida - cantidadDespachada);

          // Formatear lotes para la tabla
          const lotesTexto = medicamento.lotes.map(lote =>
            `${lote.numero_lote}: ${lote.cantidad_despachada} uds. (Vence: ${new Date(lote.fecha_caducidad).toLocaleDateString('es-ES')})`
          ).join("\n");

          tableRows.push([
            medicamento.nombre_medicamento,
            medicamento.concentracion || "-",
            cantidadRequerida.toString(),
            cantidadDespachada.toString(),
            cantidadFaltante.toString(),
            lotesTexto
          ]);
        });

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: yPos,
          margin: { left: margenLateral, right: margenLateral },
          styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 20 },
            5: { cellWidth: 'auto' }
          },
        });

        // Actualizar la posición Y después de la tabla
        yPos = doc.autoTable.previous.finalY + 10;
      }

      // Medicamentos No Despachados (para despachos parciales)
      const medicamentosNoDespachados = (despacho.estado === 'parcial') ?
        obtenerMedicamentosNoDespachados() : [];

      if (medicamentosNoDespachados.length > 0) {
        // Verificar si necesitamos una nueva página
        if (yPos > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setTextColor(200, 150, 0); // Color naranja/amarillo para advertencia
        doc.text("Medicamentos No Despachados:", margenLateral, yPos);
        doc.setTextColor(0, 0, 0); // Restaurar color

        yPos += 8;

        // Crear tabla con autoTable para medicamentos no despachados
        const noDespachadosColumns = ["Medicamento", "Concentración", "Cantidad Requerida", "Cantidad No Despachada", "Motivo"];
        const noDespachadosRows = [];

        medicamentosNoDespachados.forEach(medicamento => {
          const medDespachado = despacho.detalles ?
            despacho.detalles.find(m => m.id_medicamento === medicamento.id_medicamento) : null;

          const cantidadDespachada = medDespachado ?
            medDespachado.cantidad_total_despachada : 0;
          const cantidadFaltante = medicamento.cantidad - cantidadDespachada;

          // Solo incluir si hay cantidad faltante
          if (cantidadFaltante <= 0) return;

          let motivo = 'No seleccionado para despacho';
          if (medicamento.stock_disponible === 0) {
            motivo = 'Sin stock disponible';
          } else if (medicamento.stock_disponible < medicamento.cantidad) {
            motivo = `Stock insuficiente (${medicamento.stock_disponible} uds. disponibles)`;
          }

          noDespachadosRows.push([
            medicamento.nombre_medicamento,
            medicamento.concentracion || "-",
            medicamento.cantidad.toString(),
            cantidadFaltante.toString(),
            motivo
          ]);
        });

        if (noDespachadosRows.length > 0) {
          doc.autoTable({
            head: [noDespachadosColumns],
            body: noDespachadosRows,
            startY: yPos,
            margin: { left: margenLateral, right: margenLateral },
            styles: {
              fontSize: 8,
              cellPadding: 2,
              overflow: 'linebreak',
              lineColor: [0, 0, 0],
              lineWidth: 0.1,
            },
            headStyles: {
              fillColor: [230, 126, 34], // Naranja para sección de no despachados
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
          });

          // Actualizar la posición Y después de la tabla
          yPos = doc.autoTable.previous.finalY + 10;
        }
      }

      // Observaciones (si existen)
      if (despacho.observaciones) {
        // Verificar si necesitamos una nueva página
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text("Observaciones:", margenLateral, yPos);
        doc.setFont("helvetica", "normal");

        yPos += 8;

        // Dividir texto largo en múltiples líneas
        const observacionesSplit = doc.splitTextToSize(despacho.observaciones, ancho);
        doc.text(observacionesSplit, margenLateral, yPos);
      }

      // Pie de página
      const fecha = new Date().toLocaleString('es-ES');
      const pageCount = doc.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Fecha de impresión: ${fecha}`, margenLateral, doc.internal.pageSize.getHeight() - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margenLateral, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      }

      // Guardar o mostrar el PDF
      doc.save(`Despacho_${despacho.id_despacho}_${new Date().toISOString().slice(0, 10)}.pdf`);

    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Por favor, intente nuevamente.");
    } finally {
      setImprimiendo(false);
    }
  };

  // Si no hay despacho, no mostramos nada
  if (!despacho) {
    return null;
  }

  // Calcular estadísticas si hay detalles
  const estadisticas = calcularEstadisticas();

  // Determinar si es un despacho cancelado
  const esDespachoCompleto = despacho?.estado === 'completo';
  const esDespachoAgotado = despacho?.estado === 'parcial';
  const esDespachoCancelado = despacho?.estado === 'cancelado';

  // Obtener los medicamentos no despachados (para despachos parciales)
  const medicamentosNoDespachados = (esDespachoAgotado || esDespachoCancelado) ?
    obtenerMedicamentosNoDespachados() : [];

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Detalles de Despacho #{despacho.id_despacho}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-3">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Información del Despacho</h6>
              <Badge
                bg={getBadgeVariant(despacho.estado)}
                className="fs-6 px-3 py-2"
              >
                {getEstadoText(despacho.estado)}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <p className="mb-1"><strong>ID Despacho:</strong></p>
                <p>{despacho.id_despacho}</p>
              </Col>
              <Col md={4}>
                <p className="mb-1"><strong>Fecha:</strong></p>
                <p>{new Date(despacho.fecha_despacho).toLocaleString('es-ES')}</p>
              </Col>
              <Col md={4}>
                <p className="mb-1"><strong>Despachado por:</strong></p>
                <p>{despacho.nombre_despachador}</p>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <p className="mb-1"><strong>Receta #:</strong></p>
                <p>{despacho.id_receta}</p>
              </Col>
              <Col md={4}>
                <p className="mb-1"><strong>Paciente:</strong></p>
                <p>{despacho.nombre_paciente}</p>
              </Col>
              <Col md={4}>
                <p className="mb-1"><strong>Médico:</strong></p>
                <p>{despacho.nombre_medico} {despacho.especialidad && `(${despacho.especialidad})`}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Estadísticas del despacho (para cualquier tipo de despacho) */}
        {estadisticas && (
          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Resumen de Despacho</h6>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <div className="text-center">
                    <h5>{estadisticas.medicamentosRequeridos}</h5>
                    <p className="text-muted mb-0">Medicamentos</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-success">{estadisticas.cantidadDespachada}</h5>
                    <p className="text-muted mb-0">Unidades Despachadas</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className={estadisticas.cantidadFaltante > 0 ? "text-danger" : "text-success"}>
                      {estadisticas.cantidadFaltante}
                    </h5>
                    <p className="text-muted mb-0">Unidades Faltantes</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5>{estadisticas.porcentajeCompletado}%</h5>
                    <p className="text-muted mb-0">Completado</p>
                  </div>
                </Col>
              </Row>

              <ProgressBar
                variant={esDespachoCompleto ? 'success' : esDespachoAgotado ? 'warning' : 'danger'}
                now={estadisticas.porcentajeCompletado}
                label={`${estadisticas.porcentajeCompletado}%`}
                className="mt-2"
              />
            </Card.Body>
          </Card>
        )}

        {/* Mostrar razón de cancelación si el estado es 'cancelado' */}
        {esDespachoCancelado && despacho.razon_cancelacion && (
          <Card className="mb-3 border-danger">
            <Card.Header className="bg-danger bg-opacity-10 text-danger">
              <h6 className="mb-0">Razón de Cancelación</h6>
            </Card.Header>
            <Card.Body>
              <p className="mb-0">{despacho.razon_cancelacion}</p>
            </Card.Body>
          </Card>
        )}

        {/* Información de medicamentos despachados */}
        {(!esDespachoCancelado || esDespachoCancelado) && (
          <Card className="mb-3">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  {!esDespachoCancelado ? "Medicamentos Despachados" : "Medicamentos en la Receta"}
                </h6>
                {esDespachoAgotado && (
                  <Badge bg="warning">Despacho Parcial</Badge>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {/* Para despachos normales y parciales, mostrar los medicamentos despachados */}
              {!esDespachoCancelado && despacho.detalles && despacho.detalles.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Medicamento</th>
                        <th>Concentración</th>
                        <th>Requerido</th>
                        <th>Despachado</th>
                        <th>Faltante</th>
                        <th>% Completado</th>
                        <th>Lotes Utilizados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {despacho.detalles.map((medicamento, index) => {
                        // Calcular la cantidad total despachada sumando todos los lotes
                        const cantidadDespachada = medicamento.lotes.reduce(
                          (sum, lote) => sum + parseInt(lote.cantidad_despachada || 0), 0
                        );
                        const cantidadRequerida = medicamento.cantidad_requerida || 0;
                        const cantidadFaltante = Math.max(0, cantidadRequerida - cantidadDespachada);
                        const porcentajeCompletado = cantidadRequerida > 0 ?
                          Math.round((cantidadDespachada / cantidadRequerida) * 100) : 0;

                        return (
                          <tr key={index}>
                            <td>{medicamento.nombre_medicamento}</td>
                            <td>{medicamento.concentracion}</td>
                            <td>{cantidadRequerida}</td>
                            <td>
                              <Badge bg={cantidadDespachada === cantidadRequerida ? 'success' : 'warning'}>
                                {cantidadDespachada}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={cantidadFaltante > 0 ? 'danger' : 'success'}>
                                {cantidadFaltante}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2" style={{ width: '60px' }}>
                                  {porcentajeCompletado}%
                                </div>
                                <ProgressBar
                                  variant={cantidadDespachada === cantidadRequerida ? 'success' : 'warning'}
                                  now={porcentajeCompletado}
                                  style={{ height: '10px', width: '100%' }}
                                />
                              </div>
                            </td>
                            <td>
                              {medicamento.lotes && medicamento.lotes.map((lote, idx) => {
                                // Formatear fecha de caducidad
                                const fechaCaducidad = new Date(lote.fecha_caducidad);
                                const hoy = new Date();
                                const diasHastaCaducidad = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));
                                const estaProximoAVencer = diasHastaCaducidad <= 90;
                                const estaVencido = diasHastaCaducidad <= 0;

                                return (
                                  <div key={idx} className="mb-1">
                                    <strong>{lote.numero_lote}</strong>: {lote.cantidad_despachada} uds.
                                    <span className="ms-1 text-muted">
                                      (Vence: <span className={estaVencido ? 'text-danger' : estaProximoAVencer ? 'text-warning' : ''}>
                                        {fechaCaducidad.toLocaleDateString('es-ES')}
                                      </span>)
                                    </span>
                                  </div>
                                );
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : loadingReceta ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : esDespachoCancelado && recetaOriginal && recetaOriginal.length > 0 ? (
                // Para despachos cancelados, mostrar los medicamentos de la receta original
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Medicamento</th>
                        <th>Concentración</th>
                        <th>Cantidad Requerida</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recetaOriginal.map((medicamento, index) => (
                        <tr key={index}>
                          <td>{medicamento.nombre_medicamento}</td>
                          <td>{medicamento.concentracion}</td>
                          <td>{medicamento.cantidad}</td>
                          <td>
                            <Badge bg="danger">No Despachado</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted mb-0">No hay detalles de medicamentos disponibles.</p>
              )}
            </Card.Body>

            {/* Información relacionada con receta original */}
            {esDespachoAgotado && (
              <Card.Footer className="bg-light">
                <div className="d-flex align-items-center">
                  <div className="me-2">
                    <i className="fas fa-info-circle text-warning"></i>
                  </div>
                  <div>
                    <small className="text-muted">
                      Este es un despacho parcial. Se entregaron menos medicamentos de los prescritos originalmente debido a disponibilidad de stock.
                    </small>
                  </div>
                </div>
              </Card.Footer>
            )}
          </Card>
        )}

        {/* Medicamentos No Despachados (para despachos parciales) */}
        {esDespachoAgotado && medicamentosNoDespachados.length > 0 && (
          <Card className="mb-3 border-warning">
            <Card.Header className="bg-warning bg-opacity-10 text-warning">
              <h6 className="mb-0">Medicamentos No Despachados</h6>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Medicamento</th>
                      <th>Concentración</th>
                      <th>Cantidad Requerida</th>
                      <th>Cantidad No Despachada</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicamentosNoDespachados.map((medicamento, index) => {
                      // Encuentra el medicamento correspondiente en el despacho (si existe)
                      const medDespachado = despacho.detalles ?
                        despacho.detalles.find(m => m.id_medicamento === medicamento.id_medicamento) : null;

                      // Calcula cuánto falta por despachar
                      const cantidadDespachada = medDespachado ?
                        medDespachado.cantidad_total_despachada : 0;
                      const cantidadFaltante = medicamento.cantidad - cantidadDespachada;

                      // Solo mostrar si hay cantidad faltante
                      if (cantidadFaltante <= 0) return null;

                      return (
                        <tr key={index}>
                          <td>{medicamento.nombre_medicamento}</td>
                          <td>{medicamento.concentracion}</td>
                          <td>{medicamento.cantidad}</td>
                          <td>
                            <Badge bg="danger">
                              {cantidadFaltante}
                            </Badge>
                          </td>
                          <td>
                            {medicamento.stock_disponible === 0 ? (
                              <span className="text-danger">Sin stock disponible</span>
                            ) : medicamento.stock_disponible < medicamento.cantidad ? (
                              <span className="text-warning">Stock insuficiente ({medicamento.stock_disponible} uds. disponibles)</span>
                            ) : (
                              <span className="text-muted">No seleccionado para despacho</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Observaciones */}
        {despacho.observaciones && (
          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">Observaciones</h6>
            </Card.Header>
            <Card.Body>
              <p className="mb-0">{despacho.observaciones}</p>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={generarPDF}
          disabled={imprimiendo}
        >
          {imprimiendo ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Generando PDF...
            </>
          ) : (
            <>
              <i className="fas fa-print me-1"></i> Imprimir
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VerDespachoModal;