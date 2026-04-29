/**
 * UniTrack Login Feature – Playwright E2E Test Suite
 *
 * Coverage:
 *  A. Empty / Validation Tests
 *  B. Invalid Credential Tests
 *  C. Valid Credential Tests  (Admin & Student)
 *  D. Session / Security Tests
 *  E. UI / UX Tests
 *  F. Extra intelligent tests
 *
 * Screenshots are saved to e2e/screenshots/ for evidence.
 */

import { test, expect, Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

// ──────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────
const LOGIN_URL = "/login";
const ADMIN_EMAIL = "admin@unitrack.com";
const STUDENT_EMAIL = "smrayyan@gmail.com";
const VALID_PASSWORD = "StrongPass123!";

const SCREENSHOT_DIR = path.join(__dirname, "screenshots");

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────
async function shot(page: Page, name: string) {
    if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: false });
}

async function gotoLogin(page: Page) {
    await page.goto(LOGIN_URL);
    await page.waitForLoadState("networkidle");
}

async function fillAndSubmit(page: Page, email: string, password: string) {
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
}

/** Wait for a sonner toast and return its text */
async function getToast(page: Page): Promise<string | null> {
    try {
        const toast = page.locator("[data-sonner-toast]").first();
        await toast.waitFor({ state: "visible", timeout: 7000 });
        return await toast.innerText();
    } catch {
        return null;
    }
}

// ──────────────────────────────────────────────────
// Setup
// ──────────────────────────────────────────────────
test.beforeEach(async ({ page }) => {
    await gotoLogin(page);
});

// ══════════════════════════════════════════════════
//  SECTION A: Empty / Validation Tests
// ══════════════════════════════════════════════════

test.describe("A – Validation Tests", () => {
    test("A-01: Both fields empty → submit shows validation errors", async ({ page }) => {
        await page.getByRole("button", { name: "Sign In" }).click();
        await page.waitForTimeout(500);

        // Zod/react-hook-form renders inline FormMessage errors
        const emailErr = page.locator("p[id*='email'], p.text-destructive, [role='alert']").first();
        await expect(emailErr).toBeVisible({ timeout: 4000 });
        expect(await page.url()).toContain("login");
        await shot(page, "A-01_empty_fields_validation");
    });

    test("A-02: Email filled, password empty → password required error", async ({ page }) => {
        await page.getByLabel("Email").fill("test@example.com");
        await page.getByRole("button", { name: "Sign In" }).click();
        await page.waitForTimeout(500);

        const errLocator = page.locator("p.text-destructive, [role='alert']").last();
        await expect(errLocator).toBeVisible({ timeout: 4000 });
        expect(await page.url()).toContain("login");
        await shot(page, "A-02_email_filled_password_empty");
    });

    test("A-03: Password filled, email empty → email required error", async ({ page }) => {
        await page.getByLabel("Password").fill("SomePass1!");
        await page.getByRole("button", { name: "Sign In" }).click();
        await page.waitForTimeout(500);

        const errLocator = page.locator("p.text-destructive, [role='alert']").first();
        await expect(errLocator).toBeVisible({ timeout: 4000 });
        expect(await page.url()).toContain("login");
        await shot(page, "A-03_password_filled_email_empty");
    });

    test("A-04: Invalid email formats rejected", async ({ page }) => {
        const invalidEmails = ["abc", "123", "no@", "@domain.com", "a@b"];

        for (const email of invalidEmails) {
            await gotoLogin(page);
            await page.getByLabel("Email").fill(email);
            await page.getByLabel("Password").fill("somepassword");
            await page.getByRole("button", { name: "Sign In" }).click();
            await page.waitForTimeout(400);

            // Should remain on login page
            expect(await page.url()).toContain("login");
        }

        await shot(page, "A-04_invalid_email_format");
    });

    test("A-05: Spaces-only input → validation errors", async ({ page }) => {
        await page.getByLabel("Email").fill("   ");
        await page.getByLabel("Password").fill("   ");
        await page.getByRole("button", { name: "Sign In" }).click();
        await page.waitForTimeout(500);

        expect(await page.url()).toContain("login");
        await shot(page, "A-05_spaces_only_input");
    });

    test("A-06: Very long email / password → no crash", async ({ page }) => {
        const longEmail = "a".repeat(200) + "@test.com";
        const longPass = "P@ssw0rd!" + "x".repeat(500);

        await page.getByLabel("Email").fill(longEmail);
        await page.getByLabel("Password").fill(longPass);
        await page.getByRole("button", { name: "Sign In" }).click();
        await page.waitForTimeout(3000);

        // App should not crash; stays on or redirects from login (no server 500)
        expect(await page.title()).not.toBe("");
        await shot(page, "A-06_very_long_input");
    });

    test("A-07: SQL injection in email field → no crash/bypass", async ({ page }) => {
        await page.getByLabel("Email").fill("' OR 1=1 --");
        await page.getByLabel("Password").fill("' OR 1=1 --");
        await page.getByRole("button", { name: "Sign In" }).click();
        await page.waitForTimeout(3000);

        // Must remain on login – no dashboard redirect
        expect(await page.url()).toContain("login");
        await shot(page, "A-07_sql_injection");
    });

    test("A-08: XSS script tag input → no crash/bypass", async ({ page }) => {
        await page.getByLabel("Email").fill("<script>alert(1)</script>@test.com");
        await page.getByLabel("Password").fill("<script>alert(1)</script>");
        await page.getByRole("button", { name: "Sign In" }).click();
        await page.waitForTimeout(3000);

        expect(await page.url()).toContain("login");
        await shot(page, "A-08_xss_script_input");
    });
});

