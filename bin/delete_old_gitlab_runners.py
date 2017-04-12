import requests

url = "https://gitlab.com/api/v4/runners"
headers = {"PRIVATE-TOKEN": "6mw3J4FnfVywaoaPGo_L"}
runners = requests.get(url, headers=headers)

runners = sorted(runners.json(), key=lambda x: x['id'])

if len(runners) == 1:
    print('only one runner')
else:
    print('many runners')
    for x in runners[:-1]:
        print('deleting {}'.format(x['id']))
        requests.delete(url + '/{}'.format(x['id']), headers=headers)