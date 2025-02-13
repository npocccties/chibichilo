FROM bitnami/moodle:4.5.1-debian-12-r2
# NOTE: Fixed AH00023 for macOS with Apple silicon
RUN echo 'Mutex posixsem' >> /opt/bitnami/apache2/conf/httpd.conf