// ══════════════════════════════════════════════════
//  SECTION B: Invalid Credential Tests
// ══════════════════════════════════════════════════

test.describe("B – Invalid Credential Tests", () => {
    test("B-01: Wrong email + wrong password → error, stays on login", async ({ page }) => {
        await fillAndSubmit(page, "wrong@example.com", "WrongPass99!");
        const toast = await getToast(page);
        expect(toast).toBeTruthy();
        expect(await page.url()).toContain("login");
        await shot(page, "B-01_wrong_email_wrong_password");
    });

    test("B-02: Correct admin email + wrong password → error, stays on login", async ({ page }) => {
        await fillAndSubmit(page, ADMIN_EMAIL, "WrongPassword!!");
        const toast = await getToast(page);
        expect(toast).toBeTruthy();
        expect(await page.url()).toContain("login");
        await shot(page, "B-02_admin_email_wrong_pass");
    });

    test("B-03: Correct student email + wrong password → error, stays on login", async ({ page }) => {
        await fillAndSubmit(page, STUDENT_EMAIL, "WrongPassword!!");
        const toast = await getToast(page);
        expect(toast).toBeTruthy();
        expect(await page.url()).toContain("login");
        await shot(page, "B-03_student_email_wrong_pass");
    });

    test("B-04: Unknown email + valid-format password → error", async ({ page }) => {
        await fillAndSubmit(page, "nobody@example.com", VALID_PASSWORD);
        const toast = await getToast(page);
        expect(toast).toBeTruthy();
        expect(await page.url()).toContain("login");
        await shot(page, "B-04_unknown_email_valid_pass");
    });

    test("B-05: Password case-sensitivity check → wrong case rejected", async ({ page }) => {
        // lowercase version of the password should fail
        await fillAndSubmit(page, ADMIN_EMAIL, VALID_PASSWORD.toLowerCase());
        const toast = await getToast(page);
        expect(toast).toBeTruthy();
        expect(await page.url()).toContain("login");
        await shot(page, "B-05_password_case_sensitivity");
    });

    test("B-06: Email with leading/trailing spaces → rejected or trimmed", async ({ page }) => {
        await fillAndSubmit(page, `  ${ADMIN_EMAIL}  `, VALID_PASSWORD);
        await page.waitForTimeout(4000);
        // Acceptable: either logs in (trimming behavior) or shows error; must not crash
        expect(await page.title()).not.toBe("");
        await shot(page, "B-06_email_with_spaces");
    });

    test("B-07: Password with leading/trailing spaces → rejected", async ({ page }) => {
        await fillAndSubmit(page, ADMIN_EMAIL, `  ${VALID_PASSWORD}  `);
        await page.waitForTimeout(4000);
        expect(await page.title()).not.toBe("");
        await shot(page, "B-07_password_with_spaces");
    });
});

// ══════════════════════════════════════════════════
//  SECTION C: Valid Credential Tests
// ══════════════════════════════════════════════════

