import axios from 'axios';

const baseUrl = 'http://localhost:8081/despacho';

export const despachoService = {
  listarRecetasPendientes: async () => {
    try {
      const response = await axios.get(`${baseUrl}/recetas-pendientes`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener recetas pendientes:', error);
      throw error;
    }
  },

  obtenerDetalleReceta: async (idReceta) => {
    try {
      const response = await axios.get(`${baseUrl}/receta/${idReceta}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle de receta:', error);
      throw error;
    }
  },

  obtenerLotesDisponibles: async (idMedicamento) => {
    try {
      const response = await axios.get(`${baseUrl}/lotes-disponibles/${idMedicamento}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener lotes disponibles:', error);
      throw error;
    }
  },

  realizarDespacho: async (despachoData) => {
    try {
      const response = await axios.post(`${baseUrl}/realizar`, despachoData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al realizar despacho:', error);
      throw error;
    }
  },

  listarHistorialDespachos: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${baseUrl}/historial`, {
        params: { page, limit },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de despachos:', error);
      throw error;
    }
  },

  obtenerDetalleDespacho: async (idDespacho) => {
    try {
      const response = await axios.get(`${baseUrl}/detalle/${idDespacho}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalle de despacho:', error);
      throw error;
    }
  }
};