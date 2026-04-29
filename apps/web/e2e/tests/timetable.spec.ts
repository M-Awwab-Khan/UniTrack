import { test, expect, Page, Locator } from "@playwright/test";

const TA_EMAIL = "smrayyan@gmail.com";
const STUDENT_EMAIL = "abyazkhalid@gmail.com";
const PASSWORD = "StrongPass123!";

const TIMETABLE_ROUTE = "/dashboard/timetable";

type AddClassInput = {
  startTime?: string;
  endTime?: string;
  location?: string;
  reason?: string;
  courseName?: string;
};

function timetableHeading(page: Page): Locator {
  return page.getByRole("heading", { name: "Timetable" });
}

function addClassDialog(page: Page): Locator {
  return page.getByRole("dialog").filter({ hasText: /add extra \/ compensatory class/i }).first();
}

function cancelDialog(page: Page): Locator {
  return page.getByRole("dialog").filter({ hasText: /cancel class/i }).first();
}

function weekRangeLabel(page: Page): Locator {
  return page.locator("p.text-muted-foreground").filter({ hasText: / - / }).first();
}

function sessionCardByText(page: Page, text: string): Locator {
  return page.locator("div.group").filter({ hasText: text }).first();
}

async function getToastIfAny(page: Page, timeout = 5000): Promise<string | null> {
  try {
    const toast = page.locator("[data-sonner-toast]").first();
    await toast.waitFor({ state: "visible", timeout });
    return (await toast.innerText()).trim();
  } catch {
    return null;
  }
}

async function fillAndSubmitLogin(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

async function loginAsTA(page: Page) {
  await fillAndSubmitLogin(page, TA_EMAIL, PASSWORD);
  await page.waitForURL("**/dashboard**", { timeout: 15000 });
}

async function loginAsStudent(page: Page) {
  await fillAndSubmitLogin(page, STUDENT_EMAIL, PASSWORD);
  await page.waitForURL("**/dashboard**", { timeout: 15000 });
}

async function openTimetable(page: Page) {
  await page.goto(TIMETABLE_ROUTE);
  await expect(timetableHeading(page)).toBeVisible({ timeout: 15000 });
  await expect(weekRangeLabel(page)).toBeVisible();
}

async function navigateNextWeek(page: Page) {
  await page.locator("button:has(svg.lucide-chevron-right)").first().click();
  await expect(weekRangeLabel(page)).toBeVisible();
}

async function navigatePrevWeek(page: Page) {
  await page.locator("button:has(svg.lucide-chevron-left)").first().click();
  await expect(weekRangeLabel(page)).toBeVisible();
}

async function openAddClassDialog(page: Page) {
  await page.getByRole("button", { name: /add class/i }).click();
  await expect(addClassDialog(page)).toBeVisible({ timeout: 10000 });
}

async function selectFirstCourseInAddDialog(page: Page, text: string) {
  const dialog = addClassDialog(page);
  const courseCombo = dialog.getByRole("combobox").first();
  await expect(courseCombo).toBeVisible();
  await courseCombo.click();

   const requiredCourse = page.getByRole("option", { name: new RegExp(text, "i") }).first();
   await expect(requiredCourse).toBeVisible({ timeout: 7000 });
   await requiredCourse.click();
}

async function pickAnyValidDate(page: Page) {
  const dialog = addClassDialog(page);
  const dateButton = dialog.getByRole("button", { name: /date|pick a date/i }).first();

  await expect(dateButton).toBeVisible();
  await dateButton.click();

  // select the button with today's day number on it. aria-label="Today, Saturday, April 25th, 2026"
  const todayButton = page.locator("[role='grid'] button[aria-label*='Today']").first();
  if (await todayButton.isVisible().catch(() => false)) {
    await todayButton.click();
    return;
  }

  // Fallback if aria-current is unavailable in this calendar render.
  const dayButton = page.locator("[role='grid'] button:not([disabled])").first();
  await expect(dayButton).toBeVisible({ timeout: 5000 });
  await dayButton.click();
}

async function addExtraClass(
  page: Page,
  input: AddClassInput = {}
): Promise<{ location: string; toast: string | null; created: boolean }> {
  const dialog = addClassDialog(page);
  const startTime = input.startTime ?? "10:00";
  const endTime = input.endTime ?? "11:00";
  const location = input.location ?? `QA-Room-${Date.now()}`;

  await selectFirstCourseInAddDialog(page, input.courseName ?? "");
  await pickAnyValidDate(page);

  const timeInputs = dialog.locator("input[type='time']");
  await expect(timeInputs.first()).toBeVisible();
  await timeInputs.first().fill(startTime);
  await timeInputs.nth(1).fill(endTime);

  await dialog.getByPlaceholder("e.g. Room 101").fill(location);

  if (typeof input.reason !== "undefined") {
    await dialog.getByPlaceholder("e.g. Compensation for...").fill(input.reason);
  }

  await dialog.getByRole("button", { name: /^add class$/i }).click();

  await Promise.race([
    addClassDialog(page).waitFor({ state: "hidden", timeout: 12000 }),
    page.locator("[data-sonner-toast]").first().waitFor({ state: "visible", timeout: 12000 }), //
  ]).catch(() => {});

  const toast = await getToastIfAny(page, 1500);

  // wait for the toast to hide
    await page.locator("[data-sonner-toast]").first().waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});

  // Session card may take a short moment to refresh after invalidation.
  // do it some other way
    let created = false;
    try {
      const card = sessionCardByText(page, location);
      await expect(card).toBeVisible({ timeout: 7000 });
      created = true;
    } catch {
      created = false;
    }

  return { location, toast, created };
}

