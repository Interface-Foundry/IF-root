import moment from 'moment'

export const timeFromDate = date => {
	if(moment().diff(date, 'days') === 0) {
		if(moment().diff(date, 'hours') === 0) {
			if(moment().diff(date, 'minutes') === 0)
				return `Just now`

			return `${moment().diff(date, 'minutes')} minutes ago`
		}

		return `${moment().diff(date, 'hours')} hours ago`
	}

	return `${moment().diff(date, 'days')} days ago`
}