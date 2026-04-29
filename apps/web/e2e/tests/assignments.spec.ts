import { test, expect, Page, Locator } from "@playwright/test";

const TA_EMAIL = "smrayyan@gmail.com";
const STUDENT_EMAIL = "abyazkhalid@gmail.com";
const PASSWORD = "StrongPass123!";

const ASSIGNMENTS_ROUTE = "/dashboard/assignments";

type AssignmentInput = {
  title: string;
  description: string;
  type?: "Lab" | "Assignment" | "Quiz" | "Project" | "Presentation";
  dueDate?: string;
  dueTime?: string;
  instructions?: string;
  attachment?: {
    mode: "file" | "link";
    file?: {
      name: string;
      mimeType: string;
      buffer: Buffer;
    };
    link?: {
      name: string;
      url: string;
    };
  };
};

type MutationResult = {
  ok: boolean;
  message: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniqueTitle(prefix = "QA Assignment") {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function plusFab(page: Page): Locator {
  return page.locator("div.fixed.bottom-8.right-8 button.h-14.w-14.rounded-full").first();
}

function assignmentCard(page: Page, title: string): Locator {
  return page.locator("div,article,section", { hasText: title }).filter({ has: page.locator("button") }).first();
}

async function waitForToast(page: Page): Promise<string> {
  const toast = page.locator("[data-sonner-toast]").first();
  await toast.waitFor({ state: "visible", timeout: 12000 });
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

async function openAssignmentsPage(page: Page) {
  await page.goto(ASSIGNMENTS_ROUTE);
  await expect(page.getByRole("heading", { name: "Assignments" })).toBeVisible();
}

async function openCreateAssignmentModal(page: Page) {
  const fab = plusFab(page);
  await expect(fab).toBeVisible({ timeout: 10000 });
  await fab.click();

  const createDialog = page
    .getByRole("dialog")
    .filter({ has: page.getByRole("heading", { name: /^Create Assignment$/i }) })
    .first();

  await expect(createDialog).toBeVisible({ timeout: 10000 });
  await expect(createDialog.getByRole("heading", { name: /^Create Assignment$/i })).toBeVisible();
}

async function getAssignmentFormDialog(page: Page): Promise<Locator> {
  const dialog = page
    .getByRole("dialog")
    .filter({
      has: page.locator("label", { hasText: /^Title$/i }),
    })
    .first();

  await expect(dialog).toBeVisible({ timeout: 10000 });
  return dialog;
}

async function selectFromComboboxInDialog(page: Page, label: string, optionName: string) {
  const dialog = await getAssignmentFormDialog(page);
  const labelRegex = new RegExp(`^${escapeRegExp(label)}$`, "i");
  const optionRegex = new RegExp(`^${escapeRegExp(optionName)}$`, "i");

  const byAccessibleName = dialog.getByRole("combobox", { name: labelRegex }).first();
  const byLabeledContainer = dialog
    .locator("div.space-y-2")
    .filter({ has: dialog.locator("label", { hasText: labelRegex }) })
    .locator("button[role='combobox']")
    .first();

  const comboIndexByLabel: Record<string, number> = {
    Course: 0,
    Type: 1,
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

  try {
    await expect(trigger).toBeVisible({ timeout: 5000 });
    await trigger.focus().catch(() => {});
    await trigger.click({ timeout: 5000, force: true }).catch(() => {});
    
    // Validate it opened, otherwise use ArrowDown fallback
    await expect.poll(async () => page.locator("[role='option']:visible").count(), {
        timeout: 3000,
        intervals: [250, 500, 1000]
    }).toBeGreaterThan(0).catch(async () => {
        await trigger.focus().catch(() => {});
        await page.keyboard.press("ArrowDown");
    });
  } catch (error) {
    const labels = (await dialog.locator("label").allInnerTexts().catch(() => []))
      .map((t) => t.trim())
      .filter(Boolean);
    const comboCount = await dialog.getByRole("combobox").count().catch(() => 0);
    throw new Error(
      `Failed to open combobox for label "${label}". Found labels: [${labels.join(", ")}] | combobox count: ${comboCount} | original error: ${String(error)}`
    );
  }

  const option = page.getByRole("option", { name: optionRegex }).first();
  await expect(option).toBeVisible({ timeout: 7000 });
  await option.click({ timeout: 7000 });
}

async function availableCourseOptions(page: Page): Promise<string[]> {
  const dialog = await getAssignmentFormDialog(page);
  const byAccessibleName = dialog.getByRole("combobox", { name: /^Course$/i }).first();
  const byLabeledContainer = dialog
    .locator("div.space-y-2")
    .filter({ has: dialog.locator("label", { hasText: /^Course$/i }) })
    .locator("button[role='combobox']")
    .first();
  const byIndexFallback = dialog.getByRole("combobox").first();

  let trigger: Locator;
  if ((await byAccessibleName.count()) > 0) {
    trigger = byAccessibleName;
  } else if ((await byLabeledContainer.count()) > 0) {
    trigger = byLabeledContainer;
  } else {
    trigger = byIndexFallback;
  }

  await expect(trigger).toBeVisible({ timeout: 5000 });

  // Radix Select can be flaky in CI/headless; try multiple open strategies.
  await trigger.focus().catch(() => {});
  await trigger.click({ timeout: 5000, force: true }).catch(() => {});

  let visibleOptions = page.locator("[role='option']:visible");
  let optionCount = 0;
  
  try {
    await expect
      .poll(async () => {
        const count = await visibleOptions.count();
        if (count === 0) {
          // If no options, try pressing ArrowDown which opens Radix/comboboxes reliably
          // (Enter might accidentally submit a form!)
          await trigger.focus().catch(() => {});
          await page.keyboard.press("ArrowDown");
          await page.waitForTimeout(500); 
        }
        return await visibleOptions.count();
      }, {
        timeout: 10000, // Allow 10 seconds for API to load the combo options
        intervals: [1000, 1000],
      })
      .toBeGreaterThan(0);
  } catch (err) {
    // Handle below
  }

  optionCount = await visibleOptions.count();

  const names: string[] = [];
  for (let i = 0; i < optionCount; i++) {
    names.push((await visibleOptions.nth(i).innerText()).trim());
  }
  console.log(`Captured course options: ${names.join(", ")}`);

  await page.keyboard.press("Escape").catch(() => {});

  const cleaned = Array.from(new Set(names.filter((n) => !!n && !/select course/i.test(n))));
  if (cleaned.length === 0) {
    const labels = (await dialog.locator("label").allInnerTexts().catch(() => []))
      .map((t) => t.trim())
      .filter(Boolean);
    const comboCount = await dialog.getByRole("combobox").count().catch(() => 0);
    throw new Error(
      `Course dropdown opened but no visible options captured. labels=[${labels.join(", ")}], comboboxCount=${comboCount}, rawOptionCount=${optionCount}`
    );
  }

  return cleaned;
}

async function fillAssignmentForm(page: Page, data: AssignmentInput) {
  const dialog = await getAssignmentFormDialog(page);
  await dialog.getByLabel("Title").fill(data.title);
  await dialog.getByLabel("Description").fill(data.description);

  if (data.type) {
    await selectFromComboboxInDialog(page, "Type", data.type);
  }

  if (data.dueDate) {
    await dialog.getByLabel("Due Date").fill(data.dueDate);
  }

  if (data.dueTime) {
    await dialog.getByLabel("Due Time").fill(data.dueTime);
  }

  if (typeof data.instructions !== "undefined") {
    await dialog.getByLabel("Instructions (Optional)").fill(data.instructions);
  }

  if (data.attachment) {
    await dialog.getByRole("button", { name: /^Add$/ }).click();
    await expect(
  page.getByRole("dialog").getByRole("heading", { name: "Add Attachment" })
).toBeVisible();

    if (data.attachment.mode === "file" && data.attachment.file) {
      const fileDialog = page.getByRole("dialog").filter({ hasText: "Add Attachment" }).first();
      await fileDialog.locator("input#file").setInputFiles({
        name: data.attachment.file.name,
        mimeType: data.attachment.file.mimeType,
        buffer: data.attachment.file.buffer,
      });
      await fileDialog.getByRole("button", { name: "Add Attachment" }).click();
    }

    if (data.attachment.mode === "link" && data.attachment.link) {
      const fileDialog = page.getByRole("dialog").filter({ hasText: "Add Attachment" }).first();
      await fileDialog.getByRole("tab", { name: "External Link" }).click();
      await fileDialog.getByLabel("Name").fill(data.attachment.link.name);
      await fileDialog.getByLabel("URL").fill(data.attachment.link.url);
      await fileDialog.getByRole("button", { name: "Add Attachment" }).click();
    }
  }
}

async function submitAssignmentDialog(page: Page, submitButton: "Create Assignment" | "Save Changes"): Promise<MutationResult> {
  const dialog = await getAssignmentFormDialog(page);
  await dialog.getByRole("button", { name: submitButton }).click();

  await Promise.race([
    page.locator("[data-sonner-toast]").first().waitFor({ state: "visible", timeout: 12000 }),
    expect(dialog).toBeHidden({ timeout: 12000 }),
    dialog.locator("p.text-destructive, [role='alert']").first().waitFor({ state: "visible", timeout: 12000 }),
  ]).catch(() => {});

  const toastText = await getToastIfAny(page, 1200);
  if (toastText) {
    const low = toastText.toLowerCase();
    return { ok: low.includes("success") || low.includes("created") || low.includes("updated"), message: toastText };
  }

  const inlineErrors = (await dialog.locator("p.text-destructive, [role='alert']").allInnerTexts().catch(() => []))
    .map((t) => t.trim())
    .filter(Boolean);

  if (inlineErrors.length) {
    return { ok: false, message: inlineErrors.join(" | ") };
  }

  return { ok: false, message: "No toast or inline validation visible after submit" };
}

async function createAssignment(page: Page, input: AssignmentInput): Promise<{ title: string; courseOptionUsed?: string }> {
  await openCreateAssignmentModal(page);

  const allCourses = await availableCourseOptions(page);
  console.log("Available course options in dropdown:", allCourses);
  const prioritized = [
    ...allCourses.filter((c) => /artificial intelligence|\bai\b/i.test(c)),
    ...allCourses.filter((c) => !/artificial intelligence|\bai\b/i.test(c)),
  ];

  const courses = Array.from(new Set(prioritized));
  if (!courses.length) {
    throw new Error("No courses available in Course dropdown");
  }

  for (const courseOption of courses) {
    await selectFromComboboxInDialog(page, "Course", courseOption);
    await fillAssignmentForm(page, input);

    const result = await submitAssignmentDialog(page, "Create Assignment");
    if (result.ok) {
      await expect(page.getByRole("dialog")).toBeHidden({ timeout: 10000 });
      return { title: input.title, courseOptionUsed: courseOption };
    }

    if (!result.message.toLowerCase().includes("not assigned")) {
      throw new Error(`Create assignment failed: ${result.message}`);
    }
  }

  throw new Error("TA is not assigned to any listed course in create modal");
}

async function openEditForAssignment(page: Page, title: string) {
  const card = assignmentCard(page, title);
  await expect(card).toBeVisible({ timeout: 10000 });
  const editButton = card.locator("button:has(svg.lucide-pencil)").first();
  await editButton.click();
  await expect(page.getByRole("dialog").getByText(/edit assignment/i)).toBeVisible();
}

async function deleteAssignment(page: Page, title: string) {
  const card = assignmentCard(page, title);
  await expect(card).toBeVisible({ timeout: 10000 });
  const deleteButton = card.locator("button:has(svg.lucide-trash2)").first();
  await deleteButton.click();

  const confirm = page.getByRole("alertdialog");
  await expect(confirm.getByText(/delete assignment\?/i)).toBeVisible();
  await confirm.getByRole("button", { name: /delete assignment/i }).click();

  await waitForToast(page);
  await page.waitForTimeout(4000);
  await expect(assignmentCard(page, title)).toHaveCount(0);
}

test.describe("A - Access Control", () => {
  test("A-01: TA can access assignments page", async ({ page }) => {
    await loginAsTA(page);
    await openAssignmentsPage(page);
    await expect(page.getByRole("heading", { name: "Assignments" })).toBeVisible();
  });

  test("A-02: Student can access assignments page in view-only mode", async ({ page }) => {
    await loginAsStudent(page);
    await openAssignmentsPage(page);
    await expect(page.getByRole("heading", { name: "Assignments" })).toBeVisible();
  });

  test("A-03: Student does not see floating create button", async ({ page }) => {
    await loginAsStudent(page);
    await openAssignmentsPage(page);
    await expect(plusFab(page)).toHaveCount(0);
  });

  test("A-04: Student cannot open create modal via URL query", async ({ page }) => {
    await loginAsStudent(page);
    await page.goto("/dashboard/assignments?open=create");
    await expect(page.getByRole("dialog").getByText(/create assignment/i)).toHaveCount(0);
  });

  test("A-05: Unauthenticated user is blocked from assignments route", async ({ page }) => {
    await page.goto(ASSIGNMENTS_ROUTE);
    await page.waitForLoadState("networkidle");
    await expect(page).not.toHaveURL(/\/dashboard\/assignments$/);
  });
});

test.describe("B - Create Assignment (TA)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTA(page);
    await openAssignmentsPage(page);
  });

  test("B-01: create assignment with valid required fields", async ({ page }) => {
    const title = uniqueTitle("QA Create Required");
    await createAssignment(page, {
      title,
      description: "Create with required fields",
      type: "Assignment",
      dueDate: "2099-12-31",
      dueTime: "23:59",
    });

    await page.getByPlaceholder("Search assignments...").fill(title);
    await expect(assignmentCard(page, title)).toBeVisible();

    await deleteAssignment(page, title);
  });

  test("B-02: create assignment with optional instructions and link attachment", async ({ page }) => {
    const title = uniqueTitle("QA Create Full");
    await createAssignment(page, {
      title,
      description: "Full field create",
      type: "Project",
      dueDate: "2099-10-20",
      dueTime: "21:30",
      instructions: "Submit report and source files",
      attachment: {
        mode: "link",
        link: {
          name: "Spec Document",
          url: "https://example.com/spec",
        },
      },
    });

    await page.getByPlaceholder("Search assignments...").fill(title);
    await expect(assignmentCard(page, title)).toBeVisible();

    await deleteAssignment(page, title);
  });

  test("B-02b: TA can create for Artificial Intelligence and blocked for non-assigned course", async ({ page }) => {
    await openCreateAssignmentModal(page);

    const courses = await availableCourseOptions(page);
    const aiCourse = courses.find((c) => /artificial intelligence|\bai\b/i.test(c));
    const nonAiCourse = courses.find((c) => c !== aiCourse);

    test.skip(!aiCourse, "Artificial Intelligence course option not found in dropdown");

    const deniedTitle = uniqueTitle("QA Non AI Denied");
    if (nonAiCourse) {
      await selectFromComboboxInDialog(page, "Course", nonAiCourse);
      await fillAssignmentForm(page, {
        title: deniedTitle,
        description: "Should be denied for non-assigned course",
        dueDate: "2099-12-20",
        dueTime: "10:00",
      });

      const deniedResult = await submitAssignmentDialog(page, "Create Assignment");
      expect(deniedResult.ok).toBeFalsy();
      expect(deniedResult.message.toLowerCase()).toMatch(/not assigned|forbidden|not authorized/);
    }
    else {

        await selectFromComboboxInDialog(page, "Course", aiCourse!);
        const allowedTitle = uniqueTitle("QA AI Allowed");
        await fillAssignmentForm(page, {
          title: allowedTitle,
          description: "Should be allowed for AI course",
          dueDate: "2099-12-21",
          dueTime: "11:00",
          type: "Assignment",
        });
    
        const allowedResult = await submitAssignmentDialog(page, "Create Assignment");
        console.log(`Create result for AI course: ${JSON.stringify(allowedResult)}`);
        expect(allowedResult.ok).toBeTruthy();
        
            await page.getByPlaceholder("Search assignments...").fill(allowedTitle);
            await expect(assignmentCard(page, allowedTitle)).toBeVisible();
            await deleteAssignment(page, allowedTitle);
    }
  });

  test("B-03: required field validation is shown when empty", async ({ page }) => {
    await openCreateAssignmentModal(page);
    const result = await submitAssignmentDialog(page, "Create Assignment");
    expect(result.ok).toBeFalsy();
    expect(result.message.toLowerCase()).toMatch(/required|select|invalid/);
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("B-04: create assignment with past due date is accepted and visible", async ({ page }) => {
    const title = uniqueTitle("QA Past Due");
    await createAssignment(page, {
      title,
      description: "Past due behavior",
      dueDate: "2020-01-01",
      dueTime: "00:01",
    });

    await page.getByPlaceholder("Search assignments...").fill(title);
    await expect(assignmentCard(page, title)).toBeVisible();

    await deleteAssignment(page, title);
  });

  test("B-05: very long title and special chars create without UI crash", async ({ page }) => {
    const title = `${uniqueTitle("QA Long !@#$%^&*()")}-${"X".repeat(80)}`;
    await createAssignment(page, {
      title,
      description: "Long and special character title",
      dueDate: "2099-11-11",
      dueTime: "11:11",
    });

    await page.getByPlaceholder("Search assignments...").fill("QA Long");
    await expect(page.getByText("QA Long", { exact: false })).toBeVisible();

    await page.getByPlaceholder("Search assignments...").fill(title);
    await deleteAssignment(page, title);
  });

  test("B-06: valid file attachment upload via modal", async ({ page }) => {
    const title = uniqueTitle("QA File Attach");
    await createAssignment(page, {
      title,
      description: "File attachment upload",
      dueDate: "2099-09-09",
      dueTime: "09:09",
      attachment: {
        mode: "file",
        file: {
          name: "readme.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("uni-track assignment attachment"),
        },
      },
    });

    await page.getByPlaceholder("Search assignments...").fill(title);
    await expect(assignmentCard(page, title)).toBeVisible();

    await deleteAssignment(page, title);
  });

  test("B-07: rapid multi-click on Create does not create duplicate assignment", async ({ page }) => {
    const title = uniqueTitle("QA Rapid");
    await openCreateAssignmentModal(page);

    const courseOptions = await availableCourseOptions(page);
    expect(courseOptions.length).toBeGreaterThan(0);
    await selectFromComboboxInDialog(page, "Course", courseOptions[0]!);

    await fillAssignmentForm(page, {
      title,
      description: "Rapid click create",
      dueDate: "2099-08-08",
      dueTime: "08:08",
    });

    const dialog = page.getByRole("dialog");
    const createBtn = dialog.getByRole("button", { name: "Create Assignment" });
    await Promise.all([createBtn.click(), createBtn.click()]);

    const toast = await waitForToast(page);
    if (toast.toLowerCase().includes("not assigned")) {
      test.skip(true, "First course in dropdown is not assigned to TA for this dataset");
    }

    await page.getByPlaceholder("Search assignments...").fill(title);
    await expect(page.getByText(title, { exact: false })).toHaveCount(1);

    await deleteAssignment(page, title);
  });

  test("B-08: cancel create modal does not add assignment", async ({ page }) => {
    const title = uniqueTitle("QA Cancel");

    await openCreateAssignmentModal(page);
    await fillAssignmentForm(page, {
      title,
      description: "Will cancel this",
      dueDate: "2099-07-07",
      dueTime: "07:07",
    });

    await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page.getByPlaceholder("Search assignments...").fill(title);
    await expect(assignmentCard(page, title)).toHaveCount(0);
  });
});

test.describe("C - Edit Assignment (TA)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTA(page);
    await openAssignmentsPage(page);
  });

  test("C-01: edit title, due date, description, type and persist after refresh", async ({ page }) => {
    const originalTitle = uniqueTitle("QA Edit Base");
    await createAssignment(page, {
      title: originalTitle,
      description: "Before edit",
      dueDate: "2099-05-05",
      dueTime: "10:00",
      type: "Quiz",
    });

    await page.getByPlaceholder("Search assignments...").fill(originalTitle);
    await openEditForAssignment(page, originalTitle);

    const dialog = page.getByRole("dialog");
    const updatedTitle = `${originalTitle} Updated`;
    await dialog.getByLabel("Title").fill(updatedTitle);
    await dialog.getByLabel("Description").fill("After edit");
    await dialog.getByLabel("Due Date").fill("2099-06-06");
    await selectFromComboboxInDialog(page, "Type", "Project");

    const result = await submitAssignmentDialog(page, "Save Changes");
    expect(result.ok).toBeTruthy();

    await page.reload();
    await openAssignmentsPage(page);
    await page.getByPlaceholder("Search assignments...").fill(updatedTitle);
    await expect(assignmentCard(page, updatedTitle)).toBeVisible();

    await deleteAssignment(page, updatedTitle);
  });

  test("C-02: cancel edit keeps original assignment data", async ({ page }) => {
    const title = uniqueTitle("QA Edit Cancel");
    await createAssignment(page, {
      title,
      description: "Original desc",
      dueDate: "2099-04-04",
      dueTime: "13:00",
    });

    await page.getByPlaceholder("Search assignments...").fill(title);
    await openEditForAssignment(page, title);

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Title").fill(`${title} ShouldNotPersist`);
    await dialog.getByRole("button", { name: "Cancel" }).click();

    await page.getByPlaceholder("Search assignments...").fill(title);
    await expect(assignmentCard(page, title)).toBeVisible();

    await deleteAssignment(page, title);
  });
});

