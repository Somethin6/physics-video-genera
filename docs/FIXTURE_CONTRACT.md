# Fixture contract

Fixture mode may test orchestration deterministically but must satisfy three rules:

1. opt-in only;
2. visibly tagged in API/persisted outputs;
3. never used as fallback for failed production dependencies.

Fixture values are test data, not measured performance.