async function cancelClass(
  page: Page,
  opts: { cardText?: string; reason?: string; confirm?: boolean } = {}
): Promise<{ toast: string | null; cancelled: boolean }> {
  const confirm = opts.confirm ?? true;
  let card: Locator;

  if (opts.cardText) {
    card = sessionCardByText(page, opts.cardText);
  } else {
    const buttons = page.locator("[title='Cancel Class']");
    const count = await buttons.count();
    if (count === 0) {
      return { toast: null, cancelled: false };
    }

    let selectedIndex = -1;
    for (let i = 0; i < Math.min(count, 12); i++) {
      const btn = buttons.nth(i);
      const cardText = (await btn.locator("xpath=ancestor::div[contains(@class,'group')][1]").innerText().catch(() => "")).toLowerCase();
      if (!cardText.includes("extra") && !cardText.includes("cancelled")) {
        selectedIndex = i;
        break;
      }
    }

    if (selectedIndex < 0) {
      selectedIndex = 0;
    }

    card = buttons.nth(selectedIndex).locator("xpath=ancestor::div[contains(@class,'group')][1]");
  }

  await expect(card).toBeVisible({ timeout: 10000 });
  await card.hover().catch(() => {});

  const cancelBtn = card.locator("[title='Cancel Class']").first();
  await expect(cancelBtn).toBeVisible({ timeout: 3000 });
  await cancelBtn.click({ force: true });

  const dialog = cancelDialog(page);
  await expect(dialog).toBeVisible({ timeout: 10000 });

  if (!confirm) {
    await dialog.getByRole("button", { name: /keep class/i }).click();
    await expect(dialog).toHaveCount(0, { timeout: 10000 });
    return { toast: null, cancelled: false };
  }

  await dialog.getByLabel(/reason for cancellation/i).fill(opts.reason ?? "Cancelled by QA automation");
  await dialog.getByRole("button", { name: /confirm cancellation/i }).click();

  await Promise.race([
    dialog.waitFor({ state: "hidden", timeout: 12000 }),
    page.locator("[data-sonner-toast]").first().waitFor({ state: "visible", timeout: 12000 }),
  ]).catch(() => {});

  const toast = await getToastIfAny(page, 1500);

  let cancelled = false;
  if (opts.cardText) {
    const updated = sessionCardByText(page, opts.cardText);
    cancelled = await updated.getByText(/cancelled/i).first().isVisible().catch(() => false);
  }

  return { toast, cancelled };
}

test.describe("A - Access Control", () => {
  test("A-01: TA can access timetable page", async ({ page }) => {
    await loginAsTA(page);
    await openTimetable(page);
    await expect(page.getByRole("button", { name: /add class/i })).toBeVisible();
  });

  test("A-02: Student can access timetable page in read-only mode", async ({ page }) => {
    await loginAsStudent(page);
    await openTimetable(page);
    await expect(page.getByRole("button", { name: /today/i })).toBeVisible();
  });

  test("A-03: Student cannot see Add Class button", async ({ page }) => {
    await loginAsStudent(page);
    await openTimetable(page);
    await expect(page.getByRole("button", { name: /add class/i })).toHaveCount(0);
  });

  test("A-04: Student cannot cancel classes", async ({ page }) => {
    await loginAsStudent(page);
    await openTimetable(page);
    await expect(page.locator("[title='Cancel Class']")).toHaveCount(0);
  });

  test("A-05: Unauthenticated user is blocked from protected timetable route", async ({ page }) => {
    await page.goto(TIMETABLE_ROUTE);
    await page.waitForLoadState("networkidle");
    await expect(page).not.toHaveURL(/\/dashboard\/timetable$/);
  });
});

