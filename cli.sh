#!/bin/bash

until node index.js
do
    ls solutii | wc -l
    echo "Restarting"
    sleep 2
done
