#!/bin/bash

VAULT_DIR="./images/cards/sword-shield/shining-fates-shiny-vault"
TEMP_DIR="./images/cards/sword-shield/shining-fates-shiny-vault-temp"

# Create temp directory
mkdir -p "$TEMP_DIR"

# Copy and renumber based on CSV order
# Scorbunny 15 -> 1
cp "$VAULT_DIR/15.jpg" "$TEMP_DIR/1.jpg" 2>/dev/null || echo "Missing 15.jpg"

# Galarian Corsola 49 -> 2
cp "$VAULT_DIR/49.jpg" "$TEMP_DIR/2.jpg" 2>/dev/null || echo "Missing 49.jpg"

# Dedenne 51 -> 3
cp "$VAULT_DIR/51.jpg" "$TEMP_DIR/3.jpg" 2>/dev/null || echo "Missing 51.jpg"

# Hatterene 56 -> 4
cp "$VAULT_DIR/56.jpg" "$TEMP_DIR/4.jpg" 2>/dev/null || echo "Missing 56.jpg"

# Galarian Sirfetch'd 64 -> 5
cp "$VAULT_DIR/64.jpg" "$TEMP_DIR/5.jpg" 2>/dev/null || echo "Missing 64.jpg"

# Grapploct 73 -> 6
cp "$VAULT_DIR/73.jpg" "$TEMP_DIR/6.jpg" 2>/dev/null || echo "Missing 73.jpg"

# Decidueye 76 -> 7
cp "$VAULT_DIR/76.jpg" "$TEMP_DIR/7.jpg" 2>/dev/null || echo "Missing 76.jpg"

# Galarian Darmanitan 97 -> 8
cp "$VAULT_DIR/97.jpg" "$TEMP_DIR/8.jpg" 2>/dev/null || echo "Missing 97.jpg"

# Drednaw 102 -> 9
cp "$VAULT_DIR/102.jpg" "$TEMP_DIR/9.jpg" 2>/dev/null || echo "Missing 102.jpg"

# Wooloo 103 -> 10
cp "$VAULT_DIR/103.jpg" "$TEMP_DIR/10.jpg" 2>/dev/null || echo "Missing 103.jpg"

# Dubwool 104 -> 11
cp "$VAULT_DIR/104.jpg" "$TEMP_DIR/11.jpg" 2>/dev/null || echo "Missing 104.jpg"

# Centiskorch V 108 -> 12
cp "$VAULT_DIR/108.jpg" "$TEMP_DIR/12.jpg" 2>/dev/null || echo "Missing 108.jpg"

# Ditto VMAX 119 -> 13
cp "$VAULT_DIR/119.jpg" "$TEMP_DIR/13.jpg" 2>/dev/null || echo "Missing 119.jpg"

# Eternatus VMAX 122 -> 14
cp "$VAULT_DIR/122.jpg" "$TEMP_DIR/14.jpg" 2>/dev/null || echo "Missing 122.jpg"

# Clobbopus 145 -> 15
cp "$VAULT_DIR/145.jpg" "$TEMP_DIR/15.jpg" 2>/dev/null || echo "Missing 145.jpg"

# Galarian Zigzagoon 151 -> 16
cp "$VAULT_DIR/151.jpg" "$TEMP_DIR/16.jpg" 2>/dev/null || echo "Missing 151.jpg"

# Duraludon 165 -> 17
cp "$VAULT_DIR/165.jpg" "$TEMP_DIR/17.jpg" 2>/dev/null || echo "Missing 165.jpg"

# Lapras VMAX 184 -> 18
cp "$VAULT_DIR/184.jpg" "$TEMP_DIR/18.jpg" 2>/dev/null || echo "Missing 184.jpg"

# Toxtricity VMAX 186 -> 19
cp "$VAULT_DIR/186.jpg" "$TEMP_DIR/19.jpg" 2>/dev/null || echo "Missing 186.jpg"

# Falinks V 188 -> 20
cp "$VAULT_DIR/188.jpg" "$TEMP_DIR/20.jpg" 2>/dev/null || echo "Missing 188.jpg"

# Grimmsnarl VMAX 190 -> 21
cp "$VAULT_DIR/190.jpg" "$TEMP_DIR/21.jpg" 2>/dev/null || echo "Missing 190.jpg"

# Ditto V 191 -> 22
cp "$VAULT_DIR/191.jpg" "$TEMP_DIR/22.jpg" 2>/dev/null || echo "Missing 191.jpg"

# Corvisquire 102 -> 23 (duplicate number with Drednaw, checking context)
# This seems to be an error in the CSV - let me use a different approach

echo "Renaming complete. Check temp directory."
ls -1 "$TEMP_DIR" | wc -l
