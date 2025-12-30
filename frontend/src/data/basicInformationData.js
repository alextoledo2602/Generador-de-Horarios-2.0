export const faculties = [
  { id: "FCSH", name: "Facultad de Ciencias Sociales y Humanísticas" },
  { id: "FCI", name: "Facultad de Ciencias Informáticas" },
  { id: "FCEE", name: "Facultad de Ciencias Económicas y Empresariales" },
  { id: "FIE", name: "Facultad de Ingeniería Eléctrica" },
];

export const careersByFaculty = {
  2: [
    { id: "PSI", name: "Psicología" },
    { id: "DER", name: "Derecho" },
    { id: "COM", name: "Comunicación Social" },
  ],
  1: [
    { id: "ING_INF", name: "Ingeniería Informática" },
    { id: "ING_SIS", name: "Ingeniería en Sistemas" },
    { id: "ING_SOF", name: "Ingeniería de Software" },
  ],
  FCEE: [
    { id: "ECO", name: "Economía" },
    { id: "CONT", name: "Contabilidad y Finanzas" },
    { id: "ADM", name: "Administración de Empresas" },
  ],
  FIE: [
    { id: "ING_ELE", name: "Ingeniería Eléctrica" },
    { id: "ING_AUT", name: "Ingeniería en Automática" },
    { id: "ING_TEL", name: "Ingeniería en Telecomunicaciones" },
  ],
};

export const yearsByCareer = {
  1: [1, 2, 3, 4],
  ING_SIS: [1, 2, 3, 4],
  ING_SOF: [1, 2, 3, 4],
  PSI: [1, 2, 3, 4, 5],
  DER: [1, 2, 3, 4, 5],
  COM: [1, 2, 3, 4],
  ECO: [1, 2, 3, 4],
  CONT: [1, 2, 3, 4],
  ADM: [1, 2, 3, 4],
  ING_ELE: [1, 2, 3, 4, 5],
  ING_AUT: [1, 2, 3, 4, 5],
  ING_TEL: [1, 2, 3, 4, 5],
};

// Cursos disponibles


export const subjectsByCareerAndYear = {
  1: {
    1: [
      { id: "ALG", name: "Álgebra", timeBase: 60 },
      { id: "CALC", name: "Cálculo", timeBase: 80 },
      { id: "PROG1", name: "Programación I", timeBase: 100 },
      { id: "INTRO", name: "Introducción a la Informática", timeBase: 70 },
    ],
    2: [
      { id: "EDA", name: "Estructura de Datos y Algoritmos", timeBase: 90 },
      { id: "BD", name: "Bases de Datos", timeBase: 85 },
      { id: "PROG2", name: "Programación II", timeBase: 95 },
      { id: "MAT_DIS", name: "Matemática Discreta", timeBase: 75 },
    ],
    3: [
      { id: "IS", name: "Ingeniería de Software", timeBase: 110 },
      { id: "REDES", name: "Redes de Computadoras", timeBase: 100 },
      { id: "SO", name: "Sistemas Operativos", timeBase: 90 },
      { id: "IA", name: "Inteligencia Artificial", timeBase: 120 },
    ],
    4: [
      { id: "PROYF", name: "Proyecto Final", timeBase: 150 },
      { id: "SEG", name: "Seguridad Informática", timeBase: 80 },
      { id: "COMP", name: "Compiladores", timeBase: 90 },
      { id: "ETICA", name: "Ética Profesional", timeBase: 60 },
    ],
  },
  // Añade más carreras y sus asignaturas por año aquí
};

export const defaultBasicInfo = {
  faculty: "",
  career: "",
  year: "",
  semester: 1,
  
  weeks: 14,
  subjects: [],
};
