const dateHelper = require('../../helpers/date');
const getMonthlySlackTeams = (messages) =>
  new Promise((resolve, reject) => {
    messages.aggregate([
      {
        $match: {
          ts: {
            $gt: new Date(new Date() - 365 * 24 * 3600 * 1000),
          },
          'source.origin': 'slack',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$ts' },
            month: { $month: '$ts' },
            team: '$source.org',
          },
        },
      },
        { $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month',
          },
          count: { $sum: 1 },
        },
     },
    ], (err, result) => {
      if (err) { reject(err); return; }
      const months = result.map(month =>
        ({
          idString: `${dateHelper.months[month._id.month]} ${month._id.year}`,
          idNumber: new Date(month._id.year, month._id.month - 1, 1),
          teams: month.count,
        }));
      resolve(months);
    });
  });

module.exports = getMonthlySlackTeams;
