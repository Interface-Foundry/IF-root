import {
    ADD_MESSAGE, RECEIVE_MESSAGE, LOAD_MESSAGES, LOAD_MESSAGES_SUCCESS, LOAD_MESSAGES_FAIL, SET_MESSAGE_PROPERTY
}
from '../constants/ActionTypes';

import indexOf from 'lodash/array/indexOf'
import find from 'lodash/collection/find'

const initialState = {
    loaded: false,
    data: []
};
export default function messages(state = initialState, action) {
    switch (action.type) {
        case ADD_MESSAGE:
            return {...state,
                data: [...state.data, {
                    id: (state.data.length === 0) ? 0 : parseInt(state.data[state.data.length - 1].id + 1),
                    incoming: true,
                    msg: action.message.msg,
                    tokens: action.message.tokens,
                    bucket: action.message.bucket,
                    action: action.message.action,
                    amazon: action.message.amazon,
                    dataModify: {
                      type: (action.message.dataModify && action.message.dataModify.type) ? action.message.dataModify.type : '' ,
                      val: (action.message.dataModify && action.message.dataModify.val) ? action.message.dataModify.val : [],
                      param: (action.message.dataModify && action.message.dataModify.param) ? action.message.dataModify.param : ''
                    },
                    source: {
                        origin: (action.message.source && action.message.source.origin) ? action.message.source.origin : 'socketio', 
                        channel: (action.message.source && action.message.source.channel) ? action.message.source.channel : '',
                        org: (action.message.source && action.message.source.org) ? action.message.source.org : 'kip',
                        id: (action.message.source && action.message.source.id) ? action.message.source.id : ''
                    },
                    client_res: {
                      msg: action.message.client_res
                    },
                    ts: action.message.ts,
                    resolved: action.message.resolved,
                    parent: action.message.parent,
                    flags: action.message.flags ? action.message.flags : {}
                }]
            };
        case RECEIVE_MESSAGE:
            return {...state,
               data: [...state.data, {
                    _id: action.message._id,
                    id: (state.data.length === 0) ? 0 : parseInt(state.data[state.data.length - 1].id + 1),
                    incoming: true,
                    msg: action.message.msg,
                    tokens: action.message.tokens,
                    bucket: action.message.bucket,
                    action: action.message.action,
                    amazon: action.message.amazon,
                    dataModify: {
                      type: (action.message.dataModify && action.message.dataModify.type) ? action.message.dataModify.type : '' ,
                      val: (action.message.dataModify && action.message.dataModify.val) ? action.message.dataModify.val : [],
                      param: (action.message.dataModify && action.message.dataModify.param) ? action.message.dataModify.param : ''
                    },
                    source: {
                        origin: (action.message.source && action.message.source.origin) ? action.message.source.origin : 'socketio', 
                        channel: (action.message.source && action.message.source.channel) ? action.message.source.channel : '',
                        org: (action.message.source && action.message.source.org) ? action.message.source.org : 'kip',
                        id: (action.message.source && action.message.source.id) ? action.message.source.id : ''
                    },
                    client_res: {
                      msg: action.message.client_res
                    },
                    ts: action.message.ts,
                    resolved: action.message.resolved,
                    parent: action.message.parent,
                    flags: action.message.flags ? action.message.flags : {}
                }]
            };
        case LOAD_MESSAGES:
            return {...state,
                loading: true
            };
        case LOAD_MESSAGES_SUCCESS:
            return {...state,
                loading: false,
                    loaded: true,
                    data: [...action.json]
            };
        case LOAD_MESSAGES_FAIL:
            return {...state,
                loading: false,
                    loaded: false,
                    error: action.error,
                    data: [...state.data]
            };
         case SET_MESSAGE_PROPERTY:
            var index = indexOf([...state.data], find([...state.data], {source: { channel : action.identifier.channel} }));
            // console.log('Inside messages reducer: channel: ', action.identifier.channel, ' state.data: ',[...state.data])
            // console.log('In messages: original array->', [...state.data])
            // var copy = Object.assign({}, [...state.data][index]);
            action.identifier.properties.forEach(function(propertyObj) {
                for (var key in propertyObj) {
                [...state.data][index][key] = propertyObj[key]
                }
            })
            // console.log('LENGTH: ',[state.data].length)
            // copy.id = [state.data].length
            // console.log('COPY: ',copy)
            // console.log('modified: ',[...state.data])
           return {...state,
                    loading: false,
                    loaded: true,
                    data: [...state.data]
            };
        default:
            return state;
    }
}