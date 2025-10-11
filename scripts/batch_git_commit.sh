#!/bin/bash

# Batch Git Commit Script
# Commits and pushes files in batches to avoid large single commits

BATCH_SIZE=1000
COMMIT_MESSAGE="${1:-Updated card images and file structure}"

echo "=== Batch Git Commit Script ==="
echo "Batch size: $BATCH_SIZE files per commit"
echo "Commit message: $COMMIT_MESSAGE"
echo ""

# Get list of all changed/new files
echo "📋 Getting list of changed files..."
git add -A
CHANGED_FILES=$(git diff --cached --name-only)
TOTAL_FILES=$(echo "$CHANGED_FILES" | wc -l | xargs)

if [ "$TOTAL_FILES" -eq 0 ]; then
    echo "✅ No files to commit!"
    exit 0
fi

echo "📊 Total files to commit: $TOTAL_FILES"
echo ""

# Calculate number of batches needed
BATCHES=$(( ($TOTAL_FILES + $BATCH_SIZE - 1) / $BATCH_SIZE ))
echo "📦 Will create $BATCHES batch commit(s)"
echo ""

# Reset staging area
git reset

# Process files in batches
BATCH_NUM=1
PROCESSED=0

echo "$CHANGED_FILES" | while IFS= read -r file; do
    if [ -n "$file" ]; then
        git add "$file"
        PROCESSED=$((PROCESSED + 1))
        
        # When we reach batch size, commit and continue
        if [ $((PROCESSED % BATCH_SIZE)) -eq 0 ]; then
            echo "📦 Committing batch $BATCH_NUM ($BATCH_SIZE files)..."
            git commit -m "$COMMIT_MESSAGE (batch $BATCH_NUM/$BATCHES)" -q
            
            echo "⬆️  Pushing batch $BATCH_NUM to remote..."
            git push -q
            
            echo "✅ Batch $BATCH_NUM completed ($PROCESSED/$TOTAL_FILES files processed)"
            echo ""
            
            BATCH_NUM=$((BATCH_NUM + 1))
        fi
    fi
done

# Commit any remaining files
REMAINING=$(git diff --cached --name-only | wc -l | xargs)
if [ "$REMAINING" -gt 0 ]; then
    echo "📦 Committing final batch ($REMAINING files)..."
    git commit -m "$COMMIT_MESSAGE (batch $BATCH_NUM/$BATCHES - final)" -q
    
    echo "⬆️  Pushing final batch to remote..."
    git push -q
    
    echo "✅ Final batch completed"
    echo ""
fi

echo "🎉 All batches committed and pushed successfully!"
echo "📊 Total: $TOTAL_FILES files in $BATCHES batch(es)"

