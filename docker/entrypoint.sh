#!/bin/sh
set -e

npx nuxt prepare
npm run db:migrate
exec npx nuxt dev --host 0.0.0.0 --port 3000
