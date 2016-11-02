FROM nginx
RUN mkdir -p /etc/nginx/ssl/pay_kipthis_com
COPY secrets/* /etc/nginx/ssl/pay_kipthis_com/
COPY nginx.k8.conf /etc/nginx/nginx.conf
EXPOSE 80 443
