import type { DataProvenance } from './dataProvenance'

export interface DemoDatum<T> {
  provenance: DataProvenance
  value: T
}

export const demoDatum = <T>(value: T): DemoDatum<T> => ({
  provenance: 'demo',
  value,
})

export const fixtureDatum = <T>(value: T): DemoDatum<T> => ({
  provenance: 'fixture',
  value,
})
