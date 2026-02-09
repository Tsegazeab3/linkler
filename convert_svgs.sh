#!/bin/bash

# Enable debugging
set -x

# Define project directories
PROJECT_ROOT="/home/tsega/linkler"
MAIN_PAGE_DIR="$PROJECT_ROOT/frontend/main_page"
INPUT_DIR="$MAIN_PAGE_DIR/src/assets"
OUTPUT_DIR="$MAIN_PAGE_DIR/src/components/icons"

echo "Starting SVG to React component conversion..."

# Navigate to the main_page directory
cd "$MAIN_PAGE_DIR" || { echo "Error: Could not navigate to $MAIN_PAGE_DIR"; exit 1; }

# Install @svgr/cli if not already installed
if ! npm list @svgr/cli &> /dev/null; then
  echo "Installing @svgr/cli..."
  npm install --save-dev @svgr/cli || { echo "Error: Failed to install @svgr/cli"; exit 1; }
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR" || { echo "Error: Could not create output directory $OUTPUT_DIR"; exit 1; }

# Loop through each SVG file and convert it
found_svg_files=false
for svg_file_path in "$INPUT_DIR"/*.svg; do
  # Check if the file exists and is a regular file
  if [ -f "$svg_file_path" ]; then
    found_svg_files=true
    filename=$(basename -- "$svg_file_path")
    base_name="${filename%.*}" # e.g., 'my-icon' from 'my-icon.svg'

    # Convert to PascalCase for React component naming
    # my-icon -> MyIcon
    # my_icon -> MyIcon
    component_name=$(echo "$base_name" | sed -r 's/[-_](.)/\U\1/g' | awk '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) tolower(substr($i,2))}}1' | sed 's/ //g')

    # Ensure the first letter is capitalized
    component_name="$(tr '[:lower:]' '[:upper:]' <<< "${component_name:0:1}")${component_name:1}"

    output_file="$OUTPUT_DIR/${component_name}.jsx"

    echo "Converting $svg_file_path to $output_file"
    npx svgr --icon "$svg_file_path" > "$output_file" || { echo "Error: Failed to convert $svg_file_path"; continue; }
  fi
done

if ! "$found_svg_files"; then
  echo "No SVG files found in $INPUT_DIR. Skipping conversion."
fi

echo "SVG conversion script finished."

# Navigate back to the project root (optional, but good practice for scripts)
cd "$PROJECT_ROOT"

