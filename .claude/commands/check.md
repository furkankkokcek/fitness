Syntax-check all JS files in the project and report any errors.

Run:
```bash
for f in js/*.js js/components/*.js; do node --check "$f" && echo "✓ $f" || echo "✗ FAILED: $f"; done
```
