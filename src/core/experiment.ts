import { writeFileSync } from 'fs';

export interface ExperimentResult {
  name?: string;
  seed?: number;
  parameters?: Record<string, any>;
  best?: any;
  bestFitness?: number;
  iterations?: number;
  history?: Array<{ iteration: number; bestFitness: number }>;
  runtimeMs?: number;
  metadata?: Record<string, any>;
}

export function exportExperimentToJson(result: ExperimentResult, filePath?: string): string {
  const json = JSON.stringify(result, null, 2);
  if (filePath) {
    writeFileSync(filePath, json, { encoding: 'utf8' });
  }
  return json;
}
