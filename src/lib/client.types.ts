export type Product = {
	id: string;
	name: string;
	slug: string;
	tagline: string | null;
	/** A longer description of the product. */
	description: string | null;
	/** The price of the product in cents. */
	price: number;
	/** The discount amount in cents. Should be subtracted from the price to get the discounted price. */
	discount: number;
	stock: number;
	imageUrl: string;
	images: Array<{
		id: string;
		url: string;
	}>;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	collectionIds?: Array<string>;
	variations?: Array<{
		id: string;
		name: string;
		options: Array<{
			id: string;
			caption: string;
		}>;
		defaultOptionId?: string | null;
	}>;
};

export type Collection = {
	id: string;
	name: string;
	description: string;
	slug: string | null;
	imageUrl?: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

export type Customer = {
	id: string;
	name: string;
	email: string;
	/** The location of the customer as a single line address. */
	location: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

export type Address = {
	line1: string;
	line2: string;
	city: string;
	province: string;
	country: string;
	postal: string;
	phone: string | null;
	company: string | null;
	firstName: string | null;
	lastName: string | null;
} | null;

export type Order = {
	id: string;
	customerId: string;
	customerName: string;
	number: number;
	totalPrice: number;
	lineItems: Array<{
		id: string;
		quantity: number;
		productId: string;
	}>;
	billingAddress: Address;
	shippingAddress: Address;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

export type GetProductsData = {
	query?: {
		/** Only return products that are active or inactive */
		active?: boolean;
		/** Only return products belonging to a given collection id */
		collectionId?: string;
		/** Only return products with the given ids */
		ids?: Array<string> | string;
		limit?: number;
		next?: string;
		order?: 'asc' | 'desc';
		/** Search for products by name or description */
		search?: string;
		sort?: 'name' | 'price' | 'updatedAt';
	};
};

export type GetProductsResponse = {
	items: Array<Product>;
	next: string | null;
};

export type GetProductsError = unknown;

export type GetProductByIdData = {
	path: {
		/** The ID of the product to retrieve */
		id: string;
	};
};

export type GetProductByIdResponse = Product;

export type GetProductByIdError = {
	error: string;
};

export type GetCollectionsData = {
	query?: {
		limit?: number;
		next?: string;
	};
};

export type GetCollectionsResponse = {
	items: Array<Collection>;
	next: string | null;
};

export type GetCollectionsError = unknown;

export type GetCollectionByIdData = {
	path: {
		/** The ID of the collection to retrieve */
		id: string;
	};
	query?: {
		expand?: 'products';
	};
};

export type GetCollectionByIdResponse = Collection & {
	products: Array<Product>;
};

export type GetCollectionByIdError = {
	error: 'not-found';
};

export type CreateCustomerData = {
	body?: {
		id?: string;
		name: string;
		email: string;
		/** The location of the customer as a single line address. */
		location: string;
	};
};

export type CreateCustomerResponse = Customer;

export type CreateCustomerError = unknown;

export type CreateOrderData = {
	body?: {
		customerId: string;
		customerName: string;
		totalPrice: number;
		lineItems: Array<{
			productId: string;
			quantity: number;
		}>;
		shippingAddress?: {
			line1: string;
			line2: string;
			city: string;
			province: string;
			country: string;
			postal: string;
			phone?: string;
			company?: string;
			firstName?: string;
			lastName?: string;
		};
		billingAddress?: {
			line1: string;
			line2: string;
			city: string;
			province: string;
			country: string;
			postal: string;
			phone?: string;
			company?: string;
			firstName?: string;
			lastName?: string;
		};
	};
};

export type CreateOrderResponse = Order;

export type CreateOrderError = unknown;

export type GetOrderByIdData = {
	path: {
		/** The ID of the order to retrieve */
		id: string;
	};
};

export type GetOrderByIdResponse = Order;

export type GetOrderByIdError = {
	error: 'not-found';
};
