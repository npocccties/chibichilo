# Development Moodle 5.3 on Moodle HQ's PHP/Apache image.
# https://github.com/moodlehq/moodle-php-apache
FROM moodlehq/moodle-php-apache:8.3

ARG MOODLE_VERSION=5.3
ARG MOODLE_DOWNLOAD_URL=https://packaging.moodle.org/stable503/moodle-${MOODLE_VERSION}.tgz

RUN curl -fsSL "${MOODLE_DOWNLOAD_URL}" -o /tmp/moodle.tgz \
  && mkdir -p /usr/src/moodle \
  && tar -xzf /tmp/moodle.tgz -C /usr/src/moodle --strip-components=1 \
  && rm /tmp/moodle.tgz \
  && chown -R www-data:www-data /usr/src/moodle /var/www/moodledata

COPY entrypoint.sh /usr/local/bin/chibichilo-moodle-entrypoint.sh
RUN chmod +x /usr/local/bin/chibichilo-moodle-entrypoint.sh

ENV MOODLE_DIR=/var/www/html \
    MOODLE_SRC=/usr/src/moodle \
    MOODLEDATA_DIR=/var/www/moodledata \
    PHP_INI-max_input_vars=5000

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/chibichilo-moodle-entrypoint.sh"]
