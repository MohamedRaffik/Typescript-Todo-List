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
        if (!(field in object)) {
            error.push(`'${field}' is not specified`);
        } else if (object[field] === null || object[field] === undefined) {
            error.push(`'${field}' value is not valid`);
        } else {
            if (info.type) {
                if (typeof object[field] !== info.type) {
                    error.push(`'${field}' value must be of type '${info.type}'`);
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

export const validateArray = (
    array: any[],
    info: { type: 'string' | 'number' | 'boolean'; enum?: Set<any>; removeDuplicates?: boolean }
) => {
    const error: string[] = [];
    array.forEach(value => {
        if (typeof value !== info.type) {
            if (error.length === 0) {
                error.push(`Values of '[ ${array.join(', ')} ]' must be of type '${info.type}'`);
            }
        }
        if (info.enum) {
            if (info.enum.has(value)) {
                info.enum.delete(value);
            }
        }
    });
    if (info.enum) {
        if (info.enum.size) {
            error.push(
                `'[ ${array.join(', ')} ]' must include these values '[ ${Array.from(
                    info.enum
                ).join(', ')} ]'`
            );
        }
    }
    if (info.removeDuplicates) {
        const newArr = new Set(array);
        array.splice(0, array.length);
        array.push(...Array.from(newArr));
    }
    return error.join(', ');
};
