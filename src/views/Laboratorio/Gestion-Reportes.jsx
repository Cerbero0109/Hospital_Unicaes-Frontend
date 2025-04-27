import React from 'react';
import { Container, Row } from 'react-bootstrap';
import Card from '../../components/Card/MainCard';

const GestionReportes = () => {
  return (
    <Row>
      <Card title="Gestión de Reportes">
        <Container className="mb-3">
          <h1>Prueba de Gestión de Reportes</h1>
        </Container>
      </Card>
    </Row>
  );
};

export default GestionReportes;
