import React from 'react';
import SendMessage from './sendMessage';

export default {

  path: '/sendmessage',

  async action(context) {
    let res;
    if (context.query.id && context.query.id != 'undefined') {
      res = await fetch('/graphql', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{teams(limit:2000)(team_id:"${context.query.id}") {bot, team_name members{value:dm, label:name, is_bot, is_admin, is_owner, is_primary_owner}}}`,
        }),
        credentials: 'include',
      });
    } else {
      res = await fetch('/graphql', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{teams(limit:2000){bot, team_name, members {value: dm, label: name, is_bot, is_admin, is_owner, is_primary_owner}}}`,
        }),
        credentials: 'include',
      });
    }
    const {data} = await res.json();
    let members = data.teams.reduce((mems, team) => {
      let teamMems = team.members.map(member => {
        member.token = team.bot.bot_access_token
        return member;
      })
      return mems.concat(teamMems);
    }, [])
    let member = context.query.member ? context.query.member : '';
    let token = context.query.token ? context.query.token: '';
    return <SendMessage members={members} member={member} token={token} />
  },

};