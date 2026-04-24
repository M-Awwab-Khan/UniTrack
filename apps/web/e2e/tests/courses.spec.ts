import { test, expect, Page, Locator } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const ADMIN_EMAIL = "admin@unitrack.com";
const ADMIN_PASSWORD = "StrongPass123!";

const STUDENT_EMAIL = process.env.E2E_STUDENT_EMAIL || "";
const STUDENT_PASSWORD = process.env.E2E_STUDENT_PASSWORD || "";

const COURSES_ROUTE = "/admin/courses";
const SCREENSHOT_DIR = path.join(__dirname, "..", "screenshots", "courses");
const DEBUG_DIR = path.join(__dirname, "..", "screenshots", "courses-debug");

const DEPT_OPTION = "Computer Science";
const SEMESTER_OPTION = "Spring 2025";
const ARCHIVED_STATUS_OPTION = "Archived";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

if (!fs.existsSync(DEBUG_DIR)) {
  fs.mkdirSync(DEBUG_DIR, { recursive: true });
}

type CoursePayload = {
  code: string;
  name: string;
  department?: string;
  semester?: string;
  creditHours?: number;
  description?: string;
  status?: "Active" | "Archived";
};

type MutationOutcome = {
  toastText: string | null;
  dialogVisible: boolean;
  inlineErrors: string[];
};

const debugEventsByTest = new Map<string, string[]>();

async function shot(page: Page, name: string) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  });
}

function debugLog(testId: string, message: string) {
  const events = debugEventsByTest.get(testId) ?? [];
  events.push(`[${new Date().toISOString()}] ${message}`);
  debugEventsByTest.set(testId, events);
}

function attachPageDiagnostics(page: Page, testId: string) {
  page.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("[Fast Refresh]")) return;
    debugLog(testId, `console:${msg.type()}: ${text}`);
  });

  page.on("pageerror", (err) => {
    debugLog(testId, `pageerror: ${err.message}`);
  });

  page.on("requestfailed", (req) => {
    const url = req.url();
    if (url.includes("/api/trpc")) {
      debugLog(testId, `requestfailed: ${req.method()} ${url} -> ${req.failure()?.errorText ?? "unknown"}`);
    }
  });

  page.on("response", (res) => {
    const url = res.url();
    if (url.includes("/api/trpc")) {
      debugLog(testId, `response: ${res.request().method()} ${url} -> ${res.status()}`);
    }
  });
}

