#!/bin/sh
# Збірка для Cloudflare без .env.local: OpenNext вбудовує env-файли у воркер,
# а секрети мають приходити лише із секретів Cloudflare.
set -e
cd "$(dirname "$0")/.."
if [ -f .env.local ]; then
  mv .env.local .env.local.cf-build-hidden
  trap 'mv .env.local.cf-build-hidden .env.local' EXIT
fi
npx opennextjs-cloudflare build
