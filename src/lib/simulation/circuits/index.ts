import { simpleSeriesCircuit } from './simpleSeries';
import { simpleTransistorCircuit } from './simpleTransistor';
import { CircuitModel } from '../types';

export const predefinedCircuits: Record<string, CircuitModel> = {
  [simpleSeriesCircuit.id]: simpleSeriesCircuit,
  [simpleTransistorCircuit.id]: simpleTransistorCircuit,
};

export const getCircuitList = () => Object.values(predefinedCircuits);
