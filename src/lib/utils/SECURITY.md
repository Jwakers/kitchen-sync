# Security Measures

## SSRF Protection

This application implements comprehensive Server-Side Request Forgery (SSRF) protection for all server-side URL fetching operations.

### Implementation

The `secure-fetch.ts` utility provides URL validation and secure fetching capabilities that prevent SSRF attacks by:

1. **Protocol Validation**: Only `http:` and `https:` protocols are allowed
2. **DNS Resolution**: Resolves hostnames to IP addresses before making requests
3. **IP Range Blocking**: Blocks requests to:
   - Private IPv4 ranges (RFC1918): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
   - Loopback addresses: 127.0.0.0/8 (IPv4), ::1 (IPv6)
   - Link-local addresses: 169.254.0.0/16 (IPv4), fe80::/10 (IPv6)
   - IPv6 unique local addresses: fc00::/7
   - Multicast addresses: 224.0.0.0/4 (IPv4), ff00::/8 (IPv6)
   - Carrier-grade NAT: 100.64.0.0/10
   - Reserved and broadcast addresses
4. **Hostname Blocking**: Blocks common localhost aliases (localhost, localhost.localdomain, etc.)
5. **IPv4-mapped IPv6**: Detects and validates IPv4 addresses embedded in IPv6 format

### Usage

#### Validate URL Only

```typescript
import { validateUrlForSSRF } from "@/lib/utils/secure-fetch";

const validation = await validateUrlForSSRF(userProvidedUrl);
if (!validation.valid) {
  console.error(`Security check failed: ${validation.reason}`);
  return;
}

// Use validation.url for the fetch
const response = await fetch(validation.url.toString());
```

#### Secure Fetch Wrapper

```typescript
import { secureFetch } from "@/lib/utils/secure-fetch";

try {
  // This will automatically validate and throw if the URL is unsafe
  const response = await secureFetch(userProvidedUrl, {
    headers: { "User-Agent": "MyApp/1.0" },
  });
  const data = await response.text();
} catch (error) {
  // Error will contain the security violation reason
  console.error(error);
}
```

### Protected Endpoints

The following server actions are protected against SSRF:

1. **Recipe Import from URL** (`parse-recipe.ts`)
   - Validates recipe site URLs before fetching
   - Prevents access to internal services

2. **Recipe Schema Scraping** (`get-recipe-schema.ts`)
   - Validates URLs before scraping schema.org data
   - Protects against internal network scanning

3. **Image Fetching** (`fetch-image.ts`)
   - Validates image URLs before downloading
   - Prevents access to internal image services or metadata endpoints

### Testing SSRF Protection

#### Blocked Requests (should fail)

```typescript
// These URLs will be blocked:
await validateUrlForSSRF("file:///etc/passwd"); // Invalid protocol
await validateUrlForSSRF("http://localhost/admin"); // Localhost hostname
await validateUrlForSSRF("http://127.0.0.1/internal"); // Loopback IP
await validateUrlForSSRF("http://192.168.1.1/config"); // Private network
await validateUrlForSSRF("http://169.254.169.254/metadata"); // AWS metadata
await validateUrlForSSRF("http://[::1]/admin"); // IPv6 loopback
await validateUrlForSSRF("http://[fe80::1]/local"); // IPv6 link-local
```

#### Allowed Requests (should succeed)

```typescript
// These URLs will be allowed:
await validateUrlForSSRF("https://www.example.com/recipe");
await validateUrlForSSRF("http://recipes.example.org/api");
```

### Security Considerations

1. **DNS Rebinding**: This implementation resolves DNS at the time of validation. For highly sensitive applications, consider implementing DNS pinning or re-validation closer to the actual fetch.

2. **Time-of-Check Time-of-Use (TOCTOU)**: There's a small window between DNS resolution and the actual fetch. For maximum security, consider using a proxy that enforces IP-based filtering.

3. **Domain Allowlisting**: Currently, all public domains are allowed. For stricter control, implement a domain allowlist in the configuration.

4. **Rate Limiting**: Consider implementing rate limiting on URL fetching endpoints to prevent abuse.

### Maintenance

When adding new server-side URL fetching functionality:

1. Always use `validateUrlForSSRF()` before any external fetch
2. Never trust user-supplied URLs without validation
3. Consider using `secureFetch()` wrapper for convenience
4. Document the security measures in code comments
5. Test with various SSRF payloads to ensure protection

### References

- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [RFC 1918 - Address Allocation for Private Internets](https://tools.ietf.org/html/rfc1918)
- [RFC 3927 - Dynamic Configuration of IPv4 Link-Local Addresses](https://tools.ietf.org/html/rfc3927)
- [RFC 4193 - Unique Local IPv6 Unicast Addresses](https://tools.ietf.org/html/rfc4193)