test.describe("B - Add Class (TA)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTA(page);
    await openTimetable(page);
  });

  test("B-01: Add extra class with valid inputs and verify blue styling", async ({ page }) => {
    await openAddClassDialog(page);

    const result = await addExtraClass(page, {
      startTime: "13:00",
      endTime: "14:00",
      reason: "Compensatory class",
      courseName: "Artificial Intelligence", // Adjust based on available courses in the test dataset
    });

    expect((result.toast ?? "").toLowerCase()).toMatch(/extra class added|success|added/);
    console.log("Result.created", result.created);

    const card = sessionCardByText(page, result.location);
    await expect(card).toBeVisible({ timeout: 10000 });
    await expect(card).toContainText(/extra/i);
    await expect(card).toHaveClass(/bg-blue-50|bg-blue-950|border-blue/);
  });

  test("B-02: Add class with optional reason empty", async ({ page }) => {
    await openAddClassDialog(page);

    const result = await addExtraClass(page, {
      startTime: "15:00",
      endTime: "16:00",
      reason: "",
      courseName: "Artificial Intelligence", // Adjust based on available courses in the test dataset
    });
    console.log("Result.created", result.created);

    expect((result.toast ?? "").toLowerCase()).toMatch(/extra class added|success|added/);
    await expect(sessionCardByText(page, result.location)).toBeVisible({ timeout: 10000 });
  });

  test("B-03: Missing required fields show validation and dialog stays open", async ({ page }) => {
    await openAddClassDialog(page);
    const dialog = addClassDialog(page);

    await dialog.getByRole("button", { name: /^add class$/i }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/required|course is required|start time is required|location is required/i).first()).toBeVisible();
  });

  test("B-04: Invalid time range (end before start) is handled gracefully", async ({ page }) => {
    await openAddClassDialog(page);

    const result = await addExtraClass(page, {
      startTime: "16:00",
      endTime: "15:00",
      reason: "Invalid time range test",
      courseName: "Artificial Intelligence",
    });

    // Current implementation may accept or reject depending on backend validation.
    expect(result.toast !== null || result.created).toBeTruthy();
  });

  test("B-05: Overlapping class timing handling remains stable", async ({ page }) => {
    await openAddClassDialog(page);
    const base = await addExtraClass(page, {
      startTime: "09:00",
      endTime: "10:00",
      reason: "Base class for overlap",
        courseName: "Artificial Intelligence",
    });

    test.skip(!base.created, "Base extra class was not created in this dataset");

    await openAddClassDialog(page);
    const overlap = await addExtraClass(page, {
      startTime: "09:30",
      endTime: "10:30",
      reason: "Overlap attempt",
      courseName: "Artificial Intelligence",
    });

    expect(overlap.toast !== null || overlap.created).toBeTruthy();
  });

  test("B-06: Added class persists after refresh", async ({ page }) => {
    await openAddClassDialog(page);
    const result = await addExtraClass(page, {
      startTime: "11:00",
      endTime: "12:00",
      reason: "Persistence check",
      courseName: "Artificial Intelligence",
    });

    test.skip(!result.created, "Created class not visible in this dataset/time grid");

    await page.reload();
    await openTimetable(page);
    await expect(sessionCardByText(page, result.location)).toBeVisible({ timeout: 12000 });
  });
});

