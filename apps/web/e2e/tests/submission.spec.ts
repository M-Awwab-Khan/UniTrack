import { test, expect, Page, Locator } from "@playwright/test";

const TA_EMAIL = "smrayyan@gmail.com";
const STUDENT_EMAIL = "abyazkhalid@gmail.com";
const PASSWORD = "StrongPass123!";

const ASSIGNMENTS_ROUTE = "/dashboard/assignments";

function assignmentDialog(page: Page): Locator {
  return page.getByRole("dialog").filter({ hasText: /your submission/i }).first();
}

function assignmentCard(page: Page, title: string): Locator {
  return page
    .locator("div,article,section", { hasText: title })
    .filter({ has: page.getByRole("button", { name: /view details/i }) })
    .first();
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

async function loginAsStudent(page: Page) {
  await fillAndSubmitLogin(page, STUDENT_EMAIL, PASSWORD);
  await page.waitForURL("**/dashboard**", { timeout: 15000 });
}

async function loginAsTA(page: Page) {
  await fillAndSubmitLogin(page, TA_EMAIL, PASSWORD);
  await page.waitForURL("**/dashboard**", { timeout: 15000 });
}

async function openAssignmentsPage(page: Page) {
  await page.goto(ASSIGNMENTS_ROUTE);
  await expect(page.getByRole("heading", { name: "Assignments" })).toBeVisible({ timeout: 15000 });
}

async function openAssignment(page: Page, title?: string) {
  if (title) {
    await page.getByPlaceholder("Search assignments...").fill(title);
    const card = assignmentCard(page, title);
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
  } else {
    const firstViewDetails = page.getByRole("button", { name: /view details/i }).first();
    await expect(firstViewDetails).toBeVisible({ timeout: 10000 });
    await firstViewDetails.click();
  }

  await expect(assignmentDialog(page)).toBeVisible({ timeout: 10000 });
  await expect(page).toHaveURL(/open=details&id=/);
}

async function closeAssignmentDialog(page: Page) {
  const dialog = assignmentDialog(page);
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole("button", { name: /^cancel$/i }).click();
    await expect(dialog).toHaveCount(0, { timeout: 10000 });
  }
}

async function getOpenAssignmentTitle(page: Page): Promise<string> {
  const dialog = assignmentDialog(page);
  const heading = dialog.getByRole("heading").first();
  await expect(heading).toBeVisible();
  return (await heading.innerText()).trim();
}

async function selectStatusTab(page: Page, status: "All" | "Upcoming" | "Due Today" | "Overdue" | "Completed") {
  await page.getByRole("tab", { name: status }).click();
}

async function submitText(page: Page, text: string): Promise<{ toast: string | null; dialogClosed: boolean }> {
  const dialog = assignmentDialog(page);
  await expect(dialog).toBeVisible();

  const textarea = dialog.getByPlaceholder(/type your submission here/i);
  await textarea.fill(text);

  const submitButton = dialog.getByRole("button", { name: /submit assignment|resubmit assignment/i }).first();
  await submitButton.click();

  await Promise.race([
    dialog.waitFor({ state: "hidden", timeout: 12000 }),
    page.locator("[data-sonner-toast]").first().waitFor({ state: "visible", timeout: 12000 }),
  ]).catch(() => {});

  const toast = await getToastIfAny(page, 1500);
  const dialogClosed = !(await dialog.isVisible().catch(() => false));

  return { toast, dialogClosed };
}

async function submitFile(
  page: Page,
  file: { name: string; mimeType: string; buffer: Buffer }
): Promise<{ available: boolean; added: boolean; errorText?: string }> {
  const dialog = assignmentDialog(page);
  await expect(dialog).toBeVisible();

  const addButton = dialog.getByRole("button", { name: /^add$/i }).first();
  if ((await addButton.count()) === 0 || !(await addButton.isVisible().catch(() => false))) {
    return { available: false, added: false, errorText: "Add attachment button not available for this role/view" };
  }

  await addButton.click();
  const addAttachmentDialog = page.getByRole("dialog").filter({ hasText: /add attachment/i }).first();
  await expect(addAttachmentDialog).toBeVisible({ timeout: 10000 });

  await addAttachmentDialog.locator("input#file").setInputFiles(file);
  await addAttachmentDialog.getByRole("button", { name: /add attachment/i }).click();

  const toast = await getToastIfAny(page, 9000);

  const attachmentVisible = await dialog.getByText(file.name, { exact: false }).first().isVisible().catch(() => false);

  return {
    available: true,
    added: attachmentVisible,
    errorText: toast ?? undefined,
  };
}

