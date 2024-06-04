#!/bin/bash

echo "v.0.0.1"
sleep 5
service nginx start &
dotnet rsCPO.dll