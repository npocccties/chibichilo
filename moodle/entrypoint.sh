#!/bin/bash
set -euo pipefail

MOODLE_DIR="${MOODLE_DIR:-/var/www/html}"
MOODLE_SRC="${MOODLE_SRC:-/usr/src/moodle}"
MOODLEDATA_DIR="${MOODLEDATA_DIR:-/var/www/moodledata}"

MOODLE_WWWROOT="${MOODLE_WWWROOT:-http://localhost:8081}"
MOODLE_DB_TYPE="${MOODLE_DB_TYPE:-mariadb}"
MOODLE_DB_HOST="${MOODLE_DB_HOST:-mariadb}"
MOODLE_DB_PORT="${MOODLE_DB_PORT:-3306}"
MOODLE_DB_NAME="${MOODLE_DB_NAME:-moodle}"
MOODLE_DB_USER="${MOODLE_DB_USER:-root}"
MOODLE_DB_PASS="${MOODLE_DB_PASS:-}"
MOODLE_USERNAME="${MOODLE_USERNAME:-user}"
MOODLE_PASSWORD="${MOODLE_PASSWORD:-password}"
MOODLE_EMAIL="${MOODLE_EMAIL:-user@example.com}"
MOODLE_SITE_NAME="${MOODLE_SITE_NAME:-CHiBi-CHiLO Dev}"
MOODLE_SITE_SHORTNAME="${MOODLE_SITE_SHORTNAME:-chibichilo}"

mkdir -p "${MOODLE_DIR}" "${MOODLEDATA_DIR}"

# Populate the Moodle code volume from the image on first start.
if [[ ! -f "${MOODLE_DIR}/public/version.php" && ! -f "${MOODLE_DIR}/version.php" ]]; then
  echo "Seeding Moodle code into ${MOODLE_DIR}..."
  cp -a "${MOODLE_SRC}/." "${MOODLE_DIR}/"
fi

chown -R www-data:www-data "${MOODLE_DIR}" "${MOODLEDATA_DIR}"

wait_for_db() {
  echo "Waiting for database ${MOODLE_DB_HOST}:${MOODLE_DB_PORT}..."
  for _ in $(seq 1 60); do
    if php -r "
      \$mysqli = @new mysqli(
        '${MOODLE_DB_HOST}',
        '${MOODLE_DB_USER}',
        '${MOODLE_DB_PASS}',
        '${MOODLE_DB_NAME}',
        ${MOODLE_DB_PORT}
      );
      if (\$mysqli->connect_errno) {
        fwrite(STDERR, \$mysqli->connect_error . PHP_EOL);
        exit(1);
      }
      exit(0);
    "; then
      echo "Database is ready."
      return 0
    fi
    sleep 2
  done
  echo "Database did not become ready in time." >&2
  exit 1
}

install_moodle() {
  echo "Installing Moodle..."
  cd "${MOODLE_DIR}"
  php admin/cli/install.php \
    --lang=en \
    --wwwroot="${MOODLE_WWWROOT}" \
    --dataroot="${MOODLEDATA_DIR}" \
    --dbtype="${MOODLE_DB_TYPE}" \
    --dbhost="${MOODLE_DB_HOST}" \
    --dbport="${MOODLE_DB_PORT}" \
    --dbname="${MOODLE_DB_NAME}" \
    --dbuser="${MOODLE_DB_USER}" \
    --dbpass="${MOODLE_DB_PASS}" \
    --fullname="${MOODLE_SITE_NAME}" \
    --shortname="${MOODLE_SITE_SHORTNAME}" \
    --adminuser="${MOODLE_USERNAME}" \
    --adminpass="${MOODLE_PASSWORD}" \
    --adminemail="${MOODLE_EMAIL}" \
    --non-interactive \
    --agree-license \
    --chmod=2777
  chown www-data:www-data "${MOODLE_DIR}/config.php"
  chmod 640 "${MOODLE_DIR}/config.php"
  echo "Moodle installation finished."
}

wait_for_db

if [[ ! -f "${MOODLE_DIR}/config.php" ]]; then
  install_moodle
else
  echo "Moodle config.php already exists; skipping install."
fi

exec moodle-docker-php-entrypoint apache2-foreground
