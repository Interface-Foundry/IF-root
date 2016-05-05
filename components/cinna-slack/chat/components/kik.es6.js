import {preProcess} from './io';

/**
 * process the input from kik client through iokip.preProcess
 * @param  {Object} payload   input from kik client
 * @return {Promise}
 */
function processInput(payload) {
  return new Promise((resolve, reject) => {
    const it = 'works';
    resolve({it});
  });
}

/**
 * global handler for input from kik clients
 * @param  {Object} req   request object from express
 * @param  {Object} res   response object from express
 * @return {Promise}
 */
export default function handleInputFromKik(req, res) {
  // send Bad Request if no payload is defined
  if (!req.body || req.body.payload === undefined) return res.sendStatus(400);

  // look, an eslint warning!
  console.log('foo!');

  return processInput(req.body.payload)
    .then((payload) => res.send({payload}))
    .catch((error) => res.status(error.status || 500).send({error: error.message}));
}