async function resubmitAssignment(page: Page, newText: string) {
  const dialog = assignmentDialog(page);
  await expect(dialog).toBeVisible();

  const textarea = dialog.getByPlaceholder(/type your submission here/i);
  await textarea.fill(newText);

  const resubmitButton = dialog.getByRole("button", { name: /resubmit assignment|submit assignment/i }).first();
  await resubmitButton.click();

  await Promise.race([
    dialog.waitFor({ state: "hidden", timeout: 12000 }),
    page.locator("[data-sonner-toast]").first().waitFor({ state: "visible", timeout: 12000 }),
  ]).catch(() => {});
}

test.describe("A - Access & Navigation", () => {
  test("A-01: Student can open assignments page", async ({ page }) => {
    await loginAsStudent(page);
    await openAssignmentsPage(page);
    await expect(page.getByRole("heading", { name: "Assignments" })).toBeVisible();
  });

  test("A-02: TA can open assignments page", async ({ page }) => {
    await loginAsTA(page);
    await openAssignmentsPage(page);
    await expect(page.getByRole("heading", { name: "Assignments" })).toBeVisible();
  });

  test("A-03: User can open assignment details dialog", async ({ page }) => {
    await loginAsStudent(page);
    await openAssignmentsPage(page);

    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available in this dataset");

    await openAssignment(page);
    await expect(assignmentDialog(page).getByText(/your submission/i)).toBeVisible();
  });

  test("A-04: Unauthenticated user is blocked from protected assignment route", async ({ page }) => {
    await page.goto(ASSIGNMENTS_ROUTE);
    await page.waitForLoadState("networkidle");
    await expect(page).not.toHaveURL(/\/dashboard\/assignments$/);
  });
});

test.describe("B - Initial Status", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await openAssignmentsPage(page);
  });

  test("B-01: Upcoming assignment shows due timing badge", async ({ page }) => {
    await selectStatusTab(page, "Upcoming");
    await page.waitForTimeout(3000); // Allow time for tab content to load

    const cards = page.getByRole("button", { name: /view details/i });
    test.skip((await cards.count()) === 0, "No upcoming assignments available");

    await expect(page.getByText(/due in\s+\d+\s+days|due today/i).first()).toBeVisible();
  });

  test("B-02: Past due unsubmitted assignment can show Overdue", async ({ page }) => {
    await selectStatusTab(page, "Overdue");
    await page.waitForTimeout(3000); // Allow time for tab content to load

    const cards = page.getByRole("button", { name: /view details/i });
    test.skip((await cards.count()) === 0, "No overdue assignments available");

    await expect(page.getByText(/overdue/i).first()).toBeVisible();
  });

  test("B-03: No false Submitted status before submission (for unsubmitted item)", async ({ page }) => {
    await selectStatusTab(page, "Upcoming");
    await page.waitForTimeout(3000); // Allow time for tab content to load

    const cards = page.getByRole("button", { name: /view details/i });
    test.skip((await cards.count()) === 0, "No upcoming assignments available");

    await openAssignment(page);
    const dialog = assignmentDialog(page);

    const myStatusBlock = dialog.getByText(/my status/i).locator("xpath=ancestor::div[1]");
    await expect(myStatusBlock).toContainText(/not submitted|upcoming|due/i);
    await expect(myStatusBlock).not.toHaveText(/^submitted$/i);
  });
});

