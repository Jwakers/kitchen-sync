import { promises as dns } from "dns";
import { isIP } from "net";

/**
 * SSRF Protection Utility
 * Validates URLs and IP addresses to prevent Server-Side Request Forgery attacks
 */

// Private and reserved IP ranges that should be blocked
const BLOCKED_IP_RANGES = [
  // IPv4 Private ranges (RFC1918)
  { start: "10.0.0.0", end: "10.255.255.255", name: "Private (Class A)" },
  { start: "172.16.0.0", end: "172.31.255.255", name: "Private (Class B)" },
  { start: "192.168.0.0", end: "192.168.255.255", name: "Private (Class C)" },

  // IPv4 Loopback (127.0.0.0/8)
  { start: "127.0.0.0", end: "127.255.255.255", name: "Loopback" },

  // IPv4 Link-local (169.254.0.0/16)
  { start: "169.254.0.0", end: "169.254.255.255", name: "Link-local" },

  // IPv4 Multicast (224.0.0.0/4)
  { start: "224.0.0.0", end: "239.255.255.255", name: "Multicast" },

  // IPv4 Reserved (240.0.0.0/4)
  { start: "240.0.0.0", end: "255.255.255.255", name: "Reserved" },

  // IPv4 Broadcast
  { start: "255.255.255.255", end: "255.255.255.255", name: "Broadcast" },

  // IPv4 This network (0.0.0.0/8)
  { start: "0.0.0.0", end: "0.255.255.255", name: "This network" },

  // IPv4 Carrier-grade NAT (100.64.0.0/10)
  { start: "100.64.0.0", end: "100.127.255.255", name: "Carrier-grade NAT" },
];

// Blocked hostnames (case-insensitive)
const BLOCKED_HOSTNAMES = [
  "localhost",
  "localhost.localdomain",
  "broadcasthost",
];

/**
 * Convert IPv4 address to a number for range comparison
 */
function ipv4ToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

/**
 * Check if an IPv4 address is in a blocked range
 */
function isIPv4InBlockedRange(ip: string): {
  blocked: boolean;
  reason?: string;
} {
  const ipNum = ipv4ToNumber(ip);

  for (const range of BLOCKED_IP_RANGES) {
    const startNum = ipv4ToNumber(range.start);
    const endNum = ipv4ToNumber(range.end);

    if (ipNum >= startNum && ipNum <= endNum) {
      return {
        blocked: true,
        reason: `IP address is in ${range.name} range (${range.start} - ${range.end})`,
      };
    }
  }

  return { blocked: false };
}

/**
 * Check if an IPv6 address is in a blocked range
 */
function isIPv6Blocked(ip: string): { blocked: boolean; reason?: string } {
  const lower = ip.toLowerCase();

  // Loopback (::1)
  if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") {
    return { blocked: true, reason: "IPv6 loopback address (::1)" };
  }

  // Link-local (fe80::/10)
  if (
    lower.startsWith("fe80:") ||
    lower.startsWith("fe8") ||
    lower.startsWith("fe9") ||
    lower.startsWith("fea") ||
    lower.startsWith("feb")
  ) {
    return { blocked: true, reason: "IPv6 link-local address (fe80::/10)" };
  }

  // Unique local addresses (fc00::/7) - private IPv6
  if (lower.startsWith("fc") || lower.startsWith("fd")) {
    return { blocked: true, reason: "IPv6 unique local address (fc00::/7)" };
  }

  // Multicast (ff00::/8)
  if (lower.startsWith("ff")) {
    return { blocked: true, reason: "IPv6 multicast address (ff00::/8)" };
  }

  // Unspecified address (::)
  if (lower === "::" || lower === "0:0:0:0:0:0:0:0") {
    return { blocked: true, reason: "IPv6 unspecified address (::)" };
  }

  // IPv4-mapped IPv6 addresses (::ffff:0:0/96)
  if (lower.includes("::ffff:")) {
    const ipv4Part = lower.split("::ffff:")[1];
    if (ipv4Part) {
      // Extract IPv4 address from the mapped format
      const match = ipv4Part.match(/(\d+\.\d+\.\d+\.\d+)/);
      if (match) {
        const ipv4Check = isIPv4InBlockedRange(match[1]);
        if (ipv4Check.blocked) {
          return {
            blocked: true,
            reason: `IPv4-mapped IPv6 address with blocked IPv4: ${ipv4Check.reason}`,
          };
        }
      }
    }
  }

  return { blocked: false };
}

