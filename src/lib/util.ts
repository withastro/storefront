/** Returns the given value if it is non-nullish, otherwise throws an error. */
export function unwrap<T>(value: T, message?: string): NonNullable<T> {
	if (value == null) {
		const error = new Error(
			message || `Expected a non-null value, but got: ${safeStringify(value)}`,
		);
		Error.captureStackTrace(error, unwrap);
		throw error;
	}
	return value;
}

/** Attempts to stringify a value, but falls back to a string representation if it fails. */
function safeStringify(value: unknown): string {
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

export function clamp(num: number, lower: number, upper: number) {
	return Math.max(lower, Math.min(num, upper));
}
