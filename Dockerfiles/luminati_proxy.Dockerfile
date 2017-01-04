FROM luminati/luminati-proxy:latest

# Determines the country of the peers you connect to. Luminati support suggests
# using US, AU, or Western Europe due to the generally better internet
# infrastructure in those places.
ENV COUNTRY=us
ENV CUSTOMER=kipthis
# Active connections timeout after 60 seconds. So if you have a pool size larger
# than the number of requests you make in a 60-second window, this should be
# set to something less than 60.
ENV KEEP_ALIVE=50
ENV LOG=DEBUG
# Max requests is the most number of requests that will be made on a single
# session. A value of 1, for instance, will tear each session down after every
# request. In this case, it's probably better to set a high pool_size 
# (and reasonable keep_alive) so that there are idle sessions waiting to be used
# and each request won't have to suffer the latency penalty of initializing
# a session.
ENV MAX_REQUESTS=20
ENV PASSWORD=CHANGE_ME
# Pool size is the number of live sessions at any given time. This should be set
# to at least the number of requests you expect to be in-flight at any given
# time, plust some buffer to account for re-establishing those sessions (unless
# max requests is set to a high value).
ENV POOL_SIZE=10
ENV PORT=22225
ENV PROXY_COUNT=1
# Session init timeout determines how long we'll wait when trying to initialize
# a new session. Lower timeout can sometimes yield longer session initialization
# times, but also faster requests (since only faster peers will be accepted).
ENV SESSION_INIT_TIMEOUT=1
ENV ZONE=gen

CMD luminati --customer $CUSTOMER --password $PASSWORD --zone $ZONE --country $COUNTRY --keep_alive $KEEP_ALIVE --log $LOG --max_requests $MAX_REQUESTS --pool_size $POOL_SIZE --port $PORT --proxy_count $PROXY_COUNT --session_init_timeout $SESSION_INIT_TIMEOUT
