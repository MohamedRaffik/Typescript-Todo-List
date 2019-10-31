export const validateFields = (object: object, fields: string[]): string => {
	let error = '';
	fields.forEach(field => {
		if (!(field in object)) {
			error = error || `"${field}" value is not specified`;
		} else if (object[field] === null || object[field] === undefined) {
			error = error || `"${field}" value is not valid`;
		}
	});
	return error;
};
