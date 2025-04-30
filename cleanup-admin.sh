#!/bin/bash

# Script para remover todos os arquivos relacionados à administração

# Remover diretórios
echo "Removendo diretórios administrativos..."
rm -rf app/admin
rm -rf app/admin-bypass
rm -rf app/api/admin
rm -rf components/admin

# Remover arquivos específicos
echo "Removendo arquivos administrativos específicos..."
rm -f lib/services/admin-service.ts

echo "Limpeza concluída!"
