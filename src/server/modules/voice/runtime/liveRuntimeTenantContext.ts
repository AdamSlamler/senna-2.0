export type TenantScope = {
  tenantId: string;
  businessId: string;
  locationId: string;
};

export function assertSameTenantScope(
  expected: TenantScope,
  actual: TenantScope
): void {
  if (expected.tenantId !== actual.tenantId) {
    throw new Error('Cross-tenant access denied');
  }

  if (expected.businessId !== actual.businessId) {
    throw new Error('Cross-business access denied');
  }

  if (expected.locationId !== actual.locationId) {
    throw new Error('Cross-location access denied');
  }
}
