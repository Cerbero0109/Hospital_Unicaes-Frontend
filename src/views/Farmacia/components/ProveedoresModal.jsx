import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Alert } from 'react-bootstrap';
import { proveedorService } from '../../../services/proveedorService';
import ProveedorModal from './ProveedorModal';

const ProveedoresModal = ({ show, onHide }) => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  // Cargar proveedores al montar el componente o mostrar el modal
  useEffect(() => {
    if (show) {
      fetchProveedores();
    }
  }, [show]);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await proveedorService.listarProveedores();
      setProveedores(response && response.data ? response.data : []);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setError("Error al cargar la lista de proveedores. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoProveedor = () => {
    setProveedorSeleccionado(null);
    setShowProveedorModal(true);
  };

  const handleEditarProveedor = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setShowProveedorModal(true);
  };

  const handleGuardarProveedor = async (proveedorData) => {
    try {
      if (proveedorSeleccionado) {
        // Actualizar proveedor existente
        await proveedorService.actualizarProveedor(proveedorSeleccionado.id_proveedor, proveedorData);
      } else {
        // Crear nuevo proveedor
        await proveedorService.crearProveedor(proveedorData);
      }
      
      // Cerrar modal y recargar la lista
      setShowProveedorModal(false);
      fetchProveedores();
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      alert(error.response?.data?.message || "Error al guardar el proveedor");
    }
  };

  const handleDesactivarProveedor = async (id) => {
    if (window.confirm("¿Está seguro que desea desactivar este proveedor?")) {
      try {
        await proveedorService.desactivarProveedor(id);
        fetchProveedores();
      } catch (error) {
        console.error("Error al desactivar proveedor:", error);
        alert("Error al desactivar el proveedor");
      }
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Gestión de Proveedores</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <div className="d-flex justify-content-end mb-3">
            <Button variant="primary" onClick={handleNuevoProveedor}>
              <i className="fas fa-plus-circle me-1"></i> Nuevo Proveedor
            </Button>
          </div>

          {loading ? (
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando proveedores...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.length > 0 ? (
                    proveedores.map((prov) => (
                      <tr key={prov.id_proveedor}>
                        <td>{prov.id_proveedor}</td>
                        <td>{prov.nombre}</td>
                        <td>{prov.persona_contacto || '-'}</td>
                        <td>{prov.telefono || '-'}</td>
                        <td>{prov.correo || '-'}</td>
                        <td>
                          <Badge bg={prov.estado === 'activo' ? 'success' : 'danger'}>
                            {prov.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEditarProveedor(prov)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          {prov.estado === 'activo' && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDesactivarProveedor(prov.id_proveedor)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No hay proveedores registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para crear/editar proveedores */}
      <ProveedorModal 
        show={showProveedorModal}
        onHide={() => setShowProveedorModal(false)}
        proveedor={proveedorSeleccionado}
        onGuardar={handleGuardarProveedor}
      />
    </>
  );
};

export default ProveedoresModal;