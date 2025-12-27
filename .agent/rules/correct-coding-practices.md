---
trigger: always_on
---

- For this project we are using Mono repo structure with the following stack

apps
  ├─ web
  │   ├─ Next.js 16
  │   ├─ React 19
  │   ├─ Tailwind CSS v4
  |   ├─ Better Auth
  │   └─ E2E Typesafe API Server & Client (trpc)
      
packages
  ├─ api
  │   └─ tRPC v11 router definition
  ├─ auth
  │   └─ Authentication using better-auth.
  ├─ db
  │   └─ Typesafe db calls using Drizzle & Supabase
  └─ storage
      └─ Using Cloudinary node js sdk (coming soon)


When using trpc on client components, use it the following way, this is just an example from one of correctly implemented module. you have to follow this practice

import { api } from "@/trpc/react";


    const utils = api.useUtils();

    const { data: codes, isLoading } = api.admin.enrollmentCodes.list.useQuery({ courseId: selectedCourseId });
    const { data: courses } = api.admin.getCourses.useQuery();

    const createMutation = api.admin.enrollmentCodes.generate.useMutation({
        onSuccess: () => {
            utils.admin.enrollmentCodes.list.invalidate({ courseId: selectedCourseId });
            setIsCreateOpen(false);
            toast.success("Enrollment code created successfully");
            setSelectedCourseId("");
            setMaxUses("");
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const revokeMutation = api.admin.enrollmentCodes.revoke.useMutation({
        onSuccess: () => {
            utils.admin.enrollmentCodes.list.invalidate({ courseId: selectedCourseId });
            toast.success("Code revoked");
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const handleCreate = () => {
        if (!selectedCourseId) return;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

        createMutation.mutate({
            courseId: selectedCourseId,
            expiresAt: parseInt(expiryDays) > 0 ? expiresAt : undefined, // Assuming logic handles date
            maxUses: maxUses ? parseInt(maxUses) : undefined
        });
    };

To check loading use .isPending of the mutation not .isLoading

To use environment variables, use the following code

import { env} form "@unitrack/config/env";

env.EXAMPLE_VAR

Make sure not to mess with server and client variables (env vars are managed through env.ts file using t3 oss)