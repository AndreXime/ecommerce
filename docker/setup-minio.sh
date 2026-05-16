#!/bin/sh
set -eu

HOST="${MINIO_HOST:-minio}"
PORT="${MINIO_PORT:-9000}"
BUCKET="${MINIO_BUCKET:-files}"
USER="${MINIO_ROOT_USER:?}"
PASS="${MINIO_ROOT_PASSWORD:?}"

until mc alias set local "http://${HOST}:${PORT}" "$USER" "$PASS" >/dev/null 2>&1; do
  sleep 1
done

mc mb "local/${BUCKET}" --ignore-existing
mc anonymous set download "local/${BUCKET}"
mc cors set "local/${BUCKET}" /config/cors.xml || echo "[MinIO: cors set skipped]"
echo "--- [MinIO: bucket ${BUCKET} com leitura publica] ---"
