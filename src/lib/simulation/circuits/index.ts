import { simpleSeriesCircuit } from './simpleSeries';
import { simpleTransistorCircuit } from './simpleTransistor';
import { simpleParallelCircuit } from './parallelCircuit';
import { CircuitModel } from '../types';

export const predefinedCircuits: Record<string, CircuitModel> = {
  [simpleSeriesCircuit.id]: simpleSeriesCircuit,
  [simpleTransistorCircuit.id]: simpleTransistorCircuit,
  [simpleParallelCircuit.id]: simpleParallelCircuit,
};

export const getCircuitList = () => Object.values(predefinedCircuits);