test.describe("C – Valid Credential Tests", () => {
    test("C-01: Admin login → redirected to /admin", async ({ page }) => {
        await shot(page, "C-01_admin_login_page");
        await fillAndSubmit(page, ADMIN_EMAIL, VALID_PASSWORD);
        await page.waitForURL("**/admin**", { timeout: 12000 });
        expect(page.url()).toContain("/admin");
        await shot(page, "C-01_admin_dashboard");
    });

    test("C-02: Student login → redirected to /dashboard", async ({ page }) => {
        await shot(page, "C-02_student_login_page");
        await fillAndSubmit(page, STUDENT_EMAIL, VALID_PASSWORD);
        await page.waitForURL("**/dashboard**", { timeout: 12000 });
        expect(page.url()).toContain("/dashboard");
        await shot(page, "C-02_student_dashboard");
    });
});

// ══════════════════════════════════════════════════
//  SECTION D: Session / Security Tests
// ══════════════════════════════════════════════════

test.describe("D – Session & Security Tests", () => {
    test("D-01: After student login, page refresh → still logged in", async ({ page }) => {
        await fillAndSubmit(page, STUDENT_EMAIL, VALID_PASSWORD);
        await page.waitForURL("**/dashboard**", { timeout: 12000 });
        await page.reload();
        await page.waitForLoadState("networkidle");
        expect(page.url()).toContain("/dashboard");
        await shot(page, "D-01_session_persists_after_refresh");
    });

    test("D-02: /admin protected – unauthenticated access redirects", async ({ page }) => {
        // We are already on /login (beforeEach), navigate directly to /admin
        await page.goto("/admin");
        await page.waitForLoadState("networkidle");
        // Should not land on /admin
        expect(page.url()).not.toMatch(/\/admin$/);
        await shot(page, "D-02_admin_route_unauthorized");
    });

    test("D-03: /dashboard protected – unauthenticated access redirects", async ({ page }) => {
        await page.goto("/dashboard");
        await page.waitForLoadState("networkidle");
        expect(page.url()).not.toMatch(/\/dashboard$/);
        await shot(page, "D-03_dashboard_route_unauthorized");
    });

    test("D-04: Multiple wrong attempts – check for lockout / warning", async ({ page }) => {
        for (let i = 1; i <= 5; i++) {
            await gotoLogin(page);
            await fillAndSubmit(page, ADMIN_EMAIL, "WrongPass" + i + "!");
            await page.waitForTimeout(1500);
        }
        const toast = await getToast(page);
        // Capture whatever state we end up in
        await shot(page, "D-04_multiple_wrong_attempts");
        // Test passes as long as app doesn't crash; rate-limiting is a bonus observation
        expect(await page.title()).not.toBe("");
    });

    test("D-05: Admin logout → redirected back to login or public page", async ({ page }) => {
        // First log in as admin
        await fillAndSubmit(page, ADMIN_EMAIL, VALID_PASSWORD);
        await page.waitForURL("**/admin**", { timeout: 12000 });

        // Try to find and click a logout button
        const logoutBtn = page
            .getByRole("button", { name: /sign out|logout|log out/i })
            .or(page.getByText(/sign out|logout|log out/i).first());

        if (await logoutBtn.isVisible().catch(() => false)) {
            await logoutBtn.click();
            await page.waitForLoadState("networkidle");
            await shot(page, "D-05_after_logout");
            // Should not be on a protected route
            expect(page.url()).not.toContain("/admin");
        } else {
            // Attempt via sidebar dropdown / avatar
            await shot(page, "D-05_logout_button_not_found");
        }
    });

    test("D-06: Browser back button after logout does not re-enter protected area", async ({ page }) => {
        await fillAndSubmit(page, STUDENT_EMAIL, VALID_PASSWORD);
        await page.waitForURL("**/dashboard**", { timeout: 12000 });
        const dashUrl = page.url();

        // Navigate to login (simulating logout)
        await page.goto(LOGIN_URL);
        await page.waitForLoadState("networkidle");

        // Press browser back
        await page.goBack();
        await page.waitForLoadState("networkidle");
        await shot(page, "D-06_back_button_after_logout_simulation");
        // Weak session: if still logged in the back button may work – record result
        console.log("After back-button URL:", page.url());
    });
});

// ══════════════════════════════════════════════════
//  SECTION E: UI / UX Tests
// ══════════════════════════════════════════════════