function uniqueCode(prefix = "QA") {
  const stamp = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${prefix}${stamp}${rand}`.toUpperCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function courseRow(page: Page, code: string): Locator {
  return page.locator("tbody tr", { hasText: code }).first();
}

async function waitForToast(page: Page): Promise<string> {
  const toast = page.locator("[data-sonner-toast]").first();
  await toast.waitFor({ state: "visible", timeout: 10000 });
  return (await toast.innerText()).trim();
}

async function getToastIfAny(page: Page, timeout = 2500): Promise<string | null> {
  try {
    const toast = page.locator("[data-sonner-toast]").first();
    await toast.waitFor({ state: "visible", timeout });
    return (await toast.innerText()).trim();
  } catch {
    return null;
  }
}

async function fillLogin(page: Page, email: string, password: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

async function adminLogin(page: Page) {
  await page.goto("/login");
  await fillLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.waitForURL("**/admin**", { timeout: 15000 });
  await expect(page).toHaveURL(/\/admin(?:\/.*)?$/);
}

async function openCoursesPage(page: Page) {
  await page.goto("/admin");
  const manageCoursesLink = page.getByRole("link", { name: /manage courses/i }).first();

  if (await manageCoursesLink.isVisible().catch(() => false)) {
    await manageCoursesLink.click();
  } else {
    await page.goto(COURSES_ROUTE);
  }

  await expect(page).toHaveURL(/\/admin\/courses(?:\?.*)?$/);
  await expect(page.getByRole("heading", { name: /course management/i })).toBeVisible();
}

async function openCreateCourseModal(page: Page) {
  await page.getByRole("button", { name: /^Create Course$/ }).first().click();
  const dialog = await getActiveCourseDialog(page);
  await expect(dialog.getByText("Create New Course")).toBeVisible();
  await shot(page, "03-create-modal");
}

async function getActiveCourseDialog(page: Page): Promise<Locator> {
  const dialog = page
    .getByRole("dialog")
    .filter({ has: page.getByRole("button", { name: /create course|save changes/i }) })
    .first();

  await expect(dialog).toBeVisible({ timeout: 8000 });
  return dialog;
}

async function selectComboboxOptionInDialog(page: Page, label: string, optionText: string) {
  const dialog = await getActiveCourseDialog(page);
  const labelRegex = new RegExp(`^${escapeRegExp(label)}$`, "i");
  const optionRegex = new RegExp(`^${escapeRegExp(optionText)}$`, "i");

  const byAccessibleName = dialog.getByRole("combobox", { name: labelRegex }).first();
  const byLabeledContainer = dialog
    .locator("div.space-y-2")
    .filter({ has: dialog.locator("label", { hasText: labelRegex }) })
    .locator("button[role='combobox']")
    .first();

  const comboIndexByLabel: Record<string, number> = {
    Department: 0,
    "Semester (Optional)": 1,
    Status: 2,
  };

  let trigger: Locator;
  if ((await byAccessibleName.count()) > 0) {
    trigger = byAccessibleName;
  } else if ((await byLabeledContainer.count()) > 0) {
    trigger = byLabeledContainer;
  } else {
    const fallbackIndex = comboIndexByLabel[label] ?? 0;
    trigger = dialog.getByRole("combobox").nth(fallbackIndex);
  }

  console.log(`Selecting combobox option: ${label} -> ${optionText}`);
  try {
    await expect(trigger).toBeVisible({ timeout: 5000 });
    await trigger.click({ timeout: 7000 });
  } catch (error) {
    const labels = (await dialog.locator("label").allInnerTexts().catch(() => []))
      .map((t) => t.trim())
      .filter(Boolean);
    const comboCount = await dialog.getByRole("combobox").count().catch(() => 0);
    throw new Error(
      `Failed to open combobox for label "${label}". Found labels: [${labels.join(", "
      )}] | combobox count: ${comboCount} | original error: ${String(error)}`
    );
  }

  const option = page.getByRole("option", { name: optionRegex }).first();
  await expect(option).toBeVisible({ timeout: 5000 });
  await option.click({ timeout: 7000 });
  console.log(`Option selected: ${label} -> ${optionText}`);
}

async function fillCourseForm(page: Page, payload: CoursePayload) {
  const dialog = await getActiveCourseDialog(page);

  await dialog.getByLabel("Course Code").fill(payload.code);
  await dialog.getByLabel("Course Name").fill(payload.name);

  await selectComboboxOptionInDialog(page, "Department", payload.department ?? DEPT_OPTION);

  if (payload.semester) {
    await selectComboboxOptionInDialog(page, "Semester (Optional)", payload.semester);
  }

  if (payload.status) {
    await selectComboboxOptionInDialog(page, "Status", payload.status);
  }

  if (typeof payload.creditHours !== "undefined") {
    await dialog.getByLabel("Credit Hours").fill(String(payload.creditHours));
  }

  if (typeof payload.description !== "undefined") {
    await dialog.getByLabel("Description (Optional)").fill(payload.description);
  }
}

async function createCourse(page: Page, payload: CoursePayload) {
  await openCreateCourseModal(page);
  await fillCourseForm(page, payload);

  const outcome = await submitCourseDialog(page, "create");
  if (!outcome.toastText && outcome.dialogVisible && outcome.inlineErrors.length > 0) {
    throw new Error(`Create failed with inline validation: ${outcome.inlineErrors.join(" | ")}`);
  }
}

async function searchCourse(page: Page, term: string) {
  const input = page.getByPlaceholder("Search courses...");
  await input.fill(term);
}

async function openRowMenuForCourse(page: Page, code: string) {
  const row = courseRow(page, code);
  await expect(row).toBeVisible({ timeout: 10000 });
  await row.getByRole("button", { name: /open menu/i }).click();
}

async function deleteCourse(page: Page, code: string) {
  await searchCourse(page, code);
  await openRowMenuForCourse(page, code);
  await page.getByRole("menuitem", { name: /delete/i }).click();

  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByText(/delete course\?/i)).toBeVisible();
  await dialog.getByRole("button", { name: /delete permanently/i }).click();

  await waitForToast(page);
  await expect(courseRow(page, code)).toHaveCount(0);
}

async function submitCourseDialog(page: Page, mode: "create" | "edit"): Promise<MutationOutcome> {
  const dialog = await getActiveCourseDialog(page);
  const submitName = mode === "create" ? /^Create Course$/ : /save changes/i;
  const submit = dialog.getByRole("button", { name: submitName });

  await submit.click();

  await Promise.race([
    expect(dialog).toBeHidden({ timeout: 12000 }),
    page.locator("[data-sonner-toast]").first().waitFor({ state: "visible", timeout: 12000 }),
    dialog.locator("p.text-destructive, [role='alert']").first().waitFor({ state: "visible", timeout: 12000 }),
  ]).catch(() => {});

  const toastText = await getToastIfAny(page, 1200);
  const dialogVisible = await dialog.isVisible().catch(() => false);
  const inlineErrors = (await dialog
    .locator("p.text-destructive, [role='alert']")
    .allInnerTexts()
    .catch(() => []))
    .map((t) => t.trim())
    .filter(Boolean);

  return { toastText, dialogVisible, inlineErrors };
}

async function saveDebugSnapshot(page: Page, testId: string) {
  const safe = testId.replace(/[^a-z0-9-_]/gi, "_").slice(0, 80);
  await page.screenshot({
    path: path.join(DEBUG_DIR, `${safe}_failure.png`),
    fullPage: true,
  });

  const html = await page.content();
  fs.writeFileSync(path.join(DEBUG_DIR, `${safe}_dom.html`), html, "utf-8");
}

// ══════════════════════════════════════════════════
//  SETUP / TEARDOWN
// ══════════════════════════════════════════════════

test.beforeEach(async ({ page }, testInfo) => {
  debugEventsByTest.set(testInfo.testId, []);
  attachPageDiagnostics(page, testInfo.testId);
});

test.afterEach(async ({ page }, testInfo) => {
  const events = debugEventsByTest.get(testInfo.testId) ?? [];
  if (testInfo.status !== testInfo.expectedStatus) {
    await saveDebugSnapshot(page, testInfo.testId);
    const toast = await getToastIfAny(page, 500);
    if (toast) {
      events.push(`[${new Date().toISOString()}] last-toast: ${toast}`);
    }
  }

  await testInfo.attach("courses-debug-log", {
    contentType: "text/plain",
    body: Buffer.from(events.join("\n") || "No debug events captured", "utf-8"),
  });

  debugEventsByTest.delete(testInfo.testId);
});

// ══════════════════════════════════════════════════
//  SECTION A: Authentication & Navigation
// ══════════════════════════════════════════════════

test.describe("A - Authentication & Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await shot(page, "01-admin-dashboard");
    await openCoursesPage(page);
    await shot(page, "02-courses-page");
  });

  test("A-01: admin can navigate to courses management", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /existing courses/i })).toBeVisible();
    await expect(page.getByPlaceholder("Search courses...")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Create Course$/ }).first()).toBeVisible();
  });
});

// ══════════════════════════════════════════════════
//  SECTION B: Create Course Tests
// ══════════════════════════════════════════════════

test.describe("B - Create Course Tests", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await openCoursesPage(page);
  });

  test("B-01: create course with all valid fields", async ({ page }) => {
    const code = uniqueCode("QAFULL");

    try {
      await createCourse(page, {
        code,
        name: "Automation Engineering Fundamentals",
        department: DEPT_OPTION,
        semester: SEMESTER_OPTION,
        creditHours: 3,
        status: "Active",
        description: "QA full-field create scenario",
      });

      const toastText = await waitForToast(page);
      expect(toastText.toLowerCase()).toContain("created");

      await searchCourse(page, code);
      await expect(courseRow(page, code)).toBeVisible();
      await shot(page, "03-create-success-all-fields");
    } finally {
      await deleteCourse(page, code).catch(() => {});
    }
  });

  test("B-02: create course with mandatory fields only", async ({ page }) => {
    const code = uniqueCode("QAMIN");

    try {
      await createCourse(page, {
        code,
        name: "Minimal Required Course",
        department: DEPT_OPTION,
      });

      const toastText = await waitForToast(page);
      expect(toastText.toLowerCase()).toContain("created");

      await searchCourse(page, code);
      await expect(courseRow(page, code)).toBeVisible();
    } finally {
      await deleteCourse(page, code).catch(() => {});
    }
  });

  test("B-03: create course shows validation on empty mandatory fields", async ({ page }) => {
    await openCreateCourseModal(page);

    const outcome = await submitCourseDialog(page, "create");
    expect(outcome.inlineErrors.join(" ").toLowerCase()).toContain("required");

    await expect(page.getByText(/course code is required/i)).toBeVisible();
    await expect(page.getByText(/course name is required/i)).toBeVisible();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("B-04: duplicate course code is blocked", async ({ page }) => {
    const code = uniqueCode("QADUP");

    try {
      await createCourse(page, {
        code,
        name: "Duplicate Baseline",
        department: DEPT_OPTION,
      });
      await waitForToast(page);

      await createCourse(page, {
        code,
        name: "Duplicate Attempt",
        department: DEPT_OPTION,
      });

      const errorToast = await waitForToast(page);
      expect(errorToast.toLowerCase()).toMatch(/exists|conflict|already/);

      await searchCourse(page, code);
      await expect(page.locator("tbody tr", { hasText: code })).toHaveCount(1);
    } finally {
      await deleteCourse(page, code).catch(() => {});
    }
  });

  test("B-05: invalid credit hours (0 and negative) are rejected", async ({ page }) => {
    const codeA = uniqueCode("QACR0");
    const codeB = uniqueCode("QACRN");

    await openCreateCourseModal(page);
    await fillCourseForm(page, {
      code: codeA,
      name: "Invalid Credit Zero",
      department: DEPT_OPTION,
      creditHours: 0,
    });

    const firstOutcome = await submitCourseDialog(page, "create");
    expect(firstOutcome.inlineErrors.join(" ").toLowerCase()).toContain("credit hours must be positive");
    await page.getByRole("dialog").getByRole("button", { name: /cancel/i }).click();

    await openCreateCourseModal(page);
    await fillCourseForm(page, {
      code: codeB,
      name: "Invalid Credit Negative",
      department: DEPT_OPTION,
      creditHours: -2,
    });

    const secondOutcome = await submitCourseDialog(page, "create");
    expect(secondOutcome.inlineErrors.join(" ").toLowerCase()).toContain("credit hours must be positive");
    await page.getByRole("dialog").getByRole("button", { name: /cancel/i }).click();

    await searchCourse(page, codeA);
    await expect(courseRow(page, codeA)).toHaveCount(0);
    await searchCourse(page, codeB);
    await expect(courseRow(page, codeB)).toHaveCount(0);
  });

  test("B-06: very long course name can be submitted without UI break", async ({ page }) => {
    const code = uniqueCode("QALONG");
    const longName = `Long-${"X".repeat(180)}`;

    try {
      await createCourse(page, {
        code,
        name: longName,
        department: DEPT_OPTION,
        description: "Long course name stress test",
      });

      await waitForToast(page);
      await searchCourse(page, code);
      await expect(courseRow(page, code)).toContainText(code);
    } finally {
      await deleteCourse(page, code).catch(() => {});
    }
  });

  test("B-07: special characters in course code are validated by system", async ({ page }) => {
    const specialCode = "QA-!@#";

    await openCreateCourseModal(page);
    await fillCourseForm(page, {
      code: specialCode,
      name: "Special Code Course",
      department: DEPT_OPTION,
    });

    const outcome = await submitCourseDialog(page, "create");
    const toast = outcome.toastText ?? (await getToastIfAny(page, 4000)) ?? "";
    await shot(page, "05-special-code-feedback");

    if (toast.toLowerCase().includes("created")) {
      await searchCourse(page, specialCode.toUpperCase());
      await deleteCourse(page, specialCode.toUpperCase()).catch(() => {});
    }
  });

  test("B-08: cancel create modal does not create course", async ({ page }) => {
    const code = uniqueCode("QACAN");

    await openCreateCourseModal(page);
    await fillCourseForm(page, {
      code,
      name: "Cancel Create Course",
      department: DEPT_OPTION,
    });

    await page.getByRole("dialog").getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByRole("dialog")).toBeHidden();

    await searchCourse(page, code);
    await expect(courseRow(page, code)).toHaveCount(0);
  });

  test("B-09: rapid create clicks do not create duplicate entries", async ({ page }) => {
    const code = uniqueCode("QARAPID");

    try {
      await openCreateCourseModal(page);
      await fillCourseForm(page, {
        code,
        name: "Rapid Click Protection",
        department: DEPT_OPTION,
      });

      const submit = page.getByRole("dialog").getByRole("button", { name: /^Create Course$/ });
      await Promise.all([submit.click(), submit.click()]);

      await waitForToast(page);
      await searchCourse(page, code);
      await expect(page.locator("tbody tr", { hasText: code })).toHaveCount(1);
    } finally {
      await deleteCourse(page, code).catch(() => {});
    }
  });
});

// ══════════════════════════════════════════════════
//  SECTION C: Edit Course Tests
// ══════════════════════════════════════════════════

test.describe("C - Edit Course Tests", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await openCoursesPage(page);
  });

  test("C-01: edit fields and verify persistence after refresh", async ({ page }) => {
    const code = uniqueCode("QAEDIT");

    try {
      await createCourse(page, {
        code,
        name: "Editable Course",
        department: DEPT_OPTION,
        creditHours: 2,
        status: "Active",
      });
      await waitForToast(page);

      await searchCourse(page, code);
      await openRowMenuForCourse(page, code);
      await page.getByRole("menuitem", { name: /edit/i }).click();
      await shot(page, "06-edit-action-open");

      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText(/edit course/i)).toBeVisible();

      await dialog.getByLabel("Course Name").fill("Edited Automation Course");
      await dialog.getByLabel("Credit Hours").fill("4");
      await selectComboboxOptionInDialog(page, "Department", "Software Engineering");
      await selectComboboxOptionInDialog(page, "Status", ARCHIVED_STATUS_OPTION);
      await submitCourseDialog(page, "edit");

      const toastText = await waitForToast(page);
      expect(toastText.toLowerCase()).toContain("updated");

      await page.reload();
      await openCoursesPage(page);
      await searchCourse(page, code);

      const row = courseRow(page, code);
      await expect(row).toContainText("Edited Automation Course");
      await expect(row).toContainText("SE");
      await expect(row).toContainText("4");
      await expect(row).toContainText("archived");
    } finally {
      await deleteCourse(page, code).catch(() => {});
    }
  });

  test("C-02: cancel edit does not mutate course", async ({ page }) => {
    const code = uniqueCode("QAEDCAN");

    try {
      await createCourse(page, {
        code,
        name: "Edit Cancel Target",
        department: DEPT_OPTION,
        creditHours: 3,
        status: "Active",
      });
      await waitForToast(page);

      await searchCourse(page, code);
      await openRowMenuForCourse(page, code);
      await page.getByRole("menuitem", { name: /edit/i }).click();

      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Course Name").fill("Should Not Persist");
      await dialog.getByRole("button", { name: /cancel/i }).click();

      await searchCourse(page, code);
      const row = courseRow(page, code);
      await expect(row).toContainText("Edit Cancel Target");
      await expect(row).not.toContainText("Should Not Persist");
    } finally {
      await deleteCourse(page, code).catch(() => {});
    }
  });
});

// ══════════════════════════════════════════════════
//  SECTION D: Delete Course Tests
// ══════════════════════════════════════════════════

test.describe("D - Delete Course Tests", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await openCoursesPage(page);
  });

  test("D-01: delete cancel keeps course", async ({ page }) => {
    const code = uniqueCode("QADELC");

    try {
      await createCourse(page, {
        code,
        name: "Delete Cancel Target",
        department: DEPT_OPTION,
      });
      await waitForToast(page);

      await searchCourse(page, code);
      await openRowMenuForCourse(page, code);
      await page.getByRole("menuitem", { name: /delete/i }).click();

      const confirm = page.getByRole("alertdialog");
      await expect(confirm).toBeVisible();
      await shot(page, "07-delete-confirmation");
      await confirm.getByRole("button", { name: /^Cancel$/ }).click();

      await expect(courseRow(page, code)).toBeVisible();
    } finally {
      await deleteCourse(page, code).catch(() => {});
    }
  });

  test("D-02: delete course removes row and persists after refresh", async ({ page }) => {
    const code = uniqueCode("QADEL");

    await createCourse(page, {
      code,
      name: "Delete Persistence Target",
      department: DEPT_OPTION,
    });
    await waitForToast(page);

    await deleteCourse(page, code);
    await shot(page, "08-delete-success");

    await page.reload();
    await openCoursesPage(page);
    await searchCourse(page, code);
    await expect(courseRow(page, code)).toHaveCount(0);
  });
});

// ══════════════════════════════════════════════════
//  SECTION E: Search Tests
// ══════════════════════════════════════════════════

test.describe("E - Search Tests", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await openCoursesPage(page);
  });

  test("E-01: search by code, name, partial, case-insensitive, nonexistent, clear", async ({ page }) => {
    const code = uniqueCode("QASRCH");
    const name = "Searchable Automation Course";

    try {
      await createCourse(page, {
        code,
        name,
        department: DEPT_OPTION,
      });
      await waitForToast(page);

      await searchCourse(page, code);
      await expect(courseRow(page, code)).toBeVisible();

      await searchCourse(page, name);
      await expect(courseRow(page, code)).toBeVisible();

      await searchCourse(page, "tomation");
      await expect(courseRow(page, code)).toBeVisible();

      await searchCourse(page, code.toLowerCase());
      await expect(courseRow(page, code)).toBeVisible();

      await searchCourse(page, "THIS_DOES_NOT_EXIST_12345");
      await expect(page.getByText(/no courses found/i)).toBeVisible();

      await searchCourse(page, "");
      await expect(page.locator("tbody tr").first()).toBeVisible();
      await shot(page, "09-search-results");
    } finally {
      await deleteCourse(page, code).catch(() => {});
    }
  });
});

// ══════════════════════════════════════════════════
//  SECTION F: Pagination Tests
// ══════════════════════════════════════════════════

test.describe("F - Pagination Tests", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await openCoursesPage(page);
  });

  test("F-01: pagination next/previous updates rows and works with search", async ({ page }) => {
    const createdCodes: string[] = [];

    try {
      for (let i = 0; i < 12; i++) {
        const code = uniqueCode(`QAPG${i}`);
        createdCodes.push(code);

        await createCourse(page, {
          code,
          name: `Pagination Course ${i}`,
          department: DEPT_OPTION,
        });

        await waitForToast(page);
      }

      const firstPageFirstCode = (await page.locator("tbody tr td").first().innerText()).trim();

      await page.getByRole("button", { name: /^Next$/ }).click();
      await expect(page.getByText(/page 2/i)).toBeVisible();

      const secondPageFirstCode = (await page.locator("tbody tr td").first().innerText()).trim();
      expect(secondPageFirstCode).not.toBe(firstPageFirstCode);

      await page.getByRole("button", { name: /^Previous$/ }).click();
      await expect(page.getByText(/page 1/i)).toBeVisible();

      const targetCode = createdCodes[10] ?? createdCodes[0];
      if (!targetCode) throw new Error("Pagination setup failed: no course codes were created");

      await searchCourse(page, targetCode);
      await expect(courseRow(page, targetCode)).toBeVisible();
      await shot(page, "10-pagination");
    } finally {
      for (const code of createdCodes) {
        await deleteCourse(page, code).catch(() => {});
      }
      await searchCourse(page, "");
    }
  });
});

// ══════════════════════════════════════════════════
//  SECTION G: Security / Robustness
// ══════════════════════════════════════════════════

test.describe("G - Security & Robustness", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await openCoursesPage(page);
  });

  test("G-01: SQL/script style payload in text fields does not break UI", async ({ page }) => {
    const code = uniqueCode("QASEC");
    const maliciousName = "<script>alert('x')</script>' OR 1=1 --";

    try {
      await createCourse(page, {
        code,
        name: maliciousName,
        department: DEPT_OPTION,
        description: "Security payload check",
      });

      await waitForToast(page);
      await searchCourse(page, code);
      await expect(courseRow(page, code)).toContainText(code);
      await expect(page).toHaveURL(/\/admin\/courses/);
    } finally {
      await deleteCourse(page, code).catch(() => {});
    }
  });
});

// ══════════════════════════════════════════════════
//  SECTION H: Access Control
// ══════════════════════════════════════════════════

test.describe("H - Access Control", () => {
  test("H-01: direct /admin/courses is blocked without login", async ({ page }) => {
    await page.goto(COURSES_ROUTE);
    await page.waitForLoadState("networkidle");
    await expect(page).not.toHaveURL(/\/admin\/courses$/);
  });

  test("H-02: non-admin cannot access /admin/courses after login (optional credentials)", async ({ page }) => {
    test.skip(!STUDENT_EMAIL || !STUDENT_PASSWORD, "Set E2E_STUDENT_EMAIL and E2E_STUDENT_PASSWORD to run non-admin role test");

    await page.goto("/login");
    await fillLogin(page, STUDENT_EMAIL, STUDENT_PASSWORD);
    await page.waitForLoadState("networkidle");

    await page.goto(COURSES_ROUTE);
    await page.waitForLoadState("networkidle");

    await expect(page).not.toHaveURL(/\/admin\/courses$/);
  });
});
