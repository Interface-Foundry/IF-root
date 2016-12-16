FROM luminati/luminati-proxy:latest

ENV CUSTOMER=change_me
ENV PASSWORD=change_me_too
ENV PROXY_COUNT=3
ENV COUNTRY=us
ENV MAX_REQUESTS=20
ENV PORT=22225
ENV LOG=DEBUG

CMD luminati --customer $CUSTOMER --password $PASSWORD --proxy_count $PROXY_COUNT --country $COUNTRY --max_requests $MAX_REQUESTS --port $PORT --log $LOG
