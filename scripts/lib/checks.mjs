export function createCheckSuite(label) {
  const checks = [];

  function add(name, passed, detail) {
    checks.push({ detail, name, passed });
  }

  function print() {
    for (const check of checks) {
      const marker = check.passed ? "✓" : "✗";
      console.log(`${marker} ${check.name} — ${check.detail}`);
    }
  }

  function assert() {
    const failures = checks.filter((check) => !check.passed);

    print();

    if (failures.length > 0) {
      console.error(`\n${label} failed: ${failures.length} check(s) failed.`);
      process.exit(1);
    }

    console.log(`\n${label} passed.`);
  }

  return { add, assert };
}

export function countMatches(source, pattern) {
  return Array.from(source.matchAll(pattern)).length;
}