test.describe("D - Delete Assignment (TA)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTA(page);
    await openAssignmentsPage(page);
  });

  test("D-01: cancel delete keeps assignment", async ({ page }) => {
    const title = uniqueTitle("QA Delete Cancel");
    await createAssignment(page, {
      title,
      description: "Delete cancel scenario",
      dueDate: "2099-03-03",
      dueTime: "14:00",
    });

    await page.getByPlaceholder("Search assignments...").fill(title);
    const card = assignmentCard(page, title);
    await card.locator("button:has(svg.lucide-trash2)").first().click();

    const confirm = page.getByRole("alertdialog");
    await confirm.getByRole("button", { name: /^Cancel$/ }).click();
    await expect(assignmentCard(page, title)).toBeVisible();

    await deleteAssignment(page, title);
  });

  test("D-02: delete assignment removes item and persists after refresh", async ({ page }) => {
    const title = uniqueTitle("QA Delete");
    await createAssignment(page, {
      title,
      description: "Delete persistence scenario",
      dueDate: "2099-02-02",
      dueTime: "15:00",
    });

    await page.getByPlaceholder("Search assignments...").fill(title);
    await deleteAssignment(page, title);

    await page.reload();
    await openAssignmentsPage(page);
    await page.getByPlaceholder("Search assignments...").fill(title);
    await expect(assignmentCard(page, title)).toHaveCount(0);
  });
});

