/**
 * Checks if an object has specific fields defined with correct values.
 * If the field is an object call validateFields for the inner object.
 *
 * @param object Object to inspect
 * @param fields Object of fields that describes the field the object must have
 * @param field.type The typeof result of the value of the field
 * @param field.enum A possible value the field must have
 * @param field.default A default value to set if the field is not defined or has an incorrect value.
 * If you wish to have undefined or null value for the field set this to undefined or null
 * @returns An empty string if there is no error or a string with an error message
 */
export const validateFields = (
	object: object,
	fields: {
		[field: string]: { type?: 'string' | 'number' | 'boolean'; enum?: Set<any>; default?: any };
	}
): string => {
	const error: string[] = [];
	Object.entries(fields).forEach(value => {
		const [field, info] = value;
		const errorLength = error.length;
		Object.freeze(info);
		if (!(field in object)) {
			error.push(`'${field}' is not specified`);
		} else if (object[field] === null || object[field] === undefined) {
			error.push(`'${field}' value is not valid`);
		} else {
			if (info.type) {
				if (typeof object[field] !== info.type) {
					error.push(`'${field}' value must be of type ${info.type}`);
				}
			}
			if (info.enum) {
				if (!info.enum.has(object[field])) {
					error.push(
						`'${field}' must have a value of '${Array.from(info.enum).join(' or ')}'`
					);
				}
			}
		}
		if ('default' in info) {
			if (error.length > errorLength) {
				error.length = errorLength;
				object[field] = info.default;
			}
		}
	});
	return error.join(', ');
};
