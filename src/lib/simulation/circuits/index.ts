import { simpleSeriesCircuit } from './simpleSeries';
import { simpleTransistorCircuit } from './simpleTransistor';
import { simpleParallelCircuit } from './parallelCircuit';
import { ohmsLawSeriesCircuit } from './ohmsLawSeries';
import { CircuitModel } from '../types';

export const predefinedCircuits: Record<string, CircuitModel> = {
  [simpleSeriesCircuit.id]: simpleSeriesCircuit,
  [simpleTransistorCircuit.id]: simpleTransistorCircuit,
  [simpleParallelCircuit.id]: simpleParallelCircuit,
  [ohmsLawSeriesCircuit.id]: ohmsLawSeriesCircuit,
};

export const getCircuitList = () => Object.values(predefinedCircuits);
