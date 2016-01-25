import {
    CHANGE_MESSAGE, LOAD_MESSAGE
}
from '../constants/ActionTypes';

const initialState = {
    incoming: true,
    msg: 'default',
    tokens: [],
    bucket: 'default',
    action: 'default',
    amazon: [],
    dataModify: {
        type: 'default',
        val: [],
        param: 'default'
    },
    source: {
        origin: 'default',
        channel: 'default',
        org: 'default',
        id: 'default'
    },
    client_res: [],
    ts: Date.now(),
    resolved: false,
    parent: 'default'
};

export default function activeMessage(state = initialState, action) {
    switch (action.type) {
        case CHANGE_MESSAGE:
            return {
                incoming: true,
                msg: action.message.msg,
                tokens: action.message.tokens,
                bucket: action.message.bucket,
                action: action.message.action,
                amazon: action.message.amazon,
                dataModify: {
                    type: (action.message.dataModify && action.message.dataModify.type) ? action.message.dataModify.type : '',
                    val: (action.message.dataModify && action.message.dataModify.val) ? action.message.dataModify.val : [],
                    param: (action.message.dataModify && action.message.dataModify.param) ? action.message.dataModify.param : ''
                },
                source: {
                    origin: (action.message.source && action.message.source.origin) ? action.message.source.origin : 'socketio',
                    channel: (action.message.source && action.message.source.channel) ? action.message.source.channel : '',
                    org: (action.message.source && action.message.source.org) ? action.message.source.org : 'kip',
                    id: (action.message.source && action.message.source.id) ? action.message.source.id : ''
                },
                client_res: action.message.client_res,
                ts: action.message.ts,
                resolved: action.message.resolved,
                parent: action.message.parent,
                flags: action.message.flags ? action.message.flags : {}
            };
        case LOAD_MESSAGE:
            return {...state,
                data: state.data
            };
        default:
            return state;
    }
}