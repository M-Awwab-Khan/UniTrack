import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        reporters: ["default", "json"],
        outputFile: {
            json: "./coverage/test-results.json"
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "json"],
            reportsDirectory: "./coverage",
            include: ["src/routers/auth.ts", "src/routers/courses.ts", "src/routers/assignments.ts", "src/routers/timetable.ts", "src/routers/admin.ts"],
        },
    },
});