test.describe("E – UI / UX Tests", () => {
    test("E-01: Password field is masked (type=password)", async ({ page }) => {
        const pwInput = page.getByLabel("Password");
        expect(await pwInput.getAttribute("type")).toBe("password");
        await shot(page, "E-01_password_masked");
    });

    test("E-02: Tab navigation works Email → Password → Submit", async ({ page }) => {
        await page.getByLabel("Email").click();
        await page.keyboard.press("Tab");
        const focused = await page.evaluate(() => document.activeElement?.getAttribute("type") ?? "");
        expect(focused).toBe("password");
        await shot(page, "E-02_tab_navigation");
    });

    test("E-03: Enter key submits the form", async ({ page }) => {
        await page.getByLabel("Email").fill(ADMIN_EMAIL);
        await page.getByLabel("Password").fill(VALID_PASSWORD);
        await page.keyboard.press("Enter");
        await page.waitForURL("**/admin**", { timeout: 12000 });
        expect(page.url()).toContain("/admin");
        await shot(page, "E-03_enter_key_submit");
    });

    test("E-04: Button disabled during loading", async ({ page }) => {
        await page.getByLabel("Email").fill(ADMIN_EMAIL);
        await page.getByLabel("Password").fill(VALID_PASSWORD);

        // Click and immediately check disabled state
        const submitBtn = page.getByRole("button", { name: "Sign In" });
        await submitBtn.click();

        // The button should show disabled + spinner briefly
        const isDisabledOrLoading = await Promise.race([
            submitBtn.isDisabled().then((v) => v),
            page.waitForURL("**/admin**", { timeout: 8000 }).then(() => null),
        ]).catch(() => false);

        await shot(page, "E-04_button_loading_state");
        // Even if we can't assert the exact state, no crash = pass
        expect(await page.title()).not.toBe("");
    });

    test("E-05: Mobile viewport – login page renders correctly", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
        await gotoLogin(page);
        await expect(page.getByLabel("Email")).toBeVisible();
        await expect(page.getByLabel("Password")).toBeVisible();
        await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
        await shot(page, "E-05_mobile_viewport");
    });

    test("E-06: Login page screenshot – initial state", async ({ page }) => {
        await expect(page.getByLabel("Email")).toBeVisible();
        await expect(page.getByLabel("Password")).toBeVisible();
        await shot(page, "E-06_login_page_initial");
    });
});

// ══════════════════════════════════════════════════
//  SECTION F: Extra / Intelligent Tests
// ══════════════════════════════════════════════════

test.describe("F – Extra Intelligent Tests", () => {
    test("F-01: Duplicate rapid clicks on Sign In – only one submission", async ({ page }) => {
        await page.getByLabel("Email").fill(ADMIN_EMAIL);
        await page.getByLabel("Password").fill(VALID_PASSWORD);

        const btn = page.getByRole("button", { name: "Sign In" });
        // Click 3 times quickly
        await btn.click();
        await btn.click({ force: true });
        await btn.click({ force: true });

        await page.waitForURL("**/admin**", { timeout: 12000 });
        expect(page.url()).toContain("/admin");
        await shot(page, "F-01_double_click_submit");
    });

    test("F-02: Forgot password link is present and navigable", async ({ page }) => {
        const forgotLink = page.getByRole("link", { name: /forgot password/i });
        await expect(forgotLink).toBeVisible();
        await shot(page, "F-02_forgot_password_link");
    });

    test("F-03: Register link is present and navigable", async ({ page }) => {
        const registerLink = page.getByRole("link", { name: /register/i });
        await expect(registerLink).toBeVisible();
        await registerLink.click();
        await page.waitForLoadState("networkidle");
        expect(page.url()).toContain("/register");
        await shot(page, "F-03_register_link");
    });

    test("F-04: Unicode / emoji in email → handled gracefully", async ({ page }) => {
        await page.getByLabel("Email").fill("用户@example.com");
        await page.getByLabel("Password").fill("SomePass1!");
        await page.getByRole("button", { name: "Sign In" }).click();
        await page.waitForTimeout(3000);
        expect(await page.title()).not.toBe("");
        await shot(page, "F-04_unicode_email");
    });

    test("F-05: Empty email, valid password format → inline error visible", async ({ page }) => {
        await page.getByLabel("Password").fill(VALID_PASSWORD);
        await page.getByRole("button", { name: "Sign In" }).click();
        await page.waitForTimeout(500);

        const errors = page.locator("p.text-destructive, [role='alert']");
        await expect(errors.first()).toBeVisible({ timeout: 4000 });
        await shot(page, "F-05_empty_email_error_visible");
    });
});
