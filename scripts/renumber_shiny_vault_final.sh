#!/bin/bash
VAULT_DIR="./images/cards/sword-shield/shining-fates-shiny-vault"
TEMP_DIR="./images/cards/sword-shield/shining-fates-shiny-vault-new"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Map old numbers to new sequential numbers based on CSV
cp "$VAULT_DIR/15.jpg" "$TEMP_DIR/1.jpg"   # Scorbunny
cp "$VAULT_DIR/145.jpg" "$TEMP_DIR/2.jpg"  # Clobbopus
cp "$VAULT_DIR/76.jpg" "$TEMP_DIR/3.jpg"   # Decidueye
cp "$VAULT_DIR/191.jpg" "$TEMP_DIR/4.jpg"  # Ditto V
cp "$VAULT_DIR/102.jpg" "$TEMP_DIR/5.jpg"  # Drednaw
cp "$VAULT_DIR/165.jpg" "$TEMP_DIR/6.jpg"  # Duraludon
cp "$VAULT_DIR/188.jpg" "$TEMP_DIR/7.jpg"  # Falinks V
cp "$VAULT_DIR/97.jpg" "$TEMP_DIR/8.jpg"   # Galarian Darmanitan
cp "$VAULT_DIR/151.jpg" "$TEMP_DIR/9.jpg"  # Galarian Zigzagoon
cp "$VAULT_DIR/190.jpg" "$TEMP_DIR/10.jpg" # Grimmsnarl VMAX
cp "$VAULT_DIR/184.jpg" "$TEMP_DIR/11.jpg" # Lapras VMAX
cp "$VAULT_DIR/186.jpg" "$TEMP_DIR/12.jpg" # Toxtricity VMAX

# Now replace the old folder with the new one
rm -rf "$VAULT_DIR"
mv "$TEMP_DIR" "$VAULT_DIR"
echo "✅ Renumbered Shiny Vault cards to sequential 1-12"
ls -1 "$VAULT_DIR"
