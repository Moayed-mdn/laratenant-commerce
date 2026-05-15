#!/usr/bin/env bash
set -euo pipefail

FILE="src/components/shared/categories/ParentCategorySelect.tsx"

# Replace '<PopoverTrigger asChild>' with '<PopoverTrigger>'
sed -i 's/<PopoverTrigger asChild>/<PopoverTrigger>/' "$FILE"

echo "✔ Removed asChild from PopoverTrigger in $FILE"