import axios from 'axios';

const baseUrl = 'http://localhost:8081/estados-consulta';



export const estadoConsultaService = {
    getEstados: async () => {
        try {
          const response = await axios.get(`${baseUrl}/listar`, {
            withCredentials: true 
          });
          return response.data;
        } catch (error) {
          console.error('Error al obtener los estados de la consulta:', error);
          throw error;
        }
      }

}