/**
 * Check if an IP address (v4 or v6) should be blocked
 */
function isIPBlocked(ip: string): { blocked: boolean; reason?: string } {
  const version = isIP(ip);

  if (version === 4) {
    return isIPv4InBlockedRange(ip);
  } else if (version === 6) {
    return isIPv6Blocked(ip);
  }

  return { blocked: false };
}

/**
 * Resolve a hostname to its IP addresses and check if any are blocked
 */
async function validateHostname(hostname: string): Promise<{
  valid: boolean;
  reason?: string;
  ips?: string[];
}> {
  // Check if hostname is in the blocked list
  if (BLOCKED_HOSTNAMES.includes(hostname.toLowerCase())) {
    return {
      valid: false,
      reason: `Hostname '${hostname}' is blocked`,
    };
  }

  // If the hostname is already an IP address, check it directly
  if (isIP(hostname)) {
    const check = isIPBlocked(hostname);
    if (check.blocked) {
      return { valid: false, reason: check.reason, ips: [hostname] };
    }
    return { valid: true, ips: [hostname] };
  }

  try {
    // Resolve hostname to IPv4 addresses
    const ipv4Addresses = await dns
      .resolve4(hostname)
      .catch(() => [] as string[]);

    // Resolve hostname to IPv6 addresses
    const ipv6Addresses = await dns
      .resolve6(hostname)
      .catch(() => [] as string[]);

    const allIPs = [...ipv4Addresses, ...ipv6Addresses];

    if (allIPs.length === 0) {
      return {
        valid: false,
        reason: `Unable to resolve hostname '${hostname}' to any IP addresses`,
      };
    }

    // Check each resolved IP
    for (const ip of allIPs) {
      const check = isIPBlocked(ip);
      if (check.blocked) {
        return {
          valid: false,
          reason: `Hostname '${hostname}' resolves to blocked IP ${ip}: ${check.reason}`,
          ips: allIPs,
        };
      }
    }

    return { valid: true, ips: allIPs };
  } catch (error) {
    return {
      valid: false,
      reason: `DNS resolution failed for '${hostname}': ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Validate a URL for SSRF protection
 * Returns validation result with details about why it failed (if it did)
 */
export async function validateUrlForSSRF(urlString: string): Promise<{
  valid: boolean;
  reason?: string;
  url?: URL;
}> {
  // Parse URL
  let url: URL;
  try {
    url = new URL(urlString);
  } catch (error) {
    return {
      valid: false,
      reason: `Invalid URL format: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }

  // 1. Validate protocol - only http and https allowed
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      valid: false,
      reason: `Invalid protocol '${url.protocol}'. Only http: and https: are allowed`,
    };
  }

  // 2. Validate hostname
  const hostnameCheck = await validateHostname(url.hostname);
  if (!hostnameCheck.valid) {
    return {
      valid: false,
      reason: hostnameCheck.reason,
    };
  }

  return { valid: true, url };
}

/**
 * Secure fetch wrapper that validates URLs before fetching
 * Throws an error if the URL is invalid or potentially dangerous
 */
export async function secureFetch(
  urlString: string,
  options?: RequestInit
): Promise<Response> {
  const validation = await validateUrlForSSRF(urlString);

  if (!validation.valid) {
    throw new Error(`SSRF Protection: ${validation.reason}`);
  }

  // Perform the fetch with the validated URL
  return fetch(validation.url!.toString(), options);
}
