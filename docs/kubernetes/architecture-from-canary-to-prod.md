# How thinks work on canary

namespace: canary
important services (name:external/internal-dns):
- picstitch:dev-picstitch.kipthis.com
- parser: dev-parser.kipthis.com
- rnn:dev-rnn.kipthis.com (currently down)


# How things work on prod

namespace: prod
important services (should be only internal-dns which follows form my-svc.my-namespace.svc.cluster.local):
- picstitch:picstitch.prod.svc.cluster.local
- parser:parser.prod.svc.cluster.local
- rnn:rnn.prod.svc.cluster.local


# how rollout works