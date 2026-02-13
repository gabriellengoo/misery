const middleware = {}

middleware['preorderRedirect'] = require('../middleware/preorderRedirect.js')
middleware['preorderRedirect'] = middleware['preorderRedirect'].default || middleware['preorderRedirect']

export default middleware