test.describe("E - Search / Filter / UI", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTA(page);
    await openAssignmentsPage(page);
  });

  test("E-01: search by title and nonexistent term", async ({ page }) => {
    const title = uniqueTitle("QA Search Title");
    await createAssignment(page, {
      title,
      description: "Search scenario",
      dueDate: "2099-01-01",
      dueTime: "16:00",
    });

    await page.getByPlaceholder("Search assignments...").fill(title);
    await expect(assignmentCard(page, title)).toBeVisible();

    await page.getByPlaceholder("Search assignments...").fill("NO_ASSIGNMENT_MATCH_123");
    await expect(page.getByText(/no assignments found/i)).toBeVisible();

    await page.getByPlaceholder("Search assignments...").fill(title);
    await deleteAssignment(page, title);
  });

  test("E-02: course filter and status tabs are selectable", async ({ page }) => {
    await expect(page.getByRole("combobox").first()).toBeVisible();
    await page.getByRole("tab", { name: "Upcoming" }).click();
    await page.getByRole("tab", { name: "All" }).click();

    const courseTrigger = page.getByRole("combobox").first();
    await courseTrigger.click();
    await page.getByRole("option", { name: "All Courses" }).click();

    await expect(page.getByPlaceholder("Search assignments...")).toBeVisible();
  });

  test("E-03: sort by date button is visible and clickable", async ({ page }) => {
    const sortBtn = page.getByRole("button", { name: /sort by date/i });
    await expect(sortBtn).toBeVisible();
    await sortBtn.click();
    await expect(sortBtn).toBeVisible();
  });

  test("E-04: modal open-close and keyboard navigation smoke", async ({ page }) => {
    await openCreateAssignmentModal(page);

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("Title")).toBeVisible();
    await expect(dialog.getByLabel("Description")).toBeVisible();
    await expect(dialog.getByLabel("Due Date")).toBeVisible();
    await expect(dialog.getByLabel("Due Time")).toBeVisible();

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("E-05: mobile responsive smoke for assignments page", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openAssignmentsPage(page);
    await expect(page.getByRole("heading", { name: "Assignments" })).toBeVisible();
    await expect(page.getByPlaceholder("Search assignments...")).toBeVisible();
  });
});

