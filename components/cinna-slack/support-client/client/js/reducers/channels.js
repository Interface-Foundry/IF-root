import {
    ADD_CHANNEL, RECEIVE_CHANNEL, LOAD_CHANNELS, LOAD_CHANNELS_SUCCESS, LOAD_CHANNELS_FAIL, REMOVE_CHANNEL, RESOLVE_CHANNEL
}
from '../constants/ActionTypes';

import indexOf from 'lodash/array/indexOf'
import find from 'lodash/collection/find'

const initialState = {
    loaded: false,
    data: []
};

export default function channels(state = initialState, action) {
    switch (action.type) {
        case ADD_CHANNEL:
            if (state.data.filter(channel => channel.name === action.channel.name).length !== 0) {
                return state;
            }
            return {...state,
                data: [...state.data, {
                    name: action.channel.name,
                    id: action.channel.id,
                    resolved: action.channel.resolved
                    // (state.data.length === 0) ? 0 : state.data[state.data.length - 1].id + 1
                }]
            };
        case RECEIVE_CHANNEL:
            if (state.data.filter(channel => channel.name === action.channel.name).length !== 0) {
                return state;
            }
            return {...state,
                data: [...state.data, {
                    name: action.channel.name,
                    id: action.channel.id,
                    resolved: action.channel.resolved
                }]
            };
        case LOAD_CHANNELS:
            return {...state,
                loading: true
            };
        case LOAD_CHANNELS_SUCCESS:
            return {...state,
                loading: false,
                    loaded: true,
                    data: action.result
            };
        case LOAD_CHANNELS_FAIL:
            return {...state,
                loading: false,
                    loaded: false,
                    error: action.error,
                    data: [...state.data]
            };
        case REMOVE_CHANNEL:
            return {...state,
                data: [...(state.data.filter(channel => channel.name !== action.channel.name))]
            };
        case RESOLVE_CHANNEL:
            var index = indexOf([...state.data], find([...state.data], {name: action.channel.name }));
            [...state.data][index]['resolved'] = action.channel.resolved
            return {...state,
                loading: false,
                loaded: true,
                data: [...state.data]
            };
        default:
            return state;
    }
}