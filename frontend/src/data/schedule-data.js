export const cursos = [
  { id: 1, nombre: "Matemáticas Avanzadas" },
  { id: 2, nombre: "Física Cuántica" },
  { id: 3, nombre: "Programación Web" },
];

export const periodos = [
  { id: 1, nombre: "2024-1", cursoId: 1 },
  { id: 2, nombre: "2024-2", cursoId: 1 },
  { id: 3, nombre: "2024-1", cursoId: 2 },
  { id: 4, nombre: "2024-2", cursoId: 3 },
];

export const facultades = [
  { id: 1, nombre: "Facultad de Ingeniería", periodoId: 1 },
  { id: 2, nombre: "Facultad de Ciencias", periodoId: 1 },
  { id: 3, nombre: "Facultad de Ingeniería", periodoId: 2 },
  { id: 4, nombre: "Facultad de Ciencias", periodoId: 3 },
  { id: 5, nombre: "Facultad de Tecnología", periodoId: 4 },
];

export const carreras = [
  { id: 1, nombre: "Ingeniería de Sistemas", facultadId: 1 },
  { id: 2, nombre: "Ingeniería Civil", facultadId: 1 },
  { id: 3, nombre: "Matemáticas", facultadId: 2 },
  { id: 4, nombre: "Ingeniería Industrial", facultadId: 3 },
  { id: 5, nombre: "Física", facultadId: 4 },
  { id: 6, nombre: "Desarrollo de Software", facultadId: 5 },
];

export const años = [
  { id: 1, nombre: "Primer Año", carreraId: 1 },
  { id: 2, nombre: "Segundo Año", carreraId: 1 },
  { id: 3, nombre: "Primer Año", carreraId: 2 },
  { id: 4, nombre: "Tercer Año", carreraId: 3 },
  { id: 5, nombre: "Cuarto Año", carreraId: 4 },
  { id: 6, nombre: "Quinto Año", carreraId: 5 },
  { id: 7, nombre: "Segundo Año", carreraId: 6 },
];

export const horarios = [
  { id: 1, nombre: "Horario Matutino", añoId: 1 },
  { id: 2, nombre: "Horario Vespertino", añoId: 1 },
  { id: 3, nombre: "Horario Intensivo", añoId: 2 },
  { id: 4, nombre: "Horario Regular", añoId: 3 },
  { id: 5, nombre: "Horario Avanzado", añoId: 4 },
  { id: 6, nombre: "Horario Ejecutivo", añoId: 5 },
  { id: 7, nombre: "Horario Especializado", añoId: 6 },
  { id: 8, nombre: "Horario Práctico", añoId: 7 },
  { id: 9, nombre: "Horario Laboratorio", añoId: 7 },
];

export const scheduleData = {
  cursos: [
    {
      id: 1,
      nombre: "Matemáticas Avanzadas",
      descripcion: "Curso de matemáticas para ingeniería",
      periodos: [
        {
          id: 1,
          nombre: "2024-1",
          fechaInicio: "2024-03-01",
          fechaFin: "2024-07-31",
          facultades: [
            {
              id: 1,
              nombre: "Facultad de Ingeniería",
              codigo: "FI",
              carreras: [
                {
                  id: 1,
                  nombre: "Ingeniería de Sistemas",
                  codigo: "IS",
                  años: [
                    {
                      id: 1,
                      nombre: "Primer Año",
                      nivel: 1,
                      horarios: [
                        {
                          id: 1,
                          nombre: "Horario Matutino",
                          horaInicio: "08:00",
                          horaFin: "12:00",
                          dias: ["Lunes", "Miércoles", "Viernes"],
                        },
                        {
                          id: 2,
                          nombre: "Horario Vespertino",
                          horaInicio: "14:00",
                          horaFin: "18:00",
                          dias: ["Martes", "Jueves"],
                        },
                      ],
                    },
                    {
                      id: 2,
                      nombre: "Segundo Año",
                      nivel: 2,
                      horarios: [
                        {
                          id: 3,
                          nombre: "Horario Intensivo",
                          horaInicio: "09:00",
                          horaFin: "15:00",
                          dias: ["Lunes", "Martes", "Miércoles"],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 2,
                  nombre: "Ingeniería Civil",
                  codigo: "IC",
                  años: [
                    {
                      id: 3,
                      nombre: "Primer Año",
                      nivel: 1,
                      horarios: [
                        {
                          id: 4,
                          nombre: "Horario Regular",
                          horaInicio: "07:00",
                          horaFin: "11:00",
                          dias: ["Lunes", "Miércoles", "Viernes"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 2,
              nombre: "Facultad de Ciencias",
              codigo: "FC",
              carreras: [
                {
                  id: 3,
                  nombre: "Matemáticas",
                  codigo: "MAT",
                  años: [
                    {
                      id: 4,
                      nombre: "Tercer Año",
                      nivel: 3,
                      horarios: [
                        {
                          id: 5,
                          nombre: "Horario Avanzado",
                          horaInicio: "10:00",
                          horaFin: "14:00",
                          dias: ["Martes", "Jueves", "Sábado"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 2,
          nombre: "2024-2",
          fechaInicio: "2024-08-01",
          fechaFin: "2024-12-31",
          facultades: [
            {
              id: 3,
              nombre: "Facultad de Ingeniería",
              codigo: "FI",
              carreras: [
                {
                  id: 4,
                  nombre: "Ingeniería Industrial",
                  codigo: "II",
                  años: [
                    {
                      id: 5,
                      nombre: "Cuarto Año",
                      nivel: 4,
                      horarios: [
                        {
                          id: 6,
                          nombre: "Horario Ejecutivo",
                          horaInicio: "18:00",
                          horaFin: "22:00",
                          dias: ["Lunes", "Miércoles", "Viernes"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      nombre: "Física Cuántica",
      descripcion: "Curso avanzado de física cuántica",
      periodos: [
        {
          id: 3,
          nombre: "2024-1",
          fechaInicio: "2024-03-01",
          fechaFin: "2024-07-31",
          facultades: [
            {
              id: 4,
              nombre: "Facultad de Ciencias",
              codigo: "FC",
              carreras: [
                {
                  id: 5,
                  nombre: "Física",
                  codigo: "FIS",
                  años: [
                    {
                      id: 6,
                      nombre: "Quinto Año",
                      nivel: 5,
                      horarios: [
                        {
                          id: 7,
                          nombre: "Horario Especializado",
                          horaInicio: "08:00",
                          horaFin: "16:00",
                          dias: [
                            "Lunes",
                            "Martes",
                            "Miércoles",
                            "Jueves",
                            "Viernes",
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 3,
      nombre: "Programación Web",
      descripcion: "Desarrollo de aplicaciones web modernas",
      periodos: [
        {
          id: 4,
          nombre: "2024-2",
          fechaInicio: "2024-08-01",
          fechaFin: "2024-12-31",
          facultades: [
            {
              id: 5,
              nombre: "Facultad de Tecnología",
              codigo: "FT",
              carreras: [
                {
                  id: 6,
                  nombre: "Desarrollo de Software",
                  codigo: "DS",
                  años: [
                    {
                      id: 7,
                      nombre: "Segundo Año",
                      nivel: 2,
                      horarios: [
                        {
                          id: 8,
                          nombre: "Horario Práctico",
                          horaInicio: "13:00",
                          horaFin: "17:00",
                          dias: ["Martes", "Jueves"],
                        },
                        {
                          id: 9,
                          nombre: "Horario Laboratorio",
                          horaInicio: "09:00",
                          horaFin: "12:00",
                          dias: ["Sábado"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
