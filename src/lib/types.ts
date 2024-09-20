import type { KeysOfUnion, Simplify } from 'type-fest';

export type EmptyObject = Record<string, never>;

/**
 * Takes the unique properties of every union member, then sets those properties in other members to
 * undefined. This can make objects easier to destructure and work with in general, while still
 * being type-safe.
 *
 * @example
 * 	type State<T> = UndefinedUniqueKeys<
 * 		{ type: 'success'; data: T } | { type: 'error'; error: Error }
 * 	>;
 *
 * 	// is the same as:
 * 	type State<T> =
 * 		| { type: 'success'; data: T; error?: undefined }
 * 		| { type: 'error'; data?: undefined; error: Error };
 */
export type UndefinedUniqueKeys<
	Input,
	Keys extends PropertyKey = KeysOfUnion<Input>,
> = Input extends object
	? Simplify<Input & { [Key in Exclude<Keys, keyof Input>]?: undefined }>
	: Input;

/**
 * Like `Omit`, but forces the key to be a part of the object, and also works on union types
 *
 * @example
 * 	type A = Omit<{ a: string } | { b: number }, 'a'>; // {}
 * 	type B = StrictOmit<{ a: string } | { b: number }, 'a'>; // {} | { b: number }
 */
export type StrictOmit<Input, Keys extends KeysOfUnion<Input>> = Simplify<
	Input extends object ? Omit<Input, Keys> : Input
>;
