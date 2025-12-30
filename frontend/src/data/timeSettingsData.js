export const activities = [
  { id: 1, name: "Seminario", abbreviation: "1" },
  { id: 2, name: "Evaluación", abbreviation: "2" },
  { id: 3, name: "Laboratorio", abbreviation: "3" },
  { id: 4, name: "Clase Practica", abbreviation: "4" },
];

export const defaultTimeSettings = {
  timeBase: 80,
  encounters: 0,
  hoursPerEncounter: [],
  activitiesPerEncounter: [],
  weeklyDistribution: {
    above: Array(14).fill(2),
    below: Array(14).fill(4),
  },
};
