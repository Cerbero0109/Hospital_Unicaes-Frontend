import axios from 'axios';

const baseUrl = 'http://localhost:8081/examenes';

export const examenesService = {
    getExamenesPendientes: async () => {
        try {
            const response = await axios.get(`${baseUrl}/listar-pendientes`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener los exámenes pendientes:', error);
            throw error;
        }
    },

};

export const pacientesConExamenService = {
    getPacientesConExamen: async () => {
        try {
            const response = await axios.get(`${baseUrl}/pacientes-con-examen`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener los pacientes con exámenes:', error);
            throw error;
        }
    },
};

export const historialExamenesPorPacienteService = {
    getHistorialExamenesPorPaciente: async (id_paciente) => {
        try {
            const response = await axios.get(`${baseUrl}/historial/${id_paciente}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener el historial de exámenes por paciente:', error);
            throw error;
        }
    },
};


export const mostrarResultadosExamenService = {
    getResultadosExamen: async (id_examen) => {
        try {
            const response = await axios.get(`${baseUrl}/resultados/${id_examen}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener los resultados del examen:', error);
            throw error;
        }
    },
};

