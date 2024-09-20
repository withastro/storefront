export function formatOneLineAddress(address: {
	line1?: string | null;
	line2?: string | null;
	city?: string | null;
	province?: string | null;
	postal?: string | null;
}) {
	const parts = [address.line1, address.line2, address.city, address.province, address.postal];
	return parts.filter(Boolean).join(', ');
}