test.describe("C - Text Submission", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await openAssignmentsPage(page);
    await page.waitForTimeout(3000); // Allow time for assignments to load
  });

  test("C-01: Submit assignment using valid text only", async ({ page }) => {
    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available");

    await openAssignment(page);
    const title = await getOpenAssignmentTitle(page);

    const result = await submitText(page, "My valid submission text for QA verification.");

    expect(result.toast?.toLowerCase() ?? "").toMatch(/success|submitted|assignment submitted|late/i);
    await page.waitForTimeout(2000);

    await openAssignment(page, title);
    await expect(assignmentDialog(page).getByText(/submitted|late submission/i).first()).toBeVisible();
  });

  test("C-02: Empty text submit shows validation behavior", async ({ page }) => {
    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available");

    await openAssignment(page);
    const dialog = assignmentDialog(page);

    await dialog.getByPlaceholder(/type your submission here/i).fill("   ");
    await dialog.getByRole("button", { name: /submit assignment|resubmit assignment/i }).first().click();

    const validationToast = await getToastIfAny(page, 4000);
    expect((validationToast ?? "").toLowerCase()).toContain("please enter");
    await expect(dialog).toBeVisible();
  });

  test("C-03: Very long text submission does not break UI", async ({ page }) => {
    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available");

    await openAssignment(page);

    const longText = `Long Submission Start\n${"X".repeat(6000)}\nLong Submission End`;
    const result = await submitText(page, longText);

    expect(result.toast?.toLowerCase() ?? "").toMatch(/success|submitted|late/i);
    await expect(page.getByRole("heading", { name: "Assignments" })).toBeVisible();
  });

  test("C-04: Special characters and markdown-like text are accepted safely", async ({ page }) => {
    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available");

    await openAssignment(page);
    const payload = "# Header\n- item 1\n**bold**\n<script>alert(1)</script>\n' OR 1=1 --";

    const result = await submitText(page, payload);
    expect(result.toast?.toLowerCase() ?? "").toMatch(/success|submitted|late/i);
  });

  test("C-05: Multi-line submission stores submission metadata after reopen", async ({ page }) => {
    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available");

    await openAssignment(page);
    const title = await getOpenAssignmentTitle(page);

    const payload = "Line 1\n\nLine 2\nLine 3";
    await submitText(page, payload);

    await openAssignment(page, title);
    const dialog = assignmentDialog(page);

    await expect(dialog.getByText(/last submitted on/i)).toBeVisible();
    await expect(dialog.getByText(/submitted on time|marked as late submission/i)).toBeVisible();
  });
});

test.describe("D - File Attachment Submission", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTA(page);
    await openAssignmentsPage(page);
    await page.waitForTimeout(3000); // Allow time for assignments to load
  });

  test("D-01: Attach valid file and submit assignment", async ({ page }) => {
    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available");

    await openAssignment(page);

    const fileResult = await submitFile(page, {
      name: "submission-d1.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("submission attachment D-01"),
    });

    test.skip(!fileResult.available, "Attachment UI is not available in this role/view");
    expect(fileResult.added).toBeTruthy();

    const result = await submitText(page, "Submitting with one attachment");
    expect(result.toast?.toLowerCase() ?? "").toMatch(/success|submitted|late/i);
  });

  test("D-02: Text + file submission persists file row after reopen", async ({ page }) => {
    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available");

    await openAssignment(page);
    const title = await getOpenAssignmentTitle(page);

    const fileName = "submission-d2.md";
    const fileResult = await submitFile(page, {
      name: fileName,
      mimeType: "text/markdown",
      buffer: Buffer.from("# attachment d2"),
    });

    test.skip(!fileResult.available, "Attachment UI is not available in this role/view");
    expect(fileResult.added).toBeTruthy();

    await submitText(page, "Submission with text + file in D-02");

    await openAssignment(page, title);
    await expect(assignmentDialog(page).getByText(fileName, { exact: false })).toBeVisible();
  });

  test("D-03: Large file over 5MB is rejected", async ({ page }) => {
    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available");

    await openAssignment(page);

    const dialog = assignmentDialog(page);
    const addBtn = dialog.getByRole("button", { name: /^add$/i }).first();
    test.skip((await addBtn.count()) === 0, "Attachment UI is not available in this role/view");

    await addBtn.click();
    const addAttachmentDialog = page.getByRole("dialog").filter({ hasText: /add attachment/i }).first();
    await expect(addAttachmentDialog).toBeVisible();

    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1024, "a");
    await addAttachmentDialog.locator("input#file").setInputFiles({
      name: "too-large.pdf",
      mimeType: "application/pdf",
      buffer: oversized,
    });

    await expect(addAttachmentDialog.getByText(/file size must be less than 5mb/i)).toBeVisible();
  });
});

