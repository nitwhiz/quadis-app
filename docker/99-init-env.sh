#!/bin/sh

echo "Initializing env.json"

ENV_FILE="/usr/share/nginx/html/env.json"
ENV_JSON=$(jq ".gameServer = \"${GAME_SERVER:-"localhost:7000"}\"|.tls = ${GAME_SERVER_TLS:-false}" ${ENV_FILE})

echo "${ENV_JSON}" > ${ENV_FILE}
