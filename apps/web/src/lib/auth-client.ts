import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

import type { auth } from "@uni-track/auth";

export const authClient = createAuthClient({
    plugins: [inferAdditionalFields<typeof auth>()]
});
