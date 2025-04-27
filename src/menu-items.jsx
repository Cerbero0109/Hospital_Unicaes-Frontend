const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Home',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          //DASHBOARD - TODOS LOS USUARIOS
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'feather icon-home',
          url: '/dashboard',
          roles: ['Administrador', 'Médico', 'Enfermero', 'Laboratorista'] 
        }
      ]
    },
    {
      id: 'crud_admin',
      title: 'Funciones',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'v_administradores',
          title: 'Gestionar Usuarios',
          type: 'item',
          url: '/usuarios',
          classes: 'nav-item',
          icon: 'feather icon-user',
          roles: ['Administrador'] // Solo el rol Administrador puede ver esta opción
        },
        {
          id: 'v_Especialidades',
          title: 'Gestionar Especialidades',
          type: 'item',
          url: '/especialidades',
          classes: 'nav-item',
          icon: 'feather icon-clipboard',
          roles: ['Administrador'] // Solo el rol Administrador puede ver esta opción
        },
        {
          id: 'v_areas',
          title: 'Gestionar Areas',
          type: 'item',
          url: '/areas',
          classes: 'nav-item',
          icon: 'feather icon-activity',
          roles: ['Administrador'] // Solo el rol Administrador puede ver esta opción
        },
        {
          //VISTA DE TOMAR CONSULTAS - SOLO LOS MEDICOS
          id: 'v_atencion_medica',
          title: 'Atención Médica',
          type: 'item',
          icon: 'feather icon-user-check',
          url: '/tomar-consulta',
          roles: ['Médico']
        },

        {
          //VISTA PARA EL DETALLE DE LAS CONSULTAS - SOLO LOS MEDICOS
          id: 'v_consultas',
          title: 'Tus Consultas',
          type: 'item',
          icon: 'feather icon-clipboard',
          url: '/consultas',
          roles: ['Médico']
        },

        {
          //VISTA PARA EL DETALLE DE LAS CONSULTAS REALIZADAS - SOLO LOS MEDICOS
          id: 'v_consultas_realizadas',
          title: 'Tus Consultas realizadas',
          type: 'item',
          icon: 'feather icon-check-square',
          url: '/consultas-realizadas',
          roles: ['Médico']
        },

        // SOLO EMFERMEROS
        {
          //AGREGAR PACIENTES
          id: 'v_pacientes',
          title: 'Pacientes',
          type: 'item',
          icon: 'feather icon-user-plus',
          url: '/pacientes',
          roles: ['Enfermero']
        },

        {
          //VISTA SELECCION TRIAGE
          id: 'v_seleccion',
          title: 'Seleccion Triage',
          type: 'item',
          icon: 'feather icon-alert-triangle',
          url: '/seleccion',
          roles: ['Enfermero', 'Médico']
        },
        // VISTA DE LABORATORISTA
        {
          id: 'v_pacientes_examenes',
          title: 'Gestion Pacientes',
          type: 'item',
          url: '/pacientes-historial',
          classes: 'nav-item',
          icon: 'feather icon-user',
          roles: ['Laboratorista'] // Solo el rol Laboratorista puede ver esta opción
        },
        {
          id: 'v_examenes',
          title: 'Gestion Examenes',
          type: 'item',
          url: '/examenes-pendientes',
          classes: 'nav-item',
          icon: 'fas fa-vial ',
          roles: ['Laboratorista'] // Solo el rol Laboratorista puede ver esta opción
        },
        {
          id: 'v_reportes',
          title: 'Gestion Reportes',
          type: 'item',
          url: '/gestion-reportes',
          classes: 'nav-item',
          icon: 'fas fa-chart-bar',
          roles: ['Laboratorista'] // Solo el rol Laboratorista puede ver esta opción
        }
      ]
    }
  ]
};

export default menuItems;
