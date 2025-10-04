import { validateUrlForSSRF } from "./secure-fetch";

/**
 * Test suite for SSRF protection
 * Run with: npx tsx src/lib/utils/secure-fetch.test.ts
 */

async function runTests() {
  console.log("🧪 Testing SSRF Protection\n");

  const tests = [
    // Should FAIL - Invalid protocols
    {
      url: "file:///etc/passwd",
      shouldPass: false,
      description: "file:// protocol",
    },
    {
      url: "ftp://internal.server.com/file",
      shouldPass: false,
      description: "ftp:// protocol",
    },
    {
      url: "gopher://localhost:70",
      shouldPass: false,
      description: "gopher:// protocol",
    },

    // Should FAIL - Localhost by hostname
    {
      url: "http://localhost/admin",
      shouldPass: false,
      description: "localhost hostname",
    },
    {
      url: "https://localhost.localdomain/api",
      shouldPass: false,
      description: "localhost.localdomain hostname",
    },

    // Should FAIL - Loopback IPs
    {
      url: "http://127.0.0.1/internal",
      shouldPass: false,
      description: "IPv4 loopback (127.0.0.1)",
    },
    {
      url: "http://127.1.1.1/api",
      shouldPass: false,
      description: "IPv4 loopback range (127.x.x.x)",
    },
    {
      url: "http://[::1]/admin",
      shouldPass: false,
      description: "IPv6 loopback (::1)",
    },

    // Should FAIL - Private networks (RFC1918)
    {
      url: "http://10.0.0.1/config",
      shouldPass: false,
      description: "Private Class A (10.0.0.0/8)",
    },
    {
      url: "http://172.16.0.1/api",
      shouldPass: false,
      description: "Private Class B (172.16.0.0/12)",
    },
    {
      url: "http://192.168.1.1/router",
      shouldPass: false,
      description: "Private Class C (192.168.0.0/16)",
    },

    // Should FAIL - Link-local
    {
      url: "http://169.254.169.254/latest/meta-data",
      shouldPass: false,
      description: "IPv4 link-local / AWS metadata",
    },
    {
      url: "http://[fe80::1]/local",
      shouldPass: false,
      description: "IPv6 link-local",
    },

    // Should FAIL - Carrier-grade NAT
    {
      url: "http://100.64.0.1/internal",
      shouldPass: false,
      description: "Carrier-grade NAT (100.64.0.0/10)",
    },

    // Should FAIL - Multicast
    {
      url: "http://224.0.0.1/multicast",
      shouldPass: false,
      description: "IPv4 multicast",
    },

    // Should FAIL - Reserved
    {
      url: "http://240.0.0.1/reserved",
      shouldPass: false,
      description: "IPv4 reserved range",
    },

    // Should FAIL - IPv6 unique local
    {
      url: "http://[fc00::1]/internal",
      shouldPass: false,
      description: "IPv6 unique local (fc00::/7)",
    },
    {
      url: "http://[fd00::1]/internal",
      shouldPass: false,
      description: "IPv6 unique local (fd00::/7)",
    },

    // Should PASS - Public domains
    {
      url: "https://www.google.com",
      shouldPass: true,
      description: "Public HTTPS URL",
    },
    {
      url: "http://example.com/page",
      shouldPass: true,
      description: "Public HTTP URL",
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await validateUrlForSSRF(test.url);
      const testPassed =
        (test.shouldPass && result.valid) ||
        (!test.shouldPass && !result.valid);

      if (testPassed) {
        console.log(`✅ ${test.description}`);
        if (!result.valid) {
          console.log(`   Blocked: ${result.reason}`);
        }
        passed++;
      } else {
        console.log(`❌ ${test.description}`);
        console.log(
          `   Expected: ${test.shouldPass ? "PASS" : "FAIL"}, Got: ${result.valid ? "PASS" : "FAIL"}`
        );
        if (result.reason) {
          console.log(`   Reason: ${result.reason}`);
        }
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.description}`);
      console.log(
        `   Error: ${error instanceof Error ? error.message : String(error)}`
      );
      failed++;
    }
    console.log();
  }

  console.log("\n" + "=".repeat(60));
  console.log(`Total: ${tests.length} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("=".repeat(60));

  return failed === 0;
}

// Run tests if executed directly
if (require.main === module) {
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test suite error:", error);
      process.exit(1);
    });
}

export { runTests };
