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
        channel: 'Lobby',
        org: 'default',
        id: 'Lobby'
    },
    client_res: [],
    ts: Date.now(),
    thread: {
            id: 'default',
            sequence: 0,
            isOpen: false,
            ticket: {
                id: 'default',
                isOpen: false
            },
            parent: {
                isParent: false,
                id: 'default'
            }
        },
    urlShorten: null,
    searchSelect: []
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
              thread: {
                    id: action.message.thread.id,
                    sequence: action.message.thread.sequence,
                    isOpen: action.message.thread.isOpen,
                    ticket: {
                        id: (action.message.thread.ticket && action.message.thread.ticket.id) ? action.message.thread.ticket.id : null, 
                         isOpen: (action.message.thread.ticket && action.message.thread.ticket.isOpen) ? action.message.thread.ticket.isOpen : null
                    },
                    parent: {
                        isParent: action.message.thread.parent.isParent,
                        id: action.message.parent && action.message.parent.id ? action.message.parent.id : null
                    }
                },
                urlShorten: action.message.thread.urlShorten,
                flags: action.message.flags ? action.message.flags : {},
                searchSelect: action.message.searchSelect ? action.message.searchSelect : []
            };
        case LOAD_MESSAGE:
            return {...state,
                data: state.data
            };
        default:
            return state;
    }
}