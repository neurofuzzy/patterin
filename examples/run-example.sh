#!/usr/bin/env bash

# Simple script to run examples and open the generated SVG
# Examples now write to examples/output/ automatically
# Usage: ./run-example.sh <example-file.ts>

if [ -z "$1" ]; then
  echo "Usage: ./run-example.sh <example-file.ts>"
  echo ""
  echo "Examples:"
  echo "  ./run-example.sh 01-basics/circle.ts"
  echo "  ./run-example.sh 06-fractals/dragon-curve.ts"
  echo ""
  echo "Output files are written to examples/output/"
  exit 1
fi

EXAMPLE_FILE="$1"

# Handle both relative and absolute paths
if [[ "$EXAMPLE_FILE" == examples/* ]]; then
  # Already has examples/ prefix
  FULL_PATH="$EXAMPLE_FILE"
else
  # Add examples/ prefix if not present
  FULL_PATH="examples/$EXAMPLE_FILE"
fi

if [ ! -f "$FULL_PATH" ]; then
  echo "Error: Example file not found: $FULL_PATH"
  exit 1
fi

echo "Running: $FULL_PATH"
npx tsx "$FULL_PATH"

if [ $? -eq 0 ]; then
  # Extract filename for the generated SVG
  BASENAME=$(basename "$EXAMPLE_FILE" .ts)
  OUTPUT_FILE="examples/output/${BASENAME}.svg"
  
  if [ -f "$OUTPUT_FILE" ]; then
    # Try to open in default app (macOS/Linux)
    if command -v open &> /dev/null; then
      open "$OUTPUT_FILE"
    elif command -v xdg-open &> /dev/null; then
      xdg-open "$OUTPUT_FILE"
    fi
  fi
else
  echo "✗ Error running example"
  exit 1
fi