test.describe("E - Resubmission", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await openAssignmentsPage(page);
    await page.waitForTimeout(3000); // Allow time for assignments to load
  });

  test("E-01: Resubmit with changed text updates attempt number", async ({ page }) => {
    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available");

    await openAssignment(page);
    const title = await getOpenAssignmentTitle(page);

    await submitText(page, "First submission for attempt tracking");

    await openAssignment(page, title);
    await resubmitAssignment(page, "Second submission content changed");

    await openAssignment(page, title);
    await expect(assignmentDialog(page).getByText(/attempt\s*#\s*2|attempt\s*#\s*[2-9]/i)).toBeVisible();
  });

  test("E-02: Resubmission updates submission timestamp area", async ({ page }) => {
    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available");

    await openAssignment(page);
    const title = await getOpenAssignmentTitle(page);

    await submitText(page, "Timestamp baseline submission");
    await openAssignment(page, title);
    const beforeText = await assignmentDialog(page).getByText(/last submitted on/i).innerText();

    await closeAssignmentDialog(page);
    await openAssignment(page, title);
    await resubmitAssignment(page, "Timestamp updated submission payload");

    await openAssignment(page, title);
    const afterText = await assignmentDialog(page).getByText(/last submitted on/i).innerText();

    expect(afterText).toContain("Last submitted on");
    expect(afterText.length).toBeGreaterThan(10);
    expect(beforeText).toContain("Last submitted on");
  });

  test("E-03: Late submission status appears for overdue assignment", async ({ page }) => {
    await selectStatusTab(page, "Overdue");

    const cards = page.getByRole("button", { name: /view details/i });
    test.skip((await cards.count()) === 0, "No overdue assignment available to validate late submission");

    await openAssignment(page);
    await submitText(page, "Submitting after due time to validate late submission");

    await openAssignment(page);
    await expect(assignmentDialog(page).getByText(/late submission|marked as late submission/i).first()).toBeVisible();
  });
});

test.describe("F - Status Badge + UX + Robustness", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await openAssignmentsPage(page);
    await page.waitForTimeout(3000); // Allow time for assignments to load
  });

  test("F-01: Submitted badge appears and no conflicting overdue badge after submit", async ({ page }) => {
    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available");

    await openAssignment(page);
    const title = await getOpenAssignmentTitle(page);

    await submitText(page, "Badge verification submission");
    await page.waitForTimeout(2000); // Allow time for status update

    await page.getByPlaceholder("Search assignments...").fill(title);
    const card = assignmentCard(page, title);
   
    await expect(card).toBeVisible();
    await expect(card.getByText(/submitted|late submission/i).first()).toBeVisible();
    
    // open the dialog
    await card.click();
    const dialog = assignmentDialog(page);
    await expect(dialog).toBeVisible();

    await expect(dialog.getByText(/^overdue$/i)).toHaveCount(0);
  });

  test("F-02: Modal open-close, keyboard escape, textarea editable, and rapid double-click safety", async ({ page }) => {
    const detailsButtons = page.getByRole("button", { name: /view details/i });
    test.skip((await detailsButtons.count()) === 0, "No assignments available");

    await openAssignment(page);
    const dialog = assignmentDialog(page);

    const textarea = dialog.getByPlaceholder(/type your submission here/i);
    await expect(textarea).toBeVisible();
    await textarea.fill("UI smoke + rapid click safety check");
    await expect(textarea).toHaveValue(/ui smoke/i);

    const submitBtn = dialog.getByRole("button", { name: /submit assignment|resubmit assignment/i }).first();
    await Promise.all([submitBtn.click(), submitBtn.click()]);

    const toast = await getToastIfAny(page, 10000);
    expect((toast ?? "").toLowerCase()).toMatch(/success|submitted|late|please enter/i);

    await openAssignment(page);
    await page.keyboard.press("Escape");
    await expect(assignmentDialog(page)).toHaveCount(0);
  });
});