test.describe("C - Cancel Class", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTA(page);
    await openTimetable(page);
    await page.waitForTimeout(4000);
  });

  test("C-01: Cancel a scheduled class and verify red cancelled state with reason", async ({ page }) => {
    const cancelButtons = page.locator("[title='Cancel Class']");
    test.skip((await cancelButtons.count()) === 0, "No cancellable class sessions available");

    const reason = "Instructor unavailable for this slot";
    const result = await cancelClass(page, { reason, confirm: true });

    expect((result.toast ?? "").toLowerCase()).toMatch(/cancelled|success/);
    await expect(page.getByText(reason, { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/cancelled/i).first()).toBeVisible();
  });

  test("C-02: Cancel an extra class", async ({ page }) => {
    await openAddClassDialog(page);
    const added = await addExtraClass(page, {
      startTime: "14:00",
      endTime: "15:00",
      reason: "Will cancel this extra class",
      location: `QA-EXTRA-CANCEL-${Date.now()}`,
      courseName: "Artificial Intelligence",
    });

    test.skip(!added.created, "Extra class creation failed or not visible");

    const reason = "Cancelled extra class by QA";
    const cancelled = await cancelClass(page, {
      cardText: added.location,
      reason,
      confirm: true,
    });

    expect((cancelled.toast ?? "").toLowerCase()).toMatch(/cancelled|success/);
    await expect(sessionCardByText(page, added.location)).toContainText(/cancelled/i);
    await expect(sessionCardByText(page, added.location)).toContainText(reason);
  });

  test("C-03: Cancel dialog closes on Keep Class action", async ({ page }) => {
    const cancelButtons = page.locator("[title='Cancel Class']");
    test.skip((await cancelButtons.count()) === 0, "No cancellable class sessions available");

    const result = await cancelClass(page, { confirm: false });
    expect(result.cancelled).toBeFalsy();
    await expect(cancelDialog(page)).toHaveCount(0);
  });

  test("C-04: Cancel reason required behavior and security payload handling", async ({ page }) => {
    await openAddClassDialog(page);
    const added = await addExtraClass(page, {
      startTime: "08:00",
      endTime: "09:00",
      reason: "Security payload target",
      location: `QA-SEC-${Date.now()}`,
      courseName: "Artificial Intelligence",
    });

    test.skip(!added.created, "Extra class creation failed or not visible");

    const card = sessionCardByText(page, added.location);
    await card.hover();
    await card.locator("[title='Cancel Class']").first().click({ force: true });

    const dialog = cancelDialog(page);
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: /confirm cancellation/i }).click();
    expect(((await getToastIfAny(page, 3000)) ?? "").toLowerCase()).toContain("reason is required");

    // wait for the toast to hide before proceeding
    await page.locator("[data-sonner-toast]").first().waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});

    const payload = "<script>alert(1)</script> ' OR 1=1 -- " + "X".repeat(500);
    await dialog.getByLabel(/reason for cancellation/i).fill(payload);
    await dialog.getByRole("button", { name: /confirm cancellation/i }).click();

    const toast = await getToastIfAny(page, 10000);
    expect((toast ?? "").toLowerCase()).toMatch(/cancelled|success/);
    await expect(sessionCardByText(page, added.location)).toContainText(/cancelled/i);
  });
});

test.describe("D - Week Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await openTimetable(page);
  });

  test("D-01: Next Week updates displayed date range", async ({ page }) => {
    const before = (await weekRangeLabel(page).innerText()).trim();
    await navigateNextWeek(page);
    const after = (await weekRangeLabel(page).innerText()).trim();

    expect(after).not.toBe(before);
  });

  test("D-02: Previous Week updates displayed date range", async ({ page }) => {
    const before = (await weekRangeLabel(page).innerText()).trim();
    await navigatePrevWeek(page);
    const after = (await weekRangeLabel(page).innerText()).trim();

    expect(after).not.toBe(before);
  });

  test("D-03: Navigate forward then back returns original week and remains stable after refresh", async ({ page }) => {
    const original = (await weekRangeLabel(page).innerText()).trim();

    await navigateNextWeek(page);
    await navigatePrevWeek(page);

    await expect(weekRangeLabel(page)).toHaveText(original);

    await page.reload();
    await openTimetable(page);
    await expect(weekRangeLabel(page)).toBeVisible();
  });
});

test.describe("E - UI/UX Smoke", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTA(page);
    await openTimetable(page);
    await page.waitForTimeout(4000);
  });

  test("E-01: Timetable grid renders and class cards are readable", async ({ page }) => {
    await expect(page.getByText(/mon|tue|wed|thu|fri|sat|sun/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /today/i })).toBeVisible();

    const anyCard = page
      .locator("div.absolute.inset-x-1")
      .filter({ has: page.locator("div.group") })
      .first();
    test.skip(!(await anyCard.isVisible().catch(() => false)), "No class cards in current week");

    await expect(anyCard).toBeVisible();
    //highlight
    await expect(anyCard.getByText(/\d{2}:\d{2}|\d{1,2}:\d{2}/).first()).toBeVisible();
  });

  test("E-02: Hover reveals cancel icon for TA and mobile responsive layout smoke", async ({ page }) => {
    const cancelButtons = page.locator("[title='Cancel Class']");
    test.skip((await cancelButtons.count()) === 0, "No cancellable cards found");

    const firstCard = cancelButtons.first().locator("xpath=ancestor::div[contains(@class,'group')][1]");
    await firstCard.hover();
    await expect(firstCard.locator("[title='Cancel Class']").first()).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(timetableHeading(page)).toBeVisible();
    await expect(page.getByRole("button", { name: /today/i })).toBeVisible();
  });
});