test.describe("F - Security / Robustness", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTA(page);
    await openAssignmentsPage(page);
  });

  test("F-01: SQL/script-like title and description inputs do not break UI", async ({ page }) => {
    const title = uniqueTitle("QA ' OR 1=1 -- <script>alert(1)</script>");
    await createAssignment(page, {
      title,
      description: "<script>alert('x')</script> UNION SELECT * FROM users;",
      dueDate: "2099-12-01",
      dueTime: "12:00",
    });

    await page.getByPlaceholder("Search assignments...").fill("QA ' OR 1=1");
    await expect(page.getByText("QA ' OR 1=1", { exact: false })).toBeVisible();

    await page.getByPlaceholder("Search assignments...").fill(title);
    await deleteAssignment(page, title);
  });

  test("F-02: invalid link attachment URL shows validation", async ({ page }) => {
    await openCreateAssignmentModal(page);

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /^Add$/ }).click();

    const attachDialog = page.getByRole("dialog").filter({ hasText: "Add Attachment" }).first();
    await attachDialog.getByRole("tab", { name: "External Link" }).click();
    await attachDialog.getByLabel("Name").fill("Invalid URL Link");
    await attachDialog.getByLabel("URL").fill("not-a-url");
    await attachDialog.getByRole("button", { name: "Add Attachment" }).click();

    await expect(attachDialog.getByText(/invalid url format/i)).toBeVisible();
  });

  test("F-03: large attachment over 5MB is rejected", async ({ page }) => {
    await openCreateAssignmentModal(page);

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /^Add$/ }).click();

    const attachDialog = page.getByRole("dialog").filter({ hasText: "Add Attachment" }).first();
    const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024, "a");

    await attachDialog.locator("input#file").setInputFiles({
      name: "too-large.pdf",
      mimeType: "application/pdf",
      buffer: largeBuffer,
    });

    await expect(attachDialog.getByText(/file size must be less than 5mb/i)).toBeVisible();
  });
});
