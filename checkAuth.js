const checkAuth = (req, callback) => {
	if (req.headers.authorization) {
		if (req.headers.authorization.startsWith('Bearer ')) {
			const userId = parseInt(
				req.headers.authorization.slice('Bearer '.length)
			);
			callback(userId);
		} else {
			throw new Error('Authorization should be in the form of a bearer token');
		}
	} else {
		throw new Error('Authorization required');
	}
};

export { checkAuth }
